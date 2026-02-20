import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Lucas Senechal",
  description:
    "How Lucas Senechal collects, uses, and protects your personal information when you use lucassenechal.com and subscribe to our newsletter.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="last-updated">Last updated: February 20, 2026</p>

      <p>
        Lucas Senechal (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
        operates lucassenechal.com. This policy explains how we collect, use, and
        protect your personal information when you visit our website or subscribe
        to our newsletter service.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We collect the following information when you interact with our service:
      </p>
      <ul>
        <li>
          <strong>Email address</strong> (required for newsletter subscription)
        </li>
        <li>
          <strong>Topic preferences and customization choices</strong> (when
          provided during or after signup)
        </li>
        <li>
          <strong>Newsletter format preference</strong> (e.g., summary length,
          content style)
        </li>
        <li>
          <strong>Location</strong> (optional, for local content
          personalization)
        </li>
        <li>
          <strong>Delivery time preference</strong> (optional, to schedule your
          daily briefing)
        </li>
        <li>
          <strong>Phone number</strong> (optional, only if you opt in to SMS
          summaries)
        </li>
        <li>
          <strong>Usage data</strong> (page visits, email opens, and link clicks
          — collected automatically)
        </li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>
          Deliver personalized daily newsletter content tailored to your selected
          topics
        </li>
        <li>Send SMS summaries if you have opted in to text messages</li>
        <li>
          Improve content relevance and overall service quality based on
          aggregate usage patterns
        </li>
        <li>
          Communicate important service updates, policy changes, or maintenance
          notices
        </li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>
        We rely on trusted third-party providers to operate our service. Each
        provider only receives the minimum data necessary for their function:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> (database hosting) — Stores subscriber data
          securely with encryption at rest. See{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            supabase.com/privacy
          </a>
        </li>
        <li>
          <strong>Resend</strong> (email delivery) — Sends newsletter emails on
          our behalf. See{" "}
          <a
            href="https://resend.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            resend.com/legal/privacy-policy
          </a>
        </li>
        <li>
          <strong>Twilio</strong> (SMS delivery) — Sends text messages to
          subscribers who have opted in. See{" "}
          <a
            href="https://www.twilio.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            twilio.com/legal/privacy
          </a>
        </li>
        <li>
          <strong>Railway</strong> (website hosting) — Hosts the website and
          application infrastructure. See{" "}
          <a
            href="https://railway.app/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            railway.app/legal/privacy
          </a>
        </li>
        <li>
          <strong>Brave Search API</strong> — Used for content research purposes
          only. No subscriber data is shared with Brave.
        </li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We retain your data only for as long as necessary. Here are our specific
        retention timelines:
      </p>
      <ul>
        <li>
          <strong>Active subscriber data:</strong> Retained for the duration of
          your subscription. Your email, preferences, and personalization
          settings are kept as long as you remain subscribed.
        </li>
        <li>
          <strong>After unsubscribe:</strong> Your email address and preferences
          are deleted within 30 days of unsubscribing.
        </li>
        <li>
          <strong>Phone numbers:</strong> Deleted immediately upon SMS opt-out
          (texting STOP).
        </li>
        <li>
          <strong>SMS consent records:</strong> Retained for 5 years as required
          by TCPA (Telephone Consumer Protection Act) regulations.
        </li>
        <li>
          <strong>Usage analytics:</strong> Aggregated data is retained
          indefinitely for service improvement. Personal identifiers are removed
          from analytics data after 90 days.
        </li>
        <li>
          <strong>Immediate deletion:</strong> You can request immediate deletion
          of all your data at any time by emailing{" "}
          <a href="mailto:lucas@lucassenechal.com">lucas@lucassenechal.com</a>.
        </li>
      </ul>

      <h2>Your Rights</h2>
      <p>You have the following rights regarding your personal data:</p>
      <ul>
        <li>
          <strong>Access:</strong> Request a copy of all personal data we hold
          about you.
        </li>
        <li>
          <strong>Correction:</strong> Update your information at any time via
          the preference links included in every email.
        </li>
        <li>
          <strong>Deletion:</strong> Request complete deletion of your data by
          contacting us.
        </li>
        <li>
          <strong>Opt-out:</strong> Unsubscribe from emails via the one-click
          unsubscribe link in any email. For SMS, text STOP to any message.
        </li>
        <li>
          <strong>For GDPR residents:</strong> You additionally have the right to
          data portability (receive your data in a machine-readable format) and
          the right to object to processing of your personal data.
        </li>
      </ul>

      <h2>Cookies</h2>
      <ul>
        <li>
          We use <strong>essential cookies only</strong> for session management
          and basic site functionality.
        </li>
        <li>
          We do not use third-party advertising cookies or tracking cookies.
        </li>
        <li>
          No cookie consent banner is required as we only use strictly necessary
          cookies.
        </li>
      </ul>

      <h2>Security</h2>
      <p>We take the security of your data seriously:</p>
      <ul>
        <li>
          All data is encrypted in transit using HTTPS and at rest via Supabase
          encryption.
        </li>
        <li>
          Access controls strictly limit who can view subscriber data.
        </li>
        <li>
          We conduct regular security reviews of our infrastructure and
          dependencies.
        </li>
        <li>
          Database access is protected by Row Level Security (RLS) policies.
        </li>
      </ul>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. If we make
        significant changes that affect how your data is handled, we will notify
        active subscribers via email before the changes take effect. Minor
        clarifications or updates may be made without individual notice. The
        &ldquo;last updated&rdquo; date at the top of this page will always
        reflect the most recent revision.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this privacy policy, your data, or wish to
        exercise any of your rights, contact us at:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:lucas@lucassenechal.com">lucas@lucassenechal.com</a>
        </li>
        <li>
          <strong>Privacy requests:</strong>{" "}
          <a href="mailto:lucas@lucassenechal.com">lucas@lucassenechal.com</a>
        </li>
      </ul>
    </>
  );
}
