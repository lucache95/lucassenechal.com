# Phase 3: Consulting Funnel - Research

**Researched:** 2026-02-22
**Domain:** AI-driven smart intake form, structured output streaming, booking embed, PDF generation, lead capture
**Confidence:** HIGH

## Summary

Phase 3 replaces the existing placeholder /work-with-me page with a full consulting funnel: service cards, an AI-powered smart intake conversation, real-time business plan generation, Cal.com booking embed, and lead notification. The technical architecture centers on the Vercel AI SDK v6 for streaming structured output (both the question selection logic and the business plan generation), with Supabase for intake data persistence and Resend for lead notification emails.

The existing project stack (Next.js 16, React 19, Tailwind v4, Framer Motion 12, Supabase, Resend, Zod 4) provides a solid foundation. The main new dependencies are the AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) for LLM integration and `@react-pdf/renderer` for downloadable business plans. Cal.com embed has React 19 peer dependency conflicts with the npm package, so the recommended approach is using the vanilla JS embed script (`@calcom/embed-core`) loaded via Next.js `<Script>` component instead.

**Primary recommendation:** Use Vercel AI SDK v6 with `streamText` + `Output.object()` for business plan streaming, a Next.js API Route Handler for the AI endpoints, `useObject` on the client for real-time partial rendering, and a curated question library stored as static TypeScript data (matching the project's existing pattern from `lib/data/topics.ts`).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Grid of cards (same style as homepage "What I Build" section) -- 4 services with minimal 1-liner descriptions
- AI determines which service fits from intake answers -- one universal "Start" CTA, no service pre-selection
- One prominent CTA button below the cards: "Tell me about your business" (or similar)
- Clicking CTA transforms the page into the intake -- no route change, smooth transition on same /work-with-me URL
- Replace existing placeholder page -- upgrade /work-with-me from placeholder to full consulting funnel
- Reuse trust strip logo component from homepage for social proof
- No pricing displayed anywhere -- discovery call reveals pricing
- 3-step how-it-works visual before the CTA: Answer questions -> Get your plan -> Book a call
- Short FAQ section (3-4 questions) addressing common objections
- Form-like design: one clean question centered on screen, answer below, next button -- Typeform/survey feel
- Mixed smart inputs: AI picks the right input per question (buttons for choices, text for open-ended, sliders for ranges)
- Back button available -- can go back to any previous question and change answer, AI re-adjusts following questions
- Subtle skip link below the input -- available but non-prominent
- Straight to Q1 after clicking CTA -- no intro screen
- Progress: smart and enticing -- once minimum viable data is reached (~6-8 questions), offer "Generate plan now" OR "Answer more for better accuracy" with messaging like "Answer 5 more questions to improve project accuracy by 50%". Make it feel close to done but enticing to keep going. Visitors can keep answering as long as they want before generating.
- Stage 2 is NOT a separate phase -- it is a continuation of the same intake. After minimum questions, visitor chooses: generate plan now or keep going for accuracy. This replaces the original two-stage concept.
- On-page styled sections + downloadable PDF ("Download your plan" button)
- Sections stream in real-time as AI generates them -- reduces perceived wait
- Detailed phase-by-phase estimate breakdown with timeline (not just S/M/L tiers)
- Paraphrased mirroring -- restate their situation in cleaner language, not direct quotes
- Plan sections per WORK-06: goal mirroring, bottleneck diagnosis, proposed system steps, tools/integrations, implementation phases (MVP -> hardening -> reporting), risks/dependencies, estimate + timeline + assumptions, clear next steps
- Subtle "Start a new assessment" link at the bottom
- Cal.com embed (not Calendly): https://cal.com/lucas-senechal/
- After booking: thank you confirmation + Stage 2 pitch ("Answer a few more to help me prepare for your call")
- Urgency messaging near booking CTA: manually updated spot count (e.g., "2 spots left for March"), sourced from env variable or config
- Messaging only in v1 -- no deposit/payment integration
- Email + name required before plan generation (captures the lead)
- All intake data stored even if they don't book -- answers, generated plan, timestamps
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

### Deferred Ideas (OUT OF SCOPE)
- Stripe deposit/payment integration ("Lock in your spot" with actual payment) -- future phase after consulting funnel is validated
- Admin dashboard for managing spot count -- use env variable for v1, upgrade later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WORK-01 | Dedicated /work-with-me consulting conversion page | Existing placeholder page at `app/(marketing)/work-with-me/page.tsx` will be upgraded; uses (marketing) route group with NavBar layout |
| WORK-02 | Service descriptions (AI automation, process consulting, ongoing management, training) | Reuse card grid pattern from `components/homepage/what-i-build.tsx`; same 4 services already defined with icons and descriptions |
| WORK-03 | Stage 1 smart intake -- one-question-at-a-time, AI selects next from curated library, 8-12 questions max, 2-4 minutes | AI SDK v6 Route Handler with curated question library in `lib/data/intake-questions.ts`; AI selects next question via `generateObject` call |
| WORK-04 | Stage 1 collects: business + team size, which workflow, current stack, data sources, volume, main pain, timeline, optional budget band | Question library covers all these dimensions with typed answer schemas per question |
| WORK-05 | Subtle exit option always available but non-dominant. Show progress. Always allow skip. | Reuse skip/progress patterns from onboarding stepper; adaptive progress bar showing "minimum reached" state |
| WORK-06 | Instant 1-page business plan output after completion -- goal mirroring, bottleneck diagnosis, system steps, tools, phases, risks, estimate + timeline | AI SDK `streamText` + `Output.object()` with Zod schema defining all plan sections; `useObject` for real-time streaming display |
| WORK-07 | Cal.com embed to book 15-min discovery call after seeing plan | Cal.com vanilla JS embed via Next.js Script component (avoids React 19 peer dep conflict with @calcom/embed-react) |
| WORK-08 | All intake data stored for Lucas to review before the call | Supabase tables: `intake_sessions`, `intake_answers`, `intake_plans` with service_role access pattern (established in project) |
| WORK-09 | Real-time feel -- < 2 second latency between questions | AI question selection via lightweight `generateObject` call (~500ms with Claude Haiku); answer rendering is instant client-side |
| WORK-10 | Optional deeper intake (continuation, not separate stage) framed as "Answer 5 more for better accuracy" | Single continuous flow with `minQuestionsReached` state flag; UI switches from "Continue" to dual CTA once minimum met |
| WORK-11 | Curated question library with hard caps (Stage 1 ~12, Stage 2 ~5-8) -- AI selects from pool, never invents freely | Static TypeScript question library with ~20 questions total; AI receives pool + prior answers, returns next question ID |
| COPY-03 | Homepage and consulting page use F/G/E with consulting-specific framing | Already complete for homepage; consulting page hero/copy follows same F/G/E framework |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ai (Vercel AI SDK) | ^6.0 | Streaming structured output, model abstraction | Industry standard for AI in Next.js; unified streaming API, Zod schema integration, built-in partial object streaming |
| @ai-sdk/react | ^6.0 | React hooks (useObject, useChat) | Official React bindings; useObject hook provides partial streaming display out of the box |
| @ai-sdk/anthropic | latest | Anthropic Claude model provider | First-party provider; supports Claude Haiku (fast/cheap for question selection) and Sonnet (quality for plan generation) |
| @react-pdf/renderer | ^4.3 | Client-side PDF generation from React components | React-native JSX syntax for PDF; compatible with React 19 since v4.1.0; 860K weekly downloads |
| @calcom/embed-core | latest | Cal.com booking embed (vanilla JS) | Avoids React 19 peer dep conflict with @calcom/embed-react; loaded via Script component |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^4.3 (already installed) | Schema validation for AI output + form data | Define business plan schema, question answer schemas, intake session validation |
| framer-motion | ^12.34 (already installed) | Page transitions, intake animations | Transition between service page and intake mode, question animations |
| @react-email/components | ^1.0 (already installed) | Lead notification email template | Email Lucas when intake is completed |
| resend | ^6.9 (already installed) | Email delivery | Send lead notification emails (pattern already established in project) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jspdf + html2canvas | jspdf is more popular (2.6M downloads) but requires HTML-to-canvas rendering which is fragile; @react-pdf/renderer allows React component composition matching the project's component-based approach |
| @calcom/embed-core (vanilla JS) | @calcom/embed-react (npm) | React package has React 19 peer dep conflict (issue #20814); vanilla JS works reliably with any React version |
| AI SDK useObject | Custom SSE/fetch streaming | useObject provides partial object streaming, error handling, loading state for free; no reason to hand-roll |
| Anthropic provider | Vercel AI Gateway | Gateway adds abstraction but requires Vercel account setup; direct Anthropic provider is simpler and project already has direct API patterns |

**Installation:**
```bash
npm install ai @ai-sdk/react @ai-sdk/anthropic @react-pdf/renderer @calcom/embed-core
```

**Environment variables needed:**
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_CAL_SPOTS_REMAINING=2  # Urgency messaging
NEXT_PUBLIC_CAL_SPOTS_MONTH=March  # Current month for spots
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (marketing)/work-with-me/
│   ├── page.tsx                    # Server Component: metadata + layout
│   └── work-with-me-client.tsx     # Client Component: full page with state machine
├── api/intake/
│   ├── next-question/route.ts      # AI Route Handler: select next question
│   └── generate-plan/route.ts      # AI Route Handler: stream business plan
lib/
├── data/
│   ├── intake-questions.ts         # Curated question library (~20 questions)
│   └── services.ts                 # 4 service definitions (reusable)
├── schemas/
│   ├── intake.ts                   # Zod schemas: answers, session, plan output
│   └── business-plan.ts            # Zod schema: structured plan sections
├── email/
│   └── intake-notification.tsx     # React Email template: notify Lucas of new lead
components/
├── intake/
│   ├── intake-container.tsx        # State machine: manages full intake flow
│   ├── question-card.tsx           # Single question display with smart input
│   ├── smart-input.tsx             # Renders correct input type per question
│   ├── intake-progress.tsx         # Adaptive progress bar with "minimum reached" state
│   ├── lead-capture-gate.tsx       # Email + name capture before plan generation
│   └── plan-display.tsx            # Streaming plan sections with styled output
├── consulting/
│   ├── service-grid.tsx            # 4 service cards (reuses WhatIBuild pattern)
│   ├── how-it-works.tsx            # 3-step visual
│   ├── faq-section.tsx             # 3-4 FAQ items
│   ├── cal-embed.tsx               # Cal.com booking embed wrapper
│   └── consulting-hero.tsx         # Hero section with F/G/E copy
├── pdf/
│   └── business-plan-pdf.tsx       # @react-pdf/renderer template for downloadable PDF
supabase/
└── migrations/
    └── 003_intake_sessions.sql     # intake_sessions, intake_answers, intake_plans tables
```

### Pattern 1: Page State Machine (Same-URL Transitions)
**What:** Single client component manages page state: `landing` -> `intake` -> `plan` -> `booking`
**When to use:** When the user decision is "no route change, smooth transition on same /work-with-me URL"
**Example:**
```typescript
// Source: Project pattern (work-with-me-card.tsx split into Server + Client)
type FunnelStage = 'landing' | 'intake' | 'generating' | 'plan' | 'booking';

function WorkWithMeClient() {
  const [stage, setStage] = useState<FunnelStage>('landing');

  return (
    <AnimatePresence mode="wait">
      {stage === 'landing' && (
        <motion.div key="landing" {...fadeVariants}>
          <ConsultingHero onStart={() => setStage('intake')} />
          <ServiceGrid />
          <HowItWorks />
          <TrustStrip />
          <FAQ />
        </motion.div>
      )}
      {stage === 'intake' && (
        <motion.div key="intake" {...fadeVariants}>
          <IntakeContainer
            onComplete={(answers) => setStage('generating')}
            onBack={() => setStage('landing')}
          />
        </motion.div>
      )}
      {/* ... plan, booking stages */}
    </AnimatePresence>
  );
}
```

### Pattern 2: AI Question Selection via Route Handler
**What:** API route receives prior answers + remaining question pool, returns next question ID + input type
**When to use:** For the smart intake where AI selects the next question from the curated library
**Example:**
```typescript
// app/api/intake/next-question/route.ts
import { generateText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { INTAKE_QUESTIONS } from '@/lib/data/intake-questions';

const nextQuestionSchema = z.object({
  questionId: z.string().describe('ID of the next question from the pool'),
  inputType: z.enum(['buttons', 'text', 'slider', 'multi-select']),
  options: z.array(z.string()).optional().describe('For buttons/multi-select'),
  skipReason: z.string().optional().describe('Why a question was skipped'),
});

export async function POST(req: Request) {
  const { answeredQuestions, answers } = await req.json();

  const remainingQuestions = INTAKE_QUESTIONS.filter(
    q => !answeredQuestions.includes(q.id)
  );

  const { output } = await generateText({
    model: anthropic('claude-3-5-haiku-20241022'), // Fast + cheap for selection
    output: Output.object({ schema: nextQuestionSchema }),
    system: `You are selecting the next intake question for a consulting prospect.
Select the most valuable next question based on their answers so far.
Only select from the provided question pool. Never invent new questions.`,
    prompt: `Prior answers: ${JSON.stringify(answers)}
Available questions: ${JSON.stringify(remainingQuestions)}
Select the next question.`,
  });

  return Response.json(output);
}
```

### Pattern 3: Streaming Business Plan via useObject
**What:** API streams a structured business plan object; client renders sections as they arrive
**When to use:** For the instant business plan generation after intake completion
**Example:**
```typescript
// app/api/intake/generate-plan/route.ts
import { streamText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { businessPlanSchema } from '@/lib/schemas/business-plan';

export const maxDuration = 60; // Plan generation may take 15-30s

export async function POST(req: Request) {
  const { answers, sessionId } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'), // Quality model for plan
    output: Output.object({ schema: businessPlanSchema }),
    system: `You are an AI systems consultant generating a business plan...`,
    prompt: `Generate a detailed 1-page business plan based on these intake answers:
${JSON.stringify(answers)}`,
  });

  return result.toTextStreamResponse();
}

// Client component
'use client';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { businessPlanSchema } from '@/lib/schemas/business-plan';

function PlanDisplay({ answers, sessionId }) {
  const { object, submit, isLoading } = useObject({
    api: '/api/intake/generate-plan',
    schema: businessPlanSchema,
  });

  useEffect(() => {
    submit({ answers, sessionId });
  }, []);

  return (
    <div>
      {object?.goalMirroring && <GoalSection content={object.goalMirroring} />}
      {object?.bottleneckDiagnosis && <BottleneckSection content={object.bottleneckDiagnosis} />}
      {/* Sections appear progressively as they stream in */}
    </div>
  );
}
```

### Pattern 4: Cal.com Vanilla JS Embed
**What:** Load Cal.com embed script via Next.js Script component instead of React npm package
**When to use:** Avoids React 19 peer dependency conflict
**Example:**
```typescript
// components/consulting/cal-embed.tsx
'use client';
import Script from 'next/script';
import { useEffect, useRef } from 'react';

export function CalEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Script
        src="https://app.cal.com/embed/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          // @ts-expect-error Cal is loaded globally
          Cal("init", { origin: "https://cal.com" });
          Cal("inline", {
            elementOrSelector: "#cal-embed",
            calLink: "lucas-senechal",
            layout: "month_view",
          });
        }}
      />
      <div id="cal-embed" ref={containerRef} style={{ width: '100%', minHeight: '500px' }} />
    </>
  );
}
```

### Anti-Patterns to Avoid
- **Inventing questions at runtime:** AI must ONLY select from the curated pool. Never let the LLM generate new questions -- this risks off-brand, irrelevant, or inappropriate questions. The question library is the guardrail.
- **Blocking on AI for every interaction:** Question selection should be fast (~500ms with Haiku). If latency spikes, fall back to deterministic next-question logic (ordered by priority in the library).
- **Full page reload between stages:** User decision explicitly requires same-URL transitions with smooth animation. Use client-side state machine, not Next.js routing.
- **Awaiting PDF generation before showing plan:** Show plan sections streaming first, then offer PDF download button that generates on-demand when clicked (not pre-generated).
- **Using service_role key on the client:** Continue the project's established pattern of server-side Supabase access via Server Actions or Route Handlers with service_role key. Never expose service_role to the browser.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming structured AI output | Custom SSE parsing + JSON chunking | AI SDK `streamText` + `Output.object()` + `useObject` | Handles partial JSON parsing, schema validation, error recovery, reconnection |
| Question selection logic | Rule-based state machine with branching | AI SDK `generateText` + `Output.object()` with Claude Haiku | AI can weigh context from all prior answers to pick optimal next question; deterministic fallback for reliability |
| PDF generation | html2canvas screenshot + jspdf | `@react-pdf/renderer` with React components | Type-safe, composable, consistent cross-browser; no DOM dependency |
| Booking calendar | Custom date picker + availability API | Cal.com embed | Battle-tested scheduling with timezone handling, email confirmations, Google Calendar sync |
| Email delivery | nodemailer + SMTP | Resend (already in project) | Already configured, React Email templates established |
| Form state management | Redux/Zustand store | useReducer (project pattern from onboarding stepper) | Matches existing stepper pattern; co-located state without external dependency |

**Key insight:** The AI SDK's `useObject` hook is the critical piece -- it transforms what would be a complex SSE + JSON parsing + partial state management problem into a simple React hook call. The business plan streaming display would require 200+ lines of custom code without it.

## Common Pitfalls

### Pitfall 1: AI SDK Version Confusion (v5 vs v6)
**What goes wrong:** Using deprecated `streamObject`/`generateObject` standalone functions instead of the v6 unified `streamText`/`generateText` with `Output.object()`
**Why it happens:** Most tutorials and Stack Overflow answers reference AI SDK v4/v5 patterns
**How to avoid:** Use only `streamText` + `Output.object()` (v6 pattern). Import from `'ai'` not `'ai/rsc'`.
**Warning signs:** Importing `streamObject` or `generateObject` as standalone functions, or importing from `'ai/rsc'`

### Pitfall 2: Cal.com Embed React 19 Incompatibility
**What goes wrong:** `npm install @calcom/embed-react` fails or requires `--force` due to React 19 peer dependency conflict
**Why it happens:** @calcom/embed-react@1.5.3 declares `react: ^18.2.0` peer dependency (GitHub issue #20814)
**How to avoid:** Use `@calcom/embed-core` (vanilla JS) loaded via Next.js `<Script>` component. Works with any React version.
**Warning signs:** Peer dependency warnings during install; Cal embed not rendering on page

### Pitfall 3: AI Latency Breaking Real-Time Feel
**What goes wrong:** Question selection takes 2-5 seconds, killing the conversational flow
**Why it happens:** Using a large model (Sonnet/Opus) for question selection when a small model suffices
**How to avoid:** Use Claude Haiku for question selection (fast, cheap, sufficient for picking from a pool). Reserve Sonnet for plan generation where quality matters. Implement deterministic fallback if AI takes > 2 seconds.
**Warning signs:** Users abandoning intake mid-flow; measured latency > 2s between questions

### Pitfall 4: Lost Intake Data on Page Navigation
**What goes wrong:** User navigates away or refreshes, losing all intake progress
**Why it happens:** All state in React memory with no persistence
**How to avoid:** Save answers to Supabase after each question (not just at end). Use session ID in URL hash or sessionStorage as recovery key. Offer "Resume your assessment" on return.
**Warning signs:** Analytics showing high drop-off mid-intake with no stored data

### Pitfall 5: PDF Generation SSR Crash
**What goes wrong:** @react-pdf/renderer crashes during server-side rendering
**Why it happens:** PDF library uses browser APIs not available in Node.js
**How to avoid:** Use `'use client'` directive on PDF components. Use dynamic import with `ssr: false` for PDFDownloadLink. Generate PDF only on client click, never during SSR.
**Warning signs:** "document is not defined" or "window is not defined" errors in server logs

### Pitfall 6: Business Plan Schema Too Rigid
**What goes wrong:** AI output frequently fails schema validation, returning null fields or wrong types
**Why it happens:** Overly strict Zod schema that doesn't account for AI variability
**How to avoid:** Use `.optional()` on non-critical fields. Add `.describe()` to every field for AI guidance. Test schema with 10+ different intake scenarios before shipping.
**Warning signs:** High rate of schema validation failures in production logs

### Pitfall 7: Unsaved Plan on Booking Flow
**What goes wrong:** User sees plan, clicks book, and the generated plan is lost (only in client state)
**Why it happens:** Plan stored only in React state, not persisted before transitioning to booking
**How to avoid:** Save generated plan to Supabase `intake_plans` table immediately upon generation completion (via Server Action). Display plan from DB if user returns.
**Warning signs:** Lucas has no plan to review before discovery calls

## Code Examples

### Business Plan Zod Schema
```typescript
// lib/schemas/business-plan.ts
// Source: Vercel AI SDK docs (Output.object pattern)
import { z } from 'zod';

export const businessPlanSchema = z.object({
  goalMirroring: z.string()
    .describe('Restate the client situation in cleaner language. 2-3 sentences showing deep understanding.'),
  bottleneckDiagnosis: z.string()
    .describe('Identify the core bottleneck(s) causing their pain. Be specific to their workflow.'),
  proposedSystemSteps: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
    tools: z.array(z.string()).optional(),
  })).describe('Proposed system architecture steps in order'),
  toolsAndIntegrations: z.array(z.string())
    .describe('Specific tools and integrations needed (e.g., Zapier, Supabase, Claude API)'),
  implementationPhases: z.array(z.object({
    phase: z.string().describe('Phase name: MVP, Hardening, or Reporting'),
    duration: z.string().describe('Estimated duration like "2-3 weeks"'),
    deliverables: z.array(z.string()),
  })).describe('Implementation phases: MVP -> Hardening -> Reporting'),
  risksAndDependencies: z.array(z.string())
    .describe('Key risks and dependencies to flag'),
  estimate: z.object({
    totalRange: z.string().describe('Total cost range like "$5,000 - $12,000"'),
    timeline: z.string().describe('Total timeline like "6-10 weeks"'),
    assumptions: z.array(z.string()).describe('Key assumptions behind the estimate'),
  }),
  nextSteps: z.array(z.string())
    .describe('Clear next steps for the prospect (e.g., "Book a 15-minute discovery call")'),
  recommendedService: z.enum([
    'ai-automation',
    'process-consulting',
    'ongoing-management',
    'training',
  ]).describe('Which of the 4 services best fits their needs'),
});

export type BusinessPlan = z.infer<typeof businessPlanSchema>;
```

### Curated Question Library Structure
```typescript
// lib/data/intake-questions.ts
// Source: Project pattern (lib/data/topics.ts)
export interface IntakeQuestion {
  id: string;
  category: 'business' | 'workflow' | 'stack' | 'scope' | 'pain' | 'timeline' | 'deep';
  text: string;
  inputType: 'buttons' | 'text' | 'slider' | 'multi-select';
  options?: string[];
  sliderConfig?: { min: number; max: number; step: number; labels: [string, string] };
  isRequired: boolean;
  isDeepDive: boolean; // true = only asked after minimum is reached
  priority: number;    // Deterministic fallback ordering
  aiContext: string;    // Helps AI understand when to pick this question
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: 'business-type',
    category: 'business',
    text: 'What does your business do?',
    inputType: 'text',
    isRequired: true,
    isDeepDive: false,
    priority: 1,
    aiContext: 'Always ask first. Establishes context for all follow-up questions.',
  },
  {
    id: 'team-size',
    category: 'business',
    text: 'How big is your team?',
    inputType: 'buttons',
    options: ['Just me', '2-5', '6-20', '21-50', '50+'],
    isRequired: true,
    isDeepDive: false,
    priority: 2,
    aiContext: 'Determines scale of automation needed.',
  },
  // ... ~18 more questions covering all WORK-04 categories
];

export const MIN_QUESTIONS = 6;
export const STAGE_1_CAP = 12;
export const DEEP_DIVE_CAP = 8;
```

### Intake Session Supabase Schema
```sql
-- supabase/migrations/003_intake_sessions.sql
CREATE TABLE intake_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'plan_generated', 'booked', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  plan_generated_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ
);

CREATE TABLE intake_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_display TEXT NOT NULL, -- Human-readable answer
  sequence_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE intake_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  plan_json JSONB NOT NULL,
  recommended_service TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(session_id) -- One plan per session
);

-- Indexes
CREATE INDEX idx_intake_sessions_email ON intake_sessions(email);
CREATE INDEX idx_intake_sessions_status ON intake_sessions(status);
CREATE INDEX idx_intake_answers_session ON intake_answers(session_id);

-- RLS
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_plans ENABLE ROW LEVEL SECURITY;

-- Service role full access (matches project pattern)
CREATE POLICY "Service role intake_sessions" ON intake_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role intake_answers" ON intake_answers
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role intake_plans" ON intake_plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Deny all public access
CREATE POLICY "Deny public intake_sessions" ON intake_sessions
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public intake_answers" ON intake_answers
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public intake_plans" ON intake_plans
  FOR ALL TO anon USING (false);
```

### Lead Notification Email Pattern
```typescript
// lib/email/intake-notification.tsx
// Source: Project pattern (lib/email/welcome-template.tsx)
import { Html, Head, Body, Container, Heading, Text, Section, Hr } from "@react-email/components";

interface IntakeNotificationProps {
  name: string;
  email: string;
  businessDescription: string;
  recommendedService: string;
  planSummary: string;
  answeredQuestions: number;
}

export function IntakeNotificationEmail(props: IntakeNotificationProps) {
  // Follow existing WelcomeEmail pattern with inline styles
  // Notify Lucas with lead details for call prep
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateObject` / `streamObject` standalone | `generateText` / `streamText` with `Output.object()` | AI SDK v6 (Jan 2026) | Unified API; old functions deprecated but still work |
| `experimental_useObject` import path | `experimental_useObject` from `@ai-sdk/react` | AI SDK v6 | Moved from `ai/react` to `@ai-sdk/react` package |
| @calcom/embed-react for React apps | @calcom/embed-core (vanilla JS) for React 19+ | Ongoing (issue #20814) | React package stuck on React 18 peer dep |
| @react-pdf/renderer v3 (React 18 only) | @react-pdf/renderer v4.1+ (React 19 support) | Mid 2025 | Now works with React 19; no workarounds needed |

**Deprecated/outdated:**
- `streamObject` / `generateObject` as standalone imports: Use `streamText` / `generateText` with `output` parameter instead
- `import { useObject } from 'ai/react'`: Now use `import { experimental_useObject as useObject } from '@ai-sdk/react'`
- `@calcom/embed-react` with React 19: Peer dependency not updated; use vanilla JS `@calcom/embed-core` instead

## Open Questions

1. **Shareable Plan URLs**
   - What we know: User left this to Claude's discretion. Supabase `intake_plans` table stores plans by session ID.
   - What's unclear: Whether to expose plan via a public URL (e.g., `/plan/[id]`) or keep it session-only
   - Recommendation: Implement unique URLs (`/work-with-me/plan/[sessionId]`) -- minimal extra work, enables sharing and Lucas can send plan link before calls. Use the session UUID as the URL parameter (unguessable).

2. **Cal.com Embed Style (Inline vs Popup)**
   - What we know: User left this to Claude's discretion. Cal.com supports inline, popup, and floating button.
   - What's unclear: Which style feels most natural after viewing a business plan
   - Recommendation: Inline embed below the plan. Popup feels like an interruption after the user just consumed a plan. Inline keeps them on the same page in the flow.

3. **AI Model Selection and Cost**
   - What we know: Claude Haiku is fast/cheap for question selection; Sonnet is quality for plan generation
   - What's unclear: Exact per-intake cost at scale
   - Recommendation: Estimate ~$0.02-0.05 per question selection (Haiku) + ~$0.10-0.30 per plan generation (Sonnet) = ~$0.30-0.80 per full intake. Very reasonable for consulting lead generation.

4. **Deterministic Fallback for Question Selection**
   - What we know: AI latency must be < 2 seconds per WORK-09
   - What's unclear: How often Haiku will exceed 2s in practice
   - Recommendation: Implement priority-ordered fallback in the question library. If AI call takes > 1.5s, abort and use next-highest-priority unasked question. Log fallback events for monitoring.

5. **Session Recovery on Page Refresh**
   - What we know: Answers saved to Supabase after each question; session ID exists
   - What's unclear: How to link browser session to DB session on return
   - Recommendation: Store session ID in sessionStorage. On page load, check for existing session and offer "Resume your assessment" with a summary of prior answers. Not critical for v1 but improves UX.

## Sources

### Primary (HIGH confidence)
- [AI SDK v6 Official Docs - Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) - streamText + Output.object() pattern, schema validation
- [AI SDK v6 Official Docs - Object Generation UI](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation) - useObject hook API, partial streaming
- [AI SDK v6 Cookbook - Next.js Stream Object](https://ai-sdk.dev/cookbook/next/stream-object) - Complete Route Handler + Client pattern
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Installation, setup, model IDs
- [AI SDK v6 Blog Post](https://vercel.com/blog/ai-sdk-6) - v6 release details, migration from v5
- [React-PDF Compatibility](https://react-pdf.org/compatibility) - React 19 support confirmed since v4.1.0

### Secondary (MEDIUM confidence)
- [Cal.com React 19 Issue #20814](https://github.com/calcom/cal.com/issues/20814) - Confirmed peer dep conflict, no fix yet
- [Cal.com Embed Help](https://cal.com/help/embedding/adding-embed) - Inline, popup, floating embed types
- [Cal.com embed-core npm](https://www.npmjs.com/package/@calcom/embed-core) - Vanilla JS alternative
- [AI SDK npm](https://www.npmjs.com/package/ai) - v6.0.97 latest as of 2026-02-20

### Tertiary (LOW confidence)
- Per-intake AI cost estimates based on Anthropic pricing (need validation with actual usage)
- Haiku latency < 500ms claim (based on general reports, should be benchmarked in practice)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - AI SDK v6, @react-pdf/renderer v4.3, Cal.com embed-core all verified via official docs
- Architecture: HIGH - Patterns follow established project conventions (Server/Client split, Supabase service_role, Zod schemas, Framer Motion)
- Pitfalls: HIGH - Cal.com React 19 issue confirmed via GitHub; AI SDK v5/v6 confusion documented in migration guide; PDF SSR issues well-documented
- Question library design: MEDIUM - No established "smart intake" library pattern exists; design is based on project conventions and AI SDK capabilities
- Cost estimates: LOW - Based on published Anthropic pricing, not validated with actual intake sessions

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (30 days -- AI SDK and Cal.com embed are actively evolving)
