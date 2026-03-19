---
phase: 03-consulting-funnel
plan: 05
status: complete
completed: 2026-03-19
---

# Plan 03-05 Summary: Complete Funnel Wiring

## What Was Built

Complete end-to-end consulting funnel connecting all stages into a cohesive conversion flow.

### Files Created/Modified

- **`components/intake/lead-capture-gate.tsx`** — Email + name capture form before plan generation. Clean centered form with Framer Motion entrance, client-side validation, calls `onSubmit({ email, name })`.
- **`components/consulting/cal-embed.tsx`** — Cal.com booking embed via vanilla JS Script (avoiding React 19 conflict with `@calcom/embed-react`). Loads `embed.js`, initializes inline calendar for `lucas-senechal`. Shows urgency messaging from env vars.
- **`lib/email/intake-notification.tsx`** — React Email template notifying Lucas of new leads with name, email, business description, recommended service, question count, plan summary.
- **`lib/email/plan-delivery.tsx`** — React Email template sending plan copy to the lead.
- **`app/actions/intake.ts`** — Server Actions: `saveIntakeSession` (session + bulk answers), `saveIntakePlan` (plan JSON + fire-and-forget notification email), `markIntakeBooked` (status update), `saveChatIntakeSession` (chat path).
- **`app/(marketing)/work-with-me/work-with-me-client.tsx`** — Complete 8-stage funnel state machine: `landing → choose → chat | intake → capture → generating → plan → booking → complete`. SessionStorage persistence across refreshes. Scroll-to-top on stage change.

### Funnel Flow

```
landing → choose → [chat | intake] → capture → generating/plan → booking → complete
```

- **Chat path**: AI intake (Gemini 2.5 Flash) → email capture → complete (no plan generation)
- **Form path**: AI-curated question form → email capture → streaming plan → Cal.com booking

## Outcome

All consulting funnel requirements delivered:
- Lead capture gate collects name + email before plan generation (WORK-08)
- All intake data persisted to Supabase (sessions, answers, plans) (WORK-08)
- Cal.com booking embed with urgency messaging (WORK-07)
- Email notification sent to Lucas on new lead (fire-and-forget)
- Plan copy emailed to the lead after generation
- Post-booking thank-you with newsletter cross-pollination
- Full funnel state machine working end-to-end (WORK-09, WORK-10, WORK-11)
