import { CircleHelp } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import Accordion from '../ui/Accordion';
import SectionHeading from '../ui/SectionHeading';
import styles from './FAQ.module.css';

export default function FAQ() {
  const { giveaway } = useGiveaway();
  if (!giveaway?.faq?.length) return null;

  const items = giveaway.faq.map((item, index) => ({ id: `faq-${index}`, title: item.q, content: item.a }));

  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-title">
      <SectionHeading id="faq-title" icon={CircleHelp} title="Frequently Asked Questions" />
      <Accordion items={items} />
    </section>
  );
}
