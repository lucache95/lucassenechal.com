"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { TOPIC_CATEGORIES } from "@/lib/data/topics";
import type { OnboardingFormData } from "./stepper";

// ---------------------------------------------------------------------------
// Format display names
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<string, { name: string; description: string }> = {
  digest: { name: "Quick Digest", description: "Key headlines and summaries" },
  briefing: {
    name: "Deep Briefing",
    description: "In-depth analysis and context",
  },
  mixed: {
    name: "Mixed Format",
    description: "Headlines up top, deep dives below",
  },
};

const TIME_LABELS: Record<string, string> = {
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve subtopic slug IDs to human-readable names. */
function resolveTopicNames(slugIds: string[]): string[] {
  const names: string[] = [];
  for (const category of TOPIC_CATEGORIES) {
    for (const sub of category.subtopics) {
      if (slugIds.includes(sub.id)) {
        names.push(sub.name);
      }
    }
  }
  return names;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StepConfirmationProps {
  data: OnboardingFormData;
}

export function StepConfirmation({ data }: StepConfirmationProps) {
  const [copied, setCopied] = useState(false);

  // Fire confetti on mount
  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  const topicNames = resolveTopicNames(data.topics);
  const formatInfo = FORMAT_LABELS[data.format] ?? FORMAT_LABELS.digest;
  const timeLabel = TIME_LABELS[data.deliveryTime] ?? "morning";
  const feedCount = data.feedUrls.length;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://lucassenechal.com/newsletter");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback -- select and copy not available in all contexts
    }
  };

  const shareText = encodeURIComponent(
    "I just signed up for a personalized AI-researched daily briefing. Check it out:"
  );
  const shareUrl = encodeURIComponent("https://lucassenechal.com/newsletter");
  const twitterIntent = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent("Check out this AI briefing")}&body=${shareText}%20${shareUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className="py-8 text-center"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100"
        >
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          You&apos;re all set. Your edge starts tomorrow.
        </h2>
        <p className="mt-2 text-muted">
          Here&apos;s what we&apos;ll be researching just for you.
        </p>
      </div>

      {/* Choice Summary */}
      <div className="mx-auto max-w-md space-y-3 rounded-xl border border-border bg-surface p-5 text-left">
        {/* Topics */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Topics</p>
            <p className="text-sm text-muted">
              {topicNames.length > 0
                ? topicNames.join(", ")
                : "General briefing -- a curated mix of trending topics."}
            </p>
          </div>
        </div>

        {/* Custom Topics */}
        {data.customTopics && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-accent">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Custom Topics</p>
              <p className="text-sm text-muted">{data.customTopics}</p>
            </div>
          </div>
        )}

        {/* Format */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Format</p>
            <p className="text-sm text-muted">
              {formatInfo.name} -- {formatInfo.description}
            </p>
          </div>
        </div>

        {/* Delivery */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Delivery</p>
            <p className="text-sm text-muted">
              Every {timeLabel}
              {data.city ? ` in ${data.city}` : ""}
              {" "}({data.timezone})
            </p>
          </div>
        </div>

        {/* Sources */}
        {feedCount > 0 && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-accent">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Sources</p>
              <p className="text-sm text-muted">
                {feedCount} custom feed{feedCount !== 1 ? "s" : ""} added
              </p>
            </div>
          </div>
        )}

        {/* SMS */}
        {data.smsOptIn && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-accent">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">SMS Alerts</p>
              <p className="text-sm text-muted">SMS alerts enabled</p>
            </div>
          </div>
        )}
      </div>

      {/* First Delivery Expectation */}
      <div className="mx-auto mt-6 max-w-md rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-sm text-foreground">
          Your first briefing arrives tomorrow{" "}
          {timeLabel === "morning"
            ? "in the morning"
            : timeLabel === "afternoon"
              ? "in the afternoon"
              : "in the evening"}
          . Check your inbox (and spam folder).
        </p>
      </div>

      {/* Share / Referral CTA */}
      <div className="mx-auto mt-8 max-w-md">
        <p className="mb-3 text-sm font-medium text-foreground">
          Know someone who&apos;d want their own daily briefing?
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={twitterIntent}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share
          </a>
          <a
            href={mailtoLink}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        </div>
      </div>

      {/* Done link */}
      <div className="mt-8">
        <a
          href="/"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Visit homepage
        </a>
      </div>
    </motion.div>
  );
}
