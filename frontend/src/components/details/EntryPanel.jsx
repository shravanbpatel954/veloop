import { AlertCircle, CheckCircle2, Trophy, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkBalance, formatAmount, formatCompact, formatNumber, getCurrency } from '../../utils/currency';
import { getPrizeAction } from '../../utils/participation';
import { getPrizeType } from '../../utils/prizeTypes';
import { shortRemaining } from '../../utils/format';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import styles from './EntryPanel.module.css';

/**
 * The prize information card: what it costs, whether you can afford it, and
 * the one action that makes sense right now. The cost is always visible
 * before anyone reaches the final join button.
 */
export default function EntryPanel({ prize, giveaway, user, myStatus, statusLoading, joined, onJoin, onLogin, onEarn, onViewWinners }) {
  const currency = getCurrency(prize.entry.currency);
  const balance = checkBalance(myStatus?.balances, prize.entry);
  const action = getPrizeAction({ giveaway, user, joined, balance });
  const feeLabel = formatAmount(prize.entry.amount, prize.entry.currency);
  const remaining = shortRemaining(new Date(giveaway.endAt).getTime() - Date.now());
  const showBalance = giveaway.status === 'ACTIVE' && user && !joined;

  return (
    <section className={styles.card} aria-labelledby="entry-title">
      <div className={styles.top}>
        <div>
          <h2 id="entry-title" className={styles.name}>{prize.name}</h2>
          <p className={styles.desc}>{prize.description}</p>
        </div>
        <span className={styles.type}>{getPrizeType(prize).label}</span>
      </div>

      <ul className={styles.stats}>
        <li><Trophy size={15} aria-hidden="true" /> Winners <strong>{prize.winnerCount}</strong></li>
        <li><Users size={15} aria-hidden="true" /> Participants <strong>{formatCompact(prize.participants)}</strong></li>
        <li><Clock size={15} aria-hidden="true" /> {giveaway.status === 'UPCOMING' ? 'Not started' : 'Ends in'} <strong>{giveaway.status === 'ENDED' ? 'Ended' : giveaway.status === 'UPCOMING' ? '-' : remaining.replace(' left', '')}</strong></li>
      </ul>

      <div className={styles.fee}>
        <span>Entry Fee</span>
        <strong>{feeLabel}</strong>
        <small>Required balance: {feeLabel}</small>
      </div>

      {showBalance && (statusLoading ? <Skeleton height={86} radius={14} /> : (
        <div className={`${styles.balance} ${balance.hasEnough ? styles.ok : styles.low}`} role="status">
          <dl>
            <div><dt>Your Balance</dt><dd>{formatAmount(balance.balance, currency.code)}</dd></div>
            <div><dt>Entry Fee</dt><dd>{feeLabel}</dd></div>
          </dl>
          {balance.hasEnough ? (
            <p><CheckCircle2 size={16} aria-hidden="true" /> You have enough {currency.short}</p>
          ) : (
            <p><AlertCircle size={16} aria-hidden="true" /> Insufficient {currency.short}. You need {formatNumber(balance.shortfall)} more {currency.short} to participate.</p>
          )}
        </div>
      ))}

      {action.kind === 'joined' && (
        <div className={styles.joined} role="status">
          <CheckCircle2 size={22} aria-hidden="true" />
          <div><strong>You&apos;re Already Participating</strong><span>Your entry has already been recorded.</span></div>
        </div>
      )}

      <div className={styles.cta}>
        {action.kind === 'join' && <Button size="lg" block tone={prize.accent} onClick={onJoin}>Join Giveaway: {feeLabel}</Button>}
        {action.kind === 'login' && <Button size="lg" block onClick={onLogin}>{action.label}</Button>}
        {action.kind === 'earn' && <Button size="lg" block variant="secondary" onClick={onEarn}>Earn More {currency.short} →</Button>}
        {action.kind === 'joined' && <Button size="lg" block variant="secondary" as={Link} to="/giveaway">View Giveaway Status</Button>}
        {action.kind === 'winners' && <Button size="lg" block onClick={onViewWinners}>View Winners</Button>}
        {action.kind === 'notify' && <Button size="lg" block variant="secondary" disabled>Opens {new Date(giveaway.startAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Button>}
      </div>

      <p className={styles.note}>One participation per user for this draw. Review the terms below before joining.</p>
    </section>
  );
}
