# Google Ads + Analytics AI Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build API routes for AI-powered Google Ads campaign management and GA4 landing page analytics, with an AI optimizer that correlates both data sources.

**Architecture:** Next.js API routes protected by Bearer token auth. Google Ads client (`google-ads-api` v23) for ad operations. GA4 Data API for page analytics. Claude Sonnet for AI optimization decisions. All actions logged to Supabase.

**Tech Stack:** Next.js 16, google-ads-api v23, @ai-sdk/anthropic, Supabase, Vitest (GA4 via raw REST API with OAuth)

**Spec:** `docs/superpowers/specs/2026-04-04-google-ads-analytics-ai-design.md`

---

## File Structure

```
lib/
  auth/
    admin.ts                   # Bearer token auth helper
  google-ads/
    client.ts                  # Google Ads API client wrapper
    types.ts                   # TypeScript types for campaigns, reports, actions
  analytics/
    client.ts                  # GA4 Data API client
    types.ts                   # Analytics types
  optimizer/
    prompt.ts                  # AI system prompt and action schema (Zod)
    executor.ts                # Execute actions returned by AI via Google Ads API

app/api/
  google-ads/
    campaigns/
      route.ts                 # GET, POST, PATCH campaigns
      __tests__/route.test.ts
    report/
      route.ts                 # GET performance report
      __tests__/route.test.ts
    optimize/
      route.ts                 # POST AI optimization
      __tests__/route.test.ts
  analytics/
    report/
      route.ts                 # GET page analytics
      __tests__/route.test.ts
    funnel/
      route.ts                 # GET funnel tracking
      __tests__/route.test.ts

supabase/migrations/
  009_google_ads_actions.sql   # Logging table

scripts/
  google-ads-auth.ts           # Updated OAuth script (reads from env, combined scopes)
```

---

### Task 1: Foundation — Migration, Auth, Config

**Files:**
- Create: `supabase/migrations/009_google_ads_actions.sql`
- Create: `lib/auth/admin.ts`
- Modify: `next.config.ts`
- Modify: `scripts/google-ads-auth.ts`

- [ ] **Step 1: Create Supabase migration**

```sql
-- 009_google_ads_actions.sql
-- Google Ads AI optimizer action log

CREATE TABLE google_ads_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_google_ads_actions_status ON google_ads_actions(status);
CREATE INDEX idx_google_ads_actions_created ON google_ads_actions(created_at DESC);
```

- [ ] **Step 2: Create admin auth helper**

```typescript
// lib/auth/admin.ts
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export function requireAdmin(request: Request): NextResponse | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tokenBuf = Buffer.from(token)
  const secretBuf = Buffer.from(process.env.ADMIN_SECRET)
  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null // authorized
}
```

- [ ] **Step 3: Add google-ads-api to serverExternalPackages in next.config.ts**

In `next.config.ts`, add `'google-ads-api'` to the `serverExternalPackages` array:

```typescript
serverExternalPackages: ['@react-email/components', '@react-email/render', 'google-ads-api'],
```

- [ ] **Step 4: Update OAuth script to read from env and add analytics scope**

Rewrite `scripts/google-ads-auth.ts` to read credentials from env vars and request both `adwords` and `analytics.readonly` scopes:

```typescript
// scripts/google-ads-auth.ts
import http from 'http'
import { execSync } from 'child_process'

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3456'
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/analytics.readonly',
].join(' ')

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET in env')
  process.exit(1)
}

const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
  `client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\n🔐 Google Ads + Analytics OAuth2 Setup\n')
console.log('Opening browser for authorization...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:3456`)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>Authorization failed</h1><p>You can close this tab.</p>')
    console.error('❌ Authorization denied:', error)
    server.close()
    process.exit(1)
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>No code received</h1>')
    return
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json() as {
      refresh_token?: string
      access_token?: string
      error?: string
      error_description?: string
    }

    if (tokens.error) {
      throw new Error(`${tokens.error}: ${tokens.error_description}`)
    }

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>✅ Authorization successful!</h1><p>You can close this tab.</p>')

    console.log('✅ Authorization successful!\n')
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\nUpdate this value in your .env.local file.\n')
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end('<h1>❌ Token exchange failed</h1>')
    console.error('❌ Token exchange failed:', err)
  }

  server.close()
})

server.listen(3456, () => {
  execSync(`open "${authUrl}"`)
})
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/009_google_ads_actions.sql lib/auth/admin.ts next.config.ts scripts/google-ads-auth.ts
git commit -m "feat: foundation for Google Ads + Analytics integration"
```

---

### Task 2: Google Ads Client

**Files:**
- Create: `lib/google-ads/types.ts`
- Create: `lib/google-ads/client.ts`

- [ ] **Step 1: Create types**

```typescript
// lib/google-ads/types.ts
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
```

- [ ] **Step 2: Create client wrapper**

```typescript
// lib/google-ads/client.ts
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
      attributes: ['campaign.id', 'campaign.name', 'campaign.status'],
    },
    ad_group: {
      entity: 'ad_group' as const,
      attributes: ['ad_group.id', 'ad_group.name', 'ad_group.status', 'campaign.name'],
    },
    keyword: {
      entity: 'ad_group_criterion' as const,
      attributes: ['ad_group_criterion.keyword.text', 'ad_group_criterion.keyword.match_type', 'campaign.name', 'ad_group.name'],
    },
  }

  const config = entityMap[level]

  return customer.report({
    entity: config.entity,
    attributes: config.attributes,
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/google-ads/types.ts lib/google-ads/client.ts
git commit -m "feat: Google Ads client wrapper with campaign reporting"
```

---

### Task 3: Google Ads API Routes

**Files:**
- Create: `app/api/google-ads/campaigns/route.ts`
- Create: `app/api/google-ads/report/route.ts`
- Create: `app/api/google-ads/campaigns/__tests__/route.test.ts`
- Create: `app/api/google-ads/report/__tests__/route.test.ts`

- [ ] **Step 1: Write test for GET campaigns**

```typescript
// app/api/google-ads/campaigns/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/google-ads/client', () => ({
  listCampaigns: vi.fn(),
}))

import { listCampaigns } from '@/lib/google-ads/client'
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockListCampaigns = listCampaigns as ReturnType<typeof vi.fn>

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/google-ads/campaigns')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const req = new NextRequest(url.toString())
  Object.defineProperty(req, 'headers', {
    value: new Headers({ authorization: 'Bearer test-secret' }),
  })
  return req
}

describe('GET /api/google-ads/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-secret'
  })

  it('returns 401 without auth', async () => {
    const req = new NextRequest('http://localhost/api/google-ads/campaigns')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns campaigns with default date range', async () => {
    mockListCampaigns.mockResolvedValue({
      campaigns: [{ id: '1', name: 'Test Campaign', clicks: 100 }],
      dateRange: { start: '2026-03-28', end: '2026-04-04' },
      totals: { clicks: 100, impressions: 1000, cost: 50, conversions: 5 },
    })

    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.campaigns).toHaveLength(1)
    expect(mockListCampaigns).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/google-ads/campaigns/__tests__/route.test.ts`
Expected: FAIL — route file doesn't exist

- [ ] **Step 3: Implement GET/POST/PATCH campaigns route**

```typescript
// app/api/google-ads/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { listCampaigns, getCustomer } from '@/lib/google-ads/client'
import type { CreateCampaignInput, UpdateCampaignAction } from '@/lib/google-ads/types'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()

    const report = await listCampaigns(startDate, endDate)
    return NextResponse.json(report)
  } catch (err) {
    console.error('[google-ads/campaigns GET]:', err)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body: CreateCampaignInput = await request.json()
    if (!body.name || !body.type || !body.dailyBudget) {
      return NextResponse.json({ error: 'Missing required fields: name, type, dailyBudget' }, { status: 400 })
    }

    const customer = getCustomer()
    const budgetResourceName = `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaignBudgets/-1`
    const campaignResourceName = `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/-2`

    const result = await customer.mutateResources([
      {
        _resource: 'CampaignBudget',
        _operation: 'create',
        resource_name: budgetResourceName,
        amount_micros: body.dailyBudget * 1_000_000,
        delivery_method: 'STANDARD',
      },
      {
        _resource: 'Campaign',
        _operation: 'create',
        resource_name: campaignResourceName,
        name: body.name,
        advertising_channel_type: body.type,
        status: 'PAUSED',
        campaign_budget: budgetResourceName,
      },
    ])

    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error('[google-ads/campaigns POST]:', err)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body: { actions: UpdateCampaignAction[] } = await request.json()
    if (!body.actions?.length) {
      return NextResponse.json({ error: 'No actions provided' }, { status: 400 })
    }

    const customer = getCustomer()
    const results = []

    for (const action of body.actions) {
      try {
        const mutations = buildMutation(action)
        const result = await customer.mutateResources(mutations)
        results.push({ action, status: 'success', result })
      } catch (err) {
        results.push({ action, status: 'failed', error: String(err) })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[google-ads/campaigns PATCH]:', err)
    return NextResponse.json({ error: 'Failed to update campaigns' }, { status: 500 })
  }
}

function buildMutation(action: UpdateCampaignAction): any[] {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!

  if (action.resource === 'campaign') {
    const statusMap: Record<string, string> = { pause: 'PAUSED', enable: 'ENABLED', remove: 'REMOVED' }
    return [{
      _resource: 'Campaign',
      _operation: 'update',
      resource_name: `customers/${customerId}/campaigns/${action.id}`,
      status: statusMap[action.operation] || action.operation,
      ...action.fields,
    }]
  }

  return []
}
```

- [ ] **Step 4: Implement GET report route**

```typescript
// app/api/google-ads/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getDetailedReport } from '@/lib/google-ads/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()
    const level = (searchParams.get('level') || 'campaign') as 'campaign' | 'ad_group' | 'keyword'

    const report = await getDetailedReport(startDate, endDate, level)
    return NextResponse.json({ report, dateRange: { start: startDate, end: endDate }, level })
  } catch (err) {
    console.error('[google-ads/report GET]:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run app/api/google-ads/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/google-ads/ lib/google-ads/
git commit -m "feat: Google Ads API routes — campaigns CRUD + reporting"
```

---

### Task 4: Google Analytics Client + Routes

**Files:**
- Create: `lib/analytics/types.ts`
- Create: `lib/analytics/client.ts`
- Create: `app/api/analytics/report/route.ts`
- Create: `app/api/analytics/funnel/route.ts`

- [ ] **Step 1: Create analytics types**

```typescript
// lib/analytics/types.ts
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
```

- [ ] **Step 2: Create GA4 client**

```typescript
// lib/analytics/client.ts
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
```

- [ ] **Step 3: Create analytics report route**

```typescript
// app/api/analytics/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPageMetrics } from '@/lib/analytics/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()

    const pages = await getPageMetrics(startDate, endDate)
    return NextResponse.json({ pages, dateRange: { start: startDate, end: endDate } })
  } catch (err) {
    console.error('[analytics/report GET]:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create analytics funnel route**

```typescript
// app/api/analytics/funnel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getFunnelReport } from '@/lib/analytics/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    if (!page) {
      return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 })
    }

    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()

    const funnel = await getFunnelReport(page, startDate, endDate)
    return NextResponse.json(funnel)
  } catch (err) {
    console.error('[analytics/funnel GET]:', err)
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run app/api/analytics/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/analytics/ app/api/analytics/
git commit -m "feat: Google Analytics client + report and funnel API routes"
```

---

### Task 5: AI Optimizer

**Files:**
- Create: `lib/optimizer/prompt.ts`
- Create: `lib/optimizer/executor.ts`
- Create: `app/api/google-ads/optimize/route.ts`
- Create: `app/api/google-ads/optimize/__tests__/route.test.ts`

- [ ] **Step 1: Create action schema and system prompt**

```typescript
// lib/optimizer/prompt.ts
import { z } from 'zod'

export const optimizerActionSchema = z.object({
  actions: z.array(z.object({
    type: z.enum([
      'pause_keyword',
      'enable_keyword',
      'pause_campaign',
      'enable_campaign',
      'adjust_bid',
      'adjust_budget',
      'flag_page',
    ]),
    id: z.string().describe('Google Ads entity ID or page URL'),
    reason: z.string().describe('Why this action is recommended'),
    newBid: z.number().optional().describe('New bid amount in dollars (for adjust_bid)'),
    newBudget: z.number().optional().describe('New daily budget in dollars (for adjust_budget)'),
    issue: z.string().optional().describe('Landing page issue description (for flag_page)'),
  })),
  summary: z.string().describe('One paragraph summary of all optimizations'),
})

export type OptimizerActions = z.infer<typeof optimizerActionSchema>

export const OPTIMIZER_SYSTEM_PROMPT = `You are a Google Ads optimization expert. You analyze campaign performance data and landing page analytics to make data-driven optimization decisions.

Your goals:
- Minimize cost per acquisition (CPA)
- Maximize return on ad spend (ROAS)
- Identify wasted spend and redirect budget to top performers
- Cross-reference ad performance with landing page behavior

Rules:
- Only recommend actions you are confident will improve performance
- Always explain your reasoning with specific data points
- For landing page issues, use "flag_page" — never try to modify pages
- Be conservative: prefer pausing poor performers over aggressive bid changes
- If data is insufficient to make a decision, say so and recommend no action

Return your recommendations as structured JSON matching the provided schema.`
```

- [ ] **Step 2: Create action executor**

```typescript
// lib/optimizer/executor.ts
import { createClient } from '@supabase/supabase-js'
import { getCustomer } from '@/lib/google-ads/client'
import type { OptimizerActions } from './prompt'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function executeActions(
  actions: OptimizerActions['actions'],
  dryRun: boolean
): Promise<{ action: typeof actions[0]; status: string; error?: string }[]> {
  const supabase = getSupabase()
  const results = []

  for (const action of actions) {
    const logEntry = {
      action_type: action.type,
      target_id: action.id,
      reason: action.reason,
      data: action,
      status: dryRun ? 'dry_run' : 'pending',
      executed_at: dryRun ? null : new Date().toISOString(),
    }

    if (dryRun) {
      await supabase.from('google_ads_actions').insert(logEntry)
      results.push({ action, status: 'dry_run' })
      continue
    }

    try {
      if (action.type !== 'flag_page') {
        await executeGoogleAdsAction(action)
      }

      logEntry.status = action.type === 'flag_page' ? 'flagged' : 'success'
      await supabase.from('google_ads_actions').insert(logEntry)
      results.push({ action, status: logEntry.status })
    } catch (err) {
      logEntry.status = 'failed'
      await supabase.from('google_ads_actions').insert({ ...logEntry, data: { ...action, error: String(err) } })
      results.push({ action, status: 'failed', error: String(err) })
    }
  }

  return results
}

async function executeGoogleAdsAction(action: OptimizerActions['actions'][0]): Promise<void> {
  const customer = getCustomer()
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!

  switch (action.type) {
    case 'pause_keyword':
    case 'enable_keyword':
      await customer.mutateResources([{
        _resource: 'AdGroupCriterion',
        _operation: 'update',
        resource_name: `customers/${customerId}/adGroupCriteria/${action.id}`,
        status: action.type === 'pause_keyword' ? 'PAUSED' : 'ENABLED',
      }])
      break

    case 'pause_campaign':
    case 'enable_campaign':
      await customer.mutateResources([{
        _resource: 'Campaign',
        _operation: 'update',
        resource_name: `customers/${customerId}/campaigns/${action.id}`,
        status: action.type === 'pause_campaign' ? 'PAUSED' : 'ENABLED',
      }])
      break

    case 'adjust_bid':
      if (action.newBid) {
        await customer.mutateResources([{
          _resource: 'AdGroupCriterion',
          _operation: 'update',
          resource_name: `customers/${customerId}/adGroupCriteria/${action.id}`,
          cpc_bid_micros: action.newBid * 1_000_000,
        }])
      }
      break

    case 'adjust_budget':
      if (action.newBudget) {
        await customer.mutateResources([{
          _resource: 'CampaignBudget',
          _operation: 'update',
          resource_name: `customers/${customerId}/campaignBudgets/${action.id}`,
          amount_micros: action.newBudget * 1_000_000,
        }])
      }
      break
  }
}

export async function checkConcurrencyGuard(): Promise<boolean> {
  const supabase = getSupabase()
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('google_ads_actions')
    .select('id')
    .gte('created_at', thirtyMinAgo)
    .not('status', 'eq', 'dry_run')
    .limit(1)

  return (data?.length ?? 0) > 0
}
```

- [ ] **Step 3: Create optimize route**

```typescript
// app/api/google-ads/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { requireAdmin } from '@/lib/auth/admin'
import { listCampaigns, getDetailedReport } from '@/lib/google-ads/client'
import { getPageMetrics } from '@/lib/analytics/client'
import { OPTIMIZER_SYSTEM_PROMPT, optimizerActionSchema } from '@/lib/optimizer/prompt'
import { executeActions, checkConcurrencyGuard } from '@/lib/optimizer/executor'

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') === 'true'

    // Concurrency guard
    if (!dryRun) {
      const recentRun = await checkConcurrencyGuard()
      if (recentRun) {
        return NextResponse.json(
          { error: 'Optimization already ran within the last 30 minutes. Try again later.' },
          { status: 429 }
        )
      }
    }

    // Pull data from both sources
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()

    const [campaigns, keywordReport, pageMetrics] = await Promise.all([
      listCampaigns(startDate, endDate),
      getDetailedReport(startDate, endDate, 'keyword'),
      getPageMetrics(startDate, endDate).catch(() => []),
    ])

    // Build prompt with data
    const dataPrompt = [
      '## Campaign Performance (last 7 days)',
      JSON.stringify(campaigns, null, 2),
      '',
      '## Keyword Performance',
      JSON.stringify(keywordReport.slice(0, 100), null, 2),
      '',
      '## Landing Page Analytics',
      JSON.stringify(pageMetrics, null, 2),
      '',
      'Analyze this data and provide specific optimization recommendations.',
    ].join('\n')

    // Get AI recommendations
    const { object: recommendations } = await generateObject({
      model: anthropic('claude-sonnet-4-5-20250514'),
      system: OPTIMIZER_SYSTEM_PROMPT,
      prompt: dataPrompt,
      schema: optimizerActionSchema,
    })

    // Execute actions
    const results = await executeActions(recommendations.actions, dryRun)

    return NextResponse.json({
      summary: recommendations.summary,
      dryRun,
      actions: results,
      dataSnapshot: {
        campaignCount: campaigns.campaigns.length,
        totalSpend: campaigns.totals.cost,
        pagesAnalyzed: pageMetrics.length,
      },
    })
  } catch (err) {
    console.error('[google-ads/optimize POST]:', err)
    return NextResponse.json({ error: 'Optimization failed' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Write test for optimize route**

```typescript
// app/api/google-ads/optimize/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/google-ads/client', () => ({
  listCampaigns: vi.fn(),
  getDetailedReport: vi.fn(),
}))

vi.mock('@/lib/analytics/client', () => ({
  getPageMetrics: vi.fn(),
}))

vi.mock('@/lib/optimizer/executor', () => ({
  executeActions: vi.fn(),
  checkConcurrencyGuard: vi.fn(),
}))

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => 'mock-model'),
}))

import { listCampaigns, getDetailedReport } from '@/lib/google-ads/client'
import { getPageMetrics } from '@/lib/analytics/client'
import { executeActions, checkConcurrencyGuard } from '@/lib/optimizer/executor'
import { generateObject } from 'ai'
import { POST } from '../route'
import { NextRequest } from 'next/server'

describe('POST /api/google-ads/optimize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-secret'
    ;(checkConcurrencyGuard as any).mockResolvedValue(false)
    ;(listCampaigns as any).mockResolvedValue({ campaigns: [], totals: { cost: 0 } })
    ;(getDetailedReport as any).mockResolvedValue([])
    ;(getPageMetrics as any).mockResolvedValue([])
    ;(generateObject as any).mockResolvedValue({
      object: { actions: [], summary: 'No actions needed.' },
    })
    ;(executeActions as any).mockResolvedValue([])
  })

  it('returns 401 without auth', async () => {
    const req = new NextRequest('http://localhost/api/google-ads/optimize', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 429 when optimization ran recently', async () => {
    ;(checkConcurrencyGuard as any).mockResolvedValue(true)
    const req = new NextRequest('http://localhost/api/google-ads/optimize', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('allows dry run even with recent optimization', async () => {
    ;(checkConcurrencyGuard as any).mockResolvedValue(true)
    const req = new NextRequest('http://localhost/api/google-ads/optimize?dryRun=true', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 5: Run all tests**

Run: `npx vitest run app/api/google-ads/ app/api/analytics/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/optimizer/ app/api/google-ads/optimize/
git commit -m "feat: AI-powered Google Ads optimizer with concurrency guard and dry-run"
```

---

### Task 6: Re-generate OAuth Token with Analytics Scope

**This is a manual step requiring browser interaction.**

- [ ] **Step 1: Enable Google Analytics Data API**

Go to Google Cloud Console > API Library > search "Google Analytics Data API" > Enable

- [ ] **Step 2: Get GA4 Property ID**

Go to Google Analytics > Admin > Property Settings > copy the numeric Property ID

- [ ] **Step 3: Add GA4_PROPERTY_ID to .env.local**

```
GA4_PROPERTY_ID=your-numeric-property-id
```

- [ ] **Step 4: Re-run OAuth flow with combined scopes**

Run: `npx tsx scripts/google-ads-auth.ts`

This will open the browser. Authorize both Google Ads and Analytics access. Copy the new refresh token to `.env.local`.

- [ ] **Step 5: Verify integration**

Run the dev server and test:
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" http://localhost:3000/api/google-ads/campaigns
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" http://localhost:3000/api/analytics/report
curl -X POST -H "Authorization: Bearer YOUR_ADMIN_SECRET" "http://localhost:3000/api/google-ads/optimize?dryRun=true"
```

- [ ] **Step 6: Commit any remaining changes**

```bash
git add .env.local.example
git commit -m "chore: add GA4_PROPERTY_ID to env example"
```
