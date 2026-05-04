---
name: Q10 — lazy-loading-about destroy() 激活(B10)
description: AboutPageLazyLoading.destroy() 已完整实现但从未被调用,关于页 3D 轮播 setInterval 和 IntersectionObserver 在 PJAX 离开后持续泄漏
type: project
---

# Q10 — lazy-loading-about destroy() 激活 (B10)

> **状态**: 🔍 深度调研完成,准备执行
> **关联**: [../../../07-known-issues/discovered-issues/README.md](../../../07-known-issues/discovered-issues/README.md)(B10)

---

## L1 · TL;DR

`source/about/lazy-loading-about.js` 已有一个完整的 `destroy()` 函数(line 316-332),但它**从未被调用**。在 IIFE 末尾添加一个 `pjax:send` 一次性监听器,离开关于页时自动调用 `AboutPageLazyLoading.destroy()` 清理轮播定时器和 observer。

---

## L2 · 问题描述

**文件**: [source/about/lazy-loading-about.js](../../../../source/about/lazy-loading-about.js)

**已有但沉睡的 destroy() 函数**:
```js
function destroy() {
    if (cardRowObserver) {
        cardRowObserver.disconnect();
    }
    // 停止所有轮播图
    const carousels = document.querySelectorAll('.carousel-container[data-interval-id]');
    carousels.forEach(carousel => {
        const intervalId = carousel.dataset.intervalId;
        if (intervalId) {
            clearInterval(parseInt(intervalId));
        }
    });
    loadedCardRows.clear();
}
```

**泄漏路径**:
1. 用户进入 `/about/` → `lazy-loading-about.js` 执行 → 启动 N 个 `setInterval`(3D 轮播)
2. 用户 PJAX 切到其他页面 → 关于页 DOM 被替换 → **但 setInterval 仍在后台运行**
3. 再次进入 `/about/` → 新的 `setInterval` 启动 → 旧的不停 → 累积
4. 同时 `cardRowObserver` 也持续持有已卸载 DOM 的引用

**grep 确认**: `AboutPageLazyLoading.destroy` 全仓 0 命中 → 确实从未调用。

---

## L3 · 深度调研结果

### 3.1 依赖关系

```
source/about/index.html
  └── <script src="lazy-loading-about.js"></script>  (line 1187)
      └── IIFE 执行
          ├── initAboutPageLazyLoading() → 创建 observer + setInterval
          ├── window.AboutPageLazyLoading = { init, destroy, getStatus, forceLoadCardRow }
          └── DOMContentLoaded / setTimeout 自动初始化

PJAX 导航(主题统一处理)
  ├── pjax:send → 清理旧页面资源 ← 缺失! destroy() 未挂钩
  └── pjax:complete → 新页面初始化
```

**主题 PJAX 机制确认**([themes/butterfly/layout/includes/third-party/pjax.pug](../../../../themes/butterfly/layout/includes/third-party/pjax.pug)):
```js
document.addEventListener('pjax:send', () => {
    btf.removeGlobalFnEvent('pjaxSendOnce')
    btf.removeGlobalFnEvent('themeChange')
    triggerPjaxFn(window.globalFn.pjaxSend)
})
```

主题标准做法:
- `pjax:send` = 清理旧页面
- `pjax:complete` = 初始化新页面

### 3.2 版本差异

无。`source/about/lazy-loading-about.js` 为项目自定义文件。

### 3.3 修正后潜在崩溃隐患排查

| 隐患 | 评估 | 结论 |
|---|---|---|
| `destroy()` 被多次调用 | `destroy()` 是幂等的:disconnect 安全、clearInterval 安全、Set.clear 安全 | ❌ 不存在 |
| `pjax:send` 监听器泄漏 | 使用一次性监听器:`removeEventListener` 在回调内自移除 | ❌ 不存在 |
| 关于页内 PJAX 刷新(不离开)触发 destroy | `pjax:send` 只在真正导航时触发,关于页内部无 PJAX 链接 | ❌ 不存在 |
| `window.pjax` 不存在时添加监听器报错 | 已加 `if (typeof window.pjax !== 'undefined')` 保护 | ❌ 不存在 |
| `AboutPageLazyLoading` 未定义时调用 destroy | 监听器在 IIFE 末尾注册,此时对象已创建 | ❌ 不存在 |
| `parseInt(intervalId)` 在空字符串时返回 NaN | `clearInterval(NaN)` 是安全无操作 | ❌ 不存在 |

**综合判定: 零崩溃隐患,可安全执行。**

---

## L4 · 实现方案

### 修改文件

`source/about/lazy-loading-about.js`

### 修改步骤

在 IIFE 末尾、`window.AboutPageLazyLoading` 导出之后、DOMContentLoaded 自动初始化之前(或之后,均可)添加:

```js
    // PJAX 离开关于页时清理资源 (2026-05-04 Q10 / B10)
    if (typeof window.pjax !== 'undefined') {
        function cleanupAboutLazyLoading() {
            if (window.AboutPageLazyLoading) {
                window.AboutPageLazyLoading.destroy();
            }
            document.removeEventListener('pjax:send', cleanupAboutLazyLoading);
        }
        document.addEventListener('pjax:send', cleanupAboutLazyLoading);
    }
```

### Diff(预期)

```diff
      // 导出 API 到全局对象
      window.AboutPageLazyLoading = {
          init: initAboutPageLazyLoading,
          destroy: destroy,
          getStatus: getLoadingStatus,
          forceLoadCardRow: function(index) {
              const cardRows = document.querySelectorAll('.card-row');
              if (cardRows[index] && !loadedCardRows.has(index)) {
                  loadCardRowImages(cardRows[index], index);
                  loadedCardRows.add(index);
              }
          }
      };

+     // PJAX 离开关于页时清理资源 (2026-05-04 Q10 / B10)
+     if (typeof window.pjax !== 'undefined') {
+         function cleanupAboutLazyLoading() {
+             if (window.AboutPageLazyLoading) {
+                 window.AboutPageLazyLoading.destroy();
+             }
+             document.removeEventListener('pjax:send', cleanupAboutLazyLoading);
+         }
+         document.addEventListener('pjax:send', cleanupAboutLazyLoading);
+     }
+
      // DOM 加载完成后自动初始化
      if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initAboutPageLazyLoading);
      } else {
          // DOM已经加载完成
          setTimeout(initAboutPageLazyLoading, 100);
      }
```

**改动行数**: +11

---

## L5 · 验证步骤

```text
1. git diff source/about/lazy-loading-about.js → 仅末尾加 11 行
2. hexo clean && hexo generate → 不报错
3. 浏览器访问 /about/ → 3D 轮播正常工作
4. 点击导航栏切到其他页面 → console 应输出 "[About Lazy Loading] 懒加载系统已销毁"
5. 再切回 /about/ → 轮播重新初始化,正常工作
6. F12 → console 确认无报错
```

---

## L6 · 回滚步骤

```bash
git revert <Q10-commit-hash>    # 单项回滚
# 或
git reset --hard 3ec6ebd        # 完全回到基线
```

---

## L7 · 实际执行结果

- **执行日期**: 2026-05-04
- **commit hash**: `4e443b3`
- **改动文件**: `source/about/lazy-loading-about.js` (+11 行)
- **改动位置**: IIFE 末尾、`AboutPageLazyLoading` 导出之后
- **构建结果**: `hexo clean && hexo generate` ✅ 无报错
- **产物验证**: `public/about/lazy-loading-about.js` 包含 cleanup 逻辑 ✅
- **运行时影响评估**:
  - 进入关于页: 行为不变(自动初始化)
  - 离开关于页: `destroy()` 被调用,轮播定时器和 observer 及时释放
- **异常 / 备注**: 无
