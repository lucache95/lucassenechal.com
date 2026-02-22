"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

interface ConsultingHeroProps {
  onStart: () => void;
}

export function ConsultingHero({ onStart }: ConsultingHeroProps) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24 md:py-32">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        {/* Headline - F/G/E framework */}
        <motion.h1
          variants={childVariants}
          className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          Stop Losing Deals to Manual Follow-Ups
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={childVariants}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          I build AI systems that handle the admin, follow-ups, and repetitive
          ops dragging your team down -- so you close more and chase less.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={childVariants}
          className="mt-10 flex items-center justify-center"
        >
          <Button variant="primary" size="lg" onClick={onStart}>
            Tell Me About Your Business
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ConsultingHero;
