import { asyncHandler } from '../utils/asyncHandler.js';
import { getGiveawayOrThrow } from '../services/giveawayService.js';
import { getMyStatus, joinGiveaway } from '../services/participationService.js';

export const myStatus = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  res.json({ data: await getMyStatus({ user: req.user, giveaway }) });
});

export const join = asyncHandler(async (req, res) => {
  const giveaway = await getGiveawayOrThrow(req.params.id);
  const result = await joinGiveaway({
    user: req.user,
    giveaway,
    prizeId: req.body.prizeId,
    idempotencyKey: req.get('idempotency-key')?.slice(0, 80),
    deviceHash: req.signals.deviceHash,
    ipHash: req.signals.ipHash,
    requestId: req.requestId,
  });
  res.status(result.replayed ? 200 : 201).json({ data: result });
});
