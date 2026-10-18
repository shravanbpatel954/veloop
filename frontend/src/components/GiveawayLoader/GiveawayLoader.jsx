import { useEffect, useState } from 'react';
import { artwork } from '../../utils/prizeImages';
import styles from './GiveawayLoader.module.css';

const MESSAGES = [
  "Preparing today's rewards...",
  'Checking active giveaways...',
  'Loading available prizes...',
  'Bringing your rewards closer...',
];

/**
 * VELOOP-themed full-page loader (used instead of a generic spinner).
 * Messages rotate slowly so they stay readable.
 */
export default function GiveawayLoader({ fullPage = true }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${styles.loader} ${fullPage ? styles.full : ''}`} role="status" aria-live="polite">
      <div className={styles.stage}>
        <span className={styles.ring} aria-hidden="true" />
        <span className={`${styles.ring} ${styles.ringOuter}`} aria-hidden="true" />
        <img src={artwork.giftDark} alt="" className={styles.gift} />
        <span className={`${styles.spark} ${styles.s1}`} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.s2}`} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.s3}`} aria-hidden="true" />
      </div>
      <p className={styles.message} key={index}>{MESSAGES[index]}</p>
      <div className={styles.dots} aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <span className="sr-only">Loading giveaway</span>
    </div>
  );
}
