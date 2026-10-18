import { asyncHandler } from '../utils/asyncHandler.js';
import { getGiveawayOrThrow } from '../services/giveawayService.js';
import { getMyClaim, submitClaim } from '../services/claimService.js';

export const claim = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  // req.body is validated against the prize's own schema inside the service.
  const result = await submitClaim({ user: req.user, giveaway, body: req.body, requestId: req.requestId });
  res.status(201).json({ data: result });
});

export const myClaim = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  res.json({ data: await getMyClaim({ user: req.user, giveaway }) });
});
