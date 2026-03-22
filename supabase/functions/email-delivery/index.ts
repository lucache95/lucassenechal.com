import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

// NOTE: In Deno Edge Functions, lib/ modules are NOT directly importable.
// All template rendering, token generation, style constants, and CTA logic
// are inlined here. This matches the established pattern from research-pipeline
// and content-generation Edge Functions.

const MAX_BATCH_SIZE = 50
const VISIBILITY_TIMEOUT = 300 // 5 minutes
const MAX_RETRIES = 3

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
// CTA Logic — Inlined from lib/email/cta-logic.ts
// ============================================================
type CtaLevel = 'soft' | 'medium'

function getCtaLevel(engagement: { clickCount: number; feedbackCount?: number }): CtaLevel {
  if (engagement.feedbackCount && engagement.feedbackCount >= 2) return 'medium'
  if (engagement.clickCount >= 3) return 'medium'
  return 'soft'
}

// ============================================================
// Email Style Constants — Inlined from lib/email/shared-styles.ts
// Used as inline style strings in HTML template literals.
// ============================================================
const STYLES = {
  bodyBg: '#f8fafc',
  containerBg: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textSection: '#334155',
  textBriefingBody: '#475569',
  border: '#e2e8f0',
  accent: '#3b82f6',
  feedbackMore: '#16a34a',
  feedbackLess: '#dc2626',
  ctaHighlight: '#f0f9ff',
}

// ============================================================
// Shared Email Layout Fragments
// ============================================================
function htmlOpen(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color:${STYLES.bodyBg};font-family:${STYLES.fontFamily};margin:0;padding:0;">
  <div style="background-color:${STYLES.containerBg};border-radius:8px;margin:40px auto;max-width:560px;padding:48px 32px;">`
}

function htmlClose(preferencesUrl: string, unsubscribeUrl: string): string {
  return `
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <p style="color:${STYLES.textSecondary};font-size:13px;font-weight:400;line-height:1.5;margin:0;">
      <a href="${preferencesUrl}" style="color:${STYLES.accent};text-decoration:underline;">Update your preferences</a>
      &nbsp;|&nbsp;
      <a href="${unsubscribeUrl}" style="color:${STYLES.textSecondary};text-decoration:underline;">Unsubscribe</a>
    </p>
  </div>
  <div style="margin:0 auto;max-width:560px;padding:0 32px 40px;">
    <p style="color:${STYLES.textTertiary};font-size:12px;font-weight:400;line-height:1.5;text-align:center;margin:0;">
      Lucas Senechal &middot; The Daily Briefing<br>
      You're receiving this because you subscribed at lucassenechal.com
    </p>
  </div>
</body>
</html>`
}

function ctaSection(ctaLevel: CtaLevel): string {
  if (ctaLevel === 'soft') {
    return `
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">
      Need AI systems that handle the busywork?&nbsp;
      <a href="https://lucassenechal.com/work-with-me" style="color:${STYLES.accent};">See how I can help</a>
    </p>`
  }
  return `
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <div style="background-color:${STYLES.ctaHighlight};border-radius:8px;padding:20px;margin:0;">
      <p style="color:${STYLES.textPrimary};font-size:15px;font-weight:600;line-height:1.4;margin:0 0 8px 0;">
        Need AI systems that handle the busywork?
      </p>
      <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">
        I build automation that eliminates repetitive admin and follow-ups.
      </p>
      <a href="https://lucassenechal.com/work-with-me" style="background-color:${STYLES.accent};border-radius:6px;color:#ffffff;display:inline-block;font-size:15px;font-weight:600;padding:12px 24px;text-decoration:none;">
        See How I Can Help
      </a>
    </div>`
}

function feedbackLinks(
  feedbackBaseUrl: string,
  subscriberId: string,
  itemUrl: string,
  token: string
): string {
  const encoded = encodeURIComponent(itemUrl)
  return `
      <p style="margin:4px 0 0 0;">
        <a href="${feedbackBaseUrl}?s=${subscriberId}&url=${encoded}&v=more&t=${token}" style="color:${STYLES.feedbackMore};font-size:13px;font-weight:400;text-decoration:none;">More like this</a>
        <span style="color:${STYLES.textTertiary};font-size:13px;">&nbsp;/&nbsp;</span>
        <a href="${feedbackBaseUrl}?s=${subscriberId}&url=${encoded}&v=less&t=${token}" style="color:${STYLES.feedbackLess};font-size:13px;font-weight:400;text-decoration:none;">Less like this</a>
      </p>`
}

// ============================================================
// Digest HTML Builder
// Layout: heading -> greeting -> HR -> items -> signoff -> HR -> CTA -> HR -> footer links -> close
// ============================================================
function buildDigestHtml(
  contentJson: {
    greeting: string
    items: Array<{ title: string; summary: string; url: string; sourceName: string }>
    signoff: string
  },
  subscriberId: string,
  unsubscribeUrl: string,
  preferencesUrl: string,
  feedbackBaseUrl: string,
  feedbackTokens: string[],
  ctaLevel: CtaLevel
): string {
  const items = contentJson.items.map((item, i) => `
    <div style="margin-bottom:16px;">
      <p style="color:${STYLES.textPrimary};font-size:15px;font-weight:600;line-height:1.4;margin:0 0 4px 0;">${escHtml(item.title)}</p>
      <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 4px 0;">${escHtml(item.summary)}</p>
      <p style="color:${STYLES.textTertiary};font-size:13px;font-weight:400;line-height:1.5;margin:0 0 4px 0;">
        via <a href="${item.url}" style="color:${STYLES.accent};text-decoration:none;">${escHtml(item.sourceName)}</a>
      </p>
      ${feedbackLinks(feedbackBaseUrl, subscriberId, item.url, feedbackTokens[i] || '')}
    </div>`).join('')

  return `${htmlOpen()}
    <h1 style="color:${STYLES.textPrimary};font-size:24px;font-weight:600;line-height:1.3;margin:0 0 8px 0;">The Daily Briefing</h1>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">${escHtml(contentJson.greeting)}</p>
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    ${items}
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:16px 0;">${escHtml(contentJson.signoff)}</p>
    ${ctaSection(ctaLevel)}
    ${htmlClose(preferencesUrl, unsubscribeUrl)}`
}

// ============================================================
// Briefing HTML Builder
// Layout: heading -> intro -> HR -> sections (uppercase heading, narrative, feedback) -> HR -> conclusion -> HR -> CTA -> HR -> footer
// ============================================================
function buildBriefingHtml(
  contentJson: {
    intro: string
    sections: Array<{ heading: string; body: string; sourceUrls: string[] }>
    conclusion: string
  },
  subscriberId: string,
  unsubscribeUrl: string,
  preferencesUrl: string,
  feedbackBaseUrl: string,
  feedbackTokens: string[],
  ctaLevel: CtaLevel
): string {
  const sections = contentJson.sections.map((section, i) => {
    const sectionUrl = section.sourceUrls?.[0] || section.heading
    return `
    <div style="margin-bottom:24px;">
      <p style="color:${STYLES.textSection};font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;line-height:1.5;margin:0 0 8px 0;">${escHtml(section.heading)}</p>
      <p style="color:${STYLES.textBriefingBody};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 4px 0;">${escHtml(section.body)}</p>
      ${feedbackLinks(feedbackBaseUrl, subscriberId, sectionUrl, feedbackTokens[i] || '')}
    </div>`
  }).join('')

  return `${htmlOpen()}
    <h1 style="color:${STYLES.textPrimary};font-size:24px;font-weight:600;line-height:1.3;margin:0 0 8px 0;">The Daily Briefing</h1>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">${escHtml(contentJson.intro)}</p>
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    ${sections}
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">${escHtml(contentJson.conclusion)}</p>
    ${ctaSection(ctaLevel)}
    ${htmlClose(preferencesUrl, unsubscribeUrl)}`
}

// ============================================================
// Mixed HTML Builder
// Layout: heading -> synthesis -> HR -> items (linked title, one-liner, source, feedback) -> HR -> signoff -> HR -> CTA -> HR -> footer
// ============================================================
function buildMixedHtml(
  contentJson: {
    synthesis: string
    items: Array<{ title: string; oneLiner: string; url: string; sourceName: string }>
    signoff: string
  },
  subscriberId: string,
  unsubscribeUrl: string,
  preferencesUrl: string,
  feedbackBaseUrl: string,
  feedbackTokens: string[],
  ctaLevel: CtaLevel
): string {
  const items = contentJson.items.map((item, i) => `
    <div style="margin-bottom:16px;">
      <p style="color:${STYLES.textPrimary};font-size:15px;font-weight:600;line-height:1.4;margin:0 0 4px 0;">
        <a href="${item.url}" style="color:${STYLES.accent};text-decoration:none;">${escHtml(item.title)}</a>
      </p>
      <p style="color:${STYLES.textSecondary};font-size:13px;font-weight:400;line-height:1.5;margin:0 0 4px 0;">${escHtml(item.oneLiner)}</p>
      <p style="color:${STYLES.textTertiary};font-size:13px;font-weight:400;line-height:1.5;margin:0 0 4px 0;">
        via <a href="${item.url}" style="color:${STYLES.accent};text-decoration:none;">${escHtml(item.sourceName)}</a>
      </p>
      ${feedbackLinks(feedbackBaseUrl, subscriberId, item.url, feedbackTokens[i] || '')}
    </div>`).join('')

  return `${htmlOpen()}
    <h1 style="color:${STYLES.textPrimary};font-size:24px;font-weight:600;line-height:1.3;margin:0 0 8px 0;">The Daily Briefing</h1>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">${escHtml(contentJson.synthesis)}</p>
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    ${items}
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">${escHtml(contentJson.signoff)}</p>
    ${ctaSection(ctaLevel)}
    ${htmlClose(preferencesUrl, unsubscribeUrl)}`
}

// ============================================================
// Fallback HTML Builder
// Hardcoded copy per UI-SPEC. No feedback links, no consulting CTA.
// ============================================================
function buildFallbackHtml(
  _subscriberId: string,
  preferencesUrl: string,
  unsubscribeUrl: string
): string {
  return `${htmlOpen()}
    <h1 style="color:${STYLES.textPrimary};font-size:24px;font-weight:600;line-height:1.3;margin:0 0 8px 0;">The Daily Briefing</h1>
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <p style="color:${STYLES.textPrimary};font-size:15px;font-weight:600;line-height:1.4;margin:0 0 4px 0;">Your briefing is light today</p>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">
      Today's research didn't turn up enough quality results for your topics.
      This can happen when news cycles are slow or your interests are very specific.
    </p>
    <p style="color:${STYLES.textSection};font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;line-height:1.5;margin:0 0 8px 0;">A few things that might help:</p>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 4px 0;">&bull; Add broader topic categories to cast a wider net</p>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 4px 0;">&bull; Check if your custom topics are too narrow</p>
    <p style="color:${STYLES.textSecondary};font-size:15px;font-weight:400;line-height:1.6;margin:0 0 16px 0;">&bull; We'll keep looking &mdash; tomorrow's briefing will likely be fuller</p>
    <div style="margin:24px 0;">
      <a href="${preferencesUrl}" style="background-color:${STYLES.accent};border-radius:6px;color:#ffffff;display:inline-block;font-size:15px;font-weight:600;padding:12px 24px;text-decoration:none;">
        Update Your Preferences
      </a>
    </div>
    <hr style="border:none;border-top:1px solid ${STYLES.border};margin:24px 0;">
    <p style="color:${STYLES.textSecondary};font-size:13px;font-weight:400;line-height:1.5;margin:0;">
      <a href="${preferencesUrl}" style="color:${STYLES.accent};text-decoration:underline;">Update your preferences</a>
      &nbsp;|&nbsp;
      <a href="${unsubscribeUrl}" style="color:${STYLES.textSecondary};text-decoration:underline;">Unsubscribe</a>
    </p>
  </div>
  <div style="margin:0 auto;max-width:560px;padding:0 32px 40px;">
    <p style="color:${STYLES.textTertiary};font-size:12px;font-weight:400;line-height:1.5;text-align:center;margin:0;">
      Lucas Senechal &middot; The Daily Briefing<br>
      You're receiving this because you subscribed at lucassenechal.com
    </p>
  </div>
</body>
</html>`
}

// ============================================================
// HTML Escape Utility
// ============================================================
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ============================================================
// Main Edge Function Handler
// ============================================================
Deno.serve(async (_req) => {
  const startTime = Date.now()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)
  const emailLinkSecret = Deno.env.get('EMAIL_LINK_SECRET')!

  try {
    // Step 1: Check warm-up daily limit
    const { data: warmupConfig } = await supabase
      .from('warm_up_config')
      .select('daily_send_limit, is_active')
      .single()

    if (!warmupConfig?.is_active) {
      return new Response(JSON.stringify({ status: 'warm_up_paused' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Count sends today
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const { count: sentToday } = await supabase
      .from('send_log')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', todayStart.toISOString())
      .in('status', ['sent', 'delivered', 'pending'])

    const remainingQuota = Math.max(0, (warmupConfig.daily_send_limit || 50) - (sentToday || 0))

    if (remainingQuota === 0) {
      return new Response(JSON.stringify({ status: 'daily_limit_reached' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Step 2: Read batch from pgmq (limited by remaining quota)
    const batchSize = Math.min(MAX_BATCH_SIZE, remainingQuota)
    const { data: messages, error: readError } = await supabase.rpc('pgmq_read', {
      queue_name: 'email_delivery',
      vt: VISIBILITY_TIMEOUT,
      qty: batchSize,
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

    // Step 3: Process each message
    let sent = 0, skipped = 0, failed = 0

    for (const msg of messages) {
      const { subscriber_id, research_date, retry_count } = msg.message

      try {
        // 3a. Fetch subscriber data
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('id, email, status')
          .eq('id', subscriber_id)
          .single()

        if (!subscriber || subscriber.status !== 'active') {
          // Skip inactive/unsubscribed subscribers
          await supabase.rpc('pgmq_archive', { queue_name: 'email_delivery', msg_id: msg.msg_id })
          await supabase.from('send_log').insert({
            subscriber_id,
            subject: 'N/A',
            format: 'digest',
            status: 'skipped',
            error: `Subscriber status: ${subscriber?.status || 'not found'}`,
          })
          skipped++
          continue
        }

        // 3b. Fetch newsletter content for this date
        const researchDate = research_date || new Date().toISOString().split('T')[0]
        const { data: content } = await supabase
          .from('newsletter_content')
          .select('format, subject, content_json, is_partial, result_count')
          .eq('subscriber_id', subscriber_id)
          .eq('research_date', researchDate)
          .single()

        // 3c. Determine format and build HTML
        let format = content?.format || 'fallback'
        let subject = content?.subject || 'Your Daily Briefing'
        let html: string

        // Generate HMAC tokens for unsubscribe and preferences
        const unsubToken = await generateToken(subscriber_id, 'unsubscribe', emailLinkSecret)
        const unsubscribeUrl = `https://lucassenechal.com/api/unsubscribe?s=${subscriber_id}&t=${unsubToken}`
        const prefToken = await generateToken(subscriber_id, 'preferences', emailLinkSecret)
        const preferencesUrl = `https://lucassenechal.com/preferences?s=${subscriber_id}&t=${prefToken}`
        const feedbackBaseUrl = 'https://lucassenechal.com/api/feedback'

        // Determine CTA level based on engagement (opens in last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { count: clickCount } = await supabase
          .from('send_log')
          .select('*', { count: 'exact', head: true })
          .eq('subscriber_id', subscriber_id)
          .not('opened_at', 'is', null)
          .gte('sent_at', sevenDaysAgo)

        const { count: feedbackCount } = await supabase
          .from('subscriber_feedback')
          .select('*', { count: 'exact', head: true })
          .eq('subscriber_id', subscriber_id)
          .gte('created_at', sevenDaysAgo)

        const ctaLevel = getCtaLevel({ clickCount: clickCount || 0, feedbackCount: feedbackCount || 0 })

        if (!content || content.result_count === 0) {
          // Fallback: no content or insufficient results
          format = 'fallback'
          subject = 'Your briefing is light today'
          html = buildFallbackHtml(subscriber_id, preferencesUrl, unsubscribeUrl)
        } else {
          // Generate feedback tokens using ACTUAL ITEM URLs (not indices)
          const feedbackTokens: string[] = []
          if (format === 'briefing') {
            for (const section of (content.content_json as { sections?: Array<{ sourceUrls?: string[]; heading: string }> }).sections || []) {
              const sectionUrl = section.sourceUrls?.[0] || section.heading
              feedbackTokens.push(await generateToken(subscriber_id, `feedback:${sectionUrl}`, emailLinkSecret))
            }
          } else {
            for (const item of (content.content_json as { items?: Array<{ url: string }> }).items || []) {
              feedbackTokens.push(await generateToken(subscriber_id, `feedback:${item.url}`, emailLinkSecret))
            }
          }

          switch (format) {
            case 'digest':
              html = buildDigestHtml(
                content.content_json as Parameters<typeof buildDigestHtml>[0],
                subscriber_id,
                unsubscribeUrl,
                preferencesUrl,
                feedbackBaseUrl,
                feedbackTokens,
                ctaLevel
              )
              break
            case 'briefing':
              html = buildBriefingHtml(
                content.content_json as Parameters<typeof buildBriefingHtml>[0],
                subscriber_id,
                unsubscribeUrl,
                preferencesUrl,
                feedbackBaseUrl,
                feedbackTokens,
                ctaLevel
              )
              break
            case 'mixed':
              html = buildMixedHtml(
                content.content_json as Parameters<typeof buildMixedHtml>[0],
                subscriber_id,
                unsubscribeUrl,
                preferencesUrl,
                feedbackBaseUrl,
                feedbackTokens,
                ctaLevel
              )
              break
            default:
              html = buildFallbackHtml(subscriber_id, preferencesUrl, unsubscribeUrl)
              format = 'fallback'
              subject = 'Your briefing is light today'
          }
        }

        // 3d. Send via Resend with RFC 8058 compliance headers
        const { data: sendResult, error: sendError } = await resend.emails.send({
          from: 'Lucas Senechal <newsletter@lucassenechal.com>',
          to: subscriber.email,
          subject: subject,
          html: html!,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        })

        if (sendError) {
          throw new Error((sendError as { message?: string }).message || 'Resend send failed')
        }

        // 3e. Log successful send
        await supabase.from('send_log').insert({
          subscriber_id,
          resend_id: sendResult?.id || null,
          subject,
          format,
          status: 'sent',
        })

        // 3f. Archive message from queue
        await supabase.rpc('pgmq_archive', { queue_name: 'email_delivery', msg_id: msg.msg_id })
        sent++

        // 3g. Enqueue SMS delivery for opted-in subscribers (SMS-03)
        // SMS fires 5 minutes after email per locked decision
        try {
          const { data: smsPrefs } = await supabase
            .from('subscriber_preferences')
            .select('sms_opt_in, phone')
            .eq('subscriber_id', subscriber_id)
            .single()

          if (smsPrefs?.sms_opt_in && smsPrefs?.phone) {
            await supabase.rpc('pgmq_send', {
              queue_name: 'sms_delivery',
              msg: JSON.stringify({
                subscriber_id: subscriber_id,
                research_date: researchDate,
                enqueued_at: new Date().toISOString(),
                retry_count: 0,
              }),
            })
          }
        } catch (smsErr) {
          // Fire-and-forget: SMS enqueue failure must not block email delivery
          console.error('[email-delivery] SMS enqueue error:', smsErr)
        }

        // 3h. Rate limit: 500ms delay between sends (Resend 2 req/s limit)
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        failed++
        const errorMsg = error instanceof Error ? error.message : String(error)

        // Log failed send
        await supabase.from('send_log').insert({
          subscriber_id,
          subject: 'Failed to send',
          format: 'digest',
          status: 'failed',
          error: errorMsg,
        })

        // Dead-letter after MAX_RETRIES — archive the message so it doesn't loop forever
        if ((retry_count || 0) >= MAX_RETRIES) {
          await supabase.rpc('pgmq_archive', { queue_name: 'email_delivery', msg_id: msg.msg_id })
        }
        // Otherwise, visibility timeout expires and message becomes available for retry
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
