import { useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Sparkles, Trophy } from 'lucide-react';
import { artwork } from '../../utils/prizeImages';
import { formatDateTime } from '../../utils/format';
import { getGiveawayAction } from '../../utils/participation';
import ActionButton from '../ActionButton/ActionButton';
import Countdown from '../Countdown/Countdown';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import styles from './GiveawayHero.module.css';

/**
 * Page hero + the status panel. The panel's content switches on the status the
 * backend reports (ACTIVE / ENDED / UPCOMING); the countdown only asks the
 * server to re-check when it reaches zero.
 */
export default function GiveawayHero({ giveaway, nextGiveaway, userState, serverOffsetMs, onTimerComplete, loading }) {
  const heroRef = useRef(null);

  // Restrained parallax: the artwork shifts a few pixels with the pointer.
  const handlePointerMove = (event) => {
    const el = heroRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((event.clientX - left) / width - 0.5).toFixed(3));
    el.style.setProperty('--my', ((event.clientY - top) / height - 0.5).toFixed(3));
  };

  const action = getGiveawayAction({ giveaway, userState });

  return (
    <section className={styles.hero} ref={heroRef} onPointerMove={handlePointerMove}>
      <img src={artwork.heroGift} alt="" aria-hidden="true" className={`${styles.art} ${styles.artLeft}`} />
      <img src={artwork.heroTicket} alt="" aria-hidden="true" className={`${styles.art} ${styles.artRight}`} />

      <motion.div className={styles.content} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <Badge tone="purple" icon={Sparkles}>Exclusive giveaways</Badge>
        <h1 className={styles.title}>Giveaway <span className="gradient-text">Rewards</span></h1>
        <p className={styles.subtitle}>
          Complete tasks. Earn entries.<br />Join a draw for a chance to win premium rewards.
        </p>

        {loading ? <StatusSkeleton /> : (
          <StatusPanel giveaway={giveaway} nextGiveaway={nextGiveaway} action={action} serverOffsetMs={serverOffsetMs} onTimerComplete={onTimerComplete} />
        )}
      </motion.div>
    </section>
  );
}

function StatusPanel({ giveaway, nextGiveaway, action, serverOffsetMs, onTimerComplete }) {
  if (!giveaway) {
    return (
      <div className={styles.panel}>
        <Badge tone="neutral">No current giveaway</Badge>
        <p className={styles.panelText}>The next giveaway is being prepared.</p>
      </div>
    );
  }

  if (giveaway.status === 'ACTIVE') {
    return (
      <div className={styles.panel}>
        <Badge tone="green" pulse>Giveaway live</Badge>
        <p className={styles.panelLabel}>{giveaway.title} ends in</p>
        <Countdown targetIso={giveaway.endAt} serverOffsetMs={serverOffsetMs} onComplete={onTimerComplete} label="Time until the giveaway ends" />
        <ActionButton action={action} />
      </div>
    );
  }

  if (giveaway.status === 'UPCOMING') {
    return (
      <div className={styles.panel}>
        <Badge tone="gold" icon={CalendarClock}>Upcoming</Badge>
        <p className={styles.panelLabel}>Next giveaway starts in</p>
        <Countdown targetIso={giveaway.startAt} serverOffsetMs={serverOffsetMs} onComplete={onTimerComplete} label="Time until the giveaway starts" />
        <p className={styles.panelText}>Get ready for the next reward.</p>
        <ActionButton action={action} />
      </div>
    );
  }

  const selecting = giveaway.winnersStatus === 'SELECTING';
  return (
    <div className={styles.panel}>
      <Badge tone="neutral" icon={Trophy}>Giveaway ended</Badge>
      <p className={styles.panelText}>
        {selecting ? 'Selecting winners. This only takes a moment.' : 'Winner announcement is now available.'}
      </p>
      {!selecting && <ActionButton action={action} />}
      {nextGiveaway && (
        <div className={styles.next}>
          <span>Next giveaway starts in</span>
          <strong><Countdown variant="inline" showSeconds={false} targetIso={nextGiveaway.startAt} serverOffsetMs={serverOffsetMs} label="Time until the next giveaway" /></strong>
          <small>{formatDateTime(nextGiveaway.startAt)}</small>
        </div>
      )}
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className={styles.panel} aria-busy="true">
      <Skeleton width={110} height={26} radius={999} />
      <Skeleton width={260} height={64} radius={14} />
      <Skeleton width={190} height={48} radius={14} />
    </div>
  );
}
