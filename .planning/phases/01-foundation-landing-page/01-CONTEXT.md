# Phase 1: Foundation & Landing Page - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a polished, responsive landing page at lucassenechal.com with email capture, deploy to Railway with Supabase backend, configure domain/email authentication, and publish legal pages. This phase sets up all infrastructure and the first thing visitors see.

</domain>

<decisions>
## Implementation Decisions

### Page Layout & Flow
- **Hero section**: Headline + email field above the fold — minimal, conversion-focused
- **Page structure**: Short & punchy — Hero → example cards → how it works (3 steps) → CTA → footer
- **Example cards**: Interactive hover — cards are static but expand/animate on hover to show a sample newsletter snippet
- **Page length**: Claude's discretion — fit the content naturally

### Visual Identity
- **Design references**: Resend.com (elegant, minimal), Beehiiv.com (approachable CTAs), Supabase (polished developer feel), Linear (sleek premium), ready.so (product-centered hero, generous whitespace), Superlist (dark accents, premium), Framer.com (alive with motion), Superhuman (speed-focused premium)
- **Aesthetic direction**: Polished and alive, not static or corporate. Premium without being cold. Warm but not playful.
- **Color palette**: Claude's discretion — guided by the reference sites above
- **Typography**: Modern sans-serif (Inter, Geist, or similar) — clean, tech-forward, readable
- **Animations**: Expressive — staggered reveals, parallax, animated elements. Motion makes it feel alive, not just decorative.
- **Dark mode**: No — light only, one polished theme
- **Trust strip**: Scrolling logo bar showing sources (Brave, Reddit, X, RSS, News APIs) and technology used — builds credibility through transparency

### F/G/E Copy Direction
- **Voice**: Confident friend — casual, direct, warm. "You're about to be the most informed person in any room."
- **Headline energy**: Edge-focused — emphasizes competitive advantage ("Your daily edge")
- **F/G/E application**: Subtle weave — all three baked into copy naturally, you feel it but can't point to it. NOT a visible triad of three stacked lines.
- **Trust approach**: Credibility markers — "Powered by AI. Sourced from real sites. Links included." + scrolling logo bar of sources/tech

### Email Capture UX
- **Hero CTA layout**: Stacked — email input on top, full-width button below. More prominent on mobile.
- **CTA button text**: "Start free"
- **Second CTA**: Sticky floating bar at bottom that follows as they scroll
- **Post-click behavior**: Claude's discretion — new page vs inline transition, whichever feels best for the design

### Claude's Discretion
- Color palette (guided by reference sites)
- Page length (fit the content naturally)
- Post-click email capture transition (new page vs inline)
- Exact animation choreography
- Legal page design (privacy policy, terms of service)
- Infrastructure decisions (Supabase schema, Railway config, deployment pipeline)

</decisions>

<specifics>
## Specific Ideas

- Interactive example cards that expand on hover to show actual newsletter snippet previews — this is the "show don't tell" moment
- Scrolling logo bar of data sources and tech (Brave, Reddit, X, RSS, etc.) as a trust/credibility strip
- "Start free" as CTA — emphasizes zero cost
- Sticky bottom bar for email capture as user scrolls
- The page should feel like Resend meets ready.so — elegant, spacious, alive with motion but not overwhelming
- Expressive Framer Motion animations — staggered reveals, parallax, interactive elements

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-landing-page*
*Context gathered: 2026-02-19*
