import formidable from 'formidable';
import fs from 'fs';
import { put } from '@vercel/blob';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { nanoid } from 'nanoid';
import Vibrant from 'node-vibrant';
import { inngest } from '../lib/inngest.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                            */
/* ------------------------------------------------------------------ */
const ALLOWED_INDUSTRIES = new Set([
  'ristoranti',
  'parrucchieri-estetiste',
  'artigiani',
  'professionisti',
  'generico',
]);

const ALLOWED_LOGO_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
]);

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MOCKUP_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Per-industry default colors (used when no logo provided)
const INDUSTRY_DEFAULT_COLORS = {
  'ristoranti':              { primary: '#C8102E', secondary: '#0A0A0A' }, // wine-red
  'parrucchieri-estetiste':  { primary: '#D4A574', secondary: '#3A2E2A' }, // warm-gold
  'artigiani':               { primary: '#1E5A8A', secondary: '#0A0A0A' }, // trade-blue
  'professionisti':          { primary: '#0F3A5C', secondary: '#0A0A0A' }, // navy
  'generico':                { primary: '#FFD60A', secondary: '#0A0A0A' }, // sitorazzo yellow
};

/* ------------------------------------------------------------------ */
/*  Redis + Ratelimit                                                   */
/* ------------------------------------------------------------------ */
let _redis = null;
let _ratelimit = null;

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

function getRatelimit() {
  if (_ratelimit) return _ratelimit;
  _ratelimit = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:mockup',
    analytics: false,
  });
  return _ratelimit;
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/* ------------------------------------------------------------------ */
/*  Color extraction                                                     */
/* ------------------------------------------------------------------ */
function pickReadableTextColor(hex) {
  // Returns '#fff' or '#0A0A0A' depending on luminance of bg.
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0A0A0A' : '#FFFFFF';
}

/* Convert any color reference (#rgb, #rrggbb, rgb(...)) to canonical #rrggbb. */
function normalizeHex(s) {
  if (!s) return null;
  s = s.trim().toLowerCase();
  if (s.startsWith('rgb')) {
    const m = s.match(/rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (!m) return null;
    const r = Math.min(255, parseInt(m[1]));
    const g = Math.min(255, parseInt(m[2]));
    const b = Math.min(255, parseInt(m[3]));
    return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
  }
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  }
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  return null;
}

/* Treat near-grayscale colors as "not a brand color" — skip them. */
function isUselessColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Skip near-grayscale (low saturation), pure white, or near-black
  return maxDiff < 25 || lum > 0.95 || lum < 0.06;
}

/**
 * Best-effort SVG color extraction via regex.
 * node-vibrant can't decode SVG, so we parse fill/stroke/stop-color references
 * and pick the most frequently used non-grayscale color.
 */
function extractColorsFromSvg(svgContent) {
  const counts = new Map();
  const attrPattern = /(?:fill|stroke|stop-color)\s*=\s*["']\s*([^"']+)["']/gi;
  const stylePattern = /(?:fill|stroke|stop-color)\s*:\s*([^;}"'\s]+)/gi;

  for (const pattern of [attrPattern, stylePattern]) {
    let m;
    while ((m = pattern.exec(svgContent)) !== null) {
      const hex = normalizeHex(m[1]);
      if (!hex || isUselessColor(hex)) continue;
      counts.set(hex, (counts.get(hex) || 0) + 1);
    }
  }

  if (counts.size === 0) return null;
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1]?.[0] || '#0A0A0A';
  return {
    primary,
    secondary,
    textOnPrimary: pickReadableTextColor(primary),
  };
}

/**
 * Returns { colors, source } where source is one of:
 *   'extracted-png' | 'extracted-svg' | 'svg-no-colors-found'
 *   | 'vibrant-no-swatch' | 'vibrant-error' | 'industry-default'
 * Always returns valid colors; falls back to industry default on any failure.
 */
async function extractColorsFromLogo(filepath, mimetype, industry) {
  const fallback = INDUSTRY_DEFAULT_COLORS[industry] || INDUSTRY_DEFAULT_COLORS.generico;

  if (mimetype === 'image/svg+xml') {
    try {
      const svg = fs.readFileSync(filepath, 'utf8');
      const colors = extractColorsFromSvg(svg);
      if (colors) {
        console.log(`[logo] svg extracted primary=${colors.primary}`);
        return { colors, source: 'extracted-svg' };
      }
      console.log('[logo] svg parsed but no usable colors found, using industry default');
      return { colors: fallback, source: 'svg-no-colors-found' };
    } catch (err) {
      console.error('[logo] svg parse error:', err.message);
      return { colors: fallback, source: 'svg-error' };
    }
  }

  try {
    const palette = await Vibrant.from(filepath).getPalette();
    const swatch =
      palette.Vibrant ||
      palette.DarkVibrant ||
      palette.Muted ||
      palette.LightVibrant ||
      palette.DarkMuted;
    if (!swatch) {
      console.log(`[logo] vibrant returned no swatch for ${mimetype}, using industry default`);
      return { colors: fallback, source: 'vibrant-no-swatch' };
    }
    const primary = swatch.hex;
    const secondaryHex = (palette.DarkMuted || palette.DarkVibrant || palette.Muted)?.hex || '#0A0A0A';
    console.log(`[logo] vibrant extracted primary=${primary}`);
    return {
      colors: {
        primary,
        secondary: secondaryHex,
        textOnPrimary: pickReadableTextColor(primary),
      },
      source: 'extracted-png',
    };
  } catch (err) {
    console.error('[logo] vibrant error:', err.message, err.stack?.split('\n')[1]?.trim());
    return { colors: fallback, source: 'vibrant-error', error: err.message };
  }
}

/* ------------------------------------------------------------------ */
/*  Validation                                                           */
/* ------------------------------------------------------------------ */
function strField(fields, key) {
  const v = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
  return typeof v === 'string' ? v.trim() : '';
}

function validateInput({ businessName, industry, email, whatsapp }) {
  if (!businessName || businessName.length < 2 || businessName.length > 80) {
    return 'Nome attività non valido.';
  }
  if (!ALLOWED_INDUSTRIES.has(industry)) {
    return 'Settore non valido.';
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) {
    return 'Email non valida.';
  }
  if (whatsapp && (whatsapp.length > 20 || !/^[+\d\s()-]{6,20}$/.test(whatsapp))) {
    return 'Numero WhatsApp non valido.';
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Handler                                                              */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse multipart
  // allowEmptyFiles + minFileSize=0 so an unfilled <input type="file"> doesn't
  // make the whole parse throw (browser submits it as a 0-byte file).
  const form = formidable({
    maxFileSize: MAX_LOGO_BYTES,
    maxTotalFileSize: MAX_LOGO_BYTES + 1024,
    multiples: false,
    allowEmptyFiles: true,
    minFileSize: 0,
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    console.error('Form parse error:', err);
    return res.status(400).json({ error: 'Errore nel parsing del form.' });
  }

  // Honeypot — silently accept bot traffic
  const honeypot = strField(fields, 'website');
  if (honeypot) {
    return res.status(200).json({ ok: true, id: 'hp', mockupUrl: '/' });
  }

  const businessName = strField(fields, 'businessName');
  const industry = strField(fields, 'industry');
  const email = strField(fields, 'email').toLowerCase();
  const whatsapp = strField(fields, 'whatsapp');
  const privacy = strField(fields, 'privacy');

  if (!privacy) {
    return res.status(400).json({ error: 'Devi accettare la privacy policy.' });
  }

  const validationError = validateInput({ businessName, industry, email, whatsapp });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Rate limit (3/hour per IP) — first line of bot defense after honeypot
  const clientIp = getClientIp(req);
  try {
    const rl = getRatelimit();
    const { success, reset } = await rl.limit(clientIp);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: `Troppe richieste. Riprova tra ${Math.ceil(retryAfter / 60)} minuti.`,
      });
    }
  } catch (err) {
    if (err.statusCode === 500) {
      console.error(err.message);
      return res.status(500).json({ error: 'Servizio temporaneamente non disponibile.' });
    }
    throw err;
  }

  // Logo handling
  const logoFile = Array.isArray(files.logo) ? files.logo[0] : files.logo;
  let logoUrl = null;
  let colors = INDUSTRY_DEFAULT_COLORS[industry];
  let colorsSource = 'no-logo';
  let colorExtractionError = null;
  let logoMimetype = null;
  let logoSize = null;
  let blobUploadStatus = null;

  if (logoFile && logoFile.size > 0) {
    logoMimetype = logoFile.mimetype;
    logoSize = logoFile.size;
    console.log(`[logo] received mimetype=${logoMimetype} size=${logoSize}`);

    if (!ALLOWED_LOGO_MIMES.has(logoFile.mimetype)) {
      return res.status(400).json({ error: 'Formato logo non supportato.' });
    }
    if (logoFile.size > MAX_LOGO_BYTES) {
      return res.status(400).json({ error: 'Logo troppo grande (max 5MB).' });
    }

    // Extract colors first (uses local temp file)
    const extraction = await extractColorsFromLogo(logoFile.filepath, logoFile.mimetype, industry);
    colors = extraction.colors;
    colorsSource = extraction.source;
    if (extraction.error) colorExtractionError = extraction.error;

    // Upload to Vercel Blob (best-effort — non-fatal if not configured)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const buffer = fs.readFileSync(logoFile.filepath);
        const ext = logoFile.mimetype.split('/')[1].replace('+xml', '');
        const blobKey = `mockups/logos/${nanoid()}.${ext}`;
        const blob = await put(blobKey, buffer, {
          access: 'public',
          contentType: logoFile.mimetype,
        });
        logoUrl = blob.url;
        blobUploadStatus = 'ok';
        console.log(`[blob] uploaded ${blobKey} → ${blob.url}`);
      } catch (err) {
        blobUploadStatus = 'error';
        console.error('[blob] upload error:', err.message);
        // Continue without logoUrl; we still have colors
      }
    } else {
      blobUploadStatus = 'token-missing';
      console.warn('[blob] BLOB_READ_WRITE_TOKEN not set — skipping logo upload.');
    }
  } else {
    console.log('[logo] no logo file in submission');
  }

  // Generate mockup id + record
  const id = nanoid(10);
  const now = Date.now();
  const record = {
    id,
    businessName,
    industry,
    email,
    whatsapp: whatsapp || null,
    logoUrl,
    logoMimetype,
    logoSize,
    blobUploadStatus,
    colors,
    colorsSource,
    colorExtractionError,
    template: industry, // matches industry by default; Day 2 may override
    copy: null,         // populated on Day 3
    status: 'pending',  // -> 'ready' once Day 3 renders + emails
    createdAt: now,
    expiresAt: now + MOCKUP_TTL_SECONDS * 1000,
    clientIp,
  };

  // Persist to KV
  try {
    const redis = getRedis();
    await redis.set(`mockup:${id}`, record, { ex: MOCKUP_TTL_SECONDS });
    // Lightweight email index (avoid duplicate generation harassment if needed later)
    await redis.sadd(`mockup:by-email:${email}`, id);
    await redis.expire(`mockup:by-email:${email}`, MOCKUP_TTL_SECONDS);
  } catch (err) {
    console.error('KV write error:', err);
    return res.status(500).json({ error: 'Errore salvataggio anteprima.' });
  }

  // Send Inngest event — triggers `process-mockup` function (AI copy + email).
  // Inngest handles retries, signing, and delivery; we just emit the event.
  // For local dev, run `npx inngest-cli@latest dev` alongside `vercel dev`.
  try {
    await inngest.send({
      name: 'mockup/created',
      data: { id, email },
    });
  } catch (err) {
    console.error('Inngest send error:', err);
    // Non-fatal: form succeeded; AI copy + email won't run for this mockup.
    // User can still access the mockup page via direct link (with industry-default copy).
  }

  return res.status(200).json({
    ok: true,
    id,
    mockupUrl: `/anteprima/${id}`,
    ready: false,
  });
}
