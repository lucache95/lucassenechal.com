import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/google-ads/client', () => ({
  listCampaigns: vi.fn(),
  getDetailedReport: vi.fn(),
}))

vi.mock('@/lib/analytics/client', () => ({
  getPageMetrics: vi.fn(),
}))

vi.mock('@/lib/optimizer/executor', () => ({
  executeActions: vi.fn(),
  checkConcurrencyGuard: vi.fn(),
}))

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => 'mock-model'),
}))

import { listCampaigns, getDetailedReport } from '@/lib/google-ads/client'
import { getPageMetrics } from '@/lib/analytics/client'
import { executeActions, checkConcurrencyGuard } from '@/lib/optimizer/executor'
import { generateObject } from 'ai'
import { POST } from '../route'
import { NextRequest } from 'next/server'

describe('POST /api/google-ads/optimize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-secret'
    ;(checkConcurrencyGuard as any).mockResolvedValue(false)
    ;(listCampaigns as any).mockResolvedValue({ campaigns: [], totals: { cost: 0 } })
    ;(getDetailedReport as any).mockResolvedValue([])
    ;(getPageMetrics as any).mockResolvedValue([])
    ;(generateObject as any).mockResolvedValue({
      object: { actions: [], summary: 'No actions needed.' },
    })
    ;(executeActions as any).mockResolvedValue([])
  })

  it('returns 401 without auth', async () => {
    const req = new NextRequest('http://localhost/api/google-ads/optimize', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 429 when optimization ran recently', async () => {
    ;(checkConcurrencyGuard as any).mockResolvedValue(true)
    const req = new NextRequest('http://localhost/api/google-ads/optimize', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('allows dry run even with recent optimization', async () => {
    ;(checkConcurrencyGuard as any).mockResolvedValue(true)
    const req = new NextRequest('http://localhost/api/google-ads/optimize?dryRun=true', {
      method: 'POST',
      headers: { authorization: 'Bearer test-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
