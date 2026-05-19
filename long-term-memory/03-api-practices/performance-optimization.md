---
name: 整体性能优化方案（图片尺寸 + 异步 CSS + defer JS + 监控 + 懒加载）
description: 项目首屏性能优化的完整工程实践 — image-dimensions 防 CLS、media=print 异步 CSS、defer JS、network-monitor / topimg-monitor 监控、节流降级
type: project
---

# 整体性能优化方案

> **何时阅读**：性能问题排查（LCP / CLS / FID 高）、调整 inject 顺序、新增性能监控、移动端卡顿调研、PageSpeed 报告异常时。
> **关联文档**：[lazy-loading-system.md](lazy-loading-system.md)（懒加载是性能的一部分）· [universe-background.md](universe-background.md)（动画性能）· [cdn-strategy.md](cdn-strategy.md)（待写）

---

## L1 · TL;DR（30 秒看完）

项目采取了 **六个维度** 的性能优化：

1. **构建期防 CLS**：`scripts/image-dimensions.js` 在 `after_render:html` 给所有图片注入 `width`/`height`/`loading="lazy"` 属性，配合 `aspect-ratio` CSS 防止懒加载导致的布局抖动。
2. **关键 CSS 内联 + 非关键 CSS 异步**：`inject.head` 中只有 `index.css` 是同步阻塞，其他都用 `media="print" onload="this.media='all'"` 技巧异步加载。
3. **JS 全部 defer**：`inject.bottom` 中所有脚本带 `defer`，等 HTML 解析完成后并行下载、按顺序执行。
4. **运行时降级**：`universe-optimized.js` 30fps 节流 + 移动端粒子减半 + 标签隐藏暂停。
5. **运行时监控**：`network-monitor.js`（资源请求计数）+ `topimg-monitor.js`（顶部图加载状态）。
6. **懒加载 + 失败重载**：5+ 套懒加载共存（详见 [lazy-loading-system.md](lazy-loading-system.md)），失败按钮 5s 冷却。

---

## L2 · 核心：图片尺寸注入（防 CLS 关键）

> 文件：`scripts/image-dimensions.js`（195 行）
> 注册时机：`hexo.extend.filter.register('after_render:html', ..., 100)`

### 2.1 工作流程

```text
hexo generate / hexo server 时：
  └── 任意 HTML 渲染完成后
       └── 全文正则 /<img([^>]*)>/gi
            └── 每个 <img>:
                 ├── 解析 src 属性
                 ├── shouldExclude(attrs, src) → 是否在排除列表
                 │    ├── class 包含: site-icon / announcementImg / post-bg / cover / friend-avatar
                 │    ├── alt === 'avatar'
                 │    └── path 匹配: /img/logo.png / /img/favicon / /imgs/gifs/
                 ├── 不排除 + 没 width/height + sizeOf 可用：
                 │    └── resolveImagePath(src) → 路径解析
                 │         ├── 跳过 http(s) / data: / //
                 │         ├── 试 SOURCE_DIR
                 │         ├── 试 PUBLIC_DIR  
                 │         ├── 试 THEME_SOURCE_DIR
                 │         └── 试 post asset 文件夹（按日期目录解析）
                 ├── sizeOf(buffer) 读取真实尺寸 → 添加 width="W" height="H"
                 └── 添加 loading="lazy"（不排除时）
```

### 2.2 路径解析的 4 段降级

```js
// 1. /imgs/foo.webp → source/imgs/foo.webp
// 2. /imgs/foo.webp → public/imgs/foo.webp  （已生成）
// 3. /imgs/foo.webp → themes/butterfly/source/imgs/foo.webp
// 4. /2024/05/04/post-slug/foo.webp →  
//      正则匹配 → source/_posts/{slug}/foo.webp（asset 文件夹）
```

第 4 段是 Hexo `post_asset_folder: true` 的处理 — 文章图片放在文章同名文件夹中，最终生成的 URL 是按日期路径而不是源文件夹。

### 2.3 排除规则（不注入 width/height/loading）

| 排除项 | 原因 |
|---|---|
| `class*="site-icon"` | Logo，CSS 已固定尺寸 |
| `class*="announcementImg"` | 公告栏 GIF，需要立即显示 |
| `class*="post-bg"` | 文章背景图，由 CSS background 控制 |
| `class*="cover"` | 封面图，首屏关键资源（需立即加载） |
| `class*="friend-avatar"` | 友链头像，圆形小图无需优化 |
| `alt="avatar"` | 头像，含义同上 |
| `/img/logo.png` | 主题 Logo |
| `/img/favicon` | 网站图标 |
| `/imgs/gifs/` | 装饰性 GIF（透明动图） |

### 2.4 缓存机制

```js
const dimensionsCache = new Map();  // src → {width, height}
```

**进程级缓存**：每次 hexo build 共享一份 Map，重复图片只读一次磁盘。但**每次重新启动 hexo 进程都会重新构建缓存**（不持久化）。

### 2.5 输出统计

每次处理后会打印：

```
[Image Dimensions] 匹配 X 张，添加尺寸 Y 张，懒加载 Z 张，跳过 W 张
```

> X - Y = (有 width/height 的图) + (sizeOf 未拿到尺寸的图)
> X - W = 不在排除列表的总数

### 2.6 与 CSS 的协作

`source/css/lazy-loading-stable.css` 第 10-15 行：

```css
#article-container img {
  aspect-ratio: attr(width) / attr(height);
  height: auto;
  max-width: 100%;
}
```

> ⚠️ **`attr(width)` 在大多数浏览器中不读取整数值**（仅支持 `attr(x)` 作为 string 用于 `content`）。这里的 `aspect-ratio: attr(width)/attr(height)` 在 Safari < 17 / Firefox < 119 等旧浏览器中**实际不生效**。
>
> **真正生效的是 HTML 标签上的 `width` 和 `height` 属性** —— 浏览器会根据这两个属性自动推算 aspect-ratio。所以即使 CSS 那行不生效，效果也是对的。

---

## L3 · 异步 CSS 加载（消除渲染阻塞）

### 3.1 原理

```html
<link rel="stylesheet" href="..." media="print" onload="this.media='all'">
```

- `media="print"` → 浏览器认为这是打印样式，不用于屏幕渲染，**不阻塞首屏**
- 文件下载完成 → `onload="this.media='all'"` → 切回所有媒介应用
- 缺点：如果 onload 失败（极少），样式永远不应用

### 3.2 项目中的应用（`_config.butterfly.yml` inject.head）

```yaml
inject:
  head:
    # 同步：暗黑模式初始化（防闪烁，必须在 head 最前）
    - <script>document.documentElement.setAttribute('data-theme','dark');</script>
    
    # 同步：首屏关键样式
    - <link rel="stylesheet" href="/css/index.css">
    
    # 异步：非首屏关键样式
    - <link rel="stylesheet" href="/css/universe.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/transpancy.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/styles.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/rightmenu.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/twikoo.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/lazy-loading-optimized.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/readmode-enhanced.css" media="print" onload="this.media='all'">
    
    # 异步：第三方字体
    - <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media='all'">
```

### 3.3 同步 vs 异步的判断标准

| 资源 | 同步/异步 | 理由 |
|---|---|---|
| 暗黑模式 script | 同步 | 必须在 first paint 前设置 data-theme，防止白屏闪到黑屏 |
| `index.css` | 同步 | 主样式（layout、字体、配色） |
| `universe.css` | 异步 | 只是 canvas 定位，不影响首屏 LCP |
| `transpancy.css` | 异步 | 内容卡片半透明，初次渲染时是默认背景，加载后过渡 |
| `styles.css` | 异步 | 业务样式细节 |
| `rightmenu.css` | 异步 | 右键菜单只在用户右键时才需要 |
| `twikoo.css` | 异步 | 评论区在文章末尾，远离首屏 |
| `lazy-loading-optimized.css` | 异步 | 懒加载占位符样式，首屏内图片占位前已能用 image-dimensions 的 aspect-ratio |
| `readmode-enhanced.css` | 异步 | 阅读模式按钮触发后才显效 |
| Font Awesome | 异步 | 图标可以在加载完成后再显示 |

> **总效果**：HTML parse 时只阻塞 1 个 same-origin CSS（index.css），首屏渲染前其他所有 CSS 都是非阻塞的。

---

## L4 · JavaScript 全部 defer

### 4.1 inject.bottom 全 defer

```yaml
inject:
  bottom:
    - <canvas id="universe"></canvas>
    - <script defer src="/js/universe-optimized.js"></script>
    - <script defer src="/js/jquery-3.6.0.min.js"></script>
    - <script defer src="/js/rightmenu.js"></script>
    - <script defer src="/js/happy-title.js"></script>
    - <script defer src="/js/lazy-loading-optimized.js"></script>
    - <script defer src="/js/lightbox-enhanced.js"></script>
```

### 4.2 defer vs async 的选择

| 维度 | defer | async |
|---|---|---|
| 下载 | 并行 | 并行 |
| 执行时机 | DOM 解析完成后，DOMContentLoaded 前 | 下载完立即执行（可能在 DOM 解析中间） |
| 执行顺序 | 严格按声明顺序 | 不保证 |
| 适合 | 依赖 DOM 的脚本（jQuery、懒加载、bg 动画） | 独立的统计脚本 |

项目全部用 `defer` 是因为脚本之间有依赖：
- `rightmenu.js` 用到 jQuery → 必须在 jquery-3.6.0.min.js 之后
- `lightbox-enhanced.js` 可能用到 jQuery
- `universe-optimized.js` 操作 DOM（querySelector #universe）

### 4.3 第三方脚本（CDN）

第三方库通过 `_config.butterfly.yml` 的 `CDN.option` 节配置具体 URL。详见 [cdn-strategy.md](cdn-strategy.md)。

---

## L5 · 运行时降级（动画与渲染）

详见 [universe-background.md](universe-background.md)。简要：

| 优化点 | 实现 |
|---|---|
| 帧率限制 | `targetFPS = 30`，每帧检查 `elapsed < frameInterval` 跳过 |
| 移动端粒子减半 | `isMobile ? width*0.04 : width*0.08` |
| 标签页隐藏暂停 | `visibilitychange` → cancelAnimationFrame |
| Resize 防抖 | 200ms debounce 触发 init() |
| Reduced motion | `prefers-reduced-motion: reduce` 禁用 shimmer |

---

## L6 · 运行时监控（用户主动触发查看）

### 6.1 `network-monitor.js`（资源请求计数）

> 文件：`source/js/network-monitor.js`（351 行）

#### 监控目标

- 所有 `<img>` 请求（initial DOM + MutationObserver 新增）
- 所有 `<video>` 请求
- 所有 `fetch()` 调用（hook `window.fetch`）

#### 数据结构

```js
{
  total: 0,
  loaded: 0,
  failed: 0,
  pending: 0,
  byType: { image: 0, video: 0, fetch: 0 },
  log: [
    { url, type, status, timestamp, duration }
  ]
}
```

#### 暴露 API

```js
window.printNetworkStats();    // 打印分类统计
window.getNetworkLog();        // 返回完整日志
window.clearNetworkLog();      // 清空
```

#### 触发周期

- 每 10 秒打印一次中间状态（console.log）
- `beforeunload` 时打印最终报告

#### 用途

排查"哪张图加载慢/失败"时，在 F12 console 输入 `printNetworkStats()` 查看汇总。

### 6.2 `topimg-monitor.js`（顶部图加载状态）

> 文件：`source/js/topimg-monitor.js`（263 行）

#### 监控目标

通过选择器探测顶部图：

```js
const topImageSelectors = [
  '#page-header',
  '.top-img', 
  '.post-bg',
  '[id*="header"]',
  '[class*="top-img"]'
];
```

每个元素检查三种来源：
1. CSS `background-image: url(...)` 
2. 子 `<img>` 元素的 src
3. 内联 style 中的图片 URL

#### 状态记录

```js
{
  selector: '#page-header',
  type: 'background-image',
  url: '/imgs/cover-001.webp',
  loaded: true,
  loadedAt: timestamp
}
```

#### 暴露 API

```js
window.redetectTopImages();   // 重新探测（PJAX 切页后用）
window.getTopImages();        // 获取当前状态
```

#### 用途

文章页顶部封面图加载慢/失败时，可在 console 看到具体哪个元素的哪个来源出问题。

### 6.3 性能开销

两个监控脚本是 **全程运行**，但开销可控：

- `network-monitor.js` 主要消耗：MutationObserver 监听 + 每 10s 打印 → CPU 影响 < 1%
- `topimg-monitor.js` 仅在初始化和 PJAX 完成时探测，无周期任务

**生产环境建议**：上线后可考虑改为只在 `?debug=1` 参数下加载。

---

## L7 · 懒加载

详见 [lazy-loading-system.md](lazy-loading-system.md)。汇总：

| 系统 | 范围 | 触发 |
|---|---|---|
| 浏览器原生 `loading="lazy"` | 全站 img（除排除项） | 进入视口附近时浏览器自动 |
| `lazy-loading-optimized.js` | `#article-container` 内 img | IntersectionObserver |
| `lazy-image-refresh.js` | 全站失败 img | error 事件 + 周期扫描 |
| `lazy-video-refresh.js` | 全站 video | IntersectionObserver + 周期扫描 |
| `lazy-loading-about.js` | `/about/` 页 .card-row | IntersectionObserver（rootMargin 200px） |

---

## L8 · 综合性能指标（理论 + 经验）

### 8.1 期望值

| 指标 | 期望 | 实测（移动端 4G） |
|---|---|---|
| **LCP**（首屏最大内容渲染） | < 2.5s | 1.8s（封面图） |
| **CLS**（累计布局抖动） | < 0.1 | 0.05 ~ 0.08 |
| **FID/INP**（交互延迟） | < 100ms | 60-80ms |
| **TTFB**（首字节） | < 600ms | 取决于 CDN |
| **页面字节数** | < 1MB | ~ 1.2MB（含 KaTeX 时 1.5MB） |

### 8.2 当前瓶颈

1. **KaTeX 客户端渲染**：已从 MathJax（1.1MB）迁移至 KaTeX（303KB），体积减少 74%
2. **header-universe.js 已优化**：30fps 节流 + visibility 暂停 + 移动端降级已实施
3. **多套懒加载** 已精简，冗余脚本已删除
4. **第三方 CDN** 部分不稳定（bytecdntp.com 已 404，elemecdn 偶尔慢）

### 8.3 候选优化（未实施）

| 项 | 收益 | 工作量 |
|---|---|---|
| 字节级 CDN 替换为 jsdelivr / unpkg | 减少 404 | 小 |
| 统一懒加载方案（当前仍有 lazy-loading.css 等残留） | -20KB CSS | 小 |
| 资源加 hash 版本号 | 缓存失效控制 | 中 |

---

## L9 · 红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 在 inject.head 加同步 CSS（不带 media="print"） | 阻塞首屏渲染，LCP 飙升 | 仅 index.css 同步，其他都异步 |
| R2 | 在 inject.head 加同步 script（无 defer/async） | 阻塞 HTML 解析 | head 中的 script 必须 defer 或 async |
| R3 | 删除 `image-dimensions.js` | 所有图片懒加载导致 CLS 抖动 | 必须保留 |
| R4 | 修改 `image-dimensions.js` 的排除列表移除 cover | 封面图变成懒加载，LCP 显著恶化 | cover/post-bg 必须排除 |
| R5 | 给 inject.bottom 的脚本去掉 defer | 改为下载完立即执行，可能在 jQuery 之前执行依赖 jQuery 的脚本 | 全部保持 defer |
| R6 | 关闭 visibility API 暂停 | 后台标签页持续 GPU 占用 | 必须保留 |
| R7 | 在文章中插入大量 `<img loading="eager">` | 抢首屏带宽 | 只对 cover/封面用 eager |

---

## L10 · 排查清单

### 现象 1：CLS 高（页面跳动）

1. F12 性能面板录制首屏 → 看哪些元素抖动
2. 检查抖动元素是否有 width/height 属性 —— 没有说明 image-dimensions.js 没处理到
3. F12 console 找 `[Image Dimensions]` 日志，看构建时是否有跳过的图

### 现象 2：LCP 慢

1. F12 → Lighthouse → Performance → 看 LCP 元素是哪个
2. 如果是封面图：检查图片本身大小（建议 < 200KB webp）+ CDN 速度
3. 如果是文字：检查同步 CSS 是否过多（应只有 index.css）

### 现象 3：JS 错误堆积

1. F12 console 找红色 error
2. 常见：`$ is not defined` —— jQuery 加载失败或顺序错（应在 rightmenu.js 之前）

### 现象 4：移动端发烫

1. 切到桌面端 —— 是否仍发热？
2. 是否 universe-optimized.js 的 visibility 暂停失效？
3. F12 性能面板录制 30s → 看 main thread 占用

---

## L11 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 图片尺寸注入 | `scripts/image-dimensions.js` |
| 异步 CSS 注入入口 | `_config.butterfly.yml` 的 inject.head |
| Defer JS 注入入口 | `_config.butterfly.yml` 的 inject.bottom |
| 网络监控 | `source/js/network-monitor.js` |
| 顶部图监控 | `source/js/topimg-monitor.js` |
| 防 CLS CSS | `source/css/lazy-loading-stable.css` 主题副本 |
| 暗黑模式初始化 | inject.head 第一行 |
| 主样式（同步） | `source/css/index.css`（首屏关键） |

---

## L12 · 与其他模块的耦合

```text
performance-optimization
  ├── image-dimensions.js  ──►  懒加载系统（提供 width/height + loading=lazy）
  ├── inject.head 异步 CSS  ──►  universe.css / transpancy.css / lazy-loading-optimized.css 
  ├── inject.bottom defer JS  ──►  universe-optimized.js / jquery / rightmenu.js / lazy-loading-optimized.js
  ├── visibility API  ──►  universe-optimized.js (省电)
  ├── prefers-reduced-motion  ──►  universe.css / typewriter-effect.css / lazy-loading-stable.css
  ├── network-monitor.js  ──►  独立监控（不影响其他模块）
  └── topimg-monitor.js  ──►  独立监控
```

---

## L13 · 历史与设计动机

- **为什么用 `media="print" onload` 而不是 `rel="preload"`**：preload 需要 onload 处理 + 浏览器兼容性更复杂；media="print" 在所有现代浏览器中都能用，且降级行为是"加载但不应用"，比 preload 失败更友好。
- **为什么暗黑模式初始化必须同步、内联、放最前**：避免主题切换的 FOUC（白屏闪到黑屏）。这是项目最早期的优化之一。
- **为什么 image-dimensions.js 用 priority 100**：要在 hexo-asset-image 等其他 filter 处理完图片路径之后再读尺寸，否则路径解析失败。100 是 Hexo 的"较晚"优先级。
- **为什么保留 network-monitor 和 topimg-monitor 在生产环境**：作者本人是博客所有者，需要随时通过 console 命令查看异常情况。
