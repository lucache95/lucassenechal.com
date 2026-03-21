'use client'

import { useState } from 'react'
import { SendStatusBadge } from './send-status-badge'
import { ErrorTracePanel } from './error-trace-panel'

export interface SubscriberRow {
  id: string
  email: string
  status: string
  created_at: string
  format: string | null
  delivery_time: string | null
  last_send_status: string | null
  last_send_at: string | null
  last_error: string | null
  error_count: number
}

interface SubscriberTableProps {
  subscribers: SubscriberRow[]
}

function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(date).toLocaleDateString()
}

export function SubscriberTable({ subscribers }: SubscriberTableProps) {
  const [search, setSearch] = useState('')

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        placeholder="Filter by email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '320px',
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '16px',
          outline: 'none',
        }}
      />

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Email', 'Status', 'Format', 'Delivery Time', 'Last Send', 'Last Status', 'Errors'].map(col => (
                <th
                  key={col}
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#64748b',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '8px 12px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}
                >
                  {search ? `No subscribers matching "${search}"` : 'No subscribers yet'}
                </td>
              </tr>
            )}
            {filtered.map(subscriber => (
              <>
                <tr key={subscriber.id}>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                    {subscriber.email}
                  </td>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <SendStatusBadge status={subscriber.status} />
                  </td>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                    {subscriber.format || '—'}
                  </td>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                    {subscriber.delivery_time || '—'}
                  </td>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                    {subscriber.last_send_at ? formatRelativeTime(subscriber.last_send_at) : '—'}
                  </td>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    {subscriber.last_send_status ? (
                      <SendStatusBadge status={subscriber.last_send_status} />
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '15px', fontWeight: 400, padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    {subscriber.error_count > 0 ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        {subscriber.error_count}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>0</span>
                    )}
                  </td>
                </tr>
                {subscriber.last_error && (
                  <tr key={`${subscriber.id}-error`}>
                    <td
                      colSpan={7}
                      style={{
                        padding: '4px 12px 8px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <ErrorTracePanel error={subscriber.last_error} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
