"use client";

import type { OnboardingFormData } from "./stepper";

interface StepTopicsProps {
  topics: string[];
  customTopics: string;
  onUpdate: (payload: Partial<OnboardingFormData>) => void;
}

export function StepTopics({ topics, customTopics, onUpdate }: StepTopicsProps) {
  return (
    <div className="py-8 text-center text-muted">
      <p className="text-lg font-medium text-foreground">Topics</p>
      <p className="mt-2 text-sm">Placeholder -- replaced in Task 2</p>
    </div>
  );
}
