import { describe, it, expect, vi, afterEach } from 'vitest'
import { isWithinQuietHours } from './quiet-hours'

describe('isWithinQuietHours', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for hour 7 (before 8am) in America/New_York', () => {
    // Set UTC to 12:00 noon -> New York (EST UTC-5) = 7:00am -> quiet hours
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    expect(isWithinQuietHours('America/New_York')).toBe(true)
  })

  it('returns true for hour 21 (9pm) in America/Los_Angeles', () => {
    // Set UTC to 05:00 next day -> LA (PST UTC-8) = 21:00 (9pm) -> quiet hours
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-16T05:00:00Z'))
    expect(isWithinQuietHours('America/Los_Angeles')).toBe(true)
  })

  it('returns false for hour 12 (noon) in UTC', () => {
    // Set UTC to 12:00 noon -> UTC = 12:00 -> NOT quiet hours
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    expect(isWithinQuietHours('UTC')).toBe(false)
  })

  it('returns false for hour 8 (8am exactly) in America/Chicago', () => {
    // Set UTC to 14:00 -> Chicago (CST UTC-6) = 8:00am -> NOT quiet hours (8am is allowed)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T14:00:00Z'))
    expect(isWithinQuietHours('America/Chicago')).toBe(false)
  })

  it('returns false for hour 20 (8pm) in Europe/London', () => {
    // Set UTC to 20:00 -> London (GMT UTC+0) = 20:00 (8pm) -> NOT quiet hours
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T20:00:00Z'))
    expect(isWithinQuietHours('Europe/London')).toBe(false)
  })

  it('handles invalid timezone gracefully (returns false / does not throw)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T03:00:00Z'))
    // Invalid timezone should fail open (return false, allow sending)
    expect(isWithinQuietHours('Invalid/Timezone_XYZ')).toBe(false)
  })
})
