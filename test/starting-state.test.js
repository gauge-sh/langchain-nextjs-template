import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localClient} from '../src/sdk.js';
import {createApp} from '../src/app.js';
test('reproduces the documented starting behavior with the real SDK TestData',async()=>{
 const {client}=await localClient();
 try {
  const handle=createApp(client);
  const result=await handle('/checkout',{org:'beta-org'});
  assert.equal(result.completed,true);
 } finally {client.close();}
});
test('checkout success/failure is observable before adding completion tracking',async()=>{
 const {client}=await localClient();const events=[];client.track=(...args)=>events.push(args);
 try {const handle=createApp(client);assert.equal((await handle('/checkout',{fail:'1'})).completed,false);assert.equal((await handle('/checkout')).completed,true);assert.equal(events.filter(e=>e[0]==='checkout_completed').length,0);}finally{client.close();}
});
