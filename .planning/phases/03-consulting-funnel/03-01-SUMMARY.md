---
phase: 03-consulting-funnel
plan: 01
subsystem: database, api
tags: [ai-sdk, zod, supabase, react-pdf, anthropic, intake, business-plan]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase clients, project scaffold, Zod 4
  - phase: 1.1-homepage-pivot
    provides: Service card definitions in what-i-build.tsx, /work-with-me route
provides:
  - Curated 20-question intake library with typed IntakeQuestion interface
  - Reusable services.ts as single source of truth for 4 service offerings
  - Zod intake schemas (intakeAnswer, intakeSession, nextQuestionResponse)
  - Zod business plan schema with all 9 WORK-06 sections
  - Supabase migration for intake_sessions, intake_answers, intake_plans tables
  - AI SDK dependencies (ai, @ai-sdk/react, @ai-sdk/anthropic)
  - PDF generation dependency (@react-pdf/renderer)
affects: [03-02 consulting page, 03-03 intake UI, 03-04 plan generation, 03-05 lead capture]

# Tech tracking
tech-stack:
  added: [ai@6.0.97, @ai-sdk/react@3.0.99, @ai-sdk/anthropic@3.0.46, @react-pdf/renderer@4.3.2]
  patterns: [curated question library with AI selection hints, Zod schema with .describe() for AI output guidance]

key-files:
  created:
    - lib/data/intake-questions.ts
    - lib/data/services.ts
    - lib/schemas/intake.ts
    - lib/schemas/business-plan.ts
    - supabase/migrations/003_intake_sessions.sql
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Used separate core and deep-dive question arrays concatenated into INTAKE_QUESTIONS for clarity"
  - "Business plan schema uses .optional() on non-critical nested fields (tools in proposedSystemSteps) per research pitfall #6"
  - "Service data extracted to lib/data/services.ts as single source of truth -- WhatIBuild component can later import from here"

patterns-established:
  - "Curated question library pattern: static TypeScript data with aiContext hints for AI selection + priority for deterministic fallback"
  - "AI output schema pattern: Zod schema with .describe() on every field to guide structured generation"

requirements-completed: [WORK-04, WORK-11]

# Metrics
duration: 3min
completed: 2026-02-22
---

# Phase 3 Plan 01: Foundation Data, Schemas & Dependencies Summary

**AI SDK v6 + PDF renderer installed, 20-question intake library with typed categories, Zod schemas for intake flow and 9-section business plan, Supabase migration for intake persistence**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-22T23:31:06Z
- **Completed:** 2026-02-22T23:34:01Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed AI SDK v6 (ai, @ai-sdk/react, @ai-sdk/anthropic) and @react-pdf/renderer v4.3 as new dependencies
- Created curated 20-question intake library covering all WORK-04 categories (business, workflow, stack, scope, pain, timeline, deep) with typed IntakeQuestion interface, priority ordering, and AI context hints
- Created reusable services.ts with 4 service definitions (ai-automation, process-consulting, ongoing-management, training) including longDescription for consulting page cards
- Created Zod schemas for intake answers, sessions, next-question AI response, and the full 9-section business plan with .describe() guidance
- Created Supabase migration for intake_sessions, intake_answers, and intake_plans tables with RLS and service_role access pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create question library + service data** - `a786832` (feat)
2. **Task 2: Create Zod schemas and Supabase migration** - `7e58adc` (feat)

## Files Created/Modified
- `lib/data/intake-questions.ts` - Curated 20-question library with IntakeQuestion interface, MIN_QUESTIONS/STAGE_1_CAP/DEEP_DIVE_CAP constants
- `lib/data/services.ts` - 4 service definitions with id, icon, title, description, longDescription
- `lib/schemas/intake.ts` - Zod schemas: intakeAnswerSchema, intakeSessionSchema, nextQuestionResponseSchema
- `lib/schemas/business-plan.ts` - Zod businessPlanSchema with all 9 WORK-06 sections + BusinessPlan type
- `supabase/migrations/003_intake_sessions.sql` - intake_sessions, intake_answers, intake_plans tables with RLS
- `package.json` - Added ai, @ai-sdk/react, @ai-sdk/anthropic, @react-pdf/renderer dependencies
- `package-lock.json` - Lock file updated with 70 new packages

## Decisions Made
- Separated core questions (13) and deep-dive questions (7) into distinct arrays for clarity, concatenated into single INTAKE_QUESTIONS export
- Used .optional() on non-critical nested fields (tools in proposedSystemSteps) per research pitfall #6 to prevent schema validation failures
- Extracted service data to standalone lib/data/services.ts as single source of truth -- the existing WhatIBuild component can later import from here instead of inline data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Zod 4 locale types in node_modules emit TS1259 errors during `tsc --noEmit` without `--skipLibCheck`. This is a pre-existing Zod 4 issue affecting node_modules only, not our source files. All project files compile cleanly with `--skipLibCheck` (which is the default Next.js build behavior).

## User Setup Required

None - no external service configuration required for this plan. ANTHROPIC_API_KEY and Cal.com env vars will be needed in later plans (03-03 and 03-05).

## Next Phase Readiness
- Question library ready for AI question selection API (03-03)
- Schemas ready for intake UI validation (03-03) and plan generation (03-04)
- Service data ready for consulting landing page (03-02)
- Supabase migration ready for SQL Editor execution (adds to pending todos)
- All dependencies installed for remaining Phase 3 plans

## Self-Check: PASSED

All 5 created files verified on disk. Both task commits (a786832, 7e58adc) verified in git log.

---
*Phase: 03-consulting-funnel*
*Completed: 2026-02-22*
