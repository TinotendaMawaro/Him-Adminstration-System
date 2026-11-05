// Local development server: a tiny round-robin front on :8000 over several `php -S` workers.
// PHP's built-in server handles ONE request at a time on Windows, so a portal that fires a dozen calls on load
// queues them all. Four workers (each with OPcache) make the portals feel normal.
//
//   node scripts/dev-server.mjs            (env: PHP_BIN, PORT=8000, WORKERS=4)
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const php = process.env.PHP_BIN || 'php';
const port = Number(process.env.PORT || 8000);
const workers = Number(process.env.WORKERS || 4);
const base = port + 1;
const router = path.join(root, 'vendor', 'laravel', 'framework', 'src', 'Illuminate', 'Foundation', 'resources', 'server.php');

const children = [];
for (let i = 0; i < workers; i++) {
    const child = spawn(php, ['-S', `127.0.0.1:${base + i}`, '-t', path.join(root, 'public'), router], {
        cwd: path.join(root, 'public'),
        env: { ...process.env, PHP_CLI_SERVER_WORKERS: '1', LARAVEL_SERVER: '1' },
        stdio: 'ignore',
        windowsHide: true,
    });
    child.on('exit', (code) => console.error(`worker ${base + i} exited (${code})`));
    children.push(child);
}

let next = 0;
const server = http.createServer((req, res) => {
    const target = base + (next++ % workers);
    const upstream = http.request(
        { host: '127.0.0.1', port: target, path: req.url, method: req.method, headers: { ...req.headers, host: req.headers.host } },
        (up) => { res.writeHead(up.statusCode, up.headers); up.pipe(res); },
    );
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end('Upstream unavailable'); });
    req.pipe(upstream);
});
server.listen(port, '127.0.0.1', () => console.log(`HIM dev server on http://127.0.0.1:${port} (${workers} PHP workers)`));

const stop = () => { children.forEach((c) => c.kill()); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', () => children.forEach((c) => c.kill()));
