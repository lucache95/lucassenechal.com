"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function StickyCTA() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.08, 0.15], [0, 1]);
  const y = useTransform(scrollYProgress, [0.08, 0.15], [20, 0]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("sticky-email") as string;

    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    // Placeholder -- will wire to Server Action in Plan 03
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <motion.div
        style={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-3">
          <p className="text-sm font-medium text-green-700">
            You&apos;re in! Check your inbox for your first briefing.
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
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3"
        >
          <div className="flex w-full flex-1 items-center gap-2 sm:gap-3">
            <Input
              type="email"
              name="sticky-email"
              placeholder="you@example.com"
              required
              disabled={status === "loading"}
              aria-label="Email address"
              className="py-2 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={status === "loading"}
              className="shrink-0 whitespace-nowrap"
            >
              {status === "loading" ? "Joining..." : "Start free"}
            </Button>
          </div>
          {status === "error" && (
            <p className="text-xs text-red-500">Please enter a valid email.</p>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default StickyCTA;
