import { z } from 'zod';

/**
 * Zod schemas for the consulting intake flow.
 *
 * Used by:
 *   - app/api/intake/next-question/route.ts (AI question selection response)
 *   - components/intake/intake-container.tsx (client-side validation)
 *   - app/api/intake/generate-plan/route.ts (session validation before plan gen)
 *
 * Follows project pattern from lib/schemas/onboarding.ts -- Zod 4 syntax,
 * shared between client and server for single source of truth validation.
 */

// ── Individual answer schema ───────────────────────────────────────

export const intakeAnswerSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  answerValue: z.string(),
  answerDisplay: z.string(),
  sequenceOrder: z.number(),
});

export type IntakeAnswer = z.infer<typeof intakeAnswerSchema>;

// ── Session schema (submitted before plan generation) ──────────────

export const intakeSessionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  answers: z.array(intakeAnswerSchema),
});

export type IntakeSession = z.infer<typeof intakeSessionSchema>;

// ── AI next-question response schema ───────────────────────────────

export const nextQuestionResponseSchema = z.object({
  questionId: z.string().describe('ID of the next question from the curated pool'),
  inputType: z.enum(['buttons', 'text', 'slider', 'multi-select']).describe('Input type for the selected question'),
  options: z.array(z.string()).optional().describe('Options for buttons or multi-select inputs'),
  skipReason: z.string().optional().describe('Reason a question was skipped by the AI'),
});

export type NextQuestionResponse = z.infer<typeof nextQuestionResponseSchema>;
