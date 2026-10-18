import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Trophy, Users } from 'lucide-react';
import { formatAmount, formatCompact } from '../../utils/currency';
import { getPrizeImage } from '../../utils/prizeImages';
import Countdown from '../Countdown/Countdown';
import Button from '../ui/Button';
import styles from './PrizeCard.module.css';

/**
 * One reward in the featured grid. "Join Now" never joins directly:
 * it always opens the prize's own details page (/giveaway/:slug).
 */
export default function PrizeCard({ prize, giveaway, serverOffsetMs, joined = false, onViewWinners, onTimerComplete }) {
  const detailsPath = `/giveaway/${prize.slug}`;
  const { status } = giveaway;

  return (
    <article className={styles.card} data-accent={prize.accent}>
      <span className={styles.tag}>{prize.positionLabel}</span>

      <div className={styles.imageWrap}>
        <img src={getPrizeImage(prize.imageKey)} alt={prize.name} className={styles.image} loading="lazy" width="320" height="300" />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link to={detailsPath} className={styles.stretched}>{prize.name}</Link>
        </h3>
        <p className={styles.description}>{prize.description}</p>

        <p className={styles.fee}>
          Entry fee <strong>{formatAmount(prize.entry.amount, prize.entry.currency)}</strong>
        </p>

        <dl className={styles.meta}>
          <div>
            <dt><Users size={14} aria-hidden="true" /> Participants</dt>
            <dd>{formatCompact(prize.participants)}</dd>
          </div>
          <div>
            <dt><Trophy size={14} aria-hidden="true" /> Winners</dt>
            <dd>{prize.winnerCount}</dd>
          </div>
          <div className={styles.timeRow}>
            <dt><Clock size={14} aria-hidden="true" /> {status === 'UPCOMING' ? 'Starts in' : 'Remaining'}</dt>
            <dd>
              {status === 'ENDED' ? 'Ended' : (
                <Countdown variant="inline" showSeconds={false} targetIso={status === 'UPCOMING' ? giveaway.startAt : giveaway.endAt} serverOffsetMs={serverOffsetMs} onComplete={onTimerComplete} label={`Time remaining for ${prize.name}`} />
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className={styles.cta}>
        {status === 'ENDED' ? (
          <Button tone={prize.accent} block variant="secondary" onClick={onViewWinners} className={styles.ctaButton}>
            View Winners <ArrowRight size={16} aria-hidden="true" />
          </Button>
        ) : (
          <Button as={Link} to={detailsPath} tone={prize.accent} block className={styles.ctaButton}>
            {joined ? <><Check size={16} aria-hidden="true" /> You&apos;re In</> : status === 'UPCOMING' ? 'View Details' : 'Join Now'}
            {!joined && <ArrowRight size={16} aria-hidden="true" />}
          </Button>
        )}
      </div>
    </article>
  );
}
