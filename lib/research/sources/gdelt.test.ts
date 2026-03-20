import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gdeltSearch } from './gdelt'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('gdeltSearch', () => {
  it('returns SearchResult[] with sourceName gdelt', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [
          { url: 'https://news.com/article1', title: 'AI Regulation', seendate: '20260318T100000Z', socialimage: '', domain: 'news.com', language: 'English', sourcecountry: 'US' },
          { url: 'https://news.com/article2', title: 'Tech News', seendate: '20260317T080000Z', socialimage: '', domain: 'news.com', language: 'English', sourcecountry: 'UK' },
        ],
      }),
    })

    const results = await gdeltSearch('AI regulation')
    expect(results).toHaveLength(2)
    expect(results[0].sourceName).toBe('gdelt')
    expect(results[0].title).toBe('AI Regulation')
    expect(results[0].url).toBe('https://news.com/article1')
    expect(results[1].sourceName).toBe('gdelt')
  })

  it('uses mode=ArtList, format=json, timespan=7d params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: [] }),
    })

    await gdeltSearch('test query')
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('api.gdeltproject.org/api/v2/doc/doc')
    expect(calledUrl).toContain('mode=ArtList')
    expect(calledUrl).toContain('format=json')
    expect(calledUrl).toContain('timespan=7d')
  })

  it('handles empty articles array gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: [] }),
    })

    const results = await gdeltSearch('nothing here')
    expect(results).toEqual([])
  })

  it('parses seendate YYYYMMDDTHHMMSSZ into Date', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [
          { url: 'https://example.com/a', title: 'Test', seendate: '20260319T060000Z', socialimage: '', domain: 'example.com', language: 'English', sourcecountry: 'US' },
        ],
      }),
    })

    const results = await gdeltSearch('test')
    expect(results[0].publishedAt).toEqual(new Date('2026-03-19T06:00:00Z'))
  })

  it('returns empty array on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    const results = await gdeltSearch('test')
    expect(results).toEqual([])
  })

  it('returns empty array on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const results = await gdeltSearch('test')
    expect(results).toEqual([])
  })
})
