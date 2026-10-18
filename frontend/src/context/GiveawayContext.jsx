import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { giveawayApi } from '../api/giveawayApi';
import { useResource } from '../hooks/useResource';
import { useAuth } from './AuthContext';

const GiveawayContext = createContext(null);

const SELECTION_POLL_MS = 2500;

/**
 * Loads everything the giveaway screens need and keeps it in sync with the
 * backend. Components read from here; none of them call the API on their own
 * for page data.
 */
export function GiveawayProvider({ children }) {
  const { user, ready } = useAuth();

  const current = useResource(() => giveawayApi.getCurrentGiveaway(), []);
  const giveaway = current.data?.giveaway ?? null;
  const giveawayId = giveaway?.id;
  const giveawayStatus = giveaway?.status;
  const winnersStatus = giveaway?.winnersStatus;

  const winners = useResource(() => giveawayApi.getWinners(giveawayId), [giveawayId, winnersStatus, user?.id], {
    enabled: Boolean(giveawayId) && ready,
  });
  const previous = useResource(() => giveawayApi.getPreviousGiveaways(), [giveawayStatus]);
  const myStatus = useResource(() => giveawayApi.getMyStatus(giveawayId), [giveawayId, winnersStatus, user?.id], {
    enabled: Boolean(giveawayId) && ready,
  });

  // While the backend is still drawing winners, check back every few seconds.
  useEffect(() => {
    if (winnersStatus !== 'SELECTING') return undefined;
    const timer = setInterval(() => current.reload({ silent: true }), SELECTION_POLL_MS);
    return () => clearInterval(timer);
  }, [winnersStatus, current.reload]);

  /** Called when a countdown hits zero: ask the server what actually happened. */
  const syncWithServer = useCallback(() => current.reload({ silent: true }), [current.reload]);

  const refreshAll = useCallback(() => {
    current.reload();
    previous.reload();
  }, [current.reload, previous.reload]);

  const value = useMemo(() => {
    const serverOffsetMs = current.data ? new Date(current.data.serverTime).getTime() - Date.now() : 0;
    return {
      current,
      giveaway,
      nextGiveaway: current.data?.nextGiveaway ?? null,
      stats: current.data?.stats ?? null,
      isDemoData: Boolean(current.data?.meta?.demo),
      serverOffsetMs,
      winners,
      previous,
      myStatus,
      user,
      syncWithServer,
      refreshAll,
      reloadMyStatus: myStatus.reload,
    };
  }, [current, giveaway, winners, previous, myStatus, user, syncWithServer, refreshAll]);

  return <GiveawayContext.Provider value={value}>{children}</GiveawayContext.Provider>;
}

export function useGiveaway() {
  const context = useContext(GiveawayContext);
  if (!context) throw new Error('useGiveaway must be used inside <GiveawayProvider>');
  return context;
}
