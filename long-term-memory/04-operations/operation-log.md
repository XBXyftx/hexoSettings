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
