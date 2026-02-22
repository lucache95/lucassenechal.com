import { z } from 'zod';

/**
 * Zod schema for structured business plan output.
 *
 * Used by:
 *   - app/api/intake/generate-plan/route.ts (AI structured output via streamText + Output.object())
 *   - components/intake/plan-display.tsx (client-side streaming display via useObject)
 *   - components/pdf/business-plan-pdf.tsx (PDF download generation)
 *
 * Every field uses .describe() to guide the AI during generation.
 * Non-critical nested fields use .optional() for schema flexibility
 * (per pitfall #6 from research: avoid overly strict schemas).
 *
 * Covers all WORK-06 sections:
 *   1. Goal mirroring
 *   2. Bottleneck diagnosis
 *   3. Proposed system steps
 *   4. Tools and integrations
 *   5. Implementation phases (MVP -> Hardening -> Reporting)
 *   6. Risks and dependencies
 *   7. Estimate (range + timeline + assumptions)
 *   8. Next steps
 *   9. Recommended service
 */

export const businessPlanSchema = z.object({
  goalMirroring: z.string()
    .describe('Restate client situation in cleaner language. 2-3 sentences showing deep understanding. Paraphrase, do not quote directly.'),

  bottleneckDiagnosis: z.string()
    .describe('Identify the core bottleneck(s) causing their pain. Be specific to their workflow.'),

  proposedSystemSteps: z.array(z.object({
    step: z.number().describe('Step number in sequence'),
    title: z.string().describe('Short title for this step'),
    description: z.string().describe('What this step accomplishes'),
    tools: z.array(z.string()).optional().describe('Specific tools used in this step'),
  })).describe('Proposed system architecture steps in order'),

  toolsAndIntegrations: z.array(z.string())
    .describe('Specific tools and integrations needed (e.g., Zapier, Supabase, Claude API)'),

  implementationPhases: z.array(z.object({
    phase: z.string().describe('Phase name: MVP, Hardening, or Reporting'),
    duration: z.string().describe('Estimated duration like "2-3 weeks"'),
    deliverables: z.array(z.string()).describe('Key deliverables for this phase'),
  })).describe('Implementation phases: MVP -> Hardening -> Reporting'),

  risksAndDependencies: z.array(z.string())
    .describe('Key risks and dependencies to flag (e.g., data access, API limits, compliance)'),

  estimate: z.object({
    totalRange: z.string().describe('Total cost range like "$5,000 - $12,000"'),
    timeline: z.string().describe('Total timeline like "6-10 weeks"'),
    assumptions: z.array(z.string()).describe('Key assumptions behind the estimate'),
  }).describe('Cost and timeline estimate with underlying assumptions'),

  nextSteps: z.array(z.string())
    .describe('Clear next steps for the prospect (e.g., "Book a 15-minute discovery call")'),

  recommendedService: z.enum([
    'ai-automation',
    'process-consulting',
    'ongoing-management',
    'training',
  ]).describe('Which of the 4 services best fits their needs based on intake answers'),
});

export type BusinessPlan = z.infer<typeof businessPlanSchema>;
