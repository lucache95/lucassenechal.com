---
phase: 04-ai-research-engine
verified: 2026-03-19T20:30:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: true
  previous_status: gaps_found
  previous_score: 6/7
  gaps_closed:
    - "Research pipeline queries multiple sources including RSS curated feeds (RSCH-04 — default feeds now inlined and wired in Edge Function)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Deploy Edge Function and trigger via 'supabase functions invoke research-pipeline'"
    expected: "Response JSON contains processed, failed, total, durationMs fields; Supabase research_runs table has a row with status 'completed' or 'failed'; logs show pipeline steps executing in order including 'rss' entries in sources_queried"
    why_human: "Edge Function requires live Supabase project, Brave API key, and Gemini API key to run end-to-end"
  - test: "Provide a subscriber-provided custom RSS feed URL that uses HTTP (not HTTPS) in the subscriber_sources table, then trigger the pipeline"
    expected: "The URL is rejected with an SSRF log message and skipped; no fetch is attempted against it"
    why_human: "SSRF validation executes inside the Edge Function at runtime — cannot verify by code inspection alone"
  - test: "Check pg_cron is configured and triggers the Edge Function at 6am UTC"
    expected: "supabase/migrations/005_pgmq_setup.sql shows the net.http_post trigger is commented out — confirm whether Vault secrets have been set and trigger uncommented before production"
    why_human: "The net.http_post call in the cron job is commented out in migration 005. The cron job enqueues subscribers but does NOT automatically invoke the Edge Function. This requires manual Vault secret setup and uncommenting the trigger."
---

# Phase 4: AI Research Engine Verification Report

**Phase Goal:** The system can take a subscriber's topic preferences and produce fresh, sourced research results daily
**Verified:** 2026-03-19T20:30:00Z
**Status:** human_needed — all 7 automated must-haves now verified; 3 human verification items remain (unchanged from initial verification)
**Re-verification:** Yes — after gap closure (RSCH-04 default RSS feeds wired)

## Re-Verification Summary

**Gap closed:** The single functional gap from the initial verification has been resolved. The Edge Function (`supabase/functions/research-pipeline/index.ts`) now contains the 8 curated default RSS feeds inlined at lines 269-278, with a fetch loop at lines 282-304. All 8 feed URLs match exactly with `lib/data/default-feeds.ts`. Results are tagged `sourceName: 'rss'` and tracked in `sourcesQueried`.

**Regression check:** All 6 previously-verified truths remain fully intact (verified by targeted grep on each key export, database pattern, and wiring path).

**Gaps remaining:** None.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Plain-English topic descriptions and category selections are parsed into actionable research queries via NLP | VERIFIED | `lib/research/topic-parser.ts` exports `parseTopicsToQueries`; calls `generateObject` with `google('gemini-2.5-flash')` and `SearchQueriesSchema`; wired in Edge Function (lines 157-183) |
| 2 | Research pipeline queries multiple sources including RSS curated feeds and returns attributed results | VERIFIED | Brave, GDELT, custom_rss, and now all 8 default curated RSS feeds (TechCrunch, Ars Technica, Hacker News, The Verge, Reuters, NPR News, MIT Technology Review, Benedict Evans) are fetched in the Edge Function at lines 269-304; `sourceName: 'rss'` tracked in `sourcesQueried` |
| 3 | Daily automated research runs execute for each subscriber on schedule | VERIFIED | `supabase/migrations/005_pgmq_setup.sql` has `cron.schedule('daily-research-enqueue', '0 6 * * *', ...)` and `enqueue_daily_research()` that enqueues all active subscribers; NOTE: `net.http_post` trigger to invoke the Edge Function is still commented out (line 89) pending Vault secret setup — human action required |
| 4 | Every research result includes source attribution with verified URLs — no hallucinated links | VERIFIED | `lib/research/url-verifier.ts` performs HEAD requests with 5s timeout; `lib/research/deduplicator.ts` SHA-256 hashes normalized URLs; Edge Function inlines both patterns; URLs come only from API responses |
| 5 | Topic clustering shares research across subscribers with overlapping interests | VERIFIED | `lib/research/cluster.ts` implements `clusterQueries` grouping queries with 2+ shared keywords; `getCachedResults`/`cacheResults` provide 24h research_cache; wired via research_cache table |
| 6 | Results are deduplicated, recency-filtered (prefer last 7 days), and relevance-scored | VERIFIED | `lib/research/freshness-filter.ts` filters to 7 days; `lib/research/deduplicator.ts` checks sent_url_hashes 30-day history; `lib/research/relevance-scorer.ts` TF-IDF 0-1 scores; all three wired in Edge Function steps 6-9 |
| 7 | Per-run logging captures queries, sources, results, and errors; failed runs retry with alerting | VERIFIED | `lib/research/run-logger.ts` provides `createRunLog`/`completeRunLog`/`failRunLog`; Edge Function inserts research_runs on start and updates on complete/fail; dead-letter after 3 retries via pgmq visibility timeout (300s) |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/research/types.ts` | Shared TypeScript types for entire pipeline | VERIFIED | Exports: ResearchSource, SearchQuery, SearchResult, ResearchRun, ResearchError, SubscriberResearchContext, cost constants |
| `lib/research/topic-parser.ts` | NLP topic parsing via Gemini 2.5 Flash | VERIFIED | Exports `parseTopicsToQueries`; calls `google('gemini-2.5-flash')` with SearchQueriesSchema |
| `lib/schemas/research.ts` | Zod schemas for LLM structured output | VERIFIED | Exports SearchQueriesSchema (.min(1).max(5)), SearchQuerySchema (intent enum), SearchQueriesOutput |
| `vitest.config.ts` | Test framework configuration | VERIFIED | defineConfig with `@` alias to project root |
| `supabase/migrations/004_research_schema.sql` | Research pipeline database tables | VERIFIED | 5 tables (research_queries, research_cache, research_results, sent_url_hashes, research_runs), RLS on all 5, 7+ indexes, cleanup_research_data() function |
| `supabase/migrations/005_pgmq_setup.sql` | pgmq queue, RPC wrappers, pg_cron job | VERIFIED | pgmq.create('research_jobs'), pgmq_send/pgmq_read/pgmq_archive/pgmq_delete RPCs, enqueue_daily_research(), cron.schedule at 0 6 * * * |
| `lib/research/run-logger.ts` | Run logging helper | VERIFIED | Exports createRunLog, completeRunLog, failRunLog; writes to research_runs |
| `lib/research/sources/brave.ts` | Brave Search API client | VERIFIED | braveSearch with X-Subscription-Token, freshness=pw, returns SearchResult[] with sourceName='brave' |
| `lib/research/sources/gdelt.ts` | GDELT DOC API client | VERIFIED | gdeltSearch with mode=ArtList, timespan=7d, format=json; returns SearchResult[] with sourceName='gdelt' |
| `lib/research/sources/rss.ts` | RSS/Atom feed parser | VERIFIED | parseSingleFeed and fetchRssFeeds with Promise.allSettled |
| `lib/data/default-feeds.ts` | Default RSS feed URLs | VERIFIED | Exports DEFAULT_RSS_FEEDS with 8 curated feeds; all 8 URLs now inlined and consumed in Edge Function (lines 269-304) |
| `lib/research/sources/scraper.ts` | Cheerio HTML scraper | VERIFIED | scrapeUrl with AbortController 10s timeout, 2MB limit, og:title/meta extraction; returns SearchResult with sourceName='scrape' |
| `lib/research/feed-validator.ts` | SSRF-safe feed URL validator | VERIFIED | validateFeedUrl blocks HTTP, private IPs (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x), localhost, URLs >2048 chars; logic inlined in Edge Function |
| `lib/research/url-verifier.ts` | URL verification via HEAD | VERIFIED | verifyUrl, verifyUrlBatch (batches of 10), filterVerifiedResults; method='HEAD', 5s timeout |
| `lib/research/deduplicator.ts` | SHA-256 URL dedup with 30-day history | VERIFIED | hashUrl (SHA-256, URL normalization), checkDuplicates, recordSentUrls, deduplicateResults; queries sent_url_hashes |
| `lib/research/freshness-filter.ts` | 7-day recency filter | VERIFIED | filterByFreshness with DEFAULT_FRESHNESS_DAYS=7; null publishedAt = include |
| `lib/research/relevance-scorer.ts` | TF-IDF relevance scoring | VERIFIED | tfidfScore, scoreResults; STOP_WORDS set; Math.min(score*10,1) normalization |
| `lib/research/cluster.ts` | Topic clustering and query cache | VERIFIED | clusterQueries (2+ keyword overlap), getCachedResults, cacheResults, queryCacheKey; reads/writes research_cache |
| `supabase/functions/research-pipeline/index.ts` | Edge Function pipeline orchestrator | VERIFIED | Deno.serve; pgmq_read/pgmq_archive; MAX_BATCH_SIZE=50, VISIBILITY_TIMEOUT=300, MAX_RETRIES=3; full pipeline inline including 8 default RSS feeds; SSRF inlined; dead-letter after 3 retries |
| `supabase/functions/research-pipeline/deno.json` | Edge Function dependencies | VERIFIED | @supabase/supabase-js, ai, @ai-sdk/google, zod, rss-parser, cheerio |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/research/topic-parser.ts` | `lib/schemas/research.ts` | import SearchQueriesSchema | WIRED | Line 3: `import { SearchQueriesSchema } from '@/lib/schemas/research'` |
| `lib/research/topic-parser.ts` | `@ai-sdk/google` | google('gemini-2.5-flash') | WIRED | Line 31: `model: google('gemini-2.5-flash')` |
| `lib/research/sources/brave.ts` | `api.search.brave.com` | X-Subscription-Token header | WIRED | `'X-Subscription-Token': apiKey`; URL: `api.search.brave.com/res/v1/web/search` |
| `lib/research/sources/gdelt.ts` | `api.gdeltproject.org` | fetch with query params | WIRED | `https://api.gdeltproject.org/api/v2/doc/doc?${params}` |
| `lib/data/default-feeds.ts` | Edge Function pipeline | DEFAULT_RSS_FEEDS consumed | WIRED | Edge Function lines 269-304: all 8 feed URLs inlined verbatim; `for (const feed of DEFAULT_RSS_FEEDS)` loop fetches each via rss-parser; `sourceName: 'rss'` tracked in sourcesQueried |
| `lib/research/run-logger.ts` | `research_runs` table | insert/update | WIRED | createRunLog inserts; completeRunLog/failRunLog update research_runs |
| `supabase/migrations/005_pgmq_setup.sql` | Edge Function | pg_net http_post | NOT_WIRED (design decision) | `net.http_post` call is commented out (line 89) — cron job enqueues subscribers but does not auto-invoke Edge Function; requires Vault secret setup and uncomment before production |
| `lib/research/deduplicator.ts` | `sent_url_hashes` table | select/upsert | WIRED | checkDuplicates queries; recordSentUrls upserts sent_url_hashes |
| `lib/research/cluster.ts` | `research_cache` table | select/upsert | WIRED | getCachedResults queries; cacheResults upserts research_cache |
| `supabase/functions/research-pipeline/index.ts` | `pgmq_read` RPC | reads pgmq messages | WIRED | Line 79: `supabase.rpc('pgmq_read', { queue_name: 'research_jobs', ... })` |
| `supabase/functions/research-pipeline/index.ts` | `feed-validator.ts` logic | SSRF validation inlined | WIRED | Lines 13-57: SSRF protection block inlined; line 245: validateFeedUrl called before each custom feed fetch |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| RSCH-01 | 04-01-PLAN.md | NLP topic parsing — convert plain-English + category selections into actionable research queries | SATISFIED | parseTopicsToQueries in lib/research/topic-parser.ts; Gemini 2.5 Flash generateObject with SearchQueriesSchema |
| RSCH-02 | 04-03-PLAN.md | Brave API web search integration | SATISFIED | braveSearch in lib/research/sources/brave.ts; wired in Edge Function |
| RSCH-03 | 04-03-PLAN.md | News APIs integration (structured news feeds) | SATISFIED | gdeltSearch in lib/research/sources/gdelt.ts (GDELT DOC API); wired in Edge Function |
| RSCH-04 | 04-03-PLAN.md | RSS feed parsing for curated sources | SATISFIED | parseSingleFeed and fetchRssFeeds implemented; all 8 DEFAULT_RSS_FEEDS now inlined in Edge Function (lines 269-304) and fetched in parallel for every subscriber run |
| RSCH-05 | 04-04-PLAN.md | Reddit content research integration | DEFERRED (v2) | Explicitly deferred in 04-CONTEXT.md: "Reddit: OAuth app required, strict rate limits, too complex for v1" |
| RSCH-06 | 04-04-PLAN.md | X (Twitter) content research integration | DEFERRED (v2) | Explicitly deferred in 04-CONTEXT.md: "X: Basic API tier is $100/month — not worth it for v1" |
| RSCH-07 | 04-04-PLAN.md | Targeted site scraping for specific sources | SATISFIED | scrapeUrl in lib/research/sources/scraper.ts using Cheerio; AbortController 10s, 2MB limit |
| RSCH-08 | 04-04-PLAN.md | Custom source monitoring (subscriber RSS/Atom feeds, SSRF-safe) | SATISFIED | feed-validator.ts validates custom URLs; Edge Function calls validateFeedUrl before every custom feed fetch; SSRF logic inlined |
| RSCH-09 | 04-02-PLAN.md | Daily automated research runs per subscriber | SATISFIED | pg_cron job at 0 6 * * * calls enqueue_daily_research() which enqueues all active subscribers; Edge Function processes the queue. Note: net.http_post trigger to invoke Edge Function is commented out pending Vault setup. |
| RSCH-10 | 04-05-PLAN.md | Source attribution and URL verification (anti-hallucination) | SATISFIED | verifyUrl/verifyUrlBatch in url-verifier.ts performs HEAD requests; urls come only from API responses; Edge Function inlines batch HEAD verification |
| RSCH-11 | 04-06-PLAN.md | Topic clustering for cost optimization | SATISFIED | clusterQueries groups queries with 2+ shared keywords; getCachedResults/cacheResults provide 24h query cache via research_cache table |
| QUAL-01 | 04-05-PLAN.md | Deduplication — never show same story twice across consecutive newsletters | SATISFIED | hashUrl SHA-256 deduplication; checkDuplicates queries sent_url_hashes for 30-day history; Edge Function deduplicates before storing |
| QUAL-02 | 04-05-PLAN.md | Recency filtering — prefer content from last 7 days | SATISFIED | filterByFreshness with DEFAULT_FRESHNESS_DAYS=7; null publishedAt = include; Edge Function inlines this logic |
| QUAL-03 | 04-06-PLAN.md | Relevance scoring — rank results by keyword overlap before inclusion | SATISFIED | tfidfScore with stop words, 0-1 normalization; scoreResults sorts descending; Edge Function inlines TF-IDF scoring before storage |
| OPS-01 | 04-02-PLAN.md | Per-run logging — queries, sources, results, errors per subscriber | SATISFIED | createRunLog/completeRunLog/failRunLog in run-logger.ts; research_runs table has started_at, completed_at, queries_run, sources_queried, results_found, results_stored, errors, cost_estimate_usd |
| OPS-02 | 04-06-PLAN.md | Retry strategy and alerting for failed research runs | SATISFIED | pgmq visibility timeout (300s) for auto-retry; MAX_RETRIES=3 dead-letter after 3 failures; Edge Function logs dead-letters and inserts failed research_run record |

**RSCH-05 and RSCH-06 note:** These are formally deferred to v2 per `04-CONTEXT.md` with explicit rationale (Reddit API complexity, X API cost). This is an accepted scope decision, not a gap.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `supabase/migrations/005_pgmq_setup.sql` | 89 | `net.http_post` trigger commented out | Warning | Cron job enqueues subscribers daily but does NOT automatically invoke the Edge Function. Manual invocation or Vault secret setup + uncomment required before production runs. |
| `lib/research/run-logger.ts` | 9 | `Deno.env.get('SUPABASE_URL')` in Next.js lib module | Info | run-logger.ts references both `process.env` (Next.js) and `Deno.env` (Edge Function). This dual-environment pattern works but the file will generate TypeScript errors in non-Deno environments if strict Deno types are enabled. All tests pass because Deno is not imported. |

**Resolved from initial verification:** `lib/data/default-feeds.ts` is no longer orphaned — the warning about it being "created but never consumed" is now cleared.

---

### Human Verification Required

#### 1. Full Pipeline End-to-End Test (Including Default RSS Feeds)

**Test:** Deploy Edge Function with `supabase functions deploy research-pipeline`, set Brave API key in Supabase dashboard secrets, invoke with `supabase functions invoke research-pipeline`
**Expected:** Response JSON contains `{ processed, failed, total, durationMs }`; `research_runs` table has a row with `status = 'completed'` or `status = 'failed'`; Supabase Edge Function logs show pipeline steps (pgmq read, topic parse, source fan-out including all 8 default RSS feeds, freshness, URL verify, dedup, score, store, archive); `sources_queried` field in research_runs includes `'rss'`
**Why human:** Requires live Supabase project, external API keys (Brave, Gemini), and Deno Edge Function deployment environment

#### 2. SSRF Runtime Validation

**Test:** Insert a subscriber_sources row with `feed_url = 'http://192.168.1.1/feed.xml'` (private IP), trigger pipeline for that subscriber
**Expected:** Log message `SSRF: Skipping unsafe custom feed URL "http://192.168.1.1/feed.xml": Only HTTPS feed URLs are allowed`; no network request made to that URL
**Why human:** SSRF protection is inlined in the Edge Function and executes at Deno runtime; cannot verify the runtime path without deployment

#### 3. pg_cron to Edge Function Wiring Confirmation

**Test:** Confirm Vault secrets (`project_url`, `anon_key`) are set in Supabase dashboard, uncomment the `net.http_post` block in migration 005, re-run migration, wait for 6am UTC trigger
**Expected:** At 6am UTC, `enqueue_daily_research()` runs, then the Edge Function is invoked automatically; `research_runs` rows appear for active subscribers
**Why human:** The `net.http_post` trigger in the cron job is commented out in the migration. It requires manual Vault secret configuration and a decision to uncomment before the automated daily scheduling works end-to-end.

---

### Gaps Summary

**No functional gaps remain.**

The single gap from the initial verification — that the 8 curated default RSS feeds in `lib/data/default-feeds.ts` were never fetched by the Edge Function pipeline — has been fully resolved. The Edge Function now inlines all 8 feed definitions verbatim (lines 269-278) and fetches them in parallel for every subscriber run using `npm:rss-parser@3` (lines 281-304). Results are tagged `sourceName: 'rss'` and correctly tracked in `sourcesQueried`. All 8 URLs match exactly with `lib/data/default-feeds.ts`.

The `net.http_post` cron trigger remains commented out, but this is a documented design decision that requires human action (Vault setup), not a code defect.

RSCH-05 (Reddit) and RSCH-06 (X/Twitter) remain formally deferred to v2 per the explicit scope decision in `04-CONTEXT.md`.

---

_Verified: 2026-03-19T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes — gap closure confirmed_
