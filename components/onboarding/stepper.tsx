"use client";

import { useReducer, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "./progress-bar";
import { StepTopics } from "./step-topics";
import { StepFormat } from "./step-format";
import { StepDelivery } from "./step-delivery";
import { StepSources } from "./step-sources";
import { StepConfirmation } from "./step-confirmation";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OnboardingFormData = {
  topics: string[];
  customTopics: string;
  format: "digest" | "briefing" | "mixed";
  deliveryTime: "morning" | "afternoon" | "evening";
  timezone: string;
  city: string;
  feedUrls: string[];
  smsOptIn: boolean;
  phone: string;
};

type OnboardingState = {
  step: number;
  direction: "forward" | "back";
  data: OnboardingFormData;
};

type OnboardingAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; payload: Partial<OnboardingFormData> }
  | { type: "RESET" };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_COUNT = 5;

const STEP_LABELS = ["Topics", "Format", "Delivery", "Sources", "Done"] as const;

/** Steps where skipping is allowed (not Topics or Confirmation). */
const SKIPPABLE_STEPS = new Set([1, 2, 3]);

const initialState: OnboardingState = {
  step: 0,
  direction: "forward",
  data: {
    topics: [],
    customTopics: "",
    format: "digest",
    deliveryTime: "morning",
    timezone: "UTC",
    city: "",
    feedUrls: [],
    smsOptIn: false,
    phone: "",
  },
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        step: Math.min(state.step + 1, STEP_COUNT - 1),
        direction: "forward",
      };
    case "PREV_STEP":
      return {
        ...state,
        step: Math.max(state.step - 1, 0),
        direction: "back",
      };
    case "UPDATE_DATA":
      return { ...state, data: { ...state.data, ...action.payload } };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Animation variants (direction-aware slides)
// ---------------------------------------------------------------------------

const EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const stepVariants = {
  initial: (direction: "forward" | "back") => ({
    x: direction === "forward" ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: "0%",
    opacity: 1,
    transition: { duration: 0.3, ease: EASE },
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StepperProps {
  subscriberId: string;
}

export function Stepper({ subscriberId }: StepperProps) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      dispatch({ type: "UPDATE_DATA", payload: { timezone: tz } });
    } catch {
      // Keep default UTC
    }
  }, []);

  const handleUpdate = (payload: Partial<OnboardingFormData>) => {
    dispatch({ type: "UPDATE_DATA", payload });
  };

  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  // Render the appropriate step
  function renderStep(step: number) {
    switch (step) {
      case 0:
        return (
          <StepTopics
            topics={state.data.topics}
            customTopics={state.data.customTopics}
            onUpdate={handleUpdate}
          />
        );
      case 1:
        return (
          <StepFormat
            format={state.data.format}
            onUpdate={handleUpdate}
          />
        );
      case 2:
        return (
          <StepDelivery
            deliveryTime={state.data.deliveryTime}
            timezone={state.data.timezone}
            city={state.data.city}
            onUpdate={handleUpdate}
          />
        );
      case 3:
        return (
          <StepSources
            feedUrls={state.data.feedUrls}
            smsOptIn={state.data.smsOptIn}
            phone={state.data.phone}
            onUpdate={handleUpdate}
          />
        );
      case 4:
        return <StepConfirmation data={state.data} />;
      default:
        return null;
    }
  }

  const isLastStep = state.step === STEP_COUNT - 1;
  const isFirstStep = state.step === 0;
  const canSkip = SKIPPABLE_STEPS.has(state.step);

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar
        currentStep={state.step}
        totalSteps={STEP_COUNT}
        labels={STEP_LABELS}
      />

      {/* Step content with direction-aware animation */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={state.direction}>
          <motion.div
            key={state.step}
            custom={state.direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderStep(state.step)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {!isLastStep && (
        <div className="flex items-center justify-between pt-2">
          <div>
            {!isFirstStep && (
              <Button variant="secondary" size="md" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canSkip && (
              <Button variant="ghost" size="sm" onClick={handleNext}>
                Skip this step
              </Button>
            )}
            <Button variant="primary" size="md" onClick={handleNext}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Hidden subscriber ID for form submission (used in Confirmation step) */}
      <input type="hidden" name="subscriberId" value={subscriberId} />
    </div>
  );
}
