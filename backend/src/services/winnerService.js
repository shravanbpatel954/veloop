import { Giveaway } from '../models/Giveaway.js';
import { Prize } from '../models/Prize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AppError } from '../utils/errors.js';
import { effectiveStatus, winnersStatus } from '../utils/giveawayStatus.js';
import { maskUserId } from '../utils/mask.js';
import { newId, secureShuffle } from '../utils/crypto.js';
import { audit } from './auditService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Runs the draw for a finished giveaway. Admin-only, server-side only.
 *
 * - The lock (winnersSelectedAt: null -> now) is taken with one atomic update,
 *   so concurrent calls can't both run the draw.
 * - Each prize gets at most `winnerCount` winners; the unique winner index is a
 *   second safety net if the process crashes and is re-run.
 * - FLAGGED participations are never eligible.
 */
export async function selectWinners({ giveawayId, adminId }) {
  const existing = await Giveaway.findOne({ giveawayId });
  if (!existing) throw new AppError('GIVEAWAY_NOT_FOUND');
  if (effectiveStatus(existing) !== 'ENDED') throw new AppError('GIVEAWAY_NOT_ACTIVE', 'Winners can only be selected after the giveaway ends');

  const locked = await Giveaway.findOneAndUpdate(
    { giveawayId, winnersSelectedAt: null },
    { $set: { winnersSelectedAt: new Date() } },
    { new: true },
  );
  if (!locked) return { alreadySelected: true };

  const prizes = await Prize.find({ giveawayId }).sort({ position: 1 }).lean();
  const deadline = new Date(Date.now() + locked.participationSettings.claimWindowDays * DAY_MS);
  let created = 0;

  for (const prize of prizes) {
    const already = await GiveawayWinner.countDocuments({ giveawayId, prizeId: prize.prizeId });
    const slots = prize.winnerCount - already;
    if (slots <= 0) continue;

    const eligible = await GiveawayParticipation.find({ giveawayId, prizeId: prize.prizeId, status: 'JOINED' }).select('userId').lean();
    const picked = secureShuffle(eligible.map((p) => p.userId)).slice(0, slots);
    if (picked.length === 0) continue;

    try {
      const docs = await GiveawayWinner.insertMany(
        picked.map((userId) => ({
          winnerId: newId('WIN'),
          giveawayId,
          prizeId: prize.prizeId,
          userId,
          claimDeadline: deadline,
        })),
        { ordered: false },
      );
      created += docs.length;
    } catch (error) {
      if (error.code !== 11000 && !error.writeErrors) throw error; // duplicates are fine, anything else is not
    }
  }

  await Giveaway.updateOne({ giveawayId }, { $set: { winnersAnnouncedAt: new Date() } });
  await audit({ action: 'WINNER_SELECTED', userId: adminId, giveawayId, meta: { winnersCreated: created } });
  return { alreadySelected: false, winnersCreated: created };
}

/** Public winner list: masked IDs only. `isCurrentUser` is decided here, on the server. */
export async function getWinnersPayload({ giveaway, viewerId }) {
  const status = winnersStatus(giveaway, effectiveStatus(giveaway));
  if (status !== 'ANNOUNCED') return { status, winners: [] };

  const [winners, prizes] = await Promise.all([
    GiveawayWinner.find({ giveawayId: giveaway.giveawayId }).sort({ selectedAt: 1 }).lean(),
    Prize.find({ giveawayId: giveaway.giveawayId }).lean(),
  ]);
  const byId = Object.fromEntries(prizes.map((prize) => [prize.prizeId, prize]));

  return {
    status,
    winners: winners
      .sort((a, b) => (byId[a.prizeId]?.position ?? 99) - (byId[b.prizeId]?.position ?? 99))
      .map((winner) => ({
        id: winner.winnerId,
        displayId: maskUserId(winner.userId),
        prizeId: winner.prizeId,
        prizeName: byId[winner.prizeId]?.name,
        positionLabel: byId[winner.prizeId]?.positionLabel,
        announcedAt: giveaway.winnersAnnouncedAt,
        isCurrentUser: Boolean(viewerId) && winner.userId === viewerId,
      })),
  };
}
