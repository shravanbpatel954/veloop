import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, PackageCheck, PartyPopper, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import { CLAIM_STATUS, getPrizeType } from '../../utils/prizeTypes';
import { getPrizeImage } from '../../utils/prizeImages';
import PrizeClaimModal from '../PrizeClaimModal/PrizeClaimModal';
import Button from '../ui/Button';
import styles from './WinnerClaimCard.module.css';

/** What the winner sees for each claim status. Add a status here, not in JSX. */
const CLAIM_VIEW = {
  [CLAIM_STATUS.SUBMITTED]: { icon: CheckCircle2, tone: 'good', title: 'Claim Submitted ✓', text: 'Our team will process your prize.' },
  [CLAIM_STATUS.PROCESSING]: { icon: Clock3, tone: 'info', title: 'Prize Verification In Progress', text: 'We are verifying your details. No action needed from you.' },
  [CLAIM_STATUS.COMPLETED]: { icon: PackageCheck, tone: 'good', title: 'Prize Delivered ✓', text: 'Your prize has been delivered. Enjoy!' },
  [CLAIM_STATUS.EXPIRED]: { icon: ShieldAlert, tone: 'bad', title: 'Claim Window Expired', text: 'The claim period for this prize has ended.' },
};

function daysLeft(deadline) {
  return Math.max(Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000), 0);
}

/**
 * Personalised winner section: congratulations, a short verification
 * summary and the claim action. Only rendered for users the backend
 * lists as winners, so non-winners can never reach the claim form.
 */
export default function WinnerClaimCard({ winning, prize, giveaway, onClaimed }) {
  const [modalOpen, setModalOpen] = useState(false);
  const type = getPrizeType(prize);
  const { status, deadline } = winning.claim;
  const view = CLAIM_VIEW[status];
  const remaining = daysLeft(deadline);

  return (
    <motion.section
      className={styles.card}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby={`win-${prize.id}`}
    >
      <img src={getPrizeImage(prize.imageKey)} alt={prize.name} className={styles.image} />

      <div className={styles.main}>
        <span className={styles.kicker}><PartyPopper size={16} aria-hidden="true" /> Congratulations!</span>
        <h2 className={styles.title} id={`win-${prize.id}`}>You won {prize.name}!</h2>

        <dl className={styles.details}>
          <div><dt>Prize</dt><dd>{prize.name}</dd></div>
          <div><dt>Giveaway</dt><dd>{giveaway.title}</dd></div>
          <div><dt>Status</dt><dd className={styles.verified}><ShieldCheck size={14} aria-hidden="true" /> Winner ✓</dd></div>
          <div>
            <dt>{status === CLAIM_STATUS.EXPIRED ? 'Claim deadline' : 'Claim within'}</dt>
            <dd>{status === CLAIM_STATUS.NOT_SUBMITTED ? `${remaining} day${remaining === 1 ? '' : 's'}` : formatDateTime(deadline)}</dd>
          </div>
          <div className={styles.wide}><dt>Required information</dt><dd>{type.requiredInfo.join(', ')}</dd></div>
        </dl>
      </div>

      <div className={styles.action}>
        {view ? (
          <div className={styles.status} data-tone={view.tone}>
            <view.icon size={22} aria-hidden="true" />
            <div><strong>{view.title}</strong><span>{view.text}</span></div>
          </div>
        ) : (
          <Button size="lg" onClick={() => setModalOpen(true)}>Claim Your Prize</Button>
        )}
      </div>

      <PrizeClaimModal open={modalOpen} onClose={() => setModalOpen(false)} prize={prize} giveaway={giveaway} onSubmitted={onClaimed} />
    </motion.section>
  );
}
