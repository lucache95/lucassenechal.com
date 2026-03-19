import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import {
  INTAKE_QUESTIONS,
  type IntakeQuestion,
} from '@/lib/data/intake-questions';
import { aiGeneratedQuestionSchema } from '@/lib/schemas/intake';

// ── Constants ────────────────────────────────────────────────────

const MAX_QUESTIONS = 12;
const AI_TIMEOUT_MS = 8000;

// ── Request body schema ──────────────────────────────────────────

const requestSchema = z.object({
  answeredQuestionIds: z.array(z.string()),
  answers: z.array(
    z.object({
      questionId: z.string(),
      questionText: z.string().optional(),
      answerValue: z.string(),
    })
  ),
  questionCount: z.number(),
});

// ── Deterministic fallback ───────────────────────────────────────

function selectFallbackQuestion(
  answeredIds: string[]
): IntakeQuestion | null {
  const remaining = INTAKE_QUESTIONS.filter(
    (q) => !answeredIds.includes(q.id)
  );
  if (remaining.length === 0) return null;
  return [...remaining].sort((a, b) => a.priority - b.priority)[0];
}

// ── Build question bank context for AI ───────────────────────────

function buildQuestionBankContext(): string {
  return INTAKE_QUESTIONS.map(
    (q) =>
      `- [${q.category}] "${q.text}" (inputType: ${q.inputType}${q.options ? `, options: ${JSON.stringify(q.options)}` : ''})`
  ).join('\n');
}

// ── System prompt ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Lucas — a sharp, experienced AI and automation consultant running an intake conversation with a prospective client on lucassenechal.com.

Your job is to ask ONE follow-up question at a time to deeply understand the client's situation so you can generate a personalized business plan. You are NOT selecting from a list — you are GENERATING a fresh, contextual question based on everything said so far.

## How to behave

- Read all previous answers carefully. Notice specific details — tool names, team sizes, pain points, failed attempts.
- Ask about what's most unclear or most valuable to explore next.
- Reference specific things they said. If they mentioned "Zapier got too complex," ask what specifically broke down. If they said "just me," never ask about team handoffs.
- Start broad (business type, core problem) and get progressively more specific as you learn more.
- Use natural, conversational language — not corporate jargon.
- Each question should feel like a smart follow-up, not a checkbox item.

## Input types — pick the right one

- "text": For open-ended questions where you want detail (most common early on)
- "buttons": For clear-cut choices (yes/no, timeline, budget ranges). Always provide 2-6 options.
- "multi-select": When multiple answers apply (tools used, features wanted). Provide 4-8 options.
- "slider": Only for numeric ranges (hours/week, team count). Avoid unless clearly numeric.

## When to stop (set done: true)

Set done to true when ANY of these are true:
- You've asked 10-12 questions and have a solid picture of: the business, the core problem, the current process, what tools they use, what they've tried, and what success looks like.
- The client has given enough detail that additional questions would feel repetitive.
- You've covered business context, pain/workflow, tech stack, and scope/timeline.

Do NOT stop before question 8 unless answers are exceptionally detailed.

## Examples of good vs bad follow-ups

After "We lose track of leads after the first call":
- GOOD: "What specifically causes leads to fall through — is it timing, no system, or the handoff between team members?"
- BAD: "What's the biggest bottleneck in your current process?" (too generic, doesn't reference what they said)

After "Just me" for team size:
- GOOD: "Since you're running this solo, what part of the business suffers most when you're stuck in manual work?"
- BAD: "How do you handle handoffs between team members?" (irrelevant to a solo operator)

After "Tried Zapier but it got too complex":
- GOOD: "What specifically broke down with Zapier — the logic getting tangled, keeping it running, or not having someone technical to maintain it?"
- BAD: "Do you use any automation tools today?" (they literally just told you)

## Question bank for reference (types and categories — you are NOT limited to these)

${buildQuestionBankContext()}

## Output format

Return a JSON object with these fields:
- done: boolean — true if enough context gathered
- id: string — a slug like "followup-lead-tracking-2" (use the question number)
- category: one of "business", "workflow", "stack", "scope", "pain", "timeline", "deep"
- text: the question text
- inputType: "buttons" | "text" | "slider" | "multi-select"
- options: string[] (required for buttons and multi-select)
- placeholder: string (example answer for text inputs)
- isRequired: boolean (true for the first 3 questions, false after that)

If done is true, still fill in the other fields with dummy values (they'll be ignored).`;

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

    // Hard cap: after MAX_QUESTIONS, we're done
    if (questionCount >= MAX_QUESTIONS) {
      return NextResponse.json({ done: true });
    }

    // If ANTHROPIC_API_KEY is not set, fall back immediately
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('AI question generation fallback: ANTHROPIC_API_KEY not set');
      const fallback = selectFallbackQuestion(answeredQuestionIds);
      if (!fallback) return NextResponse.json({ done: true });
      return NextResponse.json({ question: fallback, source: 'fallback' });
    }

    // AI-powered question generation
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      // Build conversation context from previous answers
      const conversationContext =
        answers.length === 0
          ? 'This is the FIRST question. Start by asking what their business does.'
          : answers
              .map(
                (a, i) =>
                  `Q${i + 1}: ${a.questionText || a.questionId}\nA${i + 1}: ${a.answerValue}`
              )
              .join('\n\n');

      const { experimental_output } = await generateText({
        model: anthropic('claude-3-5-haiku-20241022'),
        output: Output.object({ schema: aiGeneratedQuestionSchema }),
        system: SYSTEM_PROMPT,
        prompt: `Question count so far: ${questionCount}
Max questions: ${MAX_QUESTIONS}

Previous conversation:
${conversationContext}

Generate the next question (question #${questionCount + 1}).`,
        abortSignal: controller.signal,
      });

      clearTimeout(timeout);

      const aiResult = experimental_output;

      if (aiResult) {
        // AI says we have enough
        if (aiResult.done) {
          return NextResponse.json({ done: true });
        }

        // Convert AI response to IntakeQuestion shape the frontend expects
        const question: IntakeQuestion = {
          id: aiResult.id || `ai-q-${questionCount + 1}`,
          category: aiResult.category,
          text: aiResult.text,
          inputType: aiResult.inputType,
          options: aiResult.options,
          placeholder: aiResult.placeholder,
          isRequired: aiResult.isRequired,
          isDeepDive: questionCount >= 8,
          priority: questionCount + 1,
          aiContext: 'AI-generated contextual question',
        };

        // Validate: buttons/multi-select must have options
        if (
          (question.inputType === 'buttons' ||
            question.inputType === 'multi-select') &&
          (!question.options || question.options.length === 0)
        ) {
          // Fix: switch to text input
          question.inputType = 'text';
          question.options = undefined;
        }

        return NextResponse.json({
          question,
          source: 'ai',
        });
      }

      // AI returned null — fallback
      console.warn('AI question generation fallback: null output');
      const fallback = selectFallbackQuestion(answeredQuestionIds);
      if (!fallback) return NextResponse.json({ done: true });
      return NextResponse.json({ question: fallback, source: 'fallback' });
    } catch (aiError: unknown) {
      const reason =
        aiError instanceof Error && aiError.name === 'AbortError'
          ? `timeout (>${AI_TIMEOUT_MS}ms)`
          : aiError instanceof Error
            ? aiError.message
            : 'unknown error';
      console.warn('AI question generation fallback:', reason);

      const fallback = selectFallbackQuestion(answeredQuestionIds);
      if (!fallback) return NextResponse.json({ done: true });
      return NextResponse.json({ question: fallback, source: 'fallback' });
    }
  } catch (error) {
    console.error('Intake next-question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
