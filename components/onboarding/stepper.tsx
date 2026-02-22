"use client";

import { useReducer, useEffect, useRef, useActionState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "./progress-bar";
import { StepTopics } from "./step-topics";
import { StepFormat } from "./step-format";
import { StepDelivery } from "./step-delivery";
import { StepSources } from "./step-sources";
import { StepConfirmation } from "./step-confirmation";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/app/actions";

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
  submitting: boolean;
  submitError: string | null;
};

type OnboardingAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; payload: Partial<OnboardingFormData> }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; payload: string }
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
  submitting: false,
  submitError: null,
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
        submitError: null,
      };
    case "PREV_STEP":
      return {
        ...state,
        step: Math.max(state.step - 1, 0),
        direction: "back",
        submitError: null,
      };
    case "UPDATE_DATA":
      return { ...state, data: { ...state.data, ...action.payload } };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: null };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        step: STEP_COUNT - 1,
        direction: "forward",
      };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.payload };
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
  const formRef = useRef<HTMLFormElement>(null);

  // Server Action state for completeOnboarding
  const [actionState, formAction, isActionPending] = useActionState(
    completeOnboarding,
    {}
  );

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      dispatch({ type: "UPDATE_DATA", payload: { timezone: tz } });
    } catch {
      // Keep default UTC
    }
  }, []);

  // Handle Server Action response
  useEffect(() => {
    if (actionState.success) {
      dispatch({ type: "SUBMIT_SUCCESS" });
    } else if (actionState.error) {
      dispatch({ type: "SUBMIT_ERROR", payload: actionState.error });
    }
  }, [actionState]);

  const handleUpdate = (payload: Partial<OnboardingFormData>) => {
    dispatch({ type: "UPDATE_DATA", payload });
  };

  const handleNext = useCallback(() => {
    // When on the last interactive step (Sources, step 3), submit the form
    if (state.step === 3) {
      dispatch({ type: "SUBMIT_START" });
      formRef.current?.requestSubmit();
      return;
    }
    dispatch({ type: "NEXT_STEP" });
  }, [state.step]);

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
  const isSubmitting = state.submitting || isActionPending;
  // The last interactive step before confirmation
  const isFinishStep = state.step === 3;

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

      {/* Submit error message */}
      {state.submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.submitError}
        </div>
      )}

      {/* Navigation buttons */}
      {!isLastStep && (
        <div className="flex items-center justify-between pt-2">
          <div>
            {!isFirstStep && (
              <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canSkip && !isFinishStep && (
              <Button variant="ghost" size="sm" onClick={handleNext} disabled={isSubmitting}>
                Skip this step
              </Button>
            )}
            <Button variant="primary" size="md" onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : isFinishStep ? (
                "Finish"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Hidden form for Server Action submission */}
      <form ref={formRef} action={formAction} className="hidden">
        <input
          type="hidden"
          name="onboardingData"
          value={JSON.stringify({ ...state.data, subscriberId })}
        />
      </form>
    </div>
  );
}
