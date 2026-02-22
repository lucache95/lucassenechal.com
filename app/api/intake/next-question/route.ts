import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import {
  INTAKE_QUESTIONS,
  MIN_QUESTIONS,
  STAGE_1_CAP,
  type IntakeQuestion,
} from '@/lib/data/intake-questions';
import { nextQuestionResponseSchema } from '@/lib/schemas/intake';

// ── Request body schema ──────────────────────────────────────────

const requestSchema = z.object({
  answeredQuestionIds: z.array(z.string()),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerValue: z.string(),
    })
  ),
  questionCount: z.number(),
});

// ── Deterministic fallback ───────────────────────────────────────

function selectFallbackQuestion(
  remaining: IntakeQuestion[]
): IntakeQuestion {
  // Sort by priority (lowest number = highest priority) and pick first
  return [...remaining].sort((a, b) => a.priority - b.priority)[0];
}

// ── POST handler ─────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { answeredQuestionIds, answers, questionCount } = parsed.data;

    // Filter out already-answered questions
    let remaining = INTAKE_QUESTIONS.filter(
      (q) => !answeredQuestionIds.includes(q.id)
    );

    // If still in Stage 1 (under cap), exclude deep-dive questions
    if (questionCount < STAGE_1_CAP) {
      remaining = remaining.filter((q) => !q.isDeepDive);
    }

    // No more questions available
    if (remaining.length === 0) {
      return NextResponse.json({ done: true });
    }

    // If ANTHROPIC_API_KEY is not set, fall back immediately
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('AI question selection fallback: ANTHROPIC_API_KEY not set');
      const fallback = selectFallbackQuestion(remaining);
      return NextResponse.json({
        question: fallback,
        source: 'fallback',
      });
    }

    // AI-powered selection with timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const { experimental_output } = await generateText({
        model: anthropic('claude-3-5-haiku-20241022'),
        output: Output.object({ schema: nextQuestionResponseSchema }),
        system: `You are selecting the next intake question for a consulting prospect seeking AI automation services. Select the most valuable next question based on what they've already answered. Only return a questionId from the provided pool. Never invent new questions. Pick questions that fill the biggest knowledge gaps about their business needs.`,
        prompt: JSON.stringify({
          priorAnswers: answers,
          remainingQuestions: remaining.map((q) => ({
            id: q.id,
            text: q.text,
            category: q.category,
            inputType: q.inputType,
            options: q.options,
            aiContext: q.aiContext,
          })),
        }),
        abortSignal: controller.signal,
      });

      clearTimeout(timeout);

      // Validate that AI returned a question from the pool
      const aiResult = experimental_output;
      if (aiResult) {
        const selectedQuestion = remaining.find(
          (q) => q.id === aiResult.questionId
        );

        if (selectedQuestion) {
          return NextResponse.json({
            question: selectedQuestion,
            source: 'ai',
          });
        }
      }

      // AI returned invalid ID -- fallback
      console.warn(
        'AI question selection fallback: AI returned invalid questionId'
      );
      const fallback = selectFallbackQuestion(remaining);
      return NextResponse.json({
        question: fallback,
        source: 'fallback',
      });
    } catch (aiError: unknown) {
      // Timeout or AI error -- use deterministic fallback
      const reason =
        aiError instanceof Error && aiError.name === 'AbortError'
          ? 'timeout (>1500ms)'
          : aiError instanceof Error
            ? aiError.message
            : 'unknown error';
      console.warn('AI question selection fallback:', reason);

      const fallback = selectFallbackQuestion(remaining);
      return NextResponse.json({
        question: fallback,
        source: 'fallback',
      });
    }
  } catch (error) {
    console.error('Intake next-question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
