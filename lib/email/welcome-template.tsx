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
// Sample briefing items by topic category
// ---------------------------------------------------------------------------

const SAMPLE_ITEMS: Record<string, { title: string; summary: string }[]> = {
  "Technology & AI": [
    {
      title: "OpenAI Expands GPT-5 Preview Access",
      summary:
        "The latest model shows 40% improvement on reasoning benchmarks, with expanded tool-use capabilities rolling out this week.",
    },
    {
      title: "VS Code Gets Native AI Code Review",
      summary:
        "Microsoft ships built-in AI-powered code review that catches bugs before they reach production.",
    },
    {
      title: "Rust Adoption Hits New High in Enterprise",
      summary:
        "Survey shows 62% of Fortune 500 companies now use Rust in production systems.",
    },
  ],
  "Business & Finance": [
    {
      title: "Fed Signals Rate Pause Through Q3",
      summary:
        "Markets rally as the Federal Reserve indicates it will hold rates steady, citing improving inflation data.",
    },
    {
      title: "Stripe Launches AI-Powered Revenue Forecasting",
      summary:
        "New tool predicts MRR with 94% accuracy using transaction pattern analysis.",
    },
    {
      title: "Remote Work Premium Reaches 8% in Tech Salaries",
      summary:
        "Fully remote roles now command measurable salary premiums over hybrid positions.",
    },
  ],
  default: [
    {
      title: "AI Tools Are Reshaping Daily Workflows",
      summary:
        "New research shows knowledge workers save 2.5 hours per day with AI-assisted task management.",
    },
    {
      title: "The Rise of Micro-SaaS Businesses",
      summary:
        "Solo founders are building profitable software businesses with lean AI-powered stacks.",
    },
    {
      title: "Morning Routines of High-Performers",
      summary:
        "Neuroscience-backed habits that compound into measurable productivity gains.",
    },
    {
      title: "Local Food Scene: Hidden Gems This Week",
      summary:
        "Three new restaurants making waves with innovative approaches to seasonal ingredients.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<string, string> = {
  digest: "Quick Digest",
  briefing: "Deep Briefing",
  mixed: "Mixed Format",
};

const TIME_LABELS: Record<string, string> = {
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
};

function getSampleItems(topics: string[]) {
  // Try to find sample items matching the first topic category name
  for (const topic of topics) {
    for (const [key, items] of Object.entries(SAMPLE_ITEMS)) {
      if (key !== "default" && topic.toLowerCase().includes(key.toLowerCase().split(" ")[0])) {
        return items;
      }
    }
  }
  return SAMPLE_ITEMS.default;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WelcomeEmailProps {
  topics: string[];
  customTopics: string;
  format: string;
  deliveryTime: string;
}

export function WelcomeEmail({
  topics = [],
  customTopics = "",
  format = "digest",
  deliveryTime = "morning",
}: WelcomeEmailProps) {
  const formatLabel = FORMAT_LABELS[format] ?? "Quick Digest";
  const timeLabel = TIME_LABELS[deliveryTime] ?? "morning";
  const sampleItems = getSampleItems(topics);

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
            Your daily edge starts tomorrow.
          </Heading>

          <Text
            style={{
              color: "#64748b",
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            Welcome aboard. Your personalized briefing is being prepared right
            now. Here&apos;s a preview of what your first delivery will look
            like:
          </Text>

          <Hr
            style={{
              borderColor: "#e2e8f0",
              borderWidth: "1px",
              margin: "0 0 24px 0",
            }}
          />

          {/* Sample Briefing Preview */}
          <Section>
            <Text
              style={{
                color: "#334155",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                margin: "0 0 16px 0",
                textTransform: "uppercase" as const,
              }}
            >
              Sample Briefing Preview
            </Text>

            {sampleItems.map((item, i) => (
              <Section key={i} style={{ marginBottom: "16px" }}>
                <Text
                  style={{
                    color: "#0f172a",
                    fontSize: "15px",
                    fontWeight: 600,
                    lineHeight: "1.4",
                    margin: "0 0 4px 0",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    margin: "0",
                  }}
                >
                  {item.summary}
                </Text>
              </Section>
            ))}
          </Section>

          <Hr
            style={{
              borderColor: "#e2e8f0",
              borderWidth: "1px",
              margin: "24px 0",
            }}
          />

          {/* Format & Delivery Info */}
          <Text
            style={{
              color: "#334155",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0 0 4px 0",
            }}
          >
            Delivered as a{" "}
            <strong>{formatLabel}</strong> every{" "}
            <strong>{timeLabel}</strong>.
          </Text>

          {topics.length > 0 && (
            <Text
              style={{
                color: "#64748b",
                fontSize: "13px",
                lineHeight: "1.5",
                margin: "4px 0 0 0",
              }}
            >
              Covering: {topics.join(", ")}
              {customTopics ? `, ${customTopics}` : ""}
            </Text>
          )}

          <Hr
            style={{
              borderColor: "#e2e8f0",
              borderWidth: "1px",
              margin: "24px 0",
            }}
          />

          {/* Spam folder note */}
          <Text
            style={{
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "1.5",
              margin: "0 0 16px 0",
            }}
          >
            Check your spam folder and mark us as &quot;not spam&quot; to never
            miss a briefing.
          </Text>

          {/* Preferences link placeholder */}
          <Text
            style={{
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "1.5",
              margin: "0",
            }}
          >
            <Link
              href="https://lucassenechal.com/newsletter"
              style={{ color: "#3b82f6", textDecoration: "underline" }}
            >
              Update your preferences anytime
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
            Lucas Senechal &middot; The Daily Briefing
            <br />
            You received this because you signed up at lucassenechal.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
