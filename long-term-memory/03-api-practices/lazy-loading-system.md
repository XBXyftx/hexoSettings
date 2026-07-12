---
name: 文章图片懒加载与目录锚点稳定性
summary: 当前文章页原生 lazy loading、近视口占位、图片尺寸边界与可取消 TOC 重锚定机制。
type: project
---

# 文章图片懒加载与目录锚点稳定性

> **当前事实基线（2026-07-11）**：文章图片不再被运行时替换为 1×1 GIF。构建期为可解析的本地图片写入 `width`/`height`/`loading="lazy"`；浏览器负责原生延迟请求。运行时脚本只追踪近视口图片、限制占位动画，并向目录跳转逻辑报告媒体结算。详尽操作、数据和验证见 [2026-07-11 文章懒加载与目录锚点稳定性治理](../04-operations/2026-07-11-article-layout-stability/README.md)。

## 1. 当前架构

```text
Hexo 构建期
  scripts/image-dimensions.js
    └─ 本地可解析图片 → width + height + loading="lazy"

文章运行时
  浏览器原生 loading="lazy"
    └─ 延迟非近视口图片请求

  themes/butterfly/source/js/lazy-loading-optimized.js
    ├─ IntersectionObserver：跟踪近视口图片加载结算
    ├─ IntersectionObserver：只为近视口 placeholder 加动态 class
    ├─ load/error → hexo:article-image-settled 事件
    └─ 提供 articleImageLazyLoad.loadNear() 给 TOC 导航提升附近图片优先级

  themes/butterfly/source/js/main.js
    └─ TOC 点击 → 目标标题初次定位 → 媒体结算/ResizeObserver 后 RAF 合帧校正
```

主题内置 `lazyload.enable` 仍为 `false`。不要重新启用它，否则会和目前的文章级协调器产生重复观察与不确定的加载顺序。

## 2. 关键文件

| 内容 | 路径 | 作用 |
|---|---|---|
| 本地图片尺寸注入 | `scripts/image-dimensions.js` | 构建期读取本地文件，注入尺寸与原生 lazy 属性 |
| 文章图片协调器 | `themes/butterfly/source/js/lazy-loading-optimized.js` | 近视口占位、媒体结算事件、TOC 附近图片优先级 |
| 目录导航 | `themes/butterfly/source/js/main.js` | 桌面/移动 TOC 共用的可取消重锚定事务 |
| 文章占位样式 | `themes/butterfly/source/css/lazy-loading-optimized.css` | 静态 placeholder；只有 `-active` 近视口状态有轻量 shimmer |
| 样式加载入口 | `themes/butterfly/layout/includes/head.pug` | 仅 post 页面加载文章占位样式 |
| 生成态尺寸审计 | `tools/audit-article-layout-stability.js` | 统计正文图片尺寸覆盖与来源 |
| TOC 浏览器验证 | `tools/verify-toc-navigation.js` | 延迟图片后验证目录点击最终偏移 |

`source/css/lazy-loading.css` 与 `source/css/lazy-loading-stable.css` 是历史样式文件，当前不再由主题 head 加载。不要重新引入它们的全篇 shimmer、旋转、blur、`backdrop-filter` 或无效 `attr(width)/attr(height)` 比例规则。

## 3. 为什么目录会偏移

目录跳转第一次根据目标标题当前的绝对位置滚动。如果位于跳转起点与目标标题之间的图片之后才确定真实高度，标题绝对位置会改变，旧实现不会重新计算，因此顶部落点偏离。

本地文章资源通常有 `width`/`height`，浏览器可在首次布局时保留比例空间。外部图片与 data URI 无法安全在构建期读取尺寸，仍可能发生布局变化。因此处理原则不是“等待全文图片”，而是：

1. 立即让用户到达目标；
2. 只提升目标附近图片优先级；
3. 在有限时间窗口中监听媒体结算与文章尺寸变化；
4. 用 RAF 合并校正；
5. 用户主动滚动或再次点击时立即取消，绝不抢滚动控制权。

## 4. TOC 导航规则

- 桌面侧栏和移动悬浮目录共用一个点击处理器。
- 统一目标偏移：桌面 90px，移动端 70px；固定导航栏更高时取更大值。
- 每次新 TOC 点击会取消上一笔导航事务。
- 监听 `hexo:article-image-settled` 与文章容器 `ResizeObserver`；同一帧只校正一次。
- 3.5 秒后结束事务，避免无限等待慢速/永久失败的外部资源。
- `wheel`、`touchstart`、方向键、PageUp/PageDown/Home/End 视为用户接管，立即停止校正。
- `prefers-reduced-motion` 下初次跳转使用即时滚动。

## 5. 图片尺寸边界

构建期只读取本地、同源且可解析文件；不会网络请求外部 URL，也不会猜测比例。

2026-07-11 最终生成态统计：

| 指标 | 数值 |
| --- | ---: |
| 文章页 | 59 |
| 正文图片 | 1,596 |
| 具备 `width` + `height` | 1,494 |
| 缺少任一尺寸 | 102 |
| 外部图片缺少尺寸 | 97 |
| data URI 缺少尺寸 | 5 |

因此，“文章本地图片已稳定”与“外部图仍可能在普通阅读时改变排版”必须分开表述。目录点击的有限重锚定覆盖后者对跳转结果的影响，但不能让未知比例的外部图片在每种网络条件下完全无 CLS。

## 6. 验证命令

```bash
npm run build
node tools/audit-article-layout-stability.js
node tools/verify-toc-navigation.js \
  --page /2025/06/29/OpenSourceSummer2025/ \
  --width 1440 --height 900 --image-delay-ms 400 --settle-ms 4300
node tools/verify-toc-navigation.js \
  --page /2025/06/29/OpenSourceSummer2025/ \
  --width 375 --height 812 --image-delay-ms 400 --settle-ms 4300
```

工具默认启动仅 loopback 的临时静态服务，并将报告写进系统临时目录。验证阈值为目标标题最终偏移绝对值 ≤3px。

## 7. 红线

| 行为 | 后果 | 正确做法 |
|---|---|---|
| 将 `src` 改成 1×1 GIF 再手动恢复 | 干扰浏览器原生 lazy 调度，增大布局和请求时序不确定性 | 保留真实 `src` 与原生 `loading="lazy"` |
| 为全文 placeholder 保留无限 blur/shadow/backdrop-filter 动画 | 长图文有大量持续绘制/合成工作 | 只有近视口 `.lazy-placeholder-active` 使用轻量 shimmer |
| 目录点击预加载全文图片 | 消耗带宽、拖慢跳转，慢外部资源会阻塞交互 | 只提升目标附近图片优先级，运行时有限重锚定 |
| 用户滚动后继续自动校正 | 和用户争夺滚动位置 | 任意主动滚动输入立刻取消导航事务 |
| 为外部图猜测/爬取比例后直接写回文章 | 不可复核，可能导致内容错误或隐私/网络副作用 | 仅用可信原图备份或作者提供的尺寸更新内容 |
| 重新启用 Butterfly `lazyload.enable` | 与当前协调器重复工作 | 保持关闭，新增方案先做全链路审计 |
