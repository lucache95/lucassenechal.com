import { z } from 'zod';

/**
 * Shared Zod validation schema for the onboarding form.
 * Used on both client (instant feedback) and server (security).
 *
 * Field notes:
 * - topics: array of subtopic slug IDs (e.g., 'ai-tools-assistants')
 * - feedUrls: validated as HTTP/HTTPS only (SSRF prevention)
 * - phone: E.164-like format (empty string or +digits)
 */
export const onboardingSchema = z.object({
  subscriberId: z.string().uuid(),
  topics: z.array(z.string()).default([]),
  customTopics: z.string().max(500).default(''),
  format: z.enum(['digest', 'briefing', 'mixed']).default('digest'),
  deliveryTime: z.enum(['morning', 'afternoon', 'evening']).default('morning'),
  timezone: z.string().default('UTC'),
  city: z.string().max(100).default(''),
  feedUrls: z.array(
    z.string().url().refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'Only HTTP/HTTPS URLs are allowed' }
    )
  ).default([]),
  smsOptIn: z.boolean().default(false),
  phone: z.string().default('').refine(
    (val) => val === '' || /^\+?[1-9]\d{1,14}$/.test(val),
    { message: 'Invalid phone number format' }
  ),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
