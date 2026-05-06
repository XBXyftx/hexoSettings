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

- 新建 `source/birthday-gift/index.html` — 生日礼物特限页面主体（layout: false，完整独立HTML/CSS/JS）
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

### #5 — 2026-05-05 — 懒加载系统精简（移除4个冗余脚本）

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- `themes/butterfly/layout/includes/additional-js.pug` — 删除 4 个懒加载脚本加载
- `themes/butterfly/layout/includes/head.pug` — 删除 2 个刷新按钮 CSS 加载
- `_config.butterfly.yml` — 删除不存在的 `lazy-loading-optimized.css` 引用

**操作详情**：

1. 采用"运行时日志标记法"确认各系统真实行为：给 4 个脚本添加唯一标识日志 → 用户浏览器实测 → 收集控制台日志分析
2. **关键发现**：`lazy-loading-optimized.js`（通过 `inject.bottom` 加载）是唯一有效工作者，之前调研报告漏掉了这个系统
3. `lazy-loading.js` init 被架空（0 张处理），scroll 路径仍重复工作
4. `lazy-loading-native.js` 对 1x1 GIF 执行无意义 fadeIn
5. `lazy-image-refresh.js` 和 `lazy-video-refresh.js` 持续扫描但从未触发，后者有 `loadVideo(src=undefined)` bug
6. 依赖审查：`main.js:706` 的 `lazyLoadPreload` 有 `typeof` 保护，删除后安全降级

**验证结果**：
- [x] 控制台仅剩 `[LazyLoad]` 前缀日志
- [x] Network 面板确认 4 个脚本不再加载
- [x] 文章页图片懒加载功能正常
- [x] 构建成功

**遗留问题**：
- `source/js/` 和 `source/css/` 下的 6 个文件未物理删除
- `image-dimensions.js` 注入的 `loading="lazy"` 被占位符覆盖

**详细文档**：[2026-05-05-lazyload-cleanup/README.md](2026-05-05-lazyload-cleanup/README.md)
**回滚基点**：`ef9d3c7`
**Git commit**：`40a3207`

---

### #6 — 2026-05-06 — 物理清理废弃懒加载文件与未使用 npm 依赖

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- 删除 `source/js/lazy-loading.js` — 16KB 已废弃懒加载脚本
- 删除 `source/js/lazy-loading-native.js` — 3.9KB 已废弃原生懒加载脚本
- 删除 `source/js/lazy-image-refresh.js` — 15.7KB 已废弃图片刷新脚本
- 删除 `source/js/lazy-video-refresh.js` — 19.8KB 已废弃视频刷新脚本
- 删除 `source/css/lazy-image-refresh.css` — 6KB 已废弃刷新按钮样式
- 删除 `source/css/lazy-video-refresh.css` — 8.8KB 已废弃刷新按钮样式
- 删除 `themes/butterfly/source/js/universe.js` — 3.5KB 旧版星空脚本（`header-universe.js` 已替代）
- 删除 `themes/butterfly/source/js/lazy-loading-native.js` — 4.3KB 重复文件
- 修改 `package.json` / `package-lock.json` — 卸载 `hexo-theme-landscape`

**操作详情**：

2026-05-05 懒加载系统精简操作（#5）遗留了 6 个物理文件未删除（仅移除了加载引用）。本次执行彻底清理：

1. `source/js/` 和 `source/css/` 下 6 个懒加载相关文件 — 加载引用已在 #5 中从 `additional-js.pug` 和 `head.pug` 移除
2. `themes/butterfly/source/js/universe.js` — 确认 `head.pug:97` 只加载 `header-universe.js`，旧版无引用
3. `themes/butterfly/source/js/lazy-loading-native.js` — 与 `source/js/lazy-loading-native.js` 内容几乎相同，无任何引用
4. `hexo-theme-landscape` — 确认博客使用 Butterfly 主题，此包完全未使用

**验证结果**：
- [x] `git status` 确认 10 个文件变更（8 删除 + 2 package 修改）
- [x] `hexo generate` 构建成功
- [x] 文章页图片懒加载功能正常

**收益**：仓库体积减少 ~76KB（JS/CSS）+ `hexo-theme-landscape` 体积
**Git commit**：`eb6a824`
**关联操作**：#5 懒加载系统精简的后续物理清理

---

### #7 — 2026-05-05 — 修复生日页面白边问题

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- `source/birthday-gift/index.html` — 添加 `html, body { margin: 0; padding: 0; }` CSS 重置，删除 front matter 后空行
- `source/birthday-gift/index.md` → `source/birthday-gift/index.html`（重命名并修复）
- `long-term-memory/05-reference/birthday-gift-page-design.md` — 更新引用

**操作详情**：

1. **问题现象**：用户反馈生日页面顶部出现白边，且生成文件中显示 `<p>&lt;!DOCTYPE html&gt;</p>`
2. **根因分析**：
   - 旧生成缓存：文件先前为 `.md` 扩展名时，Hexo 的 `hexo-renderer-kramed` 将 DOCTYPE 当作 Markdown 文本进行了 HTML 实体转义并包裹在 `<p>` 标签中。重命名为 `.html` 后未执行 `hexo clean`，数据库保留旧渲染结果
   - CSS 缺失：`.birthday-page, .birthday-page *` 的 margin 重置未覆盖 `body` 元素本身，浏览器默认 `body { margin: 8px }` 导致白边
3. **修复措施**：
   - 添加 `html, body { margin: 0; padding: 0; }` CSS 规则
   - 删除 front matter 与 `<!DOCTYPE html>` 之间的空行（hexo-front-matter 解析后保留）
   - 执行 `hexo clean && hexo generate` 清除旧缓存

**验证结果**：
- [x] `public/birthday-gift/index.html` 第1行即为 `<!DOCTYPE html>`，无转义
- [x] CSS 包含 body margin 重置
- [x] 文件未被主题 layout 包装，以 `</html>` 结尾
- [x] 构建成功

**Git commit**：`93a58e4`
