# Phase 3: Consulting Funnel - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Prospective clients can explore Lucas's services on /work-with-me and complete a 2-stage AI-driven intake that produces an instant 1-page business plan with detailed estimate. After seeing the plan, they can book a 15-minute discovery call via Cal.com. All intake data is stored for Lucas to review.

</domain>

<decisions>
## Implementation Decisions

### Service page design
- Grid of cards (same style as homepage "What I Build" section) — 4 services with minimal 1-liner descriptions
- AI determines which service fits from intake answers — one universal "Start" CTA, no service pre-selection
- One prominent CTA button below the cards: "Tell me about your business" (or similar)
- Clicking CTA transforms the page into the intake — no route change, smooth transition on same /work-with-me URL
- Replace existing placeholder page — upgrade /work-with-me from placeholder to full consulting funnel
- Reuse trust strip logo component from homepage for social proof
- No pricing displayed anywhere — discovery call reveals pricing
- 3-step how-it-works visual before the CTA: Answer questions → Get your plan → Book a call
- Short FAQ section (3-4 questions) addressing common objections
- Hero section and headline: Claude's discretion, using F/G/E copy framework matching Phase 1.1 voice
- Card icons/visuals: Claude's discretion, matching existing design system

### Intake conversation UX
- Form-like design: one clean question centered on screen, answer below, next button — Typeform/survey feel
- Mixed smart inputs: AI picks the right input per question (buttons for choices, text for open-ended, sliders for ranges)
- Back button available — can go back to any previous question and change answer, AI re-adjusts following questions
- Subtle skip link below the input — available but non-prominent
- Straight to Q1 after clicking CTA — no intro screen
- Progress: smart and enticing — once minimum viable data is reached (~6-8 questions), offer "Generate plan now" OR "Answer more for better accuracy" with messaging like "Answer 5 more questions to improve project accuracy by 50%". Make it feel close to done but enticing to keep going. Visitors can keep answering as long as they want before generating.
- Stage 2 is NOT a separate phase — it's a continuation of the same intake. After minimum questions, visitor chooses: generate plan now or keep going for accuracy. This replaces the original two-stage concept.
- Transition between questions: Claude's discretion (typing indicator vs instant)

### Business plan output
- On-page styled sections + downloadable PDF ("Download your plan" button)
- Sections stream in real-time as AI generates them — reduces perceived wait
- Detailed phase-by-phase estimate breakdown with timeline (not just S/M/L tiers)
- Paraphrased mirroring — restate their situation in cleaner language, not direct quotes
- Plan sections per WORK-06: goal mirroring, bottleneck diagnosis, proposed system steps, tools/integrations, implementation phases (MVP → hardening → reporting), risks/dependencies, estimate + timeline + assumptions, clear next steps
- Subtle "Start a new assessment" link at the bottom

### Booking & follow-up
- Cal.com embed (not Calendly): https://cal.com/lucas-senechal/
- Embed style: Claude's discretion (inline vs popup)
- After booking: thank you confirmation + Stage 2 pitch ("Answer a few more to help me prepare for your call")
- Urgency messaging near booking CTA: manually updated spot count (e.g., "2 spots left for March"), sourced from env variable or config
- Messaging only in v1 — no deposit/payment integration

### Lead capture & data storage
- Email + name required before plan generation (captures the lead)
- All intake data stored even if they don't book — answers, generated plan, timestamps
- Email notification sent to Lucas when someone completes an intake
- Shareable plan URL: Claude's discretion on whether to implement unique URLs or session-only

### Claude's Discretion
- Hero section headline and copy (F/G/E framework)
- Card icons matching design system
- Transition animation between questions (typing indicator vs instant)
- Cal.com embed style (inline vs popup)
- Whether plan gets a unique shareable URL or is session-only
- Loading/progress messaging during plan generation
- FAQ content (3-4 common objections)

</decisions>

<specifics>
## Specific Ideas

- Progress bar should psychologically encourage completion — "almost done" feeling once minimum data is captured, then upsell accuracy gains for more questions
- "Answer 5 more questions to improve project accuracy by 50%" — specific, enticing, not pushy
- Urgency: "2 spots left for March — lock in your spot" near booking CTA (manual update via env/config)
- Cal.com link: https://cal.com/lucas-senechal/
- The intake is one continuous flow, not two separate stages. Minimum questions get you a plan. More questions get you a better plan. The visitor controls when to generate.

</specifics>

<deferred>
## Deferred Ideas

- Stripe deposit/payment integration ("Lock in your spot" with actual payment) — future phase after consulting funnel is validated
- Admin dashboard for managing spot count — use env variable for v1, upgrade later

</deferred>

---

*Phase: 03-consulting-funnel*
*Context gathered: 2026-02-22*
