import crypto from 'node:crypto';
import { env } from '../config/env.js';

/** One-way, keyed hash. We keep abuse signals, not raw device or IP data. */
export const hashSignal = (value) =>
  crypto.createHmac('sha256', env.deviceHashSecret).update(String(value ?? 'unknown')).digest('hex');

export const deviceHashFromRequest = (req) => hashSignal(`${req.get('x-device-id') ?? 'none'}|${req.get('user-agent') ?? ''}`);
export const ipHashFromRequest = (req) => hashSignal(req.ip);

export const newId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

/** Fisher-Yates shuffle driven by crypto.randomInt (unbiased, server-side only). */
export function secureShuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(key, 'hex'));
}
