import { createClient } from '@supabase/supabase-js'
import type { ResearchError, ResearchSource } from '@/lib/research/types'

// Deno global type declaration for cross-runtime compatibility
declare const Deno: { env: { get(key: string): string | undefined } } | undefined

// Service role client for server-side writes (same pattern as app/actions.ts)
// Supports both Node.js (process.env) and Deno (Deno.env) runtimes
function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!
  }
  if (typeof Deno !== 'undefined') {
    return Deno.env.get(key)!
  }
  throw new Error(`Missing environment variable: ${key}`)
}

function getAdminClient() {
  return createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
}

export async function createRunLog(subscriberId: string): Promise<string> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('research_runs')
    .insert({
      subscriber_id: subscriberId,
      started_at: new Date().toISOString(),
      status: 'running',
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create run log: ${error.message}`)
  return data.id
}

export async function completeRunLog(
  runId: string,
  updates: {
    queriesRun: number
    sourcesQueried: ResearchSource[]
    resultsFound: number
    resultsStored: number
    costEstimateUsd: number
  }
): Promise<void> {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from('research_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      queries_run: updates.queriesRun,
      sources_queried: updates.sourcesQueried,
      results_found: updates.resultsFound,
      results_stored: updates.resultsStored,
      cost_estimate_usd: updates.costEstimateUsd,
    })
    .eq('id', runId)

  if (error) throw new Error(`Failed to complete run log: ${error.message}`)
}

export async function failRunLog(
  runId: string,
  errors: ResearchError[],
  partialUpdates?: {
    queriesRun?: number
    sourcesQueried?: ResearchSource[]
    resultsFound?: number
    resultsStored?: number
    costEstimateUsd?: number
  }
): Promise<void> {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from('research_runs')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      errors: errors.map(e => ({
        source: e.source,
        message: e.message,
        timestamp: e.timestamp.toISOString(),
      })),
      queries_run: partialUpdates?.queriesRun ?? 0,
      sources_queried: partialUpdates?.sourcesQueried ?? [],
      results_found: partialUpdates?.resultsFound ?? 0,
      results_stored: partialUpdates?.resultsStored ?? 0,
      cost_estimate_usd: partialUpdates?.costEstimateUsd ?? 0,
    })
    .eq('id', runId)

  if (error) throw new Error(`Failed to fail run log: ${error.message}`)
}
