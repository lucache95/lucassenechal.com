import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/email/token'
import { TOPIC_CATEGORIES } from '@/lib/data/topics'
import { PreferenceSections } from '@/components/preferences/preference-sections'

export const metadata = {
  title: 'Update Preferences | Lucas Senechal',
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ---------------------------------------------------------------------------
// Error page component for invalid/missing tokens
// ---------------------------------------------------------------------------

function ErrorPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Invalid link</h1>
        <p className="text-sm text-slate-500 mb-6">
          This preferences link is invalid or expired. Enter your email below to receive a fresh preferences link.
        </p>
        <EmailRefreshForm />
      </div>
    </div>
  )
}

function EmailRefreshForm() {
  return (
    <form
      onSubmit={undefined}
      className="space-y-3"
    >
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
      >
        Send preferences link
      </button>
      <p className="text-xs text-slate-400">
        Check your email for a new preferences link after submitting.
      </p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Main preferences page
// ---------------------------------------------------------------------------

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; t?: string }>
}) {
  const params = await searchParams

  const subscriberId = params.s
  const token = params.t

  // Validate required params
  if (!subscriberId || !token) {
    return <ErrorPage />
  }

  // Verify token
  if (!verifyToken(subscriberId, 'preferences', token)) {
    return <ErrorPage />
  }

  // Load subscriber data
  const supabase = getSupabase()

  // Fetch subscriber status/email
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('email, status')
    .eq('id', subscriberId)
    .single()

  if (!subscriber) {
    return <ErrorPage />
  }

  // Fetch preferences
  const { data: preferences } = await supabase
    .from('subscriber_preferences')
    .select('format, delivery_time, timezone, city, sms_opt_in, phone')
    .eq('subscriber_id', subscriberId)
    .single()

  // Fetch selected topics (join with topic_subtopics to get names)
  const { data: subscriberTopics } = await supabase
    .from('subscriber_topics')
    .select('subtopic_id, topic_subtopics(name)')
    .eq('subscriber_id', subscriberId)

  // Map DB topic names back to slug IDs using TOPIC_CATEGORIES
  const currentTopics: string[] = []
  if (subscriberTopics) {
    for (const row of subscriberTopics) {
      const subtopicRecord = row.topic_subtopics as unknown as { name: string } | null
      const dbName = subtopicRecord?.name
      if (dbName) {
        // Find the matching slug in TOPIC_CATEGORIES
        for (const category of TOPIC_CATEGORIES) {
          for (const sub of category.subtopics) {
            if (sub.name === dbName) {
              currentTopics.push(sub.id)
            }
          }
        }
      }
    }
  }

  // Fetch custom topics
  const { data: customTopics } = await supabase
    .from('subscriber_custom_topics')
    .select('description')
    .eq('subscriber_id', subscriberId)

  const currentCustomTopics = customTopics?.map((ct) => ct.description).join('\n') || ''

  // Fetch sources
  const { data: sources } = await supabase
    .from('subscriber_sources')
    .select('feed_url')
    .eq('subscriber_id', subscriberId)

  const currentSources = sources?.map((s) => s.feed_url) || []

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PreferenceSections
        subscriberId={subscriberId}
        email={subscriber.email}
        currentTopics={currentTopics}
        currentCustomTopics={currentCustomTopics}
        currentFormat={(preferences?.format as 'digest' | 'briefing' | 'mixed') || 'digest'}
        currentDeliveryTime={(preferences?.delivery_time as 'morning' | 'afternoon' | 'evening') || 'morning'}
        currentTimezone={preferences?.timezone || 'UTC'}
        currentCity={preferences?.city || ''}
        currentSmsOptIn={preferences?.sms_opt_in || false}
        currentPhone={preferences?.phone || ''}
        currentSources={currentSources}
        isUnsubscribed={subscriber.status === 'unsubscribed'}
      />
    </div>
  )
}
