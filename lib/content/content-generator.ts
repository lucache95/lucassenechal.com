import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { DigestSchema, BriefingSchema, MixedSchema } from './schemas'
import { VOICE_SYSTEM_PROMPT, buildContentPrompt } from './prompts'
import { generateFallbackContent, MIN_RESULTS_THRESHOLD } from './fallback'
import type { NewsletterContent, ContentFormat, ResearchResultRow } from './types'

const FORMAT_SCHEMAS = {
  digest: DigestSchema,
  briefing: BriefingSchema,
  mixed: MixedSchema,
} as const

/**
 * Validates that every URL in the LLM output exists in the input research results.
 * Prevents hallucinated URLs from reaching subscribers.
 * Throws Error if any output URL is not in the input set.
 */
export function validateOutputUrls(
  output: unknown,
  inputResults: ResearchResultRow[]
): void {
  const inputUrls = new Set(inputResults.map(r => r.url))
  const outputUrls: string[] = []

  // Extract URLs from any format output
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

  const invalidUrls = outputUrls.filter(url => !inputUrls.has(url))
  if (invalidUrls.length > 0) {
    throw new Error(
      `Content contains ${invalidUrls.length} URL(s) not in research results: ${invalidUrls.join(', ')}`
    )
  }
}

/**
 * Generate newsletter content from research results.
 *
 * Uses generateText + Output.object (AI SDK 6 pattern) with Gemini 2.5 Flash.
 * Returns fallback content when results < MIN_RESULTS_THRESHOLD (3).
 * Validates all output URLs exist in input results (anti-hallucination).
 */
export async function generateNewsletterContent(
  format: ContentFormat,
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

  // Anti-hallucination: verify all URLs in output exist in input
  if (output) {
    validateOutputUrls(output, results)
  }

  // Extract subject from the output (all 3 formats have a subject field)
  const subject = (output as { subject?: string })?.subject ?? 'Your daily briefing'

  return {
    format,
    subject,
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
