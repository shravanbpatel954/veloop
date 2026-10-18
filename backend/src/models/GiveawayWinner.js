import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema(
  {
    winnerId: { type: String, required: true, unique: true },
    giveawayId: { type: String, required: true },
    prizeId: { type: String, required: true },
    userId: { type: String, required: true },
    selectionMethod: { type: String, default: 'CRYPTO_RANDOM' },
    selectedAt: { type: Date, default: Date.now },
    claimDeadline: { type: Date, required: true },
    claimStatus: {
      type: String,
      enum: ['NOT_SUBMITTED', 'SUBMITTED', 'PROCESSING', 'COMPLETED', 'EXPIRED'],
      default: 'NOT_SUBMITTED',
    },
  },
  { timestamps: true },
);

// A user can't be recorded twice as winner of the same prize, even if the draw is re-run.
winnerSchema.index({ giveawayId: 1, prizeId: 1, userId: 1 }, { unique: true });
winnerSchema.index({ giveawayId: 1, userId: 1 });

export const GiveawayWinner = mongoose.model('GiveawayWinner', winnerSchema);
