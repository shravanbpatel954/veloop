import { Prize } from '../models/Prize.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { PrizeClaim } from '../models/PrizeClaim.js';
import { AppError } from '../utils/errors.js';
import { effectiveStatus, winnersStatus } from '../utils/giveawayStatus.js';
import { newId } from '../utils/crypto.js';
import { claimSchemaFor } from '../validators/schemas.js';
import { audit } from './auditService.js';

const DUPLICATE_KEY = 11000;

/**
 * A claim is allowed only if the AUTHENTICATED user is a recorded winner of
 * that prize. The client picks nothing except which prize (when they won
 * several); the form shape comes from the prize's claimType.
 */
export async function submitClaim({ user, giveaway, body, requestId }) {
  const base = { userId: user.userId, giveawayId: giveaway.giveawayId, requestId };

  if (winnersStatus(giveaway, effectiveStatus(giveaway)) !== 'ANNOUNCED') throw new AppError('CLAIM_NOT_ALLOWED');

  const winner = await GiveawayWinner.findOne({ giveawayId: giveaway.giveawayId, userId: user.userId, prizeId: body?.prizeId });
  if (!winner) {
    await audit({ ...base, action: 'CLAIM_REJECTED', result: 'REJECTED', reason: 'NOT_A_WINNER', prizeId: body?.prizeId });
    throw new AppError('CLAIM_NOT_ALLOWED');
  }

  if (new Date() > winner.claimDeadline) {
    await GiveawayWinner.updateOne({ _id: winner._id, claimStatus: 'NOT_SUBMITTED' }, { claimStatus: 'EXPIRED' });
    throw new AppError('CLAIM_EXPIRED');
  }
  if (winner.claimStatus !== 'NOT_SUBMITTED') throw new AppError('CLAIM_NOT_ALLOWED', 'Claim already submitted');

  const prize = await Prize.findOne({ giveawayId: giveaway.giveawayId, prizeId: winner.prizeId }).lean();
  const parsed = claimSchemaFor(prize.claimType).safeParse(body);
  if (!parsed.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid claim details', parsed.error.flatten().fieldErrors);
  }

  const { prizeId, ...details } = parsed.data;
  try {
    await PrizeClaim.create({
      claimId: newId('CLM'),
      winnerId: winner.winnerId,
      userId: user.userId,
      giveawayId: giveaway.giveawayId,
      prizeId,
      details,
    });
  } catch (error) {
    if (error.code === DUPLICATE_KEY) throw new AppError('CLAIM_NOT_ALLOWED', 'Claim already submitted');
    throw error;
  }

  winner.claimStatus = 'SUBMITTED';
  await winner.save();
  // Audit the event, never the personal details.
  await audit({ ...base, action: 'CLAIM_SUBMITTED', prizeId });

  return { status: 'SUBMITTED', deadline: winner.claimDeadline, submittedAt: new Date() };
}

/** Status only. Address/email are never returned by user-facing endpoints. */
export async function getMyClaim({ user, giveaway }) {
  const winners = await GiveawayWinner.find({ giveawayId: giveaway.giveawayId, userId: user.userId }).lean();
  return {
    claims: winners.map((winner) => ({
      prizeId: winner.prizeId,
      status: new Date() > winner.claimDeadline && winner.claimStatus === 'NOT_SUBMITTED' ? 'EXPIRED' : winner.claimStatus,
      deadline: winner.claimDeadline,
    })),
  };
}
