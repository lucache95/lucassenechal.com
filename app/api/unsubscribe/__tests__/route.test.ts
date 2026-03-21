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
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

const mockEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
const mockFrom = vi.fn().mockReturnValue({
  update: mockUpdate,
})

const mockCreateClient = createClient as ReturnType<typeof vi.fn>
const mockVerifyToken = verifyToken as ReturnType<typeof vi.fn>

function makeRequest(method: string, params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/unsubscribe')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url.toString(), { method })
}

describe('POST /api/unsubscribe (RFC 8058 one-click)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateClient.mockReturnValue({ from: mockFrom })
    mockVerifyToken.mockReturnValue(true)
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  it('returns 200 with empty body for valid request', async () => {
    const request = makeRequest('POST', { s: 'sub-123', t: 'valid-token' })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const text = await response.text()
    expect(text).toBe('')
  })

  it('returns 400 when subscriber id is missing', async () => {
    const request = makeRequest('POST', { t: 'valid-token' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when token is invalid', async () => {
    mockVerifyToken.mockReturnValue(false)
    const request = makeRequest('POST', { s: 'sub-123', t: 'bad-token' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('calls supabase update with status=unsubscribed and unsubscribed_at', async () => {
    const request = makeRequest('POST', { s: 'sub-123', t: 'valid-token' })
    await POST(request)
    expect(mockFrom).toHaveBeenCalledWith('subscribers')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unsubscribed',
        unsubscribed_at: expect.any(String),
      })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'sub-123')
  })
})

describe('GET /api/unsubscribe (human confirmation page)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateClient.mockReturnValue({ from: mockFrom })
    mockVerifyToken.mockReturnValue(true)
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  it('returns 200 with HTML for valid request', async () => {
    const request = makeRequest('GET', { s: 'sub-123', t: 'valid-token' })
    const response = await GET(request)
    expect(response.status).toBe(200)
  })

  it('HTML contains "You\'ve been unsubscribed"', async () => {
    const request = makeRequest('GET', { s: 'sub-123', t: 'valid-token' })
    const response = await GET(request)
    const text = await response.text()
    expect(text).toContain("You've been unsubscribed")
  })

  it('HTML contains "Re-subscribe here"', async () => {
    const request = makeRequest('GET', { s: 'sub-123', t: 'valid-token' })
    const response = await GET(request)
    const text = await response.text()
    expect(text).toContain('Re-subscribe here')
  })

  it('calls supabase update to unsubscribe the user', async () => {
    const request = makeRequest('GET', { s: 'sub-123', t: 'valid-token' })
    await GET(request)
    expect(mockFrom).toHaveBeenCalledWith('subscribers')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unsubscribed',
      })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'sub-123')
  })

  it('returns 400 when token is invalid', async () => {
    mockVerifyToken.mockReturnValue(false)
    const request = makeRequest('GET', { s: 'sub-123', t: 'bad-token' })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })
})
