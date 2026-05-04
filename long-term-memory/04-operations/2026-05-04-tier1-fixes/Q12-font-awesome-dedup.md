---
name: Q12 — Font Awesome 重复加载(B17)
description: Font Awesome CSS 被加载两次(主题 head.pug 直接加载 + inject.head 异步加载),导致重复请求和带宽浪费
type: project
---

# Q12 — Font Awesome 重复加载 (B17)

> **状态**: 🔍 深度调研完成,准备执行
> **关联**: [../../../07-known-issues/discovered-issues/README.md](../../../07-known-issues/discovered-issues/README.md)(B17) · [../../../06-theme-modifications/README.md](../../../06-theme-modifications/README.md)

---

## L1 · TL;DR

Font Awesome CSS 被加载了两次:
1. `themes/butterfly/layout/includes/head.pug:52` — 主题内置直接加载(阻塞渲染)
2. `_config.butterfly.yml:1081` (inject.head) — 用户自定义异步加载(`media="print"`)

修复方案:将主题内置加载改为异步(`media="print" onload="this.media='all'"`),删除 inject.head 中的重复项。保留非阻塞优化,消除重复请求。

---

## L2 · 问题描述

**文件 1**: [themes/butterfly/layout/includes/head.pug](../../../../themes/butterfly/layout/includes/head.pug) :52
```pug
link(rel='stylesheet', href=url_for(theme.asset.fontawesome))
```

**文件 2**: `_config.butterfly.yml` :1081
```yaml
inject:
  head:
    - <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media='all'">
```

**产物验证**(public/index.html):
```html
<!-- 第一次: 来自 head.pug,阻塞加载 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<!-- 第二次: 来自 inject.head,异步加载 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media='all'">
```

**影响**:同一文件下载两次,浪费 ~80KB 带宽和一次 HTTP 请求。

---

## L3 · 深度调研结果

### 3.1 依赖关系

```
themes/butterfly/layout/includes/head.pug:52
  └── link(rel='stylesheet', href=url_for(theme.asset.fontawesome))
        └── _config.butterfly.yml:1175 fontawesome: https://cdnjs.cloudflare.com/...

_config.butterfly.yml:1066 inject.head
  └── line 1081: Font Awesome 异步加载标签
        └── 通过 injectHtml() 注入到 <head>
```

**inject.head 的设计意图**:用户为性能优化而添加的"非阻塞 CSS 加载"。但不知道主题本身已经通过 head.pug 加载了同一份 CSS。

### 3.2 版本差异

无。两份加载指向完全相同的 URL(`cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`)。

### 3.3 修正后潜在崩溃隐患排查

| 隐患 | 评估 | 结论 |
|---|---|---|
| `media="print" onload="this.media='all'"` 导致图标闪烁 | 这是标准异步 CSS 加载技术,inject.head 版本已运行多时无问题 | ❌ 不存在 |
| 删除 inject.head 后其他页面依赖该注入 | inject.head 中仅此一处 Font Awesome,无其他依赖 | ❌ 不存在 |
| 修改 head.pug 导致升级冲突 | 已在 06-theme-modifications/ 留痕,升级时可恢复 | 🟡 已记录 |
| 某些浏览器不支持 `media="print"` hack | 回退行为:浏览器以 print 样式表加载,onload 后切为 all。不支持 onload 的浏览器图标不显示直到交互 — 但这是渐进增强,核心内容不受影响 | 🟡 可接受 |

**综合判定: 低崩溃隐患,可安全执行。**

---

## L4 · 实现方案

### 修改文件 1

`themes/butterfly/layout/includes/head.pug`

### 修改步骤 1

将 line 52 从直接加载改为异步加载:

```diff
- link(rel='stylesheet', href=url_for(theme.asset.fontawesome))
+ link(rel='stylesheet', href=url_for(theme.asset.fontawesome) media="print" onload="this.media='all'")
```

### 修改文件 2

`_config.butterfly.yml`

### 修改步骤 2

删除 inject.head 中的 Font Awesome 重复项(line 1080-1081):

```diff
    - <link rel="stylesheet" href="/css/readmode-enhanced.css" media="print" onload="this.media='all'">
-   # 4. 字体优化（Font Awesome）
-   - <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media='all'">
```

### 06-theme-modifications/ 留痕

同步更新 `long-term-memory/06-theme-modifications/README.md`,新增一条修改记录。

---

## L5 · 验证步骤

```text
1. git diff themes/butterfly/layout/includes/head.pug → 仅 1 处 media 属性变更
2. git diff _config.butterfly.yml → inject.head 中 Font Awesome 行删除
3. hexo clean && hexo generate → 不报错
4. grep "font-awesome" public/index.html → 仅 1 处出现,且含 media="print"
5. 浏览全站 → 所有 Font Awesome 图标(fas fa-robot, fab fa-github 等)正常显示
```

---

## L6 · 回滚步骤

```bash
git revert <Q12-commit-hash>    # 单项回滚
# 或
git reset --hard 3ec6ebd        # 完全回到基线
```

---

## L7 · 实际执行结果

_(执行后填充)_
