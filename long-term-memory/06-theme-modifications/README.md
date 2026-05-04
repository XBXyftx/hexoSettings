# 06-theme-modifications — 主题修改跟踪

本目录记录所有对 `themes/butterfly/` 目录下文件的修改。

---

## 为什么必须记录

Butterfly 主题是第三方开源项目，理论上可以通过 `npm update` 或 `git pull` 升级。但本项目对主题进行了**大量自定义修改**（8个模板文件被直接修改，大量自定义 CSS/JS 注入），升级主题时必须手动合并这些修改。

**如果不记录**，升级主题时会丢失所有自定义功能，且无法快速恢复。

---

## 修改记录格式

```markdown
### #N — YYYY-MM-DD — 修改简述

**修改文件**：`themes/butterfly/具体路径`
**修改原因**：为什么要改
**修改内容**：具体改了什么
**相关文件**：关联的自定义 CSS/JS 文件
**可回滚性**：是否可安全回滚
```

---

## 已知的主题修改（需人工补充历史）

以下是通过代码扫描发现的已修改文件，但历史修改时间和原因需要人工补充：

### #1 — 2026-05-04 — typewriter-effect.js 增加 prefers-reduced-motion 短路

**修改文件**：`themes/butterfly/source/js/typewriter-effect.js`
**修改原因**：B19 — typewriter 逐字 setInterval 动画对 reduced-motion 用户不友好，CSS 已在该媒体查询下停 cursor blink/shimmer，但 JS 的逐字动画仍然执行（动画行为最强烈的部分仍存在）
**修改内容**：在 `TypeWriter.start()` 方法 Promise 内最前端加 `matchMedia('(prefers-reduced-motion: reduce)').matches` 检测，命中则把 `this.text` 整体写入 `this.element.textContent`，立刻 `resolve()` 并 return，跳过 `setInterval` 逐字循环
**改动行数**：+7（含 1 行注释）
**相关文件**：`themes/butterfly/source/css/typewriter-effect.css:275`（已有 CSS 媒体查询，本次是把同一原则应用到 JS）
**可回滚性**：可安全回滚（git revert）。回滚后行为退回为「reduced-motion 用户也看到逐字动画」，是已知的旧行为，不引入新故障
**关联文档**：[../04-operations/2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md](../04-operations/2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md)
**关联 commit**：（提交后填入）

---

### 已有的主题修改（历史扫描记录）

### layout/includes/layout.pug

| 项 | 值 |
|---|---|
| **修改内容** | 在 body 中注入入场弹窗 HTML 结构 |
| **新增代码** | `#entrance-popup.entrance-popup` 及其子元素 |
| **关联文件** | `entrance-popup.js`, `entrance-popup.css` |
| **影响** | 所有页面都会包含弹窗 DOM |

### layout/includes/head.pug

| 项 | 值 |
|---|---|
| **修改内容** | 添加多个自定义 CSS/JS 链接 |
| **新增代码** | typewriter-effect.css、entrance-popup.css、lazy-loading 系列 CSS、vscode-breadcrumb-toc.css、header-universe.js |
| **条件加载** | 部分 CSS/JS 仅在文章页面（`globalPageType === 'post'`）或首页加载 |
| **影响** | 所有页面的 head 部分 |

### layout/includes/additional-js.pug

| 项 | 值 |
|---|---|
| **修改内容** | 添加多个自定义 JS 加载 |
| **新增代码** | waterfall.js（首页）、typewriter-effect.js（文章页）、network-monitor.js、topimg-monitor.js、entrance-popup 系列、lazy-loading 系列、vscode-breadcrumb-toc.js（文章页） |
| **影响** | 所有页面的底部 JS 加载 |

### layout/includes/footer.pug

| 项 | 值 |
|---|---|
| **修改内容** | 添加建站时间统计 |
| **新增代码** | 内联 JavaScript，计算从 2024-04-25 18:30 开始的运行时间 |
| **影响** | 所有页面的 footer |

### layout/includes/mixins/indexPostUI.pug

| 项 | 值 |
|---|---|
| **修改内容** | 添加瀑布流布局（layout 8）支持 |
| **关联文件** | `waterfall.js`, `waterfall-homepage.styl` |
| **影响** | 首页文章卡片布局 |

### layout/index.pug

| 项 | 值 |
|---|---|
| **修改内容** | 添加瀑布流 masonry 类 |
| **影响** | 首页容器类名 |

### layout/includes/head/config_site.pug

| 项 | 值 |
|---|---|
| **修改内容** | 将 `page.typewriter` 暴露到 `GLOBAL_CONFIG_SITE` |
| **影响** | 文章页面的全局配置对象 |

### source/js/main.js

| 项 | 值 |
|---|---|
| **修改内容** | 包含注释掉的 hamburger 菜单修复代码和增强移动端检测 |
| **影响** | 主题主脚本 |

---

## 主题文件修改状态总览

| 文件 | 修改类型 | 风险等级 | 升级时处理建议 |
|------|---------|---------|--------------|
| `layout/includes/layout.pug` | 添加 HTML | 中 | 升级后重新注入弹窗结构 |
| `layout/includes/head.pug` | 添加链接 | 高 | 升级后所有自定义 CSS/JS 链接需重新添加 |
| `layout/includes/additional-js.pug` | 添加加载 | 高 | 升级后所有自定义 JS 需重新添加 |
| `layout/includes/footer.pug` | 添加脚本 | 低 | 升级后重新添加建站时间统计 |
| `layout/includes/mixins/indexPostUI.pug` | 修改布局 | 高 | 升级后重新实现 layout 8 逻辑 |
| `layout/index.pug` | 添加类名 | 低 | 升级后重新添加 masonry 类 |
| `layout/includes/head/config_site.pug` | 添加字段 | 中 | 升级后重新暴露 typewriter 字段 |
| `source/js/main.js` | 添加注释 | 低 | 影响不大，可忽略 |

---

## 升级主题时的检查清单

当 Butterfly 主题发布新版本时，按以下步骤操作：

1. [ ] 备份当前主题目录 `themes/butterfly/`
2. [ ] 下载新版本主题
3. [ ] 对比本目录中的所有修改记录，逐一在新版本中重新应用
4. [ ] 验证所有自定义功能正常工作
5. [ ] 在本目录中新增一条升级记录
