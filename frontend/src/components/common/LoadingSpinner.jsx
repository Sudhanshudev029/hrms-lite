import styles from './LoadingSpinner.module.css'

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <span className={styles.text}>{text}</span>
    </div>
  )
}

export function InlineSpinner() {
  return <span className={styles.inline} />
}
