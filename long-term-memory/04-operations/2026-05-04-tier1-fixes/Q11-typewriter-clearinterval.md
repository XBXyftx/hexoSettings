---
name: Q11 — typewriter clearInterval 防 PJAX 泄漏(B8)
description: TypeWriter.start() 的 setInterval 在 PJAX 切页时未清除,导致 timer 持续修改已卸载 DOM + 多 timer 并发
type: project
---

# Q11 — typewriter clearInterval 防 PJAX 泄漏 (B8)

> **状态**: 🔍 深度调研完成,准备执行
> **关联**: [../../../07-known-issues/discovered-issues/README.md](../../../07-known-issues/discovered-issues/README.md)(B8) · [../2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md](../2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md)(同一文件的上次修改)

---

## L1 · TL;DR

`themes/butterfly/source/js/typewriter-effect.js` 中 `TypeWriter.start()` 的 `setInterval` 在 PJAX 切页时未清除,导致:
1. 旧 timer 持续修改已卸载 DOM 元素
2. 多次切页后多个 timer 并发运行

修复: 模块级跟踪所有相关 timer(`mainTimeout`、`startDelayTimeout`、`charInterval`),在 `pjax:send` 和每次 `initTypewriterEffect()` 开头统一清理。

---

## L2 · 问题描述

**文件**: [themes/butterfly/source/js/typewriter-effect.js](../../../../themes/butterfly/source/js/typewriter-effect.js)

**当前代码中的 timer 链**:
```
main() ──setTimeout(1000ms)──► initTypewriterEffect()
                                    │
                                    └── setTimeout(300ms) ──► typewriter.start()
                                                                    │
                                                                    └── setInterval(20ms) 逐字打字
```

**泄漏路径**:
1. 用户进入文章 A(含 typewriter) → `main()` 等待 1s → `initTypewriterEffect()` 创建 DOM,等待 300ms → `start()` 启动 `setInterval` 逐字
2. 用户在打字完成前 PJAX 切到文章 B
3. 旧 `setInterval` 仍在运行,修改已卸载的 DOM 元素(虽不出错但占内存)
4. 文章 B 的 `pjax:complete` → 新 `main()` 启动新 timer 链
5. 旧 `main()` 的 `setTimeout(1000ms)` 若尚未触发,到期后还会再跑一次 `initTypewriterEffect()`
6. 结果:新旧 timer 并发,可能插入两个打字机容器

---

## L3 · 深度调研结果

### 3.1 依赖关系

```
typewriter-effect.js (IIFE)
  ├── TypeWriter 类
  │     └── start() → setInterval(20ms) 逐字 → clearInterval 完成
  │
  ├── initTypewriterEffect()
  │     ├── 创建 .post-typewriter-container DOM
  │     ├── 插入到 #article-container
  │     └── setTimeout(300ms) → typewriter.start()
  │
  ├── main()
  │     ├── await waitForPageReady() (轮询 #loading-box)
  │     └── setTimeout(1000ms) → initTypewriterEffect()
  │
  ├── DOMContentLoaded → main() (首次加载)
  └── pjax:complete → main() (PJAX 切页)
```

### 3.2 已有 Q7 修改的影响

[2026-05-04 Q7](../2026-05-04-quick-fixes/Q7-typewriter-reduced-motion.md) 已在 `TypeWriter.start()` 内添加了 `prefers-reduced-motion` 短路:
```js
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  this.element.textContent = this.text;
  // ...
}
```

本修改在此基础上叠加,互不冲突。

### 3.3 修正后潜在崩溃隐患排查

| 隐患 | 评估 | 结论 |
|---|---|---|
| `clearInterval`/`clearTimeout` 对无效 ID 报错 | 标准行为:对无效 ID 调用是安全无操作 | ❌ 不存在 |
| 清理后重复调用 `initTypewriterEffect()` 导致 DOM 重复 | 每次调用开头主动移除旧 `.post-typewriter-container` | ❌ 已防护 |
| `pjax:send` 时正在打字,清理后光标动画 Promise 未 resolve | 旧 Promise 悬空但内存影响可忽略;新页面会创建新 Promise | ❌ 不影响功能 |
| `waitForPageReady()` 的轮询 timer 未清理 | 该 timer 在 Promise resolve 后自然停止;PJAX 后旧 Promise 可能稍晚 resolve 并触发旧 main() timeout,但 `initTypewriterEffect()` 开头的清理会处理 | ❌ 已兜底 |
| reduced-motion 短路分支与 timer 清理冲突 | 短路分支不走 setInterval,`charInterval` 始终为 null,清理逻辑无影响 | ❌ 不存在 |

**综合判定: 低崩溃隐患,可安全执行。**

---

## L4 · 实现方案

### 修改文件

`themes/butterfly/source/js/typewriter-effect.js`

### 修改步骤

1. IIFE 开头添加 `typewriterTimers` 对象和 `clearAllTypewriterTimers()` 函数
2. `main()` 内: `setTimeout` ID 存入 `typewriterTimers.mainTimeout`
3. `initTypewriterEffect()` 内:
   - 开头调用 `clearAllTypewriterTimers()`
   - 移除已有的 `.post-typewriter-container`
   - `setTimeout` ID 存入 `typewriterTimers.startDelayTimeout`
4. `TypeWriter.start()` 内:
   - `setInterval` ID 存入 `typewriterTimers.charInterval`
   - 完成时置 null
5. 添加 `pjax:send` 监听器调用 `clearAllTypewriterTimers()`

### Diff(预期)

```diff
 (function() {
   // 打字机效果类
+  // 模块级:跟踪所有活跃定时器,防止 PJAX 切页时泄漏 (2026-05-04 Q11 / B8)
+  const typewriterTimers = {
+    mainTimeout: null,
+    startDelayTimeout: null,
+    charInterval: null
+  };
+
+  function clearAllTypewriterTimers() {
+    if (typewriterTimers.mainTimeout) { clearTimeout(typewriterTimers.mainTimeout); typewriterTimers.mainTimeout = null; }
+    if (typewriterTimers.startDelayTimeout) { clearTimeout(typewriterTimers.startDelayTimeout); typewriterTimers.startDelayTimeout = null; }
+    if (typewriterTimers.charInterval) { clearInterval(typewriterTimers.charInterval); typewriterTimers.charInterval = null; }
+  }
+
   class TypeWriter {
     // ...
     start() {
       return new Promise((resolve) => {
         // ... reduced-motion 检查 ...
         
+        // 清除旧 timer(防止 PJAX 快速切页时累积)
+        if (typewriterTimers.charInterval) {
+          clearInterval(typewriterTimers.charInterval);
+          typewriterTimers.charInterval = null;
+        }
         
-        const timer = setInterval(() => {
+        typewriterTimers.charInterval = setInterval(() => {
           // ...
           } else {
-            clearInterval(timer);
+            clearInterval(typewriterTimers.charInterval);
+            typewriterTimers.charInterval = null;
             resolve();
           }
         }, this.speed);
       });
     }
   }
 
   function initTypewriterEffect() {
     if (!document.querySelector('#post')) return;
+    
+    // 清理旧资源和定时器,防止 PJAX 切页或重复调用时累积 (2026-05-04 Q11 / B8)
+    clearAllTypewriterTimers();
+    const oldContainer = document.querySelector('.post-typewriter-container');
+    if (oldContainer) oldContainer.remove();
     
     // ... 创建新容器 ...
     
     setTimeout(() => {
       typewriter.start().then(() => {
         // ...
       });
-    }, 300);
+    }, 300);
+    typewriterTimers.startDelayTimeout = typewriterContainer.querySelector(...); // 不对,这里要改
```

**注意**: `initTypewriterEffect()` 中的 `setTimeout` 是匿名的,需要把 ID 赋给 `typewriterTimers.startDelayTimeout`。

**改动行数**: 约 +25 行

---

## L5 · 验证步骤

```text
1. git diff themes/butterfly/source/js/typewriter-effect.js → 改动符合预期
2. hexo clean && hexo generate → 不报错
3. 浏览含 typewriter 字段的文章 → 打字机效果正常逐字显示
4. PJAX 快速切到另一篇含 typewriter 的文章 → 打字机正常重启,无并发
5. 在打字过程中切页 → 旧 timer 被清理,新文章打字机从头开始
6. 关闭 reduced-motion 模拟 → 打字机效果恢复
```

---

## L6 · 回滚步骤

```bash
git revert <Q11-commit-hash>    # 单项回滚
# 或
git reset --hard 3ec6ebd        # 完全回到基线
```

---

## L7 · 实际执行结果

- **执行日期**: 2026-05-04
- **commit hash**: `b470367`
- **改动文件**: `themes/butterfly/source/js/typewriter-effect.js` (+25 行)
- **改动位置**: IIFE 开头 + TypeWriter.start() + initTypewriterEffect() + main() + pjax 监听
- **构建结果**: `hexo clean && hexo generate` ✅ 无报错
- **产物验证**: `public/js/typewriter-effect.js` 包含 `clearAllTypewriterTimers` (3 处) ✅
- **运行时影响评估**:
  - 首次加载: 行为不变(定时器跟踪无可见影响)
  - PJAX 切页: 旧定时器被清理,新页面打字机从头开始
  - reduced-motion: 短路分支正常,不受定时器跟踪影响
- **异常 / 备注**: 无
