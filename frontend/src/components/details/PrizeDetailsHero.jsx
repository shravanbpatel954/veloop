import { Sparkles } from 'lucide-react';
import { getPrizeImage } from '../../utils/prizeImages';
import Countdown from '../Countdown/Countdown';
import Badge from '../ui/Badge';
import styles from './PrizeDetailsHero.module.css';

const STATUS_BADGE = {
  ACTIVE: { tone: 'green', label: 'Giveaway live', pulse: true },
  UPCOMING: { tone: 'gold', label: 'Upcoming giveaway', pulse: false },
  ENDED: { tone: 'neutral', label: 'Giveaway ended', pulse: false },
};

const withArticle = (name) => (/^[aeiou]/i.test(name) ? `an ${name}` : `a ${name}`);

/** Visual column: prize artwork with a soft spotlight and a few slow particles. */
export function PrizeVisual({ prize }) {
  return (
    <div className={styles.visual} data-accent={prize.accent}>
      <span className={styles.spotlight} aria-hidden="true" />
      <span className={`${styles.coin} ${styles.c1}`} aria-hidden="true" />
      <span className={`${styles.coin} ${styles.c2}`} aria-hidden="true" />
      <span className={`${styles.coin} ${styles.c3}`} aria-hidden="true" />
      <img src={getPrizeImage(prize.imageKey)} alt={prize.name} className={styles.image} width="520" height="480" />
    </div>
  );
}

/** Heading column: badge, title, short description, status and countdown. */
export function PrizeHeader({ prize, giveaway, serverOffsetMs, onTimerComplete }) {
  const status = STATUS_BADGE[giveaway.status] ?? STATUS_BADGE.ENDED;
  const target = giveaway.status === 'UPCOMING' ? giveaway.startAt : giveaway.endAt;

  return (
    <header className={styles.header}>
      <Badge tone="purple" icon={Sparkles}>Exclusive giveaway</Badge>
      <h1 className={styles.title}>Win {withArticle(prize.name)}</h1>
      <p className={styles.description}>Join this exclusive giveaway for a chance to win {withArticle(prize.name)}.</p>

      <div className={styles.status}>
        <Badge tone={status.tone} pulse={status.pulse}>{status.label}</Badge>
        {giveaway.status !== 'ENDED' && (
          <div className={styles.timer}>
            <span>{giveaway.status === 'UPCOMING' ? 'Starts in' : 'Ends in'}</span>
            <Countdown variant="inline" targetIso={target} serverOffsetMs={serverOffsetMs} onComplete={onTimerComplete} showSeconds={false} label="Time remaining" />
          </div>
        )}
      </div>
    </header>
  );
}
