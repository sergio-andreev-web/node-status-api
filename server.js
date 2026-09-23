import http from 'node:http';
import { TaskStore } from './store.js';
import { resources } from './src/resources/index.js';

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 16_384) throw Object.assign(new Error('payload too large'), { status: 413 });
  }
  try { return JSON.parse(raw); }
  catch { throw Object.assign(new Error('invalid JSON'), { status: 400 }); }
}

export function createServer(store = new TaskStore()) {
  return http.createServer(async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      res.end(status === 204 ? undefined : JSON.stringify(body));
    };
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') return send(200, { ok: true });
      if (req.method === 'GET' && url.pathname === '/stats') return send(200, store.stats());
      if (req.method === 'POST' && url.pathname === '/echo') return send(200, { data: await readBody(req) });
      if (url.pathname === '/tasks') {
        if (req.method === 'GET') {
          const query = Object.fromEntries(url.searchParams);
          return send(200, store.list({ ...query, limit: query.limit ? Number(query.limit) : 50, offset: query.offset ? Number(query.offset) : 0 }));
        }
        if (req.method === 'POST') return send(201, store.create(await readBody(req)));
      }
      const apiMatch = /^\/api\/([a-zA-Z]+)(?:\/([a-f0-9-]+))?$/.exec(url.pathname);
      if (apiMatch) {
        const repository = resources[apiMatch[1]];
        if (!repository) return send(404, { error: 'unknown resource' });
        const id = apiMatch[2];
        if (!id && req.method === 'GET') {
          const query = Object.fromEntries(url.searchParams);
          return send(200, repository.list({ search: query.search ?? '', archived: query.archived === 'true', limit: query.limit ? Number(query.limit) : 50, offset: query.offset ? Number(query.offset) : 0 }));
        }
        if (!id && req.method === 'POST') return send(201, repository.create(await readBody(req)));
        if (id && req.method === 'GET') return repository.get(id) ? send(200, repository.get(id)) : send(404, { error: 'not found' });
        if (id && req.method === 'PATCH') {
          const record = repository.update(id, await readBody(req));
          return record ? send(200, record) : send(404, { error: 'not found' });
        }
        if (id && req.method === 'DELETE') return repository.delete(id) ? send(204) : send(404, { error: 'not found' });
      }
      const match = /^\/tasks\/([a-f0-9-]+)$/.exec(url.pathname);
      if (match) {
        const id = match[1];
        if (req.method === 'GET') return store.get(id) ? send(200, store.get(id)) : send(404, { error: 'not found' });
        if (req.method === 'PATCH') {
          const item = store.update(id, await readBody(req));
          return item ? send(200, item) : send(404, { error: 'not found' });
        }
        if (req.method === 'DELETE') return store.delete(id) ? send(204) : send(404, { error: 'not found' });
      }
      return send(404, { error: 'not found' });
    } catch (error) {
      const status = error.status ?? (error instanceof RangeError || error instanceof TypeError ? 422 : 500);
      return send(status, { error: status === 500 ? 'internal error' : error.message });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, () => console.log(`Listening on http://localhost:${port}`));
}
