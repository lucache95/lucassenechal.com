// Source types for identifying where results came from
export type ResearchSource = 'brave' | 'gdelt' | 'rss' | 'scrape' | 'custom_rss'

export interface SearchQuery {
  query: string
  intent: 'news' | 'analysis' | 'tools' | 'events' | 'general'
  keywords: string[]
}

export interface SearchResult {
  url: string
  urlHash: string
  title: string
  snippet: string
  sourceName: ResearchSource
  sourceUrl?: string        // original API/feed URL
  publishedAt: Date | null
  relevanceScore: number    // 0-1 from TF-IDF
  queryId?: string          // links to research_queries.id
}

export interface ResearchRun {
  id?: string
  subscriberId: string
  startedAt: Date
  completedAt?: Date
  status: 'running' | 'completed' | 'failed'
  queriesRun: number
  sourcesQueried: ResearchSource[]
  resultsFound: number
  resultsStored: number
  errors: ResearchError[]
  costEstimateUsd: number
}

export interface ResearchError {
  source: ResearchSource | 'topic_parser' | 'url_verifier' | 'dedup'
  message: string
  timestamp: Date
}

export interface SubscriberResearchContext {
  subscriberId: string
  topicDescriptions: string[]     // from subscriber_custom_topics.description
  categoryNames: string[]         // from topic_categories.name via join
  subtopicNames: string[]         // from topic_subtopics.name via join
  customFeedUrls: string[]        // from subscriber_sources.feed_url
}

// Cost tracking constants
export const COST_PER_BRAVE_QUERY = 0.005   // $5/1000 queries
export const COST_PER_GEMINI_CALL = 0.001   // estimated per topic parse
export const MAX_COST_PER_SUBSCRIBER_DAY = 0.10
