---
name: 整体性能优化方案（图片尺寸 + 异步 CSS + defer JS + 监控 + 懒加载）
description: 项目首屏性能优化的完整工程实践 — image-dimensions 防 CLS、media=print 异步 CSS、defer JS、network-monitor / topimg-monitor 监控、节流降级
type: project
---

# 整体性能优化方案

> **状态说明（2026-07-10 核验）**：本文保留早期性能设计与历史决策，但 L1/L6/L8 中的 network-monitor、topimg-monitor、旧 lazy-loading 系列等已删除，且部分“实测/当前瓶颈”结论已过时。当前运行时问题排序、产物证据和验证方法以 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md) 为准。
>
> **何时阅读**：性能问题排查（LCP / CLS / FID 高）、调整 inject 顺序、新增性能监控、移动端卡顿调研、PageSpeed 报告异常时。
> **关联文档**：[lazy-loading-system.md](lazy-loading-system.md)（懒加载是性能的一部分）· [universe-background.md](universe-background.md)（动画性能）· [cdn-strategy.md](cdn-strategy.md)（待写）

---

## L1 · TL;DR（30 秒看完）

项目目前可确认的性能策略与待治理项：

1. **构建期防 CLS**：`scripts/image-dimensions.js` 为可解析的图片注入 `width`/`height`/`loading="lazy"`，浏览器可据此保留布局空间。
2. **资源注入**：`inject.head` 保留关键 CSS，其他自定义样式使用 `media="print"` 异步加载；但当前产物有重复的 `index.css` 和 Font Awesome，不能称为完全去重。
3. **脚本加载**：`inject.bottom` 自定义脚本使用 `defer`，但主题/插件仍有各自加载路径，必须以生成 HTML 核验。
4. **动画降级**：两个星空脚本各有 30fps、移动端降级和标签隐藏暂停；前台双 Canvas 仍会叠加。
5. **当前明确热点**：全站 Swiper 注入、重媒体文章、页脚 timer、重复 CSS/Font Awesome，以及仍缺可信尺寸的外部正文图；文章 placeholder 动画和目录跳转媒体偏移已于 2026-07-11 在本地治理并验证。
6. **运行时监控**：旧 `network-monitor.js` 与 `topimg-monitor.js` 已删除，不再存在生产监控模块。

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
| `lazy-loading-optimized.css` | 文章页同步 | 仅文章图片的静态占位与近视口状态；由 `head.pug` 按 post 条件加载，避免全站样式和占位闪烁 |
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

## L6 · 已移除的历史运行时监控

`network-monitor.js` 与 `topimg-monitor.js` 已在 2026-05 的清理中从当前工作树移除；本文原先关于其 API、周期和“生产环境开销”的内容仅适用于当时的历史版本，不能作为当前实现依据。

若以后需要诊断资源问题，优先使用浏览器 DevTools Network/Performance 录制，或设计成**显式的本地开发开关**：不得全站常驻 hook `fetch`、全局 `MutationObserver` 或周期性生产日志。

---

## L7 · 当前懒加载边界

当前文章图片由浏览器原生 `loading="lazy"` 负责请求时机；`themes/butterfly/source/js/lazy-loading-optimized.js` 仅在图片接近视口时追踪结算状态、限制动态占位视觉，并向 TOC 事务发送媒体结算事件。`head.pug` 只为文章页加载对应的 `lazy-loading-optimized.css`；旧的 `source/css/lazy-loading.css` 与 `source/css/lazy-loading-stable.css` 已不再由当前主题加载。

| 机制 | 当前范围 | 触发/注意 |
|---|---|---|
| 浏览器原生 `loading="lazy"` | `image-dimensions.js` 未排除的图片 | 浏览器视口附近加载；本地图片有 width/height 时可预留准确比例 |
| `lazy-loading-optimized.js` | `#article-container` / `.post-content` 内图片 | 观察近视口加载结算；动态 shimmer 只限近视口 placeholder；有销毁路径 |
| TOC 重锚定 | 桌面侧栏与移动目录 | 图片结算/文章尺寸变化后 RAF 校正；用户输入或 3.5 秒上限即取消 |
| `lazy-loading-about.js` | `/about/` 的 `.card-row` | 行进入 200px rootMargin 后加载；独立于文章页机制 |

外部图片和 data URI 无法在构建期安全读取尺寸，仍是普通阅读 CLS 的边界；目录点击会有限校正最终标题位置，但不伪造外部比例。详见 [lazy-loading-system.md](lazy-loading-system.md)。

---

## L8 · 当前测量纪律与瓶颈

不要将旧文档中的“移动端 4G 实测值”“CPU < 1%”或预计百分比当作当前数据；本次只读审计未进行真实浏览器跑分。当前需要在目标设备建立基线的优先顺序：

1. **移动首页 waterfall**：100ms 轮询、滚动/触摸后的样式重写和调试 observer。
2. **全站双 Canvas**：两个 30fps 星空 RAF 前台叠加。
3. ~~**Mermaid**：170 个已生成页面的 `mermaid@undefined` 失败请求及无效按需 URL。~~ **已由 P2 处理**：站内当前无 Mermaid 图，已关闭并在生成态验证请求为 0；未来新增图表时再以固定版本按需加载。
4. **重媒体文章**：102 个 MP4、约 487MB 总静态媒体；单页最高约 153MB MP4，总计 18–19 段视频的文章存在明显加载/解码风险。
5. **全站 Swiper 注入、重复 CSS/Font Awesome、页脚 4Hz timer、长文占位动画**。

所有优化都要先录制优化前后 trace；完整表格、受影响页面、验收与不可确认的生产网络边界见 [2026-07-10 审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md)。

---

## L9 · 红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 以为 `inject.head` 只有一份关键 CSS | 当前 `head.pug` 与 inject 都有 `/css/index.css`，且 Font Awesome 也重复 | 修改资源前先检查生成 HTML；去重后做首屏图标回归 |
| R2 | 新增无条件全站第三方脚本 | 普通页面也会解析、执行或失败重试 | 用页面节点检测或特性开关按需加载 |
| R3 | 删除 `image-dimensions.js` | 图片布局保留空间可能丢失，CLS 增加 | 必须保留或以等价尺寸策略替换 |
| R4 | 修改排除列表移除 cover | 封面被强制懒加载，LCP 可能恶化 | cover/post-bg 继续排除 |
| R5 | 让图片占位符对整篇长文无限 blur/shadow 动画 | 多图文章会有大量持续绘制/合成 | 只给可见占位符动态效果，远处静态化 |
| R6 | 关闭 Canvas 的 visibility 暂停 | 后台仍持续 GPU/CPU 工作 | 两个星空脚本都必须保留该暂停逻辑 |
| R7 | 在文章中插入大量 `<video>` 且未设预加载策略 | 元数据/解码/网络竞争放大 | 非首屏视频使用 `preload="none"`、poster、视口触发 |

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
