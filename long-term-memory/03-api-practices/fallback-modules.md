---
name: 兜底模块全览（Twikoo 评论 + KaTeX 公式 + Mermaid 图表 + inject 总图）
description: 三个关键运行时模块的配置、加载方式、故障模式和 inject.head/bottom 资源加载全景图
type: project
---

# 兜底模块全览 — Twikoo / KaTeX / Mermaid + inject 总图

> **何时阅读**：评论不加载、数学公式不渲染、Mermaid 图表空白、新增 inject 资源、排查资源加载顺序冲突时。
> **关联文档**：[performance-optimization.md](performance-optimization.md)（inject 异步/同步策略）· [cdn-strategy.md](cdn-strategy.md)（本地资源保留理由）

---

## L1 · TL;DR

三个"兜底"模块——它们不是博客核心结构，但对特定文章类型至关重要：

| 模块 | 用途 | 加载方式 | 体积 | 故障影响 |
|---|---|---|---|---|
| **Twikoo** | 评论系统 | 本地 `/js/twikoo.js` + Netlify 后端 | ~200KB | 评论区空白 |
| **KaTeX 0.16.19** | 数学公式渲染 | 本地 `/js/katex/` + 客户端 auto-render | ~303KB（含 CSS） | 公式显示为 LaTeX 源码 |
| **Mermaid** | 图表渲染 | `hexo-filter-mermaid-diagrams` 插件 | 插件体积 | 代码块显示为原始 mermaid 语法 |

---

## L2 · Twikoo 评论系统

### 2.1 配置

```yaml
# _config.butterfly.yml
comments:
  use: Twikoo
  text: true           # 显示"评论"文字
  lazyload: true       # 评论元素进入视口时才加载
  count: false         # 不在 top_img 显示评论数
  card_post_count: false  # 不在首页显示评论数

twikoo:
  envId: https://twikooxbx.netlify.app/.netlify/functions/twikoo
  visitor: true        # 用 Twikoo 统计文章访问量
```

### 2.2 加载链路

```text
文章页 → 用户滚动到评论区
  → Butterfly comments.pug 检测 comments.lazyload: true
  → IntersectionObserver 监听 #twikoo-wrap 进入视口
  → 动态创建 <script src="/js/twikoo.js">
  → twikoo.init({ envId: 'https://twikooxbx.netlify.app/.netlify/functions/twikoo', el: '#twikoo-wrap' })
  → 向 Netlify Function 发请求获取评论数据
```

### 2.3 本地化原因

| 原因 | 说明 |
|---|---|
| **版本锁定** | 与 Netlify Function 后端版本匹配，防止 CDN 更新导致不兼容 |
| **稳定性** | 不依赖第三方 CDN 的可用性 |
| **离线调试** | 本地 `hexo server` 时不需要外网 |

### 2.4 故障排查

| 现象 | 可能原因 | 检查方法 |
|---|---|---|
| 评论区一直转圈 | Netlify Function 冷启动 / 超时 | F12 Network 查 twikoo 请求 |
| 评论区空白 | `twikoo.js` 404 | F12 Network 找 `/js/twikoo.js` |
| 评论加载但显示异常 | CSS 冲突 | 检查 `.twikoo` 样式被覆盖 |
| 评论数不显示 | `visitor: false` 或 `count: false` | 检查配置 |

---

## L3 · KaTeX 0.16.19 数学公式

### 3.1 迁移背景

于 2026-05-04 从 MathJax 3.2.2（1.1MB）迁移至 KaTeX 0.16.19（303KB），体积减少 74%。MathJax 3.2.2 目录已物理删除，仅保留 KaTeX。

### 3.2 配置

```yaml
# _config.butterfly.yml
math:
  use: katex
  per_page: false       # 不全局加载，按文章 front matter 控制
  katex:
    enableMenu: true    # 右键菜单（公式复制/查看源码）
```

### 3.3 加载方式

KaTeX 通过客户端渲染（非服务端 hexo-filter-katex）：

1. `katex.pug`（主题修改）负责加载 `katex.min.js` + `katex.min.css` + `auto-render.min.js`
2. `scripts/math-protect.js`（Hexo 过滤器）在 kramed 渲染前保护 `$...$` 和 `$$...$$` 语法不被破坏
3. 前端 `renderMathInElement` 在客户端扫描并渲染公式

**双模式渲染**：
- **模式 A**：`<script type="math/tex">` 标签 → `katex.render()` 直接渲染（处理被 kramed 破坏的公式）
- **模式 B**：`renderMathInElement` auto-render 扫描 `$...$` 和 `$$...$$` 语法

### 3.4 按需加载机制

```yaml
# 文章 front matter
---
title: 数学文章
katex: true    # 有此字段才加载 KaTeX
---
```

`per_page: false` + 文章 `katex: true` → 只在含公式的文章加载 KaTeX。不含公式的文章不加载。

### 3.5 KaTeX 本地文件

| 文件 | 体积 | 用途 |
|---|---|---|
| `katex.min.js` | 276KB | 核心渲染引擎 |
| `katex.min.css` | 23KB | 公式样式 |
| `auto-render.min.js` | 3.5KB | 自动扫描并渲染 |
| `fonts/` | — | 数学字体文件 |

### 3.6 支持的公式语法

| 模式 | 语法 | 示例 |
|---|---|---|
| 行内 | `$...$` | `$E = mc^2$` |
| 块级 | `$$...$$` | `$$\sum_{i=1}^n x_i$$` |

### 3.7 故障排查

| 现象 | 可能原因 | 检查方法 |
|---|---|---|
| 公式显示为 LaTeX 源码 | KaTeX 未加载 | F12 Network 找 `katex.min.js` |
| 公式渲染一半/乱码 | kramed 破坏了公式语法 | 检查 `math-protect.js` 是否启用 |
| 非公式页也加载 KaTeX | `per_page: true` | 检查配置 |

---

## L4 · Mermaid 图表

### 4.1 配置

```yaml
# _config.butterfly.yml
mermaid:
  enable: true
  code_write: true      # 用代码块写 Mermaid（````mermaid）
  theme:
    light: default
    dark: dark
```

### 4.2 加载方式

通过 `hexo-filter-mermaid-diagrams` 插件在构建时处理：

```text
markdown 中的 ````mermaid 代码块
  → hexo-filter-mermaid-diagrams 插件
  → 生成 <div class="mermaid"> + <script>mermaid.initialize()</script>
  → 浏览器端 mermaid.js 渲染 SVG 图表
```

### 4.3 支持的图表类型

流程图（flowchart）、时序图（sequenceDiagram）、类图（classDiagram）、状态图（stateDiagram）、甘特图（gantt）、饼图（pie）等。

### 4.4 故障排查

| 现象 | 可能原因 | 检查方法 |
|---|---|---|
| Mermaid 代码块显示为原始文本 | 插件未启用 | 检查 `mermaid.enable: true` |
| 图表渲染错误（红色文字） | Mermaid 语法错误 | 检查代码块语法 |
| 暗色模式下图表看不清 | `dark` 主题未生效 | 检查 `data-theme` 属性 |

---

## L5 · inject 总图（head + bottom 全景）

### 5.1 inject.head（8 个资源）

| # | 资源 | 类型 | 同步/异步 | 作用 |
|---|---|---|---|---|
| 1 | `<script>data-theme='dark'</script>` | 内联 JS | **同步** | 防止暗色模式 FOUC |
| 2 | `/css/index.css` | 本地 CSS | **同步** | 主样式（layout/字体/配色） |
| 3 | `/css/universe.css` | 本地 CSS | 异步 | 星空 canvas 定位 |
| 4 | `/css/transpancy.css` | 本地 CSS | 异步 | 内容容器半透明 |
| 5 | `/css/styles.css` | 本地 CSS | 异步 | 业务样式细节 |
| 6 | `/css/rightmenu.css` | 本地 CSS | 异步 | 右键菜单样式 |
| 7 | `/css/twikoo.css` | 本地 CSS | 异步 | 评论样式 |
| 8 | `/css/lazy-loading-optimized.css` | 本地 CSS | 异步 | 图片懒加载占位符 |
| 9 | `/css/readmode-enhanced.css` | 本地 CSS | 异步 | 阅读模式样式 |
| 10 | Font Awesome 6.5.1 (cdnjs) | CDN CSS | 异步 | 全站图标（fa-robot 等） |

### 5.2 inject.bottom（7 个资源）

| # | 资源 | 类型 | 加载 | 作用 |
|---|---|---|---|---|
| 1 | `<canvas id="universe">` | HTML | — | 星空画布元素 |
| 2 | `/js/universe-optimized.js` | 本地 JS | defer | 全屏星空动画 |
| 3 | `/js/jquery-3.6.0.min.js` | 本地 JS | defer | jQuery（rightmenu/happy-title 依赖） |
| 4 | `/js/rightmenu.js` | 本地 JS | defer | 右键菜单 |
| 5 | `/js/happy-title.js` | 本地 JS | defer | 标签页标题动画 |
| 6 | `/js/lazy-loading-optimized.js` | 本地 JS | defer | 主图片懒加载 |
| 7 | `/js/lightbox-enhanced.js` | 本地 JS | defer | 图片灯箱 |

### 5.3 加载时序

```text
<head>
  T=0    同步执行：data-theme='dark'
  T=0    同步 CSS 阻塞渲染：index.css
  T=0    异步 CSS 并行下载（不阻塞）：其余 9 个

<body>
  ...页面内容解析...

<body 末尾>
  同步插入 <canvas id="universe">
  并行下载（defer）：7 个 JS 脚本
  按声明顺序执行：universe-optimized → jquery → rightmenu → happy-title → lazy-loading → lightbox

DOMContentLoaded
  typewriter-effect.js 启动（通过 additional-js.pug 的 if globalPageType === 'post'）
  coffer.js 启动（/coffer/ 页面专用）
  lazy-loading-about.js 启动（/about/ 页面专用）

PJAX 页面切换
  pjax:complete → typewriter-effect 重新初始化
  pjax:complete → lazy-loading-optimized.js 重新初始化
```

### 5.4 inject 资源管理的红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 在 inject.head 中新增同步 CSS | 阻塞首屏渲染 | 用 `media="print" onload` 异步 |
| R2 | 在 inject.head 中新增同步 `<script src>` | 阻塞 HTML 解析 | 用 defer/async |
| R3 | 删除 inject.head 首行的 data-theme 设置 | 页面从白屏闪到黑屏（FOUC） | 保留 |
| R4 | 删除 inject.bottom 中的 jquery | rightmenu/happy-title/lightbox 全部报 `$ is not defined` | 保留 |
| R5 | 把 defer 改成 async | 脚本执行顺序不保证，jQuery 可能未定义 | 保持 defer |

---

## L6 · 每个模块的依赖链

```text
Twikoo
  └── twikoo.js (本地) → Netlify Function (外部)
       └── twikoo.css (本地，inject.head 异步加载)

KaTeX
  └── katex.min.js + katex.min.css + auto-render.min.js (本地)
       ├── 文章 front matter: katex: true
       ├── math.per_page: false
       └── scripts/math-protect.js (Hexo 过滤器，防 kramed 破坏公式)

Mermaid
  └── hexo-filter-mermaid-diagrams (npm 插件)
       ├── mermaid.enable: true
       └── mermaid.js (插件自带，构建时注入)

inject 系统
  ├── head: 1 同步 script + 1 同步 CSS + 9 异步 CSS
  ├── bottom: 1 HTML + 7 defer JS
  └── 额外（通过 pug 模板按条件加载）:
       ├── typewriter-effect.js (仅文章页)
       ├── header-universe.js (全站，通过 head.pug)
       ├── lazy-loading-about.js (仅 /about/)
       └── coffer.js (仅 /coffer/)
```

---

## L7 · 文件位置速查

| 内容 | 路径 |
|---|---|
| Twikoo JS | `source/js/twikoo.js` |
| Twikoo CSS | `source/css/twikoo.css` |
| Twikoo 后端 | `https://twikooxbx.netlify.app/.netlify/functions/twikoo` |
| KaTeX | `source/js/katex/` |
| Mermaid 插件 | `node_modules/hexo-filter-mermaid-diagrams/` |
| inject 配置 | `_config.butterfly.yml` inject 节 |
| Math 配置 | `_config.butterfly.yml` math 节 |
| Comments 配置 | `_config.butterfly.yml` comments + twikoo 节 |
| Mermaid 配置 | `_config.butterfly.yml` mermaid 节 |
