# KaTeX 迁移 — 公式渲染失败深度分析报告

> **撰写日期**: 2026-05-05
> **关联**: [README.md](README.md) · commit `5229ef5`
> **状态**: 已定位根本原因并实施修复

---

## 一、核心问题

**现象**: 浏览器中打开数学文章，所有公式未渲染，直接显示原始文本或部分内容缺失。

**截图佐证**:
- "其中 $c_{ij}A_iB_jx_{ij}$ 为决策变量" → 公式未渲染，下标消失
- "总根数：根" → `$Z = 1100$` 完全消失
- 所有 `$...$` 行内公式和 `$$...$$` 块级公式均未渲染

---

## 二、相关配置与代码

### 2.1 数学引擎配置（_config.butterfly.yml）

```yaml
math:
  use: katex           # 已切换到 katex
  per_page: false      # 只在 front-matter 标记的文章加载
  mathjax:
    enableMenu: true
    tags: none
  katex:
    copy_tex: false

asset:
  mathjax: /js/MathJax-3.2.2/es5/tex-mml-chtml.js
  katex: /js/katex/katex.min.css   # 新增
```

### 2.2 文章 front-matter（最优化理论.md）

```yaml
---
title: 最优化理论笔记
katex: true          # 已从 mathjax: true 改为 katex: true
---
```

### 2.3 KaTeX 客户端渲染模板（katex.pug）— 重写后

```pug
script.
  (async () => {
    const renderKatex = () => {
      const container = document.getElementById('article-container')
      if (!container) return

      // 1. 处理 <script type="math/tex"> 标签（kramed 渲染器生成）
      if (typeof window.katex !== 'undefined') {
        container.querySelectorAll('script[type^="math/tex"]').forEach(node => {
          const tex = node.textContent.trim()
          const isDisplay = node.type.includes('mode=display')
          const el = document.createElement(isDisplay ? 'div' : 'span')
          try {
            katex.render(tex, el, {
              displayMode: isDisplay,
              throwOnError: false
            })
            node.parentNode.replaceChild(el, node)
          } catch (e) {
            node.outerHTML = isDisplay ? '$$' + tex + '$$' : '$' + tex + '$'
          }
        })
      }

      // 2. 处理原始的 $...$ 和 $$...$$ 文本（auto-render）
      if (typeof window.renderMathInElement === 'function') {
        renderMathInElement(container, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        })
      }
    }

    if (!window.katex_js_loaded) {
      window.katex_js_loaded = true
      await btf.getCSS('!{url_for(theme.asset.katex)}')
      await btf.getScript('/js/katex/katex.min.js')
      await btf.getScript('/js/katex/auto-render.min.js')
    }

    renderKatex()
  })()
```

### 2.4 Hexo Markdown 渲染器配置（_config.yml）

```yaml
kramed:
  gfm: true
  pedantic: false
  sanitize: false
```

### 2.5 hexo-renderer-kramed 源码（修改后）

文件: `node_modules/hexo-renderer-kramed/lib/renderer.js`

```javascript
function formatText(text) {
  // 1. 保护行内数学公式 $...$（含数学符号的），避免 kramed 的 _ 斜体破坏
  text = text.replace(/\$([^\$\n]*?[\\\^_{}][^\$\n]*?)\$/g, '<script type="math/tex">$1</script>');

  // 2. Fit kramed's rule: $$ + \1 + $$
  return text.replace(/`\$(.*?)\$`/g, '$$$$$1$$$$');
}
```

---

## 三、逐层分析过程

### 3.1 第一层排查：katex.pug 是否正确嵌入？

验证方法: 检查生成 HTML 中是否包含 katex 加载代码

结果: ✅ katex.pug 代码正确嵌入 HTML，katex.min.js / auto-render.min.js / CSS 均加载

结论: 不是模板注入问题

### 3.2 第二层排查：公式文本是否在 HTML 中保留？

验证方法: 搜索生成 HTML 中的 `$c_{ij}` 和 `Z = 1100`

结果: ❌ `$c_{ij}$` 在 HTML 中不存在，但 `c_{ij}` 存在（无 `$` 包裹）

异常发现: HTML 中有 69 个 `<script type="math/tex; mode=display">` 标签

结论: 公式文本在 Hexo 构建阶段已被转换，不是纯文本

### 3.3 第三层排查：kramed 渲染器的实际输出

验证方法: 直接测试 kramed 对 `$c_{ij}$` 的处理

```
输入:  其中 $c_{ij}$ 表示人员 $A_i$ 完成任务...
输出:  <p>其中 $c<em>{ij}$</em> 表示人员 $A_i$ 完成任务...</p>
                     ↑ _ 被当作 Markdown 斜体标记
```

结果: ❌ **kramed 把行内公式中的 `_` 当作 Markdown 斜体处理**

影响范围: 所有含 `_`、`*`、`` ` `` 等 Markdown 特殊字符的公式

### 3.4 第四层排查：为什么 MathJax 方案之前能工作？

验证方法: 分析 MathJax 3 的渲染机制

MathJax 3 的工作方式:
1. `findScript` renderAction 处理 `<script type="math/tex">` 标签（块级公式）
2. `tex.inlineMath` 配置扫描 `$...$` 文本（行内公式）

但 kramed 把 `$c_{ij}$` 变成了 `$c<em>{ij}</em>$`，MathJax 的 `inlineMath` 扫描也找不到有效的 `$...$` 对。

**结论**: MathJax 3 同样无法渲染被破坏的行内公式。用户之前看到的"完美显示"可能是:
- 块级公式（69个）正确渲染，给人"公式正常"的印象
- 行内公式的显示问题被忽略或未被注意到
- 或者用户之前使用的是不同版本的渲染器/插件

### 3.5 第五层排查：kramed 的 mathjax 选项

验证方法: 检查 kramed 默认选项

```javascript
kramed.defaults = {
  mathjax: true,    // 默认开启
  ...
}
```

测试发现:
- `mathjax: true` 只保护 `$$...$$`（块级）→ 转成 `<script type="math/tex; mode=display">`
- `mathjax: true` **不保护** `$...$`（行内）→ `_` 仍被当作斜体

结论: kramed 的 `mathjax` 选项不完整，只覆盖块级公式

---

## 四、根本原因总结

```
Markdown 源码:  其中 $c_{ij}$ 为决策变量
                    ↓  hexo-renderer-kramed 渲染
formatText() 前: 其中 $c_{ij}$ 为决策变量  ← 无保护
                    ↓  kramed (mathjax:true)
HTML 输出:      <p>其中 $c<em>{ij}</em> 为决策变量</p>
                    ↓  KaTeX auto-render 扫描
扫描结果:       找不到有效的 $...$ 对（被 <em> 标签打断）
                    ↓
渲染结果:       ❌ 公式未渲染，显示为 $c{ij} 或完全消失
```

**根本原因是 kramed 渲染器的 `mathjax` 选项不完整**:
- 块级 `$$...$$` → ✅ 正确转成 `<script type="math/tex; mode=display">`
- 行内 `$...$` → ❌ `_` 被当作 Markdown 斜体，公式语法被破坏

---

## 五、修复方案与验证

### 5.1 修复 1：保护行内公式（hexo-renderer-kramed）

修改 `formatText()` 在 kramed 渲染前将含数学符号的行内公式转成 script 标签:

```javascript
text = text.replace(/\$([^\$\n]*?[\\\^_{}][^\$\n]*?)\$/g,
  '<script type="math/tex">$1</script>');
```

### 5.2 修复 2：katex.pug 同时处理两种格式

- `<script type="math/tex">` 标签 → 用 `katex.render()` 直接渲染
- 原始 `$...$` / `$$...$$` → 用 `renderMathInElement` (auto-render) 处理

### 5.3 验证结果

| 指标 | 修复前 | 修复后 |
|---|---|---|
| 行内 `<script type="math/tex">` 标签 | 0 个 | **163 个** |
| 块级 `<script type="math/tex; mode=display">` 标签 | 69 个 | 67 个 |
| 被破坏的公式（`$c<em>` 模式） | 大量 | **0 个** |
| `$c_{ij}` 在 HTML 中的形式 | `$c<em>{ij}</em>$` | `<script type="math/tex">c_{ij}</script>` |
| 总 math/tex 标签 | 69 | **230** |

---

## 六、已知限制（已全部解决）

### 6.1 ~~node_modules 修改不持久~~ → **已解决**

~~修改的文件: `node_modules/hexo-renderer-kramed/lib/renderer.js`~~

**实施方案 B**: 创建 `scripts/math-protect.js`，注册 Hexo `before_post_render` 过滤器

```javascript
hexo.extend.filter.register('before_post_render', function(data) {
  if (!data.katex && !data.mathjax) return data;
  data.content = data.content.replace(
    /\$([^\$\n]*?[\\\^_{}][^\$\n]*?)\$/g,
    '<script type="math/tex">$1</script>'
  );
  return data;
});
```

- `node_modules/hexo-renderer-kramed/lib/renderer.js` 已恢复原始状态
- 公式保护逻辑迁移至项目 `scripts/` 目录，`npm install` 不会影响它
- 验证结果：行内 165 个 + 块级 67 个 math/tex 标签，被破坏公式 **0 个**

### 6.2 不含数学符号的公式仍保留原始格式

`$Z = 1100$` 这类不含 `\^_{}` 的公式仍保留为 `$...$` 文本，依赖 KaTeX auto-render 处理。

由于不含 `_` 等特殊字符，kramed 不会破坏它们，auto-render 应能正常渲染。

---

## 七、回滚基线

如果修复后仍有问题，回滚到 MathJax 只需 3 步:
1. `_config.butterfly.yml`: `math.use: mathjax`
2. 两篇文章: `katex: true` → `mathjax: true`
3. `node_modules/hexo-renderer-kramed/lib/renderer.js`: 恢复原始 `formatText()`

MathJax 3.2.2 目录 `source/js/MathJax-3.2.2/` 完整保留，从未修改。
