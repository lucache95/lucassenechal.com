"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import type { OnboardingFormData } from "./stepper";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepDeliveryProps {
  deliveryTime: "morning" | "afternoon" | "evening";
  timezone: string;
  city: string;
  onUpdate: (payload: Partial<OnboardingFormData>) => void;
}

// ---------------------------------------------------------------------------
// Time slot data
// ---------------------------------------------------------------------------

const TIME_SLOTS = [
  {
    value: "morning" as const,
    label: "Morning",
    time: "~7:00 AM",
    copy: "Start your day ahead of everyone",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M12 2v2" />
        <path d="M12 8a4 4 0 1 0 0 8" />
        <path d="M12 8a4 4 0 1 1 0 8" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 6.34 1.41-1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6 20h12" />
      </svg>
    ),
  },
  {
    value: "afternoon" as const,
    label: "Afternoon",
    time: "~12:00 PM",
    copy: "Catch up over lunch",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
  },
  {
    value: "evening" as const,
    label: "Evening",
    time: "~6:00 PM",
    copy: "End your day informed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepDelivery({ deliveryTime, timezone, city, onUpdate }: StepDeliveryProps) {
  return (
    <div className="space-y-8 py-4">
      {/* F/G/E header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          When and where should we find things for you?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-muted">
          We&apos;ll deliver your briefing right when you want it, with local finds from your area.
        </p>
      </div>

      {/* Delivery Time Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TIME_SLOTS.map((slot) => {
            const isSelected = deliveryTime === slot.value;
            return (
              <motion.button
                key={slot.value}
                type="button"
                onClick={() => onUpdate({ deliveryTime: slot.value })}
                className={`
                  relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-6
                  transition-colors duration-200
                  ${
                    isSelected
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border bg-surface text-foreground hover:border-accent/40 hover:bg-surface-hover"
                  }
                `}
                whileTap={{ scale: 0.98 }}
                animate={isSelected ? { scale: 1 } : { scale: 1 }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="h-3 w-3">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                <div className={isSelected ? "text-accent" : "text-muted"}>
                  {slot.icon}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{slot.label}</p>
                  <p className="text-sm text-muted-foreground">{slot.time}</p>
                </div>
                <p className={`text-xs italic ${isSelected ? "text-accent/80" : "text-muted-foreground"}`}>
                  {slot.copy}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Timezone display */}
        <p className="text-center text-sm text-muted-foreground">
          Delivering in your timezone:{" "}
          <span className="font-medium text-foreground">{timezone}</span>
        </p>
      </div>

      {/* Location Section */}
      <div className="space-y-2">
        <label htmlFor="city-input" className="block text-sm font-medium text-foreground">
          Your city <span className="text-muted-foreground">(optional)</span>
        </label>
        <p className="text-sm text-muted-foreground">
          Unlocks local events, deals, and news in your area.
        </p>
        <Input
          id="city-input"
          type="text"
          placeholder="e.g., Austin, TX"
          maxLength={100}
          value={city}
          onChange={(e) => onUpdate({ city: e.target.value })}
        />
      </div>
    </div>
  );
}
