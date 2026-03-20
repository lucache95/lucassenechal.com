import * as cheerio from 'cheerio'
import type { SearchResult } from '@/lib/research/types'

const MAX_RESPONSE_SIZE = 2 * 1024 * 1024 // 2MB
const FETCH_TIMEOUT_MS = 10000 // 10 seconds

/**
 * Scrape a known URL using Cheerio for HTML parsing.
 * Extracts title, description/snippet from meta tags and page content.
 * Only for specific known sources -- NOT generic crawling.
 * Returns null on any error (does not throw).
 */
export async function scrapeUrl(url: string): Promise<SearchResult | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LucasSenechalNewsletter/1.0 (research bot)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      console.error(`Scrape failed for ${url}: ${response.status}`)
      return null
    }

    // Check content length before reading body
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      console.error(`Scrape rejected for ${url}: response too large (${contentLength} bytes)`)
      return null
    }

    const html = await response.text()
    if (html.length > MAX_RESPONSE_SIZE) {
      console.error(`Scrape rejected for ${url}: body too large`)
      return null
    }

    const $ = cheerio.load(html)

    // Extract title: prefer og:title > title tag
    const ogTitle = $('meta[property="og:title"]').attr('content')
    const titleTag = $('title').first().text()
    const title = (ogTitle || titleTag || '').trim()

    if (!title) return null // No usable content

    // Extract snippet: prefer og:description > meta description > first paragraph
    const ogDesc = $('meta[property="og:description"]').attr('content')
    const metaDesc = $('meta[name="description"]').attr('content')
    const firstP = $('article p, main p, .content p, p').first().text()
    const snippet = (ogDesc || metaDesc || firstP || '').trim().slice(0, 300)

    // Extract published date from common meta tags
    const pubDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time[datetime]').first().attr('datetime')

    return {
      url,
      urlHash: '',
      title,
      snippet,
      sourceName: 'scrape',
      sourceUrl: url,
      publishedAt: pubDate ? new Date(pubDate) : null,
      relevanceScore: 0,
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`Scrape timeout for ${url}`)
    } else {
      console.error(`Scrape failed for ${url}:`, error)
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}
