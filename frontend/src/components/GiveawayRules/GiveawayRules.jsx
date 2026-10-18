import { ScrollText } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import Accordion from '../ui/Accordion';
import SectionHeading from '../ui/SectionHeading';
import styles from './GiveawayRules.module.css';

/** Rules come from the giveaway record, so they can change per event. */
export default function GiveawayRules() {
  const { giveaway } = useGiveaway();
  if (!giveaway?.rules?.length) return null;

  const items = giveaway.rules.map((rule) => ({ id: `rule-${rule.id}`, title: rule.title, content: rule.body }));

  return (
    <section className={styles.section} id="rules" aria-labelledby="rules-title">
      <SectionHeading id="rules-title" icon={ScrollText} title="Giveaway Rules & Guidelines" subtitle="Example rules for development. Final wording is confirmed by VELOOP before launch." />
      <Accordion items={items} defaultOpenId="rule-eligibility" />
    </section>
  );
}
