import mongoose from 'mongoose';

const fraudEventSchema = new mongoose.Schema(
  {
    userId: String,
    giveawayId: String,
    prizeId: String,
    deviceHash: String,
    ipHash: String,
    riskScore: Number,
    level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    reason: String,
    signals: [{ name: String, weight: Number }],
    action: { type: String, enum: ['ALLOWED', 'FLAGGED', 'BLOCKED'] },
  },
  { timestamps: true },
);

fraudEventSchema.index({ userId: 1, createdAt: -1 });
fraudEventSchema.index({ giveawayId: 1, deviceHash: 1 });

export const FraudEvent = mongoose.model('FraudEvent', fraudEventSchema);
