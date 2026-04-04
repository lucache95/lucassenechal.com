import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/google-ads/client', () => ({
  getDetailedReport: vi.fn(),
}))

import { getDetailedReport } from '@/lib/google-ads/client'
import { GET } from '../route'
import { NextRequest } from 'next/server'

describe('GET /api/google-ads/report', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-secret'
  })

  it('returns 401 without auth', async () => {
    const req = new NextRequest('http://localhost/api/google-ads/report')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns report data', async () => {
    ;(getDetailedReport as any).mockResolvedValue([{ campaign: { name: 'Test' } }])

    const req = new NextRequest('http://localhost/api/google-ads/report', {
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.report).toHaveLength(1)
  })
})
