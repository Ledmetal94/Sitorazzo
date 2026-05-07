import { serve } from 'inngest/next';
import { inngest, processMockup } from '../lib/inngest.js';

// Inngest serve endpoint. Discovers and dispatches functions when Inngest pings.
// Inngest dashboard must be configured to point at https://sitorazzo.it/api/inngest
// (or the local dev URL when running `npx inngest-cli@latest dev`).
const handler = serve({
  client: inngest,
  functions: [processMockup],
  signingKey: process.env.INNGEST_SIGNING_KEY, // verifies incoming webhooks
});

export default handler;
