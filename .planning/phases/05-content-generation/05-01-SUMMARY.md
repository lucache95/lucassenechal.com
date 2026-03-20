---
phase: 05-content-generation
plan: 01
subsystem: content
tags: [zod, ai-sdk, gemini, newsletter, content-generation, tdd]

# Dependency graph
requires:
  - phase: 04-research-engine
    provides: "ResearchResultRow input data shape from research_results table"
provides:
  - "ContentFormat, NewsletterContent, ResearchResultRow, FallbackContent type definitions"
  - "DigestSchema, BriefingSchema, MixedSchema Zod schemas with .describe() field guidance"
  - "VOICE_SYSTEM_PROMPT with Lucas writing voice exemplars and banned phrases"
  - "buildContentPrompt function formatting research results for LLM"
  - "generateNewsletterContent orchestrating LLM content generation for all 3 formats"
  - "validateOutputUrls anti-hallucination URL checker"
  - "generateFallbackContent for insufficient research results (< 3)"
affects: [05-02-email-rendering, 06-delivery-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns: ["generateText + Output.object with Gemini 2.5 Flash for content generation", "FORMAT_SCHEMAS map for schema selection by format key", "Anti-hallucination URL validation on LLM output"]

key-files:
  created:
    - lib/content/types.ts
    - lib/content/schemas.ts
    - lib/content/prompts.ts
    - lib/content/fallback.ts
    - lib/content/fallback.test.ts
    - lib/content/content-generator.ts
    - lib/content/content-generator.test.ts
  modified: []

key-decisions:
  - "Capital 'Never use:' in voice prompt matching natural sentence casing for banned phrases"
  - "Test assertion corrected to match actual prompt casing (Never vs never)"

patterns-established:
  - "FORMAT_SCHEMAS map: select Zod schema by ContentFormat key for schema-per-format dispatch"
  - "Voice system prompt: centralized writing voice rules imported by all content generators"
  - "Anti-hallucination pattern: validateOutputUrls checks every LLM-generated URL against input set"
  - "Fallback content: pre-written response bypassing LLM when insufficient research results"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04, QUAL-04]

# Metrics
duration: 4min
completed: 2026-03-20
---

# Phase 5 Plan 1: Content Generation Pipeline Summary

**Content generation pipeline with 3 Zod-validated newsletter formats (digest/briefing/mixed), Lucas voice prompt with exemplars, fallback for sparse results, and anti-hallucination URL validation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-20T19:50:52Z
- **Completed:** 2026-03-20T19:55:26Z
- **Tasks:** 2
- **Files created:** 7

## Accomplishments
- Complete content type system with ContentFormat, NewsletterContent, ResearchResultRow, and FallbackContent interfaces
- Three Zod schemas (DigestSchema, BriefingSchema, MixedSchema) with .describe() field guidance on every field for LLM output shaping
- Voice system prompt with Lucas's writing exemplars, banned phrases, anti-patterns, and URL hallucination guard
- Fallback module returning pre-written content when < 3 research results (no LLM call)
- Content generator using generateText + Output.object with Gemini 2.5 Flash
- Anti-hallucination URL validation preventing fabricated URLs from reaching subscribers
- 20 tests passing (8 fallback + 12 content-generator) with full mocked LLM coverage

## Task Commits

Each task was committed atomically:

1. **Task 1: Content types, Zod schemas, voice prompt, and fallback module** - `563d077` (feat)
2. **Task 2: Content generator with URL validation and tests for all 3 formats** - `874fd27` (feat)

_Both tasks followed TDD: RED (failing test) -> GREEN (implementation) -> verify_

## Files Created/Modified
- `lib/content/types.ts` - ContentFormat, ResearchResultRow, NewsletterContent, FallbackContent type definitions
- `lib/content/schemas.ts` - DigestSchema, BriefingSchema, MixedSchema with .describe() guidance per field
- `lib/content/prompts.ts` - VOICE_SYSTEM_PROMPT and buildContentPrompt for format-specific LLM prompting
- `lib/content/fallback.ts` - generateFallbackContent and MIN_RESULTS_THRESHOLD for insufficient results
- `lib/content/fallback.test.ts` - 8 tests for fallback content generation
- `lib/content/content-generator.ts` - generateNewsletterContent and validateOutputUrls core orchestration
- `lib/content/content-generator.test.ts` - 12 tests covering all 3 formats, fallback path, URL validation

## Decisions Made
- Test assertion casing corrected to match prompt's "Never use:" (capital N) rather than "never use:" -- natural sentence casing in the voice prompt

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test assertion casing mismatch**
- **Found during:** Task 2 (content-generator tests)
- **Issue:** Test expected `'never use: "dive into"'` but VOICE_SYSTEM_PROMPT uses `'Never use: "dive into"'` (capital N)
- **Fix:** Updated test assertion to match actual prompt casing
- **Files modified:** lib/content/content-generator.test.ts
- **Verification:** All 20 tests pass
- **Committed in:** 874fd27 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test assertion)
**Impact on plan:** Trivial casing fix in test. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All content types, schemas, prompts, and generation logic ready for Plan 2 (email rendering)
- NewsletterContent is the handoff type from content generation to email rendering
- 104 total tests passing (20 new + 84 existing) with zero regressions

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (563d077, 874fd27) verified in git log.

---
*Phase: 05-content-generation*
*Completed: 2026-03-20*
