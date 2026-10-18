import { Crown, User } from 'lucide-react';
import { formatDate } from '../../utils/format';
import styles from './WinnerCard.module.css';

/** A single winner. `isCurrentUser` comes from the backend, never from the client. */
export default function WinnerCard({ winner, accent = 'purple' }) {
  return (
    <li className={`${styles.card} ${winner.isCurrentUser ? styles.mine : ''}`} data-accent={accent}>
      <span className={styles.avatar}>{winner.positionLabel === '1st Prize' ? <Crown size={18} aria-hidden="true" /> : <User size={18} aria-hidden="true" />}</span>
      <div className={styles.info}>
        <p className={styles.id}>
          {winner.displayId}
          {winner.isCurrentUser && <span className={styles.you}>You</span>}
        </p>
        <p className={styles.prize}>{winner.prizeName}</p>
      </div>
      <time className={styles.date} dateTime={winner.announcedAt}>{formatDate(winner.announcedAt, { day: 'numeric', month: 'short', year: 'numeric' })}</time>
    </li>
  );
}
