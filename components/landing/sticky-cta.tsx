"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { subscribeEmail } from "@/app/actions";

export function StickyCTA() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.08, 0.15], [0, 1]);
  const y = useTransform(scrollYProgress, [0.08, 0.15], [20, 0]);

  const [state, formAction, isPending] = useActionState(subscribeEmail, {});

  if (state.success) {
    return (
      <motion.div
        style={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-4 py-3">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-green-700">
            You&apos;re in! Check your inbox (and spam folder).
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md"
    >
      <div className="mx-auto max-w-3xl px-4 py-3">
        <form
          action={formAction}
          className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3"
        >
          <div className="flex w-full flex-1 items-center gap-2 sm:gap-3">
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              disabled={isPending}
              aria-label="Email address"
              className="py-2 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="shrink-0 whitespace-nowrap"
            >
              {isPending ? "Subscribing..." : "Start free"}
            </Button>
          </div>
          {state.error && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default StickyCTA;
