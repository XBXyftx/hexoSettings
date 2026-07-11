# 长期记忆索引 — XBXyftx Hexo 博客项目

> **AI 必读**：每次进入新会话，第一步必须阅读本文件。严禁跳过索引直接操作代码。
> **当前日期**：2026-07-11
> **项目状态**：活跃维护中，持续发布新文章；当前运行时性能基线见 2026-07-10 审计及已完成的 P0 瀑布流。P1 分层星空实验已归档但未采纳，实际星空已恢复基线双 Canvas 实现。

---

## 项目速览

| 项 | 值 |
|---|---|
| **项目名称** | XBXyftx 个人技术博客 |
| **技术栈** | Hexo 7.3.0 + Butterfly 主题 v5.3.2 |
| **语言** | zh-CN |
| **部署** | GitHub Pages + 私有服务器（双部署） |
| **文章数** | 57 篇 Markdown 文章（50 个同名 asset 目录；7 篇未建目录） |
| **主题** | Butterfly（重度自定义） |
| **核心特色** | 鸿蒙开发技术博客、AI 编程经验分享、Vibe Coding 实践 |

---

## 目录导航

| 目录 | 作用 | 必读时机 |
|------|------|---------|
| [`00-index/`](00-index/) | 导航速查：每个子目录的用途一览 | **首次进入项目时** |
| [`01-onboarding/`](01-onboarding/) | 项目交接：项目概览、核心约束、当前状态 | **每次新会话开始时** |
| [`02-requirements/`](02-requirements/) | 内容规范：文章命名、front matter 规则、标签规范 | **创建/修改文章前** |
| [`02-custom-pages/`](02-custom-pages/) | 自定义页面实现：coffer/swiper/about/LianlianKan/MarkdownPreview | **修改自定义页面前** |
| [`03-api-practices/`](03-api-practices/) | 技术约束：Hexo API、主题配置、自定义脚本规则、部署/CDN/性能/懒加载/背景动画 | **修改主题或脚本前** |
| [`04-operations/`](04-operations/) | 操作日志：每次实质性修改的记录 | **上下文压缩后恢复时** |
| [`05-reference/`](05-reference/) | 参考文档：项目结构、部署配置、自定义功能清单、设计方案 | **需要全局视角时** |
| [`06-theme-modifications/`](06-theme-modifications/) | 主题修改跟踪：每次对主题文件的改动记录 | **修改主题文件前** |
| [`07-known-issues/`](07-known-issues/) | 已知问题：技术债务、待修复项、注意事项 | **遇到异常行为时** |

---

## 核心规则（违反会导致严重问题）

1. **先读后改，禁止盲写**：修改任何文件前，必须先完整阅读目标文件及其所在目录的引导文档。
2. **主题文件修改必留痕**：每次修改 `themes/butterfly/` 下的任何文件，必须在 `06-theme-modifications/` 中记录。
3. **文章 front matter 必检查**：新建/修改文章时，`tags`、`categories`、`cover`、`description` 等字段必须完整。
4. **自定义脚本只读不解耦**：`scripts/` 和 `source/js/` 中的自定义脚本是项目核心资产，禁止随意删除或重命名。
5. **运行 build 前必 clean**：执行 `hexo generate` 或 `npm run build` 前，必须先 `hexo clean`。
6. **双部署必检查**：部署后必须验证 GitHub Pages 和私有服务器两边的同步状态。

---

## 快捷命令

> ⚠️ 涉及 `webp` 的命令（`dev / opt / pub / webp`）首次运行需先安装 `libwebp`，且会**删除源图原图**。跨平台自动适配（`dispatch-webp.js` 自动检测 OS：Win→pwsh+.ps1, Mac/Linux→bash+.sh）。详见 [03-api-practices/webp-conversion.md](03-api-practices/webp-conversion.md) 和项目根 `部署.txt`。

```bash
# 开发
npm run dev          # 转换webp + clean + 启动本地服务器
npm run server       # 仅启动本地服务器

# 构建与部署
npm run build        # 生成静态文件
npm run deploy       # 部署到双目标
npm run pub          # 完整发布流程：webp + clean + build + deploy

# 维护
npm run clean        # 清理生成文件和缓存
npm run webp         # 批量转换图片为webp并更新markdown引用（依赖 libwebp）
```

---

## 专题文档（按需深读）

### 部署与构建

- [2026-07-10 渲染性能与长期记忆事实审计](05-performance-audit/2026-07-10-render-performance-audit/README.md) — **当前性能基线**；P0–P3 清单、证据、保持视觉与功能的优化路径，排查风扇高转必读
- [2026-07-10 首页瀑布流 P0 重写](04-operations/2026-07-10-waterfall-rewrite/README.md) — **已完成并推送**：实现 `9988ac4`、优化前基线 `69772c8`；[本地 Chrome A/B 三断点量化结果已归档](04-operations/2026-07-10-waterfall-rewrite/BROWSER-PERFORMANCE-MEASUREMENTS.md)，目标设备有头浏览器回归待补测
- [2026-07-11 P1 分层星空动效实验与回退](04-operations/2026-07-11-starfield-p1/README.md) — 基线 `049f08d` 已推送；实验源码、三断点本地 Headless A/B 和 SHA-256 快照已归档，视觉验收未通过，实际运行时已恢复基线双层星空。
- [Hexo 8 升级可行性报告](05-performance-audit/2026-05-07-hexo-upgrade-feasibility/README.md) — 🔴 22 依赖逐项分析、3 方案对比、数学渲染链断裂、自定义脚本影响
- [部署流水线（dev/opt/pub）](03-api-practices/deployment-pipeline.md) — 3 条部署命令的完整流程、参数差异、适用场景
- [CDN 策略与资源加载](03-api-practices/cdn-strategy.md) — 7 个 CDN 源盘点、bytecdntp 迁移历史、本地保留理由
- [WebP 图片转换工作流](03-api-practices/webp-conversion.md) — 首次配置环境 / 跑 webp 报错 / 新增图片前必读

### 内容渲染
- [Markdown 内嵌 HTML 渲染规范](03-api-practices/markdown-html-embedding.md) — 文章中插入 HTML 卡片/按钮/复杂布局前必读；排查源码块、异常空白、kramed HTML 截断

### 运行时模块
- [兜底模块全览（Twikoo/KaTeX/Mermaid + inject）](03-api-practices/fallback-modules.md) — 评论/公式/图表三大模块 + inject.head/bottom 资源全景图
- [Plotly 函数可视化渲染规范](03-api-practices/plotly-function-visualization.md) — 交互式函数图像模板（1D 曲线 + 3D 曲面）、PJAX 兼容、颜色规范
- [星空背景动画（Universe）](03-api-practices/universe-background.md) — header-universe.js 实现细节、粒子系统、流星效果
- [图片懒加载系统](03-api-practices/lazy-loading-system.md) — 多套懒加载方案协同、IntersectionObserver、PJAX 重初始化
- [性能优化策略](03-api-practices/performance-optimization.md) — FPS 节流、visibility 暂停、移动端降级、异步 CSS

### 自定义页面
- [私密文章系统（Coffer）](02-custom-pages/coffer-private-posts.md) — 扫描器插件、密码验证、客户端渲染
- [瀑布流图片画廊（Swiper）](02-custom-pages/swiper-waterfall-gallery.md) — IndexedDB 缓存、绝对定位布局、批量加载
- [关于页面（About）](02-custom-pages/about-page.md) — 卡片式布局、3D 走马灯、头像旋转光环
- [连连看小游戏（LianlianKan）](02-custom-pages/lianliankan-game.md) — 动态棋盘、3 种连接检测、CSS 自定义属性响应式
- [Markdown 在线编辑器](02-custom-pages/markdown-preview.md) — marked.js 实时预览、工具栏、全屏模式
- [生日礼物时间轴页面](02-custom-pages/birthday-gift-timeline.md) — 当前实现：送给妈妈的生日礼物、成长事件整屏切换、相册/视频/流星效果

### 特色功能
- [打字机效果（Typewriter）](05-reference/typewriter-effect.md) — 逐字显示动画、PJAX 集成、标签页标题动画
- [生日礼物历史设计归档](05-reference/birthday-gift-page-design.md) — 2026-05-04 旧版五幕剧方案，仅供历史追溯
- [时间轴页面事件编写指南](../source/birthday-gift/README.md) — 事件编写完整指南：三种结构示例、front matter 字段效果表、快速放图模式

### 已知问题
- [全面审计 BUG 清单（20+ 项）](07-known-issues/discovered-issues/README.md) — 重复文件、死代码、性能隐患、PJAX 内存泄漏、安全隐患

### 修复操作
- [2026-05-04 快速修复批次](04-operations/2026-05-04-quick-fixes/README.md) — Q1-Q7 修复记录、回滚基线 commit、每项独立 commit 与验证步骤

---

## 当前重点任务

- [ ] 持续优化博客文章质量，完善 Vibe Coding 系列内容
- [ ] 维护 Butterfly 主题自定义功能，跟进主题版本更新
- [ ] 管理隐私文章系统（coffer）和轮播图系统（swiper）
- [ ] 监控并修复已知的技术债务（参见 `07-known-issues/`）
