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

export function NewsletterTeaser() {
  return (
    <section className="border-t border-border bg-surface-hover px-6 py-16 md:py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.p
          variants={childVariants}
          className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Proof of work
        </motion.p>

        <motion.h2
          variants={childVariants}
          className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl"
        >
          The Daily Briefing
        </motion.h2>

        <motion.p
          variants={childVariants}
          className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-muted md:text-lg"
        >
          Every day, my AI researches and writes a personalized briefing for
          each subscriber. It is the best demo of what I build.
        </motion.p>

        <motion.div variants={childVariants}>
          <Link href="/newsletter">
            <Button variant="secondary" size="md">
              Get the Daily Briefing
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default NewsletterTeaser;
