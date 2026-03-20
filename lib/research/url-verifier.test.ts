import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyUrl, verifyUrlBatch, filterVerifiedResults } from './url-verifier'
import type { SearchResult } from '@/lib/research/types'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeResult(url: string, overrides?: Partial<SearchResult>): SearchResult {
  return {
    url,
    urlHash: '',
    title: 'Test',
    snippet: 'Test snippet',
    sourceName: 'brave',
    publishedAt: new Date(),
    relevanceScore: 0.8,
    ...overrides,
  }
}

describe('verifyUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true for 200 response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    const result = await verifyUrl('https://example.com/article')
    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/article', expect.objectContaining({ method: 'HEAD', redirect: 'follow' }))
  })

  it('returns true for 301/302 redirect that resolves to 200', async () => {
    // fetch with redirect:'follow' auto-follows, so ok=true
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    const result = await verifyUrl('https://old.example.com/redirect')
    expect(result).toBe(true)
  })

  it('returns false for 404 response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    const result = await verifyUrl('https://example.com/not-found')
    expect(result).toBe(false)
  })

  it('returns false for 500 response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const result = await verifyUrl('https://example.com/error')
    expect(result).toBe(false)
  })

  it('returns false on timeout (AbortError)', async () => {
    mockFetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'))
    const result = await verifyUrl('https://slow.example.com')
    expect(result).toBe(false)
  })

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const result = await verifyUrl('https://unreachable.example.com')
    expect(result).toBe(false)
  })
})

describe('verifyUrlBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('processes URLs in batches of 10 and returns Map of url -> boolean', async () => {
    // Create 15 URLs to test batching (should be 2 batches: 10 + 5)
    const urls = Array.from({ length: 15 }, (_, i) => `https://example.com/${i}`)

    // First 12 valid, last 3 invalid
    urls.forEach((_, i) => {
      mockFetch.mockResolvedValueOnce({ ok: i < 12, status: i < 12 ? 200 : 404 })
    })

    const results = await verifyUrlBatch(urls)
    expect(results).toBeInstanceOf(Map)
    expect(results.size).toBe(15)
    expect(results.get('https://example.com/0')).toBe(true)
    expect(results.get('https://example.com/14')).toBe(false)
  })

  it('returns empty Map for empty input', async () => {
    const results = await verifyUrlBatch([])
    expect(results.size).toBe(0)
  })
})

describe('filterVerifiedResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('removes results with invalid URLs', async () => {
    const results = [
      makeResult('https://valid.com/article'),
      makeResult('https://dead.com/gone'),
      makeResult('https://also-valid.com/page'),
    ]

    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, status: 200 })

    const filtered = await filterVerifiedResults(results)
    expect(filtered).toHaveLength(2)
    expect(filtered.map(r => r.url)).toEqual([
      'https://valid.com/article',
      'https://also-valid.com/page',
    ])
  })

  it('returns empty array for empty input', async () => {
    const filtered = await filterVerifiedResults([])
    expect(filtered).toHaveLength(0)
  })
})
