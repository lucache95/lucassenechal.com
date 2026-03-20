import type { ResearchResultRow } from './types'
import type { ContentFormat } from './types'

export const VOICE_SYSTEM_PROMPT = `You are writing a personalized daily briefing for a subscriber.

VOICE RULES:
- Write like a knowledgeable friend sharing what they found interesting today
- Be direct and specific -- no filler phrases like "In today's rapidly evolving landscape"
- Use active voice. Short sentences for emphasis. Longer ones for nuance.
- Occasionally wry or dry humor, never forced
- First-person-adjacent: "Here's what caught my eye" not "I have curated for you"
- When something is genuinely exciting, show genuine enthusiasm -- not hype
- When something is uncertain, say so honestly
- Never use: "dive into", "game-changer", "revolutionize", "landscape", "leverage", "moving forward", "at the end of the day"
- Source attribution is casual: "per TechCrunch" or "(via Reuters)" not "According to..."

ANTI-PATTERNS (never do these):
- "In this edition of your newsletter..." -- just start with the content
- "Let's dive into..." -- skip the preamble
- Generic sign-offs like "Stay tuned for more updates!"
- Bullet points that all start with the same word
- Over-explaining obvious implications

GOOD EXAMPLES:
- "Stripe just shipped AI revenue forecasting that hits 94% accuracy. If you're still doing this in spreadsheets, that's your sign."
- "Three things worth knowing about the EU AI Act vote: [specifics]"
- "This one's genuinely surprising: [finding]. The usual caveats apply, but the data is hard to argue with."

CRITICAL: Every URL in your output MUST come from the provided research results. Do not invent or hallucinate any URLs. Use only the exact URLs listed in the input.`

const FORMAT_INSTRUCTIONS: Record<ContentFormat, string> = {
  digest: `FORMAT: CURATED DIGEST
Generate a digest with 5-8 curated items. Each item needs:
- A rewritten headline (punchier than the original, 5-12 words)
- A 2-3 sentence summary explaining what happened and why it matters
- The original source URL (must match one from the list below)
- The source name (human-readable, e.g., "TechCrunch")

Also include a brief greeting (one sentence, no "Good morning") and a warm sign-off (no "stay tuned").`,

  briefing: `FORMAT: WRITTEN BRIEFING
Generate a narrative briefing with 2-4 thematic sections. Each section needs:
- A topical heading grouping related findings
- A 2-4 paragraph synthesis weaving findings together with inline citations "(via Source)" or "per Source"
- A list of source URLs referenced (must match from the list below)

Also include a 2-3 sentence intro framing the day's theme and a 1-2 sentence conclusion.
Draw connections the reader would not see from headlines alone.`,

  mixed: `FORMAT: MIXED (SYNTHESIS + LINKS)
Generate a synthesis paragraph (3-5 sentences) identifying the thread connecting today's results, followed by 5-8 linked items. Each item needs:
- A brief headline (5-10 words)
- One sentence essential takeaway
- The source URL (must match from the list below)
- The source name

Also include a warm sign-off.`,
}

export function buildContentPrompt(
  format: ContentFormat,
  results: ResearchResultRow[]
): string {
  const formatInstructions = FORMAT_INSTRUCTIONS[format]

  const resultsList = results
    .map((r, i) => {
      const snippet = r.snippet ? r.snippet.slice(0, 200) : 'No snippet available'
      return `[${i + 1}] "${r.title}"
    URL: ${r.url}
    Source: ${r.source_name}
    Snippet: ${snippet}
    Relevance: ${r.relevance_score.toFixed(2)}`
    })
    .join('\n\n')

  return `${formatInstructions}

RESEARCH RESULTS (use ONLY these URLs):
${resultsList}

Generate the newsletter content now. Remember: only use URLs from the list above.`
}
