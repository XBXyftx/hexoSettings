---
title: Markdown语法指南与在线编辑器
date: 2025-06-04 10:00:00
description: 详细的Markdown语法介绍和使用指南，包含在线编辑器
keywords: Markdown, 语法, 指南, 教程, 在线编辑器
---

<style>
.markdown-editor-container {
    margin: 20px 0;
    border: 1px solid transparent;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
        0 8px 32px rgba(0,0,0,0.3),
        0 0 0 1px rgba(255,255,255,0.1);
    background: linear-gradient(145deg, #1a1a1a 0%, #2d2d30 100%);
    position: relative;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.markdown-editor-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg,
        rgba(147, 112, 219, 0.1) 0%,
        rgba(138, 43, 226, 0.1) 25%,
        rgba(75, 0, 130, 0.1) 50%,
        rgba(138, 43, 226, 0.1) 75%,
        rgba(147, 112, 219, 0.1) 100%);
    background-size: 400% 400%;
    opacity: 0;
    border-radius: 16px;
    animation: gradientShift 6s ease-in-out infinite;
    transition: opacity 0.3s ease;
    z-index: 1;
}

.markdown-editor-container:hover::before {
    opacity: 1;
}

.markdown-editor-container:hover {
    transform: translateY(-2px);
    box-shadow:
        0 12px 48px rgba(0,0,0,0.4),
        0 0 0 1px rgba(147, 112, 219, 0.3),
        0 0 20px rgba(147, 112, 219, 0.2);
}

.editor-header {
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.2) 0%,
        rgba(138, 43, 226, 0.2) 50%,
        rgba(75, 0, 130, 0.2) 100%);
    padding: 15px 20px;
    border-bottom: 1px solid rgba(147, 112, 219, 0.3);
    font-weight: 600;
    color: #ffffff;
    position: relative;
    z-index: 2;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(147, 112, 219, 0.1);
}

.editor-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(147, 112, 219, 0.1) 50%,
        transparent 100%);
    animation: headerShine 3s ease-in-out infinite;
}

.editor-toolbar {
    background: linear-gradient(135deg,
        rgba(45, 45, 48, 0.9) 0%,
        rgba(60, 60, 60, 0.9) 100%);
    border-bottom: 1px solid rgba(147, 112, 219, 0.2);
    padding: 12px 16px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    position: relative;
    z-index: 2;
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.toolbar-btn {
    background: linear-gradient(135deg,
        rgba(60, 60, 60, 0.8) 0%,
        rgba(80, 80, 80, 0.8) 100%);
    border: 1px solid rgba(147, 112, 219, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    color: #d4d4d4;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    box-shadow:
        0 2px 4px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.1);
}

.toolbar-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(147, 112, 219, 0.3) 50%,
        transparent 100%);
    transition: left 0.5s ease;
}

.toolbar-btn:hover::before {
    left: 100%;
}

.toolbar-btn:hover {
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.3) 0%,
        rgba(138, 43, 226, 0.3) 100%);
    border-color: rgba(147, 112, 219, 0.6);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow:
        0 4px 12px rgba(147, 112, 219, 0.3),
        inset 0 1px 0 rgba(255,255,255,0.2);
}

.toolbar-btn:active {
    transform: translateY(0);
    box-shadow:
        0 2px 4px rgba(0,0,0,0.3),
        inset 0 1px 0 rgba(255,255,255,0.1);
}

.editor-content {
    display: flex;
    height: 500px;
    background: linear-gradient(135deg,
        rgba(30, 30, 30, 0.95) 0%,
        rgba(40, 40, 42, 0.95) 100%);
    position: relative;
    z-index: 2;
}

.editor-pane {
    flex: 1;
    position: relative;
}

.editor-pane:first-child {
    border-right: 1px solid rgba(147, 112, 219, 0.2);
}

.pane-header {
    background: linear-gradient(135deg,
        rgba(37, 37, 38, 0.9) 0%,
        rgba(45, 45, 48, 0.9) 100%);
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(147, 112, 219, 0.9);
    border-bottom: 1px solid rgba(147, 112, 219, 0.2);
    backdrop-filter: blur(10px);
    box-shadow:
        0 1px 3px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.1);
    position: relative;
}

.pane-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(147, 112, 219, 0.5) 50%,
        transparent 100%);
    animation: headerPulse 2s ease-in-out infinite;
}

.markdown-input {
    width: 100%;
    height: calc(100% - 32px);
    border: none;
    outline: none;
    padding: 20px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    background: linear-gradient(135deg,
        rgba(26, 26, 28, 0.95) 0%,
        rgba(35, 35, 38, 0.95) 100%);
    color: #e6e6e6;
    transition: all 0.3s ease;
    position: relative;
}

.markdown-input::placeholder {
    color: rgba(147, 112, 219, 0.6);
    font-style: italic;
}

.markdown-input:focus {
    background: linear-gradient(135deg,
        rgba(30, 30, 32, 0.98) 0%,
        rgba(40, 40, 42, 0.98) 100%);
    color: #ffffff;
    box-shadow: inset 0 0 20px rgba(147, 112, 219, 0.1);
}

.markdown-preview {
    height: calc(100% - 32px);
    overflow-y: auto;
    padding: 20px;
    background: linear-gradient(135deg,
        rgba(22, 22, 24, 0.95) 0%,
        rgba(32, 32, 35, 0.95) 100%);
    color: #e6e6e6;
    position: relative;
}

.markdown-preview::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%,
        rgba(147, 112, 219, 0.02) 0%,
        transparent 70%);
    pointer-events: none;
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
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.15) 0%,
        rgba(138, 43, 226, 0.15) 100%);
    border-radius: 6px;
    font-size: 85%;
    margin: 0;
    padding: 0.3em 0.6em;
    color: #ff79c6;
    border: 1px solid rgba(147, 112, 219, 0.3);
    box-shadow:
        0 2px 4px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.1);
    transition: all 0.2s ease;
}

.markdown-preview code:hover {
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.25) 0%,
        rgba(138, 43, 226, 0.25) 100%);
    transform: translateY(-1px);
    box-shadow:
        0 4px 8px rgba(147, 112, 219, 0.3),
        inset 0 1px 0 rgba(255,255,255,0.2);
}

.markdown-preview pre {
    background: linear-gradient(135deg,
        rgba(20, 20, 22, 0.95) 0%,
        rgba(30, 30, 32, 0.95) 100%);
    border-radius: 12px;
    font-size: 85%;
    line-height: 1.5;
    overflow: auto;
    padding: 20px;
    border: 1px solid rgba(147, 112, 219, 0.2);
    box-shadow:
        0 4px 16px rgba(0,0,0,0.3),
        inset 0 1px 0 rgba(255,255,255,0.05);
    position: relative;
}

.markdown-preview pre::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(147, 112, 219, 0.5) 50%,
        transparent 100%);
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
    border-left: 4px solid transparent;
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.15) 0%,
        rgba(138, 43, 226, 0.1) 100%);
    color: #e6e6e6;
    margin: 16px 0;
    padding: 16px 20px;
    border-radius: 0 12px 12px 0;
    position: relative;
    box-shadow:
        0 2px 8px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.1);
}

.markdown-preview blockquote::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg,
        rgba(147, 112, 219, 0.8) 0%,
        rgba(138, 43, 226, 0.8) 50%,
        rgba(75, 0, 130, 0.8) 100%);
    border-radius: 2px;
}

.markdown-preview blockquote::after {
    content: '"';
    position: absolute;
    top: 8px;
    right: 16px;
    font-size: 24px;
    color: rgba(147, 112, 219, 0.4);
    font-family: Georgia, serif;
}

.markdown-preview table {
    border-collapse: collapse;
    border-spacing: 0;
    display: table;
    margin: 20px 0;
    overflow: hidden;
    width: 100%;
    border-radius: 12px;
    box-shadow:
        0 4px 16px rgba(0,0,0,0.3),
        0 0 0 1px rgba(147, 112, 219, 0.2);
    background: linear-gradient(135deg,
        rgba(30, 30, 32, 0.9) 0%,
        rgba(40, 40, 42, 0.9) 100%);
}

.markdown-preview table th,
.markdown-preview table td {
    border: none;
    border-bottom: 1px solid rgba(147, 112, 219, 0.2);
    padding: 12px 16px;
    color: #e6e6e6;
    position: relative;
    transition: all 0.3s ease;
}

.markdown-preview table tr:hover td {
    background: rgba(147, 112, 219, 0.1);
    transform: translateX(2px);
}

.markdown-preview table th {
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.3) 0%,
        rgba(138, 43, 226, 0.3) 100%);
    font-weight: 600;
    color: #ffffff;
    text-align: center;
    position: relative;
}

.markdown-preview table th::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
        rgba(147, 112, 219, 0.6) 0%,
        rgba(138, 43, 226, 0.6) 50%,
        rgba(147, 112, 219, 0.6) 100%);
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
    color: #8be9fd;
    text-decoration: none;
    position: relative;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.1) 0%,
        rgba(138, 43, 226, 0.05) 100%);
}

.markdown-preview a::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg,
        rgba(147, 112, 219, 0.8) 0%,
        rgba(138, 43, 226, 0.8) 100%);
    transition: width 0.3s ease;
}

.markdown-preview a:hover {
    color: #ffffff;
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.2) 0%,
        rgba(138, 43, 226, 0.15) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(147, 112, 219, 0.3);
}

.markdown-preview a:hover::before {
    width: 100%;
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

.fullscreen-mode {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    background: #1e1e1e !important;
    margin: 0 !important;
    border-radius: 0 !important;
}

.fullscreen-mode .editor-content {
    height: calc(100vh - 120px) !important;
}

.save-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg,
        rgba(147, 112, 219, 0.95) 0%,
        rgba(138, 43, 226, 0.95) 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    z-index: 10000;
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    font-size: 14px;
    font-weight: 500;
    box-shadow:
        0 8px 24px rgba(0,0,0,0.3),
        0 0 0 1px rgba(255,255,255,0.2),
        0 0 20px rgba(147, 112, 219, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
}

.save-notification::before {
    content: '💾';
    margin-right: 8px;
    font-size: 16px;
}

.save-notification.show {
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* 美丽的动画关键帧 */
@keyframes gradientShift {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

@keyframes headerShine {
    0%, 100% {
        transform: translateX(-100%);
        opacity: 0;
    }
    50% {
        transform: translateX(0);
        opacity: 0.5;
    }
}

@keyframes headerPulse {
    0%, 100% {
        opacity: 0.3;
        transform: scaleX(0.8);
    }
    50% {
        opacity: 0.8;
        transform: scaleX(1);
    }
}

@keyframes floatingParticles {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.5;
    }
    33% {
        transform: translateY(-10px) rotate(120deg);
        opacity: 0.8;
    }
    66% {
        transform: translateY(5px) rotate(240deg);
        opacity: 0.6;
    }
}

@keyframes sparkle {
    0%, 100% {
        transform: scale(0) rotate(0deg);
        opacity: 0;
    }
    50% {
        transform: scale(1) rotate(180deg);
        opacity: 1;
    }
}

/* 添加浮动装饰粒子 */
.editor-content::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 10%;
    width: 4px;
    height: 4px;
    background: radial-gradient(circle, rgba(147, 112, 219, 0.8) 0%, transparent 70%);
    border-radius: 50%;
    animation: floatingParticles 4s ease-in-out infinite;
    z-index: 1;
}

.editor-content::after {
    content: '';
    position: absolute;
    top: 60%;
    right: 15%;
    width: 3px;
    height: 3px;
    background: radial-gradient(circle, rgba(138, 43, 226, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    animation: floatingParticles 5s ease-in-out infinite 1s;
    z-index: 1;
}

/* 添加闪烁效果到工具栏按钮 */
.toolbar-btn:nth-child(3n)::after {
    content: '✨';
    position: absolute;
    top: -2px;
    right: -2px;
    font-size: 8px;
    opacity: 0;
    animation: sparkle 3s ease-in-out infinite;
    animation-delay: calc(var(--delay, 0) * 0.5s);
}
</style>

# 🚀 Markdown编辑器

体验实时的Markdown编辑与预览功能！在左边输入Markdown源码，右边即时查看渲染效果。

<div class="markdown-editor-container">
    <div class="editor-header">
        🖊️ Markdown在线编辑器
    </div>
    <div class="editor-toolbar">
        <button class="toolbar-btn" onclick="insertText('**', '**')" title="粗体 (Ctrl+B)">**B** 粗体</button>
        <button class="toolbar-btn" onclick="insertText('*', '*')" title="斜体 (Ctrl+I)">*I* 斜体</button>
        <button class="toolbar-btn" onclick="insertText('~~', '~~')" title="删除线">~~S~~ 删除线</button>
        <button class="toolbar-btn" onclick="insertText('`', '`')" title="行内代码">&lt;/&gt; 代码</button>
        <button class="toolbar-btn" onclick="insertText('[', '](url)')" title="链接 (Ctrl+K)">🔗 链接</button>
        <button class="toolbar-btn" onclick="insertText('![', '](url)')" title="图片">🖼️ 图片</button>
        <button class="toolbar-btn" onclick="insertHeading()" title="标题"># 标题</button>
        <button class="toolbar-btn" onclick="insertList()" title="列表">📝 列表</button>
        <button class="toolbar-btn" onclick="insertQuote()" title="引用">💬 引用</button>
        <button class="toolbar-btn" onclick="insertTable()" title="表格">📊 表格</button>
        <button class="toolbar-btn" onclick="toggleFullscreen()" title="全屏模式 (ESC退出)">⛶ 全屏</button>
        <button class="toolbar-btn" onclick="saveMarkdown()" title="保存为文件">💾 保存</button>
        <button class="toolbar-btn" onclick="clearEditor()" title="清空编辑器">🗑️ 清空</button>
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
document.addEventListener('DOMContentLoaded', function() {
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            gfm: true,
            breaks: true,
            headerIds: false,
            mangle: false
        });
    }
    const input = document.getElementById('markdown-input');
    const preview = document.getElementById('markdown-preview');
    function updatePreview() {
        if (input && preview && typeof marked !== 'undefined') {
            const markdownText = input.value;
            const htmlContent = marked.parse(markdownText);
            preview.innerHTML = htmlContent;
        }
    }
    // 保存编辑器状态的函数
    function saveEditorState() {
        return {
            scrollTop: input.scrollTop,
            selectionStart: input.selectionStart,
            selectionEnd: input.selectionEnd
        };
    }
    // 恢复编辑器状态的函数
    function restoreEditorState(state) {
        input.scrollTop = state.scrollTop;
        input.setSelectionRange(state.selectionStart, state.selectionEnd);
    }
    if (input) {
        input.addEventListener('input', updatePreview);
        input.addEventListener('scroll', function() {
            if (preview) {
                const scrollPercent = input.scrollTop / (input.scrollHeight - input.clientHeight);
                preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
            }
        });
    }
    window.insertText = function(before, after = '') {
        if (!input) return;
        // 保存编辑器当前滚动位置
        const scrollTop = input.scrollTop;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selectedText = input.value.substring(start, end);
        const newText = before + selectedText + after;
        input.value = input.value.substring(0, start) + newText + input.value.substring(end);
        input.focus();
        input.setSelectionRange(start + before.length, start + before.length + selectedText.length);
        // 恢复滚动位置
        input.scrollTop = scrollTop;
        updatePreview();
    };

    window.insertHeading = function() {
        if (!input) return;
        // 保存编辑器当前滚动位置
        const scrollTop = input.scrollTop;
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const lineStart = input.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = input.value.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? input.value.length : lineEnd;
        
        // 获取当前行内容
        const currentLine = input.value.substring(lineStart, actualLineEnd);
        
        // 检查是否已经是标题格式
        const headingMatch = currentLine.match(/^(#+)\s*/);
        let newText;
        
        if (headingMatch) {
            // 如果已经是标题，增加标题级别或移除
            const currentLevel = headingMatch[1].length;
            if (currentLevel >= 6) {
                // 移除标题格式
                newText = currentLine.replace(/^#+\s*/, '');
            } else {
                // 增加一个#
                newText = '#' + currentLine;
            }
        } else {
            // 添加二级标题
            newText = '## ' + currentLine;
        }
        
        input.value = input.value.substring(0, lineStart) + newText + input.value.substring(actualLineEnd);
        input.focus();
        input.setSelectionRange(lineStart + newText.length, lineStart + newText.length);
        
        // 恢复滚动位置
        input.scrollTop = scrollTop;
        
        updatePreview();
    };

    window.insertList = function() {
        if (!input) return;
        
        // 保存编辑器当前滚动位置
        const scrollTop = input.scrollTop;
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const lineStart = input.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = input.value.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? input.value.length : lineEnd;
        
        // 获取当前行内容
        const currentLine = input.value.substring(lineStart, actualLineEnd);
        
        // 检查是否已经是列表格式
        const listMatch = currentLine.match(/^(\s*)-\s*/);
        let newText;
        
        if (listMatch) {
            // 如果已经是列表，移除列表格式
            newText = currentLine.replace(/^(\s*)-\s*/, '$1');
        } else {
            // 添加列表格式
            newText = '- ' + currentLine;
        }
        
        input.value = input.value.substring(0, lineStart) + newText + input.value.substring(actualLineEnd);
        input.focus();
        input.setSelectionRange(lineStart + newText.length, lineStart + newText.length);
        
        // 恢复滚动位置
        input.scrollTop = scrollTop;
        
        updatePreview();
    };

    window.insertQuote = function() {
        if (!input) return;
        
        // 保存编辑器当前滚动位置
        const scrollTop = input.scrollTop;
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const lineStart = input.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = input.value.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? input.value.length : lineEnd;
        
        // 获取当前行内容
        const currentLine = input.value.substring(lineStart, actualLineEnd);
        
        // 检查是否已经是引用格式
        const quoteMatch = currentLine.match(/^(\s*)>\s*/);
        let newText;
        
        if (quoteMatch) {
            // 如果已经是引用，移除引用格式
            newText = currentLine.replace(/^(\s*)>\s*/, '$1');
        } else {
            // 添加引用格式
            newText = '> ' + currentLine;
        }
        
        input.value = input.value.substring(0, lineStart) + newText + input.value.substring(actualLineEnd);
        input.focus();
        input.setSelectionRange(lineStart + newText.length, lineStart + newText.length);
        
        // 恢复滚动位置
        input.scrollTop = scrollTop;
        
        updatePreview();
    };

    window.insertTable = function() {
        if (!input) return;
        
        // 保存编辑器当前滚动位置
        const scrollTop = input.scrollTop;
        
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        // 检查光标是否在行首，如果不是则添加换行符
        const beforeCursor = input.value.substring(0, start);
        const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
        const needsNewlineAfter = end < input.value.length && !input.value.substring(end).startsWith('\n');
        
        let tableText = '';
        if (needsNewlineBefore) tableText += '\n';
        tableText += '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |';
        if (needsNewlineAfter) tableText += '\n';
        
        // 直接插入文本而不使用insertText函数
        input.value = input.value.substring(0, start) + tableText + input.value.substring(end);
        
        // 将光标定位到第一个单元格内容
        const firstCellPos = start + (needsNewlineBefore ? 1 : 0) + 2; // "| "之后
        input.focus();
        input.setSelectionRange(firstCellPos, firstCellPos + 2); // 选中"列1"
        
        // 恢复滚动位置
        input.scrollTop = scrollTop;
        
        updatePreview();
    };

    window.clearEditor = function() {
        if (input && confirm('确定要清空编辑器内容吗？')) {
            input.value = '';
            updatePreview();
            input.focus();
        }
    };

    let isFullscreen = false;
    window.toggleFullscreen = function() {
        const container = document.querySelector('.markdown-editor-container');
        if (!container) return;
        
        if (!isFullscreen) {
            container.classList.add('fullscreen-mode');
            document.body.style.overflow = 'hidden';
            isFullscreen = true;
            
            // 更新按钮内容和提示
            const fullscreenBtn = event.target;
            fullscreenBtn.innerHTML = '⛶ 退出全屏';
            fullscreenBtn.title = '退出全屏模式 (ESC)';
        } else {
            container.classList.remove('fullscreen-mode');
            document.body.style.overflow = '';
            isFullscreen = false;
            
            // 更新按钮内容和提示
            const fullscreenBtn = event.target;
            fullscreenBtn.innerHTML = '⛶ 全屏';
            fullscreenBtn.title = '全屏模式 (ESC退出)';
        }
        
        // 重新调整预览区域
        updatePreview();
    };

    window.saveMarkdown = function() {
        if (!input) return;
        
        const content = input.value;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.download = 'markdown-document.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 显示保存通知
        showSaveNotification('文件已保存为 markdown-document.md');
    };

    function showSaveNotification(message) {
        // 移除已存在的通知
        const existingNotification = document.querySelector('.save-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    if (input) {
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
                }
            }
            
            if (e.key === 'Tab') {
                e.preventDefault();
                insertText('    ');
            }
            
            if (e.key === 'Escape' && isFullscreen) {
                toggleFullscreen();
            }
        });
    }

    // 添加ESC键全局监听
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) {
            toggleFullscreen();
        }
    });

    updatePreview();
});
</script>

---

# 📝 Markdown语法指南

下面是详细的Markdown语法教程和示例。

## ✨ 为什么使用Markdown？

- 🔄 **简单易学** - 语法简洁，容易掌握
- 🎨 **专注内容** - 专注于内容而非格式
- 📱 **跨平台** - 支持各种编辑器和平台
- 💾 **纯文本** - 易于版本控制和分享
- 🔄 **可转换** - 可转换为HTML、PDF等格式

---

## 📋 目录

- [标题](/MarkdownPreview/#🏷%EF%B8%8F-标题)
- [段落与换行](/MarkdownPreview/#📝-段落与换行)
- [文本强调](/MarkdownPreview/#✨-文本强调)
- [列表](/MarkdownPreview/#📃-列表)
- [链接](/MarkdownPreview/#🔗-链接)
- [图片](/MarkdownPreview/#🖼%EF%B8%8F-图片)
- [代码](/MarkdownPreview/#💻-代码)
- [表格](/MarkdownPreview/#📊-表格)
- [引用](/MarkdownPreview/#💬-引用)
- [任务列表](/MarkdownPreview/#✅-任务列表)
- [删除线](/MarkdownPreview/#📑-删除线)
- [表情符号](/MarkdownPreview/#😊-表情符号)
- [脚注](/MarkdownPreview/#📖-脚注)
- [数学公式](/MarkdownPreview/#🔢-数学公式)
- [高级语法](/MarkdownPreview/#🚀-高级语法)

---

## 🏷️ 标题

使用 `#` 来创建标题，支持1-6级标题：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

**效果展示：**

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

---

## 📝 段落与换行

### 段落

段落之间用空行分隔：

```markdown
这是第一个段落。

这是第二个段落。
```

### 换行

在行尾添加两个空格，或使用一个空行：

```markdown
这是第一行  
这是第二行

这是新的段落
```

---

## ✨ 文本强调

```markdown
*斜体文本* 或 _斜体文本_
**粗体文本** 或 __粗体文本__
***粗斜体文本*** 或 ___粗斜体文本___
```

**效果展示：**

*斜体文本* 或 _斜体文本_  
**粗体文本** 或 __粗体文本__  
***粗斜体文本*** 或 ___粗斜体文本___

---

## 📃 列表

### 无序列表

使用 `-`、`+` 或 `*`：

```markdown
- 项目一
- 项目二
  - 子项目 2.1
  - 子项目 2.2
- 项目三
```

**效果展示：**

- 项目一
- 项目二
  - 子项目 2.1
  - 子项目 2.2
- 项目三

### 有序列表

使用数字加点：

```markdown
1. 第一项
2. 第二项
   1. 子项目 2.1
   2. 子项目 2.2
3. 第三项
```

**效果展示：**

1. 第一项
2. 第二项
   1. 子项目 2.1
   2. 子项目 2.2
3. 第三项

---

## 🔗 链接

### 普通链接

```markdown
[链接文本](https://example.com)
[带标题的链接](https://example.com "这是标题")
```

### 自动链接

```markdown
<https://example.com>
<email@example.com>
```

### 参考式链接

```markdown
[Google][1]
[GitHub][github]

[1]: https://google.com
[github]: https://github.com
```

**效果展示：**

[链接文本](https://example.com)  
[带标题的链接](https://example.com "这是标题")  
<https://example.com>

---

## 🖼️ 图片

### 普通图片

```markdown
![替代文本](https://bu.dusays.com/2025/04/21/6805d63ef1902.webp)
![带标题的图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg "图片标题")
```

**效果展示：**

![替代文本](https://bu.dusays.com/2025/04/21/6805d63ef1902.webp)
![带标题的图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg "图片标题")

### 参考式图片

```markdown
![替代文本][图片ID]

[图片ID]: https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg "可选标题"
```

**效果展示：**

![替代文本][demo-image]

[demo-image]: https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg "演示图片"

### 图片链接

```markdown
[![图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.webp)](https://example.com)
```

**效果展示：**

[![图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.webp)](https://example.com)

---

## 💻 代码

### 行内代码

使用反引号包围：

```markdown
这是 `行内代码` 示例
```

**效果展示：** 这是 `行内代码` 示例

### 代码块

使用三个反引号：

````markdown
```javascript
function hello() {
    console.log("Hello, World!");
}
```
````

**效果展示：**

```javascript
function hello() {
    console.log("Hello, World!");
}
```

### 指定语言高亮

支持多种编程语言：

````markdown
```python
def hello():
    print("Hello, Python!")
```

```typescript
interface User {
    name: string;
    age: number;
}
```

```bash
npm install package-name
```
````

---

## 📊 表格

### 基本表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 行1 | 数据 | 数据 |
| 行2 | 数据 | 数据 |
```

### 对齐方式

```markdown
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 文本   | 文本     | 文本   |
| 内容   | 内容     | 内容   |
```

**效果展示：**

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 文本   | 文本     | 文本   |
| 内容   | 内容     | 内容   |

---

## 💬 引用

### 普通引用

```markdown
> 这是一个引用
> 可以跨越多行
```

### 嵌套引用

```markdown
> 第一级引用
>> 第二级引用
>>> 第三级引用
```

### 引用中的其他元素

```markdown
> ## 引用中的标题
> 
> 引用中的**粗体**和*斜体*
> 
> ```javascript
> // 引用中的代码
> console.log("Hello");
> ```
```

**效果展示：**

> 这是一个引用  
> 可以跨越多行

> ## 引用中的标题
> 
> 引用中的**粗体**和*斜体*

---

## ➖ 分割线

使用三个或更多的 `-`、`*` 或 `_`：

```markdown
---
***
___
```

---

## ✅ 任务列表

```markdown
- [x] 已完成的任务
- [ ] 未完成的任务
- [x] ~~已取消的任务~~
- [ ] 待办事项
  - [x] 子任务1
  - [ ] 子任务2
```

**效果展示：**

- [x] 已完成的任务
- [ ] 未完成的任务
- [x] ~~已取消的任务~~
- [ ] 待办事项
  - [x] 子任务1
  - [ ] 子任务2

---

## ~~📑~~ 删除线

```markdown
~~这是删除线文本~~
```

**效果展示：** ~~这是删除线文本~~

---

## 😊 表情符号

### 使用表情代码

```markdown
:smile: :heart: :thumbsup: :fire: :rocket:
```

### 直接使用Unicode表情

```markdown
😀 😃 😄 😁 😆 😅 😂 🤣
❤️ 💖 💕 💗 💓 💝 💟
👍 👎 👌 🤝 👏 🙌 🎉
```

**效果展示：**
😀 😃 😄 😁 😆 😅 😂 🤣  
❤️ 💖 💕 💗 💓 💝 💟  
👍 👎 👌 🤝 👏 🙌 🎉

---

## 📖 脚注

```markdown
这是一个有脚注的文本[^1]。

这是另一个脚注[^note]。

[^1]: 这是第一个脚注的内容。
[^note]: 这是命名脚注的内容。
```

---

## 🔢 数学公式

### 行内公式

```markdown
这是行内公式：$E = mc^2$
```

### 块级公式

```markdown
$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$
```

### 常用数学符号

```markdown
$\alpha, \beta, \gamma, \Delta, \pi, \sigma$
$\sum_{i=1}^{n} x_i$
$\int_0^{\infty} e^{-x} dx$
$\sqrt{x^2 + y^2}$
```

---

## 🚀 高级语法

### HTML标签

Markdown支持部分HTML标签：

```html
<details>
<summary>点击展开</summary>
这里是隐藏的内容
</details>

<mark>高亮文本</mark>

<kbd>Ctrl</kbd> + <kbd>C</kbd>
```

### 转义字符

使用反斜杠转义特殊字符：

```markdown
\* 这不是斜体 \*
\# 这不是标题
\[这不是链接\]
```

### 注释

```markdown
<!-- 这是注释，不会在渲染结果中显示 -->
```

---

## 💡 实用技巧

### 1. 目录生成

大多数Markdown编辑器支持自动生成目录：

```markdown
[TOC]
```

### 2. 语法高亮的语言标识符

常用的语言标识符：

- `javascript` / `js`
- `typescript` / `ts`  
- `python` / `py`
- `java`
- `c` / `cpp`
- `csharp` / `cs`
- `php`
- `html`
- `css`
- `scss` / `sass`
- `bash` / `shell`
- `json`
- `xml`
- `yaml`
- `markdown` / `md`

### 3. 表格对齐

- `:---` 左对齐
- `:---:` 居中对齐  
- `---:` 右对齐

### 4. 引用嵌套

> 引用可以嵌套
> > 这是二级引用
> > > 这是三级引用

---

## 📚 常见问题

### Q: 如何在表格中换行？

A: 使用HTML的 `<br>` 标签：

```markdown
| 列1 | 列2 |
|-----|-----|
| 第一行<br>第二行 | 内容 |
```

### Q: 如何添加颜色？

A: 使用HTML标签：

```html
<span style="color: red">红色文本</span>
<span style="color: blue">蓝色文本</span>
```

### Q: 如何居中对齐？

A: 使用HTML标签：

```html
<center>居中的内容</center>

<div align="center">
另一种居中方式
</div>
```

---

## 🎯 最佳实践

### 1. 文档结构

- 使用清晰的标题层次
- 适当使用目录
- 合理使用分割线分节

### 2. 代码展示

- 为代码块指定语言
- 使用反引号包围行内代码
- 保持代码缩进一致

### 3. 链接和图片

- 为链接添加描述性文本
- 为图片添加替代文本
- 使用相对路径引用本地文件

### 4. 表格优化

- 保持列宽一致
- 使用适当的对齐方式
- 避免表格过于复杂

---

## ⚡ 快捷键参考

大多数Markdown编辑器的常用快捷键：

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 粗体 | `Ctrl + B` | 加粗选中文本 |
| 斜体 | `Ctrl + I` | 倾斜选中文本 |
| 链接 | `Ctrl + K` | 插入链接 |
| 代码 | `Ctrl + Shift + C` | 插入代码块 |
| 预览 | `Ctrl + Shift + P` | 预览模式 |

---

*希望这个详细的Markdown语法指南对您有帮助！现在您可以开始创作精美的文档了！* 🚀 ✨

**Happy Writing!** 📝💫
