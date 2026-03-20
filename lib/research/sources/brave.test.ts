import { describe, it, expect, vi, beforeEach } from 'vitest'
import { braveSearch } from './brave'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('braveSearch', () => {
  const apiKey = 'test-brave-api-key'

  it('returns array of SearchResult objects with sourceName brave', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        web: {
          results: [
            { title: 'AI News', url: 'https://example.com/ai', description: 'Latest AI news', page_age: '2026-03-18T10:00:00Z' },
            { title: 'Tech Update', url: 'https://example.com/tech', description: 'Tech update', age: '2 hours ago' },
          ],
        },
      }),
    })

    const results = await braveSearch('AI news', apiKey)
    expect(results).toHaveLength(2)
    expect(results[0].sourceName).toBe('brave')
    expect(results[0].title).toBe('AI News')
    expect(results[0].url).toBe('https://example.com/ai')
    expect(results[0].snippet).toBe('Latest AI news')
    expect(results[0].publishedAt).toEqual(new Date('2026-03-18T10:00:00Z'))
    expect(results[1].sourceName).toBe('brave')
  })

  it('sets freshness param to pw (past week)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ web: { results: [] } }),
    })

    await braveSearch('test query', apiKey)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('freshness=pw')
  })

  it('sends X-Subscription-Token header with API key', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ web: { results: [] } }),
    })

    await braveSearch('test', apiKey)
    const headers = mockFetch.mock.calls[0][1]?.headers
    expect(headers['X-Subscription-Token']).toBe(apiKey)
  })

  it('returns empty array on 429 rate limit response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    })

    const results = await braveSearch('test', apiKey)
    expect(results).toEqual([])
  })

  it('returns empty array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const results = await braveSearch('test', apiKey)
    expect(results).toEqual([])
  })

  it('limits results to count parameter (default 10)', async () => {
    const manyResults = Array.from({ length: 20 }, (_, i) => ({
      title: `Result ${i}`,
      url: `https://example.com/${i}`,
      description: `Description ${i}`,
    }))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ web: { results: manyResults } }),
    })

    const results = await braveSearch('test', apiKey, 5)
    expect(results).toHaveLength(5)
  })

  it('constructs correct API URL with query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ web: { results: [] } }),
    })

    await braveSearch('AI regulation EU', apiKey, 10)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('api.search.brave.com/res/v1/web/search')
    expect(calledUrl).toContain('q=AI+regulation+EU')
    expect(calledUrl).toContain('count=10')
  })
})
