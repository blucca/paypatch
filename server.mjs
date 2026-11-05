import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { experienceFrom } from './core.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const nativeEnabled = ['MEMWAL_PRIVATE_KEY', 'MEMWAL_ACCOUNT_ID', 'TATUM_API_KEY'].every(k => process.env[k]);
const originalBlob = JSON.parse(await readFile(resolve(root, 'experiment/memory-proof.json'), 'utf8')).blob_id;
let cached, inFlight;
async function liveRecall() {
  if (cached && Date.now() - cached.at < 60000) return cached.value;
  if (!inFlight) inFlight = (async () => {
    const { nativeAccount } = await import('./native.mjs');
    const { gate, client } = await nativeAccount();
    const result = await client.recall({ query: 'For export profile harbor-erp-v3, how do I resolve the recipient when staging a new payment draft?', limit: 5 });
    const experience = experienceFrom({ results: result.results.filter(r => r.blob_id === originalBlob) });
    if (!experience) throw new Error('The recorded exporter experience is absent from this namespace.');
    const value = { mode: 'live', recalled_at: new Date().toISOString(), gate, experience };
    cached = { at: Date.now(), value };
    return value;
  })().finally(() => { inFlight = null; });
  return inFlight;
}

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.jpg': 'image/jpeg' };
createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/recall') {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('cache-control', 'no-store');
    res.setHeader('content-type', types['.json']);
    if (!nativeEnabled) { res.writeHead(503); res.end(JSON.stringify({ error: 'Live recall needs the local integration credentials. Use recorded proof or configure the native adapter.' })); return; }
    try { res.end(JSON.stringify(await liveRecall())); }
    catch (error) { console.error('Live recall failed:', error.message); res.writeHead(503); res.end(JSON.stringify({ error: 'Live recall stopped. Retry shortly or choose the recorded mainnet proof.' })); }
    return;
  }
  // Only the demo, its kernel and published experiment exports are served.
  const relative = pathname === '/' ? 'web/index.html' : pathname === '/core.mjs' ? 'core.mjs'
    : pathname.startsWith('/experiment/') ? pathname.slice(1) : `web${pathname}`;
  const file = resolve(root, relative);
  const allowed = file === resolve(root, 'core.mjs') || file.startsWith(resolve(root, 'web') + '/') || file.startsWith(resolve(root, 'experiment') + '/');
  if (!allowed) { res.writeHead(404); res.end('Page not found'); return; }
  try { const content = await readFile(file); res.setHeader('content-type', types[extname(file)] || 'application/octet-stream'); res.end(content); }
  catch { res.writeHead(404); res.end('Page not found'); }
}).listen(Number(process.env.PORT || 17612), process.env.HOST || '127.0.0.1', () => console.log(`PayPatch ready; native recall ${nativeEnabled ? 'enabled' : 'needs credentials'}.`));
