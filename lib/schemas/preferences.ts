import { z } from 'zod';

/**
 * Zod validation schemas for preference management updates.
 * Used by Server Actions in app/actions/preferences.ts.
 *
 * Each schema includes subscriberId for authorization context.
 * Field types match onboarding schema and DB constraints.
 */

export const preferencesUpdateSchema = z.object({
  subscriberId: z.string().uuid(),
  format: z.enum(['digest', 'briefing', 'mixed']).default('digest'),
  deliveryTime: z.enum(['morning', 'afternoon', 'evening']).default('morning'),
  timezone: z.string().default('UTC'),
  city: z.string().max(100).default(''),
  smsOptIn: z.boolean().default(false),
  phone: z.string().default('').refine(
    (val) => val === '' || /^\+?[1-9]\d{1,14}$/.test(val),
    { message: 'Invalid phone number format' }
  ),
});

export const topicsUpdateSchema = z.object({
  subscriberId: z.string().uuid(),
  topics: z.array(z.string()).default([]),
  customTopics: z.string().max(500).default(''),
});

export const sourcesUpdateSchema = z.object({
  subscriberId: z.string().uuid(),
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
});

export const unsubscribeSchema = z.object({
  subscriberId: z.string().uuid(),
});

export const resubscribeSchema = z.object({
  subscriberId: z.string().uuid(),
});

export type PreferencesUpdateData = z.infer<typeof preferencesUpdateSchema>;
export type TopicsUpdateData = z.infer<typeof topicsUpdateSchema>;
export type SourcesUpdateData = z.infer<typeof sourcesUpdateSchema>;
