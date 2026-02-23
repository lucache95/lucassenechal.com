"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { toolLogos, type ToolLogo } from "@/lib/data/tool-logos";

function LogoBadge({ item }: { item: ToolLogo }) {
  return (
    <Link
      href={`/tools/${item.slug}`}
      className="group flex shrink-0 items-center justify-center rounded-xl p-4 transition-all duration-200 hover:bg-accent/5 hover:scale-110"
      title={item.name}
    >
      <span className="flex h-10 w-10 items-center justify-center transition-transform duration-200 group-hover:scale-110">
        {item.logo}
      </span>
    </Link>
  );
}

export function TrustStrip() {
  return (
    <section className="overflow-hidden border-y border-border py-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-6 max-w-6xl px-6 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Built with the best in the game
        </p>
      </motion.div>

      {/* Marquee container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

        {/* Scrolling track */}
        <div className="flex w-max animate-marquee items-center gap-10">
          {toolLogos.map((item) => (
            <LogoBadge key={`a-${item.slug}`} item={item} />
          ))}
          {toolLogos.map((item) => (
            <LogoBadge key={`b-${item.slug}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
