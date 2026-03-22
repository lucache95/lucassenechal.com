'use server'

import { createClient } from '@supabase/supabase-js'
import {
  preferencesUpdateSchema,
  topicsUpdateSchema,
  sourcesUpdateSchema,
  unsubscribeSchema,
  resubscribeSchema,
} from '@/lib/schemas/preferences'
import { TOPIC_CATEGORIES } from '@/lib/data/topics'

type ActionResult = { success?: boolean; error?: string }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ---------------------------------------------------------------------------
// updatePreferences — Format, delivery time, timezone, city, SMS opt-in/phone
// ---------------------------------------------------------------------------

export async function updatePreferences(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = formData.get('preferencesData')
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Invalid form data' }
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawData)
  } catch {
    return { error: 'Invalid form data format' }
  }

  const parsed = preferencesUpdateSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' }
  }

  const { subscriberId, format, deliveryTime, timezone, city, smsOptIn, phone } = parsed.data

  const supabase = getSupabase()

  try {
    const { error } = await supabase
      .from('subscriber_preferences')
      .upsert({
        subscriber_id: subscriberId,
        format,
        delivery_time: deliveryTime,
        timezone,
        city: city || null,
        sms_opt_in: smsOptIn,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'subscriber_id' })

    if (error) {
      console.error('[updatePreferences] Supabase error:', error)
      return { error: 'Failed to save preferences. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[updatePreferences] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

// ---------------------------------------------------------------------------
// updateTopics — Topic selections + custom topics
// ---------------------------------------------------------------------------

export async function updateTopics(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = formData.get('topicsData')
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Invalid form data' }
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawData)
  } catch {
    return { error: 'Invalid form data format' }
  }

  const parsed = topicsUpdateSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' }
  }

  const { subscriberId, topics, customTopics } = parsed.data

  const supabase = getSupabase()

  try {
    // Delete existing topics
    await supabase
      .from('subscriber_topics')
      .delete()
      .eq('subscriber_id', subscriberId)

    // Insert new topic selections (slug-to-UUID resolution)
    if (topics.length > 0) {
      const { data: dbSubtopics } = await supabase
        .from('topic_subtopics')
        .select('id, name')

      if (dbSubtopics) {
        const nameToUuid = new Map<string, string>()
        for (const sub of dbSubtopics) {
          nameToUuid.set(sub.name, sub.id)
        }

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
          const { error: topicError } = await supabase
            .from('subscriber_topics')
            .insert(topicRows)

          if (topicError) {
            console.error('[updateTopics] subscriber_topics error:', topicError)
            return { error: 'Failed to save topics. Please try again.' }
          }
        }
      }
    }

    // Delete existing custom topics and insert new one
    await supabase
      .from('subscriber_custom_topics')
      .delete()
      .eq('subscriber_id', subscriberId)

    if (customTopics.trim()) {
      const { error: customError } = await supabase
        .from('subscriber_custom_topics')
        .insert({
          subscriber_id: subscriberId,
          description: customTopics.trim(),
        })

      if (customError) {
        console.error('[updateTopics] subscriber_custom_topics error:', customError)
        // Non-blocking: topics saved even if custom topic fails
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[updateTopics] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

// ---------------------------------------------------------------------------
// updateSources — Custom RSS/Atom feed URLs
// ---------------------------------------------------------------------------

export async function updateSources(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = formData.get('sourcesData')
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Invalid form data' }
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawData)
  } catch {
    return { error: 'Invalid form data format' }
  }

  const parsed = sourcesUpdateSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' }
  }

  const { subscriberId, feedUrls } = parsed.data

  const supabase = getSupabase()

  try {
    // Delete existing sources
    await supabase
      .from('subscriber_sources')
      .delete()
      .eq('subscriber_id', subscriberId)

    // Insert new sources
    if (feedUrls.length > 0) {
      const sourceRows = feedUrls.map((url) => ({
        subscriber_id: subscriberId,
        feed_url: url,
      }))

      const { error: sourceError } = await supabase
        .from('subscriber_sources')
        .insert(sourceRows)

      if (sourceError) {
        console.error('[updateSources] subscriber_sources error:', sourceError)
        return { error: 'Failed to save sources. Please try again.' }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[updateSources] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

// ---------------------------------------------------------------------------
// unsubscribeAction — Set status to unsubscribed
// ---------------------------------------------------------------------------

export async function unsubscribeAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawSubscriberId = formData.get('subscriberId')
  if (!rawSubscriberId || typeof rawSubscriberId !== 'string') {
    return { error: 'Invalid request' }
  }

  const parsed = unsubscribeSchema.safeParse({ subscriberId: rawSubscriberId })
  if (!parsed.success) {
    return { error: 'Invalid subscriber ID' }
  }

  const supabase = getSupabase()

  try {
    const { error } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.subscriberId)

    if (error) {
      console.error('[unsubscribeAction] Supabase error:', error)
      return { error: 'Failed to unsubscribe. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[unsubscribeAction] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

// ---------------------------------------------------------------------------
// resubscribeAction — Set status back to active
// ---------------------------------------------------------------------------

export async function resubscribeAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawSubscriberId = formData.get('subscriberId')
  if (!rawSubscriberId || typeof rawSubscriberId !== 'string') {
    return { error: 'Invalid request' }
  }

  const parsed = resubscribeSchema.safeParse({ subscriberId: rawSubscriberId })
  if (!parsed.success) {
    return { error: 'Invalid subscriber ID' }
  }

  const supabase = getSupabase()

  try {
    const { error } = await supabase
      .from('subscribers')
      .update({
        status: 'active',
        unsubscribed_at: null,
      })
      .eq('id', parsed.data.subscriberId)

    if (error) {
      console.error('[resubscribeAction] Supabase error:', error)
      return { error: 'Failed to re-subscribe. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[resubscribeAction] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
