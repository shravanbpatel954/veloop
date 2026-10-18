import styles from './Badge.module.css';

/** tone: purple | gold | green | blue | orange | neutral | danger */
export default function Badge({ tone = 'purple', icon: Icon, pulse = false, children }) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {pulse && <span className={styles.dot} aria-hidden="true" />}
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  );
}
