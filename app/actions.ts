'use server'

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { onboardingSchema } from '@/lib/schemas/onboarding'
import { WelcomeEmail } from '@/lib/email/welcome-template'
import { TOPIC_CATEGORIES } from '@/lib/data/topics'

type SubscribeResult = { success?: boolean; error?: string; subscriberId?: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribeEmail(
  _prevState: SubscribeResult,
  formData: FormData
): Promise<SubscribeResult> {
  const rawEmail = formData.get('email')

  if (!rawEmail || typeof rawEmail !== 'string') {
    return { error: 'Please enter a valid email address' }
  }

  const email = rawEmail.trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Please enter a valid email address' }
  }

  // Use service_role key to bypass RLS for server-side inserts
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      // Postgres unique violation — email already exists
      if (error.code === '23505') {
        // Retrieve existing subscriber ID so they can still onboard
        const { data: existing } = await supabase
          .from('subscribers')
          .select('id')
          .eq('email', email)
          .single()
        return { error: 'This email is already subscribed!', subscriberId: existing?.id }
      }

      console.error('[subscribeEmail] Supabase insert error:', error)
      return { error: 'Something went wrong. Please try again.' }
    }

    return { success: true, subscriberId: data.id }
  } catch (err) {
    console.error('[subscribeEmail] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

// ---------------------------------------------------------------------------
// completeOnboarding — Persist all preferences and send welcome email
// ---------------------------------------------------------------------------

type OnboardingResult = { success?: boolean; error?: string }

export async function completeOnboarding(
  _prevState: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  // 1. Parse JSON payload from hidden form input
  const rawData = formData.get('onboardingData')
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Invalid form data' }
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawData)
  } catch {
    return { error: 'Invalid form data format' }
  }

  // 2. Validate with shared Zod schema
  const parsed = onboardingSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' }
  }

  const {
    subscriberId,
    topics,
    customTopics,
    format,
    deliveryTime,
    timezone,
    city,
    feedUrls,
    smsOptIn,
    phone,
  } = parsed.data

  // 3. Create Supabase client with service_role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 4a. Write subscriber_preferences (core data)
    const { error: prefError } = await supabase
      .from('subscriber_preferences')
      .upsert({
        subscriber_id: subscriberId,
        format,
        delivery_time: deliveryTime,
        timezone,
        city: city || null,
        sms_opt_in: smsOptIn,
        phone: phone || null,
      }, { onConflict: 'subscriber_id' })

    if (prefError) {
      console.error('[completeOnboarding] subscriber_preferences error:', prefError)
      return { error: 'Failed to save preferences. Please try again.' }
    }

    // 4b. Resolve topic slugs to DB UUIDs and insert subscriber_topics
    if (topics.length > 0) {
      // Get all subtopics from DB to build slug->UUID map
      const { data: dbSubtopics } = await supabase
        .from('topic_subtopics')
        .select('id, name')

      if (dbSubtopics) {
        // Build a name-to-UUID map from DB subtopics
        const nameToUuid = new Map<string, string>()
        for (const sub of dbSubtopics) {
          nameToUuid.set(sub.name, sub.id)
        }

        // Resolve client slugs to names using static data, then to DB UUIDs
        const topicRows: { subscriber_id: string; subtopic_id: string }[] = []
        for (const category of TOPIC_CATEGORIES) {
          for (const sub of category.subtopics) {
            if (topics.includes(sub.id)) {
              const dbUuid = nameToUuid.get(sub.name)
              if (dbUuid) {
                topicRows.push({
                  subscriber_id: subscriberId,
                  subtopic_id: dbUuid,
                })
              }
            }
          }
        }

        if (topicRows.length > 0) {
          // Delete existing topics first (in case of re-onboarding)
          await supabase
            .from('subscriber_topics')
            .delete()
            .eq('subscriber_id', subscriberId)

          const { error: topicError } = await supabase
            .from('subscriber_topics')
            .insert(topicRows)

          if (topicError) {
            console.error('[completeOnboarding] subscriber_topics error:', topicError)
            // Non-blocking: log but continue
          }
        }
      }
    }

    // 4c. Write subscriber_custom_topics if provided
    if (customTopics.trim()) {
      // Delete existing custom topics first
      await supabase
        .from('subscriber_custom_topics')
        .delete()
        .eq('subscriber_id', subscriberId)

      const { error: customError } = await supabase
        .from('subscriber_custom_topics')
        .insert({
          subscriber_id: subscriberId,
          description: customTopics.trim(),
        })

      if (customError) {
        console.error('[completeOnboarding] subscriber_custom_topics error:', customError)
        // Non-blocking: log but continue
      }
    }

    // 4d. Write subscriber_sources for each feed URL
    if (feedUrls.length > 0) {
      // Delete existing sources first
      await supabase
        .from('subscriber_sources')
        .delete()
        .eq('subscriber_id', subscriberId)

      const sourceRows = feedUrls.map((url) => ({
        subscriber_id: subscriberId,
        feed_url: url,
      }))

      const { error: sourceError } = await supabase
        .from('subscriber_sources')
        .insert(sourceRows)

      if (sourceError) {
        console.error('[completeOnboarding] subscriber_sources error:', sourceError)
        // Non-blocking: log but continue
      }
    }

    // 5. Update subscriber status from 'pending' to 'active'
    const { error: statusError } = await supabase
      .from('subscribers')
      .update({ status: 'active' })
      .eq('id', subscriberId)

    if (statusError) {
      console.error('[completeOnboarding] status update error:', statusError)
      // Non-blocking: preferences are saved, status can be fixed later
    }

    // 6. Send welcome email (fire-and-forget)
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('email')
      .eq('id', subscriberId)
      .single()

    if (subscriber?.email && process.env.RESEND_API_KEY) {
      // Resolve topic names for the email
      const topicNames = topics.length > 0
        ? TOPIC_CATEGORIES.flatMap((cat) =>
            cat.subtopics
              .filter((sub) => topics.includes(sub.id))
              .map((sub) => sub.name)
          )
        : []

      const resend = new Resend(process.env.RESEND_API_KEY)

      // Fire-and-forget: do NOT await — wrap in catch to log errors only
      resend.emails
        .send({
          from: 'Lucas Senechal <newsletter@lucassenechal.com>',
          to: subscriber.email,
          subject: 'Your daily edge starts tomorrow',
          react: WelcomeEmail({
            topics: topicNames,
            customTopics,
            format,
            deliveryTime,
          }),
        })
        .catch((err) => {
          console.error('[welcome-email] Send failed:', err)
        })
    }

    return { success: true }
  } catch (err) {
    console.error('[completeOnboarding] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
