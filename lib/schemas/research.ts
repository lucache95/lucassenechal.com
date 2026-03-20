import { z } from 'zod'

export const SearchQuerySchema = z.object({
  query: z.string().min(3).max(200).describe('Search query string for Brave/GDELT'),
  intent: z.enum(['news', 'analysis', 'tools', 'events', 'general']),
  keywords: z.array(z.string().min(2)).min(2).max(5).describe('Key terms for TF-IDF scoring'),
})

export const SearchQueriesSchema = z.object({
  queries: z.array(SearchQuerySchema).min(1).max(5),
})

export type SearchQueriesOutput = z.infer<typeof SearchQueriesSchema>
export type SearchQueryOutput = z.infer<typeof SearchQuerySchema>
