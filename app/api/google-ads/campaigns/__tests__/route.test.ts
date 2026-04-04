import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/google-ads/client', () => ({
  listCampaigns: vi.fn(),
}))

import { listCampaigns } from '@/lib/google-ads/client'
import { GET } from '../route'
import { NextRequest } from 'next/server'

const mockListCampaigns = listCampaigns as ReturnType<typeof vi.fn>

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/google-ads/campaigns')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const req = new NextRequest(url.toString())
  Object.defineProperty(req, 'headers', {
    value: new Headers({ authorization: 'Bearer test-secret' }),
  })
  return req
}

describe('GET /api/google-ads/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-secret'
  })

  it('returns 401 without auth', async () => {
    const req = new NextRequest('http://localhost/api/google-ads/campaigns')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns campaigns with default date range', async () => {
    mockListCampaigns.mockResolvedValue({
      campaigns: [{ id: '1', name: 'Test Campaign', clicks: 100 }],
      dateRange: { start: '2026-03-28', end: '2026-04-04' },
      totals: { clicks: 100, impressions: 1000, cost: 50, conversions: 5 },
    })

    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.campaigns).toHaveLength(1)
    expect(mockListCampaigns).toHaveBeenCalled()
  })
})
