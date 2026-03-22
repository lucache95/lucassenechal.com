# Phase 8: SMS Channel - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Opted-in subscribers receive daily SMS summaries of their newsletter and can interact via two-way text conversation — follow-up questions, preference updates, and opt-out. Twilio-powered with TCPA compliance.

</domain>

<decisions>
## Implementation Decisions

### Twilio Integration & Compliance
- Toll-free number — faster approval than A2P 10DLC (days vs weeks), sufficient for low-volume personalized SMS. A2P 10DLC can be added later if volume justifies
- Store consent timestamp + IP in `subscriber_preferences` — two new columns (`sms_consent_at`, `sms_consent_ip`), collected at opt-in time
- Quiet hours enforced per-subscriber timezone from `subscriber_preferences` — no sends before 8am or after 9pm in their local timezone
- Twilio's built-in Advanced Opt-Out handles STOP/START/HELP keywords at platform level, plus webhook notification to update `sms_opt_in` in our DB

### SMS Content & Delivery
- SMS summary is 3-5 bullet points with top findings from their newsletter, plus a link to the full email in browser. ~300 chars max per SMS segment
- Delivery timing piggybacks on email delivery time — send SMS 5 minutes after email, using the same `delivery_time` preference (morning/afternoon/evening)
- Claude Haiku generates SMS summaries — takes generated newsletter content and compresses to SMS-length bullets
- 1 SMS per subscriber per day max — enforced via `sms_send_log` table with daily unique constraint

### Two-Way Conversational AI
- Claude Haiku for conversation — fast, cheap, good at following instructions for short conversational replies. System prompt includes subscriber's latest newsletter content as context
- Natural language intent detection for preference updates — parse intents like "add local events", "stop crypto", "switch to morning" and map to DB updates. Confirm changes back via SMS
- Last 5 messages in session stored in `sms_conversations` table, reset daily. Keeps context for follow-ups without unbounded growth
- Friendly fallback for unparseable intent — "I didn't quite get that. Try asking about your newsletter or say HELP for options."

### Claude's Discretion
- Twilio SDK integration patterns and webhook structure
- SMS conversation table schema design
- Edge Function vs API route for Twilio webhook handler
- SMS summary prompt engineering

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `subscriber_preferences` table already has `sms_opt_in` boolean + `phone` text fields
- `lib/schemas/preferences.ts` — phone validation (E.164 format)
- `lib/schemas/onboarding.ts` — SMS opt-in schema with phone validation
- `components/preferences/preference-sections.tsx` — SMS toggle UI already built
- `lib/email/token.ts` — HMAC token module (for secure SMS links)
- `supabase/functions/email-delivery/index.ts` — delivery pipeline pattern to replicate

### Established Patterns
- Supabase Edge Functions for background processing (research-pipeline, email-delivery)
- pgmq queue for async job processing
- Supabase service_role key for writes (bypasses RLS)
- Anthropic SDK already in dependencies (`@anthropic-ai/sdk`)

### Integration Points
- Email delivery Edge Function triggers SMS 5 minutes after email send
- `subscriber_preferences.delivery_time` and `subscriber_preferences.timezone` for quiet hours
- Twilio webhook → Next.js API route for inbound SMS
- Content generation output feeds SMS summary generation

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- A2P 10DLC registration — evaluate after volume justifies (toll-free sufficient for launch)
- MMS support (images/rich media in SMS) — text-only for v1
- SMS analytics dashboard — defer to future milestone

</deferred>
