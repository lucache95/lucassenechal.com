---
phase: 05-content-generation
plan: 02
subsystem: content
tags: [deno, edge-function, supabase, gemini, ai-sdk, newsletter, content-generation, zod, rls]

# Dependency graph
requires:
  - phase: 05-content-generation
    plan: 01
    provides: "Content types, Zod schemas, voice prompt, fallback logic, and generator logic to inline in Edge Function"
  - phase: 04-research-engine
    provides: "research_results table, research-pipeline Edge Function to add trigger to"
provides:
  - "newsletter_content table for storing generated content per subscriber per day"
  - "content-generation Deno Edge Function with inlined schemas, voice prompt, fallback, and URL validation"
  - "Research pipeline trigger wiring (fire-and-forget fetch to content-generation)"
affects: [06-delivery-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Deno Edge Function with inlined content generation logic (cannot import from lib/)", "UPSERT on subscriber_id + research_date for idempotent content storage", "Fire-and-forget cross-function trigger via fetch without await", "Cost estimation at Gemini 2.5 Flash rates ($0.30/M input + $2.50/M output)"]

key-files:
  created:
    - supabase/migrations/006_newsletter_content.sql
    - supabase/functions/content-generation/index.ts
    - supabase/functions/content-generation/deno.json
  modified:
    - supabase/functions/research-pipeline/index.ts

key-decisions:
  - "Content generation Edge Function inlines all lib/content/* logic verbatim (Deno cannot import from lib/)"
  - "Fire-and-forget trigger pattern: research pipeline does not await content generation result"
  - "URL validation halts content storage on hallucinated URLs (subscriber gets no newsletter rather than broken links)"
  - "Cost estimation using Gemini 2.5 Flash rates: $0.30/M input + $2.50/M output"

patterns-established:
  - "Fire-and-forget cross-function trigger: fetch().catch() without await for non-blocking Edge Function chaining"
  - "UPSERT with onConflict for idempotent per-subscriber-per-day content storage"
  - "Dynamic imports inside Deno.serve handler for AI SDK, Google provider, and Zod"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04, QUAL-04]

# Metrics
duration: 3min
completed: 2026-03-20
---

# Phase 5 Plan 2: Content Generation Edge Function & Pipeline Wiring Summary

**Deno Edge Function generating newsletter content from research results via Gemini 2.5 Flash with UPSERT storage, and research pipeline trigger wiring for automated end-to-end flow**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-20T19:58:31Z
- **Completed:** 2026-03-20T20:01:59Z
- **Tasks:** 2
- **Files created:** 3
- **Files modified:** 1

## Accomplishments
- Database migration creating newsletter_content table with UPSERT support, RLS policies, and cost tracking columns
- Content generation Deno Edge Function with full inlined logic: 3 Zod schemas, voice prompt, fallback, URL validation, Gemini 2.5 Flash generation
- Research pipeline wired to trigger content generation after storing results via fire-and-forget fetch
- Anti-hallucination URL validation prevents broken links from reaching subscribers
- 104 tests passing with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration and content generation Edge Function** - `1e69945` (feat)
2. **Task 2: Wire research pipeline to trigger content generation** - `d7c2277` (feat)

## Files Created/Modified
- `supabase/migrations/006_newsletter_content.sql` - newsletter_content table with UPSERT-safe unique index, RLS, cost tracking
- `supabase/functions/content-generation/index.ts` - Deno Edge Function: reads research results, generates content via Gemini 2.5 Flash, stores via UPSERT
- `supabase/functions/content-generation/deno.json` - Import map for supabase-js, ai, google, zod
- `supabase/functions/research-pipeline/index.ts` - Added Step 11.5: fire-and-forget trigger to content-generation Edge Function

## Decisions Made
- Inlined all content logic from lib/content/*.ts (types, schemas, prompts, fallback, URL validation) since Deno Edge Functions cannot import from lib/
- Fire-and-forget trigger pattern: fetch().catch() without await ensures research pipeline is not blocked by content generation
- URL validation returns 200 with error details (not 500) when hallucinated URLs detected -- subscriber gets no newsletter rather than broken links
- Cost estimation calculated from token usage at Gemini 2.5 Flash rates ($0.30/M input + $2.50/M output)
- deno.json uses bare specifier imports matching research-pipeline pattern for consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. The content-generation Edge Function will be deployed alongside the research-pipeline function.

## Next Phase Readiness
- Full automated pipeline complete: research -> store results -> trigger content gen -> store newsletter content
- newsletter_content table ready for Phase 6 email rendering to read from
- NewsletterContent JSONB stored in content_json column with format-specific structure (digest/briefing/mixed)
- Migration pending execution in Supabase SQL Editor

## Self-Check: PASSED

All files verified:
- supabase/migrations/006_newsletter_content.sql: FOUND
- supabase/functions/content-generation/index.ts: FOUND
- supabase/functions/content-generation/deno.json: FOUND
- supabase/functions/research-pipeline/index.ts: FOUND (modified)
- Commit 1e69945: FOUND
- Commit d7c2277: FOUND
- Tests: 104/104 passing

---
*Phase: 05-content-generation*
*Completed: 2026-03-20*
