// Pure-logic tests: no database needed.   Run with: npm test
process.env.MONGO_URI ??= 'mongodb://localhost/test';
process.env.JWT_SECRET ??= 'test-secret';

import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, scoreSignals } from '../src/services/fraudService.js';
import { effectiveStatus, winnersStatus } from '../src/utils/giveawayStatus.js';
import { maskUserId } from '../src/utils/mask.js';
import { secureShuffle } from '../src/utils/crypto.js';
import { insufficientBalanceCode } from '../src/utils/errors.js';
import { claimSchemaFor, joinSchema } from '../src/validators/schemas.js';

test('risk levels follow the documented bands', () => {
  assert.equal(classify(0), 'LOW');
  assert.equal(classify(29), 'LOW');
  assert.equal(classify(30), 'MEDIUM');
  assert.equal(classify(60), 'HIGH');
  assert.equal(classify(80), 'CRITICAL');
});

test('one weak signal never blocks; several strong ones do', () => {
  assert.equal(scoreSignals(['SHARED_IP_MANY_ACCOUNTS']).action, 'ALLOWED');
  assert.equal(scoreSignals(['SAME_DEVICE_OTHER_ACCOUNT']).action, 'FLAGGED');
  assert.equal(scoreSignals(['SAME_DEVICE_OTHER_ACCOUNT', 'RAPID_ATTEMPTS']).action, 'BLOCKED');
});

test('giveaway status is derived from the clock, not stored state', () => {
  const g = { status: 'ACTIVE', startAt: new Date('2026-01-10'), endAt: new Date('2026-01-20') };
  assert.equal(effectiveStatus(g, new Date('2026-01-05')), 'UPCOMING');
  assert.equal(effectiveStatus(g, new Date('2026-01-15')), 'ACTIVE');
  assert.equal(effectiveStatus(g, new Date('2026-01-21')), 'ENDED'); // even though stored status says ACTIVE
  assert.equal(effectiveStatus({ ...g, status: 'ARCHIVED' }, new Date('2026-01-15')), 'ARCHIVED');
});

test('winners are pending until announced', () => {
  assert.equal(winnersStatus({}, 'ACTIVE'), 'PENDING');
  assert.equal(winnersStatus({ winnersAnnouncedAt: null }, 'ENDED'), 'SELECTING');
  assert.equal(winnersStatus({ winnersAnnouncedAt: new Date() }, 'ENDED'), 'ANNOUNCED');
});

test('user ids are masked', () => {
  assert.equal(maskUserId('VE10025'), 'VE****25');
  assert.equal(maskUserId('x'), '****');
});

test('shuffle keeps every item exactly once', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.deepEqual([...secureShuffle(input)].sort(), input);
});

test('error code names match the currency', () => {
  assert.equal(insufficientBalanceCode('SVE'), 'INSUFFICIENT_SVE_BALANCE');
});

test('join payload drops client-supplied money fields', () => {
  const parsed = joinSchema.parse({ prizeId: 'PRIZE-001', amount: 1, currency: 'TOKEN', userId: 'VE99999' });
  assert.deepEqual(parsed, { prizeId: 'PRIZE-001' });
});

test('claim schema is chosen by prize claimType, not by the client', () => {
  const email = claimSchemaFor('EMAIL');
  assert.ok(email.safeParse({ prizeId: 'PRIZE-004', email: 'a@b.com' }).success);
  assert.ok(!email.safeParse({ prizeId: 'PRIZE-004', fullName: 'x' }).success);
  const address = claimSchemaFor('ADDRESS');
  assert.ok(!address.safeParse({ prizeId: 'PRIZE-001', fullName: 'Isha Rao', phone: '123', address: 'short', city: 'M', state: 'M', pinCode: '1' }).success);
  assert.ok(address.safeParse({ prizeId: 'PRIZE-001', fullName: 'Isha Rao', phone: '9876543210', address: '12 MG Road Andheri', city: 'Mumbai', state: 'Maharashtra', pinCode: '400001' }).success);
});
