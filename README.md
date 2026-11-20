# 墨猫跃尘 · 水墨素色猫咪跳跃游戏
*Ink Cat: Leap Through Dust*

一款专为移动端（手机）、平板端（iPad / Android 平板）及电脑浏览器打造的高雅水墨风格网页游戏，已完全重构为现代 Node.js 架构工程，支持一键打包与部署至 Cloudflare Pages、Vercel 等主流边缘与云平台。

---

## 架构与工程结构

```
ACat/
├── .cursor/
│   └── mcp.json            # Cursor 与 IDE 远程 MCP 图标服务配置
├── scripts/
│   └── build.js            # Node.js 自动化打包与分发脚本 (生成 dist)
├── css/
│   └── style.css           # 宣纸墨韵质感与移动端自适应样式
├── js/
│   ├── audio.js            # Web Audio API 古琴与水墨音效合成器
│   ├── cat.js              # 素墨灵猫物理骨骼与弹簧毛笔尾巴
│   ├── camera.js           # 平滑视差跟随镜头系统
│   ├── game.js             # 游戏核心逻辑、输入流与关卡结算
│   ├── levels.js           # 四大水墨关卡地形与传统皴法绘制
│   └── particles.js        # 水墨晕染、踏雪梅花爪印与意境粒子
├── assets/                 # 项目静态媒体资源
├── dist/                   # 生产打包输出目录 (含 _headers 与 _redirects)
├── index.html              # 游戏主页面入口
├── package.json            # Node.js 项目工程清单与构建脚本
├── server.js               # 零外部依赖的高性能 Node.js 本地与生产服务器
├── wrangler.jsonc          # Cloudflare Pages / Workers 官方部署配置文件
├── wrangler.toml           # Cloudflare 兼容性配置文件
└── README.md               # 项目架构与部署手册
```

---

## 常用开发命令

项目采用原生 Node.js 构建，无需繁琐的三方依赖即可直接执行：

1. **启动本地开发/生产服务**：
   ```bash
   # 启动标准服务（自动优先托管 dist 生产包）
   npm start
   # 或
   node server.js

   # 以开发模式启动（禁用浏览器缓存，适合调试）
   npm run dev
   ```
   启动后访问：`http://localhost:8088`

2. **生产环境构建打包**：
   ```bash
   npm run build
   ```
   执行后将把全量资源整合输出至 `dist/` 目录，并自动注入 Cloudflare Pages 所需的边缘缓存规则文件 `_headers` 与单页路由规则 `_redirects`。

3. **本地预览生产包**：
   ```bash
   npm run preview
   ```

---

## Cloudflare 部署指南

### 方式一：Cloudflare Pages 关联 Git 仓库自动部署（推荐）

1. 将本项目推送到 GitHub / GitLab。
2. 登录 Cloudflare 控制台，进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择本项目代码仓库，在构建配置（Build settings）中填入：
   - **Framework preset（框架预设）**：None（或自动识别）
   - **Build command（构建命令）**：`npm run build`
   - **Build output directory（构建输出目录）**：`dist`
4. 点击 **Save and Deploy**，Cloudflare 边缘全球 CDN 节点即可在几十秒内完成构建上线。

### 方式二：使用 Wrangler CLI 命令行直接发布

如果本地已配置 Cloudflare Wrangler 工具：
```bash
# 1. 执行打包
npm run build

# 2. 部署到 Cloudflare Pages
npm run deploy
# 对应命令：wrangler pages deploy dist --project-name acat-ink-cat-game
```

---

## 核心玩法与操控

1. **即时轻触跳跃**：
   - 触屏轻按屏幕或右下角【起跳】立即腾跃，轻按小跳，长按大跳。
   - 电脑端使用 `Space` / `W` / 方向键上。
2. **踏墨二段跳**：
   - 在空中再次点击【起跳】或【踏墨二段】即可凌空折跃。
3. **踏雪留痕**：
   - 猫咪奔跑与落地时会在瓦屋顶与青石上留下淡淡的半透明水墨梅花脚印，数秒后风干消散。
