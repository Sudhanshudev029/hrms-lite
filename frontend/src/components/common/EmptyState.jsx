import styles from './EmptyState.module.css'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className={styles.container}>
      {Icon && (
        <div className={styles.icon}>
          <Icon size={26} />
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
