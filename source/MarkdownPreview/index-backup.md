---
title: Markdown语法指南与在线编辑器
date: 2025-06-04 10:00:00
description: 详细的Markdown语法介绍和使用指南，包含在线编辑器
keywords: Markdown, 语法, 指南, 教程, 在线编辑器
---

<style>
.markdown-editor-container {
    margin: 20px 0;
    border: 1px solid #444;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    background: #1e1e1e;
}

.editor-header {
    background: #2d2d30;
    padding: 10px 15px;
    border-bottom: 1px solid #444;
    font-weight: bold;
    color: #ffffff;
}

.editor-content {
    display: flex;
    height: 500px;
    background: #1e1e1e;
}

.editor-pane {
    flex: 1;
    position: relative;
}

.editor-pane:first-child {
    border-right: 1px solid #444;
}

.pane-header {
    background: #252526;
    padding: 8px 12px;
    font-size: 12px;
    color: #cccccc;
    border-bottom: 1px solid #444;
}

.markdown-input {
    width: 100%;
    height: calc(100% - 32px);
    border: none;
    outline: none;
    padding: 15px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    background: #1e1e1e;
    color: #d4d4d4;
}

.markdown-input::placeholder {
    color: #6a6a6a;
}

.markdown-preview {
    height: calc(100% - 32px);
    overflow-y: auto;
    padding: 15px;
    background: #1e1e1e;
    color: #d4d4d4;
}

.markdown-preview h1, .markdown-preview h2, .markdown-preview h3,
.markdown-preview h4, .markdown-preview h5, .markdown-preview h6 {
    margin-top: 0;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: #ffffff;
}

.markdown-preview h1 { font-size: 2em; border-bottom: 1px solid #444; padding-bottom: 10px; }
.markdown-preview h2 { font-size: 1.5em; border-bottom: 1px solid #444; padding-bottom: 8px; }
.markdown-preview h3 { font-size: 1.25em; }
.markdown-preview h4 { font-size: 1em; }
.markdown-preview h5 { font-size: 0.875em; }
.markdown-preview h6 { font-size: 0.85em; color: #cccccc; }

.markdown-preview p {
    margin-bottom: 16px;
    color: #d4d4d4;
}

.markdown-preview code {
    background: #2d2d30;
    border-radius: 3px;
    font-size: 85%;
    margin: 0;
    padding: 0.2em 0.4em;
    color: #f92672;
    border: 1px solid #444;
}

.markdown-preview pre {
    background: #2d2d30;
    border-radius: 6px;
    font-size: 85%;
    line-height: 1.45;
    overflow: auto;
    padding: 16px;
    border: 1px solid #444;
}

.markdown-preview pre code {
    background: transparent;
    border: 0;
    display: inline;
    line-height: inherit;
    margin: 0;
    max-width: auto;
    overflow: visible;
    padding: 0;
    word-wrap: normal;
    color: #a6e22e;
}

.markdown-preview blockquote {
    border-left: 4px solid #569cd6;
    color: #cccccc;
    margin: 0;
    padding: 0 16px;
    background: rgba(86, 156, 214, 0.1);
}

.markdown-preview table {
    border-collapse: collapse;
    border-spacing: 0;
    display: block;
    margin-bottom: 16px;
    overflow: auto;
    width: 100%;
}

.markdown-preview table th,
.markdown-preview table td {
    border: 1px solid #444;
    padding: 6px 13px;
    color: #d4d4d4;
}

.markdown-preview table th {
    background: #2d2d30;
    font-weight: 600;
    color: #ffffff;
}

.markdown-preview ul, .markdown-preview ol {
    margin-bottom: 16px;
    padding-left: 2em;
    color: #d4d4d4;
}

.markdown-preview li {
    margin-bottom: 4px;
    color: #d4d4d4;
}

.markdown-preview a {
    color: #569cd6;
    text-decoration: none;
}

.markdown-preview a:hover {
    color: #9cdcfe;
    text-decoration: underline;
}

.markdown-preview strong {
    color: #ffffff;
    font-weight: bold;
}

.markdown-preview em {
    color: #d4d4d4;
    font-style: italic;
}

.markdown-preview del {
    color: #888888;
    text-decoration: line-through;
}

.markdown-preview hr {
    border: none;
    border-top: 1px solid #444;
    margin: 24px 0;
}

.editor-toolbar {
    background: #2d2d30;
    border-bottom: 1px solid #444;
    padding: 8px 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.toolbar-btn {
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: #d4d4d4;
}

.toolbar-btn:hover {
    background: #4a4a4a;
    border-color: #777;
    color: #ffffff;
}

.toolbar-separator {
    width: 1px;
    height: 20px;
    background: #555;
    margin: 0 4px;
}

.markdown-editor-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
    margin: 0;
}

.markdown-editor-container.fullscreen .editor-content {
    height: calc(100vh - 120px);
}

@media (max-width: 768px) {
    .editor-content {
        flex-direction: column;
        height: auto;
    }
    
    .editor-pane:first-child {
        border-right: none;
        border-bottom: 1px solid #444;
    }
    
    .markdown-input, .markdown-preview {
        height: 300px;
    }
    
    .markdown-editor-container.fullscreen .editor-content {
        height: calc(100vh - 100px);
    }
    
    .markdown-editor-container.fullscreen .markdown-input,
    .markdown-editor-container.fullscreen .markdown-preview {
        height: calc(50vh - 50px);
    }
}

.markdown-input::-webkit-scrollbar,
.markdown-preview::-webkit-scrollbar {
    width: 8px;
}

.markdown-input::-webkit-scrollbar-track,
.markdown-preview::-webkit-scrollbar-track {
    background: #2d2d30;
}

.markdown-input::-webkit-scrollbar-thumb,
.markdown-preview::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
}

.markdown-input::-webkit-scrollbar-thumb:hover,
.markdown-preview::-webkit-scrollbar-thumb:hover {
    background: #777;
}
</style>

# 🚀 Markdown编辑器

体验实时的Markdown编辑与预览功能！在左边输入Markdown源码，右边即时查看渲染效果。

<div class="markdown-editor-container">
    <div class="editor-header">
        🖊️ Markdown在线编辑器
    </div>
    <div class="editor-toolbar">
        <button class="toolbar-btn" onclick="insertText('**', '**')" title="粗体">B</button>
        <button class="toolbar-btn" onclick="insertText('*', '*')" title="斜体">I</button>
        <button class="toolbar-btn" onclick="insertText('~~', '~~')" title="删除线">S</button>
        <button class="toolbar-btn" onclick="insertText('`', '`')" title="行内代码">&lt;/&gt;</button>
        <button class="toolbar-btn" onclick="insertText('[', '](url)')" title="链接">🔗</button>
        <button class="toolbar-btn" onclick="insertText('![', '](url)')" title="图片">🖼️</button>
        <button class="toolbar-btn" onclick="insertHeading()" title="标题"># H</button>
        <button class="toolbar-btn" onclick="insertList()" title="列表">📝</button>
        <button class="toolbar-btn" onclick="insertQuote()" title="引用">💬</button>
        <button class="toolbar-btn" onclick="insertTable()" title="表格">📊</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" onclick="toggleFullscreen()" title="全屏/退出全屏" id="fullscreen-btn">🔳</button>
        <button class="toolbar-btn" onclick="downloadMarkdown()" title="下载Markdown文件">💾</button>
        <button class="toolbar-btn" onclick="downloadHTML()" title="下载HTML文件">📄</button>
        <button class="toolbar-btn" onclick="clearEditor()" title="清空">🗑️</button>
    </div>
    <div class="editor-content">
        <div class="editor-pane">
            <div class="pane-header">📝 Markdown源码</div>
            <textarea id="markdown-input" class="markdown-input" placeholder="在这里输入Markdown内容...">## 欢迎使用Markdown编辑器

这是一个**实时预览**的Markdown编辑器。

### 功能特色

- ✨ **实时预览** - 边写边看效果
- 🎨 **语法高亮** - 清晰的代码展示
- 📱 **响应式设计** - 适配各种设备
- 🔧 **工具栏** - 快速插入常用语法

### 试试这些语法

1. **粗体文字**
2. *斜体文字*
3. ~~删除线~~
4. `行内代码`

> 这是一个引用块
> 可以包含多行内容

```javascript
// 代码块示例
function hello() {
    console.log("Hello Markdown!");
}
```

| 表格 | 演示 | 示例 |
|------|------|------|
| 单元格1 | 单元格2 | 单元格3 |
| 数据A | 数据B | 数据C |

---

**开始你的Markdown创作之旅吧！** 🚀</textarea>
        </div>
        <div class="editor-pane">
            <div class="pane-header">👁️ 实时预览</div>
            <div id="markdown-preview" class="markdown-preview">
                <!-- 预览内容将在这里显示 -->
            </div>
        </div>
    </div>
</div>

<script src="./marked.min.js"></script>
<script>
// 配置marked选项
marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false
});

const input = document.getElementById('markdown-input');
const preview = document.getElementById('markdown-preview');

// 实时预览函数
function updatePreview() {
    const markdownText = input.value;
    const htmlContent = marked.parse(markdownText);
    preview.innerHTML = htmlContent;
}

// 监听输入事件
input.addEventListener('input', updatePreview);
input.addEventListener('scroll', function() {
    const scrollPercent = input.scrollTop / (input.scrollHeight - input.clientHeight);
    preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
});

// 插入文本函数
function insertText(before, after = '') {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end);
    const newText = before + selectedText + after;
    
    input.value = input.value.substring(0, start) + newText + input.value.substring(end);
    input.focus();
    input.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    updatePreview();
}

// 工具栏功能
function insertHeading() {
    const start = input.selectionStart;
    const lineStart = input.value.lastIndexOf('\n', start - 1) + 1;
    input.setSelectionRange(lineStart, lineStart);
    insertText('## ');
}

function insertList() {
    const start = input.selectionStart;
    const lineStart = input.value.lastIndexOf('\n', start - 1) + 1;
    input.setSelectionRange(lineStart, lineStart);
    insertText('- ');
}

function insertQuote() {
    const start = input.selectionStart;
    const lineStart = input.value.lastIndexOf('\n', start - 1) + 1;
    input.setSelectionRange(lineStart, lineStart);
    insertText('> ');
}

function insertTable() {
    const tableText = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
`;
    insertText(tableText);
}

function clearEditor() {
    if (confirm('确定要清空编辑器内容吗？')) {
        input.value = '';
        updatePreview();
        input.focus();
    }
}

// 全屏功能
function toggleFullscreen() {
    const container = document.querySelector('.markdown-editor-container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    if (container.classList.contains('fullscreen')) {
        container.classList.remove('fullscreen');
        fullscreenBtn.innerHTML = '🔳';
        fullscreenBtn.title = '全屏';
        document.body.style.overflow = 'auto';
    } else {
        container.classList.add('fullscreen');
        fullscreenBtn.innerHTML = '🔲';
        fullscreenBtn.title = '退出全屏';
        document.body.style.overflow = 'hidden';
    }
}

// 下载Markdown文件
function downloadMarkdown() {
    const content = input.value;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 下载HTML文件
function downloadHTML() {
    const markdownContent = input.value;
    const htmlContent = marked.parse(markdownContent);
    
    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown文档</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
        blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding: 0 16px; color: #6a737d; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
        th { background: #f6f8fa; }
    </style>
</head>
<body>${htmlContent}</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 键盘快捷键
input.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'b':
                e.preventDefault();
                insertText('**', '**');
                break;
            case 'i':
                e.preventDefault();
                insertText('*', '*');
                break;
            case 'k':
                e.preventDefault();
                insertText('[', '](url)');
                break;
            case 's':
                e.preventDefault();
                downloadMarkdown();
                break;
        }
    }
    
    if (e.key === 'Tab') {
        e.preventDefault();
        insertText('    ');
    }
    
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
    
    if (e.key === 'Escape') {
        const container = document.querySelector('.markdown-editor-container');
        if (container && container.classList.contains('fullscreen')) {
            e.preventDefault();
            toggleFullscreen();
        }
    }
});

// 初始化预览
updatePreview();
</script>

---

# 📝 Markdown语法指南

Markdown是一种轻量级标记语言，它允许您使用易读易写的纯文本格式编写文档。

## ✨ 为什么使用Markdown？

- 🔄 **简单易学** - 语法简洁，容易掌握
- 🎨 **专注内容** - 专注于内容而非格式
- 📱 **跨平台** - 支持各种编辑器和平台
- 💾 **纯文本** - 易于版本控制和分享
- 🔄 **可转换** - 可转换为HTML、PDF等格式 