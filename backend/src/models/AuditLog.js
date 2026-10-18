import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // JOIN_GIVEAWAY, ENTRY_FEE_DEDUCTED, WINNER_SELECTED...
    userId: String,
    giveawayId: String,
    prizeId: String,
    amount: Number,
    currency: String,
    result: { type: String, enum: ['SUCCESS', 'REJECTED', 'ERROR'], default: 'SUCCESS' },
    reason: String,
    requestId: String,
    meta: mongoose.Schema.Types.Mixed, // ip/device hashes etc. Never raw claim details.
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
