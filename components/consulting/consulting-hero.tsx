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
          What If AI Actually Worked For You?
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={childVariants}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          Not a chatbot demo. Not a slide deck. Real AI systems built for your
          business &mdash; live in weeks.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={childVariants}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <a
            href="https://cal.com/lucas-senechal/ai-discovery?overlayCalendar=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm shadow-accent/20 px-7 py-3.5 text-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Book an Intake Call
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ConsultingHero;
