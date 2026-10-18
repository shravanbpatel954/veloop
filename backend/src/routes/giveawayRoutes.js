import { Router } from 'express';
import { getCurrent, getOne, getPrevious } from '../controllers/giveawayController.js';

const router = Router();

// Static paths first, otherwise "/:id" would swallow them.
router.get('/current', getCurrent);
router.get('/previous', getPrevious);
router.get('/:id', getOne);

export default router;
