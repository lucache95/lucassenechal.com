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

/** Schema for AI-generated intake questions (dynamic, conversational). */
export const aiGeneratedQuestionSchema = z.object({
  done: z
    .boolean()
    .describe(
      'Set to true when enough context has been gathered (10-12 questions or sufficient detail). When true, all other fields are ignored.'
    ),
  id: z
    .string()
    .describe(
      'A slug-style ID for this question, e.g. "followup-lead-tracking-2"'
    ),
  category: z
    .enum(['business', 'workflow', 'stack', 'scope', 'pain', 'timeline', 'deep'])
    .describe('Category this question falls under'),
  text: z.string().describe('The question text to display to the user'),
  inputType: z
    .enum(['buttons', 'text', 'slider', 'multi-select'])
    .describe(
      'Input type. Use "buttons" for yes/no or short choice lists, "text" for open-ended, "slider" for numeric ranges, "multi-select" for pick-many.'
    ),
  options: z
    .array(z.string())
    .optional()
    .describe('Options for buttons or multi-select inputs. Required when inputType is "buttons" or "multi-select".'),
  placeholder: z
    .string()
    .optional()
    .describe('Placeholder text for text inputs. Should be an example answer.'),
  isRequired: z
    .boolean()
    .describe('Whether this question can be skipped'),
});

export type AIGeneratedQuestion = z.infer<typeof aiGeneratedQuestionSchema>;

/** @deprecated Kept for reference — replaced by aiGeneratedQuestionSchema */
export const nextQuestionResponseSchema = z.object({
  questionId: z.string().describe('ID of the next question from the curated pool'),
  inputType: z.enum(['buttons', 'text', 'slider', 'multi-select']).describe('Input type for the selected question'),
  options: z.array(z.string()).optional().describe('Options for buttons or multi-select inputs'),
  skipReason: z.string().optional().describe('Reason a question was skipped by the AI'),
});

export type NextQuestionResponse = z.infer<typeof nextQuestionResponseSchema>;
