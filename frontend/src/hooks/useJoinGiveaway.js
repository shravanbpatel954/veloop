import { useCallback, useRef, useState } from 'react';
import { giveawayApi } from '../api/giveawayApi';
import { describeError } from '../utils/errorMessages';

/**
 * State machine for "Confirm & Join": idle -> joining -> success | error.
 * A fresh idempotency key is created per confirmation attempt so a double
 * click can never charge twice. The backend enforces this too.
 */
export function useJoinGiveaway({ giveawayId, prizeId, onJoined }) {
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const idempotencyKey = useRef(null);

  const reset = useCallback(() => {
    idempotencyKey.current = null;
    setPhase('idle');
    setError(null);
    setResult(null);
  }, []);

  const join = useCallback(async () => {
    if (phase === 'joining') return;
    idempotencyKey.current ??= crypto.randomUUID();
    setPhase('joining');
    setError(null);
    try {
      const data = await giveawayApi.joinGiveaway(giveawayId, { prizeId, idempotencyKey: idempotencyKey.current });
      setResult(data);
      setPhase('success');
      onJoined?.();
    } catch (err) {
      setError({ ...describeError(err), code: err.code });
      setPhase('error');
      idempotencyKey.current = null; // a failed attempt may be retried with a new key
    }
  }, [phase, giveawayId, prizeId, onJoined]);

  return { phase, error, result, join, reset };
}
