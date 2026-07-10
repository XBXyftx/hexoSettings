---
name: 懒加载系统全图谱（图片 + 视频 + 关于页 + 主题三层并存）
description: 项目中并存的多套懒加载实现的关系图、加载顺序、覆盖范围、冲突点与候选优化，对应用户重点关注的"页面懒加载"
type: project
---

# 懒加载系统 — 全图谱

> **当前状态（2026-07-10 核验）**：旧 lazy-loading/refresh 脚本已删除，实际运行时为浏览器原生 `loading="lazy"`、文章图片的 `lazy-loading-optimized.js`、about 专用脚本，以及两个仍全站加载的占位 CSS。长图文的 `.lazy-placeholder` 无限 shimmer/blur 是当前性能问题，不应再把本文描述成“多套脚本并存冲突”。完整优先级见 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md)。
>
> **何时阅读**：图片/视频不显示问题排查、CLS 优化、懒加载逻辑调整、拒绝重复加载逻辑时。
> **关联文档**：[performance-optimization.md](performance-optimization.md)（图片尺寸注入与防 CLS）· [_config.butterfly.yml](../05-reference/project-overview.md)（lazyload.enable / inject.head 注入）

---

## L1 · TL;DR（30 秒看完）

- 项目当前有 **3 个互补层次**，不是三套全站并行脚本：
  1. **浏览器原生 `loading="lazy"`**（`image-dimensions.js` 构建期注入；主题 `lazyload.enable: false`）
  2. **`lazy-loading-optimized.js`**（主题目录）— 文章图片的 `IntersectionObserver`
  3. **`lazy-loading-about.js`**（source/about）— 关于页面 card-row 级图片加载与 3D 轮播
- 旧 `lazy-loading.js`、native、image/video refresh 系列及其 CSS 已删除；不要恢复或引用它们。
- `source/css/lazy-loading.css` 和 `source/css/lazy-loading-stable.css` 仍由 `head.pug` 加载。前者的 `.lazy-placeholder` shimmer、旋转 pseudo-element、blur/backdrop-filter 在长图文加载期是当前 P2 性能风险。
- 图片尺寸注入会给非排除图片加 `width`/`height`/`loading="lazy"`，用于保留布局空间、降低 CLS。

---

## L2 · 各套懒加载并存关系图

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     Butterfly 主题原生懒加载                            │
│                     状态：禁用（lazyload.enable: false）                │
│                     原因：被自定义实现取代                              │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  浏览器原生 loading="lazy"                                              │
│  ─ 由 scripts/image-dimensions.js 自动注入到所有 <img>（生成时）        │
│  ─ 排除：site-icon, announcementImg, post-bg, cover, friend-avatar      │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  lazy-loading-optimized.js（主题目录） — 主要图片懒加载                 │
│  ─ 由 _config.butterfly.yml inject.bottom 加载                          │
│  ─ IntersectionObserver, rootMargin 100px                               │
│  ─ 选择器：#article-container img[data-src], .post-content img[data-src]│
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  lazy-loading-about.js（关于页专用）                                    │
│  ─ 仅 /about/ 页面使用                                                  │
│  ─ card-row 级别懒加载，进入视口才加载该 row 内所有图片                 │
│  ─ 加载完成后启动该 row 内的 3D 轮播图                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

> **已删除的系统**（2026-05-05 ~ 2026-05-06 精简）：`lazy-loading.js`（旧版兼容回退）、`lazy-loading-native.js`（source + theme 双重）、`lazy-image-refresh.js`（图片刷新按钮）、`lazy-video-refresh.js`（视频懒加载+刷新）。详见 [操作日志 #5](../04-operations/operation-log.md) 和 [#6](../04-operations/operation-log.md)。

---

## L3 · `lazy-loading-optimized.js`（主图片懒加载）

> 文件：`themes/butterfly/source/js/lazy-loading-optimized.js`（173 行）
> 加载方式：`_config.butterfly.yml` inject.bottom

### 3.1 配置

```js
const config = {
  rootMargin: '100px 0px',
  threshold: 0.01,
  fadeInDuration: 600    // ms
};
```

### 3.2 选择器

| 包含 | 排除 |
|---|---|
| `#article-container img[data-src]` | `#page-header` 内 |
| `.post-content img[data-src]` | `.avatar` 元素 |
| `#article-container img[data-lazy-src]` | `.aside-card` 内 |
| `.post-content img[data-lazy-src]` | （TOC、侧边栏、头像等不参与） |

### 3.3 工作流程

```text
prepareImages()
  ├── 找所有 #article-container img:not([data-src])
  ├── 排除 #page-header / .avatar / .aside-card 内的
  ├── 把 src 移到 data-src
  └── src 设为 1x1 透明 GIF 占位符

createObserver()
  └── IntersectionObserver(rootMargin: 100px, threshold: 0.01)
       └── 进入视口 → loadImage(img)
            ├── 创建 new Image() 预加载
            ├── 成功 → img.src = data-src; classList add 'lazy-loaded'
            ├── 失败 → classList add 'lazy-error'
            └── opacity 0 → 1 用 600ms 过渡
```

### 3.4 PJAX 适配

监听 `pjax:complete`，重新跑初始化（防止切换文章后图片不懒加载）。

---

## L4 · 已删除的懒加载系统（历史记录）

以下系统于 2026-05-05 ~ 2026-05-06 被移除（操作日志 #5、#6）：

| 文件 | 原用途 | 删除原因 |
|---|---|---|
| `source/js/lazy-loading.js` (387行) | 详尽日志版图片懒加载 | init 被架空，scroll 路径重复工作 |
| `source/js/lazy-loading-native.js` (159行) | 原生 lazy 增强 | 对 1x1 GIF 执行无意义 fadeIn |
| `themes/butterfly/source/js/lazy-loading-native.js` (159行) | 同上（重复文件） | 与 source/js/ 版本重复 |
| `source/js/lazy-image-refresh.js` (440行) | 图片失败刷新按钮 | 持续扫描但从未触发 |
| `source/js/lazy-video-refresh.js` (580行) | 视频懒加载+刷新 | 有 `loadVideo(src=undefined)` bug |
| `source/css/lazy-image-refresh.css` (6KB) | 图片刷新按钮样式 | 对应 JS 已删除 |
| `source/css/lazy-video-refresh.css` (8.8KB) | 视频刷新按钮样式 | 对应 JS 已删除 |

**保留的文件**：
- `source/css/lazy-loading.css` — 仍被 `head.pug:62` 引用；`.lazy-placeholder` 视觉效果由此提供，长图文优化时要限制其无限动画范围
- `source/css/lazy-loading-stable.css` — `head.pug:64` 加载，辅助图片尺寸/占位稳定性
- `themes/butterfly/source/js/lazy-loading-optimized.js` — 当前文章图片主力
- `source/about/lazy-loading-about.js` — 关于页专用，独立维护

**API 兼容说明**：`lazy-loading-native.js` 暴露的 `window.lazyLoadPreload(element, offset)` 已删除；涉及旧 API 的调用必须使用 `typeof` 守卫。当前 `main.js` 对该调用已有守卫。

---

## L8 · `lazy-loading-about.js`（关于页专用 card-row 级懒加载 + 3D 轮播）

> 文件：`source/about/lazy-loading-about.js`（371 行）

### 8.1 与其他懒加载的根本差异

- **以 `.card-row` 为单位**懒加载，不是单张图。
- 一个 row 进入视口 → 一次性加载 row 内**所有图片**。
- 加载完成 → 自动启动该 row 内的 **3D 走马灯（carousel）**。

### 8.2 配置

```js
{
  rootMargin: '200px 0px 200px 0px',   // 比通用方案更宽
  threshold: 0.1
}
```

### 8.3 流程

```text
initAboutPageLazyLoading()
  ├── preprocessImages()    // 所有 .card-row img
  │    └── src → data-original; src = 1×1 GIF; opacity 0.3
  ├── createCardRowObserver()
  ├── observeCardRows()
  └── loadHeroImages()       // 立即加载 .hero-section img / .avatar
```

### 8.4 3D 轮播的 5 个状态

```text
slides 状态：
  active        → 当前显示
  prev          → 左侧（上一张）
  next          → 右侧（下一张）
  prev-hidden   → 更远处的左侧（远景）
  next-hidden   → 更远处的右侧（远景）
```

CSS 通过这些类切换 `transform: translateX/Y/Z` + `opacity` 实现 3D 效果。

### 8.5 错峰自动轮播

- `delay = cardRowIndex * 800ms` —— 不同 row 错开启动时间
- `interval = 3500 + (cardRowIndex % 4) * 500ms` —— 3.5s 到 5s 不等
- 鼠标 hover 时暂停（`!carousel.matches(':hover')`）

### 8.6 暴露 API

```js
window.AboutPageLazyLoading = {
  init, destroy, getStatus,
  forceLoadCardRow(index)  // 强制加载某个 row
};
```

---

## L9 · CSS 配套

| 文件 | 用途 | 加载方式 |
|---|---|---|
| `themes/butterfly/source/css/lazy-loading-optimized.css` | optimized JS 配套，淡紫色占位符 + lazyShimmer 1.5s | inject.head 异步加载 |
| `source/css/lazy-loading.css` | 魔法漩涡风格占位符（兼容回退） | head.pug 加载 |
| `source/css/lazy-loading-stable.css` | 稳定版懒加载样式 + scroll-margin-top 90px（标题锚点缓冲） | inject.head 加载 |

> **已删除的 CSS**：`lazy-image-refresh.css`、`lazy-video-refresh.css` 已于 2026-05-06 随对应 JS 物理删除。

> **CSS 中的 `aspect-ratio: attr(width) / attr(height)`** —— 利用 `image-dimensions.js` 注入的 width/height 属性自动维持图片宽高比，**防 CLS 关键**。

> **手机端**：`prefers-reduced-motion` + `max-width: 768px` 都会禁用 lazyShimmer 动画，节省 GPU。

---

## L10 · 加载顺序与协作机制

```text
T = 0     hexo generate 时：
            scripts/image-dimensions.js 给所有 <img> 加 width / height / loading="lazy"
            
T = 0     页面加载：
            inject.head 异步加载 lazy-loading-optimized.css 等占位符样式
            浏览器原生 loading="lazy" 自动延迟非视口内的 <img> 请求
            
T = ~50ms DOMContentLoaded:
            lazy-loading-optimized.js 接管，给所有图片加 IntersectionObserver
            
T = 100ms+ 用户滚动:
            IntersectionObserver 触发 → 图片加载
```

> **已删除的周期任务**：`lazy-image-refresh.js` 和 `lazy-video-refresh.js` 的 3s 周期扫描、scroll 监听、error 事件监听已于 2026-05-05 随脚本移除。

---

## L11 · 红线（这些行为会破坏懒加载）

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 在 `_config.butterfly.yml` 中重新启用 `lazyload.enable: true` | Butterfly 原生懒加载 + 自定义并发，可能给同一张图加两个观察器 | 保持禁用 |
| R2 | 删除 `image-dimensions.js` 但保留 `lazy-loading-stable.css` | aspect-ratio 失效，所有图片占位符塌缩，CLS 暴涨 | 二者必须共存 |
| R3 | 在文章中给 img 加 inline style `width: 100%` | 覆盖 image-dimensions 注入的 width 属性，aspect-ratio 失效 | 用 CSS 类，不用 inline width |
| R4 | 在文章正文里添加 `loading="eager"` 强制立即加载 | 抢首屏带宽，影响关键资源加载 | 只在封面图上用 eager |
| R5 | 给 #article-container 加 `overflow: hidden` | IntersectionObserver 在某些浏览器中失效 | 用 `overflow: visible` 或不加 |

---

## L12 · 排查清单

### 现象 1：图片始终是占位符不加载

1. F12 元素 → 是否 `<img loading="lazy" data-src="...">` 但 src 仍是 1x1 GIF？
2. F12 网络面板 → 滚动到图片附近，是否有图片请求？
   - 没请求 → IntersectionObserver 没触发
   - 检查 `#article-container` 是否在 #post 内，因为 lazy-loading-optimized.js 只观察该容器
3. 浏览器是否支持 IntersectionObserver？（IE11 不支持，自动 fallback 到加载所有）
4. F12 console 是否有 `[Lazy Loader]` 日志？看到 prepare 但没看到 load 说明观察器没触发

### 现象 2：图片加载完仍是模糊/灰

1. 检查 CSS 类：是否仍有 `lazy-loading` 没被替换为 `lazy-loaded`？
2. 是否 lazy-loading-stable.css 的 `filter: blur(3px)` 没被移除？
3. F12 计算样式 → opacity 是否被某规则强制为 < 1？

### 现象 3：刷新按钮不出现

1. F12 console 检查 `lazy-image-refresh.js` 是否加载（应有 `[Lazy Refresh] 图片刷新功能已初始化`）
2. 失败图片是否有 `.lazy-error` 类？没有 → handleImageError 没被调用
3. 父元素是否已是 `.lazy-image-container`？是 → 已经有按钮，可能被 CSS 隐藏

### 现象 4：关于页轮播图不动

1. F12 元素 → `.card-row.images-loaded` 是否存在？
   - 不存在 → loadCardRowImages 没完成
2. F12 console 是否有 `[About Lazy Loading] Card-row N 3D轮播已启动`？
3. 检查是否 hover 在 carousel 上（hover 时暂停）

---

## L13 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 主图片懒加载 JS | `themes/butterfly/source/js/lazy-loading-optimized.js` |
| 关于页 card-row 懒加载 + 3D 轮播 | `source/about/lazy-loading-about.js` |
| 主图片懒加载 CSS | `themes/butterfly/source/css/lazy-loading-optimized.css` |
| 防 CLS 稳定 CSS | `source/css/lazy-loading-stable.css` |
| 兼容回退占位符 CSS | `source/css/lazy-loading.css` |
| 图片尺寸注入 | `scripts/image-dimensions.js` |
| Butterfly 原生 lazy 配置 | `_config.butterfly.yml` 的 `lazyload:` 节（已禁用） |
| 加载入口 | `_config.butterfly.yml` 的 inject.head / inject.bottom |

---

## L14 · 已解决的候选 BUG

以下问题已在 2026-05-05 ~ 2026-05-06 的懒加载精简中解决：

1. ~~**重复文件**~~：`lazy-loading-native.js`（source + theme 双重）— 已删除。
2. ~~**死代码**~~：`lazy-loading.js` 387 行未被 inject 加载 — 已删除（后确认为 head.pug 加载，但操作 #5 验证 init 被架空后仍移除）。
3. ~~**未启用 CSS**~~：`lazy-image-refresh.css`、`lazy-video-refresh.css` — 已随对应 JS 删除。
4. ~~**3 秒周期扫描的 CPU 消耗**~~：`lazy-image-refresh.js` 和 `lazy-video-refresh.js` — 已随脚本删除。
5. ~~**scroll 监听器**~~：`lazy-image-refresh.js` 的滚动扫描 — 已随脚本删除。

**当前仍存在的优化空间**：
- PJAX 切页后 `lazy-loading-optimized.js` 的 IntersectionObserver 未 disconnect（内存泄漏风险）
- `lazy-loading-about.js` 的 3D 轮播 setInterval 在 PJAX 离开 /about/ 后未清理

---

## L15 · 历史与设计动机

- **为什么从 Butterfly 原生 lazyload 切换到自定义**：原生 lazyload 与 image-dimensions 注入的 width/height 属性配合不佳；自定义实现能精确控制选择器、过渡动画、预加载半径。
- **为什么 image-refresh 有 5s 冷却**：早期被用户连点导致服务器 502，5s 是经验值。
- **为什么 about 页面单独写一套**：`.card-row` 是 about 页特有的多图行，需要"成行加载并启动该行轮播"的整体语义，通用懒加载做不到。
- **为什么 lazy-loading-native.js 和 optimized 并存**：原生 `loading="lazy"` 是浏览器层级，对站点首屏（不在 #article-container 内的图）也有效；optimized 是 JS 接管 + 视觉效果。两者互补。
