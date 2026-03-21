import { describe, it, expect } from 'vitest'
import { getCtaLevel } from '@/lib/email/cta-logic'

describe('getCtaLevel', () => {
  it('returns soft for 0 clicks', () => {
    expect(getCtaLevel({ clickCount: 0 })).toBe('soft')
  })

  it('returns soft for 2 clicks', () => {
    expect(getCtaLevel({ clickCount: 2 })).toBe('soft')
  })

  it('returns medium for 3 clicks', () => {
    expect(getCtaLevel({ clickCount: 3 })).toBe('medium')
  })

  it('returns medium for 5 clicks', () => {
    expect(getCtaLevel({ clickCount: 5 })).toBe('medium')
  })

  it('returns medium for 0 clicks with 2 feedback interactions', () => {
    expect(getCtaLevel({ clickCount: 0, feedbackCount: 2 })).toBe('medium')
  })

  it('returns soft for 1 click with 1 feedback interaction', () => {
    expect(getCtaLevel({ clickCount: 1, feedbackCount: 1 })).toBe('soft')
  })

  it('returns soft when feedbackCount is undefined', () => {
    expect(getCtaLevel({ clickCount: 1 })).toBe('soft')
  })
})
