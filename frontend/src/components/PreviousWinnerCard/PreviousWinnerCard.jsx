import { CalendarDays, Gift, Package } from 'lucide-react';
import { formatDate } from '../../utils/format';
import Badge from '../ui/Badge';
import styles from './PreviousWinnerCard.module.css';

const STATUS = {
  DELIVERED: { label: 'Prize delivered', tone: 'green' },
  PROCESSING: { label: 'Processing', tone: 'gold' },
  CLAIMED: { label: 'Claimed', tone: 'blue' },
};

/** One winner from an earlier giveaway. Only masked IDs are ever shown. */
export default function PreviousWinnerCard({ winner, giveawayTitle }) {
  const status = STATUS[winner.status] ?? { label: 'Winner', tone: 'neutral' };

  return (
    <li className={styles.card}>
      <div className={styles.top}>
        <p className={styles.id}>{winner.displayId}</p>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <p className={styles.won}><span>Won</span>{winner.prizeName}</p>
      <ul className={styles.meta}>
        <li><Gift size={14} aria-hidden="true" /> {giveawayTitle}</li>
        <li><Package size={14} aria-hidden="true" /> {winner.category}</li>
        <li><CalendarDays size={14} aria-hidden="true" /> {formatDate(winner.date)}</li>
      </ul>
    </li>
  );
}
