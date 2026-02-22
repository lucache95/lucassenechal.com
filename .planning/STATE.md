# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value prop:** AI systems that eliminate repetitive admin and follow-ups so teams scale revenue without scaling headcount.
**Core value (newsletter):** Every subscriber receives a daily briefing researched and written specifically for them.
**Current focus:** Phase 3: Consulting Funnel

## Current Position

Phase: 3 of 8 (Consulting Funnel)
Plan: 5 of 5 in current phase
Status: Executing
Last activity: 2026-02-22 -- Completed 03-04: AI business plan generation pipeline

Progress: [#######...] 70%

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

Last session: 2026-02-22
Stopped at: Completed 03-04-PLAN.md
Resume file: None
Next action: Continue Phase 3 Plan 05 (Lead capture + booking)
