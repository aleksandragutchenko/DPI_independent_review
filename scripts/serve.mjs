import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const requested = path.resolve(root, `.${urlPath}`);
    if (!requested.startsWith(root)) throw new Error('Invalid path');
    let target = requested;
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Preview available at http://127.0.0.1:${port}/`));
