import mongoose from 'mongoose';

/**
 * A prize is also its own draw: it carries the entry fee and winner count.
 * The fee here is the ONLY source of truth for what a join costs.
 */
const prizeSchema = new mongoose.Schema(
  {
    prizeId: { type: String, required: true, unique: true }, // "PRIZE-001"
    giveawayId: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    position: { type: Number, required: true },
    positionLabel: String,
    imageKey: String,
    accent: { type: String, default: 'purple' },
    description: String,
    longDescription: String,
    winnerCount: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL'], required: true },
    claimType: { type: String, enum: ['ADDRESS', 'EMAIL'], required: true },
    entry: {
      currency: { type: String, enum: ['VE', 'SVE', 'TOKEN'], required: true },
      amount: { type: Number, required: true, min: 1 },
    },
  },
  { timestamps: true },
);

prizeSchema.index({ giveawayId: 1, slug: 1 }, { unique: true });

export const Prize = mongoose.model('Prize', prizeSchema);
