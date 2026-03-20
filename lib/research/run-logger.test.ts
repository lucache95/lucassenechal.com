import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mocks before vi.mock hoisting
const {
  mockSingle,
  mockSelect,
  mockInsert,
  mockEq,
  mockUpdate,
  mockFrom,
  mockCreateClient,
} = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockEq = vi.fn()
  const mockUpdate = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
  }))
  const mockCreateClient = vi.fn(() => ({ from: mockFrom }))
  return { mockSingle, mockSelect, mockInsert, mockEq, mockUpdate, mockFrom, mockCreateClient }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

// Set env vars for test
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')

import { createRunLog, completeRunLog, failRunLog } from './run-logger'

describe('run-logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
  })

  it('createRunLog inserts a running status record and returns id', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'run-123' },
      error: null,
    })

    const id = await createRunLog('sub-456')

    expect(id).toBe('run-123')
    expect(mockFrom).toHaveBeenCalledWith('research_runs')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriber_id: 'sub-456',
        status: 'running',
      })
    )
  })

  it('completeRunLog updates status to completed with metrics', async () => {
    await completeRunLog('run-123', {
      queriesRun: 3,
      sourcesQueried: ['brave', 'gdelt'],
      resultsFound: 15,
      resultsStored: 10,
      costEstimateUsd: 0.017,
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        queries_run: 3,
        sources_queried: ['brave', 'gdelt'],
        results_found: 15,
        results_stored: 10,
        cost_estimate_usd: 0.017,
      })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'run-123')
  })

  it('failRunLog updates status to failed with error details', async () => {
    const errors = [{
      source: 'brave' as const,
      message: 'Rate limited',
      timestamp: new Date('2026-03-19T06:00:00Z'),
    }]

    await failRunLog('run-123', errors)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errors: [expect.objectContaining({
          source: 'brave',
          message: 'Rate limited',
        })],
      })
    )
  })

  it('createRunLog throws on Supabase error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Connection failed' },
    })

    await expect(createRunLog('sub-456')).rejects.toThrow('Failed to create run log')
  })
})
