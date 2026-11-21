// A tiny static server for the game (Node 22, standard library only), so
// Twin Peeks can be played locally without a build step:
//   node serve.ts
// then open http://localhost:8080 in a desktop browser. It serves only files
// under game/, with the MIME types a browser game needs, and refuses any
// path that would climb out of game/. This is a development convenience,
// not a web server for the internet.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(req.url?.split('?')[0] ?? '/');
  const rel = normalize(rawPath === '/' ? '/index.html' : rawPath).replace(/^[/\\]+/, '');
  const file = join(root, rel);
  if (!file.startsWith(root + sep) && file !== root) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden\n');
    return;
  }
  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
    return;
  }
  if (!stat.isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
    return;
  }
  res.writeHead(200, {
    'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    'content-length': stat.size,
  });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`Twin Peeks on http://localhost:${port}`);
});
