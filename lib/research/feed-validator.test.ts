import { describe, it, expect } from 'vitest'
import { validateFeedUrl, isPrivateIp, MAX_FEED_SIZE_BYTES } from './feed-validator'

describe('validateFeedUrl', () => {
  it('accepts valid HTTPS feed URLs', () => {
    expect(validateFeedUrl('https://example.com/feed.xml')).toEqual({ valid: true })
    expect(validateFeedUrl('https://blog.example.org/rss')).toEqual({ valid: true })
  })

  it('rejects HTTP (non-HTTPS) URLs', () => {
    const result = validateFeedUrl('http://example.com/feed.xml')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('HTTPS')
  })

  it('rejects URLs with private IP ranges', () => {
    expect(validateFeedUrl('https://10.0.0.1/feed').valid).toBe(false)
    expect(validateFeedUrl('https://172.16.0.1/feed').valid).toBe(false)
    expect(validateFeedUrl('https://192.168.1.1/feed').valid).toBe(false)
    expect(validateFeedUrl('https://127.0.0.1/feed').valid).toBe(false)
    expect(validateFeedUrl('https://169.254.1.1/feed').valid).toBe(false)
  })

  it('rejects localhost', () => {
    const result = validateFeedUrl('https://localhost/feed')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Localhost')
  })

  it('rejects URLs with no hostname', () => {
    const result = validateFeedUrl('not-a-url')
    expect(result.valid).toBe(false)
  })

  it('rejects URLs longer than 2048 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2040)
    const result = validateFeedUrl(longUrl)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('2048')
  })

  it('rejects FTP and other protocols', () => {
    expect(validateFeedUrl('ftp://example.com/feed').valid).toBe(false)
    expect(validateFeedUrl('file:///etc/passwd').valid).toBe(false)
  })
})

describe('isPrivateIp', () => {
  it('correctly identifies all private IP ranges', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true)
    expect(isPrivateIp('10.255.255.255')).toBe(true)
    expect(isPrivateIp('172.16.0.1')).toBe(true)
    expect(isPrivateIp('172.31.255.255')).toBe(true)
    expect(isPrivateIp('192.168.0.1')).toBe(true)
    expect(isPrivateIp('192.168.255.255')).toBe(true)
    expect(isPrivateIp('127.0.0.1')).toBe(true)
    expect(isPrivateIp('169.254.0.1')).toBe(true)
    expect(isPrivateIp('0.0.0.0')).toBe(true)
  })

  it('returns false for public IPs', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false)
    expect(isPrivateIp('1.1.1.1')).toBe(false)
    expect(isPrivateIp('203.0.113.1')).toBe(false)
    expect(isPrivateIp('172.32.0.1')).toBe(false) // just outside 172.16-31 range
  })
})

describe('MAX_FEED_SIZE_BYTES', () => {
  it('is 1MB', () => {
    expect(MAX_FEED_SIZE_BYTES).toBe(1 * 1024 * 1024)
  })
})
