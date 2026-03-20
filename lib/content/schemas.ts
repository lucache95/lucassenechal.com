import { z } from 'zod'

// === DIGEST FORMAT (CONT-01) ===
export const DigestItemSchema = z.object({
  title: z.string().describe('Rewritten headline -- punchier, more specific than original. 5-12 words.'),
  summary: z.string().describe('2-3 sentence summary in Lucas voice. What happened and why it matters. No filler.'),
  url: z.string().url().describe('Original source URL -- must match exactly one of the provided research result URLs'),
  sourceName: z.string().describe('Human-readable source name like "TechCrunch" or "Reuters"'),
})

export const DigestSchema = z.object({
  subject: z.string().max(60).describe('Email subject line. Specific and curiosity-driven, not clickbait. Under 60 chars.'),
  greeting: z.string().describe('One casual sentence to open. Reference the day or a theme across items. No "Good morning" or "Happy Tuesday."'),
  items: z.array(DigestItemSchema).min(3).max(8)
    .describe('5-8 curated items ordered by relevance. Each is a standalone nugget.'),
  signoff: z.string().describe('One brief closing line. Warm but not sappy. No "stay tuned" or "until next time."'),
})

export type DigestContent = z.infer<typeof DigestSchema>

// === BRIEFING FORMAT (CONT-02) ===
export const BriefingSchema = z.object({
  subject: z.string().max(60).describe('Email subject line capturing the main theme. Under 60 chars.'),
  intro: z.string().describe("2-3 sentence intro that frames the day's theme or connecting dots. Sets context without being preamble-y."),
  sections: z.array(z.object({
    heading: z.string().describe('Section heading -- topical grouping of related findings'),
    body: z.string().describe('2-4 paragraph narrative synthesis. Weave findings together, cite sources inline as "(via Source)" or "per Source". Draw connections the reader would not see from headlines alone.'),
    sourceUrls: z.array(z.string().url()).describe('URLs referenced in this section -- must match input research result URLs'),
  })).min(2).max(4).describe('2-4 thematic sections synthesizing research results into narrative'),
  conclusion: z.string().describe('1-2 sentence wrap-up. Can include a forward-looking note or a question to ponder. Not generic.'),
})

export type BriefingContent = z.infer<typeof BriefingSchema>

// === MIXED FORMAT (CONT-03) ===
export const MixedSchema = z.object({
  subject: z.string().max(60).describe('Email subject line. Under 60 chars.'),
  synthesis: z.string().describe("3-5 sentence overview synthesizing the most important findings. What's the thread connecting today's results? Written in Lucas voice."),
  items: z.array(z.object({
    title: z.string().describe('Brief headline for this item. 5-10 words.'),
    oneLiner: z.string().describe('One sentence -- the essential takeaway. No filler.'),
    url: z.string().url().describe('Source URL -- must match input research result URLs'),
    sourceName: z.string().describe('Human-readable source name'),
  })).min(3).max(8).describe('5-8 linked items below the synthesis, ordered by relevance'),
  signoff: z.string().describe('Brief closing. Warm, not formulaic.'),
})

export type MixedContent = z.infer<typeof MixedSchema>
