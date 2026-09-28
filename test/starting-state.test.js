import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localClient} from '../src/sdk.js';
import {createApp} from '../src/app.js';
test('reproduces the documented starting behavior with the real SDK TestData',async()=>{
 const {client}=await localClient();
 try {
  const handle=createApp(client);
  const result=await handle('/orders',{org:'beta-org'});
  assert.equal(result.source,'old');
 } finally {client.close();}
});
