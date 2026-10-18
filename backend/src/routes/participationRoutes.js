import { Router } from 'express';
import { join, myStatus } from '../controllers/participationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { attachFraudSignals } from '../middleware/fraudMiddleware.js';
import { joinLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { joinSchema } from '../validators/schemas.js';

const router = Router();

router.get('/:id/my-status', requireAuth, myStatus);
router.post('/:id/join', requireAuth, joinLimiter, attachFraudSignals, validateBody(joinSchema), join);

export default router;
