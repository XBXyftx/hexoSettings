# 项目交接文档 — XBXyftx Hexo 博客

> **AI 必读**：这是本项目的"入职手册"。阅读本文件后，你才能对项目有正确的全局认知，避免基于局部信息做出错误判断。

---

## 1. 项目概览

### 基本信息

| 项 | 值 |
|---|---|
| **项目名称** | XBXyftx 个人技术博客 |
| **定位** | 以鸿蒙开发为核心、兼顾 AI 编程经验分享的技术博客 |
| **技术栈** | Hexo 7.3.0 + Butterfly 主题 v5.3.2 + 大量自定义功能 |
| **语言** | zh-CN |
| **运行环境** | Node.js（本地开发）/ 静态托管（生产部署） |
| **域名** | https://xbxyftx.top |
| **创建时间** | 2024-04-25（footer 中有建站时间统计） |

### 核心内容方向

1. **鸿蒙开发**（HarmonyOS NEXT / OpenHarmony）—— 占比最大，是博客的核心技术标签
2. **AI 编程与 Vibe Coding** —— Claude Code、Cursor、KimiCode 等 Agent 的使用经验
3. **编程心得与技术总结** —— 算法、数据结构、软件工程思考
4. **项目笔记** —— 开源之夏、校园比赛、个人项目的开发记录
5. **学习笔记** —— 期末复习、技术学习过程的记录

---

## 2. 项目结构总览

```
d:\hexo\hexoSettings/
├── _config.yml                    # Hexo 主配置（站点、部署、插件）
├── _config.butterfly.yml          # Butterfly 主题配置（**核心配置**）
├── package.json                   # npm 依赖和 scripts
├── CLAUDE.md                      # 给 Claude Code 的项目说明
├── scripts/                       # 自定义 Hexo 脚本（3个）
│   ├── auto-image-list.js         # 轮播图自动生成
│   ├── private-posts-scanner.js   # 隐私文章扫描（MD5优化）
│   └── image-dimensions.js        # 图片尺寸注入防 CLS
├── source/                        # 博客内容源
│   ├── _posts/                    # 51 篇文章 + asset 文件夹
│   ├── _data/link.yml             # 友情链接配置
│   ├── about/                     # 自定义关于页面（HTML）
│   ├── categories/                # 分类索引页
│   ├── tags/                      # 标签索引页
│   ├── comments/                  # 留言板页面
│   ├── link/                      # 友链页面
│   ├── coffer/                    # 【自定义】隐私文章系统
│   ├── swiper/                    # 【自定义】轮播图系统
│   ├── LianlianKan/               # 【自定义】连连看游戏页面
│   ├── MarkdownPreview/           # 【自定义】Markdown 在线编辑器
│   ├── css/                       # 【自定义】自定义样式表（5个）
│   ├── js/                        # 【自定义】自定义脚本（10+个）
│   └── imgs/                      # 图片资源
│       ├── ArticleTopImgs/        # 文章封面图（50+张）
│       ├── cofferTopImg/          # 隐私文章封面图
│       └── gifs/                  # 动态图
└── themes/butterfly/              # Butterfly 主题（**已被大量修改**）
    ├── _config.yml                # 主题默认配置（**禁止修改**）
    ├── layout/                    # Pug 模板（8个文件被修改）
    ├── source/                    # 主题静态资源（大量自定义 CSS/JS）
    └── ...
```

---

## 3. 核心约束与规则

### 3.1 必遵守的规则

1. **运行 build 前必 clean**
   - 任何 `hexo generate` 或 `npm run build` 之前，必须先执行 `hexo clean`
   - 原因：Hexo 的增量生成在主题修改后可能产生脏缓存

2. **主题文件修改必留痕**
   - 每次修改 `themes/butterfly/` 下的任何文件，必须在 `long-term-memory/06-theme-modifications/` 记录
   - 记录格式：修改文件、修改原因、修改内容、修改时间

3. **文章 front matter 必完整**
   - 新建/修改文章时，以下字段必须完整：
     - `title`（标题）
     - `tags`（标签，至少一个）
     - `categories`（分类）
     - `cover`（封面图路径）
     - `description`（SEO 描述）
   - 可选字段：`typewriter`（打字机效果文本）、`top`（置顶权重）、`swiper_index`（轮播图顺序）

4. **自定义脚本禁止随意删除**
   - `scripts/` 和 `source/js/` 中的自定义脚本是项目核心资产
   - 删除或重命名会导致功能失效（如轮播图、隐私文章系统）

5. **图片优先使用 webp 格式**
   - 新文章配图应使用 `.webp` 格式
   - 已有图片可通过 `npm run webp` 批量转换

### 3.2 技术约束

- **Hexo 版本**：7.3.0（不要擅自升级，主题兼容性未知）
- **Node.js**：需要与 Hexo 7.x 兼容的版本
- **渲染器**：kramed（不是默认的 marked）
- **代码高亮**：highlight.js（不是 prismjs）
- **评论系统**：Twikoo（通过 Netlify 函数部署）
- **部署目标**：GitHub Pages + 私有服务器（双目标）

---

## 4. 自定义功能清单（高价值资产）

本项目有大量**非标准 Hexo / Butterfly** 的自定义功能，AI 必须了解它们的存在和作用：

| 功能 | 实现位置 | 说明 |
|------|---------|------|
| **隐私文章系统** | `source/coffer/` + `source/js/coffer.js` + `scripts/private-posts-scanner.js` | 受密码保护的文章区，独立入口页面 |
| **轮播图系统** | `source/swiper/` + `scripts/auto-image-list.js` | 自动从 `images/` 目录生成轮播图 |
| **打字机效果** | 主题修改：`config_site.pug` + `typewriter-effect.js/css` | 文章页面副标题打字机动画 |
| **瀑布流布局** | 主题修改：`indexPostUI.pug` + `index.pug` + `waterfall.js` | 首页 layout 8，自定义瀑布流 masonry |
| **VS Code 面包屑导航** | `source/js/vscode-breadcrumb-toc.js` + `source/css/vscode-breadcrumb-toc.css` | 文章页面顶部显示当前阅读位置 |
| **星空背景** | `themes/butterfly/source/js/universe-optimized.js` + `css/universe.css` | 全站星空/流星 canvas 背景 |
| **入场弹窗** | 主题修改：`layout.pug` + `entrance-popup.js/css` | 首次访问时的欢迎弹窗 |
| **自定义懒加载** | 多处 lazy-loading JS/CSS | 替代主题内置懒加载 |
| **建站时间统计** | 主题修改：`footer.pug` | 显示从 2024-04-25 开始的运行时间 |
| **自定义右键菜单** | `themes/butterfly/source/js/rightmenu.js` + `css/rightmenu.css` | 替换浏览器默认右键菜单 |
| **连连看游戏** | `source/LianlianKan/` | 独立的连连看小游戏页面 |
| **Markdown 编辑器** | `source/MarkdownPreview/` | 在线 Markdown 实时预览工具 |
| **图片尺寸注入** | `scripts/image-dimensions.js` | 自动为图片注入 width/height 防 CLS |

---

## 5. 当前困境与技术债务

### 5.1 已知问题

1. **主题升级困难**：Butterfly 主题已被大量修改（8个模板文件 + 大量自定义 CSS/JS），升级主题版本需要手动合并
2. **懒加载系统冗余**：同时存在主题内置懒加载、自定义懒加载、vanilla-lazyload 库，逻辑有重叠
3. **CDN 配置分散**：第三方库 CDN 来源分散（cloudflare、elemecdn、baomitu、tianli0 等），部分可能不稳定
4. **MathJax 体积过大**：本地引入了完整的 MathJax 3.2.2（1.1MB），影响加载速度
5. **部分脚本未启用**：`cache-manager.js` 等脚本在主题中被注释掉了

### 5.2 待优化项

- [ ] 统一懒加载方案，移除冗余逻辑
- [ ] 评估 MathJax 按需加载或改用 KaTeX
- [ ] 整理 CDN 来源，统一为 1-2 个可靠源
- [ ] 考虑将主题修改提取为独立插件，降低升级成本
- [ ] 完善隐私文章系统的访问控制（当前仅有前端密码验证）

---

## 6. 常用命令速查

```bash
# 开发
npm run dev          # webp转换 + clean + 本地服务器
hexo server          # 仅启动本地服务器（端口4000）

# 构建
npm run build        # 生成静态文件到 public/
npm run clean        # 清理生成文件和缓存

# 部署
npm run deploy       # 部署到双目标（GitHub + 私有服务器）
npm run pub          # 完整发布：webp + clean + build + deploy

# 图片处理
npm run webp         # 批量转换图片为 webp 并更新 markdown 引用
npm run opt          # webp + clean + build（不部署）
```

---

## 7. 关键外部依赖

| 服务 | 用途 | 状态 |
|------|------|------|
| Twikoo (Netlify) | 评论系统 | 活跃 |
| GitHub Pages | 主要部署目标 | 活跃 |
| 私有服务器 (113.47.8.204) | 次要部署目标 | 活跃 |
| CDN (dusays.com) | 图片托管 | 活跃 |
| CDN (cdnjs.cloudflare.com) | Font Awesome 等 | 活跃 |
