# Phase 4: AI Research Engine - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers the backend research pipeline: given a subscriber's stored topic preferences, the system executes daily research using Brave API, NewsData.io, and RSS feeds, then stores sourced, deduplicated, freshness-filtered results ready for content generation in Phase 5. No content generation or email sending in this phase — purely "topic preferences → research results in DB."

</domain>

<decisions>
## Implementation Decisions

### Queue & Scheduling Architecture
- Run research pipeline in Supabase Edge Functions triggered by pg_cron (runs close to DB, durable, 150s limit per invocation)
- Use pgmq (PostgreSQL message queue) for durable job queuing with visibility timeout retry handling
- Cron schedule: 6am UTC daily (8am Paris / midnight PT)
- Batch strategy: one Edge Function invocation pops and processes ALL pending subscriber jobs in batch

### Source Scope for v1
- Build: Brave API + NewsData.io/GDELT + RSS feed parsing — high quality, proven, manageable complexity
- Defer Reddit: OAuth app required, strict rate limits, too complex for v1
- Defer X (Twitter): Basic API tier is $100/month — not worth it for v1
- Site scraping: Cheerio HTML scraping for specific known sources only (not generic crawling)

### Anti-Hallucination & Attribution
- URLs: only include URLs returned directly by search/API — LLM never generates URLs
- URL verification: HEAD request for all URLs before storing, reject 4xx/5xx responses
- Freshness: hard 7-day cutoff (configurable to evergreen per-subscriber flag)
- Deduplication: 30-day window by URL hash — never show same story twice in a month

### Topic Clustering & Cost Optimization
- Clustering approach: keyword overlap in v1 — if topics share 2+ significant keywords, merge research jobs (shared query, cached results)
- Cache duration: 24h per query — results shared across subscribers with same effective query
- Relevance scoring: TF-IDF style keyword overlap % against subscriber's topic description (no LLM cost)
- Cost guardrail: $0.10/subscriber/day cap in config, skip additional sources if exceeded

### Claude's Discretion
- Exact NewsData.io vs GDELT choice (pick whichever has better free tier / easier integration)
- RSS feed list for default sources (pick 5-10 high-quality general sources as defaults)
- pgmq queue names and schema column names
- Error/retry logging table schema details

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/supabase/server.ts` — async Supabase server client (cookie-based, for SSR)
- `createClient` from `@supabase/supabase-js` with service_role key pattern (used in `app/actions/intake.ts`)
- `@ai-sdk/google` with `google('gemini-2.5-flash')` — established LLM pattern
- Zod 4 schema pattern (`lib/schemas/`) — use same pattern for research result schemas

### Established Patterns
- Service_role Supabase client for server-side DB writes (no RLS bypass needed for service_role)
- Server Actions with `'use server'` directive for data mutations
- Fire-and-forget pattern: `.catch(console.error)` without `await` for non-blocking operations
- Environment variables: `process.env.NEXT_PUBLIC_SUPABASE_URL`, `process.env.SUPABASE_SERVICE_ROLE_KEY`

### Integration Points
- New DB tables needed: `research_jobs`, `research_results`, `research_cache`, `sent_url_hashes` (dedup)
- Supabase Edge Functions: new `supabase/functions/` directory
- pgmq: enable via Supabase SQL `create extension if not exists pgmq`
- pg_cron: enable via Supabase SQL `create extension if not exists pg_cron`
- New env vars needed: `BRAVE_API_KEY`, `NEWSDATA_API_KEY` (or GDELT — free)

</code_context>

<specifics>
## Specific Ideas

- GDELT is free (no API key) — prefer if quality is sufficient vs NewsData.io paid tier
- Supabase Edge Function Deno runtime — use `npm:` specifiers for Node packages
- pgmq SQL API: `select pgmq.send('queue_name', '{"subscriber_id": "..."}'::jsonb)`
- Per-run logging should capture: start_time, end_time, subscriber_id, queries_run, sources_queried, results_found, errors[], cost_estimate_usd
- Research results table should store: url, title, snippet, source_name, published_at, relevance_score, query_id, subscriber_id, created_at

</specifics>

<deferred>
## Deferred Ideas

- Reddit integration — deferred to v2 (API complexity + rate limits)
- X (Twitter) integration — deferred to v2 ($100/month API cost)
- Vector embedding similarity for clustering — deferred to v2 (keyword overlap sufficient for v1)
- Per-subscriber delivery time scheduling — deferred (6am UTC fixed for v1)
- Admin dashboard for monitoring research runs — OPS-03 is in Phase 6 scope

</deferred>
