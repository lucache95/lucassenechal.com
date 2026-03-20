import type { SearchResult } from '@/lib/research/types'

const DEFAULT_FRESHNESS_DAYS = 7

/**
 * Filter search results by publication date.
 * Removes results older than cutoffDays (default 7).
 * Results with null publishedAt are INCLUDED (unknown date, benefit of doubt).
 */
export function filterByFreshness(
  results: SearchResult[],
  cutoffDays: number = DEFAULT_FRESHNESS_DAYS
): SearchResult[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - cutoffDays)

  return results.filter(r => {
    // No date info = include (benefit of doubt)
    if (!r.publishedAt) return true

    // Include if published after cutoff
    return r.publishedAt >= cutoffDate
  })
}
