export interface PageMetrics {
  path: string
  sessions: number
  bounceRate: number
  avgSessionDuration: number
  screenPageViews: number
}

export interface FunnelStep {
  step: string
  eventName: string
  count: number
  dropOffPercent: number
}

export interface FunnelReport {
  page: string
  steps: FunnelStep[]
  overallConversionRate: number
}
