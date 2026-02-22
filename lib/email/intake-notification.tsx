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
} from "@react-email/components";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface IntakeNotificationEmailProps {
  name: string;
  email: string;
  businessDescription: string;
  recommendedService: string;
  questionCount: number;
  planSummary: string;
}

// ---------------------------------------------------------------------------
// Subject helper (exported for use in Server Action)
// ---------------------------------------------------------------------------

export function getIntakeNotificationSubject(
  name: string,
  recommendedService: string
): string {
  return `New Consulting Lead: ${name} — ${recommendedService}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntakeNotificationEmail({
  name,
  email,
  businessDescription,
  recommendedService,
  questionCount,
  planSummary,
}: IntakeNotificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body
        style={{
          backgroundColor: "#f8fafc",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            margin: "40px auto",
            maxWidth: "560px",
            padding: "40px 32px",
          }}
        >
          {/* Header */}
          <Heading
            style={{
              color: "#0f172a",
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: "1.3",
              margin: "0 0 8px 0",
            }}
          >
            New consulting lead just completed intake
          </Heading>

          <Text
            style={{
              color: "#64748b",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            Someone completed the consulting intake on lucassenechal.com. Here
            are the details:
          </Text>

          <Hr
            style={{
              borderColor: "#e2e8f0",
              borderWidth: "1px",
              margin: "0 0 24px 0",
            }}
          />

          {/* Lead Details */}
          <Section>
            <Text
              style={{
                color: "#334155",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                margin: "0 0 12px 0",
                textTransform: "uppercase" as const,
              }}
            >
              Lead Details
            </Text>

            <Text
              style={{
                color: "#0f172a",
                fontSize: "15px",
                lineHeight: "1.5",
                margin: "0 0 4px 0",
              }}
            >
              <strong>Name:</strong> {name}
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: "15px",
                lineHeight: "1.5",
                margin: "0 0 4px 0",
              }}
            >
              <strong>Email:</strong>{" "}
              <Link
                href={`mailto:${email}`}
                style={{ color: "#3b82f6", textDecoration: "underline" }}
              >
                {email}
              </Link>
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: "15px",
                lineHeight: "1.5",
                margin: "0 0 4px 0",
              }}
            >
              <strong>Recommended Service:</strong> {recommendedService}
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: "15px",
                lineHeight: "1.5",
                margin: "0 0 0 0",
              }}
            >
              <strong>Questions Answered:</strong> {questionCount}
            </Text>
          </Section>

          <Hr
            style={{
              borderColor: "#e2e8f0",
              borderWidth: "1px",
              margin: "24px 0",
            }}
          />

          {/* Business Description */}
          {businessDescription && (
            <>
              <Section>
                <Text
                  style={{
                    color: "#334155",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    margin: "0 0 8px 0",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Business Description
                </Text>
                <Text
                  style={{
                    color: "#475569",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: "0",
                    fontStyle: "italic",
                  }}
                >
                  {businessDescription}
                </Text>
              </Section>

              <Hr
                style={{
                  borderColor: "#e2e8f0",
                  borderWidth: "1px",
                  margin: "24px 0",
                }}
              />
            </>
          )}

          {/* Plan Summary */}
          {planSummary && (
            <>
              <Section>
                <Text
                  style={{
                    color: "#334155",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    margin: "0 0 8px 0",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Plan Summary (Goal Mirroring)
                </Text>
                <Text
                  style={{
                    color: "#475569",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: "0",
                  }}
                >
                  {planSummary}
                </Text>
              </Section>

              <Hr
                style={{
                  borderColor: "#e2e8f0",
                  borderWidth: "1px",
                  margin: "24px 0",
                }}
              />
            </>
          )}

          {/* Quick action */}
          <Text
            style={{
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "1.5",
              margin: "0",
            }}
          >
            <Link
              href={`mailto:${email}?subject=Re: Your AI Consulting Intake&body=Hi ${name},%0D%0A%0D%0AThanks for completing the intake on lucassenechal.com.`}
              style={{ color: "#3b82f6", textDecoration: "underline" }}
            >
              Reply to this lead
            </Link>
          </Text>
        </Container>

        {/* Footer */}
        <Container
          style={{
            margin: "0 auto",
            maxWidth: "560px",
            padding: "0 32px 40px",
          }}
        >
          <Text
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              lineHeight: "1.5",
              margin: "0",
              textAlign: "center" as const,
            }}
          >
            Lucas Senechal &middot; Consulting Intake Notification
            <br />
            This is an internal notification from lucassenechal.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default IntakeNotificationEmail;
