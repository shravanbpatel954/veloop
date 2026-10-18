import { useEffect, useRef, useState } from 'react';
import { splitDuration } from '../utils/format';

/**
 * Ticks once per second towards `targetIso`.
 *
 * `serverOffsetMs` is (server time - device time) captured when the data was
 * fetched, so a wrong device clock doesn't skew the display. The countdown is
 * only visual: when it reaches zero we call `onComplete`, and the UI then
 * asks the backend for the real status instead of deciding by itself.
 */
export function useCountdown(targetIso, { serverOffsetMs = 0, onComplete } = {}) {
  const target = targetIso ? new Date(targetIso).getTime() : null;
  const [remaining, setRemaining] = useState(() => (target ? target - (Date.now() + serverOffsetMs) : 0));
  const onCompleteRef = useRef(onComplete);
  const firedFor = useRef(null);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!target) return undefined;

    const tick = () => {
      const left = target - (Date.now() + serverOffsetMs);
      setRemaining(left);
      if (left <= 0 && firedFor.current !== target) {
        firedFor.current = target;
        onCompleteRef.current?.();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target, serverOffsetMs]);

  return { ...splitDuration(remaining), remainingMs: Math.max(remaining, 0), isComplete: Boolean(target) && remaining <= 0 };
}
