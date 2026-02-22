"use client";

import type { OnboardingFormData } from "./stepper";

interface StepFormatProps {
  format: "digest" | "briefing" | "mixed";
  onUpdate: (payload: Partial<OnboardingFormData>) => void;
}

export function StepFormat({ format, onUpdate }: StepFormatProps) {
  return (
    <div className="py-8 text-center text-muted">
      <p className="text-lg font-medium text-foreground">Format</p>
      <p className="mt-2 text-sm">Placeholder -- replaced in Task 2</p>
    </div>
  );
}
