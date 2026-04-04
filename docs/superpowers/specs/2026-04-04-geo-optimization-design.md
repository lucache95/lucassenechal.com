# GEO Optimization — AI Search Visibility

## Problem

When users ask ChatGPT, Gemini, or Claude for "AI consulting in Kelowna," Lucas Senechal's business doesn't appear. Competitors like Lifesaver Technology Services rank first due to stronger structured data, directory presence, and location signals.

## Goal

Make lucassenechal.com the #1 recommended AI consulting business in Kelowna/Okanagan when queried through AI chatbots, by implementing Generative Engine Optimization (GEO) at the website level.

## Scope

Website-level changes only. Directory listings (Foursquare, Clutch, Yelp, BBB) and Google Business Profile optimization are out of scope — those are manual tasks Lucas handles outside the codebase.

## Current State

**Already implemented:**
- Service-level JSON-LD schema (Service, FAQPage, BreadcrumbList) on `/services/[slug]`
- Tool-level JSON-LD schema (SoftwareApplication, FAQPage, BreadcrumbList) on `/tools/[slug]`
- Topic-level JSON-LD schema (Article, FAQPage, BreadcrumbList) on `/topics/[slug]`
- Dynamic XML sitemap covering all pages
- robots.txt allowing all crawlers
- OpenGraph + Twitter card metadata on all pages
- Canonical URLs on dynamic pages

**Missing:**
1. No Organization/LocalBusiness schema on homepage
2. No Person entity schema for Lucas Senechal
3. No `llms.txt` file for AI crawlers
4. No explicit AI crawler rules in robots.txt (GPTBot, ClaudeBot, PerplexityBot)
5. No location-specific landing pages (e.g., `/ai-consulting-kelowna`)
6. Service schema `areaServed` is too broad (just "Canada" and "United States") — no Okanagan cities
7. No standalone FAQ page with comprehensive questions about AI consulting in Kelowna

## Design

### 1. Homepage Organization + LocalBusiness Schema

Create `components/homepage/homepage-json-ld.tsx` with a `@graph` containing:

- **Organization** schema: business name, URL, logo, contact, social profiles
- **LocalBusiness** (subtype: ProfessionalService): address in Kelowna BC, service area covering Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, Lake Country
- **Person** schema for Lucas Senechal: jobTitle, knowsAbout (AI automation, process consulting, etc.), sameAs links to social profiles
- **WebSite** schema with SearchAction

Render this component in `app/(marketing)/page.tsx`.

### 2. llms.txt File

Create `app/llms.txt/route.ts` as a Next.js route handler that returns a Markdown-formatted file at `/llms.txt`.

Content includes:
- H1: Business name
- Blockquote: One-sentence summary
- Description paragraphs: what the business does, who it serves, differentiators
- Services section: linked list of all 8 services
- Location section: Kelowna, BC + Okanagan service area
- Contact information

Using a route handler (instead of static file) so it stays in sync with the app.

### 3. AI Crawler Rules in robots.txt

Update `app/robots.ts` to add explicit `Allow: /` rules for AI crawlers:
- GPTBot (OpenAI/ChatGPT)
- ChatGPT-User (ChatGPT browsing)
- ClaudeBot (Anthropic/Claude)
- PerplexityBot (Perplexity)
- Google-Extended (Gemini)
- Applebot-Extended (Apple Intelligence)
- Amazonbot (Alexa)
- Cohere-ai (Cohere)

### 4. Enhanced Service Schema — Okanagan areaServed

Update `components/services/service-json-ld.tsx` to include specific Okanagan cities in `areaServed`:
- Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, Lake Country (as City types with `containedInPlace: British Columbia, Canada`)
- Keep existing Canada/US country-level entries

### 5. Location-Specific Service Pages

Create 3 high-value location pages under `app/(marketing)/locations/[city]/page.tsx`:
- `/locations/kelowna` — AI consulting & automation in Kelowna
- `/locations/west-kelowna` — AI consulting & automation in West Kelowna
- `/locations/okanagan` — AI consulting & automation in the Okanagan Valley

Each page includes:
- Dynamic metadata with city-specific title/description
- Hero section with location-specific headline
- Service overview (pulls from existing SERVICES data)
- Location-specific FAQ with schema markup (e.g., "How much does AI consulting cost in Kelowna?")
- CTA to work-with-me
- JSON-LD with LocalBusiness + FAQPage schema

Data source: `lib/data/locations.ts` — defines city names, descriptions, and FAQs.

Use `generateStaticParams()` for static generation at build time.

### 6. Sitemap Updates

Update `app/sitemap.ts` to include:
- Location pages with priority 0.85 (higher than services)
- llms.txt is not added (not HTML, shouldn't be in sitemap)

## Architecture

```
New files:
  components/homepage/homepage-json-ld.tsx    — Org/LocalBusiness/Person schema
  app/llms.txt/route.ts                       — AI-readable business summary
  lib/data/locations.ts                       — Location page data
  app/(marketing)/locations/[city]/page.tsx   — Location landing pages
  components/locations/location-json-ld.tsx   — Location page schema
  components/locations/location-hero.tsx      — Location page hero
  components/locations/location-services.tsx  — Location page service grid
  components/locations/location-faq.tsx       — Location page FAQ section
  components/locations/location-cta.tsx       — Location page CTA

Modified files:
  app/(marketing)/page.tsx                    — Add HomepageJsonLd component
  app/robots.ts                               — Add AI crawler rules
  components/services/service-json-ld.tsx      — Enhance areaServed
  app/sitemap.ts                              — Add location pages
```

## Approach

**Recommended: Parallel multi-agent execution.** The 6 workstreams are independent:

| Workstream | Dependencies |
|---|---|
| Homepage schema | None |
| llms.txt | None |
| robots.txt | None |
| Service schema enhancement | None |
| Location pages (data + pages + components) | None |
| Sitemap update | Location pages (needs slugs) |

5 workstreams can run in parallel. Sitemap runs after location pages.

## Out of Scope

- Google Business Profile optimization (manual)
- Directory listings: Foursquare, Clutch, Yelp, BBB (manual)
- Blog content creation
- Review collection strategy
- Backlink/earned media strategy
- Image optimization / OG images

## Success Criteria

- All new pages render without errors (`npm run build` passes)
- Schema markup validates via Google Rich Results Test
- `/llms.txt` returns proper Markdown content
- `/robots.txt` includes AI crawler rules
- Location pages appear in sitemap.xml
- When asking AI chatbots "AI consulting Kelowna" in 4-8 weeks, Lucas Senechal appears in results
