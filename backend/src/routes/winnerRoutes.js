import { Router } from 'express';
import { winners } from '../controllers/winnerController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public, but personalised (isCurrentUser) when a valid token is sent.
router.get('/:id/winners', optionalAuth, winners);

export default router;
