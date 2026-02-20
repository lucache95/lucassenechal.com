"use client";

import { motion } from "framer-motion";

const sources = [
  { name: "Brave Search", abbr: "B" },
  { name: "Reddit", abbr: "R" },
  { name: "X / Twitter", abbr: "X" },
  { name: "RSS Feeds", abbr: "RSS" },
  { name: "News APIs", abbr: "N" },
  { name: "AI-Powered", abbr: "AI" },
  { name: "HN / Forums", abbr: "HN" },
  { name: "Research Papers", abbr: "Rx" },
];

function SourceBadge({ source }: { source: (typeof sources)[number] }) {
  return (
    <div className="group flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 transition-colors duration-200 hover:border-accent/30 hover:bg-accent/5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted-foreground/10 font-mono text-[10px] font-bold uppercase text-muted transition-colors duration-200 group-hover:bg-accent/15 group-hover:text-accent">
        {source.abbr}
      </span>
      <span className="whitespace-nowrap text-sm font-medium text-muted transition-colors duration-200 group-hover:text-foreground">
        {source.name}
      </span>
    </div>
  );
}

export function TrustStrip() {
  return (
    <section className="overflow-hidden border-y border-border py-12">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-6 max-w-6xl px-6 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Sourced from across the web
        </p>
      </motion.div>

      {/* Marquee container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        {/* Scrolling track */}
        <div className="flex animate-marquee gap-4">
          {/* First set */}
          {sources.map((source) => (
            <SourceBadge key={`a-${source.name}`} source={source} />
          ))}
          {/* Duplicate for seamless loop */}
          {sources.map((source) => (
            <SourceBadge key={`b-${source.name}`} source={source} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
