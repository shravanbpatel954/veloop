import { Giveaway } from '../models/Giveaway.js';
import { Prize } from '../models/Prize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AppError } from '../utils/errors.js';
import { effectiveStatus, winnersStatus } from '../utils/giveawayStatus.js';
import { maskUserId } from '../utils/mask.js';

const serializePrize = (prize, participants = 0) => ({
  id: prize.prizeId,
  slug: prize.slug,
  name: prize.name,
  position: prize.position,
  positionLabel: prize.positionLabel,
  imageKey: prize.imageKey,
  accent: prize.accent,
  description: prize.description,
  longDescription: prize.longDescription,
  winnerCount: prize.winnerCount,
  type: prize.type,
  claimType: prize.claimType,
  entry: { currency: prize.entry.currency, amount: prize.entry.amount },
  participants,
});

async function participantCounts(giveawayId) {
  const rows = await GiveawayParticipation.aggregate([
    { $match: { giveawayId } },
    { $group: { _id: '$prizeId', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

export async function serializeGiveaway(giveaway, now = new Date()) {
  const status = effectiveStatus(giveaway, now);
  const [prizes, counts] = await Promise.all([
    Prize.find({ giveawayId: giveaway.giveawayId }).sort({ position: 1 }).lean(),
    participantCounts(giveaway.giveawayId),
  ]);

  return {
    id: giveaway.giveawayId,
    title: giveaway.title,
    slug: giveaway.slug,
    description: giveaway.description,
    status,
    winnersStatus: winnersStatus(giveaway, status),
    startAt: giveaway.startAt,
    endAt: giveaway.endAt,
    rules: giveaway.rules,
    faq: giveaway.faq,
    eligibility: giveaway.eligibility,
    participationSettings: {
      maxEntriesPerUser: giveaway.participationSettings.maxEntriesPerUser,
      additionalEntriesViaTasks: giveaway.participationSettings.additionalEntriesViaTasks,
      claimWindowDays: giveaway.participationSettings.claimWindowDays,
    },
    participants: Object.values(counts).reduce((sum, n) => sum + n, 0),
    prizes: prizes.map((prize) => serializePrize(prize, counts[prize.prizeId] ?? 0)),
  };
}

/** Current = the live giveaway, else the next upcoming one, else the latest one that ended. */
export async function findCurrentGiveaway(now = new Date()) {
  const live = await Giveaway.findOne({ status: { $ne: 'ARCHIVED' }, startAt: { $lte: now }, endAt: { $gte: now } }).sort({ startAt: -1 });
  if (live) return live;
  const upcoming = await Giveaway.findOne({ status: { $ne: 'ARCHIVED' }, startAt: { $gt: now } }).sort({ startAt: 1 });
  if (upcoming) return upcoming;
  return Giveaway.findOne({ status: { $ne: 'ARCHIVED' }, endAt: { $lt: now } }).sort({ endAt: -1 });
}

export async function getCurrentPayload() {
  const now = new Date();
  const current = await findCurrentGiveaway(now);
  const giveaway = current ? await serializeGiveaway(current, now) : null;

  let nextGiveaway = null;
  if (giveaway?.status === 'ENDED') {
    const next = await Giveaway.findOne({ startAt: { $gt: now } }).sort({ startAt: 1 }).lean();
    if (next) nextGiveaway = { title: next.title, startAt: next.startAt };
  }

  const [totalParticipants, prizesWon] = await Promise.all([GiveawayParticipation.countDocuments(), GiveawayWinner.countDocuments()]);
  return {
    giveaway,
    nextGiveaway,
    stats: { activeGiveaways: giveaway?.prizes.length ?? 0, totalParticipants, prizesWon },
    serverTime: now,
  };
}

/** Accepts either the public id ("GW-2026-10") or the slug. */
export async function getGiveawayOrThrow(idOrSlug) {
  const giveaway = await Giveaway.findOne({ $or: [{ giveawayId: idOrSlug }, { slug: idOrSlug }] });
  if (!giveaway) throw new AppError('GIVEAWAY_NOT_FOUND', 'Giveaway not found');
  return giveaway;
}

export async function getPreviousPayload() {
  const now = new Date();
  const current = await findCurrentGiveaway(now);
  const finished = await Giveaway.find({
    endAt: { $lt: now },
    winnersAnnouncedAt: { $ne: null },
    ...(current ? { giveawayId: { $ne: current.giveawayId } } : {}),
  }).sort({ endAt: -1 }).limit(12).lean();

  const giveaways = await Promise.all(
    finished.map(async (giveaway) => {
      const [winners, prizes] = await Promise.all([
        GiveawayWinner.find({ giveawayId: giveaway.giveawayId }).sort({ selectedAt: 1 }).lean(),
        Prize.find({ giveawayId: giveaway.giveawayId }).lean(),
      ]);
      const byId = Object.fromEntries(prizes.map((p) => [p.prizeId, p]));
      return {
        id: giveaway.giveawayId,
        title: giveaway.title,
        endedAt: giveaway.endAt,
        winners: winners.map((w) => ({
          displayId: maskUserId(w.userId),
          prizeName: byId[w.prizeId]?.name ?? 'Prize',
          category: byId[w.prizeId]?.type === 'GIFT_CARD' ? 'Gift card' : 'Physical',
          date: w.selectedAt,
          status: w.claimStatus === 'COMPLETED' ? 'DELIVERED' : w.claimStatus === 'NOT_SUBMITTED' ? 'WINNER' : 'PROCESSING',
        })),
      };
    }),
  );
  return { giveaways };
}
