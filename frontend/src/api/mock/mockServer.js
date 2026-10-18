/**
 * In-browser stand-in for the Express backend.
 *
 * It follows the same rules the real server enforces: status is derived from
 * timestamps, winners are only returned after the draw, the fee comes from the
 * prize record (never from the request), and a user can join a draw once.
 * It exists so the UI can be developed and demoed without MongoDB.
 */
import {
  GIVEAWAY_CONTENT,
  NEXT_GIVEAWAY_DELAY,
  PERSONAS,
  PREVIOUS_GIVEAWAYS,
  PRIZES,
  STATS,
  WINNER_SELECTION_DELAY,
  buildTimeline,
  buildWinners,
} from '../../data/giveawayData';
import { ApiError } from '../httpClient';
import { checkBalance } from '../../utils/currency';
import { CLAIM_STATUS } from '../../utils/prizeTypes';

const LATENCY = 650;
const STORAGE_KEY = 'veloop_demo_user';
const CLAIM_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------ demo state */

const state = {
  phase: 'active',
  timeline: buildTimeline('active'),
  claimStatus: CLAIM_STATUS.NOT_SUBMITTED,
  failNextLoads: false,
  noGiveaway: false,
  // Mutations made during this session (joins, claims), keyed by user id.
  joined: {},
  claims: {},
  balances: {},
};

export const demoControls = {
  getState: () => ({ phase: state.phase, claimStatus: state.claimStatus, failNextLoads: state.failNextLoads, noGiveaway: state.noGiveaway }),
  setPhase(phase) {
    state.phase = phase;
    state.timeline = buildTimeline(phase);
  },
  setClaimStatus(status) {
    state.claimStatus = status;
    state.claims = {};
  },
  setFailNextLoads(value) {
    state.failNextLoads = value;
  },
  setNoGiveaway(value) {
    state.noGiveaway = value;
  },
  reset() {
    state.joined = {};
    state.claims = {};
    state.balances = {};
    state.claimStatus = CLAIM_STATUS.NOT_SUBMITTED;
    this.setPhase('active');
  },
};

export const mockAuth = {
  getUserId: () => localStorage.getItem(STORAGE_KEY),
  login(userId) {
    const resolvedId = PERSONAS[userId]?.id ?? Object.keys(PERSONAS).find((k) => k.toLowerCase() === userId?.toLowerCase() || PERSONAS[k].displayName.toLowerCase() === userId?.toLowerCase()) ?? 'VE10050';
    localStorage.setItem(STORAGE_KEY, resolvedId);
    return mockAuth.getProfile();
  },
  logout: () => localStorage.removeItem(STORAGE_KEY),
  getProfile() {
    const persona = PERSONAS[mockAuth.getUserId()];
    return persona ? { id: persona.id, displayName: persona.displayName } : null;
  },
};

/* --------------------------------------------------------------- helpers */

const wait = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));

/** Status is derived from timestamps on every call, like the real server does. */
function deriveStatus(now = Date.now()) {
  if (now < state.timeline.startAt) return 'UPCOMING';
  if (now <= state.timeline.endAt) return 'ACTIVE';
  return 'ENDED';
}

function winnersStatus(status, now = Date.now()) {
  if (status !== 'ENDED') return 'PENDING';
  return now >= state.timeline.endAt + WINNER_SELECTION_DELAY ? 'ANNOUNCED' : 'SELECTING';
}

function getWinnerRecords() {
  return buildWinners(new Date(state.timeline.endAt + WINNER_SELECTION_DELAY).toISOString());
}

function assertLoadable() {
  if (state.failNextLoads) throw new ApiError({ code: 'UNKNOWN', status: 500 });
}

function currentUser() {
  const persona = PERSONAS[mockAuth.getUserId()];
  if (!persona) return null;
  return { persona, balances: { ...persona.balances, ...state.balances[persona.id] } };
}

function toGiveaway(now = Date.now()) {
  const status = deriveStatus(now);
  return {
    ...GIVEAWAY_CONTENT,
    status,
    winnersStatus: winnersStatus(status, now),
    startAt: new Date(state.timeline.startAt).toISOString(),
    endAt: new Date(state.timeline.endAt).toISOString(),
    participants: STATS.totalParticipants,
    prizes: PRIZES,
  };
}

/* ------------------------------------------------------------- endpoints */

export const mockApi = {
  async getCurrentGiveaway() {
    await wait();
    assertLoadable();
    const now = Date.now();
    const giveaway = state.noGiveaway ? null : toGiveaway(now);
    const nextStart = state.timeline.endAt + NEXT_GIVEAWAY_DELAY;
    return {
      giveaway,
      nextGiveaway:
        giveaway?.status === 'ENDED'
          ? { title: 'Winter Rewards Giveaway', startAt: new Date(nextStart).toISOString() }
          : null,
      stats: STATS,
      serverTime: new Date(now).toISOString(),
      meta: { demo: true },
    };
  },

  async getWinners() {
    await wait(450);
    assertLoadable();
    const giveaway = toGiveaway();
    if (giveaway.winnersStatus !== 'ANNOUNCED') {
      return { status: giveaway.winnersStatus, winners: [] };
    }
    const me = currentUser();
    const winners = getWinnerRecords().map(({ userId, ...publicFields }) => ({
      ...publicFields,
      isCurrentUser: userId === me?.persona.id,
    }));
    return { status: 'ANNOUNCED', winners };
  },

  async getPreviousGiveaways() {
    await wait(500);
    assertLoadable();
    return { giveaways: PREVIOUS_GIVEAWAYS };
  },

  /** Returns null for visitors, which the UI treats as "not logged in". */
  async getMyStatus() {
    await wait(300);
    const me = currentUser();
    if (!me) return null;
    const { persona, balances } = me;
    const joined = [...persona.participations, ...(state.joined[persona.id] ?? [])];
    const giveaway = toGiveaway();

    const isWinnerNow = giveaway.winnersStatus === 'ANNOUNCED';
    const winnings = isWinnerNow
      ? persona.winnings.map((prizeId) => ({
          prizeId,
          claim: state.claims[`${persona.id}:${prizeId}`] ?? buildClaim(),
        }))
      : [];

    return {
      user: { id: persona.id, displayName: persona.displayName },
      balances,
      entries: persona.entries ?? joined.length,
      participations: joined.map((prizeId) => ({ prizeId })),
      winnings,
    };
  },

  async joinGiveaway({ prizeId }) {
    await wait(900);
    const me = currentUser();
    if (!me) throw new ApiError({ code: 'LOGIN_REQUIRED', status: 401 });

    const giveaway = toGiveaway();
    if (giveaway.status === 'ENDED') throw new ApiError({ code: 'GIVEAWAY_ENDED', status: 409 });
    if (giveaway.status !== 'ACTIVE') throw new ApiError({ code: 'GIVEAWAY_NOT_ACTIVE', status: 409 });

    const prize = PRIZES.find((item) => item.id === prizeId);
    if (!prize) throw new ApiError({ code: 'GIVEAWAY_NOT_FOUND', status: 404 });

    const already = [...me.persona.participations, ...(state.joined[me.persona.id] ?? [])];
    if (already.includes(prize.id)) throw new ApiError({ code: 'ALREADY_PARTICIPATING', status: 409 });

    // The fee is read from the prize record, never from the request.
    const check = checkBalance(me.balances, prize.entry);
    if (!check.hasEnough) {
      throw new ApiError({
        code: `INSUFFICIENT_${prize.entry.currency}_BALANCE`,
        status: 402,
        details: { shortfall: check.shortfall },
      });
    }

    state.balances[me.persona.id] = { ...me.balances, [prize.entry.currency]: check.balanceAfter };
    state.joined[me.persona.id] = [...(state.joined[me.persona.id] ?? []), prize.id];

    return {
      participationId: `PART-${Date.now()}`,
      prizeId: prize.id,
      entryFee: prize.entry,
      balanceAfter: check.balanceAfter,
    };
  },

  async submitClaim({ prizeId, details }) {
    await wait(1000);
    const me = currentUser();
    if (!me) throw new ApiError({ code: 'LOGIN_REQUIRED', status: 401 });
    if (!me.persona.winnings.includes(prizeId)) throw new ApiError({ code: 'CLAIM_NOT_ALLOWED', status: 403 });
    if (!details) throw new ApiError({ code: 'VALIDATION_ERROR', status: 400 });

    const key = `${me.persona.id}:${prizeId}`;
    state.claims[key] = { ...buildClaim(), status: CLAIM_STATUS.SUBMITTED, submittedAt: new Date().toISOString() };
    return state.claims[key];
  },
};

function buildClaim() {
  const announcedAt = state.timeline.endAt + WINNER_SELECTION_DELAY;
  return {
    status: state.claimStatus,
    deadline: new Date(
      state.claimStatus === CLAIM_STATUS.EXPIRED ? Date.now() - 24 * 60 * 60 * 1000 : announcedAt + CLAIM_WINDOW_MS,
    ).toISOString(),
  };
}
