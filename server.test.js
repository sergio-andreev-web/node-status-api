import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from './server.js';

async function withServer(run) {
  const server = createServer().listen(0);
  await once(server, 'listening');
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { server.close(); }
}

async function request(base, path, method = 'GET', body) {
  const response = await fetch(base + path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return [response.status, response.status === 204 ? null : await response.json()];
}

test('health and echo', () => withServer(async base => {
  assert.deepEqual((await request(base, '/health'))[1], { ok: true });
  assert.deepEqual((await request(base, '/echo', 'POST', { hello: 'world' }))[1], { data: { hello: 'world' } });
}));

test('task lifecycle, filters and stats', () => withServer(async base => {
  const [createdStatus, first] = await request(base, '/tasks', 'POST', { title: '  Ship release  ', priority: 'high' });
  assert.equal(createdStatus, 201);
  assert.equal(first.title, 'Ship release');
  await request(base, '/tasks', 'POST', { title: 'Write notes', priority: 'low' });
  assert.equal((await request(base, '/tasks?priority=high'))[1].total, 1);
  assert.equal((await request(base, '/tasks?search=notes'))[1].total, 1);
  assert.equal((await request(base, '/tasks?limit=1&offset=1'))[1].items.length, 1);
  assert.equal((await request(base, `/tasks/${first.id}`, 'PATCH', { done: true }))[1].done, true);
  assert.deepEqual((await request(base, '/stats'))[1], { total: 2, open: 1, done: 1 });
  assert.equal((await request(base, `/tasks/${first.id}`, 'DELETE'))[0], 204);
  assert.equal((await request(base, `/tasks/${first.id}`))[0], 404);
}));

test('invalid JSON, fields and query are rejected', () => withServer(async base => {
  assert.equal((await request(base, '/tasks', 'POST', {}))[0], 422);
  assert.equal((await request(base, '/tasks', 'POST', { title: 'x', priority: 'urgent' }))[0], 422);
  assert.equal((await request(base, '/tasks?limit=999'))[0], 422);
  assert.equal((await fetch(base + '/echo', { method: 'POST', body: '{' })).status, 400);
}));
