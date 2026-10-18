import { Link } from 'react-router-dom';
import { ArrowRight, Gift, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import { artwork } from '../../utils/prizeImages';
import Countdown from '../Countdown/Countdown';
import styles from './GiveawayBanner.module.css';

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Clear rules', text: 'Transparent terms' },
  { icon: Ticket, title: 'Upfront fees', text: 'See the cost first' },
  { icon: Gift, title: 'Premium prizes', text: 'Real rewards' },
];

/** Promotional card meant for the VELOOP home / rewards screens. */
export default function GiveawayBanner() {
  const { giveaway, serverOffsetMs, syncWithServer } = useGiveaway();
  const isActive = giveaway?.status === 'ACTIVE';

  return (
    <section className={styles.banner} aria-label="Exclusive giveaway">
      <span className={styles.glow} aria-hidden="true" />
      <span className={`${styles.particle} ${styles.p1}`} aria-hidden="true" />
      <span className={`${styles.particle} ${styles.p2}`} aria-hidden="true" />
      <span className={`${styles.particle} ${styles.p3}`} aria-hidden="true" />

      <img src={artwork.heroGift} alt="A wrapped gift box with a golden ribbon" className={styles.gift} loading="lazy" />

      <div className={styles.content}>
        <span className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" /> Exclusive giveaway</span>
        <h2 className={styles.title}>
          Giveaway <span className="gradient-text">Rewards</span>
        </h2>
        <p className={styles.text}>
          Pick a reward, review the entry fee and get a chance to win an iPhone, Apple Watch, AirPods or Amazon gift cards.
        </p>

        <ul className={styles.highlights}>
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={18} aria-hidden="true" />
              <span><strong>{title}</strong><small>{text}</small></span>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link to="/giveaway" className={styles.cta}>
            Enter Giveaway <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {isActive && (
            <span className={styles.timer}>
              Ends in <Countdown variant="inline" showSeconds={false} targetIso={giveaway.endAt} serverOffsetMs={serverOffsetMs} onComplete={syncWithServer} label="Time until the giveaway ends" />
            </span>
          )}
        </div>
      </div>

      <img src={artwork.heroTicket} alt="A golden giveaway ticket held in a hand" className={styles.ticket} loading="lazy" />
    </section>
  );
}
