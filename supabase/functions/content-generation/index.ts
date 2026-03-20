import { createClient } from 'npm:@supabase/supabase-js@2'

// NOTE: In Deno Edge Functions, lib/ modules are NOT directly importable.
// All content generation logic is inlined here from lib/content/*.ts sources.
// When the project scales, consider a shared module approach.
// For v1, the Edge Function contains the full pipeline inline.

// ============================================================
// Types — Inlined from lib/content/types.ts
// ============================================================

type ContentFormat = 'digest' | 'briefing' | 'mixed'

interface ResearchResultRow {
  url: string
  title: string
  snippet: string | null
  source_name: string
  relevance_score: number
  published_at: string | null
}

interface NewsletterContent {
  format: ContentFormat
  subject: string
  content: unknown
  generatedAt: string
  resultCount: number
  isPartial: boolean
  tokenUsage?: {
    input: number
    output: number
  }
}

interface FallbackContent {
  intro: string
  suggestions: string[]
  topicsSearched: string[]
}

// ============================================================
// Voice Prompt — Inlined from lib/content/prompts.ts
// ============================================================

const VOICE_SYSTEM_PROMPT = `You are writing a personalized daily briefing for a subscriber.

VOICE RULES:
- Write like a knowledgeable friend sharing what they found interesting today
- Be direct and specific -- no filler phrases like "In today's rapidly evolving landscape"
- Use active voice. Short sentences for emphasis. Longer ones for nuance.
- Occasionally wry or dry humor, never forced
- First-person-adjacent: "Here's what caught my eye" not "I have curated for you"
- When something is genuinely exciting, show genuine enthusiasm -- not hype
- When something is uncertain, say so honestly
- Never use: "dive into", "game-changer", "revolutionize", "landscape", "leverage", "moving forward", "at the end of the day"
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

CRITICAL: Every URL in your output MUST come from the provided research results. Do not invent or hallucinate any URLs. Use only the exact URLs listed in the input.`

const FORMAT_INSTRUCTIONS: Record<ContentFormat, string> = {
  digest: `FORMAT: CURATED DIGEST
Generate a digest with 5-8 curated items. Each item needs:
- A rewritten headline (punchier than the original, 5-12 words)
- A 2-3 sentence summary explaining what happened and why it matters
- The original source URL (must match one from the list below)
- The source name (human-readable, e.g., "TechCrunch")

Also include a brief greeting (one sentence, no "Good morning") and a warm sign-off (no "stay tuned").`,

  briefing: `FORMAT: WRITTEN BRIEFING
Generate a narrative briefing with 2-4 thematic sections. Each section needs:
- A topical heading grouping related findings
- A 2-4 paragraph synthesis weaving findings together with inline citations "(via Source)" or "per Source"
- A list of source URLs referenced (must match from the list below)

Also include a 2-3 sentence intro framing the day's theme and a 1-2 sentence conclusion.
Draw connections the reader would not see from headlines alone.`,

  mixed: `FORMAT: MIXED (SYNTHESIS + LINKS)
Generate a synthesis paragraph (3-5 sentences) identifying the thread connecting today's results, followed by 5-8 linked items. Each item needs:
- A brief headline (5-10 words)
- One sentence essential takeaway
- The source URL (must match from the list below)
- The source name

Also include a warm sign-off.`,
}

function buildContentPrompt(
  format: ContentFormat,
  results: ResearchResultRow[]
): string {
  const formatInstructions = FORMAT_INSTRUCTIONS[format]

  const resultsList = results
    .map((r, i) => {
      const snippet = r.snippet ? r.snippet.slice(0, 200) : 'No snippet available'
      return `[${i + 1}] "${r.title}"
    URL: ${r.url}
    Source: ${r.source_name}
    Snippet: ${snippet}
    Relevance: ${r.relevance_score.toFixed(2)}`
    })
    .join('\n\n')

  return `${formatInstructions}

RESEARCH RESULTS (use ONLY these URLs):
${resultsList}

Generate the newsletter content now. Remember: only use URLs from the list above.`
}

// ============================================================
// Fallback — Inlined from lib/content/fallback.ts
// ============================================================

const MIN_RESULTS_THRESHOLD = 3

function generateFallbackContent(
  subscriberTopics: string[],
  format: ContentFormat
): NewsletterContent {
  const content: FallbackContent = {
    intro: "Today's research didn't surface enough high-quality results for your topics. This happens occasionally when news cycles are quiet or your interests are very specific.",
    suggestions: [
      'Add broader topic categories to catch more signals',
      "Check if your custom topics are too narrow (e.g., 'Rust async runtime benchmarks' vs 'Rust development')",
      "We'll keep looking -- tomorrow's briefing will likely be fuller",
    ],
    topicsSearched: subscriberTopics,
  }

  return {
    format,
    subject: "Your briefing is light today -- here's why",
    content,
    generatedAt: new Date().toISOString(),
    resultCount: 0,
    isPartial: true,
  }
}

// ============================================================
// URL Validation — Inlined from lib/content/content-generator.ts
// ============================================================

/**
 * Validates that every URL in the LLM output exists in the input research results.
 * Prevents hallucinated URLs from reaching subscribers.
 * Returns array of invalid URLs (empty = all valid).
 */
function validateOutputUrls(
  output: unknown,
  inputResults: ResearchResultRow[]
): string[] {
  const inputUrls = new Set(inputResults.map(r => r.url))
  const outputUrls: string[] = []

  const obj = output as Record<string, unknown>

  // Digest and Mixed formats: items[].url
  if (Array.isArray(obj.items)) {
    for (const item of obj.items) {
      if (typeof item === 'object' && item !== null && 'url' in item) {
        outputUrls.push((item as { url: string }).url)
      }
    }
  }

  // Briefing format: sections[].sourceUrls[]
  if (Array.isArray(obj.sections)) {
    for (const section of obj.sections) {
      if (typeof section === 'object' && section !== null && 'sourceUrls' in section) {
        const urls = (section as { sourceUrls: string[] }).sourceUrls
        if (Array.isArray(urls)) {
          outputUrls.push(...urls)
        }
      }
    }
  }

  return outputUrls.filter(url => !inputUrls.has(url))
}

// ============================================================
// Gemini 2.5 Flash cost rates (per million tokens)
// ============================================================
const COST_PER_M_INPUT = 0.30  // $0.30 per million input tokens
const COST_PER_M_OUTPUT = 2.50 // $2.50 per million output tokens

function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * COST_PER_M_INPUT +
         (outputTokens / 1_000_000) * COST_PER_M_OUTPUT
}

// ============================================================
// Edge Function Handler
// ============================================================

Deno.serve(async (req) => {
  try {
    // Parse request body
    const { subscriber_id, research_date } = await req.json()

    if (!subscriber_id) {
      return new Response(
        JSON.stringify({ error: 'subscriber_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const targetDate = research_date || new Date().toISOString().split('T')[0]

    console.log(`Content generation started for subscriber ${subscriber_id}, date ${targetDate}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Step 1: Get subscriber format preference
    const { data: prefs } = await supabase
      .from('subscriber_preferences')
      .select('format')
      .eq('subscriber_id', subscriber_id)
      .single()

    const format: ContentFormat = (prefs?.format as ContentFormat) || 'digest'

    // Step 2: Get subscriber topics (for fallback content)
    const { data: topics } = await supabase
      .from('subscriber_topics')
      .select(`
        topic_subtopics (
          name,
          topic_categories ( name )
        )
      `)
      .eq('subscriber_id', subscriber_id)

    const subtopicNames = (topics ?? []).map(
      (t: any) => t.topic_subtopics?.name
    ).filter(Boolean)

    const { data: customTopics } = await supabase
      .from('subscriber_custom_topics')
      .select('description')
      .eq('subscriber_id', subscriber_id)

    const customDescriptions = (customTopics ?? []).map(
      (t: any) => t.description
    )

    const subscriberTopics = [...subtopicNames, ...customDescriptions]

    // Step 3: Get research results for this subscriber + date
    const { data: researchRows, error: researchError } = await supabase
      .from('research_results')
      .select('url, title, snippet, source_name, relevance_score, published_at')
      .eq('subscriber_id', subscriber_id)
      .eq('research_date', targetDate)
      .order('relevance_score', { ascending: false })
      .limit(20)

    if (researchError) {
      console.error(`Failed to fetch research results: ${researchError.message}`)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch research results', detail: researchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results: ResearchResultRow[] = (researchRows ?? []) as ResearchResultRow[]

    // Step 4: Generate content (fallback or LLM)
    let newsletterContent: NewsletterContent

    if (results.length < MIN_RESULTS_THRESHOLD) {
      // Insufficient results -- use pre-written fallback (no LLM call)
      console.log(`Only ${results.length} results for subscriber ${subscriber_id}, using fallback`)
      newsletterContent = generateFallbackContent(subscriberTopics, format)
    } else {
      // Dynamic imports for AI SDK (Deno Edge Function pattern)
      const { generateText, Output } = await import('npm:ai@6')
      const { google } = await import('npm:@ai-sdk/google@3')
      const { z } = await import('npm:zod@4')

      // Zod schemas — Inlined from lib/content/schemas.ts
      const DigestItemSchema = z.object({
        title: z.string().describe('Rewritten headline -- punchier, more specific than original. 5-12 words.'),
        summary: z.string().describe('2-3 sentence summary in Lucas voice. What happened and why it matters. No filler.'),
        url: z.string().url().describe('Original source URL -- must match exactly one of the provided research result URLs'),
        sourceName: z.string().describe('Human-readable source name like "TechCrunch" or "Reuters"'),
      })

      const DigestSchema = z.object({
        subject: z.string().max(60).describe('Email subject line. Specific and curiosity-driven, not clickbait. Under 60 chars.'),
        greeting: z.string().describe('One casual sentence to open. Reference the day or a theme across items. No "Good morning" or "Happy Tuesday."'),
        items: z.array(DigestItemSchema).min(3).max(8)
          .describe('5-8 curated items ordered by relevance. Each is a standalone nugget.'),
        signoff: z.string().describe('One brief closing line. Warm but not sappy. No "stay tuned" or "until next time."'),
      })

      const BriefingSchema = z.object({
        subject: z.string().max(60).describe('Email subject line capturing the main theme. Under 60 chars.'),
        intro: z.string().describe("2-3 sentence intro that frames the day's theme or connecting dots. Sets context without being preamble-y."),
        sections: z.array(z.object({
          heading: z.string().describe('Section heading -- topical grouping of related findings'),
          body: z.string().describe('2-4 paragraph narrative synthesis. Weave findings together, cite sources inline as "(via Source)" or "per Source". Draw connections the reader would not see from headlines alone.'),
          sourceUrls: z.array(z.string().url()).describe('URLs referenced in this section -- must match input research result URLs'),
        })).min(2).max(4).describe('2-4 thematic sections synthesizing research results into narrative'),
        conclusion: z.string().describe('1-2 sentence wrap-up. Can include a forward-looking note or a question to ponder. Not generic.'),
      })

      const MixedSchema = z.object({
        subject: z.string().max(60).describe('Email subject line. Under 60 chars.'),
        synthesis: z.string().describe("3-5 sentence overview synthesizing the most important findings. What's the thread connecting today's results? Written in Lucas voice."),
        items: z.array(z.object({
          title: z.string().describe('Brief headline for this item. 5-10 words.'),
          oneLiner: z.string().describe('One sentence -- the essential takeaway. No filler.'),
          url: z.string().url().describe('Source URL -- must match input research result URLs'),
          sourceName: z.string().describe('Human-readable source name'),
        })).min(3).max(8).describe('5-8 linked items below the synthesis, ordered by relevance'),
        signoff: z.string().describe('Brief closing. Warm, not formulaic.'),
      })

      const FORMAT_SCHEMAS: Record<ContentFormat, any> = {
        digest: DigestSchema,
        briefing: BriefingSchema,
        mixed: MixedSchema,
      }

      const schema = FORMAT_SCHEMAS[format]
      const prompt = buildContentPrompt(format, results)

      const { output, usage } = await generateText({
        model: google('gemini-2.5-flash'),
        output: Output.object({ schema }),
        system: VOICE_SYSTEM_PROMPT,
        prompt,
      })

      // Anti-hallucination: verify all URLs in output exist in input
      if (output) {
        const invalidUrls = validateOutputUrls(output, results)
        if (invalidUrls.length > 0) {
          console.error(
            `Content contains ${invalidUrls.length} hallucinated URL(s) for subscriber ${subscriber_id}: ${invalidUrls.join(', ')}`
          )
          // Do not store content with hallucinated URLs -- subscriber gets no newsletter
          // rather than one with broken links
          return new Response(
            JSON.stringify({
              error: 'Content contained hallucinated URLs, not stored',
              invalidUrls,
              subscriber_id,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }

      const subject = (output as { subject?: string })?.subject ?? 'Your daily briefing'
      const inputTokens = usage?.promptTokens ?? 0
      const outputTokens = usage?.completionTokens ?? 0

      newsletterContent = {
        format,
        subject,
        content: output,
        generatedAt: new Date().toISOString(),
        resultCount: results.length,
        isPartial: false,
        tokenUsage: {
          input: inputTokens,
          output: outputTokens,
        },
      }
    }

    // Step 5: UPSERT into newsletter_content
    const inputTokens = newsletterContent.tokenUsage?.input ?? 0
    const outputTokens = newsletterContent.tokenUsage?.output ?? 0
    const costEstimate = calculateCost(inputTokens, outputTokens)

    const { error: upsertError } = await supabase
      .from('newsletter_content')
      .upsert(
        {
          subscriber_id,
          format: newsletterContent.format,
          subject: newsletterContent.subject,
          content_json: newsletterContent.content,
          research_date: targetDate,
          is_partial: newsletterContent.isPartial,
          result_count: newsletterContent.resultCount,
          token_usage_input: inputTokens,
          token_usage_output: outputTokens,
          cost_estimate_usd: costEstimate,
        },
        { onConflict: 'subscriber_id,research_date' }
      )

    if (upsertError) {
      console.error(`Failed to upsert newsletter_content: ${upsertError.message}`)
      return new Response(
        JSON.stringify({ error: 'Failed to store content', detail: upsertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(
      `Content generation complete for subscriber ${subscriber_id}: ` +
      `format=${format}, partial=${newsletterContent.isPartial}, ` +
      `results=${newsletterContent.resultCount}, cost=$${costEstimate.toFixed(6)}`
    )

    return new Response(
      JSON.stringify({
        success: true,
        subscriber_id,
        format,
        isPartial: newsletterContent.isPartial,
        resultCount: newsletterContent.resultCount,
        costEstimateUsd: costEstimate,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Content generation fatal error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
