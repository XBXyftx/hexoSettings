---
name: KaTeX 轻量化迁移（MathJax → KaTeX）
description: 将 MathJax 3.2.2 本地版（1.17MB）迁移为 KaTeX 0.16.19 客户端渲染方案（303KB），保留 MathJax 作为回滚基点
type: project
---

# KaTeX 轻量化迁移 — MathJax → KaTeX

> **状态**: 已修复（公式保护持久化），待浏览器最终验证
> **执行轮次**: 第一轮 2026-05-04（基础设施迁移）+ 第二轮 2026-05-05（公式保护修复与持久化）
> **关联**: [../../07-known-issues/README.md](../../07-known-issues/README.md)(BUG-003) · `source/js/MathJax-3.2.2/`(保留的回滚基点)

---

## L1 · TL;DR（30 秒）

| 维度 | MathJax（旧） | KaTeX（新） | 变化 |
|---|---|---|---|
| **核心 JS** | 1.17MB（tex-mml-chtml.js） | 276KB（katex.min.js） | **-76%** |
| **CSS** | 无单独 CSS | 23KB（katex.min.css） | 新增 |
| **扩展** | 内置 | 3.5KB（auto-render.min.js） | 新增 |
| **字体** | ~400KB 本地 woff | ~200KB CDN 按需加载 | 从 CDN 加载 |
| **总传输体积** | ~1.57MB | ~500KB | **-68%** |
| **渲染方式** | 客户端动态排版（有闪烁） | 客户端同步渲染（无闪烁） | 体验提升 |
| **per_page 控制** | 需 `mathjax: true` front-matter | 需 `katex: true` front-matter | 保持一致 |
| **PJAX 支持** | 有（mathjax.pug 内置） | 有（katex.pug 重写） | 保持一致 |

**改动文件**：
- `themes/butterfly/layout/includes/third-party/math/katex.pug`（重写，添加客户端渲染）
- `_config.butterfly.yml`（math.use: mathjax → katex，asset.katex 指向本地）
- `source/_posts/最优化理论.md`（mathjax: true → katex: true）
- `source/_posts/MachineCollectionFinalReview.md`（mathjax: true → katex: true）
- `source/js/katex/`（新增目录，KaTeX 0.16.19 文件）
- `source/js/katex-auto-render.js`（新增，备用独立渲染脚本）

**回滚基线**：当前 MathJax 3.2.2 目录完整保留于 `source/js/MathJax-3.2.2/`，回滚只需改 3 处配置。

---

## L2 · 问题背景

### 2.1 为什么迁移

| 问题 | 详情 |
|---|---|
| **体积过大** | MathJax 3.2.2 本地版 `tex-mml-chtml.js` 1.17MB，实际仅 2 篇文章使用 |
| **升级风险** | 用户历史经验：升级 MathJax 版本后公式变成小滚动窗，显示效果与博文风格不搭 |
| **渲染体验** | MathJax 客户端动态排版存在闪烁（先显示原始 LaTeX，再渲染为公式） |
| **技术债务** | 15MB 的 MathJax 完整目录长期占用项目空间，多数文件从未使用 |

### 2.2 当前使用状况

| 文章 | front-matter | 公式密度 |
|---|---|---|
| `最优化理论.md` | `mathjax: true` | 高（大量 $...$ 和 $$...$$） |
| `MachineCollectionFinalReview.md` | `mathjax: true` | 中（表格内嵌公式） |

两篇文章均使用标准 `$...$`（行内）和 `$$...$$`（块级）语法，无复杂 MathJax 扩展需求。

---

## L3 · 方案设计

### 3.1 方案对比

| 方案 | 说明 | 体积 | 复杂度 | 风险 |
|---|---|---|---|---|
| **A: 保持 MathJax** | 现状，不改动 | 1.17MB+ | 低 | 体积问题持续存在 |
| **B: 服务端 KaTeX** | 安装 hexo-filter-katex，构建时渲染 | 仅 CSS ~25KB | 中（需 npm install） | 新依赖可能引入兼容性问题 |
| **C: 客户端 KaTeX**（选中） | 下载 KaTeX JS+CSS，客户端 auto-render | ~303KB JS/CSS + 字体 | 低 | 需确保 kramed 保留 `$...$` 语法 |

**选择方案 C 的原因**：
1. 无需安装新 npm 包，避免依赖风险
2. 与当前 MathJax 工作方式一致（客户端渲染）
3. 体积从 1.17MB 降至 303KB，减少 74%
4. 回滚简单（3 处配置改回即可）

### 3.2 为什么客户端渲染可行

关键发现：Hexo 的 `hexo-renderer-kramed` 渲染器**保留了 `$...$` 原始语法**，没有将 `_` 当作斜体标记处理。这验证了：

```
Markdown 中的 $x_1$ → HTML 中的 $x_1$（纯文本保留）
```

因此 KaTeX 的 `auto-render` 扩展可以正确扫描并渲染这些公式。

### 3.3 KaTeX vs MathJax 渲染差异

| 特性 | MathJax | KaTeX |
|---|---|---|
| 渲染时机 | 异步，可能闪烁 | 同步，无闪烁 |
| 公式宽度 | 可能溢出产生滚动条 | 默认不换行，可能溢出 |
| 字体加载 | 首次渲染时按需加载 | CSS 中预声明，浏览器自动加载 |
| 扩展支持 | 丰富（ams, physics, chem 等） | 基础（通过 JS 配置可扩展） |
| 屏幕阅读器 | 自动生成 MathML | 通过 `katex-mathml` 扩展 |

**潜在风险**：KaTeX 不支持某些复杂 LaTeX 语法（如部分 AMS 扩展）。但当前两篇文章使用的语法均为基础语法（分数、下标、矩阵、求和等），KaTeX 完全支持。

---

## L4 · 实现步骤

### 4.1 文件变更详情

#### ① 下载 KaTeX 0.16.19 到本地

```bash
mkdir -p source/js/katex/fonts
curl -sL https://cdn.jsdelivr.net/npm/katex@0.16.19/dist/katex.min.js -o source/js/katex/katex.min.js      # 276KB
curl -sL https://cdn.jsdelivr.net/npm/katex@0.16.19/dist/katex.min.css -o source/js/katex/katex.min.css    # 23KB
curl -sL https://cdn.jsdelivr.net/npm/katex@0.16.19/dist/contrib/auto-render.min.js -o source/js/katex/auto-render.min.js  # 3.5KB
```

CSS 字体路径修改为 CDN（避免下载 21 个字体文件）：
```bash
sed -i 's|url(fonts/|url(https://cdn.jsdelivr.net/npm/katex@0.16.19/dist/fonts/|g' source/js/katex/katex.min.css
```

#### ② 重写 Butterfly katex.pug（主题修改）

文件：`themes/butterfly/layout/includes/third-party/math/katex.pug`

原逻辑：仅加载 CSS，然后给 `.katex` 元素添加 `katex-show` 类（假设公式已在服务端渲染）

新逻辑：加载 CSS + KaTeX JS + auto-render JS，然后调用 `renderMathInElement` 在客户端渲染

```pug
script.
  (async () => {
    const renderKatex = () => {
      const container = document.getElementById('article-container')
      if (!container || typeof window.renderMathInElement !== 'function') return
      renderMathInElement(container, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false
      })
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

#### ③ 修改 _config.butterfly.yml

```yaml
# math 配置
math:
  use: katex           # 从 mathjax 改为 katex
  per_page: false      # 保持不变
  ...

# asset 配置
asset:
  ...
  katex: /js/katex/katex.min.css   # 新增
```

#### ④ 修改文章 front-matter

`最优化理论.md` 和 `MachineCollectionFinalReview.md`：
```yaml
---
# mathjax: true   # 旧
katex: true       # 新
---
```

#### ⑤ 创建备用独立渲染脚本（可选）

`source/js/katex-auto-render.js` — 不依赖 Butterfly katex.pug 的独立方案，通过内容自动检测按需加载。

### 4.2 依赖关系

```
_config.butterfly.yml:math.use=katex
  └── themes/butterfly/layout/includes/third-party/math/index.pug
        └── 条件: page.katex === true
              └── include katex.pug
                    └── 加载 CSS → 加载 katex.min.js → 加载 auto-render.min.js
                          └── renderMathInElement('#article-container')
                                └── 扫描 $...$ 和 $$...$$ → 渲染为 HTML
                                      └── 浏览器从 CDN 加载 woff2 字体
```

---

## L5 · 回滚策略

**回滚方式一：快速回滚（推荐）**

```bash
# 1. 恢复配置
git checkout -- _config.butterfly.yml
# 或手动改回:
#   math.use: mathjax
#   注释掉 asset.katex 行

# 2. 恢复文章 front-matter（2 篇）
#   mathjax: true  ← 改回

# 3. MathJax 目录从未改动，直接可用
#   source/js/MathJax-3.2.2/ 完整保留
```

**回滚方式二：git revert**

```bash
git revert <commit-hash>
```

**回滚基线确认**：
- `source/js/MathJax-3.2.2/` 目录完整保留，未做任何修改
- `_config.butterfly.yml` 中 `mathjax: /js/MathJax-3.2.2/es5/tex-mml-chtml.js` 配置行保留（新增 katex 行在其后）

---

## L6 · 验证步骤

```text
1. hexo clean && hexo generate → 不报错 ✅
2. 检查"最优化理论"页面 HTML：
   - 包含 katex.min.css 加载 ✅
   - 包含 katex.min.js 加载 ✅
   - 包含 auto-render.min.js 加载 ✅
   - 不包含 MathJax 资源 ✅
3. 检查首页 HTML：不包含任何 katex/MathJax 资源 ✅
4. 浏览器打开"最优化理论"页面 → 公式正确渲染
   - 行内公式 $x_1$ 正常显示
   - 块级公式 $$...$$ 居中显示
   - 无滚动条、无闪烁
5. 浏览器打开"MachineCollectionFinalReview" → 表格内公式正常
6. PJAX 导航到数学文章再离开 → 无错误、无重复加载
```

---

## L7 · 实际执行结果

- **执行日期**: 2026-05-04
- **commit hash**: `5229ef5`
- **改动文件**:
  - `themes/butterfly/layout/includes/third-party/math/katex.pug`（重写，+14 行客户端渲染）
  - `_config.butterfly.yml`（math.use: mathjax → katex，asset.katex 新增）
  - `source/_posts/最优化理论.md`（mathjax: true → katex: true）
  - `source/_posts/MachineCollectionFinalReview.md`（mathjax: true → katex: true）
  - `source/js/katex/`（新增目录，4 个文件）
  - `source/js/katex-auto-render.js`（新增，备用方案）
- **构建结果**: `hexo clean && hexo generate` ✅ 2044 files in 6.24s，无报错
- **HTML 验证**:
  - 数学页面正确加载 katex.min.css + katex.min.js + auto-render.min.js
  - 数学页面**不**加载 MathJax
  - 首页**不**加载任何数学资源
- **渲染效果评估**: ❌ 第一轮浏览器验证发现公式未渲染（详见第二轮）
- **异常 / 备注**: 无

### 第二轮修复：kramed 行内公式保护（2026-05-05）

- **触发原因**: 浏览器中打开数学文章，所有含 `_`、`*` 等 Markdown 特殊字符的行内公式（如 `$c_{ij}$`、`$A_{m \times n}$`）未渲染，下标消失或公式完全消失
- **根本原因**: `hexo-renderer-kramed` 的 `mathjax: true` 选项**不完整**：
  - ✅ 保护 `$$...$$` 块级公式 → 转为 `<script type="math/tex; mode=display">`
  - ❌ **不保护** `$...$` 行内公式 → `_` 被当作 Markdown 斜体，`$c_{ij}$` 变成 `$c<em>{ij}</em>$`，KaTeX auto-render 找不到有效的 `$...$` 对
- **根因分析文档**: [ANALYSIS.md](ANALYSIS.md)（5 层逐层排查，完整数据链）
- **修复方案**:
  1. **新建 `scripts/math-protect.js`**：Hexo `before_post_render` 过滤器，在 Markdown 渲染前将含数学符号（`\` `^` `_` `{` `}`）的行内公式预转为 `<script type="math/tex">` 标签，让 kramed 无法破坏它们。该脚本位于项目 `scripts/` 目录，`npm install` 不会影响它
  2. **重写 `katex.pug`**：从仅 auto-render 升级为**双模式渲染**：
     - 模式 A：处理 `<script type="math/tex">` 标签 → `katex.render()` 直接渲染（kramed 保护后的公式）
     - 模式 B：处理原始 `$...$` / `$$...$$` 文本 → `renderMathInElement` auto-render（不含特殊字符的公式）
  3. **恢复 `node_modules/hexo-renderer-kramed/lib/renderer.js`**：删除第一轮临时添加的正则保护，恢复为原始状态（避免与 Hexo 过滤器双重处理）
- **改动文件**:
  - `scripts/math-protect.js`（**新增**，持久化公式保护）
  - `themes/butterfly/layout/includes/third-party/math/katex.pug`（补充 script tag 处理逻辑，+23 行）
  - `node_modules/hexo-renderer-kramed/lib/renderer.js`（**恢复原始状态**，-2 行）
  - `long-term-memory/04-operations/2026-05-04-katex-migration/ANALYSIS.md`（新增，深度分析报告）
- **构建结果**: `hexo clean && hexo generate` ✅ 2044 files in 8.24s，无报错
- **HTML 验证**（`public/2026/03/03/最优化理论/index.html`）：
  - 行内 `<script type="math/tex">` 标签：**165 个**
  - 块级 `<script type="math/tex; mode=display">` 标签：**67 个**
  - 被破坏的公式（`$c<em>` 模式）：**0 个**
  - 总计：**232 个**公式被正确保护
- **渲染效果评估**: _(需浏览器验证后填充)_
- **异常 / 备注**:
  - `$Z = 1100$` 等**不含** `\ ^ _ { }` 特殊字符的公式仍保留为原始 `$...$` 文本，依赖 KaTeX auto-render 渲染。由于不含 Markdown 特殊字符，kramed 不会破坏它们

---

## L8 · 已知限制与后续优化

1. **字体从 CDN 加载**：当前 CSS 中字体路径指向 jsdelivr CDN。若需完全离线，可下载 21 个 woff2 字体到 `source/js/katex/fonts/`（约 200KB）
2. **KaTeX 语法覆盖**：不支持极少数复杂 LaTeX 扩展。当前两篇文章未使用这些扩展
3. **PJAX 重复加载**：`katex_js_loaded` 全局标志防止同一导航会话内重复加载 JS/CSS，但 PJAX 切到其他页面再返回时会重新渲染（预期行为）
