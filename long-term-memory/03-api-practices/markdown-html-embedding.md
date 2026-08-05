# Markdown 内嵌 HTML 渲染规范

> 适用范围：`source/_posts/*.md` 中直接编写 HTML 卡片、按钮、布局容器、内联样式或交互片段的场景。
> 核心背景：本项目 Markdown 渲染器为 `kramed`。在文章内嵌复杂 HTML 时，**外层 `<div>` 内部的嵌套 `<div>` 之间不能出现空行断层**；否则 `kramed` 可能提前结束 HTML 块，后续缩进内容会被当作代码块或普通文本输出。

## 1. 什么时候必须读

- 在文章正文中插入 `<div>`、`<style>`、`<script>`、`<a>` 等 HTML 结构前。
- 在 Markdown 文章中设计仓库卡片、提示卡片、跳转按钮、数据大字报等复杂内容前。
- 当预览中出现 HTML 源码、异常灰色代码块、大面积空白或卡片结构断裂时。

## 2. 核心规则

| 规则 | 要求 | 原因 |
| --- | --- | --- |
| 外层 div 内部不要空行断层 | 同一个外层 `<div>` 包裹的嵌套 `<div>`、`<p>`、`<a>` 等元素之间不要插入空白行 | `kramed` 可能把空行视为 HTML 块结束 |
| 嵌套 HTML 可换行但要连续 | 复杂结构可以保留普通换行，但不要在子元素之间留空行；高风险时再压缩为连续 HTML | 避免后续缩进 HTML 被识别为代码块 |
| 样式使用独立 class 前缀 | 例如 `.memory-repo-*` | 降低全站 CSS 污染风险 |
| 不在 HTML 块内混写 Markdown | 链接、加粗、代码标记优先使用原生 HTML | 避免 Markdown 二次解析破坏 DOM |
| 外链必须安全 | `<a target="_blank">` 同时加 `rel="noopener noreferrer"` | 避免新窗口反向控制来源页面 |
| 移动端必须适配 | 复杂卡片至少提供 `@media (max-width: 768px)` | 防止移动端溢出或布局挤压 |
| 深色模式要考虑 | 使用 `[data-theme='dark']` 覆盖关键颜色 | Butterfly 主题支持深浅色切换 |
| HTML 块之间必须空行分隔 | `</style>`、卡片外层 `</div>` 等独立 HTML 块的闭合标签之后，与后续内容之间必须留空行（或处于文件末尾） | kramed 的 html block 规则要求闭合标签后紧跟 `\n{2,}` 或文件尾，否则整块匹配失败被降级为段落，触发 `<br>` 注入与弯引号污染 |
| raw HTML 图片用相对 asset 路径 | 卡片内 `<img>` 的 src 与 markdown 图片写法一致（`post-name/img.webp`），不写死 `/年/月/日/` 开头的绝对路径 | `hexo-asset-image` 会统一改写为 permalink 路径；绝对路径会被二次拼接导致 404 |

## 3. 推荐写法

### 3.1 CSS 可以独立成块

`<style>` 块本身可以保留正常 CSS 换行，便于维护。HTML 主体也不是完全不能换行，真正要避免的是：**外层 `<div>` 内部的子元素之间出现空白行**。如果卡片结构已经在预览中异常，再把 HTML 主体压缩为连续结构。

```html
<style>
.custom-card { margin: 1rem 0; }
[data-theme='dark'] .custom-card { color: #e2e8f0; }
</style>
<div class="custom-card"><div class="custom-card-title">标题</div><p>正文</p></div>
```

### 3.2 HTML 主体可换行，但子元素之间不要空行

推荐：

```html
<div class="custom-card">
  <div class="custom-card-title">标题</div>
  <p>正文</p>
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">查看链接</a>
</div>
```

高风险或已出现异常时，可压缩为连续结构：

```html
<div class="custom-card"><div class="custom-card-title">标题</div><p>正文</p><a href="https://example.com" target="_blank" rel="noopener noreferrer">查看链接</a></div>
```

不推荐：

```html
<div class="custom-card">
  <div class="custom-card-title">标题</div>

  <p>正文</p>

  <a href="https://example.com">查看链接</a>
</div>
```

上述不推荐写法的问题不是“有换行”，而是外层 `<div class="custom-card">` 内部的子元素之间有空白行。部分 `kramed` 渲染场景下，空行后的缩进 HTML 可能被当作代码块显示。

## 4. 仓库卡片类组件规范

设计仓库卡片、项目卡片或工具卡片时，建议包含以下信息：

| 模块 | 建议内容 |
| --- | --- |
| 标识 | 项目名、类型标签、图标 |
| 简介 | 1 段 50-120 字说明 |
| 指标 | 3-4 个短指标，如入口文件、目录数量、核心原则 |
| 流程 | 用短 token 展示核心方法链路 |
| 标签 | 3-6 个关键词 |
| 动作 | GitHub / 文档 / Demo 跳转按钮 |

样式约束：

- class 使用唯一前缀，如 `.memory-repo-*`、`.project-card-*`。
- 不直接覆盖 `h1`、`p`、`a`、`code` 等全局标签样式。
- 使用 `!important` 仅限链接颜色等被主题强覆盖的地方。
- 卡片外边距控制在组件根节点，避免上下文出现大面积空白。

## 5. 排查流程

当文章预览中 HTML 显示异常时，按以下顺序处理：

1. 检查外层 `<div>` 内部的子元素之间是否存在空白行。
2. 检查空白行后的 HTML 是否带有 2 个以上空格缩进。
3. 先删除外层 div 内部空行；若仍异常，再将复杂 HTML 主体压缩为连续结构。
4. 检查是否在 HTML 内混写了 Markdown 链接、列表或代码块。
5. 检查标签是否闭合，尤其是 `<div>`、`<a>`、`span>`。
6. 若仍异常，再考虑拆成主题 CSS / JS 文件，不继续在 Markdown 中堆复杂交互。

## 6. 案例记录

### 案例一：Long-termMemoryTemplate 仓库卡片

`source/_posts/Long-termMemoryTemplate.md` 中插入仓库卡片时，HTML 主体内多个空行导致 `kramed` 将中后段 `<div>` 结构识别为代码块，页面出现大面积灰色源码块。

最终修复方式：

- 保留 `<style>` 中的可读 CSS。
- 将卡片 HTML 主体压缩为连续结构。
- 保持 `.memory-repo-*` 前缀隔离样式。
- 外链按钮使用 `target="_blank" rel="noopener noreferrer"`。

### 案例二：rustTips 传送门卡片（2026-08-05）

`source/_posts/rustTips.md` 插入 Rust 风格传送门卡片时，为遵守"外层 div 内部不留空行"，把 `</style>` 与卡片 `<div>` 也紧贴排列。kramed 的 html block 正则（`closed`/`closing` 分支要求闭合标签后紧跟 `\n{2,}` 或文件尾）因此匹配失败：`<style>` 与整个卡片被降级为段落，`breaks: true` 在 CSS 每行注入 `<br>`，`smartypants: true` 把字体名直引号替换为弯引号，卡片 DOM 被 `<p>` 包裹截断。此外卡片内 `<img>` 最初写死 `/2026/08/05/rustTips/3.webp` 绝对路径，被 `hexo-asset-image` 二次拼接成 `/2026/08/05/rustTips/08/05/rustTips/3.webp`。

最终修复方式：

- `</style>` 后保留一个空行；卡片 HTML 主体压缩为单行连续结构，置于文末（否则末尾也需空行）。
- 卡片内 `<img>` 的 src 改用与 markdown 一致的相对 asset 路径（`rustTips/3.webp`），由插件改写为 permalink 路径。
- 验证：`hexo clean && hexo generate` 后确认 `public/2026/08/05/rustTips/index.html` 无 `<p><style>`、无 `<br>`/弯引号污染；桌面 900px 与移动 390px 无头 Chrome 截图确认卡片结构完整。

## 7. 验证状态

- 已确认文件规则沉淀完成。
- 渲染效果仍需通过本地 `hexo server` 或发布前预览人工确认。
