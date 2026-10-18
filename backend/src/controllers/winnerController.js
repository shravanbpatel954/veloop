import { asyncHandler } from '../utils/asyncHandler.js';
import { getGiveawayOrThrow } from '../services/giveawayService.js';
import { getWinnersPayload } from '../services/winnerService.js';

export const winners = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  res.json({ data: await getWinnersPayload({ giveaway, viewerId: req.user?.userId }) });
});
