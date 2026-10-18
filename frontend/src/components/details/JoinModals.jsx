import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, LogIn, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkBalance, formatAmount } from '../../utils/currency';
import { getPrizeImage } from '../../utils/prizeImages';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import styles from './JoinModals.module.css';

/** Shown when a visitor tries to join. Both buttons lead to the login page. */
export function LoginRequiredModal({ open, onClose }) {
  const location = useLocation();
  const from = location.pathname;

  return (
    <Modal open={open} onClose={onClose} title="Login Required" labelledBy="login-required-title">
      <div className={styles.center}>
        <span className={styles.icon}><LogIn size={26} aria-hidden="true" /></span>
        <p className={styles.text}>Please login to your VELOOP Rewards account before participating in this giveaway.</p>
        <div className={styles.actions}>
          <Button as={Link} to="/login" state={{ from }} size="lg" block>Login</Button>
          <Button as={Link} to="/signup" state={{ from }} size="lg" block variant="secondary">Create Account</Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Confirm -> Joining... -> You're In!  (or a clear error).
 * `join` state comes from useJoinGiveaway(); this component only renders it.
 */
export function ConfirmJoinModal({ open, onClose, prize, balances, join, onViewGiveaway }) {
  const { phase, error, result } = join;
  const check = checkBalance(balances, prize.entry);
  const fee = formatAmount(prize.entry.amount, prize.entry.currency);
  const joining = phase === 'joining';

  if (phase === 'success') {
    return (
      <Modal open={open} onClose={onClose} title="You're In!" labelledBy="join-success-title">
        <div className={styles.center}>
          <motion.span className={styles.success} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
            <CheckCircle2 size={44} aria-hidden="true" />
          </motion.span>
          <p className={styles.text}>Your participation for the <strong>{prize.name}</strong> giveaway has been successfully recorded.</p>
          <dl className={styles.summary}>
            <div><dt>Entry Fee</dt><dd>{formatAmount(result?.entryFee?.amount ?? prize.entry.amount, result?.entryFee?.currency ?? prize.entry.currency)}</dd></div>
          </dl>
          <p className={styles.luck}>Good luck!</p>
          <Button size="lg" block onClick={onViewGiveaway}>View Giveaway</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} dismissible={!joining} title="Confirm Participation" labelledBy="join-confirm-title">
      <div className={styles.confirm}>
        <div className={styles.prize}>
          <img src={getPrizeImage(prize.imageKey)} alt="" />
          <strong>{prize.name}</strong>
        </div>

        <dl className={styles.rows}>
          <div><dt>Entry Fee</dt><dd>{fee}</dd></div>
          <div><dt>Your Balance</dt><dd>{formatAmount(check.balance, prize.entry.currency)}</dd></div>
          <div className={styles.total}><dt>Balance After Joining</dt><dd>{formatAmount(Math.max(check.balanceAfter, 0), prize.entry.currency)}</dd></div>
        </dl>

        <p className={styles.legal}>By continuing, you confirm that you have reviewed the giveaway rules and terms.</p>

        {phase === 'error' && error && (
          <p className={styles.error} role="alert"><TriangleAlert size={16} aria-hidden="true" /> <span><strong>{error.title}.</strong> {error.message}</span></p>
        )}

        <div className={styles.buttons}>
          <Button variant="secondary" size="lg" onClick={onClose} disabled={joining}>Cancel</Button>
          <Button size="lg" onClick={join.join} loading={joining}>{joining ? 'Joining Giveaway...' : 'Confirm & Join'}</Button>
        </div>
      </div>
    </Modal>
  );
}
