import mongoose from 'mongoose';

/**
 * Minimal stand-in for the existing VELOOP user + wallet.
 * When integrating, point balanceService/authMiddleware at the real collections
 * and delete this model.
 */
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true }, // e.g. "VE10025"
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    wallet: {
      VE: { type: Number, default: 0, min: 0 },
      SVE: { type: Number, default: 0, min: 0 },
      TOKEN: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
