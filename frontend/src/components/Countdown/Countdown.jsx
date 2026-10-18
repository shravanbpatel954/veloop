import { useCountdown } from '../../hooks/useCountdown';
import { twoDigits } from '../../utils/format';
import styles from './Countdown.module.css';

/**
 * Live countdown to `targetIso`.
 * variant="blocks"  -> big boxed digits (hero)
 * variant="inline"  -> "12d : 08h : 45m" text (stat cards, prize cards)
 * The countdown is visual only; `onComplete` lets the page re-check the real status.
 */
export default function Countdown({ targetIso, serverOffsetMs, onComplete, variant = 'blocks', showSeconds = true, label }) {
  const { days, hours, minutes, seconds, isComplete } = useCountdown(targetIso, { serverOffsetMs, onComplete });

  const parts = [
    { key: 'd', value: days, unit: 'Days' },
    { key: 'h', value: hours, unit: 'Hours' },
    { key: 'm', value: minutes, unit: 'Mins' },
    ...(showSeconds ? [{ key: 's', value: seconds, unit: 'Secs' }] : []),
  ];

  if (variant === 'inline') {
    return (
      <span className={styles.inline} role="timer" aria-label={label}>
        {parts.map((part, index) => (
          <span key={part.key}>
            {twoDigits(part.value)}
            {part.key}
            {index < parts.length - 1 && <span className={styles.sep}> : </span>}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={`${styles.blocks} ${isComplete ? styles.done : ''}`} role="timer" aria-label={label} aria-live="off">
      {parts.map((part, index) => (
        <div className={styles.group} key={part.key}>
          <div className={styles.cell}>
            <span className={styles.value}>{twoDigits(part.value)}</span>
            <span className={styles.unit}>{part.unit}</span>
          </div>
          {index < parts.length - 1 && <span className={styles.colon} aria-hidden="true">:</span>}
        </div>
      ))}
    </div>
  );
}
