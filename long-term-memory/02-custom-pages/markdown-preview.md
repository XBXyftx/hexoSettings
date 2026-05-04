---
name: Markdown 在线编辑器实现
description: 基于 marked.js 的实时 Markdown 预览编辑器 — 工具栏、全屏模式、快捷键、文件保存、同步滚动
type: project
---

# Markdown 在线编辑器 — 实现

> **何时阅读**：编辑器不渲染、工具栏按钮失效、marked.js 版本问题、新增编辑功能时。
> **关联文档**：[cdn-strategy.md](../03-api-practices/cdn-strategy.md)（marked.js 本地加载，无 CDN 依赖）

---

## L1 · TL;DR

- `/MarkdownPreview/` 是一个**实时 Markdown 编辑与预览工具**，左侧编辑、右侧预览。
- **依赖**：`marked.js`（本地加载 `./marked.min.js`），不依赖任何 CDN。
- **功能**：13 个工具栏按钮 + 4 个快捷键 + 全屏模式 + 保存为文件 + 同步滚动。
- **样式**：暗色主题（`#1a1a1a` 系），紫色强调色，独立 CSS（~700 行内联）。

---

## L2 · 架构

```text
index.md
├── <style> (~700 行暗色主题 CSS)
├── HTML 结构
│   ├── .editor-header      # 标题栏
│   ├── .editor-toolbar     # 13 个按钮
│   └── .editor-content
│       ├── .editor-pane    # 左侧 textarea
│       └── .editor-pane    # 右侧 #markdown-preview
├── <script src="./marked.min.js">
└── <script> (~300 行编辑器逻辑)
```

---

## L3 · marked.js 配置

```js
marked.setOptions({
  gfm: true,          // GitHub Flavored Markdown
  breaks: true,       // 换行即 <br>
  headerIds: false,   // 不生成 header id
  mangle: false       // 不混淆 email
});
```

---

## L4 · 工具栏按钮

| 按钮 | 插入内容 | 行为 |
|---|---|---|
| **B** 粗体 | `**text**` | 包裹选中文本 |
| *I* 斜体 | `*text*` | 包裹选中文本 |
| ~~S~~ 删除线 | `~~text~~` | 包裹选中文本 |
| `</>` 代码 | `` `text` `` | 包裹选中文本 |
| 🔗 链接 | `[text](url)` | 包裹选中文本 |
| 🖼️ 图片 | `![text](url)` | 包裹选中文本 |
| # 标题 | `## line` | Toggle 标题级别（1-6 循环，超过 6 则移除） |
| 📝 列表 | `- line` | Toggle 无序列表 |
| 💬 引用 | `> line` | Toggle 引用块 |
| 📊 表格 | `| 列1 | 列2 | 列3 | ...` | 插入 3 列表格 |
| ⛶ 全屏 | — | fixed 定位铺满视口 |
| 💾 保存 | — | Blob → download link → `markdown-document.md` |
| 🗑️ 清空 | — | confirm → 清空 textarea |

---

## L5 · 快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl+B` | 粗体 |
| `Ctrl+I` | 斜体 |
| `Ctrl+K` | 链接 |
| `Tab` | 插入 4 空格缩进 |
| `ESC` | 退出全屏 |

---

## L6 · 同步滚动

```js
input.addEventListener('scroll', () => {
  const scrollPercent = input.scrollTop / (input.scrollHeight - input.clientHeight);
  preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
});
```

单向同步（编辑器 → 预览），按百分比映射。**不是精确的行对行映射**，长文档差异较大。

---

## L7 · 全屏模式

```css
.fullscreen-mode {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
}
.fullscreen-mode .editor-content {
  height: calc(100vh - 120px);
}
```

ESC 键退出全屏（textarea keydown + document keydown 双重监听）。

---

## L8 · 保存功能

```js
const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
const url = URL.createObjectURL(blob);
// 创建 <a download="markdown-document.md"> → click → revoke
```

纯前端实现，不经过服务器。文件名为 `markdown-document.md`。

---

## L9 · 红线

| # | 红线 | 后果 |
|---|---|---|
| R1 | 删除或移动 `marked.min.js` | 编辑器不工作，预览区空白 |
| R2 | 把 CSS `background` 中的 `linear-gradient` 换成纯色 | 失去暗色主题质感 |
| R3 | 在编辑器中输入 `</textarea>` | 破坏 HTML 结构 |

---

## L10 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 编辑器页面 | `source/MarkdownPreview/index.md` |
| marked.js | `source/MarkdownPreview/marked.min.js` |
| 备用页面 | `source/MarkdownPreview/index-backup.md` |
| CDN 替代参考 | `source/MarkdownPreview/cdn-alternatives.md` |
