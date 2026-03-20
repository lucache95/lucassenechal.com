export type ContentFormat = 'digest' | 'briefing' | 'mixed'

// Row shape from research_results table (what the content generator reads from DB)
export interface ResearchResultRow {
  url: string
  title: string
  snippet: string | null
  source_name: string
  relevance_score: number
  published_at: string | null
}

export interface NewsletterContent {
  format: ContentFormat
  subject: string
  content: unknown  // DigestContent | BriefingContent | MixedContent | FallbackContent
  generatedAt: string
  resultCount: number
  isPartial: boolean
  tokenUsage?: {
    input: number
    output: number
  }
}

export interface FallbackContent {
  intro: string
  suggestions: string[]
  topicsSearched: string[]
}
