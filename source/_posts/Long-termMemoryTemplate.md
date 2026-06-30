---
title: 渐进式披露长期记忆文档模板
date: 2026-06-30 17:30:06
tags:
  - AI
  - 技术向
  - Zcode
  - Skills
  - Agent
  - 渐进式披露
  - 上下文工程
top: 20
cover: /imgs/ArticleTopImgs/LongTermTopImg.webp
swiper_index: 2
description: 一套面向AI编程的长期记忆文档模板——从上下文压缩、注意力缺陷到渐进式索引，详解每个目录的设计目标与使用方法
typewriter: 🧠 大模型的能力不在于它能不能"捞起针"，而在于它能不能在浩瀚的上下文中快速"找到针"。本文从上下文压缩机制、注意力分散效应以及模型幻觉等工程痛点出发，系统介绍一套可迁移的项目长期记忆文档模板——Memory Methodology Template。文章将逐目录拆解 MEMORY.md、规则文件、AI交接区、需求与Bug归档、API规范、操作日志、架构热点等模块的设计理念、使用方法和预期目标。如果你正在用AI编程却总被上下文压缩后乱写、模型遗忘关键约束、多人/多模型接力断层所困扰，这套模板或许能帮你的AI从一个"随缘编码的工具"升级为一个"有案可查的工程师"。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

用AI编程的时间越长，我就越深刻地意识到一个问题——上下文，是AI编程中唯一真正稀缺的资源。

你可能觉得模型智力不够、觉得它生成代码的质量差、觉得它总是忘记你十分钟前刚说过的话。但这些问题的根源，绝大多数都可以归结为两个字：上下文。上下文不够，模型不懂你的项目；上下文太长，模型的注意力被稀释；上下文压缩，关键信息丢失；切换模型或新开会话，一切归零。

更致命的是，大模型有一个天然的结构性缺陷——上下文压缩。无论你的上下文窗口是200K还是1M，在一个工程级项目中迟早会溢出。一旦触发压缩，模型会自行决定保留什么、丢弃什么，而这个决定的依据并不是"对你来说什么最重要"，而是模型自身注意力机制下的统计学判断。压缩后它可能把 ArkTS / ArkUI 代码写成普通 TypeScript 或前端框架范式，也可能把 `@State`、`@Prop` 这类 ArkUI 状态装饰器的使用场景搞混，甚至凭空创造出一个看起来很合理但实际上根本不存在的 API。这些错误具有极强的隐蔽性——它们不一定会立刻报编译错，很多时候要到运行或联调阶段才会暴露，排查成本极高。

所以，我现在越来越关注一个概念——"大海捞针"（Needle in a Haystack）。大模型的核心能力，不在于它能不能"捞起针"——能不能在一段文本中找到答案——而在于它能不能在一片越来越大的干草堆里**快速找到那根针**。上下文越长，干草堆越大，找到针的难度就越高。而良好组织、分层索引的文档体系，本质上就是把干草堆按类别压实成一个个小捆，让模型不必翻遍整座草山。

> 大模型的能力体现在大海捞针时"找到针"的过程，而不在于"捞起针"这个动作本身。好的文档能让模型锁定针的位置，差的文档会让模型被干草淹没。

这就是我为什么要做 [Memory Methodology Template](https://github.com/XBXyftx/memory-methodology-template) 这个仓库。它不是一套提示词合集，而是一套结构化的、可迁移的、渐进式索引的文档脚手架。它的核心目标就一个：**让AI知道该去哪里找什么东西，而不是记住所有东西**。

<style>
.memory-repo-card {
  position: relative;
  margin: 1.6rem 0 1.9rem;
  padding: 1px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(92, 124, 250, .95), rgba(34, 211, 238, .72), rgba(168, 85, 247, .88));
  box-shadow: 0 18px 45px rgba(30, 41, 59, .18);
  overflow: hidden;
}
.memory-repo-card::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, .38), transparent 26%), radial-gradient(circle at 80% 10%, rgba(125, 211, 252, .28), transparent 24%);
  pointer-events: none;
}
.memory-repo-card-inner {
  position: relative;
  padding: 1.35rem 1.45rem;
  border-radius: 21px;
  background: rgba(255, 255, 255, .9);
  backdrop-filter: blur(18px);
  color: #1e293b;
}
[data-theme='dark'] .memory-repo-card-inner {
  background: rgba(15, 23, 42, .88);
  color: #e2e8f0;
}
.memory-repo-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.memory-repo-badge {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  margin-bottom: .55rem;
  padding: .28rem .66rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, .12);
  color: #2563eb;
  font-size: .78rem;
  font-weight: 700;
}
[data-theme='dark'] .memory-repo-badge {
  background: rgba(96, 165, 250, .18);
  color: #93c5fd;
}
.memory-repo-title {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.25;
  font-weight: 800;
}
.memory-repo-desc {
  margin: .55rem 0 0;
  max-width: 52rem;
  color: #64748b;
  line-height: 1.75;
}
[data-theme='dark'] .memory-repo-desc {
  color: #cbd5e1;
}
.memory-repo-mark {
  flex: 0 0 auto;
  width: 3.3rem;
  height: 3.3rem;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: white;
  font-size: 1.55rem;
  box-shadow: 0 12px 26px rgba(37, 99, 235, .28);
}
.memory-repo-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .75rem;
  margin: 1.15rem 0;
}
.memory-repo-metric {
  padding: .78rem .85rem;
  border: 1px solid rgba(148, 163, 184, .25);
  border-radius: 15px;
  background: rgba(248, 250, 252, .74);
}
[data-theme='dark'] .memory-repo-metric {
  background: rgba(30, 41, 59, .62);
  border-color: rgba(148, 163, 184, .18);
}
.memory-repo-metric strong {
  display: block;
  font-size: 1.1rem;
  color: #0f172a;
}
[data-theme='dark'] .memory-repo-metric strong {
  color: #f8fafc;
}
.memory-repo-metric span {
  display: block;
  margin-top: .18rem;
  color: #64748b;
  font-size: .82rem;
}
[data-theme='dark'] .memory-repo-metric span {
  color: #94a3b8;
}
.memory-repo-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .45rem;
  margin: .9rem 0 1.05rem;
  color: #475569;
  font-size: .92rem;
}
[data-theme='dark'] .memory-repo-flow {
  color: #cbd5e1;
}
.memory-repo-flow code {
  padding: .24rem .48rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, .07);
  color: inherit;
}
[data-theme='dark'] .memory-repo-flow code {
  background: rgba(255, 255, 255, .08);
}
.memory-repo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin: 1rem 0 1.15rem;
}
.memory-repo-tags span {
  padding: .32rem .62rem;
  border-radius: 999px;
  background: rgba(14, 165, 233, .1);
  color: #0369a1;
  font-size: .82rem;
  font-weight: 650;
}
[data-theme='dark'] .memory-repo-tags span {
  background: rgba(14, 165, 233, .16);
  color: #7dd3fc;
}
.memory-repo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem;
  align-items: center;
}
.memory-repo-button {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .68rem .95rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  color: #fff !important;
  text-decoration: none !important;
  font-weight: 800;
  box-shadow: 0 12px 22px rgba(37, 99, 235, .22);
}
.memory-repo-note {
  color: #64748b;
  font-size: .9rem;
}
[data-theme='dark'] .memory-repo-note {
  color: #94a3b8;
}
@media (max-width: 768px) {
  .memory-repo-card-inner { padding: 1.05rem; }
  .memory-repo-card-header { flex-direction: column-reverse; }
  .memory-repo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>

<div class="memory-repo-card"><div class="memory-repo-card-inner"><div class="memory-repo-card-header"><div><div class="memory-repo-badge">🧠 Long-Term Memory · Template</div><h3 class="memory-repo-title">Memory Methodology Template</h3><p class="memory-repo-desc">一套面向 AI 编程的长期记忆文档脚手架，用渐进式索引把项目规则、需求、Bug、API 实践、架构热点和交接状态拆成可检索的小块，让模型少靠脑补，多靠证据。</p></div><div class="memory-repo-mark">⌁</div></div><div class="memory-repo-grid"><div class="memory-repo-metric"><strong>1 个</strong><span>全局入口 MEMORY.md</span></div><div class="memory-repo-metric"><strong>8 类</strong><span>分区索引目录</span></div><div class="memory-repo-metric"><strong>REQ / BUG</strong><span>唯一入口归档</span></div><div class="memory-repo-metric"><strong>Evidence</strong><span>证据驱动结论</span></div></div><div class="memory-repo-flow"><code>根索引</code><span>→</span><code>分区 README</code><span>→</span><code>条目入口</code><span>→</span><code>子文档证据</code></div><div class="memory-repo-tags"><span>上下文工程</span><span>AI Handover</span><span>渐进式索引</span><span>最小变更</span><span>证据优先</span></div><div class="memory-repo-actions"><a class="memory-repo-button" href="https://github.com/XBXyftx/memory-methodology-template" target="_blank" rel="noopener noreferrer">查看 GitHub 仓库 ↗</a><span class="memory-repo-note">适合用于新项目初始化、AI 接力、上下文压缩恢复和长期工程知识沉淀。</span></div></div></div>

{% note success flat %}
如果你正在用 AI 编程却总被上下文压缩后乱写、模型遗忘关键约束、多人/多模型接力断层所困扰，这套模板或许能帮你的 AI 从一个"随缘编码的工具"升级为一个"有案可查的工程师"。
{% endnote %}

## 大模型的注意力缺陷与上下文困境

在深入模板设计之前，我想先聊聊"为什么"——为什么大模型需要这样一套文档体系？这要从两个根本性问题说起。

### 注意力不是无限的

OpenAI在早期对长提示词的研究中就曾发现：当单个文档中的提示词长度过长、包含太多需要注意的重点时，模型的注意力反而会被分散到不同的点上，导致无法集中于核心目标。最终模型输出的内容经常偏离主题，甚至前后矛盾。

这是个反直觉的结论。很多人觉得"提示词写得越长越详细越好"，但实际情况是——你写的每一条"重要提示"，都在争夺模型有限的注意力预算。当一份文档里有20个"注意"、30个"重点"时，模型大概率一个都记不住。

> 注意力是稀缺资源。一份文档只应该告诉模型一件事，而不是一百件事。

### 上下文压缩是你的隐形敌人

另一个更隐蔽的问题是上下文压缩。无论你的模型支持多大的上下文窗口——200K、500K、甚至1M——在工程级项目中，你一定会在某个时刻触发压缩。一旦触发，模型会自行决定保留什么、丢弃什么。这个决定不经过你同意，也不会通知你，而且结果具有极大的随机性。

压缩后常见的问题包括：

| 问题类型 | 表现 |
| --- | --- |
| 语法漂移 | 模型忘记当前语言/框架的语法规则，开始用其他语言的范式编写 |
| 接口幻觉 | 模型凭空创造出听起来合理但实际上不存在的API或导入路径 |
| 规则遗忘 | 你明文规定的核心约束被当作"不重要信息"丢弃 |
| 状态混乱 | 模型对当前代码的实际状态产生错误的"记忆" |
| 逻辑断裂 | 同一段逻辑的前后两部分使用完全不同的实现思路 |

这些问题之所以致命，是因为它们往往不会直接报错——代码看起来"像模像样"，但运行时的行为完全不可控。

## 核心设计理念

基于以上认知，Memory Methodology Template 的设计围绕以下几条核心理念展开：

### 第一原则：渐进式索引

这是一切的基石。模板的设计哲学可以浓缩为一句话：

```txt
根索引 → 分区README → 条目入口 → 子文档证据
每一层保持精简，细节向下沉淀。
```

类比一下：这套结构就像一本书的目录体系。`MEMORY.md` 是总目录，各个分区 README 是章节目录，条目入口是具体小节，子文档则是附录和参考文献。AI 不需要一次读完整本书——它只需要先看目录，定位到相关章节，再展开阅读。

这样做的好处是显而易见的：
- **降低上下文消耗**：AI 每次只读当前需要的那一小部分，不浪费 token
- **提高信息密度**：每一步读到的都是精选过的、高信息密度的内容
- **降低压缩风险**：单次读取的文档都很短，不容易触发压缩

### 第二原则：先索引，再阅读

这是写给 AI 的元规则。任何新会话或上下文压缩恢复后，AI 必须第一时间返回长期记忆目录，重读 `MEMORY.md` 和相关模块文档，绝不凭"残存记忆"继续工作。

如果你觉得"这不是理所当然的吗"——不，实际情况是大多数模型在压缩后都会自信满满地凭残存记忆继续编代码。它们不会主动告诉你"我忘了"，只会默默地把接口写错、把规则忽略、把逻辑搞乱。

### 第三原则：稳定规则与实时状态分离

这一点特别重要。模板把文档明确分为两类：

- **稳定文档**：`rules.md`、`document-authoring-rules.md`、各分区 README。这些是方法论和规范，不随具体任务变化。
- **实时状态文档**：`AI-handover.md`、各 `REQ-*/` 和 `BUG-*/` 下的实施记录。这些反映当前进度，随任务推进持续更新。

为什么要分离？因为如果让 AI 在同一个文档里既读"永久规则"又读"临时状态"，它会混淆两者的权重。分离之后，AI 知道稳定文档是铁律，状态文档是参考。

### 第四原则：需求与 Bug 各自拥有唯一入口

每个需求、每个 Bug 都有且只有一个入口文档（`REQ-XXXX.md` 或 `BUG-XXXX.md`），配套一个同名子目录存放证据材料。

这样做避免了"一个需求分散在五个文档里，改了一处忘了改另一处"的常见问题。AI 只需要记住一个 ID，就能定位到所有相关信息。

### 第五原则：证据驱动

所有结论必须基于可查证的证据——源码、日志、截图、用户反馈——而非推测、印象或 commit message。

这个原则的关键在于：它不让 AI 去"猜"根因，而是要求它先收集证据再下判断。在我的实际使用中，这个原则显著降低了 AI 在调查 bug 时陷入"盲猜-验证-再盲猜"循环的概率。

## 目录结构总览

模板的完整目录结构如下：

```txt
portable-long-term-memory/
├── MEMORY.md                          # 全局导航索引
├── rules.md                           # 项目开发规则
├── document-authoring-rules.md        # 文档编写与维护规则
├── AI-handover.md                     # AI会话交接快照
├── 00-index/                          # 顶层导航锚点
│   └── README.md
├── 01-onboarding/                     # AI新会话启动上下文
│   ├── README.md
│   └── onboarding-prompt.md
├── 02-requirements/                   # 需求与分析
│   ├── README.md
│   ├── REQ-0000/README.md
│   ├── REQ-0001/
│   │   ├── README.md
│   │   ├── 分析报告.md
│   │   └── 实施记录.md
│   └── V1/README.md
├── 03-api-practices/                  # API使用规范
│   ├── README.md
│   ├── api-practices.md
│   └── feedback_callback_types.md
├── 04-operations/                     # 操作记录
│   ├── README.md
│   └── operation-log.md
├── 05-reference/                      # 项目参考文档
│   ├── README.md
│   ├── project-overview.md
│   ├── analysis-001-architecture-flow-audit.md
│   ├── analysis-002-current-architecture-hotspots.md
│   ├── analysis-003-harmony-skills-lookup-guide.md
│   ├── lessons-001-network-recovery.md
│   ├── lessons-002-exception-isolation.md
│   └── lessons-003-bugfix-feature-methodology.md
├── 06-code-review-fixes/              # CR整改记录
│   ├── README.md
│   ├── CR-001-sample-fix.md
│   ├── CR-002-sample-fix.md
│   └── CR-003-sample-fix.md
└── 07-bug-reports/                    # Bug报告与修复
    ├── README.md
    ├── BUG-0001.md
    ├── BUG-0001/
    │   ├── analysis.md
    │   ├── fix-plan.md
    │   └── log01.md
    ├── BUG-0002.md
    └── BUG-0002/
        ├── analysis.md
        ├── fix-plan.md
        └── log01.md
```

接下来我逐个目录讲解它的设计目标、使用方法和预期效果。

## 各目录详解

### MEMORY.md：全局导航总入口

`MEMORY.md` 是整个长期记忆体系的唯一入口。AI 在任何新会话、任何上下文压缩恢复后，第一件事就是读这个文件。

它的内容分为几个关键模块：

1. **Must Read 清单**：列出 AI 在开始任何工作前必须阅读的核心文档，包括项目规则、文档编写规则、AI 交接文档、项目概览、架构热点、Bug修复方法论、技能查找指引。

2. **Read by Task 路由表**：根据当前任务类型（新会话交接、需求开发、Bug 修复、API 查询、参考资料），告诉 AI 应该从哪里开始阅读。这个表中的每一个链接都指向唯一入口，AI 不需要猜测 "我该去哪个目录找"。

3. **目录地图**：所有分区目录和它们的一句话简介，供 AI 快速扫描。

4. **当前状态模板**：项目名、版本、技术栈等基本元信息占位。

5. **核心原则**：复用优先、最小变更、外部数据零信任、证据优先、不存敏感信息等贯穿始终的方法论。

这个文件的设计目标是：**AI 读完 MEMORY.md 之后，应该知道当前项目是什么、规则在哪里、遇到问题该去哪里找、以及需要遵循什么基本原则**。全程不需要自己猜。

### rules.md：项目的宪法

`rules.md` 是 AI 在项目中的行为准则。它定义了 AI 在开发、修改、归档等所有场景下必须遵守的规则。

模板中包含18条规则，覆盖了从任务边界到验证回归的全流程。这里我挑几条最有代表性的讲一下：

**规则2：禁止空 early return。** 这条规则看似简单，实则解决了 AI 编写"看起来走了分支实际上什么都没做"的死代码的问题。它要求 AI 使用显式的分支和可见的终止路径，让代码逻辑一眼就能看清。

**规则3：复用优先。** AI 有一个常见的坏习惯——喜欢从头写。给它一个需求，它的第一反应往往是"让我写一个新的函数/组件"。规则3强制它先查现有工具类、状态字段、组件和接口，只有在已有方案确实无法满足时才允许新增代码。

**规则8：外部数据零信任。** 验证所有边界输入——null、数组、类型、范围、URL、标识符。这条规则在鸿蒙开发中尤为重要，因为很多崩溃的根因就是"后端返回了一个非预期的字段类型"，而 UI 层没有加守卫。

**规则10：Bug 修复工作流。** 记录 → 取证 → 隔离根因 → 最小修复 → 实施 → 验证 → 归档。这套流程确保 AI 不会一上来就改代码，而是先搞清楚到底哪里出了问题。

**规则15：工具链不执行。** 明确禁止 AI 在没有授权的情况下执行编译、打包、安装等操作。这条规则防止 AI 在调试过程中"顺手"运行一些不该运行的东西。

这个文件不需要太长——重点在于每一条规则都足够具体、可执行，AI 读完就能立刻照着做。

### document-authoring-rules.md：文档编写的元规则

如果说 `rules.md` 管的是 AI 怎么写代码，`document-authoring-rules.md` 管的就是人怎么维护这套长期记忆。

它的核心内容包括：

- **命名规范**：使用中性的、项目无关的命名（因为这是模板），带编号前缀以便索引排序。
- **入口策略**：每个主题必须有且只有一个明确入口。如果主题内容膨胀，拆分子文档，而不是把入口文档无限延长。
- **链接策略**：索引中的每一个链接都必须指向真实存在的文件或文件夹。占位链接必须明确标注为"待创建"。
- **归档策略**：只保留事实性内容。不复制敏感源码细节、本地路径或真实标识符。如果要把真实案例转化为模板，必须替换识别性信息。
- **增长策略**：根索引保持简短，通用化结论提升到参考文档或方法论文件中，一次性案例留在需求或 Bug 文件夹内。

这个文件的定位是"给维护者看的"，不是给 AI 看的。它保证了这套文档体系本身不会随着时间推移而熵增。

### AI-handover.md：会话交接快照

这个文件是整个体系里"最短命"但"最高频"的文档。它的作用是在会话开始或模型切换时，为 AI 提供一个极简的项目快照。

内容分五个部分：

1. **项目快照**：项目名、代码位置、版本、语言、技术栈、关键依赖——一张表说完。
2. **必读清单**：引导 AI 去读规则、交接文档、证据，而不是凭印象干活。
3. **当前工作快照**：列出当前进行中的需求和 Bug 及其状态，每个条目都有直达链接。
4. **当前热点**：列出当前版本最敏感的风险区域，以及对应需要关注的环节。
5. **下一步行动**：告诉 AI 接下来该做什么——读索引、找相关文档、收集证据、设计最小方案、验证、归档。

这个文档的价值在于：当上下文压缩后 AI 回来，或者换了一个模型继续工作时，只需要花两分钟读这个文件，就能恢复到接近压缩前的状态。

### 00-index：顶层导航锚点

这个目录最小也最简单。它的唯一作用是提供一个稳定的导航入口，指向全局索引 `MEMORY.md`。

为什么需要它？因为在某些工具链或 Agent 中，AI 可能不知道从哪里开始。`00-index/README.md` 提供了最简单的路由表：去读 `MEMORY.md`、去读 `rules.md`、去查需求、去查 Bug。

它的规则是：不存业务代码、不存私密信息，只做导航。

### 01-onboarding：AI 新会话启动区

这个目录放的是 AI 接手一个新会话时最需要的最小上下文。

核心文件是 `onboarding-prompt.md`，它包含：

- **项目快照占位**：项目名、语言、技术栈、版本。
- **必读清单**：按优先级列出 AI 必须阅读的文档。
- **工作规则**：最小变更、复用优先、外部数据零信任、证据优先、不存敏感信息。
- **风险区域**：状态漂移、弱校验、超大修改范围、缺失的验证、跨模块责任不清——这些都是实际项目中踩过坑的高风险区。
- **输出风格**：交接文档应包含当前状态、未决问题、已收集证据、下一步行动和验证状态。

这个目录的关键在于"最小化"——只放新会话启动绝对需要的内容，其他一切下沉到具体目录。

### 02-requirements：需求与分析

这是整个体系中内容最富集的目录之一。每个需求对应一个 `REQ-XXXX/` 子目录，包含：

| 文件 | 作用 |
| --- | --- |
| `README.md` | 需求入口，总览状态、涉及模块、子文档索引 |
| `分析报告.md` | 范围界定、证据收集、根因分析、方案推荐 |
| `实施记录.md` | 决策记录、变更清单、验证结果、后续事项 |

此外还有一个版本维度的索引 `V1/README.md`，用于按版本追溯需求流。

这个目录的设计目标是：**一个需求的所有信息——从原始描述到分析到实施到验证——全部归拢在同一个目录下，通过 README 的一层路由即可定位到任何细节**。

### 03-api-practices：API 使用规范与技术约束

这个目录沉淀的是"写代码时不能踩的坑"。

核心文件 `api-practices.md` 定义了 API 使用的通用模式：

1. 先读契约
2. 验证所有输入
3. 显式类型转换
4. 遇到非预期形状时 fail closed
5. 保持 UI 层和数据层同步

它的重心在于：把"为什么这个 API 不能这么用"讲清楚，而不是罗列 API 参数表。对于鸿蒙这种训练语料少的领域，这个目录的价值极高——它告诉 AI "别用你训练数据里学到的前端写法，这里不适用"。

### 04-operations：操作记录与日志

这个目录很小但很重要。核心文件 `operation-log.md` 记录了关键操作的时间线：

```txt
- 2026-06-30: 创建模板结构
- 2026-06-30: 添加索引、规则和参考占位
```

你可以把它理解为项目的"航(zuò)海(sǐ)日志"——什么时候做了什么关键操作、有没有回滚、为什么回滚。当几个月后回头排查一个历史问题时，操作日志往往能提供关键的时间线信息。

### 05-reference：项目参考文档

这是内容最丰富的目录，存放的是"不太会变但很有用"的参考信息：

| 文件 | 内容 |
| --- | --- |
| `project-overview.md` | 项目的抽象事实——名称、版本、技术栈、仓库布局、主要入口点 |
| `analysis-001-architecture-flow-audit.md` | 针对某条架构链路的聚焦分析 |
| `analysis-002-current-architecture-hotspots.md` | 当前版本的风险热点地图 |
| `analysis-003-harmony-skills-lookup-guide.md` | 领域技能查找指引——什么场景该加载哪个 skill |
| `lessons-001~003` | 可复用的经验教训——网络恢复、异常隔离、Bug修复方法论 |

这个目录的设计哲学是：**一次分析，永久复用**。每当你和 AI 花了大量时间排查清楚一个架构问题或总结出一个方法论，就把它沉淀到这里，以后遇到类似问题直接链接。

### 06-code-review-fixes：CR 整改记录

这个目录按 `CR-XXX` 编号存放 Code Review 中发现的问题和修复摘要。每个记录包含：

- **问题描述**：Review 中提出了什么
- **修复方案**：最小改动是什么，什么保持不变
- **涉及文件**：改了哪些文件
- **验证方式**：怎么确认修复有效

它的存在价值在于：当类似的问题在后续 Review 中再次出现时，可以直接引用既有记录，而不是重新分析一遍。

### 07-bug-reports：Bug 报告与修复

Bug 管理是整个文档体系中结构最严谨的模块。每个 Bug 有：

- **一个唯一入口文件** `BUG-XXXX.md`：包含状态、描述、环境、复现步骤、根因摘要、修复摘要、验证状态。
- **一个同名子目录** `BUG-XXXX/`：存放深度分析、修复计划、日志文件、截图等证据材料。

Bug 的状态流转遵循明确的定义：

| 状态 | 含义 |
| --- | --- |
| To triage | 已记录，尚未分析 |
| Investigating | 根因分析进行中 |
| Ready to implement | 方案已确定，等待编码 |
| Fixed, pending verification | 代码已修改，等待验证 |
| Verified | 已通过验证 |
| Rolled back | 错误修复已回滚 |

这套结构解决了一个非常实际的问题：当你同时追踪多个 Bug 时，每个 Bug 的调查进度、证据链和修复状态都清晰可查，不会出现"这个 Bug 我上周是不是已经修好了"的尴尬。

## 使用流程

了解了每个目录的作用之后，再来看这套模板在实际开发中的完整使用流程：

### 阶段一：首次接入

1. 将模板复制到项目工作区
2. 用项目实际信息替换所有 `<placeholder>`
3. 在 `AI-handover.md` 中填写当前项目快照
4. 在 `project-overview.md` 中记录项目架构和主要入口点
5. 在 `operation-log.md` 记录初始化操作

### 阶段二：需求开发

1. 在 `02-requirements/` 下创建 `REQ-XXXX/` 目录
2. 在 `README.md` 中记录需求原始描述和范围
3. 进行分析，将结论写入 `分析报告.md`
4. AI 设计方案，人工审核
5. AI 实施修改，完成后更新 `实施记录.md`
6. 更新 `AI-handover.md` 中的当前工作快照

### 阶段三：Bug 修复

1. 在 `07-bug-reports/` 下创建 `BUG-XXXX.md` 和同名子目录
2. 记录现象、环境、复现步骤
3. 收集日志和截图放入子目录
4. 隔离根因，写入 `analysis.md`
5. 设计最小修复方案，写入 `fix-plan.md`
6. 实施修复
7. 验证并更新状态为 Verified
8. 如果发现是可复用的教训，沉淀到 `05-reference/`

### 阶段四：上下文压缩恢复

1. AI 检测到上下文压缩后，第一时间返回长期记忆目录
2. 重读 `MEMORY.md` → `AI-handover.md`
3. 根据当前任务类型，重读对应的分区 README
4. 确认当前代码状态后再继续工作

> 这套流程的核心思想就一句：把大模型当成一个每次睡醒都会失忆的同事。你需要给它留一张工位上的便签，告诉它项目是什么、资料在哪、昨天做到哪了、今天要干什么。

## 常见误区

最后聊聊我在实际使用中观察到的一些常见误区：

{% note warning flat %}
**把所有的规则都塞进一个超长文档。** 这是最常见的错误。一个 5000 行的提示词文件不是"全面"，而是"无效"。模型读完前三段的时候注意力已经被稀释到无法聚焦任何一条规则了。
{% endnote %}

**只写目录不写更新规则。** 文档体系最大的敌人是熵增。如果没有明确的更新规则（谁改、什么时候改、改完后怎么同步索引），这套结构在两个月内就会变成一堆过时的废话。

**把临时想法和稳定规范混在一起。** 临时调试笔记、想法草稿、未经验证的假设，这些东西应该放在各自主题的子目录里，不要污染入口文档和索引。

**让 AI 自己脑补项目 API。** AI 在缺少上下文时会自动调用它训练数据中的"经验"，而这个经验很可能跟你的项目完全不沾边。对于鸿蒙这种小众技术栈，一定要在规则文件中明确约束"只允许使用项目中已经出现过的 API"。

**只记录成功方案，不记录失败尝试。** 有时候，"这个方案行不通以及为什么行不通"比"最终用了什么方案"更有价值。失败的尝试记录能防止 AI 在下一次遇到类似问题时重复走弯路。

## 最后总结

长期记忆本质上不是一堆越写越长的提示词，而是一套给 AI 使用的项目资料库。它需要有入口、有索引、有分层、有操作日志，也要有明确的更新规则。

回到"大海捞针"这个比喻：我们给 AI 堆上下文，就像往干草堆里扔更多的干草——草堆变大了，但针的密度变低了，找到针的难度反而增加了。而一套良好设计的长期记忆体系，是在草堆里插上路标、画上地图、建好索引。AI 不需要翻遍整座草山，它只需要看路标，走到正确的位置，拿起那根针。

如果说普通的提示词是在"临时指挥"AI，那么长期记忆就是在给一个会失忆的同事搭建工位。资料放在哪里、遇到问题先读什么、做完事情记录到哪里——这些看似琐碎的规则，才是让 AI 能够长期、稳定、高质量地参与工程开发的基础。

这套模板我已经开源到了 GitHub：[memory-methodology-template](https://github.com/XBXyftx/memory-methodology-template)。它是一个起点，不是一个终点。你可以根据自己的项目结构、技术栈和团队习惯进行调整。唯一不变的核心原则是：

> 不是让 AI 记住所有东西，而是让 AI 知道该去哪里找东西。
