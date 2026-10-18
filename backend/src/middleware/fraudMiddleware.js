import crypto from 'node:crypto';
import { deviceHashFromRequest, ipHashFromRequest } from '../utils/crypto.js';

/**
 * Attaches the request id and the hashed abuse signals the join flow needs.
 * Raw device ids and IPs are never stored, only keyed hashes.
 */
export function attachRequestContext(req, res, next) {
  req.requestId = req.get('x-request-id') ?? crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}

export function attachFraudSignals(req, _res, next) {
  req.signals = { deviceHash: deviceHashFromRequest(req), ipHash: ipHashFromRequest(req) };
  next();
}
