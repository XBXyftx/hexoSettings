---
title: Markdown语法指南与在线编辑器
date: 2025-06-04 10:00:00
description: 本地优先的 Markdown 工作台与完整语法指南
author: XBXyftx
keywords: Markdown, 语法, 指南, 教程, 在线编辑器
---

<div data-md-workbench aria-label="Markdown 本地工作台"></div>
<script defer src="./workbench/workbench.bundle.js"></script>

# Markdown 工作台

在工作台中输入 Markdown，右侧会进行实时安全预览。草稿仅自动保存在当前浏览器，导入和下载均在本地完成；原始 HTML 会经过净化，脚本、事件属性和危险链接不会运行。

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
![替代文本](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg)
![带标题的图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg "图片标题")
```

**效果展示：**

![替代文本](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg)
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
[![图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg)](https://example.com)
```

**效果展示：**

[![图片](https://bu.dusays.com/2025/04/21/6805d63ef1902.jpg)](https://example.com)

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
