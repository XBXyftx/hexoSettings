---
name: Q5 — coffer 私密文章添加 skip_render 防直链访问
description: 在主 _config.yml 添加 skip_render 让 Hexo 不渲染 private-posts 下的 .md，防绕过密码直接访问
type: project
---

# Q5 — coffer 私密文章 `skip_render` 防护

> **状态**：⛔ 已搁置（2026-05-04 预检发现冲突，必须重新设计后才能执行）
> **关联**：[../../../07-known-issues/discovered-issues/README.md#-b12-coffer-私密文章可直接访问](../../../07-known-issues/discovered-issues/README.md)（B12）· [../../../02-custom-pages/coffer-private-posts.md](../../../02-custom-pages/coffer-private-posts.md)（私密文章系统全图）

---

## L1 · TL;DR

在主配置 `_config.yml` 加 `skip_render: 'coffer/private-posts/**'`，让 Hexo 不再把这些 .md 渲染为 .html，但 `scripts/private-posts-scanner.js` 仍可读 .md 内容。从此 `https://站点/coffer/private-posts/HarmonyGuide.html` 返回 404。

---

## L2 · 问题描述

`source/coffer/private-posts/` 下的 .md 文件（当前 2 篇）：
- `HarmonyGuide.md`
- `my-first-private-post.md`

Hexo 会按默认规则把每个 .md 渲染为 HTML，输出到：
- `public/coffer/private-posts/HarmonyGuide.html`
- `public/coffer/private-posts/my-first-private-post.html`

**绕过路径**：用户访问 `/coffer/`，看到密码页，但只要他知道（或猜到）文件名 `HarmonyGuide`，就可以直接访问 `/coffer/private-posts/HarmonyGuide.html`，跳过整个 coffer.js 的密码验证。

`scripts/private-posts-scanner.js` 是 Hexo `before_generate` 钩子，**直接读文件系统的 .md**（不依赖 Hexo 的渲染），所以它仍能正常构建 `private-posts.json`。

`skip_render` 是 Hexo 内置功能，能让特定文件被识别为"不渲染"，但仍保留在 `source/` 中。

---

## L3 · 实现方案

### 选择方案：A（修主 `_config.yml`）vs B（每篇加 `published: false`）

| 方案 | 优点 | 缺点 |
|---|---|---|
| **A: skip_render 全局** | 一行配置，所有文件自动生效；新增私密文章无需手动设置 | 需熟悉 Hexo `skip_render` 行为 |
| B: 每篇 published: false | 文件级控制 | 需要修改每个 .md，新增私密文章容易忘记加 |

**采用方案 A**。

### 修改步骤

1. 打开 `_config.yml`
2. 找 `skip_render:` 配置项（如不存在则新增）
3. 添加：`skip_render: 'coffer/private-posts/**'`
4. 如已存在 skip_render，扩展为数组形式

### Diff（预期，假设原 _config.yml 没有 skip_render）

```diff
+ # 私密文章不渲染为 HTML，仅由 coffer.js 通过 JSON 接入（2026-05-04 Q5）
+ skip_render: 'coffer/private-posts/**'
```

如果已有 skip_render：

```diff
- skip_render: 'old-pattern/**'
+ skip_render:
+   - 'old-pattern/**'
+   - 'coffer/private-posts/**'  # 私密文章防直链（2026-05-04 Q5）
```

---

## L4 · 验证步骤

**关键**：scanner 必须仍能产出 private-posts.json，否则 coffer 列表会空。

```text
1. git diff _config.yml  → 只加（或修改）skip_render 一项
2. hexo clean && hexo generate
3. 检查产物：
   - source/coffer/private-posts.json  → 应仍存在且非空（含 2 篇文章）
   - public/coffer/private-posts/HarmonyGuide.html  → 应不存在（404 验证）
   - public/coffer/private-posts/my-first-private-post.html  → 应不存在
   - public/coffer/index.html  → 应正常存在（密码页）
4. （部署后）浏览器：
   - 访问 /coffer/private-posts/HarmonyGuide.html  → 404
   - 访问 /coffer/  → 密码页，输入 10021021  → 文章列表显示 2 篇 → 点击文章打开 HarmonyGuide ?

```

⚠️ **重要观察点**：方案 A 让 .md 不渲染，但 coffer.js 的「点击文章打开」逻辑可能依赖渲染后的 .html！需查 coffer.js 的 `openPost()` / 列表项 click 处理。如果它跳的是 `.html`，那本方案会让点击文章变 404。

**预先检查**：在 commit 前查看 coffer.js 的文章打开逻辑，**确认它跳的是 .md 渲染的 HTML 还是其他什么**。如果跳 HTML，则不能直接 skip_render，需要改方案。

---

## L5 · 回滚步骤

```bash
git revert <Q5-commit-hash>     # 单项回滚
# 或
git reset --hard 59c6f94        # 完全回到基线
```

如果 skip_render 让点击文章变 404，**立即回滚**。

---

## L6 · 实际执行结果

- **执行日期**：2026-05-04（**未执行 / 搁置**）
- **commit hash**：N/A
- **预检结论**：**方案 A 不可行**
- **决定性证据**：[`source/js/coffer.js:240-248`](../../../../source/js/coffer.js#L240-L248)

  ```js
  window.openPost = function(filename) {
    // 将.md文件名转换为.html路径
    const htmlFilename = filename.replace('.md', '.html');
    const postUrl = '/coffer/private-posts/' + htmlFilename;
    window.open(postUrl, '_blank');
  };
  ```

  coffer.js 的"📖 阅读文章"按钮**直接跳转到 Hexo 渲染的 `.html`**。如果加 `skip_render: 'coffer/private-posts/**'`，HTML 文件不再生成，点击文章 → 404。

- **同时也意味着 B12 的安全模型本质有缺陷**：
  - 当前实现：`.html` 必然生成 → 知道文件名即可绕过密码 → 绕过路径已存在
  - 仅做 skip_render 也无法不破坏功能地修复
  - 真正修复需要架构改造

- **后续处理排期（不属于 Q5 范畴，记录到 BUG 清单跟踪）**：
  - 方案 X：保留 .html 渲染，但在每篇 .html 注入「从 sessionStorage 读密码状态，否则跳回 /coffer/」的 JS 守门（和 coffer.js 共享同一密码状态）
  - 方案 Y：跳过 Hexo 渲染 + 改写 coffer.js，让点击文章时通过 fetch 读 .md 原文，用 marked.js 客户端渲染（方案 A + 客户端渲染）
  - 方案 Z：把私密文章改为静态 JSON 数组（已渲染好的 HTML 字符串），打包到 `private-posts.json` → 只生成 JSON 不生成 .html

- **三套方案均涉及"重设计"**：B12 已不属于"快速修复"，应在下一批专项任务中处理
- **本 Q5 的最终结论**：⛔ **不执行**，等架构方案确定后再上 commit
- **异常 / 备注**：预检流程价值兑现 — 提前避免了一次会让密码页 + 文章列表都失效的错误执行
