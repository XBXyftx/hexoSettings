# 进行中的长期任务 — 全项目深度审查与长期记忆构建

> **创建时间**：2026-05-04
> **完成时间**：2026-05-04
> **预计审查截止**：2026-05-05（明天）
> **任务发起人原话**：见本文档第 1 节
> **状态**：✅ **已完成**（F1-F8 八项重点 + 自定义页面 5 篇 + 问题清单聚合 + MEMORY.md 索引更新）

---

## ✅ 完成产出汇总

| # | 主题 | 输出文档 |
|---|---|---|
| F1 | 部署脚本 3 条主线 | [`03-api-practices/deployment-pipeline.md`](../03-api-practices/deployment-pipeline.md) |
| F2 | 自定义页面（5 个） | [`02-custom-pages/coffer-private-posts.md`](../02-custom-pages/coffer-private-posts.md)、[`swiper-waterfall-gallery.md`](../02-custom-pages/swiper-waterfall-gallery.md)、[`about-page.md`](../02-custom-pages/about-page.md)、[`lianliankan-game.md`](../02-custom-pages/lianliankan-game.md)、[`markdown-preview.md`](../02-custom-pages/markdown-preview.md) |
| F3 | 打字机效果 | [`05-reference/typewriter-effect.md`](../05-reference/typewriter-effect.md) |
| F4 | 图片懒加载系统 | [`03-api-practices/lazy-loading-system.md`](../03-api-practices/lazy-loading-system.md) |
| F5 | 星空背景动效 | [`03-api-practices/universe-background.md`](../03-api-practices/universe-background.md) |
| F6 | 整体性能优化 | [`03-api-practices/performance-optimization.md`](../03-api-practices/performance-optimization.md) |
| F7 | CDN 策略 | [`03-api-practices/cdn-strategy.md`](../03-api-practices/cdn-strategy.md) |
| F8 | 兜底模块（Twikoo/MathJax/Mermaid + inject 总图） | [`03-api-practices/fallback-modules.md`](../03-api-practices/fallback-modules.md) |
| 问题聚合 | 20+ 项 BUG 与优化清单 | [`07-known-issues/discovered-issues/README.md`](../07-known-issues/discovered-issues/README.md) |
| 索引更新 | MEMORY.md 增加 15 个专题文档链接 | [`MEMORY.md`](../MEMORY.md) |

> **历史价值**：本备忘录保留作为任务执行过程的存档，但 MEMORY.md 中的置顶任务区已移除。

---

## ⚠️ 本文档原始用途

> ⚠️ **本文档的存在目的**：用户明确要求「先将这个任务记在一个文章里头，防止上下文超出，导致你后边工作的时候忘记了我最初给你的任务」。任何后续会话即便上下文被压缩，AI 也必须**首先阅读本文档**，再继续推进任务。

---

## 1. 用户原始任务（不得篡改）

> 接下来，我会给你一个长时间任务请你逐一阅读当前项目下的每一个文件，去分析其内容以及功能，在长期记忆文档中，构建一个对当前项目深入、完整、细致入微的渐进式披露的长期记忆文档，以便于以后的 AI 修改、AI 调整，但你绝对不许修改除了长期记忆文档以外的任何代码。不能影响当前项目的功能，不能影响当前项目的其他任何 UI 或者是功能你要反复拷问自己，是否全面的审查了每一个文件夹中的内容尤其是当你发现了并非 hexo 本身框架自带的内容，而是我所自定义的部分，就要着重注意要详细展开 hexo 框架本身的内容，可以缩略。其中着重要注意我的部署脚本，Npm run PUB 等等，总共应该有 3 个吧，我记得是这样的还有就是几个自定义页面打字机效果的实现逻辑页面懒加载背景动效整体性能优化方案还有 CDN 设置等等各种方面你都要仔细的去审查并编写。如果遇到可能的问题，也请在长期记忆文档中单独创建一个子目录来记录等明天，我会来审查你的任务请你先将这个任务我给你的要求记在一个文章里头。防止上下文超出，导致你后边工作的时候忘记了我最初给你的任务

---

## 2. 任务核心目标

构建一份**深入、完整、细致入微、采用渐进式披露原则**的长期记忆文档体系，使未来任意 AI 在该项目中进行修改/调整时，能够：

1. 通过 `MEMORY.md` 索引快速定位到目标主题
2. 沿着「索引 → 概览 → 规范 → 深度参考」的层级，按需深读
3. 在不阅读源码的情况下，理解项目中所有**自定义功能**的设计意图、实现逻辑、依赖关系、注意事项
4. 知道**哪些是 Hexo 原生 / Butterfly 主题原生**（可缩略），**哪些是项目特有的自定义部分**（必须详尽）

---

## 3. 强制约束（违反任一项即为任务失败）

| # | 约束 | 原文依据 |
|---|---|---|
| C1 | **绝对不许修改除长期记忆文档以外的任何代码** | 「绝对不许修改除了长期记忆文档以外的任何代码」 |
| C2 | **不能影响当前项目的功能** | 「不能影响当前项目的功能」 |
| C3 | **不能影响当前项目的任何 UI 或功能** | 「不能影响当前项目的其他任何 UI 或者是功能」 |
| C4 | **逐一阅读每个文件，反复自检是否全面** | 「请你先将这个任务...反复拷问自己，是否全面的审查了每一个文件夹中的内容」 |
| C5 | **自定义部分必须详尽，Hexo/Butterfly 原生部分可缩略** | 「并非 hexo 本身框架自带的内容...就要着重注意要详细展开...hexo 框架本身的内容，可以缩略」 |
| C6 | **遇到可能的问题，单独建子目录记录** | 「如果遇到可能的问题，也请在长期记忆文档中单独创建一个子目录来记录」 |
| C7 | **采用渐进式披露原则** | 「渐进式披露的长期记忆文档」 |

> **C1 的延伸理解**：可以**读取** `themes/butterfly/`、`source/`、`scripts/`、`tools/` 下的所有文件用于分析，但**不可以编辑**它们。所有写入操作必须落到 `long-term-memory/` 目录内。

---

## 4. 用户明确点名的重点审查项

按用户原话顺序整理（**不要遗漏任何一项**）：

| # | 主题 | 用户用语 | 我的解读 |
|---|---|---|---|
| F1 | **部署脚本（约 3 个）** | 「我的部署脚本，Npm run PUB 等等，总共应该有 3 个吧」 | 当前 package.json 中与发布/构建相关的命令：`pub`、`opt`、`dev`、`webp`、`deploy`、`build`、`clean`、`server` —— 需要梳理出主线发布链路和它们之间的关系。猜测「3 个」指 `pub / opt / dev` 三条触发链。 |
| F2 | **几个自定义页面** | 「还有就是几个自定义页面」 | 需要扫描 `source/` 下所有非 `_posts` 的目录（about、coffer、LianlianKan、MarkdownPreview 等），逐一分析功能、实现、所需依赖。 |
| F3 | **打字机效果的实现逻辑** | 「打字机效果的实现逻辑」 | `typewriter-effect.js` + `typewriter-effect.css` + 主题模板修改 + front matter 字段联动。 |
| F4 | **页面懒加载** | 「页面懒加载」 | 当前已知有三套懒加载（主题内置、vanilla-lazyload、自定义 lazy-loading*.js），需要梳理实际工作的是哪一套，触发顺序，影响哪些资源类型。 |
| F5 | **背景动效** | 「背景动效」 | 星空背景（universe）系列：universe.css + universe-optimized.js + header-universe.js + 透明效果 transpancy.css。 |
| F6 | **整体性能优化方案** | 「整体性能优化方案」 | 包括：图片 webp 转换（已有文档）、image-dimensions 注入、懒加载、network-monitor、topimg-monitor、CDN 选择、字体策略、JS defer/async 加载、CSS 异步加载等。 |
| F7 | **CDN 设置** | 「CDN 设置」 | `_config.butterfly.yml` 中的 CDN 配置 + 第三方库的 CDN 来源（cloudflare、elemecdn、baomitu、tianli0、dusays 等）。 |
| F8 | **等等各种方面** | 「等等各种方面」 | 兜底：评论系统（Twikoo）、字数统计、Mermaid、MathJax、隐私文章系统、轮播图、瀑布流、灯箱、右键菜单、入站弹窗、面包屑 TOC、网络监控、暗黑模式等所有自定义模块。 |

---

## 5. 工作方法论（执行任务时遵循）

### 5.1 总体流程

```
阶段 0：完整文件清单盘点（先有地图再上路）
  → 列出所有需要审查的文件/目录，做成 checklist

阶段 1：分模块深度阅读
  → 每个模块对应一个长期记忆子文档
  → 边读边记，不试图一次记住所有细节

阶段 2：交叉验证
  → 检查模块之间的依赖关系是否一致
  → 检查 _config.butterfly.yml inject 中引用的文件是否都覆盖到了

阶段 3：渐进式披露分层
  → L0 索引（MEMORY.md）：一行链接
  → L1 入门（onboarding/requirements）：核心警告 + 链接
  → L2 规范（02-requirements、03-api-practices）：使用规则
  → L3 深度参考（独立专题文档）：完整内部机制

阶段 4：问题归集
  → 遇到的所有疑点、矛盾、风险，归入 07-known-issues/ 子目录
```

### 5.2 渐进式披露的层次模板（写每篇深度文档都遵循）

```
# 标题
> 定位（一句话）
> 何时阅读

## L1 · TL;DR（30 秒看完）

## L2 · 快速使用（涉及配置/命令）

## L3 · 命令清单 / 配置项总览

## L4 · 内部机制（按需深读）

## L5 · 与其他模块的交互

## L6 · 重要注意事项 / 红线

## L7 · 常见问题排查

## L8 · 文件位置速查
```

### 5.3 拷问清单（每完成一个模块就过一遍）

- [ ] 我是否读完了这个模块所有相关的文件？
- [ ] 这个模块依赖的外部库我是否记录了版本？
- [ ] 这个模块是否被某个 `_config.*.yml` 配置了？我记录了配置项吗？
- [ ] 这个模块在哪个 Hexo 生命周期触发？
- [ ] 这个模块如果删除会影响什么？
- [ ] 这是 Hexo 原生 / Butterfly 原生 / 项目自定义？
- [ ] 这个模块是否有相关的主题模板修改？

---

## 6. 文件审查 Checklist（阶段 0 产出物 — 待填充）

> 任务执行的第一步要把这份 checklist 填满，然后逐项打勾。

### 6.1 项目根目录

- [ ] `package.json` —— 已部分分析（npm scripts、依赖）
- [ ] `_config.yml` —— 主 Hexo 配置
- [ ] `_config.butterfly.yml` —— Butterfly 主题配置
- [ ] `部署.txt` —— 已分析（webp 部分）
- [ ] `README.md`、`README_typewriter.md` —— 项目说明

### 6.2 自定义脚本目录

- [ ] `scripts/auto-image-list.js`
- [ ] `scripts/private-posts-scanner.js`
- [ ] `scripts/image-dimensions.js`（若存在）
- [ ] `scripts/` 下其他文件

### 6.3 工具脚本目录 `tools/`

- [x] `tools/convert-to-webp.ps1` —— 已分析
- [x] `tools/update-markdown-images.ps1` —— 已分析
- [ ] `tools/fix-budusays-images.ps1`
- [ ] `tools/restore-budusays-from-git.ps1`
- [ ] `tools/restore-budusays-simple.ps1`
- [ ] `tools/restore-github-images.ps1`
- [ ] `tools/restore-github-simple.ps1`

### 6.4 source/ 下的自定义资源

- [ ] `source/css/` 全部 .css 文件
- [ ] `source/js/` 全部 .js 文件
- [ ] `source/coffer/` 隐私文章系统
- [ ] `source/swiper/` 轮播图系统
- [ ] `source/MarkdownPreview/`
- [ ] `source/LianlianKan/`
- [ ] `source/about/`
- [ ] `source/imgs/`、`source/img/`
- [ ] `source/_data/`（若存在）

### 6.5 主题修改 `themes/butterfly/`

- [ ] `themes/butterfly/_config.yml`（主题默认配置，**不应被修改**）
- [ ] `themes/butterfly/layout/` 下所有被修改的模板（参考 `06-theme-modifications/` 中已记录的 8 个）
- [ ] `themes/butterfly/source/css/` 中的修改
- [ ] `themes/butterfly/source/js/` 中的修改

### 6.6 已存在的长期记忆文档（先读后补）

- [ ] `long-term-memory/00-index/README.md`
- [x] `long-term-memory/01-onboarding/README.md`、`onboarding-prompt.md`
- [x] `long-term-memory/02-requirements/README.md`
- [x] `long-term-memory/03-api-practices/README.md`、`webp-conversion.md`
- [x] `long-term-memory/04-operations/README.md`、`operation-log.md`
- [x] `long-term-memory/05-reference/README.md`、`project-overview.md`、`custom-features-catalog.md`、`birthday-gift-page-design.md`
- [x] `long-term-memory/06-theme-modifications/README.md`
- [x] `long-term-memory/07-known-issues/README.md`

---

## 7. 已完成事项（截至 2026-05-04）

- ✅ webp 转换工作流文档（`03-api-practices/webp-conversion.md`）
- ✅ MEMORY.md 中加入「专题文档」入口
- ✅ 各前置文档（01/02/03/05）均已加入 webp 文档的链接
- ✅ 本任务备忘录（即本文档）

## 8. 待办事项（按优先级）

1. **阶段 0**：完成 `6.x` 文件清单盘点，列出所有需要审查的文件
2. **阶段 1**：按 F1-F8 的顺序逐项产出深度文档
   - 优先级 1：F1 部署脚本完整图谱（梳理 3 条主线）
   - 优先级 2：F3 打字机效果（用户特意点名）
   - 优先级 3：F4 + F5 + F6 性能优化系列（懒加载、背景动效）
   - 优先级 4：F7 CDN 设置
   - 优先级 5：F2 自定义页面逐个分析
   - 优先级 6：F8 兜底模块（评论/数学公式/Mermaid/隐私文章/轮播图等）
3. **阶段 2**：交叉验证 `_config.butterfly.yml` inject 中引用的所有 CSS/JS 是否都已覆盖
4. **阶段 3**：渐进式披露层级补全（在已有 L1-L2 文档加链接）
5. **阶段 4**：在 `07-known-issues/` 下新建 `discovered-issues/` 子目录（按用户要求），归集本次审查发现的所有疑点

---

## 9. 输出文档建议规划

```
long-term-memory/
├── MEMORY.md                                         （索引层 L0，需更新）
├── 03-api-practices/
│   ├── webp-conversion.md                           （已完成）
│   ├── deployment-pipeline.md                       （F1 部署 3 条主线）
│   ├── lazy-loading-system.md                       （F4 懒加载）
│   ├── universe-background.md                       （F5 背景动效）
│   ├── performance-optimization.md                  （F6 性能优化总览）
│   └── cdn-strategy.md                              （F7 CDN）
├── 05-reference/
│   ├── custom-pages/                                （F2 自定义页面子目录）
│   │   ├── README.md
│   │   ├── coffer-private-posts.md
│   │   ├── swiper-gallery.md
│   │   ├── lianliankan.md
│   │   ├── markdown-preview.md
│   │   └── about-page.md
│   ├── typewriter-effect.md                         （F3 打字机效果）
│   ├── comment-system-twikoo.md                     （F8 评论）
│   ├── math-and-diagrams.md                         （F8 MathJax + Mermaid）
│   └── injection-map.md                             （inject 配置详解）
└── 07-known-issues/
    ├── README.md                                    （已存在）
    └── discovered-issues/                           （新增子目录，记录本次审查发现的问题）
        └── README.md
```

> 上述规划是**预设路径**，实际执行时可根据深度内容微调，但目录结构整体应保持稳定。

---

## 10. 自检触发器（每次会话开始或上下文压缩后必读）

如果你（AI）正在阅读本文档，且任务尚未完成（第 7 节状态不是「全部完成」），那么：

1. **不要**直接开始写代码或新文档
2. **首先**重新阅读本文档第 1、3、4 节
3. **然后**检查第 7、8 节，确认下一步该做什么
4. **必要时**重新读取 `MEMORY.md`、`package.json`、`_config.yml`、`_config.butterfly.yml` 重建上下文
5. 严格遵守第 3 节的 **C1-C7 强制约束**

---

## 11. 任务完成标志

只有当以下所有条件**同时**满足，本任务才算完成：

- [ ] 第 6 节 checklist 中所有项已打勾
- [ ] 第 4 节 F1-F8 所有重点项已产出对应深度文档
- [ ] `MEMORY.md` 索引能跳转到所有新增专题文档
- [ ] `07-known-issues/discovered-issues/` 子目录已建立并记录了审查中发现的疑点
- [ ] 抽查任意 3 个新增文档，渐进式披露的 L1→L2→L3 层级清晰可循
- [ ] 用户明天审查通过

---

> **结尾提醒**：用户明天会审查。所以本次会话剩余时间应当**尽可能多地推进阶段 0 和阶段 1 的高优先级条目**，同时保持质量优先于速度。
