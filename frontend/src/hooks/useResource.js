import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-fetching hook with explicit states:
 *   idle | loading | success | error
 *
 * `reload({ silent: true })` refreshes in the background without flipping the
 * UI back to a loading state (used for polling and countdown sync).
 */
export function useResource(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ status: enabled ? 'loading' : 'idle', data: null, error: null });
  const fetcherRef = useRef(fetcher);
  const latestRequest = useRef(0);
  fetcherRef.current = fetcher;

  const load = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (!silent) setState((prev) => ({ status: 'loading', data: prev.data, error: null }));

    try {
      const data = await fetcherRef.current();
      if (requestId === latestRequest.current) setState({ status: 'success', data, error: null });
    } catch (error) {
      if (requestId !== latestRequest.current || silent) return;
      setState({ status: 'error', data: null, error });
    }
  }, []);

  useEffect(() => {
    if (enabled) load();
    else setState({ status: 'idle', data: null, error: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { ...state, reload: load };
}
