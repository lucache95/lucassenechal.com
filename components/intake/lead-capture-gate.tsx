"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

interface LeadCaptureGateProps {
  onSubmit: (info: { email: string; name: string }) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadCaptureGate({ onSubmit }: LeadCaptureGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 1) {
      setError("Please enter your name.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({ email: trimmedEmail, name: trimmedName });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      className="flex min-h-[60vh] items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          One last thing before your plan
        </h2>
        <p className="mt-3 text-muted">
          We&apos;ll email you a copy and prepare for your call.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <div>
            <label
              htmlFor="capture-name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Name
            </label>
            <input
              id="capture-name"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="capture-email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Email
            </label>
            <input
              id="capture-email"
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-accent px-7 py-3.5 text-lg font-medium text-accent-foreground shadow-sm shadow-accent/20 hover:bg-accent-hover transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Preparing..." : "Generate My Plan"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default LeadCaptureGate;
