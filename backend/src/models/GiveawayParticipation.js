import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema(
  {
    participationId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    giveawayId: { type: String, required: true },
    prizeId: { type: String, required: true },
    entryCurrency: { type: String, required: true },
    entryAmount: { type: Number, required: true },
    deviceHash: { type: String, index: true },
    ipHash: String,
    // JOINED entries can win. FLAGGED ones wait for admin review and are skipped by the draw.
    status: { type: String, enum: ['JOINED', 'FLAGGED'], default: 'JOINED' },
    riskScore: { type: Number, default: 0 },
    transactionId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// One user, one participation per draw per giveaway event.
// This index (not an if-statement) is what makes simultaneous requests safe.
participationSchema.index({ userId: 1, giveawayId: 1, prizeId: 1 }, { unique: true });
participationSchema.index({ giveawayId: 1, prizeId: 1, status: 1 });

export const GiveawayParticipation = mongoose.model('GiveawayParticipation', participationSchema);
