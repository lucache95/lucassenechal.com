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
