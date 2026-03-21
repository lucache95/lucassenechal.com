import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/email/token', () => ({
  verifyToken: vi.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/email/token'
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockFrom = vi.fn().mockReturnValue({
  insert: mockInsert,
})

const mockCreateClient = createClient as ReturnType<typeof vi.fn>
const mockVerifyToken = verifyToken as ReturnType<typeof vi.fn>

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/feedback')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url.toString())
}

describe('GET /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateClient.mockReturnValue({ from: mockFrom })
    mockVerifyToken.mockReturnValue(true)
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  it('returns 400 when subscriber id is missing', async () => {
    const request = makeRequest({ url: 'https://example.com/article', v: 'more', t: 'token' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when url param is missing', async () => {
    const request = makeRequest({ s: 'sub-123', v: 'more', t: 'token' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when value param is missing', async () => {
    const request = makeRequest({ s: 'sub-123', url: 'https://example.com/article', t: 'token' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when token param is missing', async () => {
    const request = makeRequest({ s: 'sub-123', url: 'https://example.com/article', v: 'more' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when value is invalid (not more or less)', async () => {
    const request = makeRequest({ s: 'sub-123', url: 'https://example.com/article', v: 'invalid', t: 'token' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when token is invalid', async () => {
    mockVerifyToken.mockReturnValue(false)
    const request = makeRequest({ s: 'sub-123', url: 'https://example.com/article', v: 'more', t: 'bad-token' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('calls verifyToken with action feedback:${itemUrl} using actual URL', async () => {
    const itemUrl = 'https://example.com/article'
    const request = makeRequest({ s: 'sub-123', url: itemUrl, v: 'more', t: 'valid-token' })
    await GET(request)
    expect(mockVerifyToken).toHaveBeenCalledWith('sub-123', `feedback:${itemUrl}`, 'valid-token')
  })

  it('inserts feedback with correct subscriber_id, item_url (actual URL), and signal', async () => {
    const itemUrl = 'https://example.com/article'
    const request = makeRequest({ s: 'sub-123', url: itemUrl, v: 'more', t: 'valid-token' })
    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(mockFrom).toHaveBeenCalledWith('subscriber_feedback')
    expect(mockInsert).toHaveBeenCalledWith({
      subscriber_id: 'sub-123',
      item_url: itemUrl,
      signal: 'more',
    })
  })

  it('accepts less as a valid feedback value', async () => {
    const request = makeRequest({ s: 'sub-123', url: 'https://example.com/article', v: 'less', t: 'valid-token' })
    const response = await GET(request)
    expect(response.status).toBe(200)
  })

  it('response HTML contains "Got it"', async () => {
    const request = makeRequest({ s: 'sub-123', url: 'https://example.com/article', v: 'more', t: 'valid-token' })
    const response = await GET(request)
    const text = await response.text()
    expect(text).toContain('Got it')
  })
})
