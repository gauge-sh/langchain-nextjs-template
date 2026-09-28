import {readFileSync} from 'node:fs';
import {connect} from './sdk.js';
const r=JSON.parse(readFileSync(new URL('../resources.json',import.meta.url)));
const client=await connect();
try {
 const result=await client.variationDetail(r.flagKey,{kind:'organization',key:'standard-org'},null);
 if(result.reason.kind==='ERROR') throw new Error('Resource evaluation failed: '+result.reason.errorKind);
 console.log(JSON.stringify({mode:process.env.LD_TEST_DATA==='1'?'local':'live',key:r.flagKey,value:result.value,reason:result.reason.kind}));
} finally {client.close();}
