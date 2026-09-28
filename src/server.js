import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { answer, openChat } from './app.js';
import { RecordingProvider } from './provider.js';

export function makeServer() {
  return createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const url = new URL(req.url, 'http://localhost');
    const org = url.searchParams.get('org') || 'standard-org';
    if (!['standard-org', 'beta-org'].includes(org)) { res.writeHead(400); res.end('{}'); return; }
    const provider = new RecordingProvider();
    try {
      let response;
      if (url.pathname === '/request') response = await answer({ org, tool: url.searchParams.get('tool') || undefined }, provider);
      else if (url.pathname === '/chat') response = await openChat({ org });
      else { res.writeHead(404); res.end('{}'); return; }
      res.end(JSON.stringify({ pid: process.pid, org, response, providerRequests: provider.requests, handlerCalls: provider.handlerCalls }));
    } catch (error) { res.writeHead(500); res.end(JSON.stringify({ error: 'Request failed' })); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = makeServer();
  server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(JSON.stringify({ port: server.address().port, pid: process.pid, node: process.version })));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
