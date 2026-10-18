import { FileText, Gift, Target, Trophy, UserRound } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import { scrollToSection } from '../ActionButton/ActionButton';
import styles from './HowToParticipate.module.css';

const STEPS = [
  { icon: UserRound, tone: 'purple', title: 'Sign Up / Login', text: 'Create your VELOOP Rewards account or log in to get started.' },
  { icon: Target, tone: 'blue', title: 'Complete Activities', text: 'Finish eligible activities to earn VEs, SVEs and Tokens.' },
  { icon: Gift, tone: 'green', title: 'Join a Draw', text: 'Open a prize, review the entry fee and confirm your participation.' },
  { icon: Trophy, tone: 'orange', title: 'Win Rewards', text: 'Winners are drawn at random on our servers after the giveaway ends.' },
];

export default function HowToParticipate() {
  return (
    <section className={styles.panel} id="how-it-works" aria-labelledby="how-title">
      <SectionHeading id="how-title" title="How to Participate?" subtitle="Four simple steps from sign-up to prize." />

      <ol className={styles.timeline}>
        {STEPS.map(({ icon: Icon, tone, title, text }, index) => (
          <li className={styles.step} key={title}>
            <span className={styles.marker} data-tone={tone}><Icon size={20} aria-hidden="true" /></span>
            <div>
              <h3 className={styles.title}>{index + 1}. {title}</h3>
              <p className={styles.text}>{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <Button variant="secondary" block onClick={() => scrollToSection('rules')}>
        <FileText size={16} aria-hidden="true" /> View Rules &amp; Guidelines
      </Button>
    </section>
  );
}
