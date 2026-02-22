"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { subscribeEmail } from "@/app/actions";

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
  const [state, formAction, isPending] = useActionState(subscribeEmail, {});

  // Redirect to onboarding after successful email capture
  useEffect(() => {
    if (state.success && state.subscriberId) {
      const timer = setTimeout(() => {
        window.location.href = `/onboarding?subscriber=${state.subscriberId}`;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.subscriberId]);

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 pt-12 pb-6">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        {/* Badge */}
        <motion.div variants={childVariants} className="mb-6">
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
        <motion.div variants={childVariants} className="mx-auto mt-8 max-w-md">
          {state.success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              className="rounded-xl border border-green-200 bg-green-50 p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 12 }}
                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100"
              >
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-lg font-medium text-green-800">
                You&apos;re in!
              </p>
              <p className="mt-1 text-sm text-green-600">
                Taking you to customize your briefing...
              </p>
            </motion.div>
          ) : (
            <form action={formAction} className="flex flex-col gap-3">
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                disabled={isPending}
                aria-label="Email address"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
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
                    Subscribing...
                  </span>
                ) : (
                  "Start free"
                )}
              </Button>
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
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
