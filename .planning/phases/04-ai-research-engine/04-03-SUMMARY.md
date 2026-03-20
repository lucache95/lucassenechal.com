---
phase: 04-ai-research-engine
plan: 03
subsystem: research, api
tags: [brave-api, gdelt, rss, rss-parser, fetch, source-integration]

# Dependency graph
requires:
  - phase: 04-ai-research-engine
    provides: SearchResult interface, ResearchSource type, Vitest test framework
provides:
  - Brave Search API client with X-Subscription-Token auth and past-week freshness filter
  - GDELT DOC 2.0 API client with ArtList mode, 7-day timespan, date parsing
  - RSS/Atom feed parser with parallel fetching and per-feed error resilience
  - 8 curated default RSS feeds for baseline content sources
affects: [04-04, 04-05, 04-06]

# Tech tracking
tech-stack:
  added: [rss-parser 3.x (dev)]
  patterns: [vi.hoisted() for mock variable hoisting in Vitest v4, vi.stubGlobal('fetch') for API client testing, Promise.allSettled for parallel resilient fetching]

key-files:
  created:
    - lib/research/sources/brave.ts
    - lib/research/sources/brave.test.ts
    - lib/research/sources/gdelt.ts
    - lib/research/sources/gdelt.test.ts
    - lib/research/sources/rss.ts
    - lib/research/sources/rss.test.ts
    - lib/data/default-feeds.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Static import for rss-parser instead of dynamic import() to enable vi.mock interception in tests"
  - "vi.hoisted() pattern for mock variable hoisting in RSS tests (Vitest v4 compatibility)"
  - "vi.stubGlobal('fetch') pattern for mocking Brave and GDELT API clients"

patterns-established:
  - "API client pattern: async function returning SearchResult[], try/catch returning [] on all errors"
  - "vi.stubGlobal('fetch', mockFetch) for HTTP API client unit testing"
  - "vi.hoisted() + vi.mock() class mock for library mocking in Vitest v4"

requirements-completed: [RSCH-02, RSCH-03, RSCH-04]

# Metrics
duration: 5min
completed: 2026-03-20
---

# Phase 04 Plan 03: Source Integration Clients Summary

**Brave Search, GDELT DOC, and RSS feed parser clients returning normalized SearchResult[] with 27 passing tests across all source modules**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-20T01:46:46Z
- **Completed:** 2026-03-20T01:51:20Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Brave Search API client with X-Subscription-Token auth, freshness=pw filter, and graceful error/rate-limit handling
- GDELT DOC 2.0 API client with ArtList mode, json format, 7d timespan, and YYYYMMDDTHHMMSSZ date parsing
- RSS/Atom feed parser with parallel fetching via Promise.allSettled and per-feed error isolation
- 8 curated default RSS feeds covering Technology, World News, General News, and Tech Analysis
- 27 tests passing across all source modules (brave: 7, gdelt: 6, rss: 6, plus existing scraper: 8)

## Task Commits

Each task was committed atomically:

1. **Task 1: Brave Search API client** - `6833d2c` (feat) - TDD RED/GREEN: 7 tests + implementation
2. **Task 2: GDELT + RSS + default feeds** - `ffb2af3` (feat) - TDD RED/GREEN: 12 tests + 3 implementation files

_Note: TDD tasks combined RED/GREEN into single commits due to efficient execution._

## Files Created/Modified
- `lib/research/sources/brave.ts` - Brave Web Search API client with X-Subscription-Token auth
- `lib/research/sources/brave.test.ts` - 7 tests covering params, auth, rate limits, errors, slicing
- `lib/research/sources/gdelt.ts` - GDELT DOC 2.0 API client with ArtList mode and date parsing
- `lib/research/sources/gdelt.test.ts` - 6 tests covering params, parsing, empty results, errors
- `lib/research/sources/rss.ts` - RSS/Atom feed parser with parallel fetching
- `lib/research/sources/rss.test.ts` - 6 tests covering parsing, sourceName, errors, parallel, resilience
- `lib/data/default-feeds.ts` - 8 curated default RSS feed URLs with categories
- `package.json` - Added rss-parser as devDependency
- `package-lock.json` - Updated lockfile

## Decisions Made
- Used static import for rss-parser instead of dynamic import() -- enables vi.mock interception in tests without timeout issues
- vi.hoisted() pattern for mock variable hoisting in RSS tests -- required for Vitest v4 compatibility with class mocks
- vi.stubGlobal('fetch') for API client testing -- cleaner than module-level fetch mocking

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Changed rss-parser from dynamic to static import**
- **Found during:** Task 2 (RSS feed parser tests)
- **Issue:** Dynamic import `(await import('rss-parser')).default` inside parseSingleFeed prevented vi.mock from intercepting, causing fetchRssFeeds tests to timeout at 5s
- **Fix:** Changed to static `import RssParser from 'rss-parser'` at module top-level
- **Files modified:** lib/research/sources/rss.ts
- **Verification:** All 6 RSS tests pass in <1ms
- **Committed in:** ffb2af3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Import style change for testability. No functional or scope impact. In Edge Function deployment, rss-parser will use `npm:rss-parser@3` specifier regardless.

## Issues Encountered
- RSS fetchRssFeeds tests initially timed out due to dynamic import not being intercepted by vi.mock -- resolved by switching to static import

## User Setup Required

None - no external service configuration required for this plan. Brave API key is needed at runtime but was already documented in plan 04-03 frontmatter user_setup.

## Next Phase Readiness
- All three source clients ready for integration with research pipeline orchestrator (04-04+)
- Source clients follow consistent pattern: async function returning SearchResult[], [] on error
- Default feeds ready for use as fallback in RSS fetching
- 27 tests provide regression coverage for all source integrations

## Self-Check: PASSED

All 7 created files verified on disk. Both commit hashes (6833d2c, ffb2af3) verified in git log.

---
*Phase: 04-ai-research-engine*
*Completed: 2026-03-20*
