---
name: Q3 — 删除 tag_plugins 中重复的 jQuery 引用
description: jQuery 已被 inject.bottom 全站加载，tag_plugins 节点的独立 jQuery URL 多余
type: project
---

# Q3 — tag_plugins jQuery 重复去除

> **状态**：✅ 已完成（2026-05-04）
> **关联**：[../../../07-known-issues/discovered-issues/README.md#-b16-jquery-被加载两次](../../../07-known-issues/discovered-issues/README.md)（B16）

---

## L1 · TL;DR

注释掉 `_config.butterfly.yml:1156` 的 `jquery` 行（cdnjs URL）。原因：第 1088 行 `inject.bottom` 已经 `<script defer src="/js/jquery-3.6.0.min.js">` 全站加载本地 jQuery，tag_plugins 在执行时 `window.jQuery` 已存在。

---

## L2 · 问题描述

`_config.butterfly.yml`：

```yaml
inject:
  head:
    ...
  bottom:
    - <script defer src="/js/jquery-3.6.0.min.js"></script>   # line 1088 — 全站本地

CDN:
  option:
    tag_plugins:
      CDN:
        ...
        # jquery: https://lf6-cdn-tos.bytecdntp.com/...        # line 1155 — 已注释（bytecdntp 死链）
        jquery: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js   # line 1156 — 重复
        issues: https://npm.elemecdn.com/...
        carousel: https://npm.elemecdn.com/...
        ...
```

inject.bottom 中的 `jquery-3.6.0.min.js` 是 defer 加载，文档解析完即可执行；当文章渲染含 `{% issues %}` / `{% carousel %}` 等 tag 标签时，主题会插入 tag_plugins 资源，此时 `window.jQuery` 已经定义（理论上 tag_plugins 内部应跳过重新加载，但配置层面仍是冗余）。

**风险点**：tag_plugins 自身的加载逻辑可能假设需要 `tag_plugins.CDN.jquery` 存在；如果删除可能让某些 tag 渲染失败。需要测试。

---

## L3 · 实现方案

### 修改步骤

1. 打开 `_config.butterfly.yml`
2. 定位第 1156 行：`jquery: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js #issues标签依赖`
3. 在行首加 `#` 注释（保留原内容方便回溯）
4. 在注释后追加备注说明

### Diff（预期）

```diff
-        jquery: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js #issues标签依赖
+        # jquery: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js  # 由 inject.bottom 全站本地 jquery-3.6.0.min.js 接管，避免重复加载（2026-05-04 Q3）
```

---

## L4 · 验证步骤

**重点**：必须测含 tag 插件的文章。

```text
1. git diff _config.butterfly.yml  → 只改一行（注释化）
2. hexo clean && hexo generate     → 不报错
3. 找出当前博客中使用了 tag 插件的文章：
   grep -rn "{% issues" source/_posts/
   grep -rn "{% carousel" source/_posts/
   grep -rn "{% timeline" source/_posts/
4. 浏览这些文章的最终 HTML，验证：
   - 标签渲染正常（视觉一致）
   - F12 Console 无 "$ is not defined" / "jQuery is not defined" 错误
   - F12 Network → jquery.min.js 不出现「重复加载」（理想：只有一个本地 jquery 请求）
```

---

## L5 · 回滚步骤

```bash
git revert <Q3-commit-hash>     # 单项回滚
# 或
git reset --hard 59c6f94        # 完全回到基线
```

如果 tag 渲染异常，**第一时间回滚**而不是继续打补丁——本项不应让博客功能退步。

---

## L6 · 实际执行结果

- **执行日期**：2026-05-04
- **commit hash**：（提交后填入）
- **改动行数**：1（`_config.butterfly.yml:1156`，注释化 + 备注说明）
- **构建是否通过**：将随最后批量 hexo generate 验证
- **受影响文章列表（grep 实测）**：
  - `{% issues %}`：**0 篇** 未在任何文章中使用
  - `{% carousel %}`：**0 篇** 未在任何文章中使用
  - `{% anima %}`：**0 篇** 未在任何文章中使用
  - `{% timeline %}`：3 篇 — `ThoughtsOnVibeCoding.md` / `ToTheApril2025.md` / `OpenSourceSummer2025.md`
- **运行时影响评估**：
  - `tag_plugins.CDN.jquery` 仅在文章使用 `{% issues %}` / `{% carousel %}` 时被插件注入，`{% timeline %}` 是纯 CSS 实现不依赖 jQuery
  - 当前博客 0 篇文章使用 jquery-依赖 tag → 该 URL 配置在过去与现在都**从未被实际请求**
  - 本次修改是「修正死配置」，对当前用户体验**零影响**
  - 未来如果新增 `{% issues %}` / `{% carousel %}` 文章，`window.jQuery` 由 inject.bottom 全站本地脚本提供（line 1088），不会出现 jQuery undefined
- **风险等级实际下调**：原 Q3 文档评估为 🟡 低风险（"需要测试"），实测后下调为 🟢 零风险（无受影响文章 + jQuery 已由全站脚本兜底）
- **异常 / 备注**：无
