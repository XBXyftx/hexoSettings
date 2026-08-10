# 操作日志

---

### #41 — 2026-07-19 — 适配博客项目的 Agent 长期记忆协议（仅本地实施）

**操作人**：Codex

**涉及文件**：

- `AGENTS.md` — 增加精简启动协议、长期记忆路由和授权边界，保留历史 Hexo 参考内容
- `long-term-memory/agent.md` — 新增博客专属 Agent 生命周期、任务路由、证据标签、验证边界和停止条件
- `long-term-memory/rules.md` — 新增博客内容、Hexo 生成、主题、构建、部署和 Git 规则
- `long-term-memory/document-authoring-rules.md` — 新增长期记忆职责分层、索引、事实和脱敏规范
- `long-term-memory/MEMORY.md` — 接入 Agent 文档入口，更新当前工作树状态和数量事实
- `long-term-memory/00-index/README.md` — 增加 Agent/规则入口和按需读取原则
- `long-term-memory/01-onboarding/onboarding-prompt.md` — 指向共享规则，修正易过时的数量描述
- `long-term-memory/03-api-practices/README.md` — 增加脚本/构建任务的 Agent 和授权入口
- `long-term-memory/04-operations/README.md` — 增加操作记录的证据标签要求
- `long-term-memory/05-reference/project-overview.md` — 移除过时的固定文章数量描述
- `long-term-memory/06-theme-modifications/README.md` — 增加主题修改前的协议和验证边界入口

**操作详情**：

参照独立的 portable long-term memory 模式，将博客原有“功能目录索引”升级为“博客专属 Agent 协议 + 分区文档”的三层结构。保留现有内容、主题、脚本、构建和部署文档，不引入 HarmonyOS 项目的需求编号或 DevEco 专属规则。针对本博客新增 WebP 删除源图、生成 JSON 会被重写、主题定制升级风险、客户端隐私文章限制和双部署授权边界。

**验证结果**：

- [x] 新增 Agent、项目规则和文档编写规则文件
- [x] `MEMORY.md`、`00-index`、onboarding 和相关分区入口已同步
- [x] 当前工作树文章数与 asset 目录数已重新扫描并更新为 59 / 51
- [x] 保留用户已有 `source/coffer/private-posts.json` 工作区差异，未恢复或覆盖
- [ ] 尚未运行 Hexo build；本次变更只涉及 Agent/长期记忆文档和启动说明
- [ ] 未提交、未推送、未部署

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

### #7 — 2026-05-06 — 安装 hexo-filter-optimize 资源压缩插件

**操作人**：AI 助手（Claude Code）
**涉及文件**：
- `package.json` / `package-lock.json` — 新增 `hexo-filter-optimize` 依赖
- `_config.yml` — 添加 `filter_optimize` 配置段

**操作详情**：

1. **安装插件**：`npm install hexo-filter-optimize`
2. **配置策略**（保守优先）：
   ```yaml
   filter_optimize:
     enable: true
     versioning: true
     css:
       minify: true
       bundle: false    # 暂不开合并，避免影响条件加载
     js:
       minify: true
       bundle: false    # 暂不开合并，避免影响条件加载
     html:
       minify: true
   ```
3. **构建验证**：`hexo clean && hexo generate` → 1921 文件成功生成，无报错
4. **效果确认**：HTML 头部已被压缩（标签间空白消除），关键页面全部正常

**验证结果**：
- [x] `npm install` 成功（新增 54 个包）
- [x] `hexo generate` 构建成功，1921 文件
- [x] index.html / archives / about / 文章页均正常存在
- [x] lazy-loading-optimized.js 等关键资源正常

**回滚基点**：`baec5a3`
**Git commit**：`ac83c10`

---

### #8 — 2026-05-06 — Twikoo 按需加载策略深度调研

**操作人**：AI 助手（Claude Code）
**涉及文件**（仅调研，无代码修改）：
- `themes/butterfly/layout/includes/third-party/comments/twikoo.pug`
- `themes/butterfly/layout/includes/third-party/comments/index.pug`
- `themes/butterfly/layout/page.pug`
- `themes/butterfly/layout/post.pug`
- `themes/butterfly/source/js/utils.js`
- `themes/butterfly/layout/includes/additional-js.pug`
- `_config.butterfly.yml`

**调研结论**：Twikoo **已经是按需加载的**，无需任何改动。

| 页面类型 | JS 加载？ | 机制 |
|---|---|---|
| 首页/归档/标签 | ❌ 不加载 | `commentsJsLoad = false` |
| 文章页 | ✅ 懒加载 | `btf.loadComment` + `IntersectionObserver` |
| 说说页 | ✅ 懒加载 | 同上 |
| CSS (5.5KB) | 全站异步 | `inject.head` + `media="print"`，不阻塞首屏 |

**关键证据**：
1. `comments.lazyload: true` (`_config.butterfly.yml:567`) — 评论懒加载已开启
2. `btf.loadComment` (`utils.js:107`) — 使用 `IntersectionObserver` 监听 `#twikoo-wrap`
3. `commentsJsLoad = false` (`page.pug:5`) — 首页默认不加载评论 JS
4. `card_post_count: false` + `card_newest_comments: false` — 侧边栏不触发加载

**Git commit**：无（纯调研，无代码变更）
**关联文档**：性能审计 `README.md` 4.1 节已更新

---

### #9 — 2026-05-05 — 修复生日页面白边问题

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

---

### #7 — 2026-05-06 — 重构生日页面为个人成长时间轴

**操作人**：AI 助手（Claude Code）

**涉及文件**：
- 重写 `source/birthday-gift/index.html` — 全新个人成长时间轴页面（整屏切换、左右交替布局、中央光带、边缘泛光、相册系统、视频弹层、流星效果）
- 新建 `source/js/birthday-gift.js` — 页面交互脚本（整屏滚动、相册展开、懒加载、流星Canvas、键盘导航）
- 新建 `scripts/birthday-gift-scanner.js` — Hexo 扫描脚本（扫描事件文件夹、解析 front matter、渲染 Markdown、生成 JSON）
- 修改 `scripts/image-dimensions.js` — 添加 `/birthday-gift/` 路径排除，避免干扰页面自定义懒加载
- 新建 `source/birthday-gift/events/01-childhood/index.md` — 测试事件：童年时光
- 新建 `source/birthday-gift/events/02-teenager/index.md` — 测试事件：青春岁月
- 新建 `source/birthday-gift/events/03-now/index.md` — 测试事件：逐梦前行
- 新建 `source/birthday-gift/README.md` — 操作文档（如何添加事件、命名规范、字段说明）
- 删除 `source/birthday-gift/index.md`（旧页面）

**操作详情**：

1. **需求来源**：用户编写需求文档 `long-term-memory/02-requirements/生日页面需求文档.md`，要求将"献给妈妈的生日礼物"页面替换为个人成长时间轴
2. **架构设计**：
   - 事件驱动：每个事件一个子文件夹（`01-childhood/` 等），包含 `index.md` + 图片/视频
   - Hexo 扫描器：生成 `birthday-gift/events-data.json` 供页面异步加载
   - 整屏切换：wheel/touch/键盘导航，CSS transform 动画
   - 视觉系统：中央流动光带（CSS animation）、背景虚化切换（双缓冲）、边缘泛光（CSS variable）
   - 相册系统：缩略图堆叠（CSS transform）、点击展开弹层（backdrop-filter 模糊）、原图懒加载
   - 视频支持：SVG 播放按钮、video 弹层
   - 流星效果：无图片事件时激活 Canvas 流星动画（30fps 节流）
3. **主题隔离**：`layout: false` + 全内联 CSS + IIFE JS，确保不受 Butterfly 主题样式和脚本干扰
4. **渐进式实现**：Phase 1（MVP）→ Phase 2（视觉增强）→ Phase 3（相册）→ Phase 4（视频）→ Phase 5（完善）

**验证结果**：
- [x] `hexo generate` 成功，扫描器正确识别 3 个测试事件
- [x] `public/birthday-gift/events-data.json` 正确生成
- [x] `public/birthday-gift/index.html` 未被主题包装，以 `</html>` 结尾
- [x] `public/js/birthday-gift.js` 正确复制
- [x] glowColor 引号问题已修复
- [x] image-dimensions.js 排除规则生效
- [ ] 需要用户补充真实图片和视频进行完整测试

**Git commit**：
- 代码实现：`d1b6f60`
- 文档记录：`a077c40`

---

### #9 — 2026-05-06 — 重写生日页面视觉与交互体验

**操作人**：AI 助手（Codex）

**涉及文件**：
- 重写 `source/birthday-gift/index.html` — 独立舞台式时间轴页面，重做背景、中央光带、边缘泛光、左右交替布局、弹层样式和移动端布局
- 重写 `source/js/birthday-gift.js` — 重做整屏滚动、键盘/触摸导航、相册弹层、大图/视频弹层、缩略图懒加载、无媒体流星 Canvas
- 重写 `scripts/birthday-gift-scanner.js` — 使用 front matter 解析器、修复视频封面识别、补背景文件存在性检查与回退背景
- 修改 `scripts/image-dimensions.js` — 对生日页做页面级跳过，避免全局图片尺寸/懒加载注入干扰自定义逻辑
- 新增 `source/birthday-gift/imgs/bg-childhood.webp`
- 新增 `source/birthday-gift/imgs/bg-teenager.webp`
- 新增 `source/birthday-gift/imgs/bg-now.webp`
- 修改 `source/birthday-gift/events/*/index.md` — 将背景路径更新为实际存在的 WebP 资源
- 修改 `source/birthday-gift/README.md` — 更新背景路径说明，并规避 README 示例 front matter 被 Hexo 误解析
- 更新 `source/birthday-gift/events-data.json` — 构建时由扫描器重新生成

**操作详情**：

1. 保留“事件文件夹 + `index.md` + 媒体文件 + JSON 扫描器”的数据架构，前端视觉与交互全部重写
2. 页面继续使用 `layout: false`，不依赖 Butterfly 主题 DOM、全局 CSS 或全局懒加载脚本
3. 无媒体事件不再显示空占位，改为抽象记忆球 + Canvas 流星背景，匹配需求中的异常场景
4. 相册逻辑改为：主页面只加载缩略图；打开相册后加载封面；点击图片/视频后再加载原图或视频
5. 修复旧数据中 `/birthday-gift/assets/*.jpg` 不存在导致背景 404 的问题，新增三张本地 WebP 回退背景
6. 修复 `thumb-video-*` 可能被识别为普通 `thumb-*` 的媒体关联问题

**验证结果**：
- [x] `node --check source/js/birthday-gift.js` 通过
- [x] `node --check scripts/birthday-gift-scanner.js` 通过
- [x] `npm.cmd run build` 构建成功
- [x] `public/birthday-gift/index.html` 第一行是 `<!DOCTYPE html>`，确认未被主题 layout 包装
- [x] `public/birthday-gift/events-data.json` 背景路径已更新为 `/birthday-gift/imgs/*.webp`
- [x] `public/js/birthday-gift.js` 语法检查通过

**注意事项**：
- 目前三个事件没有真实图片/视频，页面会走无媒体流星视觉。补充媒体时仍按 `thumb-*`、`photo-*`、`video-*`、`thumb-video-*` 命名即可。
- PowerShell 执行策略会阻止 `npm`，本次使用 `npm.cmd run build` 完成验证。

**Git commit**：`f5286e7`

---

### #10 — 2026-05-06 — 生日页面交互优化与扫描器增强

**操作人**：AI 助手（Claude Code）

**涉及文件**：
- 修改 `scripts/birthday-gift-scanner.js` — 支持"快速放图"模式（无需 `thumb-*`/`photo-*` 命名对），排除保留名图片（`bg|background|cover|poster`）
- 重写 `source/birthday-gift/README.md` — 从简单操作指南升级为完整事件编写指南，涵盖最小结构/完整结构/快速放图三种模式
- 修改 `source/birthday-gift/index.html` — 背景虚化降低（28px→12px）、亮度提升（0.72→0.78）、文字区域添加滚动优化 CSS
- 修改 `source/js/birthday-gift.js` — 文字区域独立滚动不触发整屏切换、流星效果性能优化
- 新增 `source/birthday-gift/events/01-childhood/01.jpg` — 童年事件第一张真实图片
- 替换 `source/birthday-gift/imgs/bg-childhood.webp` → `bg-childhood.jpg`
- 修改 `source/birthday-gift/events/01-childhood/index.md` — 背景路径同步更新为 `.jpg`
- 更新 `source/birthday-gift/events-data.json` — 构建时由扫描器重新生成

**操作详情**：

1. **扫描器增强**：新增 `plainImages` 数组收集未按命名规范但合法的后缀图片文件，支持用户直接放入 `01.jpg` 等文件即可展示，无需成对创建 `thumb-*`/`photo-*`。同时新增 `isReservedImageFile()` 排除 `bg|background|cover|poster` 等保留名，避免背景图被误识别为相册媒体。
2. **文字区域可滚动**：事件文案较长时，`.memory-body` 区域支持独立滚动。通过 `findScrollableText()` 检测目标元素，结合 `shouldLetScrollableConsumeWheel()` / `shouldLetScrollableConsumeTouch()` 判断是否在文字区域边缘，非边缘时让滚动事件由文字区域消费，不触发整屏切换。
3. **流星效果性能优化**：
   - Canvas 使用 `{ desynchronized: true }` 减少绘制延迟
   - 添加 FPS 节流（22fps），通过 `timestamp` 差值控制 `drawMeteorFrame()` 调用频率
   - 动态渲染缩放：根据 `devicePixelRatio` 和屏幕宽度（≤768px 时额外降频）计算 `renderScale`
   - 监听 `visibilitychange`，页面不可见时自动暂停流星动画
   - 流星粒子参数调优（速度、透明度、尾迹长度）
4. **页面视觉微调**：背景虚化程度降低使背景图更清晰可辨，亮度提升改善暗部细节，文字区域添加 `overscroll-behavior: contain` / `touch-action: pan-y` / `-webkit-overflow-scrolling: touch` 优化移动端滚动体验。
5. **README 重写**：围绕"新增事件时只需要做什么"重新组织文档结构，用三种文件夹结构示例覆盖不同使用场景，front matter 字段表格明确每个字段的页面效果。

**验证结果**：
- [x] `npm run build` 构建成功
- [x] `public/birthday-gift/events-data.json` 正确生成，包含 `01-childhood` 的媒体信息
- [x] 扫描器语法检查通过
- [x] 页面 JS 语法检查通过

**Git commit**：`98ccd17`

---

### #11 — 2026-05-07 — 生日页面顶部礼物标题与长期记忆同步

**操作人**：AI 助手（Codex）

**涉及文件**：
- 修改 `source/birthday-gift/index.html` — 顶部新增“给妈妈的生日礼物”主标题和副标题，页面 `<title>` / description 同步更新
- 新增 `long-term-memory/02-custom-pages/birthday-gift-timeline.md` — 当前生日礼物时间轴页面实现文档，按渐进式披露组织 L1-L7
- 修改 `long-term-memory/MEMORY.md` — 将生日页当前实现入口加入“自定义页面”，将旧设计标注为历史归档
- 修改 `long-term-memory/00-index/README.md` — 自定义页面速查表新增生日礼物时间轴，并在决策树中加入生日页修改路径
- 修改 `long-term-memory/02-requirements/生日页面需求文档.md` — 补充页面礼物定位、快速放图模式和当前实现文档入口
- 修改 `long-term-memory/05-reference/README.md` — 标明 `birthday-gift-page-design.md` 是历史设计归档
- 修改 `long-term-memory/05-reference/custom-features-catalog.md` — 修正生日页旧信息，替换“五幕剧/index.md”描述为当前时间轴实现摘要

**操作详情**：

1. **顶部礼物语境补足**：用户反馈页面当前只像“我自己的勇敢历程”，缺少“送给妈妈的生日礼物”的第一眼信号。因此在 `.topbar` 中新增 `.gift-heading`，主标题为「给妈妈的生日礼物」，副标题为「把我的成长与感谢，慢慢讲给你听」。
2. **布局策略**：顶部从左右 flex 改为三栏 grid：左侧保留“成长之路 · 蜕变与成长”，中间显示礼物标题，右侧保留事件计数。移动端下标题换到第二行，并增加首屏上内边距，避免遮挡事件内容。
3. **元信息同步**：将页面 front matter title 改为「给妈妈的生日礼物」，浏览器标题改为「给妈妈的生日礼物 | 成长之路」，SEO 描述改为“送给妈妈的生日礼物”语境。
4. **长期记忆渐进式披露**：
   - L1 总索引只放导航入口与一句摘要，不承载实现细节。
   - L2/L3 需求文档记录当前不应丢失的产品约束：顶部必须保留礼物语境、媒体支持快速放图。
   - L3/L4 `02-custom-pages/birthday-gift-timeline.md` 记录当前实现的文件职责、数据流、关键交互和验证方式。
   - L4 操作日志记录本次实际变更，便于上下文压缩后恢复。
5. **旧文档纠偏**：`custom-features-catalog.md` 仍描述早期五幕剧式页面和 `index.md`，已改为当前 `index.html + birthday-gift.js + scanner + events` 架构；历史方案继续保留在 `birthday-gift-page-design.md`，但明确是归档。

**验证结果**：
- [x] `npm.cmd run build` 构建成功
- [x] `public/birthday-gift/index.html` 中能找到 `给妈妈的生日礼物` 与 `.gift-heading`
- [x] 长期记忆新增文档与索引链接均指向当前实现

**注意事项**：
- 构建日志中仍会出现现有图片尺寸插件的 `no src attr, skipped...` 输出，来源是生日页大图预览器的空 `img` 占位符；本次构建最终成功。
- 本次未修改事件 Markdown 内容，也未回退工作区中用户已有的事件目录变更。

---

### #12 — 2026-05-07 — 生日页面滚动性能优化

**操作人**：AI 助手

**涉及文件**：

- 修改 `long-term-memory/02-custom-pages/birthday-gift-timeline.md` — 新增 L6 滚动性能优化方案，并绑定优化前基线 commit `7f4a6f9`
- 修改 `source/birthday-gift/index.html` — 收敛背景过渡、增加合成/绘制边界、暂停离屏动画与切换期装饰动画、补充 Safari/iOS `backdrop-filter` 前缀与移动端降级
- 修改 `source/js/birthday-gift.js` — 缓存 panels/backgrounds/dots 节点、切换时只更新前后两个索引、过渡期间暂停流星帧、背景/图片预加载去重

**操作详情**：

1. **基线提交**：开始优化前按用户要求先提交当前工作区，基线 commit 为 `7f4a6f9`，用于后续对照滚动性能改动。
2. **切换期间降负载**：整屏切换开始时给 `.birthday-app` 增加 `is-transitioning` 状态，暂停中央光带火花、底部提示和流星 Canvas 帧，切换完成后恢复。
3. **离屏动画暂停**：无媒体事件的 `.memory-orbit` 默认暂停，仅当前 `.memory-panel.is-active` 运行动画，避免隐藏事件页持续消耗绘制资源。
4. **DOM 查询缓存**：页面渲染完成后缓存动态节点数组，`setActiveEvent()` 只切换上一页和当前页的 class / aria 状态，不再每次滚动全量查询。
5. **预加载去重**：新增 `preloadedImages` 与 `imagePreloads`，背景和缩略图预加载复用同一 Promise，避免反复创建 `Image` 与重复解码。
6. **CSS 合成边界收敛**：保留原有背景虚化视觉，但移除 `filter` 过渡；为背景层、轨道和面板增加 `contain` / `backface-visibility` / `translateZ(0)`，降低重绘扩散。

**验证结果**：

- [x] `node --check source/js/birthday-gift.js` 通过
- [x] `node --check scripts/birthday-gift-scanner.js` 通过
- [x] `npm.cmd run clean && npm.cmd run build` 构建成功，输出 `1933 files generated in 5.57 s`

**Git commit**：

- 优化前基线：`7f4a6f9`
- 滚动性能优化实现：`7e267fe`

**注意事项**：

- 本次优先做幕后性能治理，没有改动生日页事件文案、事件目录结构或主要视觉方向。
- `01-childhood/01.jpg` 仍同时作为缩略图与原图使用；如果后续仍感觉首屏或相册入口卡顿，可再补一张更小的 `thumb-*` 缩略图作为资源层优化。

---

### #13 — 2026-05-10 — WebP 转换覆盖生日页面图片

**操作人**：AI 助手

**涉及文件**：

- 修改 `tools/convert-to-webp.ps1` — 将 `birthday-gift` 加入 source 图片扫描目录
- 修改 `tools/update-markdown-images.ps1` — 将 Markdown front matter 的 `background` 字段纳入 WebP 引用同步
- 修改 `long-term-memory/03-api-practices/webp-conversion.md` — 同步 WebP 工作流文档中的扫描范围与生日页说明
- 修改 `long-term-memory/04-operations/operation-log.md` — 记录本次脚本范围变更

**操作详情**：

1. 根据生日页面当前实现文档，生日页图片位于 `source/birthday-gift/imgs/` 与 `source/birthday-gift/events/*/`。
2. 将 `birthday-gift` 加入 `tools/convert-to-webp.ps1` 的 `$directories` 列表，使 `npm run webp` 后续会递归处理生日页下的 `.png/.jpg/.jpeg/.gif` 图片。
3. 将 `background` 加入 `tools/update-markdown-images.ps1` 的 Markdown front matter 字段列表，使事件背景图转为 WebP 后路径能同步更新。
4. 未直接执行 `npm run webp`，因为转换脚本成功后会删除源图；本次仅调整覆盖范围并做非破坏性验证。

**验证结果**：

- [x] PowerShell 语法解析通过：`tools/convert-to-webp.ps1`
- [x] PowerShell 语法解析通过：`tools/update-markdown-images.ps1`
- [x] 本次未直接执行 `npm.cmd run webp`，避免在未确认源图已纳入 git 前触发源图删除

---

### #14 — 2026-05-19 — 修复 update-markdown-images.sh Markdown 图片引用丢失扩展名

**操作人**：AI 助手（Claude Code）

**涉及文件**：
- 修改 `tools/update-markdown-images.sh` — 修复 Markdown `![]()` 图片引用替换逻辑的两个 bug
- 修改 `source/_posts/最优化理论期末复习.md` — 修复被 bug 损坏的图片引用

**操作详情**：

1. **Bug 1 — 扩展名被删除未补充**：Perl 替换逻辑中，正则 `s{\[([^\]]*)\]\(([^)]*?)(\.ext)\)}` 将扩展名单独捕获到 `$3`，路径部分（不含扩展名）捕获到 `$2`。但替换代码对 `$2` 执行 `s/(\.ext)$/.webp/`，此时 `$2` 已不含扩展名，替换为 no-op，导致最终输出缺少扩展名（如 `![2](path/2)` 而非 `![2](path/2.webp)`）。
   
   **修复**：改为直接拼接 `.webp` 到 `$2`（与 HTML `src` 替换逻辑一致）。

2. **Bug 2 — 内层正则破坏 `$1` 捕获**：Perl 的 `$1` 变量是动态作用域。替换代码中的 `if ($p =~ /^(https?:|data:|\/\/)/)` 内层正则匹配成功后，`$1` 被覆盖为 `https:`，导致最终输出的 alt 文本变成 `https:` 而非原始 alt。
   
   **修复**：在 eval 代码开头立即将 `$1` 保存到 `my $alt`，后续引用 `$alt` 而非 `$1`。

3. 修复 `source/_posts/最优化理论期末复习.md` 中被 Bug 1 损坏的引用：`![2](最优化理论期末复习/2)` → `![2](最优化理论期末复习/2.webp)`

**验证结果**：
- [x] Perl 正则测试通过（本地路径、远程 URL、排除域名三种场景）
- [x] bash 语法检查通过
- [x] 全仓库无其他被 bug 损坏的引用

**Git commit**：`02f2194`

---

### #15 — 2026-05-19 — 修复 update-markdown-images 配置文件正则漏掉 load_image 字段

**操作人**：AI 助手（Claude Code）

**涉及文件**：
- 修改 `tools/update-markdown-images.sh` — 配置文件正则添加 `load_image`
- 修改 `tools/update-markdown-images.ps1` — 同上
- 修改 `_config.butterfly.yml` — `load_image: /img/loadImg.jpg` → `load_image: /img/loadImg.webp`

**操作详情**：

`themes/butterfly/source/img/loadImg.webp` 是自定义头像框背景图（preloader 加载图），webp 转换后源 `.jpg` 已被删除。但 `update-markdown-images` 脚本的两版实现中，**Markdown front matter 正则**包含 `load_image`，**配置文件正则**却漏了它。导致 `_config.butterfly.yml` 的 `load_image: /img/loadImg.jpg` 从未被更新为 `.webp`，preloader 加载时 404。

**修复**：`.sh` 和 `.ps1` 的配置文件正则均添加 `load_image`，与 Markdown front matter 正则保持一致。

**验证结果**：
- [x] bash 语法检查通过
- [x] pwsh 语法检查通过
- [x] `_config.butterfly.yml` 引用已修正为 `.webp`

### #15 附加 — 修复 styles.css 中两处硬编码的图片引用

**涉及文件**：
- 修改 `themes/butterfly/source/css/styles.css` — 2 处 `url()` 引用 `.jpg` → `.webp`

**操作详情**：

`styles.css` 中 `#aside-content .card-info.card-widget::before`（头像卡片背景）和 `::before`（滚动区域背景）两个伪元素的 `background-image: url()` 分别引用 `loadImg.jpg` 和 `scrollImg.jpg`。CSS 文件不在 webp 脚本扫描范围，两个 `.jpg` 源文件已被删除，引用未更新。

**Git commit**：`35d5522`（合并于 load_image 修复）


### #23 — 2026-06-01 — Twikoo 前端版本升级 1.6.41 → 1.7.11

**操作人**：AI 助手（Codex）
**触发原因**：用户将 Twikoo 后端（Netlify Function）升级至 1.7.11，根据官方文档要求同步更新前端 CDN 版本号。

**涉及文件**：
-  — 从 jsDelivr CDN 下载 1.7.11 版（467KB → 938KB）替换旧版
-  — Twikoo 版本号： → 
-  — 行内注释标注版本和 CDN 来源
-  — 更新版本号和文件路径
-  — 更新版本号和文件路径
-  — 技术栈表格标注版本号
-  — 更新当前日期

**操作详情**：
1. 从 jsDelivr 下载 
2. 替换  为更新版本
3. 同步更新  中 Twikoo registry 版本
4. 更新  中 CDN option 的版本注释
5. 将长期记忆文档中的 Twikoo 引用统一更新（版本号 + 路径修正： → ）

**验证结果**：
- [x] 前端 twikoo.js 文件已替换为 1.7.11 版本
- [x] 配置文件版本号已同步
- [x] 长期记忆文档已更新
- [ ] 需构建部署后验证评论区正常工作

**对使用者的说明**：
- Twikoo 前后端版本必须保持一致，否则可能发生 API 不兼容
- 后续升级流程：1) 更新后端 Netlify Function → 2) 下载对应版本前端 JS → 3) 替换本地文件 → 4) 更新 plugins.yml → 5) hexo clean && hexo g && hexo d

---

### #24 — 2026-06-30 — 补充 Markdown 内嵌 HTML 渲染规范

**操作人**：AI 助手（ZCode）

**触发原因**：`Long-termMemoryTemplate.md` 中插入仓库卡片时，外层 `<div>` 内部的嵌套 `<div>` 之间存在空行断层，导致 `kramed` 将中后段 `<div>` 结构识别为代码块，页面出现灰色源码块和异常空白。

**涉及文件**：
- 新建 `long-term-memory/03-api-practices/markdown-html-embedding.md` — Markdown 内嵌 HTML 渲染规范
- 修改 `long-term-memory/03-api-practices/README.md` — 增加内容渲染与文章内嵌规范索引
- 修改 `long-term-memory/00-index/README.md` — 增加内容创作技术速查入口
- 修改 `long-term-memory/MEMORY.md` — 增加内容渲染专题入口

**操作详情**：
1. 将 HTML 卡片异常渲染的根因沉淀为长期记忆：`kramed` 对外层 HTML 块内部的空行断层和缩进较敏感。
2. 规范化写法：CSS 可独立保留；HTML 主体可以正常换行，但外层 `<div>` 内部的子元素之间不要留空行；高风险或已异常时再压缩为连续结构。
3. 补充 class 前缀隔离、深色模式、移动端适配、外链安全属性、排查流程等规则。
4. 按渐进式索引维护：根索引只放入口，详细规则下沉到 `03-api-practices/markdown-html-embedding.md`。

**验证结果**：
- [x] 新规范文档已创建
- [x] `MEMORY.md`、`00-index/README.md`、`03-api-practices/README.md` 已同步索引
- [ ] 需用户本地预览确认 `Long-termMemoryTemplate.md` HTML 卡片渲染效果

---

### #25 — 2026-07-10 — P0 首页瀑布流响应式重写

**操作人**：AI 助手（Claude Code）

**涉及文件**：
- `themes/butterfly/source/js/waterfall.js` — 重写桌面 masonry、移动单列、重排及清理逻辑
- `themes/butterfly/source/css/styles.css` — 删除移动端属性选择器看门狗和已废弃 `fade-in` 动画，保留原有视觉规则
- `long-term-memory/04-operations/2026-07-10-waterfall-rewrite/README.md` — 记录备份基线、验收矩阵和实际验证
- `long-term-memory/06-theme-modifications/README.md` — 记录主题定制变更
- `long-term-memory/MEMORY.md` — 加入操作记录入口

**操作详情**：

1. 在任何源码改动前，提交并推送渲染性能审计基线：`69772c847d46b251eafa028394b6f1ebef291b68`（短哈希 `69772c8`）。实施完成后，用户明确授权同步源码，最终实现提交 `9988ac47bedde1380938f44b82dcde34aec80b6f`（短哈希 `9988ac4`）已推送并核验到 `origin/master`。
2. 移除旧移动端的 100ms 全量 DOM 轮询、`MutationObserver`、生产日志、捕获式 click/touch/scroll/resize 监听、固定等待/超时、运行时 CSS 注入和批量 `style.cssText` 重写。
3. 新控制器在桌面端基于容器宽度定位卡片：大屏最多三列，中等屏两列，卡片宽度小于 220px 时自动降低列数；窄屏由 CSS 单列流式布局承担，不进行 masonry 绝对定位。
4. 通过容器/卡片 `ResizeObserver`、媒体查询变化和封面图片 load/error 触发请求重排；同一帧只运行一次 `requestAnimationFrame` 布局。未来若启用 PJAX，可通过 `pjax:send` 销毁，`pjax:complete` 重建。
5. 仅写入并在销毁时移除控制器自己的坐标/尺寸样式，避免旧实现清空整个 `style` 属性的副作用。

**验证结果**：

- [x] `node --check themes/butterfly/source/js/waterfall.js` 通过
- [x] `waterfall-homepage.styl` 独立编译通过
- [x] `npm run build` 成功，最终输出 121 个文件；未执行 WebP 转换和部署
- [x] 生成的首页加载 `/js/waterfall.js`，生成 JS/CSS 可访问且脚本语法通过
- [x] 基于生成首页 15 张卡片的 jsdom harness：验证 1440px 三列、1024px 两列、375px 一列、图片 load 单帧合并重排、容器/卡片 observer、无轮询和 PJAX teardown
- [x] 本地 `http://localhost:4000/` 返回 HTTP 200，并可提供首页、瀑布流脚本和 CSS
- [ ] 真实浏览器的人工视觉回归、设备旋转及优化前后 Performance 对比仍待完成

**远程仓库状态**：优化前备份基线 `69772c8` 和最终实现 `9988ac4` 均已存在于 `origin/master` 历史；当前远程分支指向实现提交 `9988ac4`。

---

### #26 — 2026-07-10 — 首页瀑布流浏览器性能测量与最终 A/B 验证

**操作人**：AI 助手（Claude Code）

**涉及文件**：
- `tools/benchmark-waterfall.js` — 本地 Chrome DevTools Protocol A/B 自动采集器；仅本地运行，不被网站加载
- `MEASUREMENT-PLAN.md` — 指标定义、复现实验命令、DevTools 手工复测步骤和结论边界
- `source/_posts/首页瀑布流性能优化记录.md` — 使用 `hexo new` 创建的更新说明文章；按既有技术文章风格讲解重写、前端知识点、三断点数据与测试边界；构建生成 `/2026/07/11/首页瀑布流性能优化记录/`
- `long-term-memory/04-operations/2026-07-10-waterfall-rewrite/BROWSER-PERFORMANCE-MEASUREMENTS.md` — 表格化归档静态对照、三断点实测、环境、原始产物策略和验收边界
- `long-term-memory/04-operations/2026-07-10-waterfall-rewrite/README.md`、`long-term-memory/06-theme-modifications/README.md`、`long-term-memory/MEMORY.md`、性能审计 README — 同步本地三断点完成状态和目标设备待测边界

**操作详情**：

1. 为基线 `69772c8` 和实现 `9988ac4` 分别生成独立 `public/` 静态产物，用两个本地 HTTP 服务器提供；每轮启动独立临时 Chrome profile 并禁用 HTTP 缓存，不访问生产站、不部署、不推送。
2. 采集器通过 Chrome DevTools Protocol 收集 `TaskDuration`、`ScriptDuration`、`LayoutDuration`、`RecalcStyleDuration`、Long Task、布局断言及只匹配 `waterfall.js` 调用栈的 interval / `cssText` / console / observer 专项计数；原始 trace 和 JSON 写入系统临时目录，不纳入 Git。
3. 最终使用两个固定提交的独立 worktree 产物完成完整矩阵：375×812 / DPR 2、1024×900 / DPR 1、1440×900 / DPR 1；每个版本 / 断点均运行 3 次、15 秒空闲和 15 秒受控滚动。移动端最终旧实现的中位数为 150 次 interval tick、14,352 次滚动 `cssText` 整体写入、81,643 次调试调用 / 15 秒，而当前对应计数均为 0；最终移动端滚动 `ScriptDuration` 降低 85.3%，整页 `TaskDuration` 基本持平（-1.9%），不能将全页面聚合指标夸大为瀑布流的固定收益。平板保持两列、桌面保持三列，当前版在最终布局核验中均无重叠且分页位于卡片后方。
4. 在测量和文档记录完成后，按用户要求通过 `npx hexo new "首页瀑布流性能优化记录"` 创建新博文，并使用已有标签 `hexo博客搭建`、`主题美化`、`技术向`、`JS`、`CSS`。文章说明旧轮询模型、CSS/JS 职责拆分、`ResizeObserver`、`requestAnimationFrame` 合并、最小样式所有权、销毁路径及量化边界；Front Matter 与既有标签均已脚本核验。

**验证结果**：

- [x] `node --check tools/benchmark-waterfall.js` 通过；重复运行的临时 Chrome profile 清理路径通过冒烟验证
- [x] 三断点 A/B：375px 单列、1024px 两列、1440px 三列；当前实现和最终布局核验均无几何重叠、分页位于卡片后方
- [x] 移动端 A/B：当前测量窗口内旧 10Hz 轮询、滚动 `cssText` 整体覆写、调试输出均为 0
- [x] 平板与桌面 A/B：旧移动看门狗专项计数在两版均为 0；当前实现保持布局正确，性能结果及边界已归档
- [ ] 目标设备有头浏览器的真实触摸、旋转、深浅色、GPU / 温度 / 风扇与视觉回归仍待完成

**遗留问题**：

- Headless Chrome 的主线程数据不能替代生产网络、真实触摸、GPU 合成或硬件热量结论；报告只对记录的浏览器、视口、时长和统计方式负责。
- 首次移动端测量曾使用含未提交公告文字更新的主工作区产物；最终完整矩阵已经改用固定 `69772c8` / `9988ac4` 独立 worktree 产物，故以最终矩阵结果为准。

---

### #27 — 2026-07-11 — P1 分层星空动效实验、归档与运行时回退

**操作人**：AI 助手（Claude Code）

**涉及文件**：

- `themes/butterfly/source/js/header-universe.js`、`themes/butterfly/source/css/universe.css`、`themes/butterfly/source/css/styles.css`、`themes/butterfly/layout/includes/head.pug`、`_config.butterfly.yml` — 曾用于 P1 单 RAF 实验，现已恢复为基线运行时版本
- `long-term-memory/04-operations/2026-07-11-starfield-p1/source-snapshots/` — P1 关键 JS、CSS、模板、配置和本地 benchmark 工具的非执行快照与 SHA-256
- `long-term-memory/04-operations/2026-07-11-starfield-p1/README.md`、`03-api-practices/universe-background.md`、主题修改/性能审计/问题清单/索引 — 留存实验、测量边界与实际回退事实

**操作详情**：

1. 在开始代码修改前创建并推送 P1 回滚基线 `049f08d60827ca25f13b1ced18802f94076ee626`；该提交为显式空提交锚点，确认后续实验、回退与归档均不推送、重写远程或部署。
2. 实验阶段将原有独立的 `universe-optimized.js` 背景 RAF 和 `header-universe.js` header RAF 收敛为一个 `StarfieldController`，并迭代了渐变星点、离散平行流星拖尾、三档预算、移动端禁流星、平板 30fps 与桌面 36fps 等方案。
3. 使用两个独立本地静态产物、独立临时 Chrome profile、禁用 cache，完成 375×812 / DPR 2、1024×900 / DPR 1、1440×900 / DPR 1 的实验 A/B；每版本/视口三次中位数，可见 header、离屏 header、reduced-motion 均观察 10 秒。后续视觉参数有修改，基础 A/B 不应被视为最终参数的性能结论。
4. 用户视觉验收后明确认为效果不理想，要求回到初始基点，但保留本轮长期记忆和源码。已将 P1 关键源码、配置、模板和 benchmark 复制到 `source-snapshots/`，并记录 SHA-256；快照位于 `long-term-memory/`，不会参与 Hexo 构建或浏览器加载。
5. 已精确将实际星空运行时的 5 个文件恢复为基线 `049f08d`，恢复旧 `universe-optimized.js` 注入与原 header 脚本；根目录的 `tools/benchmark-starfield.js` 已删除，归档副本仍保留。没有执行 `git reset --hard`、远程推送或部署。

**验证结果**：

- [x] P1 实验阶段：`node --check themes/butterfly/source/js/header-universe.js`、`node --check tools/benchmark-starfield.js`、`git diff --check` 与当时的 `npm run build` 均通过；A/B 数据与边界见详细文档。
- [x] 已归档 P1 源码、配置、模板和 benchmark 工具；快照包含 SHA-256，且不在 Hexo 可加载资源路径。
- [x] 回退后：5 个实际星空运行时文件与 `049f08d` 精确一致；根目录 benchmark 已删除、归档副本仍存在。
- [x] 回退后：`node --check themes/butterfly/source/js/header-universe.js` 与 `git diff --check` 通过。
- [x] 无远程推送、无部署、无破坏性 `git reset`。

**结论与后续**：

- P1 为已归档但未采纳的实验，不应再把单 RAF、三类新星体、20/30/36fps 或 Headless A/B 写为当前站点实现。
- 当前站点回到原有双 Canvas / 双 RAF 星空效果；未来如再优化，应基于归档建立新的完整方案和真实视觉验收，不应零散恢复其中某个脚本或配置。

---

### #28 — 2026-07-11 — P2 失效请求修复、资源审计与本地量化

**操作人**：AI 助手（Claude Code）

**回滚基点**：`8863b704ab99f792cd10bd97fcb5651aa68cecec`（开始 P2 代码修改前已推送至 `origin/master`）。基点推送后，本轮未再推送、部署、强推或进行远程写操作。

**涉及文件**：

- `_config.butterfly.yml` — 关闭未使用 Mermaid，修正全局 fallback 和默认页头图的 WebP 路径
- `source/_data/link.yml`、`source/_posts/“HongXiaoYi”.md` — 修正已存在同名 WebP 的友链/文章友链头像
- `source/_posts/yiDuo.md`、`source/_posts/OpenSourceSummer2025.md` — 修正全角 Markdown 感叹号与已存在 post asset 的图像/视频引用
- `source/MarkdownPreview/index.md`、`source/MarkdownPreview/index-backup-original.md` — 修正已验证 404 的演示图 URL
- `tools/audit-resource-requests.js` — 新增生成态本地/外部资源审计工具，默认报告写入系统临时目录
- `tools/verify-resource-requests.js` — 新增临时本地 server + Headless Chrome 代表页网络/DOM 验证工具，默认报告写入系统临时目录
- `long-term-memory/04-operations/2026-07-11-invalid-request-p2/README.md` 及相关索引/审计/问题文档 — 记录事实、范围、指标、遗留项和回滚边界

**操作详情**：

1. 在 182 个现有生成 HTML 页中审计根相对与直接外部媒体请求，基线发现 Mermaid `mermaid@undefined` 出现在 178 页；旧 GIF/JPG fallback 声明共 1,836 次；同时发现默认页头 `bg2.png`、友链头像、文章友链头像、Markdown 语法和 post asset 引用等可安全修复的问题。
2. 当前源码没有 Mermaid fence 或 `{% mermaid %}` 内容，因此关闭 Mermaid 不会删除实际图表；未来引入 Mermaid 时必须使用固定有效版本并按页面内容加载。
3. 仅修改已存在同源资源的扩展名/路径，或修复能从现有 post asset folder 确认的引用；没有猜测替换 7 张 GitHub Raw 正文图、1 张 LeetCode 正文图，也没有改写外部 `img.picui.cn` 头像。
4. 由于 post asset folder 对 Markdown 图片和裸 HTML `source src` 的处理不同，保留实际已验证可解析的文章相对 `22.mp4`，并将错误的 `22.webp` 改为同一真实 MP4 的视频元素。
5. 构建后以同一工具重新扫描，并使用临时 server + 隔离 Headless Chrome profile 检查首页、友链、yiDuo、HongXiaoYi、OpenSourceSummer2025、MarkdownPreview；测试产物全部写入 `/tmp`，不纳入仓库。

**验证结果**：

- [x] `npm run build` 成功，生成 182 个文件；允许更新的 `source/coffer/private-posts.json` 没有产生工作区差异
- [x] `node --check tools/audit-resource-requests.js`、`node --check tools/verify-resource-requests.js`、YAML parser 与 `git diff --check` 均通过
- [x] 生成态本地缺失资源：16 个唯一目标 / 1,850 次引用 → **0 / 0**
- [x] Mermaid `@undefined`：178 页请求 → **0**
- [x] 外部失败/不可达媒体：12 个目标 / 369 次引用 → **9 / 9**；减少的 3 个目标为 Mermaid 和 MarkdownPreview `.webp`，剩余 9 个明确记录为外部原图遗留项
- [x] 最终 Headless Chrome 代表页：禁止旧 URL DOM 0、禁止旧 URL 请求 0、浏览器 HTTP ≥400 0、本地加载失败 0
- [x] 不部署，不推送 P2 实现，不修改远程

**遗留问题**：

- 7 张 GitHub Raw 正文图和 1 张 LeetCode 正文图仍返回 HTTP 404，当前仓库及历史没有原文件；需日后从可信原始备份恢复或由作者提供替代图。
- `img.picui.cn` 友链头像探测时连接失败；这不足以断言永久失效，未做猜测性替换。
- 外部网络结果只对当前设备、网络和测试时刻负责；详情、报告路径和严格口径见 [P2 记录](2026-07-11-invalid-request-p2/README.md)。

---

### #29 — 2026-07-11 — 文章懒加载降载与目录媒体重锚定（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程备份基线**：`bb93da827265b25bf3af05e342b9793419452b88`（`feat: 归档失效请求优化与复盘`）。该提交已推送到 `origin/master`，并在实施前确认本地/远程均为同一 SHA、双向提交差 `0 / 0`。此后本轮严格不推送、不部署、不强推、不修改远程。

**涉及文件**：

- `themes/butterfly/source/js/lazy-loading-optimized.js` — 由 1×1 GIF 替换/独立预加载改为原生 lazy 协调、近视口状态与媒体结算事件
- `themes/butterfly/source/css/lazy-loading-optimized.css` — 静态占位与近视口 shimmer，移除全篇高代价动画路径
- `themes/butterfly/source/js/main.js` — 桌面/移动 TOC 共用可取消的媒体结算/ResizeObserver 重锚定事务
- `themes/butterfly/layout/includes/head.pug` — 仅文章页加载新状态样式，停止加载旧全站占位 CSS
- `tools/audit-article-layout-stability.js`、`tools/verify-toc-navigation.js` — 新增生成态尺寸审计和延迟图片目录导航验证
- `long-term-memory/04-operations/2026-07-11-article-layout-stability/README.md`、懒加载/性能/主题修改/已知问题索引 — 更新当前事实和验证边界

**操作详情**：

1. 审计确认：构建期 `image-dimensions.js` 能为本地文章资源提供 `width`/`height`，但外部图片没有可验证内在尺寸；原有自定义脚本随后把图片 `src` 改为 1×1 GIF，且旧 CSS 对全文 placeholder 施加无限动画。
2. 原 TOC click handler 保留了对已删除 `window.lazyLoadPreload` 的 `typeof` 守卫，实际运行直接在下一帧只定位一次；图片在目标之前晚到后，标题绝对位置改变，桌面和移动目录均会发生最终偏移。
3. 新实现保留真实 `src` 与浏览器原生 `loading="lazy"`，运行时仅观察近视口图片并追踪 `load/error`；动态 shimmer 只在近视口 placeholder 生效，移动和 reduced-motion 下禁用。
4. TOC 点击初次滚动后会监听文章图片结算与容器尺寸变化，用 RAF 合并重算目标位置；新点击、用户滚轮/触摸/滚动键或 3.5 秒时限都会停止事务，避免抢占用户滚动或无限等待外部资源。
5. 未为 97 张外部图和 5 个 data URI 猜测比例；这类媒体仍是普通阅读 CLS 的诚实边界，但其对目录最终落点的影响已通过有限重锚定收敛。

**验证结果**：

- [x] `node --check`：修改/新增的文章懒加载、主题主脚本和两项验证工具均通过
- [x] `npm run build` 成功，生成 186 个 HTML、17 个 CSS
- [x] `git diff --check` 通过
- [x] 生成态资源审计：本地缺失目标 / 引用仍为 **0 / 0**
- [x] 文章尺寸审计：59 个文章页、1,596 张正文图；1,494 张有完整内在尺寸，缺少尺寸的 102 张均为 97 个外部图或 5 个 data URI
- [x] `OpenSourceSummer2025` 在 1440×900 / 375×812、每张本地图 400ms 延迟下，远距离 TOC 目标最终误差分别为 **0.500px / 0.344px**
- [x] `ToTheApril2025` 同条件下最终误差分别为 **0.219px / 0.125px**
- [x] 另向 `OpenSourceSummer2025` 目标前注入 240px、700ms 后发生的受控布局变化：桌面 / 移动最终误差为 **0.500px / 0.156px**
- [x] 4 组均低于 ≤3px 验收阈值；无远程写入、无部署

**遗留问题**：

- 外部图片和 data URI 无法在构建期安全获取尺寸，普通滚动阅读仍可能出现其自身导致的布局变化；应等待可信原图备份或作者提供尺寸，禁止自动抓取/猜测。
- 浏览器验证使用本地 loopback 静态服务与 Headless Chrome 的受控延迟；真实外部 CDN、弱网和有头实机仍建议在后续发布前回归。

---

### #30 — 2026-07-11 — 更新侧栏公告：同步近期性能、资源与阅读稳定性优化

**操作人**：AI 助手（Claude Code）

**涉及文件**：

- `_config.butterfly.yml` — 更新 `aside.card_announcement.content`

**操作详情**：

将侧栏公告从仅说明首页瀑布流重写，更新为近期优化摘要：响应式瀑布流、失效资源请求治理、文章原生懒加载/近视口占位，以及媒体晚到时的目录重锚定；保留原有公告 GIF，并添加祝愿读者阅读顺畅、探索愉快的结语。

**验证结果**：

- [x] YAML 字符串保持单行 HTML 内容，未引入新资源 URL
- [x] 后续本地 `npm run build` 与生成态本地资源审计通过
- [x] 无远程写入、无部署

---

### #31 — 2026-07-12 — 修复文章图片比例拉伸回归（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：沿用 `bb93da8` 远程备份后的约束；本次不提交、不推送、不部署，也不执行任何远程写操作。

**涉及文件**：

- `themes/butterfly/source/css/lazy-loading-optimized.css` — 恢复文章图片 `height: auto`，并仅为无 `width`/`height` 的未知比例图片保留最小占位高度
- `tools/verify-toc-navigation.js` — 增加已加载且具备尺寸属性的正文图比例断言，作为 TOC 延迟媒体回归验证的一部分
- `long-term-memory/03-api-practices/lazy-loading-system.md`、`long-term-memory/04-operations/2026-07-11-article-layout-stability/README.md`、`long-term-memory/06-theme-modifications/README.md`、`long-term-memory/07-known-issues/README.md` — 同步根因、修复边界与验证口径

**操作详情**：

1. 用户反馈多张文章图片被异常拉伸；以 `OpenSourceSummer2025/78.webp` 复现：源图和生成属性为 `2559×1454`，在 1600px 宽度浏览器中宽度被 `max-width:100%` 缩至约 `781.80px`，高度却仍按 HTML `height` 属性显示为 `1454px`。
2. 根因不是运行时 lazy 协调器改写尺寸，而是 2026-07-11 停止加载旧 `lazy-loading-stable.css` 时，同时移除了其中隐含的文章图片 `height:auto` 保障；主题基础文章样式只保留 `max-width`。构建期写入尺寸属性后，受限宽度和未受限高度组合造成纵向拉伸。
3. 在当前文章专属样式入口恢复 `#article-container img { max-width:100%; height:auto; }`，保留构建期 `width`/`height`，因此不会牺牲原生 lazy 的预留空间或目录重锚定机制。
4. 占位/错误最小高度改为仅适用于同时缺少 `width` 与 `height` 的未知比例图片，避免窄小但已具备可信尺寸的图片被 `min-height` 二次拉伸。

**验证结果**：

- [x] 真实截图资源在浏览器中从约 `781.80×1454px` 恢复为约 `781.80×444.20px`，与 `2559:1454` 原始比例一致
- [x] `npm run build` 成功（未执行会删除生成态的 `npm run clean`）
- [x] 文章尺寸审计保持：59 个文章页、1,596 张正文图、1,494 张完整本地尺寸；无可信尺寸的 97 个外部图和 5 个 data URI 边界不变
- [x] 生成态本地资源审计：**0** 个缺失目标、**0** 次缺失引用
- [x] `OpenSourceSummer2025` 注入 240px 延迟布局变化并延迟图片 400ms：桌面最终目录偏移 **0.125px**、移动端 **0.297px**；两端已加载带尺寸正文图比例错误均为 **0**
- [x] JS 语法检查与 `git diff --check` 通过；无远程写入、无部署

**遗留问题**：

- 没有可信内在尺寸的外部图片和 data URI 仍可能在普通阅读中改变布局；本次不猜测或伪造比例。
- Headless 验证覆盖本地 loopback、受控延迟与桌面/移动断点；上线前仍宜在有头浏览器、弱网和真实外部 CDN 条件下人工回归。

---

### #32 — 2026-07-12 — DOM 就绪退出全屏预加载器，并将双层星空限于首页（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：沿用 `bb93da8` 远程备份后的约束；本次不提交、不推送、不部署，也不执行任何远程写操作。

**涉及文件**：

- `themes/butterfly/layout/includes/loading/load_style/spincat.pug` — 初次预加载由 `DOMContentLoaded` 触发退出，并使退出/隐藏定时器幂等
- `themes/butterfly/layout/includes/head.pug` — `header-universe.js` 改为首页条件且 `defer` 加载
- `themes/butterfly/layout/includes/additional-js.pug` — 仅首页输出背景 `#universe` Canvas 和 `universe-optimized.js`
- `_config.butterfly.yml` — 移除全局 `inject.bottom` 中的背景 Canvas 与背景星空脚本
- `long-term-memory/03-api-practices/universe-background.md`、`long-term-memory/03-api-practices/performance-optimization.md`、`long-term-memory/06-theme-modifications/README.md`、`long-term-memory/MEMORY.md` — 同步当前架构、升级注意项与索引状态

**操作详情**：

1. 原 `spincat` 在初次访问时锁定 `body` 滚动，直到 `window.load` 或 10 秒兜底才退出；远程图片、视频和第三方资源都可延后可交互时间。本次改为 DOM 解析完成后在下一动画帧执行原有 `.loaded` 退场，保留 800ms 分屏/猫动画、未来 PJAX 钩子和隐藏页定时器。
2. `endLoading()` 现以 `isLoading` 防重，`initLoading()` 会取消旧隐藏定时器，避免重复 DOM ready、未来 PJAX 回调或重初始化造成多次退场/错误显示状态。
3. 原全站背景 Canvas/脚本来自 YAML `inject.bottom`，页头脚本来自无条件 `head.pug`，因此每个非首页路由也会初始化两套 30fps 星空。按用户要求保留现有双层视觉，但将两条入口同时限制到 `globalPageType === 'home'`：首页仍有全屏背景和页头封面星空；文章、About、归档、标签等路由不再输出 Canvas、加载脚本或产生星体/RAF。
4. 没有合并两条 RAF、修改粒子参数或恢复 2026-07-11 视觉未采纳的单控制器实验；`visibilitychange` 暂停、移动端降级、透明内容背景和首页瀑布流均保留。文章原生懒加载、图片比例保护和 TOC 重锚定完全未改动。

**验证结果**：

- [x] `node --check themes/butterfly/source/js/header-universe.js`、`node --check themes/butterfly/source/js/universe-optimized.js` 和 `git diff --check` 通过
- [x] `npm run build` 成功（未执行会删除生成态的 `npm run clean`）
- [x] 生成态 HTML 断言：首页各有 1 个 `#universe`、`universe-optimized.js`、`header-universe.js` 和 `waterfall.js`；代表文章、About、归档页面四项星空资源均为 0
- [x] 延迟本地 WebP 3 秒的隔离 Headless Chrome 验证：在页面仍为 `interactive`、`load` 尚未触发、已有 28 个延迟图片请求时，首页预加载器已进入 `.loaded`、滚动锁已释放；首页两层 Canvas 均初始化，代表文章不存在 Canvas/星空脚本
- [x] 本地资源审计：186 个 HTML、17 个 CSS、11,232 个本地引用、0 个缺失唯一目标、0 次缺失引用
- [x] `OpenSourceSummer2025` 保持 400ms 图片延迟与 240px 人工布局变化：桌面 TOC 最终误差 **0.46875px**、移动端 **0.296875px**；两端已加载带尺寸正文图比例错误均为 **0**
- [x] 无远程写入、无部署

**遗留问题**：

- 首页仍保留两条独立 30fps RAF；本次只消除非首页无效运行成本，未声称首页 CPU/GPU 成本已合并或在所有设备上量化下降。若后续再次尝试单控制器，必须建立独立视觉方案，不得直接复用已归档且未采纳的 P1 实验。
- `spincat` 的 800ms 退场视觉和外部猫精灵图仍保留；其真正网络外观需在有头浏览器、弱网及真实 CDN 条件下补充人工回归。

---

### #33 — 2026-07-15 — 将侧栏单期公告升级为可滚动历史时间轴（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：按用户本次明确授权，先创建 `feat/announcement-timeline` 并将修改前全部状态提交为 `13c3f5f`，仅执行一次 `git push -u origin feat/announcement-timeline`。该备份完成后不再执行 fetch、pull、push、远程删除、PR、部署或其他远程操作。

**涉及文件**：

- `source/_data/announcements.yml` — 公告正文和历史的唯一日常编辑入口，从本地 Git 恢复 16 期公告，并在后续追加第 17 期上线公告
- `_config.butterfly.yml` — 保留公告总开关、初始展示数、日期格式和旧 HTML 兜底
- `scripts/announcement-history-validator.js` — 构建期校验 ID、时间、倒序、正文和本地图片尺寸
- `themes/butterfly/layout/includes/widget/card_announcement.pug` — 结构化渲染当前公告、发布时间、历史 `<details>` 和时间轴
- `themes/butterfly/source/css/announcement-history.css`、`themes/butterfly/source/js/announcement-history.js` — 卡内纵向滚动样式及查看全部/收起交互
- `themes/butterfly/layout/includes/head.pug`、`themes/butterfly/layout/includes/additional-js.pug` — 加载公告专属 CSS/JS
- `themes/butterfly/source/css/styles.css` — 移除被新专属样式替代的旧公告图片规则
- `long-term-memory/03-api-practices/announcement-history.md` 及长期记忆/操作/主题索引 — 记录编写、架构、恢复、验证和升级边界

**操作详情**：

1. 调查确认 Butterfly 原实现直接以 `!=` 输出 `_config.butterfly.yml` 的单行 HTML，没有日期、历史或结构化数据；公告 partial 为全局缓存，适合站点级静态档案。
2. 从本地 Git 的 `_config.butterfly.yml` 恢复 `cf106d3` 至 `5c8d00a` 的 16 期真实公告和精确提交时间，过滤明显 `sshtest` 部署调试内容；同日真实文案修订分别保存。
3. 将现存 JPG/PNG/GIF 历史路径映射到本地 WebP；旧 `bu.dusays.com` URL 只保存在不渲染的 `archived_image_url`，未联网抓取，也不会让页面请求旧远程图。
4. 新模板以转义文本、`<time>`、`<ol>` 和 `<details>` 静态渲染。当前公告直接展开，其余历史按原生控件逐期打开；卡内时间轴设最大高度并纵向滚动。
5. 默认显示 3 期，其余 13 期由轻量脚本查看全部/收起；脚本支持 DOM ready、PJAX 幂等初始化。即使脚本失败，公告仍在 HTML 中且逐期 `<details>` 可读。
6. 校验器在 `before_generate` 一次性报告所有结构错误，并核对本地图真实宽高。日常新增只需将一个 YAML 条目插入文件顶部。

**验证结果**：

- [x] `node --check`：校验脚本和交互脚本均通过
- [x] `git diff --check` 通过
- [x] `npm run clean && npm run build` 成功，日志确认 17 期公告通过校验
- [x] 首页、归档页和代表文章页均生成 1 张公告卡、17 期公告
- [x] 当前公告 1 期、历史 `<details>` 16 期、初始隐藏 14 期；时间、当前正文、图片尺寸和原生 lazy 属性断言通过
- [x] `TZ=UTC` clean build 中仍按每条 ISO 时间自带的 `+08:00` 显示墙钟时间；无效日期、未知字段、外部图片、路径越界和非法交互配置均被校验器拒绝
- [x] 公告 CSS/JS 与 3 张本地历史图片均生成，公告输出没有 `bu.dusays.com` 图片请求
- [x] 系统 Chrome/CDP：1440px 与 375px 时间轴均形成卡内纵向滚动且无横向溢出；“查看全部”将隐藏项由 13 降到 0、同步更新 `aria-expanded`，历史 `<details>` 可打开；1024px 首页保持既有整侧栏隐藏
- [x] 未部署；一次性备份后没有任何远程操作

**遗留问题**：

- 项目未新增 Playwright/Puppeteer/jsdom 依赖；虽已用系统 Chrome/CDP 完成桌面/移动截图和鼠标点击验证，发布前仍需人工补充临界断点、仅键盘、暗色/阅读模式、真实 PJAX 与触摸实机回归。
- 首页 769–1024px 隐藏整个侧栏是现有瀑布流/移动覆盖规则的既有行为，本功能不擅自改变页面整体响应式设计。
- CSS reduced-motion 已停止喇叭摇动和过渡，但当前动画 WebP 自身不能由 CSS 停帧；需等可信静态 poster 后再用 `<picture>` 提供同画面替代。所有公告图已改为原生 lazy，避免侧栏离屏时无条件下载。
- WebP 引用更新工具不扫描 `source/_data/*.yml`，新增公告图必须直接填写最终 `.webp` 路径。

---

### #36 — 2026-07-16 — 修复入场随机文字弹窗拦截页面输入（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：本次任务开始前，既有差异已按用户明确授权提交并推送为 `3eab004`。此后用户明确要求绝对禁止远程操作；本次修复仅在本地进行，不提交、不推送、不部署。

**涉及文件**：

- `themes/butterfly/source/css/entrance-popup.css` — 保持显示态全屏容器穿透，仅让弹窗卡片接收输入
- `long-term-memory/06-theme-modifications/README.md` — 记录主题级修改、成因和回滚影响
- `long-term-memory/04-operations/operation-log.md` — 记录本次本地操作和验证

**操作详情**：

1. 定位随机文案入场弹窗：全局 DOM 在 `layout/includes/layout.pug`，随机文本、自动关闭和关闭按钮逻辑在 `source/js/entrance-popup.js`，内容及显示配置在 `source/js/entrance-popup-config.js`。
2. 确认根因：`.entrance-popup` 是 `z-index: 10001` 的固定全视口容器；显示态将其由默认的 `pointer-events: none` 改为 `pointer-events: auto`，透明遮罩虽然不可命中，父容器仍会覆盖并拦截页面输入。
3. 将 `.entrance-popup.show` 的 `pointer-events` 保持为 `none`。已有 `.popup-content { pointer-events: auto; }` 继续使弹窗卡片和关闭按钮可点击，卡片外的区域会将鼠标、触摸和滚动交给下方页面。

**验证结果**：

- [x] `git diff --check` 通过；CSS 断言确认显示态根容器为 `pointer-events: none`，弹窗卡片为 `pointer-events: auto`
- [x] `npm run build` 成功，公告历史校验通过并生成 125 个文件
- [x] 本地 Chrome/CDP 回归：弹窗显示时，卡片外命中下层页面，卡片与关闭按钮仍可接收指针输入
- [ ] 真实移动设备的触摸滚动回归待后续人工确认
- [x] 不执行远程操作；不部署

**遗留问题**：

- 关闭控件当前为 `span`，不是原生 `button`；本次仅修复输入穿透，不改变既有 DOM 或可访问性语义，后续可独立评估键盘焦点与无障碍改造。

---

### #37 — 2026-07-16 — 重构“昨日重现”图库懒加载与双向浮现（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：继续遵守用户在 `3eab004` 推送后的绝对禁止远程操作要求；本次没有 fetch、pull、push、deploy 或其他远程交互。

**涉及文件**：

- `source/swiper/index.md`、`source/swiper/README.md` — 精简页面语义结构并重写维护说明
- `scripts/auto-image-list.js` — 生成包含尺寸、字节和内容版本的 v2 manifest
- `themes/butterfly/source/css/yesterday-gallery.css`、`themes/butterfly/source/js/yesterday-gallery.js` — 独立图库视觉、瀑布流、双 observer、随机顺序和统一加载队列
- `themes/butterfly/source/js/lazy-loading-optimized.js` — 排除图库托管图片
- `themes/butterfly/source/js/lightbox-enhanced.js` — managed gallery、窗口化数字缩略导航和 overflow 恢复
- `themes/butterfly/layout/includes/head.pug`、`themes/butterfly/layout/includes/additional-js.pug` — 目标页面条件资源入口
- `tools/optimize-gallery-images.js`、`package.json`、`.gitignore` — 可配置且默认非破坏的 WebP 压缩工具
- `long-term-memory/06-theme-modifications/README.md`、本日志 — 记录架构、验证、升级和远程边界

**操作详情**：

1. 删除 `source/swiper/index.md` 中约 1900 行内联实现：不再全量递归下载 292 张图片，不再执行前 10 张/下一批独立预加载，不再使用 IndexedDB Blob 双缓存、10 秒缓存统计、批次超时、5 秒 observer 自检或焦点恢复重绑。
2. 构建器读取每张图片的宽高、字节数和 SHA-256 前 16 位，输出稳定 `catalogRevision`。客户端以普通同源 URL 加内容版本查询参数，依赖 HTTP 缓存而不是网页无法准确清除的浏览器缓存。
3. 初始只创建有固定尺寸的空卡片。JS masonry 在任何图片请求前计算两列位置和总高度，ResizeObserver 只在容器宽度变化时重排；小于 360px 降为单列。
4. 近视口 observer 上下对称触发统一队列；当前移动/触屏默认并发 2，快速桌面 3，Save-Data/2G 1。离开预取区且未启动的任务回到 idle；已开始请求不因滚动取消，避免重复下载。
5. 严格视口 observer 不使用定时器：正面积交叠即浮现，完全离开即隐藏，回到视口再次浮现；从顶部和底部进入采用相反初始位移。reduced-motion 保留显隐但取消位移和持续动画。
6. 使用当前标签页 `sessionStorage` 保持一次无偏随机顺序；重排按钮明确只重置本次顺序和加载状态，不再称为“清除图片缓存”，也不刷新页面。
7. 灯箱接收图库随机序列，当前图请求也通过统一队列，只渲染 5 个无图片数字导航项；避免旧实现打开灯箱时一次请求全部 292 个缩略图。文章全局懒加载明确排除图库托管图片。
8. 新压缩工具支持 quality、max-edge、method、WebP 重编码、dry-run 和显式 in-place；默认输出到被 Git 忽略且不参与 manifest 的 `.gallery-optimization-preview/`。原地写入会拒绝同 basename 目标碰撞，尺寸缩放优先满足 max-edge。

**验证结果**：

- [x] `node --check`：manifest 生成器、图库控制器、灯箱、文章懒加载和压缩工具通过
- [x] `npm run gallery:compress -- --reencode-webp --dry-run` 扫描 292 张图片且不写文件
- [x] 压缩工具受控同名冲突测试：拒绝覆盖，JPG 与 WebP 均保留
- [x] `npm run build` 成功；生成 v2 manifest 含 292 张、39.4 MB，revision `6356dfbb2e3770d7`
- [x] manifest 与源目录数量一致，ID 唯一；每项宽高、字节数和内容哈希逐文件验证通过
- [x] 生成 `/swiper/` 包含专属 CSS/JS，且不再包含旧 `clearCacheBtn` 或 IndexedDB 页面逻辑
- [x] 系统 Chrome/CDP：首屏仅近视口卡片有 `src`，末项无 `src`；稳定移动策略实测最大并发 2
- [x] 中部第 100 项向下滚入后可见并加载，滚回顶部完全离开后隐藏，再向下返回后重新浮现
- [x] 当前标签页刷新顺序稳定；按钮重排顺序改变且不导航/刷新
- [x] 灯箱按 292 项序列打开，只创建 5 个数字导航项，缩略区不创建 `<img>` 批量请求
- [x] `git diff --check` 通过；构建导致的无关 `source/coffer/private-posts.json` 时间戳变化已恢复
- [x] 不执行任何远程操作；不部署；不提交

**遗留问题**：

- 真实手机的触摸滚动、低带宽私服上的加载节奏和最终梦幻视觉仍需用户本地体验验收。
- 当前 PJAX 配置关闭；若未来开启，从其他页面首次 PJAX 进入 `/swiper/` 时，页面条件 CSS/JS 不会自动注入。启用 PJAX 前必须改为全局 no-op 资源入口或显式加入 PJAX 资源管理。
- 本次只 dry-run 压缩，没有改动任何图片；原地压缩会修改 292 个二进制资源，必须由用户另行明确决定并建议先备份。

---

### #35 — 2026-07-15 — 分离公告时间轴节点与历史展开箭头（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：当前 `master` 已与远程同步于合并提交 `5b91a60`。本次仅修改本地 CSS 和记忆文档，不提交、不推送、不部署。

**涉及文件**：

- `themes/butterfly/source/css/announcement-history.css` — 隐藏原生 `<summary>` 小三角，在摘要右侧绘制自定义箭头
- `long-term-memory/03-api-practices/announcement-history.md` — 记录视觉修复与验证
- `long-term-memory/06-theme-modifications/README.md` — 更新主题修改说明
- `long-term-memory/04-operations/operation-log.md` — 记录本次本地修复

**操作详情**：

用户反馈时间轴圆点和历史公告展开小三角过近。原生 `<summary>` marker 位于时间轴节点附近，造成视觉拥挤。本次通过 `list-style: none !important`、`::marker` 和 `::-webkit-details-marker` 规则隐藏原生标记，并为摘要右侧增加独立的 CSS 折叠箭头；摘要保留原生 `<details>` 语义和键盘交互。

**验证结果**：

- [x] `npm run clean && npm run build` 成功，17 期公告校验通过
- [x] 生成 HTML 结构、资源入口和 `git diff --check` 通过
- [x] Chrome 移动端确认时间轴圆点与右侧箭头分离，历史 `<details>` 仍可打开
- [x] 未执行远程操作；未部署

**遗留问题**：

- 768、769、900、1025px 临界断点和真实设备触摸回归仍待后续人工检查。

---

### #34 — 2026-07-15 — 记录公告时间轴上线公告（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：公告时间轴实现已按用户授权提交并推送为 `d48549b`。本条新公告及本次长期记忆更新只在本地修改，之后不再执行远程操作或部署。

**涉及文件**：

- `source/_data/announcements.yml` — 顶部新增 2026-07-15 公告，继续复用 `/imgs/gifs/1.webp`
- `long-term-memory/03-api-practices/announcement-history.md` — 更新当前状态、历史数量和验证记录
- `long-term-memory/04-operations/README.md`、本操作日志 — 记录推送边界和新增公告

**操作详情**：

1. 在时间轴实现已提交并推送后，新增一版公告，说明公告历史时间轴已经上线。
2. 公告包括纵向时间轴、发布时间、Git 恢复能力和 YAML 顶部维护入口等更新内容。
3. 继续使用已有本地动画 WebP，不引入新的远程资源；`source_commit` 记录为实现提交 `d48549b`。

**验证结果**：

- [x] 本地 clean build 与新增公告生成态断言通过
- [x] 未再次执行远程操作；未部署

**遗留问题**：

- 新公告已完成本地生成态验证；如果要让本次公告进入远程分支，需要用户另行明确授权一次提交/推送。

---

### #38 — 2026-07-17 — 修复连连看图片全量 404 导致的黑屏（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：本次仅修复本地工作区；不提交、不推送、不部署，也不执行远程交互。

**涉及文件**：

- `source/LianlianKan/index.md` — 将棋盘方块背景图从不存在的 `.webp` 恢复为仓库实际跟踪的本地 `.jpg` 资源
- `long-term-memory/02-custom-pages/lianliankan-game.md` — 更正素材格式说明，并记录扩展名与实际素材必须一致的防回归约束
- 本日志 — 记录根因、修复范围和验证步骤

**操作详情**：

1. 用户反馈 `/LianlianKan/` 的棋盘区域全黑；检查确认 `drawBoard()` 动态请求 `/LianlianKan/imgs/${picNum}.webp`，但 `source/LianlianKan/imgs/` 中实际只存在版本控制的 `1.jpg` 至 `8.jpg`。
2. `2d8183f` 曾将运行时引用由 `.jpg` 改为 `.webp`，却没有新增对应 WebP 文件；WebP 批处理脚本也不扫描 `LianlianKan` 目录。因此八种背景图全部 404，透明方块叠在 `#000000` 的棋盘容器上，表现为黑屏。
3. 采用最小且自洽的修复：运行时引用恢复为本地已存在、由 Hexo 直接复制的 `.jpg`，不执行会删除源图的 WebP 转换流程，也不引入远程图片。

**验证结果**：

- [x] `npm run clean && npm run build` 成功，生成 2,355 个文件；生成态保留 8 个 JPEG，页面动态字符串已为 `.jpg` 且不再包含旧 `.webp` 引用
- [x] 隔离 Headless Chrome 本地访问 `/LianlianKan/`：棋盘生成 168 个 `45×45px` 图块；8 种 JPEG 均被请求，HTTP ≥400、加载失败和 `.webp` 请求均为 0
- [x] 配对路径与消除逻辑未改动；本次仅修正背景图 URL 的扩展名
- [x] `git diff --check` 通过
- [x] 未执行远程操作；未部署；未提交

**遗留问题**：

- 若未来要改用 WebP，必须先生成并提交 `source/LianlianKan/imgs/1.webp` 至 `8.webp`，并将该目录同时纳入 macOS/Linux 和 Windows 的转换范围；不能只改动态字符串中的扩展名。

---

### #39 — 2026-07-17 — 为连连看增加沉浸式全屏游玩（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：继续仅修改本地工作区；不提交、不推送、不部署，也不执行远程交互。

**涉及文件**：

- `source/LianlianKan/index.md` — 新增全屏按钮、Fullscreen API 切换与全屏专属沉浸布局
- `long-term-memory/02-custom-pages/lianliankan-game.md` — 记录全屏交互、无障碍状态和维护入口
- 本日志 — 记录本次功能与验证结果

**操作详情**：

1. 在既有“新游戏”旁新增原生 `button`（`type="button"`），初始文案为“⛶ 全屏游玩”，并以 `aria-pressed="false"` 表示非全屏状态。
2. 点击后由用户手势触发标准 `requestFullscreen()`；为 WebKit 兼容保留 `webkitRequestFullscreen` / `webkitExitFullscreen` 回退。整个 `#lianliankan-game` 成为全屏元素，因此游戏控制、提示和棋盘保持同一沉浸界面。
3. 监听标准与 WebKit 的全屏状态事件，将按钮在“全屏游玩”与“退出全屏”之间同步，并更新 `aria-pressed`；按 Esc 后浏览器退出全屏，按钮也会恢复。
4. 全屏时使用专属深色渐变背景、居中弹性布局和视口边界；棋盘保留自身滚动，以避免小尺寸或高行数棋盘被裁切。

**验证结果**：

- [x] `npm run clean && npm run build` 成功，生成 2,355 个文件；生成态包含全屏按钮、标准/WebKit Fullscreen API、状态监听、全屏样式和本地 JPEG 图块引用
- [x] 隔离 Headless Chrome（1440×1200）回归：初始棋盘 168 个图块；点击可进入 `#lianliankan-game` 全屏，按钮同步为“退出全屏”及 `aria-pressed="true"`；按 Esc 后退出并恢复初始文案和状态；进出全屏前后图块数与 14 列棋盘布局不变
- [x] `git diff --check` 通过
- [x] 未执行远程操作；未部署；未提交

---

### #41 — 2026-07-20 — MarkdownPreview 升级为本地优先工作台（仅本地实施）

**操作人**：Codex

**涉及文件**：

- `source/MarkdownPreview/index.md` — 替换旧内联编辑器为工作台挂载层，保留完整语法教程
- `source/MarkdownPreview/workbench/` — 新增 CodeMirror 编辑器、Worker 预览、DOMPurify 安全策略、IndexedDB 草稿与平面化界面
- `tools/build-markdown-preview.js`、`package.json`、`package-lock.json` — 新增固定版本依赖及本地打包入口
- `long-term-memory/02-custom-pages/markdown-preview.md` — 更新实现说明与维护边界

**代码事实**：

1. 原 700 余行内联渐变/动画与全局 `onclick` 逻辑已替换为独立的本地打包工作台，页面 URL、教程正文、`marked.min.js` 与两个历史 backup 页面均保留。
2. 工作台提供 13 项原有格式与文件操作、搜索替换、命令面板、全屏、可调分栏、桌面/移动模式切换、拖放导入、下载和 IndexedDB 自动保存。
3. Worker 使用本地 marked 解析，DOMPurify 在主线程始终净化预览；不执行原始 HTML 中的脚本、事件属性或危险嵌入内容。

**验证结果**：

- [x] `npm run build:markdown-preview` 成功，生成本地 JS/CSS bundle
- [x] `node --check` 通过工作台入口与 Worker
- [x] `git diff --check` 通过
- [x] `npm run clean && npm run build` 成功，生成 2,360 个文件，工作台 bundle 与 Worker 均进入 `public/MarkdownPreview/workbench/`
- [x] 本地 Headless Chrome 验证桌面工作台加载、CodeMirror、大纲、预览、格式化按钮、分屏/预览切换与 IndexedDB 自动保存状态
- [x] 浏览器安全用例确认 `<script>` 和 `javascript:` 链接未进入可执行预览
- [x] 375px 浏览器回归确认移动端默认源码视图及源码/预览/大纲切换入口
- [ ] 待补 768px、1024px、1440px 的完整交互回归，以及导入/导出和全屏人工验证
- [x] 未部署、未提交、未推送

**遗留问题**：

- 初次依赖下载绕过了用户级 npm 缓存的历史权限问题，使用临时缓存完成；未修改用户级缓存权限。
- 需要在具备本地服务器和浏览器权限的环境中补齐 375px、768px、1024px、1440px 的交互与安全净化验证。

**2026-07-20 截图反馈修正**：

1. 用户截图确认初版存在根容器背景未生效、三栏挤压错位、预览越界、全屏底部大块黑区及移动端仍保留分屏的问题。
2. 根因是挂载节点未添加 `.mdw-shell`，导致外壳背景和网格规则没有命中；同时全屏使用固定 `calc(100vh - 146px)` 猜测内容高度，响应式只依据 viewport 而没有依据主题内容栏的实际宽度。
3. 已改为根节点五行 CSS Grid 应用壳，中央布局使用 `minmax(0, 1fr)` 严格收缩；CodeMirror 与预览使用不透明表面并裁切溢出；全屏由根网格自然分配剩余空间，不再使用固定高度减法。
4. 新增 `ResizeObserver` 按工作台实际宽度切换 `.mdw-compact`；不超过 900px 时只显示源码、预览或大纲中的一个面板，避免在窄内容栏强行分屏。
5. 移动端取消负边距扩宽并允许紧凑工作台最小高度随动态视口收缩；全屏规则置于紧凑/移动规则之后，保证窄屏全屏仍严格占用一个 `100dvh`，不会被 `82dvh` 覆盖。
6. [已验证] `npm run build:markdown-preview`、入口/Worker `node --check` 与 `git diff --check` 通过；最终 clean build 成功生成 2,360 个文件。浏览器复测因本地 server 授权审批服务返回 503 未能在本轮完成，仍需用户刷新本地服务后人工确认截图中的四类问题。
7. 根据后续全屏截图反馈，桌面进入全屏后强制采用左右分屏，并在标题栏中央新增高对比度的大尺寸源码/分屏/预览切换组；退出全屏恢复进入前模式，宽度不超过 900px 的设备继续使用单面板，避免移动端退化。

---

### #42 — 2026-07-20 — 记录 Markdown 工作台全屏与公告更新

**操作人**：Codex

**涉及文件**：

- `source/_data/announcements.yml` — 顶部新增 Markdown 工作台深度升级公告
- `long-term-memory/03-api-practices/announcement-history.md` — 更新公告期数、当前状态与复用 GIF 说明
- `long-term-memory/04-operations/operation-log.md` — 记录本次公告与全屏视图更新

**操作详情**：

1. 公告记录今天完成的 Markdown 工作台布局、全屏、移动端与安全预览更新。
2. 公告图片继续使用现有 `/imgs/gifs/1.webp`，未替换、删除或新增 GIF 资源。
3. 新公告放在 YAML 顶部，时间为 `2026-07-20T16:17:07+08:00`，保持公告时间严格倒序。

**验证状态**：

- [x] `npm run clean && npm run build` 通过，生成页面确认第 19 期公告、时间倒序与本地图片尺寸校验
- [x] 生成公告继续引用 `/imgs/gifs/1.webp`，未替换 GIF 资源
- [x] 未提交、未推送、未部署

---

### #40 — 2026-07-17 — 让连连看全屏棋盘按视口填充（仅本地实施）

**操作人**：AI 助手（Claude Code）

**远程约束**：继续仅修改本地工作区；不提交、不推送、不部署，也不执行远程交互。

**涉及文件**：

- `source/LianlianKan/index.md` — 全屏尺寸模型改为按完整视口计算行列，并明确写入棋盘实际宽高
- `long-term-memory/02-custom-pages/lianliankan-game.md` — 更新全屏棋盘重绘与填充行为
- 本日志 — 记录本次调整和验证结果

**操作详情**：

1. 用户反馈首版全屏只扩大外层容器，棋盘仍沿用普通页面的 14×12（或当前）尺寸，未充分利用屏幕。
2. 全屏状态下改用 `window.innerWidth` / `window.innerHeight` 扣除控制区和安全内边距，计算可放入的最大偶数行列；移除全屏棋盘的普通页面最大宽高限制。
3. `drawBoard()` 依据实际行列、方块和间距写入精确宽高，避免 CSS `fit-content` 或最大高度限制让棋盘收缩。
4. 每次进入或退出全屏时按目标区域重新生成棋局并重绘：这样进入全屏可放大填充，退出也能恢复常规响应式尺寸。该行为等同于针对尺寸变化自动开一局新游戏，避免旧矩阵在新行列尺寸下失配。

**验证结果**：

- [x] `npm run clean && npm run build` 成功，生成 123 个文件；生成态包含视口尺寸计算、全屏重绘和显式棋盘宽高
- [x] 隔离 Headless Chrome（1440×1200）回归：普通页为 14×10、`720×516px`；进入全屏后为 26×20、`1332×1026px`，占可用视口宽度约 92.5%、扣除控制区后可用高度约 97.7%；520 个图块均使用本地 JPEG，HTTP ≥400 为 0
- [x] 按 Esc 后恢复为普通页 14×10、`720×516px`；进出全屏均按目标尺寸重新开局，未发生矩阵/DOM 尺寸不匹配
- [x] `git diff --check` 通过
- [x] 未执行远程操作；未部署；未提交

---

### #43 — 2026-07-20 — 首页瀑布流激光水纹悬浮升级（仅本地实施）

**操作人**：Codex

**远程约束**：本次只修改本地主题源码和长期记忆；不提交、不推送、不部署，不运行会转换或删除图片的命令。

**涉及文件**：

- `themes/butterfly/source/css/_page/waterfall-homepage.styl` — 信息区激光水纹、卡片悬浮边框及触屏/减弱动态降级
- `themes/butterfly/source/css/styles.css` — 删除旧滑入遮罩和重复保险样式
- `themes/butterfly/source/js/waterfall.js` — 增加事件委托、单 RAF 鼠标跟随与生命周期清理
- `long-term-memory/06-theme-modifications/README.md`、本日志 — 记录主题升级与证据边界

**代码事实**：

1. 波光只绘制在封面下方 `.recent-post-info`，不改变卡片 DOM，不遮挡标题、日期、标签、摘要或链接点击。
2. 深蓝基底、青色主光、淡红辅光和椭圆焦散纹理由鼠标坐标驱动，没有持续自主动画，也没有整块渐变从侧边滑入。
3. 容器只维护一组委托监听和一个激光 RAF；每次最多更新当前卡片。子元素间移动不会误清除，跨卡片会清除旧状态再激活新卡片。
4. 触屏/粗指针不启用效果；reduced-motion 使用固定弱高光并停用跟随、位移、缩放和过渡；PJAX 销毁会清理监听、RAF、激活类和 CSS 变量。

**验证结果**：

- [x] `node --check themes/butterfly/source/js/waterfall.js` 通过
- [x] `waterfall-homepage.styl` 独立编译通过，输出 11,065 字节 CSS
- [x] 静态断言确认 `auroraSlide`、`translateX(-100%)` 和旧整卡伪元素不存在
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,360 个文件
- [x] 生成 `public/css/index.css` 含 `--laser-x`、重复径向水纹和响应式降级；首页加载 `/js/waterfall.js`，生成脚本与源码一致且语法通过
- [x] 构建前后 `source/coffer/private-posts.json` SHA-256 一致，没有覆盖用户已有扫描器差异
- [x] `git diff --check` 通过；未提交、未推送、未部署
- [ ] 应用内浏览器策略阻止访问本地预览地址，1024px/1440px 鼠标四角跟随、快速跨卡片、文字对比度和 375px/768px 触屏视觉仍待用户刷新本地页面人工确认

---

### #44 — 2026-07-20 — 修复鼠标悬浮水纹未激活（仅本地实施）

**操作人**：Codex

**触发反馈**：用户确认鼠标移动到首页卡片上时没有看到水纹；截图显示的只是 `.recent-post-item` 原有整块蓝红背景。

**根因与修复**：

1. 第一层兼容问题是媒体查询曾作为事件绑定开关，并在粗指针规则中强制隐藏伪元素；已改为支持 Pointer Events 即注册、按真实 `pointerType === 'mouse'` 过滤触摸，并移除强制隐藏。
2. 用户反馈仍无效果后，在明确授权下读取内置浏览器日志，并按用户要求刷新后等待开屏动画结束 2.5 秒再测试。日志和运行态确认监听、卡片激活、RAF 绘制与坐标变量均正常，但 `::before` / `::after` opacity 始终为 0。
3. 最终根因是 Stylus 激活块缩进在 `.post-card-wrapper` 内，生成选择器为 `.post-card-wrapper.is-laser-active`；JS 实际把类添加到 `.waterfall-item`，二者永远无法匹配。已将激活块提升到 `.waterfall-item` 层级。
4. 同时将事件模型收敛为容器 `pointermove` 解析当前卡片，只在 `pointerleave` / `pointercancel` 或移动到卡片外时清理，避免卡片上浮 transform 触发 `pointerout` 抖动。

**验证结果**：

- [x] `node --check themes/butterfly/source/js/waterfall.js` 通过
- [x] Stylus 独立编译通过，输出 10,800 字节 CSS
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,360 个文件
- [x] 生成 CSS 保留 `@media (hover: none), (pointer: coarse)` 的卡片静态降级，但不再包含水纹 `opacity: 0 !important`
- [x] 构建前后 `source/coffer/private-posts.json` SHA-256 保持 `1ace95e1ce8fd8a2aa2f2cc9162412a45372128da2d96bea6cae367b302ceed7`
- [x] `git diff --check` 通过；未提交、未推送、未部署
- [x] 用户明确授权后，内置浏览器在开屏结束 2.5 秒后实测目标坐标命中卡片，`.waterfall-item.is-laser-active` 持续存在，坐标变量为有效像素值
- [x] 修正选择器后 `::before` opacity 为 `0.96`、`::after` 为 `0.72`；悬浮截图可见青色椭圆水纹，封面保持原色
- [x] 临时 `[WaterfallLaser]` 诊断日志已移除，不保留生产控制台输出

---

### #45 — 2026-07-20 — 首页水纹升级为鼠标轨迹扩散涟漪（仅本地实施）

**操作人**：Codex

**目标**：解决固定径向图片跟随鼠标移动的生硬感，让鼠标划过信息区时像拨动水面一样留下向外扩散的独立涟漪；同时让每篇文章的信息区毛玻璃在红、黑、蓝、紫、粉色域内具有不同组合。

**实现事实**：

1. JS 在 15 张首页卡片的信息区各建立一个空水波层；鼠标轨迹按 64ms 和 14px 双阈值生成最多 9 个动画节点，青色、绿色、白色三种光谱轮换，动画完成即删除。
2. 每个水波从约 0.28 倍扩展到 3.6–4.3 倍，最终扩散半径约为上一版的一半，持续 0.82–1.03 秒；鼠标停止后不再产生新波纹，现有波纹快速扩散衰减。
3. 旧重复径向纹理已删除，只保留低强度跟随光和非常轻的斜向水面反射。
4. 六套卡片变量分别调整黑蓝、黑紫、酒红蓝、黑红、紫蓝和黑红紫的渐变顺序、角度与环境光；卡片细边框也随变量变化。
5. 动态层不改变卡片尺寸，不阻挡链接；触屏事件被 `pointerType` 过滤，reduced-motion 隐藏水波动画。
6. 根据第二轮视觉反馈，删除三道 2% 宽的硬边色环，改为中心漫反射、宽过渡主体波带与外围余辉三层；分别使用 2.8px、3.6px、5.4px 模糊，并给连续节点分配轻微不同的旋转角和横向扁率，使波光在轨迹上相互叠融。
7. 根据第三轮视觉反馈，将波纹持续时间缩短约四成、最大并发节点降至 9；删除水波层中的淡红、粉紫与蓝紫，统一使用青色、绿色和白色相间的冷色光谱。
8. 根据第四轮视觉反馈，将最终缩放值从 7.2–8.5 倍减半至 3.6–4.3 倍，不改变波纹寿命、颜色、模糊层和生成频率。

**验证结果**：

- [x] `node --check themes/butterfly/source/js/waterfall.js` 通过
- [x] Stylus 独立编译通过，青绿白色谱细化后的输出为 17,547 字节 CSS
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,360 个文件
- [x] 生成 CSS 含 `waterfallRippleExpand`、三套 ripple tone、六组 `nth-child` 玻璃变量，且不再含旧 `repeating-radial-gradient` 水纹
- [x] 内置浏览器等待开屏 2.5 秒后确认 15 个水波层存在，前六张卡片背景值互不相同
- [x] 浏览器运行时确认动画名为 `waterfallRippleExpand`，当前单节点时长从 0.82 秒起；截图可见波光从鼠标经过位置快速扩散
- [x] 等待动画结束后 `.waterfall-ripple` 数量回到 0；跨卡片后新背景与新水波正常激活
- [x] 第二轮内置浏览器仍先等待开屏 2.5 秒；连续鼠标轨迹实测同时存在 5 个水波节点，运行时确认三层模糊和旋转/扁率变量生效，截图中硬边圆环已变为连续柔光水痕
- [x] 第三轮浏览器轨迹捕获到 0.82 / 0.89 / 0.96 秒相邻节点，运行时主色依次为青、绿、冷白；等待 1.15 秒后节点数量恢复为 0
- [x] 构建前后私密文章索引 SHA-256 未变化；`git diff --check` 通过
- [x] 未提交、未推送、未部署

---

### #46 — 2026-07-20 — 文章页主卡片改为黑深蓝夜空磨砂（仅本地实施）

**操作人**：Codex

**目标**：移除文章主内容卡片过亮、透明度偏高的蓝紫红粉渐变，改为区别于首页卡片的黑色—深蓝夜空磨砂背景，并保证现有正文和链接清晰可读。

**实现事实**：

1. `styles.css` 的亮色组合选择器不再包含 `#post`，侧栏、归档、普通页面和 Swiper 不受本次修改影响。
2. 普通文章模式使用三点冷白微光、两层深蓝环境光和黑—深蓝线性底色，背景模糊为 26px，边框为 1px 低透明冷白，阴影以黑色外阴影和深蓝内反光为主。
3. 文章正文为浅蓝白，标题接近白色，普通链接为浅青蓝、悬浮为冷白蓝；作用域限定在文章卡片，代码块、引用块和图片样式不改。
4. 阅读模式被明确排除，继续由 `_mode/readmode.styl` 控制透明背景与阅读排版。
5. 生成 HTML 核对确认当前文章结构为 `#content-inner > #post`；实现选择器已按该结构编写，没有复用 `transpancy.css` 中失配的历史 `.layout_post > #post`。
6. 后续按用户反馈将底色从 0.86–0.93 的近黑高不透明层改为 0.72–0.73 的透亮深蓝层；冷白星点、边框和内反光改为淡青色，外部黑阴影透明度降至 0.36，链接和弱文本提高到浅青白、浅蓝白以保持识别度。

**验证结果**：

- [x] `git diff --check` 通过
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,360 个文件
- [x] `public/css/styles.css` 与主题源文件一致，生成 CSS 含 26px blur、0.72–0.73 深蓝渐变、三处淡青点缀和文章文字作用域
- [x] 生成文章 HTML 确认为 `<main id="content-inner"><div id="post">`，与新选择器精确匹配；旧亮色组合规则中已无 `#post`
- [x] 以“0.72 中段深蓝覆盖纯白底图”为最不利条件计算：正文 4.89:1、标题 5.60:1、链接 4.74:1、弱文本 4.61:1，均达到 WCAG AA
- [x] 构建后私密文章索引当前 SHA-256 为 `f03abcec06f6a7df1fd9f6f2d2d23b4b68351e73d7c3b0ac402a18785724a5ef`；该文件由扫描器维护，未手工覆盖用户差异
- [ ] 内置浏览器本地地址策略未提供文章页视觉验证；透图程度、淡青星点密度和移动端长文观感待用户本地刷新确认

**远程约束**：未提交、未推送、未部署。

---

### #47 — 2026-07-21 — 修复 Butterfly flat note 浅底浅字（仅本地实施）

**操作人**：Codex

**触发反馈**：文章夜空背景上线后，`{% note info flat %}`、`warning flat`、`danger flat` 等提示块内部文字接近浅蓝白，在 Butterfly 自带的浅色提示背景上对比度不足。

**根因与实现**：Butterfly `_tags/note.styl` 已为 `.note.flat` 设置 `$font-black`，但新增文章主题直接为 `#article-container p/li/td` 指定浅色，其选择器优先级高于 note 的继承色。现于文章主题末尾增加 `.note.flat` 专属覆盖，将段落、列表、表格、标题、强调、行内代码和普通链接设为 `#111827`；链接悬浮为纯黑。提示图标、左侧边框、info/warning/danger 背景和阅读模式保持原样。

**验证结果**：

- [x] `git diff --check` 通过
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,360 个文件
- [x] `public/css/styles.css` 与主题源文件一致，包含 `.note.flat` 后置覆盖及 `#111827 !important`
- [x] 生成文章 `2025/03/31/“HongXiaoYi”/index.html` 同时包含 info、warning、danger flat note，截图对应的段落、行内代码和 strong 结构均被覆盖
- [x] 以三类 Butterfly 浅色背景近似值计算，黑色正文对比度为 info 14.60:1、warning 15.02:1、danger 13.74:1
- [x] 保留并未手工编辑用户已有的 `source/coffer/private-posts.json` 差异；构建后该扫描器数据仍处于修改状态

**远程约束**：未提交、未推送、未部署；保留用户已有的 `source/coffer/private-posts.json` 差异。

---

### #48 — 2026-07-21 — 首页卡片默认配色分化与静态星光（仅本地实施）

**操作人**：Codex

**目标**：提高瀑布流卡片封面下方信息区的常驻视觉差异，并加入随机分布感的固定小白点；不改变悬浮时的青绿白水波。

**实现事实**：

1. 六组 `nth-child` 变量分别使用黑青、钴蓝、酒红、赤褐、紫罗兰和深海绿蓝色域，渐变方向、三段底色、环境光与强调色均有明显差异。
2. 每组定义六个不同的星点坐标；常驻背景以六层微小径向渐变绘制白色星光，尺寸约 0.6–0.9px，亮度为 0.40–0.76。
3. 星点没有 DOM 节点、监听器或动画；鼠标水波的伪元素、动态层、生成频率、颜色、半径与销毁逻辑均未改动。
4. 后续按用户反馈将每张卡片的星点数从 6 增至 10，核心半径从 0.6–0.9px 缩至 0.3–0.5px，完整柔边范围缩至 0.8–1.15px，并为六组卡片各补充四个独立坐标。
5. 再次按反馈将固定星点从 10 个精确增至 21 个；新增星点核心为 0.3–0.45px、柔边为 0.8–1.05px，六组配色各自新增 11 个不同坐标。
6. 最终改为复用首页现有 `#universe` 星空：删除 21 层模拟星点和全部坐标变量，将六组底色调整为约 0.44–0.63 不透明度，背景模糊从 18px 降至 4px并压低透入高光；标题、元信息、标签和摘要增加高对比冷白文字、深色阴影及标签承托底色。没有复制顶部星空脚本，也未增加 Canvas 或 RAF。
7. 为提高透窗后的星光可见度，同步把背景与顶部的普通星、大星改为冷蓝白，提高普通星/大星和流星的透明度区间及绘制亮度倍率；该阶段粒子数量、速度、尾迹段数、30fps 调度和每帧绘制次数不变。
8. 继续将普通星、大星、流星头部和尾迹宽度整体放大约 20%–25%；粒子数量、速度、10 段尾迹、30fps 和 Canvas/RAF 数量不变。
9. 移除标题与摘要周围的大范围深色柔光，以及标签默认深色半透明底和标签模糊；文字仅保留 1px 低强度投影，标签细边界与悬浮反馈保留。

**验证结果**：

- [x] 最终透窗样式的 Stylus 独立编译成功，输出 17,758 字节 CSS
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,360 个文件
- [x] 生成 CSS 已无 `--star-*` 坐标、21 层模拟星点、标签默认深色底或大范围文字柔光，保留六组半透明玻璃、4px 卡片模糊、亮度抑制和 1px 轻微文字投影
- [x] `themes/butterfly/source/js/waterfall.js` 相对上一提交无差异，且生成 JS 与源码一致，悬浮水波逻辑未改
- [x] 两套星空脚本 `node --check` 通过，生成脚本含新的冷蓝白颜色、透明度区间和亮度倍率
- [x] 静态核对确认粒子预算仍为移动端 `0.04 × width`、桌面端 `0.08 × width`；星体按最终参数放大，速度、10 段尾迹和 30fps 均未增加
- [x] 直接透视现有全屏星空，无新增 DOM、Canvas、粒子、事件监听器、RAF 或关键帧
- [x] `git diff --check` 通过
- [ ] 内置浏览器在刷新当前 `localhost:4000` 时明确拒绝访问；透星程度、文字清晰度、悬浮水波和移动端观感待用户手动刷新首页确认
- [x] 保留扫描器维护的 `source/coffer/private-posts.json` 现有差异，未手工编辑

**远程约束**：未提交、未推送、未部署；保留用户已有的 `source/coffer/private-posts.json` 差异和本轮 flat note 修复。

---

### #49 — 2026-07-21 — 更新首页星空与阅读可读性公告（仅本地实施）

**操作人**：Codex

**涉及文件**：

- `source/_data/announcements.yml` — 顶部新增第 21 期公告，继续复用 `/imgs/gifs/1.webp`
- `long-term-memory/03-api-practices/announcement-history.md` — 更新当前公告日期、期数与历史说明
- 本日志 — 记录公告内容与验证边界

**公告内容**：记录首页卡片透出全屏动态星空、冷蓝白星体亮度与尺寸增强、文字后暗色底层移除，以及 Butterfly `flat note` 提示区块改为近黑色文字的今日升级。公告不新增、不替换 GIF，也不涉及远程资源。

**验证计划**：运行公告校验、`git diff --check`，并在需要时执行 clean build；构建产生的 `source/coffer/private-posts.json` 差异继续保留，不手工覆盖。

**远程约束**：仅更新本地公告与长期记忆；未提交、未推送、未部署。

---

### #50 — 2026-07-29 — 首页封面桌面 Liquid 叠层尝试（已回退）

**操作人**：Codex

**最终状态（2026-07-30）**：用户最终视觉验收认为效果很差。Liquid JS/CSS 与 `head.pug` 加载入口已全部删除或恢复，扫描器生成差异也已恢复；当前站点不存在 Liquid 资源、Canvas 或控制器，仅保留本条历史记录及相关长期记忆。

**回滚与远程边界**：实施前工作树干净，`HEAD` 与 `origin/master` 均为 `7c773140323aef8e40f1114bd5ba9dcf4870b439`；执行 `git push origin master` 返回 `Everything up-to-date`，该提交固定为回滚基点。确认后未再执行 fetch、pull、push、deploy 或其他远程操作。

**实验时涉及文件**：

- `themes/butterfly/source/js/header-liquid.js` — 原生 WebGL2 流体求解器、设备门控、按需调度和完整销毁
- `themes/butterfly/source/css/header-liquid.css` — 首页封面内裁剪、层级和降级保险
- `themes/butterfly/layout/includes/head.pug` — Liquid CSS/JS 仅首页加载
- 星空运行时指南、主题修改登记、功能目录、操作索引与根记忆索引 — 同步当前事实和证据

**实验代码事实**：

1. 从用户提供的 Canvas UI Liquid 源码移植原生 WebGL2 流体求解器，不引入 React、shadcn、npm 依赖或外部 CDN。透明叠层仅绘制蓝色流体色迹，不捕获、替换或扭曲封面 HTML。
2. Liquid 只在 `#page-header.full_page`、`min-width:1025px`、`hover:hover`、`pointer:fine` 且未请求 reduced-motion 时创建；手机、平板、大屏粗指针和 reduced-motion 只保留原有两层星空。
3. Canvas 为封面直接子元素，`z-index:1`、`pointer-events:none`；顶部星空保持 2，标题/滚动提示保持 3，导航层级不改。封面 `overflow:hidden` 限制所有 Liquid 像素。
4. 指针事件只绑定封面并只接收鼠标。求解器在轨迹耗散后停止 RAF，封面离屏或文档隐藏时停止；ResizeObserver、IntersectionObserver、媒体查询变化、WebGL context lost、PJAX 与手工控制器调用均有清理路径。
5. `window.__headerLiquidController` 提供 `init()`、`destroy()` 和只读 `getState()`；重复 `init()` 保持单 Canvas，`destroy()` 同时移除实例资源与控制器级媒体/PJAX监听，后续 `init()` 可幂等恢复。
6. WebGL2、浮点 framebuffer、Shader 或 Program 失败时静默移除 Liquid，不影响封面图、标题、导航和两层星空。
7. 2026-07-30 根据用户视觉反馈，将显示着色器的透明度上限由 `0.82` 降为 `0.492`（当前值的 60%）；该调整只减弱最终蓝色合成浓度，不改变求解器参数、轨迹范围、耗散、设备门控或作用区域。

**已验证**：

- `node --check themes/butterfly/source/js/header-liquid.js` 与 `git diff --check` 通过。
- `npm run clean` 后 `npm run build` 成功，生成 2,363 个文件；主题 Liquid JS/CSS 与生成文件逐字一致。
- 构建前后 `source/coffer/private-posts.json` SHA-256 均为 `10a0102dd19dd766fe61879be71870a81ed4f456eb12f01400c0fe1b89e9b874`，没有扫描器生成差异。
- 生成首页各有 1 个 Liquid CSS/JS、顶部星空脚本、背景星空 Canvas/脚本；归档和代表性文章 HTML 中这些首页资源均为 0。
- Codex 内置浏览器：390×844 与 1024×900 均为 Liquid 0、顶部/背景星空各 1；1440×900 为 Liquid 1、两层星空各 1，WebGL failure 为 null。
- 桌面 Canvas 与页头边界一致，`pointer-events:none`、`z-index:1`；标题、导航站点标题和滚动按钮的点击命中均不是 Canvas。
- 内置浏览器真实鼠标轨迹截图可见蓝色流体色迹，且星点、标题和导航继续显示；Liquid/WebGL 过滤日志均无错误。
- 轨迹耗散约 7.2 秒后 `running:false`；封面滚出视口后 `headerVisible:false / running:false`。
- 1440→1024→1440 动态切换得到 Canvas `1→0→1`；重复两次 `init()` 仍为 1；`destroy()` 后 Canvas 0 且 `lifecycleBound:false`，再 `init()` 恢复 1。
- 桌面模拟 reduced-motion 时 Liquid 为 0，顶部/背景星空仍各 1；恢复 motion 后 Liquid 恢复为 1。
- 归档页和代表性文章页 Liquid CSS、JS、Canvas 均为 0。日志中的既有 `butterfly_swiper_injector_config` 非首页错误来自 Swiper 插件注入，与 Liquid 资源无关。
- 2026-07-30 透明度调整后再次执行 `npm run clean` 与 `npm run build`，成功生成 2,363 个文件；生成态 Liquid JS/CSS 与主题源文件逐字一致，私密索引 SHA-256 仍为 `10a0102dd19dd766fe61879be71870a81ed4f456eb12f01400c0fe1b89e9b874`。
- 2026-07-30 内置浏览器桌面 1440×900 复核：鼠标轨迹保持清晰且封面图、标题与星点透出更明显；Liquid/顶部星空/背景星空均各 1，Canvas 边界与页头一致，`pointer-events:none`、`z-index:1`，Liquid/WebGL 警告或错误为 0。1024×900 复核为 Liquid 0、两层星空各 1。

**待确认**：当前内置浏览器的独立标签页不会改变被测页 `document.hidden`，且其 CDP 不支持 `Emulation.setPageVisibilityState`，因此 `visibilitychange` 暂停只完成代码路径审查，未获得该后端的运行时触发证据；真实 Safari/Firefox、真实触摸电脑、GPU/功耗和发布网络仍待目标设备验证。

**回退事实**：以 `7c77314` 为工作树基线逐文件受控恢复，未使用 `git reset --hard`。回退后只保留 `long-term-memory/` 文档差异；未执行 commit、fetch、pull、push、deploy，也未运行 `webp/dev/opt/pub`。

**回退验证**：执行 `npm run clean` 后 `npm run build` 成功生成 2,361 个文件；生成目录中 `header-liquid` 文件、资源引用和控制器标识均为 0。构建扫描器改写的 `source/coffer/private-posts.json` 已恢复到 `HEAD`，所有非长期记忆文件均无 Git 差异。

---

### #51 — 2026-07-30 — 非文章页 Bend 兼容折叠与持久化开关尝试（已回退）

**操作人**：Codex

**最终状态（2026-07-30）**：用户最终视觉验收认为效果很差。Bend JS/CSS、主题入口、右键菜单开关和独立生日页接入已全部删除或恢复；当前站点不存在 Bend 资源、控制器、效果 DOM 或持久化业务入口，仅保留本条历史记录及相关长期记忆。

**实验时涉及文件**：Bend JS/CSS、`head.pug`、右键菜单 JS/CSS/Pug、独立生日页，以及相应长期记忆入口。

**实验代码事实**：

1. Canvas UI Bend 上游依赖实验性 `drawElementImage` 和 `requestPaint`；内置浏览器能力探测均为 false。实验采用 CSS 3D 顶底折叠层，保留参数语义但不捕获或重映射页面 DOM。
2. Butterfly 模板只对非文章页加载 Bend；运行时再以 pageType/文章 body 双重排除。文章页按钮 disabled，不加载 Bend CSS/JS，不创建控制器或效果 DOM。
3. 非文章页默认开启；右键开关写入 `blog:bend-enabled`，刷新和跨页保持。reduced-motion 时不创建效果但保留偏好。
4. 效果层固定、`pointer-events:none`、`aria-hidden=true`；RAF 收敛停止，隐藏暂停，Observer、监听器、RAF 和 DOM 均可销毁并幂等恢复。
5. `layout:false` 的生日页显式加载相同 Bend/右键资源；其整屏滚动、触摸、相册、视频、流星 Canvas 和加载层仍由原实现负责。
6. 实验期间首页 Liquid 与 Bend 相互独立；Liquid 最终显示透明度上限曾为 `0.492`，即初版 `0.82` 的 60%。

**验证结果**：

- [x] 三个 JS 文件 `node --check` 与 `git diff --check` 通过
- [x] `npm run clean` 后 `npm run build` 成功，生成 2,365 个文件
- [x] 生成首页、归档、About、Coffer、生日页各含一份 Bend CSS/JS；代表性文章 Bend CSS/JS 为 0
- [x] 内置浏览器 1440×900：默认 Bend 根节点 1、`pointer-events:none`、右键状态“开”；关闭后根节点 0、存储值 `false`，刷新仍关闭，再开启恢复单实例
- [x] 归档页继承 Bend 与开关偏好；代表文章 CSS/JS/控制器/根节点均为 0，按钮 disabled 且显示“文章页关闭”，文章正文、TOC 与阅读模式仍可用
- [x] 独立生日页 Bend/右键菜单存在，滚轮可由第 1 幕切换至第 2 幕；关闭 Bend 后当前幕和交互不变
- [x] 模拟 reduced-motion 时根节点 0、按钮显示“系统关闭”，恢复后单实例重建；重复 `init()`、`destroy()`、再 `init()` 分别保持 1→0→1，RAF 收敛后 `running:false`
- [x] Coffer 与 MarkdownPreview 代表页均创建单一 Bend 根节点，Coffer 输入与按钮仍存在；Bend 过滤日志为 0
- [x] 首页 390×844 与 1024×900 均为 Liquid 0、双层星空各 1；1440×900 Liquid 恢复 1，浅色迹截图可见，Canvas 与封面边界一致且 Liquid/WebGL 警告错误为 0
- [x] 完成全部生成路由审计：176 个 `index.html` 中，59 个带 `#body-wrap.post` 的文章页 Bend CSS/JS 均为 0；其余 117 个非文章路由均且仅加载 1 份 Bend CSS、1 份 Bend JS，并包含右键开关
- [x] 扩大内置浏览器功能回归：连连看 112 个方块可重新开局；Markdown 工作台可输入并实时预览；Swiper 292 项画廊可重新随机；Coffer 密码框可输入并保持焦点；About 的 10 张卡片/外链与留言页评论容器均正常存在
- [x] 再次逐项对照用户提供的 Bend 上游源码：当前参数与上游文档配置一致；上游在缺少 `drawElementImage` / `requestPaint` 时同样保留原生内容并关闭 HTML-in-Canvas 捕获，当前兼容层不接管页面 DOM
- [x] 构建前后私密索引 SHA-256 均为 `ca73fafede4146e4216314c5e4a734394faed6652bfb28316ecade29debc5064`，保留扫描器维护的既有差异

**回退事实**：回滚基点仍为 `7c77314`；已逐文件恢复所有非记忆差异，未使用 `git reset --hard`，未执行 commit、push、fetch、pull、deploy，也未运行 `webp/dev/opt/pub`。

**回退验证**：同一次 clean build 成功生成 2,361 个文件；生成目录中 `bend-effect` 文件、资源引用、控制器标识和持久化键均为 0。构建后所有非长期记忆文件均已恢复到 `HEAD`。

**既有异常**：归档和代表文章控制台仍有 `butterfly_swiper_injector_config` 对缺失容器调用 `insertAdjacentHTML` 的旧错误；它在此前 Liquid 验证中已记录，与 Bend/Liquid 资源无关，本次未扩大范围修复。

---

### #52 — 2026-08-06 — 文章目录 hideToggle 折叠分组与点击展开联动

**操作人**：Kimi Code

**涉及文件**：

- `scripts/toc-toggle-group.js` — 新增；覆盖 Hexo 内置 `toc` 助手，把 hideToggle（`<details class="toggle">`）块内标题在目录中归入可折叠分组，分组名取 `summary.toggle-button` 文字；解析失败回退内置助手
- `source/js/toc-toggle-group.js` — 新增；document 捕获阶段先于 main.js 展开目标标题所在的闭合折叠块，MutationObserver 联动滚动高亮自动展开目录组，hash 直达兜底
- `source/css/toc-toggle-group.css` — 新增；折叠项箭头、长标题悬挂缩进与激活态样式；`[open]` 双向 `!important` 约束，覆盖主题非展开模式 `.toc-child{display:none}` 与移动端 `display:block !important`
- `themes/butterfly/layout/includes/head.pug` — 文章页条件加载新 CSS
- `themes/butterfly/layout/includes/additional-js.pug` — 文章页条件加载新 JS

**操作详情**：

用户反馈 `{% hideToggle %}` 折叠块内的标题照常出现在文章目录中，点击跳转后内容处于折叠状态不可见。要求目录中增加可折叠目录项，以 hideToggle 标题文字命名，收纳块内标题。

实现要点（代码事实）：

1. 目录生成：项目级 `scripts/` 晚于核心插件加载，`hexo.extend.helper.register('toc', ...)` 覆盖内置助手；用 htmlparser2（hexo-util 同款依赖）解析 `page.content`，复刻 tocObj 的 id/text/unnumbered 提取与内置编号计数器；同一 details 块内标题在文档序上连续，折叠为 `<details class="toc-toggle">` 分组。分组 summary 不使用 `.toc-link`，保持 main.js “文章标题序号 == `.toc-link` 序号”的滚动高亮索引；编号、层级、class 与内置输出一致，无 hideToggle 的页面输出逐字不变。
2. 交互：点击目录链接时捕获阶段监听器同步把目标标题的所有闭合 details 祖先置 `open`，main.js 随后读取的滚动位置已包含展开布局；滚动高亮落入闭合目录组时由 MutationObserver 自动展开并标记 `has-active`；hash 直达在现代浏览器由原生 fragment 导航自动展开 details 覆盖，脚本仅在块仍闭合时兜底展开并定位。
3. 验证中确认的既有行为：现代 Chrome 闭合 details 以 content-visibility 隐藏内容，保留布局盒但移出可滚动高度，因此闭合块内标题无法通过页面滚动激活目录高亮，滚动联动只在块展开后生效；主题目录点击落点 90px 与高亮阈值 80px 存在既有偏差，点击后高亮暂落前一条标题、轻微滚动后归位，与本次改动无关。

**验证结果**：

- [x] 两个新 JS `node --check` 通过；改动文件 `git diff --check` 通过
- [x] `npm run clean && npm run build` 两次成功（各 2,370 个文件）；构建后 `git status` 无扫描器改写差异
- [x] 生成态断言：rustTips 目录含 1 个分组、标题为“一些看起来很“正确”的解答”、组内编号 2.1.1–2.1.6、HTML 标签平衡、`.toc-link` 总数 9 与文章 h1–h6 数一致；逐篇解析全部含 hideToggle 文章的生成 HTML，仅 rustTips 块内含标题（其余块内无标题，正确地不产生分组）；无 hideToggle 文章目录与改动前逐字一致；首页与 about 页不加载新资源；生成 CSS/JS 与源文件逐字一致
- [x] Headless Chrome CDP 21 项交互断言全过（桌面 1440、移动 375、hash 直达、无 hideToggle 文章回归）：默认双闭合、summary 开合、点击组内链接展开内容块并滚动到位、滚动高亮自动展开目录组、`has-active` 标记
- [x] 目录视觉截图复核：箭头随展开旋转、长标题悬挂缩进、白字/绿色激活与既有目录配色一致
- [ ] 真实移动设备触摸、Safari/Firefox 原生 details 行为差异、PJAX 开启后的重初始化待人工回归

**遗留问题**：

- 闭合 hideToggle 块内标题无法通过页面滚动激活目录高亮（浏览器对闭合 details 的既有行为），主要阅读路径为点击目录组链接展开内容块。
- 仅本地实施；未提交、未推送、未部署。

**对齐修正（2026-08-06）**：用户复核指出折叠箭头相对文字偏高。原实现按假定行高用 `calc(8px + 0.72em - 5px)` 绝对定位锚定首行，与实际行高不符；已改为 `inline-block + vertical-align: middle` 的内联基线对齐（不再依赖行高猜测），`padding-left: 14px` + `text-indent: -14px` 保留折行悬挂缩进。clean build 通过（2,370 个文件），DPR 2 截图确认闭合/展开两态箭头与文字中线对齐、折行缩进正确。

**公告发布（2026-08-06）**：同日已在 `source/_data/announcements.yml` 顶部追加第 22 期公告（复用 `/imgs/gifs/1.webp`，未替换 GIF）；构建期校验通过（`已校验 22 期公告`），首页、文章页、归档页生成态断言通过（当前公告为第 22 期、上一期已折叠为历史 details、时间 `2026-08-06T10:13:56+08:00` 正确显示）。

---

### #53 — 2026-08-10 — 首页轮播修复布局偏移并换装 Windows XP 平面窗口风格（仅本地实施）

**操作人**：Kimi Code

**涉及文件**：

- `source/css/swiper-xp.css` — 新增；XP 窗口平面风格轮播样式，作为插件 `custom_css` 完全替代原 CDN `swiperstyle.css`
- `source/css/swiper-lib.min.css` — 新增；Swiper 4.1.6 核心样式，从 `node_modules/hexo-butterfly-swiper/lib/` 原样复制
- `source/js/swiper-lib.min.js` — 新增；Swiper 4.1.6 核心脚本，同上原样复制
- `source/js/swiper-init.js` — 新增；初始化脚本同上复制，追加 `fadeEffect.crossFade: true`（非激活 slide 强制透明，防叠印）
- `_config.butterfly.yml` — `swiper` 节 4 个资源 URL 由 `npm.elemecdn.com` CDN 改为本地路径
- `themes/butterfly/source/css/styles.css` — 修复布局偏移根因（见下）

**操作详情**：

用户反馈首页轮播（hexo-butterfly-swiper）内容错误显示到容器右侧外部，且不喜欢原有蓝紫渐变样式，要求重新设计为平面设计风格、适配移动端响应式、带 Windows XP 窗口复古感，并用 ego-browser 验证。

根因链（已验证，ego-browser 运行时取证）：

1. `styles.css` 的 `#recent-posts.waterfall-masonry .blog-slider` 规则含 `overflow: visible !important`（2026-07-10 瀑布流重写时引入），覆盖了 Swiper 容器必需的 `overflow: hidden`，slide 溢出不再被裁剪；
2. swiper 核心 CSS/JS 与样式补丁全部走 `npm.elemecdn.com` CDN 异步/defer 加载，CDN 晚到或失败时 slide 以插件模板硬编码的 `width: 750px` 裸排，溢出部分直接可见；
3. 初始化脚本 fade 效果未开 `crossFade`，实测多张 slide 同时 `opacity: 1` 互相叠印。

改动要点（代码事实）：

1. **资源本地化**：4 个 swiper 资源从 elemecdn 迁移到 `source/css/`、`source/js/`，消除 CDN 单点故障（cdn-strategy.md L6.2 认可的恢复策略）；插件注入方式（`media="print" onload` 异步 CSS、defer JS）不变。
2. **XP 窗口平面风格**（`swiper-xp.css`，不依赖主题 CSS 变量、不随 dark 模式变化）：纯平 `#0058e6` 标题栏（`::before` 绘制，含四色 Windows 徽标四层 linear-gradient 与「精选文章.exe」标题文字，`pointer-events: none`）；`::after` 以 11 层多重 background 绘制装饰性最小化/最大化/关闭按钮组；深色 `#1e2431` 内容区（初版为米白 `#f5f3ea`，同日按用户反馈深色化，见文末修正段）+ 3px 蓝边框 + 4px 硬阴影；图片直角 + 深色衬底 `#141922` + 灰蓝控件边框 `#5d7a9e`；日期为蓝色小标签，标题亮蓝白 `#9ecbff` 单行截断，描述 `#c3cad7` 两行截断；「详情」按钮深色平面化、悬浮变蓝；分页器改为底部深色状态栏（`#171d28` + `#394152` 分隔线），bullet 为深色小方块、激活态为蓝色长条；保留原 stagger 入场动画并补 `prefers-reduced-motion` 关闭；移动端（≤768px）slide 纵向堆叠、图片全宽 150px 高、文字居中。
3. **styles.css 修复**：`#recent-posts.waterfall-masonry .blog-slider` 删除 `overflow: visible !important`、`border-radius`、两条 `padding-top !important`（保留 margin/z-index 布局职责并留注释警示）；渐变组合选择器中移除 `#swiper_container`（aside/archive/page 染色不变）。

**验证结果**：

- [x] `npm run clean && npm run build` 成功（2,386 个文件）；构建后 `git status` 无扫描器改写差异；`git diff --check` 通过
- [x] 生成态断言：`public/index.html` 的 4 个 swiper 资源引用全部为本地路径；`public/css/styles.css` 不再含作用于 `.blog-slider` 的 `overflow: visible`（剩余 3 处均属瀑布流容器既有设计）；`#swiper_container` 渐变染色选择器已移除（仅剩历史注释块）
- [x] ego-browser 桌面（2544px）实测：容器 `overflow: hidden`、0 张 slide 溢出、crossFade 后仅 1 张 slide 可见、分页器在容器内底部状态栏、标题栏 `::before` 内容/蓝底生效；文字 computed style 正确（早前米白版截图验证标题/描述色值与 opacity，深色化后复测标题 `#9ecbff`、描述 `#c3cad7`、内容区 `#1e2431`、状态栏 `#171d28`）
- [x] ego-browser 移动断点（375×812 DPR 2）实测：slide `flex-direction: column`、图片 311×150 全宽、0 张 slide 溢出、分页器在容器内、页面无横向滚动
- [x] 分页器点击切换实测通过（active bullet 索引与 slide 标题同步变化）；autoplay 在多次截图间确认运行
- [x] 桌面/移动截图复核：标题栏徽标文字、三按钮、米白内容区、状态栏分页、硬阴影均符合设计
- [ ] 真实移动设备触摸滑动、Safari/Firefox、PJAX 开启状态待人工回归；elemecdn 其余依赖（tag_plugins、envelope）未动

**深色化修正（2026-08-10）**：同日用户复核要求窗口内部改为深色模式、顶部蓝色标题栏不变。已将内容区由米白 `#f5f3ea` 改为 `#1e2431`，图片衬底、详情按钮、分页状态栏与 bullet 同步深色化，标题改亮蓝白 `#9ecbff`、描述改 `#c3cad7`；标题栏、窗口蓝边框与硬阴影保持不变。clean build（2,386 个文件）与 ego-browser 桌面/移动断点复测通过。

**遗留问题**：

- swiper 资源本地化后不再随插件 CDN 更新（原 `@1.0.12` 锁版本，行为等价；Swiper 4.1.6 版本较旧是既有事实）。
- 原 swiperstyle.css 的全局 `* { box-sizing: border-box }` 随 CDN 样式一并下线；新 XP 样式内部已显式声明 box-sizing，主题其余部分未观察到依赖该全局规则的异常（桌面/移动截图复核通过）。
- 仅本地实施；未提交、未推送、未部署。

---

### #54 — 2026-08-10 — 首页瀑布流卡片换装 XP 窗口风格并移除激光涟漪浮层（仅本地实施）

**操作人**：Kimi Code

**涉及文件**：

- `themes/butterfly/source/css/_page/waterfall-homepage.styl` — 重写卡片视觉部分；布局重置、响应式宽度、侧边栏与分页规则保留
- `themes/butterfly/source/js/waterfall.js` — 删除激光/涟漪全部代码（约 250 行），瀑布流布局控制器逐字保留

**操作详情**：

用户要求把首页轮播（#53）的 XP 窗口平面风格推广到瀑布流每张卡片：不改布局逻辑、保留标题/封面/标签等元素、删除封面信息区的鼠标浮层效果（#12 激光、#13 轨迹涟漪、#15 星空透窗玻璃）、重新设计悬浮动效并合理设计触屏响应。同日复核后将窗口内部定为深色模式、蓝色标题栏不变。

改动要点（代码事实）：

1. **XP 窗口卡片**：`.post-card-wrapper` 深色 `#1e2431` 内容区（初版米白，同日按用户反馈深色化）+ 3px 灰蓝 `#7f9db9` 边框 + `10px 10px 4px 4px` 圆角 + `3px 3px 0` 平面硬阴影；`::before` 绘制标题栏（非激活灰蓝 `#97a9cb`、四色徽标、`content: 'article_' counter(xp-window, decimal-leading-zero) '.exe'` 用 CSS 计数器给每个窗口编号）、`::after` 以 11 层多重 background 绘制装饰按钮组（与轮播同一组图层）；封面直角 + 深色衬底 `#141922` + 灰蓝控件边框；标题亮蓝白 `#9ecbff`、摘要 `#c3cad7`、日期灰蓝 `#8a94a6` + 亮蓝图标；标签改为深色 XP 平面按钮（`#262e3d` 底 + `#5d7a9e` 边），悬浮蓝底白字。
2. **悬浮动效重新设计为「窗口激活」语义**（纯 CSS，零 JS 监听器）：桌面细指针 hover 时标题栏点亮为 `#0058e6`、边框变蓝、按钮组 opacity 0.55→1、硬阴影加深为 `5px 5px 0`、封面 `brightness(1.06)`，不再有旧版的浮起位移与封面放大；`:focus-within` 全局同样激活（键盘无障碍 + 触屏点选反馈）；触屏/粗指针媒体查询下全部窗口常激活，`:active` 点按给下沉反馈（阴影压至 `1px 1px 0`、标题栏 `#003da8`、封面 `brightness(0.94)`）；`prefers-reduced-motion` 关闭全部过渡。
3. **JS 净化**：waterfall.js 删除 `prepareRippleLayers`、`observeLaserPreferences`、`syncLaserTracking`、`handleLaserEnter/Move/Leave`、`queueRipple`、`scheduleLaserPaint/paintLaserEffect/spawnRipple/resetLaserEffect` 及相关字段、`REDUCED_MOTION_QUERY` 与 destroy 内的涟漪清理；布局逻辑（列数计算、绝对定位、ResizeObserver、媒体查询、图片 settle、PJAX 接线）逐字保留。
4. **选择器勘误**：旧 styl 把 `.tags` 嵌套在 `.article-meta` 内，而自定义 `indexPostUI.pug` 的生成结构中 `.tags` 与 `.article-meta` 平级（同为 `.article-meta-wrap` 子级），旧标签规则从未命中（实际生效的是 `styles.css:973` 的通用半透明胶囊规则）；新样式按真实 DOM 书写并以更高优先级 + `!important` 覆盖该通用规则。styles.css 遗留的桌面封面 `:hover scale(1.05)`（约 1021 行）由激活规则中的 `transform: none` 压制。

**验证结果**：

- [x] `node --check` waterfall.js、Stylus 独立编译、`npm run clean && npm run build`（2,386 个文件）、`git diff --check` 全部通过；构建后无扫描器改写差异
- [x] 生成态断言：`public/css/index.css` 含 XP 窗口规则与 `counter(xp-window)`，`waterfall-ripple`/`is-laser-active`/`--glass-*` 在 CSS 与 JS 产物中均为 0
- [x] ego-browser 桌面（2544px）实测：卡片深色 `#1e2431`、标题栏非激活灰蓝与窗口编号徽标生效、涟漪层 DOM 不存在、瀑布流 absolute+transform 定位正常；hover 第二张卡片实测标题栏点亮 `#0058e6`、边框变蓝、按钮组 opacity 1、阴影 `5px 5px 0`、封面 `brightness(1.06)` 且 `transform: none`，相邻卡片保持非激活（截图复核激活/非激活对比）
- [x] ego-browser 移动断点（375×812 DPR 2 + 触摸仿真）实测：`pointer: coarse`/`hover: none` 命中时全部卡片常激活蓝标题栏、单列布局、页面无横向滚动、深色配色与标签按钮截图复核通过
- [ ] 触屏 `:active` 按压反馈因 CDP 合成触摸事件无法触发 `:active` 伪类而未获运行时证据（CSS 规则已静态存在），与真实设备触摸手感、Safari/Firefox、PJAX 开启状态一并不待人工回归

**遗留问题**：

- `Emulation.setTouchEmulationEnabled` 模拟环境中，dispatchTouchEvent 后 `pointer: coarse` 媒体特性会回退为桌面值（仿真怪癖，真实设备硬件能力恒定，不影响线上）；ego-browser 触屏媒体验证需在 reload 后立即读取、不可先发触摸事件。
- `styles.css` 中 `.article-meta .tags ...` 系列选择器（约 827/833/943/956/964/1041/1047 行）因同样的平级结构问题从未命中，属无害死规则，本次未顺手清理。
- 仅本地实施；未提交、未推送、未部署。

---
