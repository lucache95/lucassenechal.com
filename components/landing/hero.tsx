"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

export function HeroSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Placeholder -- will wire to Server Action in Plan 03
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("success");
  }

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        {/* Badge */}
        <motion.div variants={childVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Free while in beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={childVariants}
          className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Your daily edge,{" "}
          <span className="text-accent">researched by AI</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={childVariants}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
        >
          Tell us what you care about. Every morning, get a briefing with the
          best links, insights, and updates — curated from across the web, just for you.
        </motion.p>

        {/* Email capture form */}
        <motion.div variants={childVariants} className="mx-auto mt-10 max-w-md">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-green-200 bg-green-50 p-6 text-center"
            >
              <p className="text-lg font-medium text-green-800">
                You&apos;re in.
              </p>
              <p className="mt-1 text-sm text-green-600">
                Check your inbox — your first briefing is on its way.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                disabled={status === "loading"}
                aria-label="Email address"
              />
              <Button
                type="submit"
                size="lg"
                disabled={status === "loading"}
                className="w-full"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Joining...
                  </span>
                ) : (
                  "Start free"
                )}
              </Button>
              {status === "error" && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
              <p className="text-xs text-muted-foreground">
                No spam. Unsubscribe anytime. Your topics, your rules.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
