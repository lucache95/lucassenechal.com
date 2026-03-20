import type { SearchResult } from '@/lib/research/types'

interface GdeltArticle {
  url: string
  title: string
  seendate: string  // YYYYMMDDTHHMMSSZ format
  socialimage: string
  domain: string
  language: string
  sourcecountry: string
}

interface GdeltResponse {
  articles?: GdeltArticle[]
}

/**
 * Search GDELT DOC 2.0 API.
 * 100% free, no API key required.
 * Updates every 15 minutes, 3-month rolling window.
 * Uses timespan=7d for 7-day recency filter.
 */
export async function gdeltSearch(
  query: string,
  maxRecords = 25
): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: 'ArtList',
      maxrecords: String(maxRecords),
      format: 'json',
      sort: 'DateDesc',
      timespan: '7d',
    })

    const response = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?${params}`
    )

    if (!response.ok) {
      console.error(`GDELT API error: ${response.status}`)
      return []
    }

    const data: GdeltResponse = await response.json()
    const articles = data.articles ?? []

    return articles.map((a): SearchResult => ({
      url: a.url,
      urlHash: '',
      title: a.title,
      snippet: '', // GDELT doesn't provide snippets
      sourceName: 'gdelt',
      sourceUrl: `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}`,
      publishedAt: parseGdeltDate(a.seendate),
      relevanceScore: 0,
    }))
  } catch (error) {
    console.error('GDELT search failed:', error)
    return []
  }
}

/** Parse GDELT date format: YYYYMMDDTHHMMSSZ -> Date */
function parseGdeltDate(seendate: string): Date | null {
  try {
    // Format: 20260319T060000Z
    const year = seendate.slice(0, 4)
    const month = seendate.slice(4, 6)
    const day = seendate.slice(6, 8)
    const hour = seendate.slice(9, 11)
    const min = seendate.slice(11, 13)
    const sec = seendate.slice(13, 15)
    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`)
  } catch {
    return null
  }
}
