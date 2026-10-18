import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to /path#section once the page content exists (links like /giveaway#rules). */
export function useScrollToHash(ready) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!ready || !hash) return;
    const id = hash.slice(1);
    // wait a frame so freshly rendered sections are in the DOM
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [ready, hash]);
}
