# Roadmap: Lucas Senechal — AI Systems Consulting & Newsletter Platform

## Overview

This roadmap delivers a consulting-first personal platform with an AI-powered newsletter as proof-of-work. The build follows a revised priority order after a direction pivot on 2026-02-20: consulting is the revenue engine, so the homepage and consulting funnel come before the newsletter pipeline. The newsletter infrastructure (research, content, delivery) follows because it requires the consulting homepage to be live first for proper funnel integration.

**Key architectural shift:** One ecosystem, two front doors. The homepage (/) is consulting-first with "Work With Me" as the primary CTA. The newsletter lives at /newsletter as a dedicated landing page optimized for subscribing. High-intent leads go straight to /work-with-me; low/medium-intent audience enters via /newsletter to nurture over time.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (1.1, 2.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Infrastructure** - Project infrastructure, database, domain setup, and initial landing page (now becomes /newsletter base)
- [x] **Phase 1.1: Homepage Pivot & Information Architecture** *(INSERTED)* - Transform homepage to consulting-first, relocate newsletter content to /newsletter
- [ ] **Phase 2: Subscriber Onboarding** - Multi-step signup flow at /newsletter that collects topics, preferences, and consent
- [ ] **Phase 3: Consulting Funnel** - /work-with-me page with 2-stage AI smart intake, instant business plan output, and Calendly booking
- [ ] **Phase 4: AI Research Engine** - The core value engine: parse topics, query sources, synthesize per-subscriber research
- [ ] **Phase 5: Content Generation** - Transform raw research into polished newsletter content in three formats
- [ ] **Phase 6: Email Delivery & Compliance** - Send personalized emails via Resend with deliverability infrastructure and consulting CTAs
- [ ] **Phase 7: Preference Management** - Email-link-based preference updates, format changes, and unsubscribe flows
- [ ] **Phase 8: SMS Channel** - Twilio-powered SMS summaries and two-way conversational AI

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: Project infrastructure is in place and initial landing page content is built (will become /newsletter base)
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, SITE-08, COPY-01, LEGL-01, LEGL-02
**Success Criteria** (what must be TRUE):
  1. Visitor loads lucassenechal.com and sees a polished hero section with F/G/E copy
  2. Landing page displays example topic cards showing the breadth of possible personalization
  3. Landing page renders beautifully on both mobile and desktop with smooth animations
  4. Page loads in under 2 seconds (LCP) on a standard connection
  5. SPF/DKIM/DMARC are configured on the sending domain, and domain warm-up has been initiated
  6. Privacy policy and terms of service pages are live
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Next.js project scaffold, Tailwind v4, Supabase clients, subscriber schema
- [x] 01-02-PLAN.md — Landing page with hero, example cards, how-it-works, trust strip, sticky CTA, footer
- [x] 01-03-PLAN.md — Email capture Server Action wired to Supabase with validation and UX states
- [x] 01-04-PLAN.md — Privacy policy and terms of service pages with data retention rules

### Phase 1.1: Homepage Pivot & Information Architecture *(INSERTED)*
**Goal**: Homepage is consulting-first with "Work With Me" as primary CTA, and existing newsletter content lives at /newsletter as a dedicated landing page
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, COPY-03
**Success Criteria** (what must be TRUE):
  1. Visitor loads lucassenechal.com and sees a consulting-first homepage communicating: "I build AI systems that eliminate admin/follow-ups so you scale revenue without scaling headcount"
  2. Homepage has primary CTA "Work With Me" and secondary CTA "Get the Daily Briefing"
  3. /newsletter loads the existing landing page content (hero, example cards, how-it-works, trust strip, about, email capture, footer) optimized for newsletter signups
  4. /work-with-me route exists (placeholder or full page depending on Phase 3 timing)
  5. All three pages are fully responsive with smooth Framer Motion animations
  6. Tone is humble but confident — not junior, not corporate
**Plans**: 3 plans

Plans:
- [x] 1.1-01-PLAN.md — Newsletter page migration + shared navigation bar
- [x] 1.1-02-PLAN.md — Consulting-first homepage (hero, service cards, proof section)
- [x] 1.1-03-PLAN.md — Work-with-me placeholder + root metadata update

### Phase 2: Subscriber Onboarding
**Goal**: A visitor can complete the full signup flow at /newsletter and become a subscriber with stored preferences
**Depends on**: Phase 1.1
**Requirements**: SIGN-01, SIGN-02, SIGN-03, SIGN-04, SIGN-05, SIGN-06, SIGN-07, SIGN-08, SIGN-09, COPY-02
**Success Criteria** (what must be TRUE):
  1. Visitor can enter their email on /newsletter and proceed to a multi-step customization flow
  2. Subscriber can select topics from categorized options with "(Most Popular)" labels and add freeform custom topics
  3. Subscriber can choose newsletter format (digest, briefing, or mixed), set delivery time, provide location, add RSS/Atom feed URLs, and opt in to SMS
  4. Every signup step uses F/G/E microcopy (e.g., "What do you want to be ahead on?", identity-framed format options)
  5. After completing signup, subscriber sees a confirmation page with first-delivery expectations and receives a welcome email
  6. All subscriber data (email, topics, format, location, delivery time, SMS consent, custom sources) is persisted in Supabase
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Dependencies, Supabase preference schema, Zod validation, topic data
- [ ] 02-02-PLAN.md — Stepper shell, progress bar, Topics step, Format step with F/G/E copy
- [ ] 02-03-PLAN.md — Delivery Time & Location step, Sources & SMS step with F/G/E copy
- [ ] 02-04-PLAN.md — Confirmation step, Server Action persistence, welcome email, landing page redirect

### Phase 3: Consulting Funnel
**Goal**: Prospective clients can explore Lucas's services and complete a 2-stage AI-driven intake that produces an instant business plan and estimate
**Depends on**: Phase 1.1
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06, WORK-07, WORK-08, WORK-09, WORK-10, WORK-11, COPY-03
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate to /work-with-me and see clear descriptions of the four service offerings (AI automation, process consulting, ongoing management, training)
  2. Visitor can start Stage 1 smart intake: one question at a time, AI selects from curated question library, 8-12 questions max, with progress indicator and skip option
  3. Stage 1 collects business context, workflow pain, stack, and scope — completing in 2-4 minutes
  4. After Stage 1 completion, visitor instantly receives a 1-page business plan: goal mirroring, bottleneck diagnosis, system steps, tools/integrations, implementation phases, risks, S/M/L estimate + timeline
  5. After seeing the plan, visitor can book a 15-minute discovery call via Calendly, and all intake data is stored for Lucas to review
  6. Optional Stage 2 (5-8 deeper questions) is available post-submit for more accuracy, framed as "Answer 5 more for a more exact plan"
  7. Real-time feel: < 2 second latency between questions
**Plans**: 5 plans

Plans:
- [ ] 03-01-PLAN.md — Dependencies, question library, Zod schemas, Supabase migration, service data
- [ ] 03-02-PLAN.md — Consulting landing page: hero, service grid, how-it-works, FAQ, trust strip, state machine
- [ ] 03-03-PLAN.md — AI question selection API + intake UI (smart inputs, progress, back/skip)
- [ ] 03-04-PLAN.md — Streaming business plan generation API + plan display + PDF download
- [ ] 03-05-PLAN.md — Lead capture, Cal.com booking, data persistence, email notification, full wiring

### Phase 4: AI Research Engine
**Goal**: The system can take a subscriber's topic preferences and produce fresh, sourced research results daily
**Depends on**: Phase 2
**Requirements**: RSCH-01, RSCH-02, RSCH-03, RSCH-04, RSCH-05, RSCH-06, RSCH-07, RSCH-08, RSCH-09, RSCH-10, RSCH-11, QUAL-01, QUAL-02, QUAL-03, OPS-01, OPS-02
**Success Criteria** (what must be TRUE):
  1. Plain-English topic descriptions and category selections are parsed into actionable research queries via NLP
  2. Research pipeline queries multiple sources (Brave API, News APIs, RSS feeds, Reddit, X, targeted site scraping, custom RSS feeds) and returns attributed results
  3. Daily automated research runs execute for each subscriber on schedule, producing fresh results stored in the database
  4. Every research result includes source attribution with verified URLs — no hallucinated links
  5. Topic clustering shares research across subscribers with overlapping interests to optimize API costs
  6. Results are deduplicated, recency-filtered (prefer last 7 days), and relevance-scored before inclusion
  7. Per-run logging captures queries, sources, results, and errors; failed runs retry with alerting
**Plans**: TBD

Plans:
- [ ] 04-01: NLP topic parsing and query generation
- [ ] 04-02: Queue infrastructure (pgmq), scheduling (pg_cron), logging, and retry strategy
- [ ] 04-03: Source integrations (Brave API, News APIs, RSS feeds)
- [ ] 04-04: Source integrations (Reddit, X, site scraping, custom RSS feeds)
- [ ] 04-05: Source attribution, freshness filtering, deduplication, and anti-hallucination
- [ ] 04-06: Topic clustering, relevance scoring, and research caching for cost optimization

### Phase 5: Content Generation
**Goal**: Raw research results are transformed into polished, voice-injected newsletter content in three distinct formats
**Depends on**: Phase 4
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, QUAL-04
**Success Criteria** (what must be TRUE):
  1. Research results can be generated into a "curated digest" format (5-8 items with summaries and links)
  2. Research results can be generated into a "written briefing" format (narrative synthesis with sources)
  3. Research results can be generated into a "mixed" format (short synthesis + itemized links)
  4. Generated content reads naturally with Lucas's personal voice — not generic AI-sounding text
  5. When research yields insufficient results, the system honestly communicates this and suggests refining preferences
**Plans**: TBD

Plans:
- [ ] 05-01: Content generation pipeline and format templates
- [ ] 05-02: Voice injection, style system, and content variation

### Phase 6: Email Delivery & Compliance
**Goal**: Subscribers receive their personalized daily email reliably and on schedule with full deliverability compliance and consulting CTAs
**Depends on**: Phase 5
**Requirements**: MAIL-01, MAIL-02, MAIL-03, MAIL-04, MAIL-05, MAIL-06, MAIL-07, MAIL-08, MAIL-09, MAIL-10, FDBK-01, OPS-03
**Success Criteria** (what must be TRUE):
  1. Each subscriber receives a daily personalized email via Resend at their preferred delivery time
  2. Three responsive email templates (digest, briefing, mixed) render correctly on mobile and desktop with clean design matching the website
  3. Every email includes a one-click unsubscribe link and a preference update link (CAN-SPAM/GDPR compliant)
  4. Each item in the newsletter has "More like this / Less like this" feedback links
  5. Every email includes a soft CTA to /work-with-me; engagement-triggered stronger CTAs for active subscribers
  6. Domain warm-up is actively managed with graduated volume increases over 4-6 weeks
  7. Deliverability metrics (open rates, bounce rates, spam complaints) are monitored and actionable
  8. Admin view shows subscriber list, last send status, and error traces
**Plans**: TBD

Plans:
- [ ] 06-01: Email sending pipeline (Resend integration, scheduling, queue processing)
- [ ] 06-02: React Email templates for all three formats with feedback links and consulting CTAs
- [ ] 06-03: Compliance (unsubscribe, headers, warm-up management, deliverability monitoring)
- [ ] 06-04: Admin dashboard (subscriber list, send status, error traces)

### Phase 7: Preference Management
**Goal**: Subscribers can update all their preferences and unsubscribe without needing a login
**Depends on**: Phase 2, Phase 6
**Requirements**: PREF-01, PREF-02, PREF-03, PREF-04, PREF-05, PREF-06, FDBK-02
**Success Criteria** (what must be TRUE):
  1. Clicking a link in the email opens a token-based preference page (no login or password required)
  2. Subscriber can update their topics (multiple choice + custom), newsletter format, delivery time, and location
  3. Subscriber can manage their custom source URLs (add, edit, remove)
  4. Subscriber can toggle SMS opt-in/opt-out
  5. Subscriber can unsubscribe entirely through a clear, immediate flow
**Plans**: TBD

Plans:
- [ ] 07-01: Token-based preference page and update API
- [ ] 07-02: Unsubscribe flow and SMS opt-in/out toggle

### Phase 8: SMS Channel
**Goal**: Opted-in subscribers receive SMS summaries and can interact with their newsletter via two-way text conversation
**Depends on**: Phase 6
**Requirements**: SMS-01, SMS-02, SMS-03, SMS-04, SMS-05, SMS-06
**Success Criteria** (what must be TRUE):
  1. Twilio is integrated with A2P 10DLC registration approved and active
  2. Opted-in subscribers receive a daily SMS summary of their newsletter report
  3. Subscribers can text back follow-up questions about their report and receive AI-generated answers
  4. Subscribers can update preferences via natural language text ("add local events", "stop sending crypto stuff")
  5. STOP keyword immediately opts out, quiet hours are enforced (no sends before 8am or after 9pm local time), and TCPA-compliant consent is documented
**Plans**: TBD

Plans:
- [ ] 08-01: Twilio setup, A2P 10DLC registration, and TCPA compliance framework
- [ ] 08-02: SMS summary generation and delivery pipeline
- [ ] 08-03: Two-way conversational AI (follow-ups and preference updates via text)

## Progress

**Execution Order:**
Phase 1 → 1.1 → 2 & 3 (parallel) → 4 → 5 → 6 → 7 → 8

Note: Phase 2 (Subscriber Onboarding) and Phase 3 (Consulting Funnel) both depend only on Phase 1.1, so they can execute in parallel.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 4/4 | Complete | 2026-02-20 |
| 1.1. Homepage Pivot & IA | 3/3 | Complete | 2026-02-22 |
| 2. Subscriber Onboarding | 0/4 | Planned | - |
| 3. Consulting Funnel | 0/5 | Planned | - |
| 4. AI Research Engine | 0/6 | Not started | - |
| 5. Content Generation | 0/2 | Not started | - |
| 6. Email Delivery & Compliance | 0/4 | Not started | - |
| 7. Preference Management | 0/2 | Not started | - |
| 8. SMS Channel | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-19*
*Last updated: 2026-02-20 after direction pivot — consulting-first homepage, inserted Phase 1.1, elevated consulting funnel to Phase 3, expanded smart intake to 2-stage with curated question library*
