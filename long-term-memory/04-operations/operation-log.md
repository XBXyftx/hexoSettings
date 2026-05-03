# 操作日志

---

### #1 — 2026-05-03 — 创建博客项目长期记忆目录

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- 新建 `long-term-memory/` 完整目录结构
- 新建 `MEMORY.md` — 全局索引
- 新建 `00-index/README.md` — 导航速查
- 新建 `01-onboarding/README.md` + `onboarding-prompt.md` — 项目交接
- 新建 `02-requirements/README.md` — 内容规范
- 新建 `03-api-practices/README.md` — 技术约束
- 新建 `04-operations/README.md` + `operation-log.md` — 操作日志
- 新建 `05-reference/README.md` + `project-overview.md` + `custom-features-catalog.md` — 参考文档
- 新建 `06-theme-modifications/README.md` — 主题修改跟踪
- 新建 `07-known-issues/README.md` — 已知问题

**操作详情**：
基于对项目的全面扫描（51篇文章、3个自定义脚本、大量主题修改、自定义页面等），创建了完整的渐进式长期记忆文档体系。涵盖项目概览、技术栈、自定义功能清单、主题修改记录、已知问题等。

**验证结果**：
- [x] 本地文件创建成功
- [ ] 需要人工审阅内容准确性

**遗留问题**：
- `06-theme-modifications/` 中的历史修改记录需要人工补充（本次仅记录了已发现的修改）
- `07-known-issues/` 中的部分问题需要进一步验证是否已修复

---

### #2 — 2026-05-03 — VibeTips.md 文章扩充

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- `source/_posts/VibeTips.md` — 续写 skills 章节、添加表格、添加仓库卡片

**操作详情**：
1. 续写了 skills 章节（说明书类比、按需加载、编写方式、可复用性、警示）
2. 添加了 Skill vs Workflow vs Agent 对比表格
3. 添加了标准化 skill 文件夹结构表格
4. 添加了 `linhay/harmony-next.skills` 仓库 HTML 卡片
5. 添加了 5 张图片的渐进式解析
6. 为 6 篇相关文章追加了新标签（Agent、上下文工程、Skills 等）

**验证结果**：
- [x] 文件编辑成功
- [ ] 需要 build 预览确认渲染效果

---

### #3 — 2026-05-03 — 批量更新文章标签

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- `source/_posts/ThoughtsOnVibeCoding.md` — 新增标签 `Agent`
- `source/_posts/AITrainingCamp.md` — 新增标签 `Agent`、`上下文工程`
- `source/_posts/AITrainingCamp2.md` — 新增标签 `Agent`
- `source/_posts/KimiCode.md` — 新增标签 `Agent`
- `source/_posts/CodeInspiration.md` — 新增标签 `Agent`
- `source/_posts/HongYiXun.md` — 新增标签 `Agent`

**操作详情**：
根据新标签（Skills、Agent、渐进式披露、上下文工程），遍历所有文章，为 6 篇相关文章追加了匹配的 `Agent` 标签。`AITrainingCamp.md` 额外追加了 `上下文工程` 标签。

**验证结果**：
- [x] 所有 6 篇文章标签更新成功

---

### #4 — 2026-05-04 — 创建生日礼物特限页面

**操作人**：AI 助手（Claude Code）

**涉及文件**：

- 新建 `source/birthday-gift/index.md` — 生日礼物特限页面主体（layout: false，完整独立HTML/CSS/JS）
- 新建 `source/birthday-gift/imgs/` — 页面图片资源目录（预留）
- 修改 `_config.butterfly.yml` — 在 menu 导航中新增 `妈妈生日快乐` 入口

**操作详情**：

1. 调研了博客现有自定义页面实现方式（MarkdownPreview、LianlianKan、about、coffer）
2. 分析了 Hexo + Butterfly 框架的渲染限制（主题layout强制包装、全局CSS污染、底部脚本注入等）
3. 确定采用 `layout: false` 方案创建完全独立的页面，突破主题限制
4. 设计了五幕剧式文案结构（开场心跳 → 时间轴 → 我的故事 → 告白高潮 → 落款）
5. 实现了 5 组动画系统：SVG心跳描边、时间轴滚动高亮、Canvas粒子上升、文字渐入、光晕浮动
6. 页面完全自包含，不依赖主题任何资源（CSS/JS均内联）

**设计方案文档**：`long-term-memory/05-reference/birthday-gift-page-design.md`

**验证结果**：

- [x] 文件创建成功
- [ ] 待用户本地运行 `hexo server` 预览
- [ ] 待用户补充照片后可选加入图片展示区域
- [ ] 待用户确认文案内容是否满意

---
