import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Loader2 } from 'lucide-react';
import styles from './WinnerReveal.module.css';

/**
 * Controlled reveal for the 1st-prize winner:
 *   Selecting winners... -> Winner revealed
 * `selecting` mirrors the backend (winnersStatus === 'SELECTING'); the reveal
 * plays whenever it flips to false while this component is mounted.
 */
export default function WinnerReveal({ selecting, winner }) {
  const [showWinner, setShowWinner] = useState(!selecting);

  useEffect(() => {
    if (selecting) {
      setShowWinner(false);
      return undefined;
    }
    // A short pause so the change reads as a deliberate "reveal".
    const timer = setTimeout(() => setShowWinner(true), 900);
    return () => clearTimeout(timer);
  }, [selecting]);

  return (
    <div className={styles.reveal} aria-live="polite">
      <AnimatePresence mode="wait">
        {!showWinner || !winner ? (
          <motion.div key="selecting" className={styles.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 size={22} className={styles.spin} aria-hidden="true" />
            <div>
              <p className={styles.label}>Selecting winners...</p>
              <p className={styles.hint}>The draw is run securely on our servers.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="winner" className={styles.row} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
            <span className={styles.crown}><Crown size={22} aria-hidden="true" /></span>
            <div>
              <p className={styles.label}>{winner.prizeName} winner</p>
              <p className={styles.winner}>{winner.displayId}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
