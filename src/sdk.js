import { init, TestData, basicLogger } from '@launchdarkly/node-server-sdk';
import { readFileSync } from 'node:fs';
const resources = JSON.parse(readFileSync(new URL('../resources.json', import.meta.url)));
export async function localClient() {
  const td = new TestData();
  for (const f of resources.localFlags) {
    let b = td.flag(f.key).variations(...f.values).variationForAll(f.initial);
    if (f.betaIndex !== undefined) b = b.variationForContext('organization', 'beta-org', f.betaIndex);
    await td.update(b);
  }
  const client = init('fixture-local-only', { updateProcessor: td.getFactory(), sendEvents: false, diagnosticOptOut: true, logger: basicLogger({level:'error'}) });
  await client.waitForInitialization({timeout:5});
  return {client,td};
}
export async function connect() {
  if (process.env.LD_TEST_DATA === '1') return (await localClient()).client;
  const key = process.env.LAUNCHDARKLY_SDK_KEY;
  if (!key) throw new Error('LaunchDarkly SDK credential unavailable');
  const client = init(key, {offline: process.env.LD_FORCE_OFFLINE === '1', logger:basicLogger({level:'error'})});
  try { await client.waitForInitialization({timeout:5}); }
  catch { client.close(); throw new Error('LaunchDarkly initialization failed'); }
  return client;
}
