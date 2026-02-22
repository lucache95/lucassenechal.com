# Lucas Senechal — AI Systems Consulting & Newsletter Platform

## What This Is

A personal website (lucassenechal.com) that serves as the digital hub for Lucas Senechal's AI consulting business. Two entry paths, one ecosystem: (1) a consulting-first homepage that positions Lucas as the person who builds AI systems to eliminate repetitive admin and follow-ups so teams scale revenue without scaling headcount, and (2) a free AI-powered daily newsletter that acts as proof-of-work and a nurture engine — every personalized email demonstrates the capability that converts subscribers into consulting clients.

## Core Value Proposition

You build AI systems that eliminate repetitive admin and follow-ups so teams can scale revenue without scaling headcount. Revenue scales faster than costs/overhead. This is a problem/outcome wedge that stays broad across industries — niche by pain, not by industry.

## Core Value (Newsletter)

Every subscriber receives a daily briefing researched and written specifically for them — not a generic blast, but content tailored to exactly what they asked for.

## Information Architecture

One ecosystem, two front doors. Don't make one homepage do two jobs.

```
lucassenechal.com (/)          → Consulting-first homepage (revenue engine)
  Primary CTA: Work With Me
  Secondary CTA: Get the Daily Briefing

/work-with-me                  → Dedicated consulting conversion page
  2-stage AI smart intake → instant business plan → book a call

/newsletter (or /daily-brief)  → Dedicated newsletter landing page
  Optimized purely for subscribing + examples + onboarding stepper
```

**Funnel philosophy: "one system, two entry paths," not one mandatory path.**
- High-intent leads (cold email, LinkedIn DMs, referrals) → straight to /work-with-me
- Low/medium-intent audience (social content) → /newsletter to nurture and prove capability over time

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Homepage (Consulting-First)**
- [ ] Consulting-first homepage that clearly communicates the value prop: AI systems that eliminate admin/follow-ups for revenue scaling
- [ ] Primary CTA: "Work With Me" — direct path for high-intent buyers
- [ ] Secondary CTA: "Get the Daily Briefing" — newsletter as proof-of-work and lead magnet
- [ ] Humble but confident tone — "always learning" without sounding junior
- [ ] Fully responsive with premium animations (Framer Motion)

**Newsletter Landing Page (/newsletter)**
- [ ] Dedicated newsletter landing page at /newsletter optimized purely for subscribing
- [ ] Hero headline communicating personalized newsletter value
- [ ] Example cards showing variety of possible topics
- [ ] Email capture CTA
- [ ] Smooth animations and transitions

**Newsletter Signup Flow**
- [ ] Email capture on newsletter landing page
- [ ] Customization page: plain-English text box for describing what they want
- [ ] Optional location input (for local content)
- [ ] Optional delivery time preference
- [ ] Newsletter format choice — 3 styles (curated digest, written briefing, mixed)
- [ ] Optional SMS opt-in: "Text me the report" checkbox with phone number input
- [ ] Confirmation page with first-delivery expectation

**AI Research Engine**
- [ ] Multi-source research pipeline: Brave API (web search), News APIs, RSS feeds, site scraping, Reddit, X
- [ ] Natural language topic parsing — understand what subscribers actually want from their plain-English descriptions
- [ ] Daily automated research runs for each subscriber's topics
- [ ] Content generation in 3 newsletter formats (digest, briefing, mixed)
- [ ] Research quality that makes each email genuinely useful

**Email Delivery**
- [ ] Daily personalized emails via Resend
- [ ] Clean, readable email templates matching site design
- [ ] 3 email format templates (curated digest, written briefing, mixed)
- [ ] Unsubscribe and preference management via email links
- [ ] Soft CTA to "Work With Me" in every email; stronger CTAs triggered by engagement (clicks/replies/feedback)

**SMS Channel (Twilio)**
- [ ] SMS summary of daily report for opted-in subscribers
- [ ] Two-way conversational AI via text message
- [ ] Preference updates through SMS ("add local events", "stop sending crypto stuff")
- [ ] Follow-up questions about report content via SMS ("tell me more about that AI tool")

**"Work With Me" Page — 2-Stage AI Smart Intake**
- [ ] Dedicated /work-with-me consulting conversion page
- [ ] Service descriptions (AI automation, process consulting, ongoing management, training)
- [ ] Stage 1 intake: Fast qualification + scoping (2-4 minutes, 8-12 questions max)
  - One-question-at-a-time, show progress, always allow skip
  - Collects: business + team size, which workflow, current stack, data sources, volume, main pain, timeline, optional budget band
  - Uses curated question library — AI selects next question from pool (doesn't invent endless questions)
  - Hard cap: ~12 questions for Stage 1
- [ ] Instant plan output after Stage 1:
  - Mirror their goal in their words
  - Bottleneck diagnosis
  - Proposed system steps (simple diagram)
  - Tools/integrations needed (their stack + additions)
  - Implementation phases (MVP → hardening → reporting/optimization)
  - Risks/dependencies (access, data quality, compliance)
  - Estimate tier (S/M/L) + timeline + assumptions
  - Clear next steps (book call / implementation)
- [ ] Stage 2 intake (optional, post-submit or post-booking): 5-8 deeper questions for more accuracy
  - Framed as: "Answer 5 more for a more exact plan"
  - Does not block conversion — available after initial plan is shown
- [ ] Calendly embed to book 15-min discovery call after seeing plan
- [ ] All intake data stored for Lucas to review before the call

**Services Offered (via Work With Me)**
- [ ] AI automation builds (custom agents, workflows, pipelines)
- [ ] Process consulting (audit operations, recommend where AI fits)
- [ ] Ongoing management (monthly retainer to maintain/improve AI systems)
- [ ] Training (teach teams to use AI tools effectively)

**Preference Management**
- [ ] Email-based preference update links (no login required)
- [ ] Update topics, format, delivery time, SMS opt-in/out
- [ ] Unsubscribe flow

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Full user dashboard / login system — keep it simple, email-link management is enough for v1
- Ad insertion in newsletter content — future monetization, not v1
- SMS/email marketing campaigns — build the list first, market later
- White-label / SaaS version — start personal, evaluate based on traction
- Payment processing — v1 is free newsletter + book-a-call for consulting
- Mobile app — web-first, responsive design covers mobile
- Industry-specific niching — niche by pain (admin + follow-ups + operational leverage), not by industry
- Timeframe guarantees in core positioning — use timeframes in productized deliverables only (delivery-based: "built & deployed in X days"), not outcome guarantees

## Context

**Who this is for:**
- Lucas Senechal's personal brand and consulting business
- Subscribers: anyone who wants a personalized daily briefing (wide audience)
- Consulting clients: businesses that want AI automation, process optimization, or training

**The funnel (two entry paths):**

Path A — High-intent (consulting):
1. Prospect finds Lucas via LinkedIn, cold email, referrals
2. Goes directly to /work-with-me
3. Completes AI smart intake (2-4 minutes)
4. Receives instant business plan + estimate
5. Books discovery call with full context already captured

Path B — Low/medium-intent (newsletter):
1. People find Lucas via social content, word of mouth, Google
2. Go to /newsletter, sign up for free
3. Receive daily personalized briefs — AI delivers exactly what they asked for
4. Experience Lucas's AI capability — every email is proof he knows what he's doing
5. Soft CTAs in emails lead to /work-with-me over time
6. Engagement-triggered stronger CTAs convert warm leads

**Why SMS matters:**
- Builds a dual-channel list (email + SMS) from day one
- SMS has dramatically higher open rates than email
- Two-way AI conversation via text makes the service feel alive and personal
- Opens future marketing and monetization channels

**Content strategy:**
- Every newsletter sent is potential LinkedIn/Facebook content ("Here's what my AI found today...")
- The newsletter is proof-of-work + nurture, not the mandatory gateway
- Soft CTA to consulting in every email; stronger CTAs triggered by engagement signals

## Constraints

- **Budget**: ~$14/month operational cost target (Railway $5, GitHub $4, Brave API $5) + Twilio per-message costs + Resend costs
- **Tech Stack**: Next.js + Framer Motion (frontend), Supabase (auth/DB), Resend (email), Twilio (SMS), Railway (hosting), Brave API (search), Anthropic Claude API (AI)
- **Design**: Warm, approachable, premium feel (Notion/Cal.com aesthetic) — the service is simple, so the experience must feel quality
- **Copy Framework**: Every touchpoint uses Fear/Greed/Ego microcopy pattern — Fear (risk you avoid: "Don't miss what matters"), Greed (upside you capture: "Get the best opportunities"), Ego (identity you express: "Be the person who's already up to speed"). Headlines, CTAs, signup steps, email subjects, preference pages — all hit this triad.
- **Tone**: Humble but confident — "always learning" without sounding junior. Niche by pain, not industry.
- **Custom Sources**: Subscriber-provided sources are RSS/Atom feeds only in v1 (security constraint — prevents SSRF, simpler to validate)
- **Solo operator**: Lucas runs this alone — everything must be automated, minimal manual intervention
- **Scale**: Start personal (lucassenechal.com), evaluate product potential based on traction
- **Smart intake guardrails**: Curated question library (AI selects, doesn't invent). Hard caps (Stage 1 ~12, Stage 2 ~5-8). Always provide skip/exit.
- **No timeframe guarantees**: Don't put "30/60 days" in core positioning. Use timeframes in productized deliverables only.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Framer Motion for frontend | Premium animations, scales well, huge ecosystem, good mobile/desktop support | Shipped (Phase 1) |
| Supabase for DB/auth | Familiar, fast to build with, handles subscriber data and preferences | Shipped (Phase 1) |
| Resend for email delivery | Developer-friendly, good deliverability, reasonable cost | Configured |
| Twilio for SMS | Industry standard, reliable API, enables two-way AI conversation | Configured |
| No user login — email-link management | Reduces friction, keeps it simple, login not needed for v1 | — Pending |
| 3 newsletter format options | Lets subscribers choose their experience (digest, briefing, mixed) | — Pending |
| 2-stage smart intake for consulting | Stage 1 fast qualification, instant plan output, optional Stage 2 deepening | — Pending |
| Curated question library for intake | AI selects from pool, doesn't invent — keeps quality high, prevents endless questions | — Pending |
| Instant plan output (not just estimate) | Full 1-page plan with bottleneck diagnosis, system steps, tools, phases, risks, estimate | — Pending |
| Consulting-first homepage | Homepage leads with value prop + Work With Me. Newsletter is secondary CTA / proof-of-work | Direction shift (2026-02-20) |
| Two front doors (/ and /newsletter) | Don't make one page do two jobs. High-intent → /work-with-me, nurture → /newsletter | Direction shift (2026-02-20) |
| Niche by pain, not industry | Admin + follow-ups + operational leverage. Keeps positioning broad across industries | Direction shift (2026-02-20) |
| Ads/marketing deferred to future | Build the list and prove value first, monetize later | — Pending |

---
*Last updated: 2026-02-20 after direction pivot (consulting-first homepage, two front doors, 2-stage intake)*
