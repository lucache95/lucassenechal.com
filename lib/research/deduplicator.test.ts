import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashUrl, checkDuplicates, recordSentUrls, deduplicateResults } from './deduplicator'

// Mock Supabase client
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIn = vi.fn()
const mockUpsert = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe('hashUrl', () => {
  it('produces consistent SHA-256 hash for same URL', async () => {
    const hash1 = await hashUrl('https://example.com/article')
    const hash2 = await hashUrl('https://example.com/article')
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[0-9a-f]{64}$/) // SHA-256 hex = 64 chars
  })

  it('normalizes URL: lowercase, strip trailing slash, strip query params and hash', async () => {
    const hash1 = await hashUrl('https://Example.COM/Article/')
    const hash2 = await hashUrl('https://example.com/Article?utm_source=test#section')
    const hash3 = await hashUrl('https://example.com/Article')
    // All should normalize to same URL
    expect(hash1).toBe(hash3)
    expect(hash2).toBe(hash3)
  })

  it('produces different hashes for different URLs', async () => {
    const hash1 = await hashUrl('https://example.com/article-1')
    const hash2 = await hashUrl('https://example.com/article-2')
    expect(hash1).not.toBe(hash2)
  })
})

describe('checkDuplicates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns set of hashes that already exist in sent_url_hashes', async () => {
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ in: mockIn })
    mockIn.mockResolvedValue({
      data: [{ url_hash: 'abc123' }, { url_hash: 'def456' }],
      error: null,
    })

    const dupes = await checkDuplicates(
      'sub-1',
      ['abc123', 'def456', 'ghi789'],
      'https://fake.supabase.co',
      'fake-key'
    )
    expect(dupes).toEqual(new Set(['abc123', 'def456']))
    expect(mockFrom).toHaveBeenCalledWith('sent_url_hashes')
  })

  it('returns empty set on error (fail-open)', async () => {
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ in: mockIn })
    mockIn.mockResolvedValue({
      data: null,
      error: { message: 'Connection failed' },
    })

    const dupes = await checkDuplicates('sub-1', ['abc'], 'https://fake.supabase.co', 'fake-key')
    expect(dupes).toEqual(new Set())
  })
})

describe('recordSentUrls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts hashes into sent_url_hashes via upsert', async () => {
    mockFrom.mockReturnValue({ upsert: mockUpsert })
    mockUpsert.mockResolvedValue({ error: null })

    await recordSentUrls('sub-1', ['hash1', 'hash2'], 'https://fake.supabase.co', 'fake-key')

    expect(mockFrom).toHaveBeenCalledWith('sent_url_hashes')
    expect(mockUpsert).toHaveBeenCalledWith(
      [
        { subscriber_id: 'sub-1', url_hash: 'hash1' },
        { subscriber_id: 'sub-1', url_hash: 'hash2' },
      ],
      { onConflict: 'subscriber_id,url_hash', ignoreDuplicates: true }
    )
  })

  it('skips insert for empty hash array', async () => {
    await recordSentUrls('sub-1', [], 'https://fake.supabase.co', 'fake-key')
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
