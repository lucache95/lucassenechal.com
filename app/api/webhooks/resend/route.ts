import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const { type, data } = payload

  const supabase = getSupabase()

  switch (type) {
    case 'email.delivered': {
      await supabase
        .from('send_log')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('resend_id', data.email_id)
      break
    }

    case 'email.bounced': {
      // Update send_log
      await supabase
        .from('send_log')
        .update({
          status: 'bounced',
          error: data.bounce?.message || 'Unknown bounce reason',
        })
        .eq('resend_id', data.email_id)

      // Check for 3 consecutive bounces -> auto-pause subscriber
      // First, get subscriber_id from the bounced send_log entry
      const { data: logEntry } = await supabase
        .from('send_log')
        .select('subscriber_id')
        .eq('resend_id', data.email_id)
        .single()

      if (logEntry?.subscriber_id) {
        // Count recent consecutive bounces (last 3 sends for this subscriber)
        const { data: recentSends } = await supabase
          .from('send_log')
          .select('status')
          .eq('subscriber_id', logEntry.subscriber_id)
          .order('sent_at', { ascending: false })
          .limit(3)

        const consecutiveBounces = recentSends?.every(s => s.status === 'bounced')
        if (consecutiveBounces && recentSends && recentSends.length >= 3) {
          await supabase
            .from('subscribers')
            .update({ status: 'paused' })
            .eq('id', logEntry.subscriber_id)
        }
      }
      break
    }

    case 'email.complained': {
      // Update send_log
      await supabase
        .from('send_log')
        .update({ status: 'complained' })
        .eq('resend_id', data.email_id)

      // Auto-unsubscribe on spam complaint
      const { data: complainedLog } = await supabase
        .from('send_log')
        .select('subscriber_id')
        .eq('resend_id', data.email_id)
        .single()

      if (complainedLog?.subscriber_id) {
        await supabase
          .from('subscribers')
          .update({
            status: 'unsubscribed',
            unsubscribed_at: new Date().toISOString(),
          })
          .eq('id', complainedLog.subscriber_id)
      }
      break
    }

    case 'email.opened': {
      await supabase
        .from('send_log')
        .update({ opened_at: new Date().toISOString() })
        .eq('resend_id', data.email_id)
      break
    }

    default:
      // Unknown event type -- ignore gracefully
      break
  }

  return NextResponse.json({ received: true })
}
