"use client";

import { motion } from "framer-motion";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Answer Questions",
    description: "Tell me about your business, bottlenecks, and goals in a quick guided intake.",
  },
  {
    number: 2,
    title: "Get Your Plan",
    description: "Receive a custom automation plan tailored to your operations and budget.",
  },
  {
    number: 3,
    title: "Book a Call",
    description: "Jump on a free 15-minute call to walk through the plan and next steps.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col items-center gap-12 md:flex-row md:items-start md:justify-between md:gap-0">
          {/* Connecting line - desktop only */}
          <div className="pointer-events-none absolute top-8 right-16 left-16 hidden h-px bg-border md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
              }}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              {/* Numbered circle */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-background text-xl font-bold text-accent">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>

              {/* Description */}
              <p className="max-w-[220px] text-sm leading-relaxed text-muted">
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
