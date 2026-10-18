import { useRef, useState } from 'react';
import { AlertTriangle, CalendarClock, History, Radio, Trophy } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import WinnerCard from '../WinnerCard/WinnerCard';
import PreviousWinnerCard from '../PreviousWinnerCard/PreviousWinnerCard';
import WinnerReveal from '../WinnerReveal/WinnerReveal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SectionHeading from '../ui/SectionHeading';
import Skeleton from '../ui/Skeleton';
import StateMessage from '../ui/StateMessage';
import { formatDate } from '../../utils/format';
import styles from './WinnersTabs.module.css';

const TABS = [
  { id: 'winners', label: 'Winners', icon: Trophy },
  { id: 'previous', label: 'Previous Winners', icon: History },
];

/**
 * "Winners" shows the current giveaway only once the backend has announced it.
 * "Previous Winners" lists completed giveaways. Winners are never shown for a
 * live giveaway.
 */
export default function WinnersTabs() {
  const { giveaway, winners, previous } = useGiveaway();
  const [active, setActive] = useState('winners');
  const tabRefs = useRef([]);

  // Arrow keys move between tabs, as the ARIA tabs pattern expects.
  const handleKeyDown = (event, index) => {
    const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = (index + offset + TABS.length) % TABS.length;
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className={styles.section} id="winners" aria-labelledby="winners-title">
      <SectionHeading id="winners-title" icon={Trophy} title="Winners" subtitle="Winners are drawn by our servers after each giveaway ends. User IDs are masked for privacy." />

      <div className={styles.tabs} role="tablist" aria-label="Winner lists">
        {TABS.map(({ id, label, icon: Icon }, index) => (
          <button
            key={id}
            ref={(el) => { tabRefs.current[index] = el; }}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            tabIndex={active === id ? 0 : -1}
            className={`${styles.tab} ${active === id ? styles.activeTab : ''}`}
            onClick={() => setActive(id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <Icon size={16} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-winners" aria-labelledby="tab-winners" hidden={active !== 'winners'} className={styles.panel}>
        <CurrentWinners giveaway={giveaway} winners={winners} />
      </div>
      <div role="tabpanel" id="panel-previous" aria-labelledby="tab-previous" hidden={active !== 'previous'} className={styles.panel}>
        <PreviousWinners previous={previous} />
      </div>
    </section>
  );
}

function CurrentWinners({ giveaway, winners }) {
  if (!giveaway) {
    return <StateMessage icon={CalendarClock} title="No current giveaway" message="The next giveaway is being prepared." compact />;
  }

  if (giveaway.status === 'ACTIVE' || giveaway.status === 'UPCOMING') {
    const live = giveaway.status === 'ACTIVE';
    return (
      <div className={styles.pending}>
        <Badge tone={live ? 'green' : 'gold'} pulse={live}>{live ? 'Live' : 'Upcoming'}</Badge>
        <h3>{live ? 'Giveaway is still live' : 'This giveaway has not started yet'}</h3>
        <p>
          <strong>{giveaway.title}</strong><br />
          {live ? 'Winners will be announced after the giveaway ends.' : `It opens on ${formatDate(giveaway.startAt)}. Winners will be announced after it ends.`}
        </p>
        <p className={styles.pendingNote}><Radio size={14} aria-hidden="true" /> Winner announcement: coming after the giveaway ends.</p>
      </div>
    );
  }

  if (winners.status === 'error') {
    return <StateMessage icon={AlertTriangle} title="Couldn't load winners" message="We couldn't load the winner list. Please try again." action={<Button variant="secondary" onClick={() => winners.reload()}>Try Again</Button>} compact />;
  }

  const selecting = giveaway.winnersStatus === 'SELECTING';
  const list = winners.data?.winners ?? [];
  const loading = winners.status === 'loading' && !selecting;
  const headline = list.find((winner) => winner.positionLabel === '1st Prize');

  return (
    <>
      <WinnerReveal selecting={selecting} winner={headline} />
      {loading ? <WinnersSkeleton /> : !selecting && <WinnerGroups giveaway={giveaway} winners={list} />}
    </>
  );
}

function WinnerGroups({ giveaway, winners }) {
  return (
    <div className={styles.groups}>
      {giveaway.prizes.map((prize) => {
        const items = winners.filter((winner) => winner.prizeId === prize.id);
        if (items.length === 0) return null;
        return (
          <div key={prize.id} className={styles.group}>
            <h3 className={styles.groupTitle}>{prize.name} <span>{items.length} {items.length === 1 ? 'winner' : 'winners'}</span></h3>
            <ul className={styles.list}>
              {items.map((winner) => <WinnerCard key={winner.id} winner={winner} accent={prize.accent} />)}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function PreviousWinners({ previous }) {
  if (previous.status === 'loading') return <WinnersSkeleton />;
  if (previous.status === 'error') {
    return <StateMessage icon={AlertTriangle} title="Couldn't load previous winners" message="Please try again in a moment." action={<Button variant="secondary" onClick={() => previous.reload()}>Try Again</Button>} compact />;
  }

  const giveaways = previous.data?.giveaways ?? [];
  if (giveaways.length === 0) {
    return <StateMessage icon={History} title="No previous winners yet" message="Previous winners will appear here after a giveaway is completed." compact />;
  }

  return (
    <div className={styles.groups}>
      {giveaways.map((item) => (
        <div key={item.id} className={styles.group}>
          <h3 className={styles.groupTitle}>{item.title} <span>Ended {formatDate(item.endedAt)}</span></h3>
          <ul className={styles.grid}>
            {item.winners.map((winner) => <PreviousWinnerCard key={`${item.id}-${winner.displayId}-${winner.prizeName}`} winner={winner} giveawayTitle={item.title} />)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function WinnersSkeleton() {
  return (
    <div className={styles.list} aria-busy="true" aria-label="Loading winners">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={64} radius={14} />)}
    </div>
  );
}
