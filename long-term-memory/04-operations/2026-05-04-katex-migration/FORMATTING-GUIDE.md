---
name: 数学公式编写与编译指南
description: 在 Hexo 博客文章中编写数学公式时的格式规范、注意事项与编译验证方法
type: reference
---

# 数学公式编写与编译指南

> **适用范围**: 当前使用 `katex: true` front-matter 的数学文章；`mathjax: true` 仅作为回滚历史参考
> **关联**: [README.md](README.md) · [ANALYSIS.md](ANALYSIS.md) · `scripts/math-protect.js` · `themes/butterfly/source/css/_layout/third-party.styl`

---

## 一、基本语法

| 类型 | 语法 | 示例 | 渲染结果 |
| --- | --- | --- | --- |
| **行内公式** | `$...$` | `$c_{ij}$` | 行内嵌入 |
| **块级公式** | `$$...$$` | `$$Z = \sum_{i=1}^{n} c_{ij}x_{ij}$$` | 居中独立块 |

**注意**：不要使用 `$...$` 嵌套在其他 Markdown 标记内（如 `**$x$**`），可能导致解析异常。

---

## 二、格式注意事项

### 2.1 会被自动保护的公式（✅ 安全）

`scripts/math-protect.js` 会在编译前自动将以下行内公式转为 `<script type="math/tex">` 标签，**kramed 无法破坏它们**：

```markdown
$c_{ij}$           ✅ 含下划线 _
$A^{T}$            ✅ 含上标 ^
$\alpha + \beta$   ✅ 含反斜杠 \
$x_{i}^{2}$        ✅ 含花括号 { }
$f(x) = x^2$       ✅ 含上标 ^
```

**判断标准**：只要 `$...$` 内部包含 `\` `^` `_` `{` `}` 中任意一个字符，就会被保护。

### 2.2 依赖 auto-render 的公式（⚠️ 需留意）

以下公式**不含**上述特殊字符，保留为原始 `$...$` 文本，依赖 KaTeX `renderMathInElement` 在浏览器端渲染：

```markdown
$Z = 1100$         ⚠️ 无特殊字符
$E = mc^2$         ⚠️ 实际上含 ^，会被保护 ✅
$x + y = z$        ⚠️ 无特殊字符
```

**安全性**：由于不含 `_` `*` `` ` `` 等 Markdown 标记，kramed 不会破坏它们，auto-render 通常能正常处理。但若遇到 `$` 与其他标点紧邻（如 `($x$)`），可能因边界识别问题漏渲染。

### 2.3 绝对不要写的格式（❌ 会出错）

```markdown
❌ $ x $              # 美元符号与公式间有空格 → kramed 可能不识别
❌ $c_{ij} + $d_{ij}$ # 一个 $ 内嵌另一个 $ → 嵌套错误
❌ $x = 1 $text$      # 缺失右 $ 或左 $ → 配对失败
❌ **$x$**            # 嵌套在加粗标记内 → Markdown 解析冲突
❌ `$x = 1$`          # 反引号包裹 → kramed 原生规则可能冲突
```

### 2.4 特殊字符转义

在 Markdown 中写数学公式时，以下 LaTeX 语法在 Hexo 编译阶段**不会**遇到问题（已被保护）：

| 字符 | LaTeX 用法 | 是否安全 |
| --- | --- | --- |
| `\` | `\alpha`, `\times`, `\sum` | ✅ 保护 |
| `^` | `x^2`, `A^{T}` | ✅ 保护 |
| `_` | `c_{ij}`, `x_1` | ✅ 保护 |
| `{` `}` | `x_{i}^{j}` | ✅ 保护 |
| `~` | 空格 | ⚠️ 无保护，但 kramed 不处理 |
| `&` | 矩阵对齐 | ⚠️ 无保护，但 kramed 不处理 |
| `\|` | 范数 `\|x\|` | ✅ 含反斜杠，保护 |

### 2.5 Markdown 表格中的公式（重点）

在表格中可以直接使用 `$...$` 行内公式，但要同时注意 **Markdown 表格解析** 和 **KaTeX 客户端渲染** 两层问题。

**推荐写法**：

```markdown
| 符号 | 含义 | 说明 |
| --- | --- | --- |
| $F_i$ | 第 $i$ 个部件的可改进比例 | $0 \leq F_i \leq 1$ |
| $S_i$ | 第 $i$ 个部件的加速比 | $S_i \geq 1$ |
```

**表格公式排查顺序**：

1. 先看 Markdown 表格是否规范：表格前后留空行，分隔行使用 `| --- | --- | --- |` 或左对齐 `| :--- | :--- | :--- |`。
2. 再看生成 HTML 是否保留公式：搜索 `public/.../index.html` 中是否存在 `<script type="math/tex">F_i</script>`。
3. 如果 HTML 中有 `math/tex` 但浏览器显示为空，优先检查 CSS 是否隐藏 `.katex`。
4. 当前已删除 `themes/butterfly/source/css/_layout/third-party.styl` 中旧的 `.katex { display: none }` 规则；主题升级后需重新确认该规则没有被恢复。

**常见误判**：表格里一整列公式为空，并不一定是 Markdown 表格语法错；在 KaTeX 客户端渲染链路下，更可能是 `<script type="math/tex">` 已被渲染成 `.katex`，但被主题 CSS 隐藏。

---

## 三、编译注意事项

### 3.1 触发数学资源加载的条件

文章必须满足**以下任一**条件，才会在生成的页面中加载 KaTeX / MathJax 资源：

```yaml
---
# 方案 A：KaTeX（当前推荐）
katex: true

# 方案 B：MathJax（回滚备用）
mathjax: true
---
```

`_config.butterfly.yml` 中 `math.per_page: false` 意味着：**只有**带上述标记的文章会加载数学资源，其他页面零开销。

### 3.2 每次修改后的标准编译流程

```bash
# 必须执行 clean，因为 Hexo 的缓存可能导致旧 HTML 残留
hexo clean

# 重新生成
hexo generate

# 可选：本地预览
hexo server
```

**为什么必须 clean**：Hexo 的数据库缓存（`db.json`）不会自动检测 `scripts/math-protect.js` 的修改。如果不 clean，可能看到旧行为。

### 3.3 编译验证清单

生成完成后，用以下命令验证公式是否被正确保护：

```bash
# 1. 确认无报错（ERROR 级别）
hexo generate 2>&1 | grep -i error

# 2. 检查目标 HTML 中 math/tex 标签数量
grep -o '<script type="math/tex"\(>\|; mode=display\)>' \
  public/2026/03/03/最优化理论/index.html | wc -l
# 期望：200+（行内 + 块级）

# 3. 检查是否存在被破坏的公式
grep -c '\$c<em>' public/2026/03/03/最优化理论/index.html
# 期望：0
```

### 3.4 构建性能

| 场景 | 影响 |
| --- | --- |
| `scripts/math-protect.js` | 每篇文章一次正则替换，开销可忽略（<1ms） |
| KaTeX 资源加载 | 仅 `katex: true` 的文章加载（303KB JS/CSS） |
| 无数学标记的文章 | 零额外开销 |

---

## 四、新增数学文章的标准流程

```text
1. 在文章 front-matter 中添加 katex: true
2. 使用 $...$ 和 $$...$$ 编写公式
3. hexo clean && hexo generate
4. 检查 public/对应路径/index.html 中的 math/tex 标签数量
5. hexo server 本地预览，确认浏览器渲染正常
6. 若发现公式未渲染，参考下方「故障排查」
```

---

## 五、故障排查

### 5.1 公式完全未渲染

| 检查项 | 命令/方法 | 期望结果 |
| --- | --- | --- |
| front-matter 标记 | `grep "katex:" source/_posts/文章名.md` | 有 `katex: true` |
| HTML 中是否加载 JS | `grep "katex.min.js" public/.../index.html` | 有加载代码 |
| math/tex 标签数 | `grep -c "math/tex" public/.../index.html` | > 0 |
| 公式是否被破坏 | `grep -c "\$c<em>" public/.../index.html` | 0 |

### 5.2 部分公式渲染，部分不渲染

**可能原因**：
1. 不渲染的公式不含 `\` `^` `_` `{` `}`，且被 kramed 外的其他因素破坏（如与中文标点粘连）
2. `$` 前后有空格（如 `$ x $`），kramed 的 auto-render 正则可能不匹配
3. 公式跨行（`$` 开在一行，内容在下一行）

**检查方法**：
```bash
# 在生成的 HTML 中搜索原始 $...$ 文本
grep -o '\$[^\$\n]*\$' public/.../index.html | head -20
# 对比 Markdown 源码中的公式，确认哪些没变成 math/tex 标签
```

### 5.3 公式渲染但显示为原始 LaTeX 文本

这说明 KaTeX 客户端渲染失败。可能原因：
1. 浏览器网络问题导致 katex.min.js 未加载
2. PJAX 导航后未触发渲染（检查 `katex_js_loaded` 标志是否正常）
3. 公式语法不被 KaTeX 支持（极少数复杂 LaTeX 宏）

### 5.4 表格内公式为空白

这通常不是表格 Markdown 语法本身的问题，而是 KaTeX 客户端渲染链路中某一层失败或被 CSS 隐藏。

**排查方法**：

```bash
# 1. 检查生成 HTML 中是否仍有公式占位
grep -n 'math/tex.*F_i\|math/tex.*S_i' public/.../index.html

# 2. 检查主题 CSS 是否重新出现旧隐藏规则
grep -n 'katex.*display: none\|display: none.*katex' public/css/index.css
```

**判断方式**：

1. HTML 中没有 `math/tex`，说明 Markdown 渲染或 `scripts/math-protect.js` 保护阶段出问题。
2. HTML 中有 `math/tex`，但浏览器空白，优先检查 `katex.min.js`、`auto-render.min.js` 是否加载。
3. JS 已加载但仍空白，检查 `public/css/index.css` 中是否有 `.katex { display: none }`。
4. 如果主题升级恢复了隐藏规则，重新删除 `themes/butterfly/source/css/_layout/third-party.styl` 中 `.katex { display: none }` 与 `.katex.katex-show { display: inline }`。

---

## 六、快速参考卡片

```markdown
# 写文章时 front-matter
---
title: 我的文章
katex: true   # ← 必须加
---

# 行内公式（安全写法）
其中 $c_{ij}$ 为决策变量，$A_{m \times n}$ 为系数矩阵。

# 块级公式（安全写法）
$$
Z = \sum_{i=1}^{n} \sum_{j=1}^{m} c_{ij} x_{ij}
$$

# 编译
hexo clean && hexo generate

# 验证
grep -c "math/tex" public/2026/03/03/文章名/index.html
```

---

## 七、文件速查

| 文件 | 作用 | 修改风险 |
| --- | --- | --- |
| `scripts/math-protect.js` | Hexo 过滤器，保护行内公式 | **项目文件，安全修改** |
| `themes/.../math/katex.pug` | 客户端 KaTeX 渲染逻辑 | 主题文件，升级需重新应用 |
| `themes/.../css/_layout/third-party.styl` | KaTeX 显示样式，需避免恢复 `.katex { display: none }` | 主题文件，升级需复查 |
| `_config.butterfly.yml` | 数学引擎配置 | 主题配置，安全修改 |
| `source/js/katex/` | KaTeX JS/CSS 资源 | 项目文件，安全修改 |
| `node_modules/hexo-renderer-kramed/...` | **不要直接修改** | npm install 后会丢失 |
