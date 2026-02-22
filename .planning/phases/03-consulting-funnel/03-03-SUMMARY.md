---
phase: 03-consulting-funnel
plan: 03
subsystem: api, ui
tags: [ai-sdk, anthropic, claude-haiku, framer-motion, react, intake, question-selection, smart-input]

# Dependency graph
requires:
  - phase: 03-consulting-funnel
    plan: 01
    provides: Curated 20-question intake library, Zod intake schemas, AI SDK dependencies
  - phase: 03-consulting-funnel
    plan: 02
    provides: FunnelStage state machine, work-with-me page shell
provides:
  - AI question selection API route using Claude Haiku with 1.5s timeout fallback
  - IntakeContainer state machine with answer history, back/skip, session recovery
  - QuestionCard with AnimatePresence transitions and loading indicator
  - SmartInput rendering buttons, text, slider, multi-select per question type
  - IntakeProgress with adaptive progress bar and dual CTA at minimum threshold
  - Full intake flow integrated into /work-with-me FunnelStage state machine
affects: [03-04-plan-generation, 03-05-booking]

# Tech tracking
tech-stack:
  added: []
  patterns: [AI SDK v6 generateText with Output.object for structured responses, AbortController timeout pattern for AI fallback, useReducer state machine for multi-step form]

key-files:
  created:
    - app/api/intake/next-question/route.ts
    - components/intake/intake-container.tsx
    - components/intake/question-card.tsx
    - components/intake/smart-input.tsx
    - components/intake/intake-progress.tsx
  modified:
    - app/(marketing)/work-with-me/work-with-me-client.tsx

key-decisions:
  - "AI SDK v6 generateText + Output.object pattern for structured question selection (not generateObject)"
  - "1500ms AbortController timeout with deterministic priority-based fallback for guaranteed <2s response"
  - "useReducer state machine in IntakeContainer for predictable state transitions across answer/back/skip/restore"
  - "Session storage backup after each answer for intake recovery on page refresh"
  - "Auto-advance on button click (150ms delay for visual feedback) for Typeform-like UX"
  - "Show min-reached CTA as full overlay replacing question card (not inline with question)"

patterns-established:
  - "AI fallback pattern: AbortController timeout + deterministic priority sort for guaranteed responses"
  - "Intake component structure: components/intake/* for all intake flow UI"
  - "Multi-step form state: useReducer with typed actions and sessionStorage persistence"

requirements-completed: [WORK-03, WORK-05, WORK-09, WORK-10]

# Metrics
duration: 4min
completed: 2026-02-22
---

# Phase 3 Plan 03: AI Question Selection & Intake UI Summary

**AI-powered intake flow with Claude Haiku question selection, smart inputs (buttons/text/slider/multi-select), adaptive progress with generate-plan CTA at minimum threshold, back/skip navigation, and session recovery**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-22T23:37:25Z
- **Completed:** 2026-02-22T23:41:33Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Built AI question selection API route at `/api/intake/next-question` using Claude Haiku with 1.5s timeout and deterministic priority fallback
- Created 4 intake UI components: IntakeContainer (state machine), QuestionCard (animated display), SmartInput (4 input types), IntakeProgress (adaptive progress + dual CTA)
- Integrated full intake flow into /work-with-me page state machine, replacing placeholder with working IntakeContainer
- Session storage backup enables intake recovery on page refresh

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AI question selection API route** - `ef1c707` (feat)
2. **Task 2: Build intake UI components and wire into page state machine** - `b08b8b6` (feat)

## Files Created/Modified
- `app/api/intake/next-question/route.ts` - POST handler: AI question selection with Claude Haiku, 1.5s timeout, priority fallback
- `components/intake/intake-container.tsx` - useReducer state machine managing intake flow, answer history, session recovery
- `components/intake/question-card.tsx` - Single question display with AnimatePresence transitions and loading dots
- `components/intake/smart-input.tsx` - Renders correct input type per question (buttons auto-advance, text Enter-to-submit, slider, multi-select chips)
- `components/intake/intake-progress.tsx` - Adaptive progress bar with dual CTA (Generate My Plan / Answer more) at minimum threshold
- `app/(marketing)/work-with-me/work-with-me-client.tsx` - Replaced intake placeholder with IntakeContainer, typed IntakeAnswer state

## Decisions Made
- Used AI SDK v6 `generateText` with `Output.object({ schema })` pattern (not standalone `generateObject`) per plan specification
- 1500ms AbortController timeout ensures deterministic fallback kicks in before user perceives delay -- fallback uses priority-sorted question selection
- Graceful degradation: missing ANTHROPIC_API_KEY triggers immediate fallback to deterministic selection, never leaving user stuck
- useReducer chosen over useState for IntakeContainer to handle complex state transitions (answer, back, skip, restore) predictably
- Button-type inputs auto-advance with 150ms delay for visual feedback, creating Typeform-like feel
- Min-reached CTA displays as full card overlay replacing the question card, not competing with it inline

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing untracked `components/intake/plan-display.tsx` (from another branch/plan) has TS errors due to missing PDF module import. This is out of scope -- not our file, not tracked in git. Our files compile cleanly when excluding it.

## User Setup Required
- ANTHROPIC_API_KEY environment variable required for AI-powered question selection. Without it, the intake flow works using deterministic priority-based fallback (no AI needed for basic functionality).

## Next Phase Readiness
- Intake flow complete and integrated into /work-with-me page
- IntakeContainer calls `onComplete(answers)` with full IntakeAnswer array, ready for plan generation (03-04)
- State machine transitions to "generating" stage on plan generation trigger
- All answer data typed with Zod IntakeAnswer schema for downstream validation

## Self-Check: PASSED

All 5 created files and 1 modified file verified on disk. Both task commits (ef1c707, b08b8b6) verified in git log.

---
*Phase: 03-consulting-funnel*
*Completed: 2026-02-22*
