import http from 'node:http';

export const createServer = () => http.createServer(async (req, res) => {
  const send = (code, body) => {
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  if (req.method === 'GET' && req.url === '/health') return send(200, { ok: true });
  if (req.method === 'POST' && req.url === '/echo') {
    let text = '';
    for await (const chunk of req) {
      text += chunk;
      if (text.length > 8192) return send(413, { error: 'payload too large' });
    }
    try { return send(200, { data: JSON.parse(text) }); }
    catch { return send(400, { error: 'invalid JSON' }); }
  }
  return send(404, { error: 'not found' });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(Number(process.env.PORT || 3000));
}
