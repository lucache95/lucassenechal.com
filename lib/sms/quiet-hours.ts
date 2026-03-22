/**
 * Timezone-aware quiet hours check for TCPA compliance.
 * Quiet hours: before 8am or at/after 9pm (21:00) in the subscriber's local time.
 * Fail open on invalid timezone (return false = allow sending).
 */
export function isWithinQuietHours(timezone: string): boolean {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    })
    const localHour = parseInt(formatter.format(now), 10)
    // Quiet hours: before 8am or at/after 9pm (21:00)
    return localHour < 8 || localHour >= 21
  } catch {
    // Invalid timezone -- fail open (allow sending)
    return false
  }
}
