import { streamText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { businessPlanSchema } from '@/lib/schemas/business-plan';
import { SERVICES } from '@/lib/data/services';

export const maxDuration = 60;

interface IntakeAnswer {
  questionId: string;
  questionText: string;
  answerValue: string;
}

function formatAnswersForPrompt(answers: IntakeAnswer[]): string {
  return answers
    .map((a) => `**${a.questionText}**\n${a.answerValue}`)
    .join('\n\n');
}

function buildServiceContext(): string {
  return SERVICES.map(
    (s) => `- **${s.title}** (id: ${s.id}): ${s.longDescription}`
  ).join('\n');
}

const SYSTEM_PROMPT = `You are an expert AI systems consultant (Lucas Senechal) generating a detailed 1-page business plan for a prospective client.

Based on their intake answers, produce a comprehensive plan that demonstrates deep understanding of their situation.

CRITICAL RULES:
- Paraphrase their situation in cleaner language. Do NOT quote their answers directly. Restate what they told you in a way that shows you understand the underlying problem, not just the words they used.
- The estimate should include a realistic cost range and timeline with specific phases (MVP, Hardening, Reporting). Each phase should have a duration and clear deliverables.
- Be specific about tools and integrations — mention real products (Zapier, Make, Supabase, Claude API, n8n, Airtable, Slack, etc.) based on their stack and needs.
- Recommend exactly ONE of these services based on their situation: ai-automation, process-consulting, ongoing-management, training.
- The goal mirroring section should make the client feel heard — restate their goals and challenges in 2-3 crisp sentences.
- Bottleneck diagnosis should pinpoint the root cause, not just repeat the symptom.
- Proposed system steps should be actionable and sequenced logically.
- Risks should be honest — flag real concerns like data access, API costs, compliance, team adoption.
- Next steps should always include "Book a 15-minute discovery call" as the primary action.

AVAILABLE SERVICES:
${buildServiceContext()}

Generate a complete business plan following the schema structure. Every field must be filled with substantive, specific content — no placeholders or generic advice.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const answers: IntakeAnswer[] = body.answers;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No intake answers provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formattedAnswers = formatAnswersForPrompt(answers);

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      output: Output.object({ schema: businessPlanSchema }),
      system: SYSTEM_PROMPT,
      prompt: `Here are the client's intake answers:\n\n${formattedAnswers}\n\nGenerate a detailed, personalized business plan based on these answers.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Plan generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate business plan' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
