import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { loginSchema } from '../validators/schemas.js';

const router = Router();

router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
