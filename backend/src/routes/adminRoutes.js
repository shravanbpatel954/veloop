import { Router } from 'express';
import { archive, claims, clearFlag, create, draw, participations, updateClaimStatus } from '../controllers/adminGiveawayController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { claimStatusSchema, createGiveawaySchema } from '../validators/schemas.js';

const router = Router();

// Every admin route needs: authentication + admin role (+ validation where there is a body).
router.use(requireAuth, requireAdmin);

router.post('/giveaways', validateBody(createGiveawaySchema), create);
router.post('/giveaways/:id/archive', archive);
router.post('/giveaways/:id/select-winners', draw);
router.get('/giveaways/:id/participations', participations);
router.post('/participations/:participationId/clear-flag', clearFlag);
router.get('/giveaways/:id/claims', claims);
router.patch('/claims/:claimId', validateBody(claimStatusSchema), updateClaimStatus);

export default router;
