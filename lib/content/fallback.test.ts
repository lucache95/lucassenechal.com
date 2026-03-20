import { describe, it, expect } from 'vitest'
import { generateFallbackContent, MIN_RESULTS_THRESHOLD } from './fallback'

describe('generateFallbackContent', () => {
  it('returns NewsletterContent with isPartial=true', () => {
    const result = generateFallbackContent(['AI Tools'], 'digest')
    expect(result.isPartial).toBe(true)
  })

  it('sets format to match input format', () => {
    expect(generateFallbackContent([], 'digest').format).toBe('digest')
    expect(generateFallbackContent([], 'briefing').format).toBe('briefing')
    expect(generateFallbackContent([], 'mixed').format).toBe('mixed')
  })

  it('includes 3 suggestions', () => {
    const result = generateFallbackContent(['Tech'], 'mixed')
    const content = result.content as { suggestions: string[] }
    expect(content.suggestions).toHaveLength(3)
  })

  it('includes searched topics in output', () => {
    const topics = ['AI Tools', 'Cybersecurity']
    const result = generateFallbackContent(topics, 'digest')
    const content = result.content as { topicsSearched: string[] }
    expect(content.topicsSearched).toEqual(topics)
  })

  it('uses the exact fallback subject line from UI spec', () => {
    const result = generateFallbackContent([], 'briefing')
    expect(result.subject).toBe("Your briefing is light today -- here's why")
  })

  it('sets resultCount to 0', () => {
    const result = generateFallbackContent(['Tech'], 'digest')
    expect(result.resultCount).toBe(0)
  })

  it('does not include tokenUsage (no LLM call)', () => {
    const result = generateFallbackContent([], 'mixed')
    expect(result.tokenUsage).toBeUndefined()
  })
})

describe('MIN_RESULTS_THRESHOLD', () => {
  it('is set to 3', () => {
    expect(MIN_RESULTS_THRESHOLD).toBe(3)
  })
})
