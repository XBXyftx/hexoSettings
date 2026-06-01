# 03-api-practices — 技术约束与 API 实践

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
| **图表** | Mermaid | — | 流程图/时序图支持 |
| **函数可视化** | Plotly.js | 2.27.0 (CDN) | 交互式函数图像、3D 曲面（详见 [plotly-function-visualization.md](plotly-function-visualization.md)） |
| **公式** | KaTeX | 0.16.19 | 客户端渲染（303KB），已从 MathJax 迁移 |
| **评论** | Twikoo | 1.7.11 | 通过 Netlify 函数部署 |

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

## 主题配置关键项

### 注入系统（inject）

`_config.butterfly.yml` 的 `inject` 部分决定了哪些自定义 CSS/JS 被加载：

**Head 注入**（按加载顺序）：
1. Dark mode 初始化脚本（强制 `data-theme="dark"`）
2. `/css/index.css` — 核心自定义样式
3. `/css/universe.css` — 星空背景样式（异步加载）
4. `/css/transpancy.css` — 透明效果（异步加载）
5. `/css/styles.css` — 自定义样式（异步加载）
6. `/css/rightmenu.css` — 右键菜单样式（异步加载）
7. `/css/twikoo.css` — 评论样式（异步加载）
8. `/css/lazy-loading-optimized.css` — 懒加载样式（异步加载）
9. `/css/readmode-enhanced.css` — 阅读模式增强（异步加载）
10. Font Awesome 6.5.1 CDN

**Bottom 注入**（按加载顺序）：
1. `<canvas id="universe"></canvas>` — 星空画布
2. `/js/universe-optimized.js` — 星空动画（defer）
3. `/js/jquery-3.6.0.min.js` — jQuery（defer）
4. `/js/rightmenu.js` — 右键菜单（defer）
5. `/js/happy-title.js` — 标题特效（defer）
6. `/js/lazy-loading-optimized.js` — 懒加载（defer）
7. `/js/lightbox-enhanced.js` — 灯箱增强（defer）

### 硬编码在主题模板中的加载

**head.pug** 额外加载（非 inject）：
- 文章页面：`/css/typewriter-effect.css`
- 所有页面：`/css/entrance-popup.css`, `/css/lazy-loading.css`, `/css/lazy-loading-stable.css`, `/css/lazy-image-refresh.css`, `/css/lazy-video-refresh.css`
- 文章页面：`/css/vscode-breadcrumb-toc.css`
- 所有页面：`/js/header-universe.js`

**additional-js.pug** 额外加载（非 inject）：
- 首页：`/js/waterfall.js`
- 文章页面：`/js/typewriter-effect.js`
- 所有页面：`/js/network-monitor.js`, `/js/topimg-monitor.js`, `/js/entrance-popup-config.js`, `/js/entrance-popup.js`, `/js/lazy-loading.js`, `/js/lazy-loading-native.js`, `/js/lazy-image-refresh.js`, `/js/lazy-video-refresh.js`
- 文章页面：`/js/vscode-breadcrumb-toc.js`

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
