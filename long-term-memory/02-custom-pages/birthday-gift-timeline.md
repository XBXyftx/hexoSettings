# 生日礼物时间轴页面（birthday-gift）

> **当前实现文档**：此文档描述 `/birthday-gift/` 的现行版本。历史五幕剧方案已归档到 [`05-reference/birthday-gift-page-design.md`](../05-reference/birthday-gift-page-design.md)，不要把归档方案当作当前实现。

---

## L1 · 何时阅读

修改以下内容前先读本文件：

- `/birthday-gift/` 页面结构、顶部标题、视觉样式
- 成长事件的展示逻辑、相册/视频弹层、整屏滚动
- `source/birthday-gift/events/` 的扫描结果异常
- 生日页与全局懒加载、图片尺寸注入、主题样式的冲突

只新增或修改事件文案/图片时，优先读 [`source/birthday-gift/README.md`](../../source/birthday-gift/README.md)，本文件作为背景理解。

---

## L2 · 当前状态一眼看懂

| 项 | 当前值 |
|---|---|
| 入口 | `/birthday-gift/` |
| 页面定位 | 送给妈妈的生日礼物；主体内容是“我的成长历程” |
| 主页面 | `source/birthday-gift/index.html` |
| 交互脚本 | `source/js/birthday-gift.js` |
| 数据扫描器 | `scripts/birthday-gift-scanner.js` |
| 事件目录 | `source/birthday-gift/events/*/index.md` |
| 事件编写指南 | `source/birthday-gift/README.md` |
| 数据产物 | `source/birthday-gift/events-data.json` / `public/birthday-gift/events-data.json` |
| 主题关系 | `layout: false`，不依赖 Butterfly 主题 DOM/CSS/JS |

顶部固定区域当前必须表达礼物语境：

- 主标题：`给妈妈的生日礼物`
- 副标题：`把我的成长与感谢，慢慢讲给你听`
- 样式入口：`source/birthday-gift/index.html` 中的 `.topbar` 与 `.gift-heading`

---

## L3 · 文件职责

| 文件/目录 | 职责 | 修改注意 |
|---|---|---|
| `source/birthday-gift/index.html` | 独立 HTML、内联 CSS、顶部标题、背景层、相册/大图/视频弹层 DOM | 页面绕过主题，样式必须自包含 |
| `source/js/birthday-gift.js` | 加载事件 JSON、整屏滚动、键盘/触摸导航、文字块独立滚动、媒体弹层、流星 Canvas | 修改滚动/媒体/性能逻辑时同步验证移动端 |
| `scripts/birthday-gift-scanner.js` | 扫描事件目录、解析 front matter、渲染 Markdown、识别媒体文件、生成 JSON | 数据字段变更必须与前端同步 |
| `source/birthday-gift/events/` | 每个子目录是一条成长事件 | 正常新增事件不需要改 HTML/JS |
| `source/birthday-gift/imgs/` | 通用背景图等页面资源 | 背景路径由事件 front matter 引用 |
| `source/birthday-gift/README.md` | 面向作者的事件编写指南 | 新增媒体命名规则时同步更新 |

---

## L4 · 数据流

1. 作者在 `source/birthday-gift/events/xx-name/index.md` 写事件 front matter 和正文。
2. 图片/视频放在同一个事件目录下。
3. 运行 Hexo 构建或本地预览时，`scripts/birthday-gift-scanner.js` 在 `before_generate` 阶段扫描事件。
4. 扫描器生成 `events-data.json`。
5. 前端 `source/js/birthday-gift.js` 加载 JSON，并渲染整屏时间轴。

PowerShell 下优先使用 `npm.cmd`，避免 `npm.ps1` 被执行策略拦截。

---

## L5 · 关键交互与性能策略

- **整屏切换**：鼠标滚轮、触摸滑动、键盘方向键切换事件页。
- **文字块滚动**：长文案在 `.memory-body` 内独立滚动；未滚到边缘时不触发整屏切换。
- **媒体展示**：主页只展示相册堆叠/缩略信息；打开相册后再加载详情；点击图片/视频再加载原图或播放器。
- **快速放图**：事件目录中 `01.jpg`、`02.webp` 等普通图片会被识别为相册图片；`bg`、`background`、`cover`、`poster` 等保留名不会被当作相册媒体。
- **完整媒体命名**：需要精细控制缩略图/原图/视频封面时，继续使用 `thumb-*`、`photo-*`、`video-*`、`thumb-video-*`。
- **无媒体事件**：不显示空相册，改用抽象记忆视觉和流星 Canvas。
- **流星性能**：Canvas 有 FPS 节流、移动端降采样、`visibilitychange` 暂停，避免后台持续占用。
- **背景清晰度**：背景虚化保持在可辨识主体轮廓的程度，当前为较轻的 `blur(12px)` 级别。

---

## L6 · 滚动性能优化方案（2026-05-07）

**基线 commit**：`7f4a6f9`（生日页面滚动优化开始前的内容与长期记忆基线）。

用户反馈整屏滚动时有卡顿掉帧，本轮优化要求尽量不改变视觉效果，优先做幕后性能治理。执行顺序：

1. **切换期间降负载**：整屏切换开始时给 `.birthday-app` 增加过渡状态，暂停中央光带火花、底部提示、非必要流星帧，切换结束后恢复。
2. **离屏动画暂停**：无媒体事件的 `.memory-orbit` 只在当前 active 面板内运行动画，离屏面板保持静态，避免多个隐藏轨道持续占用合成/绘制资源。
3. **DOM 查询缓存**：页面渲染后缓存 panels/backgrounds/dots，事件切换时只更新上一个和当前元素，避免每次滚动全量 `querySelectorAll()`。
4. **背景/图片预加载去重**：背景预加载使用 Set/Map 去重，并尽量用 `decode()` 提前解码；相邻事件继续预加载但避免重复创建 `Image`。
5. **CSS 合成边界收敛**：背景滤镜保持视觉强度，但不再把 `filter` 纳入过渡动画；给关键容器增加 `contain`/`backface-visibility`，减少重绘扩散。
6. **验证优先级**：先验证滚轮整屏切换、文字块内部滚动、无媒体流星页、相册打开；如仍卡顿，再考虑虚拟化事件 DOM 或预处理虚化背景图。

## L7 · 修改后验证

推荐最小验证：

```bash
npm.cmd run build
```

验证点：

- `public/birthday-gift/index.html` 中能找到 `给妈妈的生日礼物`
- `public/birthday-gift/events-data.json` 包含新增/修改的事件
- 有普通图片的事件能显示相册入口
- 无媒体事件仍能显示流星/抽象视觉
- 长文案可在文字块内用滚轮滚动

---

## L7 · 相关记录

- 需求约束：[`02-requirements/生日页面需求文档.md`](../02-requirements/生日页面需求文档.md)
- 作者事件指南：[`source/birthday-gift/README.md`](../../source/birthday-gift/README.md)
- 主要实现记录：[`04-operations/operation-log.md`](../04-operations/operation-log.md) #9、#10、#11
- 历史归档方案：[`05-reference/birthday-gift-page-design.md`](../05-reference/birthday-gift-page-design.md)
