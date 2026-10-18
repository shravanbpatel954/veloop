import { Eye, Headset, Lock, Scale } from 'lucide-react';
import styles from './TrustSection.module.css';

/**
 * Only claims we can stand behind. No "guaranteed" language, no user-count
 * boasts: these points describe how the giveaway is presented and handled.
 */
const POINTS = [
  { icon: Scale, tone: 'purple', title: 'Transparent rules', text: 'Eligibility, entry fees and winner selection are explained before you join.' },
  { icon: Lock, tone: 'blue', title: 'Handled responsibly', text: 'Claim details are only used to deliver your prize and are never shown publicly.' },
  { icon: Eye, tone: 'green', title: 'Clear reward details', text: 'Every prize page lists what you can win, how many winners there are and the cost.' },
  { icon: Headset, tone: 'orange', title: 'Support when needed', text: 'Questions about a giveaway? Contact VELOOP Rewards support.' },
];

export default function TrustSection() {
  return (
    <section className={styles.trust} aria-label="Why you can trust this giveaway">
      {POINTS.map(({ icon: Icon, tone, title, text }) => (
        <div className={styles.item} key={title}>
          <span className={styles.icon} data-tone={tone}><Icon size={22} aria-hidden="true" /></span>
          <div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
