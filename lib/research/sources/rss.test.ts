import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted for mock variable hoisting (Vitest v4 pattern)
const { mockParseURL } = vi.hoisted(() => ({
  mockParseURL: vi.fn(),
}))

vi.mock('rss-parser', () => {
  return {
    default: class MockRssParser {
      parseURL = mockParseURL
    },
  }
})

import { parseSingleFeed, fetchRssFeeds } from './rss'

beforeEach(() => {
  mockParseURL.mockReset()
})

describe('parseSingleFeed', () => {
  it('extracts title, link, pubDate from RSS 2.0 XML', async () => {
    mockParseURL.mockResolvedValueOnce({
      items: [
        { title: 'Article 1', link: 'https://example.com/1', isoDate: '2026-03-18T10:00:00Z', contentSnippet: 'First article snippet' },
        { title: 'Article 2', link: 'https://example.com/2', pubDate: 'Wed, 18 Mar 2026 08:00:00 GMT', content: 'Second article content' },
      ],
    })

    const results = await parseSingleFeed('https://example.com/feed', 'Test Feed')
    expect(results).toHaveLength(2)
    expect(results[0].title).toBe('Article 1')
    expect(results[0].url).toBe('https://example.com/1')
    expect(results[0].snippet).toBe('First article snippet')
    expect(results[0].publishedAt).toEqual(new Date('2026-03-18T10:00:00Z'))
  })

  it('returns SearchResult[] with sourceName rss', async () => {
    mockParseURL.mockResolvedValueOnce({
      items: [
        { title: 'Test', link: 'https://example.com/test', isoDate: '2026-03-18T10:00:00Z', contentSnippet: 'Test' },
      ],
    })

    const results = await parseSingleFeed('https://example.com/feed', 'Test Feed')
    expect(results[0].sourceName).toBe('rss')
    expect(results[0].sourceUrl).toBe('https://example.com/feed')
  })

  it('returns empty array on parse error', async () => {
    mockParseURL.mockRejectedValueOnce(new Error('Invalid XML'))

    const results = await parseSingleFeed('https://bad-feed.com/rss', 'Bad Feed')
    expect(results).toEqual([])
  })

  it('filters out items without links', async () => {
    mockParseURL.mockResolvedValueOnce({
      items: [
        { title: 'Has Link', link: 'https://example.com/1', contentSnippet: 'Good' },
        { title: 'No Link', contentSnippet: 'Bad' },
      ],
    })

    const results = await parseSingleFeed('https://example.com/feed', 'Test Feed')
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Has Link')
  })
})

describe('fetchRssFeeds', () => {
  it('processes multiple feeds in parallel', async () => {
    mockParseURL
      .mockResolvedValueOnce({
        items: [{ title: 'Feed1 Article', link: 'https://feed1.com/a', contentSnippet: 'F1' }],
      })
      .mockResolvedValueOnce({
        items: [{ title: 'Feed2 Article', link: 'https://feed2.com/b', contentSnippet: 'F2' }],
      })

    const feeds = [
      { name: 'Feed 1', url: 'https://feed1.com/rss', category: 'Tech' },
      { name: 'Feed 2', url: 'https://feed2.com/rss', category: 'News' },
    ]

    const results = await fetchRssFeeds(feeds)
    expect(results).toHaveLength(2)
    expect(results[0].title).toBe('Feed1 Article')
    expect(results[1].title).toBe('Feed2 Article')
  })

  it('skips feeds that fail and continues with others', async () => {
    mockParseURL
      .mockRejectedValueOnce(new Error('Feed 1 down'))
      .mockResolvedValueOnce({
        items: [{ title: 'Feed2 Article', link: 'https://feed2.com/b', contentSnippet: 'F2' }],
      })

    const feeds = [
      { name: 'Feed 1', url: 'https://feed1.com/rss', category: 'Tech' },
      { name: 'Feed 2', url: 'https://feed2.com/rss', category: 'News' },
    ]

    const results = await fetchRssFeeds(feeds)
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Feed2 Article')
  })
})
