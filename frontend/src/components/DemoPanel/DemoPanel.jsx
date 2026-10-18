import { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGiveaway } from '../../context/GiveawayContext';
import { demoControls } from '../../api/mock/mockServer';
import { isMockMode } from '../../api/giveawayApi';
import { PERSONAS } from '../../data/giveawayData';
import { CLAIM_STATUS } from '../../utils/prizeTypes';
import styles from './DemoPanel.module.css';

const PHASES = [
  { id: 'active', label: 'Active' },
  { id: 'ending-soon', label: 'Ends in 12s' },
  { id: 'ended', label: 'Ended' },
  { id: 'upcoming', label: 'Upcoming' },
];

/**
 * Developer-only switcher for the mock backend: pick a giveaway phase, a
 * logged-in persona or a claim status to exercise every UI state.
 * It renders nothing when the app talks to the real API.
 */
export default function DemoPanel() {
  const [open, setOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const { refreshAll, reloadMyStatus } = useGiveaway();
  const [, force] = useState(0);

  if (!isMockMode) return null;
  const state = demoControls.getState();

  const apply = (fn, { refetch = true } = {}) => {
    fn();
    force((n) => n + 1);
    if (refetch) refreshAll();
    else reloadMyStatus();
  };

  const selectPersona = async (id) => {
    if (id === 'visitor') logout();
    else await login({ userId: id });
  };

  return (
    <aside className={styles.wrap} aria-label="Demo controls">
      {open ? (
        <div className={styles.panel}>
          <div className={styles.head}>
            <strong><FlaskConical size={15} aria-hidden="true" /> Demo controls</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close demo controls"><X size={16} /></button>
          </div>

          <p className={styles.label}>Giveaway phase</p>
          <div className={styles.chips}>
            {PHASES.map((phase) => (
              <button key={phase.id} type="button" className={state.phase === phase.id ? styles.on : ''} onClick={() => apply(() => demoControls.setPhase(phase.id))}>{phase.label}</button>
            ))}
          </div>

          <label className={styles.label} htmlFor="demo-user">Logged-in user</label>
          <select id="demo-user" value={user?.id ?? 'visitor'} onChange={(event) => selectPersona(event.target.value)}>
            <option value="visitor">Visitor (logged out)</option>
            {Object.values(PERSONAS).map((persona) => (
              <option key={persona.id} value={persona.id}>{persona.id}: {persona.label}</option>
            ))}
          </select>

          <label className={styles.label} htmlFor="demo-claim">Winner claim status</label>
          <select id="demo-claim" value={state.claimStatus} onChange={(event) => apply(() => demoControls.setClaimStatus(event.target.value), { refetch: false })}>
            {Object.values(CLAIM_STATUS).map((status) => <option key={status} value={status}>{status.replace('_', ' ').toLowerCase()}</option>)}
          </select>

          <div className={styles.toggles}>
            <label><input type="checkbox" checked={state.failNextLoads} onChange={(event) => apply(() => demoControls.setFailNextLoads(event.target.checked))} /> Simulate API error</label>
            <label><input type="checkbox" checked={state.noGiveaway} onChange={(event) => apply(() => demoControls.setNoGiveaway(event.target.checked))} /> No current giveaway</label>
          </div>

          <button type="button" className={styles.reset} onClick={() => apply(() => demoControls.reset())}>Reset demo data</button>
        </div>
      ) : (
        <button type="button" className={styles.fab} onClick={() => setOpen(true)}>
          <FlaskConical size={16} aria-hidden="true" /> Demo
        </button>
      )}
    </aside>
  );
}
