import type { SearchResult } from '@/lib/research/types'

const VERIFY_TIMEOUT_MS = 5000  // 5 seconds
const BATCH_SIZE = 10

/**
 * Verify a single URL via HEAD request.
 * Returns true if URL responds with 2xx within 5 seconds.
 * Returns false for 4xx/5xx, timeout, or network error.
 * This ensures anti-hallucination: only real, reachable URLs are stored.
 */
export async function verifyUrl(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    return response.ok // 2xx status codes
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Verify multiple URLs in parallel batches of 10.
 * Returns Map<url, isValid> for all checked URLs.
 */
export async function verifyUrlBatch(urls: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    const checks = await Promise.allSettled(
      batch.map(async (url) => ({ url, valid: await verifyUrl(url) }))
    )

    for (let j = 0; j < checks.length; j++) {
      const check = checks[j]
      if (check.status === 'fulfilled') {
        results.set(check.value.url, check.value.valid)
      } else {
        // Should not happen since verifyUrl never throws, but handle gracefully
        results.set(batch[j], false)
      }
    }
  }

  return results
}

/**
 * Filter SearchResult[] to only include results with verified URLs.
 */
export async function filterVerifiedResults(
  results: SearchResult[]
): Promise<SearchResult[]> {
  if (results.length === 0) return []

  const urls = results.map(r => r.url)
  const verificationMap = await verifyUrlBatch(urls)

  return results.filter(r => verificationMap.get(r.url) === true)
}
