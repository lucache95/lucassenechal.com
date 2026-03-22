import { describe, it, expect } from 'vitest'
import { smsIntentSchema } from './intent-parser'

describe('smsIntentSchema', () => {
  it('validates a question intent with questionContext', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'question',
      questionContext: 'Tell me more about the AI tool mentioned in my briefing',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.intent).toBe('question')
      expect(result.data.questionContext).toBe('Tell me more about the AI tool mentioned in my briefing')
    }
  })

  it('validates a preference_update intent with preferenceAction (topics_add)', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'preference_update',
      preferenceAction: { field: 'topics_add', value: 'local events' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.intent).toBe('preference_update')
      expect(result.data.preferenceAction).toEqual({ field: 'topics_add', value: 'local events' })
    }
  })

  it('validates a preference_update intent with field delivery_time and value morning', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'preference_update',
      preferenceAction: { field: 'delivery_time', value: 'morning' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.preferenceAction!.field).toBe('delivery_time')
      expect(result.data.preferenceAction!.value).toBe('morning')
    }
  })

  it('validates an unknown intent (no preferenceAction or questionContext)', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'unknown',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.intent).toBe('unknown')
      expect(result.data.preferenceAction).toBeUndefined()
      expect(result.data.questionContext).toBeUndefined()
    }
  })

  it('rejects invalid intent value "invalid_intent"', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'invalid_intent',
    })
    expect(result.success).toBe(false)
  })

  it('validates topics_remove action', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'preference_update',
      preferenceAction: { field: 'topics_remove', value: 'crypto' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.preferenceAction!.field).toBe('topics_remove')
      expect(result.data.preferenceAction!.value).toBe('crypto')
    }
  })

  it('validates format change action', () => {
    const result = smsIntentSchema.safeParse({
      intent: 'preference_update',
      preferenceAction: { field: 'format', value: 'briefing' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.preferenceAction!.field).toBe('format')
      expect(result.data.preferenceAction!.value).toBe('briefing')
    }
  })
})
