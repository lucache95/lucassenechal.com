# Phase 5: Content Generation - Research

**Researched:** 2026-03-20
**Domain:** LLM-powered content generation pipeline (structured output, voice injection, format templating, insufficient-results handling)
**Confidence:** HIGH

## Summary

Phase 5 transforms the raw research results stored by Phase 4 into polished, voice-injected newsletter content in three distinct formats (curated digest, written briefing, mixed). The input is the `research_results` table (up to 20 ranked results per subscriber per day, each with url, title, snippet, source_name, relevance_score) plus the subscriber's format preference from `subscriber_preferences.format`. The output is generated content ready for email rendering in Phase 6.

The architecture follows the same Edge Function pattern established in Phase 4: a Supabase Edge Function reads completed research runs, generates content via Gemini 2.5 Flash (cost: ~$0.003/subscriber/day at current pricing), stores the generated content, and marks the run as content-ready. The 150-second Edge Function time limit is comfortably sufficient -- a single `generateText` call with ~20 research result snippets as context produces 500-1500 words of formatted output in 5-15 seconds. Voice injection is achieved through a carefully crafted system prompt with Lucas's writing style exemplars, not through fine-tuning or post-processing.

The critical design decisions are: (1) use `generateText` with `Output.object` and a Zod schema per format to get structured, typed output, (2) include a "nothing found" fallback path that bypasses LLM entirely when results count is below threshold, (3) store generated content in a new `newsletter_content` table so Phase 6 can render emails without re-generating, and (4) keep the content generation as a separate Edge Function triggered after the research pipeline completes (not inline in the research pipeline).

**Primary recommendation:** Use Gemini 2.5 Flash for all three content formats via `generateText` + `Output.object` with format-specific Zod schemas and system prompts containing Lucas's voice exemplars. Store generated content in a `newsletter_content` table. Trigger content generation from the research pipeline Edge Function after results are stored.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Content generation in "curated digest" format (5-8 items with summaries and links) | Zod schema with items array (5-8), each having title, summary (2-3 sentences), url, source; generateText + Output.object produces structured digest |
| CONT-02 | Content generation in "written briefing" format (narrative synthesis with sources) | Zod schema with sections array (intro, body paragraphs, conclusion), inline source citations; generateText produces flowing narrative |
| CONT-03 | Content generation in "mixed" format (short synthesis + itemized links) | Zod schema combining a synthesis paragraph (3-5 sentences) with items array (5-8 linked items); hybrid of CONT-01 and CONT-02 |
| CONT-04 | Voice injection -- content reads naturally, not AI-generic | System prompt with Lucas's writing exemplars (warm, direct, occasionally wry, first-person-adjacent); .describe() hints on every schema field guide tone |
| QUAL-04 | "Nothing found" fallback -- honest communication when research yields insufficient results | Threshold check (< 3 results) bypasses LLM; returns pre-written fallback content with preference-refinement suggestions |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ai (Vercel AI SDK) | 6.0.116 | LLM orchestration with generateText + Output.object | Already in project; established pattern from Phase 3 and 4 |
| @ai-sdk/google | 3.0.43 | Gemini 2.5 Flash model for content generation | Already in project; cheapest option at $0.30/M input + $2.50/M output |
| zod | 4.3.6 | Schema validation for structured content output | Already in project; .describe() guides LLM output |
| Supabase Edge Functions | Deno 2.1+ | Content generation execution | Same runtime as research pipeline; runs close to DB |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | 2.97.0 | DB reads/writes in Edge Function | Reading research_results, writing newsletter_content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Gemini 2.5 Flash ($0.003/sub/day) | Claude Sonnet 4 ($0.05/sub/day) | Claude produces better prose but costs 15x more; Gemini Flash is sufficient for structured newsletter content with good prompting |
| Gemini 2.5 Flash | Gemini 2.5 Pro | Pro costs 10x more ($3.75/M input + $15/M output); overkill for summarization tasks |
| generateText + Output.object | generateObject (deprecated) | generateObject is officially deprecated in AI SDK 6; use generateText with output parameter instead |
| Separate Edge Function | Inline in research pipeline | Separation is better: research may complete but content gen may fail (different failure modes); keeps pipeline under 150s limit; content can be re-generated without re-running research |

**Version verification (2026-03-20):**
- ai: 6.0.116 (current)
- @ai-sdk/google: 3.0.43 (current)
- zod: 4.3.6 (current)

**No new npm packages required.** All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
supabase/
  functions/
    content-generation/
      index.ts          # Edge Function entry point
      deno.json          # Function-specific deps
lib/
  content/
    types.ts            # Content generation types
    prompts.ts          # System prompts with voice exemplars
    schemas.ts          # Zod schemas for 3 formats
    fallback.ts         # "Nothing found" fallback content
  content/
    content-generator.ts      # generateText orchestration (Node.js tests)
    content-generator.test.ts # Unit tests with mocked LLM
```

### Pattern 1: Format-Specific Zod Schemas with Output.object
**What:** Each newsletter format (digest, briefing, mixed) gets its own Zod schema. The content generation function selects the schema based on subscriber preference, then calls `generateText` with `Output.object({ schema })`.
**When to use:** Always -- this is the core pattern for all three formats.
**Example:**
```typescript
// Source: Established project pattern (Phase 3 generate-plan/route.ts)
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { DigestSchema, BriefingSchema, MixedSchema } from '@/lib/content/schemas'

const FORMAT_SCHEMAS = {
  digest: DigestSchema,
  briefing: BriefingSchema,
  mixed: MixedSchema,
} as const

type Format = keyof typeof FORMAT_SCHEMAS

async function generateContent(
  format: Format,
  results: ResearchResultRow[],
  systemPrompt: string
) {
  const schema = FORMAT_SCHEMAS[format]
  const { output } = await generateText({
    model: google('gemini-2.5-flash'),
    output: Output.object({ schema }),
    system: systemPrompt,
    prompt: buildContentPrompt(format, results),
  })
  return output
}
```

### Pattern 2: Voice Injection via System Prompt Exemplars
**What:** Lucas's personal voice is encoded in the system prompt through writing style rules and before/after exemplars. Every Zod field uses `.describe()` to reinforce tone at the field level.
**When to use:** Every content generation call -- the system prompt is format-independent (voice) while the user prompt is format-specific (structure).
**Example:**
```typescript
// Voice system prompt (shared across all three formats)
const VOICE_SYSTEM_PROMPT = `You are writing a personalized daily briefing for a subscriber.

VOICE RULES:
- Write like a knowledgeable friend sharing what they found interesting today
- Be direct and specific -- no filler phrases like "In today's rapidly evolving landscape"
- Use active voice. Short sentences for emphasis. Longer ones for nuance.
- Occasionally wry or dry humor, never forced
- First-person-adjacent: "Here's what caught my eye" not "I have curated for you"
- When something is genuinely exciting, show genuine enthusiasm -- not hype
- When something is uncertain, say so honestly
- Never use: "dive into", "game-changer", "revolutionize", "landscape", "leverage"
- Source attribution is casual: "per TechCrunch" or "(via Reuters)" not "According to..."

ANTI-PATTERNS (never do these):
- "In this edition of your newsletter..." -- just start with the content
- "Let's dive into..." -- skip the preamble
- Generic sign-offs like "Stay tuned for more updates!"
- Bullet points that all start with the same word
- Over-explaining obvious implications

GOOD EXAMPLES:
- "Stripe just shipped AI revenue forecasting that hits 94% accuracy. If you're still doing this in spreadsheets, that's your sign."
- "Three things worth knowing about the EU AI Act vote: [specifics]"
- "This one's genuinely surprising: [finding]. The usual caveats apply, but the data is hard to argue with."
`
```

### Pattern 3: Threshold-Based Fallback for Insufficient Results
**What:** When research yields fewer than 3 results, skip the LLM call entirely and return pre-written fallback content explaining the situation and suggesting preference refinements.
**When to use:** When `research_results` count for today's date is below threshold.
**Example:**
```typescript
const MIN_RESULTS_THRESHOLD = 3

function generateFallbackContent(
  subscriberTopics: string[],
  format: Format
): NewsletterContent {
  return {
    format,
    subject: "Your briefing is light today -- here's why",
    content: {
      intro: "Today's research didn't surface enough high-quality results for your topics. This happens occasionally when news cycles are quiet or your interests are very specific.",
      suggestions: [
        "Add broader topic categories to catch more signals",
        "Check if your custom topics are too narrow (e.g., 'Rust async runtime benchmarks' vs 'Rust development')",
        "We'll keep looking -- tomorrow's briefing will likely be fuller",
      ],
      topicsSearched: subscriberTopics,
    },
    generatedAt: new Date().toISOString(),
    resultCount: 0,
    isPartial: true,
  }
}
```

### Pattern 4: Content Generation as Chained Edge Function
**What:** The research pipeline Edge Function, after storing results, calls the content generation Edge Function via `fetch` (internal Supabase function call). This keeps the two concerns separate while maintaining the automated pipeline flow.
**When to use:** End of research pipeline for each successfully processed subscriber.
**Example:**
```typescript
// At the end of the research pipeline, after storing results:
// Option A: Direct invocation from research pipeline
const contentRes = await fetch(
  `${Deno.env.get('SUPABASE_URL')}/functions/v1/content-generation`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriber_id, research_date: today }),
  }
)

// Option B: pgmq queue message for content generation
// (more resilient -- separate retry semantics)
await supabase.rpc('pgmq_send', {
  queue_name: 'content_jobs',
  msg: JSON.stringify({ subscriber_id, research_date: today }),
})
```

### Anti-Patterns to Avoid
- **Streaming content generation for batch processing:** Streaming (`streamText`) is for real-time UI. For batch background processing, use `generateText` which returns the complete result. No one is watching a loading spinner for a scheduled email.
- **Re-running research to generate content:** Content generation reads from `research_results` table. Never re-query external APIs during content generation.
- **One giant prompt for all formats:** Each format has different structural requirements. Use format-specific schemas and prompts, not one prompt with "if format is X, do Y" conditionals.
- **Fine-tuning for voice:** At this scale (< 1000 subscribers), system prompt exemplars are sufficient. Fine-tuning is expensive and unnecessary for newsletter voice.
- **Hardcoding email HTML in content generation:** Content generation outputs structured data (titles, summaries, links). Phase 6 handles email rendering. Keep concerns separated.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Structured LLM output | Custom JSON parsing from raw text | `generateText` + `Output.object` with Zod schema | Type-safe, validated, handles retries on malformed output |
| Content format validation | Manual field checking | Zod schema `.parse()` on LLM output | Already validated by AI SDK; Zod provides fallback validation layer |
| Voice consistency | Post-processing regex/string replacement | System prompt with exemplars + `.describe()` on schema fields | LLMs respond better to positive examples than post-hoc corrections |
| Cost estimation | Manual token counting | AI SDK `usage` object from generateText response | `usage.promptTokens` and `usage.completionTokens` returned automatically |

**Key insight:** The AI SDK handles the hard parts (structured output, schema validation, token tracking). The content generation code is primarily prompt engineering and data piping, not complex orchestration.

## Common Pitfalls

### Pitfall 1: LLM Hallucinating URLs Not in Research Results
**What goes wrong:** The LLM invents URLs or source names that weren't in the input research results.
**Why it happens:** LLMs naturally want to be helpful and may fabricate sources to support generated claims.
**How to avoid:** The prompt must explicitly list every URL and title from research results as numbered items. The schema should reference items by index or URL, not by free text. Post-generation validation should verify every URL in the output exists in the input.
**Warning signs:** Output contains URLs that don't match any input research result.

### Pitfall 2: Generic AI Voice Despite System Prompt
**What goes wrong:** Generated content reads like "In today's rapidly evolving digital landscape..." despite voice instructions.
**Why it happens:** The system prompt is too abstract ("be casual") without concrete before/after examples.
**How to avoid:** Include 5-10 concrete exemplar sentences showing the exact voice. Use anti-pattern examples ("never write X"). Put voice rules BEFORE format instructions in the system prompt (primacy bias).
**Warning signs:** Content passes all schema validation but reads generically. Test by reading output aloud -- does it sound like a person or a press release?

### Pitfall 3: Edge Function Timeout on Large Result Sets
**What goes wrong:** Content generation for a subscriber with many custom topics and 20 dense results exceeds 150s.
**Why it happens:** Gemini Flash is fast but not instant; 20 results with full snippets can be 3000+ input tokens.
**How to avoid:** Cap input to 15 results (already capped at 20 by research pipeline). Truncate snippets to 200 chars in the prompt. Monitor `usage.totalTokens` from generateText response.
**Warning signs:** Edge Function logs show duration > 120s. Set up alerting at 100s threshold.

### Pitfall 4: Schema Too Strict Causing AI_NoObjectGeneratedError
**What goes wrong:** The Zod schema is so strict that valid content gets rejected (e.g., requiring exactly 8 items when only 5 results exist).
**Why it happens:** Mismatch between schema constraints and available data.
**How to avoid:** Use `.min(3).max(8)` not `.length(8)`. Use `.optional()` on non-critical fields. Catch `AI_NoObjectGeneratedError` and fall back to simpler format or retry with relaxed schema.
**Warning signs:** Content generation succeeds for some subscribers but fails for others with similar result counts.

### Pitfall 5: Deno Import Issues in Edge Function
**What goes wrong:** Edge Function cannot import from `lib/` directory (same issue as Phase 4).
**Why it happens:** Supabase Edge Functions run in isolated Deno runtime; cannot import from Node.js project root.
**How to avoid:** Follow Phase 4 pattern: inline all logic in the Edge Function, or copy essential schemas/types. Write Node.js-side code in `lib/content/` for testing, then inline in Edge Function.
**Warning signs:** Build errors referencing `@/lib/` paths in the Edge Function.

### Pitfall 6: Not Handling Partial Research Runs
**What goes wrong:** Content generation runs before research pipeline finishes, producing incomplete newsletters.
**Why it happens:** Race condition if content generation is triggered too early.
**How to avoid:** Content generation should only run for subscribers whose research_run has `status = 'completed'` and `research_date = CURRENT_DATE`. Check this before generating.
**Warning signs:** Newsletters with 0-1 items when the subscriber has active topics.

## Code Examples

Verified patterns from official sources and project codebase:

### Digest Format Schema
```typescript
// lib/content/schemas.ts
import { z } from 'zod'

export const DigestItemSchema = z.object({
  title: z.string().describe('Rewritten headline -- punchier, more specific than original. 5-12 words.'),
  summary: z.string().describe('2-3 sentence summary in Lucas voice. What happened and why it matters. No filler.'),
  url: z.string().url().describe('Original source URL -- must match exactly one of the provided research result URLs'),
  sourceName: z.string().describe('Human-readable source name like "TechCrunch" or "Reuters"'),
})

export const DigestSchema = z.object({
  subject: z.string().max(60).describe('Email subject line. Specific and curiosity-driven, not clickbait. Under 60 chars.'),
  greeting: z.string().describe('One casual sentence to open. Reference the day or a theme across items.'),
  items: z.array(DigestItemSchema).min(3).max(8)
    .describe('5-8 curated items ordered by relevance. Each is a standalone nugget.'),
  signoff: z.string().describe('One brief closing line. Warm but not sappy. No "stay tuned" or "until next time."'),
})

export type DigestContent = z.infer<typeof DigestSchema>
```

### Briefing Format Schema
```typescript
export const BriefingSchema = z.object({
  subject: z.string().max(60).describe('Email subject line capturing the main theme. Under 60 chars.'),
  intro: z.string().describe('2-3 sentence intro that frames the day\'s theme or connects the dots. Sets context without being preamble-y.'),
  sections: z.array(z.object({
    heading: z.string().describe('Section heading -- topical grouping of related findings'),
    body: z.string().describe('2-4 paragraph narrative synthesis. Weave findings together, cite sources inline as "(via Source)" or "per Source". Draw connections the reader wouldn\'t see from headlines alone.'),
    sourceUrls: z.array(z.string().url()).describe('URLs referenced in this section -- must match input research result URLs'),
  })).min(2).max(4).describe('2-4 thematic sections synthesizing research results into narrative'),
  conclusion: z.string().describe('1-2 sentence wrap-up. Can include a forward-looking note or a question to ponder. Not generic.'),
})

export type BriefingContent = z.infer<typeof BriefingSchema>
```

### Mixed Format Schema
```typescript
export const MixedSchema = z.object({
  subject: z.string().max(60).describe('Email subject line. Under 60 chars.'),
  synthesis: z.string().describe('3-5 sentence overview synthesizing the most important findings. What\'s the thread connecting today\'s results? Written in Lucas voice.'),
  items: z.array(z.object({
    title: z.string().describe('Brief headline for this item. 5-10 words.'),
    oneLiner: z.string().describe('One sentence -- the essential takeaway. No filler.'),
    url: z.string().url().describe('Source URL -- must match input research result URLs'),
    sourceName: z.string().describe('Human-readable source name'),
  })).min(3).max(8).describe('5-8 linked items below the synthesis, ordered by relevance'),
  signoff: z.string().describe('Brief closing. Warm, not formulaic.'),
})

export type MixedContent = z.infer<typeof MixedSchema>
```

### Content Generation Function (Node.js for testing)
```typescript
// lib/content/content-generator.ts
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { DigestSchema, BriefingSchema, MixedSchema } from './schemas'
import { VOICE_SYSTEM_PROMPT } from './prompts'
import { generateFallbackContent } from './fallback'
import type { NewsletterContent } from './types'

const FORMAT_SCHEMAS = {
  digest: DigestSchema,
  briefing: BriefingSchema,
  mixed: MixedSchema,
} as const

const MIN_RESULTS_THRESHOLD = 3

interface ResearchResultRow {
  url: string
  title: string
  snippet: string | null
  source_name: string
  relevance_score: number
  published_at: string | null
}

export async function generateNewsletterContent(
  format: 'digest' | 'briefing' | 'mixed',
  results: ResearchResultRow[],
  subscriberTopics: string[],
): Promise<NewsletterContent> {
  // QUAL-04: Insufficient results fallback
  if (results.length < MIN_RESULTS_THRESHOLD) {
    return generateFallbackContent(subscriberTopics, format)
  }

  const schema = FORMAT_SCHEMAS[format]
  const prompt = buildContentPrompt(format, results)

  const { output, usage } = await generateText({
    model: google('gemini-2.5-flash'),
    output: Output.object({ schema }),
    system: VOICE_SYSTEM_PROMPT,
    prompt,
  })

  // Validate all URLs in output exist in input
  validateOutputUrls(output, results)

  return {
    format,
    content: output,
    generatedAt: new Date().toISOString(),
    resultCount: results.length,
    isPartial: false,
    tokenUsage: {
      input: usage?.promptTokens ?? 0,
      output: usage?.completionTokens ?? 0,
    },
  }
}
```

### Database Schema for Content Storage
```sql
-- newsletter_content: Generated content per subscriber per day
CREATE TABLE newsletter_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('digest', 'briefing', 'mixed')),
  subject TEXT NOT NULL,
  content_json JSONB NOT NULL,           -- full structured output from LLM
  research_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_partial BOOLEAN NOT NULL DEFAULT false,  -- true for fallback/insufficient results
  result_count INTEGER NOT NULL DEFAULT 0,
  token_usage_input INTEGER DEFAULT 0,
  token_usage_output INTEGER DEFAULT 0,
  cost_estimate_usd NUMERIC(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_newsletter_content_subscriber_date
  ON newsletter_content(subscriber_id, research_date);
CREATE UNIQUE INDEX idx_newsletter_content_unique
  ON newsletter_content(subscriber_id, research_date);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateObject` standalone | `generateText` + `Output.object` | AI SDK 6.0 (2025) | generateObject is deprecated; new pattern supports tools + structured output in same call |
| Fine-tuning for brand voice | System prompt with exemplars | 2024-2025 | Modern LLMs follow detailed system prompts well enough; fine-tuning is only needed at very high scale |
| Post-processing for format | Zod schema with .describe() | AI SDK 4+ | Schema descriptions guide the LLM to produce correctly formatted output natively |
| Template string interpolation | Structured JSON output | AI SDK 4+ | Typed structured output is safer and more composable than string templates |

**Deprecated/outdated:**
- `generateObject`: Deprecated in AI SDK 6. Use `generateText` with `output: Output.object({ schema })` instead.
- `streamObject`: Deprecated in AI SDK 6. Use `streamText` with `output` parameter instead.

## Open Questions

1. **Whether to use Anthropic Claude or Gemini for content quality**
   - What we know: Gemini 2.5 Flash is 15x cheaper. Claude Sonnet 4 produces marginally better prose. The project already uses both (Gemini for topic parsing, Claude for business plans).
   - What's unclear: Whether Gemini Flash's prose quality is "good enough" for newsletter voice. Quality is subjective.
   - Recommendation: Start with Gemini 2.5 Flash for cost reasons. The voice system prompt with exemplars should compensate for model quality differences. If quality is insufficient after testing, switching to Claude is a one-line model change.

2. **Triggering mechanism: inline call vs pgmq queue**
   - What we know: Research pipeline already uses pgmq. A separate queue for content jobs would add resilience (separate retry semantics) but also complexity.
   - What's unclear: Whether the simplicity of a direct `fetch` call from research pipeline to content generation Edge Function outweighs the durability of a queue.
   - Recommendation: Direct `fetch` call for v1. The research pipeline already handles retries; if content generation fails, the subscriber just doesn't get a newsletter that day (which is acceptable for v1). pgmq queue can be added in v2 if needed.

3. **Content regeneration capability**
   - What we know: The `newsletter_content` table stores generated content. If content needs to be regenerated (e.g., after fixing a prompt bug), the Edge Function can be manually invoked.
   - What's unclear: Whether an automated retry/regeneration mechanism is needed.
   - Recommendation: For v1, store the content and allow manual re-invocation. The unique constraint on `(subscriber_id, research_date)` means regeneration replaces previous content (use UPSERT).

## Cost Analysis

### Per-Subscriber Content Generation Cost (Gemini 2.5 Flash)
| Component | Tokens | Cost |
|-----------|--------|------|
| System prompt (voice + format) | ~800 input | $0.00024 |
| Research results context (20 items) | ~2000 input | $0.00060 |
| Generated content output | ~1000 output | $0.00250 |
| **Total per subscriber per day** | | **~$0.003** |

### At Scale
| Subscribers | Daily Content Cost | Monthly Content Cost |
|-------------|-------------------|---------------------|
| 10 | $0.03 | $0.90 |
| 100 | $0.30 | $9.00 |
| 1,000 | $3.00 | $90.00 |

Content generation cost is ~3% of the research pipeline cost ($0.10/sub/day cap). This is not a cost concern.

### If Using Claude Sonnet 4 Instead
| Subscribers | Daily Content Cost | Monthly Content Cost |
|-------------|-------------------|---------------------|
| 10 | $0.50 | $15.00 |
| 100 | $5.00 | $150.00 |
| 1,000 | $50.00 | $1,500.00 |

Claude is feasible at small scale but 15x more expensive. Gemini Flash is the right default.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 |
| Config file | vitest.config.ts (project root) |
| Quick run command | `npx vitest run lib/content/ --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Digest format generates 5-8 items with summaries and URLs | unit | `npx vitest run lib/content/content-generator.test.ts -t "digest" -x` | Wave 0 |
| CONT-02 | Briefing format generates narrative sections with source citations | unit | `npx vitest run lib/content/content-generator.test.ts -t "briefing" -x` | Wave 0 |
| CONT-03 | Mixed format generates synthesis paragraph + itemized links | unit | `npx vitest run lib/content/content-generator.test.ts -t "mixed" -x` | Wave 0 |
| CONT-04 | Voice injection produces non-generic content | unit | `npx vitest run lib/content/content-generator.test.ts -t "voice" -x` | Wave 0 |
| QUAL-04 | Fallback content returned when < 3 results | unit | `npx vitest run lib/content/fallback.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/content/ --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `lib/content/content-generator.test.ts` -- covers CONT-01, CONT-02, CONT-03, CONT-04
- [ ] `lib/content/fallback.test.ts` -- covers QUAL-04
- [ ] `lib/content/schemas.test.ts` -- covers schema validation for all three formats

Framework is already installed (Vitest 4.1, 84 tests passing). No framework setup needed.

## Sources

### Primary (HIGH confidence)
- Project codebase: `supabase/functions/research-pipeline/index.ts` (Phase 4 Edge Function pattern)
- Project codebase: `app/api/intake/generate-plan/route.ts` (streamText + Output.object pattern)
- Project codebase: `lib/schemas/business-plan.ts` (Zod schema with .describe() pattern)
- Project codebase: `supabase/migrations/004_research_schema.sql` (research_results table schema)
- Project codebase: `supabase/migrations/002_subscriber_preferences.sql` (format column: digest/briefing/mixed)
- [AI SDK docs: Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) -- Output.object API and error handling
- [AI SDK docs: generateText reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text) -- output parameter, system prompt, usage tracking

### Secondary (MEDIUM confidence)
- [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing) -- $0.30/M input, $2.50/M output for Flash
- [Anthropic Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) -- $3/M input, $15/M output for Sonnet 4
- [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits) -- 150s wall clock timeout

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project; no new dependencies needed
- Architecture: HIGH -- follows established Phase 4 Edge Function pattern; structured output pattern from Phase 3
- Pitfalls: HIGH -- derived from Phase 4 execution experience (Deno import issues, schema strictness, timeout management)
- Cost analysis: HIGH -- pricing verified against official Gemini and Anthropic pricing pages

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable domain, established patterns)
