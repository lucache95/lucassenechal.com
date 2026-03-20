/**
 * Validate subscriber-provided RSS/Atom feed URLs for safety.
 * Prevents SSRF attacks by blocking internal IPs and enforcing HTTPS.
 *
 * Rules (from CONTEXT.md):
 * 1. HTTPS-only
 * 2. Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x)
 * 3. Block localhost
 * 4. Enforce 1MB response size limit (enforced at fetch time, not here)
 * 5. Max URL length 2048 chars
 */

export interface FeedValidationResult {
  valid: boolean
  error?: string
}

const PRIVATE_IP_RANGES = [
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^127\./, // 127.0.0.0/8 (loopback)
  /^169\.254\./, // 169.254.0.0/16 (link-local)
  /^0\./, // 0.0.0.0/8
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
]

export function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((range) => range.test(ip))
}

export function validateFeedUrl(url: string): FeedValidationResult {
  // Length check
  if (url.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' }
  }

  // Parse URL
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  // HTTPS only
  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS feed URLs are allowed' }
  }

  // Block empty hostname
  if (!parsed.hostname) {
    return { valid: false, error: 'URL must have a hostname' }
  }

  // Block localhost variants
  const hostname = parsed.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1') {
    return { valid: false, error: 'Localhost URLs are not allowed' }
  }

  // Block private IPs (check if hostname looks like an IP)
  if (isPrivateIp(hostname)) {
    return { valid: false, error: 'Private/internal IP addresses are not allowed' }
  }

  return { valid: true }
}

/**
 * Maximum response size for custom feeds.
 * Enforced at fetch time with content-length check.
 */
export const MAX_FEED_SIZE_BYTES = 1 * 1024 * 1024 // 1MB
