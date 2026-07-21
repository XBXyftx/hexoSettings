# 侧栏公告历史时间轴

> **当前状态（2026-07-21）**：公告历史时间轴已在本地实现并通过构建；顶部新增第 21 期首页星空亮度与文章阅读可读性升级公告，继续复用现有 `/imgs/gifs/1.webp`，不替换公告 GIF。当前公告数据尚未推送；形成提交后可补记 `source_commit`。

## 目标与最终设计

将 Butterfly 原本只能显示 `aside.card_announcement.content` 单期 HTML 的公告卡，升级为：

1. 当前公告与历史公告共存；
2. 每一期展示精确发布时间；
3. 纵向时间轴可滚动浏览；
4. 维护入口独立于主题配置，新增公告只需在 YAML 顶部添加一个结构化条目；
5. 历史数据有 Git commit 可追溯，旧远程图片不会在读者页面重新发起请求；
6. 数据异常在生成阶段失败，而不是发布后静默显示错误内容。

## 数据入口

唯一公告正文入口：`source/_data/announcements.yml`。

- 顶层为数组；
- **严格按 `published_at` 从新到旧排列**；
- 最新一期始终放在最上方；
- 文本使用 `lead / title / items / paragraphs / closing` 等结构化字段，不写 HTML；
- `published_at` 使用带时区的完整 ISO 8601 时间，例如 `'2026-07-15T20:30:00+08:00'`；
- 本地图片必须同时填写 `src / alt / width / height`；
- `source_commit` 用于记录该历史公告来自哪个 Git commit，可在公告提交后补记；
- 旧远程图片只保存在 `archived_image_url` 中作为追溯元数据，模板不会渲染该字段。

新增一期的最小模板：

```yaml
- id: 2026-07-15-203000-short-topic
  published_at: '2026-07-15T20:30:00+08:00'
  lead: 新公告的开场文字
  title: 本期更新：
  items:
    - 第一项更新
    - 第二项更新
  closing: 结语
```

带本地图片时：

```yaml
  image:
    src: /imgs/example.webp
    alt: 图片内容说明
    width: 1200
    height: 675
```

`npm run webp` 的引用更新脚本当前不会扫描 `source/_data/*.yml`，因此公告图片应直接使用最终 WebP 路径，不要先写 JPG/PNG 再依赖脚本替换。

## 主题配置

`_config.butterfly.yml` 只保留开关和交互参数：

```yaml
card_announcement:
  enable: true
  history:
    initial_visible: 3
    date_format: 'YYYY年MM月DD日 HH:mm'
  content: '旧版 HTML 兜底……'
```

- `enable`：关闭整张公告卡；
- `history.initial_visible`：初始展示的公告期数，必须为正整数；其余期数由“查看全部”按钮展开；
- `history.date_format`：Hexo/Moment 日期展示格式；
- `content`：只在数据文件不存在时兼容旧站，不再作为日常编辑入口。

## 渲染与交互

### 静态结构

`themes/butterfly/layout/includes/widget/card_announcement.pug` 读取 `site.data.announcements`：

- 第一期直接展开并标记“当前公告”；
- 其余每期使用原生 `<details>/<summary>`，键盘可操作且没有 JavaScript 也能阅读；
- 发布时间使用 `<time datetime="…">`；
- 文本字段使用 Pug 转义输出，避免恢复旧版任意 HTML 注入模式；
- 所有公告图片均使用 `loading="lazy"`，避免公告卡位于页面下方时每页无条件下载动画资源；所有本地图都保留真实尺寸属性；
- `archived_image_url`、`source_commit` 等档案字段不会输出到页面。

### 时间轴样式

`themes/butterfly/source/css/announcement-history.css` 提供：

- 纵向轴线、节点、当前公告徽标；
- `max-height: min(70vh, 620px)` 的卡内纵向滚动区域；
- 历史摘要隐藏浏览器原生小三角，在摘要右侧显示自定义箭头，避免与时间轴圆点重叠；
- 移动端高度和缩进适配；
- 展开按钮、历史折叠项、图片比例和焦点样式；
- `prefers-reduced-motion` 下停止喇叭摇动及新增过渡。

样式由 `themes/butterfly/layout/includes/head.pug` 同步加载，避免依赖原有异步 `styles.css` 后才出现正确布局。旧 `.announcementImg` 规则已从 `styles.css` 移除，避免重复和无效的 img flex 属性。

### 轻量脚本

`themes/butterfly/source/js/announcement-history.js` 只负责：

- 初始隐藏超过 `initial_visible` 的历史条目；
- 切换“查看全部 / 收起历史公告”和 `aria-expanded`；
- 在 `DOMContentLoaded` 与 `pjax:complete` 幂等初始化。

每一期自身的展开/收起由原生 `<details>` 处理；脚本失败时，全部公告仍保留在 HTML 中并可阅读。

## 构建期校验

`scripts/announcement-history-validator.js` 在 `before_generate` 阶段检查：

- 顶层必须是非空数组；
- ID 必填、格式正确且不重复；
- 发布时间必须是带时区的完整 ISO 8601 时间，并严格倒序；
- 正文字段和数组字段类型正确，不能生成空公告；
- 本地图片必须存在且配置宽高必须与真实图片完全一致，外部 URL 与越过 `source/` 的路径会被拒绝；
- 公告/图片未知字段会被拒绝，避免拼写错误导致内容静默丢失；
- `initial_visible` 必须为正整数，`date_format` 必须为非空字符串；
- 数据文件缺失时仅警告并使用旧 `content` 兜底。

校验失败会中止构建并列出全部错误，避免错误档案被发布。

## 历史数据恢复

当前档案已在顶部追加第 21 期、2026-07-21 的首页星空与文章阅读可读性升级公告：

- 首页瀑布流信息区直接透出既有全屏 `#universe` 星空，保留六组深色玻璃差异，不复制 Canvas、粒子或 RAF；
- 背景与顶部封面星体统一为更明亮、更大的冷蓝白色，仍保持原有粒子数量、速度、30fps 和尾迹预算；
- 移除文章卡片标题/摘要暗色雾层与标签暗色底，保留轻量文字投影；Butterfly `flat note` 浅色提示块内改用近黑色文字，提升可读性。

此前顶部公告为第 20 期、2026-07-20 的首页水纹与文章夜空背景视觉升级公告：

- 首页瀑布流水波改为更短、更小的青绿白柔边光晕，避免停留时间过长或扩散范围过大；
- 文章主内容区改为能透出背景图的黑深蓝夜空磨砂，并以淡青色星点和浅青白文字保持清晰度；
- 该公告继续复用 `/imgs/gifs/1.webp`，不新增或替换 GIF 资源。

此前顶部公告为第 19 期、2026-07-20 的 Markdown 工作台深度升级公告：

- 工作台改为本地优先的 VS Code 风格 Markdown 编辑与安全预览界面；
- 修复背景缺失、分栏错位、预览越界和全屏底部黑区；
- 全屏默认左右分屏，并提供更醒目的源码/分屏/预览切换按钮；
- 公告继续复用 `/imgs/gifs/1.webp`，不新增或替换 GIF 资源。

此前顶部公告为第 18 期、2026-07-16 的“昨日重现”图库重构公告：

- “昨日重现”采用 manifest 驱动的真正近视口懒加载、统一并发队列、稳定尺寸占位和双向滚动浮现；
- 旧 IndexedDB 图片副本与虚假的清除浏览器缓存语义已移除，改为当前会话随机顺序重排；
- 新增可配置 WebP 压缩工具，本次仅 dry-run，未修改图库原图。

首批从本地 `_config.butterfly.yml` Git 历史恢复 16 期公告；历史时间轴上线公告为第 17 期，图库重构公告为第 18 期，Markdown 工作台公告为第 19 期，首页夜空视觉公告为第 20 期，本次星空与可读性升级后共 21 期：

- 范围：`cf106d3`（2025-01-25）至 `5c8d00a`（2026-07-12）；
- 同日真实文案修订分别保留，用精确提交时间排序；
- 明显的 `sshtest` 部署/调试内容未纳入读者可见历史；
- `/imgs/HM5.jpg`、`/imgs/ClaudeCode.png`、`/imgs/gifs/1.gif` 已映射到仓库现存的 `.webp`；
- 旧 `bu.dusays.com` 图片没有自动抓取，只将原 URL 保存到 `archived_image_url`，因此不会重新引入外部资源依赖。

## 验证记录（2026-07-15）

- [x] `node --check scripts/announcement-history-validator.js`
- [x] `node --check themes/butterfly/source/js/announcement-history.js`
- [x] `git diff --check`
- [x] `npm run clean && npm run build` 成功
- [x] 构建日志：`[Announcement History] 已校验 17 期公告`
- [x] 首页、归档页、文章页生成结果均为 1 张公告卡、17 期公告
- [x] 当前公告 1 期、历史 `<details>` 16 期、初始隐藏 14 期
- [x] 当前时间、正文、图片 `560×315` 和原生 lazy 状态正确
- [x] 在 `TZ=UTC` 构建时仍显示公告原始 `+08:00` 墙钟时间，不受构建机时区影响
- [x] 校验失败用例：无效日历日期、未知字段、外部图片、source 路径越界、非法交互配置均被拒绝
- [x] 公告专属 CSS/JS 与 3 个本地历史图片资源均生成
- [x] 生成公告图片中没有 `bu.dusays.com` 请求
- [x] 系统 Chrome + CDP 真实页面回归：1440px 桌面时间轴 `620/928px`、375px 移动时间轴 `552/834px`，均确认纵向可滚动且无横向溢出
- [x] Chrome 点击回归：“查看全部”将隐藏项从 13 降到 0，`aria-expanded` 由 `false` 变为 `true`，历史 `<details>` 可正常打开
- [x] Chrome 移动端确认原生 summary marker 不再绘制，箭头位于摘要右侧且与时间轴圆点分离
- [x] 1024px 首页确认沿用既有规则隐藏整个 aside，本功能没有产生单卡异常显示
- [x] 2026-07-15 新公告已追加到 YAML 顶部，复用 `/imgs/gifs/1.webp` 并记录功能提交 `d48549b`

## 发布前仍需人工检查

已使用系统 Chrome + CDP 完成桌面/移动截图、查看全部、历史 `<details>` 与 1024px 既有隐藏边界验证；项目仍未新增 Playwright/Puppeteer/jsdom 依赖。发布前建议再做人工实机检查：

- 768 / 769 / 900 / 1025px 临界断点与触摸滚动；
- 普通文章、标签/分类页的实际视觉（生成结构已验证）；
- 仅键盘操作 `<summary>` 和“查看全部”；
- 暗色、阅读模式、侧栏隐藏和真实 PJAX 切页；
- `prefers-reduced-motion` 会停止喇叭 CSS 动画和新增过渡，但当前 `1.webp` 本身是动画 WebP；仓库尚无同画面的可信静态帧，无法只靠 CSS 停止其内部帧播放。后续如补充静态 poster，应使用 `<picture media="(prefers-reduced-motion: reduce)">` 替换，而不是伪造资源；
- 769–1024px 首页现有侧栏隐藏行为是否符合预期（这是原瀑布流样式与移动端覆盖规则的既有边界，不由本功能改写）。

## 升级与回滚

Butterfly 升级时必须恢复三个主题入口：

1. `layout/includes/widget/card_announcement.pug`
2. `layout/includes/head.pug` 的公告 CSS
3. `layout/includes/additional-js.pug` 的公告 JS

以及保留主题资源：

- `source/css/announcement-history.css`
- `source/js/announcement-history.js`

回滚新功能时，可恢复旧 `card_announcement.pug` 并移除上述 CSS/JS 入口；`source/_data/announcements.yml` 可继续作为纯历史档案保留，不会自行影响页面。
