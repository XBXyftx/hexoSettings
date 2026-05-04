---
name: 私密文章系统（Coffer）完整实现
description: 密码保护私人文章库的端到端实现 — Hexo 自动扫描插件、前端密码验证、sessionStorage 会话管理、搜索筛选、卡片渲染
type: project
---

# 私密文章系统（Coffer） — 完整实现

> **何时阅读**：排查私密文章不显示、修改密码验证逻辑、新增筛选功能、调整私人文章扫描行为、密码泄漏需要更换时。
> **关联文档**：[deployment-pipeline.md](../03-api-practices/deployment-pipeline.md)（private-posts-scanner.js 在 before_generate 阶段的注册）· [cdn-strategy.md](../03-api-practices/cdn-strategy.md)

---

## L1 · TL;DR（30 秒看完）

- `/coffer/` 是一个**密码保护的私人文章库**，带毛玻璃 UI、搜索、标签筛选和卡片式文章列表。
- **三个组件协同工作**：
  1. `scripts/private-posts-scanner.js` — Hexo 插件，构建时扫描 markdown 生成 JSON 索引
  2. `source/js/coffer.js` — 前端 JS，密码验证 + 异步加载 JSON + 渲染卡片
  3. `source/coffer/index.html` — 独立 HTML 页面（不经过 Hexo 模板），内联 CSS + 外链 JS
- **密码硬编码**在 `coffer.js` 中：`correctPassword: '10021021'`（明文，客户端验证）。
- **认证状态**存在 `sessionStorage`，关闭标签页即失效（每次新标签页都需重新输入密码）。

---

## L2 · 架构总览

```text
构建时（hexo generate）：
  private-posts-scanner.js (before_generate filter)
    → 扫描 source/coffer/private-posts/*.md
    → 解析 front matter（title/date/tags/categories/description/cover）
    → 计算摘要（优先 description → 自动提取前 200 字符）
    → 计算字数（中文字符 + 英文单词）
    → 生成 source/coffer/private-posts.json

运行时（浏览器访问 /coffer/）：
  index.html → 渲染密码输入界面
  coffer.js → sessionStorage 检查 → 密码验证
    → fetch /coffer/private-posts.json
    → 渲染 post-card 网格
    → 搜索/筛选交互
```

---

## L3 · 组件 1：`scripts/private-posts-scanner.js`（Hexo 插件）

### 3.1 注册点

```js
hexo.extend.filter.register('before_generate', function() { ... });
```

在 `hexo generate` 之前执行。不是 generator（不生成路由），而是 filter（产生副作用——写入 JSON 文件）。

### 3.2 变更检测（防重复扫描）

```js
let lastScanHash = '';
// 对目录内所有 .md 文件的 文件名 + mtime 做 MD5
const currentHashValue = currentHash.digest('hex');
if (currentHashValue === lastScanHash && fs.existsSync(outputPath)) {
  return;  // 跳过扫描
}
```

> 进程级缓存（`lastScanHash` 是模块顶层变量）。每次重启 hexo 进程都会重新扫描。如果改了文章内容但没改 mtime（罕见），变更检测会漏掉——但实际文件系统操作几乎不会触发这种场景。

### 3.3 扫描与解析

| 步骤 | 行为 |
|---|---|
| 1. 检查目录 | `source/coffer/private-posts/` 不存在则创建 + 写入空 `[]` |
| 2. 读取文件 | `fs.readdirSync` → 过滤 `.md` 后缀 → 按文件名排序 |
| 3. 解析 front matter | 正则 `/^---[\s\S]*?---/` → 提取 title/date/tags/categories/description/cover |
| 4. 生成摘要 | 优先取 `description` 字段 → 否则自动提取正文前 200 字符 |
| 5. 计算字数 | `中文字符数 + 英文单词数`（移除 markdown 标记后统计） |
| 6. 写 JSON | `JSON.stringify(privatePosts, null, 2)` → UTF-8 |

### 3.4 输出的 JSON 结构

```json
[
  {
    "filename": "my-first-private-post.md",
    "title": "我的第一篇私密文章",
    "date": "2025-05-28 10:30:00",
    "tags": ["鸿蒙", "开发"],
    "categories": ["技术"],
    "description": "文章描述",
    "cover": "/imgs/cover.webp",
    "excerpt": "摘要内容...",
    "wordCount": 1234,
    "lastModified": "2025-05-28T02:30:00.000Z"
  }
]
```

### 3.5 日志输出

```
🔍 检测到私密文章变化，开始扫描目录: ...
📁 找到的Markdown文件: [...]
📖 正在处理文件: ...
✅ 成功解析文章: ...
✅ 私密文章扫描完成: 找到 N 篇文章
```

> 日志语言是中文 + emoji，适合在 Hexo 终端直接阅读。

---

## L4 · 组件 2：`source/coffer/index.html`（独立页面模板）

### 4.1 为何不经过 Pug 模板

`index.html` 的 front matter 设置了 `layout: false`（继承自 README.md 的同目录约定），这意味着 Hexo 不会套用 Butterfly 主题模板。页面是一份**完整的独立 HTML 文档**（`<!DOCTYPE html>` 到 `</html>`），自带 `<style>` 和 `<script src="/js/coffer.js">`。

**代价**：不继承主题的导航栏、页脚、暗黑模式、CSS 变量、PJAX。这是一个完全独立的微应用。

### 4.2 页面结构

```html
<div class="coffer-container">
  <!-- 密码验证区域（默认显示） -->
  <div class="password-section" id="passwordSection">
    🔒 私密文章库
    请输入访问密码
    [密码输入框] [🔓 解锁按钮]
    [错误提示]
  </div>

  <!-- 文章列表区域（默认隐藏，验证后显示） -->
  <div class="posts-section" id="postsSection">
    共 N 篇文章
    [搜索框] [筛选按钮：全部/最近/按标签]
    [加载指示器]
    [文章卡片网格]
    [空状态提示]
  </div>
</div>
```

### 4.3 CSS 关键特性

| 特性 | 实现 |
|---|---|
| 毛玻璃效果 | `background: rgba(255,255,255,0.1); backdrop-filter: blur(20px)` |
| 卡片网格 | `grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))` |
| 密码区域隐藏动画 | `opacity 0 + translateY(-30px) + max-height 0`，600ms transition |
| 文章区域浮现 | `opacity 0 → 1 + translateY(50px → 0)`，600ms transition |
| 错误抖动 | `shake` keyframes（±5px translateX），500ms |
| 加载旋转 | `spin` keyframes（360deg rotate），1s 线性 |
| 卡片悬浮 | `translateY(-5px) + box-shadow` 加深 |
| 移动端适配 | 768px：单列网格、纵向输入框；480px：更小间距 |

### 4.4 背景处理

```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
```

与打字机效果的配色一致（`#667eea → #764ba2`）。但这会**覆盖主题的暗黑背景和星空动画**——/coffer/ 页面不显示 `#universe` canvas 内容。

---

## L5 · 组件 3：`source/js/coffer.js`（前端逻辑）

### 5.1 认证流

```text
页面加载
  → 强制清除 sessionStorage（每次都需要重新输入密码）
  → 渲染密码输入界面

用户输入密码 → 点击解锁 / 回车
  → 与 config.correctPassword ('10021021') 比较
  → 正确：sessionStorage.setItem('coffer_authenticated', 'true')
      → 隐藏密码区域（600ms 动画）
      → 显示文章区域 + 加载 JSON
  → 错误：抖动输入框 + 显示错误提示（3s 自动消失）
```

> ⚠️ 密码 `10021021` 硬编码在 JS 源码中，任何人只要查看 `coffer.js` 就能看到。这是**客户端验证，不具备真正的安全性**。私密文章的 markdown 文件本身也在 `public/coffer/private-posts/` 目录下可直接访问（如果知道文件名）。

### 5.2 数据加载

```js
fetch('/coffer/private-posts.json')
  → response.json()
  → allPosts = [...]
  → renderPosts()
```

### 5.3 卡片渲染

每张卡片包含：
- 封面图（有则显示 `<img>`，无则显示占位符 📄）
- 文章标题
- 日期 + 字数
- 摘要（最多 3 行，`-webkit-line-clamp: 3`）
- 标签列表
- 📖 阅读文章 按钮 → `window.open('/coffer/private-posts/{filename}.html', '_blank')`

卡片以 `fade-in` 动画逐张出现（`animationDelay = index * 0.1s`）。

### 5.4 搜索与筛选

| 功能 | 触发 | 逻辑 |
|---|---|---|
| **搜索** | `input` 事件 | 匹配 title / excerpt / tags / categories（大小写不敏感） |
| **全部** | 点击按钮 | 显示所有文章 |
| **最近** | 点击按钮 | 按 `lastModified` 降序取前 10 篇 |
| **按标签** | 点击按钮 | 按标签数量降序 |

### 5.5 暴露的全局函数

```js
window.openPost = function(filename) { ... };
```

HTML 中的 `onclick="openPost('...')"` 调用此函数。

---

## L6 · 红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 修改 `correctPassword` 后忘记同步更新告诉朋友 | 朋友进不来 | 改密码后通知相关人员 |
| R2 | 删除 `scripts/private-posts-scanner.js` | `private-posts.json` 不再自动更新，新文章不显示 | 保留 |
| R3 | 移动 `source/coffer/` 目录位置 | `coffer.js` 中的 `postsJsonPath: '/coffer/private-posts.json'` 失效 | 同步修改 path |
| R4 | 给 coffer 页面启用 Hexo 模板渲染（去掉 `layout: false`） | 被套上主题模板，页面样式冲突，密码输入框可能不显示 | 保持 layout: false |
| R5 | 在 private-posts 目录中放非 markdown 文件 | scanner 只过滤 `.md`，其他文件被忽略（安全） | 只放 .md |
| R6 | 将真正敏感的内容放在此系统中 | 密码明文可见 + markdown 源文件直接可访问 | 此系统仅适合轻度隐私 |

---

## L7 · 排查清单

### 现象 1：新文章在 /coffer/ 不显示

1. 确认文章在 `source/coffer/private-posts/` 目录
2. 确认有有效 front matter（至少 `title:` 字段）
3. `hexo clean && hexo generate` 重新扫描
4. 检查终端是否有 `✅ 私密文章扫描完成` 日志
5. 检查生成的 `public/coffer/private-posts.json` 是否包含新文章

### 现象 2：密码正确但提示错误

1. F12 console 检查 `coffer.js` 是否加载（应有 `私密文章系统初始化开始`）
2. 检查 `config.correctPassword` 是否被修改
3. 是否有输入法全角/半角问题（密码只做等于比较，不 trim 特殊字符）

### 现象 3：文章卡片点击无反应

1. F12 console 是否有 JS 错误
2. 检查 `window.openPost` 是否被定义
3. 检查 `filename` 是否正确（`.md` → `.html` 转换）

---

## L8 · 文件位置速查

| 内容 | 路径 |
|---|---|
| Hexo 扫描插件 | `scripts/private-posts-scanner.js` |
| 页面 HTML | `source/coffer/index.html` |
| 前端 JS | `source/js/coffer.js` |
| 私密文章目录 | `source/coffer/private-posts/` |
| 自动生成的索引 | `source/coffer/private-posts.json`（构建后） |
| 使用说明 | `source/coffer/README.md` |

---

## L9 · 与其他模块的耦合

```text
coffer-private-posts
  ├── private-posts-scanner.js ──► hexo before_generate filter
  ├── coffer.js ──► 独立 JS（不依赖 jQuery / PJAX / Butterfly）
  ├── index.html ──► 独立 HTML（不继承主题模板）
  ├── 密码硬编码 ──► 无外部依赖
  └── 不与 inject 系统交互（页面不经过主题渲染）
```
