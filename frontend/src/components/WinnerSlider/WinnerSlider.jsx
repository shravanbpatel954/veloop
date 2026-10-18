import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import styles from './WinnerSlider.module.css';

const ROTATE_MS = 4500;

/**
 * Rotating social-proof ticker. It receives plain messages, built from real
 * winner records (current + previous giveaways), never invented on the client.
 * Pauses on hover/focus and respects reduced-motion preferences.
 */
export default function WinnerSlider({ messages, isDemoData = false }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || messages.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, messages.length]);

  if (messages.length === 0) return null;
  const current = messages[index % messages.length];

  return (
    <section
      className={styles.slider}
      aria-label="Recent winners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={styles.icon}><PartyPopper size={18} aria-hidden="true" /></span>

      <div className={styles.viewport} aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.id}
            className={styles.message}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <b>{current.displayId}</b> won {current.prizeLabel}
            {current.context && <span className={styles.context}> · {current.context}</span>}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className={styles.dots} role="tablist" aria-label="Choose message">
        {messages.slice(0, 8).map((message, i) => (
          <button
            key={message.id}
            type="button"
            role="tab"
            aria-selected={i === index % messages.length}
            aria-label={`Show winner message ${i + 1}`}
            className={`${styles.dot} ${i === index % messages.length ? styles.activeDot : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {isDemoData && <span className={styles.demo}>Sample data</span>}
    </section>
  );
}
