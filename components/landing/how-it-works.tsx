"use client";

import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Tell us what matters to you",
    description:
      "Describe your interests in plain English — or pick from categories. AI tools, local events, market trends, fitness research. Whatever keeps you sharp.",
  },
  {
    number: "02",
    title: "AI researches it overnight",
    description:
      "While you sleep, your AI scans multiple sources — news, forums, databases, feeds. It finds the signal, skips the noise, and verifies every link.",
  },
  {
    number: "03",
    title: "Wake up informed",
    description:
      "A personalized briefing hits your inbox every morning. Concise summaries, real links, zero fluff. You're the most prepared person in the room.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface-hover px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted sm:text-lg">
            Three steps. Zero effort. Maximum signal.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop only) */}
          <div className="pointer-events-none absolute inset-x-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
              }}
              className="relative text-center"
            >
              {/* Step number */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
                <span className="font-mono text-2xl font-bold text-accent">
                  {step.number}
                </span>
              </div>

              {/* Step content */}
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
