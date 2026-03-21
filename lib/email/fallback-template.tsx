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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FallbackEmailProps {
  subscriberId: string
  preferencesUrl: string
  unsubscribeUrl: string
}

// ---------------------------------------------------------------------------
// Component
//
// Uses hardcoded copy from UI-SPEC — sent when content generation failed or
// produced insufficient results. No feedback links, no consulting CTA (bad
// experience day — don't pitch).
// ---------------------------------------------------------------------------

export function FallbackEmail({
  subscriberId: _subscriberId,
  preferencesUrl,
  unsubscribeUrl,
}: FallbackEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          {/* Header */}
          <Heading style={emailStyles.heading}>The Daily Briefing</Heading>

          <Hr style={emailStyles.hr} />

          {/* Honest explanation */}
          <Text style={emailStyles.itemTitle}>Your briefing is light today</Text>
          <Text style={emailStyles.bodyText}>
            Today&apos;s research didn&apos;t turn up enough quality results for your topics.
            This can happen when news cycles are slow or your interests are very specific.
          </Text>

          {/* Suggestions */}
          <Text style={emailStyles.sectionLabel}>A few things that might help:</Text>

          <Text style={emailStyles.bodyText}>
            &bull; Add broader topic categories to cast a wider net
          </Text>
          <Text style={emailStyles.bodyText}>
            &bull; Check if your custom topics are too narrow
          </Text>
          <Text style={emailStyles.bodyText}>
            &bull; We&apos;ll keep looking &mdash; tomorrow&apos;s briefing will likely be fuller
          </Text>

          {/* CTA to update preferences */}
          <Section style={{ margin: '24px 0' }}>
            <Link href={preferencesUrl} style={emailStyles.ctaButton}>
              Update Your Preferences
            </Link>
          </Section>

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
