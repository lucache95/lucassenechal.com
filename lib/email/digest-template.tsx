import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
  Link,
} from '@react-email/components'
import { emailStyles } from './shared-styles'
import type { CtaLevel } from './cta-logic'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DigestEmailProps {
  subscriberId: string
  greeting: string
  items: Array<{ title: string; summary: string; url: string; sourceName: string }>
  signoff: string
  unsubscribeUrl: string
  preferencesUrl: string
  feedbackBaseUrl: string
  feedbackTokens: string[]  // one token per item, keyed to item.url
  ctaLevel: CtaLevel
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DigestEmail({
  subscriberId,
  greeting,
  items,
  signoff,
  unsubscribeUrl,
  preferencesUrl,
  feedbackBaseUrl,
  feedbackTokens,
  ctaLevel,
}: DigestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          {/* Header */}
          <Heading style={emailStyles.heading}>The Daily Briefing</Heading>

          {/* LLM-generated greeting */}
          <Text style={emailStyles.bodyText}>{greeting}</Text>

          <Hr style={emailStyles.hr} />

          {/* Item cards */}
          {items.map((item, i) => (
            <Section key={i} style={{ marginBottom: '16px' }}>
              <Text style={emailStyles.itemTitle}>{item.title}</Text>
              <Text style={emailStyles.itemSummary}>{item.summary}</Text>
              <Text style={emailStyles.sourceAttribution}>
                via{' '}
                <Link
                  href={item.url}
                  style={{ color: emailStyles.accent, textDecoration: 'none' }}
                >
                  {item.sourceName}
                </Link>
              </Text>
              <Text style={{ margin: '4px 0 0 0' }}>
                <Link
                  href={`${feedbackBaseUrl}?s=${subscriberId}&url=${encodeURIComponent(item.url)}&v=more&t=${feedbackTokens[i]}`}
                  style={emailStyles.feedbackMore}
                >
                  More like this
                </Link>
                <span style={emailStyles.feedbackSeparator}>{' / '}</span>
                <Link
                  href={`${feedbackBaseUrl}?s=${subscriberId}&url=${encodeURIComponent(item.url)}&v=less&t=${feedbackTokens[i]}`}
                  style={emailStyles.feedbackLess}
                >
                  Less like this
                </Link>
              </Text>
            </Section>
          ))}

          {/* Signoff */}
          <Text style={{ ...emailStyles.bodyText, margin: '16px 0' }}>{signoff}</Text>

          <Hr style={emailStyles.hr} />

          {/* Consulting CTA section */}
          {ctaLevel === 'soft' ? (
            <Text style={emailStyles.bodyText}>
              Need AI systems that handle the busywork?{' '}
              <Link
                href="https://lucassenechal.com/work-with-me"
                style={{ color: emailStyles.accent }}
              >
                See how I can help
              </Link>
            </Text>
          ) : (
            <Section style={emailStyles.ctaBox}>
              <Text style={{ ...emailStyles.itemTitle, margin: '0 0 8px 0' }}>
                Need AI systems that handle the busywork?
              </Text>
              <Text style={{ ...emailStyles.bodyText, margin: '0 0 16px 0' }}>
                I build automation that eliminates repetitive admin and follow-ups.
              </Text>
              <Link
                href="https://lucassenechal.com/work-with-me"
                style={emailStyles.ctaButton}
              >
                See How I Can Help
              </Link>
            </Section>
          )}

          <Hr style={emailStyles.hr} />

          {/* Footer links */}
          <Text style={emailStyles.footerLink}>
            <Link
              href={preferencesUrl}
              style={{ color: emailStyles.accent, textDecoration: 'underline' }}
            >
              Update your preferences
            </Link>
            {' | '}
            <Link
              href={unsubscribeUrl}
              style={{ color: '#64748b', textDecoration: 'underline' }}
            >
              Unsubscribe
            </Link>
          </Text>
        </Container>

        {/* Brand footer */}
        <Container
          style={{ margin: '0 auto', maxWidth: '560px', padding: '0 32px 40px' }}
        >
          <Text style={emailStyles.small}>
            Lucas Senechal &middot; The Daily Briefing
            <br />
            You&apos;re receiving this because you subscribed at lucassenechal.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
