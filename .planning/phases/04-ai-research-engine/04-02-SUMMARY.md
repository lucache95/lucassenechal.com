---
phase: 04-ai-research-engine
plan: 02
subsystem: database
tags: [postgresql, pgmq, pg_cron, pg_net, rls, supabase, queue, cron, research-pipeline]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: subscribers table (FK references)
provides:
  - 5 research pipeline database tables (research_queries, research_cache, research_results, sent_url_hashes, research_runs)
  - pgmq queue 'research_jobs' with 4 RPC wrappers for Edge Function access
  - pg_cron daily job at 6am UTC (enqueue + cleanup + Edge Function trigger)
  - enqueue_daily_research() function for batch subscriber job creation
  - cleanup_research_data() function for expired cache/query/hash removal
  - run-logger module (createRunLog, completeRunLog, failRunLog)
affects: [04-03, 04-04, 04-05, 04-06, research-pipeline, edge-functions]

# Tech tracking
tech-stack:
  added: [pgmq, pg_cron, pg_net]
  patterns: [pgmq-rpc-wrapper, vault-based-secrets, cross-runtime-env-detection]

key-files:
  created:
    - supabase/migrations/004_research_schema.sql
    - supabase/migrations/005_pgmq_setup.sql
    - lib/research/run-logger.ts
    - lib/research/run-logger.test.ts
  modified: []

key-decisions:
  - "Vault secrets commented out with placeholders -- must be set before cron job runs"
  - "Edge Function trigger in cron job commented out pending vault secret configuration"
  - "Cross-runtime env helper (getEnv) supports both Node.js process.env and Deno.env.get"
  - "vi.hoisted pattern for Vitest v4 mock variable hoisting compatibility"

patterns-established:
  - "pgmq RPC wrapper pattern: SQL functions wrapping pgmq.send/read/archive/delete for Edge Function access via supabase.rpc()"
  - "Research RLS pattern: service_role full access + deny all anon on pipeline tables"
  - "Cross-runtime env detection: typeof process/Deno checks for Node/Deno compatibility"
  - "Vitest v4 mock hoisting: vi.hoisted(() => { ... }) for mock variables used in vi.mock factory"

requirements-completed: [RSCH-09, OPS-01, OPS-02]

# Metrics
duration: 4min
completed: 2026-03-20
---

# Phase 4 Plan 2: Database Schema & Queue Infrastructure Summary

**5 research pipeline tables with RLS, pgmq queue with RPC wrappers, pg_cron daily scheduling at 6am UTC, and run-logger with 4 passing tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-20T00:59:00Z
- **Completed:** 2026-03-20T01:03:24Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- 5 database tables (research_queries, research_cache, research_results, sent_url_hashes, research_runs) with full RLS, 8 indexes, CHECK constraints, and FK relationships
- pgmq queue 'research_jobs' with 4 RPC wrapper functions (send, read, archive, delete) and enqueue_daily_research() batch function
- pg_cron job scheduled at 6am UTC daily: enqueue subscribers, cleanup expired data, trigger Edge Function
- Run logger module with createRunLog, completeRunLog, failRunLog -- cross-runtime compatible (Node.js + Deno)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create research pipeline database schema migration** - `950de14` (feat)
2. **Task 2: Create pgmq queue, RPC wrappers, cron job, and run logger** - `dbc6c8e` (feat)

## Files Created/Modified
- `supabase/migrations/004_research_schema.sql` - 5 research pipeline tables with RLS, indexes, CHECK constraints, cleanup function
- `supabase/migrations/005_pgmq_setup.sql` - pgmq queue creation, 4 RPC wrappers, enqueue function, pg_cron daily job
- `lib/research/run-logger.ts` - TypeScript helper for creating/completing/failing research run logs
- `lib/research/run-logger.test.ts` - 4 unit tests with mocked Supabase client

## Decisions Made
- Vault secrets and Edge Function trigger are commented out with clear placeholders -- user must set actual values before cron job executes successfully
- Used cross-runtime env detection (typeof process/Deno) in run-logger to support both Next.js server actions and Deno Edge Functions
- Used vi.hoisted() pattern for Vitest v4 mock variable hoisting -- vi.mock factory can't reference top-level variables in v4

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Vitest v4 mock hoisting incompatibility**
- **Found during:** Task 2 (run-logger test creation)
- **Issue:** Plan's test code defined mock variables as top-level constants, but Vitest v4 hoists vi.mock() above them causing ReferenceError
- **Fix:** Wrapped mock variable declarations in vi.hoisted(() => { ... }) to ensure they're available when vi.mock factory executes
- **Files modified:** lib/research/run-logger.test.ts
- **Verification:** All 4 tests pass
- **Committed in:** dbc6c8e (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Deno global reference error in Node.js test environment**
- **Found during:** Task 2 (run-logger implementation)
- **Issue:** Plan's getAdminClient() directly referenced Deno.env.get() which throws ReferenceError in Node.js/Vitest
- **Fix:** Extracted getEnv() helper with typeof guards for process and Deno globals, plus a Deno type declaration
- **Files modified:** lib/research/run-logger.ts
- **Verification:** Tests pass in Node.js environment, code will also work in Deno Edge Functions
- **Committed in:** dbc6c8e (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for tests to pass. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required

**External services require manual configuration:**
- Run migration `004_research_schema.sql` in Supabase Dashboard SQL Editor
- Run migration `005_pgmq_setup.sql` in Supabase Dashboard SQL Editor
- Verify pgmq extension is enabled (Supabase Dashboard -> Database -> Extensions)
- Verify pg_cron extension is enabled (Supabase Dashboard -> Database -> Extensions)
- Set Vault secrets (project_url, anon_key) and uncomment in 005_pgmq_setup.sql
- Uncomment Edge Function trigger in cron job after Vault secrets are configured

## Next Phase Readiness
- Database schema ready for all subsequent research pipeline plans
- pgmq queue ready for Edge Function message processing (Plan 04-06)
- Run logger ready for import by Edge Function orchestrator
- Types file (from Plan 01 partial) provides ResearchSource, ResearchError types used by run-logger

## Self-Check: PASSED

All files verified present, all commit hashes found in git log.

---
*Phase: 04-ai-research-engine*
*Completed: 2026-03-20*
