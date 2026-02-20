# Requirements: Lucas Senechal — AI Newsletter & Consulting Platform

**Defined:** 2026-02-19
**Core Value:** Every subscriber receives a daily briefing researched and written specifically for them -- not a generic blast, but content tailored to exactly what they asked for.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Landing Page & Website

- [ ] **SITE-01**: Landing page with hero headline communicating personalized value prop
- [ ] **SITE-02**: Example cards showing variety of possible topics (AI tools, local deals, concerts, business leads, etc.)
- [ ] **SITE-03**: Email capture CTA on landing page
- [ ] **SITE-04**: Fully responsive -- premium experience on mobile and desktop
- [ ] **SITE-05**: Smooth animations and transitions (Framer Motion)
- [ ] **SITE-06**: Warm, approachable design aesthetic (Notion/Cal.com vibe)
- [x] **SITE-07**: Professional domain with HTTPS (lucassenechal.com)
- [x] **SITE-08**: Page load under 2 seconds (LCP)

### Newsletter Signup Flow

- [ ] **SIGN-01**: Multi-step signup flow (email -> customize -> confirmation)
- [ ] **SIGN-02**: Topic input via multiple choice categories with "(Most Popular)" labels + freeform custom option
- [ ] **SIGN-03**: Newsletter format choice from 3 options: curated digest, written briefing, mixed -- with "(Most Popular)" default
- [ ] **SIGN-04**: Optional location input for local content personalization
- [ ] **SIGN-05**: Delivery time preference selector
- [ ] **SIGN-06**: SMS opt-in checkbox with phone number input
- [ ] **SIGN-07**: Custom source input -- subscribers can add RSS/Atom feed URLs to monitor (RSS only in v1 for security)
- [ ] **SIGN-08**: Confirmation page with first-delivery expectation
- [ ] **SIGN-09**: Welcome/confirmation email with preview of what to expect

### AI Research Engine

- [ ] **RSCH-01**: NLP topic parsing -- convert plain-English descriptions + category selections into actionable research queries
- [ ] **RSCH-02**: Brave API web search integration
- [ ] **RSCH-03**: News APIs integration (structured news feeds)
- [ ] **RSCH-04**: RSS feed parsing for curated sources
- [ ] **RSCH-05**: Reddit content research integration
- [ ] **RSCH-06**: X (Twitter) content research integration
- [ ] **RSCH-07**: Targeted site scraping for specific sources
- [ ] **RSCH-08**: Custom source monitoring (subscriber-provided RSS/Atom feeds only in v1 — validate feed format, block internal IPs, enforce size limits)
- [ ] **RSCH-09**: Daily automated research runs per subscriber
- [ ] **RSCH-10**: Source attribution and URL verification (anti-hallucination)
- [ ] **RSCH-11**: Topic clustering for cost optimization (shared research where topics overlap)

### Content Generation

- [ ] **CONT-01**: Content generation in "curated digest" format (5-8 items with summaries and links)
- [ ] **CONT-02**: Content generation in "written briefing" format (narrative synthesis with sources)
- [ ] **CONT-03**: Content generation in "mixed" format (short synthesis + itemized links)
- [ ] **CONT-04**: Voice injection -- content reads naturally, not AI-generic (deliverability + brand)

### Email Delivery

- [ ] **MAIL-01**: Daily personalized emails via Resend
- [ ] **MAIL-02**: 3 responsive email templates matching the 3 formats
- [ ] **MAIL-03**: Clean design matching website aesthetic, 60%+ text ratio
- [ ] **MAIL-04**: One-click unsubscribe in every email (CAN-SPAM/GDPR compliant)
- [ ] **MAIL-05**: SPF/DKIM/DMARC authentication setup
- [ ] **MAIL-06**: Domain warm-up strategy (graduated volume over 4-6 weeks)
- [ ] **MAIL-07**: Preference update link in every email
- [ ] **MAIL-08**: Per-subscriber delivery time scheduling
- [ ] **MAIL-09**: Deliverability monitoring (open rates, bounces, spam complaints)

### SMS Channel

- [ ] **SMS-01**: Twilio integration with A2P 10DLC registration
- [ ] **SMS-02**: TCPA-compliant opt-in with documented consent
- [ ] **SMS-03**: SMS summary of daily report for opted-in subscribers
- [ ] **SMS-04**: Two-way conversational AI -- ask follow-up questions about today's report
- [ ] **SMS-05**: Preference updates via text message ("add local events", "stop sending crypto")
- [ ] **SMS-06**: STOP/opt-out handling and quiet-hours enforcement

### Work With Me -- Consulting Funnel

- [ ] **WORK-01**: Separate /work-with-me page
- [ ] **WORK-02**: Service descriptions (AI automation, process consulting, ongoing management, training)
- [ ] **WORK-03**: AI-adaptive intake form -- one question at a time, AI generates next question based on responses
- [ ] **WORK-04**: Form starts simple (name, business, what they do) and progressively probes deeper into AI/automation needs
- [ ] **WORK-05**: Subtle exit option always available but non-dominant
- [ ] **WORK-06**: Instant AI project estimate at completion (Small/Medium/Large tier with price range)
- [ ] **WORK-07**: Calendly embed to book 15-min discovery call after estimate
- [ ] **WORK-08**: All intake data stored for Lucas to review before the call
- [ ] **WORK-09**: Real-time feel -- < 2 second latency between questions

### Preference Management

- [ ] **PREF-01**: Email-link preference management (no login required, token-based)
- [ ] **PREF-02**: Update topics (multiple choice + custom)
- [ ] **PREF-03**: Update format, delivery time, location
- [ ] **PREF-04**: SMS opt-in/opt-out toggle
- [ ] **PREF-05**: Manage custom sources
- [ ] **PREF-06**: Unsubscribe flow

### Content Quality

- [ ] **QUAL-01**: Deduplication — never show the same story/item twice across consecutive newsletters
- [ ] **QUAL-02**: Recency filtering — prefer content from last 7 days unless subscriber requested evergreen topics
- [ ] **QUAL-03**: Relevance scoring — rank research results by keyword overlap and topic match before inclusion
- [ ] **QUAL-04**: "Nothing found" fallback — when research yields insufficient results, be honest and suggest refining preferences

### Feedback Loops

- [ ] **FDBK-01**: "More like this / Less like this" links per item in newsletter emails
- [ ] **FDBK-02**: Capture feedback to automatically refine research queries over time

### Ops & Observability

- [ ] **OPS-01**: Per-run logging — what queries ran, what sources returned, what was sent to each subscriber
- [ ] **OPS-02**: Retry strategy and alerting for failed research runs or email sends
- [ ] **OPS-03**: Admin view — subscriber list, last send status, error traces (internal, for Lucas)

### Copy & UX

- [ ] **COPY-01**: All touchpoints use Fear/Greed/Ego microcopy framework (landing page, signup steps, CTAs, email subjects, preference pages)
- [ ] **COPY-02**: Signup flow steps framed with F/G/E: topic step = "What do you want to be ahead on?", format step = identity-framed options, confirmation = confidence-building

### Legal & Privacy

- [ ] **LEGL-01**: Privacy policy and terms of service pages
- [ ] **LEGL-02**: Data retention rules documented (especially for phone numbers and SMS consent records)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Monetization

- **MNTZ-01**: Ad insertion slots within newsletter content
- **MNTZ-02**: SMS marketing campaigns to subscriber list
- **MNTZ-03**: Email marketing campaigns to subscriber list
- **MNTZ-04**: Sponsored content sections

### Advanced Features

- **ADVN-01**: Topic overlap caching optimization (shared research for common topics)
- **ADVN-02**: AI-generated subject lines per subscriber
- **ADVN-03**: Subscriber engagement analytics dashboard (internal)
- **ADVN-04**: A/B testing for newsletter formats and content styles
- **ADVN-05**: Multi-language support

### Scale

- **SCAL-01**: White-label / SaaS version for other consultants
- **SCAL-02**: Payment processing for paid newsletter tier
- **SCAL-03**: BullMQ + Redis job queue (upgrade from node-cron at 1,000+ subscribers)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User dashboard / login system | Email-link management is sufficient. Auth adds complexity with no user value for a newsletter. |
| Mobile app | Responsive web + email + SMS covers every device. Zero ROI at this scale. |
| Real-time collaborative topic editing | Scope creep -- turns signup into a product. Text box + preference links are enough. |
| Paid subscription tier | Premature monetization kills growth. Revenue comes from consulting. |
| Complex subscriber-facing analytics | Subscribers don't care about their open rate. Internal analytics only. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 1: Foundation & Landing Page | Pending |
| SITE-02 | Phase 1: Foundation & Landing Page | Pending |
| SITE-03 | Phase 1: Foundation & Landing Page | Pending |
| SITE-04 | Phase 1: Foundation & Landing Page | Pending |
| SITE-05 | Phase 1: Foundation & Landing Page | Pending |
| SITE-06 | Phase 1: Foundation & Landing Page | Pending |
| SITE-07 | Phase 1: Foundation & Landing Page | Complete |
| SITE-08 | Phase 1: Foundation & Landing Page | Complete |
| SIGN-01 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-02 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-03 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-04 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-05 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-06 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-07 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-08 | Phase 2: Subscriber Onboarding | Pending |
| SIGN-09 | Phase 2: Subscriber Onboarding | Pending |
| RSCH-01 | Phase 3: AI Research Engine | Pending |
| RSCH-02 | Phase 3: AI Research Engine | Pending |
| RSCH-03 | Phase 3: AI Research Engine | Pending |
| RSCH-04 | Phase 3: AI Research Engine | Pending |
| RSCH-05 | Phase 3: AI Research Engine | Pending |
| RSCH-06 | Phase 3: AI Research Engine | Pending |
| RSCH-07 | Phase 3: AI Research Engine | Pending |
| RSCH-08 | Phase 3: AI Research Engine | Pending |
| RSCH-09 | Phase 3: AI Research Engine | Pending |
| RSCH-10 | Phase 3: AI Research Engine | Pending |
| RSCH-11 | Phase 3: AI Research Engine | Pending |
| CONT-01 | Phase 4: Content Generation | Pending |
| CONT-02 | Phase 4: Content Generation | Pending |
| CONT-03 | Phase 4: Content Generation | Pending |
| CONT-04 | Phase 4: Content Generation | Pending |
| MAIL-01 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-02 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-03 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-04 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-05 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-06 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-07 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-08 | Phase 5: Email Delivery & Compliance | Pending |
| MAIL-09 | Phase 5: Email Delivery & Compliance | Pending |
| SMS-01 | Phase 7: SMS Channel | Pending |
| SMS-02 | Phase 7: SMS Channel | Pending |
| SMS-03 | Phase 7: SMS Channel | Pending |
| SMS-04 | Phase 7: SMS Channel | Pending |
| SMS-05 | Phase 7: SMS Channel | Pending |
| SMS-06 | Phase 7: SMS Channel | Pending |
| WORK-01 | Phase 8: Consulting Funnel | Pending |
| WORK-02 | Phase 8: Consulting Funnel | Pending |
| WORK-03 | Phase 8: Consulting Funnel | Pending |
| WORK-04 | Phase 8: Consulting Funnel | Pending |
| WORK-05 | Phase 8: Consulting Funnel | Pending |
| WORK-06 | Phase 8: Consulting Funnel | Pending |
| WORK-07 | Phase 8: Consulting Funnel | Pending |
| WORK-08 | Phase 8: Consulting Funnel | Pending |
| WORK-09 | Phase 8: Consulting Funnel | Pending |
| PREF-01 | Phase 6: Preference Management | Pending |
| PREF-02 | Phase 6: Preference Management | Pending |
| PREF-03 | Phase 6: Preference Management | Pending |
| PREF-04 | Phase 6: Preference Management | Pending |
| PREF-05 | Phase 6: Preference Management | Pending |
| PREF-06 | Phase 6: Preference Management | Pending |
| QUAL-01 | Phase 3: AI Research Engine | Pending |
| QUAL-02 | Phase 3: AI Research Engine | Pending |
| QUAL-03 | Phase 3: AI Research Engine | Pending |
| QUAL-04 | Phase 4: Content Generation | Pending |
| FDBK-01 | Phase 5: Email Delivery & Compliance | Pending |
| FDBK-02 | Phase 6: Preference Management | Pending |
| OPS-01 | Phase 3: AI Research Engine | Pending |
| OPS-02 | Phase 3: AI Research Engine | Pending |
| OPS-03 | Phase 5: Email Delivery & Compliance | Pending |
| COPY-01 | Phase 1: Foundation & Landing Page | Pending |
| COPY-02 | Phase 2: Subscriber Onboarding | Pending |
| LEGL-01 | Phase 1: Foundation & Landing Page | Pending |
| LEGL-02 | Phase 1: Foundation & Landing Page | Pending |

**Coverage:**
- v1 requirements: 75 total
- Mapped to phases: 75
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after roadmap creation*
