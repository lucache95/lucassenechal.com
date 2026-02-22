"use client";

import { useCallback } from "react";
import { TOPIC_CATEGORIES } from "@/lib/data/topics";
import { TopicCategoryCard } from "./topic-category-card";
import type { OnboardingFormData } from "./stepper";

interface StepTopicsProps {
  topics: string[];
  customTopics: string;
  onUpdate: (payload: Partial<OnboardingFormData>) => void;
}

export function StepTopics({ topics, customTopics, onUpdate }: StepTopicsProps) {
  const handleToggleSubtopic = useCallback(
    (subtopicId: string) => {
      const next = topics.includes(subtopicId)
        ? topics.filter((id) => id !== subtopicId)
        : [...topics, subtopicId];
      onUpdate({ topics: next });
    },
    [topics, onUpdate],
  );

  const handleCustomTopicsChange = useCallback(
    (value: string) => {
      if (value.length <= 500) {
        onUpdate({ customTopics: value });
      }
    },
    [onUpdate],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* F/G/E header: Ego-framed question */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          What do you want to be ahead on?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Select topics that matter to you. We&apos;ll research them daily so
          you never miss what&apos;s important.
        </p>
      </div>

      {/* Category cards */}
      <div className="flex flex-col gap-2.5">
        {TOPIC_CATEGORIES.map((category) => (
          <TopicCategoryCard
            key={category.id}
            category={category}
            selectedSubtopics={topics}
            onToggleSubtopic={handleToggleSubtopic}
          />
        ))}
      </div>

      {/* Custom topics textarea */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="custom-topics"
          className="text-sm font-semibold text-foreground"
        >
          Anything else you want covered?
        </label>
        <p className="text-xs leading-relaxed text-muted">
          Describe niche interests in your own words -- the more specific, the
          better your briefing.
        </p>
        <textarea
          id="custom-topics"
          value={customTopics}
          onChange={(e) => handleCustomTopicsChange(e.target.value)}
          placeholder="e.g., 'Local coffee shop openings in Austin', 'New AI coding tools', 'Deals on running shoes'..."
          maxLength={500}
          rows={3}
          className="
            w-full resize-none rounded-lg border border-border bg-surface px-4 py-3
            text-sm text-foreground placeholder:text-muted-foreground
            transition-all duration-200 ease-out
            focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20
          "
        />
        <span className="self-end text-[11px] text-muted-foreground">
          {customTopics.length}/500
        </span>
      </div>
    </div>
  );
}
