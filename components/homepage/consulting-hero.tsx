"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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

export function ConsultingHero() {
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
        {/* Headline */}
        <motion.h1
          variants={childVariants}
          className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          I Build AI Systems That Do Your Busywork
        </motion.h1>

        {/* Blurb */}
        <motion.p
          variants={childVariants}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          Repetitive admin, missed follow-ups, manual processes — I replace them
          with AI systems so your team scales revenue without scaling headcount.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={childVariants}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/work-with-me">
            <Button variant="primary" size="lg">
              Work With Me
            </Button>
          </Link>

          <div className="flex flex-col items-center gap-1">
            <Link href="/newsletter">
              <Button variant="secondary" size="md">
                Get the Daily Briefing
              </Button>
            </Link>
            <span className="text-sm text-muted">
              See what my AI builds every day
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ConsultingHero;
