import {readFileSync} from 'node:fs';
import {initAi} from '@launchdarkly/server-sdk-ai';
const resources=JSON.parse(readFileSync(new URL('../resources.json',import.meta.url)));
export function createApp(client) {
  const ai=initAi(client);
  return async (path,input={})=>{
    const context={kind:'organization',key:input.org||'standard-org'};
    const cfg=await ai.agentConfig(resources.flagKey,context,{enabled:false});
    if(!cfg.enabled) return {available:false};
    const providerRequest={model:cfg.model?.name,instructions:cfg.instructions};
    const response='Your order has shipped.';
    cfg.createTracker().trackTokens({input:11,output:7,total:18});
    if(input.resolved==='1') client.track('support_resolved',context);
    return {providerRequest,response};
  };
}
