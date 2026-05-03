# 长期记忆索引 — XBXyftx Hexo 博客项目

> **AI 必读**：每次进入新会话，第一步必须阅读本文件。严禁跳过索引直接操作代码。
> **当前日期**：2026-05-04
> **项目状态**：活跃维护中，持续发布新文章

---

## 项目速览

| 项 | 值 |
|---|---|
| **项目名称** | XBXyftx 个人技术博客 |
| **技术栈** | Hexo 7.3.0 + Butterfly 主题 v5.3.2 |
| **语言** | zh-CN |
| **部署** | GitHub Pages + 私有服务器（双部署） |
| **文章数** | 51 篇（49 篇含 asset 文件夹，2 篇不含） |
| **主题** | Butterfly（重度自定义） |
| **核心特色** | 鸿蒙开发技术博客、AI 编程经验分享、Vibe Coding 实践 |

---

## 目录导航

| 目录 | 作用 | 必读时机 |
|------|------|---------|
| [`00-index/`](00-index/) | 导航速查：每个子目录的用途一览 | **首次进入项目时** |
| [`01-onboarding/`](01-onboarding/) | 项目交接：项目概览、核心约束、当前状态 | **每次新会话开始时** |
| [`02-requirements/`](02-requirements/) | 内容规范：文章命名、front matter 规则、标签规范 | **创建/修改文章前** |
| [`03-api-practices/`](03-api-practices/) | 技术约束：Hexo API、主题配置、自定义脚本规则 | **修改主题或脚本前** |
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

> ⚠️ 涉及 `webp` 的命令（`dev / opt / pub / webp`）首次运行需先安装 `libwebp`，且会**删除源图原图**。详见 [03-api-practices/webp-conversion.md](03-api-practices/webp-conversion.md)。

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

- [WebP 图片转换工作流](03-api-practices/webp-conversion.md) — 首次配置环境 / 跑 webp 报错 / 新增图片前必读

---

## 当前重点任务

- [ ] 持续优化博客文章质量，完善 Vibe Coding 系列内容
- [ ] 维护 Butterfly 主题自定义功能，跟进主题版本更新
- [ ] 管理隐私文章系统（coffer）和轮播图系统（swiper）
- [ ] 监控并修复已知的技术债务（参见 `07-known-issues/`）
