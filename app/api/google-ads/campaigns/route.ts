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
        entity: 'campaign_budget',
        operation: 'create',
        resource: {
          resource_name: budgetResourceName,
          amount_micros: body.dailyBudget * 1_000_000,
          delivery_method: 2, // STANDARD
        },
      },
      {
        entity: 'campaign',
        operation: 'create',
        resource: {
          resource_name: campaignResourceName,
          name: body.name,
          advertising_channel_type: body.type,
          status: 2, // PAUSED
          campaign_budget: budgetResourceName,
        },
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
    const statusMap: Record<string, number> = { pause: 3, enable: 2, remove: 4 } // PAUSED=3, ENABLED=2, REMOVED=4
    return [{
      entity: 'campaign' as const,
      operation: 'update' as const,
      resource: {
        resource_name: `customers/${customerId}/campaigns/${action.id}`,
        status: statusMap[action.operation] ?? action.operation,
        ...action.fields,
      },
    }]
  }

  return []
}
