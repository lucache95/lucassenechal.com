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

interface MixedEmailProps {
  subscriberId: string
  synthesis: string
  items: Array<{ title: string; oneLiner: string; url: string; sourceName: string }>
  signoff: string
  unsubscribeUrl: string
  preferencesUrl: string
  feedbackBaseUrl: string
  feedbackTokens: string[]  // one per item, keyed to item.url
  ctaLevel: CtaLevel
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MixedEmail({
  subscriberId,
  synthesis,
  items,
  signoff,
  unsubscribeUrl,
  preferencesUrl,
  feedbackBaseUrl,
  feedbackTokens,
  ctaLevel,
}: MixedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          {/* Header */}
          <Heading style={emailStyles.heading}>The Daily Briefing</Heading>

          {/* LLM-generated synthesis */}
          <Text style={emailStyles.bodyText}>{synthesis}</Text>

          <Hr style={emailStyles.hr} />

          {/* Mixed items — title linked to source URL */}
          {items.map((item, i) => (
            <Section key={i} style={{ marginBottom: '16px' }}>
              {/* Title is a linked headline (accent color, 15px/600) */}
              <Text style={{ ...emailStyles.itemTitle, margin: '0 0 4px 0' }}>
                <Link
                  href={item.url}
                  style={{ color: emailStyles.accent, textDecoration: 'none' }}
                >
                  {item.title}
                </Link>
              </Text>

              {/* One-liner: 13px, #64748b */}
              <Text
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 400,
                  lineHeight: '1.5',
                  margin: '0 0 4px 0',
                }}
              >
                {item.oneLiner}
              </Text>

              {/* Source attribution */}
              <Text style={emailStyles.sourceAttribution}>
                via{' '}
                <Link
                  href={item.url}
                  style={{ color: emailStyles.accent, textDecoration: 'none' }}
                >
                  {item.sourceName}
                </Link>
              </Text>

              {/* Feedback links use actual item URLs */}
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

          <Hr style={emailStyles.hr} />

          {/* LLM-generated signoff */}
          <Text style={emailStyles.bodyText}>{signoff}</Text>

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
