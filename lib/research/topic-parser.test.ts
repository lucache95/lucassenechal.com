import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SubscriberResearchContext } from './types'

// Mock the ai module
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

// Mock the google provider
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mock-model'),
}))

import { parseTopicsToQueries } from './topic-parser'
import { generateObject } from 'ai'

const mockGenerateObject = vi.mocked(generateObject)

describe('parseTopicsToQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const baseContext: SubscriberResearchContext = {
    subscriberId: 'test-sub-id',
    topicDescriptions: ['AI regulation and policy changes in Europe'],
    categoryNames: ['Technology & AI'],
    subtopicNames: ['AI Tools & Assistants', 'Cybersecurity'],
    customFeedUrls: [],
  }

  it('returns 3-5 SearchQuery objects from freeform topic description and categories', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        queries: [
          { query: 'AI regulation EU 2026 policy', intent: 'news', keywords: ['AI', 'regulation', 'EU', 'policy'] },
          { query: 'AI tools assistants latest releases', intent: 'tools', keywords: ['AI', 'tools', 'assistants'] },
          { query: 'cybersecurity threats trends 2026', intent: 'analysis', keywords: ['cybersecurity', 'threats', 'trends'] },
        ],
      },
      finishReason: 'stop',
      usage: { promptTokens: 100, completionTokens: 50 },
    } as any)

    const queries = await parseTopicsToQueries(baseContext)

    expect(queries).toHaveLength(3)
    expect(queries[0]).toHaveProperty('query')
    expect(queries[0]).toHaveProperty('intent')
    expect(queries[0]).toHaveProperty('keywords')
  })

  it('each query has valid intent and 2+ keywords', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        queries: [
          { query: 'test query one', intent: 'news', keywords: ['test', 'query'] },
          { query: 'test query two', intent: 'analysis', keywords: ['test', 'analysis', 'deep'] },
        ],
      },
      finishReason: 'stop',
      usage: { promptTokens: 100, completionTokens: 50 },
    } as any)

    const queries = await parseTopicsToQueries(baseContext)

    for (const q of queries) {
      expect(['news', 'analysis', 'tools', 'events', 'general']).toContain(q.intent)
      expect(q.keywords.length).toBeGreaterThanOrEqual(2)
      expect(q.query.length).toBeGreaterThan(0)
    }
  })

  it('handles empty custom topics (uses only category names)', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        queries: [
          { query: 'technology AI news', intent: 'news', keywords: ['technology', 'AI'] },
        ],
      },
      finishReason: 'stop',
      usage: { promptTokens: 50, completionTokens: 30 },
    } as any)

    const context: SubscriberResearchContext = {
      ...baseContext,
      topicDescriptions: [],
    }

    const queries = await parseTopicsToQueries(context)
    expect(queries.length).toBeGreaterThanOrEqual(1)
    // Verify generateObject was called with prompt containing categories
    expect(mockGenerateObject).toHaveBeenCalledTimes(1)
    const callArgs = mockGenerateObject.mock.calls[0][0] as any
    expect(callArgs.prompt).toContain('Technology & AI')
  })

  it('handles empty categories (uses only custom topics)', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        queries: [
          { query: 'AI regulation Europe policy', intent: 'news', keywords: ['AI', 'regulation', 'Europe'] },
        ],
      },
      finishReason: 'stop',
      usage: { promptTokens: 50, completionTokens: 30 },
    } as any)

    const context: SubscriberResearchContext = {
      ...baseContext,
      categoryNames: [],
      subtopicNames: [],
    }

    const queries = await parseTopicsToQueries(context)
    expect(queries.length).toBeGreaterThanOrEqual(1)
  })

  it('throws if both custom topics and categories are empty', async () => {
    const context: SubscriberResearchContext = {
      subscriberId: 'test-sub-id',
      topicDescriptions: [],
      categoryNames: [],
      subtopicNames: [],
      customFeedUrls: [],
    }

    await expect(parseTopicsToQueries(context)).rejects.toThrow(
      'No topics or categories provided'
    )
  })
})
