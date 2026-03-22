---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Completed 07-01-PLAN.md
last_updated: "2026-03-22T01:28:02.798Z"
progress:
  total_phases: 9
  completed_phases: 8
  total_plans: 31
  completed_plans: 31
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value prop:** AI systems that eliminate repetitive admin and follow-ups so teams scale revenue without scaling headcount.
**Core value (newsletter):** Every subscriber receives a daily briefing researched and written specifically for them.
**Current focus:** Phase 07 — preference-management

## Current Position

Phase: 07 (preference-management) — EXECUTING
Plan: 2 of 2

## Performance Metrics

**Velocity:**

- Total plans completed: 15
- Average duration: 3min
- Total execution time: 0.89 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Infrastructure | 4/4 | 18min | 5min |
| 1.1 - Homepage Pivot & IA | 3/3 | 6min | 2min |
| 2 - Subscriber Onboarding | 4/4 | 16min | 4min |
| 3 - Consulting Funnel | 4/5 | 13min | 3min |

**Recent Trend:**

- Last 5 plans: 03-04 (4min), 03-03 (4min), 03-01 (3min), 03-02 (2min), 02-04 (5min)
- Trend: Improving

*Updated after each plan completion*
| Phase 04 P01 | 4min | 2 tasks | 8 files |
| Phase 04 P02 | 4min | 2 tasks | 4 files |
| Phase 04 P04 | 2min | 2 tasks | 5 files |
| Phase 04 P03 | 5min | 2 tasks | 9 files |
| Phase 04 P05 | 3min | 2 tasks | 6 files |
| Phase 04 P06 | 3min | 2 tasks | 6 files |
| Phase 04 P07 | 1min | 1 tasks | 1 files |
| Phase 05 P01 | 4min | 2 tasks | 7 files |
| Phase 05 P02 | 3min | 2 tasks | 4 files |
| Phase 06 P01 | 3min | 2 tasks | 7 files |
| Phase 06 P03 | 3min | 2 tasks | 6 files |
| Phase 06 P02 | 4min | 2 tasks | 5 files |
| Phase 06 P04 | 6min | 3 tasks | 6 files |
| Phase 07 P02 | 1min | 1 tasks | 1 files |
| Phase 07 P01 | 3min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Direction Pivot 2026-02-20]: Homepage flips from newsletter-first to consulting-first. Primary CTA = "Work With Me", secondary = "Get the Daily Briefing"
- [Direction Pivot 2026-02-20]: Two front doors — / (consulting homepage), /newsletter (newsletter landing page), /work-with-me (consulting conversion)
- [Direction Pivot 2026-02-20]: Niche by pain (admin + follow-ups + operational leverage), not by industry
- [Direction Pivot 2026-02-20]: 2-stage smart intake with curated question library (AI selects from pool, doesn't invent). Hard caps: Stage 1 ~12, Stage 2 ~5-8
- [Direction Pivot 2026-02-20]: Instant plan output is a full 1-page business plan (goal mirroring, bottleneck diagnosis, system steps, tools, phases, risks, estimate), not just S/M/L tier
- [Direction Pivot 2026-02-20]: Newsletter is proof-of-work + nurture engine, not the mandatory gateway. Soft CTA to consulting in every email.
- [Direction Pivot 2026-02-20]: Consulting Funnel elevated from Phase 8 to Phase 3. Phase 1.1 inserted for homepage pivot.
- [Roadmap]: 9 phases (including 1.1 insertion); consulting funnel now Phase 3, parallelizable with Phase 2
- [Roadmap]: Domain warm-up and A2P 10DLC registration must start early due to 4-6 week and 10-15 day lead times
- [Roadmap]: AI Research Engine (Phase 4) is the highest-risk, highest-value component with 11 requirements and 6 plans
- [01-01]: Used Tailwind v4 @theme inline with CSS custom properties for theme system
- [01-01]: Chose slate/blue palette inspired by Resend and Linear reference sites
- [01-01]: Light-only theme (no dark mode) as specified in user constraints
- [01-01]: Server-side Supabase client is async to support Next.js 15+ cookie API
- [01-04]: Used custom prose-legal CSS class instead of @tailwindcss/typography plugin
- [01-04]: Legal pages use (marketing) route group to share future marketing layout
- [01-02]: Stacked email form layout (input above, button below) per user design decision
- [01-02]: Example cards expand on hover to reveal newsletter snippet previews
- [01-02]: Trust strip uses 16 full-color SVG logos in infinite scrolling marquee
- [01-03]: Used service_role key for Supabase inserts to bypass RLS in Server Action
- [01-03]: Used useActionState (React 19) for declarative Server Action form binding
- [01-03]: Success message includes spam folder check note per user feedback
- [Phase 2 discuss]: Single-page stepper, 5 steps, two-tier categories, preset delivery times, SMS benefits pitch, confetti confirmation, welcome email with sample
- [Phase 2 planned]: 4 plans in 3 waves — foundation, UI steps (parallel), wiring + email
- [1.1-01]: NavBar uses sticky positioning with glassmorphism (bg-background/80 backdrop-blur-sm) for persistent navigation
- [1.1-01]: No hamburger menu -- only 2 nav links inline on all screen sizes per research recommendation
- [1.1-01]: Newsletter page is a straight content migration with zero modifications to landing/* components
- [1.1-02]: Headline uses F/G/E framework: "I Build AI Systems That Do Your Busywork" -- fear of falling behind, greed for leverage, ego of modernizing
- [1.1-02]: Homepage is a routing page, not a convincing page -- scannable in 10 seconds with clear CTA hierarchy
- [1.1-02]: No StickyCTA on homepage -- sticky CTAs reserved for newsletter page only
- [1.1-02]: Newsletter teaser positioned after About section as proof-of-work bridge between credibility and conversion
- [1.1-03]: Split work-with-me into Server Component (metadata) + Client Component (Framer Motion) for proper Next.js metadata export
- [1.1-03]: Warm inviting tone ("Let's Build Something") -- not apologetic "coming soon"
- [1.1-03]: Cross-link to /newsletter for funnel cross-pollination on placeholder page
- [02-01]: Zod 4 installed (latest) -- backward compatible with Zod 3 API surface used in schema
- [02-01]: Slug-based IDs for topics rather than UUIDs -- Server Action resolves slugs to DB UUIDs by name
- [02-01]: CROSS JOIN pattern for subtopic seeding to reference category UUIDs by name
- [02-01]: Shared Zod schema pattern: single source of truth in lib/schemas/ for client/server validation
- [02-01]: Static data files in lib/data/ matching DB seed data by name
- [02-02]: Typed ease tuple for Framer Motion v12 TypeScript compatibility in AnimatePresence variants
- [02-02]: Stepper exports OnboardingFormData type for step components (type sharing via barrel, no separate types file)
- [02-02]: Progress bar uses numbered dots with animated connecting lines (segmented bar pattern)
- [02-03]: Inline SVG icons for time slot cards rather than icon library -- keeps bundle lean
- [02-03]: Phone validation strips formatting chars before E.164 check for better UX
- [02-03]: Benefits-first SMS opt-in pattern: show value card, then reveal input with Framer Motion expand
- [02-04]: Zod 4 uses .issues instead of .errors for validation error access
- [02-04]: Upsert on subscriber_preferences for idempotent re-onboarding support
- [02-04]: Slug-to-UUID topic resolution: match static data names to DB subtopic names
- [02-04]: Fire-and-forget email: resend.emails.send().catch() without await
- [02-04]: Existing subscribers get subscriberId returned on duplicate email for re-onboarding
- [03-01]: Curated question library: separate core (13) and deep-dive (7) arrays for clarity, combined into INTAKE_QUESTIONS export
- [03-01]: Business plan schema uses .optional() on non-critical nested fields (tools in proposedSystemSteps) per research pitfall #6
- [03-01]: Service data extracted to lib/data/services.ts as single source of truth for 4 service offerings
- [03-02]: F/G/E headline: "Stop Losing Deals to Manual Follow-Ups" -- fear of revenue loss, greed for efficiency, ego of modernizing
- [03-02]: FunnelStage state machine with AnimatePresence mode="wait" for same-URL transitions
- [03-02]: Footer and TrustStrip rendered inside landing stage (client component owns full layout)
- [03-02]: FAQ accordion uses plus-to-cross rotation with AnimatePresence height animation
- [03-02]: Consulting components in components/consulting/* mirroring homepage patterns
- [03-03]: AI SDK v6 generateText + Output.object pattern for structured question selection (not generateObject)
- [03-03]: 1500ms AbortController timeout with deterministic priority-based fallback for guaranteed <2s response
- [03-03]: useReducer state machine in IntakeContainer for predictable multi-step form state transitions
- [03-03]: Session storage backup after each answer for intake recovery on page refresh
- [03-03]: Auto-advance on button click (150ms delay for visual feedback) for Typeform-like UX
- [03-03]: Intake components in components/intake/* mirroring consulting component pattern
- [03-04]: Used streamText + Output.object pattern (AI SDK v6) for structured streaming rather than streamObject standalone
- [03-04]: PlanDisplay manages own loading/complete states internally via useObject hook isLoading flag
- [03-04]: PDF uses Helvetica (built-in) with blue accent matching site palette -- zero custom font overhead
- [03-04]: PlanDownloadButton dynamically imported with ssr:false to prevent react-pdf SSR hydration crashes
- [03-04]: System prompt enforces paraphrased mirroring, specific tool recs, and phase-by-phase estimates
- [04-01]: Vitest 4.1 with path alias @/* matching tsconfig for test imports
- [04-01]: generateObject + SearchQueriesSchema pattern for structured Gemini output (not streamObject)
- [04-01]: vi.mock('ai') + vi.mock('@ai-sdk/google') for isolated topic parser testing without real API calls
- [04-01]: Cost constants in types.ts: $0.005/Brave query, $0.001/Gemini call, $0.10/subscriber/day cap
- [Phase 04]: Vitest 4.1 with path alias @/* matching tsconfig for test imports
- [Phase 04-02]: Vault secrets and Edge Function trigger commented out with placeholders in pg_cron job
- [Phase 04-02]: Cross-runtime getEnv() helper with typeof guards for Node.js/Deno compatibility in run-logger
- [Phase 04-02]: vi.hoisted() pattern for Vitest v4 mock variable hoisting in test files
- [Phase 04]: scrapeUrl returns null on error (never throws) matching source module pattern
- [Phase 04]: SSRF validator uses regex IP range detection for RFC 1918 + IPv6; Reddit/X deferred to v2
- [Phase 04]: Static import for rss-parser instead of dynamic import() to enable vi.mock interception in tests
- [Phase 04]: vi.hoisted() pattern for mock variable hoisting in RSS tests (Vitest v4 compatibility)
- [Phase 04]: vi.stubGlobal fetch pattern for mocking Brave and GDELT API clients
- [Phase 04]: Fail-open on dedup DB errors: return empty set so results show rather than silently drop
- [Phase 04]: Null publishedAt included in freshness filter (benefit of doubt for unknown dates)
- [Phase 04]: URL normalization strips query params and hash for dedup (utm tracking params don't create false negatives)
- [Phase 04]: Hand-rolled 30-line TF-IDF scorer with stop words instead of natural.js (2MB+ savings)
- [Phase 04]: All pipeline logic inlined in Edge Function (Deno cannot import from lib/)
- [Phase 04]: SSRF validation inlined from feed-validator.ts in Edge Function for custom RSS feeds
- [Phase 04-07]: Inlined DEFAULT_RSS_FEEDS constant in Edge Function (Deno cannot import from lib/)
- [Phase 04-07]: sourceName: 'rss' for curated defaults vs 'custom_rss' for subscriber-provided feeds (origin distinction)
- [Phase 05]: [05-01]: generateText + Output.object with Gemini 2.5 Flash for content generation (matching AI SDK v6 pattern)
- [Phase 05]: [05-01]: FORMAT_SCHEMAS map dispatches DigestSchema/BriefingSchema/MixedSchema by ContentFormat key
- [Phase 05]: [05-01]: Anti-hallucination URL validation on all LLM output before content delivery
- [Phase 05]: Content generation Edge Function inlines all lib/content/* logic (Deno cannot import from lib/)
- [Phase 05]: Fire-and-forget trigger pattern: research pipeline fetch().catch() without await for non-blocking content generation
- [Phase 05]: URL validation halts content storage on hallucinated URLs (no newsletter rather than broken links)
- [Phase 06]: HMAC-SHA256 with dedicated EMAIL_LINK_SECRET env var for email link security
- [Phase 06]: CTA escalation has 2 levels (soft/medium): soft default, medium at 3+ clicks or 2+ feedback in 7 days
- [Phase 06]: Warm-up starts at 50/day, 50% increase every 3 days, caps at 500/day around day 19
- [Phase 06]: Delivery enqueue routes by subscriber_preferences.delivery_time matching time_window parameter
- [Phase 06]: Feedback token action uses actual item URL (feedback:${itemUrl}) not an index -- enables Phase 7 FDBK-02 URL-based matching against research results
- [Phase 06]: RFC 8058 POST unsubscribe returns empty 200 body -- compatible with email client one-click unsubscribe automation
- [Phase 06]: 3-consecutive-bounce auto-pause: queries last 3 send_log rows ordered by sent_at desc, pauses subscriber if all bounced
- [Phase 06]: Feedback links use encodeURIComponent(item.url) as identifier for Phase 7 FDBK-02 compatibility (not numeric indices)
- [Phase 06]: MAIL-03 compliance verified via no-images proxy (not raw string ratio) because React Email inline styles inflate HTML size
- [Phase 06]: FallbackEmail omits consulting CTA per UI-SPEC (bad experience day -- do not pitch)
- [Phase 06]: Deno Web Crypto API (crypto.subtle) used for HMAC-SHA256 token generation — identical hex output to Node.js, no external library needed
- [Phase 06]: Template literal HTML builders in Deno Edge Function — @react-email/render requires react-dom/server which is not Deno-compatible
- [Phase 06]: Feedback tokens use actual item URLs as action (feedback:${url}) not indices — enables Phase 7 FDBK-02 URL-based matching
- [Phase 07]: 30-day feedback window with 50-record limit for query refinement; domain-level matching with 1.3x boost / 0.5x penalty for relevance scoring
- [Phase 07]: Combined SMS toggle into Format & Delivery section (same updatePreferences action)
- [Phase 07]: Per-section save pattern: each section has own useActionState + form ref + hidden JSON input
- [Phase 07]: Unsubscribed users see amber banner with re-subscribe button at top of preference page

### Pending Todos

- Run Supabase SQL migration (001_subscribers.sql) in SQL Editor
- Run Supabase SQL migration (002_subscriber_preferences.sql) in SQL Editor
- Run Supabase SQL migration (003_intake_sessions.sql) in SQL Editor
- Configure DNS (CNAME to Railway, SPF/DKIM/DMARC for Resend)
- Deploy to Railway
- Push to GitHub

### Blockers/Concerns

- [Research]: API cost at scale -- per-subscriber costs could reach $1,200-1,500/month at 1,000 subscribers without topic clustering and model optimization
- [Research]: Domain warm-up takes 4-6 weeks -- email deliverability depends on starting this process early
- [Research]: A2P 10DLC registration takes 10-15 business days -- must initiate before Phase 8 (SMS) can ship

## Session Continuity

Last session: 2026-03-22T01:28:02.796Z
Stopped at: Completed 07-01-PLAN.md
Resume file: None
Next action: Continue Phase 04 Plan 02
