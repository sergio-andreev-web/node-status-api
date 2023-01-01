import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from './server.js';

test('health and echo', async () => {
  const server = createServer().listen(0);
  await once(server, 'listening');
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.deepEqual(await (await fetch(base + '/health')).json(), { ok: true });
    const response = await fetch(base + '/echo', { method: 'POST', body: '{"hello":"world"}' });
    assert.deepEqual(await response.json(), { data: { hello: 'world' } });
  } finally { server.close(); }
});
