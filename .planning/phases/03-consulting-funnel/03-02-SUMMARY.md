---
phase: 03-consulting-funnel
plan: 02
subsystem: ui
tags: [framer-motion, react, nextjs, consulting, landing-page, state-machine]

# Dependency graph
requires:
  - phase: 1.1-homepage-pivot
    provides: homepage consulting-hero pattern, trust-strip, footer, button component
provides:
  - ConsultingHero component with onStart callback for funnel transitions
  - ServiceGrid component matching homepage WhatIBuild card style
  - HowItWorks 3-step visual process component
  - FAQSection accordion component
  - FunnelStage state machine (landing/intake/generating/plan/booking/complete)
  - Full consulting landing page at /work-with-me
affects: [03-03-intake-form, 03-04-plan-generation, 03-05-booking]

# Tech tracking
tech-stack:
  added: []
  patterns: [client-side state machine for same-URL transitions, AnimatePresence stage switching]

key-files:
  created:
    - components/consulting/consulting-hero.tsx
    - components/consulting/service-grid.tsx
    - components/consulting/how-it-works.tsx
    - components/consulting/faq-section.tsx
  modified:
    - app/(marketing)/work-with-me/page.tsx
    - app/(marketing)/work-with-me/work-with-me-client.tsx

key-decisions:
  - "F/G/E headline: 'Stop Losing Deals to Manual Follow-Ups' -- fear of revenue loss, greed for efficiency, ego of modernizing"
  - "State machine uses AnimatePresence mode='wait' for smooth stage transitions without route changes"
  - "Footer and TrustStrip rendered inside landing stage (client component owns full layout)"
  - "FAQ uses plus-to-cross rotation pattern with AnimatePresence height animation"

patterns-established:
  - "Consulting component pattern: components/consulting/* for all consulting funnel UI"
  - "FunnelStage state machine: single useState managing page transitions via AnimatePresence"
  - "Service card style parity: consulting service-grid mirrors homepage what-i-build exactly"

requirements-completed: [WORK-01, WORK-02, WORK-05, COPY-03]

# Metrics
duration: 2min
completed: 2026-02-22
---

# Phase 3 Plan 2: Consulting Landing Page Summary

**Full consulting landing page with F/G/E hero, service grid, how-it-works, FAQ accordion, and FunnelStage state machine for same-URL transitions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-22T23:31:18Z
- **Completed:** 2026-02-22T23:33:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Built 4 consulting page components (hero, service grid, how-it-works, FAQ) with Framer Motion animations matching existing site patterns
- Replaced placeholder /work-with-me page with full consulting landing experience
- Implemented FunnelStage state machine with AnimatePresence transitions for landing/intake/generating/plan/booking/complete stages
- Updated page metadata for consulting-specific SEO

## Task Commits

Each task was committed atomically:

1. **Task 1: Create consulting components (hero, service grid, how-it-works, FAQ)** - `b7c83ec` (feat)
2. **Task 2: Replace placeholder page with state machine and compose landing view** - `84f0440` (feat)

## Files Created/Modified
- `components/consulting/consulting-hero.tsx` - F/G/E hero with CTA onStart callback
- `components/consulting/service-grid.tsx` - 4 service cards matching homepage WhatIBuild style
- `components/consulting/how-it-works.tsx` - 3-step visual (Answer Questions -> Get Your Plan -> Book a Call)
- `components/consulting/faq-section.tsx` - 4-item FAQ accordion with AnimatePresence expand/collapse
- `app/(marketing)/work-with-me/page.tsx` - Server Component with updated consulting SEO metadata
- `app/(marketing)/work-with-me/work-with-me-client.tsx` - Client Component with FunnelStage state machine

## Decisions Made
- F/G/E headline: "Stop Losing Deals to Manual Follow-Ups" -- fear of revenue loss, greed for more closes, ego of modernizing ops
- State machine uses AnimatePresence mode="wait" for clean stage transitions without route changes
- Footer and TrustStrip are rendered inside the landing stage (client component owns full layout)
- FAQ accordion uses plus icon that rotates 45deg to become a cross when expanded
- Inline service data (no lib/data/services.ts exists yet) matching homepage what-i-build.tsx exactly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Landing page complete with all static sections
- State machine shell ready for intake integration (Plan 03)
- CTA triggers transition to intake stage (placeholder renders)
- All stages have placeholder content for future plan implementations

## Self-Check: PASSED

All 7 files verified present. Both task commits (b7c83ec, 84f0440) verified in git log.

---
*Phase: 03-consulting-funnel*
*Completed: 2026-02-22*
