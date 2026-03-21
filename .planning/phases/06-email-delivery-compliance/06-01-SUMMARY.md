---
phase: 06-email-delivery-compliance
plan: 01
subsystem: database, email, security
tags: [pgmq, pg_cron, hmac, sha256, rls, warm-up, email-delivery, cta]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Supabase client, subscribers table"
  - phase: 02-subscriber-onboarding
    provides: "subscriber_preferences table with delivery_time"
  - phase: 04-ai-research-engine
    provides: "pgmq/pg_cron infrastructure in migration 005"
  - phase: 05-content-generation
    provides: "newsletter_content table for email rendering"
provides:
  - "send_log table for tracking email delivery status and Resend webhook updates"
  - "subscriber_feedback table for more/less signals on newsletter items"
  - "warm_up_config table with graduated volume control (50->500 over ~3 weeks)"
  - "email_delivery pgmq queue for subscriber message processing"
  - "enqueue_email_delivery function routing by delivery_time window"
  - "3 pg_cron delivery jobs (morning 6am, afternoon 12pm, evening 6pm UTC)"
  - "warm-up increment pg_cron job (daily 00:01 UTC, 50% increase every 3 days)"
  - "HMAC-SHA256 token generation/verification with timing-safe comparison"
  - "CTA engagement level logic (soft/medium based on clicks and feedback)"
  - "Shared email inline styles matching UI-SPEC contract"
affects: [06-02, 06-03, 06-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "HMAC-SHA256 token for email link security with timing-safe comparison"
    - "CTA escalation: soft default, medium at 3+ clicks or 2+ feedback in 7 days"
    - "Warm-up graduated volume: 50/day start, 50% every 3 days, 500/day cap"
    - "Delivery window routing: enqueue function filters by subscriber delivery_time preference"

key-files:
  created:
    - "supabase/migrations/007_email_delivery.sql"
    - "lib/email/token.ts"
    - "lib/email/cta-logic.ts"
    - "lib/email/shared-styles.ts"
    - "lib/email/__tests__/token.test.ts"
    - "lib/email/__tests__/cta-logic.test.ts"
  modified:
    - ".env.local.example"

key-decisions:
  - "Token uses HMAC-SHA256 with dedicated EMAIL_LINK_SECRET env var for email link security"
  - "CTA escalation has only 2 levels (soft/medium) -- no aggressive tier per UI-SPEC"
  - "Warm-up starts at 50/day, reaches 500/day cap around day 19 (~3 weeks) via 50% increase every 3 days"
  - "Delivery enqueue routes by subscriber_preferences.delivery_time matching time_window parameter"

patterns-established:
  - "HMAC token pattern: generateToken(subscriberId, action) -> hex, verifyToken(subscriberId, action, token) -> boolean"
  - "Email styles exported as const object for inline style injection in React Email templates"
  - "CTA level pattern: getCtaLevel({ clickCount, feedbackCount? }) -> CtaLevel"

requirements-completed: [MAIL-05, MAIL-06, MAIL-08, MAIL-09, FDBK-01]

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 6 Plan 1: Email Delivery Foundation Summary

**Database schema (send_log, subscriber_feedback, warm_up_config), pgmq email_delivery queue with 3 delivery-window cron jobs, HMAC-SHA256 token security module, CTA engagement logic, and shared email styles**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T20:37:34Z
- **Completed:** 2026-03-21T20:40:11Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created send_log, subscriber_feedback, and warm_up_config tables with RLS and proper indexes
- Set up email_delivery pgmq queue with enqueue function routing subscribers by delivery_time window
- Scheduled 4 pg_cron jobs: 3 delivery windows (morning/afternoon/evening) + warm-up auto-increment
- Built HMAC-SHA256 token module with timing-safe verification for secure email links
- Implemented CTA engagement logic with soft/medium escalation thresholds
- Created shared inline styles matching UI-SPEC color, typography, and spacing contract

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration** - `b37219c` (feat)
2. **Task 2: Tests (RED)** - `e6b82e6` (test)
3. **Task 2: Implementation (GREEN)** - `283120b` (feat)

_TDD: Task 2 followed red-green cycle with separate test and implementation commits._

## Files Created/Modified
- `supabase/migrations/007_email_delivery.sql` - send_log, subscriber_feedback, warm_up_config tables; email_delivery queue; enqueue function; 4 pg_cron jobs; warm-up increment function
- `lib/email/token.ts` - HMAC-SHA256 token generation and timing-safe verification
- `lib/email/cta-logic.ts` - CTA level determination based on click count and feedback count
- `lib/email/shared-styles.ts` - Shared inline style constants for email templates
- `lib/email/__tests__/token.test.ts` - 9 tests for token generation/verification
- `lib/email/__tests__/cta-logic.test.ts` - 7 tests for CTA engagement thresholds
- `.env.local.example` - Added EMAIL_LINK_SECRET and ADMIN_SECRET entries

## Decisions Made
- Token uses HMAC-SHA256 with dedicated EMAIL_LINK_SECRET env var (not SUPABASE_SERVICE_ROLE_KEY)
- CTA escalation has only 2 levels (soft/medium) per UI-SPEC -- no aggressive tier needed
- Warm-up progression: 50 -> 75 -> 113 -> 170 -> 255 -> 383 -> 500 (cap at ~day 19)
- Delivery enqueue routes by subscriber_preferences.delivery_time matching cron job time_window parameter

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

After deploying, the following SQL migration needs to be run in Supabase SQL Editor:
- `supabase/migrations/007_email_delivery.sql`

Environment variables to add to production:
- `EMAIL_LINK_SECRET` - Random HMAC secret for email link security
- `ADMIN_SECRET` - Secret key for admin dashboard access

## Next Phase Readiness
- Database tables and queue infrastructure ready for Plans 02 (email templates) and 03 (API endpoints)
- Token module ready for unsubscribe/feedback link generation in email templates
- CTA logic ready for template rendering with engagement-based escalation
- Shared styles ready for consistent email template styling
- Plans 02 and 03 can now run in parallel

## Self-Check: PASSED

All 7 files verified on disk. All 3 commits verified in git log.

---
*Phase: 06-email-delivery-compliance*
*Completed: 2026-03-21*
