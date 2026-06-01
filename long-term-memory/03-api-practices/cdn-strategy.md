---
name: CDN 策略完整图谱（7 个来源、本地回退、bytecdntp 迁移历史）
description: 项目中所有外部资源的来源选择策略、bytecdntp 大面积 404 事件后的迁移决策、tag_plugins/swiper/envelope 插件的 elemecdn 依赖、本地保留资源的三条理由
type: project
---

# CDN 策略 — 完整图谱

> **何时阅读**：外部资源加载失败排查、新增第三方库、更换 CDN 提供商、bytecdntp 相关 URL 404 时、了解为什么某些库走本地而某些走 CDN。
> **关联文档**：[performance-optimization.md](performance-optimization.md)（异步 CSS 与 defer JS 的注入入口）· [deployment-pipeline.md](deployment-pipeline.md)（构建时资源处理）

---

## L1 · TL;DR（30 秒看完）

- 项目使用 **7 个 CDN 来源**，按角色分层：
  - **cdnjs.cloudflare.com** — 主力（fancybox、fontawesome、instantpage、lazyload、medium_zoom、snackbar、waline、jquery）
  - **npm.elemecdn.com** — Butterfly 插件生态（tag_plugins、swiper、envelope_comment、gitcalendar）
  - **cdn1.tianli0.top** — 自定义镜像（algolia、meting、prismjs、translate）
  - **lib.baomitu.com** — 国内加速（pjax、sharejs）
  - **at.alicdn.com** — 图标字体（iconfont）
  - **lf*-cdn-tos.bytecdntp.com** — **已全面弃用**（大面积 404，全部迁移至 cdnjs）
  - **本地 `/js/`** — 关键依赖（KaTeX 303KB、Twikoo、Typed）
- **双 provider 架构**：`internal_provider: local`（主题内置脚本始终本地）+ `third_party_provider: jsdelivr`（第三方库默认走 jsdelivr，但 `option` 节逐项覆盖了具体 URL）
- **关键事件**：bytecdntp.com（字节跳动 CDN）在某个时间点大面积 404，导致 fancybox、instantpage、lazyload、medium_zoom、snackbar、waline 等多个库全部加载失败。项目逐项替换为 cdnjs.cloudflare.com，并保留了被注释的旧 URL 作为迁移记录。

---

## L2 · 架构总览

```text
CDN 决策树（每个第三方资源）：
  ├── 是 Butterfly 主题内置脚本？
  │   └── internal_provider: local → 始终从主题 source/js/ 加载（不经过 CDN）
  │
  ├── 是 Butterfly 插件生态资源（tag_plugins / swiper / envelope / gitcalendar）？
  │   └── 走 npm.elemecdn.com（插件作者 Akilar 的统一 CDN）
  │
  ├── 在 CDN.option 中有显式 URL？
  │   └── 使用显式 URL（逐项覆盖 third_party_provider）
  │
  ├── 是 KaTeX / Twikoo / Typed？
  │   └── 本地 `/js/`（体积/私有部署/稳定性）
  │
  └── 其他第三方库
      └── third_party_provider: jsdelivr（默认，但大部分已被 option 覆盖）
```

---

## L3 · 来源逐项分析

### 3.1 cdnjs.cloudflare.com — 主力来源（8 项）

Cloudflare 全球 CDN，稳定性最高。项目用它承载了所有从 bytecdntp 迁移出来的库：

| 库 | 版本 | URL | 原 CDN（已弃用） |
|---|---|---|---|
| **fancybox** | 3.5.7 | `cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.js` | bytecdntp |
| **fancybox_css** | 3.5.7 | `cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.css` | bytecdntp |
| **fontawesome** | 6.5.1 | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css` | bytecdntp (6.0.0) |
| **instantpage** | 5.1.0 | `cdnjs.cloudflare.com/ajax/libs/instant.page/5.1.0/instantpage.min.js` | bytecdntp |
| **lazyload** | 17.3.1 | `cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/17.3.1/lazyload.min.js` | bytecdntp |
| **medium_zoom** | 1.0.6 | `cdnjs.cloudflare.com/ajax/libs/medium-zoom/1.0.6/medium-zoom.min.js` | bytecdntp |
| **snackbar** | 0.1.16 | `cdnjs.cloudflare.com/ajax/libs/node-snackbar/0.1.16/snackbar.min.js` | bytecdntp |
| **snackbar_css** | 0.1.16 | `cdnjs.cloudflare.com/ajax/libs/node-snackbar/0.1.16/snackbar.min.css` | bytecdntp |
| **waline_js** | 1.5.4 | `cdnjs.cloudflare.com/ajax/libs/waline/1.5.4/Waline.min.js` | bytecdntp |
| **jquery** (tag_plugins) | 3.6.0 | `cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js` | bytecdntp |

> **注意**：Font Awesome 6.5.1 还有一个副本在 `inject.head` 中以异步方式加载（`media="print" onload`），这是给全站图标用的（fa-robot、fa-quote-left 等）。`CDN.option.fontawesome` 那行是给 Butterfly 内部组件用的。

### 3.2 npm.elemecdn.com — Butterfly 插件生态（7 项）

饿了么 CDN，是 Butterfly 插件作者 Akilar 的统一分发渠道。所有 `hexo-butterfly-*` 插件都走这里：

| 资源 | URL |
|---|---|
| **tag_plugins.anima** | `hexo-butterfly-tag-plugins-plus@latest/lib/assets/font-awesome-animation.min.css` |
| **tag_plugins.issues** | `hexo-butterfly-tag-plugins-plus@latest/lib/assets/issues.js` |
| **tag_plugins.carousel** | `hexo-butterfly-tag-plugins-plus@latest/lib/assets/carousel-touch.js` |
| **tag_plugins.tag_plugins_css** | `hexo-butterfly-tag-plugins-plus@latest/lib/tag_plugins.css` |
| **swiper** (4 个文件) | `hexo-butterfly-swiper/lib/swiper.min.css` + `.js` + `swiperstyle.css` + `swiper_init.js` |
| **envelope_comment** (4 张图) | `hexo-butterfly-envelope/lib/violet.jpg` + `line.png` + `before.png` + `after.png` |
| **gitcalendar** (2 个文件) | `hexo-filter-gitcalendar/lib/gitcalendar.css` + `.js`（当前已注释禁用） |

> ⚠️ `@latest` 标签意味着每次构建可能拉取不同版本。如果插件作者发布了 breaking change，博客会在下一次 `hexo generate` 时静默受影响。

### 3.3 cdn1.tianli0.top — 自定义镜像（5 项）

Tianli（张洪 Heo）维护的 CDN 镜像站，主要用于他开发的 js-heo 系列工具和 prismjs：

| 资源 | URL |
|---|---|
| **algolia_js** | `npm/js-heo@1.0.11/algolia/algolia.js` |
| **algolia_search** | 实际走 bytecdntp（`instantsearch.js/2.10.5`）— 唯一未迁移的 bytecdntp 残留 |
| **meting_js** | `npm/js-heo@1.0.12/metingjs/Meting.min.js` |
| **prismjs_js** | `npm/prismjs@1.1.0/prism.js` |
| **prismjs_autoloader** | `npm/prismjs/plugins/autoloader/prism-autoloader.min.js` |
| **prismjs_lineNumber_js** | `npm/prismjs/plugins/line-numbers/prism-line-numbers.min.js` |
| **translate** | `npm/js-heo@1.0.6/translate/tw_cn.js` |

> `algolia_search` 仍指向 `lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/instantsearch.js/2.10.5/instantsearch.min.js` — 这是 **bytecdntp 唯一的未迁移残留**。

### 3.4 lib.baomitu.com — 国内加速（2 项）

360 奇舞团维护的国内 CDN，对大陆访问速度优于 cdnjs：

| 资源 | URL |
|---|---|
| **pjax** | `lib.baomitu.com/pjax/0.2.8/pjax.min.js` |
| **sharejs** | `lib.baomitu.com/social-share.js/1.0.16/js/social-share.min.js` |
| **sharejs_css** | `lib.baomitu.com/social-share.js/1.0.16/css/share.min.css` |

> **为什么 pjax 走 baomitu 而不是 cdnjs**：国内用户访问 baomitu 延迟更低（~20ms vs cdnjs 的 ~150ms），PJAX 是每个页面切换的核心依赖，低延迟直接影响交互体验。

### 3.5 at.alicdn.com — 图标字体（1 项）

| 资源 | URL |
|---|---|
| **iconfont** | `//at.alicdn.com/t/font_2032782_8d5kxvn09md.js` |

协议相对 URL（`//`），跟随页面协议（HTTP/HTTPS 自适应）。这是 Butterfly tag_plugins 的图标依赖。

### 3.6 本地 `/js/` — 关键依赖保留本地（3 项）

| 资源 | 本地路径 | 体积 | 保留原因 |
|---|---|---|---|
| **katex** | `/js/katex/katex.min.css` | ~303KB（含 JS+CSS+fonts） | 数学公式核心功能；本地同域加载，避免 CDN 延迟 |
| **twikoo** | `/js/twikoo.js` | ~200KB | 评论系统，需与服务端版本匹配；私有部署稳定性 |
| **typed** | `/js/typed.umd.js` | ~15KB | 体积小但使用频繁（首页打字），本地零延迟 |

### 3.7 bytecdntp.com — 已弃用（9 项残留注释）

字节跳动 CDN（`lf3-cdn-tos` / `lf6-cdn-tos`），**已大面积 404**。所有曾经使用它的库都已迁移到 cdnjs，旧 URL 以 YAML 注释形式保留：

```yaml
# 以下均为被注释的旧 URL（404 后迁移）：
# fancybox:         lf6-cdn-tos.bytecdntp.com → cdnjs ✓
# fancybox_css:     lf3-cdn-tos.bytecdntp.com → cdnjs ✓
# fontawesome:      lf6-cdn-tos.bytecdntp.com → cdnjs (版本也升级 6.0.0→6.5.1) ✓
# instantpage:      lf3-cdn-tos.bytecdntp.com → cdnjs ✓
# lazyload:         lf3-cdn-tos.bytecdntp.com → cdnjs ✓
# medium_zoom:      lf6-cdn-tos.bytecdntp.com → cdnjs ✓
# snackbar:         lf6-cdn-tos.bytecdntp.com → cdnjs ✓
# snackbar_css:     lf3-cdn-tos.bytecdntp.com → cdnjs ✓
# twikoo:           lf6-cdn-tos.bytecdntp.com → 本地 /js/twikoo.js (v1.7.11) ✓
# waline_js:        lf3-cdn-tos.bytecdntp.com → cdnjs ✓
# jquery(tag_pl):   lf6-cdn-tos.bytecdntp.com → cdnjs ✓
```

**唯一未迁移的 bytecdntp 残留**：

```yaml
algolia_search: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/instantsearch.js/2.10.5/instantsearch.min.js
```

> 这是 `algolia_search` 字段，不是 `instantsearch` 字段（后者被注释掉了）。二者可能指向同一个库的不同用途。如果 Algolia 搜索功能异常，优先检查这个 URL 是否也 404 了。

---

## L4 · inject 层 vs CDN.option 层的责任划分

### 4.1 两层加载机制

Butterfly 主题有两层资源加载：

| 层 | 配置文件位置 | 控制范围 |
|---|---|---|
| **inject 层** | `inject.head` / `inject.bottom` | 直接插入 HTML 的 `<link>` / `<script>` 标签 |
| **CDN.option 层** | `CDN.option` | 主题模板通过变量引用，运行时拼接 URL |

### 4.2 inject 层加载的资源（本项目的 inject 配置）

**head（同步 1 个 + 异步 8 个）**：
```yaml
inject:
  head:
    - <script>document.documentElement.setAttribute('data-theme','dark');</script>  # 内联
    - <link rel="stylesheet" href="/css/index.css">                                   # 本地同步
    - <link rel="stylesheet" href="/css/universe.css" media="print" onload="...">    # 本地异步
    - <link rel="stylesheet" href="/css/transpancy.css" media="print" onload="...">  # 本地异步
    - <link rel="stylesheet" href="/css/styles.css" media="print" onload="...">      # 本地异步
    - <link rel="stylesheet" href="/css/rightmenu.css" media="print" onload="...">   # 本地异步
    - <link rel="stylesheet" href="/css/twikoo.css" media="print" onload="...">      # 本地异步
    - <link rel="stylesheet" href="/css/lazy-loading-optimized.css" media="print" onload="...">  # 本地异步
    - <link rel="stylesheet" href="/css/readmode-enhanced.css" media="print" onload="...">       # 本地异步
    - <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="...">  # cdnjs 异步
  bottom:
    - <canvas id="universe"></canvas>                                                  # 内联 HTML
    - <script defer src="/js/universe-optimized.js"></script>                         # 本地 defer
    - <script defer src="/js/jquery-3.6.0.min.js"></script>                           # 本地 defer
    - <script defer src="/js/rightmenu.js"></script>                                  # 本地 defer
    - <script defer src="/js/happy-title.js"></script>                                # 本地 defer
    - <script defer src="/js/lazy-loading-optimized.js"></script>                     # 本地 defer
    - <script defer src="/js/lightbox-enhanced.js"></script>                          # 本地 defer
```

> inject 层全部是**本地资源**，唯一的 CDN 例外是 Font Awesome 6.5.1（cdnjs）。这是有意为之——inject 是手动控制的，不放外部依赖减少故障面。

### 4.3 CDN.option 层加载的资源

这些是主题模板通过变量引用的，开发者不直接写 `<script>` 标签：

```text
CDN.option 中的资源 → 主题 pug 模板 → 运行时根据配置拼接 <script src="...">
```

例如：Butterfly 的 `layout/includes/third-party/fancybox.pug` 读取 `theme.CDN.option.fancybox` 的值，生成对应的 `<script>` 标签。

### 4.4 jQuery 的双重加载

jQuery 3.6.0 同时出现在两个地方：

1. `inject.bottom` → `<script defer src="/js/jquery-3.6.0.min.js">` — **本地加载，全站可用**
2. `CDN.option.tag_plugins.CDN.jquery` → cdnjs — **仅 tag_plugins 组件引用**

这是冗余的：inject.bottom 的本地 jQuery 已经全局可用，tag_plugins 不需要再加载一次。但由于 tag_plugins 是独立组件，它不知道全局环境是否已有 jQuery，所以自己声明了一份。**实际运行时如果两个都加载，第二个不会重复执行（`window.jQuery` 已存在）**。

---

## L5 · 为什么有些资源保留本地

### 5.1 KaTeX 0.16.19（303KB）— 本地

```
CDN.option.katex: /js/katex/katex.min.css
```

**理由**：
- 于 2026-05-04 从 MathJax 3.2.2（1.1MB）迁移，体积减少 74%
- 公式渲染是文章页核心功能，不可降级
- 本地随 `hexo generate` 一起进入 `public/js/`，与博客同域、同 CDN 加速
- 客户端渲染（auto-render + `scripts/math-protect.js` 防 kramed 破坏公式）

### 5.2 Twikoo 1.7.11（~938KB）— 本地

```
CDN.option.twikoo: /js/twikoo.js
```

**理由**：
- 评论系统需要与服务端（Netlify Function）版本匹配
- Twikoo 更新频繁，CDN 版本可能与已部署的后端不兼容
- 锁定本地版本 = 评论功能稳定不受外部更新影响

### 5.3 Typed.js（~15KB）— 本地

```
CDN.option.typed: /js/typed.umd.js
```

**理由**：
- 首页打字效果的核心依赖，但体积很小（15KB）
- 本地零延迟加载，不受 CDN 波动影响
- 锁定版本避免 typed.js 更新破坏首页动画

---

## L6 · 资源故障影响分析

### 6.1 各 CDN 故障的爆炸半径

| CDN 故障 | 影响范围 | 严重程度 |
|---|---|---|
| **cdnjs.cloudflare.com 挂了** | Font Awesome 图标全站消失、fancybox 灯箱失效、medium_zoom 失效、instantpage 预加载失效、snackbar 通知失效、waline 评论失效 | 🔴 高 |
| **npm.elemecdn.com 挂了** | tag_plugins 样式/图标/动画失效、swiper 首页轮播白屏、envelope 信笺图片全 broken、gitcalendar 失效 | 🔴 高 |
| **cdn1.tianli0.top 挂了** | 搜索（algolia）失效、音乐播放器（meting）失效、代码高亮（prismjs）退化、翻译功能失效 | 🟡 中 |
| **lib.baomitu.com 挂了** | PJAX 无刷新切页失效（退化为整页刷新）、分享按钮消失 | 🟡 中 |
| **at.alicdn.com 挂了** | tag_plugins 内图标字体变成方块 | 🟢 低 |
| **本地 /js/ 文件缺失** | 评论失效（Twikoo）、数学公式无法渲染（KaTeX）、首页打字不动（Typed）、jQuery 未定义导致 rightmenu/happy-title 等报错 | 🔴 高 |

### 6.2 单点故障恢复策略

```text
cdnjs 故障 → 切换 third_party_provider 为 unpkg 或 jsdelivr
elemecdn 故障 → 将 hexo-butterfly-* 插件资源本地化到 source/js/
tianli0 故障 → prismjs 切到 cdnjs，algolia/meting 切官方 CDN
baomitu 故障 → pjax/sharejs 切 cdnjs
```

---

## L7 · 缓存策略

### 7.1 CDN 层的缓存

所有 CDN URL 都不带 query string 版本号（`CDN.version: false`），浏览器和 CDN 边缘节点按照 URL 路径做永久缓存。这意味着：
- 库版本更新时**不会自动生效**——必须手动更新 URL 中的版本号（如 `jquery/3.6.0` → `jquery/3.7.0`）
- 好处：不会因为上游更新导致博客行为意外变化
- 坏处：安全漏洞修复不会自动应用

### 7.2 本地资源的缓存

本地 `/js/*` 和 `/css/*` 文件随 `public/` 目录一起部署，文件名为静态（无 hash）。浏览器缓存策略完全取决于部署目标的 HTTP 响应头（GitHub Pages 默认 `Cache-Control: max-age=600`，10 分钟）。

> **改完 JS/CSS 后记得更新引用**：如果改了 `universe-optimized.js` 但在 inject 中仍然是 `/js/universe-optimized.js`，用户浏览器可能缓存了旧版本。建议在重大更新时加 query string（如 `?v=2`），或在 `_config.butterfly.yml` 的 `CDN.version: true` 打开全局版本号。

---

## L8 · 红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 把 KaTeX 或 Twikoo 从本地改回 CDN | 评论/公式可能因版本不匹配或 CDN 故障而失效 | 保持本地 |
| R2 | 删除 `inject.bottom` 中的 `<script defer src="/js/jquery-3.6.0.min.js">` | rightmenu.js、happy-title.js、lightbox-enhanced.js 全部报 `$ is not defined` | 保留 |
| R3 | 把 Font Awesome 从 inject.head 的异步加载改为同步 | 阻塞首屏渲染，LCP 增加 ~300ms | 保持 `media="print" onload` 异步模式 |
| R4 | 恢复任何被注释的 bytecdntp URL | 资源 404，对应功能静默失效 | 不要恢复 |
| R5 | 修改 `internal_provider` 为非 local | 主题内建脚本可能从 CDN 加载未预期的版本 | 保持 `local` |
| R6 | 使用 `@latest` 标签的插件资源不锁版本 | 插件作者发 breaking change 时博客受影响 | 发布前固定版本号 |
| R7 | 在 inject.head 中新增同步 CDN 资源 | 阻塞首屏，且引入外部依赖的单点故障 | 异步加载或本地化 |

---

## L9 · 排查清单

### 现象 1：CDN 资源加载失败（某个功能突然不工作）

1. F12 Network 面板 → 搜索 `bytecdntp` —— 是否还有残留的旧 URL 在请求？
2. 筛选 404 / 503 → 是哪个 CDN 挂了？
3. 对照本文档 L3 节 → 找到替代 CDN 或本地化方案

### 现象 2：某个库的行为变了（但没改过配置）

1. 检查 CDN URL 中是否使用了 `@latest`
2. 检查 cdnjs 是否更新了对应库的版本（cdnjs 通常不删旧版本，但如果用的 `@latest` 就会变）

### 现象 3：本地资源 404

1. `hexo clean && hexo generate` → 检查 `public/js/` 下是否有对应文件
2. 如果没有 → `source/js/` 下是否缺失？主题升级时是否被覆盖？
3. 如果 `themes/butterfly/source/js/` 有但 `public/js/` 没有 → 检查主题是否正确加载

---

## L10 · 文件位置速查

| 内容 | 路径 |
|---|---|
| CDN 配置 | `_config.butterfly.yml` 的 `CDN` 节（1093-1216 行） |
| inject 注入入口 | `_config.butterfly.yml` 的 `inject` 节（1066-1092 行） |
| tag_plugins CDN | `_config.butterfly.yml` 的 `CDN.option.tag_plugins.CDN` |
| swiper CDN | `_config.butterfly.yml` 的 `swiper` 节 |
| envelope CDN | `_config.butterfly.yml` 的 `envelope_comment` 节 |
| jQuery 本地 | `source/js/jquery-3.6.0.min.js` |
| KaTeX 本地 | `source/js/katex/` |
| Twikoo 本地（v1.7.11）| `themes/butterfly/source/js/twikoo.js` |
| Typed 本地 | `source/js/typed.umd.js` |

---

## L11 · 与其他模块的耦合

```text
cdn-strategy
  ├── inject.head 异步 Font Awesome ──► typewriter-effect（fa-robot / fa-quote-left 图标）
  ├── inject.bottom 本地 jQuery ──► rightmenu.js / happy-title.js / lightbox-enhanced.js
  ├── CDN.option.fontawesome ──► Butterfly 主题内部图标组件
  ├── CDN.option.pjax ──► Butterfly PJAX 无刷新切页（baomitu）
  ├── CDN.option.lazyload ──► Butterfly 原生 lazyload（已禁用，但 CDN URL 仍在配置中）
  ├── CDN.option.medium_zoom ──► 文章内图片点击放大
  ├── CDN.option.fancybox ──► 旧版灯箱（可能与 medium_zoom 功能重叠）
  ├── tag_plugins.elemecdn ──► 标签插件样式/动画/图标
  ├── swiper.elemecdn ──► 首页轮播图
  ├── envelope.elemecdn ──► 留言板信封动画
  └── katex/twikoo/typed 本地 ──► 文章公式/评论/首页打字
```

---

## L12 · 历史与设计动机

- **为什么 bytecdntp 大面积 404**：字节跳动 CDN（bytecdntp.com）可能关闭了公共访问或更改了域名结构。项目中 11 个引用中有 10 个迁移到了 cdnjs，1 个（algolia_search）残留至今。
- **为什么迁移到 cdnjs 而不是 jsdelivr**：cdnjs 由 Cloudflare 托管，全球节点覆盖最好；jsdelivr 在国内访问偶有 DNS 污染问题。且 cdnjs 的 URL 结构更稳定（`/ajax/libs/{pkg}/{ver}/{file}`）。
- **为什么 pjax 特殊对待走 baomitu**：PJAX 是页面切换的核心路径，每个链接点击都触发。baomitu（360）在国内的延迟远低于 cdnjs，直接决定页面切换的响应速度。
- **为什么 elemecdn 没被替换**：Butterfly 插件生态（tag_plugins、swiper、envelope）的作者 Akilar 将所有资源统一发布到 elemecdn。替换需要逐项下载并本地化，且`@latest`标签意味着版本会更新，本地化后会失去自动更新能力。
- **为什么 Font Awesome 出现了两次**：inject.head 中有一份（6.5.1，给全站用，异步加载），CDN.option 中也有一份（给 Butterfly 组件用）。这是历史遗留——inject 那一份是项目主动加的，CDN.option 那一份是主题自带的。两者版本曾经不同（6.5.1 vs 6.0.0），bytecdntp 迁移时统一到了 6.5.1。
