import styles from './Button.module.css';

/**
 * Shared button. Pass `as={Link}` (or 'a') to render a link that looks like a button.
 * variant: primary | secondary | ghost     tone: purple | blue | green | orange
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  tone = 'purple',
  size = 'md',
  block = false,
  loading = false,
  className = '',
  children,
  ...props
}) {
  const classes = [styles.button, styles[variant], styles[size], block && styles.block, className]
    .filter(Boolean)
    .join(' ');

  const extra = Component === 'button' ? { type: props.type ?? 'button', disabled: props.disabled || loading } : {};

  return (
    <Component className={classes} data-tone={tone} aria-busy={loading || undefined} {...props} {...extra}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </Component>
  );
}
