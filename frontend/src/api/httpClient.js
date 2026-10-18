/**
 * Thin fetch wrapper used when VITE_USE_MOCK=false.
 * - attaches the access token and a pseudonymous device id
 * - turns API error payloads into ApiError objects with a stable `code`
 */
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`;
const TOKEN_KEY = 'veloop_token';
const DEVICE_KEY = 'veloop_device_id';

export class ApiError extends Error {
  constructor({ code = 'UNKNOWN', status = 0, message = '', details } = {}) {
    super(message || code);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Random id kept in the browser. The backend hashes it; it is an abuse signal, not an identity. */
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export async function request(path, { method = 'GET', body, idempotencyKey } = {}) {
  const headers = { 'Content-Type': 'application/json', 'X-Device-Id': getDeviceId() };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({ code: 'NETWORK_ERROR' });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError({
      code: payload?.error?.code ?? 'UNKNOWN',
      status: response.status,
      message: payload?.error?.message,
      details: payload?.error?.details,
    });
  }
  return payload.data;
}
