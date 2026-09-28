import { test } from 'node:test';
import assert from 'node:assert/strict';
import { init, TestData } from '@launchdarkly/node-server-sdk';
import { initAi } from '@launchdarkly/server-sdk-ai';
import { RecordingProvider } from '../src/provider.js';

test('fixture SDK evaluates agent configs, observes updates and tracks attributed usage locally', async () => {
  const td = new TestData();
  const value = (model: string) => ({ instructions: 'Help with test orders.', model: { name: model }, provider: { name: 'fixture' }, tools: { lookup_order: { name: 'lookup_order' } }, _ldMeta: { enabled: true, mode: 'agent', variationKey: model, version: 1 } });
  await td.update(td.flag('fixture').variations(value('baseline'), value('candidate')).variationForAll(0));
  const client = init('local-test-only', { updateProcessor: td.getFactory(), sendEvents: false });
  try {
    await client.waitForInitialization({ timeout: 5 });
    const events: { key: string; data: unknown; metric?: number }[] = [];
    const track = client.track.bind(client);
    client.track = (key, ctx, data, metric) => { events.push({ key, data, metric }); track(key, ctx, data, metric); };
    const ai = initAi(client);
    const ctx = { kind: 'organization', key: 'standard-org' };
    const first = await ai.agentConfig('fixture', ctx, { enabled: false });
    assert.equal(first.model?.name, 'baseline');
    assert.ok(first.tools?.lookup_order);
    await td.update(td.flag('fixture').variationForAll(1));
    const second = await ai.agentConfig('fixture', ctx, { enabled: false });
    assert.equal(second.model?.name, 'candidate');
    const tracker = second.createTracker();
    tracker.trackTokens({ input: 11, output: 7, total: 18 });
    assert.ok(events.length > 0);
    assert.equal(tracker.getTrackData().configKey, 'fixture');
    assert.equal(tracker.getTrackData().variationKey, 'candidate');
    const missing = await ai.agentConfig('missing', ctx, { enabled: false });
    assert.equal(missing.enabled, false);
  } finally { client.close(); }
});

test('recording provider and handlers never call an external model or refund service', () => {
  const provider = new RecordingProvider();
  assert.deepEqual(provider.invoke({ instructions: 'test', model: 'fixture' }).usage, { input: 11, output: 7, total: 18 });
  assert.equal(provider.requests.length, 1);
  assert.throws(() => provider.dispatch('refund_order', { orderId: 'real-order' }));
  assert.deepEqual(provider.handlerCalls, {});
});
