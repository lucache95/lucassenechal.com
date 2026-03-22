import { createClient } from 'npm:@supabase/supabase-js@2'
const { Anthropic } = await import('npm:@anthropic-ai/sdk@0')

// NOTE: In Deno Edge Functions, lib/ modules are NOT directly importable.
// All logic is inlined: quiet hours check, HMAC token generation, Twilio API,
// and SMS summary generation. This matches the established pattern from
// email-delivery, research-pipeline, and content-generation Edge Functions.

const MAX_BATCH_SIZE = 20 // Lower than email (Twilio SMS rate limits)
const VISIBILITY_TIMEOUT = 300 // 5 minutes
const MAX_RETRIES = 3

// ============================================================
// Quiet Hours Check — Inlined from lib/sms/quiet-hours.ts
// Uses Intl.DateTimeFormat for timezone conversion (no external lib).
// Fail open on invalid timezone (return false = allow sending).
// ============================================================
function isWithinQuietHours(timezone: string): boolean {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    })
    const localHour = parseInt(formatter.format(now), 10)
    // Quiet hours: before 8am or at/after 9pm (21:00)
    return localHour < 8 || localHour >= 21
  } catch {
    // Invalid timezone -- fail open (allow sending)
    return false
  }
}

// ============================================================
// HMAC Token Generation — Inlined from lib/email/token.ts
// Uses Deno's Web Crypto API (not Node crypto).
// Produces identical hex output to the Node.js version because
// both use HMAC-SHA256 with format `{subscriberId}:{action}`.
// ============================================================
async function generateToken(subscriberId: string, action: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${subscriberId}:${action}`))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================================
// Twilio SMS Sender — Direct REST API via fetch
// Deno Edge Functions cannot use the twilio npm SDK.
// Uses Basic Auth with Account SID + Auth Token.
// ============================================================
async function sendSms(to: string, body: string): Promise<{ sid: string; status: string }> {
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': `Basic ${auth}`,
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: body,
    }).toString(),
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.message || `Twilio API error: ${response.status}`)
  }
  return { sid: result.sid, status: result.status }
}

// ============================================================
// SMS Summary Generation — Claude Haiku 4.5
// Compresses newsletter content_json to 3-5 bullet points
// under 300 characters for SMS delivery.
// ============================================================
async function generateSmsSummary(
  contentJson: unknown,
  format: string,
  client: InstanceType<typeof Anthropic>
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: `You compress newsletter content into an SMS summary.
Rules:
- 3-5 bullet points, each one sentence
- Total under 300 characters (fits 2 SMS segments max)
- Start each bullet with a dash and space
- No links in bullets (link goes at the end separately)
- Be specific and informative, not vague
- Write in present tense`,
    messages: [{
      role: 'user',
      content: `Summarize this ${format} newsletter content for SMS:\n\n${JSON.stringify(contentJson)}`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

// ============================================================
// Main Edge Function Handler
// Reads from pgmq sms_delivery queue, generates summaries,
// sends via Twilio, logs to sms_send_log, archives messages.
// ============================================================
Deno.serve(async (_req) => {
  const startTime = Date.now()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })
  const emailLinkSecret = Deno.env.get('EMAIL_LINK_SECRET')!

  try {
    // Step 1: Read batch from pgmq sms_delivery queue
    const { data: messages, error: readError } = await supabase.rpc('pgmq_read', {
      queue_name: 'sms_delivery',
      vt: VISIBILITY_TIMEOUT,
      qty: MAX_BATCH_SIZE,
    })

    if (readError || !messages?.length) {
      return new Response(JSON.stringify({
        status: 'no_messages',
        error: readError?.message,
        duration_ms: Date.now() - startTime,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Step 2: Process each message
    let sent = 0, skipped = 0, failed = 0

    for (const msg of messages) {
      const { subscriber_id, research_date, retry_count } = msg.message

      try {
        // 2a. Fetch subscriber (check active status)
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('id, email, status')
          .eq('id', subscriber_id)
          .single()

        if (!subscriber || subscriber.status !== 'active') {
          await supabase.rpc('pgmq_archive', { queue_name: 'sms_delivery', msg_id: msg.msg_id })
          skipped++
          continue
        }

        // 2b. Fetch subscriber preferences (check SMS opt-in and phone)
        const { data: prefs } = await supabase
          .from('subscriber_preferences')
          .select('sms_opt_in, phone, timezone')
          .eq('subscriber_id', subscriber_id)
          .single()

        if (!prefs?.sms_opt_in || !prefs?.phone) {
          await supabase.rpc('pgmq_archive', { queue_name: 'sms_delivery', msg_id: msg.msg_id })
          skipped++
          continue
        }

        // 2c. Check quiet hours using subscriber's timezone
        const subscriberTimezone = prefs.timezone || 'America/New_York'
        if (isWithinQuietHours(subscriberTimezone)) {
          // Re-queue with 1-hour delay: archive current, send new message
          await supabase.rpc('pgmq_archive', { queue_name: 'sms_delivery', msg_id: msg.msg_id })
          await supabase.rpc('pgmq_send', {
            queue_name: 'sms_delivery',
            msg: JSON.stringify({
              subscriber_id,
              research_date,
              enqueued_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              retry_count: retry_count || 0,
            }),
          })
          skipped++
          continue
        }

        // 2d. Fetch newsletter_content for subscriber + research_date
        const researchDate = research_date || new Date().toISOString().split('T')[0]
        const { data: content } = await supabase
          .from('newsletter_content')
          .select('format, subject, content_json, result_count')
          .eq('subscriber_id', subscriber_id)
          .eq('research_date', researchDate)
          .single()

        // 2e. Skip if no content or no results (no SMS for fallback days)
        if (!content || content.result_count === 0) {
          await supabase.rpc('pgmq_archive', { queue_name: 'sms_delivery', msg_id: msg.msg_id })
          skipped++
          continue
        }

        // 2f. Generate SMS summary via Claude Haiku
        const summary = await generateSmsSummary(content.content_json, content.format, anthropic)

        // 2g. Generate view-in-browser link with HMAC token
        const viewToken = await generateToken(subscriber_id, 'view-email', emailLinkSecret)
        const viewInBrowserUrl = `https://lucassenechal.com/newsletter/view?s=${subscriber_id}&d=${researchDate}&t=${viewToken}`

        // 2h. Compose full SMS body: summary + view link
        const smsBody = `${summary}\n\nFull report: ${viewInBrowserUrl}`

        // 2i. Send via Twilio
        const twilioResult = await sendSms(prefs.phone, smsBody)

        // 2j. Log in sms_send_log with direction='outbound', status='sent'
        await supabase.from('sms_send_log').insert({
          subscriber_id,
          twilio_sid: twilioResult.sid,
          message_body: smsBody,
          direction: 'outbound',
          status: 'sent',
        })

        // 2k. Archive message from pgmq
        await supabase.rpc('pgmq_archive', { queue_name: 'sms_delivery', msg_id: msg.msg_id })
        sent++

        // 2m. Rate limit: 1000ms delay between sends (Twilio 1 msg/s for toll-free)
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        failed++
        const errorMsg = error instanceof Error ? error.message : String(error)

        // 2l. Log to sms_send_log with status='failed' and error message
        await supabase.from('sms_send_log').insert({
          subscriber_id,
          message_body: '',
          direction: 'outbound',
          status: 'failed',
          error: errorMsg,
        })

        // Archive after MAX_RETRIES to prevent infinite retry loops
        if ((retry_count || 0) >= MAX_RETRIES) {
          await supabase.rpc('pgmq_archive', { queue_name: 'sms_delivery', msg_id: msg.msg_id })
        }
        // Otherwise visibility timeout expires and message becomes available for retry
      }
    }

    return new Response(JSON.stringify({
      status: 'complete',
      sent,
      skipped,
      failed,
      duration_ms: Date.now() - startTime,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - startTime,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
