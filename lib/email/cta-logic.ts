export type CtaLevel = 'soft' | 'medium'

interface EngagementData {
  clickCount: number    // clicks in last 7 days
  feedbackCount?: number // feedback interactions in last 7 days
}

export function getCtaLevel(engagement: EngagementData): CtaLevel {
  if (engagement.feedbackCount && engagement.feedbackCount >= 2) return 'medium'
  if (engagement.clickCount >= 3) return 'medium'
  return 'soft'
}
