---
phase: 02-subscriber-onboarding
plan: 03
subsystem: ui
tags: [framer-motion, onboarding, delivery-time, rss-feeds, sms-opt-in, f-g-e-microcopy]

# Dependency graph
requires:
  - phase: 02-subscriber-onboarding
    provides: "Zod onboarding schema, OnboardingFormData type, stepper container with useReducer state machine"
provides:
  - "Delivery time step with 3 preset time slot cards and timezone display"
  - "City text input for local content personalization"
  - "Sources step with dynamic RSS/Atom URL inputs and format validation"
  - "SMS opt-in section with benefits-first pitch and conditional phone input reveal"
affects: [02-subscriber-onboarding, onboarding-ui, stepper-steps]

# Tech tracking
tech-stack:
  added: []
  patterns: [benefits-first-opt-in, dynamic-input-list, conditional-reveal-animation]

key-files:
  created:
    - components/onboarding/step-delivery.tsx
    - components/onboarding/step-sources.tsx
  modified:
    - components/onboarding/stepper.tsx

key-decisions:
  - "Inline SVG icons for time slots rather than icon library -- keeps bundle lean, consistent with project conventions"
  - "Phone validation strips common formatting chars (spaces, dashes, parens) before E.164 check -- better UX than requiring exact format"
  - "URL validation uses new URL() constructor with protocol allowlist -- matches Zod schema approach for SSRF prevention"

patterns-established:
  - "Benefits-first opt-in: show value proposition card before revealing input, with Framer Motion expand animation"
  - "Dynamic input list: array of inputs with add/remove, committing only valid entries to parent state"
  - "Step component interface: receives data slice + onUpdate callback from stepper useReducer"

requirements-completed: [SIGN-04, SIGN-05, SIGN-06, SIGN-07, COPY-02]

# Metrics
duration: 3min
completed: 2026-02-22
---

# Phase 2 Plan 03: Delivery & Sources Steps Summary

**Delivery time selector with 3 F/G/E-framed time slot cards, city input, dynamic RSS feed URL inputs with format validation, and SMS opt-in with benefits-first pitch revealing phone input on interest**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-22T08:45:32Z
- **Completed:** 2026-02-22T08:49:08Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Built Delivery Time & Location step (Step 3) with three selectable time slot cards (Morning/Afternoon/Evening), auto-detected timezone display, and city text input for local content personalization
- Built Sources & SMS step (Step 4) with dynamic RSS/Atom URL inputs, HTTP/HTTPS-only format validation, and SMS benefits-first opt-in with conditional phone input reveal
- Wired both step components into the existing stepper, replacing placeholders from Plan 02-02
- All copy follows F/G/E (Fear/Greed/Ego) microcopy framework throughout both steps

## Task Commits

Each task was committed atomically:

1. **Task 1: Build Delivery Time & Location step** - `1458d3b` (feat)
2. **Task 2: Build Sources & SMS step** - `34acc7d` (feat)

## Files Created/Modified
- `components/onboarding/step-delivery.tsx` - Step 3: Delivery time selector with 3 time slot cards, timezone display, and city input
- `components/onboarding/step-sources.tsx` - Step 4: Dynamic RSS URL inputs with validation, SMS benefits pitch card with phone input reveal
- `components/onboarding/stepper.tsx` - Added StepDelivery and StepSources imports, replaced case 2 and case 3 placeholders with real components

## Decisions Made
- Used inline SVG icons for time slot cards (sunrise, sun, moon) rather than adding an icon library -- consistent with existing project pattern of no icon dependencies
- Phone validation strips formatting characters (spaces, dashes, parens) before applying E.164 regex -- provides better UX than requiring exact +1XXXXXXXXXX format
- URL inputs use a local state array for draft editing, committing only valid non-empty URLs to parent state -- prevents invalid URLs from persisting in stepper state
- SMS "No thanks" button uses primary variant when selected (not ghost) to make the active choice visually clear in both states

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Steps 3 and 4 are complete and wired into the stepper
- Only Step 5 (Confirmation) placeholder remains from Plan 02-04
- All form data flows through stepper useReducer state correctly
- Ready for Plan 02-04 (Confirmation step, Server Action submission, welcome email)

## Self-Check: PASSED

All files verified present on disk. Both task commits (1458d3b, 34acc7d) verified in git log.

---
*Phase: 02-subscriber-onboarding*
*Completed: 2026-02-22*
