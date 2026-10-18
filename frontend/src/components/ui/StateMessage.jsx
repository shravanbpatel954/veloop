import styles from './StateMessage.module.css';

/** Shared look for empty and error states. */
export default function StateMessage({ icon: Icon, title, message, action, compact = false }) {
  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`} role="status">
      {Icon && (
        <span className={styles.icon}>
          <Icon size={compact ? 22 : 28} aria-hidden="true" />
        </span>
      )}
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
