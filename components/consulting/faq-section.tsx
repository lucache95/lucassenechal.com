"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How long does a typical project take?",
    answer:
      "It depends on scope. A focused MVP -- like an automated follow-up system or lead qualifier -- ships in 2-4 weeks. A full end-to-end automation suite takes 6-12 weeks. You'll get a timeline estimate in your custom plan before we ever hop on a call.",
  },
  {
    question: "What if I'm not sure what I need?",
    answer:
      "That's exactly what the intake is for. Answer a few questions about your business and bottlenecks, and I'll put together a plan that shows you where AI can make the biggest impact. No guesswork required on your end.",
  },
  {
    question: "Do I need technical expertise on my team?",
    answer:
      "No. I handle the technical side -- architecture, implementation, integrations, and maintenance. You focus on running your business. If you want your team to learn, I offer training and enablement too.",
  },
  {
    question: "What does the discovery call cost?",
    answer:
      "Nothing. It's a free 15-minute conversation to walk through your custom plan and see if we're a good fit. No obligation, no pressure. If it makes sense, I'll send a proposal.",
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-accent"
      >
        <span className="pr-4 text-base font-medium text-foreground md:text-lg">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-muted"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 0v14M0 7h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted md:text-base">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-t border-border"
        >
          {faqs.map((faq) => (
            <FAQAccordionItem key={faq.question} item={faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FAQSection;
