import { createClient } from '@supabase/supabase-js'
import type { SearchQuery, SearchResult } from '@/lib/research/types'

/**
 * Cluster search queries by keyword overlap.
 * If 2+ queries share 2+ significant keywords, they are grouped together.
 * The cluster uses the first query's text as the canonical query.
 * Returns Map<canonicalQuery, SearchQuery[]> (grouped queries).
 */
export function clusterQueries(queries: SearchQuery[]): Map<string, SearchQuery[]> {
  const clusters = new Map<string, SearchQuery[]>()
  const assigned = new Set<number>()

  for (let i = 0; i < queries.length; i++) {
    if (assigned.has(i)) continue

    const cluster: SearchQuery[] = [queries[i]]
    assigned.add(i)

    for (let j = i + 1; j < queries.length; j++) {
      if (assigned.has(j)) continue

      const sharedKeywords = queries[i].keywords.filter(k =>
        queries[j].keywords.some(k2 => k2.toLowerCase() === k.toLowerCase())
      )

      if (sharedKeywords.length >= 2) {
        cluster.push(queries[j])
        assigned.add(j)
      }
    }

    clusters.set(queries[i].query, cluster)
  }

  return clusters
}

/**
 * Compute cache key for a query: SHA-256 hash of lowercase trimmed query.
 */
export async function queryCacheKey(query: string): Promise<string> {
  const normalized = query.toLowerCase().trim()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Check research_cache for unexpired cached results.
 * Returns cached SearchResult[] if found, null otherwise.
 */
export async function getCachedResults(
  queryHash: string,
  supabaseUrl?: string,
  serviceRoleKey?: string
): Promise<SearchResult[] | null> {
  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('research_cache')
    .select('results, expires_at')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null
  return data.results as SearchResult[]
}

/**
 * Store results in research_cache with 24h TTL.
 * Uses upsert to update if query_hash already exists.
 */
export async function cacheResults(
  queryHash: string,
  query: string,
  results: SearchResult[],
  supabaseUrl?: string,
  serviceRoleKey?: string
): Promise<void> {
  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const supabase = createClient(url, key)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  await supabase
    .from('research_cache')
    .upsert({
      query_hash: queryHash,
      query,
      results,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'query_hash' })
}
