"use client";

import { motion } from "framer-motion";

export function WorkWithMeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-lg mx-auto px-6 text-center rounded-xl border border-border bg-surface p-8 md:p-12"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        Let&apos;s Build Something
      </h1>
      <p className="text-muted text-lg mb-2">
        I&apos;d love to hear what you&apos;re working on.
      </p>
      <p className="text-muted text-lg mb-8">
        Tell me about the repetitive work slowing your team down, and
        let&apos;s figure out what AI can take off your plate.
      </p>
      <a
        href="mailto:lucas@lucassenechal.com"
        className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-out bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm shadow-accent/20 px-7 py-3.5 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Email me at lucas@lucassenechal.com
      </a>
    </motion.div>
  );
}
