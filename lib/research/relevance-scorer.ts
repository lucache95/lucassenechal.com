import type { SearchResult } from '@/lib/research/types'

// Common English stop words to exclude from TF-IDF
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'this', 'that', 'was', 'are',
  'be', 'has', 'have', 'had', 'not', 'no', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'can', 'about', 'more', 'also',
  'just', 'than', 'very', 'how', 'all', 'each', 'every', 'both', 'few',
  'most', 'other', 'some', 'such', 'into', 'over', 'after', 'before',
])

/**
 * Hand-rolled TF-IDF relevance score (~30 lines).
 * Computes term frequency of query keywords in result title+snippet.
 * Returns score normalized to 0-1 range.
 */
export function tfidfScore(queryKeywords: string[], title: string, snippet: string): number {
  const text = `${title} ${snippet}`.toLowerCase()
  const words = text.split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  const totalWords = words.length
  if (totalWords === 0) return 0

  let score = 0
  const filteredKeywords = queryKeywords.filter(k => k.length > 2 && !STOP_WORDS.has(k.toLowerCase()))
  if (filteredKeywords.length === 0) return 0

  for (const keyword of filteredKeywords) {
    const term = keyword.toLowerCase()
    const termFreq = words.filter(w => w === term || w.includes(term)).length
    const tf = termFreq / totalWords
    // IDF approximation: weight by 1/keyword count (rarer = higher)
    const idf = Math.log(1 + 1 / filteredKeywords.length)
    score += tf * idf
  }

  // Normalize to 0-1 range
  return Math.min(score * 10, 1)
}

/**
 * Score and sort an array of SearchResults by relevance.
 * Mutates relevanceScore field on each result.
 * Returns results sorted by score descending.
 */
export function scoreResults(
  results: SearchResult[],
  queryKeywords: string[]
): SearchResult[] {
  return results
    .map(r => ({
      ...r,
      relevanceScore: tfidfScore(queryKeywords, r.title, r.snippet),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}
