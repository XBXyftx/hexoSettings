---
name: Q5 — coffer 私密文章添加 skip_render 防直链访问
description: 在主 _config.yml 添加 skip_render 让 Hexo 不渲染 private-posts 下的 .md，防绕过密码直接访问
type: project
---

# Q5 — coffer 私密文章 `skip_render` 防护

> **状态**：待执行 / 执行中 / 已完成
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

> 执行后在此填入：
> - commit hash：
> - 改动行数：
> - 构建是否通过：
> - private-posts.json 是否仍生成：
> - 私密 .html 是否消失：
> - coffer.js 文章打开是否仍工作：
> - 异常 / 备注：
