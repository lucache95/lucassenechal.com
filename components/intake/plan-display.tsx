"use client";

import { useEffect, useState, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { businessPlanSchema, type BusinessPlan } from "@/lib/schemas/business-plan";
import { SERVICES } from "@/lib/data/services";
import { Button } from "@/components/ui/button";
import { saveIntakePlan } from "@/app/actions/intake";
import dynamic from "next/dynamic";

const PlanDownloadButton = dynamic(
  () => import("@/components/pdf/business-plan-pdf").then((mod) => mod.PlanDownloadButton),
  { ssr: false, loading: () => <span className="text-sm text-muted">Preparing PDF...</span> }
);

interface IntakeAnswer {
  questionId: string;
  questionText: string;
  answerValue: string;
}

interface PlanDisplayProps {
  answers: IntakeAnswer[];
  sessionId: string | null;
  onBookCall: () => void;
  onNewAssessment: () => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

function SectionWrapper({ children, show }: { children: React.ReactNode; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionCard({
  title,
  children,
  accent = false,
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        accent
          ? "border-accent/30 bg-accent/[0.03]"
          : "border-border bg-surface"
      }`}
    >
      <h3 className="mb-3 text-lg font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-3 h-5 w-40 rounded bg-surface-active" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-surface-active" />
          <div className="h-4 w-4/5 rounded bg-surface-active" />
          <div className="h-4 w-3/5 rounded bg-surface-active" />
        </div>
      </div>
    </div>
  );
}

export function PlanDisplay({ answers, sessionId, onBookCall, onNewAssessment }: PlanDisplayProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const planSavedRef = useRef(false);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/intake/generate-plan",
    schema: businessPlanSchema,
  });

  useEffect(() => {
    if (!hasStarted && answers.length > 0) {
      setHasStarted(true);
      submit({ answers });
    }
  }, [answers, hasStarted, submit]);

  const plan = object as Partial<BusinessPlan> | undefined;
  const done = hasStarted && !isLoading && plan;

  // Save plan to Supabase when generation completes
  useEffect(() => {
    if (done && sessionId && !planSavedRef.current && plan?.recommendedService) {
      planSavedRef.current = true;
      saveIntakePlan({ sessionId, plan: plan as BusinessPlan }).catch((err) => {
        console.error("[PlanDisplay] Failed to save plan:", err);
      });
    }
  }, [done, sessionId, plan]);

  const serviceName =
    plan?.recommendedService
      ? SERVICES.find((s) => s.id === plan.recommendedService)?.title ?? plan.recommendedService
      : null;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-600">
            We could not generate your plan. Please try again.
          </p>
          <button
            onClick={onNewAssessment}
            className="mt-4 text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-200 underline underline-offset-2"
          >
            Start a new assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Your Custom Business Plan
        </h2>
        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-muted"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
              Analyzing your answers and building your custom plan...
            </span>
          </motion.p>
        )}
        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-muted"
          >
            Generated just for you based on your intake answers
          </motion.p>
        )}
      </div>

      {/* Skeleton loading state */}
      {isLoading && !plan?.goalMirroring && (
        <>
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection />
        </>
      )}

      {/* Section 1: Goal Mirroring */}
      <SectionWrapper show={!!plan?.goalMirroring}>
        <div className="rounded-lg border-l-4 border-accent bg-accent/[0.03] px-6 py-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
            Your Situation
          </h3>
          <p className="text-base leading-relaxed text-foreground italic">
            {plan?.goalMirroring}
          </p>
        </div>
      </SectionWrapper>

      {/* Section 2: Bottleneck Diagnosis */}
      <SectionWrapper show={!!plan?.bottleneckDiagnosis}>
        <SectionCard title="Core Bottleneck" accent>
          <p className="text-muted leading-relaxed">{plan?.bottleneckDiagnosis}</p>
        </SectionCard>
      </SectionWrapper>

      {/* Section 3: Proposed System Steps */}
      <SectionWrapper show={!!plan?.proposedSystemSteps && plan.proposedSystemSteps.length > 0}>
        <SectionCard title="Proposed System">
          <ol className="space-y-4">
            {plan?.proposedSystemSteps?.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {step?.step ?? i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{step?.title}</p>
                  <p className="mt-1 text-sm text-muted">{step?.description}</p>
                  {step?.tools && step.tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {step.tools.map((tool, j) => (
                        <span
                          key={j}
                          className="inline-block rounded-full bg-surface-active px-2.5 py-0.5 text-xs font-medium text-muted"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </SectionWrapper>

      {/* Section 4: Tools & Integrations */}
      <SectionWrapper show={!!plan?.toolsAndIntegrations && plan.toolsAndIntegrations.length > 0}>
        <SectionCard title="Tools & Integrations">
          <div className="flex flex-wrap gap-2">
            {plan?.toolsAndIntegrations?.map((tool, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md border border-border bg-surface-hover px-3 py-1.5 text-sm font-medium text-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </SectionCard>
      </SectionWrapper>

      {/* Section 5: Implementation Phases */}
      <SectionWrapper show={!!plan?.implementationPhases && plan.implementationPhases.length > 0}>
        <SectionCard title="Implementation Phases">
          <div className="space-y-4">
            {plan?.implementationPhases?.map((phase, i) => (
              <div
                key={i}
                className="relative rounded-md border border-border bg-surface-hover p-4 pl-10"
              >
                {/* Timeline connector */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="absolute left-[11px] top-4 h-3 w-3 rounded-full border-2 border-accent bg-surface" />

                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h4 className="font-semibold text-foreground">{phase?.phase}</h4>
                  <span className="text-sm font-medium text-accent">{phase?.duration}</span>
                </div>
                {phase?.deliverables && phase.deliverables.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {phase.deliverables.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionWrapper>

      {/* Section 6: Risks & Dependencies */}
      <SectionWrapper show={!!plan?.risksAndDependencies && plan.risksAndDependencies.length > 0}>
        <SectionCard title="Risks & Dependencies">
          <ul className="space-y-2">
            {plan?.risksAndDependencies?.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-0.5 shrink-0 text-amber-500">!</span>
                {risk}
              </li>
            ))}
          </ul>
        </SectionCard>
      </SectionWrapper>

      {/* Section 7: Estimate & Timeline */}
      <SectionWrapper show={!!plan?.estimate}>
        <div className="rounded-lg border-2 border-accent/20 bg-accent/[0.02] p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Estimate & Timeline</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-surface p-4 text-center">
              <p className="text-sm font-medium text-muted">Investment</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{plan?.estimate?.totalRange}</p>
            </div>
            <div className="rounded-md bg-surface p-4 text-center">
              <p className="text-sm font-medium text-muted">Timeline</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{plan?.estimate?.timeline}</p>
            </div>
          </div>
          {plan?.estimate?.assumptions && plan.estimate.assumptions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Key Assumptions
              </p>
              <ul className="mt-2 space-y-1">
                {plan.estimate.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-muted">
                    -- {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* Section 8: Recommended Service */}
      <SectionWrapper show={!!plan?.recommendedService}>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
          <span className="text-sm text-muted">Recommended service:</span>
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            {serviceName}
          </span>
        </div>
      </SectionWrapper>

      {/* Section 9: Next Steps */}
      <SectionWrapper show={!!plan?.nextSteps && plan.nextSteps.length > 0}>
        <SectionCard title="Next Steps">
          <ul className="space-y-3">
            {plan?.nextSteps?.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border text-xs text-muted">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </SectionWrapper>

      {/* Post-generation CTAs */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 space-y-6 text-center"
          >
            {/* Download + Book CTA row */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <PlanDownloadButton plan={plan as BusinessPlan} />
              <Button variant="primary" size="lg" onClick={onBookCall}>
                Book a Discovery Call
              </Button>
            </div>

            {/* New assessment link */}
            <button
              onClick={onNewAssessment}
              className="text-sm text-muted hover:text-foreground transition-colors duration-200 underline underline-offset-2"
            >
              Start a new assessment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlanDisplay;
