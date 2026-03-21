import { describe, it, expect, beforeEach, vi } from 'vitest'
import crypto from 'crypto'

describe('email token module', () => {
  beforeEach(() => {
    process.env.EMAIL_LINK_SECRET = 'test-secret-key-for-testing'
  })

  describe('generateToken', () => {
    it('returns a hex string', async () => {
      const { generateToken } = await import('@/lib/email/token')
      const token = generateToken('sub-123', 'unsubscribe')
      expect(token).toMatch(/^[0-9a-f]+$/)
    })

    it('returns consistent tokens for same input', async () => {
      const { generateToken } = await import('@/lib/email/token')
      const token1 = generateToken('sub-123', 'unsubscribe')
      const token2 = generateToken('sub-123', 'unsubscribe')
      expect(token1).toBe(token2)
    })

    it('returns different tokens for different subscribers', async () => {
      const { generateToken } = await import('@/lib/email/token')
      const token1 = generateToken('sub-123', 'unsubscribe')
      const token2 = generateToken('sub-456', 'unsubscribe')
      expect(token1).not.toBe(token2)
    })

    it('returns different tokens for different actions', async () => {
      const { generateToken } = await import('@/lib/email/token')
      const token1 = generateToken('sub-123', 'unsubscribe')
      const token2 = generateToken('sub-123', 'feedback')
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('returns true for a valid token', async () => {
      const { generateToken, verifyToken } = await import('@/lib/email/token')
      const token = generateToken('sub-123', 'unsubscribe')
      expect(verifyToken('sub-123', 'unsubscribe', token)).toBe(true)
    })

    it('returns false for an invalid token', async () => {
      const { verifyToken } = await import('@/lib/email/token')
      expect(verifyToken('sub-123', 'unsubscribe', 'badtoken')).toBe(false)
    })

    it('returns false for a wrong subscriber', async () => {
      const { generateToken, verifyToken } = await import('@/lib/email/token')
      const token = generateToken('sub-123', 'unsubscribe')
      expect(verifyToken('sub-456', 'unsubscribe', token)).toBe(false)
    })

    it('returns false for malformed hex', async () => {
      const { verifyToken } = await import('@/lib/email/token')
      expect(verifyToken('sub-123', 'unsubscribe', 'not-hex-at-all!')).toBe(false)
    })

    it('uses crypto.timingSafeEqual for comparison', async () => {
      const spy = vi.spyOn(crypto, 'timingSafeEqual')
      const { generateToken, verifyToken } = await import('@/lib/email/token')
      const token = generateToken('sub-123', 'unsubscribe')
      verifyToken('sub-123', 'unsubscribe', token)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })
})
