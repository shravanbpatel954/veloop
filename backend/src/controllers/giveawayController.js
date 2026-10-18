import { asyncHandler } from '../utils/asyncHandler.js';
import { getCurrentPayload, getGiveawayOrThrow, getPreviousPayload, serializeGiveaway } from '../services/giveawayService.js';

export const getCurrent = asyncHandler(async (_req, res) => {
  res.json({ data: await getCurrentPayload() });
});

export const getPrevious = asyncHandler(async (_req, res) => {
  res.json({ data: await getPreviousPayload() });
});

export const getOne = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  res.json({ data: { giveaway: await serializeGiveaway(giveaway), serverTime: new Date() } });
});
