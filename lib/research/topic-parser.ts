import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { SearchQueriesSchema } from '@/lib/schemas/research'
import type { SearchQuery, SubscriberResearchContext } from '@/lib/research/types'

export async function parseTopicsToQueries(
  context: SubscriberResearchContext
): Promise<SearchQuery[]> {
  const { topicDescriptions, categoryNames, subtopicNames } = context

  // Validate we have SOMETHING to work with
  const hasCustomTopics = topicDescriptions.length > 0 && topicDescriptions.some(t => t.trim().length > 0)
  const hasCategories = categoryNames.length > 0 || subtopicNames.length > 0
  if (!hasCustomTopics && !hasCategories) {
    throw new Error('No topics or categories provided for research query generation')
  }

  // Build topic context string
  const parts: string[] = []
  if (subtopicNames.length > 0) {
    parts.push(`Selected topics: ${subtopicNames.join(', ')}`)
  }
  if (categoryNames.length > 0) {
    parts.push(`Categories: ${categoryNames.join(', ')}`)
  }
  if (hasCustomTopics) {
    parts.push(`Custom interests: ${topicDescriptions.join('; ')}`)
  }

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: SearchQueriesSchema,
    prompt: `Convert this subscriber's topic preferences into 3-5 search queries.

${parts.join('\n')}

Rules:
- Each query should be 3-8 words, optimized for web search
- Extract the core intent (news, analysis, tools, events, general)
- Extract 2-5 keywords per query for relevance scoring
- Queries should cover different aspects of the subscriber's interests
- Be specific: "AI regulation EU 2026" not "AI news"
- If the subscriber has custom interests, prioritize those over generic category queries`,
  })

  return object.queries
}
