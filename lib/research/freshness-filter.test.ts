import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { filterByFreshness } from './freshness-filter'
import type { SearchResult } from '@/lib/research/types'

function makeResult(publishedAt: Date | null): SearchResult {
  return {
    url: 'https://example.com/article',
    urlHash: '',
    title: 'Test',
    snippet: 'Test snippet',
    sourceName: 'brave',
    publishedAt,
    relevanceScore: 0.8,
  }
}

describe('filterByFreshness', () => {
  beforeEach(() => {
    // Fix time to 2026-03-19T12:00:00Z for deterministic tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps results from last 7 days', () => {
    const results = [
      makeResult(new Date('2026-03-15T00:00:00Z')), // 4 days ago - keep
      makeResult(new Date('2026-03-18T00:00:00Z')), // 1 day ago - keep
    ]
    const filtered = filterByFreshness(results)
    expect(filtered).toHaveLength(2)
  })

  it('removes results older than 7 days', () => {
    const results = [
      makeResult(new Date('2026-03-05T00:00:00Z')), // 14 days ago - remove
      makeResult(new Date('2026-03-01T00:00:00Z')), // 18 days ago - remove
      makeResult(new Date('2026-03-18T00:00:00Z')), // 1 day ago - keep
    ]
    const filtered = filterByFreshness(results)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].publishedAt).toEqual(new Date('2026-03-18T00:00:00Z'))
  })

  it('keeps results with null publishedAt (unknown date = include)', () => {
    const results = [
      makeResult(null),
      makeResult(new Date('2026-03-18T00:00:00Z')),
    ]
    const filtered = filterByFreshness(results)
    expect(filtered).toHaveLength(2)
  })

  it('uses configurable cutoff days', () => {
    const results = [
      makeResult(new Date('2026-03-05T00:00:00Z')), // 14 days ago
      makeResult(new Date('2026-03-18T00:00:00Z')), // 1 day ago
    ]
    // With 30-day cutoff, both should be kept
    const filtered30 = filterByFreshness(results, 30)
    expect(filtered30).toHaveLength(2)

    // With 3-day cutoff, only the recent one
    const filtered3 = filterByFreshness(results, 3)
    expect(filtered3).toHaveLength(1)
  })
})
