import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    claimId: { type: String, required: true, unique: true },
    winnerId: { type: String, required: true, unique: true }, // one claim per winner record
    userId: { type: String, required: true },
    giveawayId: { type: String, required: true },
    prizeId: { type: String, required: true },
    // Sensitive: hidden from queries unless explicitly selected (admin/fulfilment only).
    details: { type: mongoose.Schema.Types.Mixed, select: false },
    status: { type: String, enum: ['SUBMITTED', 'PROCESSING', 'COMPLETED'], default: 'SUBMITTED' },
    submittedAt: { type: Date, default: Date.now },
    processedBy: String,
  },
  { timestamps: true },
);

export const PrizeClaim = mongoose.model('PrizeClaim', claimSchema);
