import { readFileSync } from 'node:fs';
const resources = JSON.parse(readFileSync(new URL('../resources.json', import.meta.url)));
export function customerContext(org) { return {kind: 'user', key: org, beta: org === 'beta-org'}; }
export function createApp(client) {
  return async function handle(path, input = {}) {
    const org = input.org || 'standard-org';
    const context = customerContext(org);
    const key = resources.flagKey;
    if (path === '/dashboard') {
      const enabled = await client.variation(key, context, false);
      return { dashboard: enabled ? 'new' : 'existing' };
    }
    if (path === '/search') {
      const value = await client.variation(key, context, resources.kind === 'string' ? 'baseline' : false);
      return {implementation: value === true || value === 'candidate' ? 'candidate' : 'baseline', results: ['order-1','order-2']};
    }
    if (path === '/checkout') {
      const enabled = await client.variation(key, context, false);
      const implementation = enabled ? 'new' : 'legacy';
      client.track('checkout_attempt', context);
      if (input.fail === '1') { client.track('checkout_error', context); return {completed:false,implementation}; }
      return {completed:true,implementation,orderId:'test-order',receipt: enabled ? 'receipt-v2' : 'receipt-v1'};
    }
    if (path === '/signup') {
      const variant = await client.variation(key, context, 'baseline');
      if (input.complete === '1') client.track('signup_completed', context);
      return {variant,steps:variant === 'candidate' ? 1 : 2};
    }
    if (path === '/orders') return oldOrders(input.id || 'test-order');
    if (path === '/chat') return {available: await client.variation(resources.unrelatedFlag,context,true)};
    return {error:'Not found'};
  };
}
export function oldOrders(id) { return {id,status:'shipped',source:'old'}; }
export function newOrders(id) { return {id,status:'shipped',source:'new'}; }
