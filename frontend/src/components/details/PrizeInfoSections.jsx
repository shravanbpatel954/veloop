import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { buildImportantInfo, buildTerms } from '../../utils/terms';
import { getPrizeImage } from '../../utils/prizeImages';
import { getPrizeType } from '../../utils/prizeTypes';
import Accordion from '../ui/Accordion';
import SectionHeading from '../ui/SectionHeading';
import styles from './PrizeInfoSections.module.css';

/** "About the Prize": same structure for every prize type. */
export function AboutPrize({ prize }) {
  const type = getPrizeType(prize);
  return (
    <section className={styles.card} aria-labelledby="about-title">
      <SectionHeading id="about-title" title="About the Prize" />
      <div className={styles.about}>
        <img src={getPrizeImage(prize.imageKey)} alt={prize.name} loading="lazy" />
        <div>
          <h3>{prize.name}</h3>
          <p>{prize.longDescription}</p>
          <dl>
            <div><dt>Number of winners</dt><dd>{prize.winnerCount}</dd></div>
            <div><dt>Prize type</dt><dd>{type.label}</dd></div>
            {prize.valueLabel && <div><dt>Prize value</dt><dd>{prize.valueLabel}</dd></div>}
            <div className={styles.wide}><dt>Delivery / claim</dt><dd>{type.deliveryInfo}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/** What the participation rules allow, read from the giveaway's settings. */
export function ParticipationRules({ giveaway }) {
  const { maxEntriesPerUser, additionalEntriesViaTasks } = giveaway.participationSettings;
  const rules = [
    maxEntriesPerUser === 1 ? 'One participation per user for this draw' : `Up to ${maxEntriesPerUser} participations per user`,
    'No re-entry after you have joined',
    additionalEntriesViaTasks ? 'Extra entries can be earned through tasks' : 'No additional entries through tasks (demo wording, rules not final)',
    'You can join again when a new giveaway event begins',
  ];

  return (
    <section className={styles.card} aria-labelledby="rules-title-d">
      <SectionHeading id="rules-title-d" title="Participation Rules" />
      <ul className={styles.checks}>
        {rules.map((rule) => <li key={rule}><CheckCircle2 size={17} aria-hidden="true" /> {rule}</li>)}
      </ul>
    </section>
  );
}

export function TermsSection({ giveaway, prize }) {
  const terms = buildTerms(giveaway, prize).map((term) => ({
    id: `term-${term.id}`,
    title: term.title,
    content: term.placeholder ? <span className={styles.placeholder}><ShieldAlert size={15} aria-hidden="true" /> {term.body}</span> : term.body,
  }));

  return (
    <section className={styles.card} id="terms" aria-labelledby="terms-title">
      <SectionHeading id="terms-title" title="Terms & Conditions" subtitle="Please read these before joining." />
      <Accordion items={terms} defaultOpenId="term-entry" />
    </section>
  );
}

export function ImportantInfo({ giveaway, prize }) {
  const rows = buildImportantInfo(giveaway, prize);
  const items = [{
    id: 'important',
    title: 'Important Information',
    content: (
      <>
        <p className={styles.lead}>Please review the giveaway rules and participation requirements carefully before joining.</p>
        <dl className={styles.facts}>
          {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </>
    ),
  }];

  return <section className={styles.plain} aria-label="Important information"><Accordion items={items} /></section>;
}
