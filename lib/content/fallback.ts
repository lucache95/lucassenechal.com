import type { NewsletterContent, ContentFormat, FallbackContent } from './types'

export const MIN_RESULTS_THRESHOLD = 3

export function generateFallbackContent(
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
