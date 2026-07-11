---
name: 2026-07-11 P1 分层星空动效重构
description: 统一全站背景和顶部封面星空为单一 RAF 控制器，保留三类顶部星光并归档三断点本地 A/B 测量
---

# 2026-07-11 P1 分层星空动效重构

> **回退状态（2026-07-11）**：用户视觉验收后认为效果未达到预期，已决定停止本轮迭代并恢复 P1 开始前、已推送的基线。关键源码、测量与配置副本已归档至 [source-snapshots/](source-snapshots/README.md)，不会被 Hexo 或浏览器加载；实际运行时的文件恢复仍待获得覆盖本地已修改文件的执行授权。
>
> **回滚基线**：`049f08d60827ca25f13b1ced18802f94076ee626`（已推送到 `origin/master`）。该提交是 P1 开始前建立的空提交锚点；本轮实现、回退和归档均未执行远程推送、强推或部署。
>
> **关联**：[当前运行时架构](../../03-api-practices/universe-background.md) · [当前性能审计](../../05-performance-audit/2026-07-10-render-performance-audit/README.md) · [主题修改记录](../../06-theme-modifications/README.md)。

## 1. 结论、归档与边界

P1 的目标不是删除星空，而是在不改变博客深色星空氛围、透明卡片和顶部封面表现的前提下，消除两个独立 Canvas 动画在前台的重复调度与重复绘制。

这次分层重构经过多轮视觉微调后，用户确认实际效果不理想，因此不再继续叠加效果。实际运行时代码的恢复目标是基线中的双层星空实现：`universe-optimized.js` 负责全站背景、`header-universe.js` 负责顶部封面；归档已经完成，但覆盖当前 P1 源码的恢复操作仍待执行授权。

为保留可复盘性而不影响当前站点：

- 本 README 保留方案、参数、A/B 记录和适用边界，且明确它们是**未采纳实验**；
- [source-snapshots/](source-snapshots/README.md) 固化了 P1 的关键 JS、CSS、模板、配置和本地 benchmark 工具副本，并含 SHA-256；
- 快照目录位于 `long-term-memory/`，不属于 Hexo 的 `source/` 或主题资源目录，不能被构建产物加载；
- 本次回退仅恢复实际星空运行时、相应模板/CSS/注入配置和当前事实索引；P0 瀑布流等无关内容不受影响；
- 回退和归档均未更新远程仓库或执行部署。

历史尝试的预期视觉为两层：

1. **全站背景**：保留少量、清晰可见、低亮缓慢的光点；细小且不易感知的背景星不创建、不计算、不绘制。
2. **顶部封面**：保留三类可辨识元素：稀疏缓慢的大高亮星、较密缓慢的小低亮星、极少且高速的高亮流星。

本次尝试不曾修改：

- `transpancy.css` 中的半透明卡片与页脚视觉；
- 首页/文章封面背景图、标题、导航、卡片、分页和内容结构；
- 主题 PJAX 开关（当前仍关闭）；
- 远程仓库内容和部署目标。

## 2. 改造前后的架构

### 2.1 旧架构

```text
universe-optimized.js
  └── #universe 固定背景 canvas
      └── 独立 30fps RAF：背景星 + 大星 + 流星

header-universe.js
  └── #page-header 内的 .universe-header canvas
      └── 另一条独立 30fps RAF：大星 + 小星 + 流星
```

两套脚本同时加载、各自维护 resize、visibility、星体数组和 RAF。页头在视口中时，同一页面会持续产生两条动画回调链。

### 2.2 当前架构

```text
header-universe.js（唯一星空脚本入口）
  └── StarfieldController（一个 RAF）
      ├── #universe：受限的背景慢星
      └── .universe-header：顶部封面三类星体
          ├── brightStars：稀疏、高亮、较大、缓慢
          ├── dimStars：较密、低亮、较小、缓慢
          └── meteor：单个、短尾、高速、按冷却时间生成
```

`universe-optimized.js` 不再通过配置注入。它暂时保留在主题资源目录中作为历史文件，避免无关删除；当前生成页面只引用 `header-universe.js`。

## 3. 视觉预算与响应式规则

数量都是硬上限，不随宽屏线性增长：

| 视口层级 | 全局背景慢星 | 顶部大高亮慢星 | 顶部小低亮慢星 | 流星冷却区间 | 刷新上限 | Canvas DPR 上限 |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| `≤768px` | 6 | 3 | 12 | 禁用 | 20fps | 1.25 |
| `769–1200px` | 10 | 5 | 20 | 10–16 秒 | 30fps | 1.5 |
| `>1200px` | 14 | 7 | 30 | 7–13 秒 | 36fps | 1.5 |

流星不再混入普通星体数组后以随机概率重置，而是一次只维护一个对象；手机断点完全不创建流星。平板与桌面流星使用 32 粒离散光点组成细长、平行于前进方向的拖尾，避免旧代码中每帧为单颗流星循环绘制多段矩形尾迹。

## 4. 分层与生命周期策略

| 项目 | 当前行为 |
| --- | --- |
| 全局背景 canvas | `#universe` 固定在内容底层，`z-index:-1`、`pointer-events:none`。 |
| 页头 canvas | `#page-header .universe-header` 绝对覆盖封面，`z-index:2`、`pointer-events:none`。 |
| 标题 / 页面信息 | 通过 CSS 固定在 `z-index:3`。 |
| 导航 | 保持主题原有 `z-index:90`，在顶部 canvas 之上。 |
| 顶部离开视口 | 使用 `IntersectionObserver`；仍绘制背景层，但不更新或清屏顶部 canvas。 |
| 标签页隐藏 | `visibilitychange` 停止唯一 RAF；回到前台重新开始，帧时间会重新初始化。 |
| 减弱动态效果 | `prefers-reduced-motion: reduce` 下仅绘制一次静态帧，测试窗口内不持续请求 RAF 或清空 canvas。 |
| 尺寸变化 | `ResizeObserver`（不支持时回退 `resize` 事件）配合 160ms 防抖，按当前断点重建受限数组。 |
| PJAX 兼容 | `pjax:send` 调用 `destroy()` 取消 RAF、断开 observer、移除监听并删除自建 header canvas；全局脚本监听 `pjax:complete` 重新初始化。当前配置未开启 PJAX。 |

## 5. 历史文件变更与当前归档

下表记录 P1 实验中的原始改动；这些改动已从**实际运行时路径**恢复为基线版本。P1 版本的关键文件副本已经归档在 [source-snapshots/](source-snapshots/README.md)，不参与构建或页面加载。

| 文件 | 变更 |
| --- | --- |
| `themes/butterfly/source/js/header-universe.js` | 从旧 header 专用粒子脚本重写为唯一 `StarfieldController`。 |
| `_config.butterfly.yml` | 保留全局 canvas 注入，移除 `universe-optimized.js` 的第二个脚本入口，增加 canvas `aria-hidden`。 |
| `themes/butterfly/layout/includes/head.pug` | 唯一入口调整为延迟加载 `header-universe.js`。 |
| `themes/butterfly/source/css/universe.css` | 统一背景/顶部 canvas 的通用层级、输入穿透、首页混合和 reduced-motion CSS 兜底。 |
| `themes/butterfly/source/css/styles.css` | 删除已迁移到 `universe.css` 的旧首页专属 header canvas 重复规则。 |
| `tools/benchmark-starfield.js` | 新增独立 CDP A/B 测量器，记录脚本入口、RAF 回调、canvas 整帧清除、可见/离屏状态、reduced-motion、粒子数量和层级/输入断言。 |

## 6. 已完成的本地 A/B 测量

### 6.1 实验环境与对照

| 项目 | 实际值 |
| --- | --- |
| 基线提交 | `049f08d60827ca25f13b1ced18802f94076ee626` |
| 当前实现 | 当前工作树 P1 未提交实现 |
| 基线产物 | `/tmp/hexo-starfield-baseline-049f08d/public`，由 detached worktree 构建 |
| 当前实验产物 | 回退前工作树 `public/`，由当时的 `npm run build` 构建；已不代表当前运行时 |
| 浏览器 | Chrome `150.0.7871.115`，`--headless=new` |
| 缓存 / profile | 禁用 HTTP cache；每次运行独立临时 Chrome profile |
| 重复次数 | 每版本 / 视口 3 次，取中位数 |
| 可见场景 | 进入首页、稳定等待 3 秒后观察 10 秒 |
| 离屏场景 | 滚动使 `#page-header` 完全离开视口后观察 10 秒 |
| reduced-motion | 使用 CDP 模拟 `prefers-reduced-motion: reduce` 后观察 10 秒 |
| 原始结果目录 | `/tmp/hexo-starfield-benchmarks/run-5x5zeF/`（系统临时目录，可被清理） |

可复现命令：

```bash
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node tools/benchmark-starfield.js \
  --baseline-dir /tmp/hexo-starfield-baseline-049f08d/public \
  --current-dir public \
  --runs 3 --duration-seconds 10 --settle-seconds 3 \
  --viewports mobile,tablet,desktop
```

### 6.2 可见页头窗口：中位数结果

| 视口 | 基线 TaskDuration | 当前 TaskDuration | 变化 | 基线 ScriptDuration | 当前 ScriptDuration | 变化 | 基线 RAF 回调 | 当前 RAF 回调 | 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 375×812 / DPR 2 | 1,120.40 ms | 997.78 ms | **-10.9%** | 135.92 ms | 90.68 ms | **-33.3%** | 1,200 | 600 | **-50.0%** |
| 1024×900 / DPR 1 | 850.63 ms | 691.30 ms | **-18.7%** | 256.08 ms | 104.56 ms | **-59.2%** | 1,200 | 601 | **-49.9%** |
| 1440×900 / DPR 1 | 1,112.98 ms | 772.53 ms | **-30.6%** | 313.28 ms | 111.47 ms | **-64.4%** | 1,200 | 600 | **-50.0%** |

两版在基线期都各自运行两条动画回调链，10 秒内分别约为 600 + 600 次 RAF 回调。当前版使用一个调度器，约为 600 次。最终基础测量时 canvas 清屏上限为手机约 20fps、平板/桌面约 24fps；后续视觉微调将平板提高到 30fps、桌面提高到 36fps，同时在手机禁用流星。该帧率微调在基础 A/B 后完成，尚未重新执行完整三断点采样。

### 6.3 页头离屏与 reduced-motion 验收

| 视口 / 10 秒窗口 | 基线：顶部 canvas 清屏 | 当前：顶部 canvas 清屏 | 当前：背景 canvas 清屏 | 当前：reduced-motion 背景 / 顶部清屏 | 当前：reduced-motion RAF 回调 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 手机 | 300 | **0** | 200 | **0 / 0** | **0** |
| 平板 | 301 | **0** | 240 | **0 / 0** | **0** |
| 桌面 | 300 | **0** | 240 | **0 / 0** | **0** |

这些数据只描述已归档、未采纳的实验版本，不能作为当前站点的性能或视觉结论。

### 6.4 结构与可用性断言

| 断点 | 当前脚本入口 | canvas（背景 / 顶部） | 背景 / 大高亮 / 小低亮数量 | `pointer-events` | nav / 标题未被 canvas 阻挡 |
| --- | --- | --- | --- | --- | --- |
| 375px | `header-universe.js` | 1 / 1 | 6 / 3 / 12 | `none` | 通过 / 通过 |
| 1024px | `header-universe.js` | 1 / 1 | 10 / 5 / 20 | `none` | 通过 / 通过 |
| 1440px | `header-universe.js` | 1 / 1 | 14 / 7 / 30 | `none` | 通过 / 通过 |

基线 HTML 同时有 `header-universe.js` 与 `universe-optimized.js`；当前产物只含一个脚本入口。当前 header canvas 层级为 `z-index:2`，标题/信息为 3，导航保持主题 90。

## 7. 解释边界

可以确认：

1. 当前生成首页只加载一个星空脚本入口，且观测窗口内 RAF 回调从两条 30fps 链的约 1,200 次降至约 600 次。
2. 当前顶部星体严格按三类上限管理；全局背景不再生成低优先级的小星池。
3. 在本机、当前 Chrome、固定 viewport 和三次中位数条件下，观察窗口的 `ScriptDuration` 下降 33.3%–64.4%，`TaskDuration` 下降 10.9%–30.6%。
4. header 不可见时，顶部层清屏为 0；reduced-motion 条件下没有持续 RAF / canvas 清屏；标题和导航未被 canvas 拦截。

不能据此声称：

- 所有真实设备上的 CPU、GPU、温度、风扇、能耗会按相同百分比改善；
- Headless Chrome 的 `TaskDuration` / `ScriptDuration` 只包含星空代码；
- 所有浏览器的混合模式和视觉效果一致；
- 流星的偶发时机、GPU 合成、实际触摸滚动已在用户目标设备验收。

## 9. 实际回退记录

- 实际恢复目标是 P1 开始前、已推送的基线 `049f08d60827ca25f13b1ced18802f94076ee626`。
- 恢复范围为 `_config.butterfly.yml`、`head.pug`、`universe.css`、`styles.css` 和 `header-universe.js`；这会连同旧背景脚本注入恢复为一组一致的双层实现。
- P1 关键代码与测量工具没有删除，已经复制到 [source-snapshots/](source-snapshots/README.md)；该目录不可执行、不可注入、不会影响页面。
- 未执行 `git reset --hard`、远程推送或部署；其余与星空无关的工作树内容不在恢复范围内。
- 如果以后重新尝试，应从归档副本或新分支设计完整方案，禁止只恢复某一个旧/新脚本入口，以免再次意外形成不一致的 Canvas、CSS 和注入关系。
