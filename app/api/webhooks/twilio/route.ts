import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { smsIntentSchema, SMS_INTENT_SYSTEM_PROMPT, SMS_FALLBACK_RESPONSE } from '@/lib/sms/intent-parser'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function twimlResponse(message?: string): NextResponse {
  const body = message
    ? `<Response><Message>${escapeXml(message)}</Message></Response>`
    : '<Response></Response>'
  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

// ---------------------------------------------------------------------------
// POST handler — Twilio inbound SMS webhook
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Parse form-encoded body
    const body = await request.text()
    const params: Record<string, string> = {}
    new URLSearchParams(body).forEach((value, key) => { params[key] = value })

    // 2. Validate Twilio signature
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const signature = request.headers.get('x-twilio-signature') || ''
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio`

    if (!twilio.validateRequest(authToken, signature, webhookUrl, params)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // 3. Extract message fields
    const from = params.From       // E.164 phone
    const messageBody = params.Body?.trim() || ''
    const optOutType = params.OptOutType
    const messageSid = params.MessageSid

    // 4. Handle STOP/START/HELP opt-out webhooks (SMS-06)
    // STOP: set sms_opt_in = false, return empty TwiML (Twilio sends STOP confirmation -- do NOT reply per TCPA)
    // START: set sms_opt_in = true, return empty TwiML
    // HELP: return empty TwiML (Twilio handles HELP at platform level)
    if (optOutType === 'STOP' || optOutType === 'START' || optOutType === 'HELP') {
      if (optOutType === 'STOP' || optOutType === 'START') {
        const supabase = getSupabase()
        await supabase
          .from('subscriber_preferences')
          .update({ sms_opt_in: optOutType === 'START' })
          .eq('phone', from)
      }
      return twimlResponse()
    }

    // 5. Look up subscriber by phone number
    const supabase = getSupabase()
    const { data: prefs } = await supabase
      .from('subscriber_preferences')
      .select('subscriber_id, sms_opt_in')
      .eq('phone', from)
      .single()

    if (!prefs || !prefs.sms_opt_in) {
      return twimlResponse()  // Unknown number or not opted in
    }

    const subscriberId = prefs.subscriber_id

    // 6. Log inbound message to sms_send_log
    await supabase.from('sms_send_log').insert({
      subscriber_id: subscriberId,
      twilio_sid: messageSid,
      message_body: messageBody,
      direction: 'inbound',
      status: 'delivered',
    })

    // 7. Store user message in sms_conversations (daily session)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('sms_conversations').insert({
      subscriber_id: subscriberId,
      role: 'user',
      content: messageBody,
      session_date: today,
    })

    // 8. Fetch conversation history (last 5 messages for this session)
    const { data: history } = await supabase
      .from('sms_conversations')
      .select('role, content')
      .eq('subscriber_id', subscriberId)
      .eq('session_date', today)
      .order('created_at', { ascending: true })
      .limit(5)

    // 9. Fetch subscriber's latest newsletter content for context
    const { data: latestContent } = await supabase
      .from('newsletter_content')
      .select('format, content_json, research_date')
      .eq('subscriber_id', subscriberId)
      .order('research_date', { ascending: false })
      .limit(1)
      .single()

    // 10. Detect intent via Claude Haiku with AbortController timeout (10s)
    let reply = SMS_FALLBACK_RESPONSE

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const { text: intentJson } = await generateText({
        model: anthropic('claude-haiku-4-5'),
        system: SMS_INTENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: messageBody }],
        abortSignal: controller.signal,
      })
      clearTimeout(timeout)

      const parsed = smsIntentSchema.safeParse(JSON.parse(intentJson))

      if (!parsed.success) {
        reply = SMS_FALLBACK_RESPONSE
      } else {
        const intent = parsed.data

        // 11. Handle each intent type
        if (intent.intent === 'question') {
          // SMS-04: Answer questions using newsletter content as context
          const newsletterContext = latestContent?.content_json
            ? JSON.stringify(latestContent.content_json).slice(0, 2000)
            : 'No newsletter content available yet.'

          const conversationMessages = (history || []).map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))

          const questionController = new AbortController()
          const questionTimeout = setTimeout(() => questionController.abort(), 10000)

          try {
            const { text: answer } = await generateText({
              model: anthropic('claude-haiku-4-5'),
              system: `You are a helpful assistant for The Daily Briefing newsletter. Answer questions about the subscriber's latest newsletter content. Keep responses under 300 characters for SMS. Be specific and reference the actual content.\n\nNewsletter content (${latestContent?.research_date || 'unknown date'}):\n${newsletterContext}`,
              messages: conversationMessages,
              abortSignal: questionController.signal,
            })
            clearTimeout(questionTimeout)
            reply = answer.slice(0, 300)
          } catch {
            clearTimeout(questionTimeout)
            reply = SMS_FALLBACK_RESPONSE
          }
        } else if (intent.intent === 'preference_update' && intent.preferenceAction) {
          // SMS-05: Handle preference updates
          const { field, value } = intent.preferenceAction

          if (field === 'topics_add') {
            await supabase.from('subscriber_custom_topics').insert({
              subscriber_id: subscriberId,
              description: value,
            })
            reply = `Got it! I've added '${value}' to your topics. You'll see it in tomorrow's briefing.`
          } else if (field === 'topics_remove') {
            await supabase.from('subscriber_custom_topics').insert({
              subscriber_id: subscriberId,
              description: `REMOVE: ${value}`,
            })
            reply = `Done! I'll stop including '${value}' in your briefings.`
          } else if (field === 'delivery_time') {
            // Map value to valid delivery_time enum
            const timeMap: Record<string, string> = {
              morning: 'morning',
              afternoon: 'afternoon',
              evening: 'evening',
              night: 'evening',
              am: 'morning',
              pm: 'afternoon',
            }
            const mappedTime = timeMap[value.toLowerCase()] || 'morning'
            await supabase
              .from('subscriber_preferences')
              .update({ delivery_time: mappedTime })
              .eq('subscriber_id', subscriberId)
            reply = `Updated! Your briefing will now arrive in the ${mappedTime}.`
          } else if (field === 'format') {
            // Map value to valid format enum
            const formatMap: Record<string, string> = {
              digest: 'digest',
              briefing: 'briefing',
              mixed: 'mixed',
              short: 'digest',
              full: 'briefing',
              both: 'mixed',
            }
            const mappedFormat = formatMap[value.toLowerCase()] || 'digest'
            await supabase
              .from('subscriber_preferences')
              .update({ format: mappedFormat })
              .eq('subscriber_id', subscriberId)
            reply = `Switched to ${mappedFormat} format. You'll see the change tomorrow.`
          }
        } else {
          // unknown intent
          reply = SMS_FALLBACK_RESPONSE
        }
      }
    } catch {
      clearTimeout(timeout)
      reply = SMS_FALLBACK_RESPONSE
    }

    // 12. Store assistant reply in sms_conversations
    await supabase.from('sms_conversations').insert({
      subscriber_id: subscriberId,
      role: 'assistant',
      content: reply,
      session_date: today,
    })

    // 13. Log outbound reply in sms_send_log
    await supabase.from('sms_send_log').insert({
      subscriber_id: subscriberId,
      message_body: reply,
      direction: 'outbound',
      status: 'sent',
    })

    // 14. Return TwiML with reply
    return twimlResponse(reply)
  } catch (err) {
    console.error('[twilio-webhook] Unhandled error:', err)
    return twimlResponse(SMS_FALLBACK_RESPONSE)
  }
}
