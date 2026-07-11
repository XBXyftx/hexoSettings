# P1 源码快照（已归档，不参与运行时加载）

> **用途**：保留 2026-07-11 P1 分层星空动效尝试的完整关键源码，供后续复盘、择项重做或比较使用。
>
> **当前状态**：P1 快照已归档，站点实际星空代码计划恢复到回滚基线 `049f08d60827ca25f13b1ced18802f94076ee626`，但覆盖当前本地 P1 文件的操作仍待执行授权。本目录内的文件只是静态副本；Hexo、主题模板和浏览器均不会从这里加载任何 JS、CSS 或配置。

## 快照范围

| 快照文件 | 原始位置 | SHA-256 |
| --- | --- | --- |
| `_config.butterfly.yml` | `_config.butterfly.yml` | `babbc3db3168a30c198f4906ee059c9296fb4effd406977c54e501dee224abc9` |
| `themes/butterfly/layout/includes/head.pug` | `themes/butterfly/layout/includes/head.pug` | `67bce5f1a65784baf4bd283788af772f6e1d07a8a456b211fe7d39c7d721cd44` |
| `themes/butterfly/source/css/styles.css` | `themes/butterfly/source/css/styles.css` | `10ec233f3d2f358927ebe2a3090ed79b9f5f0d9b9c5e2d4eac54ce6415a4d085` |
| `themes/butterfly/source/css/universe.css` | `themes/butterfly/source/css/universe.css` | `c149b7a0f8ad070907ca5307fb410491673d9c365c600a333e20e481ee1d7ccb` |
| `themes/butterfly/source/js/header-universe.js` | `themes/butterfly/source/js/header-universe.js` | `f910b3232caeb87b380b6cc46b20e12ecb2c7834178924ce8d86fdd776f628b4` |
| `tools/benchmark-starfield.js` | `tools/benchmark-starfield.js` | `e9f7214086e89b08dc38803eac0bb49ce042c9bc8d94635a57cfe5563d076b23` |

## 已归档的尝试

- 单一 `StarfieldController` 统一调度背景与顶部两张 Canvas；
- 顶部大星、小星、离散颗粒拖尾流星，以及三档响应式粒子预算；
- 页头离屏暂停、`prefers-reduced-motion` 静态降级、DPR 上限、PJAX 生命周期处理；
- 基于 Chrome DevTools Protocol 的本地 A/B 采样工具。

这些设计和测量仅是一次未被采纳的实验记录，不是当前站点的运行时规范。若未来重新评估，应从本目录副本新建分支或单独比较，不能把其中某个脚本入口单独复制回现有配置；两套 Canvas、CSS 与注入入口必须作为完整方案一起审查。

详细背景、测量边界和回退决定见上级 [P1 分层星空动效重构](../README.md)。
