import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({ id: String, title: String, body: String }, { _id: false });
const faqSchema = new mongoose.Schema({ q: String, a: String }, { _id: false });

const giveawaySchema = new mongoose.Schema(
  {
    giveawayId: { type: String, required: true, unique: true }, // "GW-2026-10"
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    // Only ARCHIVED is authoritative here; the rest is derived from the dates.
    status: { type: String, enum: ['UPCOMING', 'ACTIVE', 'ENDED', 'ARCHIVED'], default: 'UPCOMING' },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    rules: [ruleSchema],
    faq: [faqSchema],
    eligibility: [String],
    participationSettings: {
      maxEntriesPerUser: { type: Number, default: 1 },
      additionalEntriesViaTasks: { type: Boolean, default: false },
      claimWindowDays: { type: Number, default: 7 },
      // What to do when a second account joins from the same device: 'flag' | 'block'
      sameDevicePolicy: { type: String, enum: ['flag', 'block'], default: 'flag' },
    },
    // Set atomically by the winner draw. Guarantees the draw runs once.
    winnersSelectedAt: { type: Date, default: null },
    winnersAnnouncedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

giveawaySchema.index({ startAt: 1, endAt: 1 });

export const Giveaway = mongoose.model('Giveaway', giveawaySchema);
