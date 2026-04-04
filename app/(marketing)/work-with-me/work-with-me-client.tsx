"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultingHero } from "@/components/consulting/consulting-hero";
import { ServiceGrid } from "@/components/consulting/service-grid";
import { HowItWorks } from "@/components/consulting/how-it-works";
import { FAQSection } from "@/components/consulting/faq-section";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Testimonials } from "@/components/consulting/testimonials";
import { Footer } from "@/components/landing/footer";
import { IntakeContainer } from "@/components/intake/intake-container";
import { LeadCaptureGate } from "@/components/intake/lead-capture-gate";
import { PlanDisplay } from "@/components/intake/plan-display";
import { CalEmbed } from "@/components/consulting/cal-embed";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/intake/chat-widget";
import { saveIntakeSession, markIntakeBooked, saveChatIntakeSession } from "@/app/actions/intake";
import type { IntakeAnswer } from "@/lib/schemas/intake";
import Link from "next/link";

export type FunnelStage =
  | "landing"
  | "choose"
  | "chat"
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

const STORAGE_KEY = "wwm-funnel-state";

interface PersistedState {
  stage: FunnelStage;
  answers: IntakeAnswer[];
  leadInfo: { email: string; name: string } | null;
  sessionId: string | null;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function WorkWithMeClient() {
  const [stage, setStage] = useState<FunnelStage>("landing");
  const [answers, setAnswers] = useState<IntakeAnswer[]>([]);
  const [leadInfo, setLeadInfo] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted funnel state on mount
  useEffect(() => {
    const saved = loadPersistedState();
    const restorableStages: FunnelStage[] = ["capture", "generating", "plan", "booking", "complete"];
    if (saved && restorableStages.includes(saved.stage)) {
      setAnswers(saved.answers);
      setLeadInfo(saved.leadInfo);
      setSessionId(saved.sessionId);
      // If they were generating/viewing the plan, re-enter the generating stage
      // so PlanDisplay re-generates from their saved answers
      const restoreStage =
        saved.stage === "plan" || saved.stage === "generating"
          ? "generating"
          : saved.stage;
      setStage(restoreStage);
    }
    setHydrated(true);
  }, []);

  // Persist funnel state on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = { stage, answers, leadInfo, sessionId };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage full or unavailable — non-blocking
    }
  }, [stage, answers, leadInfo, sessionId, hydrated]);

  // Scroll to top when stage changes
  useEffect(() => {
    if (stage !== "landing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stage]);

  // ── Stage handlers ──────────────────────────────────────────────

  const handleChatComplete = useCallback(
    async (data: { email: string; name: string; messages: Array<{ role: string; content: string }> }) => {
      setLeadInfo({ email: data.email, name: data.name });
      setStage("complete");

      // Save chat session to database
      try {
        const result = await saveChatIntakeSession(data);
        if ("sessionId" in result) {
          setSessionId(result.sessionId);
        } else {
          console.error("[WorkWithMe] Save chat session error:", result.error);
        }
      } catch (err) {
        console.error("[WorkWithMe] Save chat session failed:", err);
      }
    },
    []
  );

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
    // Reset all state and clear persisted session
    setAnswers([]);
    setLeadInfo(null);
    setSessionId(null);
    setStage("choose");
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
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
          <ConsultingHero onStart={() => setStage("choose")} />
          <div className="opacity-100" style={{ transform: "none" }}>
            <Testimonials />
            <TrustStrip />
            <ServiceGrid />
            <HowItWorks />
            <FAQSection />
            <Footer />
          </div>
        </motion.div>
      )}

      {/* Stage 2: Choose intake method */}
      {stage === "choose" && (
        <motion.div
          key="choose"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen flex flex-col items-center justify-center px-6 py-24"
        >
          <div className="mx-auto max-w-2xl w-full">
            <button
              onClick={() => setStage("landing")}
              className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-2 mb-10"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tell Me About Your Business
            </h1>
            <p className="text-muted mb-10">
              How would you prefer to share your situation?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setStage("chat")}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-7 text-left hover:border-accent hover:bg-surface-hover transition-all duration-200"
              >
                <span className="text-2xl">💬</span>
                <span className="font-semibold text-foreground text-lg">Chat with AI</span>
                <span className="text-sm text-muted leading-relaxed">
                  Answer a few conversational questions. Takes 3–5 minutes and I&apos;ll tailor the plan to your exact situation.
                </span>
              </button>
              <button
                onClick={() => setStage("intake")}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-7 text-left hover:border-accent hover:bg-surface-hover transition-all duration-200"
              >
                <span className="text-2xl">📋</span>
                <span className="font-semibold text-foreground text-lg">Fill Out a Form</span>
                <span className="text-sm text-muted leading-relaxed">
                  Prefer to type it all out at once? A quick structured form that covers the essentials.
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stage 3: Chat intake */}
      {stage === "chat" && (
        <motion.div
          key="chat"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="min-h-screen py-12">
            <div className="mx-auto max-w-3xl px-6 mb-8">
              <button
                onClick={() => setStage("choose")}
                className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-2"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-foreground mt-6 mb-2">
                Tell Me About Your Business
              </h1>
              <p className="text-muted leading-relaxed">
                I'll ask a few questions to understand your situation and create a custom plan.
              </p>
            </div>
            <ChatWidget onEmailCapture={handleChatComplete} />
          </div>
        </motion.div>
      )}

      {/* Stage 3: Intake questions (original form-based flow) */}
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
            onBack={() => setStage("choose")}
          />
        </motion.div>
      )}

      {/* Stage 4: Lead capture (email + name) */}
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

      {/* Stage 5: Plan generation + display */}
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
            clientName={leadInfo?.name}
            clientEmail={leadInfo?.email}
            onBookCall={handleBookCall}
            onNewAssessment={handleNewAssessment}
          />
        </motion.div>
      )}

      {/* Stage 6: Booking (Cal.com embed) */}
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

      {/* Stage 7: Complete / Thank you */}
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
