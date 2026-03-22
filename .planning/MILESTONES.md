# Milestones

## v1.0 MVP (Shipped: 2026-03-22)

**Phases completed:** 9 phases, 35 plans, 64 tasks

**Key accomplishments:**

- Next.js 16.1.6 with Tailwind v4 custom theme, Supabase SSR clients, and subscriber schema with RLS policies
- Responsive landing page with hero email capture, interactive example cards, scrolling trust strip, sticky CTA, and F/G/E copy via Framer Motion animations
- Server Action subscribeEmail wired to hero and sticky CTA forms via useActionState with Supabase service_role inserts, validation, duplicate handling, and spam-folder-aware success messaging
- Privacy policy and terms of service with GDPR/CAN-SPAM/TCPA-compliant content, data retention timelines, and shared legal typography layout
- Zod 4 onboarding schema with 10 validated fields, Supabase preference migration with 6 tables and RLS, and topic data structure with 8 categories / 41 subtopics
- Multi-step onboarding stepper with useReducer state machine, direction-aware AnimatePresence transitions, expandable topic category cards with 8 categories/41 subtopics, and 3 identity-framed format choices using F/G/E microcopy
- Delivery time selector with 3 F/G/E-framed time slot cards, city input, dynamic RSS feed URL inputs with format validation, and SMS opt-in with benefits-first pitch revealing phone input on interest
- End-to-end onboarding pipeline with confetti confirmation, completeOnboarding Server Action persisting to 4 Supabase tables, React Email welcome template, and landing page redirect to /onboarding
- AI SDK v6 + PDF renderer installed, 20-question intake library with typed categories, Zod schemas for intake flow and 9-section business plan, Supabase migration for intake persistence
- Full consulting landing page with F/G/E hero, service grid, how-it-works, FAQ accordion, and FunnelStage state machine for same-URL transitions
- AI-powered intake flow with Claude Haiku question selection, smart inputs (buttons/text/slider/multi-select), adaptive progress with generate-plan CTA at minimum threshold, back/skip navigation, and session recovery
- Streaming business plan API using Claude Sonnet with Output.object, progressive section rendering via useObject, and downloadable PDF template with PDFDownloadLink
- Vitest test framework, shared research pipeline types, Zod schemas for LLM structured output, and NLP topic parser via Gemini 2.5 Flash with 13 passing tests
- 5 research pipeline tables with RLS, pgmq queue with RPC wrappers, pg_cron daily scheduling at 6am UTC, and run-logger with 4 passing tests
- Brave Search, GDELT DOC, and RSS feed parser clients returning normalized SearchResult[] with 27 passing tests across all source modules
- Cheerio HTML scraper with og:title/description preference and SSRF-safe feed URL validator blocking private IPs, localhost, and non-HTTPS
- URL verification via HEAD requests, SHA-256 deduplication with 30-day history, and 7-day freshness filter for anti-hallucination pipeline
- Hand-rolled TF-IDF relevance scorer, keyword-overlap topic clustering with 24h cache, and Deno Edge Function orchestrating full research pipeline from pgmq to stored results
- 8 curated default RSS feeds (TechCrunch, Ars Technica, HN, The Verge, Reuters, NPR, MIT Tech Review, Benedict Evans) wired into the Edge Function pipeline via inlined DEFAULT_RSS_FEEDS constant with sourceName 'rss', closing the RSCH-04 gap identified in verification.
- Content generation pipeline with 3 Zod-validated newsletter formats (digest/briefing/mixed), Lucas voice prompt with exemplars, fallback for sparse results, and anti-hallucination URL validation
- Deno Edge Function generating newsletter content from research results via Gemini 2.5 Flash with UPSERT storage, and research pipeline trigger wiring for automated end-to-end flow
- Database schema (send_log, subscriber_feedback, warm_up_config), pgmq email_delivery queue with 3 delivery-window cron jobs, HMAC-SHA256 token security module, CTA engagement logic, and shared email styles
- 4 React Email newsletter templates (digest, briefing, mixed, fallback) with per-item feedback links encoding actual item URLs, engagement-conditional consulting CTAs, and 35-test suite covering all formats
- Deno Edge Function reads pgmq queue and sends personalized HTML emails via Resend with RFC 8058 compliance headers, warm-up quota enforcement, and admin dashboard at /admin with stats + subscriber status table
- Token-validated preference page with per-section save forms for topics, format/delivery/SMS, custom sources, and unsubscribe/re-subscribe via five Server Actions
- Subscriber feedback signals (more/less) integrated into Gemini query generation prompt and TF-IDF relevance scoring with domain-based boost/penalty
- SMS database schema with sms_send_log/sms_conversations tables, TCPA consent columns, pgmq queue, quiet hours enforcement, and Zod intent parser with 13 passing tests
- Outbound SMS Edge Function with Claude Haiku summary generation, Twilio REST API delivery, quiet hours enforcement, and newsletter view-in-browser page
- Two-way conversational SMS webhook with Claude Haiku intent detection, STOP/START opt-out handling, and TCPA consent recording at onboarding and preference update
- Newsletter page at /newsletter composing all 7 landing components with shared NavBar featuring active link detection and Framer Motion glassmorphism header
- Consulting-first homepage with F/G/E hero, 4 service category cards, dual CTA routing (Work With Me + Daily Briefing), and proof-of-work newsletter teaser
- Styled /work-with-me placeholder with Framer Motion entrance animation, mailto CTA, and consulting-first root metadata replacing newsletter-focused social previews

---
