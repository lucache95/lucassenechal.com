# Phase 4: AI Research Engine - Research

**Researched:** 2026-03-19
**Domain:** Queue-driven AI research pipeline (Supabase Edge Functions, pgmq, Brave API, news/RSS sources, NLP topic parsing)
**Confidence:** HIGH

## Summary

Phase 4 builds the core research pipeline: given a subscriber's stored topic preferences, the system executes daily research using Brave API, GDELT, and RSS feeds, then stores sourced, deduplicated, freshness-filtered results in the database. The architecture uses Supabase Edge Functions (Deno runtime) triggered by pg_cron at 6am UTC, with pgmq providing durable job queuing and retry handling. No content generation or email sending -- purely "topic preferences in, research results out."

The critical technical challenges are: (1) orchestrating multiple external API calls within the 150-second Edge Function wall-clock limit, (2) implementing cost-effective NLP topic parsing via Gemini 2.5 Flash to convert plain-English descriptions into structured search queries, (3) anti-hallucination through source-only URLs with HEAD verification, and (4) TF-IDF relevance scoring and keyword-overlap clustering to keep costs under $0.10/subscriber/day. GDELT is recommended over NewsData.io for the news source because it is 100% free with no API key, updates every 15 minutes, and covers a 3-month rolling window.

**Primary recommendation:** Use pgmq for durable job queuing with per-subscriber messages, pg_cron + pg_net to trigger a single Edge Function at 6am UTC that batch-processes all pending jobs, GDELT DOC API (free, no key) for news, and a hand-rolled 30-line TF-IDF scorer instead of importing a library.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Queue: Supabase Edge Functions + pgmq + pg_cron at 6am UTC
- Batch strategy: one Edge Function invocation pops and processes ALL pending subscriber jobs in batch
- Sources v1: Brave API + NewsData.io/GDELT + RSS feed parsing; Reddit/X deferred
- Site scraping: Cheerio HTML scraping for specific known sources only (not generic crawling)
- Anti-hallucination: source-only URLs, HEAD verification, 7-day freshness, 30-day dedup by URL hash
- Clustering: keyword overlap (not embeddings), 24h cache, TF-IDF scoring, $0.10/subscriber/day cap
- Per-run logging: start_time, end_time, subscriber_id, queries_run, sources_queried, results_found, errors[], cost_estimate_usd

### Claude's Discretion
- Exact NewsData.io vs GDELT choice (pick whichever has better free tier / easier integration)
- RSS feed list for default sources (pick 5-10 high-quality general sources as defaults)
- pgmq queue names and schema column names
- Error/retry logging table schema details

### Deferred Ideas (OUT OF SCOPE)
- Reddit integration -- deferred to v2 (API complexity + rate limits)
- X (Twitter) integration -- deferred to v2 ($100/month API cost)
- Vector embedding similarity for clustering -- deferred to v2 (keyword overlap sufficient for v1)
- Per-subscriber delivery time scheduling -- deferred (6am UTC fixed for v1)
- Admin dashboard for monitoring research runs -- OPS-03 is in Phase 6 scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RSCH-01 | NLP topic parsing -- convert plain-English + categories into research queries | Gemini 2.5 Flash with structured output (Zod schema); LLM prompt converts freeform text to 3-5 search queries |
| RSCH-02 | Brave API web search integration | Brave Web Search API at `api.search.brave.com/res/v1/web/search`, `X-Subscription-Token` auth, $5/1000 requests |
| RSCH-03 | News APIs integration | GDELT DOC 2.0 API (free, no key, 3-month rolling window, 15-min updates) recommended over NewsData.io |
| RSCH-04 | RSS feed parsing for curated sources | `npm:rss-parser` via npm specifier in Deno Edge Function; 8 default feeds selected |
| RSCH-05 | Reddit content research integration | DEFERRED per CONTEXT.md -- skip in this phase |
| RSCH-06 | X (Twitter) content research integration | DEFERRED per CONTEXT.md -- skip in this phase |
| RSCH-07 | Targeted site scraping for specific sources | `npm:cheerio` for HTML parsing in Edge Function; fetch + parse known sites only |
| RSCH-08 | Custom source monitoring (subscriber RSS/Atom feeds) | Same rss-parser library; validate feed URL, block internal IPs (SSRF prevention), enforce 1MB size limit |
| RSCH-09 | Daily automated research runs per subscriber | pg_cron triggers Edge Function at 6am UTC via pg_net http_post; pgmq queues one message per subscriber |
| RSCH-10 | Source attribution and URL verification | HEAD request with 5s timeout for all URLs before storing; reject 4xx/5xx; never let LLM generate URLs |
| RSCH-11 | Topic clustering for cost optimization | Keyword overlap: if 2+ significant keywords match, share cached results; 24h cache keyed by normalized query |
| QUAL-01 | Deduplication -- never show same story twice | 30-day dedup via `sent_url_hashes` table; SHA-256 hash of normalized URL |
| QUAL-02 | Recency filtering -- prefer last 7 days | Hard 7-day cutoff on `published_at`; configurable `evergreen` flag per subscriber |
| QUAL-03 | Relevance scoring -- rank by keyword overlap | Hand-rolled TF-IDF: term frequency of query keywords in result title+snippet, scored 0-1 |
| OPS-01 | Per-run logging | `research_runs` table with start/end time, subscriber_id, queries, sources, results count, errors, cost |
| OPS-02 | Retry strategy and alerting | pgmq visibility timeout (300s); failed messages become visible again; max 3 retries tracked in message payload; dead-letter after 3 failures |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase Edge Functions | Deno 2.1+ runtime | Research pipeline execution | Runs close to DB, 150s limit, Deno runtime with npm: support |
| pgmq (PostgreSQL extension) | 1.10+ | Durable message queue | Built into Supabase, SQL-native, visibility timeout retry, archive |
| pg_cron (PostgreSQL extension) | built-in | Daily scheduling | Supabase-native, triggers Edge Functions via pg_net |
| pg_net (PostgreSQL extension) | built-in | HTTP calls from SQL | Bridges pg_cron to Edge Functions via http_post |
| @ai-sdk/google | 3.0.43+ | NLP topic parsing via Gemini 2.5 Flash | Already in project, structured output with Zod |
| ai (Vercel AI SDK) | 6.0.97+ | LLM orchestration | Already in project, generateObject for structured parsing |
| zod | 4.3.6+ | Schema validation for LLM outputs and API responses | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| rss-parser | 3.13.0 | RSS/Atom feed parsing | Import as `npm:rss-parser@3` in Edge Function |
| cheerio | 1.0.0 | HTML parsing for site scraping | Import as `npm:cheerio@1` for known-site scraping |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GDELT (recommended) | NewsData.io | NewsData.io has cleaner API but free tier is 200 credits/day with 12h delay; GDELT is fully free, real-time, no key needed |
| Hand-rolled TF-IDF | natural.js TfIdf class | natural.js is 2MB+; TF-IDF is 30 lines of code, no dependency needed |
| rss-parser | @mikaelporttila/rss (Deno native) | Deno-native but less battle-tested; rss-parser works via npm: specifier |

**Discretion decision: GDELT over NewsData.io.** GDELT is 100% free with no API key, updates every 15 minutes, covers 3-month rolling window across 100+ languages, and has a JSON API at `api.gdeltproject.org/api/v2/doc/doc`. NewsData.io free tier limits to 200 credits/day with 12-hour delay. For a daily research pipeline, GDELT is strictly better for v1.

## Architecture Patterns

### Recommended Project Structure
```
supabase/
  functions/
    research-pipeline/
      index.ts          # Main Edge Function entry point
      deno.json          # Function-specific deps
    _shared/
      supabase-client.ts # Shared Supabase admin client
      types.ts           # Shared TypeScript types
lib/
  research/
    topic-parser.ts      # NLP topic parsing (used by Edge Function AND server actions)
    brave-search.ts      # Brave API client
    gdelt-client.ts      # GDELT DOC API client
    rss-fetcher.ts       # RSS feed parser wrapper
    site-scraper.ts      # Cheerio-based scraper for known sites
    url-verifier.ts      # HEAD request URL verification
    deduplicator.ts      # URL hash dedup checker
    relevance-scorer.ts  # TF-IDF relevance scoring
    cluster.ts           # Topic clustering / cache lookup
sql/
  migrations/
    004_research_schema.sql  # All research tables
    005_pgmq_setup.sql       # Queue creation + cron job
```

### Pattern 1: Edge Function Entry Point
**What:** Single Edge Function that processes all pending research jobs in batch
**When to use:** Daily 6am UTC cron trigger
**Example:**
```typescript
// supabase/functions/research-pipeline/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Read batch of messages from pgmq (up to 50, 300s visibility timeout)
  const { data: messages } = await supabase.rpc('pgmq_read', {
    queue_name: 'research_jobs',
    vt: 300,
    qty: 50
  })

  for (const msg of messages ?? []) {
    try {
      const { subscriber_id } = msg.message
      // 1. Parse topics -> search queries (cached)
      // 2. Check cluster cache for shared results
      // 3. Fan out to Brave, GDELT, RSS
      // 4. Verify URLs via HEAD
      // 5. Score relevance via TF-IDF
      // 6. Dedup against sent_url_hashes
      // 7. Store results
      // 8. Log run
      // 9. Archive message
      await supabase.rpc('pgmq_archive', {
        queue_name: 'research_jobs',
        msg_id: msg.msg_id
      })
    } catch (err) {
      // Message becomes visible again after VT expires (retry)
      // Increment retry count in message payload
    }
  }

  return new Response(JSON.stringify({ processed: messages?.length ?? 0 }))
})
```

### Pattern 2: pgmq via SQL RPC Wrappers
**What:** Call pgmq functions from Edge Functions via Supabase RPC
**When to use:** Whenever reading/writing queue messages from application code
**Example:**
```sql
-- Create wrapper functions for pgmq (Edge Functions call via supabase.rpc())
create or replace function pgmq_send(queue_name text, msg jsonb)
returns bigint as $$
  select pgmq.send(queue_name, msg);
$$ language sql;

create or replace function pgmq_read(queue_name text, vt integer, qty integer)
returns setof pgmq.message_record as $$
  select * from pgmq.read(queue_name, vt, qty);
$$ language sql;

create or replace function pgmq_archive(queue_name text, msg_id bigint)
returns boolean as $$
  select pgmq.archive(queue_name, msg_id);
$$ language sql;
```

### Pattern 3: Daily Cron Enqueue + Trigger
**What:** pg_cron enqueues one pgmq message per active subscriber, then triggers Edge Function
**When to use:** 6am UTC daily
**Example:**
```sql
-- Step 1: Store secrets in Vault
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<anon-key>', 'anon_key');

-- Step 2: Create function that enqueues all active subscribers
create or replace function enqueue_daily_research()
returns void as $$
declare
  sub record;
begin
  for sub in select id from subscribers where status = 'active' loop
    perform pgmq.send('research_jobs', jsonb_build_object(
      'subscriber_id', sub.id,
      'enqueued_at', now(),
      'retry_count', 0
    ));
  end loop;
end;
$$ language plpgsql;

-- Step 3: Schedule cron job at 6am UTC
select cron.schedule(
  'daily-research-enqueue',
  '0 6 * * *',
  $$
    -- Enqueue all subscribers
    select enqueue_daily_research();
    -- Trigger Edge Function to process
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
             || '/functions/v1/research-pipeline',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
      ),
      body := '{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
```

### Anti-Patterns to Avoid
- **Processing subscribers sequentially in SQL:** Use pgmq messages so each subscriber is an independent unit of work with independent retry
- **Calling LLM from pg_cron directly:** LLM calls must happen in Edge Functions (HTTP context), not in SQL functions
- **Storing raw HTML in results table:** Parse and extract relevant text before storing; HTML bloats the DB
- **Using a single Edge Function invocation for all sources:** Fan out API calls with Promise.allSettled for parallel execution within the 150s limit

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Message queue | Custom polling table | pgmq extension | Visibility timeout, archive, retry, batch read -- all battle-tested |
| Cron scheduling | setInterval / external cron | pg_cron + pg_net | Runs inside Supabase, triggers Edge Functions via HTTP, no external scheduler |
| RSS/Atom parsing | XML regex parsing | rss-parser (npm) | Handles RSS 0.9/1.0/2.0, Atom 1.0, encoding issues, date normalization |
| HTML scraping | Raw regex on HTML | cheerio (npm) | jQuery-like API, handles malformed HTML, CSS selectors |
| NLP topic parsing | Rule-based regex extraction | Gemini 2.5 Flash structured output | Freeform text is too varied for regex; LLM handles ambiguity, synonyms, context |

**Key insight:** The queue infrastructure (pgmq + pg_cron) eliminates the need for external job runners, Redis, or BullMQ. Everything stays within Supabase's PostgreSQL, reducing operational complexity for a solo operator.

## Common Pitfalls

### Pitfall 1: Edge Function 150s Timeout
**What goes wrong:** Processing 50+ subscribers with multiple API calls per subscriber exceeds 150s wall-clock limit
**Why it happens:** Sequential API calls (Brave + GDELT + RSS per subscriber) multiply latency
**How to avoid:** (1) Use Promise.allSettled to parallelize API calls within each subscriber. (2) Process subscribers in batches of 10-20 per invocation, not all at once. (3) If >20 subscribers, have the Edge Function process a batch, then re-trigger itself for the next batch via pg_net.
**Warning signs:** Edge Function returning 504 or timing out silently

### Pitfall 2: pgmq Message Visibility Timeout Too Short
**What goes wrong:** Message becomes visible again while still being processed, causing duplicate processing
**Why it happens:** VT set to 30s but processing takes 60s per subscriber
**How to avoid:** Set VT to 300s (5 minutes) -- well above the 150s Edge Function limit. If processing legitimately fails, the message retries after 5 minutes.
**Warning signs:** Duplicate results in research_results table for same subscriber+date

### Pitfall 3: Brave API Rate Limit (1 QPS on Free Credits)
**What goes wrong:** Rapid-fire Brave searches return 429 errors
**Why it happens:** Free credit tier is limited to 1 query per second; paid tier allows 50 QPS
**How to avoid:** (1) Implement sequential requests with 1.1s delay between Brave calls. (2) Batch similar queries via topic clustering before calling Brave. (3) Cache results by normalized query for 24h.
**Warning signs:** 429 responses from api.search.brave.com

### Pitfall 4: SSRF via Custom RSS Feeds
**What goes wrong:** Subscriber provides internal URL (http://169.254.169.254/metadata) as custom RSS feed
**Why it happens:** No validation on subscriber-provided feed URLs
**How to avoid:** (1) Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x). (2) Resolve DNS before fetching and check resolved IP. (3) Enforce HTTPS-only for custom feeds. (4) 1MB response size limit. (5) 10s fetch timeout.
**Warning signs:** Feeds resolving to internal IPs in logs

### Pitfall 5: GDELT Response Format Quirks
**What goes wrong:** GDELT DOC API returns inconsistent or empty results for certain query patterns
**Why it happens:** GDELT query syntax differs from standard search -- uses specific field operators
**How to avoid:** (1) Use the `query` parameter with space-separated keywords (AND logic). (2) Set `mode=ArtList` for article list format. (3) Set `maxrecords=50` to limit results. (4) Set `format=json` explicitly. (5) Handle empty `articles` array gracefully.
**Warning signs:** Empty results for queries that should return content

### Pitfall 6: URL Verification Blocking on Slow Sites
**What goes wrong:** HEAD requests to slow sites block the entire pipeline
**Why it happens:** No timeout on fetch, or timeout too generous
**How to avoid:** Use AbortController with 5-second timeout. Accept URLs where HEAD returns within 5s and status is 2xx/3xx. Reject 4xx/5xx and timeouts. Use Promise.allSettled to verify URLs in parallel batches of 10.
**Warning signs:** Pipeline taking >60s on URL verification step

## Code Examples

### NLP Topic Parsing with Gemini 2.5 Flash
```typescript
// Source: Project pattern from @ai-sdk/google + Zod 4
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const SearchQueriesSchema = z.object({
  queries: z.array(z.object({
    query: z.string().describe('Search query string for Brave/GDELT'),
    intent: z.enum(['news', 'analysis', 'tools', 'events', 'general']),
    keywords: z.array(z.string()).describe('Key terms for TF-IDF scoring'),
  })).min(1).max(5),
})

async function parseTopicsToQueries(
  topicDescription: string,
  categories: string[]
): Promise<z.infer<typeof SearchQueriesSchema>> {
  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: SearchQueriesSchema,
    prompt: `Convert this subscriber's topic preferences into 3-5 search queries.

Topic description: "${topicDescription}"
Selected categories: ${categories.join(', ')}

Rules:
- Each query should be 3-8 words, optimized for web search
- Extract the core intent (news, analysis, tools, events, general)
- Extract 2-5 keywords per query for relevance scoring
- Queries should cover different aspects of the subscriber's interests
- Be specific: "AI regulation EU 2026" not "AI news"`,
  })
  return object
}
```

### Brave Search API Client
```typescript
// Source: Brave Search API docs (brave.com/search/api/)
interface BraveSearchResult {
  title: string
  url: string
  description: string
  age?: string  // e.g., "2 hours ago"
  page_age?: string // ISO date
}

interface BraveSearchResponse {
  web?: { results: BraveSearchResult[] }
  news?: { results: BraveSearchResult[] }
}

async function braveSearch(query: string, count = 10): Promise<BraveSearchResult[]> {
  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&freshness=pw`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': Deno.env.get('BRAVE_API_KEY')!,
      },
    }
  )
  if (!response.ok) throw new Error(`Brave API ${response.status}`)
  const data: BraveSearchResponse = await response.json()
  return data.web?.results ?? []
}
```

### GDELT DOC API Client
```typescript
// Source: GDELT DOC 2.0 API (blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/)
interface GdeltArticle {
  url: string
  title: string
  seendate: string  // YYYYMMDDTHHMMSSZ
  socialimage: string
  domain: string
  language: string
  sourcecountry: string
}

async function gdeltSearch(query: string, maxRecords = 25): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query: query,
    mode: 'ArtList',
    maxrecords: String(maxRecords),
    format: 'json',
    sort: 'DateDesc',
    timespan: '7d',
  })
  const response = await fetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?${params}`
  )
  if (!response.ok) return [] // GDELT returns 200 even for empty, but handle errors
  const data = await response.json()
  return data.articles ?? []
}
```

### TF-IDF Relevance Scorer (Hand-Rolled)
```typescript
// Source: Standard TF-IDF algorithm, ~30 lines
function tfidfScore(queryKeywords: string[], title: string, snippet: string): number {
  const text = `${title} ${snippet}`.toLowerCase()
  const words = text.split(/\W+/).filter(w => w.length > 2)
  const totalWords = words.length
  if (totalWords === 0) return 0

  let score = 0
  for (const keyword of queryKeywords) {
    const term = keyword.toLowerCase()
    const termFreq = words.filter(w => w === term || w.includes(term)).length
    const tf = termFreq / totalWords
    // IDF approximation: rarer keywords score higher (use log scale)
    // For single-document scoring, we weight by keyword specificity
    const idf = Math.log(1 + 1 / (queryKeywords.length))
    score += tf * idf
  }
  // Normalize to 0-1 range
  return Math.min(score * 10, 1)
}
```

### URL Verification with HEAD Request
```typescript
// Source: Standard fetch pattern with AbortController
async function verifyUrl(url: string, timeoutMs = 5000): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    return response.ok // 2xx status
  } catch {
    return false // timeout, network error, or abort
  } finally {
    clearTimeout(timer)
  }
}

async function verifyUrlBatch(urls: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()
  // Process in batches of 10 to avoid overwhelming
  for (let i = 0; i < urls.length; i += 10) {
    const batch = urls.slice(i, i + 10)
    const checks = await Promise.allSettled(
      batch.map(async (url) => ({ url, valid: await verifyUrl(url) }))
    )
    for (const check of checks) {
      if (check.status === 'fulfilled') {
        results.set(check.value.url, check.value.valid)
      }
    }
  }
  return results
}
```

### URL Deduplication
```typescript
// Source: Standard SHA-256 hashing
async function hashUrl(url: string): Promise<string> {
  // Normalize URL: lowercase, remove trailing slash, strip query params for dedup
  const normalized = new URL(url)
  normalized.search = ''
  normalized.hash = ''
  const clean = normalized.toString().toLowerCase().replace(/\/$/, '')
  const encoder = new TextEncoder()
  const data = encoder.encode(clean)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
```

## Database Schema

### Required Tables

```sql
-- Research queries generated from topic parsing
create table research_queries (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id),
  query text not null,
  intent text not null, -- 'news', 'analysis', 'tools', 'events', 'general'
  keywords text[] not null,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '24 hours'
);

-- Cached research results (shared across subscribers with same query)
create table research_cache (
  id uuid primary key default gen_random_uuid(),
  query_hash text not null unique, -- SHA-256 of normalized query
  query text not null,
  results jsonb not null, -- array of {url, title, snippet, source, published_at}
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '24 hours'
);
create index idx_research_cache_hash on research_cache(query_hash);
create index idx_research_cache_expires on research_cache(expires_at);

-- Per-subscriber research results (after dedup + scoring)
create table research_results (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id),
  url text not null,
  url_hash text not null, -- for dedup lookups
  title text not null,
  snippet text,
  source_name text not null, -- 'brave', 'gdelt', 'rss', 'scrape'
  source_url text, -- original API/feed URL
  published_at timestamptz,
  relevance_score float not null default 0,
  query_id uuid references research_queries(id),
  research_date date not null default current_date,
  created_at timestamptz default now()
);
create index idx_results_subscriber_date on research_results(subscriber_id, research_date);
create index idx_results_url_hash on research_results(url_hash);

-- Deduplication tracking (30-day window)
create table sent_url_hashes (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id),
  url_hash text not null,
  sent_at timestamptz default now()
);
create unique index idx_sent_dedup on sent_url_hashes(subscriber_id, url_hash);
create index idx_sent_cleanup on sent_url_hashes(sent_at);

-- Per-run logging
create table research_runs (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id),
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null default 'running', -- 'running', 'completed', 'failed'
  queries_run integer default 0,
  sources_queried text[] default '{}',
  results_found integer default 0,
  results_stored integer default 0,
  errors jsonb default '[]',
  cost_estimate_usd numeric(10,6) default 0,
  created_at timestamptz default now()
);
create index idx_runs_subscriber on research_runs(subscriber_id, started_at desc);

-- pgmq setup
create extension if not exists pgmq;
select pgmq.create('research_jobs');

-- pg_cron + pg_net setup
create extension if not exists pg_cron;
create extension if not exists pg_net;
```

### Default RSS Feeds (Claude's Discretion)

Recommended 8 high-quality general sources covering tech, business, and world news:

| Feed | URL | Category |
|------|-----|----------|
| TechCrunch | `https://techcrunch.com/feed/` | Technology |
| Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` | Technology |
| Hacker News (top) | `https://hnrss.org/frontpage` | Technology |
| The Verge | `https://www.theverge.com/rss/index.xml` | Technology |
| Reuters World | `https://www.rss.reuters.com/news/topNews` | World News |
| NPR News | `https://feeds.npr.org/1001/rss.xml` | General News |
| MIT Technology Review | `https://www.technologyreview.com/feed/` | AI/Tech Analysis |
| Benedict Evans Newsletter | `https://www.ben-evans.com/feed` | Tech Analysis |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BullMQ + Redis for job queues | pgmq in PostgreSQL | 2024-2025 | No separate Redis infra needed; queues live in same DB |
| External cron (Railway, Vercel) | pg_cron inside Supabase | 2024 | No external scheduler; cron runs in DB, triggers via pg_net |
| NewsAPI.org (deprecated free tier) | GDELT DOC API (free) or Brave News endpoint | 2025-2026 | NewsAPI.org free tier restricted to dev; GDELT fully free |
| node-cron in long-running process | pg_cron + Edge Functions | 2024-2025 | Serverless, no persistent process needed |
| Brave Search free tier (2,000/month) | $5/1000 queries with $5 monthly credit | Late 2025 | Free tier removed; effectively 1,000 free queries/month |

## Cost Estimation

| Resource | Per-Subscriber/Day | At 100 Subscribers/Day | At 1000 Subscribers/Day |
|----------|-------------------|----------------------|------------------------|
| Brave API (3 queries/sub) | $0.015 | $1.50 | $15.00 |
| GDELT API | $0.00 (free) | $0.00 | $0.00 |
| Gemini 2.5 Flash (topic parsing) | ~$0.001 | $0.10 | $1.00 |
| RSS parsing | $0.00 (compute only) | $0.00 | $0.00 |
| Edge Function compute | ~$0.001 | $0.10 | $1.00 |
| **Total** | **~$0.017** | **$1.70** | **$17.00** |

With topic clustering (sharing queries across subscribers with overlapping interests), costs reduce by an estimated 40-60% at scale. The $0.10/subscriber/day cap is achievable -- estimated actual cost is $0.02/subscriber/day.

## Open Questions

1. **pgmq RPC wrapper approach**
   - What we know: Edge Functions cannot call `pgmq.send()` directly; need SQL wrapper functions exposed via `supabase.rpc()`
   - What's unclear: Whether Supabase has built-in RPC access to pgmq or if we must create wrapper functions
   - Recommendation: Create explicit SQL wrapper functions (`pgmq_send`, `pgmq_read`, `pgmq_archive`) as shown in Architecture Patterns

2. **Edge Function self-re-triggering for large batches**
   - What we know: 150s limit means ~20-30 subscribers per invocation with parallel API calls
   - What's unclear: Whether an Edge Function can reliably trigger another Edge Function invocation before returning
   - Recommendation: For v1 with <100 subscribers, single invocation is sufficient. Plan for batch splitting at scale.

3. **GDELT response reliability**
   - What we know: GDELT is free and comprehensive, but community reports occasional downtime
   - What's unclear: Actual uptime SLA (none -- it's a research project)
   - Recommendation: Use GDELT as supplementary source alongside Brave; if GDELT fails, log error and continue with Brave+RSS results

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x (not yet installed -- Wave 0 gap) |
| Config file | `vitest.config.ts` (Wave 0) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RSCH-01 | Topic parsing produces 3-5 valid search queries from freeform text | unit (mock LLM) | `npx vitest run tests/research/topic-parser.test.ts -t "parse"` | No -- Wave 0 |
| RSCH-02 | Brave API returns results and handles rate limits/errors | unit (mock fetch) | `npx vitest run tests/research/brave-search.test.ts` | No -- Wave 0 |
| RSCH-03 | GDELT API returns articles and handles empty responses | unit (mock fetch) | `npx vitest run tests/research/gdelt-client.test.ts` | No -- Wave 0 |
| RSCH-04 | RSS parser extracts items from RSS 2.0 and Atom feeds | unit | `npx vitest run tests/research/rss-fetcher.test.ts` | No -- Wave 0 |
| RSCH-07 | Cheerio scraper extracts content from known HTML structure | unit | `npx vitest run tests/research/site-scraper.test.ts` | No -- Wave 0 |
| RSCH-08 | Custom feed validation blocks internal IPs and enforces size limits | unit | `npx vitest run tests/research/feed-validator.test.ts` | No -- Wave 0 |
| RSCH-09 | Cron + pgmq enqueue/process flow works end-to-end | integration (manual) | SQL verification in Supabase dashboard | Manual only -- requires Supabase instance |
| RSCH-10 | URL verifier accepts 2xx, rejects 4xx/5xx, handles timeout | unit (mock fetch) | `npx vitest run tests/research/url-verifier.test.ts` | No -- Wave 0 |
| RSCH-11 | Topic clustering merges queries sharing 2+ keywords | unit | `npx vitest run tests/research/cluster.test.ts` | No -- Wave 0 |
| QUAL-01 | Deduplicator rejects URLs seen in last 30 days | unit | `npx vitest run tests/research/deduplicator.test.ts` | No -- Wave 0 |
| QUAL-02 | Freshness filter rejects results older than 7 days | unit | `npx vitest run tests/research/freshness.test.ts` | No -- Wave 0 |
| QUAL-03 | TF-IDF scorer ranks relevant results higher than irrelevant | unit | `npx vitest run tests/research/relevance-scorer.test.ts` | No -- Wave 0 |
| OPS-01 | Research run logging captures all required fields | unit | `npx vitest run tests/research/run-logger.test.ts` | No -- Wave 0 |
| OPS-02 | Retry logic increments count and dead-letters after 3 failures | unit | `npx vitest run tests/research/retry.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Install vitest: `npm install -D vitest`
- [ ] Create `vitest.config.ts` with path aliases matching tsconfig
- [ ] Create `tests/research/` directory
- [ ] All 14 test files listed above need creation

## Sources

### Primary (HIGH confidence)
- [Supabase pgmq Extension Docs](https://supabase.com/docs/guides/queues/pgmq) - SQL API for send, read, pop, archive, delete
- [Supabase Cron Docs](https://supabase.com/docs/guides/cron) - pg_cron scheduling
- [Supabase Scheduling Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions) - pg_cron + pg_net + Vault pattern
- [Supabase Edge Functions Dependencies](https://supabase.com/docs/guides/functions/dependencies) - npm: specifiers, deno.json
- [Brave Search API](https://brave.com/search/api/) - pricing ($5/1000), auth (X-Subscription-Token), endpoints
- [Brave Search API Pricing](https://api-dashboard.search.brave.com/documentation/pricing) - $5 monthly credit, rate limits
- [GDELT DOC 2.0 API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) - free, no key, ArtList mode, JSON format
- [Processing large jobs with Edge Functions, Cron, and Queues](https://supabase.com/blog/processing-large-jobs-with-edge-functions) - official architecture pattern
- [pgmq GitHub](https://github.com/pgmq/pgmq) - SQL function signatures, visibility timeout semantics

### Secondary (MEDIUM confidence)
- [rss-parser npm](https://www.npmjs.com/package/rss-parser) - v3.13.0, RSS/Atom parsing
- [tiny-tfidf GitHub](https://github.com/kerryrodden/tiny-tfidf) - minimal TF-IDF reference implementation
- [Brave drops free tier](https://www.implicator.ai/brave-drops-free-search-api-tier-puts-all-developers-on-metered-billing/) - free tier removal confirmed late 2025
- [GDELT Project](https://www.gdeltproject.org/) - 100% free, 15-min updates, 100+ languages
- [Build Queue Worker with Supabase](https://dev.to/suciptoid/build-queue-worker-using-supabase-cron-queue-and-edge-function-19di) - community integration pattern

### Tertiary (LOW confidence)
- [NewsData.io Free Tier](https://newsdata.io/blog/best-free-news-api/) - 200 credits/day claim (self-reported by vendor)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in official docs; pgmq/pg_cron/pg_net are Supabase-native extensions
- Architecture: HIGH - Pattern directly from Supabase official blog post on processing large jobs with Edge Functions + Cron + Queues
- Pitfalls: HIGH - Based on official API rate limits (Brave 1 QPS free tier), documented Edge Function limits (150s), and standard SSRF prevention
- Cost estimation: MEDIUM - Based on published pricing but actual per-subscriber query volume is estimated

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days - stable APIs, unlikely to change)
