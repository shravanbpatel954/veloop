import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function resolveUser(req) {
  const header = req.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ['HS256'] });
    const user = await User.findOne({ userId: payload.sub, status: 'active' }).lean();
    return user ?? null;
  } catch {
    return null;
  }
}

/** Identity ALWAYS comes from the verified token, never from body, query or params. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const user = await resolveUser(req);
  if (!user) throw new AppError('LOGIN_REQUIRED', 'Please log in');
  req.user = user;
  next();
});

/** For public endpoints that personalise when a valid token is present. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUser(req);
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new AppError('FORBIDDEN', 'Admin access required'));
  return next();
};

export const signAccessToken = (user) => jwt.sign({ sub: user.userId, role: user.role }, env.jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });
