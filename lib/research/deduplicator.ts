import { createClient } from '@supabase/supabase-js'
import type { SearchResult } from '@/lib/research/types'

/**
 * Compute SHA-256 hash of a normalized URL for deduplication.
 * Normalization: lowercase, remove trailing slash, strip query params and hash.
 */
export async function hashUrl(url: string): Promise<string> {
  const normalized = new URL(url)
  normalized.search = ''
  normalized.hash = ''
  const clean = normalized.toString().toLowerCase().replace(/\/$/, '')
  const encoder = new TextEncoder()
  const data = encoder.encode(clean)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function getSupabase(supabaseUrl?: string, serviceRoleKey?: string) {
  const url = supabaseUrl
    ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    ?? (typeof globalThis !== 'undefined' && 'Deno' in globalThis ? (globalThis as any).Deno.env.get('SUPABASE_URL') : undefined)
  const key = serviceRoleKey
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? (typeof globalThis !== 'undefined' && 'Deno' in globalThis ? (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : undefined)

  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key)
}

/**
 * Check which URL hashes already exist in sent_url_hashes for a subscriber.
 * Returns set of hashes that are duplicates (already sent in last 30 days).
 */
export async function checkDuplicates(
  subscriberId: string,
  urlHashes: string[],
  supabaseUrl?: string,
  serviceRoleKey?: string
): Promise<Set<string>> {
  const supabase = getSupabase(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('sent_url_hashes')
    .select('url_hash')
    .eq('subscriber_id', subscriberId)
    .in('url_hash', urlHashes)

  if (error) {
    console.error('Dedup check failed:', error.message)
    return new Set() // On error, treat all as new (better to show than miss)
  }

  return new Set((data ?? []).map(row => row.url_hash))
}

/**
 * Record sent URL hashes for a subscriber.
 * Uses upsert to handle potential duplicates from race conditions.
 */
export async function recordSentUrls(
  subscriberId: string,
  urlHashes: string[],
  supabaseUrl?: string,
  serviceRoleKey?: string
): Promise<void> {
  if (urlHashes.length === 0) return

  const supabase = getSupabase(supabaseUrl, serviceRoleKey)

  const rows = urlHashes.map(hash => ({
    subscriber_id: subscriberId,
    url_hash: hash,
  }))

  const { error } = await supabase
    .from('sent_url_hashes')
    .upsert(rows, { onConflict: 'subscriber_id,url_hash', ignoreDuplicates: true })

  if (error) {
    console.error('Failed to record sent URLs:', error.message)
  }
}

/**
 * Deduplicate SearchResults against subscriber's 30-day history.
 * Computes urlHash for each result and filters out duplicates.
 */
export async function deduplicateResults(
  subscriberId: string,
  results: SearchResult[]
): Promise<SearchResult[]> {
  if (results.length === 0) return []

  // Compute hashes for all results
  const withHashes = await Promise.all(
    results.map(async (r) => ({
      ...r,
      urlHash: await hashUrl(r.url),
    }))
  )

  // Check which are duplicates
  const hashes = withHashes.map(r => r.urlHash)
  const duplicates = await checkDuplicates(subscriberId, hashes)

  // Return only new results
  return withHashes.filter(r => !duplicates.has(r.urlHash))
}
