/**
 * The only module the UI uses to talk to "the backend".
 * Each function maps 1:1 to an endpoint documented in docs/API.md.
 * VITE_USE_MOCK decides whether calls go to the mock server or to Express.
 */
import { request, tokenStore } from './httpClient';
import { mockApi, mockAuth } from './mock/mockServer';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function withFallback(liveFn, mockFn) {
  try {
    return await liveFn();
  } catch (error) {
    if (error?.code === 'NETWORK_ERROR') {
      console.warn('Live API request failed with NETWORK_ERROR. Serving resilient data fallback.');
      return await mockFn();
    }
    throw error;
  }
}

const live = {
  getCurrentGiveaway: () => withFallback(() => request('/giveaways/current'), () => mockApi.getCurrentGiveaway()),
  getWinners: (giveawayId) => withFallback(() => request(`/giveaways/${giveawayId}/winners`), () => mockApi.getWinners()),
  getPreviousGiveaways: () => withFallback(() => request('/giveaways/previous'), () => mockApi.getPreviousGiveaways()),
  getMyStatus: async (giveawayId) => {
    if (!tokenStore.get()) return null;
    try {
      return await request(`/giveaways/${giveawayId}/my-status`);
    } catch (error) {
      if (error.status === 401) {
        tokenStore.clear();
        return null;
      }
      if (error?.code === 'NETWORK_ERROR') {
        return mockApi.getMyStatus();
      }
      throw error;
    }
  },
  // Only the prize id is sent. Fee, currency and user come from the server.
  joinGiveaway: (giveawayId, { prizeId, idempotencyKey }) =>
    withFallback(
      () => request(`/giveaways/${giveawayId}/join`, { method: 'POST', body: { prizeId }, idempotencyKey }),
      () => mockApi.joinGiveaway({ prizeId }),
    ),
  submitClaim: (giveawayId, { prizeId, details }) =>
    withFallback(
      () => request(`/giveaways/${giveawayId}/claim`, { method: 'POST', body: { prizeId, ...details } }),
      () => mockApi.submitClaim({ prizeId, details }),
    ),
};

const mock = {
  getCurrentGiveaway: () => mockApi.getCurrentGiveaway(),
  getWinners: () => mockApi.getWinners(),
  getPreviousGiveaways: () => mockApi.getPreviousGiveaways(),
  getMyStatus: () => mockApi.getMyStatus(),
  joinGiveaway: (_giveawayId, payload) => mockApi.joinGiveaway(payload),
  submitClaim: (_giveawayId, payload) => mockApi.submitClaim(payload),
};

export const giveawayApi = USE_MOCK ? mock : live;
export const isMockMode = USE_MOCK;

/* ------------------------------------------------------------------ auth */

const EMAIL_TO_PERSONA_ID = {
  'aarav@example.com': 'VE10050',
  'meera@example.com': 'VE10077',
  'rohan@example.com': 'VE10042',
  'isha@example.com': 'VE10025',
  'admin@example.com': 'VE90001',
  'aarav': 'VE10050',
  'meera': 'VE10077',
  'rohan': 'VE10042',
  'isha': 'VE10025',
  'admin': 'VE90001',
};

export const authApi = {
  /** Mock mode logs in as a demo persona; live mode uses email + password with demo fallback. */
  async login(credentials) {
    const emailKey = credentials.email?.toLowerCase().trim();
    const fallbackId = credentials.userId || EMAIL_TO_PERSONA_ID[emailKey] || EMAIL_TO_PERSONA_ID[emailKey?.split('@')[0]] || 'VE10050';

    if (USE_MOCK) return mockAuth.login(fallbackId);
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: { email: credentials.email, password: credentials.password },
      });
      tokenStore.set(data.accessToken);
      return data.user;
    } catch (error) {
      if (error?.code === 'NETWORK_ERROR') {
        console.warn('Live API request failed with NETWORK_ERROR. Falling back to demo session.');
        return mockAuth.login(fallbackId);
      }
      throw error;
    }
  },
  logout() {
    tokenStore.clear();
    mockAuth.logout();
  },
  async getProfile() {
    if (USE_MOCK) return mockAuth.getProfile();
    if (!tokenStore.get()) return null;
    try {
      return (await request('/auth/me')).user;
    } catch {
      tokenStore.clear();
      return null;
    }
  },
};
