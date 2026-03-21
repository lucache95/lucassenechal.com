'use client'

import { useState } from 'react'

interface ErrorTracePanelProps {
  error: string | null
}

export function ErrorTracePanel({ error }: ErrorTracePanelProps) {
  const [open, setOpen] = useState(false)

  if (!error) return null

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#dc2626',
          fontSize: '12px',
          fontWeight: 400,
          padding: '2px 0',
        }}
      >
        {open ? 'Hide error' : 'Show error'}
      </button>
      {open && (
        <pre
          style={{
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            marginTop: '4px',
          }}
        >
          {error}
        </pre>
      )}
    </div>
  )
}
