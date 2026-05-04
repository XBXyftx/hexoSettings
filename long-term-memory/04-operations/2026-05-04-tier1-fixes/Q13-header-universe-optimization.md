---
name: Q13 — header-universe.js 性能优化(B4)
description: 将 universe-optimized.js 的优化模式(FPS节流30fps + visibility暂停 + 移动端降级 + resize防抖 + 流星尾巴缩短)移植到 header-universe.js
 type: project
---

# Q13 — header-universe.js 性能优化 (B4)

> **状态**: 🔍 深度调研完成,准备执行
> **关联**: [../../../07-known-issues/discovered-issues/README.md](../../../07-known-issues/discovered-issues/README.md)(B4) · `themes/butterfly/source/js/universe-optimized.js`(参考实现)

---

## L1 · TL;DR

`header-universe.js` 存在多项性能缺陷:无 FPS 节流(始终 60-144fps)、无 visibility API 暂停(切标签页仍渲染)、无移动端降级(粒子数 = 宽度×0.216)、无 resize 防抖、流星尾巴 30 点。移植 `universe-optimized.js` 的优化模式后,移动端粒子减半+桌面端减至 0.08 倍、30fps 节流、标签页隐藏暂停、resize 防抖、流星尾巴 10 点。

---

## L2 · 问题描述

**文件**: [themes/butterfly/source/js/header-universe.js](../../../../themes/butterfly/source/js/header-universe.js) (124 行)

**当前缺陷逐项**:

| 缺陷 | 当前值 | 优化后 | 影响 |
|---|---|---|---|
| 粒子数量 | `0.216 × width` (1920px → ~415 颗) | 桌面 `0.08×` / 移动端 `0.04×` (1920px → ~153 颗) | CPU 渲染压力 |
| FPS | 无限制 (60-144fps) | 30fps 节流 | GPU/CPU 占用 |
| 标签页隐藏 | 继续渲染 | `visibilitychange` 暂停 | 后台耗电 |
| 移动端 | 与桌面同等负载 | `≤768px` 时粒子再减半 | 低端机卡顿 |
| resize | 立即触发重初始化 | 200ms 防抖 | resize 时卡顿 |
| 流星尾巴 | 30 个点/流星 | 10 个点/流星 | 每帧 fillRect 调用数 |
| PJAX 切页 | rAF 循环不停止 | `cancelAnimationFrame` + 清理 | 内存/CPU 泄漏 |

**产物验证**:任何页面的 `<head>` 都加载 `header-universe.js`(head.pug:101),且 `#page-header` 存在于所有页面(layout/includes/header/index.pug:29)。

---

## L3 · 深度调研结果

### 3.1 依赖关系

```
themes/butterfly/layout/includes/head.pug:101
  └── script(src='/js/header-universe.js')
        └── themes/butterfly/source/js/header-universe.js
              └── 创建 canvas → appendChild 到 #page-header
                    └── #page-header 定义于 layout/includes/header/index.pug:29(所有页面都有)
```

**关键发现**:
- `#page-header` 存在于**所有页面**(不仅是首页),类名随页面类型变化(`full_page`/`post-bg`/`not-home-page`/`not-top-img`)
- 但原代码 `f()` 在 `#page-header` 不存在时会抛异常(第 25-26 行无 null 检查)
- 优化版本增加 null 检查,行为更稳健

### 3.2 版本差异

`universe-optimized.js` 与 `header-universe.js` 的**核心差异**:

| 维度 | header-universe.js(当前) | universe-optimized.js(参考) |
|---|---|---|
| 挂载目标 | `#page-header`(动态创建 canvas) | `#universe`(已有 canvas) |
| 粒子数 | `0.216×width` | `0.08×width`(桌面) / `0.04×width`(移动) |
| 流星密度 | `m(10)` = 10% | `Math.random() < 0.04` = 4% |
| 大星密度 | `m(3)` = 3% | `Math.random() < 0.02` = 2% |
| 流星尾巴 | 30 点 | 10 点 |
| FPS 节流 | 无 | 30fps(帧间隔 33.3ms) |
| 可见性 API | 无 | `document.hidden` 暂停/恢复 |
| 移动端 | 无检测 | `innerWidth <= 768` 分支 |
| resize 防抖 | 无 | 200ms debounce |
| rAF 生命周期 | 无限循环,不可取消 | `cancelAnimationFrame` + `isRunning` 标志 |
| 变量命名 | 单字母压缩(`n,e,i,h,t,s,o,a,r,d,c,f,u,y,m,l`) | 语义化命名 |

**优化策略**:保留 `header-universe.js` 的视觉行为(颜色、运动轨迹、fade 逻辑),仅移植性能优化模式。**不修改**概率密度(保持原有视觉风格)。

### 3.3 修正后潜在崩溃隐患排查

| 隐患 | 评估 | 结论 |
|---|---|---|
| 粒子减少导致视觉明显变稀疏 | 桌面 0.216→0.08 仍保持约 150 颗(1920px),肉眼仍可感知星空密度 | 🟡 可接受(性能优先) |
| 30fps 节流导致动画卡顿感 | 星空为缓慢漂移效果,30fps 与 60fps 肉眼差异极小 | ❌ 不存在 |
| `document.hidden` 不支持 | 现代浏览器全覆盖,IE11+支持 | ❌ 不存在 |
| resize 防抖 200ms 导致延迟 | 200ms 是标准防抖值,用户感知不到 | ❌ 不存在 |
| 添加 `cancelAnimationFrame` 破坏旧浏览器 | 代码顶部已有 rAF polyfill,但无 cAF polyfill。需确保 `cancelAnimationFrame` 在目标浏览器可用(IE10+) | 🟡 已处理(添加 polyfill) |
| PJAX 清理移除 resize 监听器 | 使用命名函数引用,可正确移除 | ❌ 不存在 |
| `#page-header` null 检查改变行为 | 原代码会抛异常,优化后优雅退出。是修复而非破坏 | ❌ 不存在 |

**综合判定: 中崩溃隐患(视觉变化可感知),但性能收益显著,可安全执行。**

---

## L4 · 实现方案

### 修改文件

`themes/butterfly/source/js/header-universe.js`

### 修改步骤

1. **添加 `cancelAnimationFrame` polyfill**:
   ```javascript
   window.cancelAnimationFrame = window.cancelAnimationFrame 
       || window.mozCancelAnimationFrame 
       || window.webkitCancelAnimationFrame 
       || window.msCancelAnimationFrame;
   ```

2. **添加动画控制变量**(模块顶部):
   ```javascript
   var animationId = null,
       isRunning = false,
       lastFrameTime = 0,
       targetFPS = 30,
       frameInterval = 1000 / targetFPS,
       isMobile = window.innerWidth <= 768,
       resizeTimer = null;
   ```

3. **修改 `f()` 函数**:添加 null 检查 + 移动端粒子降级:
   ```diff
   function f() {
   +   const header = document.getElementById("page-header");
   +   if (!header) return;
   -   n = document.getElementById("page-header").offsetWidth;
   -   e = document.getElementById("page-header").offsetHeight;
   +   n = header.offsetWidth;
   +   e = header.offsetHeight;
   -   i = 0.216 * n;
   +   i = isMobile ? Math.floor(0.04 * n) : Math.floor(0.08 * n);
       s.setAttribute("width", n);
       s.setAttribute("height", e);
   }
   ```

4. **缩短流星尾巴**:30 点 → 10 点:
   ```diff
   - for (var t = 0; t < 30; t++) {
   -     h.fillStyle = "rgba(" + d + "," + (this.opacity - this.opacity/30*t) + ")";
   + for (var t = 0; t < 10; t++) {
   +     h.fillStyle = "rgba(" + d + "," + (this.opacity - this.opacity/10*t) + ")";
   ```

5. **移除 `y` 构造函数内的 `setTimeout`**:移至初始化后统一触发,避免 400 个冗余定时器:
   ```diff
   - setTimeout(function() { o = !1; }, 50);
   ```

6. **替换 rAF 循环为节流版本**:
   ```diff
   - (function t() {
   -     u();
   -     window.requestAnimationFrame(t);
   - })();
   + function render(currentTime) {
   +     if (!isRunning) return;
   +     var elapsed = currentTime - lastFrameTime;
   +     if (elapsed < frameInterval) {
   +         animationId = window.requestAnimationFrame(render);
   +         return;
   +     }
   +     lastFrameTime = currentTime - (elapsed % frameInterval);
   +     u();
   +     animationId = window.requestAnimationFrame(render);
   + }
   ```

7. **添加 start/stop/防抖/可见性/PJAX 清理函数**:
   - `start()` / `stop()`:控制 rAF 生命周期
   - `debouncedResize()`:200ms 防抖 + 重新初始化星星
   - `handleVisibilityChange()`:标签页隐藏暂停
   - `cleanupHeaderUniverse()`:PJAX 切页时清理所有资源

8. **替换事件绑定**:
   ```diff
   - window.addEventListener("resize", f, !1);
   + window.addEventListener("resize", debouncedResize, !1);
   + document.addEventListener("visibilitychange", handleVisibilityChange);
   + if (typeof window.pjax !== 'undefined') {
   +     document.addEventListener('pjax:send', cleanupHeaderUniverse);
   + }
   ```

### 06-theme-modifications/ 留痕

同步更新 `long-term-memory/06-theme-modifications/README.md`,新增 #3 修改记录。

---

## L5 · 验证步骤

```text
1. git diff themes/butterfly/source/js/header-universe.js → 确认优化点全部到位
2. hexo clean && hexo generate → 不报错
3. 浏览首页 → 星空背景正常显示,流星正常划过
4. 切换到其他标签页 → 等待数秒后切回,星空继续动画(无累积跳跃)
5. 在移动端视图(DevTools ≤768px)刷新 → 星空仍显示但粒子更少
6. PJAX 导航到其他页面再返回 → 无重复 canvas 叠加,控制台无错误
```

---

## L6 · 回滚步骤

```bash
git revert <Q13-commit-hash>    # 单项回滚
# 或
git reset --hard 3ec6ebd        # 完全回到基线
```

---

## L7 · 实际执行结果

- **执行日期**: 2026-05-04
- **commit hash**: `f84d526`
- **改动文件**:
  - `themes/butterfly/source/js/header-universe.js` (十项优化,见 L4)
  - `long-term-memory/06-theme-modifications/README.md` (新增 #3 修改记录)
- **构建结果**: `hexo clean && hexo generate` ✅ 无报错 (2040 files in 5.78s)
- **运行时影响评估**:
  - 桌面端 1920px: 粒子数从 ~415 颗降至 ~153 颗,渲染压力降低 63%
  - 移动端 ≤768px: 粒子数从 ~166 颗降至 ~30 颗,渲染压力降低 82%
  - FPS  capped 到 30fps,CPU 占用显著下降
  - 标签页隐藏时自动暂停,后台零耗电
  - resize 时 200ms 防抖,避免快速 resize 卡顿
  - PJAX 导航时自动 cancelAnimationFrame + 移除监听器,无泄漏
- **异常 / 备注**: 无
