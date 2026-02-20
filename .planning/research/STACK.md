# Stack Research

**Domain:** AI-powered personalized newsletter + consulting platform
**Researched:** 2026-02-19
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1 | Full-stack React framework | Turbopack stable by default (5-10x faster dev), App Router with React 19, built-in API routes for webhooks (Twilio, Resend), React Compiler for automatic memoization. Railway has first-class Next.js deploy support. |
| React | 19 | UI library | Ships with Next.js 16. Server Components reduce client bundle for landing pages. Actions simplify form handling for newsletter signup and AI intake. |
| TypeScript | 5.7+ | Type safety | Next.js 16 is TypeScript-first. AI SDK 6 relies heavily on TypeScript generics for type-safe structured outputs and tool definitions. Non-negotiable for this stack. |
| Tailwind CSS | 4.2.0 | Styling | CSS-first configuration (no tailwind.config.js), 5x faster builds, works with shadcn/ui out of the box. Next.js 16 create-next-app includes Tailwind by default. |
| Framer Motion | 12.x (latest 12.34.2) | Animations | Premium feel requires smooth animations. Layout animations, AnimatePresence for page transitions, gesture support for the AI intake form. Now branded as "Motion" but npm package remains `framer-motion`. |

### Database & Backend Services

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase (hosted) | Latest cloud | PostgreSQL database, auth, edge functions | PostgREST v14 (~20% throughput improvement). Row-level security for subscriber data. Realtime subscriptions for admin dashboard. Edge Functions for lightweight serverless tasks. Free tier generous for MVP. |
| @supabase/supabase-js | 2.97.0 | Supabase client | Isomorphic client for both server and client components. |
| @supabase/ssr | 0.8.0 | SSR auth helpers | Required for Next.js App Router cookie-based auth. Replaces deprecated @supabase/auth-helpers-nextjs. |

### AI & LLM

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| AI SDK (Vercel) | 6.0.x (latest 6.0.91) | Unified LLM interface | Agent abstraction for reusable agents, structured output alongside tool calling, streaming UI hooks for the AI intake form, provider-agnostic (swap OpenAI/Anthropic/Google without code changes). 20M+ monthly downloads. |
| @ai-sdk/openai | 3.0.x (latest 3.0.30) | OpenAI provider | GPT-4o for content generation and topic parsing. Cost-effective for high-volume daily newsletter generation. |
| @ai-sdk/anthropic | 3.0.x (latest 3.0.45) | Anthropic provider | Claude for nuanced conversational AI in SMS two-way chat and AI intake form. Better at following complex instructions for dynamic question selection. |

### Email & SMS

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Resend | 6.9.2 | Email delivery API | Developer-first, built for React ecosystem. Broadcast API for batch sends. Webhook events for delivery tracking. Free tier: 100 emails/day (sufficient for early growth). |
| React Email | 5.2.8 | Email templates | Build email templates as React components with TypeScript. Local dev server for preview. Dark mode support. Same component model as the website. |
| @react-email/components | latest | Email UI primitives | Pre-built responsive email components (Button, Container, Heading, etc.) that render correctly across Gmail, Outlook, Apple Mail. |
| Twilio | 5.11.2 | SMS delivery & two-way messaging | Industry standard for programmable SMS. Webhook-based inbound message handling pairs perfectly with Next.js API routes. Conversation API for threaded SMS exchanges. |

### Data Sources & Research Pipeline

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| brave-search (npm) | latest | Web search API wrapper | Fully typed wrapper for Brave Search API. Web, news, and image search. Independent index (not Google/Bing dependent), less SEO spam. $5/mo plan covers newsletter research volume. |
| cheerio | 1.2.0 | HTML parsing/scraping | jQuery-like API for server-side DOM manipulation. Fast, lightweight, no browser overhead. Perfect for extracting content from scraped pages. |
| rss-parser | latest | RSS feed parsing | Lightweight, well-maintained, supports RSS 2.0 and Atom. Converts XML feeds to JavaScript objects with Promise support. |

### Scheduling & Job Processing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| node-cron | 4.2.1 | In-process task scheduling | Zero dependencies, pure JS. Schedule daily research runs and email sends per subscriber timezone. Runs inside the Railway persistent service -- no separate cron service needed. |
| Railway Cron Jobs | N/A | Backup/maintenance tasks | Use Railway's built-in cron for database maintenance, cleanup jobs, and health checks. Minimum 5-minute interval. Not for per-subscriber scheduling (too granular). |

### UI Components & Forms

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | latest (CLI-based) | UI component library | Copy-paste components you own. Built on Radix UI primitives. Full accessibility. Tailwind CSS styled. Not a dependency -- source code lives in your project. New visual builder via `npx shadcn create`. |
| React Hook Form | 7.71.1 | Form state management | Minimal re-renders, built-in validation, works with Zod for schema validation. Handles the multi-step AI intake form with dynamic field registration. |
| Zod | 4.3.6 | Schema validation | 14x faster string parsing vs Zod 3. @zod/mini at 1.9KB gzipped for client-side validation. Integrates natively with AI SDK 6 for structured output schemas and React Hook Form via @hookform/resolvers. |

### Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Railway | N/A | Hosting & deployment | $5/mo base. Persistent services (Next.js app), built-in cron jobs, GitHub auto-deploy. Handles SSR without Vercel lock-in. Supports environment variables, custom domains, logs. |
| Supabase (hosted) | N/A | Managed PostgreSQL + auth | Free tier: 500MB database, 50K monthly active users, 500MB file storage. No server to manage. Scales with hosted plan when needed. |
| GitHub Actions | N/A | CI/CD | Free for public repos. Run tests, lint, type-check on PR. Railway auto-deploys from main branch. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9+ | Linting | Flat config format (eslint.config.js). Next.js 16 ships with ESLint config. |
| Prettier | Code formatting | Integrate with ESLint via eslint-config-prettier. Tailwind plugin for class sorting. |
| Vitest | Unit/integration testing | Faster than Jest, native ESM support, compatible with React Testing Library. |
| Playwright | E2E testing | Test the AI intake form flow, newsletter signup, SMS webhook handling. |

## Installation

```bash
# Core framework
npx create-next-app@latest lucassenechal-website --typescript --tailwind --eslint --app --turbopack

# UI & Animation
npm install framer-motion
npx shadcn@latest init

# AI
npm install ai @ai-sdk/openai @ai-sdk/anthropic

# Database
npm install @supabase/supabase-js @supabase/ssr

# Email
npm install resend react-email @react-email/components

# SMS
npm install twilio

# Data pipeline
npm install brave-search cheerio rss-parser

# Scheduling
npm install node-cron

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Dev dependencies
npm install -D vitest @testing-library/react playwright prettier eslint-config-prettier @types/node-cron
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| AI SDK 6 (Vercel) | LangChain.js | If you need complex RAG pipelines with vector stores, retrieval chains, or document loaders. AI SDK is simpler for this project's needs (generate text, structured output, streaming chat). LangChain adds unnecessary abstraction for direct API calls. |
| AI SDK 6 (Vercel) | Direct OpenAI/Anthropic SDKs | If you only ever use one provider and never switch. AI SDK's provider abstraction costs nothing and prevents lock-in. |
| Resend + React Email | SendGrid / Mailgun | If you need enterprise deliverability SLAs or send 100K+ emails/day. Resend's React component model is a massive DX win at this scale. |
| node-cron (in-process) | BullMQ + Redis | If you need distributed job queues, retry logic, rate limiting, or multiple workers. BullMQ (v5.69.3) requires a Redis instance ($7-10/mo extra on Railway). Overkill for a solo-operator newsletter with < 1000 subscribers. Upgrade path when scale demands it. |
| node-cron (in-process) | Upstash QStash | If you go fully serverless (Vercel/Cloudflare). QStash is HTTP-based cron for edge runtimes. Not needed on Railway where you have a persistent Node.js process. |
| Tailwind CSS | CSS Modules / Vanilla Extract | If your team has strong opinions against utility-first CSS. Tailwind + shadcn/ui is the dominant pattern in the Next.js ecosystem and what the project spec calls for. |
| shadcn/ui | Chakra UI / MUI | If you want a fully managed component library with less customization effort. shadcn/ui gives full ownership and the Notion/Cal.com aesthetic the project requires. MUI looks corporate; Chakra looks generic. |
| Supabase | Neon + Drizzle ORM | If you want more control over your database schema and queries. Supabase bundles auth, realtime, and edge functions -- fewer moving parts for a solo operator. |
| Railway | Vercel | If you want zero-config deploys and the Vercel AI Gateway. But Railway is $5/mo vs Vercel's $20/mo Pro, and Railway gives you persistent processes needed for in-process cron scheduling. Vercel's serverless model would require Upstash QStash for scheduling. |
| Cheerio | Puppeteer / Playwright | If you need to scrape JavaScript-rendered SPAs. Cheerio only parses static HTML. For most news sites and blogs, Cheerio is sufficient and 100x lighter. Add Playwright for specific JS-heavy sources only if needed. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers-nextjs | Deprecated in favor of @supabase/ssr. Will not receive updates. | @supabase/ssr (0.8.0) |
| Webpack (in Next.js 16) | Turbopack is stable and default. Webpack is legacy path. Only use --webpack flag if you have incompatible custom webpack plugins. | Turbopack (default) |
| Zod 3.x | Zod 4 is 14x faster for string parsing, 7x for arrays. No reason to stay on v3 for a greenfield project. | Zod 4.3.6 |
| Nodemailer | Low-level SMTP library. Requires managing SMTP servers, deliverability, bounce handling yourself. | Resend (managed email API) |
| SendGrid legacy templates | Handlebars-based templates that are painful to maintain. No React component model. | React Email + Resend |
| Bull (without MQ) | Unmaintained predecessor to BullMQ. If you need a queue, use BullMQ. But you probably don't need one yet. | node-cron for scheduling, BullMQ if queues needed later |
| express.js | Next.js API routes handle all webhook endpoints (Twilio inbound SMS, Resend webhooks). No need for a separate Express server. | Next.js Route Handlers |
| Prisma | Adds an ORM layer on top of Supabase's already excellent PostgREST API. Double abstraction. Use Supabase client for CRUD, raw SQL for complex queries. | @supabase/supabase-js |
| NextAuth.js / Auth.js | The project explicitly scopes out user login. Newsletter management is via email links (magic tokens). Supabase Auth handles the "Work With Me" admin if ever needed. | Supabase Auth (only if needed) |
| Tailwind CSS v3 | v4 is a ground-up rewrite with CSS-first config, dramatically faster builds, and better DX. v3 is legacy for new projects. | Tailwind CSS v4.2.0 |

## Stack Patterns by Variant

**If subscriber count stays under 500:**
- Use node-cron for all scheduling (research runs, email sends)
- Single Railway service handles everything
- Because: Simplest architecture, $5/mo total hosting cost

**If subscriber count exceeds 1,000:**
- Add BullMQ + Redis for job queue (retry logic, rate limiting)
- Separate Railway service for worker processes
- Because: node-cron can't handle failed job retries or concurrent processing at scale

**If SMS conversation volume gets high:**
- Consider Twilio Conversations API instead of raw messaging API
- Add message threading and state management
- Because: Raw messaging API doesn't track conversation state

**If email volume exceeds Resend free tier (100/day):**
- Upgrade to Resend Pro ($20/mo for 50K emails/mo)
- Add batch sending via Broadcast API
- Because: Per-email cost drops significantly on paid plans

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1 | React 19 | Next.js 16 requires React 19. Do not use React 18. |
| Next.js 16.1 | Tailwind CSS 4.x | Use @tailwindcss/postcss (not tailwindcss PostCSS plugin from v3). |
| AI SDK 6.x | @ai-sdk/openai 3.x, @ai-sdk/anthropic 3.x | Provider packages must match AI SDK major version. v6 uses v3 providers. |
| Zod 4.x | @hookform/resolvers | Verify @hookform/resolvers supports Zod 4. If not, use zodResolver from @hookform/resolvers/zod with Zod 4's backwards-compatible API. |
| @supabase/ssr 0.8.0 | @supabase/supabase-js 2.x | Both packages must be v2 generation. Do not mix with v1. |
| shadcn/ui | Tailwind CSS 4.x | shadcn/ui supports Tailwind v4. Run `npx shadcn@latest init` which auto-detects your Tailwind version. |
| framer-motion 12.x | React 19 | Framer Motion 12 is compatible with React 19. Earlier versions may have issues. |
| node-cron 4.x | Node.js 18+ | node-cron 4 requires Node.js 18 or higher. Railway uses Node.js 20+ by default. |

## Sources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- HIGH confidence: official source
- [Next.js 16.1 Blog Post](https://nextjs.org/blog/next-16-1) -- HIGH confidence: official source
- [Tailwind CSS v4.0 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) -- HIGH confidence: official source
- [Tailwind CSS v4.2.0 Release](https://github.com/tailwindlabs/tailwindcss/releases) -- HIGH confidence: GitHub releases
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6) -- HIGH confidence: official Vercel blog
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction) -- HIGH confidence: official docs
- [Supabase January 2026 Developer Update](https://github.com/supabase/supabase/releases/tag/v1.26.01) -- HIGH confidence: official release
- [Resend Changelog](https://resend.com/changelog) -- HIGH confidence: official source
- [Railway Cron Jobs Documentation](https://docs.railway.com/reference/cron-jobs) -- HIGH confidence: official docs
- [Railway Next.js Deploy Guide](https://railway.com/deploy/nextjs) -- HIGH confidence: official source
- [Zod v4 Release Notes](https://zod.dev/v4) -- HIGH confidence: official docs
- [Motion (Framer Motion) Documentation](https://motion.dev/docs) -- HIGH confidence: official docs
- [shadcn/ui Installation Guide](https://ui.shadcn.com/docs/installation/next) -- HIGH confidence: official docs
- [React Email Documentation](https://react.email) -- HIGH confidence: official docs
- [Twilio Node.js Quickstart](https://www.twilio.com/docs/messaging/quickstart) -- HIGH confidence: official docs
- npm version numbers verified via npmjs.com on 2026-02-19 -- HIGH confidence: canonical source

---
*Stack research for: AI-powered personalized newsletter + consulting platform*
*Researched: 2026-02-19*
