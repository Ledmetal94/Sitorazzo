import { Redis } from '@upstash/redis';
import { renderMockup } from '../../templates/render.js';

let _redis = null;
function getRedis() {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    const err = new Error('KV/Upstash non configurato.');
    err.statusCode = 500;
    throw err;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function notFoundHtml() {
  return `<!DOCTYPE html>
<html lang="it"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="robots" content="noindex,nofollow">
  <title>Anteprima non trovata — Sitorazzo</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { margin:0; font-family:'Inter',sans-serif; background:#FAFAFA; color:#0A0A0A; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .card { max-width:520px; text-align:center; padding:48px 36px; background:#fff; border-radius:24px; box-shadow:0 12px 40px rgba(10,10,10,0.06); }
    h1 { font-family:'Space Grotesk',sans-serif; font-weight:900; font-size:32px; margin:0 0 12px; }
    p { font-size:15px; line-height:1.6; color:rgba(10,10,10,0.65); margin:0 0 28px; }
    a { display:inline-block; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; background:#FFD60A; color:#0A0A0A; padding:14px 24px; border-radius:12px; text-decoration:none; }
  </style>
</head><body>
  <div class="card">
    <h1>Anteprima non disponibile</h1>
    <p>Questa anteprima non esiste o è scaduta. Le anteprime restano attive per 30 giorni.</p>
    <a href="/mockup">Genera la tua anteprima gratis →</a>
  </div>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const id = req.query.id;
  if (!id || typeof id !== 'string' || !/^[A-Za-z0-9_-]{6,16}$/.test(id)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(notFoundHtml());
  }

  let record;
  try {
    const redis = getRedis();
    record = await redis.get(`mockup:${id}`);
  } catch (err) {
    console.error('Redis read error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(notFoundHtml());
  }

  if (!record) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(notFoundHtml());
  }

  // Defense in depth: verify required fields present
  if (!record.businessName || !record.industry) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(notFoundHtml());
  }

  // Ensure id is in record so renderer can use it for CTA UTM
  record.id = id;

  const html = renderMockup(record);

  // No caching on per-prospect mockups (they may update on Day 3 when AI copy lands)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=0, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(200).send(html);
}
