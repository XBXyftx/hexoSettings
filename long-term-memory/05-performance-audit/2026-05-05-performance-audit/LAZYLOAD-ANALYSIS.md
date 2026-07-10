---
name: 懒加载系统深度调研报告
description: 对博客中 6 套懒加载/图片处理系统的完整调用链分析，识别实际工作者、闲置者和冲突点
type: reference
---

# 懒加载系统深度调研报告

> **历史状态（2026-07-10 核验）**：本文记录 2026-05-05 的旧系统清理前分析。文中 `source/js/lazy-loading*.js`、image/video refresh 和当时的“6 套系统”均不再是当前工作树事实；保留它只用于解释删除原因。当前主力脚本、CSS 占位动画风险和验收路径见 [2026-07-10 渲染性能与长期记忆事实审计](../../2026-07-10-render-performance-audit/README.md)。
>
> **调研日期**: 2026-05-05
> **调研方法**: 源代码静态分析 + 构建输出验证 + 运行时逻辑推演
> **关联**: [README.md](README.md) · `scripts/image-dimensions.js` · `source/js/lazy-loading*.js`

---

## 执行摘要

博客中存在 **6 套** 与图片懒加载相关的系统，但经深度调研后发现：

| 系统 | 状态 | 实际作用 |
|---|---|---|
| Butterfly 内置 vanilla-lazyload | ❌ **完全未启用** | 零输出、零加载 |
| `scripts/image-dimensions.js` | ✅ **唯一真正工作者** | 构建时为图片注入 `loading="lazy"` + `width/height` |
| `source/js/lazy-loading.js` | ⚠️ **文章页部分工作** | 为文章内图片创建 `data-src` + 占位符，但可能与原生 lazy 重复 |
| `source/js/lazy-loading-native.js` | ❌ **实际不工作** | 依赖 `data-src`，但 HTML 中无此属性 |
| `source/js/lazy-image-refresh.js` | ❌ **实际不工作** | 依赖 `lazy-image`/`lazy-placeholder` 类，但类由 `lazy-loading.js` 添加且极少触发 |
| `source/js/lazy-video-refresh.js` | ⚠️ **条件性工作** | 仅当文章含视频时可能生效 |

**核心结论**：
1. 真正起作用的只有 `image-dimensions.js`（构建时注入原生 `loading="lazy"`）
2. 其余 4 个浏览器端脚本（共 53KB）大量消耗运行时资源（DOM 查询、事件监听、定时器），但实际效果极小或为零
3. `lazy-loading.js` 与原生 `loading="lazy"` 存在**功能重叠**，两套系统同时处理同一张图片

---

## 一、系统逐个解剖

### 系统 1：Butterfly 内置 vanilla-lazyload

**配置位置**: `_config.butterfly.yml:1025`
```yaml
lazyload:
  enable: false   # ← 关闭
  field: post
  placeholder:
  blur: false
```

**构建时行为** (`themes/butterfly/scripts/filters/post_lazyload.js`)：
- `after_render:html` 和 `after_post_render` 两个过滤器均检查 `enable === true`
- `enable: false` → **过滤器直接 return，不做任何事**

**运行时行为** (`themes/butterfly/source/js/main.js:1178`)：
- `head/config.pug` 设置 `GLOBAL_CONFIG.islazyloadPlugin = false`
- `main.js:1228`：`GLOBAL_CONFIG.islazyloadPlugin && lazyloadImg()` → **不会执行**

**资源加载** (`additional-js.pug:14-15`)：
```pug
if theme.lazyload.enable && !theme.lazyload.native
  script(src=url_for(theme.asset.lazyload))
```
- `enable: false` → **vanilla-lazyload JS 不加载**

**结论**: 此系统从构建到运行完全静默，零开销也零收益。vanilla-lazyload npm 包（~15KB）虽在 `package.json` 中，但从未被打包到页面。

---

### 系统 2：`scripts/image-dimensions.js` — 实际工作者

**加载位置**: Hexo `after_render:html` 过滤器（自动加载 `scripts/` 目录）
**依赖**: `npm: image-size`
**体积**: 脚本 ~6KB + image-size ~50KB（构建时）

**工作原理**:
1. 在 HTML 渲染完成后，遍历所有 `<img>` 标签
2. 如果图片没有 `width`/`height`，用 `image-size` 读取实际尺寸并注入
3. 如果图片没有 `loading` 属性，注入 `loading="lazy"`
4. 排除特定 class：`site-icon`, `announcementImg`, `post-bg`, `cover`, `friend-avatar`

**构建输出验证**（首页 29 张图片）：
```
Total img: 29
loading="lazy": 10   ← image-dimensions.js 添加
width/height:   10   ← image-dimensions.js 添加
data-lazy-src:   0   ← Butterfly 内置未启用
data-src:        0   ← lazy-loading.js 运行时添加
data-original:   0
```

**被处理的 10 张图片**:
- 5 张：侧边栏「最近文章」缩略图（`class="thumbnail"`）
- 5 张：Swiper 轮播图小图标（`class="blog-slider__img"`）

**被排除的 19 张图片**:
- Logo (`class="site-icon"`)
- 文章封面 (`class="post-bg"`)
- 公告栏 GIF (`class="announcementImg"`)

**结论**: 这是唯一真正在工作的系统。原生 `loading="lazy"` 已被现代浏览器广泛支持（Chrome 76+、Firefox 75+、Safari 16+），无需额外 JS 库。

---

### 系统 3：`source/js/lazy-loading.js` — 文章页部分工作

**加载位置**: `additional-js.pug:33`（**无条件全站加载**）
**体积**: 16KB

**初始化逻辑**:
```javascript
function initLazyLoading() {
    if (!document.getElementById('post')) {
        return;  // 非文章页直接退出
    }
    // ... 处理文章页图片
}
```

**工作流程**:
1. 查找 `#article-container img`, `.post-content img`, `article img`
2. 排除 `#page-header`, `.avatar`, `.related-post-item`, `.aside-card`, `.footer` 中的图片
3. 为每个图片添加 `lazy-image` 和 `lazy-placeholder` 类
4. 将 `img.src` 保存到 `img.dataset.src`
5. 将 `img.src` 替换为 1x1 透明 GIF（`data:image/gif;base64,R0lG...`）
6. 绑定 scroll 事件（200ms 防抖），视口内图片加载真实图片

**与系统 2 的冲突**:
```
image-dimensions.js（构建时）:
  img.src = "/imgs/xxx.webp" loading="lazy"

lazy-loading.js（运行时）:
  img.dataset.src = "/imgs/xxx.webp"
  img.src = "data:image/gif;base64,..."  ← 覆盖!
```

**结果**: 同一张图片同时被两套系统处理：
- 浏览器原生 `loading="lazy"` 看到 `src` 是 1x1 GIF（因为被 lazy-loading.js 覆盖）
- lazy-loading.js 的 scroll 检测加载真实图片
- **功能重复**，且原生 lazy 对 1x1 GIF 的懒加载毫无意义

**资源消耗**（每文章页）:
- DOMContentLoaded 时遍历所有文章图片（DOM 查询 O(n)）
- 为每张图片替换 src（引发重排）
- 持续的 scroll 事件监听 + setTimeout 防抖

---

### 系统 4：`source/js/lazy-loading-native.js` — 实际不工作

**加载位置**: `additional-js.pug:35`（**无条件全站加载**）
**体积**: 3.5KB

**核心选择器**:
```javascript
placeholderSelector: '#article-container img[data-src]',
```

**问题**: 此脚本只处理**已有 `data-src` 属性**的图片。但在 HTML 构建输出中：
- `data-src` 计数 = **0**

`data-src` 由谁生成？理论上应由 `lazy-loading.js`（系统 3）在运行时创建。但：
1. `lazy-loading.js` 创建 `data-src` 后，`lazy-loading-native.js` 在 DOMContentLoaded 时查找 `img[data-src]`
2. 由于两个脚本几乎同时执行，存在**竞态条件**
3. 更关键的是：`lazy-loading-native.js` 的 `prepareImages()` 在 `init()` 中执行，而 `init()` 也在 DOMContentLoaded 触发
4. 如果 `lazy-loading.js` 先执行，图片已有 `data-src`，`lazy-loading-native.js` 会处理它们；反之则不会

**实际观察**: HTML 中没有 `data-src` 属性（构建输出验证），说明 `lazy-loading-native.js` 在构建后、运行前的 HTML 阶段找不到任何目标。

**资源消耗**: 每页加载 3.5KB JS + DOMContentLoaded 执行一次查询（返回空 NodeList）→ 纯浪费。

---

### 系统 5：`source/js/lazy-image-refresh.js` — 实际不工作

**加载位置**: `additional-js.pug:38`（**无条件全站加载**）
**体积**: 15KB

**核心功能**: 为加载失败的图片添加「刷新」按钮

**触发条件**:
1. 图片必须有 `lazy-image` 或 `lazy-placeholder` 或 `lazy-error` 类
2. 或者图片 `naturalWidth === 0 && naturalHeight === 0`

**问题**:
- `lazy-image`/`lazy-placeholder` 类由 `lazy-loading.js`（系统 3）添加
- 但 `lazy-loading.js` 只在文章页执行，且覆盖 src 为 1x1 GIF
- 由于 `image-dimensions.js` 已为图片设置了正确的 `width`/`height`，浏览器知道图片尺寸，不会触发 "尺寸为 0" 的判断
- 图片刷新功能实际上极少被触发（仅在网络错误时出现）

**资源消耗**:
- 每页 15KB JS
- 全局 `error` 事件捕获（捕获阶段）
- 每 3 秒一次的 `setInterval` 扫描
- 滚动停止后 500ms 扫描

---

### 系统 6：`source/js/lazy-video-refresh.js` — 条件性工作

**加载位置**: `additional-js.pug:41`（**无条件全站加载**）
**体积**: 19KB

**核心功能**: 视频懒加载 + 刷新按钮

**触发条件**: 文章页中存在 `<video>` 标签

**实际状态**: 绝大多数文章不含视频，此脚本在大多数页面中无事可做，但仍被加载并执行初始化。

**资源消耗**:
- 每页 19KB JS
- 全局 `error` 事件捕获
- 每 3 秒一次的 `setInterval` 扫描

---

## 二、系统交互图

```
构建阶段 (hexo generate)
│
├─► image-dimensions.js (after_render:html)
│    └─► 为 <img> 添加 width/height + loading="lazy"
│         (排除 site-icon, post-bg, cover, announcementImg)
│
└─► post_lazyload.js (after_post_render) ──► [enable=false, 不执行]

运行时 (浏览器)
│
├─► lazy-loading.js (DOMContentLoaded)
│    ├─► 文章页: 查找 img → 添加 lazy-image 类
│    │         → img.dataset.src = 原 src
│    │         → img.src = 1x1 GIF
│    │         → 绑定 scroll 事件
│    └─► 非文章页: 直接 return
│
├─► lazy-loading-native.js (DOMContentLoaded)
│    └─► 查找 img[data-src] → 空集（未在 HTML 中预设 data-src）
│
├─► lazy-image-refresh.js (DOMContentLoaded)
│    └─► 扫描 lazy-error / lazy-placeholder → 空集（极少触发）
│
├─► lazy-video-refresh.js (DOMContentLoaded)
│    └─► 扫描 video[data-src] → 通常空集
│
└─► 浏览器原生 lazy loading
     └─► 看到 loading="lazy" 但 src 可能被 lazy-loading.js 覆盖为 1x1 GIF
```

---

## 三、资源浪费量化

### 每页面加载开销（全部自定义懒加载脚本）

| 脚本 | 体积 | 初始化开销 | 持续开销 | 实际收益 |
|---|---|---|---|---|
| `lazy-loading.js` | 16KB | DOM 遍历 + src 替换（重排） | scroll 监听 | 与原生 lazy 重复 |
| `lazy-loading-native.js` | 3.5KB | 一次空查询 | 无 | 零 |
| `lazy-image-refresh.js` | 15KB | error 事件绑定 + 首次扫描 | 3s 定时器 + scroll | 零 |
| `lazy-video-refresh.js` | 19KB | error 事件绑定 + 首次扫描 | 3s 定时器 + scroll | 几乎零 |
| **合计** | **53.5KB** | **多次 DOM 查询 + 事件绑定** | **2 个 scroll + 2 个 3s 定时器** | **极小** |

### 对比：只保留 image-dimensions.js

| 指标 | 当前（6 套） | 精简后（只保留 image-dimensions.js） |
|---|---|---|
| 每页 JS 体积 | +53.5KB | 0KB（纯原生） |
| DOM 查询次数 | 4+ 次全量遍历 | 0 次（构建时完成） |
| 事件监听器 | scroll x2 + error x2 + interval x2 | 0（浏览器原生处理） |
| 重排/重绘 | lazy-loading.js 批量替换 src | 0 |

---

## 四、冲突与风险

### 冲突 1：双系统处理同一张图片

```
image-dimensions.js        lazy-loading.js
    │                          │
    ▼                          ▼
<img src="a.webp"          找到该 img
     loading="lazy"         data-src = "a.webp"
     width="2343"            src = "1x1.gif"
     height="1295"           class += "lazy-image"
```

浏览器看到的最终 HTML：
```html
<img src="data:image/gif;base64,..."   ← 1x1 GIF
     data-src="a.webp"
     loading="lazy"
     width="2343" height="1295"
     class="lazy-image lazy-placeholder">
```

**问题**:
- `loading="lazy"` 对 1x1 GIF 无意义（GIF 已极小）
- 浏览器需要先下载 1x1 GIF（虽然极小，但仍是额外请求），然后 lazy-loading.js 再替换为真实图片
- `width`/`height` 属性与 `src` 内容不匹配（声明 2343x1295，实际 1x1），可能触发 CLS（累积布局偏移）警告

### 冲突 2：竞态条件

`lazy-loading.js` 和 `lazy-loading-native.js` 都在 DOMContentLoaded 执行：
- 如果 `lazy-loading-native.js` 先执行 → 此时还没有 `data-src`，它无事可做
- 如果 `lazy-loading.js` 先执行 → 创建了 `data-src`，`lazy-loading-native.js` 可能尝试重复处理

### 冲突 3：事件监听器叠加

4 个脚本各自绑定 scroll 事件：
- `lazy-loading.js`: `window.addEventListener('scroll', handleScroll, { passive: true })`
- `lazy-image-refresh.js`: `window.addEventListener('scroll', ..., { passive: true })`
- `lazy-video-refresh.js`: `window.addEventListener('scroll', ..., { passive: true })`
- 浏览器原生 IntersectionObserver（由 `loading="lazy"` 自动触发）

虽然都是 `passive: true`，但多个 scroll handler 仍然增加主线程负担，尤其在低端设备和长文章页面。

---

## 五、优化建议

### 方案 A：完全移除自定义懒加载脚本（推荐）

**原理**: 既然 `image-dimensions.js` 已注入原生 `loading="lazy"`，现代浏览器完全支持，无需额外 JS。

**操作**:
1. 从 `additional-js.pug` 中删除以下 4 行：
   ```pug
   script(src=url_for('/js/lazy-loading.js'))
   script(src=url_for('/js/lazy-loading-native.js'))
   script(src=url_for('/js/lazy-image-refresh.js'))
   script(src=url_for('/js/lazy-video-refresh.js'))
   ```
2. 可选：删除 `source/js/` 下的这 4 个文件（或保留作为备份）
3. 可选：删除 `source/css/` 下的懒加载相关 CSS（如 `lazy-loading.css`）

**收益**:
- 每页减少 **53.5KB** JS 加载
- 消除 4 个 scroll 事件监听器
- 消除 2 个 3 秒定时器
- 消除运行时的 src 替换和重排
- **外观无变化**（原生 `loading="lazy"` 继续工作）

**风险**: 极低。原生 `loading="lazy"` 的浏览器支持率 > 95%。旧浏览器只是不回退到懒加载（图片立即加载），不影响功能。

### 方案 B：只保留 lazy-loading.js，移除其余

**适用场景**: 如果用户需要自定义占位符效果（如骨架屏、模糊预览）

**操作**:
1. 删除 `lazy-loading-native.js`、`lazy-image-refresh.js`、`lazy-video-refresh.js`
2. 修改 `lazy-loading.js` 以兼容 `loading="lazy"`：
   - 不替换 `src` 为 1x1 GIF（避免覆盖原生 lazy）
   - 只添加视觉占位符效果

**收益**: 减少 37.5KB，保留自定义视觉效果

### 方案 C：启用 Butterfly 内置懒加载，移除全部自定义

**操作**:
1. `_config.butterfly.yml`:
   ```yaml
   lazyload:
     enable: true
     field: site
     placeholder: /img/loading.gif
     blur: true
   ```
2. 删除全部 4 个自定义懒加载脚本
3. 删除 `image-dimensions.js` 中的 `loading="lazy"` 注入（避免重复）

**风险**: 需要修改 `image-dimensions.js`，且 Butterfly 内置懒加载的功能与用户自定义的占位符效果不同。不推荐。

---

## 六、决策矩阵

| 方案 | 每页 JS 节省 | 外观变化 | 实现难度 | 推荐度 |
|---|---|---|---|---|
| A. 全删，只留 image-dimensions.js | **53.5KB** | 无 | 极易 | ⭐⭐⭐⭐⭐ |
| B. 只留 lazy-loading.js | 37.5KB | 无 | 易 | ⭐⭐⭐ |
| C. 启用 Butterfly 内置 | 53.5KB + 16KB | 占位符效果变化 | 中 | ⭐⭐ |
| 现状（不改动） | 0KB | — | — | ⭐ |

---

## 七、待确认问题

1. **图片刷新按钮**：`lazy-image-refresh.js` 提供的「刷新」功能是否曾被使用？如果从未使用，可以放心删除
2. **视频懒加载**：博客中是否有含视频的文章？数量多少？
3. **占位符效果**：是否在意图片加载时的视觉过渡效果（如骨架屏、淡入）？如果不在意，方案 A 最佳

---

## 附录：HTML 输出验证原始数据

**首页 (`public/index.html`)**:
```
Total img:        29
loading="lazy":   10   ← image-dimensions.js
width/height:     10   ← image-dimensions.js
data-lazy-src:     0   ← Butterfly 内置未启用
data-src:          0   ← lazy-loading.js 运行时添加
data-original:     0
lazy-image:        0   ← lazy-loading.js 添加（但首页不执行）
lazy-placeholder:  0
```

**文章页 (`public/2026/03/03/最优化理论/index.html`)**:
```
Total img:        21
loading="lazy":   10   ← image-dimensions.js
width/height:     10   ← image-dimensions.js
data-lazy-src:     0
data-src:          0   ← 注意：构建输出中无 data-src，lazy-loading.js 在运行时创建
data-original:     0
lazy-image:        2   ← lazy-loading.js 添加
data-processed:    2   ← lazy-loading-native.js 标记
```
