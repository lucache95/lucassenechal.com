---
phase: 02-subscriber-onboarding
plan: 02
subsystem: ui
tags: [framer-motion, useReducer, AnimatePresence, stepper, onboarding, fge-microcopy]

# Dependency graph
requires:
  - phase: 02-subscriber-onboarding
    provides: "Zod onboarding schema, topic data structure with 8 categories/41 subtopics"
  - phase: 01-foundation
    provides: "Button/Input UI primitives, Tailwind theme, Framer Motion"
provides:
  - "Onboarding route at /onboarding with subscriber UUID from searchParams"
  - "Stepper container with useReducer state machine (5-step, direction-aware AnimatePresence transitions)"
  - "Progress bar with numbered dots, connecting lines, step labels, and animation"
  - "Topics step with expandable category cards, subtopic chip selection, and custom topics textarea"
  - "Format step with 3 identity-framed format cards (digest, briefing, mixed) and radio selection"
  - "F/G/E microcopy on all step headers and descriptions"
affects: [02-subscriber-onboarding, onboarding-ui, step-delivery, step-sources, confirmation]

# Tech tracking
tech-stack:
  added: []
  patterns: [useReducer-state-machine, direction-aware-AnimatePresence, fge-microcopy-framework, expandable-category-cards]

key-files:
  created:
    - app/onboarding/page.tsx
    - app/onboarding/layout.tsx
    - components/onboarding/stepper.tsx
    - components/onboarding/progress-bar.tsx
    - components/onboarding/step-topics.tsx
    - components/onboarding/topic-category-card.tsx
    - components/onboarding/step-format.tsx
  modified: []

key-decisions:
  - "Typed ease tuple [number, number, number, number] for Framer Motion variant type compatibility"
  - "Stepper exports OnboardingFormData type for step components to import (type sharing via barrel)"
  - "Progress bar uses numbered dots with animated connecting lines (segmented bar pattern)"

patterns-established:
  - "Step component interface: receives data slice + onUpdate callback + onNext/onBack from stepper"
  - "Category card expand/collapse: AnimatePresence with height auto transition"
  - "Format card radio selection: motion.button with whileTap scale and checkmark animation"

requirements-completed: [SIGN-01, SIGN-02, SIGN-03, COPY-02]

# Metrics
duration: 4min
completed: 2026-02-22
---

# Phase 2 Plan 02: Stepper + Steps 1-2 Summary

**Multi-step onboarding stepper with useReducer state machine, direction-aware AnimatePresence transitions, expandable topic category cards with 8 categories/41 subtopics, and 3 identity-framed format choices using F/G/E microcopy**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-22T08:44:58Z
- **Completed:** 2026-02-22T08:49:15Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created /onboarding route with layout (metadata, centered container) and page (reads subscriber UUID from searchParams, redirects to /newsletter if missing)
- Built stepper container with useReducer state machine managing 5-step form state, direction tracking, and AnimatePresence direction-aware slide transitions
- Implemented progress bar with numbered step dots, animated connecting lines, step labels, and current step highlight with subtle scale animation
- Built Topics step with 8 expandable category cards showing "(Most Popular)" badges, selectable subtopic chips, selected count badges, and a custom topics textarea (500 char limit with counter)
- Built Format step with 3 visually distinct format cards (Curated Digest, Written Briefing, Mixed) using identity-framed F/G/E microcopy ("For the scanner...", "For the thinker...", "For the person who wants both...")
- Auto-detects timezone on mount via Intl.DateTimeFormat
- Navigation includes Back, Continue, and "Skip this step" buttons with correct visibility logic per step

## Task Commits

Each task was committed atomically:

1. **Task 1: Create onboarding route, stepper container, and progress bar** - `b2a89fd` (feat)
2. **Task 2: Build Topics step and Format step with F/G/E copy** - `b9e1011` (feat)

## Files Created/Modified
- `app/onboarding/layout.tsx` - Minimal onboarding layout with metadata and centered max-w-2xl container
- `app/onboarding/page.tsx` - Server Component reading ?subscriber=UUID, redirects if missing
- `components/onboarding/stepper.tsx` - Main stepper with useReducer state machine, AnimatePresence transitions, navigation buttons
- `components/onboarding/progress-bar.tsx` - 5-step progress indicator with numbered dots, connecting lines, and step labels
- `components/onboarding/step-topics.tsx` - Topic selection step with expandable categories and custom topics textarea
- `components/onboarding/topic-category-card.tsx` - Expandable category card with subtopic chips and "(Most Popular)" badge
- `components/onboarding/step-format.tsx` - Format choice step with 3 identity-framed cards and radio selection

## Decisions Made
- Used typed ease tuple `[number, number, number, number]` instead of plain array to satisfy Framer Motion v12 TypeScript types for AnimatePresence variants
- Stepper exports `OnboardingFormData` type for step components to import, establishing a clean type-sharing pattern without a separate types file
- Progress bar uses numbered dots with animated connecting lines (segmented bar) rather than a continuous progress bar -- provides clearer step identification

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Framer Motion ease type incompatibility**
- **Found during:** Task 1 (stepper build verification)
- **Issue:** TypeScript build failed -- `number[]` not assignable to `Easing` type in Framer Motion variant transition
- **Fix:** Extracted ease values to a typed constant `const EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1]`
- **Files modified:** components/onboarding/stepper.tsx
- **Verification:** `npm run build` passes
- **Committed in:** b2a89fd (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix for Framer Motion compatibility. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Stepper shell with state machine ready for Plans 02-03 (Delivery + Sources steps)
- Step component interface pattern established for consistent implementation
- Progress bar and navigation buttons work across all 5 steps
- Placeholder step slots ready for Delivery (case 2), Sources (case 3), and Confirmation (case 4)

## Self-Check: PASSED

All 7 files verified present on disk. Both task commits (b2a89fd, b9e1011) verified in git log.

---
*Phase: 02-subscriber-onboarding*
*Completed: 2026-02-22*
