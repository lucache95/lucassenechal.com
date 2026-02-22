"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { motion } from "framer-motion";

interface CalEmbedProps {
  spotCount: number;
  spotMonth: string;
}

declare global {
  interface Window {
    Cal?: (...args: unknown[]) => void;
  }
}

export function CalEmbed({ spotCount, spotMonth }: CalEmbedProps) {
  const initialized = useRef(false);

  function handleScriptLoad() {
    if (initialized.current) return;
    initialized.current = true;

    if (typeof window !== "undefined" && window.Cal) {
      window.Cal("init", { origin: "https://cal.com" });
      window.Cal("inline", {
        elementOrSelector: "#cal-embed",
        calLink: "lucas-senechal",
        layout: "month_view",
      });
    }
  }

  // Also try to initialize if script was already loaded (cached)
  useEffect(() => {
    if (typeof window !== "undefined" && window.Cal && !initialized.current) {
      handleScriptLoad();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      className="mx-auto max-w-3xl px-6 py-12"
    >
      {/* Heading */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Book Your Discovery Call
        </h2>
        <p className="mt-3 text-muted">
          15 minutes, no obligation. Let&apos;s see if we&apos;re a fit.
        </p>

        {/* Urgency badge */}
        {spotCount > 0 && spotMonth && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-amber-800">
              {spotCount} {spotCount === 1 ? "spot" : "spots"} left for{" "}
              {spotMonth}
            </span>
          </div>
        )}
      </div>

      {/* Cal.com embed container */}
      <div
        id="cal-embed"
        className="rounded-lg border border-border bg-surface overflow-hidden"
        style={{ minHeight: "500px" }}
      />

      {/* Reassurance text */}
      <p className="mt-6 text-center text-sm text-muted">
        All your intake data will be ready for our call.
      </p>

      {/* Load Cal.com embed script */}
      <Script
        src="https://app.cal.com/embed/embed.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
    </motion.div>
  );
}

export default CalEmbed;
