// Uses GA4 Data API via raw REST with OAuth access token.
// No @google-analytics/data package needed — avoids gRPC native binding issues.
import type { PageMetrics, FunnelReport, FunnelStep } from './types'

const GA4_PROPERTY = process.env.GA4_PROPERTY_ID

export async function getPageMetrics(startDate: string, endDate: string): Promise<PageMetrics[]> {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViews' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50,
      }),
    }
  )

  const data = await response.json()
  if (!data.rows) return []

  return data.rows.map((row: any) => ({
    path: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    bounceRate: parseFloat(row.metricValues[1].value) || 0,
    avgSessionDuration: parseFloat(row.metricValues[2].value) || 0,
    screenPageViews: parseInt(row.metricValues[3].value) || 0,
  }))
}

export async function getFunnelReport(pagePath: string, startDate: string, endDate: string): Promise<FunnelReport> {
  const accessToken = await getAccessToken()

  const funnelSteps = ['page_view', 'click', 'form_start', 'form_submit']

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'pagePath',
                  stringFilter: { matchType: 'EXACT', value: pagePath },
                },
              },
              {
                filter: {
                  fieldName: 'eventName',
                  inListFilter: { values: funnelSteps },
                },
              },
            ],
          },
        },
      }),
    }
  )

  const data = await response.json()
  const eventCounts: Record<string, number> = {}

  if (data.rows) {
    for (const row of data.rows) {
      eventCounts[row.dimensionValues[0].value] = parseInt(row.metricValues[0].value) || 0
    }
  }

  const steps: FunnelStep[] = funnelSteps.map((step, i) => {
    const count = eventCounts[step] || 0
    const prevCount = i === 0 ? count : (eventCounts[funnelSteps[i - 1]] || 0)
    return {
      step,
      eventName: step,
      count,
      dropOffPercent: prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0,
    }
  })

  const firstCount = steps[0]?.count || 0
  const lastCount = steps[steps.length - 1]?.count || 0

  return {
    page: pagePath,
    steps,
    overallConversionRate: firstCount > 0 ? (lastCount / firstCount) * 100 : 0,
  }
}

async function getAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json() as { access_token?: string; error?: string }
  if (!data.access_token) {
    throw new Error(`OAuth token refresh failed: ${JSON.stringify(data)}`)
  }
  return data.access_token
}
