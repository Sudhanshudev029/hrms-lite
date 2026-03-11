import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import styles from './Toast.module.css'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

function Toast({ toast, onRemove }) {
  const Icon = icons[toast.type] || Info
  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <span className={styles.iconWrap}>
        <Icon size={16} />
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.closeBtn} onClick={() => onRemove(toast.id)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
