import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Check } from 'lucide-react';
import Button from '../ui/Button';

export const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Renders the primary action returned by getGiveawayAction() (see utils/participation.js).
 * Keeps all "what does this button do" wiring out of the section components.
 */
export default function ActionButton({ action, size = 'lg', block = false }) {
  const [notified, setNotified] = useState(false);
  const variant = action.variant ?? 'primary';

  if (action.kind === 'notify') {
    // Frontend-only for now: a real reminder would POST to the backend.
    return (
      <Button size={size} block={block} variant={notified ? 'secondary' : variant} onClick={() => setNotified((v) => !v)} aria-pressed={notified}>
        {notified ? <><Check size={18} /> We&apos;ll remind you</> : <><Bell size={18} /> {action.label}</>}
      </Button>
    );
  }

  if (action.kind === 'link') {
    return (
      <Button as={Link} to={action.to} size={size} block={block} variant={variant}>
        {action.label} <ArrowRight size={18} />
      </Button>
    );
  }

  return (
    <Button size={size} block={block} variant={variant} onClick={() => scrollToSection(action.target)}>
      {action.label} <ArrowRight size={18} />
    </Button>
  );
}
