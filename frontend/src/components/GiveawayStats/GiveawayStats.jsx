import { Clock, Gift, Trophy, Users } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import { formatCompact, formatNumber } from '../../utils/currency';
import Countdown from '../Countdown/Countdown';
import Skeleton from '../ui/Skeleton';
import styles from './GiveawayStats.module.css';

export default function GiveawayStats() {
  const { current, giveaway, stats, serverOffsetMs, syncWithServer } = useGiveaway();

  if (current.status === 'loading' || !stats) return <StatsSkeleton />;

  const isUpcoming = giveaway?.status === 'UPCOMING';
  const isActive = giveaway?.status === 'ACTIVE';

  const items = [
    { key: 'active', icon: Gift, tone: 'purple', label: 'Total Giveaways', value: formatNumber(stats.activeGiveaways), suffix: isActive ? 'Active' : 'Prizes' },
    { key: 'users', icon: Users, tone: 'blue', label: 'Total Participants', value: formatCompact(stats.totalParticipants), suffix: 'Users' },
    { key: 'won', icon: Trophy, tone: 'green', label: 'Prizes Won', value: formatCompact(stats.prizesWon), suffix: 'Rewards' },
    {
      key: 'time',
      icon: Clock,
      tone: 'orange',
      label: isUpcoming ? 'Starts In' : 'Ends In',
      value: giveaway && giveaway.status !== 'ENDED' ? (
        <Countdown variant="inline" showSeconds={false} targetIso={isUpcoming ? giveaway.startAt : giveaway.endAt} serverOffsetMs={serverOffsetMs} onComplete={syncWithServer} label="Time remaining" />
      ) : 'Ended',
      suffix: giveaway && giveaway.status !== 'ENDED' ? (isUpcoming ? 'To start' : 'Remaining') : 'Winners out',
    },
  ];

  return (
    <section className={styles.stats} aria-label="Giveaway statistics">
      {items.map(({ key, icon: Icon, tone, label, value, suffix }) => (
        <div className={styles.item} key={key}>
          <span className={styles.icon} data-tone={tone}><Icon size={22} aria-hidden="true" /></span>
          <div>
            <p className={styles.label}>{label}</p>
            <p className={styles.value}>{value} <small data-tone={tone}>{suffix}</small></p>
          </div>
        </div>
      ))}
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className={styles.stats} aria-busy="true" aria-label="Loading statistics">
      {[0, 1, 2, 3].map((i) => (
        <div className={styles.item} key={i}>
          <Skeleton width={48} height={48} radius={14} />
          <div className={styles.skeletonText}><Skeleton width={90} height={12} /><Skeleton width={70} height={22} /></div>
        </div>
      ))}
    </section>
  );
}
