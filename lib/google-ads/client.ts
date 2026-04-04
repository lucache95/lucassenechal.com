import { GoogleAdsApi } from 'google-ads-api'
import type { CampaignMetrics, CampaignReport } from './types'

let clientInstance: GoogleAdsApi | null = null

function getClient(): GoogleAdsApi {
  if (clientInstance) return clientInstance

  clientInstance = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  })

  return clientInstance
}

function getCustomer() {
  const client = getClient()
  return client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
    login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  })
}

export async function listCampaigns(startDate: string, endDate: string): Promise<CampaignReport> {
  const customer = getCustomer()

  const campaigns = await customer.report({
    entity: 'campaign',
    attributes: ['campaign.id', 'campaign.name', 'campaign.status'],
    metrics: [
      'metrics.clicks',
      'metrics.impressions',
      'metrics.cost_micros',
      'metrics.conversions',
      'metrics.ctr',
      'metrics.average_cpc',
    ],
    constraints: {
      'campaign.status': ['ENABLED', 'PAUSED'],
    },
    from_date: startDate,
    to_date: endDate,
  })

  const mapped: CampaignMetrics[] = campaigns.map((row: any) => ({
    id: row.campaign.id.toString(),
    name: row.campaign.name,
    status: row.campaign.status,
    clicks: row.metrics.clicks || 0,
    impressions: row.metrics.impressions || 0,
    cost: (row.metrics.cost_micros || 0) / 1_000_000,
    conversions: row.metrics.conversions || 0,
    ctr: row.metrics.ctr || 0,
    cpc: (row.metrics.average_cpc || 0) / 1_000_000,
    roas: 0, // calculated from conversion value if available
  }))

  const totals = mapped.reduce(
    (acc, c) => ({
      clicks: acc.clicks + c.clicks,
      impressions: acc.impressions + c.impressions,
      cost: acc.cost + c.cost,
      conversions: acc.conversions + c.conversions,
    }),
    { clicks: 0, impressions: 0, cost: 0, conversions: 0 }
  )

  return {
    campaigns: mapped,
    dateRange: { start: startDate, end: endDate },
    totals,
  }
}

export async function getDetailedReport(
  startDate: string,
  endDate: string,
  level: 'campaign' | 'ad_group' | 'keyword' = 'campaign'
): Promise<any[]> {
  const customer = getCustomer()

  const entityMap = {
    campaign: {
      entity: 'campaign' as const,
      attributes: ['campaign.id', 'campaign.name', 'campaign.status'] as const,
    },
    ad_group: {
      entity: 'ad_group' as const,
      attributes: ['ad_group.id', 'ad_group.name', 'ad_group.status', 'campaign.name'] as const,
    },
    keyword: {
      entity: 'ad_group_criterion' as const,
      attributes: ['ad_group_criterion.keyword.text', 'ad_group_criterion.keyword.match_type', 'campaign.name', 'ad_group.name'] as const,
    },
  } as const

  const config = entityMap[level]

  return customer.report({
    entity: config.entity,
    attributes: [...config.attributes],
    metrics: [
      'metrics.clicks',
      'metrics.impressions',
      'metrics.cost_micros',
      'metrics.conversions',
      'metrics.ctr',
      'metrics.average_cpc',
    ],
    from_date: startDate,
    to_date: endDate,
  })
}

export { getCustomer }
