---
name: Q7 — typewriter JS 增加 prefers-reduced-motion 检测
description: typewriter-effect.js 的 setInterval 逐字打字行为不响应系统 reduced-motion 偏好，需 JS 层补充检测
type: project
---

# Q7 — typewriter JS `prefers-reduced-motion` 无障碍支持

> **状态**：待执行 / 执行中 / 已完成
> **关联**：[../../../07-known-issues/discovered-issues/README.md#-b19-typewriter-不响应-prefers-reduced-motion](../../../07-known-issues/discovered-issues/README.md)（B19）· [../../../05-reference/typewriter-effect.md](../../../05-reference/typewriter-effect.md)（打字机效果实现）
> ⚠️ **本项修改主题文件**：必须在 [../../../06-theme-modifications/](../../../06-theme-modifications/) 留痕

---

## L1 · TL;DR

在 `themes/butterfly/source/js/typewriter-effect.js` 的 `main()` 函数开头加一行 `matchMedia('(prefers-reduced-motion: reduce)').matches` 检测：若用户启用了 reduced-motion，跳过逐字动画，直接显示完整文本。

---

## L2 · 问题描述

`themes/butterfly/source/css/typewriter-effect.css:275` 已有 `@media (prefers-reduced-motion: reduce)` 处理 cursor blink 和 shimmer 动画，**但 JS 的 `setInterval(typeChar, 20)` 逐字显示仍会执行**。

后果：reduced-motion 用户已经把"装饰性动画"关了，但还是要等几秒看打字机一字一字出文字（动画行为最强烈的部分仍然存在）。

---

## L3 · 实现方案

### 修改位置

`themes/butterfly/source/js/typewriter-effect.js`，找到主入口 `main()`（或被 PJAX 重新调用的初始化函数）。

### 修改步骤

1. 读 `themes/butterfly/source/js/typewriter-effect.js` 的 main() / init() / start() 等入口
2. 找到开始 setInterval 的位置（典型形如 `setInterval(typeChar, 20)`）
3. 在 setInterval 调用之前加：

```js
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // reduced-motion 用户：直接显示完整文本，跳过逐字动画
  target.textContent = fullText;  // 用实际的目标元素与文本变量
  return;  // 或 continue / break，按现有控制流调整
}
```

### 注意事项

- 必须知道目标元素和完整文本是什么变量名（读源码确定）
- `return` 时机要正确：避免阻断 `pjax:complete` 之后的其他重初始化逻辑
- 完成后立即更新 `06-theme-modifications/` 的修改记录

---

## L4 · 验证步骤

```text
1. git diff themes/butterfly/source/js/typewriter-effect.js  → 改动只在 main() 入口加 4-6 行
2. hexo clean && hexo generate  → 不报错
3. 默认情况：浏览任意含 typewriter 字段的文章 → 打字机效果正常逐字显示 ✓
4. F12 → Rendering → Emulate CSS media feature prefers-reduced-motion: reduce → 重新加载页面
   → 文字应「一次性显示完整」，不再逐字
5. 关闭 reduced-motion 模拟 → 打字机效果恢复
6. PJAX 切换文章 → 打字机能在新文章重新启动（默认情况）
```

---

## L5 · 回滚步骤

```bash
git revert <Q7-commit-hash>
# 或
git reset --hard 59c6f94
```

⚠️ 修改主题文件需要在 `06-theme-modifications/` 同步记录。回滚 commit 时也要回滚相应文档。

---

## L6 · 主题文件修改留痕

完成本项时必须新增或更新 `06-theme-modifications/` 中的对应文档（如：`typewriter-effect-modifications.md`），记录：
- 修改文件：`themes/butterfly/source/js/typewriter-effect.js`
- 修改时间：2026-05-04
- 修改原因：B19 无障碍支持
- 改动 diff（精简版）

---

## L7 · 实际执行结果

> 执行后在此填入：
> - commit hash：
> - 改动行数：
> - 构建是否通过：
> - 默认状态打字机效果验证：
> - reduced-motion 模拟验证：
> - PJAX 切换验证：
> - 06-theme-modifications/ 留痕文件路径：
> - 异常 / 备注：
