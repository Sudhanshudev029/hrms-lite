const variantStyles = {
  present: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
  },
  absent: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  info: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
  },
  warning: {
    backgroundColor: '#fffbeb',
    color: '#d97706',
    border: '1px solid #fde68a',
  },
  neutral: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
}

export default function Badge({ children, variant = 'neutral' }) {
  const style = variantStyles[variant] || variantStyles.neutral
  return (
    <span
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 9px',
        borderRadius: '20px',
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
