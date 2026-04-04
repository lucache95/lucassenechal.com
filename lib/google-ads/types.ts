export interface CampaignMetrics {
  id: string
  name: string
  status: string
  clicks: number
  impressions: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
}

export interface CampaignReport {
  campaigns: CampaignMetrics[]
  dateRange: { start: string; end: string }
  totals: {
    clicks: number
    impressions: number
    cost: number
    conversions: number
  }
}

export interface CreateCampaignInput {
  name: string
  type: 'SEARCH' | 'DISPLAY' | 'SHOPPING' | 'PERFORMANCE_MAX'
  dailyBudget: number
  keywords?: string[]
  headlines?: string[]
  descriptions?: string[]
  landingPageUrl?: string
}

export interface UpdateCampaignAction {
  resource: 'campaign' | 'ad_group' | 'keyword' | 'ad'
  id: string
  operation: 'pause' | 'enable' | 'remove' | 'update'
  fields?: Record<string, unknown>
}
