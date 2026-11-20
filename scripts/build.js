/**
 * Zero-dependency Node.js Production Build Script
 * (构建打包脚本，输出至 dist 目录，适配 Cloudflare Pages 与静态托管)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('[构建开始] 正在打包项目资源至 dist 目录...');

// 1. Clean dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Helper to copy recursively
function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const item of fs.readdirSync(src)) {
            copyRecursive(path.join(src, item), path.join(dest, item));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 2. Copy core directories and files
const itemsToCopy = ['index.html', 'manifest.json', 'sw.js', 'css', 'js', 'assets'];

for (const item of itemsToCopy) {
    const srcPath = path.join(ROOT_DIR, item);
    const destPath = path.join(DIST_DIR, item);
    if (fs.existsSync(srcPath)) {
        copyRecursive(srcPath, destPath);
        console.log(`[复制成功] ${item} -> dist/${item}`);
    }
}

// 3. Create Cloudflare Pages headers file (dist/_headers)
const cloudflareHeaders = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/sw.js
  Cache-Control: public, max-age=0, must-revalidate
  Service-Worker-Allowed: /

/manifest.json
  Cache-Control: public, max-age=0, must-revalidate

/css/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable
`;

fs.writeFileSync(path.join(DIST_DIR, '_headers'), cloudflareHeaders.trim() + '\n', 'utf-8');
console.log('[配置写入] 已生成 Cloudflare Pages _headers 缓存与安全头文件');

// 4. Create Cloudflare Pages redirects file (dist/_redirects)
const cloudflareRedirects = `/*    /index.html   200\n`;
fs.writeFileSync(path.join(DIST_DIR, '_redirects'), cloudflareRedirects, 'utf-8');
console.log('[配置写入] 已生成 Cloudflare Pages _redirects 路由重定向文件');

console.log('[构建完成] 项目已成功打包输出至 dist 目录，可直接部署至 Cloudflare Pages！');
