# Roadmap: Lucas Senechal — AI Newsletter & Consulting Platform

## Overview

This roadmap delivers a personalized AI newsletter platform and consulting funnel for lucassenechal.com. The build follows the content pipeline's natural dependency chain: infrastructure and landing page first, then subscriber onboarding, then the AI research engine that powers everything, then content generation, then email delivery, then preference management to close the subscriber loop. SMS and the consulting funnel are independent tracks that build on the proven email pipeline. Domain warm-up and A2P 10DLC registration start in Phase 1 due to multi-week calendar dependencies.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Landing Page** - Project infrastructure, database, domain setup, and the landing page that captures subscribers
- [ ] **Phase 2: Subscriber Onboarding** - Multi-step signup flow that collects topics, preferences, and consent
- [ ] **Phase 3: AI Research Engine** - The core value engine: parse topics, query sources, synthesize per-subscriber research
- [ ] **Phase 4: Content Generation** - Transform raw research into polished newsletter content in three formats
- [ ] **Phase 5: Email Delivery & Compliance** - Send personalized emails via Resend with deliverability infrastructure
- [ ] **Phase 6: Preference Management** - Email-link-based preference updates, format changes, and unsubscribe flows
- [ ] **Phase 7: SMS Channel** - Twilio-powered SMS summaries and two-way conversational AI
- [ ] **Phase 8: Consulting Funnel** - "Work With Me" page with AI-adaptive intake form and instant project estimates

## Phase Details

### Phase 1: Foundation & Landing Page
**Goal**: Visitors can see a polished landing page, and all infrastructure is ready for subscriber data and email sending
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, SITE-08, COPY-01, LEGL-01, LEGL-02
**Success Criteria** (what must be TRUE):
  1. Visitor loads lucassenechal.com and sees a polished hero section with F/G/E copy: fear of missing out, greed for opportunity, ego of being ahead
  2. Landing page displays example topic cards showing the breadth of possible personalization (AI tools, local deals, concerts, business leads)
  3. Landing page renders beautifully on both mobile and desktop with smooth animations
  4. Page loads in under 2 seconds (LCP) on a standard connection
  5. SPF/DKIM/DMARC are configured on the sending domain, and domain warm-up has been initiated
  6. Privacy policy and terms of service pages are live
**Plans**: TBD

Plans:
- [ ] 01-01: Next.js project setup, Supabase schema, and deployment pipeline
- [ ] 01-02: Landing page design with F/G/E copy framework and responsive implementation
- [ ] 01-03: Domain configuration, email authentication, and warm-up initiation
- [ ] 01-04: Privacy policy, terms of service, and legal pages

### Phase 2: Subscriber Onboarding
**Goal**: A visitor can complete the full signup flow and become a subscriber with stored preferences
**Depends on**: Phase 1
**Requirements**: SIGN-01, SIGN-02, SIGN-03, SIGN-04, SIGN-05, SIGN-06, SIGN-07, SIGN-08, SIGN-09, COPY-02
**Success Criteria** (what must be TRUE):
  1. Visitor can enter their email on the landing page and proceed to a multi-step customization flow
  2. Subscriber can select topics from categorized options with "(Most Popular)" labels and add freeform custom topics
  3. Subscriber can choose newsletter format (digest, briefing, or mixed), set delivery time, provide location, add RSS/Atom feed URLs, and opt in to SMS
  4. Every signup step uses F/G/E microcopy (e.g., "What do you want to be ahead on?", identity-framed format options)
  5. After completing signup, subscriber sees a confirmation page with first-delivery expectations and receives a welcome email
  6. All subscriber data (email, topics, format, location, delivery time, SMS consent, custom sources) is persisted in Supabase
**Plans**: TBD

Plans:
- [ ] 02-01: Multi-step signup flow UI (email capture through confirmation)
- [ ] 02-02: Topic selection, format choice, and preference collection
- [ ] 02-03: Signup API, Supabase persistence, and welcome email

### Phase 3: AI Research Engine
**Goal**: The system can take a subscriber's topic preferences and produce fresh, sourced research results daily
**Depends on**: Phase 1
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
- [ ] 03-01: NLP topic parsing and query generation
- [ ] 03-02: Queue infrastructure (pgmq), scheduling (pg_cron), logging, and retry strategy
- [ ] 03-03: Source integrations (Brave API, News APIs, RSS feeds)
- [ ] 03-04: Source integrations (Reddit, X, site scraping, custom RSS feeds)
- [ ] 03-05: Source attribution, freshness filtering, deduplication, and anti-hallucination
- [ ] 03-06: Topic clustering, relevance scoring, and research caching for cost optimization

### Phase 4: Content Generation
**Goal**: Raw research results are transformed into polished, voice-injected newsletter content in three distinct formats
**Depends on**: Phase 3
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, QUAL-04
**Success Criteria** (what must be TRUE):
  1. Research results can be generated into a "curated digest" format (5-8 items with summaries and links)
  2. Research results can be generated into a "written briefing" format (narrative synthesis with sources)
  3. Research results can be generated into a "mixed" format (short synthesis + itemized links)
  4. Generated content reads naturally with Lucas's personal voice — not generic AI-sounding text
  5. When research yields insufficient results, the system honestly communicates this and suggests refining preferences
**Plans**: TBD

Plans:
- [ ] 04-01: Content generation pipeline and format templates
- [ ] 04-02: Voice injection, style system, and content variation

### Phase 5: Email Delivery & Compliance
**Goal**: Subscribers receive their personalized daily email reliably and on schedule with full deliverability compliance
**Depends on**: Phase 4
**Requirements**: MAIL-01, MAIL-02, MAIL-03, MAIL-04, MAIL-05, MAIL-06, MAIL-07, MAIL-08, MAIL-09, FDBK-01, OPS-03
**Success Criteria** (what must be TRUE):
  1. Each subscriber receives a daily personalized email via Resend at their preferred delivery time
  2. Three responsive email templates (digest, briefing, mixed) render correctly on mobile and desktop with clean design matching the website
  3. Every email includes a one-click unsubscribe link and a preference update link (CAN-SPAM/GDPR compliant)
  4. Each item in the newsletter has "More like this / Less like this" feedback links
  5. Domain warm-up is actively managed with graduated volume increases over 4-6 weeks
  6. Deliverability metrics (open rates, bounce rates, spam complaints) are monitored and actionable
  7. Admin view shows subscriber list, last send status, and error traces
**Plans**: TBD

Plans:
- [ ] 05-01: Email sending pipeline (Resend integration, scheduling, queue processing)
- [ ] 05-02: React Email templates for all three formats with feedback links
- [ ] 05-03: Compliance (unsubscribe, headers, warm-up management, deliverability monitoring)
- [ ] 05-04: Admin dashboard (subscriber list, send status, error traces)

### Phase 6: Preference Management
**Goal**: Subscribers can update all their preferences and unsubscribe without needing a login
**Depends on**: Phase 2, Phase 5
**Requirements**: PREF-01, PREF-02, PREF-03, PREF-04, PREF-05, PREF-06, FDBK-02
**Success Criteria** (what must be TRUE):
  1. Clicking a link in the email opens a token-based preference page (no login or password required)
  2. Subscriber can update their topics (multiple choice + custom), newsletter format, delivery time, and location
  3. Subscriber can manage their custom source URLs (add, edit, remove)
  4. Subscriber can toggle SMS opt-in/opt-out
  5. Subscriber can unsubscribe entirely through a clear, immediate flow
**Plans**: TBD

Plans:
- [ ] 06-01: Token-based preference page and update API
- [ ] 06-02: Unsubscribe flow and SMS opt-in/out toggle

### Phase 7: SMS Channel
**Goal**: Opted-in subscribers receive SMS summaries and can interact with their newsletter via two-way text conversation
**Depends on**: Phase 5
**Requirements**: SMS-01, SMS-02, SMS-03, SMS-04, SMS-05, SMS-06
**Success Criteria** (what must be TRUE):
  1. Twilio is integrated with A2P 10DLC registration approved and active
  2. Opted-in subscribers receive a daily SMS summary of their newsletter report
  3. Subscribers can text back follow-up questions about their report and receive AI-generated answers
  4. Subscribers can update preferences via natural language text ("add local events", "stop sending crypto stuff")
  5. STOP keyword immediately opts out, quiet hours are enforced (no sends before 8am or after 9pm local time), and TCPA-compliant consent is documented
**Plans**: TBD

Plans:
- [ ] 07-01: Twilio setup, A2P 10DLC registration, and TCPA compliance framework
- [ ] 07-02: SMS summary generation and delivery pipeline
- [ ] 07-03: Two-way conversational AI (follow-ups and preference updates via text)

### Phase 8: Consulting Funnel
**Goal**: Prospective clients can explore Lucas's services and complete an AI-driven intake that produces an instant project estimate
**Depends on**: Phase 1
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06, WORK-07, WORK-08, WORK-09
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate to /work-with-me and see clear descriptions of the four service offerings (AI automation, process consulting, ongoing management, training)
  2. Visitor can start an AI-adaptive intake form that presents one question at a time, with each subsequent question generated based on previous answers
  3. The form progressively probes deeper into AI/automation needs, with a subtle but always-available exit option, and responds within 2 seconds between questions
  4. After completing the intake, visitor receives an instant AI-generated project estimate (Small/Medium/Large tier with price range)
  5. After seeing the estimate, visitor can book a 15-minute discovery call via embedded Calendly, and all intake data is stored for Lucas to review before the call
**Plans**: TBD

Plans:
- [ ] 08-01: Work With Me page and service descriptions
- [ ] 08-02: AI-adaptive intake form (streaming question generation)
- [ ] 08-03: AI project estimate generation and Calendly integration

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

Note: Phase 3 (AI Research Engine) and Phase 8 (Consulting Funnel) both depend only on Phase 1, so they can execute in parallel. Similarly, Phase 2 (Subscriber Onboarding) and Phase 3 can proceed in parallel after Phase 1 completes.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Landing Page | 0/4 | Not started | - |
| 2. Subscriber Onboarding | 0/3 | Not started | - |
| 3. AI Research Engine | 0/6 | Not started | - |
| 4. Content Generation | 0/2 | Not started | - |
| 5. Email Delivery & Compliance | 0/4 | Not started | - |
| 6. Preference Management | 0/2 | Not started | - |
| 7. SMS Channel | 0/3 | Not started | - |
| 8. Consulting Funnel | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-19*
*Last updated: 2026-02-19 after adding content quality, feedback, ops, legal, and F/G/E copy requirements*
