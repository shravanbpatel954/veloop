import mongoose from 'mongoose';

/**
 * Ledger of entry-fee movements. Rows are never deleted: a refund would be a
 * new REVERSAL row pointing at the original (reversalOf).
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    giveawayId: { type: String, required: true },
    prizeId: { type: String, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['ENTRY_FEE', 'REVERSAL'], default: 'ENTRY_FEE' },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'], default: 'SUCCESS' },
    balanceBefore: Number,
    balanceAfter: Number,
    idempotencyKey: String,
    reversalOf: String,
  },
  { timestamps: true },
);

// Replaying the same Idempotency-Key for a user can never create a second charge.
transactionSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);

export const GiveawayEntryTransaction = mongoose.model('GiveawayEntryTransaction', transactionSchema);
