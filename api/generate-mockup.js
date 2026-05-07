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

async function extractColorsFromLogo(filepath, mimetype, industry) {
  // SVG isn't supported by node-vibrant — fall back to industry default
  if (mimetype === 'image/svg+xml') {
    return INDUSTRY_DEFAULT_COLORS[industry] || INDUSTRY_DEFAULT_COLORS.generico;
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
      return INDUSTRY_DEFAULT_COLORS[industry] || INDUSTRY_DEFAULT_COLORS.generico;
    }
    const primary = swatch.hex;
    const secondaryHex = (palette.DarkMuted || palette.DarkVibrant || palette.Muted)?.hex || '#0A0A0A';
    return {
      primary,
      secondary: secondaryHex,
      textOnPrimary: pickReadableTextColor(primary),
    };
  } catch (err) {
    console.error('Vibrant error:', err);
    return INDUSTRY_DEFAULT_COLORS[industry] || INDUSTRY_DEFAULT_COLORS.generico;
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
  const form = formidable({
    maxFileSize: MAX_LOGO_BYTES,
    maxTotalFileSize: MAX_LOGO_BYTES + 1024,
    multiples: false,
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

  if (logoFile && logoFile.size > 0) {
    if (!ALLOWED_LOGO_MIMES.has(logoFile.mimetype)) {
      return res.status(400).json({ error: 'Formato logo non supportato.' });
    }
    if (logoFile.size > MAX_LOGO_BYTES) {
      return res.status(400).json({ error: 'Logo troppo grande (max 5MB).' });
    }

    // Extract colors first (uses local temp file)
    colors = await extractColorsFromLogo(logoFile.filepath, logoFile.mimetype, industry);

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
      } catch (err) {
        console.error('Blob upload error:', err);
        // Continue without logoUrl; we still have colors
      }
    } else {
      console.warn('BLOB_READ_WRITE_TOKEN not set — skipping logo upload.');
    }
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
    colors,
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
