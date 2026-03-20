import { describe, it, expect } from 'vitest'
import { tfidfScore, scoreResults } from './relevance-scorer'
import type { SearchResult } from './types'

describe('tfidfScore', () => {
  it('returns higher score for results containing query keywords in title', () => {
    const keywords = ['artificial', 'intelligence', 'regulation']
    const titleWithKeywords = 'Artificial Intelligence Regulation in the EU'
    const titleWithout = 'New Restaurant Opens Downtown'
    const snippet = 'Some general content about the topic.'

    const scoreWith = tfidfScore(keywords, titleWithKeywords, snippet)
    const scoreWithout = tfidfScore(keywords, titleWithout, snippet)

    expect(scoreWith).toBeGreaterThan(scoreWithout)
    expect(scoreWith).toBeGreaterThan(0)
  })

  it('returns 0 for results with no keyword overlap', () => {
    const keywords = ['quantum', 'computing', 'research']
    const title = 'Best Recipes for Summer Grilling'
    const snippet = 'Tips and tricks for outdoor cooking.'

    const score = tfidfScore(keywords, title, snippet)
    expect(score).toBe(0)
  })

  it('normalizes score to 0-1 range', () => {
    const keywords = ['machine', 'learning', 'deep', 'neural', 'network']
    const title = 'Deep Learning and Neural Network Advances in Machine Learning'
    const snippet = 'Machine learning with deep neural network architectures for learning complex patterns in deep learning research on neural network machine learning.'

    const score = tfidfScore(keywords, title, snippet)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('handles empty text gracefully (returns 0)', () => {
    const keywords = ['test', 'keyword']
    const score = tfidfScore(keywords, '', '')
    expect(score).toBe(0)
  })

  it('handles empty keywords gracefully', () => {
    const score = tfidfScore([], 'Some title', 'Some snippet')
    expect(score).toBe(0)
  })
})

describe('scoreResults', () => {
  it('sorts SearchResult[] by relevance_score descending', () => {
    const results: SearchResult[] = [
      {
        url: 'https://example.com/1',
        urlHash: 'hash1',
        title: 'Cooking Tips and Recipes',
        snippet: 'Learn how to cook great meals.',
        sourceName: 'brave',
        publishedAt: null,
        relevanceScore: 0,
      },
      {
        url: 'https://example.com/2',
        urlHash: 'hash2',
        title: 'Artificial Intelligence Regulation News',
        snippet: 'New AI regulation policies being discussed for artificial intelligence oversight.',
        sourceName: 'gdelt',
        publishedAt: null,
        relevanceScore: 0,
      },
      {
        url: 'https://example.com/3',
        urlHash: 'hash3',
        title: 'AI Tools for Business Intelligence',
        snippet: 'Artificial intelligence tools transform business.',
        sourceName: 'rss',
        publishedAt: null,
        relevanceScore: 0,
      },
    ]

    const keywords = ['artificial', 'intelligence', 'regulation']
    const scored = scoreResults(results, keywords)

    // Result 2 should be first (most keyword overlap)
    expect(scored[0].url).toBe('https://example.com/2')
    // All scores should be between 0 and 1
    for (const r of scored) {
      expect(r.relevanceScore).toBeGreaterThanOrEqual(0)
      expect(r.relevanceScore).toBeLessThanOrEqual(1)
    }
    // Should be sorted descending
    for (let i = 1; i < scored.length; i++) {
      expect(scored[i - 1].relevanceScore).toBeGreaterThanOrEqual(scored[i].relevanceScore)
    }
  })
})
