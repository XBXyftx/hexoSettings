# 03-api-practices — 技术约束与 API 实践

> **当前事实基线（2026-07-11）**：资源注入、Mermaid、Twikoo、双 Canvas 星空、lazy placeholder 和移动 waterfall 的现状已重新核验。P1 分层星空实验的源码与记录已归档但未采纳；P2 已清理可安全修复的失效请求，并将外部原图遗留项单列。任何性能判断前，先读 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md)。

本目录记录项目中使用的技术栈、框架 API 和自定义脚本的使用规则。

---

## 技术栈总览

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **静态生成器** | Hexo | 7.3.0 | 核心框架 |
| **主题** | Butterfly | 5.3.2 | 已大量自定义修改 |
| **渲染器** | kramed | ^0.1.4 | Markdown 渲染（非默认 marked） |
| **模板引擎** | Pug | ^3.0.0 | 主题模板语言 |
| **样式预处理** | Stylus | ^3.0.1 | 主题样式语言 |
| **代码高亮** | highlight.js | — | 行号已启用 |
| **图表** | Mermaid | 当前关闭（无站内图表内容） | P2 已移除全站 `mermaid@undefined` 404；新增 Mermaid 图前需恢复固定版本的按需加载链，详见 [fallback-modules.md](fallback-modules.md) |
| **函数可视化** | Plotly.js | 2.27.0 (CDN) | 交互式函数图像、3D 曲面（详见 [plotly-function-visualization.md](plotly-function-visualization.md)） |
| **公式** | KaTeX | 0.16.19 | 客户端渲染（303KB），已从 MathJax 迁移 |
| **评论** | Twikoo | 1.7.11 | 本地约 938KB 脚本，在评论容器进入视口后动态加载 |

---

## 内容渲染与文章内嵌规范

| 文档 | 适用场景 | 必读时机 |
| --- | --- | --- |
| [Markdown 内嵌 HTML 渲染规范](markdown-html-embedding.md) | 文章中直接插入 HTML 卡片、按钮、复杂 `<div>` 布局、内联样式 | 修改文章正文 HTML 前；预览出现源码块或异常空白时 |

---

## 自定义脚本 API

### 1. auto-image-list.js

**作用**：自动扫描 `source/swiper/images/` 目录，生成 `swiper/images-auto.json` 索引文件。

**触发时机**：Hexo `generate` 阶段（注册为 generator）。

**支持的图片格式**：jpg, jpeg, png, gif, webp, bmp, svg。

**输出格式**：
```json
[
  {
    "title": "图片描述",
    "path": "/swiper/images/xxx.webp",
    "date": "2025-01-01"
  }
]
```

**使用规则**：
- 将新图片放入 `source/swiper/images/` 即可自动收录
- 图片命名应描述性强（会作为 title 展示）
- 不要在 `swiper/images-auto.json` 上手动编辑（会被覆盖）

---

### 2. private-posts-scanner.js

**作用**：扫描 `source/coffer/private-posts/` 中的隐私文章，生成 `source/coffer/private-posts.json` 索引。

**触发时机**：Hexo `before_generate` 阶段（注册为 filter）。

**优化机制**：使用 MD5 哈希检测文件变化，只有文件内容改变时才重新扫描，避免不必要的 IO。

**解析的 front matter 字段**：title, date, tags, categories, description, cover。

**额外计算**：
- 中文字数统计
- 英文单词数统计
- 自动摘要生成（取正文前 N 个字符）
- 最后修改时间追踪

**使用规则**：
- 隐私文章放入 `source/coffer/private-posts/` 目录
- 同样需要完整的 front matter
- 扫描结果在 `source/coffer/private-posts.json`，供前端 `coffer.js` 读取

---

### 3. image-dimensions.js

**作用**：在 HTML 生成后，为所有 `<img>` 标签注入 `width` 和 `height` 属性，防止布局偏移（CLS）。

**触发时机**：`after_render:html`，priority 100。

**排除项**（不注入尺寸的图片）：
- Logo 图片
- 公告栏 GIF
- 文章背景图
- 封面图
- 友链头像

**使用规则**：
- 自动运行，无需手动触发
- 依赖 `image-size` npm 包
- 图片路径解析顺序：source_dir → public_dir → theme_source → post_asset_folder

---

### 4. tools/convert-to-webp.ps1 + tools/update-markdown-images.ps1

**作用**：批量将 `source/` 与主题下的 `.png/.jpg/.jpeg/.gif` 转换为 `.webp`，并同步替换所有 Markdown / 配置文件中的图片引用。

**触发时机**：手动通过 `npm run webp` 触发；`npm run dev / opt / pub` 都会先调用它。

**前置依赖**：本机必须安装 `libwebp`（提供 `cwebp` / `gif2webp` 命令）。

**关键行为**：转换成功后会**物理删除源文件**（不可逆），所以源图必须先 `git add` 跟踪。

**完整规则、首次环境配置、扫描范围、排除规则、常见报错排查**：见 [webp-conversion.md](webp-conversion.md)。

> 修改这些脚本前，请先阅读详细文档，并在 `04-operations/operation-log.md` 记录改动。`.ps1` 和 `.sh` 两套实现需保持功能等价。

---

### 5. tools/audit-resource-requests.js + tools/verify-resource-requests.js

**作用**：为生成态资源正确性提供本地、可重复的两层检查：

1. `audit-resource-requests.js` 扫描生成 HTML/CSS 的本地静态资源目标，检查文件是否存在；可选地以受限并发探测直接外部媒体 URL。
2. `verify-resource-requests.js` 临时启动静态 server 和隔离 Headless Chrome，检查代表页面的 DOM、网络请求与本地 HTTP 错误。

**输出规则**：默认写入系统临时目录，不写入 `public/` 或 Git；可通过 `--output-dir` 指定本地报告目录。

**使用规则**：

- 资源配置、文章资源路径、WebP 转换或外部媒体引用改动后，先 `npm run build`，再运行两项审计。
- 外部探测只代表当前机器、网络与时刻；HTTP 404 可以确认，连接失败/超时不能直接宣称资源永久失效。
- 对外部正文原图，只有拿到可信原始文件或已验证替代资源后才可修改文章，禁止用无关图片掩盖缺失。
- 详细基线、白名单边界、报告路径和 P2 量化见 [2026-07-11 P2 失效请求修复](../04-operations/2026-07-11-invalid-request-p2/README.md)。

---

## 主题配置关键项

### 注入系统（inject）

`_config.butterfly.yml` 的 `inject` 部分决定了哪些自定义 CSS/JS 被加载：

**Head 注入**（当前 `_config.butterfly.yml` 注入顺序）：
1. Dark mode 初始化脚本（强制 `data-theme="dark"`）
2. `/css/index.css` — 自定义主样式（**主题 `head.pug` 也加载一次，当前重复**）
3. `/css/universe.css` — 星空背景样式（异步加载）
4. `/css/transpancy.css` — 透明效果（异步加载）
5. `/css/styles.css` — 自定义样式（异步加载）
6. `/css/rightmenu.css` — 右键菜单样式（异步加载）
7. `/css/twikoo.css` — 评论样式（异步加载）
8. `/css/readmode-enhanced.css` — 阅读模式增强（异步加载）
9. Font Awesome 6.5.1 CDN（**主题 `head.pug` 也同步加载一次，当前重复**）

> `lazy-loading-optimized.css` 的 inject 行已删除，当前不应再把它列为注入资源。

**Bottom 注入**（按加载顺序）：

1. `<canvas id="universe"></canvas>` — 星空画布
2. `/js/universe-optimized.js` — 全站背景星空动画（defer）
3. `/js/jquery-3.6.0.min.js` — jQuery（defer）
4. `/js/rightmenu.js` — 右键菜单（defer）
5. `/js/happy-title.js` — 标题特效（defer）
6. `/js/lazy-loading-optimized.js` — 懒加载（defer）
7. `/js/lightbox-enhanced.js` — 灯箱增强（defer）

### 硬编码在主题模板中的加载

**head.pug** 额外加载（非 inject）：

- 所有页面：主题主 CSS、同步 Font Awesome、`/css/entrance-popup.css`、`/css/lazy-loading.css`、`/css/lazy-loading-stable.css`、`/js/header-universe.js`（顶部封面星空脚本）
- 文章页面：`/css/typewriter-effect.css`、`/css/vscode-breadcrumb-toc.css`
- `lazy-image-refresh.css`、`lazy-video-refresh.css` 已删除，不再加载。

**additional-js.pug** 额外加载（非 inject）：
- 首页：`/js/waterfall.js`（移动端当前存在 100ms 轮询和调试监听，见审计 P0）
- 文章页面：`/js/typewriter-effect.js`、`/js/vscode-breadcrumb-toc.js`
- 所有页面：`/js/entrance-popup-config.js`、`/js/entrance-popup.js`
- network/topimg 监控及旧 lazy-loading/refresh 系列均已删除，不再加载。

---

## Hexo API 使用规范

### 注册 Generator

```javascript
hexo.extend.generator.register('name', function(locals) {
  // 生成自定义路由或文件
});
```

### 注册 Filter

```javascript
hexo.extend.filter.register('before_generate', function() {
  // 在生成前执行
});

hexo.extend.filter.register('after_render:html', function(html, data) {
  // 在 HTML 渲染后处理
}, 100); // priority: 数字越小越先执行
```

### locals 对象

`locals` 包含所有文章、页面、分类、标签等数据：
- `locals.posts` — 所有文章
- `locals.pages` — 所有页面
- `locals.categories` — 所有分类
- `locals.tags` — 所有标签

---

## 技术约束清单

| 约束 | 说明 | 违反后果 |
|------|------|---------|
| 不升级 Hexo 大版本 | 主题兼容性未验证 | 构建失败或样式崩坏 |
| 不修改 themes/butterfly/_config.yml | 用户配置在根目录的 _config.butterfly.yml | 配置被覆盖 |
| build 前必 clean | Hexo 增量生成缓存问题 | 旧文件残留 |
| 图片用 webp | 体积优化（详见 [webp-conversion.md](webp-conversion.md)） | 加载慢 |
| 函数图像用 Plotly | 交互式可视化规范（详见 [plotly-function-visualization.md](plotly-function-visualization.md)） | 静态图无交互 |
| 不删除 scripts/ 中的文件 | 核心功能依赖 | 功能失效 |
