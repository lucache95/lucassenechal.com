# Architecture Research

**Domain:** AI-powered personalized newsletter & consulting platform
**Researched:** 2026-02-19
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Landing      │  │  Newsletter   │  │  Smart Intake │  │  Preference   │    │
│  │  Page         │  │  Signup Flow  │  │  Form (AI)    │  │  Management   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │                  │            │
├─────────┴─────────────────┴──────────────────┴──────────────────┴────────────┤
│                          NEXT.JS API LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  /api/subscribe│  │  /api/intake │  │  /api/prefs  │  │  /api/webhooks│    │
│  │  (signup)      │  │  (AI form)   │  │  (manage)    │  │  (Twilio in)  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │                  │            │
├─────────┴─────────────────┴──────────────────┴──────────────────┴────────────┤
│                          DATA & SERVICES LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                         SUPABASE                                     │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │ PostgreSQL │  │ Edge Funcs  │  │ pg_cron    │  │ Queues     │    │    │
│  │  │ (data)     │  │ (workers)   │  │ (scheduler)│  │ (pgmq)     │    │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                        EXTERNAL SERVICES                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Brave API│  │ News APIs│  │ Resend   │  │ Twilio   │  │ OpenAI/  │    │
│  │ (search) │  │ RSS/Scrape│  │ (email)  │  │ (SMS)    │  │ Claude   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Next.js Frontend | Landing page, signup flow, smart intake form, preference management pages | Next.js App Router + Framer Motion, server components for SEO pages, client components for interactive forms |
| Next.js API Routes | Lightweight request handling: signup, preference updates, Twilio webhook receiver, intake form AI orchestration | Route handlers in `app/api/`, thin controllers that validate input and dispatch to Supabase |
| Supabase PostgreSQL | All persistent data: subscribers, preferences, intake responses, research results, email logs, SMS logs | Tables with Row Level Security, token-based access for preference management (no login) |
| Supabase Edge Functions | Heavy processing: AI research pipeline execution, content generation, email composition | TypeScript functions invoked by pg_cron or queue consumers |
| Supabase pg_cron | Scheduling: daily research runs, email sends, SMS sends | Cron entries that invoke Edge Functions or process queue messages |
| Supabase Queues (pgmq) | Job management: research jobs per subscriber, email send jobs, SMS send jobs | Durable message queues with guaranteed delivery, visibility timeouts for retry handling |
| Brave API | Primary web search for research pipeline | HTTP calls from Edge Functions, results cached in PostgreSQL |
| News APIs / RSS / Scraping | Supplementary research sources | Fetched by Edge Functions during research pipeline execution |
| Resend | Email delivery | Called from Edge Functions with React Email templates |
| Twilio | SMS delivery + inbound SMS webhook | Outbound from Edge Functions, inbound via Next.js API webhook route |
| LLM (Claude/OpenAI) | Topic parsing, content generation, intake form question generation, SMS conversation AI, estimate generation | API calls from Edge Functions and Next.js API routes |

## Recommended Project Structure

```
lucassenechal-website/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page
│   ├── subscribe/
│   │   └── page.tsx            # Newsletter signup flow
│   ├── preferences/
│   │   └── [token]/
│   │       └── page.tsx        # Token-based preference management (no login)
│   ├── work-with-me/
│   │   └── page.tsx            # AI smart intake form
│   ├── api/
│   │   ├── subscribe/
│   │   │   └── route.ts        # POST: new subscriber
│   │   ├── preferences/
│   │   │   └── route.ts        # GET/PUT: manage preferences via token
│   │   ├── intake/
│   │   │   ├── question/
│   │   │   │   └── route.ts    # POST: get next AI question
│   │   │   └── estimate/
│   │   │       └── route.ts    # POST: generate AI estimate
│   │   └── webhooks/
│   │       └── twilio/
│   │           └── route.ts    # POST: inbound SMS handler
│   └── layout.tsx              # Root layout with shared styles
├── components/                  # Shared React components
│   ├── landing/                # Landing page sections
│   ├── signup/                 # Signup flow components
│   ├── intake/                 # Smart intake form components
│   └── ui/                     # Design system primitives
├── lib/                         # Shared utilities
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── types.ts            # Generated DB types
│   ├── ai/
│   │   ├── topic-parser.ts     # Parse natural language topics
│   │   ├── question-gen.ts     # Generate intake questions
│   │   └── estimate-gen.ts     # Generate project estimates
│   ├── resend/
│   │   └── client.ts           # Resend email client
│   └── twilio/
│       └── client.ts           # Twilio SMS client
├── emails/                      # React Email templates
│   ├── digest.tsx              # Curated digest format
│   ├── briefing.tsx            # Written briefing format
│   └── mixed.tsx               # Mixed format
├── supabase/
│   ├── migrations/             # Database migrations
│   ├── functions/              # Edge Functions (deployed to Supabase)
│   │   ├── research-pipeline/
│   │   │   └── index.ts        # Multi-source research execution
│   │   ├── content-generator/
│   │   │   └── index.ts        # Generate personalized content from research
│   │   ├── email-sender/
│   │   │   └── index.ts        # Compose and send emails via Resend
│   │   ├── sms-sender/
│   │   │   └── index.ts        # Send SMS summaries via Twilio
│   │   ├── sms-responder/
│   │   │   └── index.ts        # Process inbound SMS, generate AI replies
│   │   └── queue-processor/
│   │       └── index.ts        # Generic queue consumer dispatcher
│   └── seed.sql                # Seed data for development
├── public/                      # Static assets
└── package.json
```

### Structure Rationale

- **`app/`:** Next.js App Router for all pages and lightweight API routes. API routes handle request validation and dispatch only -- no heavy processing.
- **`supabase/functions/`:** All heavy, long-running work lives here as Edge Functions. This cleanly separates the web-serving concern from background processing.
- **`lib/`:** Shared code between API routes and any server-side logic. AI client wrappers, Supabase typed clients, external service clients.
- **`emails/`:** React Email templates co-located at the project root. Resend renders these server-side, so they stay separate from the app components.

## Architectural Patterns

### Pattern 1: Token-Based Preference Management (No Auth)

**What:** Instead of requiring login/signup with passwords, every subscriber gets a unique token embedded in email links. Clicking "Manage Preferences" in an email opens `/preferences/[token]` which loads their data directly.
**When to use:** When the product is a free service where login friction kills conversion, and the data sensitivity is low (newsletter preferences, not financial data).
**Trade-offs:** Simpler UX and zero auth overhead, but tokens can be shared/forwarded. Acceptable for newsletter preferences.

**Example:**
```typescript
// app/api/subscribe/route.ts
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  const { email, topics, format, location } = await req.json()
  const supabase = await createClient()
  const token = nanoid(32) // Unique preference management token

  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      email,
      topics_raw: topics,        // Plain-English description
      format_preference: format,  // 'digest' | 'briefing' | 'mixed'
      location,
      management_token: token,
      status: 'active'
    })
    .select()
    .single()

  // Queue topic parsing job
  await supabase.rpc('enqueue_job', {
    queue: 'topic_parsing',
    payload: { subscriber_id: data.id, topics_raw: topics }
  })

  return Response.json({ token, message: 'Subscribed' })
}
```

### Pattern 2: Queue-Driven Pipeline with Supabase pgmq

**What:** Every subscriber action that triggers heavy processing (signup, preference change, daily research) enqueues a job. Edge Functions consume queues on a cron schedule rather than processing inline.
**When to use:** Any time the response to the user should be fast but the actual work takes seconds to minutes (AI research, content generation, email sends).
**Trade-offs:** Adds complexity of queue management and eventual consistency, but makes the system resilient, retryable, and non-blocking. Essential at any scale beyond a handful of subscribers.

**Example:**
```sql
-- Supabase migration: create queues
SELECT pgmq.create('research_jobs');
SELECT pgmq.create('content_generation');
SELECT pgmq.create('email_sends');
SELECT pgmq.create('sms_sends');

-- Cron: process research queue every 5 minutes
SELECT cron.schedule(
  'process-research-queue',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/queue-processor',
    body := '{"queue": "research_jobs", "batch_size": 5}'::jsonb
  )$$
);
```

### Pattern 3: Subscriber-Scoped Research Pipeline

**What:** Each subscriber's research runs independently with their own parsed topics, source preferences, and result storage. Research results are stored per-subscriber-per-day, enabling both personalization and debugging.
**When to use:** When each user gets fundamentally different content (not just filtered/sorted, but researched differently).
**Trade-offs:** More compute per subscriber, but enables true personalization. Optimize later with shared research for overlapping topics.

**Example:**
```typescript
// supabase/functions/research-pipeline/index.ts
async function executeResearch(subscriberId: string, parsedTopics: Topic[]) {
  const results: ResearchResult[] = []

  for (const topic of parsedTopics) {
    // Fan out to multiple sources per topic
    const [braveResults, newsResults, rssResults] = await Promise.all([
      searchBrave(topic.query),
      searchNewsAPI(topic.keywords),
      fetchRSSFeeds(topic.feeds),
    ])

    // AI synthesizes multi-source results into coherent content
    const synthesized = await synthesizeWithAI({
      topic,
      sources: [...braveResults, ...newsResults, ...rssResults],
      subscriberContext: topic.context,
    })

    results.push(synthesized)
  }

  // Store results for content generation step
  await supabase.from('daily_research').insert({
    subscriber_id: subscriberId,
    research_date: new Date().toISOString().split('T')[0],
    results: results,
    sources_used: results.flatMap(r => r.sources),
  })

  // Enqueue content generation
  await pgmq.send('content_generation', {
    subscriber_id: subscriberId,
    research_date: new Date().toISOString().split('T')[0],
  })
}
```

## Data Flow

### Flow 1: Newsletter Signup

```
User fills signup form
    |
    v
Next.js API /api/subscribe
    |
    ├── Validate input
    ├── Insert subscriber record (Supabase PostgreSQL)
    ├── Generate management token
    ├── Enqueue "topic_parsing" job (pgmq)
    └── Return success + token to user

    ... async ...

pg_cron triggers Edge Function (every 5 min)
    |
    v
Edge Function: topic-parser
    ├── Read message from topic_parsing queue
    ├── Call LLM to parse plain-English topics into structured data
    ├── Update subscriber record with parsed_topics JSONB
    ├── Delete queue message (acknowledge)
    └── Subscriber is now ready for daily research
```

### Flow 2: Daily Research + Email Delivery (Core Loop)

```
pg_cron fires daily at configured time (e.g., 4:00 AM UTC)
    |
    v
Edge Function: daily-orchestrator
    ├── Query all active subscribers
    ├── For each subscriber, enqueue "research_jobs" message
    └── Exit

    ... queue processing (every 5 min) ...

Edge Function: research-pipeline (processes research_jobs queue)
    |
    ├── Read subscriber's parsed_topics
    ├── Fan out to sources:
    │   ├── Brave API (web search)
    │   ├── News APIs (headlines)
    │   ├── RSS feeds (subscribed sources)
    │   ├── Reddit API (relevant threads)
    │   └── Site scraping (specific URLs)
    ├── AI synthesis: merge, deduplicate, rank, summarize
    ├── Store in daily_research table
    ├── Enqueue "content_generation" message
    └── Acknowledge research_jobs message

Edge Function: content-generator (processes content_generation queue)
    |
    ├── Read research results from daily_research
    ├── Read subscriber's format preference (digest/briefing/mixed)
    ├── Call LLM to generate newsletter in chosen format
    ├── Store generated content in daily_emails table
    ├── Enqueue "email_sends" message
    └── If SMS opted in: enqueue "sms_sends" message

Edge Function: email-sender (processes email_sends queue)
    |
    ├── Read generated content from daily_emails
    ├── Render React Email template with content
    ├── Send via Resend API
    ├── Log delivery status
    └── Acknowledge message

Edge Function: sms-sender (processes sms_sends queue)
    |
    ├── Read generated content, create SMS-length summary
    ├── Send via Twilio API
    ├── Log delivery status
    └── Acknowledge message
```

### Flow 3: Inbound SMS Conversation

```
Subscriber texts phone number
    |
    v
Twilio webhook → Next.js API /api/webhooks/twilio
    |
    ├── Validate Twilio signature
    ├── Look up subscriber by phone number
    ├── Store inbound message in sms_conversations table
    ├── Enqueue "sms_response" job with conversation context
    └── Return 200 to Twilio (fast response)

    ... async ...

Edge Function: sms-responder (processes sms_response queue)
    |
    ├── Load conversation history from sms_conversations
    ├── Load subscriber's latest research results
    ├── Determine intent:
    │   ├── Preference update → update subscriber record
    │   ├── Question about content → generate answer from research
    │   └── General query → conversational AI response
    ├── Send reply via Twilio API
    └── Store response in sms_conversations
```

### Flow 4: AI Smart Intake Form

```
User arrives at /work-with-me
    |
    v
Client renders first question (hardcoded starter)
    |
    v
User answers → POST /api/intake/question
    |
    ├── Store response in intake_sessions table
    ├── Call LLM with all responses so far + system prompt
    ├── LLM returns: next question OR "ready for estimate"
    ├── If more questions: return next question to client
    └── If ready: redirect to estimate step

User sees all questions answered → POST /api/intake/estimate
    |
    ├── Load all responses from intake_sessions
    ├── Call LLM to analyze and generate estimate
    ├── Store estimate in intake_estimates table
    ├── Return estimate (S/M/L tier + price range + rationale)
    └── Client shows estimate + Calendly embed for booking
```

### Key Data Flows Summary

1. **Signup flow:** User input → Next.js API → Supabase (persist) → Queue (async topic parsing) → LLM (parse) → Supabase (update)
2. **Daily pipeline:** Cron → Orchestrator → Research Queue → Sources + LLM → Content Queue → LLM → Email/SMS Queue → Resend/Twilio
3. **SMS conversation:** Twilio → Webhook → Supabase (store) → Queue → LLM + Research data → Twilio (reply)
4. **Intake form:** Client → API → LLM (question gen) → Client → API → LLM (estimate) → Client

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 subscribers | Current architecture works as-is. Queue processing every 5 min. Single daily cron. Edge Functions handle all compute. Research runs sequentially per subscriber within batch. |
| 100-1,000 subscribers | Increase queue batch sizes. Add parallel research execution within Edge Functions. Consider shared research caching -- if 50 subscribers care about "AI news," research once and personalize delivery per subscriber. Stagger email sends to stay within Resend rate limits. |
| 1,000-10,000 subscribers | Move research pipeline to dedicated Railway worker service (Edge Functions have 150s wall-clock limit). Implement research deduplication: cluster similar topics, research shared topics once, personalize output. Add Redis/Upstash for research result caching. Monitor Brave API costs. |
| 10,000+ subscribers | Full separation: Next.js (web) + Railway workers (research) + Supabase (data/queues). Consider BullMQ or similar for queue management. Topic-based research sharding. CDN for email assets. This scale is unlikely in near-term -- do not pre-optimize. |

### Scaling Priorities

1. **First bottleneck: Research pipeline compute time.** Each subscriber needs multi-source research + LLM synthesis. At 100 subscribers, this is ~100 Edge Function invocations daily. Mitigate with shared research caching for overlapping topics and parallel execution.
2. **Second bottleneck: LLM API costs and rate limits.** Every subscriber hits the LLM for topic parsing, research synthesis, content generation, and optionally SMS responses. Mitigate with prompt optimization, caching common patterns, and choosing cost-effective models for each task (e.g., smaller models for SMS summaries, larger models for research synthesis).
3. **Third bottleneck: External API rate limits.** Brave API, News APIs, RSS feeds all have rate limits. Mitigate with request batching, caching, and staggered execution windows.

## Anti-Patterns

### Anti-Pattern 1: Processing Research in API Routes

**What people do:** Run the full research pipeline inside a Next.js API route triggered by cron or webhook.
**Why it's wrong:** API routes on Railway/Vercel have timeouts (typically 30-300 seconds). Multi-source research with LLM synthesis can take minutes per subscriber. The route will timeout, lose progress, and the subscriber gets no email.
**Do this instead:** API routes should only enqueue jobs. Edge Functions or dedicated workers process queues asynchronously with retry capabilities.

### Anti-Pattern 2: Monolithic Daily Job

**What people do:** One massive cron job that iterates through all subscribers sequentially -- research, generate, send -- for each one before moving to the next.
**Why it's wrong:** If it fails on subscriber #47, subscribers #48-500 get nothing. No parallelism. No retry for individual failures. Impossible to debug.
**Do this instead:** The daily orchestrator only enqueues one job per subscriber. Each job is independent, retryable, and can fail without affecting others. The queue-based pipeline means partial failures are isolated.

### Anti-Pattern 3: Storing Research Results Only in Email Content

**What people do:** Research results go directly into the email template with no intermediate storage. The generated email is the only record.
**Why it's wrong:** Impossible to debug ("why did subscriber X get this content?"), can't reuse research for SMS summaries, can't let subscribers ask follow-up questions about their daily content.
**Do this instead:** Store raw research results and generated content as separate records in the database. Email/SMS delivery reads from stored content. This enables the SMS conversation feature and audit/debugging.

### Anti-Pattern 4: Synchronous AI Intake Form

**What people do:** Each question in the smart intake form blocks on LLM response with no loading state, no streaming, and no timeout handling.
**Why it's wrong:** LLM responses take 1-5 seconds. Without streaming or loading states, the form feels broken. Without timeout handling, network blips kill the session.
**Do this instead:** Stream LLM responses for the intake form (Vercel AI SDK pattern). Show typing indicators. Store session state server-side so the user can resume if they leave and come back. Handle timeouts gracefully with retry.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Brave API | HTTP GET from Edge Functions, API key in env | 2,000 free queries/month, then $5/1,000. Cache results aggressively. |
| Resend | `resend.emails.send()` from Edge Functions with React Email templates | Verify domain first. 3,000 free emails/month, then $20/month for 50K. Batch sends respect rate limits. |
| Twilio | Outbound: `twilio.messages.create()` from Edge Functions. Inbound: webhook POST to Next.js API route. | Set webhook URL in Twilio console. Validate signatures on inbound. Per-message pricing (~$0.0079/SMS). |
| LLM Provider (Claude/OpenAI) | HTTP API calls from Edge Functions and API routes | Use Anthropic Claude for research synthesis (strong at reasoning). Use a lighter model for SMS summaries. API keys in env. |
| Calendly | Client-side embed on estimate page | No backend integration needed for v1. Just an iframe/embed component. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Next.js API <-> Supabase | Supabase JS client (direct DB access via RLS) | Use server client in API routes, browser client in client components |
| Next.js API <-> Queues | `supabase.rpc('enqueue_job')` or pgmq SQL functions | API routes enqueue, never dequeue. One-way dispatch. |
| pg_cron <-> Edge Functions | HTTP POST via `pg_net` extension | Cron triggers Edge Functions which process queues |
| Edge Functions <-> External APIs | HTTP fetch with API keys from env | All external calls happen in Edge Functions, never in API routes |
| Twilio <-> Next.js | Inbound webhook POST to `/api/webhooks/twilio` | Next.js validates, stores, enqueues. Edge Function generates and sends reply. |

## Build Order (Dependency-Driven)

The following order is dictated by component dependencies -- each phase builds on what the previous phase established.

### Phase 1: Foundation (must come first)

**Build:** Next.js project setup, Supabase project + schema, landing page, basic signup flow
**Why first:** Everything depends on the data layer (Supabase) and the web layer (Next.js). Cannot test any feature without these. Landing page is the entry point for all users.
**Delivers:** A live site that captures email subscribers and stores their preferences.

### Phase 2: Research Pipeline (depends on Phase 1 data layer)

**Build:** Topic parsing (LLM), multi-source research (Brave API, News APIs, RSS), content generation, queue infrastructure (pgmq), pg_cron scheduling
**Why second:** This is the core value engine. Email and SMS delivery are useless without content to deliver. The queue infrastructure built here is reused by email/SMS phases.
**Delivers:** Daily automated research running for each subscriber, generating personalized content stored in the database.

### Phase 3: Email Delivery (depends on Phase 2 content)

**Build:** React Email templates (3 formats), Resend integration, email send queue processing, unsubscribe/preference links
**Why third:** The newsletter is the primary value delivery channel. Needs research content to exist first.
**Delivers:** Subscribers receive daily personalized emails. The core product loop is complete.

### Phase 4: SMS Channel (depends on Phase 3 for content + delivery patterns)

**Build:** Twilio outbound SMS summaries, inbound webhook, conversational AI via SMS, preference updates via SMS
**Why fourth:** SMS is an enhancement to the core email product. It reuses the same research content and queue patterns from Phases 2-3. Build after the core loop is proven.
**Delivers:** Opted-in subscribers get SMS summaries and can converse with the AI via text.

### Phase 5: Smart Intake Form (independent of Phases 2-4)

**Build:** Typeform-style one-question flow, AI question generation, response analysis, instant estimate generation, Calendly embed
**Why fifth:** The consulting intake is a separate funnel from the newsletter. It could technically be built in parallel with Phases 2-4, but sequencing it last lets you focus on the newsletter (which is the lead generation engine for consulting).
**Delivers:** "Work With Me" page with AI-driven intake and instant estimates.

### Phase 6: Polish and Optimization (depends on all above)

**Build:** Framer Motion animations, mobile optimization, error handling improvements, monitoring/alerting, research caching for overlapping topics
**Why last:** Polish is important but should follow functional completeness. Optimize after observing real usage patterns.
**Delivers:** Production-quality experience with performance optimizations based on real data.

## Sources

- [Supabase Queues (pgmq) documentation](https://supabase.com/docs/guides/queues) - HIGH confidence
- [Supabase Cron documentation](https://supabase.com/docs/guides/cron) - HIGH confidence
- [Supabase Edge Functions architecture](https://supabase.com/docs/guides/functions/architecture) - HIGH confidence
- [Processing large jobs with Edge Functions, Cron, and Queues](https://supabase.com/blog/processing-large-jobs-with-edge-functions) - HIGH confidence
- [Railway Cron Jobs documentation](https://docs.railway.com/cron-jobs) - HIGH confidence
- [Railway deploying monorepos](https://docs.railway.com/guides/monorepo) - HIGH confidence
- [Resend + Next.js integration](https://resend.com/docs/send-with-nextjs) - HIGH confidence
- [Supabase + Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) - HIGH confidence
- [Database Webhooks in Supabase](https://supabase.com/docs/guides/database/webhooks) - HIGH confidence
- [AI System Design Patterns 2026](https://zenvanriel.nl/ai-engineer-blog/ai-system-design-patterns-2026/) - MEDIUM confidence
- [Brave Search API for AI applications](https://brave.com/search/api/) - HIGH confidence
- [Twilio Conversational AI](https://www.twilio.com/en-us/products/conversational-ai) - HIGH confidence
- [Next.js background jobs discussion](https://github.com/vercel/next.js/discussions/33989) - MEDIUM confidence
- [Deploy full-stack TypeScript apps on Railway](https://blog.railway.com/p/deploy-full-stack-typescript-apps-architectures-execution-models-and-deployment-choices) - HIGH confidence

---
*Architecture research for: AI-powered personalized newsletter & consulting platform*
*Researched: 2026-02-19*
