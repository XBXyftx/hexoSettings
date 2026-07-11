---
name: 星空背景动效（universe-optimized + header-universe）当前实现
description: 记录当前全站背景与页面头部独立 Canvas 星空的双层架构、已有效的降级策略，以及已归档但未采纳的 P1 实验
metadata:
  type: project
---

# 星空背景动效 — 当前双 Canvas / 双 RAF 架构

> **当前状态（2026-07-11）**：P1 分层星空实验经视觉验收后未被采用。实际运行时已精确恢复到已推送基线 `049f08d60827ca25f13b1ced18802f94076ee626`：`universe-optimized.js` 与 `header-universe.js` 分别维护全站背景和顶部封面，两者各自运行一条 30fps RAF。
>
> **实验留存**：[P1 分层星空动效实验与回退](../04-operations/2026-07-11-starfield-p1/README.md) 记录方案、测量边界、用户验收结论和实际回退；其中 [source-snapshots/](../04-operations/2026-07-11-starfield-p1/source-snapshots/README.md) 保存未采纳方案的关键代码和 SHA-256。二者均不参与 Hexo 或浏览器运行时加载。
>
> **何时阅读**：调整背景动效、排查 CPU 占用或动画卡顿、修改移动端适配或主题注入前。

---

## L1 · 当前架构速查

项目当前有两套相互独立的 Canvas 星空动画：

| 层 | 脚本 | Canvas | 位置与职责 | 调度 |
| --- | --- | --- | --- | --- |
| 全站背景 | `themes/butterfly/source/js/universe-optimized.js` | `#universe` | 全屏 fixed 背景，位于内容与半透明卡片下方 | 独立 RAF，30fps 节流 |
| 顶部封面 | `themes/butterfly/source/js/header-universe.js` | `.universe-header` | 动态附加到 `#page-header`，为封面提供大星、小星和流星 | 独立 RAF，30fps 节流 |

两层各自维护粒子数组、尺寸更新、`visibilitychange` 和动画生命周期；当页面头部可见时，它们会同时绘制。这是当前效果，也是尚未解决的 P1 性能隐患，不能误写为已经合并成单控制器。

`transpancy.css` 为正文、卡片与页脚提供半透明深蓝背景，使固定背景星空能透出；不要单独删除 `#universe` 或其脚本注入。

---

## L2 · 注入与加载关系

```text
_config.butterfly.yml inject.bottom
  ├── <canvas id="universe"></canvas>
  └── <script defer src="/js/universe-optimized.js"></script>

themes/butterfly/layout/includes/head.pug
  └── <script src="/js/header-universe.js"></script>

header-universe.js
  └── #page-header 内创建 <canvas class="universe-header">
```

相关文件：

| 内容 | 路径 |
| --- | --- |
| 全屏背景 JS | `themes/butterfly/source/js/universe-optimized.js` |
| 顶部封面 JS | `themes/butterfly/source/js/header-universe.js` |
| 背景 Canvas CSS | `themes/butterfly/source/css/universe.css` |
| 半透明内容背景 | `themes/butterfly/source/css/transpancy.css` |
| 背景 Canvas / 背景脚本注入 | `_config.butterfly.yml` 的 `inject.bottom` |
| 顶部脚本入口 | `themes/butterfly/layout/includes/head.pug` |

`#universe` 必须保持 `pointer-events: none` 和 `z-index: -1`。避免给 `body` 添加 `transform` 或 `filter`，否则可能改变负层 Canvas 的堆叠上下文并使背景消失。

---

## L3 · 当前性能与响应式行为

### 全站背景 `universe-optimized.js`

- 按视口宽度创建星体：移动端约 `width × 0.04`，桌面约 `width × 0.08`；
- 使用 30fps 节流；
- 标签页隐藏时停止 RAF，重新可见后恢复；
- resize 会重建 Canvas 尺寸和星体池；
- 全屏背景包含普通星、大星与流星，流星尾迹为 10 个点。

### 顶部封面 `header-universe.js`

- 只在存在 `#page-header` 时创建 `.universe-header`；
- 移动端粒子数约 `0.04 × page-header 宽度`，桌面约 `0.08 × page-header 宽度`；
- 使用 30fps 节流、200ms resize 防抖和 `visibilitychange` 暂停；
- 通过 `pjax:send`（仅在 PJAX 存在时）取消 RAF 并移除监听；
- 流星尾迹已从历史版本的 30 点降为 10 点。

这些策略缓解了单个脚本的压力，但无法消除双脚本在前台同时绘制的总开销。真实 CPU、GPU、功耗、温度和各浏览器表现仍需在目标设备录制 Performance trace 后判断。

---

## L4 · 排查清单

| 现象 | 优先检查 |
| --- | --- |
| 全站没有背景星空 | `#universe` 是否存在；`universe-optimized.js` 是否仍在 `_config.butterfly.yml` 的 `inject.bottom`；`universe.css` 是否加载。 |
| 顶部没有星空 | `#page-header` 是否存在；`/js/header-universe.js` 是否可访问；是否存在 `.universe-header`。 |
| 内容无法点击 | 确认 `#universe` 与 `.universe-header` 没有失去 `pointer-events: none`。 |
| 背景消失 | 检查 `body` 和上层容器是否新增 `transform` / `filter`；检查 `z-index:-1` 的堆叠上下文。 |
| 前台动画卡顿或风扇高转 | 先确认两条 RAF 的实际占比；当前双 Canvas 同时绘制是已知因素。不要把 P1 归档 A/B 当成当前版本数据。 |
| 移动端较卡 | 确认当前 header 脚本仍是 `0.04 × width` 粒子预算和 30fps 节流；再以目标设备 trace 定位原因。 |

---

## L5 · P1 未采纳实验与红线

2026-07-11 曾尝试将两层绘制收敛到单一 `StarfieldController`，添加固定粒子预算、页头离屏暂停、`prefers-reduced-motion` 静态降级、渐变星点和离散流星拖尾。用户视觉验收后认为效果不理想，已恢复当前基线运行时。

- 不要将归档目录中的 `header-universe.js`、CSS 或配置片段单独复制回运行时；它们只在完整实验架构中成立。
- 不要只恢复或删除一个脚本注入；背景脚本、顶部脚本、Canvas、CSS 和透明背景必须作为一组审查。
- 如需再次优化，应从当前基线创建独立方案，先做真实视觉验收；可参考归档的思路和测量工具，但不得把归档结果宣称为当前结论。

---

## L6 · 历史记录

- 2026-05-04：顶部脚本获得 30fps 节流、visibility 暂停、移动端降级、resize 防抖和 PJAX 清理（见主题修改记录 #3）。
- 2026-07-10：静态审计确认两套脚本会在前台叠加绘制，列为 P1 隐患。
- 2026-07-11：完成 P1 单控制器实验和本地 Headless A/B；视觉验收未通过，实际运行时恢复 `049f08d`，源码与数据已归档。
