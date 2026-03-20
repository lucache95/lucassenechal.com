import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrapeUrl } from './scraper'

// Mock fetch globally
const mockFetch = vi.fn()

describe('scrapeUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function htmlResponse(html: string, headers: Record<string, string> = {}): Response {
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html', ...headers },
    })
  }

  it('extracts title from <title> tag', async () => {
    mockFetch.mockResolvedValueOnce(
      htmlResponse('<html><head><title>Test Page Title</title></head><body><p>Content</p></body></html>')
    )
    const result = await scrapeUrl('https://example.com/article')
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Test Page Title')
  })

  it('prefers og:title over <title> tag', async () => {
    mockFetch.mockResolvedValueOnce(
      htmlResponse(
        '<html><head><title>Fallback Title</title><meta property="og:title" content="OG Title" /></head><body></body></html>'
      )
    )
    const result = await scrapeUrl('https://example.com/article')
    expect(result).not.toBeNull()
    expect(result!.title).toBe('OG Title')
  })

  it('extracts meta description as snippet', async () => {
    mockFetch.mockResolvedValueOnce(
      htmlResponse(
        '<html><head><title>Page</title><meta name="description" content="A great description" /></head><body></body></html>'
      )
    )
    const result = await scrapeUrl('https://example.com/article')
    expect(result).not.toBeNull()
    expect(result!.snippet).toBe('A great description')
  })

  it('prefers og:description over meta description', async () => {
    mockFetch.mockResolvedValueOnce(
      htmlResponse(
        '<html><head><title>Page</title><meta name="description" content="Meta desc" /><meta property="og:description" content="OG desc" /></head><body></body></html>'
      )
    )
    const result = await scrapeUrl('https://example.com/article')
    expect(result).not.toBeNull()
    expect(result!.snippet).toBe('OG desc')
  })

  it('returns SearchResult with sourceName="scrape"', async () => {
    mockFetch.mockResolvedValueOnce(
      htmlResponse('<html><head><title>Page</title></head><body></body></html>')
    )
    const result = await scrapeUrl('https://example.com/article')
    expect(result).not.toBeNull()
    expect(result!.sourceName).toBe('scrape')
    expect(result!.url).toBe('https://example.com/article')
    expect(result!.sourceUrl).toBe('https://example.com/article')
  })

  it('returns null on fetch failure (does not throw)', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }))
    const result = await scrapeUrl('https://example.com/broken')
    expect(result).toBeNull()
  })

  it('enforces 10s timeout via AbortController', async () => {
    mockFetch.mockImplementationOnce((_url: string, init: RequestInit) => {
      // Verify AbortController signal is passed
      expect(init.signal).toBeDefined()
      expect(init.signal).toBeInstanceOf(AbortSignal)
      // Simulate abort
      return Promise.reject(new DOMException('The operation was aborted', 'AbortError'))
    })
    const result = await scrapeUrl('https://example.com/slow')
    expect(result).toBeNull()
  })

  it('rejects responses larger than 2MB via content-length header', async () => {
    const largeSize = (3 * 1024 * 1024).toString()
    mockFetch.mockResolvedValueOnce(
      htmlResponse('<html><head><title>Big</title></head><body></body></html>', {
        'content-length': largeSize,
      })
    )
    const result = await scrapeUrl('https://example.com/huge')
    expect(result).toBeNull()
  })
})
