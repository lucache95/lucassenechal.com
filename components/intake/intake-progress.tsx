"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface IntakeProgressProps {
  currentQuestion: number;
  totalEstimate: number;
  minReached: boolean;
  onGeneratePlan: () => void;
  onContinue: () => void;
}

export function IntakeProgress({
  currentQuestion,
  totalEstimate,
  minReached,
  onGeneratePlan,
  onContinue,
}: IntakeProgressProps) {
  // Progress fills to ~65% when minimum reached, then grows slightly with each additional answer
  const basePercent = minReached
    ? Math.min(65 + (currentQuestion - 6) * 5, 95)
    : Math.round((currentQuestion / totalEstimate) * 60);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">
          {currentQuestion} question{currentQuestion !== 1 ? "s" : ""} answered
        </span>
        <span className="text-sm text-muted">{basePercent}%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-surface-active overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${basePercent}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        />
      </div>

      {/* Dual CTA when minimum reached */}
      <AnimatePresence>
        {minReached && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-lg border border-border bg-surface p-5 text-center">
              <p className="text-base font-medium text-foreground">
                Your plan is ready to generate
              </p>
              <p className="mt-1 text-sm text-muted">
                You can generate now or answer a few more for better accuracy.
              </p>

              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onContinue}
                >
                  Answer More for a Better Plan
                </Button>
                <button
                  onClick={onGeneratePlan}
                  className="text-sm text-muted hover:text-foreground transition-colors duration-200 underline underline-offset-2"
                >
                  Generate my plan now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IntakeProgress;
