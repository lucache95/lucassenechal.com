# Phase 2: Subscriber Onboarding - Research

**Researched:** 2026-02-20
**Domain:** Multi-step signup flow, form state management, Supabase schema extension, welcome email, celebration UX
**Confidence:** HIGH

## Summary

Phase 2 builds a 5-step single-page stepper flow where visitors who already provided their email (Phase 1) can customize their newsletter preferences. The primary technical challenges are: (1) managing multi-step client-side form state that submits to a Server Action on the final step, (2) extending the Supabase schema from a single `subscribers` table to a normalized set of preference tables, (3) direction-aware step transitions with Framer Motion's AnimatePresence, and (4) sending a welcome email via Resend + React Email upon completion.

The existing Phase 1 codebase establishes clear patterns: React 19 `useActionState` for Server Actions, Framer Motion for animations, Tailwind v4 with CSS custom properties for theming, Supabase `service_role` key for server-side writes, and a `components/ui/` primitives library. Phase 2 must extend these patterns, not introduce competing ones.

**Primary recommendation:** Use `useReducer` for multi-step form state (no external state library needed), Zod for shared client/server validation, AnimatePresence with `mode="wait"` and `custom={direction}` for step transitions, and a new Supabase migration for the preferences schema. Keep the city input as a simple text field (no autocomplete API) to avoid cost and complexity.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **Signup Flow Structure**
   - **Pattern**: Single-page stepper (not multi-page wizard). All steps render on one page with smooth transitions between them.
   - **Steps** (5 total):
     1. **Topics** -- Category selection + custom topics
     2. **Format** -- Newsletter format choice
     3. **Delivery Time & Location** -- Preset time slots + auto-detected timezone + city input
     4. **Sources & SMS** -- RSS/Atom feed URLs + SMS opt-in with benefits pitch
     5. **Confirmation** -- Celebratory page with share/referral CTA
   - **Skip behavior**: Only email (captured on landing page) and at least browsing topics are required. All other steps can be skipped with sensible defaults (format: digest, time: morning, location: auto-detected timezone, no custom sources, no SMS).
   - **Progress indicator**: Builder's discretion -- pick the best visual approach for the stepper.

2. **Topic Selection UX**
   - **Layout/presentation**: Builder's discretion -- pick the most engaging approach for selecting topics.
   - **Category structure**: Two-tier -- 8 broad categories with optional expandable subtopics.
     - Example categories: Technology & AI, Business & Finance, Health & Wellness, Local & Community, Entertainment, Science & Innovation, Lifestyle, Sports
     - Each broad category expands to show 4-6 subtopics
   - **Custom topics**: Presented as a separate step/section after category selection -- a plain-English text input where subscribers describe what they want in their own words.
   - **Minimum selection**: No minimum required. Subscribers can skip entirely (they'll get a general briefing).

3. **Preference Collection**
   - **Format choice UI**: Builder's discretion -- design the best UX for choosing between newsletter formats.
   - **Delivery time**: Three preset slots -- Morning (~7am), Afternoon (~12pm), Evening (~6pm) in subscriber's local timezone.
   - **Location**: Auto-detect timezone from browser + city search input. City enables local content personalization (local events, deals, news). Timezone ensures correct delivery time.
   - **RSS/Atom feeds**: Simple URL input field where subscribers can paste feed URLs. Validate as RSS/Atom only (security constraint from PROJECT.md -- prevents SSRF).
   - **SMS opt-in**: Dedicated mini-section with a benefits pitch explaining what they'll get (breaking alerts, quick daily summaries, two-way AI conversation) before revealing the phone number input. Not just a toggle -- sell the value first.

4. **Post-Signup Experience**
   - **Confirmation page**: Celebratory animation (confetti/particles) + "You're all set!" message + share/referral CTA (share link to invite friends). Show a brief summary of their choices.
   - **Welcome email**: Send immediately after signup. Includes a sample briefing preview showing what their first real delivery will look like based on their selected topics.
   - **Preference editing**: Both methods available:
     - Full preferences dashboard (accessible via link in emails or bookmark)
     - Quick "manage preferences" link in every email footer (token-based, no login)

### Claude's Discretion
- Progress indicator visual approach for the stepper
- Topic selection layout/presentation (most engaging approach)
- Format choice UI design
- Overall component structure and file organization

### Deferred Ideas (OUT OF SCOPE)
- Preference editing dashboard (Phase 6: Preference Management)
- Token-based preference links in emails (Phase 5/6)
- Full preference management flow (Phase 6)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIGN-01 | Multi-step signup flow (email -> customize -> confirmation) | useReducer state machine for 5-step stepper; AnimatePresence transitions; Server Action submission on final step |
| SIGN-02 | Topic input via multiple choice categories with "(Most Popular)" labels + freeform custom option | Two-tier category data structure; expandable card/accordion UI; textarea for custom topics; Zod validation |
| SIGN-03 | Newsletter format choice from 3 options: curated digest, written briefing, mixed -- with "(Most Popular)" default | Radio group or card selection UI; default value "digest"; F/G/E identity-framed descriptions |
| SIGN-04 | Optional location input for local content personalization | Browser timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`; simple text input for city (no autocomplete API) |
| SIGN-05 | Delivery time preference selector | Three preset slots (morning/afternoon/evening) mapped to ~7am/~12pm/~6pm; timezone stored alongside |
| SIGN-06 | SMS opt-in checkbox with phone number input | Benefits-first pitch section; conditional phone input reveal; E.164 format storage; Zod phone validation |
| SIGN-07 | Custom source input -- RSS/Atom feed URLs (RSS only in v1, security) | URL validation with `new URL()` + protocol allowlist (http/https only); SSRF prevention via private IP blocking at fetch time (later phases); Zod z.string().url() |
| SIGN-08 | Confirmation page with first-delivery expectation | Confetti animation (canvas-confetti); choice summary display; share/referral CTA; delivery time messaging |
| SIGN-09 | Welcome/confirmation email with preview of what to expect | Resend + React Email template; Server Action sends after DB write; sample briefing preview based on selected topics |
| COPY-02 | Signup flow steps framed with F/G/E microcopy | Step headers, descriptions, CTAs, placeholder text all use Fear/Greed/Ego triad; specific examples in CONTEXT.md |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, Server Actions, routing | Already in project |
| React | 19.2.3 | `useActionState`, `useReducer` for form state | Already in project |
| Framer Motion | 12.34.3 | AnimatePresence step transitions, animations | Already in project |
| @supabase/supabase-js | 2.97.0 | Database reads/writes for preferences | Already in project |
| Resend | 6.9.2 | Welcome email delivery | Already in project |
| Tailwind CSS | 4.x | Styling with existing theme tokens | Already in project |

### New Dependencies Required
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | ^3.23 | Shared client/server form validation schemas | Industry standard for TypeScript validation; works with useActionState pattern; single source of truth for validation rules |
| @react-email/components | ^1.0.8 | Welcome email template components | Official companion to Resend; React-based email templates; actively maintained (React Email 5.0, Nov 2025) |
| @react-email/render | ^1.0 | Render React Email to HTML for Resend | Required to convert JSX templates to email-compatible HTML |
| canvas-confetti | ^1.9 | Confirmation page celebration animation | Lightweight (~6KB gzipped), no React wrapper needed, imperative API works well with useEffect |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer | Zustand | Overkill for single-page form state; adds dependency; useReducer is sufficient for 5 steps |
| useReducer | React Context | Slightly more boilerplate but works; useReducer is more explicit for state machines |
| Zod | Manual validation | Zod provides shared client/server schemas, type inference, composable; manual is error-prone |
| canvas-confetti | react-confetti | react-confetti is 220KB vs canvas-confetti ~6KB; we only need a one-shot burst |
| canvas-confetti | react-canvas-confetti | 75KB wrapper around canvas-confetti; unnecessary abstraction for a single useEffect call |
| Simple city text input | Google Places / Nominatim API | Google Places API no longer available to new customers (March 2025); Nominatim has 1 req/sec limit; city text field is sufficient for v1 |
| @react-email/components | Raw HTML email | React Email provides cross-client compatible components; hand-rolling email HTML is a known pain point |

**Installation:**
```bash
npm install zod @react-email/components @react-email/render canvas-confetti
npm install -D @types/canvas-confetti
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (marketing)/
│   └── page.tsx                    # Landing page (Phase 1, unchanged)
├── onboarding/
│   ├── page.tsx                    # Onboarding stepper page (new route)
│   └── layout.tsx                  # Minimal layout for onboarding
├── actions.ts                      # Existing + new onboarding Server Action
├── layout.tsx                      # Root layout (unchanged)
└── globals.css                     # Theme tokens (unchanged)

components/
├── onboarding/
│   ├── stepper.tsx                 # Main stepper container + state machine
│   ├── step-topics.tsx             # Step 1: Topic selection
│   ├── step-format.tsx             # Step 2: Format choice
│   ├── step-delivery.tsx           # Step 3: Time + location
│   ├── step-sources.tsx            # Step 4: RSS feeds + SMS
│   ├── step-confirmation.tsx       # Step 5: Celebratory confirmation
│   ├── progress-bar.tsx            # Visual progress indicator
│   └── topic-category-card.tsx     # Reusable topic category component
├── ui/
│   ├── button.tsx                  # Existing (reuse)
│   └── input.tsx                   # Existing (reuse)
└── landing/                        # Existing (unchanged)

lib/
├── supabase/
│   ├── client.ts                   # Existing (unchanged)
│   └── server.ts                   # Existing (unchanged)
├── schemas/
│   └── onboarding.ts               # Zod schemas for onboarding form
├── data/
│   └── topics.ts                   # Category/subtopic data structure
└── email/
    └── welcome-template.tsx        # React Email welcome template

supabase/
└── migrations/
    ├── 001_subscribers.sql         # Existing (unchanged)
    └── 002_subscriber_preferences.sql  # New: preferences schema
```

### Pattern 1: Multi-Step Form State Machine with useReducer
**What:** Central reducer manages all form state, current step index, navigation direction, and validation status.
**When to use:** Multi-step forms where state transitions are predictable and all steps share a single data model.
**Example:**
```typescript
// Source: React 19 docs, verified pattern from Phase 1 codebase

type OnboardingState = {
  step: number;
  direction: 'forward' | 'back';
  data: {
    topics: string[];
    customTopics: string;
    format: 'digest' | 'briefing' | 'mixed';
    deliveryTime: 'morning' | 'afternoon' | 'evening';
    timezone: string;
    city: string;
    feedUrls: string[];
    smsOptIn: boolean;
    phone: string;
  };
};

type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_DATA'; payload: Partial<OnboardingState['data']> }
  | { type: 'RESET' };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 4), direction: 'forward' };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 0), direction: 'back' };
    case 'UPDATE_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

### Pattern 2: Direction-Aware AnimatePresence Step Transitions
**What:** Framer Motion AnimatePresence with `mode="wait"` and `custom={direction}` for smooth forward/backward step animations.
**When to use:** Single-page stepper where steps slide in from the direction of navigation.
**Example:**
```typescript
// Source: https://sinja.io/blog/direction-aware-animations-in-framer-motion (verified)

const stepVariants = {
  initial: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    x: '0%',
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
  },
  exit: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

// In the stepper component:
<AnimatePresence mode="wait" custom={state.direction}>
  <motion.div
    key={state.step}
    custom={state.direction}
    variants={stepVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {renderStep(state.step)}
  </motion.div>
</AnimatePresence>
```

### Pattern 3: Server Action with Zod Validation for Final Submission
**What:** Single Server Action validates all form data with Zod, writes to multiple Supabase tables in a transaction-like flow, and sends welcome email.
**When to use:** Final step submission where all collected preferences are persisted.
**Example:**
```typescript
// Source: Consistent with Phase 1 actions.ts pattern + Zod integration

'use server'

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { onboardingSchema } from '@/lib/schemas/onboarding';

type OnboardingResult = { success?: boolean; error?: string };

export async function completeOnboarding(
  _prevState: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  // Parse JSON payload from hidden input
  const rawData = formData.get('onboardingData');
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Invalid form data' };
  }

  const parsed = onboardingSchema.safeParse(JSON.parse(rawData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Validation failed' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Write preferences to Supabase tables...
  // Send welcome email via Resend...

  return { success: true };
}
```

### Pattern 4: React Email Welcome Template
**What:** React component rendered to HTML by Resend for the welcome email.
**When to use:** Transactional emails that need to match the website aesthetic and render across email clients.
**Example:**
```typescript
// Source: https://resend.com/docs/send-with-nextjs (verified)

import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';

interface WelcomeEmailProps {
  topics: string[];
  format: string;
  deliveryTime: string;
}

export function WelcomeEmail({ topics, format, deliveryTime }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container>
          <Heading>Your daily edge starts tomorrow</Heading>
          <Text>Here is a preview of what your first briefing will look like...</Text>
          {/* Sample briefing content based on selected topics */}
        </Container>
      </Body>
    </Html>
  );
}

// In Server Action:
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'Lucas Senechal <newsletter@lucassenechal.com>',
  to: [subscriberEmail],
  subject: "Your daily edge starts tomorrow",
  react: WelcomeEmail({ topics, format, deliveryTime }),
});
```

### Anti-Patterns to Avoid
- **Separate Server Action per step:** Don't persist each step individually. Collect all data client-side and submit once on completion. Reduces DB round-trips and simplifies error handling.
- **React Hook Form for this use case:** The Phase 1 pattern uses `useActionState` directly, not RHF. Adding RHF introduces complexity and known React 19 compatibility quirks (watch() issues). Stick with the established pattern.
- **Google Places API for city input:** No longer available to new customers as of March 2025. Use a simple text input for city name.
- **Fetching/validating RSS feeds at signup time:** Only validate URL format at signup. Actual feed fetching happens in Phase 3 (AI Research Engine). Don't make signup dependent on external HTTP requests.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom regex validators | Zod schemas | Type inference, composable, shared client/server, well-tested edge cases |
| Email templates | Raw HTML strings | React Email components | Cross-client compatibility is notoriously hard; React Email handles Outlook, Gmail, Apple Mail quirks |
| Confetti animation | Custom canvas/CSS particles | canvas-confetti | Performant, battle-tested, 6KB, handles cleanup and browser quirks |
| URL validation | Custom regex | `new URL()` constructor + Zod z.string().url() | URL parsing is complex; regex fails against encoded payloads and edge cases |
| Timezone detection | IP-based geolocation | `Intl.DateTimeFormat().resolvedOptions().timeZone` | Built-in browser API, no external service needed, returns IANA timezone names, 97%+ browser support |
| Phone number format | Custom parsing | Store raw input + validate with regex for basic format; or add react-phone-number-input later | E.164 validation is complex with international formats; for v1 US-focused, basic validation is acceptable |

**Key insight:** The deceptively complex problems in this phase are email rendering across clients and URL/phone validation edge cases. Both have battle-tested libraries that handle years of accumulated quirks.

## Common Pitfalls

### Pitfall 1: Losing Form State on Navigation
**What goes wrong:** User navigates back/forward and their selections are gone because state was stored in individual step components.
**Why it happens:** Each step component mounts/unmounts during transitions, destroying local state.
**How to avoid:** Lift all form state to the parent stepper component via useReducer. Steps receive state as props and dispatch updates.
**Warning signs:** Using `useState` inside individual step components for form values.

### Pitfall 2: AnimatePresence Key Mismatch
**What goes wrong:** Step transitions don't animate (instant swap) or animate incorrectly.
**Why it happens:** The `key` prop on the motion.div child doesn't change between steps, so AnimatePresence doesn't detect the swap. Or `mode="wait"` is missing, causing overlapping animations.
**How to avoid:** Use `key={state.step}` on the motion.div wrapper. Always use `mode="wait"` for sequential step transitions.
**Warning signs:** Both steps visible simultaneously; no exit animation; flickering.

### Pitfall 3: Server Action Validation Mismatch
**What goes wrong:** Client allows submission but server rejects; or server accepts invalid data.
**Why it happens:** Client-side validation logic diverges from server-side checks.
**How to avoid:** Define a single Zod schema in `lib/schemas/onboarding.ts` and use it on both client (for instant feedback) and server (for security). Never trust client-only validation.
**Warning signs:** Duplicate validation logic; inconsistent error messages between client and server.

### Pitfall 4: Supabase Multi-Table Write Without Error Handling
**What goes wrong:** Subscriber preferences partially saved -- some tables written, others failed.
**Why it happens:** Sequential inserts to multiple tables without checking errors between them.
**How to avoid:** Check each Supabase insert result and handle errors. Consider using a Supabase RPC function (Postgres function) for atomic multi-table writes if needed. At minimum, write subscriber_preferences first (core data), then topics and sources (supplementary).
**Warning signs:** Subscribers with preferences but no topics, or vice versa.

### Pitfall 5: Welcome Email Blocking Signup
**What goes wrong:** Signup appears to fail or is slow because the welcome email send is awaited.
**Why it happens:** `await resend.emails.send(...)` in the Server Action blocks the response.
**How to avoid:** Fire the email send without awaiting (fire-and-forget) or use a try/catch that logs failures but still returns success. The signup is the primary action; email is secondary.
**Warning signs:** Signup latency > 2 seconds; signup fails when Resend is down.

### Pitfall 6: react-email serverComponentsExternalPackages
**What goes wrong:** Build error or runtime error when importing @react-email/components in a Server Action.
**Why it happens:** Next.js tries to bundle react-email packages for client-side, but they use Node.js APIs.
**How to avoid:** Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['@react-email/components', '@react-email/render'],
};
```
**Warning signs:** "Module not found" errors at build time; "document is not defined" at runtime.

## Code Examples

### Timezone Auto-Detection
```typescript
// Source: MDN Intl.DateTimeFormat docs (verified, 97%+ browser support)
// Run in client component on mount

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "America/New_York"
  } catch {
    return 'UTC';
  }
}
```

### Zod Onboarding Schema (Shared Client/Server)
```typescript
// Source: Zod docs (verified) + project conventions

import { z } from 'zod';

export const onboardingSchema = z.object({
  subscriberId: z.string().uuid(),
  topics: z.array(z.string()).default([]),
  customTopics: z.string().max(500).default(''),
  format: z.enum(['digest', 'briefing', 'mixed']).default('digest'),
  deliveryTime: z.enum(['morning', 'afternoon', 'evening']).default('morning'),
  timezone: z.string().default('UTC'),
  city: z.string().max(100).default(''),
  feedUrls: z.array(
    z.string().url().refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch { return false; }
      },
      { message: 'Only HTTP/HTTPS URLs are allowed' }
    )
  ).default([]),
  smsOptIn: z.boolean().default(false),
  phone: z.string().default('').refine(
    (val) => val === '' || /^\+?[1-9]\d{1,14}$/.test(val),
    { message: 'Invalid phone number format' }
  ),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
```

### Confetti Burst on Confirmation
```typescript
// Source: canvas-confetti GitHub docs (verified)

import confetti from 'canvas-confetti';

// Fire in useEffect when confirmation step mounts
useEffect(() => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}, []);
```

### Supabase Migration: Subscriber Preferences Schema
```sql
-- 002_subscriber_preferences.sql
-- Phase 2: Extend subscribers with preferences

-- Topics catalog (seeded with default categories)
CREATE TABLE topic_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  is_popular BOOLEAN DEFAULT false
);

CREATE TABLE topic_subtopics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES topic_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  UNIQUE(category_id, name)
);

-- Subscriber topic selections (junction table)
CREATE TABLE subscriber_topics (
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES topic_subtopics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (subscriber_id, subtopic_id)
);

-- Subscriber preferences (one-to-one with subscribers)
CREATE TABLE subscriber_preferences (
  subscriber_id UUID PRIMARY KEY REFERENCES subscribers(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'digest' CHECK (format IN ('digest', 'briefing', 'mixed')),
  delivery_time TEXT NOT NULL DEFAULT 'morning' CHECK (delivery_time IN ('morning', 'afternoon', 'evening')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  city TEXT DEFAULT '',
  sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Custom topics (freeform text per subscriber)
CREATE TABLE subscriber_custom_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Subscriber RSS/Atom feed sources
CREATE TABLE subscriber_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  feed_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(subscriber_id, feed_url)
);

-- Indexes for common queries
CREATE INDEX idx_subscriber_topics_subscriber ON subscriber_topics(subscriber_id);
CREATE INDEX idx_subscriber_sources_subscriber ON subscriber_sources(subscriber_id);
CREATE INDEX idx_subscriber_custom_topics_subscriber ON subscriber_custom_topics(subscriber_id);

-- RLS policies (service_role full access, deny public)
ALTER TABLE topic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_custom_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_sources ENABLE ROW LEVEL SECURITY;

-- Public can read topic catalog (for signup form)
CREATE POLICY "Allow public read topics" ON topic_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read subtopics" ON topic_subtopics FOR SELECT TO anon USING (true);

-- Deny all other public access
CREATE POLICY "Deny public write categories" ON topic_categories FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny public write subtopics" ON topic_subtopics FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny public access subscriber_topics" ON subscriber_topics FOR ALL TO anon USING (false);
CREATE POLICY "Deny public access subscriber_preferences" ON subscriber_preferences FOR ALL TO anon USING (false);
CREATE POLICY "Deny public access subscriber_custom_topics" ON subscriber_custom_topics FOR ALL TO anon USING (false);
CREATE POLICY "Deny public access subscriber_sources" ON subscriber_sources FOR ALL TO anon USING (false);

-- Service role full access for all preference tables
CREATE POLICY "Service role categories" ON topic_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subtopics" ON topic_subtopics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_topics" ON subscriber_topics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_preferences" ON subscriber_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_custom_topics" ON subscriber_custom_topics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_sources" ON subscriber_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed topic categories
INSERT INTO topic_categories (name, display_order, is_popular) VALUES
  ('Technology & AI', 1, true),
  ('Business & Finance', 2, true),
  ('Health & Wellness', 3, false),
  ('Local & Community', 4, false),
  ('Entertainment', 5, true),
  ('Science & Innovation', 6, false),
  ('Lifestyle', 7, false),
  ('Sports', 8, false);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useFormState (react-dom) | useActionState (react) | React 19 (2024) | Phase 1 already uses useActionState; continue using it |
| Framer Motion | Motion (rebranded) | Feb 2025 | Package is still `framer-motion` on npm; import paths unchanged; no migration needed |
| react-email 3.x | React Email 5.0 | Nov 2025 | Adds Tailwind 4 support, dark mode switcher, 8 new components; relevant for template styling |
| Google Places Autocomplete | Not available to new customers | March 2025 | Use simple text input for city; avoid dependency on unavailable API |
| Manual email HTML | @react-email/components | 2024-2025 | Cross-client compatible React components; used by Resend ecosystem |

**Deprecated/outdated:**
- `useFormState` from `react-dom`: Replaced by `useActionState` from `react` in React 19. Phase 1 already uses the correct hook.
- Google Maps Places Autocomplete for new customers: Deprecated March 2025. Use free alternatives or plain text input.
- `framer-motion` import as library name: Still works and is the npm package name, but official branding is now "Motion". No code changes needed.

## Open Questions

1. **Subscriber ID passing from landing page to onboarding**
   - What we know: Phase 1 captures email and creates a subscriber row with a UUID. The onboarding flow needs this ID to associate preferences.
   - What's unclear: How to pass the subscriber ID from the landing page success state to the `/onboarding` route. Options: URL query parameter (`/onboarding?id=xxx`), cookie/session, or re-lookup by email.
   - Recommendation: Use URL query parameter. It's stateless, works with browser back/forward, and the subscriber ID is not sensitive (UUID, not sequential). The landing page success handler can redirect to `/onboarding?subscriber=<uuid>`. Server Action verifies the UUID exists before writing preferences.

2. **Topic category data: database-seeded vs hardcoded**
   - What we know: The migration seeds 8 categories. Subtopics need to be defined somewhere.
   - What's unclear: Whether to fetch categories from Supabase at render time or hardcode them in a TypeScript data file.
   - Recommendation: Hardcode in `lib/data/topics.ts` for v1. Avoids a Supabase read on page load, simplifies the signup flow, and categories won't change frequently. Store the category/subtopic IDs as stable strings that match the DB seed. The DB is the source of truth for subscriber associations; the UI can use a static list.

3. **Welcome email content when no topics selected**
   - What we know: Topics are optional (subscriber can skip). Welcome email should include a "sample briefing preview."
   - What's unclear: What the preview looks like when subscriber chose zero topics.
   - Recommendation: Show a generic "here's what a typical briefing looks like" sample with diverse topics. Only personalize the preview when topics are selected.

## Sources

### Primary (HIGH confidence)
- Phase 1 codebase analysis -- `app/actions.ts`, `components/landing/hero.tsx`, `supabase/migrations/001_subscribers.sql`, `app/globals.css`, `package.json` -- established patterns verified directly
- [MDN Intl.DateTimeFormat.resolvedOptions()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions) -- timezone detection API, 97%+ browser support
- [Resend: Send emails with Next.js](https://resend.com/docs/send-with-nextjs) -- official Resend docs for Server Action email sending
- [Motion: AnimatePresence](https://motion.dev/docs/react-animate-presence) -- official Motion docs for exit animations and mode="wait"
- [Zod: Defining schemas](https://zod.dev/api) -- official Zod API docs for URL and string validation
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) -- official repo, API documentation

### Secondary (MEDIUM confidence)
- [Direction-aware animations in Framer Motion](https://sinja.io/blog/direction-aware-animations-in-framer-motion) -- verified pattern for custom prop direction passing with AnimatePresence
- [OWASP SSRF Prevention in Node.js](https://owasp.org/www-community/pages/controls/SSRF_Prevention_in_Nodejs) -- URL validation and private IP blocking best practices
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) -- official Next.js forms documentation with useActionState pattern
- [React Email 5.0 announcement](https://resend.com/blog/react-email-5) -- Tailwind 4 support, latest features
- [Supabase: Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) -- official migration workflow docs

### Tertiary (LOW confidence)
- [react-phone-number-input](https://www.npmjs.com/package/react-phone-number-input) -- potential library for phone input if basic validation proves insufficient; not yet verified as needed
- [Snyk: Secure JavaScript URL validation](https://snyk.io/blog/secure-javascript-url-validation/) -- general URL security guidance; SSRF prevention at fetch time is Phase 3 concern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core libraries already installed and used in Phase 1; new additions (Zod, React Email, canvas-confetti) are well-established ecosystem standards
- Architecture: HIGH -- patterns directly extend Phase 1 conventions (useActionState, Framer Motion, service_role Supabase writes); stepper pattern is well-documented
- Pitfalls: HIGH -- pitfalls identified from direct codebase analysis and verified documentation; AnimatePresence gotchas confirmed in official Motion docs
- Database schema: MEDIUM -- normalized design follows Supabase best practices; exact subtopic seed data needs to be finalized during planning

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days -- stable domain, libraries well-established)
