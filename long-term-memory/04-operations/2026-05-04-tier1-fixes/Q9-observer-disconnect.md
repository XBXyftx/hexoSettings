---
name: Q9 — lazy-loading-optimized observer disconnect(B9)
description: PJAX 切页时 createObserver() 覆盖模块级 observer 引用但未 disconnect,导致 IntersectionObserver 泄漏
type: project
---

# Q9 — lazy-loading-optimized observer disconnect (B9)

> **状态**: 🔍 深度调研完成,准备执行
> **关联**: [../../../07-known-issues/discovered-issues/README.md](../../../07-known-issues/discovered-issues/README.md)(B9)

---

## L1 · TL;DR

在 `themes/butterfly/source/js/lazy-loading-optimized.js` 的 `createObserver()` 开头加 4 行:若 `observer` 已存在则先 `disconnect()` 再置 `null`,防止 PJAX 切页时 IntersectionObserver 泄漏。

---

## L2 · 问题描述

**文件**: [themes/butterfly/source/js/lazy-loading-optimized.js](../../../../themes/butterfly/source/js/lazy-loading-optimized.js)

**当前代码流程**:
```
let observer = null;           // 模块级变量(line 21)

createObserver() {             // line 23
  observer = new IntersectionObserver(...);  // line 30: 直接覆盖旧引用
}

initLazyLoad() {               // line 87
  createObserver();            // line 105
  images.forEach(img => observer.observe(img));  // line 122
}

init() {                       // line 150
  initLazyLoad();              // line 157
}

document.addEventListener('pjax:complete', init);  // line 168
```

**泄漏路径**:
1. 首次加载页面 A → `init()` → `createObserver()` → `observer` 观察页面 A 的 N 张图片
2. PJAX 切换到页面 B → `pjax:complete` → `init()` → `createObserver()` → **新 `observer` 覆盖旧引用**
3. 旧 `observer` 仍持有页面 A 的 N 个 DOM 元素引用 → GC 无法回收
4. 浏览 20 页 → 泄漏 20 个 IntersectionObserver + 20×N 个 DOM 引用

---

## L3 · 深度调研结果

### 3.1 依赖关系

```
lazy-loading-optimized.js (IIFE)
  ├── observer (模块级 let)
  │     └── createObserver() 创建 / 覆盖
  │     └── IntersectionObserver 回调内 unobserve(entry.target)
  │     └── initLazyLoad() 内 observe(img)
  │
  ├── init() → initLazyLoad() → createObserver()
  │     └── DOMContentLoaded 监听(首次加载)
  │     └── pjax:complete 监听(PJAX 切页) ← 泄漏触发点
  │
  └── window.lazyLoadRefresh = init (全局暴露)
```

**关键发现**:
- `observer` 是模块级唯一引用点,无外部代码持有它
- `observer.unobserve()` 已在回调内正确使用(line 34)
- 唯一缺失的是 **重新初始化前释放旧 observer**

### 3.2 版本差异

无。本文件为项目自定义文件(非 Butterfly 主题自带),无版本升级冲突。

### 3.3 修正后潜在崩溃隐患排查

| 隐患 | 评估 | 结论 |
|---|---|---|
| `disconnect()` 在已触发回调的 observer 上调用异常 | `disconnect()` 是 Web API 标准方法,任何状态下均可安全调用 | ❌ 不存在 |
| `disconnect()` 后旧 observer 的回调仍被执行 | `disconnect()` 立即停止回调触发,已入队回调可能再执行一次但不会崩溃 | ❌ 不存在 |
| 多次快速 PJAX 切页导致竞态 | `disconnect()` 同步执行,无异步竞态 | ❌ 不存在 |
| 降级方案(不支持 IntersectionObserver)受影响 | 降级方案直接调用 `loadAllImages()`,不走 `createObserver()` | ❌ 不存在 |
| `observer = null` 后其他代码访问报错 | 唯一访问点 `initLazyLoad()` 在 `createObserver()` 之后,且被 `if (observer)` 保护 | ❌ 不存在 |

**综合判定: 零崩溃隐患,可安全执行。**

---

## L4 · 实现方案

### 修改文件

`themes/butterfly/source/js/lazy-loading-optimized.js`

### 修改步骤

在 `createObserver()` 函数开头、`supportsIntersectionObserver` 检查之后,添加旧 observer 释放逻辑:

```js
function createObserver() {
  if (!supportsIntersectionObserver) {
    // 降级方案:直接加载所有图片
    loadAllImages();
    return;
  }
  
  // 释放旧 observer 防止 PJAX 切页时泄漏 (2026-05-04 Q9 / B9)
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  observer = new IntersectionObserver((entries) => {
```

### Diff(预期)

```diff
  function createObserver() {
    if (!supportsIntersectionObserver) {
      // 降级方案:直接加载所有图片
      loadAllImages();
      return;
    }
    
+   // 释放旧 observer 防止 PJAX 切页时泄漏 (2026-05-04 Q9 / B9)
+   if (observer) {
+     observer.disconnect();
+     observer = null;
+   }
    
    observer = new IntersectionObserver((entries) => {
```

**改动行数**: +4

---

## L5 · 验证步骤

```text
1. git diff themes/butterfly/source/js/lazy-loading-optimized.js → 仅 createObserver() 内加 4 行
2. hexo clean && hexo generate → 不报错
3. 浏览任意文章页 → 图片懒加载正常工作
4. PJAX 切换到另一篇文章 → 图片懒加载继续正常工作
5. F12 → Memory → 多次切页后 observer 数量不增长
   (可选: 在 console 执行 `lazyLoadRefresh()` 多次,不应报错)
```

---

## L6 · 回滚步骤

```bash
git revert <Q9-commit-hash>     # 单项回滚
# 或
git reset --hard 3ec6ebd        # 完全回到基线
```

---

## L7 · 实际执行结果

_(执行后填充)_
