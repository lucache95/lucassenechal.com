"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultingHero } from "@/components/consulting/consulting-hero";
import { ServiceGrid } from "@/components/consulting/service-grid";
import { HowItWorks } from "@/components/consulting/how-it-works";
import { FAQSection } from "@/components/consulting/faq-section";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Footer } from "@/components/landing/footer";
import { IntakeContainer } from "@/components/intake/intake-container";
import type { IntakeAnswer } from "@/lib/schemas/intake";

export type FunnelStage =
  | "landing"
  | "intake"
  | "generating"
  | "plan"
  | "booking"
  | "complete";

const stageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

export function WorkWithMeClient() {
  const [stage, setStage] = useState<FunnelStage>("landing");
  const [answers, setAnswers] = useState<IntakeAnswer[]>([]);

  // Scroll to top when stage changes
  useEffect(() => {
    if (stage !== "landing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stage]);

  return (
    <AnimatePresence mode="wait">
      {stage === "landing" && (
        <motion.div
          key="landing"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ConsultingHero onStart={() => setStage("intake")} />
          <ServiceGrid />
          <HowItWorks />
          <TrustStrip />
          <FAQSection />
          <Footer />
        </motion.div>
      )}

      {stage === "intake" && (
        <motion.div
          key="intake"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <IntakeContainer
            onComplete={(intakeAnswers) => {
              setAnswers(intakeAnswers);
              setStage("generating");
            }}
            onBack={() => setStage("landing")}
          />
        </motion.div>
      )}

      {stage === "generating" && (
        <motion.div
          key="generating"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-[60vh] items-center justify-center px-6 py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Generating your plan...
            </h2>
            <p className="mt-4 text-muted">
              Plan generation placeholder.
            </p>
          </div>
        </motion.div>
      )}

      {stage === "plan" && (
        <motion.div
          key="plan"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-[60vh] items-center justify-center px-6 py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Your Custom Plan
            </h2>
            <p className="mt-4 text-muted">
              Plan display placeholder.
            </p>
          </div>
        </motion.div>
      )}

      {stage === "booking" && (
        <motion.div
          key="booking"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-[60vh] items-center justify-center px-6 py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Book Your Call
            </h2>
            <p className="mt-4 text-muted">
              Booking placeholder.
            </p>
          </div>
        </motion.div>
      )}

      {stage === "complete" && (
        <motion.div
          key="complete"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-[60vh] items-center justify-center px-6 py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              You're All Set
            </h2>
            <p className="mt-4 text-muted">
              Completion placeholder.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WorkWithMeClient;
