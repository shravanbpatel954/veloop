import { User } from '../models/User.js';
import { AppError, insufficientBalanceCode } from '../utils/errors.js';

const FIELD = { VE: 'wallet.VE', SVE: 'wallet.SVE', TOKEN: 'wallet.TOKEN' };

export async function getBalances(userId) {
  const user = await User.findOne({ userId }).lean();
  return user?.wallet ?? { VE: 0, SVE: 0, TOKEN: 0 };
}

/**
 * Deducts `amount` from exactly one currency, atomically.
 * The `$gte` guard lives inside the update, so two parallel requests can never
 * overspend the same balance (no "check, then deduct later" gap).
 * Must be called with the session of the surrounding transaction.
 */
export async function deductBalance({ userId, currency, amount, session }) {
  const field = FIELD[currency];
  if (!field) throw new AppError('VALIDATION_ERROR', 'Unknown currency');

  const updated = await User.findOneAndUpdate(
    { userId, status: 'active', [field]: { $gte: amount } },
    { $inc: { [field]: -amount } },
    { new: true, session },
  ).lean();

  if (!updated) {
    // Work out why, so the frontend can say "you need 130 more VEs".
    const current = await User.findOne({ userId }).session(session).lean();
    const balance = current?.wallet?.[currency] ?? 0;
    throw new AppError(insufficientBalanceCode(currency), 'Insufficient balance', {
      currency,
      shortfall: Math.max(amount - balance, 0),
    });
  }

  const after = updated.wallet[currency];
  return { balanceBefore: after + amount, balanceAfter: after };
}
