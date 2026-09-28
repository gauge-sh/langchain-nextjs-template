import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeServer } from '../src/server.js';
test('starter serves support requests, local tools, and chat over HTTP', async () => {
  const server = makeServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await (await fetch(`${base}/request?org=beta-org&tool=lookup_order`)).json();
    assert.equal(response.org, 'beta-org');
    assert.equal(response.providerRequests.length, 1);
    assert.equal(response.handlerCalls[0].name, 'lookup_order');
    assert.equal(response.response.toolResult.status, 'shipped');
    assert.equal((await (await fetch(`${base}/chat`)).json()).response.available, true);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
