# Lucas Senechal — Personal AI Newsletter & Consulting Platform

## What This Is

A personal website (lucassenechal.com) with two core functions: (1) a free AI-powered daily newsletter where each subscriber gets fully personalized content based on what they describe in plain English, and (2) a "Work With Me" consulting funnel with an AI-driven smart intake form that generates instant project estimates. The newsletter demonstrates Lucas's AI capabilities daily — every email is a live proof of work that converts subscribers into consulting clients.

## Core Value

Every subscriber receives a daily briefing researched and written specifically for them — not a generic blast, but content tailored to exactly what they asked for.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Website & Landing Page**
- [ ] Premium landing page with warm, approachable design (Notion/Cal.com vibe)
- [ ] Headline communicates the value: "Your Daily Briefing. Actually Personalized."
- [ ] Example cards showing variety of possible topics (AI tools, local deals, concerts, business leads, etc.)
- [ ] Fully responsive — premium experience on mobile and desktop
- [ ] Smooth animations and transitions (Framer Motion)

**Newsletter Signup Flow**
- [ ] Email capture on landing page
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

**SMS Channel (Twilio)**
- [ ] SMS summary of daily report for opted-in subscribers
- [ ] Two-way conversational AI via text message
- [ ] Preference updates through SMS ("add local events", "stop sending crypto stuff")
- [ ] Follow-up questions about report content via SMS ("tell me more about that AI tool")

**"Work With Me" Page — AI Smart Intake**
- [ ] Typeform-style one-question-at-a-time flow
- [ ] AI analyzes each response to determine the best next question
- [ ] Starts simple (name, business, what they do) and progressively probes deeper
- [ ] Questions adapt to uncover where AI/automation can help their specific business
- [ ] Subtle exit option always available but non-dominant — the flow should make them want to keep sharing
- [ ] Instant AI-generated project estimate at the end (Small/Medium/Large tier with price range)
- [ ] Calendly embed to book a 15-min discovery call after seeing estimate
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

## Context

**Who this is for:**
- Lucas Senechal's personal brand and consulting business
- Subscribers: anyone who wants a personalized daily briefing (wide audience)
- Consulting clients: businesses that want AI automation, process optimization, or training

**The funnel:**
1. People find Lucas via LinkedIn, Facebook, word of mouth, Google
2. Sign up for free newsletter — low friction, instant value promise
3. Receive daily personalized briefs — AI delivers exactly what they asked for
4. Experience Lucas's AI capability — every email is proof he knows what he's doing
5. Some visit "Work With Me" — smart intake captures their needs
6. AI generates instant estimate + they book a call
7. Lucas gets consulting clients with full context before the first conversation

**Why SMS matters:**
- Builds a dual-channel list (email + SMS) from day one
- SMS has dramatically higher open rates than email
- Two-way AI conversation via text makes the service feel alive and personal
- Opens future marketing and monetization channels

**Content strategy:**
- Every newsletter sent is potential LinkedIn/Facebook content ("Here's what my AI found today...")
- The newsletter itself is the sales pitch — no pressure, no pushy follow-ups

## Constraints

- **Budget**: ~$14/month operational cost target (Railway $5, GitHub $4, Brave API $5) + Twilio per-message costs + Resend costs
- **Tech Stack**: Next.js + Framer Motion (frontend), Supabase (auth/DB), Resend (email), Twilio (SMS), Railway (hosting), Brave API (search)
- **Design**: Warm, approachable, premium feel (Notion/Cal.com aesthetic) — the service is simple, so the experience must feel quality
- **Copy Framework**: Every touchpoint uses Fear/Greed/Ego microcopy pattern — Fear (risk you avoid: "Don't miss what matters"), Greed (upside you capture: "Get the best opportunities"), Ego (identity you express: "Be the person who's already up to speed"). Headlines, CTAs, signup steps, email subjects, preference pages — all hit this triad.
- **Custom Sources**: Subscriber-provided sources are RSS/Atom feeds only in v1 (security constraint — prevents SSRF, simpler to validate)
- **Solo operator**: Lucas runs this alone — everything must be automated, minimal manual intervention
- **Scale**: Start personal (lucassenechal.com), evaluate product potential based on traction

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Framer Motion for frontend | Premium animations, scales well, huge ecosystem, good mobile/desktop support | — Pending |
| Supabase for DB/auth | Familiar, fast to build with, handles subscriber data and preferences | — Pending |
| Resend for email delivery | Developer-friendly, good deliverability, reasonable cost | — Pending |
| Twilio for SMS | Industry standard, reliable API, enables two-way AI conversation | — Pending |
| No user login — email-link management | Reduces friction, keeps it simple, login not needed for v1 | — Pending |
| 3 newsletter format options | Lets subscribers choose their experience (digest, briefing, mixed) | — Pending |
| Typeform-style AI intake for consulting | Discovery call prep without the call — impressive, captures rich context | — Pending |
| Project tier pricing (S/M/L) for instant estimates | Simple to understand, AI can categorize complexity into tiers | — Pending |
| Ads/marketing deferred to future | Build the list and prove value first, monetize later | — Pending |

---
*Last updated: 2026-02-19 after initialization*
