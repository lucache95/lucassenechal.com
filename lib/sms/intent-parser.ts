import { z } from 'zod'

export const smsIntentSchema = z.object({
  intent: z.enum(['question', 'preference_update', 'unknown']),
  preferenceAction: z.optional(z.object({
    field: z.enum(['topics_add', 'topics_remove', 'delivery_time', 'format']),
    value: z.string(),
  })),
  questionContext: z.optional(z.string()),
})

export type SmsIntent = z.infer<typeof smsIntentSchema>

export const SMS_INTENT_SYSTEM_PROMPT = `You classify inbound SMS messages into one of three intents:

1. "question" -- The subscriber is asking a question about their newsletter content or wants more information about a topic. Set questionContext to a brief summary of what they're asking about.

2. "preference_update" -- The subscriber wants to change their newsletter preferences. Detect the specific action:
   - topics_add: They want to add a new topic (e.g., "add local events", "I want crypto news")
   - topics_remove: They want to remove a topic (e.g., "stop sending crypto", "no more sports")
   - delivery_time: They want to change when they receive it (e.g., "switch to morning", "send it at night"). Map to: morning, afternoon, or evening.
   - format: They want to change newsletter format (e.g., "give me the short version", "I want the full briefing"). Map to: digest, briefing, or mixed.

3. "unknown" -- The message doesn't fit either category.

Respond with JSON matching this schema:
{
  "intent": "question" | "preference_update" | "unknown",
  "preferenceAction": { "field": "topics_add" | "topics_remove" | "delivery_time" | "format", "value": "string" } // only for preference_update
  "questionContext": "string" // only for question
}`

export const SMS_FALLBACK_RESPONSE = "I didn't quite get that. Try asking about your newsletter or say HELP for options."
