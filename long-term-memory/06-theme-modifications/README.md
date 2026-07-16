# 06-theme-modifications — 主题修改跟踪

> **当前主题状态（2026-07-10 核验）**：本页 #2 的 Font Awesome 异步去重记录已经在 commit `b472183` 回滚，当前实际为主题同步加载 + inject 异步重复加载；附录中 network/topimg/旧 lazy-loading 脚本也已删除。任何主题升级或性能改动前，先读 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md)。

本目录记录所有对 `themes/butterfly/` 目录下文件的修改。

---

## 为什么必须记录

Butterfly 主题是第三方开源项目，理论上可以通过 `npm update` 或 `git pull` 升级。但本项目对主题进行了**大量自定义修改**（8个模板文件被直接修改，大量自定义 CSS/JS 注入），升级主题时必须手动合并这些修改。

**如果不记录**，升级主题时会丢失所有自定义功能，且无法快速恢复。

---

## 修改记录格式

```markdown
### #N — YYYY-MM-DD — 修改简述

**修改文件**：`themes/butterfly/具体路径`
**修改原因**：为什么要改
**修改内容**：具体改了什么
**相关文件**：关联的自定义 CSS/JS 文件
**可回滚性**：是否可安全回滚
```

---

## 已知的主题修改（需人工补充历史）

以下是通过代码扫描发现的已修改文件，但历史修改时间和原因需要人工补充：

### #1 — 2026-05-04 — typewriter-effect.js 增加 prefers-reduced-motion 短路

**修改文件**：`themes/butterfly/source/js/typewriter-effect.js`
**修改原因**：B19 — typewriter 逐字 setInterval 动画对 reduced-motion 用户不友好，CSS 已在该媒体查询下停 cursor blink/shimmer，但 JS 的逐字动画仍然执行（动画行为最强烈的部分仍存在）
**修改内容**：在 `TypeWriter.start()` 方法 Promise 内最前端加 `matchMedia('(prefers-reduced-motion: reduce)').matches` 检测，命中则把 `this.text` 整体写入 `this.element.textContent`，立刻 `resolve()` 并 return，跳过 `setInterval` 逐字循环
**改动行数**：+7（含 1 行注释）
**相关文件**：`themes/butterfly/source/css/typewriter-effect.css:275`（已有 CSS 媒体查询，本次是把同一原则应用到 JS）
**可回滚性**：可安全回滚（git revert）。回滚后行为退回为「reduced-motion 用户也看到逐字动画」，是已知的旧行为，不引入新故障
**关联文档**：[../04-operations/2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md](../04-operations/2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md)
**关联 commit**：`fcc1cea`

---

### #2 — 2026-05-04 — Font Awesome 异步去重尝试（**已回滚**）

**修改文件**：`themes/butterfly/layout/includes/head.pug`
**修改原因**：B17 — Font Awesome CSS 被加载两次（主题内置直接加载 + inject.head 异步加载），浪费 ~80KB 带宽
**修改内容**：将 `link(rel='stylesheet', href=url_for(theme.asset.fontawesome))` 改为添加 `media="print" onload="this.media='all'"` 异步加载属性；同时删除 `_config.butterfly.yml` inject.head 中的重复 Font Awesome 行
**改动行数**：+0（1 行修改）
**相关文件**：`_config.butterfly.yml:1080-1081`（删除 inject.head 中的重复项）
**可回滚性**：可安全回滚。回滚后行为退回为「Font Awesome 阻塞加载 + inject.head 异步加载 = 两份同时存在」，是已知的旧行为
**关联文档**：[../04-operations/2026-05-04-tier1-fixes/Q12-font-awesome-dedup.md](../04-operations/2026-05-04-tier1-fixes/Q12-font-awesome-dedup.md)
**当前状态（2026-07-10 核验）**：该改动在 commit `b472183` 中已回滚，因为异步 CSS 会让导航、侧边栏和社交图标在样式完成前消失。现在 `head.pug` 恢复同步 Font Awesome，`_config.butterfly.yml` 也恢复了异步重复链接；这是当前 P3 资源浪费，但不能直接重放本次历史方案。后续应先保留主题同步入口，删除 inject 重复项并做弱网/首屏图标回归。

---

### #3 — 2026-05-04 — header-universe.js 性能优化

**修改文件**：`themes/butterfly/source/js/header-universe.js`
**修改原因**：B4 — 星空背景无性能优化,导致移动端低端机卡顿、标签页后台持续耗电
**修改内容**：

1. 添加 30fps 节流(`frameInterval` + `lastFrameTime`)
2. 添加 `document.visibilitychange` 监听,标签页隐藏时暂停渲染
3. 添加移动端检测(`innerWidth <= 768`),粒子数从 `0.216×width` 降级为 `0.04×width`
4. 桌面端粒子数从 `0.216×width` 降为 `0.08×width`
5. 流星尾巴从 30 点缩短为 10 点
6. resize 改为 200ms 防抖,resize 时重新初始化星星
7. 添加 `cancelAnimationFrame` + `isRunning` 标志,支持生命周期管理
8. PJAX 切页时自动清理(animationFrame + 事件监听器)
9. `f()` 添加 `#page-header` null 检查,防止非首页抛异常
10. 将 `y` 构造函数内的 `setTimeout` 移至初始化后统一触发,消除 400 个冗余定时器

**改动行数**：~+45 / ~-5
**相关文件**：`themes/butterfly/source/js/universe-optimized.js`(参考实现)
**可回滚性**：可安全回滚。回滚后行为退回为「无节流/无暂停/无移动端降级/无防抖」,是已知的旧行为,但性能较差
**关联文档**：[../04-operations/2026-05-04-tier1-fixes/Q13-header-universe-optimization.md](../04-operations/2026-05-04-tier1-fixes/Q13-header-universe-optimization.md)
**关联 commit**：`f84d526`

---

### #4 — 2026-07-11 — P1 分层星空动效实验（已回退并归档）

**修改文件**：
- `themes/butterfly/source/js/header-universe.js`
- `themes/butterfly/source/css/universe.css`
- `themes/butterfly/source/css/styles.css`
- `themes/butterfly/layout/includes/head.pug`
- `_config.butterfly.yml`

**修改原因**：2026-07-10 审计中的 P1 项确认全站固定背景与页面头部星空各自运行一条 30fps RAF；页头可见时产生双 canvas、双调度、两套粒子对象与重复清屏。用户要求保留顶部封面星光氛围，将背景中不易感知的小星隐藏以降低开销，并明确顶部应有三类星体。

**修改内容（实验阶段）**：

1. 将 `header-universe.js` 重写为唯一 `StarfieldController`；全局 `#universe` 和 header `.universe-header` 仍保留各自画布/堆叠职责，但只由一条 RAF 调度。
2. 背景仅保留少量低亮缓慢慢星；顶部封面明确区分稀疏大高亮慢星、较密小低亮慢星、同一时刻最多一个的偶发高速流星。
3. 建立 375px / 1024px / 1440px 的硬性粒子上限、20/24fps 上限和 capped DPR，避免宽屏和高 DPR 线性放大粒子数或 canvas backing store。
4. 通过 `IntersectionObserver` 在页头离屏时停止顶部层更新/清屏；通过 `visibilitychange` 停止唯一 RAF；`prefers-reduced-motion` 只绘制静态帧；resize 使用 observer/回退事件和 160ms 防抖。
5. 保持 `pointer-events:none`、背景 `z-index:-1`、顶部 canvas `z-index:2`、标题信息 `z-index:3` 和主题导航 `z-index:90`，确保文字和输入不受阻挡。
6. 移除 `_config.butterfly.yml` 对 `universe-optimized.js` 的第二个脚本注入；`head.pug` 以 `defer` 加载唯一控制器。旧文件暂时保留在主题资源目录作为历史文件，但当前产物不加载它。

**实际回退与归档（2026-07-11）**：用户视觉验收后认为实验效果未达预期，决定停止迭代并恢复初始基点。已精确恢复上述 5 个实际运行时文件至 `049f08d60827ca25f13b1ced18802f94076ee626`，因此当前站点再次使用 `universe-optimized.js` + `header-universe.js` 的双 Canvas / 双 RAF 实现。P1 关键 JS、CSS、模板、配置与 benchmark 工具已复制至 [source-snapshots/](../04-operations/2026-07-11-starfield-p1/source-snapshots/README.md)，该目录不参与 Hexo 构建或浏览器加载；没有远程推送或部署。

**实验验证与回退验证**：

- P1 实验阶段的 JS 语法、diff、构建和 Headless A/B 数据见 [P1 记录](../04-operations/2026-07-11-starfield-p1/README.md)，但它们不代表当前运行时。
- 回退后已确认 5 个实际运行时文件与基线精确一致，`header-universe.js` 语法检查和 `git diff --check` 通过；源码快照及其 SHA-256 完整保留。

---

### #5 — 2026-05-04 — katex.pug 添加客户端渲染支持

**修改文件**：`themes/butterfly/layout/includes/third-party/math/katex.pug`
**修改原因**：BUG-003 — MathJax 3.2.2 体积过大（1.17MB），迁移至 KaTeX（303KB）减少 74% 体积。Butterfly 原 katex.pug 仅做 CSS 加载和 `.katex` 元素显示，假设公式已在服务端渲染（需 hexo-filter-katex），但项目未安装该插件
**修改内容**：

1. 第一轮（2026-05-04）：重写 katex.pug，使用 `btf.getCSS` 加载 CSS，`btf.getScript` 顺序加载 katex.min.js 和 auto-render.min.js，然后调用 `renderMathInElement` 在客户端扫描 `$...$` 和 `$$...$$` 语法并渲染。添加 `window.katex_js_loaded` 全局标志防止重复加载
2. 第二轮（2026-05-05）：补充 `<script type="math/tex">` 标签处理逻辑。发现 kramed 将行内 `$c_{ij}$` 破坏为 `$c<em>{ij}</em>$` 后，katex.pug 新增模式 A（`katex.render()` 直接渲染 script 标签）与原有模式 B（`renderMathInElement` auto-render）并存，覆盖两种公式来源
**改动行数**：第一轮 +14，第二轮 +23，合计 +37（完整重写）
**相关文件**：`_config.butterfly.yml`（math.use: katex, asset.katex 配置）、`source/js/katex/`（KaTeX 0.16.19 文件）、`source/_posts/`（2 篇文章 front-matter 改 katex: true）、`scripts/math-protect.js`（Hexo 过滤器，持久化公式保护）
**可回滚性**：可安全回滚。回滚后行为退回为「使用 MathJax 客户端渲染」，MathJax 3.2.2 目录完整保留，回滚只需改 3 处配置。`scripts/math-protect.js` 删除即可移除公式保护
**关联文档**：[../04-operations/2026-05-04-katex-migration/README.md](../04-operations/2026-05-04-katex-migration/README.md) · [../04-operations/2026-05-04-katex-migration/ANALYSIS.md](../04-operations/2026-05-04-katex-migration/ANALYSIS.md)
**关联 commit**：`5229ef5`（第一轮）· _(第二轮 commit 待填充)_

---

### 已有的主题修改（历史扫描记录）

### layout/includes/layout.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 在 body 中注入入场弹窗 HTML 结构 |
| **新增代码** | `#entrance-popup.entrance-popup` 及其子元素 |
| **关联文件** | `entrance-popup.js`, `entrance-popup.css` |
| **影响** | 所有页面都会包含弹窗 DOM |

### layout/includes/head.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 添加多个自定义 CSS/JS 链接 |
| **新增代码** | typewriter-effect.css、entrance-popup.css、文章页 `lazy-loading-optimized.css`、vscode-breadcrumb-toc.css、header-universe.js；旧 `lazy-loading.css`/`lazy-loading-stable.css` 已停止从 head 加载；Font Awesome 与 `/css/index.css` 当前各有主题/inject 重复入口 |
| **条件加载** | 部分 CSS/JS 仅在文章页面（`globalPageType === 'post'`）或首页加载 |
| **影响** | 所有页面的 head 部分 |

### layout/includes/additional-js.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 添加多个自定义 JS 加载 |
| **新增代码** | waterfall.js（首页）、typewriter-effect.js（文章页）、entrance-popup 系列、vscode-breadcrumb-toc.js（文章页）；network/topimg 与旧 lazy-loading 系列已删除 |
| **影响** | 所有页面的底部 JS 加载；首页的 waterfall 现为单一响应式 masonry 控制器，无移动端轮询或调试监听 |

### layout/includes/footer.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 添加建站时间统计 |
| **新增代码** | 内联 JavaScript，计算从 2024-04-25 18:30 开始的运行时间 |
| **影响** | 所有页面的 footer |

### layout/includes/mixins/indexPostUI.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 添加瀑布流布局（layout 8）支持 |
| **关联文件** | `waterfall.js`, `waterfall-homepage.styl` |
| **影响** | 首页文章卡片布局 |

### layout/index.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 添加瀑布流 masonry 类 |
| **影响** | 首页容器类名 |

### layout/includes/head/config_site.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 将 `page.typewriter` 暴露到 `GLOBAL_CONFIG_SITE` |
| **影响** | 文章页面的全局配置对象 |

### source/js/main.js

| 项 | 值 |
| --- | --- |
| **修改内容** | 包含注释掉的 hamburger 菜单修复代码和增强移动端检测；2026-07-11 将失效的目录预加载调用替换为可取消的媒体结算/ResizeObserver 重锚定事务 |
| **影响** | 主题主脚本 |

---

## 主题文件修改状态总览

| 文件 | 修改类型 | 风险等级 | 升级时处理建议 |
| --- | --- | --- | --- |
| `layout/includes/widget/card_announcement.pug` | 结构化公告历史时间轴 | 中 | 升级后恢复 `site.data.announcements`、语义化时间/详情结构和旧 content 兜底；编写入口见 `source/_data/announcements.yml` |
| `source/css/announcement-history.css` | 公告时间轴、卡内滚动、响应式与 reduced-motion | 低 | 升级后保留并确保 `head.pug` 同步加载 |
| `source/js/announcement-history.js` | 查看全部/收起、PJAX 幂等初始化 | 低 | 升级后保留并确保 `additional-js.pug` 在公告启用时加载 |
| `layout/includes/layout.pug` | 添加 HTML | 中 | 升级后重新注入弹窗结构 |
| `layout/includes/head.pug` | 添加条件 CSS、停止旧全站占位样式加载 + 当前存在资源重复；`header-universe.js` 仅首页 deferred 加载 | 高 | 升级后重新添加文章页懒加载状态样式、首页 header 星空条件入口；先解决 `/css/index.css` 与 Font Awesome 重复，**不要**恢复已回滚的“仅异步 Font Awesome”方案或旧全篇占位动画 |
| `source/js/lazy-loading-optimized.js` | 原生 lazy 协调、近视口占位与媒体结算事件 | 中 | 迁移时保留原生 `src`/`loading`，不能恢复 1×1 GIF 交换逻辑 |
| `source/css/lazy-loading-optimized.css` | 文章页图片比例保护、静态/近视口占位状态 | 低 | 保持 `max-width:100%` 与 `height:auto` 成对存在；仅无尺寸图片使用最小高度，保留 reduced-motion 和仅近视口动态视觉 |
| `layout/includes/additional-js.pug` | 添加加载；首页条件输出背景 Canvas、背景星空和瀑布流 | 高 | 升级后重新添加所有自定义 JS，保持首页星空脚本与 `#universe` Canvas 不扩散到非首页路由 |
| `layout/includes/footer.pug` | 添加脚本 | 低 | 升级后重新添加建站时间统计 |
| `layout/includes/mixins/indexPostUI.pug` | 修改布局 | 高 | 升级后重新实现 layout 8 逻辑 |
| `layout/index.pug` | 添加类名 | 低 | 升级后重新添加 masonry 类 |
| `layout/includes/head/config_site.pug` | 添加字段 | 中 | 升级后重新暴露 typewriter 字段 |
| `source/js/main.js` | 移动端增强逻辑与目录媒体重锚定 | 中 | 升级后保留用户输入取消、RAF 合帧、ResizeObserver 和有限时限；不得恢复依赖已删除 `lazyLoadPreload` 的一次性定位 |

---

### #6 — 2026-07-10 — 重写首页响应式瀑布流（P0）

**修改文件**：
- `themes/butterfly/source/js/waterfall.js`
- `themes/butterfly/source/css/styles.css`

**修改原因**：2026-07-10 当前渲染性能审计将移动首页瀑布流判为 P0。旧实现用每 100ms 轮询扫描全部卡片，在 click/touch/scroll/resize 后用 `cssText` 重写全部项目样式，并保留生产 `MutationObserver`、console 调试和重复 CSS 兜底；这会持续占用主线程并掩盖真正的布局状态问题。

**修改内容**：

1. 用单一 `WaterfallLayout` 控制器替换旧脚本：桌面按容器实际宽度布局，最大三列；`769–1200px` 为两列；`≤768px` 仅清除桌面坐标并交还 CSS 单列流式布局。容器宽度不足以容纳 220px 卡片时自动降列。
2. 只通过容器/卡片 `ResizeObserver`、两条媒体查询和封面图片 settle 事件请求重排；重复请求合并到一个 `requestAnimationFrame`。不再等待全量图片、使用固定超时或长期轮询。
3. 移除 100ms `setInterval`、捕获式 scroll/touch/click 监听、`MutationObserver`、`console` 调试、运行时 `<style>` 注入及批量 `style.cssText` 覆盖。
4. 只写入/清理此控制器拥有的 `position`、`left`、`top`、`width`、`margin`、`transform`、容器 `height`；保留卡片与子元素的其他内联状态。
5. 增加可幂等销毁路径：取消 RAF、断开 observer、移除媒体查询和图片监听，并兼容未来 PJAX 的 `pjax:send` / `pjax:complete`。
6. 删除移动端属性选择器“看门狗”和未再使用的 `fade-in` 动画；保留 CSS 单列规则及既有卡片、轮播、封面、信息、标签和分页视觉样式。

**可回滚性**：可直接回退实现提交 `9988ac4`；也可恢复至已推送的优化前基线 `69772c847d46b251eafa028394b6f1ebef291b68`。两者均保留在 `origin/master` 历史中。

**验证**：

- `node --check themes/butterfly/source/js/waterfall.js` 通过。
- `waterfall-homepage.styl` 单独编译通过；`npm run build` 成功（121 个文件）。
- 使用已生成首页 15 张卡片的 jsdom harness，验证 1440px 三列、1024px 两列、375px 一列，图片 load 合并重排、容器/卡片 observer、无轮询和 PJAX teardown。
- 本地 `http://localhost:4000/` 冒烟检查：首页、瀑布流脚本与样式均可访问。
- [x] 本地 Chrome A/B 三断点测量：375×812 / DPR 2、1024×900 / DPR 1、1440×900 / DPR 1；每个版本 / 断点三次中位数、15 秒空闲与滚动。当前版保持 1 / 2 / 3 列、无重叠和正确分页位置；移动端没有旧 10Hz 轮询、`cssText` 整体覆写或调试输出。详见[浏览器性能测量](../04-operations/2026-07-10-waterfall-rewrite/BROWSER-PERFORMANCE-MEASUREMENTS.md)。
- [ ] 目标设备有头浏览器的视觉、触摸 / 旋转、深浅色模式和 Performance 回归仍待完成。

**关联基线**：`69772c8`（已推送到 `origin/master`）

---

### #7 — 2026-07-12 — 补正文章图片比例保护回归

**修改文件**：`themes/butterfly/source/css/lazy-loading-optimized.css`

**修改原因**：2026-07-11 将文章懒加载样式由旧全站 CSS 收敛到当前文章级 CSS 时，旧文件中隐含的 `height:auto` 没有同步迁移。构建期为本地图注入 `width`/`height` 后，`max-width:100%` 只会收窄宽度，未受约束的高度仍可能采用原始属性像素，导致多张正文图片纵向拉伸。

**修改内容**：

1. 为 `#article-container img` 明确添加 `max-width:100%` 和 `height:auto`，让显示尺寸始终沿用构建期属性表达的比例。
2. 将 placeholder 与 error 的最小高度收窄到同时缺少 `width` 和 `height` 的图片，避免对具备可信内在尺寸的窄小图片施加额外高度。
3. 保持原生 lazy 协调、近视口 shimmer 和 TOC 重锚定不变；未恢复旧全篇动画、1×1 GIF 源交换或 `attr()` CSS 比例规则。

**验证**：用户反馈的 `OpenSourceSummer2025/78.webp` 在 1600px 宽度浏览器中由错误的约 `781.80×1454px` 恢复为约 `781.80×444.20px`。受控延迟媒体的桌面/移动 TOC 验证继续通过，且已加载带尺寸正文图比例错误均为 0。

**可回滚性**：可安全回滚，但会重新引入宽度受限时高度未按比例缩放的已知视觉故障；主题升级时必须保留该成对规则。

---

### #8 — 2026-07-12 — 预加载器改为 DOM 就绪退出，并将双层星空限于首页

**修改文件**：

- `themes/butterfly/layout/includes/loading/load_style/spincat.pug`
- `themes/butterfly/layout/includes/head.pug`
- `themes/butterfly/layout/includes/additional-js.pug`
- `_config.butterfly.yml`

**修改原因**：全屏 `spincat` 曾等待 `window.load`，会被远程图片、视频或第三方资源拖延，即使文章主结构已可读仍锁定滚动。现有背景与页头星空分别维持 30fps RAF；用户明确要求保留原有视觉实现但仅在首页启用，避免文章和普通页面承担无关的 Canvas 创建、粒子初始化与持续绘制。

**修改内容**：

1. `spincat` 初次导航改为在 `DOMContentLoaded` 后的下一动画帧开始退出，不再等待 `window.load` 或使用 10 秒兜底；退出函数改为幂等，并保留未来 PJAX 的初始化/完成钩子与既有 800ms 视觉退场。
2. `header-universe.js` 改为仅 `globalPageType === 'home'` 时以 `defer` 加载，移除非首页 head 阻塞脚本。
3. 将全局 `inject.bottom` 中的 `#universe` 与 `universe-optimized.js` 移至 `additional-js.pug` 的首页条件块；背景 Canvas 仍先于背景脚本输出，并增加 `aria-hidden="true"`。
4. 保持双 Canvas 的当前视觉基线、30fps 节流、移动端降级和 `visibilitychange` 暂停；未恢复归档且视觉未采纳的单控制器 P1 实验，未修改 `universe.css`、透明卡片、文章懒加载或 TOC 重锚定。

**可回滚性**：可回滚，但会恢复“预加载器受全部子资源阻塞”以及非首页页面也创建并运行双星空的已知成本。主题升级时需重建首页条件注入，不应只恢复一个 Canvas 或一个脚本入口。

**验证**：`npm run build` 成功；生成首页各有 1 个背景 Canvas、背景/页头星空脚本和瀑布流脚本，代表文章、About、归档均为 0 个星空 Canvas/脚本。延迟本地 WebP 的 Headless Chrome 在 `interactive` 且 `load` 未触发时确认预加载器已 `.loaded` 且滚动锁已释放；文章 TOC 桌面/移动回归和本地资源审计均通过。

---

### #10 — 2026-07-16 — 入场弹窗显示时保持页面可交互

**修改文件**：`themes/butterfly/source/css/entrance-popup.css`

**修改原因**：入场随机文字弹窗显示时，`.entrance-popup.show` 为覆盖整个视口的固定层启用了 `pointer-events: auto`。尽管遮罩透明，父层仍会成为所有指针、触摸手势和滚轮命中的最上层目标，导致弹窗自动隐藏前页面无法点击或正常滑动。

**修改内容**：将显示态容器保持为 `pointer-events: none`；既有 `.popup-content { pointer-events: auto; }` 不变。因此弹窗卡片与关闭按钮仍可操作，卡片以外的页面区域则可正常接收点击、触摸与滚动。

**相关文件**：`themes/butterfly/layout/includes/layout.pug`（全局弹窗 DOM）、`themes/butterfly/source/js/entrance-popup.js`（随机文案、自动关闭与关闭按钮逻辑）、`themes/butterfly/source/js/entrance-popup-config.js`（当前关闭与显示配置）。

**可回滚性**：可安全回滚。回滚后恢复为「弹窗显示期间全视口拦截输入」的旧行为；不建议保留该行为。

**验证**：`git diff --check`、显示态/卡片 `pointer-events` CSS 断言及 `npm run build` 均通过；本地 Chrome/CDP 确认显示时卡片外命中下层页面、弹窗卡片和关闭按钮仍接收指针输入。真实移动设备触摸滚动仍待人工回归；不执行任何远程操作或部署。

---

### #11 — 2026-07-16 — 重构“昨日重现”低带宽随机照片墙

**修改文件**：
- `themes/butterfly/layout/includes/head.pug`
- `themes/butterfly/layout/includes/additional-js.pug`
- `themes/butterfly/source/css/yesterday-gallery.css`
- `themes/butterfly/source/js/yesterday-gallery.js`
- `themes/butterfly/source/js/lazy-loading-optimized.js`
- `themes/butterfly/source/js/lightbox-enhanced.js`

**修改原因**：旧页面把 292 张照片自动分批下载完，预加载绕过并发队列，并使用 IndexedDB 复制全部图片；浮现/隐藏依赖未取消的延迟回调与周期性自检，快速双向滚动时会出现视口内图片被旧回调隐藏。所谓“清除缓存”只能删除 IndexedDB，不能清除浏览器 HTTP 缓存，文案与实际能力不一致。

**修改内容**：

1. 页面改为构建 manifest 驱动：图片加载前依宽高完成稳定双列瀑布流占位，极窄屏为单列；不依赖图片下载完成后测量或反复重排。
2. 新控制器在接近视口时才设置真实 `src`，所有卡片和灯箱请求共用统一调度器；快速桌面最多 3、移动/3G 最多 2、Save-Data/2G 最多 1 个在途请求。
3. 严格视口 observer 在正面积进入时显示、完全离开时立即隐藏，并根据从上/下方向进入设置相反位移；不再用显示/隐藏定时器、批次超时、5 秒轮询或焦点恢复重绑。
4. 当前会话以 `sessionStorage` 保存一次 Fisher–Yates 随机排列；manifest 内容变化自动失效。“重新随机排列”不刷新页面、不冒充清除 HTTP 缓存。
5. `lightbox-enhanced.js` 增加 managed gallery：遵循随机顺序、主图请求走同一队列，只显示当前附近 5 个数字导航项，不再为 292 张照片同时创建真实缩略图请求，并恢复打开前的 body overflow。
6. 全局文章懒加载排除 `data-gallery-managed`，避免两套调度器竞争；Pug 仅在当前 PJAX 关闭前提下为 `/swiper/` 条件加载图库 CSS/JS。

**相关站点文件**：`source/swiper/index.md`、`scripts/auto-image-list.js`、`tools/optimize-gallery-images.js`、`source/swiper/README.md`。

**可回滚性**：可整体恢复旧 `source/swiper/index.md` 内联实现并移除新增 CSS/JS；但会重新引入全量下载、伪缓存清理、并发绕过和 observer 竞态，不建议局部混用新旧加载系统。

**验证**：292 张 manifest 条目的数量、尺寸、字节数和 SHA-256 内容版本断言通过；`node --check`、压缩 dry-run、`git diff --check` 和 `npm run build` 通过。系统 Chrome/CDP 验证远处卡片无 `src`、稳定移动策略最大并发 2、滚到中部向下进入可见且加载、离开后隐藏、向上返回再次浮现、当前标签页刷新顺序不变、重排不导航、灯箱只含 5 个数字项且无批量缩略图图片。真实手机和慢服务器环境仍待人工体验；PJAX 当前禁用，未来开启前需把图库资源改为全局 no-op 注入或加入 PJAX 资源交换。

**远程约束**：仅本地实施；自 `3eab004` 后没有执行 fetch、pull、push、deploy 或其他远程操作。

---

### #9 — 2026-07-15 — 侧栏公告历史时间轴

**修改文件**：
- `themes/butterfly/layout/includes/widget/card_announcement.pug`
- `themes/butterfly/layout/includes/head.pug`
- `themes/butterfly/layout/includes/additional-js.pug`
- `themes/butterfly/source/css/announcement-history.css`
- `themes/butterfly/source/js/announcement-history.js`
- `themes/butterfly/source/css/styles.css`

**修改原因**：Butterfly 原公告卡只能从 `_config.butterfly.yml` 读取一期未转义 HTML，没有发布时间和历史浏览能力；用户要求以纵向滚动时间轴阅读每版公告，并提供便于持续编辑、可由 Git 恢复的独立配置入口。

**修改内容**：

1. `card_announcement.pug` 改读 `site.data.announcements`，静态输出当前公告、发布时间和历史原生 `<details>`；数据缺失时仍使用旧 `content`。
2. `announcement-history.css` 提供带最大高度的纵向滚动时间轴、节点、当前徽标、历史摘要、图片比例、移动端与 reduced-motion 样式；历史摘要隐藏原生小三角并在右侧绘制自定义箭头，`head.pug` 同步加载该样式。
3. `announcement-history.js` 仅控制超过配置期数条目的“查看全部/收起”，支持 DOM ready 和 PJAX 幂等初始化；`additional-js.pug` 仅在侧栏公告启用时加载。
4. 删除 `styles.css` 中被专属样式替代的旧 `.announcementImg` 规则，消除无效 flex 属性和 `transition: all`。
5. 站点侧配套为 `source/_data/announcements.yml` 与 `scripts/announcement-history-validator.js`；完整编写和恢复说明见 [公告历史时间轴文档](../03-api-practices/announcement-history.md)。

**相关文件**：`source/_data/announcements.yml`、`scripts/announcement-history-validator.js`、`_config.butterfly.yml`

**可回滚性**：可恢复旧 `card_announcement.pug` 并移除 CSS/JS 两个加载入口；YAML 可作为不参与渲染的历史档案保留。实施前全部状态已一次性备份到远程分支 `feat/announcement-timeline` 的 `13c3f5f`，之后未再进行远程操作。

**验证**：`node --check`、`git diff --check`、`TZ=UTC npm run clean && TZ=UTC npm run build` 通过；17 期公告在首页、归档和文章生成态均存在，本地图片与外部 URL 隔离断言通过。系统 Chrome/CDP 已验证 1440px/375px 卡内滚动、“查看全部”、历史 `<details>`、原生 marker 隐藏后的右侧箭头和 1024px 既有整侧栏隐藏；临界断点、仅键盘、暗色/阅读模式和真实 PJAX 仍待发布前人工回归。

---

## 升级主题时的检查清单

当 Butterfly 主题发布新版本时，按以下步骤操作：

1. [ ] 备份当前主题目录 `themes/butterfly/`
2. [ ] 下载新版本主题
3. [ ] 对比本目录中的所有修改记录，逐一在新版本中重新应用
4. [ ] 验证所有自定义功能正常工作
5. [ ] 在本目录中新增一条升级记录
