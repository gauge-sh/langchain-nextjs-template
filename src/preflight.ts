import { readFileSync } from 'node:fs';
import { connect, context } from './sdk.js';
const manifest = JSON.parse(readFileSync('launchdarkly-fixture.json', 'utf8'));
let client;
try {
  client = await connect();
  const result = await client.variationDetail(manifest.configKey, context(manifest.standardOrganization), null);
  if (manifest.case === 'fallback') {
    if (result.reason.kind !== 'ERROR' || result.reason.errorKind !== 'FLAG_NOT_FOUND') throw new Error('Expected a confirmed nonexistent key');
  } else {
    if (result.reason.kind === 'ERROR' || !result.value?._ldMeta || (manifest.expectedEnabled && result.value._ldMeta.mode !== 'agent')) throw new Error('Expected a real agent-mode config');
    if (result.value._ldMeta.enabled !== manifest.expectedEnabled) throw new Error('Unexpected initial enabled state');
    if (manifest.expectedVariation && result.value._ldMeta.variationKey !== manifest.expectedVariation) throw new Error('Unexpected initial variation');
  }
  console.log(JSON.stringify({ status: 'SDK_PREFLIGHT_PASSED', case: manifest.case, configKey: manifest.configKey, controlPlaneVerified: false }));
} catch (error) {
  console.error(JSON.stringify({ status: 'ENVIRONMENT_BLOCKED', reason: error instanceof Error ? error.message : 'Preflight failed' }));
  process.exitCode = 2;
} finally { client?.close(); }
