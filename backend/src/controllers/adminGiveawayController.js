import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { Giveaway } from '../models/Giveaway.js';
import { Prize } from '../models/Prize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { PrizeClaim } from '../models/PrizeClaim.js';
import { getGiveawayOrThrow, serializeGiveaway } from '../services/giveawayService.js';
import { selectWinners } from '../services/winnerService.js';
import { audit } from '../services/auditService.js';

export const create = asyncHandler(async (req, res) => {
  const { prizes, ...fields } = req.body;
  const giveaway = await Giveaway.create(fields);
  await Prize.insertMany(prizes.map((prize) => ({ ...prize, giveawayId: giveaway.giveawayId })));
  await audit({ action: 'GIVEAWAY_CREATED', userId: req.user.userId, giveawayId: giveaway.giveawayId, requestId: req.requestId });
  res.status(201).json({ data: await serializeGiveaway(giveaway) });
});

export const archive = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  giveaway.status = 'ARCHIVED';
  await giveaway.save();
  await audit({ action: 'GIVEAWAY_ARCHIVED', userId: req.user.userId, giveawayId: giveaway.giveawayId, requestId: req.requestId });
  res.json({ data: await serializeGiveaway(giveaway) });
});

export const draw = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  res.json({ data: await selectWinners({ giveawayId: giveaway.giveawayId, adminId: req.user.userId }) });
});

export const participations = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  const rows = await GiveawayParticipation.find({ giveawayId: giveaway.giveawayId }).sort({ joinedAt: -1 }).limit(500).lean();
  res.json({ data: { participations: rows } });
});

/** Admin clears a FLAGGED entry so it can take part in the draw. */
export const clearFlag = asyncHandler(async (req, res) => {
  const updated = await GiveawayParticipation.findOneAndUpdate(
    { participationId: req.params.participationId, status: 'FLAGGED' },
    { status: 'JOINED' },
    { new: true },
  );
  if (!updated) throw new AppError('GIVEAWAY_NOT_FOUND', 'Flagged participation not found');
  await audit({ action: 'FLAG_CLEARED', userId: req.user.userId, giveawayId: updated.giveawayId, prizeId: updated.prizeId, requestId: req.requestId });
  res.json({ data: { participationId: updated.participationId, status: updated.status } });
});

/** Fulfilment view: the only place claim details are readable. */
export const claims = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  const rows = await PrizeClaim.find({ giveawayId: giveaway.giveawayId }).select('+details').lean();
  res.json({ data: { claims: rows } });
});

export const updateClaimStatus = asyncHandler(async (req, res) => {
  const claim = await PrizeClaim.findOneAndUpdate(
    { claimId: req.params.claimId },
    { status: req.body.status, processedBy: req.user.userId },
    { new: true },
  );
  if (!claim) throw new AppError('CLAIM_NOT_ALLOWED', 'Claim not found');
  await GiveawayWinner.updateOne({ winnerId: claim.winnerId }, { claimStatus: req.body.status });
  await audit({ action: 'CLAIM_PROCESSED', userId: req.user.userId, giveawayId: claim.giveawayId, prizeId: claim.prizeId, reason: req.body.status, requestId: req.requestId });
  res.json({ data: { claimId: claim.claimId, status: claim.status } });
});
