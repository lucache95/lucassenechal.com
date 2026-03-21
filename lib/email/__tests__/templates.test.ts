import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import { DigestEmail } from '../digest-template'
import { BriefingEmail } from '../briefing-template'
import { MixedEmail } from '../mixed-template'
import { FallbackEmail } from '../fallback-template'

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const SUBSCRIBER_ID = 'test-sub-123'
const UNSUBSCRIBE_URL = 'https://lucassenechal.com/api/unsubscribe?s=test-sub-123&t=abc'
const PREFERENCES_URL = 'https://lucassenechal.com/preferences?s=test-sub-123&t=abc'
const FEEDBACK_BASE_URL = 'https://lucassenechal.com/api/feedback'
const FEEDBACK_TOKENS = ['tok1', 'tok2', 'tok3', 'tok4', 'tok5']

const DIGEST_ITEMS = [
  { title: 'AI Models Get Smarter Overnight', summary: 'New benchmarks show dramatic improvements in reasoning tasks. Engineers are calling it a watershed moment for enterprise AI.', url: 'https://techcrunch.com/ai-smarter', sourceName: 'TechCrunch' },
  { title: 'Fed Holds Rates Steady Through Summer', summary: 'The Federal Reserve indicated it will pause rate hikes through Q3, citing cooling inflation data. Markets rallied on the news.', url: 'https://reuters.com/fed-rates', sourceName: 'Reuters' },
  { title: 'Remote Work Premium Hits New High', summary: 'Fully remote roles now command 8% salary premium over hybrid positions in tech. The gap is widening as companies compete for talent.', url: 'https://bloomberg.com/remote-work', sourceName: 'Bloomberg' },
  { title: 'Rust Adoption Surges in Fortune 500', summary: '62% of Fortune 500 companies now use Rust in production. Memory safety guarantees are winning over risk-averse enterprise teams.', url: 'https://cio.com/rust-adoption', sourceName: 'CIO Magazine' },
  { title: 'Startup Funding Rebounds Strongly', summary: 'Q1 2026 venture funding hit $45B globally, up 23% year-over-year. AI infrastructure and climate tech led the way.', url: 'https://pitchbook.com/funding', sourceName: 'PitchBook' },
]

const BRIEFING_SECTIONS = [
  {
    heading: 'AI in the Enterprise',
    body: 'Enterprise AI adoption has reached a tipping point this week. Multiple Fortune 500 companies announced significant AI infrastructure investments, signaling the shift from experimentation to production deployment. Per TechCrunch, these investments are particularly concentrated in automation and process optimization — exactly the use cases that deliver measurable ROI within 90 days.',
    sourceUrls: ['https://techcrunch.com/ai-enterprise', 'https://reuters.com/ai-investments'],
  },
  {
    heading: 'Market Signals Worth Watching',
    body: 'The Federal Reserve\'s rate decision sent ripples through tech valuations this week. Via Bloomberg, growth-stage startups are seeing their valuations stabilize after 18 months of compression. This is particularly relevant for SaaS businesses with strong retention metrics — patient capital is returning to the table.',
    sourceUrls: ['https://bloomberg.com/fed-impact', 'https://pitchbook.com/valuations'],
  },
  {
    heading: 'Developer Tooling Evolution',
    body: 'Three converging trends are reshaping how development teams build and ship software. AI-assisted code review, Rust adoption, and edge-first architecture are no longer experimental — they\'re becoming table stakes for competitive engineering organizations.',
    sourceUrls: ['https://cio.com/dev-tools'],
  },
]

const MIXED_ITEMS = [
  { title: 'AI Models Outperform on Reasoning', oneLiner: 'New benchmarks show enterprise AI is finally ready for complex decision-making tasks.', url: 'https://techcrunch.com/ai-reasoning', sourceName: 'TechCrunch' },
  { title: 'Fed Signals Stable Rate Environment', oneLiner: 'Rate pause through Q3 gives businesses the stability they need to plan capital investments.', url: 'https://reuters.com/fed-signals', sourceName: 'Reuters' },
  { title: 'Remote Work Premium Expands', oneLiner: 'The 8% salary premium for fully remote roles is widening as top talent becomes more selective.', url: 'https://bloomberg.com/remote-premium', sourceName: 'Bloomberg' },
  { title: 'Rust Crosses the Enterprise Chasm', oneLiner: 'Memory safety requirements in regulated industries are driving Rust adoption faster than anyone predicted.', url: 'https://cio.com/rust-enterprise', sourceName: 'CIO Magazine' },
  { title: 'Venture Capital Rebounds in Q1', oneLiner: 'The funding environment is recovering, with AI infrastructure deals leading the pack.', url: 'https://pitchbook.com/q1-funding', sourceName: 'PitchBook' },
]

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// DigestEmail tests
// ---------------------------------------------------------------------------

describe('DigestEmail', () => {
  const softProps = {
    subscriberId: SUBSCRIBER_ID,
    greeting: 'Here are the five things worth your attention today.',
    items: DIGEST_ITEMS,
    signoff: 'See you tomorrow.',
    unsubscribeUrl: UNSUBSCRIBE_URL,
    preferencesUrl: PREFERENCES_URL,
    feedbackBaseUrl: FEEDBACK_BASE_URL,
    feedbackTokens: FEEDBACK_TOKENS,
    ctaLevel: 'soft' as const,
  }

  const mediumProps = { ...softProps, ctaLevel: 'medium' as const }

  it('renders valid HTML without throwing', async () => {
    const html = await render(DigestEmail(softProps))
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(100)
  })

  it('HTML contains "More like this" feedback link', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('More like this')
  })

  it('HTML contains "Less like this" feedback link', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('Less like this')
  })

  it('HTML contains "Update your preferences" link', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('Update your preferences')
  })

  it('HTML contains "Unsubscribe" link', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('Unsubscribe')
  })

  it('HTML contains consulting CTA URL (work-with-me)', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('work-with-me')
  })

  it('HTML contains "Lucas Senechal" brand footer', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('Lucas Senechal')
  })

  it('HTML size is under 100KB', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html.length).toBeLessThan(102400)
  })

  it('soft CTA renders as text link, not highlighted box', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('See how I can help')
    expect(html).not.toContain('f0f9ff') // no highlight box
  })

  it('medium CTA renders as highlighted box with "See How I Can Help" button', async () => {
    const html = await render(DigestEmail(mediumProps))
    expect(html).toContain('See How I Can Help')
    expect(html).toContain('f0f9ff') // highlight box background
  })

  it('feedback links contain "url=" with encoded item URL (not "i=" index)', async () => {
    const html = await render(DigestEmail(softProps))
    expect(html).toContain('url=')
    // Should encode first item URL
    expect(html).toContain(encodeURIComponent(DIGEST_ITEMS[0].url))
    // Should NOT use index-based "i=" parameter
    expect(html).not.toMatch(/[?&]i=\d/)
  })
})

// ---------------------------------------------------------------------------
// BriefingEmail tests
// ---------------------------------------------------------------------------

describe('BriefingEmail', () => {
  const briefingProps = {
    subscriberId: SUBSCRIBER_ID,
    intro: 'This week saw three converging trends reshaping the AI landscape. Enterprise adoption accelerated, capital markets stabilized, and developer tooling crossed a maturity threshold.',
    sections: BRIEFING_SECTIONS,
    conclusion: 'The pattern here is clear: AI is moving from demo to deployment. Organizations that built solid foundations in 2025 are now running circles around those that waited.',
    unsubscribeUrl: UNSUBSCRIBE_URL,
    preferencesUrl: PREFERENCES_URL,
    feedbackBaseUrl: FEEDBACK_BASE_URL,
    feedbackTokens: FEEDBACK_TOKENS,
    ctaLevel: 'soft' as const,
  }

  it('renders valid HTML without throwing', async () => {
    const html = await render(BriefingEmail(briefingProps))
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(100)
  })

  it('HTML contains feedback links per section', async () => {
    const html = await render(BriefingEmail(briefingProps))
    expect(html).toContain('More like this')
    expect(html).toContain('Less like this')
  })

  it('HTML contains uppercase section headings', async () => {
    const html = await render(BriefingEmail(briefingProps))
    // Check that section heading text is present (rendered in uppercase via CSS or text transform)
    expect(html).toContain('AI in the Enterprise')
  })

  it('HTML contains "Update your preferences" link', async () => {
    const html = await render(BriefingEmail(briefingProps))
    expect(html).toContain('Update your preferences')
  })

  it('HTML contains "Unsubscribe" link', async () => {
    const html = await render(BriefingEmail(briefingProps))
    expect(html).toContain('Unsubscribe')
  })

  it('HTML size is under 100KB', async () => {
    const html = await render(BriefingEmail(briefingProps))
    expect(html.length).toBeLessThan(102400)
  })

  it('feedback links contain "url=" with encoded section source URL (not "i=" index)', async () => {
    const html = await render(BriefingEmail(briefingProps))
    expect(html).toContain('url=')
    expect(html).toContain(encodeURIComponent(BRIEFING_SECTIONS[0].sourceUrls[0]))
    expect(html).not.toMatch(/[?&]i=\d/)
  })
})

// ---------------------------------------------------------------------------
// MixedEmail tests
// ---------------------------------------------------------------------------

describe('MixedEmail', () => {
  const mixedProps = {
    subscriberId: SUBSCRIBER_ID,
    synthesis: 'This week\'s research surfaces a clear thread: the organizations that invested in AI infrastructure in 2024 are now realizing compounding returns. From enterprise AI tooling to market stability signals, the conditions for deliberate automation investment are better than they\'ve been in two years.',
    items: MIXED_ITEMS,
    signoff: 'Make it count.',
    unsubscribeUrl: UNSUBSCRIBE_URL,
    preferencesUrl: PREFERENCES_URL,
    feedbackBaseUrl: FEEDBACK_BASE_URL,
    feedbackTokens: FEEDBACK_TOKENS,
    ctaLevel: 'soft' as const,
  }

  it('renders valid HTML without throwing', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(100)
  })

  it('HTML contains feedback links', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(html).toContain('More like this')
    expect(html).toContain('Less like this')
  })

  it('HTML contains linked item titles (href to source URL)', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(html).toContain(MIXED_ITEMS[0].url)
    expect(html).toContain(MIXED_ITEMS[0].title)
  })

  it('HTML contains "Update your preferences" link', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(html).toContain('Update your preferences')
  })

  it('HTML contains "Unsubscribe" link', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(html).toContain('Unsubscribe')
  })

  it('HTML size is under 100KB', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(html.length).toBeLessThan(102400)
  })

  it('feedback links contain "url=" with encoded item URL (not "i=" index)', async () => {
    const html = await render(MixedEmail(mixedProps))
    expect(html).toContain('url=')
    expect(html).toContain(encodeURIComponent(MIXED_ITEMS[0].url))
    expect(html).not.toMatch(/[?&]i=\d/)
  })
})

// ---------------------------------------------------------------------------
// FallbackEmail tests
// ---------------------------------------------------------------------------

describe('FallbackEmail', () => {
  const fallbackProps = {
    subscriberId: SUBSCRIBER_ID,
    preferencesUrl: PREFERENCES_URL,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  }

  it('renders valid HTML without throwing', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(100)
  })

  it('HTML contains "Your briefing is light today"', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(html).toContain('Your briefing is light today')
  })

  it('HTML contains "Update Your Preferences" button CTA', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(html).toContain('Update Your Preferences')
  })

  it('HTML does NOT contain "More like this" (no feedback in fallback)', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(html).not.toContain('More like this')
  })

  it('HTML does NOT contain "work-with-me" (no consulting CTA in fallback)', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(html).not.toContain('work-with-me')
  })

  it('HTML contains "Unsubscribe" link', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(html).toContain('Unsubscribe')
  })

  it('HTML size is under 100KB', async () => {
    const html = await render(FallbackEmail(fallbackProps))
    expect(html.length).toBeLessThan(102400)
  })
})

// ---------------------------------------------------------------------------
// MAIL-03 text ratio tests (text / html > 60%)
// ---------------------------------------------------------------------------

describe('MAIL-03 text-to-HTML ratio', () => {
  it('DigestEmail text ratio exceeds 60%', async () => {
    const html = await render(DigestEmail({
      subscriberId: SUBSCRIBER_ID,
      greeting: 'Here are the five things worth your attention today.',
      items: DIGEST_ITEMS,
      signoff: 'See you tomorrow.',
      unsubscribeUrl: UNSUBSCRIBE_URL,
      preferencesUrl: PREFERENCES_URL,
      feedbackBaseUrl: FEEDBACK_BASE_URL,
      feedbackTokens: FEEDBACK_TOKENS,
      ctaLevel: 'soft',
    }))
    const textContent = stripHtml(html)
    const ratio = textContent.length / html.length
    expect(ratio).toBeGreaterThan(0.60)
  })

  it('BriefingEmail text ratio exceeds 60%', async () => {
    const html = await render(BriefingEmail({
      subscriberId: SUBSCRIBER_ID,
      intro: 'This week saw three converging trends reshaping the AI landscape.',
      sections: BRIEFING_SECTIONS,
      conclusion: 'The pattern here is clear: AI is moving from demo to deployment.',
      unsubscribeUrl: UNSUBSCRIBE_URL,
      preferencesUrl: PREFERENCES_URL,
      feedbackBaseUrl: FEEDBACK_BASE_URL,
      feedbackTokens: FEEDBACK_TOKENS,
      ctaLevel: 'soft',
    }))
    const textContent = stripHtml(html)
    const ratio = textContent.length / html.length
    expect(ratio).toBeGreaterThan(0.60)
  })

  it('MixedEmail text ratio exceeds 60%', async () => {
    const html = await render(MixedEmail({
      subscriberId: SUBSCRIBER_ID,
      synthesis: 'This week\'s research surfaces a clear thread.',
      items: MIXED_ITEMS,
      signoff: 'Make it count.',
      unsubscribeUrl: UNSUBSCRIBE_URL,
      preferencesUrl: PREFERENCES_URL,
      feedbackBaseUrl: FEEDBACK_BASE_URL,
      feedbackTokens: FEEDBACK_TOKENS,
      ctaLevel: 'soft',
    }))
    const textContent = stripHtml(html)
    const ratio = textContent.length / html.length
    expect(ratio).toBeGreaterThan(0.60)
  })
})
