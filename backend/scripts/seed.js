/**
 * Dev seed: demo users (with wallets), one ACTIVE giveaway with six prizes,
 * and one finished giveaway with winners so "Previous Winners" has content.
 * Run with:  npm run seed   (this wipes the giveaway collections first)
 */
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Giveaway } from '../src/models/Giveaway.js';
import { Prize } from '../src/models/Prize.js';
import { GiveawayParticipation } from '../src/models/GiveawayParticipation.js';
import { GiveawayEntryTransaction } from '../src/models/GiveawayEntryTransaction.js';
import { GiveawayWinner } from '../src/models/GiveawayWinner.js';
import { PrizeClaim } from '../src/models/PrizeClaim.js';
import { FraudEvent } from '../src/models/FraudEvent.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { hashPassword } from '../src/utils/crypto.js';

const DAY = 86_400_000;
const PASSWORD = 'Password@123';

const USERS = [
  { userId: 'VE10050', email: 'aarav@example.com', displayName: 'Aarav', wallet: { VE: 850, SVE: 1200, TOKEN: 5000 } },
  { userId: 'VE10077', email: 'meera@example.com', displayName: 'Meera', wallet: { VE: 120, SVE: 100, TOKEN: 800 } },
  { userId: 'VE10042', email: 'rohan@example.com', displayName: 'Rohan', wallet: { VE: 400, SVE: 700, TOKEN: 1200 } },
  { userId: 'VE10025', email: 'isha@example.com', displayName: 'Isha', wallet: { VE: 350, SVE: 500, TOKEN: 2500 } },
  { userId: 'VE90001', email: 'admin@example.com', displayName: 'Admin', role: 'admin', wallet: { VE: 0, SVE: 0, TOKEN: 0 } },
];

const PRIZES = [
  ['PRIZE-001', 'iphone-15-pro', 'iPhone 15 Pro', 1, '1st Prize', 'iphone', 'purple', 'Latest iPhone 15 Pro, 128GB.', 1, 'PHYSICAL', 'ADDRESS', 'VE', 250],
  ['PRIZE-002', 'apple-watch', 'Apple Watch Series 9', 2, '2nd Prize', 'watch', 'blue', 'Latest Apple Watch Series 9.', 3, 'PHYSICAL', 'ADDRESS', 'VE', 200],
  ['PRIZE-003', 'airpods', 'AirPods Pro 2', 3, '3rd Prize', 'airpods', 'green', 'Active noise cancellation.', 5, 'PHYSICAL', 'ADDRESS', 'SVE', 500],
  ['PRIZE-004', 'amazon-2000', '₹2,000 Amazon Gift Card', 4, 'Lucky Draw', 'amazon-2000', 'orange', '₹2,000 Amazon gift card.', 2, 'GIFT_CARD', 'EMAIL', 'VE', 500],
  ['PRIZE-005', 'amazon-500', '₹500 Amazon Gift Card', 5, 'Lucky Draw', 'amazon-500', 'orange', '₹500 Amazon gift card.', 5, 'GIFT_CARD', 'EMAIL', 'VE', 300],
  ['PRIZE-006', 'amazon-20', '₹20 Amazon Gift Card', 6, 'Lucky Draw', 'amazon-20', 'orange', '₹20 Amazon gift card.', 10, 'GIFT_CARD', 'EMAIL', 'TOKEN', 2000],
].map(([prizeId, slug, name, position, positionLabel, imageKey, accent, description, winnerCount, type, claimType, currency, amount]) => ({
  prizeId, slug, name, position, positionLabel, imageKey, accent, description, longDescription: description, winnerCount, type, claimType,
  entry: { currency, amount },
}));

const RULES = [
  { id: 'eligibility', title: 'Eligibility', body: 'Verified VELOOP Rewards users who are 18+ and based in India.' },
  { id: 'participation', title: 'Participation requirements', body: 'Each prize has its own draw and entry fee. You can join each draw once.' },
  { id: 'selection', title: 'Winner selection', body: 'Winners are drawn at random by the backend after the giveaway ends.' },
  { id: 'claim', title: 'Prize claim period', body: 'Winners must submit claim details within 7 days of the announcement.' },
  { id: 'fraud', title: 'Fraud and abuse policy', body: 'Duplicate accounts and manipulation attempts may be blocked or disqualified.' },
];
const FAQ = [
  { q: 'How do I participate?', a: 'Log in, open a prize, review the entry fee and confirm.' },
  { q: 'How are winners selected?', a: 'Randomly, on the server, after the giveaway ends.' },
];

async function main() {
  await mongoose.connect(env.mongoUri);
  await Promise.all([User, Giveaway, Prize, GiveawayParticipation, GiveawayEntryTransaction, GiveawayWinner, PrizeClaim, FraudEvent, AuditLog].map((m) => m.deleteMany({})));
  await mongoose.syncIndexes();

  const passwordHash = hashPassword(PASSWORD);
  await User.insertMany(USERS.map((user) => ({ ...user, passwordHash })));

  const now = Date.now();
  const common = { description: 'Pick a reward, pay the listed entry fee and get a chance to win.', rules: RULES, faq: FAQ, eligibility: ['Verified account, 18+, India.'] };

  await Giveaway.create({ giveawayId: 'GW-2026-10', title: 'Festive Rewards Giveaway', slug: 'festive-rewards', startAt: new Date(now - 2 * DAY), endAt: new Date(now + 12 * DAY), ...common });
  await Prize.insertMany(PRIZES.map((prize) => ({ ...prize, giveawayId: 'GW-2026-10' })));

  // A finished giveaway with one published winner, for the Previous Winners tab.
  await Giveaway.create({
    giveawayId: 'GW-2026-09', title: 'September Rewards', slug: 'september-rewards', startAt: new Date(now - 40 * DAY), endAt: new Date(now - 30 * DAY),
    winnersSelectedAt: new Date(now - 30 * DAY), winnersAnnouncedAt: new Date(now - 30 * DAY), ...common,
  });
  await Prize.insertMany(PRIZES.slice(0, 2).map((prize) => ({ ...prize, prizeId: `${prize.prizeId}-S`, slug: `${prize.slug}-sep`, giveawayId: 'GW-2026-09' })));
  await GiveawayWinner.create({ winnerId: 'WIN-SEED-1', giveawayId: 'GW-2026-09', prizeId: 'PRIZE-001-S', userId: 'VE10063', claimDeadline: new Date(now - 23 * DAY), claimStatus: 'COMPLETED' });

  console.log(`Seeded. Dev login password for every user: ${PASSWORD}`);
  console.log('Users:', USERS.map((u) => `${u.email} (${u.userId}${u.role === 'admin' ? ', admin' : ''})`).join(', '));
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
