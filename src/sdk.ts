import { init, basicLogger, type LDClient, type LDContext } from '@launchdarkly/node-server-sdk';
import { initAi } from '@launchdarkly/server-sdk-ai';
import { fallback } from './task.js';
export const context = (key: string): LDContext => ({ kind: 'organization', key });
export async function connect() {
  const key = process.env.LAUNCHDARKLY_SDK_KEY;
  if (!key) throw new Error('ENVIRONMENT_BLOCKED: LAUNCHDARKLY_SDK_KEY is missing');
  const client = init(key, { logger: basicLogger({ level: 'error' }) });
  try { await client.waitForInitialization({ timeout: 15 }); }
  catch { client.close(); throw new Error('ENVIRONMENT_BLOCKED: SDK initialization failed; check credential and network'); }
  return client;
}
export function instrument(client: LDClient) {
  const events: unknown[] = [];
  const original = client.track.bind(client);
  client.track = (key, ctx, data, metricValue) => {
    events.push({ key, data, metricValue });
    original(key, ctx, data, metricValue);
  };
  const ai = initAi(client);
  return { events, evaluate: (key: string, org: string) => ai.agentConfig(key, context(org), fallback) };
}
