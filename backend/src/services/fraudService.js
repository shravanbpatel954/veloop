import { FraudEvent } from '../models/FraudEvent.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';

/**
 * Risk scoring for join attempts.
 *
 * No single signal is proof of fraud: weights are small on their own and only
 * add up when several point the same way. A shared IP is deliberately weak
 * because families, offices and campuses share networks.
 * The thresholds below are a proposal to be reviewed before production.
 */
export const SIGNAL_WEIGHTS = {
  SAME_DEVICE_OTHER_ACCOUNT: 40,
  RAPID_ATTEMPTS: 20,
  NEW_ACCOUNT: 15,
  SHARED_IP_MANY_ACCOUNTS: 10,
  PREVIOUS_BLOCKS: 25,
};

export function classify(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

/** Pure scoring step (easy to unit test): signals in, decision out. */
export function scoreSignals(signalNames) {
  const signals = signalNames.map((name) => ({ name, weight: SIGNAL_WEIGHTS[name] }));
  const riskScore = Math.min(signals.reduce((sum, s) => sum + s.weight, 0), 100);
  const level = classify(riskScore);
  // HIGH/CRITICAL are blocked outright (no charge, no entry). MEDIUM is allowed
  // but the entry is FLAGGED and excluded from the draw until reviewed.
  const action = level === 'HIGH' || level === 'CRITICAL' ? 'BLOCKED' : level === 'MEDIUM' ? 'FLAGGED' : 'ALLOWED';
  return { riskScore, level, action, signals };
}

export async function evaluateJoin({ user, giveaway, prizeId, deviceHash, ipHash }) {
  const names = [];
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const policy = giveaway.participationSettings?.sameDevicePolicy ?? 'flag';

  const [otherAccountOnDevice, recentEvents, previousBlocks, accountsOnIp] = await Promise.all([
    GiveawayParticipation.exists({ giveawayId: giveaway.giveawayId, prizeId, deviceHash, userId: { $ne: user.userId } }),
    FraudEvent.countDocuments({ userId: user.userId, createdAt: { $gte: oneMinuteAgo } }),
    FraudEvent.countDocuments({ userId: user.userId, action: 'BLOCKED' }),
    GiveawayParticipation.distinct('userId', { giveawayId: giveaway.giveawayId, ipHash, userId: { $ne: user.userId } }),
  ]);

  if (otherAccountOnDevice) names.push('SAME_DEVICE_OTHER_ACCOUNT');
  if (recentEvents >= 3) names.push('RAPID_ATTEMPTS');
  if (Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000) names.push('NEW_ACCOUNT');
  if (accountsOnIp.length >= 3) names.push('SHARED_IP_MANY_ACCOUNTS');
  if (previousBlocks >= 2) names.push('PREVIOUS_BLOCKS');

  const result = scoreSignals(names);
  // "block" policy escalates the same-device signal to a hard stop.
  if (policy === 'block' && names.includes('SAME_DEVICE_OTHER_ACCOUNT')) result.action = 'BLOCKED';
  return result;
}

export async function recordFraudEvent({ userId, giveawayId, prizeId, deviceHash, ipHash, result, reason }) {
  if (result.action === 'ALLOWED' && result.riskScore === 0) return; // nothing worth storing
  await FraudEvent.create({
    userId,
    giveawayId,
    prizeId,
    deviceHash,
    ipHash,
    riskScore: result.riskScore,
    level: result.level,
    reason,
    signals: result.signals,
    action: result.action,
  });
}
