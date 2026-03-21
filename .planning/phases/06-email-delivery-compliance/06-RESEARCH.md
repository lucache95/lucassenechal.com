# Phase 6: Email Delivery & Compliance - Research

**Researched:** 2026-03-21
**Domain:** Email delivery (Resend API), React Email templates, compliance (CAN-SPAM/GDPR), deliverability, admin dashboard
**Confidence:** HIGH

## Summary

Phase 6 bridges the content generation pipeline (Phase 5) to subscriber inboxes. The project already has Resend SDK v6.9.2 installed and three working React Email templates (`welcome-template.tsx`, `plan-delivery.tsx`, `intake-notification.tsx`) that establish the design language. The phase requires building 4 newsletter email templates (digest, briefing, mixed, fallback), a delivery orchestration Edge Function, API endpoints for feedback/unsubscribe, webhook processing for deliverability monitoring, a domain warm-up strategy, and an admin dashboard at `/admin`.

The existing codebase follows a clear pattern: pg_cron triggers enqueue, pgmq distributes work, Edge Functions process jobs. Phase 6 extends this pipeline with a new `email-delivery` Edge Function that reads from `newsletter_content`, renders templates, and sends via Resend. Content is already stored as structured JSON in `newsletter_content.content_json` with known shapes (DigestContent, BriefingContent, MixedContent) from Phase 5. The rendering layer consumes this JSON and produces email HTML.

**Primary recommendation:** Build the delivery pipeline as a Supabase Edge Function following the existing research-pipeline pattern (pgmq queue, per-subscriber processing, run logging). Use Resend's `headers` parameter for List-Unsubscribe/List-Unsubscribe-Post headers. Use HMAC-SHA256 tokens for secure unsubscribe/feedback/preference links. Start domain warm-up at 50 emails/day, increase 50% every 3 days.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MAIL-01 | Daily personalized emails via Resend | Resend SDK v6.9.2 already installed; Edge Function delivery pipeline with per-subscriber scheduling |
| MAIL-02 | 3 responsive email templates matching the 3 formats | React Email components (v1.0.8 installed), digest/briefing/mixed templates consuming Phase 5 JSON |
| MAIL-03 | Clean design matching website aesthetic, 60%+ text ratio | 560px max-width, system fonts, no images, inline styles -- existing template patterns |
| MAIL-04 | One-click unsubscribe in every email (CAN-SPAM/GDPR) | List-Unsubscribe + List-Unsubscribe-Post headers via Resend, HMAC token-secured links, API endpoint |
| MAIL-05 | SPF/DKIM/DMARC authentication setup | DNS records for Resend domain verification -- manual configuration step |
| MAIL-06 | Domain warm-up strategy (graduated volume over 4-6 weeks) | Start 50/day, increase 50% every 3 days; daily_send_limit column; warm-up config |
| MAIL-07 | Preference update link in every email | HMAC-signed link to `/preferences?s={id}&t={token}` in email footer |
| MAIL-08 | Per-subscriber delivery time scheduling | delivery_time from subscriber_preferences (morning/afternoon/evening) mapped to pg_cron windows |
| MAIL-09 | Deliverability monitoring (open rates, bounces, spam complaints) | Resend webhooks for email.delivered/bounced/complained/opened; send_log table |
| MAIL-10 | Soft CTA + engagement-triggered stronger CTAs | Engagement tracking in send_log; CTA escalation logic per UI-SPEC thresholds |
| FDBK-01 | "More like this / Less like this" links per item | HMAC-signed feedback links, API endpoint, subscriber_feedback table |
| OPS-03 | Admin view -- subscriber list, last send status, error traces | Server Component at `/admin` with Supabase service_role queries, per UI-SPEC layout |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | 6.9.4 (installed: ^6.9.2) | Email delivery API | Already installed in project; official SDK for Resend transactional email |
| @react-email/components | 1.0.10 (installed: ^1.0.8) | Email template components | Already installed; provides Html, Body, Container, Text, Link, Hr, Section, Heading |
| @react-email/render | 2.0.4 (installed: ^2.0.4) | Render React Email to HTML string | Already installed; used in Edge Function to convert JSX to HTML for Resend API |
| @supabase/supabase-js | 2.x (installed: ^2.97.0) | Database access, Edge Function client | Already used throughout project for all DB operations |
| zod | 4.x (installed: ^4.3.6) | Schema validation for API endpoints | Already used throughout project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| crypto (Node.js built-in) | N/A | HMAC-SHA256 token generation | Unsubscribe/feedback/preference link tokens |
| Supabase Edge Functions | Deno runtime | Delivery orchestration | Email send pipeline (matches research-pipeline pattern) |
| pgmq | Supabase extension | Message queue | Delivery job queue (matches existing pattern) |
| pg_cron | Supabase extension | Scheduled triggers | Time-window-based delivery triggers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend batch API | Individual sends per subscriber | Batch limited to 100/call and does NOT support scheduled_at; individual sends give per-subscriber header customization |
| Edge Function for delivery | Next.js API route | Edge Function matches existing pipeline pattern, runs on Supabase infra, avoids Railway compute costs |
| HMAC tokens | JWT tokens | HMAC is simpler, no expiry management needed, lighter -- jwt-decode would add dependency |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

**Version verification:** All packages already in package.json. Current latest versions confirmed:
- resend: 6.9.4 (installed ^6.9.2, will resolve to latest compatible)
- @react-email/components: 1.0.10 (installed ^1.0.8)
- @react-email/render: 2.0.4 (installed ^2.0.4)

## Architecture Patterns

### Recommended Project Structure
```
lib/
  email/
    welcome-template.tsx          # existing
    plan-delivery.tsx             # existing
    intake-notification.tsx       # existing
    digest-template.tsx           # NEW: digest format newsletter
    briefing-template.tsx         # NEW: briefing format newsletter
    mixed-template.tsx            # NEW: mixed format newsletter
    fallback-template.tsx         # NEW: low-results fallback
    shared-styles.ts              # NEW: shared inline style constants
    token.ts                      # NEW: HMAC token generation/verification

app/
  api/
    feedback/
      route.ts                   # NEW: GET handler for feedback links
    unsubscribe/
      route.ts                   # NEW: GET (landing) + POST (RFC 8058 one-click)
    webhooks/
      resend/
        route.ts                 # NEW: Resend webhook handler
  (marketing)/
    admin/
      page.tsx                   # NEW: Admin dashboard (Server Component)

components/
  admin/
    subscriber-table.tsx         # NEW: sortable subscriber table
    send-status-badge.tsx        # NEW: colored status badges
    error-trace-panel.tsx        # NEW: expandable error details

supabase/
  migrations/
    007_email_delivery.sql       # NEW: send_log, subscriber_feedback, warm-up config
  functions/
    email-delivery/
      index.ts                   # NEW: delivery orchestration Edge Function
      deno.json                  # NEW: Deno config
```

### Pattern 1: Delivery Pipeline (Edge Function)
**What:** A Supabase Edge Function that reads newsletter_content, renders email HTML, and sends via Resend. Follows the exact same pattern as research-pipeline.
**When to use:** Daily email delivery orchestration.
**Example:**
```typescript
// Source: Existing research-pipeline/index.ts pattern
Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Read from pgmq email_delivery queue
  const { data: messages } = await supabase.rpc('pgmq_read', {
    queue_name: 'email_delivery',
    vt: 300, // 5 min visibility timeout
    qty: 50, // batch size
  })

  for (const job of messages) {
    const { subscriber_id, research_date } = job.message

    // 1. Fetch newsletter_content for this subscriber + date
    // 2. Fetch subscriber preferences (format, delivery_time)
    // 3. Render appropriate email template to HTML
    // 4. Send via Resend with compliance headers
    // 5. Log result to send_log table
    // 6. Archive pgmq message
  }
})
```

### Pattern 2: HMAC Token Security for Email Links
**What:** Generate HMAC-SHA256 tokens that encode subscriber_id + action, verifiable without database lookup.
**When to use:** All email links (unsubscribe, feedback, preference update).
**Example:**
```typescript
// lib/email/token.ts
import crypto from 'crypto'

const SECRET = process.env.EMAIL_LINK_SECRET!

export function generateToken(subscriberId: string, action: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(`${subscriberId}:${action}`)
    .digest('hex')
}

export function verifyToken(
  subscriberId: string,
  action: string,
  token: string
): boolean {
  const expected = generateToken(subscriberId, action)
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(expected, 'hex')
  )
}
```

### Pattern 3: Resend Send with Compliance Headers
**What:** Every email includes List-Unsubscribe and List-Unsubscribe-Post headers per RFC 8058.
**When to use:** Every newsletter email send.
**Example:**
```typescript
// Source: Resend docs (https://resend.com/docs/api-reference/emails/send-email)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const unsubscribeUrl = `https://lucassenechal.com/api/unsubscribe?s=${subscriberId}&t=${token}`

await resend.emails.send({
  from: 'Lucas Senechal <newsletter@lucassenechal.com>',
  to: subscriber.email,
  subject: content.subject,
  html: renderedHtml,
  headers: {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
})
```

### Pattern 4: React Email Template Structure
**What:** Newsletter templates follow the exact same structure as existing email templates, with inline styles and React Email components.
**When to use:** All 4 newsletter email templates.
**Example:**
```typescript
// Source: Existing welcome-template.tsx pattern
import { Html, Head, Body, Container, Heading, Text, Hr, Link, Section } from '@react-email/components'

interface DigestEmailProps {
  subscriberId: string
  greeting: string
  items: Array<{ title: string; summary: string; url: string; sourceName: string }>
  signoff: string
  unsubscribeUrl: string
  preferencesUrl: string
  feedbackBaseUrl: string
  ctaLevel: 'soft' | 'medium'
}

export function DigestEmail({ subscriberId, greeting, items, signoff, unsubscribeUrl, preferencesUrl, feedbackBaseUrl, ctaLevel }: DigestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: '#f8fafc', fontFamily: '...', margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '8px', margin: '40px auto', maxWidth: '560px', padding: '48px 32px' }}>
          {/* Content per UI-SPEC layout */}
        </Container>
      </Body>
    </Html>
  )
}
```

### Pattern 5: Webhook Event Processing
**What:** Next.js API route receives Resend webhooks for email events and updates send_log.
**When to use:** Deliverability monitoring.
**Example:**
```typescript
// app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const { type, data } = payload

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  switch (type) {
    case 'email.delivered':
      await supabase.from('send_log').update({ status: 'delivered' })
        .eq('resend_id', data.email_id)
      break
    case 'email.bounced':
      await supabase.from('send_log').update({ status: 'bounced', error: data.bounce?.message })
        .eq('resend_id', data.email_id)
      // Auto-pause after 3 consecutive bounces
      break
    case 'email.complained':
      // Auto-unsubscribe on spam complaint
      break
    case 'email.opened':
      await supabase.from('send_log').update({ opened_at: new Date().toISOString() })
        .eq('resend_id', data.email_id)
      break
  }

  return NextResponse.json({ received: true })
}
```

### Pattern 6: Admin Dashboard (Server Component)
**What:** Server Component that fetches data with service_role key, no client-side interactivity needed.
**When to use:** Admin page at /admin.
**Example:**
```typescript
// app/(marketing)/admin/page.tsx
import { createClient } from '@supabase/supabase-js'

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('*, subscriber_preferences(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Render table with subscriber data, send status, error traces
}
```

### Anti-Patterns to Avoid
- **Rendering React Email in client components:** `renderToStaticMarkup` throws in client bundles ("do not use legacy react-dom/server APIs"). All rendering must happen server-side.
- **Using batch API for personalized newsletters:** Resend batch API does NOT support `scheduled_at` and limits to 100 emails. Each newsletter has unique content, headers, and compliance links -- use individual sends.
- **Storing HMAC secrets in code:** Use environment variables (`EMAIL_LINK_SECRET`). Never hardcode.
- **Awaiting email sends in the main pipeline:** Use fire-and-forget pattern for webhook processing. Email sends in the Edge Function should use try/catch with logging, not blocking the queue processor.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email HTML rendering | String concatenation / template literals | React Email + @react-email/render | Email clients have bizarre rendering quirks; React Email handles Outlook, Gmail, Apple Mail compatibility |
| Email delivery + tracking | Direct SMTP or SES | Resend SDK | Rate limiting, bounce handling, delivery tracking, webhooks built in |
| Unsubscribe token security | Random UUIDs in database | HMAC-SHA256 tokens | Stateless verification, no DB lookup for link validation, timing-safe comparison |
| Domain warm-up tracking | Manual spreadsheet | Database column (daily_send_limit) + graduated increase logic | Automated, consistent, auditable |
| Email CSS inlining | PostCSS / custom inliner | React Email inline styles | React Email components already handle email client compatibility |

**Key insight:** Email delivery has more edge cases than any other part of the stack -- bounce types (hard vs soft), feedback loops, SPF alignment, DKIM signing, content filtering, image blocking, link rewriting by email clients. Resend handles all of this. The project should focus on content and compliance, not delivery infrastructure.

## Common Pitfalls

### Pitfall 1: Resend Rate Limits
**What goes wrong:** Hitting the 2 requests/second default rate limit when sending to many subscribers at once.
**Why it happens:** The Edge Function processes messages sequentially but sends happen fast.
**How to avoid:** Add a small delay between sends (500ms) in the Edge Function loop, or process in small batches with pauses. For v1 scale (<100 subscribers), this is unlikely to be an issue.
**Warning signs:** Resend returns 429 status codes; emails silently fail.

### Pitfall 2: React Email render() in Edge Functions (Deno)
**What goes wrong:** `@react-email/render` depends on `react-dom/server` which may not work in Deno runtime.
**Why it happens:** The package uses `renderToStaticMarkup` from react-dom, which is a Node.js API.
**How to avoid:** Two options: (1) render email HTML in the Next.js app and store it alongside content_json, or (2) use the Resend `react` parameter which handles rendering server-side. Since the Edge Function sends to Resend, and Resend's Node.js SDK `react` parameter is not available in Deno, the cleanest approach is to render email HTML during content generation (Phase 5 extension) or in a separate rendering step before the delivery Edge Function runs. Alternatively, the Edge Function can construct the HTML as a string using template literals with the content_json data, since the templates are structured and predictable.
**Warning signs:** Edge Function crashes with "renderToStaticMarkup is not defined" or react-dom import errors.

### Pitfall 3: Missing List-Unsubscribe-Post Header
**What goes wrong:** Gmail and Yahoo require RFC 8058 one-click unsubscribe for bulk senders (5,000+ daily emails to their domains). Without it, emails go to spam.
**Why it happens:** Developers add List-Unsubscribe but forget List-Unsubscribe-Post.
**How to avoid:** Always include BOTH headers. The unsubscribe endpoint MUST handle POST requests (returning 200/202) in addition to GET requests (showing confirmation page).
**Warning signs:** Gmail shows "Report spam" but not the blue "Unsubscribe" button in the email header.

### Pitfall 4: Domain Warm-Up Too Aggressive
**What goes wrong:** Sending full volume on day 1 triggers spam filters and damages domain reputation for weeks.
**Why it happens:** Eagerness to launch, not understanding that ISPs build sender reputation gradually.
**How to avoid:** Start at 50 emails/day. Increase by 50% every 3 days. Track bounce rates (<2%) and spam complaints (<0.1%). If metrics spike, reduce volume and wait.
**Warning signs:** Open rates below 10%, sudden spike in bounces, emails landing in spam folders.

### Pitfall 5: HMAC Token Without timingSafeEqual
**What goes wrong:** Using `===` for HMAC comparison enables timing attacks.
**Why it happens:** String comparison in JavaScript short-circuits, leaking information about correct bytes.
**How to avoid:** Always use `crypto.timingSafeEqual()` with Buffer conversion.
**Warning signs:** No visible symptom -- this is a security vulnerability that only matters under attack.

### Pitfall 6: Admin Page Exposing Service Role Key to Client
**What goes wrong:** Using `createClient` with service_role key in a client component exposes the key in the browser bundle.
**Why it happens:** Confusion between Server Components and Client Components in Next.js App Router.
**How to avoid:** Admin page MUST be a Server Component (no "use client" directive). Create the Supabase client with service_role key only in server-side code.
**Warning signs:** `SUPABASE_SERVICE_ROLE_KEY` appearing in browser network tab or source maps.

### Pitfall 7: Delivery Time Zones
**What goes wrong:** All subscribers receive emails at the same UTC time regardless of their timezone preference.
**Why it happens:** pg_cron uses UTC. "Morning" means different times in different time zones.
**How to avoid:** Map delivery_time preferences to UTC windows: morning=6-9 local, afternoon=12-15 local, evening=18-21 local. For v1 with low subscriber count, three pg_cron jobs (6 UTC, 12 UTC, 18 UTC) may suffice. The subscriber_preferences table already has a `timezone` column.
**Warning signs:** Subscribers in Pacific time getting "morning" emails at 10pm.

## Code Examples

### Rendering React Email in Next.js Server Action / Edge Function

```typescript
// Two approaches for rendering email HTML:

// Approach 1: Use Resend's react parameter (Node.js only, NOT Deno)
// Source: Resend docs
await resend.emails.send({
  from: 'Lucas Senechal <newsletter@lucassenechal.com>',
  to: subscriber.email,
  subject: content.subject,
  react: DigestEmail({ ...props }),  // Resend renders server-side
  headers: { /* compliance headers */ },
})

// Approach 2: Pre-render to HTML string (works everywhere)
// Source: @react-email/render docs (https://react.email/docs/utilities/render)
import { render } from '@react-email/render'
const html = await render(DigestEmail({ ...props }))
await resend.emails.send({
  from: 'Lucas Senechal <newsletter@lucassenechal.com>',
  to: subscriber.email,
  subject: content.subject,
  html,
  headers: { /* compliance headers */ },
})
```

### Unsubscribe API Endpoint (RFC 8058 Compliant)

```typescript
// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function verifyToken(subscriberId: string, token: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.EMAIL_LINK_SECRET!)
    .update(`${subscriberId}:unsubscribe`)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false
  }
}

// RFC 8058: POST handler for one-click unsubscribe (email client sends POST)
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const subscriberId = url.searchParams.get('s')
  const token = url.searchParams.get('t')

  if (!subscriberId || !token || !verifyToken(subscriberId, token)) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('subscribers').update({
    status: 'unsubscribed',
    unsubscribed_at: new Date().toISOString(),
  }).eq('id', subscriberId)

  return new NextResponse('', { status: 200 }) // RFC 8058: blank page on POST
}

// GET handler: shows confirmation page (human clicks link in email)
export async function GET(request: NextRequest) {
  // Same validation, then return HTML confirmation page
  return new NextResponse(`<html>...You've been unsubscribed...</html>`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
```

### Feedback Link Handler

```typescript
// app/api/feedback/route.ts
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const subscriberId = url.searchParams.get('s')
  const itemId = url.searchParams.get('i')
  const value = url.searchParams.get('v') // 'more' or 'less'
  const token = url.searchParams.get('t')

  // Verify HMAC token
  // Insert into subscriber_feedback table
  // Return simple HTML: "Got it -- we'll tune your feed."
}
```

### Database Migration for Phase 6

```sql
-- 007_email_delivery.sql

-- Send log: tracks every email send attempt
CREATE TABLE send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  resend_id TEXT,  -- Resend's email ID for webhook correlation
  subject TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('digest', 'briefing', 'mixed', 'fallback')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed', 'complained', 'skipped')),
  error TEXT,
  opened_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_send_log_subscriber ON send_log(subscriber_id, sent_at DESC);
CREATE INDEX idx_send_log_resend_id ON send_log(resend_id);
CREATE INDEX idx_send_log_status ON send_log(status, sent_at);

-- Subscriber feedback: captures More/Less signals
CREATE TABLE subscriber_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  item_url TEXT NOT NULL,
  signal TEXT NOT NULL CHECK (signal IN ('more', 'less')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_feedback_subscriber ON subscriber_feedback(subscriber_id, created_at DESC);

-- Domain warm-up configuration
CREATE TABLE warm_up_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_send_limit INTEGER NOT NULL DEFAULT 50,
  current_day INTEGER NOT NULL DEFAULT 1,
  last_adjusted_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- RLS: service_role only
ALTER TABLE send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE warm_up_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role send_log" ON send_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public send_log" ON send_log FOR ALL TO anon USING (false);
CREATE POLICY "Service role subscriber_feedback" ON subscriber_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public subscriber_feedback" ON subscriber_feedback FOR ALL TO anon USING (false);
CREATE POLICY "Service role warm_up_config" ON warm_up_config FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public warm_up_config" ON warm_up_config FOR ALL TO anon USING (false);
```

### Delivery Time Scheduling Pattern

```sql
-- Add email delivery queue (mirrors research_jobs pattern)
SELECT pgmq.create('email_delivery');

-- Three pg_cron jobs for delivery time windows
-- Morning window: 6 UTC (covers US evening, EU morning)
SELECT cron.schedule(
  'email-delivery-morning',
  '0 6 * * *',
  $$ SELECT enqueue_email_delivery('morning'); $$
);

-- Afternoon window: 12 UTC
SELECT cron.schedule(
  'email-delivery-afternoon',
  '0 12 * * *',
  $$ SELECT enqueue_email_delivery('afternoon'); $$
);

-- Evening window: 18 UTC
SELECT cron.schedule(
  'email-delivery-evening',
  '0 18 * * *',
  $$ SELECT enqueue_email_delivery('evening'); $$
);

-- Enqueue function: only enqueues subscribers for matching delivery time
CREATE OR REPLACE FUNCTION enqueue_email_delivery(time_window TEXT)
RETURNS void AS $$
DECLARE
  sub RECORD;
BEGIN
  FOR sub IN
    SELECT s.id
    FROM subscribers s
    JOIN subscriber_preferences sp ON sp.subscriber_id = s.id
    WHERE s.status = 'active'
    AND sp.delivery_time = time_window
  LOOP
    PERFORM pgmq.send('email_delivery', jsonb_build_object(
      'subscriber_id', sub.id,
      'research_date', CURRENT_DATE::text,
      'enqueued_at', now(),
      'retry_count', 0
    ));
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| mailto: unsubscribe only | RFC 8058 one-click (POST + HTTPS) | Feb 2024 (Gmail/Yahoo requirement) | Must include List-Unsubscribe-Post header; POST endpoint required |
| Manual IP warm-up | Shared IP warm-up (Resend handles IP) | Resend uses shared IPs | Focus on domain reputation, not IP reputation |
| Custom SMTP / SES | Developer-friendly email API (Resend) | 2023-2024 | Simpler integration, built-in webhooks, React Email support |
| Table-based email layouts | Modern CSS-in-email with fallbacks | 2024+ | React Email abstracts cross-client rendering; still uses tables internally |

**Deprecated/outdated:**
- **Gmail's old unsubscribe handling:** Before Feb 2024, List-Unsubscribe-Post was optional. Now required for bulk senders.
- **renderToStaticMarkup in client bundles:** React 19 deprecated legacy react-dom/server APIs in client bundles. Render emails server-side only.

## Open Questions

1. **React Email rendering in Deno Edge Functions**
   - What we know: The existing templates use `@react-email/components` which depends on react-dom. Deno Edge Functions can import npm packages but react-dom/server renderToStaticMarkup may have issues.
   - What's unclear: Whether `@react-email/render` works cleanly in Supabase Deno runtime.
   - Recommendation: Two viable paths: (a) render HTML in a pre-processing step on Node.js (Next.js API route or during content generation), storing rendered HTML in the database; (b) construct email HTML as template literal strings in the Edge Function using the structured content_json. Option (b) is simpler and follows the existing Edge Function pattern of inlining everything. Given that the templates are structured (not dynamic layout), string templates are viable.

2. **Warm-up volume enforcement**
   - What we know: Resend does not provide built-in warm-up limiting. We need to track sends per day and stop when limit is reached.
   - What's unclear: Exact ramp schedule for the specific subscriber count at launch.
   - Recommendation: Start with a `warm_up_config` table. The delivery Edge Function checks daily limit before sending. A simple schedule: Day 1-3: 50, Day 4-6: 75, Day 7-9: 112, Day 10-12: 168, Day 13-15: 252, and so on (50% increase every 3 days). At this rate, full volume of 500 is reached in ~3 weeks.

3. **Admin page authentication**
   - What we know: Requirements say "internal, for Lucas" -- not a login system.
   - What's unclear: How to protect the admin page without building auth.
   - Recommendation: Simple approach: check for a secret query parameter or environment variable-based header check. For v1, an `ADMIN_SECRET` env var checked in the Server Component is sufficient. The page is not linked from navigation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAIL-01 | Email send via Resend with correct parameters | unit | `npx vitest run lib/email/__tests__/send.test.ts -x` | Wave 0 |
| MAIL-02 | Template rendering produces valid HTML for all 3 formats | unit | `npx vitest run lib/email/__tests__/templates.test.ts -x` | Wave 0 |
| MAIL-03 | Email HTML under 100KB, text ratio compliance | unit | `npx vitest run lib/email/__tests__/templates.test.ts -x` | Wave 0 |
| MAIL-04 | Unsubscribe endpoint validates token, updates DB | unit | `npx vitest run app/api/unsubscribe/__tests__/route.test.ts -x` | Wave 0 |
| MAIL-05 | SPF/DKIM/DMARC records | manual-only | N/A (DNS configuration, verified via MX Toolbox) | N/A |
| MAIL-06 | Warm-up config limits sends per day | unit | `npx vitest run lib/email/__tests__/warmup.test.ts -x` | Wave 0 |
| MAIL-07 | Preference link in rendered email HTML | unit | `npx vitest run lib/email/__tests__/templates.test.ts -x` | Wave 0 |
| MAIL-08 | Correct subscribers queued per delivery time window | unit | `npx vitest run lib/email/__tests__/scheduling.test.ts -x` | Wave 0 |
| MAIL-09 | Webhook handler updates send_log correctly | unit | `npx vitest run app/api/webhooks/__tests__/resend.test.ts -x` | Wave 0 |
| MAIL-10 | CTA level determined by engagement signals | unit | `npx vitest run lib/email/__tests__/cta-logic.test.ts -x` | Wave 0 |
| FDBK-01 | Feedback endpoint validates and stores signal | unit | `npx vitest run app/api/feedback/__tests__/route.test.ts -x` | Wave 0 |
| OPS-03 | Admin page renders subscriber data | manual-only | N/A (Server Component rendering with real Supabase data) | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `lib/email/__tests__/send.test.ts` -- covers MAIL-01 (mock Resend SDK)
- [ ] `lib/email/__tests__/templates.test.ts` -- covers MAIL-02, MAIL-03, MAIL-07
- [ ] `lib/email/__tests__/warmup.test.ts` -- covers MAIL-06
- [ ] `lib/email/__tests__/cta-logic.test.ts` -- covers MAIL-10
- [ ] `app/api/unsubscribe/__tests__/route.test.ts` -- covers MAIL-04
- [ ] `app/api/feedback/__tests__/route.test.ts` -- covers FDBK-01
- [ ] `app/api/webhooks/__tests__/resend.test.ts` -- covers MAIL-09
- [ ] `lib/email/__tests__/token.test.ts` -- covers HMAC token generation/verification

## Sources

### Primary (HIGH confidence)
- Resend API docs (https://resend.com/docs/api-reference/emails/send-email) -- send email parameters, headers support, response format
- Resend batch API docs (https://resend.com/docs/api-reference/emails/send-batch-emails) -- batch limitations (no scheduled_at, max 100)
- Resend webhook docs (https://resend.com/docs/dashboard/webhooks/introduction) -- event types, payload format, retry behavior
- Resend unsubscribe docs (https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails) -- List-Unsubscribe header implementation
- Resend domain warm-up blog (https://resend.com/blog/how-to-warm-up-a-new-domain) -- warm-up strategy, timeline, subdomain separation
- Existing codebase: `lib/email/welcome-template.tsx`, `lib/email/plan-delivery.tsx` -- established React Email patterns
- Existing codebase: `supabase/functions/research-pipeline/index.ts` -- pgmq processing pattern
- Existing codebase: `supabase/migrations/005_pgmq_setup.sql` -- queue and cron job setup
- Existing codebase: `lib/content/schemas.ts` -- content JSON shapes consumed by templates
- Phase 6 UI-SPEC: `.planning/phases/06-email-delivery-compliance/06-UI-SPEC.md` -- visual/copy contract

### Secondary (MEDIUM confidence)
- RFC 8058 (https://datatracker.ietf.org/doc/html/rfc8058) -- one-click unsubscribe specification
- Node.js crypto docs (https://nodejs.org/api/crypto.html) -- HMAC-SHA256 API
- React Email render docs (https://react.email/docs/utilities/render) -- render to HTML string

### Tertiary (LOW confidence)
- Resend rate limit behavior at scale -- documented as 2-5 req/s default but real-world behavior may differ under load

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use; Resend SDK, React Email, Supabase all verified
- Architecture: HIGH -- follows established Edge Function + pgmq pattern from Phase 4; existing email template patterns from Phase 2-3
- Pitfalls: HIGH -- Resend documentation is thorough; RFC 8058 requirements are well-documented; React Email Deno compatibility is the main uncertainty
- Delivery pipeline: HIGH -- mirrors research-pipeline architecture exactly
- Domain warm-up: MEDIUM -- Resend docs recommend gradual increase but don't prescribe exact numbers; 50/day start with 50% growth is industry standard

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable domain -- Resend API, email compliance standards, React Email all mature)
