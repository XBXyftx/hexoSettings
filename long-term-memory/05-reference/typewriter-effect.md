---
name: 打字机效果（AI 总结）完整实现链路
description: 文章页面顶部"AI 总结"打字机动画的端到端实现 — front matter 字段、主题模板暴露、JS 渲染、CSS 动画、PJAX 支持、四级响应式
type: project
---

# 打字机效果（AI 总结） — 完整实现链路

> **何时阅读**：调整打字机渲染逻辑、改动 `typewriter-effect.js / .css`、修改 `config_site.pug`、新增需要打字机的文章、打字机不显示问题排查时。
> **关联文档**：[06-theme-modifications/README.md](../06-theme-modifications/README.md)（config_site.pug 修改记录）· [02-requirements/README.md](../02-requirements/README.md)（front matter 规范）

---

## L1 · TL;DR（30 秒看完）

- 这是一个**仅在文章页**显示的"AI 总结"卡片，紫色渐变底，机器人图标 + 引号 + 打字动画 + 闪烁光标。
- **触发条件**：文章 front matter 中存在 `typewriter:` 字段且非空。
- **数据流**：`page.typewriter`（front matter） → `config_site.pug` 暴露到 `GLOBAL_CONFIG_SITE.typewriter`（页面 head 内联脚本） → `typewriter-effect.js` 读取并渲染。
- **不会显示的场景**：非文章页、`typewriter` 字段为空或仅空白、缺少 `#article-container`、`#loading-box` 预加载器没有消失。
- **动画时序**：等待 preloader → 延迟 1000ms → 容器淡入（500ms）→ 延迟 300ms 开始打字 → 每字符 20ms → 完成后光标 1s/次闪烁。

---

## L2 · 文章 front matter 怎么写

```yaml
---
title: 我的文章
date: 2026-05-04
typewriter: 这篇文章会简单介绍 XXX 是什么，以及 YYY 的核心要点。建议读完后实践 ZZZ。
tags: [xxx]
categories: [xxx]
cover: /imgs/ArticleTopImgs/xxx.webp
---
```

> ⚠️ 字段名必须**完全匹配** `typewriter`（小写、单数、无下划线）。其他变体如 `typeWriter`、`typewriters`、`typewrite` 都不会触发。

> ⚠️ **不要在 typewriter 文本中使用单引号**：模板里是 `'!{page.typewriter || ""}'` —— 单引号字符串被 Pug 编译，文本中出现 `'` 会导致 JS 语法错误。如果必须使用，请用中文引号 `'` `'` 或转义为 `'`。

不需要打字机时：删除 `typewriter:` 字段，或留空（`typewriter: ""`）。

---

## L3 · 数据流详解（4 段链路）

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│  Stage 1：front matter（用户编辑）                                             │
│    source/_posts/xxx.md  →  ---  typewriter: ...  ---                          │
│                                                                                │
│  Stage 2：Pug 模板暴露（hexo generate 时）                                     │
│    themes/butterfly/layout/includes/head/config_site.pug                       │
│      script#config-diff. var GLOBAL_CONFIG_SITE = { ..., typewriter: '...' }   │
│                                                                                │
│  Stage 3：浏览器读取（页面加载时）                                             │
│    document.head 内联 <script> 创建 window.GLOBAL_CONFIG_SITE                  │
│                                                                                │
│  Stage 4：JS 渲染（DOMContentLoaded 后）                                       │
│    /js/typewriter-effect.js  →  initTypewriterEffect()                         │
│      → 检查 #post → 读 GLOBAL_CONFIG_SITE.typewriter                            │
│      → 创建 .post-typewriter-container 插入 #article-container 最前             │
│      → new TypeWriter(textEl, text, 20).start()                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Stage 1 → Stage 2 的关键修改

`themes/butterfly/layout/includes/head/config_site.pug` 第 25 行：

```pug
script#config-diff.
  var GLOBAL_CONFIG_SITE = {
    title: '!{titleVal}',
    isHighlightShrink: !{isHighlightShrink},
    isToc: !{showToc},
    pageType: '!{page.type == 'shuoshuo' ? 'shuoshuo' : globalPageType}',
    typewriter: '!{page.typewriter || ""}'         // ← 项目自定义新增的一行
  }
```

> **这行是项目自定义的，主题原版没有**。如果升级主题，必须重新添加，否则打字机会全站失效。详见 [06-theme-modifications/README.md](../06-theme-modifications/README.md#layoutincludesheadconfig_sitepug)。

---

## L4 · JS 实现细节（`themes/butterfly/source/js/typewriter-effect.js`）

### 4.1 模块结构

```text
typewriter-effect.js（IIFE）
├── class TypeWriter        — 字符级 setInterval 打字（speed 默认 50, 实例使用 20）
├── initTypewriterEffect()  — 创建 DOM、读取 typewriter、启动动画
├── waitForPageReady()      — 等待 #loading-box 消失或 readyState complete
└── main()                   — 串联：等待就绪 → 延迟 1000ms → init
    └── 注册：DOMContentLoaded + pjax:complete 双触发
```

### 4.2 初始化保护门（按顺序）

| 检查 | 行 | 不通过则返回 |
|---|---|---|
| `document.querySelector('#post')` | 31 | 非文章页不渲染 |
| `window.GLOBAL_CONFIG_SITE.typewriter` 存在 | 37-39 | 没有全局对象时跳过 |
| 文本非空（`trim() !== ''`） | 42 | 空字符串不渲染 |
| `document.querySelector('#article-container')` | 62-63 | 找不到容器不渲染 |

### 4.3 DOM 结构（动态创建并插入）

```html
<div class="post-typewriter-container">
  <div class="post-typewriter-header">
    <i class="fas fa-robot"></i>
    <span class="post-typewriter-title">AI总结</span>
  </div>
  <div class="post-typewriter-content">
    <div class="post-typewriter-icon">
      <i class="fas fa-quote-left"></i>
    </div>
    <div class="post-typewriter-text">[此处由 TypeWriter 类逐字注入]</div>
    <div class="post-typewriter-cursor">|</div>
  </div>
</div>
```

> **依赖 Font Awesome**：`fa-robot` 和 `fa-quote-left` 来自 Font Awesome 6.5.1（cdnjs 加载，详见 [_config.butterfly.yml](../05-reference/project-overview.md) 的 inject.head）。如果 Font Awesome 没加载，会显示空白方块。

### 4.4 动画时序

```text
T=0ms      DOMContentLoaded 触发 main()
T=0ms      waitForPageReady() 开始监听 #loading-box
            └── 每 100ms 检查一次 preloader.style.display === 'none' / opacity === '0'
T=Xms      preloader 消失，resolve
T=X+1000ms initTypewriterEffect() 开始
T=X+1000   typewriterContainer.style.opacity = '0'  transform = 'translateY(20px)'
T=X+1100   触发 transition: 'all 0.5s ease-out'  opacity → 1, translateY → 0
T=X+1400   开始 TypeWriter.start()
            └── 每 20ms 追加一个字符到 .post-typewriter-text
T=X+1400+20*N  打字结束（N = 文本长度）
              └── cursor.style.animation = 'typewriter-cursor-blink 1s infinite'
```

### 4.5 PJAX 适配

第 136-138 行：

```js
if (typeof window.pjax !== 'undefined') {
  document.addEventListener('pjax:complete', main);
}
```

**Butterfly 主题默认开启 PJAX**（无刷新切页）。每次 PJAX 切换文章，都会重新执行一遍 main()。但**没有清理旧实例**——如果旧文章的打字还没结束就切走，那个 `setInterval` 不会被清除，可能造成内存泄漏。在长会话浏览大量文章时累积。

---

## L5 · CSS 详解（`themes/butterfly/source/css/typewriter-effect.css`）

### 5.1 主容器样式

| 属性 | 值 | 作用 |
|---|---|---|
| `background` | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | 浅色模式蓝紫渐变 |
| `border-radius` | `12px`（PC）/ `8px`（手机）/ `6px`（小屏） | 圆角 |
| `box-shadow` | `0 8px 32px rgba(0,0,0,0.1)` | 浮起阴影 |
| `position: relative` | — | 配合 `::before` 闪光层 |
| `overflow: hidden` | — | 切掉闪光层溢出 |

### 5.2 深色模式

第 13-16 行：

```css
[data-theme="dark"] .post-typewriter-container {
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}
```

> 触发：`html` 元素有 `data-theme="dark"` 属性。Butterfly 主题的暗黑模式切换会自动设置该属性，并由 [_config.butterfly.yml](../05-reference/project-overview.md) inject.head 第一行 `<script>document.documentElement.setAttribute('data-theme','dark');</script>` 在初始加载时立即设置（防止白屏闪烁）。

### 5.3 装饰层 — `::before` 闪光

第 42-52 行：

```css
.post-typewriter-container::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  animation: typewriter-shimmer 3s infinite;
}
```

`typewriter-shimmer` 关键帧（100-110）：从左下到右上、再回到左下，整体 3s 一个循环。**注意性能**：这是一个永久旋转的伪元素，可能在低端机上拖慢 GPU。已通过 `prefers-reduced-motion: reduce` 媒体查询禁用。

### 5.4 光标闪烁

```css
@keyframes typewriter-cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

50/50 分段，1s 一个完整周期。打字完成时 JS 才设置 `cursor.style.animation = 'typewriter-cursor-blink 1s infinite'` 启动闪烁。

### 5.5 响应式断点（4 级）

| 断点 | 范围 | 主要变化 |
|---|---|---|
| **PC**（默认） | `≥1025px` | container padding 20px，文本 16px，标题 16px |
| **平板** | `768px - 1024px` | padding 18px，文本 15px，标题 15px |
| **手机** | `≤768px` | padding 15px，文本 14px，**布局改为纵向** `flex-direction: column` |
| **小屏手机** | `≤480px` | padding 12px，文本 13px，标题 13px |
| **横屏低高度** | `max-height:500px and orientation:landscape` | padding 10px，文本 12px |

> 手机端的纵向布局（≤768px）：图标和文字不再左右排列，图标在上、文字在下，避免横向空间挤压。

### 5.6 无障碍

第 274-283 行：

```css
@media (prefers-reduced-motion: reduce) {
  .post-typewriter-container::before { animation: none; }
  .post-typewriter-cursor { animation: none !important; opacity: 1; }
}
```

但**打字本身（TypeWriter 类的 setInterval）不受此媒体查询影响**——逐字打字仍会发生。如果用户开启了"减少动画"，理想做法应该是直接显示完整文本。这是一个**可优化的无障碍空缺**（候选 BUG，详见 `07-known-issues/discovered-issues/`）。

---

## L6 · 加载机制（如何被引入到页面）

### 6.1 CSS 加载（head.pug 修改后）

`themes/butterfly/layout/includes/head.pug` 中（项目自定义新增的一行）：

```pug
link(rel="stylesheet" href=url_for("/css/typewriter-effect.css") media="print" onload="this.media='all'")
```

> `media="print" onload="this.media='all'"` 是异步 CSS 加载技巧 — 浏览器认为是打印样式，不阻塞首屏；onload 后切回 'all' 应用到屏幕。详见 [performance-optimization.md](../03-api-practices/performance-optimization.md)（待写）。

### 6.2 JS 加载（additional-js.pug 修改后）

`themes/butterfly/layout/includes/additional-js.pug`：

```pug
if globalPageType === 'post'
  script(defer src=url_for("/js/typewriter-effect.js"))
```

只在文章页加载，节省其他页面的字节数。

### 6.3 全局配置注入

`themes/butterfly/layout/includes/head.pug` 通过 `include head/config_site.pug` 引入。`config_site.pug` 在 head 末尾输出 `<script id="config-diff">var GLOBAL_CONFIG_SITE = {...}`。这个脚本是**同步**加载的（不是 defer/async），所以 typewriter-effect.js 执行时 `window.GLOBAL_CONFIG_SITE` 一定已存在。

---

## L7 · 与其他模块的耦合

```text
typewriter-effect
  ├── front matter 规范 ──► 02-requirements/README.md（typewriter 字段说明）
  ├── config_site.pug 修改 ──► 06-theme-modifications/README.md（修改记录）
  ├── #article-container DOM ──► Butterfly 主题 layout/post.pug（原生）
  ├── #loading-box ──► Butterfly preloader.pug（preloader 主题选项）
  ├── Font Awesome 6.5.1 ──► _config.butterfly.yml inject.head（cdnjs 异步加载）
  ├── PJAX ──► Butterfly 主题原生（pjax 配置项启用）
  └── data-theme 属性 ──► Butterfly 暗黑模式系统（默认提供）
```

**如果删除 `config_site.pug` 中的 typewriter 行**：所有打字机失效，但不会报错（JS 检查 `window.GLOBAL_CONFIG_SITE.typewriter` 为 undefined 直接返回）。

**如果删除 `typewriter-effect.js`**：打字机消失，typewriter 字段被忽略，但仍占用 front matter 字段位（不影响其他主题字段）。

**如果禁用 Butterfly 的 preloader**：`waitForPageReady()` 会走 fallback 分支等待 DOMContentLoaded / load 事件，行为略有差异但仍能工作。

---

## L8 · 红线（这些行为会破坏打字机）

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 升级 Butterfly 主题但忘记重新修改 `config_site.pug` | 全站 typewriter 失效 | 升级前对比 [06-theme-modifications/README.md](../06-theme-modifications/README.md)，升级后逐项重新应用 |
| R2 | typewriter 文本中使用英文单引号 `'` | Pug 编译时 JS 报语法错误，整页 GLOBAL_CONFIG_SITE 解析失败 | 改用中文引号 / 双引号 / 转义 |
| R3 | 直接修改 typewriter 字段为非字符串（如 number、bool） | `!{page.typewriter || ""}` 强制转字符串，渲染异常 | 始终用字符串 |
| R4 | 在文章正文中加入元素 ID `#article-container` | JS 选错容器 | 不要给正文起这个 ID |
| R5 | 删除 typewriter-effect.css 但保留 JS | 打字机会显示但样式全无、文字全白看不见 | 二者必须共存或共删 |
| R6 | 把字段写在文章正文区（不在 front matter 中） | Pug 模板读不到 `page.typewriter` | 字段必须在 `---` 分隔的 YAML front matter 中 |

---

## L9 · 排查清单

### 现象 1：打字机不显示

**逐项检查**：

1. F12 控制台输入 `window.GLOBAL_CONFIG_SITE` —— 是否存在？是否有 `typewriter` 字段？值是否为预期？
   - 不存在 → `config_site.pug` 修改丢失（升级主题后常见）
   - 存在但值为空 → front matter 没写 / 写错字段名 / 写在 `---` 外面
2. 检查 URL —— 是否在文章页？根 URL `/` 不是文章页。
3. F12 元素面板搜索 `post-typewriter-container` —— DOM 是否被插入？
   - 没有 → JS 没执行或被 return 提前返回
   - 有但不可见 → CSS 没加载（检查 head 中是否有 typewriter-effect.css 链接）
4. F12 控制台 `document.querySelector('#article-container')` —— 是否能找到？
5. F12 控制台 `document.querySelector('#post')` —— 是否能找到？

### 现象 2：打字机显示但样式错乱

- Font Awesome 没加载 → 检查 cdnjs 是否被防火墙拦截，或检查 inject.head 中 FA 行是否被删
- 文本看不见（白底白字）→ 自定义 CSS 被全局选择器覆盖，F12 检查 `.post-typewriter-text` 的 color 属性

### 现象 3：每次 PJAX 切换文章都打字一次但更慢

- 旧实例的 `setInterval` 累积没清理。**临时解决**：刷新页面。**根治**：修改 typewriter-effect.js 在 main 开头先清理旧 timer（候选优化项）。

---

## L10 · 文件位置速查

| 内容 | 路径 |
|---|---|
| JS 主逻辑 | `themes/butterfly/source/js/typewriter-effect.js` |
| CSS 样式 | `themes/butterfly/source/css/typewriter-effect.css` |
| 模板暴露字段 | `themes/butterfly/layout/includes/head/config_site.pug:25` |
| CSS 加载入口 | `themes/butterfly/layout/includes/head.pug` |
| JS 加载入口 | `themes/butterfly/layout/includes/additional-js.pug` |
| 修改记录 | [06-theme-modifications/README.md](../06-theme-modifications/README.md) |
| 字段规范 | [02-requirements/README.md](../02-requirements/README.md) |

---

## L11 · 历史与设计动机

- **为什么叫 "AI 总结"**：本博客是 Vibe Coding 系列博客，作者使用 AI 为每篇技术文章生成 1-3 句话的核心摘要，写在 `typewriter` 字段。
- **为什么用打字机动画而非静态文本**：增强阅读仪式感、提高用户在首屏停留时间、暗示"这是 AI 生成的内容"。
- **为什么放在文章顶部**：用户希望读者在进入正文前先看到核心摘要，决定是否细读。
- **为什么有 1000ms 延迟**：等首屏关键资源（封面图、标题、TOC）加载完成，再启动打字机不抢资源。

---

## L12 · 性能注意

- TypeWriter 使用 `setInterval(..., 20)`，每秒 50 次 DOM 操作。短文本（<100 字）影响可忽略；超长文本（>500 字）累计耗时 10s+ 可能造成页面持续重排。
- `::before` 闪光层 3s 永久循环，是连续动画。在长时间开着文章页的标签页中，会持续消耗 GPU。
- 没有视口检测——即使打字机滚出视口，闪光动画仍在执行。**优化候选**：使用 IntersectionObserver 在打字机容器离开视口时暂停动画。
