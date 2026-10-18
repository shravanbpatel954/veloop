import { Router } from 'express';
import { claim, myClaim } from '../controllers/claimController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { claimLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/:id/claim', requireAuth, claimLimiter, claim);
router.get('/:id/my-claim', requireAuth, myClaim);

export default router;
