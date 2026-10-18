import mongoose from 'mongoose';
import { Prize } from '../models/Prize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayEntryTransaction } from '../models/GiveawayEntryTransaction.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AppError } from '../utils/errors.js';
import { effectiveStatus, winnersStatus } from '../utils/giveawayStatus.js';
import { newId } from '../utils/crypto.js';
import { audit } from './auditService.js';
import { deductBalance, getBalances } from './balanceService.js';
import { evaluateJoin, recordFraudEvent } from './fraudService.js';

const DUPLICATE_KEY = 11000;

/**
 * Join flow. The client only says "I want to join prize X of giveaway Y".
 * Identity comes from the auth token; fee, currency and status come from the DB.
 */
export async function joinGiveaway({ user, giveaway, prizeId, idempotencyKey, deviceHash, ipHash, requestId }) {
  const base = { userId: user.userId, giveawayId: giveaway.giveawayId, prizeId, requestId };

  // 1. Replay of an already-processed request returns the same result (no second charge).
  if (idempotencyKey) {
    const previous = await GiveawayEntryTransaction.findOne({ userId: user.userId, idempotencyKey }).lean();
    if (previous?.status === 'SUCCESS') return resultFromTransaction(previous);
  }

  // 2. Giveaway must be live according to the SERVER clock.
  const status = effectiveStatus(giveaway);
  if (status === 'ENDED' || status === 'ARCHIVED') return reject(base, 'GIVEAWAY_ENDED');
  if (status !== 'ACTIVE') return reject(base, 'GIVEAWAY_NOT_ACTIVE');

  // 3. The prize must belong to this giveaway. The fee is read from it, never from the request.
  const prize = await Prize.findOne({ giveawayId: giveaway.giveawayId, prizeId }).lean();
  if (!prize) return reject(base, 'PRIZE_NOT_FOUND');

  // 4. Friendly early duplicate check (the unique index is the real guard, see step 7).
  if (await GiveawayParticipation.exists({ userId: user.userId, giveawayId: giveaway.giveawayId, prizeId })) {
    return reject(base, 'ALREADY_PARTICIPATING');
  }

  // 5. Fraud screening before any money moves.
  const fraud = await evaluateJoin({ user, giveaway, prizeId, deviceHash, ipHash });
  if (fraud.action === 'BLOCKED') {
    await recordFraudEvent({ ...base, deviceHash, ipHash, result: fraud, reason: 'Join attempt blocked by risk score' });
    await audit({ ...base, action: 'FRAUD_FLAGGED', result: 'REJECTED', reason: fraud.level, meta: { riskScore: fraud.riskScore } });
    throw new AppError('SUSPICIOUS_ACTIVITY', 'Participation could not be verified');
  }

  // 6. Charge + participation + ledger row: all or nothing.
  const session = await mongoose.startSession();
  let outcome;
  try {
    await session.withTransaction(async () => {
      const { balanceBefore, balanceAfter } = await deductBalance({
        userId: user.userId,
        currency: prize.entry.currency,
        amount: prize.entry.amount,
        session,
      });

      const transactionId = newId('TXN');
      await GiveawayEntryTransaction.create(
        [{
          transactionId,
          userId: user.userId,
          giveawayId: giveaway.giveawayId,
          prizeId,
          currency: prize.entry.currency,
          amount: prize.entry.amount,
          type: 'ENTRY_FEE',
          status: 'SUCCESS',
          balanceBefore,
          balanceAfter,
          idempotencyKey,
        }],
        { session },
      );

      // 7. Unique (userId, giveawayId, prizeId): a parallel duplicate throws here,
      //    which aborts the transaction and rolls the deduction back.
      await GiveawayParticipation.create(
        [{
          participationId: newId('PART'),
          userId: user.userId,
          giveawayId: giveaway.giveawayId,
          prizeId,
          entryCurrency: prize.entry.currency,
          entryAmount: prize.entry.amount,
          deviceHash,
          ipHash,
          status: fraud.action === 'FLAGGED' ? 'FLAGGED' : 'JOINED',
          riskScore: fraud.riskScore,
          transactionId,
        }],
        { session },
      );

      outcome = { transactionId, balanceAfter, prize };
    });
  } catch (error) {
    if (error.code === DUPLICATE_KEY) {
      // Same idempotency key twice -> return the first result. Otherwise it's a true duplicate join.
      if (idempotencyKey) {
        const previous = await GiveawayEntryTransaction.findOne({ userId: user.userId, idempotencyKey }).lean();
        if (previous?.status === 'SUCCESS') return resultFromTransaction(previous);
      }
      return reject(base, 'ALREADY_PARTICIPATING', { duplicate: true });
    }
    if (error instanceof AppError) {
      await audit({ ...base, action: 'JOIN_REJECTED', result: 'REJECTED', reason: error.code });
      throw error;
    }
    throw error;
  } finally {
    await session.endSession();
  }

  if (fraud.action === 'FLAGGED') {
    await recordFraudEvent({ ...base, deviceHash, ipHash, result: fraud, reason: 'Participation flagged for review' });
  }
  await audit({ ...base, action: 'JOIN_GIVEAWAY', amount: prize.entry.amount, currency: prize.entry.currency, meta: { transactionId: outcome.transactionId } });
  await audit({ ...base, action: 'ENTRY_FEE_DEDUCTED', amount: prize.entry.amount, currency: prize.entry.currency });

  return {
    participationId: outcome.transactionId,
    prizeId,
    entryFee: { currency: prize.entry.currency, amount: prize.entry.amount },
    balanceAfter: outcome.balanceAfter,
  };
}

async function reject(base, code, meta) {
  await audit({
    ...base,
    action: code === 'ALREADY_PARTICIPATING' ? 'DUPLICATE_ATTEMPT' : 'JOIN_REJECTED',
    result: 'REJECTED',
    reason: code,
    meta,
  });
  throw new AppError(code);
}

const resultFromTransaction = (txn) => ({
  participationId: txn.transactionId,
  prizeId: txn.prizeId,
  entryFee: { currency: txn.currency, amount: txn.amount },
  balanceAfter: txn.balanceAfter,
  replayed: true,
});

/** Everything the UI needs to personalise the page for the signed-in user. */
export async function getMyStatus({ user, giveaway }) {
  const [balances, participations, winners] = await Promise.all([
    getBalances(user.userId),
    GiveawayParticipation.find({ userId: user.userId, giveawayId: giveaway.giveawayId }).lean(),
    GiveawayWinner.find({ userId: user.userId, giveawayId: giveaway.giveawayId }).lean(),
  ]);

  // Winners are only visible once the draw has been published.
  const announced = winnersStatus(giveaway, effectiveStatus(giveaway)) === 'ANNOUNCED';
  const winnings = announced
    ? winners.map((winner) => ({
        prizeId: winner.prizeId,
        claim: {
          status: new Date() > winner.claimDeadline && winner.claimStatus === 'NOT_SUBMITTED' ? 'EXPIRED' : winner.claimStatus,
          deadline: winner.claimDeadline,
        },
      }))
    : [];

  return {
    user: { id: user.userId, displayName: user.displayName },
    balances,
    entries: participations.length,
    participations: participations.map((p) => ({ prizeId: p.prizeId, joinedAt: p.joinedAt })),
    winnings,
  };
}
