import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SearchQuery } from './types'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      upsert: vi.fn(),
    })),
  })),
}))

import { clusterQueries, getCachedResults, cacheResults, queryCacheKey } from './cluster'
import { createClient } from '@supabase/supabase-js'

const mockCreateClient = vi.mocked(createClient)

describe('clusterQueries', () => {
  it('groups queries sharing 2+ keywords', () => {
    const queries: SearchQuery[] = [
      { query: 'AI regulation EU', intent: 'news', keywords: ['artificial', 'intelligence', 'regulation', 'europe'] },
      { query: 'AI policy Europe', intent: 'analysis', keywords: ['artificial', 'intelligence', 'policy', 'europe'] },
      { query: 'Climate change report', intent: 'news', keywords: ['climate', 'change', 'report'] },
    ]

    const clusters = clusterQueries(queries)

    // First two queries share 'artificial', 'intelligence', 'europe' (3 keywords)
    // So they should be in the same cluster
    expect(clusters.size).toBe(2)

    const aiCluster = clusters.get('AI regulation EU')
    expect(aiCluster).toBeDefined()
    expect(aiCluster!.length).toBe(2)

    const climateCluster = clusters.get('Climate change report')
    expect(climateCluster).toBeDefined()
    expect(climateCluster!.length).toBe(1)
  })

  it('keeps unique queries separate', () => {
    const queries: SearchQuery[] = [
      { query: 'Quantum computing advances', intent: 'news', keywords: ['quantum', 'computing'] },
      { query: 'Best pizza recipes', intent: 'general', keywords: ['pizza', 'recipes'] },
      { query: 'Space exploration Mars', intent: 'news', keywords: ['space', 'mars'] },
    ]

    const clusters = clusterQueries(queries)

    // No queries share 2+ keywords, so each should be its own cluster
    expect(clusters.size).toBe(3)
    for (const [, group] of clusters) {
      expect(group.length).toBe(1)
    }
  })

  it('handles empty query list', () => {
    const clusters = clusterQueries([])
    expect(clusters.size).toBe(0)
  })
})

describe('getCachedResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns cached results for a query hash', async () => {
    const mockResults = [
      { url: 'https://example.com', title: 'Test', snippet: 'Content', sourceName: 'brave', publishedAt: null, relevanceScore: 0.8, urlHash: 'abc' },
    ]

    const mockSingle = vi.fn().mockResolvedValue({ data: { results: mockResults, expires_at: new Date(Date.now() + 86400000).toISOString() }, error: null })
    const mockGt = vi.fn(() => ({ single: mockSingle }))
    const mockEq = vi.fn(() => ({ gt: mockGt }))
    const mockSelect = vi.fn(() => ({ eq: mockEq }))
    const mockFrom = vi.fn(() => ({ select: mockSelect }))

    mockCreateClient.mockReturnValue({ from: mockFrom } as any)

    const result = await getCachedResults('testhash', 'https://test.supabase.co', 'test-key')
    expect(result).toEqual(mockResults)
  })

  it('returns null for expired or missing cache', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const mockGt = vi.fn(() => ({ single: mockSingle }))
    const mockEq = vi.fn(() => ({ gt: mockGt }))
    const mockSelect = vi.fn(() => ({ eq: mockEq }))
    const mockFrom = vi.fn(() => ({ select: mockSelect }))

    mockCreateClient.mockReturnValue({ from: mockFrom } as any)

    const result = await getCachedResults('expiredhash', 'https://test.supabase.co', 'test-key')
    expect(result).toBeNull()
  })
})

describe('queryCacheKey', () => {
  it('produces consistent hash for same query', async () => {
    const hash1 = await queryCacheKey('test query')
    const hash2 = await queryCacheKey('test query')
    expect(hash1).toBe(hash2)
  })

  it('normalizes case and whitespace', async () => {
    const hash1 = await queryCacheKey('Test Query')
    const hash2 = await queryCacheKey('test query')
    expect(hash1).toBe(hash2)
  })
})
