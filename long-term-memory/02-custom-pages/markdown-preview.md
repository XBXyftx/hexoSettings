---
name: Markdown 本地工作台实现
description: CodeMirror 6、Web Worker、DOMPurify 与 IndexedDB 构成的离线优先 Markdown 编辑和安全预览页面
type: project
---

# Markdown 本地工作台

> **何时阅读**：编辑器无法加载、预览/草稿/导入导出异常、升级 CodeMirror 或 marked 依赖时。
> **边界**：`/MarkdownPreview/` 仅在浏览器本地处理文档；不会读取、写入或上传博客仓库文件。

## L1 · 当前能力

- 保留原有的粗体、斜体、删除线、行内代码、链接、图片、标题、列表、引用、表格、全屏、下载与清空功能。
- 使用本地 CodeMirror 6 提供 Markdown 高亮、行号、当前行、括号匹配、代码折叠、Tab 缩进、搜索替换与命令面板。
- 使用 IndexedDB 自动保存当前草稿；支持 `.md` / `.markdown` 本地导入、拖放和以可编辑文件名下载。
- 使用本地 `marked v9.1.2` Web Worker 解析并以 DOMPurify 始终净化预览；脚本、事件属性、危险 URL、iframe 等不会执行。
- 宽工作台默认分屏，提供标题大纲、可拖拽分栏、双向百分比同步滚动；工作台自身宽度不超过 900px 时自动切换为源码/预览/大纲单面板模式。
- 桌面进入全屏后默认恢复左右分屏，并在标题栏显示高对比度的大尺寸源码/分屏/预览切换组；退出全屏后恢复进入前的视图模式，窄屏仍保留单面板逻辑。

## L2 · 文件与构建链

```text
source/MarkdownPreview/
├── index.md                         # 页面外壳与原有 Markdown 语法教程
├── marked.min.js                    # Worker 使用的本地 Markdown 解析器
├── workbench/workbench.js           # CodeMirror、交互、存储与安全渲染入口
├── workbench/workbench.worker.js    # 后台 marked 解析
├── workbench/workbench.css          # 平面化 VS Code 风格界面
├── workbench/workbench.bundle.js    # esbuild 产物，必须随源码提交
└── workbench/workbench.bundle.css   # esbuild 样式产物，必须随源码提交
tools/build-markdown-preview.js       # 本地打包脚本
```

`npm run build:markdown-preview` 会打包工作台；`npm run build` 的 `prebuild` 钩子会先执行它。所有运行时依赖均由 `package.json` 固定版本并打包到站内文件，无 CDN 依赖。

工作台挂载后必须给根节点添加 `.mdw-shell`；该类负责完整不透明背景、五行应用壳网格、边界裁切和全屏高度。响应式由 `ResizeObserver` 根据工作台自身宽度切换 `.mdw-compact`，不能只依赖浏览器 viewport，否则主题内容栏较窄时仍会错误保留三栏。

## L3 · 数据与安全

本地文档模型为 `id`、`title`、`content`、`updatedAt`、`editorView`、`previewMode`，保存键为浏览器 IndexedDB 的 `markdown-workbench/active-document`。隐私浏览、禁用 IndexedDB 或浏览器清理站点数据时，自动保存可能不可用；下载文件是用户保留草稿的可靠方式。

预览允许常规 Markdown 生成的文本、表格、图片和链接；所有链接都使用 `target="_blank" rel="noopener noreferrer"`。不提供“信任本文档”绕过开关，避免粘贴的不可信内容在博客页面执行。

## L4 · 快捷键与验证重点

| 快捷键 | 行为 |
| --- | --- |
| `Ctrl/Cmd+B` | 粗体 |
| `Ctrl/Cmd+I` | 斜体 |
| `Ctrl/Cmd+K` | 链接 |
| `Ctrl/Cmd+F` | 搜索与替换 |
| `F1` / `Ctrl/Cmd+Shift+P` | 命令面板 |
| `Tab` | 编辑器缩进 |
| `Esc` | 退出全屏 |

修改后至少执行 `npm run build:markdown-preview`、`git diff --check`，再按授权执行 `npm run clean && npm run build`。浏览器验证应覆盖桌面和移动断点、13 个工具栏命令、导入/导出、草稿恢复、全屏、长文滚动和恶意 HTML/URL 净化。

## L5 · 保留文件

- `index-backup.md` 与 `index-backup-original.md` 是公开历史归档，不要删除或作为新实现入口修改。
- `marked.min.js` 保持在原路径；移动它会使 Worker 预览失败。
