---
name: Q2 — avatar-ring 增加 prefers-reduced-motion 媒体查询
description: 关于页头像光环 4s 永久旋转无暂停，对开启系统 reduced-motion 偏好的用户应停止动画
type: project
---

# Q2 — avatar-ring `prefers-reduced-motion` 无障碍支持

> **状态**：待执行 / 执行中 / 已完成
> **关联**：[../../../07-known-issues/discovered-issues/README.md#-b7-关于页-avatar-ring-永久旋转无暂停](../../../07-known-issues/discovered-issues/README.md)（B7）

---

## L1 · TL;DR

在 `source/about/index.html` 的 `.avatar-ring` 样式块附近追加一个 `@media (prefers-reduced-motion: reduce)` 规则，把动画停掉。**完全是新增 CSS，不改默认行为**。

---

## L2 · 问题描述

`source/about/index.html:53` 附近：

```css
.avatar-ring {
  border-radius: 50%;
  background: conic-gradient(/* 12 段灰阶 */) border-box;
  animation: rotate 4s linear infinite;
}
```

- 4s 一圈，永久播放
- 即使切换到其他标签页（visibility hidden）也仍在执行（CSS 动画引擎在主流浏览器是会被节流，但仍消耗系统资源）
- 对前庭功能障碍 / 晕动症用户不友好（W3C 推荐响应 `prefers-reduced-motion`）

项目其他地方（`typewriter-effect.css`、`lazy-loading-stable.css`、`lazy-loading-optimized.css`）已经使用 `prefers-reduced-motion` 模式，本次是把同一原则应用到关于页。

---

## L3 · 实现方案

### 修改步骤

1. 打开 `source/about/index.html`
2. 找到 `.avatar-ring` 样式定义所在的 `<style>` 块（line 53 附近）
3. 在 `.avatar-ring { ... }` 之后追加：

```css
@media (prefers-reduced-motion: reduce) {
  .avatar-ring {
    animation: none;
  }
}
```

### 选择追加位置的依据

- 紧邻原 `.avatar-ring` 块，便于将来的人理解关联
- 不要分散到文件其他位置

### Diff（预期）

```diff
.avatar-ring {
  border-radius: 50%;
  background: conic-gradient(...) border-box;
  animation: rotate 4s linear infinite;
}

+@media (prefers-reduced-motion: reduce) {
+  .avatar-ring {
+    animation: none;
+  }
+}
```

---

## L4 · 验证步骤

```text
1. git diff source/about/index.html  → 只增加 5 行 CSS
2. 浏览器打开 /about/  → 默认情况下光环依然旋转（行为不变）
3. F12 → 设备模拟 → 「More tools / Rendering」中开启 Emulate CSS media feature prefers-reduced-motion: reduce
4. 关于页光环停止旋转 ✓
5. 关闭 reduced-motion 模拟，光环恢复旋转 ✓
```

---

## L5 · 回滚步骤

```bash
git revert <Q2-commit-hash>
# 或
git reset --hard 59c6f94
```

风险：极低。即使回滚也只是恢复到"永久旋转"的旧状态，不会引入新问题。

---

## L6 · 实际执行结果

> 执行后在此填入：
> - commit hash：
> - 改动行数：
> - 构建是否通过：
> - 浏览器默认状态验证：
> - reduced-motion 模拟验证：
> - 异常 / 备注：
