---
name: 2026-07-10 渲染性能与长期记忆事实审计
description: 只读静态审计 Hexo/Butterfly 博客的 CPU/GPU、DOM、资源加载与长期记忆一致性；按严重度给出不改变视觉和功能的优化清单
type: project
---

# 2026-07-10 渲染性能与长期记忆事实审计

> **审计日期**：2026-07-10  
> **审计方式**：只读静态代码、配置、已存在 `public/` 产物和 Git 历史核验；**未执行构建、未启动服务、未访问或修改生产站点**。  
> **核心约束**：所有建议都以“视觉表现与基础功能不变”为前提；本报告**不是**实机性能剖析，CPU/GPU 占比必须在优化前后用浏览器 Performance 面板复测。  
> **范围**：主题 Pug 模板与自定义 JS/CSS、文章媒体、定制页面、资源注入、现有长期记忆文档。  
> **不在范围**：服务器响应头、CDN 实际命中、网络质量、访问者设备与浏览器版本——本地仓库没有可核验的生产证据。

---

## 后续状态（2026-07-11）

本报告保留 2026-07-10 静态审计时的证据、源码行号和未实施建议，不倒改为后续实现状态。其 P0 首页瀑布流建议已在提交 `9988ac4` 实施；[本地 Chrome 三断点 A/B 测量](../../04-operations/2026-07-10-waterfall-rewrite/BROWSER-PERFORMANCE-MEASUREMENTS.md)已归档，确认当前移动端在测量窗口内不存在旧 10Hz 轮询、滚动后的 `cssText` 整体覆写或调试输出，且 1024px / 1440px 均完成布局与主线程对比。目标设备有头浏览器回归仍待完成，因此不得将该 P0 项写为全设备实测通过。

审计中的 P1 双 Canvas 星空项曾于 2026-07-11 在基线 `049f08d` 之后实施单 RAF 分层实验，并完成本地 Headless Chrome 的 375px / 1024px / 1440px A/B 及 reduced-motion / 页头离屏断言。用户视觉验收后未采纳该效果；实际运行时代码已恢复为审计所述的双 Canvas / 双 RAF 基线。实验源码、数据和边界仍归档在 [P1 分层星空动效实验与回退](../../04-operations/2026-07-11-starfield-p1/README.md)，不能作为当前实现或当前性能收益的结论。

---

## L1 · 结论摘要

当前“部分电脑风扇狂转”有明确的、可静态复现的持续工作来源，且它们会叠加：

1. **移动端首页瀑布流**保留了每 100ms 全量 DOM 扫描、事件触发后的整批内联样式重写，以及调试 `MutationObserver`/日志。这是本次最优先处理的 CPU 热点。
2. **全站两个独立 30fps Canvas 星空**同时运行；它们虽已具备隐藏标签页暂停等降级，但前台依然持续双份绘制。
3. **所有 170 个已生成 HTML 页面**都会请求 `mermaid@undefined`，即使站内没有 Mermaid 图；主题正常的按需路径还会形成 `/%5Bobject%20Object%5D` 无效地址。这会造成失败请求、无谓脚本和初始化。
4. 若干带大量图片或视频的长文，在当前懒加载/媒体标记下有很高的解码、合成和网络压力：最大的一篇含 **115 张文章图片、18 段视频、约 1.47MB HTML**；视频文章中单页静态 MP4 总量最高约 **153MB**，而 `<video>` 未声明 `preload="none"`。
5. 旧长期记忆在 2026-05 的“已修复/当前事实”与 2026-07 的实际代码明显漂移；尤其是 Twikoo、Mermaid、Font Awesome、星空和已删除文件。已在本次文档更新中更正索引和关键专题记录。

### 严重度含义

| 级别 | 含义 |
|---|---|
| **P0** | 已存在持续主线程/渲染工作，且在常用页面与目标设备上触发；应先取样验证并处理。 |
| **P1** | 明显的持续资源或渲染成本，能解释部分设备发热/卡顿，应近期处理。 |
| **P2** | 有确定浪费或在长内容/特定页面中放大，排入后续批次。 |
| **P3** | 资源/维护成本或未来 PJAX 风险，收益较小但应纳入治理。 |

---

## L2 · 按严重度排序的优化问题清单

> **实施前置条件**：先在一个独立分支进行；每项均应在桌面和 ≤768px 移动视图录制 30–60 秒 Performance trace，对比 Main thread、Frames、JS heap、Network 和长任务。不要把“静态风险”写成未经测量的百分比收益。

| 优先级 | 问题与受影响页面 | 已验证证据 | 保持视觉/功能的优化方向 | 验收重点 |
|---|---|---|---|---|
| **P0** | **移动首页瀑布流永久轮询与调试监听**。手机/平板首页。 | [_config.butterfly.yml:215](../../../_config.butterfly.yml#L215) 启用 layout 8；[additional-js.pug:20-22](../../../themes/butterfly/layout/includes/additional-js.pug#L20-L22) 首页加载脚本。移动分支每 100ms 查询全部 `.waterfall-item`，并在异常时整批写 `cssText`：[waterfall.js:514-596](../../../themes/butterfly/source/js/waterfall.js#L514-L596)。额外捕获 click/touch/scroll/resize 并延后重写样式；[662-709](../../../themes/butterfly/source/js/waterfall.js#L662-L709) 再注册调试事件和 `MutationObserver`，还输出调用栈。 | 移动端已存在 CSS 单列规则（[646-658](../../../themes/butterfly/source/js/waterfall.js#L646-L658)）。把“看门狗”改成初始化一次的单列样式；删除生产调试 observer/日志。若确有外部脚本改写样式的历史问题，只保留**一个**有范围、有销毁路径的 observer，使用 RAF 合并一次修复。离开首页、断点切换时清除 timer/observer/listener。 | 首页卡片顺序、单列布局、间距、图片加载和分页不变；移动滚动不再出现 10Hz DOM 查询与无尽日志。 |
| **P1** | **双 Canvas 星空同时前台绘制**。所有带 `#page-header` 的主题页面。 | `header-universe.js` 由 [head.pug:97](../../../themes/butterfly/layout/includes/head.pug#L97) 全站加载；全屏 canvas 与 `universe-optimized.js` 由 [配置:1067-1093](../../../_config.butterfly.yml#L1067-L1093) 注入。二者都各有一个 30fps RAF：前者 [header-universe.js:116-128](../../../themes/butterfly/source/js/header-universe.js#L116-L128)，后者 [universe-optimized.js:117-137](../../../themes/butterfly/source/js/universe-optimized.js#L117-L137)。 | 优先做**同一控制器**：一个 RAF 管理两个视觉层，或合并到一个 canvas 的背景/页头裁剪绘制；保留现有色彩、粒子密度与流星效果。最低风险方案是在页头离开视口时暂停 header 层，并补上 `prefers-reduced-motion` 的静态背景降级。 | 视觉仍为全屏星空 + 页头星空；前台仅一个调度循环或页头不可见时不绘制；切后台、resize、页面切换仍正确恢复。 |
| **P1** | **Mermaid 被全站无条件加载，且 URL 配置失效**。所有生成页面。 | Mermaid 全局开启：[配置:950-959](../../../_config.butterfly.yml#L950-L959)。footer 无条件输出 `https://unpkg.com/mermaid@undefined/...`：[footer.pug:19-25](../../../themes/butterfly/layout/includes/footer.pug#L19-L25)。现有 `public/` 中 **170/171** 个 `index.html` 都有该 URL；站内当前未找到 Mermaid fence 或实际 `.mermaid-wrap`。`theme.asset.mermaid` 又被配置成 YAML 对象：[配置:1194-1198](../../../_config.butterfly.yml#L1194-L1198)，使主题按需加载器生成 `/%5Bobject%20Object%5D`（已在生成文章产物中核验）。 | 删除 footer 的无条件 loader；仅在页面实际有 Mermaid 节点时，调用主题已有的按需加载逻辑 [mermaid.pug:39-50](../../../themes/butterfly/layout/includes/third-party/math/mermaid.pug#L39-L50)。将资源配置改为固定、有效的 JS URL 或恢复主题默认解析方式，并显式设置与调用 API 兼容的版本。 | 普通页面 0 Mermaid 请求；未来含 Mermaid 的页面仍能在浅色/深色模式生成 SVG。要新增至少一篇最小 Mermaid 测试页后再发布。 |
| **P1** | **重媒体长文未限制视频预加载，且 DOM/解码规模很大**。尤其是 `yiDuo`、`“HongXiaoYi”`、`OpenSourceSummer2025` 等。 | 共 102 段 MP4，源文件合计约 **487MB**，其中 23 段 ≥5MiB。最大三篇单页静态视频总量约 **153MB / 140MB / 65MB**。所有视频都是 `<video width="100%" controls>`，未设 `preload`（如 [OpenSourceSummer2025.md:3416-3417](../../../source/_posts/OpenSourceSummer2025.md#L3416-L3417)）。最大示例文章生成 HTML 约 1.47MB、约 49,580 个 HTML 起始标签、115 张内容图片、18 段视频。 | 文章语义和播放器保留：为非首屏视频统一加入 `preload="none"` 与 poster（用现有首帧/缩略图）；通过 `IntersectionObserver` 在接近视口时才设置 source/src 并调用 `load()`。对超长文章采用章节折叠、按需挂载远离首屏的媒体节点，或拆为系列文章——内容不删、URL 可保持。 | 首屏及用户点击的视频可正常播放；滚动到视频前仍可见 poster；Network 不会在首屏同时拉取大量视频元数据/数据；原文章链接和内容完整性不变。 |
| **P1** | **Swiper 文章轮播插件将 CSS/JS/注入器发到所有页面**。非首页也会加载。 | 配置 `enable_page: all`：[配置:1266-1281](../../../_config.butterfly.yml#L1266-L1281)。插件无条件注册两 CSS 和两 JS 到全站：[node_modules/.../index.js:53-108](../../../node_modules/hexo-butterfly-swiper/index.js#L53-L108)，生成页面还含约 **4.7KB** 轮播 HTML 注入器。已在首页、普通文章、about、swiper 自定义页均核验到四个外部资源引用。 | 若视觉意图是“首页文章轮播”，将插件作用域收紧为 `/`，并让资源随首页条件注入；如确需所有页轮播，至少把 HTML 注入器改成先检测挂载容器存在再构造内容，避免非首页反复查找/注入失败。 | 首页轮播内容、动画与顺序不变；普通文章、about、独立 swiper 页面不再下载/执行无用 Swiper 资源。 |
| **P2** | **文章面包屑导航的 scroll 热路径未合帧**。标题较多的文章。 | 每个 scroll 事件遍历标题并读取 `offsetTop`，再计算文档高度和写入进度条：[vscode-breadcrumb-toc.js:140-177](../../../source/js/vscode-breadcrumb-toc.js#L140-L177)，监听器直接绑定：[229-230](../../../source/js/vscode-breadcrumb-toc.js#L229-L230)。 | 用 RAF 合并连续 scroll；在 init/resize/内容变化时缓存 heading 位置，滚动时二分查找；只有当前标题或进度确实变化时才写 DOM。 | 面包屑切换时机、进度条、移动/桌面 UI 完全不变；快速触控板滚动中每帧最多一次处理。 |
| **P2** | **页脚计时器以 4Hz 重写 DOM，且没有可见性暂停**。所有主题页面。 | [footer.pug:27-48](../../../themes/butterfly/layout/includes/footer.pug#L27-L48) 每 250ms 计算并 `innerHTML` 写两次；展示实际只精确到秒。 | 改为对齐下一秒边界的 `setTimeout` 链（1Hz），使用 `textContent`；`visibilitychange` 隐藏时停止，可见时立即补刷。 | 显示格式、建站时间和秒级更新效果不变。 |
| **P2** | **文章懒加载占位符在长图文中同时触发高代价无限动画**。主要是大量图片文章的加载阶段。 | 主脚本给每张待加载文章图加入 `.lazy-placeholder`：[lazy-loading-optimized.js:123-150](../../../themes/butterfly/source/js/lazy-loading-optimized.js#L123-L150)。全站加载的 [source/css/lazy-loading.css:16-96](../../../source/css/lazy-loading.css#L16-L96) 对其使用持续 background-position、box-shadow 动画、旋转 pseudo-element、`backdrop-filter`；例如有 198 张内容图的文章会同时具备大量占位层。该 CSS 与 stable CSS 均由 [head.pug:61-64](../../../themes/butterfly/layout/includes/head.pug#L61-L64) 同步加载。 | 保留加载中的“梦幻”视觉：只对视口附近的少量 placeholder 添加动态 class；其余使用静态渐变。将 `backdrop-filter` 和 `box-shadow` 动画替换为预渲染轻量背景或仅 transform/opacity 动画；图片完成/失败后彻底移除动画类。 | 占位色彩、淡入、失败提示不变；长文滚到远处时不保留数百个无限合成/绘制任务。 |
| **P2** | **关于页多层 backdrop-filter、模糊 3D 自动轮播**。访问 `/about/`。 | 10 个 card-row、42 张图片；卡片使用 `backdrop-filter: blur(20px)` [about/index.html:143-153](../../../source/about/index.html#L143-L153)，轮播图有持续 filter blur 与 `will-change: filter` [250-328](../../../source/about/index.html#L250-L328)，每个已加载轮播会启动 3.5–5 秒 interval [lazy-loading-about.js:278-292](../../../source/about/lazy-loading-about.js#L278-L292)。 | 视觉保持玻璃卡片/3D 轮播：只给可见卡片启用 backdrop blur，离开视口切为预混合半透明底色；只让当前、前一、后一张使用短暂 blur；轮播离开视口或标签隐藏时暂停，回来继续。 | 卡片玻璃感、轮播速度和操作不变；不可见区域不持续滤镜合成/计时。 |
| **P2** | **图片画廊保留多个生产调试/状态轮询**。`/swiper/`。 | `updateCacheStatus` 每 10 秒运行：[source/swiper/index.md:1646-1650](../../../source/swiper/index.md#L1646-L1650)；`startLoadingMonitor()` 每 5 秒查询/记录 DOM 状态，完成后才清除：[1690-1783](../../../source/swiper/index.md#L1690-L1783)，并在初始化后启动：[1808-1827](../../../source/swiper/index.md#L1808-L1827)。 | 将监控改为开发开关或仅在故障状态短时启动；状态 UI 由 IndexedDB 操作、图片完成事件驱动，不作固定轮询。 | 图片瀑布流、批量加载、缓存状态与清缓存功能不变；生产控制台无周期日志。 |
| **P3** | **Font Awesome 与主样式表重复插入**。全站。 | 主题 head 先同步加载 Font Awesome 与主 CSS：[head.pug:50-53](../../../themes/butterfly/layout/includes/head.pug#L50-L53)；`inject.head` 又插入相同 Font Awesome 和第二次 `/css/index.css`：[配置:1067-1082](../../../_config.butterfly.yml#L1067-L1082)。已生成页面有两份同 URL Font Awesome 和两份 `index.css`。注意：2026-05-04 曾尝试“仅保留异步 Font Awesome”，因图标首屏消失而回滚（commit `b472183`），所以不能简单重做旧方案。 | 首先移除重复的 `/css/index.css`（两份均同步/同源，视觉不应依赖第二份）。Font Awesome 保留主题那份同步入口以避免既往闪烁，再删除 inject 的异步重复 `<link>`；在旧浏览器、弱网和常用页面回归图标。 | 所有图标首帧正常、无闪烁；最终每页仅一份 `index.css`、一份 Font Awesome。 |
| **P3** | **当前 PJAX 关闭，但若以后启用会暴露监听器清理问题**。 | 当前配置关闭：[配置:999-1000](../../../_config.butterfly.yml#L999-L1000)。但面包屑 `destroy()` 只移除 DOM、不移除 window scroll/resize：[vscode-breadcrumb-toc.js:235-250](../../../source/js/vscode-breadcrumb-toc.js#L235-L250)；主题菜单也存在在刷新函数中直接绑定事件的路径。 | 保持 PJAX 关闭不动；在任何启用 PJAX 的提案中，先为每个自定义模块实现幂等 `init/destroy`，将 listener、timer、observer、RAF 都纳入销毁。 | 连续导航后 listener 数量不增长、无重复 canvas/导航/弹窗。 |

---

## L3 · 证据与优先级说明

### 3.1 已确认的全站持续成本

- 两个星空 animation loop：各自限到 30fps、都能在 `document.hidden` 时暂停，因此不是后台风扇问题的主要嫌疑；但**前台双份绘制**确实持续存在。
- 所有主题页的 250ms 页脚 timer。
- 所有主题页无条件 Mermaid 失败请求。已存在的 `public/` 代表产物中，170 个页面都包含该无效 URL。
- Swiper 插件为所有页面注册两 CSS、两 JS 和挂载脚本；`enable_page: all` 与其实际主页挂载意图冲突。

### 3.2 长内容的放大因素

这不是要求删除文章媒体，而是应承认“单页同时拥有很多媒体”会显著增加低配设备成本：

| 已生成页面 | 内容图片 | 视频数 | 文章 HTML 大小 | 同页 MP4 静态总量 |
|---|---:|---:|---:|---:|
| `2025/06/29/OpenSourceSummer2025` | 115 | 18 | ~1.47MB | ~65MB |
| `2025/03/31/“HongXiaoYi”` | 103 | 19 | ~416KB | ~140MB |
| `2025/03/16/yiDuo` | 35 | 11 | ~209KB | ~153MB |
| `2025/04/30/ToTheApril2025` | 198 | 3 | ~244KB | ~11MB |

静态文件总量并不等于首次下载量，实际取决于浏览器预加载策略、服务器 Range 支持与 CDN 缓存；但上述 DOM、解码候选和占位动画规模，足以使低性能设备更容易出现掉帧与风扇升速。

### 3.3 未判为问题的组件

以下代码已具备合理的节流/清理，或未显示出当前可达的持续热路径：

- 生日礼物页流星：22fps 上限、粒子上限、页面隐藏暂停、RAF 取消路径可见于 [birthday-gift.js:635-728](../../../source/js/birthday-gift.js#L635-L728)。
- 主文章懒加载使用 `IntersectionObserver`，重初始化前断开旧 observer，并在图片加载后 `unobserve`：[lazy-loading-optimized.js:30-41](../../../themes/butterfly/source/js/lazy-loading-optimized.js#L30-L41)。
- 打字机效果已有 timer 清理与 PJAX 清理路径。
- 关于页本地开发环境的 3 秒日志受 `localhost`/`127.0.0.1` 条件保护，非生产问题：[about/index.html:1259-1275](../../../source/about/index.html#L1259-L1275)。
- Twikoo **当前生成产物实际为视口触发加载**，不是旧文档所称的立即加载：生成文章中 `lazyload: true` 展开为 `btf.loadComment(...)`。它仍是约 938KB 的运行时资源，但只在评论容器进入视口后请求；本报告不把它列为本轮 P1。

---

## L4 · 推荐实施顺序与验证方案

### 批次 A：先消除明确的异常工作（低视觉风险）

1. 移除移动瀑布流的 100ms 轮询、调试 observer/日志，用已存在的 CSS 单列规则替代。
2. 修复 Mermaid：撤销 footer 无条件加载，配置有效的按需资源地址，新增一页最小 Mermaid 冒烟测试。
3. 将 Swiper 作用域从 `all` 收紧到首页，或修改插件为只在实际挂载页注入资源。
4. 删除重复 `/css/index.css`，在 Font Awesome 视觉回归通过后去掉 inject 的重复链接。

### 批次 B：持续渲染降载（需视觉比对）

5. 合并/协调双星空循环，或让页头动画随可见性停止。
6. RAF 化文章面包屑 scroll 路径；页脚降为 1Hz、隐藏标签页暂停。
7. 让文章占位效果只对可见区域动态化，避免 blur/box-shadow/background-position 对远离视口的全部图持续动画。

### 批次 C：媒体与定制页面专项（需内容回归）

8. 为大量视频文章增加 `preload="none"`、poster 和接近视口再加载机制；先从视频总量前三篇开始。
9. 关于页与画廊页的不可见轮播/滤镜/调试监控按视口和可见性暂停。
10. 考虑长文分章节按需挂载或拆系列；这是内容结构决策，应单独确认，不应作为无感重构处理。

### 每批的共同验证

```text
1. 保留一个优化前 production build，使用同一浏览器/设备/网络配置。
2. 首页：桌面 + 375px 宽度，静置 60 秒、滚动 30 秒；录制 Performance。
3. 长文：选择 OpenSourceSummer2025、yiDuo、ToTheApril2025，检查图片/视频、目录、评论与灯箱。
4. 定制页：/about/、/swiper/、/birthday-gift/。
5. 断网或阻断 Mermaid/Swiper CDN，确认普通页面没有报错/重试风暴。
6. 切换标签页 30 秒后返回，确认无重复 canvas、timer、轮播和 observer。
7. Lighthouse/Network 只作辅助；以用户设备上的 FPS、长任务、内存与风扇主观反馈为最终依据。
```

---

## L5 · 长期记忆事实核验结果

本次没有改动博客源码、主题、配置、文章或 `public/`；只纠正长期记忆中会误导后续维护的“当前事实”。主要失真如下：

| 原记录 | 当前核验事实 | 已处理 |
|---|---|---|
| 旧性能审计将已删除文件、已完成清理与当前待办混在同一表中。 | `network-monitor.js`、`topimg-monitor.js`、`universe.js`、旧 lazy-loading 系列、旧 MathJax 文件均已不存在；不应再作为当前代码问题。 | 将旧报告明确标为历史快照，并建立本报告作为当前基线。 |
| 旧记录称 Twikoo 的 `lazyload: true` 语义错误或“立即加载”。 | 当前生成文章代码为 `btf.loadComment(document.getElementById('twikoo-wrap'), loadTwikoo)`，即视口触发。 | 更新兜底模块与性能文档。 |
| Mermaid 被描述为插件自行注入、可正常按需使用。 | 当前主题 footer 无条件请求 `mermaid@undefined`，动态 loader 还会生成 `/%5Bobject%20Object%5D`；站内未找到实际 Mermaid 页面。 | 更新兜底模块，并列为 P1。 |
| Font Awesome 去重已完成。 | 2026-05-04 的去重改动已因首屏图标消失被回滚；现在是两份 CSS。 | 记录回滚历史和稳妥处理路径。 |
| 星空文档将双动画描述为基本对齐且“收益有限”。 | 两套 30fps 仍同时前台运行，应作为真实持续成本治理；原优化（visibility/FPS）仍有效。 | 更新星空专题和性能文档。 |
| 自定义功能清单仍列出已删除脚本、错误加载位置。 | 以现存文件和模板重新标注。 | 更新功能清单。 |
| 顶层索引日期/文章统计已过期。 | 当前有 57 篇 post Markdown、50 个 post asset 目录；日期为 2026-07-10。 | 更新索引。 |

---

## L6 · 变更边界与后续维护规则

- 本报告中的建议均未实施；“建议”不等于“已验证为收益”。
- 对主题文件或 `_config.butterfly.yml` 的任何后续修改，都必须先完整阅读对应文件并在 `06-theme-modifications/` 留痕。
- 更改 Mermaid、Swiper、Font Awesome 时应视为全站资源加载变更：必须先做完整 `hexo clean && hexo generate`，并对首页、普通文章、含公式文章、评论页、所有自定义页做产物与浏览器回归。
- 本地没有服务器缓存、压缩、Range、CDN 命中、真实设备采样数据；不要据此推断 TTFB 或精确节省带宽。

---

## L7 · 本次审计覆盖清单

- `_config.yml`、`_config.butterfly.yml`、`package.json`、主题 Pug 模板、主题与 source 自定义 JS/CSS。
- 首页瀑布流、星空、懒加载、面包屑、评论、Mermaid、Swiper 插件、页脚计时器、Font Awesome、入场弹窗、预加载器、PJAX 开关。
- 自定义 `/about/`、`/swiper/`、`/birthday-gift/`、`/LianlianKan/`、`/MarkdownPreview/`、`/coffer/` 的运行时入口；重点核验有持续 timer/RAF/canvas 的页面。
- 文章媒体、已生成页面的脚本/样式引用、DOM 粗略规模和 MP4 文件规模。
- `long-term-memory/` 全部 Markdown 的重点事实、历史记录与索引。历史操作记录保留其历史价值，不倒改当时事件；仅在当前入口文档中标明其时效边界。
