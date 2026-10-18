import { Giveaway } from '../models/Giveaway.js';
import { selectWinners } from '../services/winnerService.js';

const TICK_MS = 30_000;

/**
 * Optional housekeeping. Status itself is derived from the clock on every
 * request, so nothing breaks if this job doesn't run.
 *  - AUTO_DRAW=true  -> runs the winner draw shortly after a giveaway ends
 *  - archives giveaways 30 days after their end, once winners are published
 */
export function startLifecycleJob() {
  const autoDraw = process.env.AUTO_DRAW === 'true';

  const tick = async () => {
    try {
      const now = new Date();
      if (autoDraw) {
        const ready = await Giveaway.find({ status: { $ne: 'ARCHIVED' }, endAt: { $lt: now }, winnersSelectedAt: null }).lean();
        for (const giveaway of ready) await selectWinners({ giveawayId: giveaway.giveawayId, adminId: 'SYSTEM' });
      }
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      await Giveaway.updateMany({ status: { $ne: 'ARCHIVED' }, endAt: { $lt: cutoff }, winnersAnnouncedAt: { $ne: null } }, { status: 'ARCHIVED' });
    } catch (error) {
      console.error('lifecycle job failed:', error.message);
    }
  };

  setInterval(tick, TICK_MS).unref();
}
