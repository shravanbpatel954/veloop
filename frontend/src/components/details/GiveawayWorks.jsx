import { BadgeCheck, ClipboardList, Hourglass, Medal, ShieldQuestion, Trophy, Wallet } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import styles from './GiveawayWorks.module.css';

const STEPS = [
  { icon: ClipboardList, title: 'Review the giveaway', text: 'Read the prize details and rules.' },
  { icon: ShieldQuestion, title: 'Check your eligibility', text: 'Make sure your account qualifies.' },
  { icon: Wallet, title: 'Pay the entry amount', text: 'The exact fee is shown before you confirm.' },
  { icon: BadgeCheck, title: 'Participation recorded', text: 'You get a confirmation straight away.' },
  { icon: Hourglass, title: 'Wait for the end', text: 'Entries close when the countdown finishes.' },
  { icon: Trophy, title: 'Winner is selected', text: 'A random draw runs on our servers.' },
  { icon: Medal, title: 'Winner claims the prize', text: 'Winners submit claim details on the Giveaway page.' },
];

export default function GiveawayWorks() {
  return (
    <section className={styles.section} aria-labelledby="works-title">
      <SectionHeading id="works-title" title="How This Giveaway Works" subtitle="From joining to claiming, in seven clear steps." />
      <ol className={styles.steps}>
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className={styles.step}>
            <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.icon}><Icon size={20} aria-hidden="true" /></span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
