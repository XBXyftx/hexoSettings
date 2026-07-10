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

### #4 — 2026-05-04 — katex.pug 添加客户端渲染支持

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
| **新增代码** | typewriter-effect.css、entrance-popup.css、`lazy-loading.css`、`lazy-loading-stable.css`、vscode-breadcrumb-toc.css、header-universe.js；Font Awesome 与 `/css/index.css` 当前各有主题/inject 重复入口 |
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
| **修改内容** | 包含注释掉的 hamburger 菜单修复代码和增强移动端检测 |
| **影响** | 主题主脚本 |

---

## 主题文件修改状态总览

| 文件 | 修改类型 | 风险等级 | 升级时处理建议 |
| --- | --- | --- | --- |
| `layout/includes/layout.pug` | 添加 HTML | 中 | 升级后重新注入弹窗结构 |
| `layout/includes/head.pug` | 添加链接 + 当前存在资源重复 | 高 | 升级后重新添加自定义 CSS/JS 链接；先解决 `/css/index.css` 与 Font Awesome 重复，**不要**恢复已回滚的“仅异步 Font Awesome”方案 |
| `layout/includes/additional-js.pug` | 添加加载 | 高 | 升级后所有自定义 JS 需重新添加 |
| `layout/includes/footer.pug` | 添加脚本 | 低 | 升级后重新添加建站时间统计 |
| `layout/includes/mixins/indexPostUI.pug` | 修改布局 | 高 | 升级后重新实现 layout 8 逻辑 |
| `layout/index.pug` | 添加类名 | 低 | 升级后重新添加 masonry 类 |
| `layout/includes/head/config_site.pug` | 添加字段 | 中 | 升级后重新暴露 typewriter 字段 |
| `source/js/main.js` | 添加注释 | 低 | 影响不大，可忽略 |

---

### #5 — 2026-07-10 — 重写首页响应式瀑布流（P0）

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
- 真实浏览器视觉/Performance 回归仍待完成，详见 [本次操作记录](../04-operations/2026-07-10-waterfall-rewrite/README.md)。

**关联基线**：`69772c8`（已推送到 `origin/master`）

---

## 升级主题时的检查清单

当 Butterfly 主题发布新版本时，按以下步骤操作：

1. [ ] 备份当前主题目录 `themes/butterfly/`
2. [ ] 下载新版本主题
3. [ ] 对比本目录中的所有修改记录，逐一在新版本中重新应用
4. [ ] 验证所有自定义功能正常工作
5. [ ] 在本目录中新增一条升级记录
