import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { User } from '../models/User.js';
import { signAccessToken } from '../middleware/authMiddleware.js';
import { verifyPassword } from '../utils/crypto.js';

/**
 * Development login. Replace with VELOOP's real authentication when integrating;
 * the rest of the giveaway code only needs `req.user` from authMiddleware.
 */
export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email, status: 'active' }).select('+passwordHash');
  // Same error for "no such user" and "wrong password" so accounts can't be enumerated.
  if (!user || !verifyPassword(req.body.password, user.passwordHash)) throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password');
  res.json({ data: { accessToken: signAccessToken(user), user: { id: user.userId, displayName: user.displayName } } });
});

export const me = (req, res) => res.json({ data: { user: { id: req.user.userId, displayName: req.user.displayName } } });
