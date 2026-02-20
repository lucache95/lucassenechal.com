---
phase: 01-foundation-landing-page
plan: 03
subsystem: api
tags: [supabase, server-actions, react, useActionState, email-capture]

# Dependency graph
requires:
  - phase: 01-foundation-landing-page (plan 01)
    provides: Supabase client setup, subscribers schema, project scaffold
  - phase: 01-foundation-landing-page (plan 02)
    provides: Hero section and sticky CTA form UI components
provides:
  - subscribeEmail Server Action for email capture
  - Working email-to-Supabase pipeline with validation and error handling
  - useActionState-powered form UX with idle/loading/success/error states
affects: [02-subscriber-onboarding, 05-email-delivery]

# Tech tracking
tech-stack:
  added: []
  patterns: [Server Action with useActionState, service_role key for server-side Supabase inserts, form state management via React 19 useActionState]

key-files:
  created: [app/actions.ts]
  modified: [components/landing/hero.tsx, components/landing/sticky-cta.tsx]

key-decisions:
  - "Used service_role key directly via createClient instead of cookie-based server client to bypass RLS for email inserts"
  - "Used useActionState (React 19) instead of useState+manual fetch for Server Action form binding"
  - "Standardized input name to 'email' on both forms so a single Server Action handles both"
  - "Success message includes spam folder check note per user feedback"

patterns-established:
  - "Server Action pattern: 'use server' + typed return + useActionState on client"
  - "Service role client pattern: createClient with SUPABASE_SERVICE_ROLE_KEY for server-side inserts"

requirements-completed: [SITE-03, SITE-07]

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 1 Plan 3: Email Capture Summary

**Server Action subscribeEmail wired to hero and sticky CTA forms via useActionState with Supabase service_role inserts, validation, duplicate handling, and spam-folder-aware success messaging**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T20:41:23Z
- **Completed:** 2026-02-20T20:43:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Server Action `subscribeEmail` validates email format, inserts into Supabase `subscribers` table using service_role key (bypasses RLS), and handles duplicates with friendly error
- Hero form and sticky CTA both use `useActionState` for declarative form state management (idle, loading, success, error)
- Success message includes spam folder check note: "Check your inbox (and spam folder) -- mark us as 'not spam' so you never miss a briefing."
- Checkmark animation on success using Framer Motion spring transition

## Task Commits

Each task was committed atomically:

1. **Task 1: Create email subscription Server Action with validation** - `ad0391d` (feat)
2. **Task 2: Wire email capture forms to Server Action with UX states** - `63309c7` (feat)

## Files Created/Modified
- `app/actions.ts` - Server Action with email validation, Supabase insert, duplicate handling
- `components/landing/hero.tsx` - Hero email form wired to subscribeEmail via useActionState with success animation
- `components/landing/sticky-cta.tsx` - Sticky CTA form wired to subscribeEmail via useActionState with compact success state

## Decisions Made
- Used `@supabase/supabase-js` `createClient` directly with `SUPABASE_SERVICE_ROLE_KEY` instead of the cookie-based `@supabase/ssr` server client. The Server Action does not need cookie-based auth -- it just needs to insert rows, and the service_role key bypasses RLS cleanly.
- Used `useActionState` (React 19) over the previous `useState` + manual `handleSubmit` pattern. This gives us `isPending` for free and ties form state to the action lifecycle.
- Changed sticky CTA input name from `sticky-email` to `email` so both forms share the same Server Action without conditional field name handling.
- Added spam folder check to success message per explicit user feedback.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed sticky CTA input name mismatch**
- **Found during:** Task 2 (Wire email capture forms)
- **Issue:** Sticky CTA used `name="sticky-email"` but Server Action reads `formData.get('email')` -- form submissions would always fail validation
- **Fix:** Changed sticky CTA input name to `email` to match Server Action expectation
- **Files modified:** components/landing/sticky-cta.tsx
- **Verification:** Build passes, both forms submit to same action with correct field name
- **Committed in:** 63309c7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - Supabase credentials already configured in .env.local. The SQL migration (001_subscribers.sql) needs to be run in Supabase SQL Editor if not already done (documented in plan frontmatter user_setup).

## Next Phase Readiness
- Email capture is fully functional -- landing page converts visitors to subscribers
- Phase 2 (Subscriber Onboarding) can extend the subscribeEmail action for multi-step signup
- Plan 01-04 (legal pages) has no dependency on this plan and was already completed

## Self-Check: PASSED

- All 3 source files verified on disk
- Both task commits verified in git log (ad0391d, 63309c7)
- `npm run build` passes successfully

---
*Phase: 01-foundation-landing-page*
*Completed: 2026-02-20*
