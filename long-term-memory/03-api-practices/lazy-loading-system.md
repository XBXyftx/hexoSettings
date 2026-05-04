---
name: 懒加载系统全图谱（图片 + 视频 + 关于页 + 主题三层并存）
description: 项目中并存的多套懒加载实现的关系图、加载顺序、覆盖范围、冲突点与候选优化，对应用户重点关注的"页面懒加载"
type: project
---

# 懒加载系统 — 全图谱

> **何时阅读**：图片/视频不显示问题排查、CLS 优化、懒加载逻辑调整、拒绝重复加载逻辑时。
> **关联文档**：[performance-optimization.md](performance-optimization.md)（图片尺寸注入与防 CLS）· [_config.butterfly.yml](../05-reference/project-overview.md)（lazyload.enable / inject.head 注入）

---

## L1 · TL;DR（30 秒看完）

- 项目当前**并存 5+ 套懒加载实现**，覆盖不同场景：
  1. **Butterfly 主题原生懒加载**（已在 `_config.butterfly.yml` 中 `lazyload.enable: false` **禁用**）
  2. **`lazy-loading-optimized.js`**（主题目录）— **目前的主要图片懒加载，由 inject 启用**
  3. **`lazy-loading.js`**（source/js）— 详尽日志版本，已经替换/不被 inject 加载（但文件仍存在）
  4. **`lazy-loading-native.js`**（source/js + theme，文件几乎完全相同 — DUPLICATE）— 兼容浏览器原生 `loading="lazy"`
  5. **`lazy-image-refresh.js`** + **`lazy-video-refresh.js`**（source/js）— 失败重载按钮（5s 冷却）
  6. **`lazy-loading-about.js`**（source/about/）— 关于页面专用 card-row 级懒加载 + 3D 轮播
- **图片尺寸注入**（`scripts/image-dimensions.js`）会给所有非排除图片加 `loading="lazy"` 属性，让浏览器原生懒加载先生效，再由 JS 接管细节。
- **冗余风险高**：多套并行可能重复处理同一张图，候选 BUG 详见 [07-known-issues/discovered-issues/](../07-known-issues/discovered-issues/)。

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
│  lazy-loading.js（source/js）— 详尽日志版本                             │
│  ─ 文件存在但**不被 inject 加载**，已被 optimized 取代                  │
│  ─ 保留作为参考实现                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  lazy-loading-native.js（source/js + theme — DUPLICATE!）               │
│  ─ 兼容浏览器原生 loading="lazy"，提供 fade-in 动画和锚点跳转预加载     │
│  ─ 暴露 window.lazyLoadPreload(element, offset) 给 TOC 跳转使用         │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  lazy-image-refresh.js + lazy-video-refresh.js（source/js）             │
│  ─ 失败的图片/视频上挂"刷新"按钮，5s 冷却                                │
│  ─ 监听全局 error 事件 + 滚动停止扫描 + 锚点跳转扫描 + 3s 周期扫描       │
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
| `#post-content img[data-src]` | `.aside-card` 内 |
| `.post-body img[data-src]` | （TOC、侧边栏、头像等不参与） |

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

## L4 · `lazy-loading.js`（详尽日志版 — 已废弃）

> 文件：`source/js/lazy-loading.js`（387 行）
> 加载方式：**未被 inject 加载**（候选删除）

### 4.1 与 optimized 的差异

| 维度 | lazy-loading.js | lazy-loading-optimized.js |
|---|---|---|
| 行数 | 387 | 173 |
| console.log | 大量调试日志 | 仅必要日志 |
| `isNativeLazyHandled(img)` 守卫 | ✅ 跳过原生 lazy 已处理 | ❌ 没这个保护 |
| scrollDelay | 200ms 防抖 | IntersectionObserver 无需防抖 |
| 已被 inject 加载 | ❌ | ✅ |

### 4.2 候选清理建议

文件保留是**历史代码**，建议在确认 optimized 稳定后删除。详见 [07-known-issues/discovered-issues/](../07-known-issues/discovered-issues/)。

---

## L5 · `lazy-loading-native.js`（DUPLICATE）

> 文件：
> - `source/js/lazy-loading-native.js`（159 行）
> - `themes/butterfly/source/js/lazy-loading-native.js`（159 行 — **完全相同**）

### 5.1 用途

依赖浏览器原生 `loading="lazy"` 属性（Chrome/Firefox/Safari 现代版本支持），脚本只做：

1. 标记已被原生处理过：`img.dataset.nativeLazyHandled = 'true'`
2. 加 fade-in 动画：opacity 0 → 1
3. 暴露 `window.lazyLoadPreload(element, offset)` —— TOC 跳转时强制提前加载滚动目标周围的图

### 5.2 暴露 API

```js
window.lazyLoadPreload = function(element, offset = 500) {
  // 在 element 周围 offset 像素内的所有 [loading="lazy"] img
  // 强制移除 loading 属性 → 立即加载
};
```

被 `vscode-breadcrumb-toc.js` 调用：当用户点击 TOC 项时，跳转目标周围的图先预加载，避免落地后才看到占位符。

### 5.3 重复文件问题

两个文件**完全相同**。其中 `themes/butterfly/source/js/` 版本是项目自定义复制进主题的（主题原版没有），目的是通过主题 inject 来加载。**source/js/** 那份则没用上 —— 候选删除，详见 [07-known-issues/discovered-issues/](../07-known-issues/discovered-issues/)。

---

## L6 · `lazy-image-refresh.js`（失败重载 + 5s 冷却）

> 文件：`source/js/lazy-image-refresh.js`（440 行）

### 6.1 触发条件

- 全局 `error` 事件 → 任意 img 加载失败
- 锚点跳转后 300ms → `scanFailedImages()`
- 滚动停止 500ms → 扫描
- 每 3s 周期扫描

### 6.2 检测失败的判断

```js
function isImageLoadFailed(img) {
  if (img.classList.contains('lazy-error')) return true;
  // 已加载但 naturalWidth === 0 → 加载失败
  if (img.naturalWidth === 0 && img.naturalHeight === 0) {
    if (img.src && !img.src.includes('data:image/gif')) return true;
  }
  return false;
}
```

### 6.3 添加刷新按钮

失败的图片被包裹到 `.lazy-image-container` 中，附加 SVG 刷新按钮 + 5s 冷却保护：

```text
点击刷新按钮
  ├── 检查冷却（lastRefreshTime Map 存上次刷新时间）
  ├── 冷却中 → 显示倒计时
  └── 冷却结束 → 重新加载
       ├── 添加 ?_refresh=timestamp 防缓存
       ├── new Image() 预加载
       ├── 成功 → 替换 src，淡入，移除按钮
       └── 失败 → 显示"失败"，2s 后恢复
```

### 6.4 暴露 API

```js
window.lazyImageRefresh = {
  refresh: function(img) { ... },        // 刷新单张
  refreshAll: function() { ... }         // 刷新所有失败的
};
```

---

## L7 · `lazy-video-refresh.js`（视频懒加载 + 失败重载）

> 文件：`source/js/lazy-video-refresh.js`（580 行）

与 image-refresh 几乎平行设计，差异：

| 维度 | image-refresh | video-refresh |
|---|---|---|
| 图标 | 圆箭头（refresh） | 三角形（play） |
| 检测尺寸 | naturalWidth | video.error 对象 |
| 容器类 | `.lazy-image-container` | `.lazy-video-container` |
| 加载方式 | 直接替换 src | `<video>.src = ...; .load()` |
| 文本 | "重新加载图片" | "重新加载视频" |
| **额外功能** | 无 | **同时承担视频懒加载** — 不仅刷新失败视频，还观察未加载视频进入视口时加载 |

### 7.1 视频懒加载流程

```text
prepareVideos()
  └── 找所有 #article-container video:not([data-src])
       ├── 把 src 移到 data-src
       ├── 移除 src（让浏览器不立即加载）
       └── 加 class .lazy-video .lazy-placeholder
createObserver()
  └── IntersectionObserver(rootMargin: 100px)
       └── 进入视口 → loadVideo(v)
            ├── v.src = data-src; v.load()
            ├── canplaythrough → 标记 .lazy-loaded, opacity 1
            └── error → handleVideoError → 加刷新按钮
```

### 7.2 暴露 API

```js
window.lazyVideoRefresh = {
  refresh: function(video) { ... },
  refreshAll: function() { ... }
};
```

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
| `source/css/lazy-loading.css`（387 行 → 占位符魔法漩涡） | 旧版 lazy-loading.js 配套，conic-gradient 旋转动画 | **未被 inject 加载** |
| `source/css/lazy-loading-stable.css` | 稳定版懒加载样式 + scroll-margin-top 90px（标题锚点缓冲） | inject.head 加载（如果配置了） |
| `themes/butterfly/source/css/lazy-loading-stable.css` | 同上的主题副本 | inject.head 加载 |
| `source/css/lazy-image-refresh.css` | 图片刷新按钮样式 | inject.head 加载 |
| `source/css/lazy-video-refresh.css` | 视频刷新按钮样式 | inject.head 加载 |

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
            lazy-loading-native.js 给已被原生 lazy 加载的图加 fade-in
            lazy-image-refresh.js 注册 error 监听器
            lazy-video-refresh.js 准备视频懒加载
            
T = 100ms+ 用户滚动:
            IntersectionObserver 触发 → 图片加载
            滚动停止 500ms → lazy-image-refresh.js scanFailedImages
            
T = 3000ms 周期任务:
            lazy-image-refresh.js / lazy-video-refresh.js 周期扫描失败项
```

---

## L11 · 红线（这些行为会破坏懒加载）

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 在 `_config.butterfly.yml` 中重新启用 `lazyload.enable: true` | Butterfly 原生懒加载 + 自定义并发，可能给同一张图加两个观察器 | 保持禁用 |
| R2 | 删除 `image-dimensions.js` 但保留 `lazy-loading-stable.css` | aspect-ratio 失效，所有图片占位符塌缩，CLS 暴涨 | 二者必须共存 |
| R3 | 在文章中给 img 加 inline style `width: 100%` | 覆盖 image-dimensions 注入的 width 属性，aspect-ratio 失效 | 用 CSS 类，不用 inline width |
| R4 | 删除 `lazy-image-refresh.js` 而不删除 `.lazy-error` CSS | 失败图片显示红色虚线框但没有刷新按钮 | 二者要么都删，要么都保留 |
| R5 | 在文章正文里添加 `loading="eager"` 强制立即加载 | 抢首屏带宽，影响关键资源加载 | 只在封面图上用 eager |
| R6 | 给 #article-container 加 `overflow: hidden` | IntersectionObserver 在某些浏览器中失效 | 用 `overflow: visible` 或不加 |

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
| 旧版图片懒加载（未启用） | `source/js/lazy-loading.js` |
| 原生 lazy 增强（DUPLICATE） | `source/js/lazy-loading-native.js` + `themes/butterfly/source/js/lazy-loading-native.js` |
| 图片刷新按钮 | `source/js/lazy-image-refresh.js` |
| 视频懒加载 + 刷新按钮 | `source/js/lazy-video-refresh.js` |
| 关于页 card-row 懒加载 + 3D 轮播 | `source/about/lazy-loading-about.js` |
| 主图片懒加载 CSS | `themes/butterfly/source/css/lazy-loading-optimized.css` |
| 防 CLS 稳定 CSS | `source/css/lazy-loading-stable.css` + 主题副本 |
| 旧版 CSS（未启用） | `source/css/lazy-loading.css` |
| 图片尺寸注入 | `scripts/image-dimensions.js` |
| Butterfly 原生 lazy 配置 | `_config.butterfly.yml` 的 `lazyload:` 节（已禁用） |
| 加载入口 | `_config.butterfly.yml` 的 inject.head / inject.bottom |

---

## L14 · 候选 BUG 与优化（送 [07-known-issues/discovered-issues/](../07-known-issues/discovered-issues/)）

1. **重复文件**：`source/js/lazy-loading-native.js` 与主题副本完全相同，建议删除 source/js 那份。
2. **死代码**：`source/js/lazy-loading.js` 387 行未被加载，文件占空间，删除前需确认无外部引用。
3. **未启用 CSS**：`source/css/lazy-loading.css` 占位符魔法漩涡风格 vs `lazy-loading-optimized.css` 极简紫色，前者未启用，但仍写在 source/ 中。
4. **3 秒周期扫描的 CPU 消耗**：`lazy-image-refresh.js` 和 `lazy-video-refresh.js` 各自每 3 秒扫描一次，长会话累积可能影响性能。
5. **scroll 监听器虽用 passive，但仍可能阻塞**：滚动时每 500ms 扫描，长文章 + 大量图片场景可优化为 `requestIdleCallback`。
6. **没有 cleanup 机制**：PJAX 切页后旧的 IntersectionObserver、setInterval、event listener 都没被清理，可能内存泄漏。

---

## L15 · 历史与设计动机

- **为什么从 Butterfly 原生 lazyload 切换到自定义**：原生 lazyload 与 image-dimensions 注入的 width/height 属性配合不佳；自定义实现能精确控制选择器、过渡动画、预加载半径。
- **为什么 image-refresh 有 5s 冷却**：早期被用户连点导致服务器 502，5s 是经验值。
- **为什么 about 页面单独写一套**：`.card-row` 是 about 页特有的多图行，需要"成行加载并启动该行轮播"的整体语义，通用懒加载做不到。
- **为什么 lazy-loading-native.js 和 optimized 并存**：原生 `loading="lazy"` 是浏览器层级，对站点首屏（不在 #article-container 内的图）也有效；optimized 是 JS 接管 + 视觉效果。两者互补。
