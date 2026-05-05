# 懒加载系统精简 — 操作记录

> **日期**: 2026-05-05  
> **类型**: 性能优化  
> **回滚基点**: `ef9d3c7`（带标识日志的完整版本）  
> **最终提交**: `40a3207`  
> **关联文档**: [LAZYLOAD-ANALYSIS.md](../../05-performance-audit/2026-05-05-performance-audit/LAZYLOAD-ANALYSIS.md) · [性能审计 README](../../05-performance-audit/2026-05-05-performance-audit/README.md)

---

## 一、背景

性能审计阶段识别出博客中存在 **6 套并行懒加载系统**，其中大部分不工作或功能重复。但删除前需要确认：

- 到底哪个系统真正在加载图片？
- 各脚本之间是否有隐藏依赖？
- 删除后是否会导致功能丢失？

---

## 二、方法：运行时日志标记法

由于静态代码分析无法准确判断运行时行为（存在竞态条件、选择器匹配差异等），采用以下策略：

1. **给每个懒加载脚本的关键函数入口添加唯一标识日志**
2. **用户在实际浏览器中访问文章页**
3. **收集控制台日志，分析执行顺序和实际效果**
4. **基于日志判断各系统的真实状态**
5. **审查依赖关系后执行精简**

---

## 三、日志标记阶段

### 3.1 标记的日志前缀

| 前缀 | 脚本 | 标记的函数 |
|---|---|---|
| `[LazyLoading-v3]` | `source/js/lazy-loading.js` | `initLazyLoading()`, `processVisibleElements()`, `loadImage()` |
| `[LazyNative]` | `source/js/lazy-loading-native.js` | `init()`, `prepareImages()`, `handleImageLoad()`, `fadeInImage()` |
| `[LazyImageRefresh]` | `source/js/lazy-image-refresh.js` | `init()`, `scanFailedImages()`, `handleImageError()` |
| `[LazyVideoRefresh]` | `source/js/lazy-video-refresh.js` | `init()`, `initLazyLoad()`, `prepareVideos()`, `loadVideo()` |

### 3.2 被修改的文件

- `source/js/lazy-loading.js` — 8 处日志插入
- `source/js/lazy-loading-native.js` — 5 处日志插入
- `source/js/lazy-image-refresh.js` — 5 处日志插入
- `source/js/lazy-video-refresh.js` — 6 处日志插入

**Git commit**: `ef9d3c7` — `feat: 为4个懒加载脚本添加运行时标识日志`

---

## 四、日志分析（两页对比测试）

### 4.1 测试页面

| 页面 | 图片数 | 视频 | 测试目的 |
|---|---|---|---|
| VibeTips | 11 | 无 | 普通文章页 |
| V2 | 7 | 有 | 含视频的文章页 |

### 4.2 执行顺序（关键发现）

```
#1 lazy-loading-optimized.js  [LazyLoad]        ← 最先执行！（inject.bottom defer）
#2 main.js                                        ← 主题主脚本
#3 lazy-loading.js            [LazyLoading-v3]   ← additional-js.pug，init 被架空
#4 lazy-loading-native.js     [LazyNative]        ← additional-js.pug，GIF fadeIn
#5 lazy-image-refresh.js      [LazyImageRefresh]  ← additional-js.pug，定时器扫描
#6 lazy-video-refresh.js      [LazyVideoRefresh]  ← additional-js.pug，有 bug
```

### 4.3 各系统真实行为

#### 系统 A：`lazy-loading-optimized.js`（主题内置优化版）

- **加载方式**: `_config.butterfly.yml:1091` 的 `inject.bottom` + `defer`
- **技术**: IntersectionObserver（比 scroll 监听性能更好）
- **行为**: `prepareImages()` 替换 `src` 为 1x1 GIF → `initLazyLoad()` 用 IntersectionObserver 观察 → 视口内时 `loadImage()` 预加载 + fadeIn
- **日志**: `[LazyLoad] 发现 11/7 张图片需要懒加载`
- **状态**: ✅ **唯一有效工作者**

#### 系统 B：`lazy-loading.js` [LazyLoading-v3]

- **init 处理**: 0 张图片 — 因为 `lazy-loading-optimized.js` 已先添加 `lazy-image` 类，`lazy-loading.js` 的 `!img.classList.contains('lazy-image')` 判断全部失败
- **视频处理**: V2 页面处理 12 个视频
- **processVisibleElements()**: 通过不同选择器又找到 22→26 张图片，scroll 时重复加载（同一张 `1.webp` 被加载两次）
- **状态**: ⚠️ init 被架空，scroll 路径重复工作

#### 系统 C：`lazy-loading-native.js` [LazyNative]

- **prepareImages()**: 找到 11/7 张 `img[data-src]`
- **handleImageLoad()**: 对 **1x1 GIF** 执行 fadeIn（因为 GIF 已 `complete && naturalHeight !== 0`）
- **状态**: ❌ 11/7 次无意义动画

#### 系统 D：`lazy-image-refresh.js` [LazyImageRefresh]

- **scanFailedImages()**: 扫描到 11→7 / 13→9 张懒加载图片
- **handleImageError()**: 从未触发（无图片加载失败）
- **状态**: ❌ 持续 3 秒定时器扫描，无事可做

#### 系统 E：`lazy-video-refresh.js` [LazyVideoRefresh]

- **prepareVideos()**: V2 页面处理了 0 个视频（`lazy-loading.js` 已先添加 `data-src`）
- **scanFailedVideos()**: 扫描到 11/13 个"懒加载视频" — 实际上是图片（选择器 bug，`.lazy-video` 类在图片上）
- **loadVideo()**: 触发 `src=undefined`（重大 bug）
- **状态**: ❌ 有 bug，从未正确工作

### 4.4 之前调研的修正

**原调研报告（LAZYLOAD-ANALYSIS.md）漏掉了一个系统**：

> 原报告认为 Butterfly 内置 vanilla-lazyload（`theme.lazyload.enable: false`）完全未启用。但实际上 `lazy-loading-optimized.js` 通过 `inject.bottom` 注入，完全绕过了 `theme.lazyload` 配置，**独立工作**。

这是第 7 个系统，也是**唯一实际有效的工作者**。

---

## 五、依赖关系审查

### 5.1 全局函数依赖

| 函数 | 来源 | 被谁调用 | 删除后影响 |
|---|---|---|---|
| `window.lazyLoadPreload()` | `lazy-loading-native.js` | `main.js:706`（TOC 锚点跳转时预加载） | `typeof` 保护使其安全降级为 no-op |
| `window.lazyLoadRefresh()` | `lazy-loading-native.js` + `lazy-loading-optimized.js` | 无外部调用 | 无影响 |
| `window.checkLazyLoading()` | `lazy-loading.js` | 无外部调用 | 无影响 |
| `window.lazyImageRefresh` | `lazy-image-refresh.js` | 无外部调用 | 无影响 |
| `window.lazyVideoRefresh` | `lazy-video-refresh.js` | 无外部调用 | 无影响 |

### 5.2 CSS 依赖

| CSS 文件 | 定义内容 | 使用方 | 操作 |
|---|---|---|---|
| `lazy-loading.css` | `.lazy-placeholder` 梦幻渐变、`.lazy-image.loaded` | `lazy-loading-optimized.js` 添加 `lazy-placeholder` 类 | **保留** |
| `lazy-loading-stable.css` | `.lazy-loading`、`.lazy-loaded`、`.lazy-error` | `lazy-loading-optimized.js` 使用这些类 | **保留** |
| `lazy-image-refresh.css` | 刷新按钮样式 | 删除脚本后无用途 | **删除引用** |
| `lazy-video-refresh.css` | 视频刷新按钮样式 | 删除脚本后无用途 | **删除引用** |
| `lazy-loading-optimized.css` | — | 文件**不存在**，但 `inject.head` 引用了它 | **删除引用（消除 404）** |

### 5.3 加载链关系图

```
构建阶段
│
├─► image-dimensions.js ──► 注入 loading="lazy" + width/height
│                              (被 optimized.js 的占位符覆盖，
│                               但 width/height 仍用于防止 CLS)
│
└─► inject.bottom ──► lazy-loading-optimized.js ──► defer 加载
                                                     (PJAX 支持)
运行时 (文章页)
│
├─► lazy-loading-optimized.js ──► prepareImages() ──► 替换 src 为 1x1 GIF
│                                    initLazyLoad() ──► IntersectionObserver
│                                    loadImage() ──► 预加载 + fadeIn
│
└─► [已删除的 4 个脚本] ──► 不再加载
```

---

## 六、执行操作

### 6.1 修改的文件

#### 文件 1：`themes/butterfly/layout/includes/additional-js.pug`

```diff
-  // 基础懒加载功能（兼容旧版）
-  script(src=url_for('/js/lazy-loading.js'))
-  // 原生懒加载优化 - 解决布局偏移问题
-  script(src=url_for('/js/lazy-loading-native.js'))
-
-  // 图片懒加载刷新按钮功能
-  script(src=url_for('/js/lazy-image-refresh.js'))
-
-  // 视频懒加载刷新按钮功能
-  script(src=url_for('/js/lazy-video-refresh.js'))
+  // 懒加载由 inject.bottom 的 lazy-loading-optimized.js 统一处理
+  // 已移除: lazy-loading.js, lazy-loading-native.js, lazy-image-refresh.js, lazy-video-refresh.js
```

#### 文件 2：`themes/butterfly/layout/includes/head.pug`

```diff
- //- 图片懒加载刷新按钮样式
- link(rel='stylesheet', href=url_for('/css/lazy-image-refresh.css'))
-
- //- 视频懒加载刷新按钮样式
- link(rel='stylesheet', href=url_for('/css/lazy-video-refresh.css'))
+ //- 已移除: lazy-image-refresh.css, lazy-video-refresh.css（对应脚本已删除）
```

#### 文件 3：`_config.butterfly.yml`

```diff
-    - <link rel="stylesheet" href="/css/lazy-loading-optimized.css" media="print" onload="this.media='all'">
+    # 已移除: lazy-loading-optimized.css（文件不存在，会导致404）
```

### 6.2 Git 提交

```
commit 40a3207
perf: 精简懒加载系统 — 移除4个冗余脚本及其CSS

3 files changed, 4 insertions(+), 16 deletions(-)
```

---

## 七、验证

### 7.1 控制台日志验证

**精简前**（`ef9d3c7`）控制台有 5 套前缀日志：
```
[LazyLoad] 发现 11 张图片需要懒加载        ← optimized.js
[LazyLoading-v3] initLazyLoading() 开始执行  ← lazy-loading.js
[LazyNative] init() 开始执行                 ← lazy-loading-native.js
[LazyImageRefresh] init() 开始执行           ← lazy-image-refresh.js
[LazyVideoRefresh] init() 开始执行           ← lazy-video-refresh.js
```

**精简后**（`40a3207`）控制台只剩：
```
[LazyLoad] 发现 7 张图片需要懒加载           ← 仅剩 optimized.js
```

### 7.2 Network 面板验证

精简后 Network → JS 中：
- ✅ `lazy-loading-optimized.js` — 200 正常加载
- ❌ `lazy-loading.js` — 不再出现
- ❌ `lazy-loading-native.js` — 不再出现
- ❌ `lazy-image-refresh.js` — 不再出现
- ❌ `lazy-video-refresh.js` — 不再出现

### 7.3 功能验证

- ✅ 文章页图片正常懒加载（占位符 → 加载 → 显示）
- ✅ 滚动时图片逐步加载
- ✅ 无裂图或加载失败
- ✅ TOC 目录跳转正常

---

## 八、收益量化

| 指标 | 精简前 | 精简后 | 节省 |
|---|---|---|---|
| 每页 JS 请求数 | 6 个懒加载脚本 | 1 个（optimized.js） | 5 个请求 |
| 每页 JS 体积（懒加载相关） | ~53.5 KB | ~5 KB（optimized.js） | **~48.5 KB** |
| 每页 CSS 请求数 | 4 个懒加载 CSS | 2 个 | 2 个请求 |
| 事件监听器 | scroll x3 + error x2 + interval x2 | IntersectionObserver x1 | 大幅减少 |
| 定时器 | 3s x2 | 0 | 消除 |

---

## 九、回滚方法

如需回滚到带日志标记的完整版本：

```bash
# 方式 1：revert 当前 commit
git revert 40a3207 --no-edit

# 方式 2：checkout 回滚基点的 3 个文件
git checkout ef9d3c7 -- \
  themes/butterfly/layout/includes/additional-js.pug \
  themes/butterfly/layout/includes/head.pug \
  _config.butterfly.yml
```

---

## 十、遗留问题

1. **`source/js/` 下的 4 个脚本文件未物理删除** — 仅移除了加载引用，文件仍存在于仓库中。如需完全清理，可删除：
   - `source/js/lazy-loading.js`
   - `source/js/lazy-loading-native.js`
   - `source/js/lazy-image-refresh.js`
   - `source/js/lazy-video-refresh.js`
   - `source/css/lazy-image-refresh.css`
   - `source/css/lazy-video-refresh.css`

2. **`image-dimensions.js` 注入的 `loading="lazy"` 被覆盖** — 虽然 `optimized.js` 的占位符机制不需要原生 lazy，但 `image-dimensions.js` 的 `width/height` 注入仍有价值（防止 CLS）。如未来想完全改用原生 `loading="lazy"`，需要关闭 `optimized.js`。

3. **`lazy-loading-native.js` 在主题目录下仍有副本** — `themes/butterfly/source/js/lazy-loading-native.js` 与 `source/js/lazy-loading-native.js` 内容几乎相同，之前已知为重复文件（B1 问题）。
