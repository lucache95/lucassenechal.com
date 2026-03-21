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

interface BriefingEmailProps {
  subscriberId: string
  intro: string
  sections: Array<{ heading: string; body: string; sourceUrls: string[] }>
  conclusion: string
  unsubscribeUrl: string
  preferencesUrl: string
  feedbackBaseUrl: string
  feedbackTokens: string[]  // one per section, keyed to first sourceUrl of each section
  ctaLevel: CtaLevel
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BriefingEmail({
  subscriberId,
  intro,
  sections,
  conclusion,
  unsubscribeUrl,
  preferencesUrl,
  feedbackBaseUrl,
  feedbackTokens,
  ctaLevel,
}: BriefingEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          {/* Header */}
          <Heading style={emailStyles.heading}>The Daily Briefing</Heading>

          {/* LLM-generated intro */}
          <Text style={emailStyles.bodyText}>{intro}</Text>

          <Hr style={emailStyles.hr} />

          {/* Narrative sections */}
          {sections.map((section, i) => {
            // Use first sourceUrl as identifier; fall back to URL-encoded heading
            const sectionIdentifier =
              section.sourceUrls.length > 0
                ? section.sourceUrls[0]
                : encodeURIComponent(section.heading)

            return (
              <Section
                key={i}
                style={{ marginBottom: '24px' }}
              >
                {/* Uppercase section label -- textTransform: 'uppercase' via sectionLabel */}
                <Text style={{ ...emailStyles.sectionLabel, textTransform: 'uppercase' }}>{section.heading}</Text>

                {/* Narrative body — briefing uses darker #475569 for readability */}
                <Text
                  style={{
                    ...emailStyles.bodyText,
                    color: '#475569',
                  }}
                >
                  {section.body}
                </Text>

                {/* Feedback links */}
                <Text style={{ margin: '4px 0 0 0' }}>
                  <Link
                    href={`${feedbackBaseUrl}?s=${subscriberId}&url=${encodeURIComponent(sectionIdentifier)}&v=more&t=${feedbackTokens[i]}`}
                    style={emailStyles.feedbackMore}
                  >
                    More like this
                  </Link>
                  <span style={emailStyles.feedbackSeparator}>{' / '}</span>
                  <Link
                    href={`${feedbackBaseUrl}?s=${subscriberId}&url=${encodeURIComponent(sectionIdentifier)}&v=less&t=${feedbackTokens[i]}`}
                    style={emailStyles.feedbackLess}
                  >
                    Less like this
                  </Link>
                </Text>
              </Section>
            )
          })}

          <Hr style={emailStyles.hr} />

          {/* LLM-generated conclusion */}
          <Text style={emailStyles.bodyText}>{conclusion}</Text>

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
