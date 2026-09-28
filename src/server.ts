import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { connect, instrument } from './sdk.js';
import { RecordingProvider } from './provider.js';
import { respond } from './task.js';
const manifest = JSON.parse(readFileSync('launchdarkly-fixture.json', 'utf8'));
const client = await connect();
const { events, evaluate } = instrument(client);
const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (url.pathname !== '/request' || req.method !== 'GET') { res.writeHead(404); res.end('{}'); return; }
  const org = url.searchParams.get('org') ?? manifest.standardOrganization;
  if (![manifest.betaOrganization, manifest.standardOrganization].includes(org)) { res.writeHead(400); res.end('{"error":"Unknown test organization"}'); return; }
  try {
    const provider = new RecordingProvider();
    const offset = events.length;
    const config = await evaluate(manifest.configKey, org);
    const response = respond(config, provider, manifest.requestTool);
    await client.flush();
    res.end(JSON.stringify({ pid: process.pid, org, config: { key: config.key, enabled: config.enabled, instructions: config.instructions, model: config.model, tools: config.tools }, response, providerRequests: provider.requests, handlerCalls: provider.handlerCalls, trackingEvents: events.slice(offset) }));
  } catch { res.writeHead(500); res.end('{"error":"Request failed; inspect test configuration"}'); }
});
server.listen(3000, '127.0.0.1', () => console.log(JSON.stringify({ listening: 'http://127.0.0.1:3000', pid: process.pid })));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { server.close(); client.close(); });
