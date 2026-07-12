# 文章懒加载与目录锚点稳定性治理

> **日期**：2026-07-11  
> **远程备份基线**：`bb93da827265b25bf3af05e342b9793419452b88`（`feat: 归档失效请求优化与复盘`）  
> **远程约束**：该基线已推送至 `origin/master`；从本记录开始，所有本轮实现仅留在本地工作区，禁止 push、部署、强推或其他远程写操作。

---

## 1. 目标与边界

本轮处理两个耦合问题：

1. 文章页图片懒加载在长图文中让所有未加载图片同时运行复杂占位动画，增加绘制和合成负担；
2. 用户通过桌面侧栏或移动端悬浮目录跳到远处标题时，途中图片在之后才加载并改变高度，导致最终视口顶部偏离目标标题。

约束如下：

- 保留文章图片、灯箱、原生 `loading="lazy"`、页面视觉层级和目录交互；
- 不为外部图片抓取或猜测尺寸，不改写外部资源 URL；
- 不在目录点击时预下载全文图片，也不无限等待外部资源；
- 用户主动滚轮、触摸或键盘滚动后立即停止自动校正；
- 所有审计报告默认写入系统临时目录，不进入仓库；
- 本轮不操作远程，`bb93da8` 是唯一远程备份点。

## 2. 审计事实

### 2.1 原有加载链

- [image-dimensions.js](../../../scripts/image-dimensions.js) 在构建期为可解析的本地图片注入 `width`、`height` 和原生 `loading="lazy"`。
- [lazy-loading-optimized.js](../../../themes/butterfly/source/js/lazy-loading-optimized.js) 原本会将正文图片的 `src` 交换为 1×1 GIF，再使用 `IntersectionObserver` 和独立的 `new Image()` 预加载。
- [lazy-loading.css](../../../source/css/lazy-loading.css) 与 [lazy-loading-stable.css](../../../source/css/lazy-loading-stable.css) 曾由 [head.pug](../../../themes/butterfly/layout/includes/head.pug) 在全站同步加载；其中占位状态包含无限背景位移、旋转伪元素、`box-shadow` 动画和 `backdrop-filter`。
- 主题配置的 `lazyload.enable` 是关闭的；实际文章运行时行为由 inject.bottom 加载的自定义脚本负责。

### 2.2 已确认缺陷

1. **远离视口的占位符仍持续动画**：脚本在初始化时给所有待加载正文图加 `.lazy-placeholder`，长文中几十到数百张图片同时保持高代价视觉状态。
2. **外部图片没有内在尺寸**：构建期不能读取远程图片文件，因而无法补 `width`/`height`。真实图片首次结算时仍可能改变后续内容高度。
3. **目录跳转依赖已经删除的 API**：[main.js](../../../themes/butterfly/source/js/main.js) 只在 `window.lazyLoadPreload` 存在时调用它；该 API 已随旧脚本删除，实际跳转在下一帧只计算一次位置。之后图片加载造成的高度变化没有任何重定位路径。
4. **`scroll-margin` 不是布局修复**：标题边距只能处理固定导航遮挡，不能抵消图片之后改变的任意高度。

## 3. 实施方案

### 3.1 保留浏览器原生懒加载和内在尺寸

不再将文章图片替换为 1×1 GIF。构建期已经生成的 `src`、`width`、`height` 和 `loading="lazy"` 继续交由浏览器处理，这样本地文章资源在初次布局时已有正确的长宽比，不会因为脚本替换 `src` 额外干扰浏览器的资源调度。

运行时控制器只负责三件事：

- 用 `IntersectionObserver` 感知近视口图片何时应开始跟踪其结算状态；
- 只让近视口占位符拥有短暂 shimmer；
- 在图片 `load` / `error` 时派发文章级事件，供目录导航修正位置。

### 3.2 仅近视口占位符动画

新的 [lazy-loading-optimized.css](../../../themes/butterfly/source/css/lazy-loading-optimized.css) 仅在文章页加载：

- `.lazy-placeholder` 是静态渐变；
- `.lazy-placeholder-active` 才运行 shimmer；
- 取消 `backdrop-filter`、旋转伪元素和 `box-shadow` 无限动画；
- 移动端和 `prefers-reduced-motion` 下完全禁用 shimmer；
- 无尺寸图片保留 160px 最小高度作为保守占位，但不把它伪称为真实比例。

这样仍保留加载中的视觉反馈，却不会让远离视口的图片继续消耗绘制预算。

### 3.3 可取消的目录导航事务

目录点击不再依赖失效的 `lazyLoadPreload`。新流程如下：

```text
点击目录
  → 关闭移动端目录
  → 计算统一的 90px（桌面）/70px（移动）标题偏移
  → 立即滚动至目标标题
  → 使目标附近媒体优先结算
  → 监听文章图片结算和文章容器 ResizeObserver
  → 每次变化用 RAF 合并，按标题实时位置校正
  → 3.5 秒后自动结束；新点击、用户滚动或 PJAX 离开立即取消
```

关键点：

- 只提升目标附近图片的优先级，不预加载整篇文章；
- 每帧最多一次校正，不在 resize/load 风暴中重复同步读写布局；
- 鼠标滚轮、触摸、方向键、PageUp/PageDown/Home/End 均视为用户接管滚动；
- 桌面侧栏与移动端目录共用同一 click handler，因此同一机制覆盖两端；
- `prefers-reduced-motion` 使用即时滚动，避免强制平滑动画。

## 4. 新增审计与验证工具

| 工具 | 作用 |
| --- | --- |
| [audit-article-layout-stability.js](../../../tools/audit-article-layout-stability.js) | 扫描生成文章正文，统计图片数、`width`+`height` 覆盖率、外部/本地来源和 lazy 属性。 |
| [verify-toc-navigation.js](../../../tools/verify-toc-navigation.js) | 临时启动仅 loopback 的静态服务和隔离 Headless Chrome，延迟本地图片响应，点击远距离 TOC 标题，测量最终标题偏移。 |

两者默认输出到系统临时目录。它们是本地验证工具，不会部署到博客页面。

## 5. 验证结果

### 5.1 构建与静态检查

```text
node --check themes/butterfly/source/js/lazy-loading-optimized.js
node --check themes/butterfly/source/js/main.js
node --check tools/audit-article-layout-stability.js
node --check tools/verify-toc-navigation.js
npm run build
git diff --check
```

均通过。最终构建生成 186 个 HTML、17 个 CSS；本地资源审计仍为 **0 个缺失目标 / 0 次缺失引用**。

### 5.2 生成态尺寸覆盖

| 指标 | 结果 |
| --- | ---: |
| 生成文章页 | 59 |
| 正文图片 | 1,596 |
| 有完整 `width` + `height` 的图片 | 1,494 |
| 缺少任一内在尺寸 | 102 |
| 外部图片缺少尺寸 | 97 |
| data URI 图片缺少尺寸 | 5 |

本地 post asset 图片均得到完整尺寸。剩余 102 项都不是本轮可以安全从本地文件推断比例的资源，因此保留为明确边界。

### 5.3 受控延迟图片下的目录验证

使用 Headless Chrome、临时 loopback 静态服务和每张本地图片 400ms 延迟，跳转到远距离标题：

| 文章 | 视口 | 目标标题 | 最终偏移误差 |
| --- | --- | --- | ---: |
| `OpenSourceSummer2025` | 1440×900 | `项目简介` | 0.500px |
| `OpenSourceSummer2025` | 375×812 | `项目简介` | 0.344px |
| `ToTheApril2025` | 1440×900 | `主时间轴` | 0.219px |
| `ToTheApril2025` | 375×812 | `主时间轴` | 0.125px |
| `OpenSourceSummer2025`（注入 240px 延迟布局变化） | 1440×900 | `项目简介` | 0.500px |
| `OpenSourceSummer2025`（注入 240px 延迟布局变化） | 375×812 | `项目简介` | 0.156px |

验收阈值为 ≤3px，四组均通过。这里验证的是浏览器在延迟媒体结算期间最终仍将目标标题留在统一导航偏移处；它不等同于所有外部 CDN、实机网络和未来异步组件的永久保证。

## 6. 已知边界与后续

- 无内在尺寸的外部图片仍可能在真实高度确定时改变布局；本轮通过导航事务把它对目录点击的影响收敛，但没有伪造比例。
- 3.5 秒校正窗口是有上限的交互保护；超慢或永久不响应的远程资源不会无限阻塞用户。
- 当前 PJAX 关闭；控制器仍提供销毁和 PJAX 事件路径，避免未来开启时重复 observer。
- 如后续需要进一步降低外部图导致的 CLS，应优先从可信原图备份或内容作者提供的尺寸/替代图恢复，而不是自动网络抓取并写入不可复核数据。
