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

interface PlanDeliveryEmailProps {
  name: string;
  goalMirroring: string;
  bottleneck: string;
  steps: { title: string; description: string }[];
  tools: string[];
  phases: { phase: string; duration: string }[];
  totalRange: string;
  timeline: string;
  recommendedService: string;
}

// ---------------------------------------------------------------------------
// Subject helper
// ---------------------------------------------------------------------------

export function getPlanDeliverySubject(name: string): string {
  return `${name}, here's your custom AI automation plan`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanDeliveryEmail({
  name,
  goalMirroring,
  bottleneck,
  steps,
  tools,
  phases,
  totalRange,
  timeline,
  recommendedService,
}: PlanDeliveryEmailProps) {
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
            Your Custom Business Plan
          </Heading>

          <Text
            style={{
              color: "#64748b",
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            Hi {name}, here&apos;s the plan we built from your intake answers.
            Save this email for reference.
          </Text>

          <Hr style={{ borderColor: "#e2e8f0", borderWidth: "1px", margin: "0 0 24px 0" }} />

          {/* Goal Mirroring */}
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
              Your Situation
            </Text>
            <Text
              style={{
                color: "#475569",
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0",
                fontStyle: "italic",
                borderLeft: "3px solid #3b82f6",
                paddingLeft: "12px",
              }}
            >
              {goalMirroring}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e2e8f0", borderWidth: "1px", margin: "24px 0" }} />

          {/* Bottleneck */}
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
              Core Bottleneck
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0",
              }}
            >
              {bottleneck}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e2e8f0", borderWidth: "1px", margin: "24px 0" }} />

          {/* Proposed Steps */}
          {steps.length > 0 && (
            <>
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
                  Proposed System
                </Text>
                {steps.map((step, i) => (
                  <Section key={i} style={{ marginBottom: "12px" }}>
                    <Text
                      style={{
                        color: "#0f172a",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "1.4",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {i + 1}. {step.title}
                    </Text>
                    <Text
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        margin: "0",
                      }}
                    >
                      {step.description}
                    </Text>
                  </Section>
                ))}
              </Section>

              <Hr style={{ borderColor: "#e2e8f0", borderWidth: "1px", margin: "24px 0" }} />
            </>
          )}

          {/* Tools */}
          {tools.length > 0 && (
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
                Tools & Integrations
              </Text>
              <Text
                style={{
                  color: "#0f172a",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0",
                }}
              >
                {tools.join(" · ")}
              </Text>
            </Section>
          )}

          <Hr style={{ borderColor: "#e2e8f0", borderWidth: "1px", margin: "24px 0" }} />

          {/* Phases */}
          {phases.length > 0 && (
            <>
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
                  Implementation Phases
                </Text>
                {phases.map((p, i) => (
                  <Text
                    key={i}
                    style={{
                      color: "#0f172a",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0 0 4px 0",
                    }}
                  >
                    <strong>{p.phase}</strong> — {p.duration}
                  </Text>
                ))}
              </Section>

              <Hr style={{ borderColor: "#e2e8f0", borderWidth: "1px", margin: "24px 0" }} />
            </>
          )}

          {/* Estimate */}
          <Section
            style={{
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
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
              Estimate
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "1.3",
                margin: "0 0 4px 0",
              }}
            >
              {totalRange}
            </Text>
            <Text
              style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.5",
                margin: "0",
              }}
            >
              Timeline: {timeline} · Recommended: {recommendedService}
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: "center" as const }}>
            <Link
              href="https://cal.com/lucas-senechal"
              style={{
                backgroundColor: "#3b82f6",
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 28px",
                textDecoration: "none",
              }}
            >
              Book Your Discovery Call
            </Link>
            <Text
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                lineHeight: "1.5",
                margin: "12px 0 0 0",
              }}
            >
              15 minutes, no obligation. I&apos;ll review your plan before we talk.
            </Text>
          </Section>
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
            Lucas Senechal &middot; AI Systems Consulting
            <br />
            You received this because you requested a plan at lucassenechal.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PlanDeliveryEmail;
