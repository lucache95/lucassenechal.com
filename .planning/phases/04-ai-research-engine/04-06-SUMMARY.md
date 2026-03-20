---
phase: 04-ai-research-engine
plan: 06
subsystem: research-pipeline
tags: [tfidf, relevance-scoring, topic-clustering, edge-function, pgmq, deno, ssrf, research-cache]

# Dependency graph
requires:
  - phase: 04-01
    provides: types, topic-parser, vitest config
  - phase: 04-02
    provides: pgmq setup, run-logger, deduplicator, freshness-filter, url-verifier
  - phase: 04-03
    provides: brave, gdelt, rss source clients
  - phase: 04-04
    provides: feed-validator (SSRF), cheerio scraper
provides:
  - TF-IDF relevance scorer (tfidfScore, scoreResults)
  - Topic clustering with 2+ keyword overlap (clusterQueries)
  - 24h query cache (getCachedResults, cacheResults, queryCacheKey)
  - Edge Function entry point orchestrating full research pipeline
affects: [05-content-generation, 06-admin-dashboard]

# Tech tracking
tech-stack:
  added: [rss-parser (deno), cheerio (deno), ai (deno), @ai-sdk/google (deno), zod (deno)]
  patterns: [inline-tfidf, keyword-overlap-clustering, pgmq-batch-processing, ssrf-inline-validation, deno-edge-function]

key-files:
  created:
    - lib/research/relevance-scorer.ts
    - lib/research/relevance-scorer.test.ts
    - lib/research/cluster.ts
    - lib/research/cluster.test.ts
    - supabase/functions/research-pipeline/index.ts
    - supabase/functions/research-pipeline/deno.json
  modified: []

key-decisions:
  - "Hand-rolled 30-line TF-IDF scorer with stop words instead of importing natural.js (2MB+ savings)"
  - "All pipeline logic inlined in Edge Function because Deno cannot import from lib/ directory"
  - "SSRF validation inlined from feed-validator.ts for custom RSS feed URLs in Edge Function"
  - "Promise.allSettled for parallel source fan-out within 150s Edge Function limit"

patterns-established:
  - "Inline TF-IDF: stop words filter, term frequency / total words, IDF approximation, normalize to 0-1"
  - "Keyword overlap clustering: 2+ shared keywords groups queries for cache sharing"
  - "Edge Function pgmq pattern: read batch -> process each -> archive on success, VT expiry on failure"
  - "Dead-letter after 3 retries via retry_count in pgmq message payload"

requirements-completed: [RSCH-11, QUAL-03, OPS-02]

# Metrics
duration: 3min
completed: 2026-03-20
---

# Phase 04 Plan 06: Relevance Scoring, Clustering, and Pipeline Edge Function Summary

**Hand-rolled TF-IDF relevance scorer, keyword-overlap topic clustering with 24h cache, and Deno Edge Function orchestrating full research pipeline from pgmq to stored results**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-20T01:53:55Z
- **Completed:** 2026-03-20T01:57:25Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- TF-IDF relevance scorer with stop words, 0-1 normalization, and batch scoring/sorting
- Topic clustering groups queries sharing 2+ keywords for shared cache lookup (24h TTL)
- Full Edge Function entry point: pgmq read -> topic parse -> source fan-out -> freshness -> URL verify -> dedup -> score -> store -> log -> archive
- SSRF protection inlined for custom feed URLs (HTTPS-only, no private IPs, no localhost)
- 3-retry dead-letter pattern via pgmq visibility timeout (300s)
- 13 unit tests passing for scorer and clustering modules

## Task Commits

Each task was committed atomically:

1. **Task 1: TF-IDF relevance scorer and topic clustering with cache** - `e809644` (feat)
2. **Task 2: Edge Function entry point orchestrating full pipeline** - `18304e3` (feat)

## Files Created/Modified
- `lib/research/relevance-scorer.ts` - Hand-rolled TF-IDF scorer with stop words, scoreResults batch sorter
- `lib/research/relevance-scorer.test.ts` - 6 tests: keyword overlap, zero overlap, normalization, empty handling
- `lib/research/cluster.ts` - clusterQueries (2+ keyword overlap), getCachedResults, cacheResults, queryCacheKey
- `lib/research/cluster.test.ts` - 7 tests: clustering groups, unique separation, cache hit/miss, hash consistency
- `supabase/functions/research-pipeline/index.ts` - Main Edge Function: pgmq batch processing, full pipeline inline
- `supabase/functions/research-pipeline/deno.json` - Deno dependencies (supabase-js, ai, google, zod, rss-parser, cheerio)

## Decisions Made
- Hand-rolled 30-line TF-IDF scorer instead of natural.js library (2MB+ bundle savings, only 30 lines needed)
- All pipeline logic inlined in Edge Function because Deno Edge Functions cannot directly import from lib/ directory
- SSRF validation logic duplicated inline from lib/research/feed-validator.ts for Edge Function safety
- Promise.allSettled for parallel source fan-out to stay within 150s Edge Function wall-clock limit
- Visibility timeout set to 300s (5 min) -- well above 150s Edge Function limit per Pitfall 2
- Dead-letter after 3 retries tracked via retry_count in pgmq message payload
- Top 20 results per subscriber per day cap to control storage costs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Full research pipeline is code-complete: topic parsing, source integration, pipeline orchestration, scoring, caching
- Ready for Phase 5 (Content Generation) which consumes research_results
- Edge Function deployment requires: `supabase functions deploy research-pipeline` and setting Vault secrets
- Brave API key, Gemini API key, and Supabase project URL/anon key must be configured in Supabase dashboard

---
*Phase: 04-ai-research-engine*
*Completed: 2026-03-20*
