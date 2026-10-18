import styles from './SectionHeading.module.css';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', icon: Icon, id }) {
  return (
    <header className={`${styles.heading} ${align === 'center' ? styles.center : ''}`}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h2 className={styles.title} id={id}>
        {Icon && <Icon size={22} className={styles.icon} aria-hidden="true" />}
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
