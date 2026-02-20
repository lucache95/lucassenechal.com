# Phase 1: Foundation & Landing Page - Research

**Researched:** 2026-02-20
**Domain:** Next.js web development, Supabase backend, email infrastructure, landing page design
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation and public-facing landing page for a personalized AI newsletter platform. The stack centers on Next.js 15+ with App Router, Supabase for data persistence, Railway for deployment, Tailwind CSS for styling, Framer Motion for animations, and Resend for email infrastructure.

The research confirms that this stack is production-ready, well-documented, and battle-tested for similar use cases. Next.js 15+ App Router with Server Components provides excellent performance (targeting <2s LCP is achievable). Supabase's cookie-based auth pattern integrates cleanly with Next.js server/client separation. Railway offers zero-config deployment with automatic Next.js detection. Email deliverability requires immediate action on SPF/DKIM/DMARC setup and warm-up initiation due to 4-6 week timelines.

**Primary recommendation:** Use Next.js 15+ App Router with standalone output, Supabase SSR package for server-side auth, Tailwind v4 for smaller CSS bundles, Framer Motion 12+ for animations, and initiate domain warm-up immediately to avoid Phase 5 delays.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page Layout & Flow:**
- Hero section: Headline + email field above the fold — minimal, conversion-focused
- Page structure: Short & punchy — Hero → example cards → how it works (3 steps) → CTA → footer
- Example cards: Interactive hover — cards are static but expand/animate on hover to show a sample newsletter snippet
- Page length: Claude's discretion — fit the content naturally

**Visual Identity:**
- Design references: Resend.com (elegant, minimal), Beehiiv.com (approachable CTAs), Supabase (polished developer feel), Linear (sleek premium), ready.so (product-centered hero, generous whitespace), Superlist (dark accents, premium), Framer.com (alive with motion), Superhuman (speed-focused premium)
- Aesthetic direction: Polished and alive, not static or corporate. Premium without being cold. Warm but not playful.
- Color palette: Claude's discretion — guided by the reference sites above
- Typography: Modern sans-serif (Inter, Geist, or similar) — clean, tech-forward, readable
- Animations: Expressive — staggered reveals, parallax, animated elements. Motion makes it feel alive, not just decorative.
- Dark mode: No — light only, one polished theme
- Trust strip: Scrolling logo bar showing sources (Brave, Reddit, X, RSS, News APIs) and technology used — builds credibility through transparency

**F/G/E Copy Direction:**
- Voice: Confident friend — casual, direct, warm. "You're about to be the most informed person in any room."
- Headline energy: Edge-focused — emphasizes competitive advantage ("Your daily edge")
- F/G/E application: Subtle weave — all three baked into copy naturally, you feel it but can't point to it. NOT a visible triad of three stacked lines.
- Trust approach: Credibility markers — "Powered by AI. Sourced from real sites. Links included." + scrolling logo bar of sources/tech

**Email Capture UX:**
- Hero CTA layout: Stacked — email input on top, full-width button below. More prominent on mobile.
- CTA button text: "Start free"
- Second CTA: Sticky floating bar at bottom that follows as they scroll
- Post-click behavior: Claude's discretion — new page vs inline transition, whichever feels best for the design

### Claude's Discretion

- Color palette (guided by reference sites)
- Page length (fit the content naturally)
- Post-click email capture transition (new page vs inline)
- Exact animation choreography
- Legal page design (privacy policy, terms of service)
- Infrastructure decisions (Supabase schema, Railway config, deployment pipeline)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SITE-01 | Landing page with hero headline communicating personalized value prop | Next.js App Router + Tailwind CSS design system, Framer Motion for visual impact |
| SITE-02 | Example cards showing variety of possible topics | Framer Motion hover animations, Tailwind card components |
| SITE-03 | Email capture CTA on landing page | Next.js Server Actions for form handling, Supabase for storage |
| SITE-04 | Fully responsive -- premium experience on mobile and desktop | Tailwind responsive utilities, next/image optimization |
| SITE-05 | Smooth animations and transitions (Framer Motion) | Framer Motion 12+ with staggered reveals, parallax, layout animations |
| SITE-06 | Warm, approachable design aesthetic (Notion/Cal.com vibe) | Tailwind v4 theming, reference site analysis |
| SITE-07 | Professional domain with HTTPS (lucassenechal.com) | Railway automatic HTTPS, custom domain configuration |
| SITE-08 | Page load under 2 seconds (LCP) | Next.js Image component with priority attribute, standalone output, Server Components |
| COPY-01 | All touchpoints use Fear/Greed/Ego microcopy framework | Content strategy implementation (no technical dependency) |
| LEGL-01 | Privacy policy and terms of service pages | Legal page templates, Next.js static pages |
| LEGL-02 | Data retention rules documented | Supabase data policies, documentation |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15+ (latest stable: 16.1.6) | React framework with SSR/SSG | Industry standard for production React apps, App Router is current architecture, automatic code-splitting and optimization |
| @supabase/ssr | Latest | Server-side Supabase auth | Official package for Next.js integration, cookie-based session management, proper server/client separation |
| Tailwind CSS | v4 | Utility-first CSS framework | 70% smaller bundles than v3, CSS-first config, automatic content detection, standard for modern web apps |
| Framer Motion | 12+ (latest: 12.34.2) | React animation library | Industry-leading animation library, 330+ examples, hardware acceleration, excellent DX |
| Resend | Latest | Email sending API | Built for developers, native React Email integration, clean API, excellent deliverability |
| React Email | 5.0+ | Email template components | Native Resend integration, supports React 19.2, Tailwind 4 support, type-safe |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript | Latest | Type safety | Always — Next.js best practice, catches errors early, better IDE support |
| next/font | Built-in | Font optimization | Always — automatic self-hosting, removes external requests, built-in with Next.js |
| next/image | Built-in | Image optimization | Always — automatic WebP/AVIF, lazy loading, LCP optimization |
| Geist or Inter | Latest | Typography | Primary body font — Geist is Next.js 15+ default, Inter is proven alternative |
| Railway CLI | Latest | Deployment tooling | Optional — can deploy via GitHub integration instead |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind CSS | Vanilla CSS Modules | More control, but 10x more code, no design system consistency |
| Framer Motion | react-spring, GSAP | react-spring is lower-level, GSAP requires license for commercial use |
| Resend | SendGrid, AWS SES | Resend has better DX and React Email integration, others are more complex |
| Railway | Vercel, Render | Vercel is more expensive at scale, Render requires more config |
| Supabase | Firebase, raw Postgres | Firebase is NoSQL (different paradigm), raw Postgres requires custom auth |

**Installation:**
```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest my-app --typescript --tailwind --app

# Install Supabase SSR
npm install @supabase/ssr @supabase/supabase-js

# Install animation and email libraries
npm install framer-motion resend react-email @react-email/components

# Development tools
npm install -D @types/node
```

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (marketing)/          # Route group for public pages
│   ├── layout.tsx        # Marketing layout (no auth required)
│   ├── page.tsx          # Landing page (/)
│   └── legal/            # Legal pages
│       ├── privacy/      # Privacy policy
│       └── terms/        # Terms of service
├── api/                  # API routes
│   └── subscribe/        # Email capture endpoint
├── layout.tsx            # Root layout (font, metadata)
└── globals.css           # Tailwind directives + custom CSS

components/
├── ui/                   # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── landing/              # Landing page sections
│   ├── hero.tsx
│   ├── example-cards.tsx
│   ├── how-it-works.tsx
│   └── sticky-cta.tsx
└── email/                # React Email templates
    └── welcome.tsx

lib/
├── supabase/             # Supabase clients
│   ├── client.ts         # Client Component client
│   └── server.ts         # Server Component client
└── utils.ts              # Utility functions

public/
└── images/               # Static images for trust strip, etc.
```

### Pattern 1: Server vs Client Component Separation

**What:** Next.js 15+ uses Server Components by default. Only mark components with "use client" when they need interactivity, browser APIs, or state.

**When to use:** Always. Default to Server Components, opt into Client Components only when needed.

**Example:**
```typescript
// app/page.tsx - Server Component (default)
import { HeroSection } from '@/components/landing/hero'
import { ExampleCards } from '@/components/landing/example-cards'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ExampleCards />
    </main>
  )
}

// components/landing/example-cards.tsx - Client Component (needs animation)
'use client'

import { motion } from 'framer-motion'

export function ExampleCards() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated cards */}
    </motion.div>
  )
}
```

**Source:** [Next.js Docs: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Pattern 2: Supabase Server-Side Auth

**What:** Use @supabase/ssr package with separate clients for server and client contexts. Server Components use cookies for secure session management.

**When to use:** Always when accessing Supabase from Next.js App Router.

**Example:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Usage in Server Component
import { createClient } from '@/lib/supabase/server'

async function MyServerComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('subscribers').select()
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

**Source:** [Supabase Docs: Use Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Pattern 3: Server Actions for Form Handling

**What:** Use Server Actions to handle form submissions directly without creating API route files. Bind actions to forms for automatic progressive enhancement.

**When to use:** For all form submissions (email capture, etc.) — cleaner than API routes.

**Example:**
```typescript
// app/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function subscribeEmail(formData: FormData) {
  const email = formData.get('email') as string

  const supabase = await createClient()
  const { error } = await supabase
    .from('subscribers')
    .insert({ email, status: 'pending' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// components/landing/hero.tsx
'use client'

import { subscribeEmail } from '@/app/actions'

export function EmailCaptureForm() {
  return (
    <form action={subscribeEmail}>
      <input type="email" name="email" required />
      <button type="submit">Start free</button>
    </form>
  )
}
```

**Source:** [Supabase Next.js Guide: Server Actions Pattern](https://medium.com/@iamqitmeeer/supabase-next-js-guide-the-real-way-01a7f2bd140c)

### Pattern 4: Font Optimization with next/font

**What:** Use next/font to self-host Google Fonts or local fonts with automatic optimization.

**When to use:** Always — eliminates external requests, improves performance and privacy.

**Example:**
```typescript
// app/layout.tsx
import { Geist, Inter } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

**Source:** [Next.js Docs: Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Pattern 5: Image Optimization with next/image

**What:** Use next/image component with priority attribute for hero images to optimize LCP.

**When to use:** For all images, especially above-the-fold content.

**Example:**
```typescript
import Image from 'next/image'

export function HeroSection() {
  return (
    <div>
      <Image
        src="/hero-image.png"
        alt="Hero"
        width={1200}
        height={600}
        priority // Eliminates LCP lag for hero images
      />
    </div>
  )
}
```

**Source:** [Next.js Performance: LCP Optimization](https://rise.co/blog/core-web-vitals-for-react-next.js-sites-real-fixes-that-cut-lcp-by-50percent)

### Pattern 6: Railway Deployment with Standalone Output

**What:** Configure Next.js standalone output mode to create minimal production bundle (~100-200MB vs ~1GB).

**When to use:** Always for Railway deployment — automatic detection and zero config.

**Example:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

**Source:** [Next.js Standalone Output for Railway](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

### Anti-Patterns to Avoid

- **NEXT_PUBLIC_ for server-only secrets:** Never prefix server-only secrets (database URLs, API keys) with NEXT_PUBLIC_ — this exposes them to the client bundle. Use plain env vars and access them only in Server Components or Server Actions.
- **Client Components for static content:** Don't use "use client" on components that don't need interactivity. This sends unnecessary JavaScript to the browser and hurts performance.
- **Fetching data in Client Components:** Always fetch data in Server Components when possible. Client-side fetching adds waterfalls and slows initial render.
- **Skipping image optimization:** Don't use `<img>` tags. Always use `<Image>` from next/image for automatic optimization and LCP improvement.
- **Manual animation implementations:** Don't hand-roll CSS animations for complex sequences. Use Framer Motion to avoid edge cases and browser inconsistencies.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom lazy loading, format conversion, CDN | next/image | Handles WebP/AVIF conversion, srcset generation, lazy loading, priority hints — 50+ edge cases |
| Font loading | Manual font files, external CDN links | next/font | Self-hosts fonts, eliminates FOUT/FOIT, automatic subsetting, zero CLS |
| Email templates | HTML string concatenation, inline CSS | React Email + Resend | Cross-client compatibility (Outlook, Gmail, etc.), type-safe props, preview server |
| Form handling | Custom API routes, validation logic | Server Actions | Progressive enhancement, automatic error handling, revalidation, 80% less boilerplate |
| Authentication cookies | Custom session management | @supabase/ssr | Handles CSRF, cookie security, server/client separation, refresh tokens |
| CSS reset/normalize | Custom global styles | Tailwind preflight | Battle-tested reset, form normalization, cross-browser consistency |
| Animation choreography | Manual CSS keyframes, setTimeout chains | Framer Motion | Spring physics, gesture handling, layout animations, 100+ edge cases |
| Responsive utilities | Custom media queries | Tailwind breakpoints | Consistent breakpoints, mobile-first, composition-friendly |

**Key insight:** Modern web frameworks have solved these problems at scale. Custom solutions introduce bugs, maintenance burden, and worse UX. Use the standard tools.

## Common Pitfalls

### Pitfall 1: Incorrect Environment Variable Scoping

**What goes wrong:** Server-only secrets (like service_role keys) get exposed to the client bundle because they're prefixed with NEXT_PUBLIC_, or client-accessible variables fail to load because they're missing the prefix.

**Why it happens:** Next.js has two contexts (server and client) with different env var access rules. NEXT_PUBLIC_ makes vars available to both, but this is dangerous for secrets.

**How to avoid:**
- Server-only secrets: No NEXT_PUBLIC_ prefix, access only in Server Components/Actions
- Client-accessible vars: NEXT_PUBLIC_ prefix, safe to expose (like Supabase anon key)
- Use .env.local for local development, Railway UI for production

**Warning signs:**
- Console errors about undefined env vars
- Supabase errors about invalid API keys
- Secrets visible in browser DevTools

**Source:** [Next.js Environment Variables with Supabase](https://makerkit.dev/docs/next-supabase/how-to/setup/environment-variables-setup)

### Pitfall 2: Forgetting "use client" for Interactive Components

**What goes wrong:** Framer Motion components, forms with useState, onClick handlers fail with cryptic errors like "useState is not defined" or "motion is not a function."

**Why it happens:** Next.js App Router defaults to Server Components, which can't use browser APIs, hooks, or event handlers.

**How to avoid:**
- Add "use client" directive at the top of files that use hooks, browser APIs, or animation libraries
- Keep Server Components as the default — only add "use client" when needed
- Create small Client Components and compose them in Server Components

**Warning signs:**
- Runtime errors mentioning hooks or browser APIs
- Framer Motion animations not working
- Event handlers (onClick, onChange) not firing

**Source:** [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Pitfall 3: Delaying Email Domain Warm-Up

**What goes wrong:** Email deliverability fails in Phase 5 because domain warm-up wasn't started early enough. Emails land in spam or get rejected entirely.

**Why it happens:** Modern email providers (Gmail, Outlook) require 4-6 weeks of gradual volume increase to build sender reputation. Skipping warm-up = 0% inbox placement.

**How to avoid:**
- Set up SPF/DKIM/DMARC DNS records immediately in Phase 1
- Start warm-up process in Phase 1 even if sending isn't live yet
- Use Resend's warm-up guidance or a dedicated warm-up service
- Send to high-engagement recipients first (friends, team members)

**Warning signs:**
- Bounce rates >5% during initial sends
- Opens <10% when testing
- Spam folder placement in Gmail

**Source:** [Email Domain Warm-Up Strategy 2026](https://www.mailreach.co/blog/how-to-warm-up-email-domain)

### Pitfall 4: Not Optimizing LCP for Hero Images

**What goes wrong:** Landing page LCP exceeds 2.5 seconds because hero image loads late, causing poor Core Web Vitals and Google ranking penalties.

**Why it happens:** next/image lazy-loads by default. Hero images need explicit priority flag to preload.

**How to avoid:**
- Add `priority` attribute to above-the-fold images
- Use next/image, not `<img>` tags
- Configure AVIF format in next.config.js for 20% better compression
- Test with Lighthouse or WebPageTest

**Warning signs:**
- Lighthouse LCP score in orange/red
- Hero image appears after text on slow connections
- Layout shift during image load

**Source:** [Stop the Wait: Developer's Guide to Smashing LCP in Next.js](https://medium.com/@iamsandeshjain/stop-the-wait-a-developers-guide-to-smashing-lcp-in-next-js-634e2963f4c7)

### Pitfall 5: Missing Supabase RLS Policies

**What goes wrong:** Database tables are wide-open to public reads/writes, or legitimate queries fail with permission errors.

**Why it happens:** Supabase defaults to denying all access until Row-Level Security policies are explicitly defined.

**How to avoid:**
- Create RLS policies for every table during schema design
- For Phase 1 subscribers table: allow public INSERT for email capture, deny SELECT/UPDATE/DELETE
- Test policies with both authenticated and anonymous contexts
- Use Supabase SQL editor to verify policies

**Warning signs:**
- "permission denied for table" errors
- Successful INSERT but data doesn't appear in table
- Public API returning empty results

**Source:** [Supabase Best Practices: Security Focus](https://www.leanware.co/insights/supabase-best-practices)

### Pitfall 6: Railway Environment Variables Not Deployed

**What goes wrong:** Environment variables are set in Railway UI but Next.js app can't access them at runtime, causing crashes or undefined behavior.

**Why it happens:** Railway requires explicit deployment after env var changes — they don't auto-deploy.

**How to avoid:**
- After adding/changing env vars in Railway UI, trigger a new deployment
- Use Railway CLI `railway up` to test locally with production env vars
- Check Railway logs to verify env vars are loaded

**Warning signs:**
- "undefined is not a valid URL" errors for Supabase
- App works locally but crashes in production
- Railway logs show missing env var warnings

**Source:** [Railway Environment Variables with Next.js](https://makerkit.dev/docs/next-supabase-turbo/configuration/environment-variables)

### Pitfall 7: Tailwind v4 vs v3 Config Confusion

**What goes wrong:** Using v3 tailwind.config.js patterns in v4 project, or vice versa, causing build failures or styles not applying.

**Why it happens:** Tailwind v4 replaced JavaScript config with CSS-first @theme directive. Mixing approaches breaks the build.

**How to avoid:**
- For new projects: Use Tailwind v4 with @theme in CSS
- For existing v3 projects: Stick with tailwind.config.js or fully migrate
- Don't mix config approaches
- Check Tailwind version in package.json

**Warning signs:**
- "tailwind.config.js not found" warnings in v4
- Styles not applying despite correct class names
- Build errors about @theme directive

**Source:** [Tailwind + Next.js Setup Guide 2026](https://designrevision.com/blog/tailwind-nextjs-setup)

## Code Examples

Verified patterns from official sources:

### Email Capture with Server Action

```typescript
// app/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function subscribeEmail(formData: FormData) {
  // Validate input
  const result = emailSchema.safeParse({
    email: formData.get('email'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { email } = result.data

  // Store in Supabase
  const supabase = await createClient()
  const { error } = await supabase
    .from('subscribers')
    .insert({
      email,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

  if (error) {
    if (error.code === '23505') { // Duplicate email
      return { error: 'Email already subscribed' }
    }
    return { error: 'Failed to subscribe. Please try again.' }
  }

  return { success: true }
}
```

**Source:** [Next.js Server Actions](https://nextjs.org/docs/app/getting-started/updating-data)

### Animated Example Cards with Framer Motion

```typescript
// components/landing/example-cards.tsx
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const exampleTopics = [
  {
    title: 'AI Tools',
    description: 'Latest releases, tutorials, and comparisons',
    preview: 'ChatGPT now supports voice mode...',
  },
  {
    title: 'Local Deals',
    description: 'Discounts and offers in your area',
    preview: 'New coffee shop opening on Main St...',
  },
  // ...more topics
]

export function ExampleCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {exampleTopics.map((topic, index) => (
        <ExampleCard
          key={topic.title}
          topic={topic}
          index={index}
        />
      ))}
    </div>
  )
}

function ExampleCard({ topic, index }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative rounded-lg border border-gray-200 p-6 bg-white"
    >
      <h3 className="font-semibold text-lg">{topic.title}</h3>
      <p className="text-sm text-gray-600 mt-2">{topic.description}</p>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isHovered ? 'auto' : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
          {topic.preview}
        </div>
      </motion.div>
    </motion.div>
  )
}
```

**Source:** [Framer Motion Examples](https://motion.dev/examples)

### Responsive Hero Section with Email Capture

```typescript
// components/landing/hero.tsx
'use client'

import { subscribeEmail } from '@/app/actions'
import { useState } from 'react'

export function HeroSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    const result = await subscribeEmail(formData)

    if (result.success) {
      setStatus('success')
      setMessage('Check your email to confirm!')
    } else {
      setStatus('error')
      setMessage(result.error || 'Something went wrong')
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Your daily edge
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          Every morning, get a briefing researched and written just for you.
          <br />
          Powered by AI. Sourced from real sites. Links included.
        </p>

        <form action={handleSubmit} className="mt-10 max-w-md mx-auto">
          <div className="flex flex-col gap-3">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              disabled={status === 'loading' || status === 'success'}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Start free'}
            </button>
          </div>

          {message && (
            <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
```

**Source:** Design pattern synthesized from [Resend.com](https://resend.com) and [Beehiiv.com](https://beehiiv.com) reference sites

### Sticky CTA Bar

```typescript
// components/landing/sticky-cta.tsx
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { subscribeEmail } from '@/app/actions'

export function StickyCTA() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50"
    >
      <form action={subscribeEmail} className="max-w-4xl mx-auto flex gap-3">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800"
        >
          Start free
        </button>
      </form>
    </motion.div>
  )
}
```

**Source:** [Framer Motion Scroll Animations](https://motion.dev/docs/react-animation)

### Supabase Subscribers Schema

```sql
-- Create subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, unsubscribed
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- Create index for email lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Row-Level Security policies
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for email capture)
CREATE POLICY "Allow public insert"
  ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Deny public select/update/delete
CREATE POLICY "Deny public read"
  ON subscribers
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Deny public update"
  ON subscribers
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "Deny public delete"
  ON subscribers
  FOR DELETE
  TO anon
  USING (false);
```

**Source:** [Supabase Newsletter Schema Best Practices](https://madza.hashnode.dev/how-to-create-a-secure-newsletter-subscription-with-nextjs-supabase-nodemailer-and-arcjet)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13+ (2022) | Better performance (Server Components), streaming, simpler data fetching |
| JavaScript Tailwind config | CSS-first @theme directive | Tailwind v4 (2025) | 70% smaller CSS bundles, automatic content detection |
| Manual font loading | next/font | Next.js 13+ (2022) | Zero layout shift, self-hosted fonts, better performance |
| First Input Delay (FID) | Interaction to Next Paint (INP) | March 2024 | More accurate interactivity measurement for Core Web Vitals |
| Framer Motion | Motion (rebranded) | 2025 | Same library, expanded to support Vue/JS, 330+ examples |
| String-based email HTML | React Email components | 2023+ | Type-safe templates, cross-client compatibility |
| Supabase client-side auth | @supabase/ssr (server-side) | 2024 | Secure cookie-based sessions, proper server/client separation |

**Deprecated/outdated:**
- **getServerSideProps / getStaticProps:** Replaced by async Server Components and fetch() with cache options in App Router
- **_app.tsx and _document.tsx:** Replaced by app/layout.tsx root layout in App Router
- **API Routes in /pages/api:** Still supported but Server Actions are preferred for mutations
- **Tailwind v3 JavaScript config:** Works but v4 CSS config is now standard for new projects
- **NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:** Never use service_role key on client — use anon key with RLS policies

## Open Questions

1. **Legal page content generation**
   - What we know: Templates exist for privacy/terms, GDPR and CAN-SPAM have clear requirements
   - What's unclear: Whether to use a template generator service or write custom
   - Recommendation: Use Termly or iubenda free generator for Phase 1, customize in Phase 5 if needed

2. **Domain warm-up automation**
   - What we know: 4-6 week timeline, gradual volume increase required, engagement matters
   - What's unclear: Whether Resend provides automatic warm-up or requires manual scheduling
   - Recommendation: Check Resend docs for built-in warm-up, use Mailwarm.com if manual approach needed

3. **Color palette specifics**
   - What we know: User wants polished, alive aesthetic guided by reference sites (Resend, Linear, ready.so, etc.)
   - What's unclear: Exact hex values, primary/secondary/accent breakdown
   - Recommendation: Extract color palette from reference sites during implementation, use Tailwind v4 custom properties

4. **Scrolling logo bar implementation**
   - What we know: Trust strip showing data sources (Brave, Reddit, X, etc.) and tech stack
   - What's unclear: Auto-scroll speed, logos as images vs SVG, responsive behavior
   - Recommendation: Use marquee animation pattern with Framer Motion, SVG logos for crisp rendering

## Sources

### Primary (HIGH confidence)

- [Next.js Official Docs: App Router](https://nextjs.org/docs/app) — Current version 16.1.6, App Router features, Server Components
- [Supabase Docs: Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — @supabase/ssr setup, cookie-based auth
- [Resend Docs: Send with Next.js](https://resend.com/docs/send-with-nextjs) — Integration steps, React Email support
- [Motion Official Site](https://motion.dev) — Framer Motion rebranded as Motion, 330+ examples
- [Next.js Docs: Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) — next/font usage, Geist and Inter setup
- [Next.js Docs: Standalone Output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — Railway deployment optimization
- [Tailwind CSS Docs: Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) — Installation, v4 setup

### Secondary (MEDIUM confidence)

- [Email Domain Warm-Up 2026](https://www.mailreach.co/blog/how-to-warm-up-email-domain) — 4-6 week timeline, volume strategy
- [SPF DKIM DMARC Setup Guide 2026](https://smartreach.io/blog/how-to-set-up-spf-dkim-dmarc-guide/) — DNS record configuration
- [Next.js LCP Optimization](https://rise.co/blog/core-web-vitals-for-react-next.js-sites-real-fixes-that-cut-lcp-by-50percent) — Priority attribute, image optimization
- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices) — RLS policies, schema design
- [React Email 5.0 Announcement](https://resend.com/blog/react-email-5) — Tailwind 4 support, React 19.2 support
- [Railway Next.js Deployment](https://railway.com/deploy/nextjs) — Zero-config deployment, automatic detection
- [Privacy Policy Templates for Newsletters](https://termly.io/resources/templates/privacy-policy-emails/) — GDPR/CAN-SPAM compliance

### Tertiary (LOW confidence)

- Medium articles on Supabase/Next.js patterns — useful examples but not authoritative
- GitHub repository examples — code patterns verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries are official, well-documented, and current as of Feb 2026
- Architecture: HIGH — Patterns verified from official Next.js, Supabase, and Framer Motion docs
- Pitfalls: HIGH — Sourced from official docs, recent technical articles, and community patterns
- Email warm-up: MEDIUM — Multiple sources agree, but specific timeline may vary by provider
- Legal templates: MEDIUM — Requirements are clear, but specific template choice is deferred

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days for stable web frameworks)

---

## Sources

- [Next.js Docs: App Router](https://nextjs.org/docs/app/guides)
- [Next.js Docs: Getting Started](https://nextjs.org/docs/app/getting-started)
- [Next.js Docs: Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Motion — JavaScript & React animation library](https://motion.dev)
- [Motion Examples](https://motion.dev/examples)
- [Supabase Docs: Use Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Resend Docs: Send emails with Next.js](https://resend.com/docs/send-with-nextjs)
- [Railway Docs: Quick Start](https://docs.railway.com/quick-start)
- [Email Domain Warm-Up Guide 2026](https://www.mailreach.co/blog/how-to-warm-up-email-domain)
- [SPF DKIM DMARC Setup Guide 2026](https://smartreach.io/spf-dkim-dmarc-email-authentication-setup-guide)
- [Next.js Performance: Core Web Vitals](https://rise.co/blog/core-web-vitals-for-react-next.js-sites-real-fixes-that-cut-lcp-by-50percent)
- [Privacy Policy Templates for Newsletters](https://termly.io/resources/templates/privacy-policy-emails/)
- [GDPR Email Newsletter Compliance](https://www.termsfeed.com/blog/gdpr-email-newsletters/)
- [Tailwind + Next.js Setup Guide 2026](https://designrevision.com/blog/tailwind-nextjs-setup)
- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [React Email 5.0](https://resend.com/blog/react-email-5)
