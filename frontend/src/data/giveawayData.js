/**
 * Mock data shaped like the real API responses (see docs/API.md).
 * Nothing in the UI imports this file directly: it is only read by
 * api/mock/mockServer.js, which plays the role of the backend.
 *
 * Every figure here is fictional development data.
 */
import { maskUserId } from '../utils/mask';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

/* ---------------------------------------------------------------- prizes */

export const PRIZES = [
  {
    id: 'PRIZE-001',
    slug: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    position: 1,
    positionLabel: '1st Prize',
    imageKey: 'iphone',
    accent: 'purple',
    description: 'Latest iPhone 15 Pro, 128GB.',
    longDescription:
      'A brand-new iPhone 15 Pro (128GB) in a premium finish. One winner is drawn for this prize.',
    winnerCount: 1,
    type: 'PHYSICAL',
    claimType: 'ADDRESS',
    entry: { currency: 'VE', amount: 250 },
    participants: 2300,
  },
  {
    id: 'PRIZE-002',
    slug: 'apple-watch',
    name: 'Apple Watch Series 9',
    position: 2,
    positionLabel: '2nd Prize',
    imageKey: 'watch',
    accent: 'blue',
    description: 'Latest Apple Watch Series 9.',
    longDescription: 'An Apple Watch Series 9 with a sport band. Three winners are drawn for this prize.',
    winnerCount: 3,
    type: 'PHYSICAL',
    claimType: 'ADDRESS',
    entry: { currency: 'VE', amount: 200 },
    participants: 1800,
  },
  {
    id: 'PRIZE-003',
    slug: 'airpods',
    name: 'AirPods Pro 2',
    position: 3,
    positionLabel: '3rd Prize',
    imageKey: 'airpods',
    accent: 'green',
    description: 'Active noise cancellation.',
    longDescription: 'AirPods Pro (2nd generation) with active noise cancellation. Five winners are drawn.',
    winnerCount: 5,
    type: 'PHYSICAL',
    claimType: 'ADDRESS',
    entry: { currency: 'SVE', amount: 500 },
    participants: 3100,
  },
  {
    id: 'PRIZE-004',
    slug: 'amazon-2000',
    name: '₹2,000 Amazon Gift Card',
    position: 4,
    positionLabel: 'Lucky Draw',
    imageKey: 'amazon-2000',
    accent: 'orange',
    description: '₹2,000 Amazon gift card.',
    longDescription: 'A ₹2,000 Amazon gift card, delivered by email. Two winners are drawn.',
    winnerCount: 2,
    type: 'GIFT_CARD',
    claimType: 'EMAIL',
    entry: { currency: 'VE', amount: 500 },
    participants: 1300,
  },
  {
    id: 'PRIZE-005',
    slug: 'amazon-500',
    name: '₹500 Amazon Gift Card',
    position: 5,
    positionLabel: 'Lucky Draw',
    imageKey: 'amazon-500',
    accent: 'orange',
    description: '₹500 Amazon gift card.',
    longDescription: 'A ₹500 Amazon gift card, delivered by email. Five winners are drawn.',
    winnerCount: 5,
    type: 'GIFT_CARD',
    claimType: 'EMAIL',
    entry: { currency: 'VE', amount: 300 },
    participants: 1950,
  },
  {
    id: 'PRIZE-006',
    slug: 'amazon-20',
    name: '₹20 Amazon Gift Card',
    position: 6,
    positionLabel: 'Lucky Draw',
    imageKey: 'amazon-20',
    accent: 'orange',
    description: '₹20 Amazon gift card.',
    longDescription: 'A ₹20 Amazon gift card, delivered by email. Ten winners are drawn.',
    winnerCount: 10,
    type: 'GIFT_CARD',
    claimType: 'EMAIL',
    entry: { currency: 'TOKEN', amount: 2000 },
    participants: 4200,
  },
];

/* ------------------------------------------------------ giveaway content */

export const GIVEAWAY_CONTENT = {
  id: 'GW-2026-10',
  title: 'Festive Rewards Giveaway',
  slug: 'festive-rewards',
  description: 'Pick a reward, pay the listed entry fee and get a chance to win. One participation per draw.',
  eligibility: [
    'You need a verified VELOOP Rewards account in good standing.',
    'You must be 18 years or older and a resident of India.',
    'Employees of VELOOP and their immediate family are not eligible.',
  ],
  participationSettings: {
    maxEntriesPerUser: 1,
    additionalEntriesViaTasks: false,
    claimWindowDays: 7,
  },
  rules: [
    {
      id: 'eligibility',
      title: 'Eligibility',
      body: 'Only verified VELOOP Rewards users who are 18+ and based in India can participate. One account per person.',
    },
    {
      id: 'participation',
      title: 'Participation requirements',
      body: 'Each prize has its own draw and its own entry fee, shown clearly before you join. You can join each draw once.',
    },
    {
      id: 'entries',
      title: 'Entry rules',
      body: 'One participation per user, per draw, per giveaway event. The entry fee is deducted from the currency listed on the prize page. (Task-based bonus entries are demo wording until the business rules are confirmed.)',
    },
    {
      id: 'selection',
      title: 'Winner selection',
      body: 'Winners are selected by the VELOOP backend after the giveaway ends, using a random draw among valid participations. The draw is never run in the browser.',
    },
    {
      id: 'claim',
      title: 'Prize claim period',
      body: 'Winners must submit their claim details within 7 days of the announcement. Unclaimed prizes expire.',
    },
    {
      id: 'disqualification',
      title: 'Disqualification',
      body: 'Suspicious, fraudulent, abusive or rule-breaking activity may lead to disqualification according to platform rules.',
    },
    {
      id: 'fraud',
      title: 'Fraud and abuse policy',
      body: 'Duplicate accounts, automated entries and attempts to manipulate balances or requests are monitored and may be blocked.',
    },
  ],
  faq: [
    { q: 'How do I participate?', a: 'Log in, open the prize you like, review the entry fee and rules, then confirm. Your balance is checked before anything is deducted.' },
    { q: 'How are winners selected?', a: 'After the giveaway ends, winners are drawn at random on the server from all valid participations.' },
    { q: 'When are winners announced?', a: 'Shortly after the countdown ends. Winners appear in the Winners tab; earlier winners move to Previous Winners.' },
    { q: 'What happens if I win?', a: 'You will see a Congratulations card on this page with a Claim Your Prize button.' },
    { q: 'How do I claim my prize?', a: 'Submit the required details within the claim window. Physical prizes need a delivery address; gift cards only need an email.' },
    { q: 'Can I participate in multiple giveaways?', a: 'Yes. You can join each draw once per event, and again when a new event begins.' },
    { q: 'What happens after the giveaway ends?', a: 'New entries close, winners are announced, and the next giveaway is previewed with its start time.' },
  ],
};

/* ---------------------------------------------------------------- stats */

export const STATS = {
  activeGiveaways: PRIZES.length,
  totalParticipants: 8500,
  prizesWon: 1200,
};

/* ----------------------------------------------------- demo users (auth) */

/**
 * Personas let you test every user state without a real account system.
 * `participations` are prize IDs the persona has already joined.
 */
export const PERSONAS = {
  VE10050: {
    id: 'VE10050',
    displayName: 'Aarav',
    label: 'Logged in, not joined',
    balances: { VE: 850, SVE: 1200, TOKEN: 5000 },
    participations: [],
    winnings: [],
  },
  VE10077: {
    id: 'VE10077',
    displayName: 'Meera',
    label: 'Low balance',
    balances: { VE: 120, SVE: 100, TOKEN: 800 },
    participations: [],
    winnings: [],
  },
  VE10042: {
    id: 'VE10042',
    displayName: 'Rohan',
    label: 'Participant (not a winner)',
    balances: { VE: 400, SVE: 700, TOKEN: 1200 },
    participations: ['PRIZE-001', 'PRIZE-003'],
    winnings: [],
    entries: 24,
  },
  VE10025: {
    id: 'VE10025',
    displayName: 'Isha',
    label: 'Winner: Apple Watch',
    balances: { VE: 350, SVE: 500, TOKEN: 2500 },
    participations: ['PRIZE-002'],
    winnings: ['PRIZE-002'],
    entries: 12,
  },
  VE10031: {
    id: 'VE10031',
    displayName: 'Kabir',
    label: 'Winner: ₹2,000 gift card',
    balances: { VE: 600, SVE: 300, TOKEN: 900 },
    participations: ['PRIZE-004'],
    winnings: ['PRIZE-004'],
    entries: 8,
  },
  VE90001: {
    id: 'VE90001',
    displayName: 'Admin',
    label: 'Draw Manager',
    balances: { VE: 0, SVE: 0, TOKEN: 0 },
    participations: [],
    winnings: [],
  },
};

/* --------------------------------------------------------------- winners */

// Fictional winner IDs. Persona IDs are included so "is this me?" detection works.
const WINNER_IDS = {
  'PRIZE-001': ['VE10412'],
  'PRIZE-002': ['VE10025', 'VE10318', 'VE10203'],
  'PRIZE-003': ['VE10091', 'VE10554', 'VE10187', 'VE10620', 'VE10342'],
  'PRIZE-004': ['VE10031', 'VE10776'],
  'PRIZE-005': ['VE10265', 'VE10148', 'VE10833', 'VE10509', 'VE10697'],
  'PRIZE-006': ['VE10121', 'VE10354', 'VE10468', 'VE10082', 'VE10911', 'VE10576', 'VE10237', 'VE10690', 'VE10443', 'VE10159'],
};

/** Builds the winners list for the current giveaway (only once it has ended). */
export function buildWinners(announcedAt) {
  return PRIZES.flatMap((prize) =>
    WINNER_IDS[prize.id].map((userId, index) => ({
      id: `${prize.id}-W${index + 1}`,
      userId, // kept internal to the mock server; stripped before it reaches the UI
      displayId: maskUserId(userId),
      prizeId: prize.id,
      prizeName: prize.name,
      positionLabel: prize.positionLabel,
      announcedAt,
    })),
  );
}

/* ------------------------------------------------------ previous events */

export const PREVIOUS_GIVEAWAYS = [
  {
    id: 'GW-2026-09',
    title: 'September Rewards',
    endedAt: '2026-09-30T18:00:00.000Z',
    winners: [
      { displayId: 'VE****63', prizeName: 'iPhone 15 Pro', category: 'Physical', date: '2026-09-30', status: 'DELIVERED' },
      { displayId: 'VE****18', prizeName: 'Apple Watch Series 9', category: 'Physical', date: '2026-09-30', status: 'DELIVERED' },
      { displayId: 'VE****75', prizeName: 'AirPods Pro 2', category: 'Physical', date: '2026-09-30', status: 'PROCESSING' },
      { displayId: 'VE****09', prizeName: '₹2,000 Amazon Gift Card', category: 'Gift card', date: '2026-09-30', status: 'DELIVERED' },
    ],
  },
  {
    id: 'GW-2026-08',
    title: 'August Reward Rush',
    endedAt: '2026-08-05T18:00:00.000Z',
    winners: [
      { displayId: 'VE****82', prizeName: 'iPhone 15 Pro', category: 'Physical', date: '2026-08-05', status: 'DELIVERED' },
      { displayId: 'VE****37', prizeName: 'AirPods Pro 2', category: 'Physical', date: '2026-08-05', status: 'DELIVERED' },
      { displayId: 'VE****54', prizeName: '₹500 Amazon Gift Card', category: 'Gift card', date: '2026-08-05', status: 'DELIVERED' },
    ],
  },
  {
    id: 'GW-2026-07',
    title: 'Summer Rewards',
    endedAt: '2026-08-06T18:00:00.000Z',
    winners: [
      { displayId: 'VE****42', prizeName: 'Apple Watch Series 9', category: 'Physical', date: '2026-08-06', status: 'DELIVERED' },
      { displayId: 'VE****91', prizeName: '₹20 Amazon Gift Card', category: 'Gift card', date: '2026-08-06', status: 'DELIVERED' },
    ],
  },
];

/* ------------------------------------------------------------- timelines */

/** Start/end timestamps for each demo scenario, relative to "now". */
export function buildTimeline(phase, now = Date.now()) {
  switch (phase) {
    case 'ending-soon':
      return { startAt: now - 18 * DAY, endAt: now + 12 * 1000 };
    case 'ended':
      return { startAt: now - 30 * DAY, endAt: now - 2 * HOUR };
    case 'upcoming':
      return { startAt: now + 3 * DAY, endAt: now + 33 * DAY };
    case 'active':
    default:
      return { startAt: now - 18 * DAY, endAt: now + 12 * DAY + 8 * HOUR + 45 * 60 * 1000 + 32 * 1000 };
  }
}

export const NEXT_GIVEAWAY_DELAY = 3 * DAY;
export const WINNER_SELECTION_DELAY = 6 * 1000;
