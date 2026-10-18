import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

/** items: [{ id, title, content }]. One panel open at a time by default. */
export default function Accordion({ items, defaultOpenId = null, allowMultiple = false }) {
  const [openIds, setOpenIds] = useState(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id) =>
    setOpenIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return allowMultiple ? [...current, id] : [id];
    });

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                id={`trigger-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
              </button>
            </h3>
            <div id={`panel-${item.id}`} role="region" aria-labelledby={`trigger-${item.id}`} className={styles.panel}>
              <div className={styles.inner}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
