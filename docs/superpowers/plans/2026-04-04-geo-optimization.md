# GEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make lucassenechal.com discoverable by AI chatbots (ChatGPT, Gemini, Claude, Perplexity) for "AI consulting Kelowna" queries through structured data, AI crawler optimization, and location-specific content.

**Architecture:** Add Organization/LocalBusiness/Person schema to the homepage, create an llms.txt route handler, update robots.txt with AI crawler rules, enhance service schema with Okanagan cities, build 3 location-specific landing pages, and update the sitemap.

**Tech Stack:** Next.js 16.1 App Router, TypeScript, JSON-LD structured data, Schema.org

---

### Task 1: Homepage Organization + LocalBusiness + Person Schema

**Files:**
- Create: `components/homepage/homepage-json-ld.tsx`
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Create the homepage JSON-LD component**

Create `components/homepage/homepage-json-ld.tsx`:

```tsx
const baseUrl = 'https://lucassenechal.com';

export function HomepageJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${baseUrl}/#business`,
        name: 'Lucas Senechal — AI Systems Consulting',
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        description:
          'AI automation and implementation consulting for businesses in Kelowna, BC and the Okanagan Valley. I build AI systems that scale revenue without scaling headcount.',
        telephone: '',
        email: 'lucas@lucassenechal.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kelowna',
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
        areaServed: [
          { '@type': 'City', name: 'Kelowna', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'West Kelowna', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Peachland', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Penticton', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Vernon', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Summerland', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Lake Country', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'Country', name: 'United States' },
        ],
        priceRange: '$500–$25,000',
        founder: { '@id': `${baseUrl}/#person` },
        knowsAbout: [
          'AI Automation',
          'AI Consulting',
          'Business Process Automation',
          'AI Implementation',
          'Chatbot Development',
          'AI Content Operations',
          'AI Google Ads Management',
        ],
      },
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#person`,
        name: 'Lucas Senechal',
        url: baseUrl,
        jobTitle: 'AI Automation Consultant',
        description:
          'AI systems consultant based in Kelowna, BC. I build AI agents and automation systems that scale revenue without scaling headcount for small and medium businesses.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kelowna',
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
        knowsAbout: [
          'Artificial Intelligence',
          'Business Automation',
          'AI Agents',
          'Process Consulting',
          'Claude AI',
          'Machine Learning',
          'Workflow Automation',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Lucas Senechal',
        publisher: { '@id': `${baseUrl}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

- [ ] **Step 2: Add HomepageJsonLd to the home page**

In `app/(marketing)/page.tsx`, add:
- Import: `import { HomepageJsonLd } from '@/components/homepage/homepage-json-ld';`
- Render `<HomepageJsonLd />` as the first child inside `<main>`.

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: Build succeeds, no errors.

- [ ] **Step 4: Commit**

```bash
git add components/homepage/homepage-json-ld.tsx app/\(marketing\)/page.tsx
git commit -m "feat: add Organization/LocalBusiness/Person schema to homepage for GEO"
```

---

### Task 2: llms.txt Route Handler

**Files:**
- Create: `app/llms.txt/route.ts`

- [ ] **Step 1: Create the llms.txt route handler**

Create `app/llms.txt/route.ts`:

```ts
import { getAllServices } from '@/lib/data/services';

export function GET() {
  const services = getAllServices();

  const serviceList = services
    .map((s) => `- [${s.title}](https://lucassenechal.com/services/${s.id}): ${s.description}`)
    .join('\n');

  const content = `# Lucas Senechal — AI Systems Consulting

> AI automation and implementation consulting for businesses in Kelowna, BC and the Okanagan Valley.

Lucas Senechal builds AI systems that scale revenue without scaling headcount. Services include custom AI automation, process consulting, AI implementation, chatbot development, content operations, and Google Ads management for small and medium businesses across Canada and the US.

Based in Kelowna, British Columbia, Lucas works with businesses in the Okanagan Valley including Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country. Clients range from 5-200 employees across industries including real estate, hospitality, professional services, e-commerce, and local service businesses.

## Services

${serviceList}

## Differentiators

- Execution-focused: every engagement produces working AI systems, not strategy decks
- Full-stack implementation: from workflow audit to production deployment
- Ongoing management available: systems are maintained and scaled over time
- Transparent pricing: fixed project costs from $500 assessments to $25,000 full implementations

## Location

Based in Kelowna, BC, Canada. Serving the Okanagan Valley (Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, Lake Country) and remote clients across Canada and the United States.

## Contact

- Website: https://lucassenechal.com
- Email: lucas@lucassenechal.com
- Work With Me: https://lucassenechal.com/work-with-me
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
```

- [ ] **Step 2: Verify it builds and serves correctly**

Run: `npm run build`
Expected: Build succeeds. The route at `/llms.txt` returns Markdown content.

- [ ] **Step 3: Commit**

```bash
git add app/llms.txt/route.ts
git commit -m "feat: add llms.txt for AI crawler discoverability"
```

---

### Task 3: AI Crawler Rules in robots.txt

**Files:**
- Modify: `app/robots.ts`

- [ ] **Step 1: Update robots.ts with AI crawler rules**

Replace the contents of `app/robots.ts` with:

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/onboarding', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
      },
    ],
    sitemap: 'https://lucassenechal.com/sitemap.xml',
  };
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat: add explicit AI crawler allow rules to robots.txt"
```

---

### Task 4: Enhanced Service Schema — Okanagan areaServed

**Files:**
- Modify: `components/services/service-json-ld.tsx`

- [ ] **Step 1: Update areaServed in service-json-ld.tsx**

Replace the `areaServed` array in `components/services/service-json-ld.tsx` (lines 30-33) with:

```tsx
areaServed: [
  { '@type': 'City', name: 'Kelowna', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'City', name: 'West Kelowna', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'City', name: 'Peachland', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'City', name: 'Penticton', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'City', name: 'Vernon', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'City', name: 'Summerland', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'City', name: 'Lake Country', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'United States' },
],
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/services/service-json-ld.tsx
git commit -m "feat: add Okanagan cities to service schema areaServed"
```

---

### Task 5: Location Data File

**Files:**
- Create: `lib/data/locations.ts`

- [ ] **Step 1: Create the locations data file**

Create `lib/data/locations.ts`:

```ts
export interface Location {
  slug: string;
  city: string;
  region: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  headline: string;
  intro: string;
  faqs: { question: string; answer: string }[];
}

export const LOCATIONS: Location[] = [
  {
    slug: 'kelowna',
    city: 'Kelowna',
    region: 'BC',
    metaTitle: 'AI Consulting & Automation in Kelowna, BC | Lucas Senechal',
    metaDescription:
      'AI consulting and automation services in Kelowna, BC. Custom AI systems, process automation, and implementation for local businesses. From $500 assessments to full implementations.',
    tagline: 'AI systems that scale your Kelowna business without scaling headcount.',
    headline: 'AI Consulting & Automation in Kelowna',
    intro:
      'Kelowna businesses are sitting on massive efficiency gains. From wineries and tourism operators to real estate teams and professional services firms, most local businesses still run on manual processes that AI can handle faster and cheaper.\n\nI build custom AI systems for Kelowna businesses — not off-the-shelf chatbots, but purpose-built automation that connects to your existing tools and handles the repetitive work your team does every day. Lead follow-ups, data entry, report generation, client onboarding, content creation — all automated, all monitored, all working 24/7.',
    faqs: [
      {
        question: 'How much does AI consulting cost in Kelowna?',
        answer:
          'AI consulting starts at $500 for a focused assessment of one workflow or process. A full operations audit runs $2,500 and covers your entire business. Implementation projects range from $5,000 to $25,000 depending on scope. Monthly management starts at $1,500. All pricing is fixed — no hourly billing surprises.',
      },
      {
        question: 'What types of Kelowna businesses benefit from AI automation?',
        answer:
          'Any business spending 10+ hours per week on repetitive tasks. In Kelowna specifically, I work with real estate teams, property management companies, wineries, tourism operators, professional services firms (accounting, legal, dental), trades businesses, and e-commerce brands. If your team does the same type of work repeatedly — follow-ups, data entry, scheduling, reporting — AI can handle it.',
      },
      {
        question: 'Do you work with businesses outside Kelowna?',
        answer:
          'Yes. I am based in Kelowna and serve the entire Okanagan Valley — West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country. I also work with remote clients across Canada and the US. Most of the work is done digitally, so location is flexible.',
      },
      {
        question: 'How long does an AI implementation take?',
        answer:
          'Simple single-workflow automations go live in 1-2 weeks. Multi-system integrations with complex logic take 4-6 weeks. You see working prototypes within the first week — not after months of development. Every project starts with a workflow audit so we build the right thing from day one.',
      },
      {
        question: 'What makes your AI consulting different from other tech companies in Kelowna?',
        answer:
          'I implement, not just advise. Every engagement produces a working AI system — not a strategy deck or a PowerPoint. I spend 16+ hours a day working with cutting-edge AI technology (Claude, GPT, custom agents, automation pipelines). I build the same systems for my own business that I build for clients. When I say something works, it is because I am running it myself.',
      },
    ],
  },
  {
    slug: 'west-kelowna',
    city: 'West Kelowna',
    region: 'BC',
    metaTitle: 'AI Consulting & Automation in West Kelowna, BC | Lucas Senechal',
    metaDescription:
      'AI consulting and automation for West Kelowna businesses. Custom AI systems for wineries, agriculture, tourism, and local services. Based in Kelowna, serving the Okanagan.',
    tagline: 'AI automation for West Kelowna businesses — from wineries to professional services.',
    headline: 'AI Consulting & Automation in West Kelowna',
    intro:
      'West Kelowna is home to some of the Okanagan\'s most productive businesses — wineries, agricultural operations, tourism companies, and growing professional services firms. Many of these businesses still rely on manual processes for tasks that AI handles faster, cheaper, and around the clock.\n\nI help West Kelowna businesses identify where AI saves the most time and money, then build and deploy the systems to make it happen. From automating tasting room bookings and inventory tracking for wineries to streamlining client intake for service businesses — the results are immediate and measurable.',
    faqs: [
      {
        question: 'Do you serve West Kelowna businesses?',
        answer:
          'Yes. I am based in Kelowna and work with businesses across the Okanagan Valley, including West Kelowna, Peachland, and Summerland. Most work is done remotely with occasional in-person meetings for workflow audits and kickoffs.',
      },
      {
        question: 'What AI services do you offer for wineries?',
        answer:
          'Wineries benefit from AI in several areas: automated tasting room booking and confirmation systems, inventory and production tracking, customer follow-up sequences after visits, social media content generation, email marketing automation, and review response management. A typical winery automation project saves 15-20 hours per week of staff time.',
      },
      {
        question: 'How much does AI automation cost for a small West Kelowna business?',
        answer:
          'Assessments start at $500. Full implementation projects range from $5,000 to $25,000 depending on the number of workflows automated and systems integrated. Most small businesses start with one high-impact workflow ($5,000-$8,000) and expand once they see results. ROI typically pays for the project within 2-3 months.',
      },
    ],
  },
  {
    slug: 'okanagan',
    city: 'Okanagan Valley',
    region: 'BC',
    metaTitle: 'AI Consulting & Automation in the Okanagan Valley, BC | Lucas Senechal',
    metaDescription:
      'AI consulting and automation for Okanagan Valley businesses. Serving Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country.',
    tagline: 'AI systems for Okanagan businesses — from Penticton to Vernon.',
    headline: 'AI Consulting & Automation in the Okanagan Valley',
    intro:
      'The Okanagan Valley is one of the fastest-growing regions in British Columbia, and local businesses are starting to discover what AI can do for their operations. Whether you run a winery in West Kelowna, a property management company in Penticton, a dental practice in Vernon, or a tourism business in Summerland — AI automation can eliminate the repetitive work that eats up your team\'s time.\n\nI am based in Kelowna and serve businesses across the entire Okanagan. I build custom AI systems that connect to your existing tools and automate the workflows that drain your team — lead follow-ups, data entry, client communications, content creation, report generation, and more.',
    faqs: [
      {
        question: 'What areas in the Okanagan do you serve?',
        answer:
          'I serve the entire Okanagan Valley: Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country. I also work with businesses in Kamloops, Salmon Arm, and throughout British Columbia. Most of the work is done remotely, so geography is flexible.',
      },
      {
        question: 'What industries in the Okanagan benefit most from AI?',
        answer:
          'The Okanagan has strong clusters in wine and agriculture, tourism and hospitality, real estate, construction and trades, healthcare (dental, chiropractic, optometry), and professional services (accounting, legal, insurance). All of these industries have repetitive workflows that AI handles well — booking management, client communications, data processing, inventory tracking, and marketing automation.',
      },
      {
        question: 'Can AI help my Okanagan tourism business?',
        answer:
          'Absolutely. Tourism businesses benefit from AI-powered booking confirmations and follow-ups, automated review responses across Google and TripAdvisor, seasonal marketing content generation, guest communication sequences, activity recommendations based on guest preferences, and social media content pipelines. A typical implementation saves 10-15 hours per week of staff time during peak season.',
      },
      {
        question: 'How do I get started with AI consulting in the Okanagan?',
        answer:
          'Start with a $500 focused assessment. I audit one specific workflow or process in your business, identify where AI adds value, and deliver a concrete implementation plan with ROI projections. If the numbers make sense, we move to implementation. No long-term commitments — you see results before you invest further.',
      },
    ],
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function getAllLocations(): Location[] {
  return LOCATIONS;
}

export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((l) => l.slug);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/data/locations.ts
git commit -m "feat: add location data for Kelowna, West Kelowna, Okanagan GEO pages"
```

---

### Task 6: Location Page Components

**Files:**
- Create: `components/locations/location-json-ld.tsx`
- Create: `components/locations/location-hero.tsx`
- Create: `components/locations/location-services.tsx`
- Create: `components/locations/location-faq.tsx`
- Create: `components/locations/location-cta.tsx`

- [ ] **Step 1: Create location-json-ld.tsx**

Create `components/locations/location-json-ld.tsx`:

```tsx
import type { Location } from '@/lib/data/locations';

interface LocationJsonLdProps {
  location: Location;
}

export function LocationJsonLd({ location }: LocationJsonLdProps) {
  const baseUrl = 'https://lucassenechal.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        name: `Lucas Senechal — AI Consulting in ${location.city}`,
        description: location.metaDescription,
        url: `${baseUrl}/locations/${location.slug}`,
        provider: {
          '@type': 'Person',
          name: 'Lucas Senechal',
          url: baseUrl,
          jobTitle: 'AI Automation Consultant',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kelowna',
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
        areaServed: {
          '@type': location.slug === 'okanagan' ? 'AdministrativeArea' : 'City',
          name: location.city,
          containedInPlace: {
            '@type': 'AdministrativeArea',
            name: 'British Columbia',
          },
        },
        priceRange: '$500–$25,000',
      },
      {
        '@type': 'FAQPage',
        mainEntity: location.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `AI Consulting in ${location.city}`,
            item: `${baseUrl}/locations/${location.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

- [ ] **Step 2: Create location-hero.tsx**

Create `components/locations/location-hero.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LocationHeroProps {
  city: string;
  headline: string;
  tagline: string;
}

export function LocationHero({ city, headline, tagline }: LocationHeroProps) {
  return (
    <section className="px-6 pb-16 pt-32 md:px-8 md:pb-20 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
          className="mb-8"
        >
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-foreground"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-foreground">AI Consulting in {city}</span>
            </li>
          </ol>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-muted md:text-xl">{tagline}</p>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create location-services.tsx**

Create `components/locations/location-services.tsx`:

```tsx
import Link from 'next/link';
import { getAllServices } from '@/lib/data/services';

interface LocationServicesProps {
  city: string;
}

export function LocationServices({ city }: LocationServicesProps) {
  const services = getAllServices();

  return (
    <section className="px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          AI Services Available in {city}
        </h2>
        <div className="space-y-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="block rounded-xl border border-border p-6 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-hover"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{service.description}</p>
                  <p className="mt-2 text-xs font-medium text-accent">
                    {service.pricing}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create location-faq.tsx**

Create `components/locations/location-faq.tsx` — reuse the existing FAQ accordion pattern from `components/services/service-faq.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-accent"
      >
        <span className="pr-4 text-base font-medium text-foreground md:text-lg">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-muted"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 0v14M0 7h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted md:text-base">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LocationFAQProps {
  city: string;
  faqs: FAQItem[];
}

export function LocationFAQ({ city, faqs }: LocationFAQProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            AI Consulting in {city} — FAQ
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-t border-border"
        >
          {faqs.map((faq) => (
            <FAQAccordionItem key={faq.question} item={faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create location-cta.tsx**

Create `components/locations/location-cta.tsx`:

```tsx
import Link from 'next/link';

interface LocationCTAProps {
  city: string;
}

export function LocationCTA({ city }: LocationCTAProps) {
  return (
    <section className="px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to Automate Your {city} Business?
        </h2>
        <p className="mt-4 text-lg text-muted">
          Start with a $500 assessment. See exactly where AI saves you time and money.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/work-with-me"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent/90"
          >
            Work With Me
          </Link>
          <Link
            href="/newsletter"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface-hover"
          >
            Subscribe to the Newsletter
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Verify all components compile**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 7: Commit**

```bash
git add components/locations/
git commit -m "feat: add location page components for GEO landing pages"
```

---

### Task 7: Location Page Route

**Files:**
- Create: `app/(marketing)/locations/[city]/page.tsx`

- [ ] **Step 1: Create the location page**

Create `app/(marketing)/locations/[city]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLocationBySlug,
  getAllLocationSlugs,
} from '@/lib/data/locations';
import { LocationJsonLd } from '@/components/locations/location-json-ld';
import { LocationHero } from '@/components/locations/location-hero';
import { LocationServices } from '@/components/locations/location-services';
import { LocationFAQ } from '@/components/locations/location-faq';
import { LocationCTA } from '@/components/locations/location-cta';
import { Footer } from '@/components/landing/footer';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLocationSlugs().map((city) => ({ city }));
}

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const location = getLocationBySlug(city);
  if (!location) return {};

  const baseUrl = 'https://lucassenechal.com';
  const url = `${baseUrl}/locations/${location.slug}`;

  return {
    title: location.metaTitle,
    description: location.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: location.metaTitle,
      description: location.metaDescription,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: location.metaTitle,
      description: location.metaDescription,
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { city } = await params;
  const location = getLocationBySlug(city);
  if (!location) notFound();

  return (
    <main>
      <LocationJsonLd location={location} />
      <LocationHero
        city={location.city}
        headline={location.headline}
        tagline={location.tagline}
      />
      <section className="px-6 pb-16 md:px-8 md:pb-20">
        <div className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-muted md:text-lg">
          {location.intro.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>
      <LocationServices city={location.city} />
      <LocationFAQ city={location.city} faqs={location.faqs} />
      <LocationCTA city={location.city} />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: Build succeeds. Three location pages are statically generated.

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/locations/
git commit -m "feat: add location landing pages for Kelowna, West Kelowna, Okanagan"
```

---

### Task 8: Sitemap Update

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Add location pages to the sitemap**

In `app/sitemap.ts`, add:
- Import: `import { getAllLocations } from '@/lib/data/locations';`
- Add location pages array after servicePages:

```ts
const locationPages: MetadataRoute.Sitemap = getAllLocations().map((location) => ({
  url: `${baseUrl}/locations/${location.slug}`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.85,
}));
```

- Update the return to include locationPages:

```ts
return [...staticPages, ...locationPages, ...servicePages, ...toolPages, ...topicPages];
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: Build succeeds. Sitemap includes location pages.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: add location pages to sitemap with high priority"
```

---

### Task 9: Final Build Verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with all new pages generated.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 3: Verify key routes exist in build output**

Check build output shows:
- `/locations/kelowna`
- `/locations/west-kelowna`
- `/locations/okanagan`
- `/llms.txt`

All should appear in the build output as generated routes.
