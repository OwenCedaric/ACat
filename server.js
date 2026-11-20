/**
 * Production-ready Zero-Dependency Node.js Server
 * (零外部依赖的高性能 Node.js 服务器)
 * Supports Cloudflare, Railway, Render, Fly.io, Docker & local environments.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const portArgIndex = args.indexOf('--port');
const customPort = portArgIndex !== -1 ? parseInt(args[portArgIndex + 1], 10) : null;
const PORT = process.env.PORT || customPort || 8088;

// Prefer serving from dist/ if it exists and not in explicit dev mode
const hasDist = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
const PUBLIC_DIR = (!isDev && hasDist) ? path.join(__dirname, 'dist') : __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // Basic CORS & Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/') {
        pathname = '/index.html';
    }

    const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));

    // Prevent directory traversal attacks
    if (!safePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // SPA fallback: try index.html
            const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
            if (fs.existsSync(fallbackPath)) {
                serveFile(fallbackPath, req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
            }
            return;
        }

        serveFile(safePath, req, res);
    });
});

function serveFile(filePath, req, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache headers
    if (isDev) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
        if (ext === '.html') {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';

    if (/\bbr\b/.test(acceptEncoding) && zlib.createBrotliCompress) {
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'br'
        });
        fs.createReadStream(filePath).pipe(zlib.createBrotliCompress()).pipe(res);
    } else if (/\bgzip\b/.test(acceptEncoding)) {
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip'
        });
        fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Type': contentType
        });
        fs.createReadStream(filePath).pipe(res);
    }
}

server.listen(PORT, () => {
    console.log(`[服务启动] 游戏服务已在端口 ${PORT} 启动`);
    console.log(`[静态目录] 正在托管目录: ${PUBLIC_DIR}`);
    console.log(`[运行环境] ${isDev ? '开发模式 (无缓存)' : '生产模式 (启用压缩与长效缓存)'}`);
});

process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
});
