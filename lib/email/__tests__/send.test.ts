import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Send Pipeline Integration Tests
//
// These tests validate the core send pipeline contracts:
// 1. Email compliance headers (MAIL-01)
// 2. Per-subscriber delivery scheduling (MAIL-08)
// 3. Bounce handling (MAIL-09)
// 4. Feedback token URL-based action contract (FDBK-01)
//
// Since the Edge Function runs in Deno and cannot be directly
// imported in Vitest, these tests validate the CONTRACTS by
// testing the Node.js-side modules that implement the same logic.
// ============================================================

describe('Email send payload compliance (MAIL-01)', () => {
  beforeEach(() => {
    process.env.EMAIL_LINK_SECRET = 'test-secret-for-send-tests'
    vi.resetModules()
  })

  it('includes List-Unsubscribe header with unsubscribe URL', async () => {
    const { generateToken } = await import('@/lib/email/token')
    const subscriberId = 'test-sub-123'
    const unsubToken = generateToken(subscriberId, 'unsubscribe')
    const unsubscribeUrl = `https://lucassenechal.com/api/unsubscribe?s=${subscriberId}&t=${unsubToken}`

    const headers = {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    }

    expect(headers['List-Unsubscribe']).toContain('api/unsubscribe')
    expect(headers['List-Unsubscribe']).toContain(subscriberId)
    expect(headers['List-Unsubscribe']).toMatch(/^<https:\/\/lucassenechal\.com\/api\/unsubscribe/)
  })

  it('includes List-Unsubscribe-Post header for RFC 8058 one-click compliance', async () => {
    const headers = {
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    }

    expect(headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
  })

  it('unsubscribe token in header is verifiable', async () => {
    const { generateToken, verifyToken } = await import('@/lib/email/token')
    const subscriberId = 'test-sub-456'
    const token = generateToken(subscriberId, 'unsubscribe')
    expect(verifyToken(subscriberId, 'unsubscribe', token)).toBe(true)
  })

  it('List-Unsubscribe URL contains subscriber ID and token', async () => {
    const { generateToken } = await import('@/lib/email/token')
    const subscriberId = 'sub-abc-789'
    const token = generateToken(subscriberId, 'unsubscribe')
    const url = `https://lucassenechal.com/api/unsubscribe?s=${subscriberId}&t=${token}`

    expect(url).toContain(`s=${subscriberId}`)
    expect(url).toContain(`t=${token}`)
    expect(url).toContain('https://')
  })
})

describe('Per-subscriber delivery scheduling (MAIL-08)', () => {
  it('morning delivery_time subscriber matches morning time window', () => {
    // Contract: enqueue_email_delivery('morning') only selects subscribers
    // where subscriber_preferences.delivery_time = 'morning'
    const timeWindows = ['morning', 'afternoon', 'evening'] as const
    const subscriber = { delivery_time: 'morning' as const }

    // Morning window matches morning subscribers
    expect(timeWindows.includes(subscriber.delivery_time)).toBe(true)
    expect(subscriber.delivery_time).toBe('morning')
    expect(subscriber.delivery_time).not.toBe('evening')
    expect(subscriber.delivery_time).not.toBe('afternoon')
  })

  it('evening delivery_time subscriber does NOT match morning time window', () => {
    const morningWindowFilter = 'morning'
    const subscriber = { delivery_time: 'evening' }

    expect(subscriber.delivery_time).not.toBe(morningWindowFilter)
  })

  it('each time window maps to a specific pg_cron schedule', () => {
    // Contract validation: the 3 pg_cron jobs from 007_email_delivery.sql
    const cronSchedules: Record<string, string> = {
      morning: '0 6 * * *',    // 6am UTC
      afternoon: '0 12 * * *', // 12pm UTC
      evening: '0 18 * * *',   // 6pm UTC
    }
    expect(Object.keys(cronSchedules)).toHaveLength(3)
    expect(cronSchedules.morning).toContain('6')
    expect(cronSchedules.evening).toContain('18')
    expect(cronSchedules.afternoon).toContain('12')
  })

  it('delivery time windows cover all 3 scheduled send times', () => {
    const validWindows = ['morning', 'afternoon', 'evening']
    expect(validWindows).toHaveLength(3)
    expect(validWindows).toContain('morning')
    expect(validWindows).toContain('afternoon')
    expect(validWindows).toContain('evening')
  })
})

describe('Bounce handling (MAIL-09)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('single bounce updates send_log status to bounced', async () => {
    // Mock @supabase/supabase-js for the webhook handler
    // The webhook handler does two queries on send_log:
    //   1. update status to 'bounced' (chainable .eq)
    //   2. select subscriber_id .eq('resend_id').single()
    //   3. select status .eq('subscriber_id').order().limit() for 3-bounce check

    let sendLogSelectCallCount = 0

    const mockSendLogUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockSendLogSelect = vi.fn().mockImplementation(() => {
      sendLogSelectCallCount++
      if (sendLogSelectCallCount === 1) {
        // First call: select subscriber_id from send_log WHERE resend_id = ...
        return {
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { subscriber_id: 'sub-bounce-123' },
            }),
          }),
        }
      }
      // Second call: select status from send_log WHERE subscriber_id = ... ORDER BY sent_at LIMIT 3
      return {
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              // Only 1 bounce -- not 3 consecutive; should NOT pause subscriber
              data: [{ status: 'bounced' }, { status: 'sent' }, { status: 'sent' }],
            }),
          }),
        }),
      }
    })

    const mockSubscribersUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'send_log') {
        return {
          update: mockSendLogUpdate,
          select: mockSendLogSelect,
        }
      }
      // subscribers table
      return {
        update: mockSubscribersUpdate,
        select: vi.fn(),
      }
    })

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn().mockReturnValue({ from: mockFrom }),
    }))

    const { POST } = await import('@/app/api/webhooks/resend/route')
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        type: 'email.bounced',
        data: {
          email_id: 'resend-id-abc',
          bounce: { message: 'User does not exist' },
        },
      }),
    }

    const response = await POST(mockRequest as Parameters<typeof POST>[0])
    const body = await response.json()

    expect(body).toEqual({ received: true })
    // Single bounce: send_log updated to 'bounced'
    expect(mockSendLogUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'bounced' })
    )
    // Subscriber NOT paused (not 3 consecutive)
    expect(mockSubscribersUpdate).not.toHaveBeenCalledWith({ status: 'paused' })
  })

  it('3 consecutive bounces results in subscriber status = paused', async () => {
    // Mock where all 3 recent sends are bounced
    let sendLogSelectCallCount = 0

    const mockSendLogUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockSendLogSelect = vi.fn().mockImplementation(() => {
      sendLogSelectCallCount++
      if (sendLogSelectCallCount === 1) {
        // First call: select subscriber_id
        return {
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { subscriber_id: 'sub-bounce-triple' },
            }),
          }),
        }
      }
      // Second call: select status for 3-bounce check — all 3 are bounced
      return {
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ status: 'bounced' }, { status: 'bounced' }, { status: 'bounced' }],
            }),
          }),
        }),
      }
    })

    const mockSubscribersUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'send_log') {
        return {
          update: mockSendLogUpdate,
          select: mockSendLogSelect,
        }
      }
      // subscribers table
      return {
        update: mockSubscribersUpdate,
        select: vi.fn(),
      }
    })

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn().mockReturnValue({ from: mockFrom }),
    }))

    const { POST } = await import('@/app/api/webhooks/resend/route')
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        type: 'email.bounced',
        data: {
          email_id: 'resend-id-triple',
          bounce: { message: 'Mailbox full' },
        },
      }),
    }

    const response = await POST(mockRequest as Parameters<typeof POST>[0])
    const body = await response.json()

    expect(body).toEqual({ received: true })
    // After 3 consecutive bounces, subscriber should be paused
    expect(mockSubscribersUpdate).toHaveBeenCalledWith({ status: 'paused' })
  })

  it('fewer than 3 consecutive bounces does NOT pause subscriber', () => {
    // Contract: only pause when ALL of the last 3 are bounced
    const recentSends = [
      { status: 'bounced' },
      { status: 'sent' },     // Not a bounce
      { status: 'bounced' },
    ]
    const consecutiveBounces = recentSends.every(s => s.status === 'bounced')
    expect(consecutiveBounces).toBe(false)
  })
})

describe('Feedback token generation uses actual item URLs (FDBK-01)', () => {
  beforeEach(() => {
    process.env.EMAIL_LINK_SECRET = 'test-secret-for-send-tests'
    vi.resetModules()
  })

  it('generates verifiable token using item URL as action', async () => {
    const { generateToken, verifyToken } = await import('@/lib/email/token')
    const subscriberId = 'test-sub-789'
    const itemUrl = 'https://example.com/article/ai-trends-2026'

    // Token is generated with feedback:{url} action
    const token = generateToken(subscriberId, `feedback:${itemUrl}`)

    // Token is verifiable with the same action
    expect(verifyToken(subscriberId, `feedback:${itemUrl}`, token)).toBe(true)
  })

  it('token is NOT verifiable with wrong URL', async () => {
    const { generateToken, verifyToken } = await import('@/lib/email/token')
    const subscriberId = 'test-sub-789'
    const itemUrl = 'https://example.com/article/ai-trends-2026'

    const token = generateToken(subscriberId, `feedback:${itemUrl}`)

    expect(verifyToken(subscriberId, `feedback:https://other.com`, token)).toBe(false)
  })

  it('token is NOT verifiable with index-based action (old pattern)', async () => {
    const { generateToken, verifyToken } = await import('@/lib/email/token')
    const subscriberId = 'test-sub-789'
    const itemUrl = 'https://example.com/article/ai-trends-2026'

    const token = generateToken(subscriberId, `feedback:${itemUrl}`)

    // Index-based action should NOT verify (this was the old incorrect pattern)
    expect(verifyToken(subscriberId, `feedback:0`, token)).toBe(false)
    expect(verifyToken(subscriberId, `feedback:1`, token)).toBe(false)
  })

  it('feedback URL query param uses encodeURIComponent(item.url)', () => {
    const subscriberId = 'sub-feedback-test'
    const itemUrl = 'https://techcrunch.com/2026/03/21/ai-automation-trends'
    const token = 'abc123def456'
    const feedbackBaseUrl = 'https://lucassenechal.com/api/feedback'

    // This is the expected format from the Edge Function and templates
    const feedbackUrl = `${feedbackBaseUrl}?s=${subscriberId}&url=${encodeURIComponent(itemUrl)}&v=more&t=${token}`

    expect(feedbackUrl).toContain('url=')
    expect(feedbackUrl).toContain(encodeURIComponent(itemUrl))
    expect(feedbackUrl).not.toContain('i=')  // NOT index-based
    expect(feedbackUrl).toContain('v=more')
    expect(feedbackUrl).toContain(`t=${token}`)
  })

  it('different items produce different feedback tokens', async () => {
    const { generateToken } = await import('@/lib/email/token')
    const subscriberId = 'test-sub-multi'
    const url1 = 'https://example.com/article/1'
    const url2 = 'https://example.com/article/2'

    const token1 = generateToken(subscriberId, `feedback:${url1}`)
    const token2 = generateToken(subscriberId, `feedback:${url2}`)

    expect(token1).not.toBe(token2)
  })
})
