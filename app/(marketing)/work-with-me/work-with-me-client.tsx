"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultingHero } from "@/components/consulting/consulting-hero";
import { ServiceGrid } from "@/components/consulting/service-grid";
import { HowItWorks } from "@/components/consulting/how-it-works";
import { FAQSection } from "@/components/consulting/faq-section";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Footer } from "@/components/landing/footer";
import { IntakeContainer } from "@/components/intake/intake-container";
import { LeadCaptureGate } from "@/components/intake/lead-capture-gate";
import { PlanDisplay } from "@/components/intake/plan-display";
import { CalEmbed } from "@/components/consulting/cal-embed";
import { Button } from "@/components/ui/button";
import { saveIntakeSession, markIntakeBooked } from "@/app/actions/intake";
import type { IntakeAnswer } from "@/lib/schemas/intake";
import Link from "next/link";

export type FunnelStage =
  | "landing"
  | "intake"
  | "capture"
  | "generating"
  | "plan"
  | "booking"
  | "complete";

const stageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

// Read urgency/spot env vars (NEXT_PUBLIC_ prefix makes them available client-side)
const SPOTS_REMAINING = parseInt(
  process.env.NEXT_PUBLIC_CAL_SPOTS_REMAINING ?? "3",
  10
);
const SPOTS_MONTH =
  process.env.NEXT_PUBLIC_CAL_SPOTS_MONTH ?? new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date());

export function WorkWithMeClient() {
  const [stage, setStage] = useState<FunnelStage>("landing");
  const [answers, setAnswers] = useState<IntakeAnswer[]>([]);
  const [leadInfo, setLeadInfo] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Scroll to top when stage changes
  useEffect(() => {
    if (stage !== "landing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stage]);

  // ── Stage handlers ──────────────────────────────────────────────

  const handleIntakeComplete = useCallback((intakeAnswers: IntakeAnswer[]) => {
    setAnswers(intakeAnswers);
    setStage("capture");
  }, []);

  const handleLeadCapture = useCallback(
    async (info: { email: string; name: string }) => {
      setLeadInfo(info);
      setStage("generating");

      // Persist to Supabase in the background
      try {
        const result = await saveIntakeSession({
          email: info.email,
          name: info.name,
          answers,
        });

        if ("sessionId" in result) {
          setSessionId(result.sessionId);
        } else {
          console.error("[WorkWithMe] Save session error:", result.error);
        }
      } catch (err) {
        console.error("[WorkWithMe] Save session failed:", err);
        // Don't block the flow -- plan generation can still proceed
      }
    },
    [answers]
  );

  const handleBookCall = useCallback(() => {
    setStage("booking");
  }, []);

  const handleBookingComplete = useCallback(async () => {
    setStage("complete");

    // Mark session as booked
    if (sessionId) {
      try {
        await markIntakeBooked({ sessionId });
      } catch (err) {
        console.error("[WorkWithMe] Mark booked failed:", err);
      }
    }
  }, [sessionId]);

  const handleNewAssessment = useCallback(() => {
    // Reset all state
    setAnswers([]);
    setLeadInfo(null);
    setSessionId(null);
    setStage("intake");
  }, []);

  // ── Render ──────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {/* Stage 1: Landing */}
      {stage === "landing" && (
        <motion.div
          key="landing"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ConsultingHero onStart={() => setStage("intake")} />
          <ServiceGrid />
          <HowItWorks />
          <TrustStrip />
          <FAQSection />
          <Footer />
        </motion.div>
      )}

      {/* Stage 2: Intake questions */}
      {stage === "intake" && (
        <motion.div
          key="intake"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <IntakeContainer
            onComplete={handleIntakeComplete}
            onBack={() => setStage("landing")}
          />
        </motion.div>
      )}

      {/* Stage 3: Lead capture (email + name) */}
      {stage === "capture" && (
        <motion.div
          key="capture"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <LeadCaptureGate onSubmit={handleLeadCapture} />
        </motion.div>
      )}

      {/* Stage 4: Plan generation + display */}
      {(stage === "generating" || stage === "plan") && (
        <motion.div
          key="plan"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <PlanDisplay
            answers={answers}
            sessionId={sessionId}
            onBookCall={handleBookCall}
            onNewAssessment={handleNewAssessment}
          />
        </motion.div>
      )}

      {/* Stage 5: Booking (Cal.com embed) */}
      {stage === "booking" && (
        <motion.div
          key="booking"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CalEmbed spotCount={SPOTS_REMAINING} spotMonth={SPOTS_MONTH} />

          {/* Post-booking actions */}
          <div className="mx-auto max-w-3xl px-6 pb-16 text-center space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleBookingComplete}
            >
              I&apos;ve Booked My Call
            </Button>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleBookingComplete}
                className="text-sm text-muted hover:text-foreground transition-colors duration-200 underline underline-offset-2"
              >
                Skip for now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stage 6: Complete / Thank you */}
      {stage === "complete" && (
        <motion.div
          key="complete"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-[60vh] items-center justify-center px-6 py-24"
        >
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-6 text-5xl">&#10003;</div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              You&apos;re All Set
              {leadInfo?.name ? `, ${leadInfo.name}` : ""}
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Your plan has been saved. I&apos;ll review your answers before
              our call so we can hit the ground running.
            </p>

            {/* Cross-pollination to newsletter */}
            <div className="mt-8 rounded-lg border border-border bg-surface p-6">
              <p className="text-sm font-medium text-foreground">
                Want daily AI insights while you wait?
              </p>
              <p className="mt-1 text-sm text-muted">
                Get a personalized briefing every morning, researched and
                written just for you.
              </p>
              <Link
                href="/newsletter"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors duration-200"
              >
                Get the Daily Briefing
              </Link>
            </div>

            {/* New assessment link */}
            <button
              onClick={handleNewAssessment}
              className="mt-6 text-sm text-muted hover:text-foreground transition-colors duration-200 underline underline-offset-2"
            >
              Start a new assessment
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WorkWithMeClient;
