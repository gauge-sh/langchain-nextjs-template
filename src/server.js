import {createServer} from 'node:http';
import {connect} from './sdk.js';
import {createApp} from './app.js';
const client = await connect();
const handle = createApp(client);
const server = createServer(async (req,res) => {
  const url = new URL(req.url,'http://localhost');
  res.setHeader('Content-Type','application/json');
  try {res.end(JSON.stringify({pid:process.pid,result:await handle(url.pathname,Object.fromEntries(url.searchParams))}));}
  catch {res.statusCode=500;res.end(JSON.stringify({error:'Request failed'}));}
});
server.listen(Number(process.env.PORT || 3000),'127.0.0.1',()=>console.log(JSON.stringify({pid:process.pid,node:process.version,local:process.env.LD_TEST_DATA==='1'})));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,async()=>{server.close();try{await client.flush();}finally{client.close();}});
