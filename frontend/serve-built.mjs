// Serve only the prebuilt dist folder. No npm install or Python service required.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' };
const server = http.createServer(async (req,res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    const url = new URL(req.url,'http://localhost');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const target = path.resolve(root,relative);
    if (!target.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(target);
    res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error',error=>{
  console.error(error.code === 'EADDRINUSE' ? 'Port 5173 is in use. Close the other LearnTwin server and retry.' : error.message);
  process.exitCode=1;
});
server.listen(5173,'127.0.0.1',()=>{
  const url='http://localhost:5173';
  console.log(`LearnTwin: ${url}\nKeep this window open. Ctrl+C stops the server.\nRecords belong to this browser and origin; export backups regularly.`);
  if(process.platform==='win32') spawn('cmd',['/c','start','',url],{stdio:'ignore'}).on('error',()=>{});
});
