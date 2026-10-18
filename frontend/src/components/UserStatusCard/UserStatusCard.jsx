import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HeartHandshake, LogIn, Wallet } from 'lucide-react';
import { getCurrency, formatNumber } from '../../utils/currency';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import { scrollToSection } from '../ActionButton/ActionButton';
import styles from './UserStatusCard.module.css';

/**
 * Personalised card shown under the hero. Winners get their own, richer
 * card (<WinnerClaimCard />), so this component renders nothing for them.
 */
export default function UserStatusCard({ userState, user, myStatus, loading, giveaway, nextGiveaway }) {
  const location = useLocation();

  if (userState === 'winner' || !giveaway) return null;
  if (user && loading) return <div className={styles.card}><Skeleton height={58} radius={12} /></div>;

  if (userState === 'visitor') {
    return (
      <div className={styles.card}>
        <div className={styles.copy}>
          <strong>Join in seconds</strong>
          <span>Login or create an account to participate.</span>
        </div>
        <Button as={Link} to="/login" state={{ from: location.pathname }} variant="secondary">
          <LogIn size={16} aria-hidden="true" /> Login / Sign up
        </Button>
      </div>
    );
  }

  if (userState === 'non-winner') {
    return (
      <div className={styles.card}>
        <HeartHandshake className={styles.icon} size={26} aria-hidden="true" />
        <div className={styles.copy}>
          <strong>Thanks for participating!</strong>
          <span>Winners have been announced. Better luck next time{nextGiveaway ? ': the next giveaway is on its way.' : '.'}</span>
        </div>
        <Button variant="secondary" onClick={() => scrollToSection('winners')}>
          View Winners <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const balances = myStatus?.balances ?? {};
  const isParticipant = userState === 'participant';

  return (
    <div className={styles.card}>
      {isParticipant && <CheckCircle2 className={styles.ok} size={26} aria-hidden="true" />}
      <div className={styles.copy}>
        <strong>{isParticipant ? "You're Participating ✓" : 'Ready to join?'}</strong>
        <span>
          {isParticipant
            ? <>Your entries: <b>{formatNumber(myStatus?.entries ?? 0)}</b></>
            : 'Join a draw to start earning entries. No active participation yet.'}
        </span>
      </div>

      <ul className={styles.balances} aria-label="Your balances">
        {Object.entries(balances).map(([code, amount]) => (
          <li key={code}><Wallet size={13} aria-hidden="true" /> {formatNumber(amount)} {getCurrency(code).short}</li>
        ))}
      </ul>

      <Button variant={isParticipant ? 'secondary' : 'primary'} onClick={() => scrollToSection(isParticipant ? 'how-it-works' : 'prizes')}>
        {isParticipant ? 'Earn More Entries' : 'Choose a Reward'} <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
