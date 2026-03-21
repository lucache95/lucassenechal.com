import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import { POST } from '../resend/route'
import { NextRequest } from 'next/server'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

// We'll need to re-configure the mock chain for each test since
// the webhook handler uses multiple chained calls
function makeMockSupabase(options: {
  subscriberId?: string
  recentStatuses?: string[]
} = {}) {
  const { subscriberId = 'sub-123', recentStatuses = [] } = options

  const mockSubscriberUpdate = vi.fn()
  const mockSubscriberEq = vi.fn().mockResolvedValue({ error: null })
  mockSubscriberUpdate.mockReturnValue({ eq: mockSubscriberEq })

  const mockSendLogUpdate = vi.fn()
  const mockSendLogEq = vi.fn().mockResolvedValue({ error: null })
  mockSendLogUpdate.mockReturnValue({ eq: mockSendLogEq })

  const mockLimit = vi.fn().mockResolvedValue({
    data: recentStatuses.map(status => ({ status }))
  })
  const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
  const mockSelectEq = vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { subscriber_id: subscriberId } }),
    order: mockOrder,
  })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'subscribers') {
      return { update: mockSubscriberUpdate }
    }
    if (table === 'send_log') {
      return {
        update: mockSendLogUpdate,
        select: mockSelect,
      }
    }
    return {}
  })

  return {
    from: mockFrom,
    mockSendLogUpdate,
    mockSendLogEq,
    mockSubscriberUpdate,
    mockSubscriberEq,
    mockSelect,
    mockSelectEq,
    mockLimit,
  }
}

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/webhooks/resend', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/webhooks/resend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  it('returns 200 with { received: true } for email.delivered event', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.delivered',
      data: { email_id: 'resend-email-123' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ received: true })
  })

  it('email.delivered: updates send_log with status=delivered and delivered_at', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.delivered',
      data: { email_id: 'resend-email-123' },
    })
    await POST(request)

    expect(mock.from).toHaveBeenCalledWith('send_log')
    expect(mock.mockSendLogUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'delivered',
        delivered_at: expect.any(String),
      })
    )
    expect(mock.mockSendLogEq).toHaveBeenCalledWith('resend_id', 'resend-email-123')
  })

  it('email.bounced: updates send_log with status=bounced and error message', async () => {
    const mock = makeMockSupabase({ recentStatuses: ['bounced'] })
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.bounced',
      data: { email_id: 'resend-email-123', bounce: { message: 'Mailbox full' } },
    })
    await POST(request)

    expect(mock.mockSendLogUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'bounced',
        error: 'Mailbox full',
      })
    )
  })

  it('email.bounced: returns 200 with { received: true }', async () => {
    const mock = makeMockSupabase({ recentStatuses: ['bounced'] })
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.bounced',
      data: { email_id: 'resend-email-123' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ received: true })
  })

  it('email.bounced with 3 consecutive bounces: sets subscriber status to paused', async () => {
    const mock = makeMockSupabase({
      subscriberId: 'sub-123',
      recentStatuses: ['bounced', 'bounced', 'bounced'],
    })
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.bounced',
      data: { email_id: 'resend-email-123' },
    })
    await POST(request)

    expect(mock.mockSubscriberUpdate).toHaveBeenCalledWith({ status: 'paused' })
    expect(mock.mockSubscriberEq).toHaveBeenCalledWith('id', 'sub-123')
  })

  it('email.bounced with fewer than 3 bounces: does NOT update subscriber status', async () => {
    const mock = makeMockSupabase({
      subscriberId: 'sub-123',
      recentStatuses: ['bounced', 'delivered'],
    })
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.bounced',
      data: { email_id: 'resend-email-123' },
    })
    await POST(request)

    expect(mock.mockSubscriberUpdate).not.toHaveBeenCalled()
  })

  it('email.complained: updates send_log with status=complained', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.complained',
      data: { email_id: 'resend-email-123' },
    })
    await POST(request)

    expect(mock.mockSendLogUpdate).toHaveBeenCalledWith({ status: 'complained' })
  })

  it('email.complained: auto-unsubscribes the subscriber', async () => {
    const mock = makeMockSupabase({ subscriberId: 'sub-123' })
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.complained',
      data: { email_id: 'resend-email-123' },
    })
    await POST(request)

    expect(mock.mockSubscriberUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unsubscribed',
        unsubscribed_at: expect.any(String),
      })
    )
    expect(mock.mockSubscriberEq).toHaveBeenCalledWith('id', 'sub-123')
  })

  it('email.complained: returns 200 with { received: true }', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.complained',
      data: { email_id: 'resend-email-123' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ received: true })
  })

  it('email.opened: sets opened_at on send_log', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.opened',
      data: { email_id: 'resend-email-123' },
    })
    await POST(request)

    expect(mock.mockSendLogUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        opened_at: expect.any(String),
      })
    )
    expect(mock.mockSendLogEq).toHaveBeenCalledWith('resend_id', 'resend-email-123')
  })

  it('email.opened: returns 200 with { received: true }', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.opened',
      data: { email_id: 'resend-email-123' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ received: true })
  })

  it('unknown event type: returns 200 with { received: true }', async () => {
    const mock = makeMockSupabase()
    mockCreateClient.mockReturnValue(mock)

    const request = makeRequest({
      type: 'email.some_unknown_event',
      data: { email_id: 'resend-email-123' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ received: true })
  })
})
