import rateLimit from 'express-rate-limit';
import { ERROR_STATUS } from '../utils/errors.js';

const build = ({ windowMs, max }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Per user when signed in, otherwise per IP.
    keyGenerator: (req) => req.user?.userId ?? req.ip,
    handler: (_req, res) =>
      res.status(ERROR_STATUS.RATE_LIMITED).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a minute and try again.' } }),
  });

export const joinLimiter = build({ windowMs: 60_000, max: 10 });
export const claimLimiter = build({ windowMs: 60_000, max: 5 });
export const loginLimiter = build({ windowMs: 15 * 60_000, max: 10 });
export const apiLimiter = build({ windowMs: 60_000, max: 240 });
