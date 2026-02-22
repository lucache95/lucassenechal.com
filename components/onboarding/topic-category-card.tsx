"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TopicCategory } from "@/lib/data/topics";

interface TopicCategoryCardProps {
  category: TopicCategory;
  selectedSubtopics: string[];
  onToggleSubtopic: (subtopicId: string) => void;
}

export function TopicCategoryCard({
  category,
  selectedSubtopics,
  onToggleSubtopic,
}: TopicCategoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const selectedCount = category.subtopics.filter((s) =>
    selectedSubtopics.includes(s.id),
  ).length;

  return (
    <div
      className={`
        rounded-xl border transition-colors duration-200
        ${
          selectedCount > 0
            ? "border-accent/40 bg-accent/[0.03]"
            : "border-border bg-surface"
        }
      `}
    >
      {/* Category header (clickable to expand/collapse) */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-foreground">
            {category.name}
          </span>
          {category.isPopular && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              Most Popular
            </span>
          )}
          {selectedCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronIcon expanded={expanded} />
      </button>

      {/* Expandable subtopics section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
              {category.subtopics.map((subtopic) => {
                const isSelected = selectedSubtopics.includes(subtopic.id);
                return (
                  <button
                    key={subtopic.id}
                    type="button"
                    onClick={() => onToggleSubtopic(subtopic.id)}
                    className={`
                      cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium
                      transition-all duration-150
                      ${
                        isSelected
                          ? "border-accent bg-accent text-accent-foreground shadow-sm shadow-accent/20"
                          : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground"
                      }
                    `}
                  >
                    {subtopic.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-muted"
      animate={{ rotate: expanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </motion.svg>
  );
}
