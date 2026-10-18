import styles from './Field.module.css';

/** Labelled input with inline error + hint, wired up for screen readers. */
export default function Field({ label, id, error, hint, as: Control = 'input', ...props }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <Control
        id={id}
        name={id}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
      {error && <p className={styles.error} id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
