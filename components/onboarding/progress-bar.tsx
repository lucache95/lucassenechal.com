"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: readonly string[];
}

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Step dots with connecting lines */}
      <div className="flex items-center justify-between">
        {labels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={label} className="flex flex-1 items-center">
              {/* Dot + label column */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold
                    transition-colors duration-200
                    ${
                      isCompleted
                        ? "bg-accent text-accent-foreground"
                        : isCurrent
                          ? "border-2 border-accent bg-surface text-accent"
                          : "border-2 border-border bg-surface text-muted-foreground"
                    }
                  `}
                  animate={
                    isCurrent
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    isCurrent
                      ? { duration: 0.4, ease: "easeOut" }
                      : undefined
                  }
                >
                  {isCompleted ? (
                    <CheckIcon />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`
                    mt-1.5 text-[11px] font-medium
                    ${isCurrent ? "text-accent" : isCompleted ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line (not after the last step) */}
              {index < totalSteps - 1 && (
                <div className="mx-1 h-0.5 flex-1 rounded-full bg-border sm:mx-2">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-3.5 w-3.5"
    >
      <path
        fillRule="evenodd"
        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
