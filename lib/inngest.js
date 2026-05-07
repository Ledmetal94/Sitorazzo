import { Inngest, NonRetriableError } from 'inngest';
import { Redis } from '@upstash/redis';
import { generateMockupCopy } from './anthropic.js';
import { sendMockupReadyEmail } from './email.js';

/* ------------------------------------------------------------------ */
/*  Client                                                                */
/* ------------------------------------------------------------------ */
export const inngest = new Inngest({
  id: 'sitorazzo',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                               */
/* ------------------------------------------------------------------ */
let _redis = null;
function getRedis() {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis non configurato');
  _redis = new Redis({ url, token });
  return _redis;
}

const SITE_URL = process.env.SITE_URL || 'https://sitorazzo.it';

/* ------------------------------------------------------------------ */
/*  Function: process-mockup                                              */
/*  Triggered by event "mockup/created" with data { id }                  */
/* ------------------------------------------------------------------ */
export const processMockup = inngest.createFunction(
  {
    id: 'process-mockup',
    name: 'Process mockup',
    retries: 3,
    // 1 concurrency at a time per email — gentle on Resend & avoid duplicate sends
    concurrency: { key: 'event.data.email', limit: 1 },
  },
  { event: 'mockup/created' },
  async ({ event, step, logger }) => {
    const { id } = event.data;
    if (!id || !/^[A-Za-z0-9_-]{6,16}$/.test(id)) {
      throw new NonRetriableError(`Invalid mockup id: ${id}`);
    }

    /* Step 1: fetch + idempotency check */
    const record = await step.run('fetch-record', async () => {
      const r = await getRedis().get(`mockup:${id}`);
      if (!r) throw new NonRetriableError(`Mockup ${id} not found`);
      return r;
    });

    if (record.status === 'ready') {
      logger.info(`[mockup:${id}] already ready, skipping`);
      return { skipped: 'already-ready', id };
    }

    /* Step 2: AI copy (best-effort — null on failure, render falls back to industry default) */
    const copyResult = await step.run('generate-copy', async () => {
      try {
        const result = await generateMockupCopy({
          businessName: record.businessName,
          industry: record.industry,
        });
        return { copy: result.copy, usage: result.usage };
      } catch (err) {
        logger.warn(`[mockup:${id}] copy generation failed: ${err.message}`);
        return { copy: null, usage: null, error: err.message };
      }
    });

    /* Step 3: persist updated record (idempotent — same data on retry) */
    await step.run('persist-record', async () => {
      const updated = {
        ...record,
        copy: copyResult.copy,
        copyUsage: copyResult.usage,
        copyError: copyResult.error || null,
        status: 'ready',
        readyAt: Date.now(),
      };
      const ttl = Math.max(60, Math.floor((record.expiresAt - Date.now()) / 1000));
      await getRedis().set(`mockup:${id}`, updated, { ex: ttl });
    });

    /* Step 4: email (retries on transient Resend failures via function-level retries) */
    const mockupUrl = `${SITE_URL}/anteprima/${id}?utm_source=email&utm_medium=transactional&utm_campaign=mockup_ready`;
    await step.run('send-email', async () => {
      await sendMockupReadyEmail({
        to: record.email,
        businessName: record.businessName,
        mockupUrl,
        primary: record.colors?.primary,
        textOnPrimary: record.colors?.textOnPrimary,
      });
    });

    return { ok: true, id, copyGenerated: !!copyResult.copy };
  }
);
