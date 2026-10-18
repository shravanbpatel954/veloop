// HTTP-level checks that need no database: auth, validation and error shape.
process.env.MONGO_URI ??= 'mongodb://localhost/test';
process.env.JWT_SECRET ??= 'test-secret';

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const call = (path, options) => fetch(base + path, { headers: { 'Content-Type': 'application/json' }, ...options });

test('health check works', async () => {
  assert.equal((await call('/api/health')).status, 200);
});

test('joining without a token is rejected with LOGIN_REQUIRED', async () => {
  const res = await call('/api/giveaways/GW-1/join', { method: 'POST', body: JSON.stringify({ prizeId: 'PRIZE-001' }) });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error.code, 'LOGIN_REQUIRED');
});

test('claiming without a token is rejected', async () => {
  const res = await call('/api/giveaways/GW-1/claim', { method: 'POST', body: '{}' });
  assert.equal(res.status, 401);
});

test('admin routes are closed to anonymous callers', async () => {
  const res = await call('/api/admin/giveaways/GW-1/select-winners', { method: 'POST' });
  assert.equal(res.status, 401);
});

test('a forged token is not accepted', async () => {
  const res = await call('/api/giveaways/GW-1/my-status', { headers: { Authorization: 'Bearer not.a.jwt' } });
  assert.equal(res.status, 401);
});

test('unknown routes return a JSON 404', async () => {
  const res = await call('/api/nope');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, 'NOT_FOUND');
});

test('login validates its payload before touching the database', async () => {
  const res = await call('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'bad' }) });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'VALIDATION_ERROR');
});
