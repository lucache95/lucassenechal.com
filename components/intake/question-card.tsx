"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SmartInput } from "@/components/intake/smart-input";
import type { IntakeQuestion } from "@/lib/data/intake-questions";

interface QuestionCardProps {
  question: IntakeQuestion;
  currentAnswer: string;
  onAnswer: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const cardVariants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

export function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  onSubmit,
  isLoading,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-16"
          >
            {/* Typing dots indicator */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-accent"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">
              Selecting the best next question...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={question.id}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center"
          >
            {/* Question text */}
            <h2 className="text-2xl font-medium text-foreground text-center leading-snug md:text-3xl">
              {question.text}
            </h2>

            {/* Smart input */}
            <div className="mt-8 w-full">
              <SmartInput
                type={question.inputType}
                options={question.options}
                sliderConfig={question.sliderConfig}
                value={currentAnswer}
                onChange={onAnswer}
                onSubmit={onSubmit}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuestionCard;
