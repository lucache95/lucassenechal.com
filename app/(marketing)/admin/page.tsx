import { createClient } from '@supabase/supabase-js'
import { SubscriberTable, type SubscriberRow } from '@/components/admin/subscriber-table'

export const metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface StatCardProps {
  label: string
  value: string | number
  valueColor?: string
}

function StatCard({ label, value, valueColor }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e2e8f0',
      }}
    >
      <p
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: valueColor || '#0f172a',
          margin: '0 0 4px 0',
          lineHeight: '1.2',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 400,
          color: '#64748b',
          margin: 0,
          lineHeight: '1.4',
        }}
      >
        {label}
      </p>
    </div>
  )
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const params = await searchParams

  if (params.key !== process.env.ADMIN_SECRET) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontSize: '18px' }}>Unauthorized</p>
      </div>
    )
  }

  const supabase = getSupabase()

  // ---- Stats ----
  const { count: totalSubscribers } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count: sentToday } = await supabase
    .from('send_log')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', todayStart.toISOString())

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { count: bouncesWeek } = await supabase
    .from('send_log')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'bounced')
    .gte('sent_at', sevenDaysAgo)

  const { count: totalWeek } = await supabase
    .from('send_log')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', sevenDaysAgo)

  const bounceRate = totalWeek
    ? ((bouncesWeek || 0) / totalWeek * 100).toFixed(1)
    : '0.0'

  const { count: failedToday } = await supabase
    .from('send_log')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('sent_at', todayStart.toISOString())

  // ---- Subscriber list ----
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('id, email, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  // ---- Subscriber preferences ----
  const subscriberIds = (subscribers || []).map(s => s.id)
  const { data: preferences } = subscriberIds.length > 0
    ? await supabase
        .from('subscriber_preferences')
        .select('subscriber_id, format, delivery_time')
        .in('subscriber_id', subscriberIds)
    : { data: [] }

  const prefsBySubscriberId = Object.fromEntries(
    (preferences || []).map(p => [p.subscriber_id, p])
  )

  // ---- Last send per subscriber ----
  const { data: lastSends } = subscriberIds.length > 0
    ? await supabase
        .from('send_log')
        .select('subscriber_id, status, sent_at, error')
        .in('subscriber_id', subscriberIds)
        .order('sent_at', { ascending: false })
        .limit(subscriberIds.length * 5)  // fetch several recent sends per subscriber
    : { data: [] }

  // Build a map of subscriber_id -> most recent send
  const lastSendBySubscriberId: Record<string, { status: string; sent_at: string; error: string | null }> = {}
  const errorCountBySubscriberId: Record<string, number> = {}

  for (const send of lastSends || []) {
    if (!lastSendBySubscriberId[send.subscriber_id]) {
      lastSendBySubscriberId[send.subscriber_id] = {
        status: send.status,
        sent_at: send.sent_at,
        error: send.error,
      }
    }
    if (send.status === 'failed' || send.status === 'bounced') {
      errorCountBySubscriberId[send.subscriber_id] =
        (errorCountBySubscriberId[send.subscriber_id] || 0) + 1
    }
  }

  // ---- Build subscriber rows ----
  const subscriberRows: SubscriberRow[] = (subscribers || []).map(s => {
    const pref = prefsBySubscriberId[s.id]
    const lastSend = lastSendBySubscriberId[s.id]
    return {
      id: s.id,
      email: s.email,
      status: s.status,
      created_at: s.created_at,
      format: pref?.format || null,
      delivery_time: pref?.delivery_time || null,
      last_send_status: lastSend?.status || null,
      last_send_at: lastSend?.sent_at || null,
      last_error: lastSend?.error || null,
      error_count: errorCountBySubscriberId[s.id] || 0,
    }
  })

  const hasSubscribers = subscriberRows.length > 0
  const hasSends = (sentToday || 0) > 0

  return (
    <div
      style={{
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '32px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: '0 0 24px 0' }}>
        Email Delivery Dashboard
      </h1>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCard label="Total Subscribers" value={totalSubscribers || 0} />
        <StatCard label="Sent Today" value={sentToday || 0} />
        <StatCard label="Bounce Rate (7 days)" value={`${bounceRate}%`} />
        <StatCard
          label="Failed Sends Today"
          value={failedToday || 0}
          valueColor={(failedToday || 0) > 0 ? '#dc2626' : undefined}
        />
      </div>

      {/* Subscriber list section */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
          Subscribers
        </h2>

        {!hasSubscribers ? (
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '40px 24px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', margin: '0 0 8px 0' }}>
              No subscribers yet
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
              Subscribers will appear here after they complete the onboarding flow at /newsletter.
            </p>
          </div>
        ) : (
          <SubscriberTable subscribers={subscriberRows} />
        )}
      </section>

      {/* Send history empty state */}
      {!hasSends && hasSubscribers && (
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
            Send History
          </h2>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '40px 24px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', margin: '0 0 8px 0' }}>
              No sends recorded
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
              Send history will appear after the first daily email run completes.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
