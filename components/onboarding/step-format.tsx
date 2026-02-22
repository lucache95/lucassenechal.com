"use client";

import { motion } from "framer-motion";
import type { OnboardingFormData } from "./stepper";

// ---------------------------------------------------------------------------
// Format option data
// ---------------------------------------------------------------------------

type FormatOption = {
  value: "digest" | "briefing" | "mixed";
  label: string;
  isPopular: boolean;
  description: string;
  identity: string;
  icon: React.ReactNode;
};

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: "digest",
    label: "Curated Digest",
    isPopular: true,
    description:
      "5-8 handpicked items with quick summaries and direct links.",
    identity: "For the scanner who wants breadth fast.",
    icon: <ListIcon />,
  },
  {
    value: "briefing",
    label: "Written Briefing",
    isPopular: false,
    description:
      "A narrative synthesis that connects the dots between stories.",
    identity: "For the thinker who wants depth and context.",
    icon: <DocumentIcon />,
  },
  {
    value: "mixed",
    label: "Mixed",
    isPopular: false,
    description:
      "A short synthesis up top, then itemized links below.",
    identity: "For the person who wants both the big picture and the details.",
    icon: <HybridIcon />,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StepFormatProps {
  format: "digest" | "briefing" | "mixed";
  onUpdate: (payload: Partial<OnboardingFormData>) => void;
}

export function StepFormat({ format, onUpdate }: StepFormatProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* F/G/E header: Ego-framed identity language */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          How do you want your intelligence delivered?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Choose the format that fits how you consume information.
        </p>
      </div>

      {/* Format cards */}
      <div className="flex flex-col gap-3">
        {FORMAT_OPTIONS.map((option) => {
          const isSelected = format === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onUpdate({ format: option.value })}
              whileTap={{ scale: 0.99 }}
              className={`
                relative cursor-pointer rounded-xl border px-5 py-4 text-left
                transition-colors duration-200
                ${
                  isSelected
                    ? "border-accent bg-accent/[0.04] ring-1 ring-accent/30"
                    : "border-border bg-surface hover:border-accent/30 hover:bg-surface-hover"
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`
                    mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                    ${isSelected ? "bg-accent text-accent-foreground" : "bg-surface-active text-muted"}
                  `}
                >
                  {option.icon}
                </div>

                {/* Text content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    {option.isPopular && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {option.description}
                  </p>
                  <p className="mt-1 text-xs font-medium italic text-accent/80">
                    {option.identity}
                  </p>
                </div>

                {/* Selection indicator */}
                <div className="mt-1 shrink-0">
                  <div
                    className={`
                      flex h-5 w-5 items-center justify-center rounded-full border-2
                      transition-colors duration-150
                      ${isSelected ? "border-accent bg-accent" : "border-border"}
                    `}
                  >
                    {isSelected && (
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3 w-3 text-accent-foreground"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ListIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 5A.75.75 0 0 1 2.75 9h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.75Zm0 5a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 6.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HybridIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v3A1.5 1.5 0 0 0 3.5 8h3A1.5 1.5 0 0 0 8 6.5v-3A1.5 1.5 0 0 0 6.5 2h-3ZM3.5 11A1.5 1.5 0 0 0 2 12.5v.75a.75.75 0 0 0 1.5 0v-.75h3v.75a.75.75 0 0 0 1.5 0v-.75A1.5 1.5 0 0 0 6.5 11h-3Z" />
      <path
        fillRule="evenodd"
        d="M10 4.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm0 5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm0 5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
