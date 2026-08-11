# 06-theme-modifications — 主题修改跟踪

> **当前主题状态（2026-07-10 核验）**：本页 #2 的 Font Awesome 异步去重记录已经在 commit `b472183` 回滚，当前实际为主题同步加载 + inject 异步重复加载；附录中 network/topimg/旧 lazy-loading 脚本也已删除。任何主题升级或性能改动前，先读 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md)。

本目录记录所有对 `themes/butterfly/` 目录下文件的修改。

主题修改前必须阅读 [`../agent.md`](../agent.md) 和 [`../rules.md`](../rules.md)。每次记录都要说明当前验证边界；未经过浏览器或人工确认的视觉判断标记为待确认。

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
| **新增代码** | typewriter-effect.css、entrance-popup.css、文章页 `lazy-loading-optimized.css`、vscode-breadcrumb-toc.css、文章页 toc-toggle-group.css、header-universe.js；旧 `lazy-loading.css`/`lazy-loading-stable.css` 已停止从 head 加载；Font Awesome 与 `/css/index.css` 当前各有主题/inject 重复入口 |
| **条件加载** | 部分 CSS/JS 仅在文章页面（`globalPageType === 'post'`）或首页加载 |
| **影响** | 所有页面的 head 部分 |

### layout/includes/additional-js.pug

| 项 | 值 |
| --- | --- |
| **修改内容** | 添加多个自定义 JS 加载 |
| **新增代码** | waterfall.js（首页）、typewriter-effect.js（文章页）、entrance-popup 系列、vscode-breadcrumb-toc.js（文章页）、toc-toggle-group.js（文章页）；network/topimg 与旧 lazy-loading 系列已删除 |
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
| `layout/includes/head.pug` | 添加条件 CSS、停止旧全站占位样式加载 + 当前存在资源重复；`header-universe.js` 仅首页 deferred 加载；文章页目录折叠项样式入口 | 高 | 升级后重新添加文章页懒加载状态样式、文章页目录折叠项样式、首页 header 星空条件入口；先解决 `/css/index.css` 与 Font Awesome 重复，**不要**恢复已回滚的“仅异步 Font Awesome”方案或旧全篇占位动画 |
| `source/js/lazy-loading-optimized.js` | 原生 lazy 协调、近视口占位与媒体结算事件 | 中 | 迁移时保留原生 `src`/`loading`，不能恢复 1×1 GIF 交换逻辑 |
| `source/css/lazy-loading-optimized.css` | 文章页图片比例保护、静态/近视口占位状态 | 低 | 保持 `max-width:100%` 与 `height:auto` 成对存在；仅无尺寸图片使用最小高度，保留 reduced-motion 和仅近视口动态视觉 |
| `layout/includes/additional-js.pug` | 添加加载；首页条件输出背景 Canvas、背景星空和瀑布流；文章页目录折叠联动脚本入口 | 高 | 升级后重新添加所有自定义 JS（含文章页目录折叠联动），保持首页星空脚本与 `#universe` Canvas 不扩散到非首页路由 |
| `layout/includes/footer.pug` | 添加脚本 | 低 | 升级后重新添加建站时间统计 |
| `layout/includes/mixins/indexPostUI.pug` | 修改布局 | 高 | 升级后重新实现 layout 8 逻辑 |
| `layout/index.pug` | 添加类名 | 低 | 升级后重新添加 masonry 类 |
| `layout/includes/head/config_site.pug` | 添加字段 | 中 | 升级后重新暴露 typewriter 字段 |
| `source/js/main.js` | 移动端增强逻辑与目录媒体重锚定 | 中 | 升级后保留用户输入取消、RAF 合帧、ResizeObserver 和有限时限；不得恢复依赖已删除 `lazyLoadPreload` 的一次性定位 |
| `source/js/waterfall.js` | 首页瀑布流纯布局控制器（2026-08-10 起已移除激光/涟漪） | 中 | 升级后保留纯布局职责与 PJAX 接线；悬浮动效由 styl 的「窗口激活」媒体查询负责，勿合并回 pointer 委托/RAF 坐标代码 |
| `source/css/_page/waterfall-homepage.styl` | 瀑布流卡片视觉（2026-08-10 起为 XP 窗口深色版） | 中 | 升级后保留布局重置段、XP 窗口视觉段与三条媒体查询（hover 激活 / 粗指针常激活+按压 / reduced-motion）；勿恢复六套玻璃配色与星空透窗 |

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

### #12 — 2026-07-20 — 首页瀑布流卡片激光水纹悬浮效果（**已被 #20 取代**，激光层与样式已随 XP 窗口换装删除）

**修改文件**：

- `themes/butterfly/source/css/_page/waterfall-homepage.styl`
- `themes/butterfly/source/css/styles.css`
- `themes/butterfly/source/js/waterfall.js`

**修改原因**：原首页卡片使用整卡线性渐变从左侧滑入，与用户希望的深蓝、青色、淡红激光水纹质感不符；重复的保险选择器还让瀑布流最终视觉分散在两份样式中，增加异步覆盖风险。

**修改内容**：

1. 删除 `styles.css` 中的 `auroraSlide`、整卡 `::before` 滑入层和重复瀑布流保险选择器，卡片最终视觉统一由 `waterfall-homepage.styl` 维护。
2. 仅在 `.recent-post-info` 绘制两层无交互伪元素：底层融合深蓝基底、鼠标中心青色主光和淡红反射，上层用重复椭圆径向纹理与窄高光模拟水面焦散；封面不染色，正文与链接保持在覆盖层上方。
3. `waterfall.js` 在容器上委托 `pointerover`、`pointermove`、`pointerout` 等事件；进入新卡片时读取一次信息区边界，热路径只记录坐标，通过单个 RAF 写入当前卡片的 `--laser-x`、`--laser-y`。封面区域的纵向坐标会限制在信息区顶部。
4. 细指针且支持悬浮时才启用跟随；触屏/粗指针关闭遮罩、上浮和封面缩放。`prefers-reduced-motion` 停止坐标跟随、过渡、卡片位移和图片缩放，只保留固定弱高光。
5. 媒体查询监听、委托监听、激光 RAF、激活类和 CSS 变量均纳入既有 `destroy()`；重复初始化或 PJAX 离开首页时完整释放。

**相关文件**：`themes/butterfly/layout/includes/mixins/indexPostUI.pug` 的现有卡片 DOM 保持不变；没有修改首页列数、卡片数据或封面资源。

**可回滚性**：可恢复三份主题文件的本次差异以回到旧滑入遮罩；不涉及内容数据迁移。不要只恢复 `styles.css` 的旧遮罩而保留新伪元素，否则会重新产生重复覆盖层。

**验证**：`waterfall.js` 语法检查、Stylus 独立编译、旧选择器静态断言和 `git diff --check` 通过；clean 后完整构建成功生成 2,360 个文件，生成 CSS 含水纹层、细/粗指针和 reduced-motion 降级，首页加载的 `/js/waterfall.js` 与主题源码一致。应用内浏览器策略阻止访问本地预览地址，因此颜色强度、四角跟随、快速跨卡片和多断点视觉仍标记为待人工验证。

**远程约束**：仅本地实施；未提交、未推送、未部署。

**Flat note 可读性修复（2026-07-21）**：文章夜空主题为 `#article-container` 的段落、列表和表格单元格设置了高优先级浅蓝白文字，覆盖了 Butterfly `.note.flat` 原本的 `$font-black` 继承色，导致 info、warning、danger 等浅色提示块出现浅字叠浅底。现仅在普通文章模式的 `.note.flat` 作用域内将正文、列表、表格、标题、强调、行内代码和普通链接统一恢复为近黑色 `#111827`，悬浮链接为纯黑；类型图标、左边框和提示块背景继续使用 Butterfly 原有配色，阅读模式不受影响。clean build 成功生成 2,360 个文件，生成 CSS 与主题源文件一致；截图对应文章的三类 flat note 均命中该规则，近似对比度为 13.74:1–15.02:1。

---

**2026-07-20 鼠标无效果修正**：应用内浏览器反馈实际鼠标悬浮时仅显示原有整块卡片底色。复核确认原实现同时以 `(hover: hover) and (pointer: fine)` 作为 JS 绑定门槛，并在粗指针媒体规则中用 `opacity: 0 !important` 隐藏水纹；嵌入式浏览器的能力值误报时，两层都会阻止真实鼠标效果。现改为始终在支持 Pointer Events 的环境注册委托监听，在事件热路径按 `pointerType === 'mouse'` 过滤触摸，并移除粗指针规则对伪元素的强制隐藏。触屏仍不会激活 `.is-laser-active`，reduced-motion 仍关闭坐标跟随。

**最终根因与验证**：用户明确授权读取内置浏览器日志后，按用户要求在开屏动画结束 2.5 秒后复测。运行时确认 `.waterfall-item` 已获得 `is-laser-active`、坐标变量也持续更新，但两层伪元素 opacity 仍为 0。生成 CSS 实际选择器是 `.post-card-wrapper.is-laser-active`，原因是 Stylus 激活块多缩进一级，而 JS 把类加在 `.waterfall-item`。现已修正选择器层级，并将热路径统一为 `pointermove` 判定当前卡片、仅在离开容器时清除，避免卡片 transform 引起的 `pointerout` 抖动。修复后内置浏览器实测 `::before` opacity 为 0.96、`::after` 为 0.72，截图可见青色椭圆水纹；临时 `[WaterfallLaser]` 日志已全部移除。

---

### #13 — 2026-07-20 — 将固定跟随纹理重构为轨迹扩散涟漪（**已被 #20 取代**，涟漪 JS/CSS 已全部删除）

**修改文件**：

- `themes/butterfly/source/js/waterfall.js`
- `themes/butterfly/source/css/_page/waterfall-homepage.styl`

**修改原因**：已修复的首版效果仍是一张重复径向纹理跟随鼠标整体平移，视觉像固定贴图，无法表现鼠标拨动水面后波纹留在原位向外扩散的过程；所有卡片的信息区还共用同一套蓝红毛玻璃配色。

**修改内容**：

1. 为每张 `.recent-post-info` 创建无交互的 `.waterfall-ripple-layer`。鼠标进入和沿轨迹移动时，按 64ms 与 14px 双阈值生成独立水波；水波固定在产生位置，在 0.82–1.03 秒内扩散、减弱并在 `animationend` 后删除。
2. 同一层最多保留 9 个水波，三套青色、绿色、白色光谱轮换；鼠标静止时不继续生成。中央跟随光仅保留 0.28 的弱光反馈，不再承担主体效果。
3. 取消旧 `repeating-radial-gradient` 固定水纹。内容保持在水波层上方，动态层不接收指针，标题、标签和摘要仍可点击。
4. 使用 `:nth-child(6n + N)` 提供六套同一色域内的毛玻璃变量，组合黑、深蓝、酒红、紫和粉色；每张卡片的渐变角度、明暗重心、边框强调色都有差异。
5. 信息区使用 18px blur、saturate、双径向环境光、半透明线性渐变和内阴影；卡片边框由原 2px 白色改为 1px 冷色细边界。粗指针不触发运行时水波，reduced-motion 直接隐藏水波元素。
6. `destroy()` 会清理激活状态、CSS 坐标和所有动态水波层；动画元素也通过 `animationend` 自行回收。

**柔边波场细化（2026-07-20）**：用户复核指出首版三道椭圆环仍像边界分明的彩色套圈。现已移除 `29%–31%`、`49%–51%` 等窄硬色带，把每个动态节点改为中心漫反射、主体宽过渡波带和外围余辉三层叠加；主层、内层和外层分别使用 2.8px、3.6px、5.4px 模糊，并通过 `screen` 混合自然叠融。每次水波还轮换轻微旋转角和横向扁率，使连续轨迹不再由完全同心、同形的圆环组成。

**停留时间与色谱收敛（2026-07-20）**：根据后续视觉反馈，将单节点寿命从 1.45–1.72 秒缩短为 0.82–1.03 秒，并把上限由 12 个降为 9 个，减少鼠标离开后的残留。动态水波中的淡红、粉紫和蓝紫已全部移除，三套 tone 仅在青色、绿色和白色之间轮换；中心、内层和外层也统一使用冷白与青绿过渡。

**扩散半径收敛（2026-07-20）**：将动态节点的最终缩放范围从 7.2–8.5 倍降为 3.6–4.3 倍，最终横纵扩散半径约为上一版的一半；基础波场尺寸、三层柔边、青绿白配色和 0.82–1.03 秒寿命保持不变。

**验证**：JS 语法、Stylus 独立编译和 `git diff --check` 通过；最新 clean build 成功生成 2,360 个文件。内置浏览器等待开屏 2.5 秒后确认首页生成 15 个空水波层；第三轮轨迹测试捕获到 0.82 秒、0.89 秒、0.96 秒三个相邻节点，运行时颜色依次确认青色、绿色、冷白为主光，截图中水痕为青绿白相间；等待 1.15 秒后动态节点归零。

**远程约束**：仅本地实施；未提交、未推送、未部署。

### #14 — 2026-07-20 — 文章主内容卡片切换为独立夜空磨砂背景

**修改文件**：`themes/butterfly/source/css/styles.css`

**修改原因**：`styles.css` 将 `#post` 与侧栏、归档页、普通页面和 Swiper 容器放在同一个亮蓝、紫、红、粉渐变规则中，并通过 `!important` 覆盖 `transpancy.css` 的深蓝透明背景。文章正文因此透明度偏高、颜色过亮，且与首页彩色卡片缺少视觉区分。

**修改内容**：

1. 从原亮色渐变组合选择器中移除 `#post`，不改变侧栏、归档页、普通页面和 Swiper 的既有外观。
2. 为普通文章模式的 `#content-inner > #post` 建立黑色—深蓝夜空渐变，叠加三处低亮冷白星点和两层深蓝环境光；使用 26px 背景模糊、轻度饱和、1px 冷白细边界、外阴影和低强度内反光。该选择器已按当前生成 HTML 的 `<main id="content-inner"><div id="post">` 结构核对，未沿用已失配的历史 `.layout_post > #post`。
3. 通过 `body:not(.read-mode)` 明确排除阅读模式，使阅读模式继续采用主题原有的透明、无阴影排版。
4. 在文章卡片作用域内将正文设为浅蓝白、标题设为接近白色、链接设为浅青蓝，并补充轻微标题文字阴影；代码块、引用块、图片和文章 DOM 结构不改。

**透明度与青色点缀细化（2026-07-20）**：根据视觉反馈，将近黑底色调整为更透亮的深海军蓝，三段底色不透明度收敛在 0.72–0.73，使背景图能够透过磨砂层显示；三处冷白星点、顶部内反光和边框统一改为低强度淡青色，深蓝环境光略微提亮，外部黑色阴影由 0.48 降至 0.36。链接同步提亮为浅青白，弱文本变量也提高亮度，避免透明度提高后被背景图削弱。

**可回滚性**：可安全回滚该独立规则并把 `#post` 放回原组合选择器；回滚后文章页恢复亮蓝紫红渐变。

**验证边界**：`git diff --check` 通过；最新 clean build 成功生成 2,360 个文件，`public/css/styles.css` 与主题源文件一致。生成文章确认实际 DOM 为 `#content-inner > #post` 且新选择器存在于加载的 `/css/styles.css`；旧亮色组合选择器已不再包含 `#post`。按最不利的“中段 0.72 深蓝覆盖纯白底图”计算，合成底色约为 `rgb(77, 102, 135)`，正文、标题、链接和弱文本对比度仍约为 4.89:1、5.60:1、4.74:1、4.61:1，均达到 WCAG AA。当前内置浏览器本地地址策略无法提供文章页视觉截图，最终透图程度、淡青星点观感与长文滚动外观待用户刷新本地文章人工确认。

**远程约束**：仅本地实施；未提交、未推送、未部署。

### #15 — 2026-07-21 — 拉开瀑布流默认配色并加入固定星点（**已被 #20 取代**，六套玻璃配色与星空透窗已随 XP 窗口换装删除）

**修改文件**：`themes/butterfly/source/css/_page/waterfall-homepage.styl`

**修改原因**：首页卡片默认信息区虽然已有六组变量，但主要集中在相近的蓝紫红区间，远距离浏览时仍显得像同一套渐变；用户希望增强每张卡片常驻底色的辨识度，并加入随机分布感的固定白色星光，同时明确不修改鼠标悬浮水波。

**修改内容**：

1. 将六组默认玻璃配色重新划分为黑青、钴蓝、酒红、赤褐、紫罗兰、深海绿蓝；分别改变渐变角度、三段底色、两处环境光和悬浮边框强调色。
2. 每组配置六套不同的星点坐标变量，`.recent-post-info` 默认背景增加六层 0.6–0.9px 白色径向光点；透明度分为 0.40–0.76，形成大小和亮度不完全一致的静态星点。
3. 星点直接属于常驻背景，不新增 DOM、不执行动画、不跟随鼠标，也不占用现有 `::before`、`::after` 和 `.waterfall-ripple-layer` 水波层。
4. 封面图片、卡片尺寸、文字层级、链接点击、触屏降级和 reduced-motion 行为保持不变。

**星点密度细化（2026-07-21）**：根据视觉反馈将每张卡片的固定星点由 6 个增加到 10 个，核心半径由 0.6–0.9px 缩小为 0.3–0.5px，完整柔边范围由 1.4–1.8px 收窄为 0.8–1.15px；六组配色分别补充四个不同坐标，星点更密集但单点更细小。

**21 星密度细化（2026-07-21）**：继续按视觉反馈将每张卡片的固定星点从 10 个精确增加到 21 个，新增 11 颗仍保持 0.3–0.45px 核心与 0.8–1.05px 柔边；六组卡片分别使用独立坐标映射，保留细小星光而提高覆盖密度。

**背景星空透窗替代（2026-07-21）**：最终根据性能复核，不再用 21 层 CSS 径向渐变模拟星点，也不为 15 张卡片复制顶部封面的 Canvas/RAF。信息区改用不透明度约 0.44–0.63 的六组深色玻璃，模糊由 18px 降至 4px，并以 `brightness(0.78)` 压低透入的背景高光，使既有全屏 `#universe` 普通星、大星和流星能够直接透过卡片。标题、日期、标签和摘要改为高亮冷白文字，叠加深色文字阴影；标签另有半透明深色底，避免明亮背景图或星光穿过文字时削弱可读性。悬浮水波、卡片布局、Canvas 数和 RAF 数均未改变。

**星空可见度增强（2026-07-21）**：同步调整 `universe-optimized.js` 与 `header-universe.js` 的绘制参数。普通星由暖黄色改为冷蓝白，大星改为更亮的浅蓝白；普通星/大星峰值透明度提高到约 0.42–0.92，流星提高到约 0.58–0.92，并分别应用 1.15、1.18、1.8 的绘制亮度倍率，尾迹为 1.35。该阶段没有增加粒子数量、尾迹段数、Canvas、RAF、帧率或绘制调用，避免以全屏滤镜换取亮度。

**星体尺寸增强（2026-07-21）**：继续按视觉反馈将背景普通星从 1.0–2.2px 提高为 1.3–2.75px，顶部普通星从 1.1–2.6px 提高为 1.4–3.1px；两层大星半径由 2px 增至 2.5px，流星头部由 1.5px 增至 1.9px，尾迹点同步放大约 15%–20%。粒子数量、移动速度、30fps、10 段尾迹以及 Canvas/RAF 数量保持不变。

**文字底层移除（2026-07-21）**：根据视觉反馈移除标题与摘要周围的大范围深色柔光，并将标签默认深色半透明底和 4px 标签模糊改为透明、无模糊。标题、日期、标签和摘要仅保留 1px 低强度下投影，避免形成文字背后的暗色雾层；标签细边界、悬浮反馈和高亮冷白文字保留。

**可回滚性**：可将六组变量与 `.recent-post-info` 背景恢复到上一提交；水波 JS 无需回滚。

**验证边界**：最终透窗样式的 Stylus 独立编译成功，输出 17,758 字节 CSS；最新 clean build 成功生成 2,360 个文件。生成 CSS 已无 `--star-*` 变量、21 层模拟星点、标签默认深色底或大范围文字柔光，只保留卡片 4px 背景模糊、亮度抑制和 1px 轻微文字投影；两套星空脚本的语法检查通过，亮度和尺寸参数已进入生成脚本，且静态核对确认粒子预算、速度、10 段尾迹和 30fps 均未变化；生成水波脚本继续匹配源码。内置浏览器在刷新 `localhost:4000` 时明确拒绝访问，最终透星程度、文字清晰度、悬浮水波和移动端观感待用户手动刷新首页确认。

**远程约束**：仅本地实施；未提交、未推送、未部署。

---

### #16 — 2026-07-29 — 首页封面 Liquid WebGL2 叠层尝试（已回退）

**最终状态（2026-07-30）**：视觉验收未通过，以下主题改动已全部恢复；当前主题不存在 Liquid JS/CSS 或加载入口。本条只作为尝试记录，不是升级主题时需要重放的现役修改。

**修改文件**：

- `themes/butterfly/source/js/header-liquid.js`
- `themes/butterfly/source/css/header-liquid.css`
- `themes/butterfly/layout/includes/head.pug`

**修改原因**：在不替换现有封面图、不影响双层星空、不扩大到正文或非首页路由的前提下，将 Canvas UI Liquid 的鼠标驱动流体色迹用于首页顶部封面；手机和平板必须维持原有纯星空性能边界。

**修改内容**：

1. 原生移植 WebGL2 流体求解器，使用固定蓝色透明色迹；不引入 React/shadcn，不捕获 HTML 内容纹理，因此不执行实验性 HTML-in-Canvas 或封面图扭曲。
2. 仅在 `>1024px + hover:hover + pointer:fine` 且非 reduced-motion 时创建 `.header-liquid-canvas`；其他设备完全不创建 WebGL 上下文、Canvas、求解器资源或指针监听。
3. Canvas 固定在 `#page-header.full_page` 内部，层级 1；顶部星空保持 2，标题和滚动提示保持 3，导航不改。Canvas 不接收指针，封面裁剪防止流体进入正文。
4. 轨迹耗散后自动停止 RAF，封面离屏或文档隐藏时停止；尺寸、交叉可见性、断点变化、context lost、PJAX 和公开控制器调用均有幂等销毁/恢复路径。
5. WebGL2、浮点 framebuffer、着色器或程序失败时静默回退到现有封面与星空；不新增 fallback 动画。
6. 2026-07-30 根据视觉反馈将最终显示透明度上限从 `0.82` 调整为 `0.492`（原值的 60%）；流体求解参数、蓝色色值、设备门槛、层级与生命周期均未改变。

**相关文件**：`themes/butterfly/source/js/header-universe.js`、`themes/butterfly/source/css/styles.css` 与 `themes/butterfly/source/js/universe-optimized.js` 保持原实现；本次没有修改星体参数、Canvas 数量、粒子预算或帧率。

**回退结果**：以实施前已远程备份的 `7c773140323aef8e40f1114bd5ba9dcf4870b439` 为基点，已移除 Liquid JS/CSS 并恢复 `head.pug` 的首页加载入口；现有双层星空未回滚。

**验证**：JS 语法、diff 检查、clean build、生成资源隔离及私密索引哈希通过；Codex 内置浏览器完成 390/1024/1440 三断点、鼠标视觉轨迹、断点销毁重建、reduced-motion、空闲停止、封面离屏、交互命中、控制器销毁和归档/文章隔离验证。2026-07-30 透明度调整后再次完成 clean build，并在 1440×900 确认较浅轨迹、封面边界、层级、两层星空与零 Liquid/WebGL 错误，在 1024×900 确认 Liquid 仍为 0。标签页隐藏触发受内置浏览器后端限制，真实设备与其他浏览器仍待发布前回归。完整证据见操作日志 #50。

**远程约束**：回滚基点确认后未执行远程操作；实验实现未提交、未推送、未部署，回退后只保留长期记忆。

---

### #17 — 2026-07-30 — 非文章页 Bend 兼容折叠尝试（已回退）

**最终状态（2026-07-30）**：视觉验收未通过，以下主题、右键菜单和独立页面改动已全部恢复；当前主题不存在 Bend 资源、控制器或开关。本条只作为尝试记录，不是升级主题时需要重放的现役修改。

**修改文件**：`bend-effect.js`、`bend-effect.css`、`head.pug`、`rightmenu.pug`、`rightmenu.js`、`rightmenu.css`

**修改原因**：在文章阅读区域保持完全原生的前提下，为其他主题页面增加 Canvas UI Bend 的页面边缘折叠语义，并允许用户从右键菜单长期关闭或重新开启。

**修改内容**：

1. 上游依赖当前浏览器不支持的 `drawElementImage` / `requestPaint`，因此采用固定、不可命中的 CSS 3D 顶底折叠层；不复制、隐藏、搬运或捕获页面 DOM，也不宣称为上游逐像素重映射。
2. 保留 `zone=240`、`angle=80`、`rounding=150`、`perspective=700`、`ease=240`、`smoothing=0.1`、`tumble=0.5`、`tilt=0.5`、`direction=in` 等配置语义。
3. `head.pug` 仅在非文章页加载 Bend；运行时另以 pageType 和 `#body-wrap.post` 双重排除。文章页右键按钮禁用并显示“文章页关闭”。
4. `rightmenu.js` 改为无 jQuery 依赖的原生实现，增加 `blog:bend-enabled` 持久化开关和独立页面容错，同时保留既有菜单功能。
5. RAF 收敛即停，页面隐藏暂停；resize、Observer、scroll、wheel、pointer、storage、reduced-motion 与 PJAX 均有清理路径。
6. `window.__bendController` 提供幂等管理接口；效果层 `pointer-events:none`、`aria-hidden=true`，不拦截页面交互。

**相关文件**：`source/birthday-gift/index.html` 作为 `layout:false` 页面显式复用资源；首页 Liquid 和双层星空不属于 Bend 回滚范围。

**回退结果**：以已远程备份的 `7c77314` 为基点，已恢复 Bend/右键/入口差异及生日页接入，未使用 `git reset --hard`。

**实验验证边界**：JS/diff、clean build、全部 176 个生成路由资源审计，以及内置浏览器的默认效果、开关持久化、文章页硬隔离、reduced-motion、生日页滚动、连连看/Markdown/Swiper/Coffer/About/留言页代表交互和控制器生命周期均通过；完整证据见操作日志 #51。上述结果只描述已删除的实验版本；实现未提交、未推送、未部署。

---

### #18 — 2026-08-06 — 文章目录 hideToggle 折叠分组

**修改文件**：

- `themes/butterfly/layout/includes/head.pug`（文章页条件加载 `/css/toc-toggle-group.css`）
- `themes/butterfly/layout/includes/additional-js.pug`（文章页条件加载 `/js/toc-toggle-group.js`）

**修改原因**：`{% hideToggle %}` 折叠块内的标题照常出现在文章目录中，点击跳转后内容处于折叠状态不可见；需要在目录中以 hideToggle 标题文字命名的折叠项收纳块内标题，并保持主题滚动高亮索引不被破坏。

**修改内容**：

1. 目录结构由新增 `scripts/toc-toggle-group.js` 覆盖内置 `toc` 助手生成：hideToggle（`<details class="toggle">`）块内标题归入 `<details class="toc-toggle">` 折叠项，名称取 `summary.toggle-button` 文字；分组 summary 不使用 `.toc-link`，编号、层级和 class 与内置输出一致；无 hideToggle 的页面输出逐字不变，解析失败回退内置助手。
2. 新增 `source/js/toc-toggle-group.js`：document 捕获阶段先把目标标题的闭合 details 祖先置 `open`，再交给 main.js 滚动定位；滚动高亮落入闭合目录组时经 MutationObserver 自动展开并标记 `has-active`；hash 直达在原生自动展开失效时兜底。
3. 新增 `source/css/toc-toggle-group.css`：折叠项箭头、悬挂缩进与激活态；`[open]` 双向 `!important` 约束覆盖主题非展开模式 `.toc-child{display:none}` 与移动端 `display:block !important`。

**相关文件**：`scripts/toc-toggle-group.js`、`source/js/toc-toggle-group.js`、`source/css/toc-toggle-group.css`

**可回滚性**：可安全回滚。删除两个 pug 条件加载行并移除三个新文件即恢复内置目录行为，无数据迁移；目录分组只影响渲染输出，不改文章源文件。

**验证**：`node --check`、`git diff --check` 通过；`npm run clean && npm run build` 两次成功（各 2,370 个文件），构建后无扫描器改写差异。生成态断言：rustTips 目录分组标题“一些看起来很“正确”的解答”、组内编号 2.1.1–2.1.6、标签平衡、`.toc-link` 总数与文章标题数一致；全部含 hideToggle 文章逐篇解析，仅 rustTips 块内含标题；无 hideToggle 文章目录逐字不变；首页/about 不加载新资源。Headless Chrome CDP 21 项桌面/移动/hash/回归断言全过；目录视觉截图复核通过。真实移动设备触摸、Safari/Firefox 与 PJAX 开启状态待人工回归。

**关联文档**：[../04-operations/operation-log.md#52](../04-operations/operation-log.md#52--2026-08-06--文章目录-hidetoggle-折叠分组与点击展开联动)；脚本规则见 [../03-api-practices/README.md](../03-api-practices/README.md) 自定义脚本第 6 节

**远程约束**：仅本地实施；未提交、未推送、未部署。

---

### #19 — 2026-08-10 — 轮播布局偏移根因修复与 swiper 资源本地化（XP 平面窗口换装）

**修改文件**：

- `themes/butterfly/source/css/styles.css`
- `_config.butterfly.yml`（swiper 节）
- `source/css/swiper-xp.css`（新增）
- `source/css/swiper-lib.min.css`（新增，插件 lib 原样复制）
- `source/js/swiper-lib.min.js`（新增，插件 lib 原样复制）
- `source/js/swiper-init.js`（新增，插件 lib 复制 + `fadeEffect.crossFade: true`）

**修改原因**：用户反馈首页轮播内容溢出到容器右侧外部且不满意原渐变样式。运行时取证确认 `styles.css` 瀑布流规则中的 `overflow: visible !important` 覆盖了 Swiper 容器必需的裁剪（#6 瀑布流重写时引入），叠加 swiper 资源全走 elemecdn CDN 的加载时序风险与 fade 未开 crossFade 的叠印问题。

**修改内容**：

1. `styles.css`：`#recent-posts.waterfall-masonry .blog-slider` 删除 `overflow: visible !important`、`border-radius: 10px` 与两处 `padding-top !important`（桌面/移动各一），保留 margin/z-index/position 布局职责；渐变组合选择器移除 `#swiper_container`（aside/archive/page 不受影响）。
2. `_config.butterfly.yml` swiper 节 4 个资源由 `npm.elemecdn.com@1.0.12` 改为本地 `/css/swiper-lib.min.css`、`/js/swiper-lib.min.js`、`/css/swiper-xp.css`、`/js/swiper-init.js`。
3. 新增 `swiper-xp.css` 作为插件 `custom_css` 完全替代原 swiperstyle.css：XP 窗口平面风格（纯平蓝标题栏 + 四色徽标 + 装饰按钮组 + 深色 `#1e2431` 内容区 + 深色状态栏分页 + 硬阴影；初版为米白内容区，同日按用户反馈深色化），显式色彩不随 dark 变量，移动端纵向堆叠，reduced-motion 关闭入场动画；容器 `overflow: hidden` 恢复裁剪。

**相关文件**：`node_modules/hexo-butterfly-swiper/lib/`（本地化来源，Swiper 4.1.6）、`scripts/` 无改动；详细操作与验证证据见 [operation-log #53](../04-operations/operation-log.md#53--2026-08-10--首页轮播修复布局偏移并换装-windows-xp-平面窗口风格仅本地实施)。

**可回滚性**：可安全回滚。恢复 `_config.butterfly.yml` 4 个 CDN URL 并还原 `styles.css` 三处差异即可回到旧 CDN + 渐变样式；新增 4 个本地文件删除不影响其他功能。注意回滚 `overflow: visible` 会重新引入 slide 溢出可见的已知故障。

**验证**：clean build 成功（2,386 个文件）；生成态资源引用全部本地化；ego-browser 桌面 2544px 与移动 375px 断点实测 0 张 slide 溢出、单张可见、分页状态栏与 XP 窗口视觉符合设计、分页点击切换正常。真实设备触摸与其他浏览器待人工回归。

**远程约束**：仅本地实施；未提交、未推送、未部署。

---

### #20 — 2026-08-10 — 瀑布流卡片换装 XP 窗口风格并移除激光涟漪浮层

**修改文件**：

- `themes/butterfly/source/css/_page/waterfall-homepage.styl`（卡片视觉重写）
- `themes/butterfly/source/js/waterfall.js`（删除约 250 行激光/涟漪代码，布局控制器逐字保留）

**修改原因**：用户要求将 #19 轮播的 XP 窗口平面风格推广到瀑布流卡片，不动布局逻辑、保留标题/封面/标签元素、删除封面信息区鼠标浮层（#12 激光、#13 涟漪、#15 星空透窗随之全部移除）、重新设计悬浮与触屏响应；同日复核后窗口内部定为深色模式、蓝色标题栏不变。

**修改内容**：

1. 卡片改为 XP 窗口：深色 `#1e2431` 内容区、3px 灰蓝边框、`3px 3px 0` 硬阴影；`::before` 标题栏（非激活 `#97a9cb`，四色徽标 + `counter(xp-window)` 窗口编号 `article_NN.exe`）、`::after` 11 层 background 装饰按钮组；封面深色衬底直角；标题 `#9ecbff`、摘要 `#c3cad7`、标签深色 XP 平面按钮。
2. 悬浮动效重新设计为纯 CSS「窗口激活」：桌面 hover / `:focus-within` 点亮标题栏、边框变蓝、按钮组显现、阴影加深、封面 `brightness(1.06)`；触屏粗指针常激活、`:active` 下沉按压；reduced-motion 关闭过渡。
3. waterfall.js 净化为纯布局控制器：删除涟漪层创建、激光坐标 RAF 与全部 pointer 委托监听；列数计算、ResizeObserver、媒体查询、图片 settle、PJAX 接线不变。
4. 选择器勘误：`.tags` 与 `.article-meta` 在生成结构中平级，旧嵌套规则从未命中；新样式按真实 DOM 书写并覆盖 `styles.css:973` 通用标签规则；桌面封面遗留 `:hover scale(1.05)` 由激活规则 `transform: none` 压制。

**相关文件**：`source/css/swiper-xp.css`（同一设计语言的轮播窗口）；完整证据见 [operation-log #54](../04-operations/operation-log.md#54--2026-08-10--首页瀑布流卡片换装-xp-窗口风格并移除激光涟漪浮层仅本地实施)。

**可回滚性**：可安全回滚两文件至本次修改前版本；回滚后恢复星空透窗卡片与 JS 涟漪浮层。升级主题时需保留：布局重置段、XP 窗口视觉段、三条媒体查询（hover 激活 / 粗指针常激活+按压 / reduced-motion）与纯布局版 waterfall.js，不要再把 #12/#13 的激光涟漪代码合并回来。

**验证**：clean build 2,386 个文件；生成态无 `waterfall-ripple`/`is-laser-active`/`--glass-*` 残留；ego-browser 桌面 hover 激活、移动断点（触摸仿真）常激活、单列布局与无横向滚动均实测通过，截图复核激活/非激活对比与深色可读性。触屏 `:active` 因 CDP 合成事件限制未获运行时证据，真实设备待人工回归。

**远程约束**：仅本地实施；未提交、未推送、未部署。

---

### #21 — 2026-08-10 — 轮播间歇性空白修复：JS 初始化门控与静态降级

**修改文件**：

- `source/css/swiper-xp.css`
- `source/js/swiper-init.js`

**修改原因**：线上轮播间歇性出现窗口空白（标题栏/状态栏在、内容区全空）。ego-browser 线上 3G 节流复现确认：Swiper JS 晚到或加载失败时无 `swiper-slide-active` 类，而内容/图片的 `opacity: 0` 隐藏规则依赖该类解锁，导致空窗期空白、JS 彻底失败时永久空白。

**修改内容**：

1. `swiper-xp.css`：内容 stagger 与图片透明度隐藏规则改为仅在 `.swiper-ready` 类存在时生效；新增 `:not(.swiper-ready)` 降级规则（非首张 slide `opacity: 0 !important`、首张 `opacity: 1 !important; width: 100% !important`），JS 未初始化期间静态展示第一张精选。
2. `swiper-init.js`：Swiper 全局缺失检测、`[swiper]` 初始化日志、初始化成功后添加 `swiper-ready` 门控类、2 秒自检自愈（active 缺失或全部 slide 不可见时 `update() + slideTo(0,0)` 并 `console.warn` 现场）。
3. 注意：Swiper 4.1.6 初始化后**不修改容器类名**（无 `swiper-container-initialized`），门控必须由 init.js 显式加类——首版用该类名导致降级规则恒真、压制 fade 切换，已修正。

**相关文件**：完整排障证据见 [operation-log #55](../04-operations/operation-log.md#55--2026-08-10--首页轮播间歇性空白排障与初始化门控加固已部署)。

**可回滚性**：可安全回滚两文件；回滚后慢网/JS 失败场景恢复为空白窗口（#53 前的旧行为是内容裸排溢出，两者均为已知的旧故障模式）。

**验证**：本地正常路径（`swiper-ready` 门控、autoplay 切换、单张可见）与 JS 阻断路径（静态展示第一张、无横向滚动）均经 ego 实测通过；线上复验同过，`[swiper]` 日志已在生产 console 可见。

**远程约束**：经用户明确授权执行 `npm run pub`，双目标（GitHub Pages + 私有服务器）均已部署至 `49aabfbcc`；源码工作区未提交、未推送。

---

### #22 — 2026-08-10 — XP 窗口语言全站推广（侧边栏/文章页/标签插件）

**修改文件**：

- `source/css/xp-theme.css`（新增，inject.head 注册）
- `themes/butterfly/source/css/styles.css`（渐变选择器收窄、夜空规则与 flat note 修复移除、目录激活色改蓝）
- `themes/butterfly/source/css/_page/waterfall-homepage.styl`（非激活标题栏加深为 `#46587a`）
- `source/css/toc-toggle-group.css`（折叠组激活态同步 XP 蓝）
- `_config.butterfly.yml`（inject.head 新增 `/css/xp-theme.css`）

**修改原因**：用户要求将 XP 窗口风格推广到侧边栏卡片与文章内容区，保留作者卡渐变蒙版与背景图；非激活标题栏 `#97a9cb` 上绿色徽标与白色文字对比度不足（实测 1.01:1 / 2.37:1）。

**修改内容**：

1. xp-theme.css 提供 XP 公共色板与共享窗口框架（标题栏 + 四色徽标 + 装饰按钮组），覆盖侧边栏非 info 卡片与 `#post`/`#archive`/`#page` 主体；各卡片标题按类名定义（公告.exe 等，目录卡用排除法兜底）。
2. styles.css 渐变组合选择器收窄为 `.card-widget.card-info`（作者卡/访问卡保留渐变蒙版+背景图）；#14 夜空规则与 #12 flat note 修复整段移除，由 XP 深色窗口接管；目录激活项绿色改 XP 蓝。
3. note/hideToggle/btn/tabs/timeline 标签插件深色 XP 化；内联浅底 td/th 无字色单元格强制深字（仅 td/th，避免误伤 #0d1117 深底代码容器 div）。
4. 非激活标题栏加深为 `#46587a`（白字 7.15:1、绿徽标 3.05:1）。

**相关文件**：`source/css/swiper-xp.css`（同一色板）；详细证据见 [operation-log #56](../04-operations/operation-log.md#56--2026-08-10--xp-窗口语言全站推广侧边栏文章页标签插件仅本地实施)。

**可回滚性**：删除 xp-theme.css 与 inject 注册行、还原 styles.css/styl/toc-toggle-group.css 差异即可回滚；回滚后恢复夜空渐变文章页与绿色目录激活态。升级主题时需保留：xp-theme.css 全量、渐变选择器的 card-info 收窄、非激活标题栏 `#46587a`。

**验证**：clean build 2,387 个文件；ego 双断点覆盖首页/文章页/归档/标签/友链/分类/about；19 篇内嵌 HTML 文章对比度巡检全过；作者卡保留确认。真实设备与更多文章细节待人工回归。

**远程约束**：仅本地实施；未提交、未推送、未部署（用户明确要求仅本地调试）。

---

## 升级主题时的检查清单

当 Butterfly 主题发布新版本时，按以下步骤操作：

1. [ ] 备份当前主题目录 `themes/butterfly/`
2. [ ] 下载新版本主题
3. [ ] 对比本目录中的所有修改记录，逐一在新版本中重新应用
4. [ ] 验证所有自定义功能正常工作
5. [ ] 在本目录中新增一条升级记录
