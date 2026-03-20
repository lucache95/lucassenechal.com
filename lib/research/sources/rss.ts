import type { SearchResult } from '@/lib/research/types'
import type { DefaultFeed } from '@/lib/data/default-feeds'
import RssParser from 'rss-parser'

interface RssItem {
  title?: string
  link?: string
  pubDate?: string
  isoDate?: string
  contentSnippet?: string
  content?: string
}

/**
 * Parse a single RSS/Atom feed URL and return SearchResult[].
 * Uses rss-parser for RSS 2.0 and Atom feed parsing.
 * Timeout: 10 seconds per feed.
 */
export async function parseSingleFeed(
  feedUrl: string,
  feedName: string,
  sourceName: 'rss' | 'custom_rss' = 'rss'
): Promise<SearchResult[]> {
  try {
    const parser = new RssParser({
      timeout: 10000, // 10s timeout
      maxRedirects: 3,
    })

    const feed = await parser.parseURL(feedUrl)
    const items: RssItem[] = feed.items ?? []

    return items.slice(0, 15).map((item): SearchResult => ({
      url: item.link ?? '',
      urlHash: '',
      title: item.title ?? 'Untitled',
      snippet: (item.contentSnippet ?? item.content ?? '').slice(0, 300),
      sourceName,
      sourceUrl: feedUrl,
      publishedAt: item.isoDate ? new Date(item.isoDate)
        : item.pubDate ? new Date(item.pubDate)
        : null,
      relevanceScore: 0,
    })).filter(r => r.url.length > 0) // skip items without links
  } catch (error) {
    console.error(`RSS parse failed for ${feedName} (${feedUrl}):`, error)
    return []
  }
}

/**
 * Fetch multiple RSS feeds in parallel.
 * Skips feeds that fail individually.
 */
export async function fetchRssFeeds(
  feeds: DefaultFeed[],
  sourceName: 'rss' | 'custom_rss' = 'rss'
): Promise<SearchResult[]> {
  const results = await Promise.allSettled(
    feeds.map(feed => parseSingleFeed(feed.url, feed.name, sourceName))
  )

  const allResults: SearchResult[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value)
    }
  }
  return allResults
}
