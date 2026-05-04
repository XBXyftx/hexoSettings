---
name: Q1 — 修正 algolia_search 的 bytecdntp 残留 URL
description: 把 _config.butterfly.yml 中残留的 bytecdntp.com URL 替换为 cdnjs.cloudflare.com
type: project
---

# Q1 — algolia_search bytecdntp → cdnjs

> **状态**：待执行 / 执行中 / 已完成（请按实际更新）
> **关联**：[../../../07-known-issues/discovered-issues/README.md#-b13-algolia_search-是唯一的-bytecdntp-残留](../../../07-known-issues/discovered-issues/README.md)（B13）

---

## L1 · TL;DR

把 `_config.butterfly.yml:1114` 的 algolia_search URL 从已死的 bytecdntp 域换成 cdnjs，路径与版本号 `instantsearch.js/2.10.5` 完全保留。

---

## L2 · 问题描述

`_config.butterfly.yml:1114`：

```yaml
algolia_search: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/instantsearch.js/2.10.5/instantsearch.min.js
```

`bytecdntp.com` 已大规模 404（参见 cdn-strategy.md 的迁移历史），其他 10 个 bytecdntp 引用都已注释或迁走，只剩这一个。

如果 algolia 搜索功能被启用（当前实际配置是否启用需进一步验证），将会请求一个永远 404 的 URL，浏览器报错。

---

## L3 · 实现方案

### 修改步骤

1. 打开 `_config.butterfly.yml`，定位 1114 行
2. 把 URL 从 `https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/instantsearch.js/2.10.5/instantsearch.min.js`
3. 改为 `https://cdnjs.cloudflare.com/ajax/libs/instantsearch.js/2.10.5/instantsearch.min.js`
4. 保留版本号 `2.10.5`（即使是旧版，先维持现状以避免引入新问题）

### Diff（预期）

```diff
- algolia_search: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/instantsearch.js/2.10.5/instantsearch.min.js
+ algolia_search: https://cdnjs.cloudflare.com/ajax/libs/instantsearch.js/2.10.5/instantsearch.min.js
```

---

## L4 · 验证步骤

```text
1. git diff _config.butterfly.yml  → 确认只改了一行
2. hexo clean && hexo generate   → 不报错（可选，不强制）
3. （如果 algolia 搜索启用）打开站点点击搜索框 → 应能正常工作
4. 浏览器 F12 Network → 搜索 instantsearch.min.js 应返回 200
```

---

## L5 · 回滚步骤

```bash
# 单项回滚
git revert <Q1-commit-hash>

# 或者完全回滚到基线
git reset --hard 59c6f94
```

---

## L6 · 实际执行结果

> 执行后在此填入：
> - commit hash：
> - 改动行数：
> - 构建是否通过：
> - 浏览器验证结果：
> - 异常 / 备注：
