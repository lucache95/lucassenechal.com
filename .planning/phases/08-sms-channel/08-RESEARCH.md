# Phase 8: SMS Channel - Research

**Researched:** 2026-03-22
**Domain:** Twilio Programmable Messaging, TCPA Compliance, Conversational AI via SMS
**Confidence:** HIGH

## Summary

Phase 8 adds SMS functionality to the newsletter platform: opted-in subscribers receive daily SMS summaries of their newsletter, can ask follow-up questions about their report via two-way text conversation, and can update preferences via natural language text. The implementation uses Twilio's Programmable Messaging API with a toll-free number, a Next.js API route for inbound SMS webhook handling, and a Supabase Edge Function for outbound SMS delivery.

The project already has `sms_opt_in` and `phone` fields in `subscriber_preferences`, phone validation (E.164 format) in `lib/schemas/preferences.ts` and `lib/schemas/onboarding.ts`, and an SMS toggle UI in `components/preferences/preference-sections.tsx`. The remaining work is: Twilio integration for sending/receiving, SMS summary generation, conversational AI for follow-ups and preference updates, new DB tables for SMS logging and conversations, and quiet hours enforcement.

**Primary recommendation:** Use Twilio's REST API directly via `fetch()` in the Edge Function (Deno runtime cannot use the `twilio` npm SDK reliably) for outbound SMS. Use a Next.js API route with the `twilio` npm SDK for inbound webhook validation and TwiML responses. Use `@ai-sdk/anthropic` with `claude-haiku-4-5` for conversational AI (SMS summary generation and two-way conversation).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Toll-free number -- faster approval than A2P 10DLC (days vs weeks), sufficient for low-volume personalized SMS. A2P 10DLC can be added later if volume justifies
- Store consent timestamp + IP in `subscriber_preferences` -- two new columns (`sms_consent_at`, `sms_consent_ip`), collected at opt-in time
- Quiet hours enforced per-subscriber timezone from `subscriber_preferences` -- no sends before 8am or after 9pm in their local timezone
- Twilio's built-in Advanced Opt-Out handles STOP/START/HELP keywords at platform level, plus webhook notification to update `sms_opt_in` in our DB
- SMS summary is 3-5 bullet points with top findings from their newsletter, plus a link to the full email in browser. ~300 chars max per SMS segment
- Delivery timing piggybacks on email delivery time -- send SMS 5 minutes after email, using the same `delivery_time` preference (morning/afternoon/evening)
- Claude Haiku generates SMS summaries -- takes generated newsletter content and compresses to SMS-length bullets
- 1 SMS per subscriber per day max -- enforced via `sms_send_log` table with daily unique constraint
- Claude Haiku for conversation -- fast, cheap, good at following instructions for short conversational replies. System prompt includes subscriber's latest newsletter content as context
- Natural language intent detection for preference updates -- parse intents like "add local events", "stop crypto", "switch to morning" and map to DB updates. Confirm changes back via SMS
- Last 5 messages in session stored in `sms_conversations` table, reset daily. Keeps context for follow-ups without unbounded growth
- Friendly fallback for unparseable intent -- "I didn't quite get that. Try asking about your newsletter or say HELP for options."

### Claude's Discretion
- Twilio SDK integration patterns and webhook structure
- SMS conversation table schema design
- Edge Function vs API route for Twilio webhook handler
- SMS summary prompt engineering

### Deferred Ideas (OUT OF SCOPE)
- A2P 10DLC registration -- evaluate after volume justifies (toll-free sufficient for launch)
- MMS support (images/rich media in SMS) -- text-only for v1
- SMS analytics dashboard -- defer to future milestone
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SMS-01 | Twilio integration with A2P 10DLC registration | Toll-free number chosen instead (faster approval). Twilio REST API for Deno Edge Function outbound; `twilio` npm SDK for Next.js inbound webhook. Toll-free verification required with BRN (EIN for US businesses). |
| SMS-02 | TCPA-compliant opt-in with documented consent | Store `sms_consent_at` timestamp and `sms_consent_ip` in subscriber_preferences. Existing `sms_opt_in` boolean + `phone` fields already exist. Must include clear disclosure text at opt-in. |
| SMS-03 | SMS summary of daily report for opted-in subscribers | Edge Function triggers SMS 5 min after email. Claude Haiku 4.5 via AI SDK compresses newsletter content_json to 3-5 bullet points (~300 chars). Full email link appended. |
| SMS-04 | Two-way conversational AI -- follow-up questions | Next.js API route receives Twilio webhook. Claude Haiku 4.5 answers questions using subscriber's latest newsletter content as context. Last 5 messages tracked in sms_conversations table. |
| SMS-05 | Preference updates via text message | Natural language intent detection via Claude Haiku 4.5 with structured output. Maps to DB updates on subscriber_preferences/subscriber_topics. Confirms changes via reply SMS. |
| SMS-06 | STOP/opt-out handling and quiet-hours enforcement | Twilio Advanced Opt-Out handles STOP/START/HELP at platform level. OptOutType webhook parameter updates sms_opt_in in DB. Quiet hours: no sends before 8am or after 9pm in subscriber's timezone. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| twilio | 5.13.0 | Inbound SMS webhook validation + TwiML responses (Next.js API route) | Official Twilio Node.js SDK; provides `validateRequest` and `MessagingResponse` for secure webhook handling |
| @ai-sdk/anthropic | ^3.0.46 | Claude Haiku 4.5 for SMS summary generation and conversational AI | Already in project deps; AI SDK v6 pattern with `generateText` + `Output.object` established |
| ai | ^6.0.97 | Vercel AI SDK core for structured output generation | Already in project deps; used throughout for generateText/Output.object patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | ^2.97.0 | Database access for SMS tables | Already in deps; used in Edge Functions and API routes |
| zod | ^4.3.6 | Schema validation for webhook payloads and intent parsing | Already in deps; SMS intent schemas, webhook validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Twilio REST API (fetch) in Edge Function | twilio npm SDK in Edge Function | SDK does not reliably work in Deno runtime; raw fetch with basic auth is simpler and proven |
| Claude Haiku 4.5 | Gemini 2.5 Flash | Project already uses Gemini in Edge Functions; Haiku is a locked decision from CONTEXT.md. Use Haiku via direct Anthropic API in Deno Edge Function (npm:@anthropic-ai/sdk@0 import) |
| twilio npm SDK for inbound | Raw signature validation | SDK provides battle-tested validateRequest; rolling your own HMAC-SHA1 is error-prone |

**Installation:**
```bash
npm install twilio
```

Note: `twilio` is the only new dependency. All others are already installed.

**Version verification:**
- twilio: 5.13.0 (verified via `npm view twilio version` on 2026-03-22)
- @ai-sdk/anthropic: ^3.0.46 (already installed)
- ai: ^6.0.97 (already installed)

## Architecture Patterns

### Recommended Project Structure
```
app/
  api/
    webhooks/
      twilio/
        route.ts          # Inbound SMS webhook handler (POST)
supabase/
  functions/
    sms-delivery/
      index.ts            # Outbound SMS Edge Function
  migrations/
    008_sms_channel.sql   # SMS tables + pgmq queue + pg_cron trigger
lib/
  sms/
    twilio-client.ts      # Twilio REST API helper (used in Edge Function via inlining)
    sms-summary.ts        # SMS summary generation prompt + logic
    intent-parser.ts      # Natural language intent detection schemas
    quiet-hours.ts        # Timezone-aware quiet hours check
```

### Pattern 1: Outbound SMS via Supabase Edge Function
**What:** Dedicated Edge Function that reads from a pgmq queue and sends SMS via Twilio REST API (raw fetch, not SDK).
**When to use:** Triggered by pg_cron or by email-delivery Edge Function after sending email.
**Why Edge Function:** Matches established pattern (research-pipeline, content-generation, email-delivery). SMS sending is background processing, not user-facing.

```typescript
// supabase/functions/sms-delivery/index.ts (Deno runtime)
// Pattern: direct Twilio REST API via fetch (no SDK needed in Deno)

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!

async function sendSms(to: string, body: string): Promise<{ sid: string; status: string }> {
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
```

### Pattern 2: Inbound SMS Webhook via Next.js API Route
**What:** API route at `/api/webhooks/twilio` that receives inbound SMS, validates the Twilio signature, processes the message (conversational AI or preference update), and returns TwiML.
**When to use:** Every time a subscriber texts the Twilio number.
**Why API route (not Edge Function):** Twilio requires a synchronous TwiML response within 15 seconds. Next.js API routes can use the `twilio` npm SDK for signature validation and TwiML generation. Must respond with `text/xml` content type.

```typescript
// app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const { validateRequest } = twilio

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const signature = request.headers.get('x-twilio-signature') || ''

  // Read form data (Twilio sends application/x-www-form-urlencoded)
  const formData = await request.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => { params[key] = value.toString() })

  // Validate signature
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio`
  const isValid = validateRequest(authToken, signature, url, params)

  if (!isValid) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params.From       // Subscriber's phone number (E.164)
  const body = params.Body       // Message text
  const optOutType = params.OptOutType  // STOP/START/HELP (if Advanced Opt-Out triggered)

  // Handle opt-out/opt-in webhook notifications
  if (optOutType === 'STOP') {
    // Update sms_opt_in = false in subscriber_preferences
    // Twilio already sent the STOP confirmation -- do NOT reply
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  if (optOutType === 'START') {
    // Update sms_opt_in = true in subscriber_preferences
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  // Process message (conversational AI or preference update)
  const reply = await processInboundSms(from, body)

  // Return TwiML response
  const twiml = `<Response><Message>${escapeXml(reply)}</Message></Response>`
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
```

### Pattern 3: SMS Summary Generation with Claude Haiku 4.5
**What:** Takes newsletter content_json and compresses to 3-5 bullet points for SMS.
**When to use:** In the sms-delivery Edge Function before sending.

```typescript
// SMS summary generation (inlined in Edge Function)
// Uses Anthropic SDK directly in Deno (AI SDK pattern)

const { Anthropic } = await import('npm:@anthropic-ai/sdk@0')

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

async function generateSmsSummary(contentJson: unknown, format: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: `You compress newsletter content into an SMS summary.
Rules:
- 3-5 bullet points, each one sentence
- Total under 300 characters (fits 2 SMS segments max)
- Start each bullet with a dash and space
- No links in bullets (link goes at the end)
- Be specific and informative, not vague
- Write in present tense`,
    messages: [{
      role: 'user',
      content: `Summarize this ${format} newsletter content for SMS:\n\n${JSON.stringify(contentJson)}`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

### Pattern 4: Conversational AI Intent Detection
**What:** Parse inbound SMS for intent (question about report, preference update, or unknown).
**When to use:** In the webhook handler for every non-keyword inbound message.

```typescript
// Intent detection schema (Zod)
import { z } from 'zod'

const smsIntentSchema = z.object({
  intent: z.enum(['question', 'preference_update', 'unknown']),
  // For preference_update intent:
  preferenceAction: z.optional(z.object({
    field: z.enum(['topics_add', 'topics_remove', 'delivery_time', 'format']),
    value: z.string(),
  })),
  // For question intent:
  questionContext: z.optional(z.string()),
})
```

### Pattern 5: Quiet Hours Enforcement
**What:** Check subscriber's timezone before sending SMS. No sends before 8am or after 9pm local time.
**When to use:** In sms-delivery Edge Function before sending each SMS.

```typescript
function isWithinQuietHours(timezone: string): boolean {
  const now = new Date()
  // Get current hour in subscriber's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  })
  const localHour = parseInt(formatter.format(now), 10)
  // Quiet hours: before 8am or after 9pm (21:00)
  return localHour < 8 || localHour >= 21
}
```

### Anti-Patterns to Avoid
- **Using twilio npm SDK in Deno Edge Functions:** The SDK relies on Node.js APIs not available in Deno. Use raw fetch with basic auth instead.
- **Sending a reply after STOP:** Twilio's Advanced Opt-Out already sends the confirmation. Sending another message violates TCPA and confuses subscribers. Return empty TwiML.
- **Storing unbounded conversation history:** The decision limits to 5 messages per day per subscriber. Without this cap, storage grows linearly and context windows bloat.
- **Hardcoding timezone offsets:** Use `Intl.DateTimeFormat` for timezone conversion. Hardcoded offsets break during DST transitions.
- **Blocking the webhook handler on AI generation:** Twilio expects a response within 15 seconds. If AI generation takes longer, the webhook times out and Twilio retries (causing duplicate processing).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature validation | Custom HMAC-SHA1 implementation | `twilio.validateRequest()` | URL encoding edge cases, parameter ordering, and proxy URL rewriting make DIY validation fragile |
| STOP/START/HELP handling | Custom keyword matching and reply logic | Twilio Advanced Opt-Out | Platform handles it automatically, sends confirmation, and notifies via OptOutType webhook param |
| SMS segment counting | Character counting with GSM-7 / UCS-2 detection | Keep messages under 160 chars when possible; Twilio auto-segments | GSM-7 encoding allows 160 chars, UCS-2 (unicode) only 70; let Twilio handle segmentation |
| Phone number formatting | Regex-based E.164 conversion | Existing Zod E.164 validation in `lib/schemas/preferences.ts` | Already built and tested in the onboarding flow |
| Opt-out compliance tracking | Custom consent management system | Twilio's built-in compliance + DB flag update on webhook | Twilio maintains its own opt-out list and blocks messages to opted-out numbers |

**Key insight:** Twilio handles the hardest compliance problems (STOP keyword processing, message delivery, carrier filtering) at the platform level. Our job is to store consent records, respect quiet hours, and sync our DB state with Twilio's webhook notifications.

## Common Pitfalls

### Pitfall 1: Twilio Webhook URL Must Be Exact
**What goes wrong:** Signature validation fails because the URL used for validation doesn't match the URL Twilio used to make the request (proxy rewrites, missing trailing slash, etc.).
**Why it happens:** Next.js behind a reverse proxy (Railway, Vercel) may rewrite URLs. Twilio signs against the exact URL it called.
**How to avoid:** Use an environment variable `NEXT_PUBLIC_SITE_URL` for the webhook URL. Ensure it matches what's configured in Twilio Console exactly (including protocol, path, no trailing slash).
**Warning signs:** All webhook requests return 403 despite correct auth token.

### Pitfall 2: Twilio Sends application/x-www-form-urlencoded
**What goes wrong:** Next.js API route tries to parse JSON body and gets empty object.
**Why it happens:** Twilio webhooks POST form-encoded data, not JSON. Default `request.json()` fails silently.
**How to avoid:** Use `request.formData()` or parse the URL-encoded body manually. The `twilio` SDK's `validateRequest` expects an object of string key-value pairs.
**Warning signs:** `params.Body` is undefined, `params.From` is undefined.

### Pitfall 3: Claude 3.5 Haiku is Deprecated
**What goes wrong:** API calls to `claude-3-5-haiku-20241022` fail with model not found error.
**Why it happens:** Claude 3 Haiku retired Feb 19, 2026. Claude 3.5 Haiku also retired same date. The existing codebase uses `claude-3-5-haiku-20241022` in `app/api/intake/next-question/route.ts`.
**How to avoid:** Use `claude-haiku-4-5` (alias) or `claude-haiku-4-5-20251001` (pinned) for all new Claude Haiku calls. Consider updating the intake route as well.
**Warning signs:** 404 or "model not found" errors from Anthropic API.

### Pitfall 4: 15-Second Webhook Timeout
**What goes wrong:** Twilio retries the webhook because the AI response took too long, causing duplicate messages.
**Why it happens:** Claude Haiku can take 2-5 seconds; if combined with DB lookups and multiple Supabase calls, total time approaches 15 seconds.
**How to avoid:** Keep the critical path lean: look up subscriber, fetch last 5 conversation messages, call Claude, respond. Use AbortController with 10-second timeout. Have a fast fallback response: "Let me think about that. I'll text you back shortly."
**Warning signs:** Subscribers receive duplicate replies.

### Pitfall 5: Toll-Free Verification is Now Mandatory
**What goes wrong:** SMS messages to US/Canada recipients are blocked or filtered.
**Why it happens:** Since late 2024, unverified toll-free numbers cannot send SMS. As of Jan 2026, BRN (EIN for US businesses) is mandatory for verification submissions.
**How to avoid:** Submit toll-free verification through Twilio Console immediately after purchasing the number. Provide business name, EIN, use case description ("personalized newsletter summaries + conversational follow-ups"), and sample messages.
**Warning signs:** Messages queued but never delivered; Twilio dashboard shows "unverified" status.

### Pitfall 6: SMS Consent Documentation
**What goes wrong:** TCPA violation risk if consent records are incomplete.
**Why it happens:** Simply storing `sms_opt_in = true` is insufficient. TCPA requires proof of when and how consent was obtained.
**How to avoid:** Store `sms_consent_at` (timestamp), `sms_consent_ip` (IP address from request), and ensure the opt-in checkbox includes proper disclosure text: "By checking this box, you agree to receive automated text messages from The Daily Briefing. Message and data rates may apply. Reply STOP to unsubscribe."
**Warning signs:** No timestamp/IP on consent records; missing disclosure text on opt-in form.

### Pitfall 7: Deno Edge Function Cannot Import from lib/
**What goes wrong:** Edge Function fails with import resolution errors.
**Why it happens:** Supabase Edge Functions run in Deno, which cannot resolve `@/lib/` path aliases or import from the Next.js project's lib directory.
**How to avoid:** Inline all logic in the Edge Function file. This is the established pattern (research-pipeline, content-generation, email-delivery all inline their logic).
**Warning signs:** `Module not found` errors when deploying Edge Functions.

## Code Examples

### SMS Delivery Edge Function Trigger (from email-delivery)
```typescript
// In email-delivery/index.ts, after successfully sending email:
// Enqueue SMS delivery 5 minutes later via pgmq

await supabase.rpc('pgmq_send', {
  queue_name: 'sms_delivery',
  msg: JSON.stringify({
    subscriber_id: subscriber_id,
    research_date: researchDate,
    enqueued_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min delay
    retry_count: 0,
  }),
})
```

### SMS Send Log Table with Daily Unique Constraint
```sql
CREATE TABLE sms_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  twilio_sid TEXT,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered')),
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Daily unique constraint for outbound (1 SMS summary per day per subscriber)
CREATE UNIQUE INDEX idx_sms_daily_outbound
  ON sms_send_log (subscriber_id, (sent_at::date))
  WHERE direction = 'outbound';
```

### SMS Conversations Table
```sql
CREATE TABLE sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_sms_conversations_session
  ON sms_conversations (subscriber_id, session_date, created_at);
```

### Consent Columns on subscriber_preferences
```sql
ALTER TABLE subscriber_preferences
  ADD COLUMN sms_consent_at TIMESTAMPTZ,
  ADD COLUMN sms_consent_ip TEXT;
```

### Twilio Webhook Validation in Next.js App Router
```typescript
// app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const signature = request.headers.get('x-twilio-signature') || ''

  // Parse form-encoded body
  const body = await request.text()
  const params: Record<string, string> = {}
  new URLSearchParams(body).forEach((value, key) => {
    params[key] = value
  })

  // Build the URL Twilio used (must match Console config exactly)
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio`

  if (!twilio.validateRequest(authToken, signature, webhookUrl, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ... process message
}
```

### Full Email-in-Browser Link Generation
```typescript
// Generate a secure link to view the newsletter in browser
// Reuses existing HMAC token pattern from lib/email/token.ts
const viewToken = await generateToken(subscriberId, 'view-email', emailLinkSecret)
const viewInBrowserUrl = `https://lucassenechal.com/newsletter/view?s=${subscriberId}&d=${researchDate}&t=${viewToken}`
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| A2P 10DLC for SMS compliance | Toll-free verification (for low volume) | 2024+ | Faster approval (days vs weeks), simpler setup, sufficient for <1000 msg/day |
| Claude 3 Haiku / 3.5 Haiku | Claude Haiku 4.5 (`claude-haiku-4-5`) | Oct 2025 release, old models retired Feb 2026 | Must use `claude-haiku-4-5`; old model IDs return errors |
| twilio npm SDK v4 | twilio npm SDK v5 (5.13.0) | 2024 | v5 is current; includes TypeScript types, async patterns |
| TCPA 30-day opt-out window | TCPA 10-business-day opt-out window | April 11, 2025 | Must honor opt-out within 10 business days (Twilio handles immediately via Advanced Opt-Out) |
| EIN optional for toll-free verification | EIN (BRN) mandatory | Jan 2026 | Must provide business EIN when submitting toll-free verification |

**Deprecated/outdated:**
- `claude-3-haiku-20240307`: Deprecated, retired April 19, 2026
- `claude-3-5-haiku-20241022`: Retired February 19, 2026 (currently used in `app/api/intake/next-question/route.ts` -- should be updated)
- A2P 10DLC: Not deprecated but deferred per user decision; toll-free is sufficient for launch volume

## Open Questions

1. **View-in-browser page for newsletter**
   - What we know: SMS summary includes a link to "full email in browser." This requires a page that renders the newsletter content.
   - What's unclear: Does this page already exist? The email-delivery Edge Function generates HTML but there's no web-accessible page to view past newsletters.
   - Recommendation: Create a minimal `/newsletter/view` page that fetches newsletter_content by subscriber_id + research_date and renders it. Secure with HMAC token (same pattern as preferences page).

2. **Delayed SMS delivery (5 minutes after email)**
   - What we know: pgmq supports immediate message sending. The decision says SMS fires 5 min after email.
   - What's unclear: pgmq does not natively support delayed messages. Need to implement delay.
   - Recommendation: Two options: (a) Use pgmq `send_delay` parameter if available, or (b) store `scheduled_at` timestamp in the message payload and have the Edge Function check it, re-queueing messages that aren't ready yet. Option (b) is simpler and matches existing patterns.

3. **Twilio number purchase and verification timing**
   - What we know: Toll-free verification takes days (not weeks like A2P 10DLC). EIN is mandatory since Jan 2026.
   - What's unclear: Exact lead time for current verification queue.
   - Recommendation: Purchase toll-free number and submit verification as the very first step. Development can proceed in parallel using Twilio test credentials.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SMS-01 | Twilio REST API send function works | unit | `npx vitest run lib/sms/twilio-client.test.ts -x` | Wave 0 |
| SMS-02 | Consent timestamp/IP stored on opt-in | unit | `npx vitest run lib/sms/consent.test.ts -x` | Wave 0 |
| SMS-03 | SMS summary generation produces valid output | unit | `npx vitest run lib/sms/sms-summary.test.ts -x` | Wave 0 |
| SMS-04 | Conversational AI returns relevant reply | unit | `npx vitest run lib/sms/conversation.test.ts -x` | Wave 0 |
| SMS-05 | Intent parser detects preference update intents | unit | `npx vitest run lib/sms/intent-parser.test.ts -x` | Wave 0 |
| SMS-06 | Quiet hours check respects timezone | unit | `npx vitest run lib/sms/quiet-hours.test.ts -x` | Wave 0 |
| SMS-06 | STOP webhook updates sms_opt_in | integration | Manual -- requires Twilio test webhook | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/sms/ --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `lib/sms/twilio-client.test.ts` -- covers SMS-01 (Twilio API call mocking)
- [ ] `lib/sms/sms-summary.test.ts` -- covers SMS-03 (summary generation with mocked AI)
- [ ] `lib/sms/intent-parser.test.ts` -- covers SMS-05 (intent parsing schemas)
- [ ] `lib/sms/quiet-hours.test.ts` -- covers SMS-06 (timezone-aware quiet hours)
- [ ] `lib/sms/conversation.test.ts` -- covers SMS-04 (conversation context management)
- [ ] `lib/sms/consent.test.ts` -- covers SMS-02 (consent record validation)

## Sources

### Primary (HIGH confidence)
- [Twilio Programmable Messaging Quickstart - Node.js](https://www.twilio.com/docs/sms/quickstart/node) -- SDK setup, message creation
- [Twilio Messages REST API Resource](https://www.twilio.com/docs/sms/api/message-resource) -- REST endpoint, parameters, authentication
- [Twilio Webhook Security](https://www.twilio.com/docs/usage/webhooks/webhooks-security) -- validateRequest, signature validation
- [Twilio Advanced Opt-Out](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out) -- OptOutType webhook parameter, keyword handling
- [Twilio Toll-Free Verification Console Guide](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding) -- verification process, required info
- [Claude Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) -- Haiku 4.5 model ID: `claude-haiku-4-5-20251001`, pricing $1/$5 per MTok
- [Twilio SMS with Deno](https://www.twilio.com/en-us/blog/sending-sms-messages-deno-typescript-twilio-messaging) -- Raw fetch with basic auth pattern for Deno
- npm registry: twilio@5.13.0 (verified 2026-03-22)

### Secondary (MEDIUM confidence)
- [TCPA Compliance SMS Checklist 2025](https://www.voxie.com/blog/tcpa-compliance-checklist-sms/) -- consent requirements, opt-out timeline changes
- [Twilio Toll-Free Verification Policy](https://www.twilio.com/en-us/blog/toll-free-verification-policy) -- BRN/EIN requirements as of Jan 2026
- [Next.js + Twilio Inbound SMS](https://www.sent.dm/resources/twilio-node-js-next-js-inbound-two-way-messaging) -- App Router webhook pattern

### Tertiary (LOW confidence)
- None -- all findings verified with primary/secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Twilio SDK well-documented; project patterns established; Claude model IDs verified against official docs
- Architecture: HIGH -- Follows established project patterns (Edge Functions for background processing, API routes for webhooks, pgmq for queuing)
- Pitfalls: HIGH -- Common Twilio integration issues well-documented; TCPA requirements verified with multiple legal/compliance sources
- Model deprecation: HIGH -- Verified directly against Anthropic's model overview page (Claude 3.5 Haiku retired Feb 19, 2026)

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (Twilio SDK and Anthropic models are stable; TCPA rules already in effect)
