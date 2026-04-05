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

        {/* Call value prop */}
        <motion.div
          variants={childVariants}
          className="mx-auto mt-10 max-w-xl text-left"
        >
          <p className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-muted">
            Free 30-minute strategy call
          </p>
          <ul className="space-y-3 text-base text-muted">
            <li className="flex items-start gap-3">
              <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              Where AI can save you the most time and money right now
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              What tools and workflows make sense for your business
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              A realistic roadmap to start seeing results fast
            </li>
          </ul>
          <p className="mt-4 text-center text-sm text-muted">
            Come with your biggest operational headache. Leave with a clear direction.
          </p>
        </motion.div>

        {/* Guarantees */}
        <motion.div
          variants={childVariants}
          className="mx-auto mt-10 max-w-xl"
        >
          <p className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-muted">
            You will walk away with
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "A clear picture of where AI fits in your business",
              "2-3 specific automations you can implement immediately",
              "Honest assessment of what's worth building vs. not",
              "A prioritized roadmap with realistic timelines",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-surface p-3"
              >
                <span className="mt-0.5 text-accent text-sm">&#10003;</span>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Even if we never work together, you leave with a plan you can act on.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={childVariants}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <a
            href="https://cal.com/lucas-senechal/ai-discovery?overlayCalendar=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm shadow-accent/20 px-7 py-3.5 text-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Book an Intake Call
          </a>
          <p className="text-xs text-muted">No fluff. No sales pitch. Just clarity.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ConsultingHero;
