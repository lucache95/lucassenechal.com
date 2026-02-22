"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OnboardingFormData } from "./stepper";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepSourcesProps {
  feedUrls: string[];
  smsOptIn: boolean;
  phone: string;
  onUpdate: (payload: Partial<OnboardingFormData>) => void;
}

// ---------------------------------------------------------------------------
// URL validation helper
// ---------------------------------------------------------------------------

function validateFeedUrl(url: string): string | null {
  if (url.trim() === "") return null; // Empty is fine (optional)
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP/HTTPS URLs are allowed";
    }
    return null;
  } catch {
    return "Please enter a valid URL";
  }
}

// ---------------------------------------------------------------------------
// Phone validation helper
// ---------------------------------------------------------------------------

function validatePhone(phone: string): string | null {
  if (phone.trim() === "") return "Phone number is required when SMS is enabled";
  // Strip common formatting characters for validation
  const digits = phone.replace(/[\s\-().]/g, "");
  if (!/^\+?[1-9]\d{6,14}$/.test(digits)) {
    return "Enter a valid phone number (e.g., +1 555 123 4567)";
  }
  return null;
}

// ---------------------------------------------------------------------------
// SMS benefit data
// ---------------------------------------------------------------------------

const SMS_BENEFITS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    text: "Breaking alerts when big news drops in your topics",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    text: "Quick daily summaries you can read in 30 seconds",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    text: "Ask follow-up questions about your report via text",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepSources({ feedUrls, smsOptIn, phone, onUpdate }: StepSourcesProps) {
  // Local state for URL inputs (allows empty drafts before committing to parent)
  const [urlInputs, setUrlInputs] = useState<string[]>(
    feedUrls.length > 0 ? feedUrls : [""]
  );
  const [urlErrors, setUrlErrors] = useState<(string | null)[]>([null]);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ----- URL handlers -----

  const updateUrlInput = (index: number, value: string) => {
    const next = [...urlInputs];
    next[index] = value;
    setUrlInputs(next);

    // Validate on change
    const nextErrors = [...urlErrors];
    nextErrors[index] = value.trim() ? validateFeedUrl(value) : null;
    setUrlErrors(nextErrors);

    // Commit valid, non-empty URLs to parent state
    const validUrls = next.filter((u, i) => {
      if (u.trim() === "") return false;
      const err = i === index ? nextErrors[i] : validateFeedUrl(u);
      return err === null;
    });
    onUpdate({ feedUrls: validUrls });
  };

  const addUrlInput = () => {
    setUrlInputs([...urlInputs, ""]);
    setUrlErrors([...urlErrors, null]);
  };

  const removeUrlInput = (index: number) => {
    if (urlInputs.length === 1) {
      // Clear instead of removing the last one
      setUrlInputs([""]);
      setUrlErrors([null]);
      onUpdate({ feedUrls: [] });
      return;
    }
    const next = urlInputs.filter((_, i) => i !== index);
    const nextErrors = urlErrors.filter((_, i) => i !== index);
    setUrlInputs(next);
    setUrlErrors(nextErrors);

    // Re-commit valid URLs
    const validUrls = next.filter((u, i) => {
      if (u.trim() === "") return false;
      return nextErrors[i] === null && validateFeedUrl(u) === null;
    });
    onUpdate({ feedUrls: validUrls });
  };

  // ----- SMS handlers -----

  const handleSmsToggle = (optIn: boolean) => {
    onUpdate({ smsOptIn: optIn, phone: optIn ? phone : "" });
    if (!optIn) setPhoneError(null);
  };

  const handlePhoneChange = (value: string) => {
    onUpdate({ phone: value });
    if (value.trim()) {
      setPhoneError(validatePhone(value));
    } else {
      setPhoneError(null);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* F/G/E header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Supercharge your briefing
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-muted">
          Add your own sources and get alerts on the go.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* RSS / Atom Feeds Section */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Custom sources <span className="text-muted-foreground">(optional)</span>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste RSS or Atom feed URLs and we&apos;ll monitor them daily for you.
            Get insights others won&apos;t even know exist.
          </p>
        </div>

        <div className="space-y-2">
          {urlInputs.map((url, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={url}
                  onChange={(e) => updateUrlInput(index, e.target.value)}
                  className={urlErrors[index] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}
                />
                {urlErrors[index] && (
                  <p className="mt-1 text-xs text-red-500">{urlErrors[index]}</p>
                )}
              </div>
              {/* Remove button -- show if more than one input OR if the single input has content */}
              {(urlInputs.length > 1 || url.trim() !== "") && (
                <button
                  type="button"
                  onClick={() => removeUrlInput(index)}
                  className="mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Remove URL"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addUrlInput}
          className="gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add another source
        </Button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SMS Opt-In Section */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Benefits pitch card (always visible) */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-base font-semibold text-foreground">
            Get briefing alerts on your phone
          </h3>
          <ul className="mt-4 space-y-3">
            {SMS_BENEFITS.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-accent">{benefit.icon}</span>
                <span className="text-sm text-muted">{benefit.text}</span>
              </li>
            ))}
          </ul>

          {/* Toggle buttons */}
          <div className="mt-5 flex items-center gap-3">
            <Button
              type="button"
              variant={smsOptIn ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleSmsToggle(true)}
            >
              Yes, add SMS alerts
            </Button>
            <Button
              type="button"
              variant={!smsOptIn ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleSmsToggle(false)}
            >
              No thanks
            </Button>
          </div>
        </div>

        {/* Phone input -- revealed on opt-in */}
        <AnimatePresence>
          {smsOptIn && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-1">
                <label htmlFor="phone-input" className="block text-sm font-medium text-foreground">
                  Your phone number
                </label>
                <Input
                  id="phone-input"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={phoneError ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}
                />
                {phoneError && (
                  <p className="text-xs text-red-500">{phoneError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We&apos;ll only text you about your briefing. Reply STOP anytime.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
