// Server Component — no interactivity needed

interface SendStatusBadgeProps {
  status: string
}

type BadgeStyle = {
  background: string
  color: string
  label: string
}

function getBadgeStyle(status: string): BadgeStyle {
  switch (status) {
    case 'delivered':
      return { background: '#dcfce7', color: '#16a34a', label: 'Delivered' }
    case 'bounced':
      return { background: '#fef3c7', color: '#d97706', label: 'Bounced' }
    case 'failed':
      return { background: '#fecaca', color: '#dc2626', label: 'Failed' }
    case 'pending':
      return { background: '#f1f5f9', color: '#64748b', label: 'Pending' }
    case 'skipped':
      return { background: '#f1f5f9', color: '#94a3b8', label: 'Skipped' }
    case 'sent':
      return { background: '#dcfce7', color: '#16a34a', label: 'Sent' }
    case 'complained':
      return { background: '#fecaca', color: '#dc2626', label: 'Complained' }
    default:
      return { background: '#f1f5f9', color: '#94a3b8', label: status }
  }
}

export function SendStatusBadge({ status }: SendStatusBadgeProps) {
  const { background, color, label } = getBadgeStyle(status)

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: background,
        color,
      }}
    >
      {label}
    </span>
  )
}
