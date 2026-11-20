const http = require('http');
const PORT = process.env.PORT || 10000;
const BASE = (process.env.PREMIUM_BASE_URL || 'https://api.vilao.ai/v1').replace(/\/$/, '');
const KEY = process.env.PREMIUM_API_KEY || '';
const MODEL = process.env.PREMIUM_MODEL || 'occ/claude-haiku-5-5';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) return send(200, { ok: true });

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', (d) => { body += d; if (body.length > 1000000) req.destroy(); });
    req.on('end', async () => {
      try {
        const j = JSON.parse(body || '{}');
        const payload = {
          model: j.model || MODEL,
          messages: j.messages || [],
          temperature: j.temperature,
          max_tokens: j.max_tokens,
          response_format: j.response_format,
        };
        const r = await fetch(BASE + '/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({ error: { message: 'Upstream non-JSON response', status: r.status } }));
        return send(r.status, data);
      } catch (e) {
        return send(502, { error: { message: String(e).slice(0, 200) } });
      }
    });
    return;
  }
  return send(404, { error: { message: 'Not found' } });
});
server.listen(PORT, () => console.log('premium proxy listening on', PORT));
