import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ResearchResultRow } from './types'

// Mock ai module
const mockGenerateText = vi.fn()
vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
  Output: {
    object: vi.fn(({ schema }: { schema: unknown }) => ({ type: 'object', schema })),
  },
}))

// Mock google provider
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mock-gemini-model'),
}))

import { generateNewsletterContent, validateOutputUrls } from './content-generator'
import { google } from '@ai-sdk/google'

const MOCK_RESULTS: ResearchResultRow[] = [
  { url: 'https://techcrunch.com/article-1', title: 'AI Startup Raises $50M', snippet: 'A new AI startup focused on enterprise automation has raised $50 million in Series B funding.', source_name: 'brave', relevance_score: 0.85, published_at: '2026-03-19T10:00:00Z' },
  { url: 'https://reuters.com/article-2', title: 'EU AI Act Enforcement Begins', snippet: 'The European Union has started enforcing its landmark AI regulation, affecting major tech companies.', source_name: 'gdelt', relevance_score: 0.78, published_at: '2026-03-18T14:00:00Z' },
  { url: 'https://arstechnica.com/article-3', title: 'New Open Source LLM Beats GPT-4', snippet: 'Researchers release an open-source model that outperforms GPT-4 on coding benchmarks.', source_name: 'rss', relevance_score: 0.72, published_at: '2026-03-19T08:00:00Z' },
  { url: 'https://wired.com/article-4', title: 'Cybersecurity Firm Detects Novel Threat', snippet: 'A previously unknown attack vector targets cloud infrastructure providers.', source_name: 'brave', relevance_score: 0.65, published_at: '2026-03-17T16:00:00Z' },
  { url: 'https://hacker-news.com/article-5', title: 'Rust Gains Enterprise Adoption', snippet: 'Major banks and fintech companies are migrating critical systems to Rust.', source_name: 'rss', relevance_score: 0.60, published_at: '2026-03-18T12:00:00Z' },
]

const MOCK_DIGEST_OUTPUT = {
  subject: 'AI startups, EU regulation, and an open-source surprise',
  greeting: "Five things crossed my radar today that connect in interesting ways.",
  items: [
    { title: 'AI Startup Lands $50M for Enterprise Automation', summary: 'Another big raise in the enterprise AI space. This one is notable because they are targeting the exact pain point most companies still solve with spreadsheets and email chains.', url: 'https://techcrunch.com/article-1', sourceName: 'TechCrunch' },
    { title: 'EU AI Act Is Now Real -- Enforcement Has Begun', summary: 'The EU AI Act moved from theory to practice this week. Companies operating in Europe now face actual compliance deadlines, not just warnings (via Reuters).', url: 'https://reuters.com/article-2', sourceName: 'Reuters' },
    { title: 'Open Source LLM Quietly Outperforms GPT-4 on Code', summary: "This one caught me off guard. An open-source model beating GPT-4 on coding benchmarks isn't just a research milestone -- it changes the build-vs-buy calculus for dev teams.", url: 'https://arstechnica.com/article-3', sourceName: 'Ars Technica' },
  ],
  signoff: 'That is it for today. See you tomorrow with more.',
}

const MOCK_BRIEFING_OUTPUT = {
  subject: 'The AI regulation domino effect',
  intro: "Today's news has a clear thread: the gap between AI capability and AI governance is closing fast, and it is reshaping how companies build and deploy.",
  sections: [
    { heading: 'Regulation Meets Reality', body: 'The EU AI Act enforcement (per Reuters) is no longer hypothetical. Companies are scrambling to comply, and the $50M raise by an enterprise AI startup (via TechCrunch) suggests investors see compliance tooling as the next big market.', sourceUrls: ['https://techcrunch.com/article-1', 'https://reuters.com/article-2'] },
    { heading: 'Open Source Closing the Gap', body: 'Meanwhile, an open-source LLM has quietly surpassed GPT-4 on coding benchmarks (per Ars Technica). This matters because it means companies can build regulated AI systems without depending on a single vendor API.', sourceUrls: ['https://arstechnica.com/article-3'] },
  ],
  conclusion: "The pieces are falling into place for a more regulated but more accessible AI ecosystem. Worth watching how enterprise adoption shifts in the next quarter.",
}

const MOCK_MIXED_OUTPUT = {
  subject: 'AI funding, regulation, and an open-source upset',
  synthesis: "Today's results paint a picture of an AI industry growing up fast. Big money is flowing into enterprise automation, regulators are finally enforcing rules, and open-source is proving it can compete at the top. The common thread: maturity.",
  items: [
    { title: 'AI Startup Raises $50M Series B', oneLiner: 'Enterprise automation play backed by major VCs.', url: 'https://techcrunch.com/article-1', sourceName: 'TechCrunch' },
    { title: 'EU AI Act Enforcement Begins', oneLiner: 'Regulation is no longer hypothetical -- compliance deadlines are live.', url: 'https://reuters.com/article-2', sourceName: 'Reuters' },
    { title: 'Open Source Model Beats GPT-4', oneLiner: 'Coding benchmarks show open-source catching up to frontier models.', url: 'https://arstechnica.com/article-3', sourceName: 'Ars Technica' },
  ],
  signoff: 'More tomorrow.',
}

describe('generateNewsletterContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns digest format with isPartial=false', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_DIGEST_OUTPUT,
      usage: { promptTokens: 800, completionTokens: 400 },
    })

    const result = await generateNewsletterContent('digest', MOCK_RESULTS, ['AI', 'Tech'])
    expect(result.format).toBe('digest')
    expect(result.isPartial).toBe(false)
    expect(result.content).toEqual(MOCK_DIGEST_OUTPUT)
  })

  it('returns briefing format', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_BRIEFING_OUTPUT,
      usage: { promptTokens: 900, completionTokens: 500 },
    })

    const result = await generateNewsletterContent('briefing', MOCK_RESULTS, ['AI'])
    expect(result.format).toBe('briefing')
    expect(result.isPartial).toBe(false)
  })

  it('returns mixed format', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_MIXED_OUTPUT,
      usage: { promptTokens: 850, completionTokens: 450 },
    })

    const result = await generateNewsletterContent('mixed', MOCK_RESULTS, ['AI'])
    expect(result.format).toBe('mixed')
    expect(result.isPartial).toBe(false)
  })

  it('returns fallback content when results < 3 (no LLM call)', async () => {
    const fewResults = MOCK_RESULTS.slice(0, 2)
    const result = await generateNewsletterContent('digest', fewResults, ['AI Tools'])

    expect(result.isPartial).toBe(true)
    expect(result.subject).toBe("Your briefing is light today -- here's why")
    expect(result.resultCount).toBe(0)
    expect(mockGenerateText).not.toHaveBeenCalled()
  })

  it('includes tokenUsage from generateText response', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_DIGEST_OUTPUT,
      usage: { promptTokens: 800, completionTokens: 400 },
    })

    const result = await generateNewsletterContent('digest', MOCK_RESULTS, ['AI'])
    expect(result.tokenUsage).toEqual({ input: 800, output: 400 })
  })

  it('calls generateText with gemini-2.5-flash model', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_DIGEST_OUTPUT,
      usage: { promptTokens: 100, completionTokens: 50 },
    })

    await generateNewsletterContent('digest', MOCK_RESULTS, ['AI'])

    expect(google).toHaveBeenCalledWith('gemini-2.5-flash')
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  it('calls generateText with VOICE_SYSTEM_PROMPT as system parameter', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_DIGEST_OUTPUT,
      usage: { promptTokens: 100, completionTokens: 50 },
    })

    await generateNewsletterContent('digest', MOCK_RESULTS, ['AI'])

    const callArgs = mockGenerateText.mock.calls[0][0]
    expect(callArgs.system).toContain('Write like a knowledgeable friend')
    expect(callArgs.system).toContain('Never use: "dive into"')
  })

  it('extracts subject from LLM output', async () => {
    mockGenerateText.mockResolvedValue({
      output: MOCK_DIGEST_OUTPUT,
      usage: { promptTokens: 100, completionTokens: 50 },
    })

    const result = await generateNewsletterContent('digest', MOCK_RESULTS, ['AI'])
    expect(result.subject).toBe('AI startups, EU regulation, and an open-source surprise')
  })
})

describe('validateOutputUrls', () => {
  it('throws when output contains a URL not in input results', () => {
    const output = {
      items: [
        { url: 'https://techcrunch.com/article-1' },
        { url: 'https://fake-url.com/hallucinated' },
      ],
    }

    expect(() => validateOutputUrls(output, MOCK_RESULTS)).toThrow(
      'Content contains 1 URL(s) not in research results'
    )
  })

  it('passes when all output URLs match input result URLs', () => {
    const output = {
      items: [
        { url: 'https://techcrunch.com/article-1' },
        { url: 'https://reuters.com/article-2' },
      ],
    }

    expect(() => validateOutputUrls(output, MOCK_RESULTS)).not.toThrow()
  })

  it('validates briefing format sourceUrls in sections', () => {
    const output = {
      sections: [
        { sourceUrls: ['https://techcrunch.com/article-1', 'https://hallucinated.com/fake'] },
      ],
    }

    expect(() => validateOutputUrls(output, MOCK_RESULTS)).toThrow(
      'Content contains 1 URL(s) not in research results'
    )
  })

  it('handles output with no URL fields gracefully', () => {
    const output = { subject: 'test', greeting: 'hi' }
    expect(() => validateOutputUrls(output, MOCK_RESULTS)).not.toThrow()
  })
})
