import type { SearchResult } from '@/lib/research/types'

interface BraveWebResult {
  title: string
  url: string
  description: string
  age?: string
  page_age?: string
}

interface BraveSearchResponse {
  web?: { results: BraveWebResult[] }
  news?: { results: BraveWebResult[] }
}

/**
 * Search Brave Web Search API.
 * Rate limit: 1 QPS on free credits tier.
 * Cost: $0.005 per query ($5/1000).
 * Uses freshness='pw' (past week) to match 7-day recency requirement.
 */
export async function braveSearch(
  query: string,
  apiKey: string,
  count = 10
): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      count: String(count),
      freshness: 'pw',  // past week
    })

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': apiKey,
        },
      }
    )

    if (!response.ok) {
      console.error(`Brave API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data: BraveSearchResponse = await response.json()
    const webResults = data.web?.results ?? []

    return webResults.slice(0, count).map((r): SearchResult => ({
      url: r.url,
      urlHash: '',  // computed later by deduplicator
      title: r.title,
      snippet: r.description,
      sourceName: 'brave',
      sourceUrl: `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
      publishedAt: r.page_age ? new Date(r.page_age) : null,
      relevanceScore: 0,  // computed later by scorer
    }))
  } catch (error) {
    console.error('Brave search failed:', error)
    return []
  }
}
