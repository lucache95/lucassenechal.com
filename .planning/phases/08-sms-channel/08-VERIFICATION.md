---
phase: 08-sms-channel
verified: 2026-03-22T21:45:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: true
  previous_status: gaps_found
  previous_score: 12/13
  gaps_closed:
    - "Outbound TwiML replies are logged accurately to sms_send_log — direction: 'inbound' corrected to direction: 'outbound' at line 250 of app/api/webhooks/twilio/route.ts in commit 0a7085d"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "TCPA disclosure timing — confirm text visible before opt-in"
    expected: "A user who has not yet clicked 'Yes, add SMS alerts' should be able to read the TCPA consent text ('By enabling SMS, you agree...Message and data rates may apply. Reply STOP to unsubscribe.') before committing. The current implementation renders this text inside AnimatePresence which only shows when smsOptIn is true — meaning it appears at the same moment the toggle fires, not before."
    why_human: "This is a visual/UX behavior that requires testing the actual animated component to determine if a reasonable user would perceive the disclosure as a pre-consent notice or a post-consent confirmation. Legal compliance standard is unclear from code alone."
---

# Phase 8: SMS Channel Verification Report

**Phase Goal:** Opted-in subscribers receive SMS summaries and can interact with their newsletter via two-way text conversation
**Verified:** 2026-03-22T21:45:00Z
**Status:** human_needed (all automated checks pass; 1 human verification item remains)
**Re-verification:** Yes — after gap closure (commit 0a7085d)

---

## Re-verification Summary

**Gap closed:** The single data integrity gap identified in the initial verification has been resolved.

Commit `0a7085d` (`fix(08-04): correct outbound reply direction in sms_send_log`) changed exactly one line in `app/api/webhooks/twilio/route.ts`:

```diff
-      direction: 'inbound',
+      direction: 'outbound',
```

The fix is surgical — only two files changed across commits since initial verification (`08-04-PLAN.md` and `app/api/webhooks/twilio/route.ts`). No regressions detected. All 13 truths now verified.

The inbound user message log at line 98 correctly retains `direction: 'inbound'`. The outbound TwiML reply log at line 250 now correctly uses `direction: 'outbound'`. The direction semantics are now consistent with the `sms_send_log` table's model and the `idx_sms_daily_outbound` unique constraint.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SMS database tables exist with proper constraints and RLS | VERIFIED | `supabase/migrations/008_sms_channel.sql` creates `sms_send_log` and `sms_conversations` with RLS, CHECK constraints, and daily outbound unique index |
| 2 | Consent timestamp and IP columns exist on subscriber_preferences | VERIFIED | Migration lines 51-53: `ALTER TABLE subscriber_preferences ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ, ADD COLUMN IF NOT EXISTS sms_consent_ip TEXT` |
| 3 | Quiet hours check correctly identifies 8am-9pm window in any timezone | VERIFIED | `lib/sms/quiet-hours.ts` uses `Intl.DateTimeFormat` with `localHour < 8 \|\| localHour >= 21`; 6 unit tests pass |
| 4 | Intent parser detects question, preference_update, and unknown intents | VERIFIED | `lib/sms/intent-parser.ts` Zod schema with z.enum; 7 unit tests pass |
| 5 | 1 SMS per subscriber per day is enforced at the database level | VERIFIED | `idx_sms_daily_outbound` UNIQUE index on `(subscriber_id, (sent_at::date)) WHERE direction = 'outbound'` |
| 6 | Opted-in subscribers receive a daily SMS summary of their newsletter | VERIFIED | `supabase/functions/sms-delivery/index.ts` reads pgmq, generates Claude Haiku summary, sends via Twilio, logs to sms_send_log |
| 7 | SMS summary is 3-5 bullet points under 300 characters with a link to full email | VERIFIED | `generateSmsSummary` uses Claude Haiku with system prompt specifying "3-5 bullet points, Total under 300 characters"; view link appended |
| 8 | SMS is sent 5 minutes after email via pgmq queue trigger | VERIFIED | `supabase/functions/email-delivery/index.ts` lines 523-546: fire-and-forget SMS enqueue after `sent++` increment |
| 9 | Subscribers can view their full newsletter in a browser via the SMS link | VERIFIED | `app/(marketing)/newsletter/view/page.tsx` renders all 3 formats (digest/briefing/mixed) with HMAC token security and no-index metadata |
| 10 | Subscribers can text back follow-up questions and receive AI-generated answers | VERIFIED | `app/api/webhooks/twilio/route.ts` lines 152-178: question intent fetches newsletter context, calls Claude Haiku, returns TwiML reply |
| 11 | Subscribers can update preferences via natural language text | VERIFIED | Webhook handles topics_add, topics_remove, delivery_time, and format update intents with DB writes and confirmatory replies |
| 12 | STOP/START keyword immediately opts subscriber in/out | VERIFIED | Lines 68-77: `OptOutType === 'STOP'` sets `sms_opt_in = false`, `START` sets `sms_opt_in = true`, returns empty TwiML per TCPA |
| 13 | Outbound TwiML replies are logged accurately to sms_send_log | VERIFIED | Line 250 (post-fix, commit 0a7085d): `direction: 'outbound'` — correctly models that the system is sending a message to the subscriber |

**Score: 13/13 truths verified**

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/008_sms_channel.sql` | SMS tables, consent columns, RLS, pgmq queue, enqueue function, pg_cron jobs | VERIFIED | All elements present: 2 tables, consent ALTER, 4 RLS policies, pgmq.create, enqueue function, 3 cron jobs |
| `lib/sms/types.ts` | SmsSendLogEntry, SmsConversationMessage, SmsDeliveryPayload | VERIFIED | All 3 interfaces exported |
| `lib/sms/quiet-hours.ts` | isWithinQuietHours function | VERIFIED | Exported, uses Intl.DateTimeFormat, fail-open on invalid timezone |
| `lib/sms/intent-parser.ts` | smsIntentSchema, SmsIntent, SMS_INTENT_SYSTEM_PROMPT, SMS_FALLBACK_RESPONSE | VERIFIED | All 4 exports present, Zod schema complete |
| `lib/sms/quiet-hours.test.ts` | 6 tests with vi.useFakeTimers | VERIFIED | 6 passing tests covering timezone boundaries and invalid input |
| `lib/sms/intent-parser.test.ts` | 7 tests covering all intent types | VERIFIED | 7 passing tests covering question, preference_update, unknown, invalid, and all action fields |
| `supabase/functions/sms-delivery/index.ts` | Outbound SMS Edge Function | VERIFIED | Deno.serve, pgmq_read/pgmq_archive, quiet hours inlined, Claude Haiku, Twilio REST, sms_send_log, HMAC token |
| `app/(marketing)/newsletter/view/page.tsx` | View-in-browser page with HMAC security | VERIFIED | verifyToken('view-email'), newsletter_content fetch, all 3 format renderers, robots: index:false |
| `app/api/webhooks/twilio/route.ts` | Inbound SMS webhook handler | VERIFIED | All logic present; outbound reply direction corrected to 'outbound' in commit 0a7085d |
| `app/actions/preferences.ts` | Preferences action with consent recording | VERIFIED | sms_consent_at and sms_consent_ip written on opt-out-to-opt-in transition only |
| `components/onboarding/step-sources.tsx` | TCPA disclosure text | VERIFIED (see human check) | Disclosure text "Message and data rates may apply. Reply STOP to unsubscribe." is present but inside AnimatePresence |
| `app/actions.ts` | Onboarding consent recording | VERIFIED | sms_consent_at, sms_consent_ip, x-forwarded-for IP extraction on smsOptIn=true |
| `lib/schemas/preferences.ts` | consentIp optional field | VERIFIED | `consentIp: z.string().optional()` |
| `package.json` | twilio@5.13.0 dependency | VERIFIED | `"twilio": "^5.13.0"` in dependencies |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `supabase/migrations/008_sms_channel.sql` | `subscriber_preferences` | `ALTER TABLE subscriber_preferences ADD COLUMN` | VERIFIED | Lines 51-53 of migration |
| `supabase/migrations/008_sms_channel.sql` | `subscribers` | `REFERENCES subscribers(id)` | VERIFIED | Both sms_send_log and sms_conversations reference subscribers(id) |
| `supabase/functions/sms-delivery/index.ts` | `https://api.twilio.com` | `fetch with Basic Auth` | VERIFIED | Pattern `api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json` with btoa Basic Auth |
| `supabase/functions/sms-delivery/index.ts` | `sms_send_log` | `supabase.from('sms_send_log').insert` | VERIFIED | Both success (status:'sent') and failure (status:'failed') paths log to sms_send_log |
| `supabase/functions/email-delivery/index.ts` | `pgmq sms_delivery queue` | `pgmq_send after email send` | VERIFIED | Fire-and-forget block at lines 523-546, wrapped in try/catch so email never blocked |
| `app/api/webhooks/twilio/route.ts` | `twilio.validateRequest` | `validateRequest for signature verification` | VERIFIED | Line 54: `twilio.validateRequest(authToken, signature, webhookUrl, params)` returns 403 if invalid |
| `app/api/webhooks/twilio/route.ts` | `subscriber_preferences` | `supabase.from('subscriber_preferences').update` | VERIFIED | STOP/START updates sms_opt_in; preference_update updates delivery_time/format |
| `app/api/webhooks/twilio/route.ts` | `sms_conversations` | `supabase.from('sms_conversations')` | VERIFIED | Both insert (store messages) and select (fetch history with .limit(5)) |
| `app/api/webhooks/twilio/route.ts` | `newsletter_content` | `supabase.from('newsletter_content')` | VERIFIED | Lines 121-127: latest content fetched for question context |
| `app/api/webhooks/twilio/route.ts` | `sms_send_log (outbound)` | `direction: 'outbound'` at line 250 | VERIFIED | Corrected in commit 0a7085d — assistant TwiML reply now logged with correct direction |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SMS-01 | 08-01, 08-03 | Twilio integration with A2P 10DLC registration | VERIFIED | twilio@5.13.0 installed; validateRequest wired; Twilio REST API in sms-delivery Edge Function; user_setup in 08-01-PLAN documents manual toll-free registration steps |
| SMS-02 | 08-01, 08-03 | TCPA-compliant opt-in with documented consent | VERIFIED (human check) | sms_consent_at/sms_consent_ip stored on new opt-in in both preferences action and onboarding action; TCPA disclosure text present (timing is human verification item) |
| SMS-03 | 08-02 | SMS summary of daily report for opted-in subscribers | VERIFIED | sms-delivery Edge Function delivers Claude Haiku summaries; email-delivery enqueues SMS after each email send |
| SMS-04 | 08-03 | Two-way conversational AI — follow-up questions | VERIFIED | Webhook detects 'question' intent, fetches newsletter content as context, calls Claude Haiku, returns answer under 300 chars |
| SMS-05 | 08-03 | Preference updates via text message | VERIFIED | topics_add, topics_remove, delivery_time, format all handled with DB writes and confirmation replies |
| SMS-06 | 08-01, 08-03 | STOP/opt-out handling and quiet-hours enforcement | VERIFIED | STOP→sms_opt_in=false, START→sms_opt_in=true, empty TwiML; quiet hours inlined in sms-delivery Edge Function |

---

### Anti-Patterns Found

No blocker anti-patterns. The previously flagged data integrity issue (`direction: 'inbound'` for outbound reply) has been resolved in commit 0a7085d.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | All anti-patterns resolved |

---

### Human Verification Required

#### 1. TCPA Disclosure Timing

**Test:** Load the onboarding flow at `/newsletter/onboarding` (or equivalent). Reach the Sources step. Before clicking "Yes, add SMS alerts", look for the TCPA disclosure text ("By enabling SMS, you agree to receive automated text messages... Message and data rates may apply. Reply STOP to unsubscribe.").

**Expected:** The TCPA consent text should be visible (or at minimum the phrase "Reply STOP" in the always-visible pitch card) BEFORE the user commits. Currently the formal disclosure is inside AnimatePresence and renders only when smsOptIn becomes true, i.e., simultaneously with the opt-in action. The pitch card always shows "Reply STOP anytime" which provides partial notice.

**Why human:** UI animation timing and perceived consent notice sequencing cannot be verified by static analysis. A legal standard question: does seeing "Reply STOP anytime" in the pre-toggle card combined with the full disclosure appearing simultaneously on toggle constitute adequate pre-consent notice? This requires human judgment on TCPA compliance standards.

---

### Gap Closure Confirmation

The single gap from the initial verification is now closed:

**Gap:** `direction: 'inbound'` at line 250 of `app/api/webhooks/twilio/route.ts` for the assistant reply `sms_send_log` insert.

**Fix:** Commit `0a7085d` changed exactly one line — `direction: 'inbound'` to `direction: 'outbound'` — in the outbound TwiML reply log insert. The inbound user message log at line 98 correctly retains `direction: 'inbound'`. The fix correctly models the data: when the system sends a TwiML reply to a subscriber, that is an outbound message.

**Regression check:** Only `app/api/webhooks/twilio/route.ts` and `08-04-PLAN.md` were modified between the initial verification baseline and current HEAD. All other artifacts are unchanged and retain their verified status.

---

_Verified: 2026-03-22T21:45:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after gap closure (commit 0a7085d)_
