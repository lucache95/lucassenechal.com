import { describe, it, expect } from 'vitest'
import { SearchQueriesSchema, SearchQuerySchema } from './research'

describe('SearchQuerySchema', () => {
  it('validates intent as one of news, analysis, tools, events, general', () => {
    const validIntents = ['news', 'analysis', 'tools', 'events', 'general'] as const
    for (const intent of validIntents) {
      const result = SearchQuerySchema.safeParse({
        query: 'test query string',
        intent,
        keywords: ['keyword1', 'keyword2'],
      })
      expect(result.success).toBe(true)
    }

    const invalid = SearchQuerySchema.safeParse({
      query: 'test query string',
      intent: 'invalid_intent',
      keywords: ['keyword1', 'keyword2'],
    })
    expect(invalid.success).toBe(false)
  })
})

describe('SearchQueriesSchema', () => {
  it('validates an object with 1-5 queries each having query string, intent enum, and keywords array', () => {
    const valid = SearchQueriesSchema.safeParse({
      queries: [
        { query: 'AI regulation EU 2026', intent: 'news', keywords: ['AI', 'regulation'] },
        { query: 'cybersecurity trends analysis', intent: 'analysis', keywords: ['cybersecurity', 'trends'] },
        { query: 'latest developer tools', intent: 'tools', keywords: ['developer', 'tools'] },
      ],
    })
    expect(valid.success).toBe(true)
    if (valid.success) {
      expect(valid.data.queries).toHaveLength(3)
      expect(valid.data.queries[0].query).toBe('AI regulation EU 2026')
      expect(valid.data.queries[0].intent).toBe('news')
      expect(valid.data.queries[0].keywords).toEqual(['AI', 'regulation'])
    }
  })

  it('rejects objects with 0 queries', () => {
    const empty = SearchQueriesSchema.safeParse({
      queries: [],
    })
    expect(empty.success).toBe(false)
  })

  it('rejects objects with more than 5 queries', () => {
    const tooMany = SearchQueriesSchema.safeParse({
      queries: Array.from({ length: 6 }, (_, i) => ({
        query: `test query ${i}`,
        intent: 'news',
        keywords: ['keyword1', 'keyword2'],
      })),
    })
    expect(tooMany.success).toBe(false)
  })
})
