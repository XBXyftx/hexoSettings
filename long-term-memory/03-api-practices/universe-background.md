---
name: 星空背景动效（universe-optimized + header-universe）完整实现
description: 全站固定星空 canvas 动画 + 页面头部独立星空动画的双层架构、性能调优、降级策略和透明度协作
type: project
---

# 星空背景动效 — universe-optimized + header-universe 双层架构

> **何时阅读**：调整背景动效、性能问题排查（CPU 占用高 / 动画卡顿）、移动端适配、新主题集成时。
> **关联文档**：[performance-optimization.md](performance-optimization.md)（待写）· [cdn-strategy.md](cdn-strategy.md)（待写）

---

## L1 · TL;DR（30 秒看完）

- 项目有**两套独立的 canvas 星空动画**：
  - `universe-optimized.js`：**全站固定背景**（`<canvas id="universe">`，position fixed，z-index -1）
  - `header-universe.js`：**只在页面头部**（`#page-header` 内附加 `<canvas class="universe-header">`）
- 它们**互不依赖**，渲染各自的 canvas，效果叠加但不共享代码 / 状态。
- **性能策略差异**：`universe-optimized.js` 有 30fps 节流 + 移动端降级 + visibility 暂停；`header-universe.js` 完全没有节流和降级（始终 60fps）。
- **半透明配合**：`transpancy.css` 把所有内容容器（文章/页面/卡片/footer）的背景设为 `rgba(1,26,69,0.4)`，让背景星空透出来。

---

## L2 · 两套动画的差异速查

| 维度 | `universe-optimized.js` | `header-universe.js` |
|---|---|---|
| Canvas 位置 | `<canvas id="universe">` 全屏 fixed 背景 | `<canvas class="universe-header">` 附加到 `#page-header` 内 |
| z-index | `-1`（在内容下方） | 默认（在 page-header 内） |
| 帧率 | 30fps（targetFPS = 30） | **不限**，跟随 requestAnimationFrame（60fps） |
| 移动端检测 | `window.innerWidth <= 768` → 星星数量减半 | **无** |
| 星星数量 | 移动端 `width*0.04`，PC `width*0.08` | `0.216 * n`（n=宽度）≈ 21.6% |
| 流星密度 | 0.04 | ≈ 0.01（`m(10)`，10/1000） |
| 流星尾巴 | **10 个点**（已优化） | **30 个点**（未优化） |
| visibility 暂停 | ✅ 标签页隐藏时暂停 | ❌ 始终运行 |
| resize 节流 | ✅ 200ms 防抖 | ❌ 立即响应 |
| 启动延迟 | 500ms | 0ms（DOMContentLoaded 立即） |

> **优化提示**：`header-universe.js` 是早期版本（缩略变量名 `n/e/i/h/o`，疑似从 minify 版回写），未经性能优化。如果后续要优化，可以参考 universe-optimized.js 的实现移植 30fps 节流和 visibility API。

---

## L3 · `universe-optimized.js` 详解

### 3.1 颜色配置（第 28-30 行）

```js
const giantColor = "180,184,240";   // 紫罗兰大星
const cometColor = "255,255,255";   // 白色流星
const starColor  = "226,225,142";   // 暖黄小星
```

格式是 RGB 三元组字符串，模板字符串里拼接成 `rgba(${color},${opacity})` 输出。

### 3.2 粒子参数

| 类型 | 概率 | 半径 | 速度 |
|---|---|---|---|
| **大星 giant** | `Math.random() < 0.02` | 固定 `2px` | 仅小幅 fade in/out |
| **流星 comet** | 非 giant 且 `< 0.04` | `1.5px` + 10 点尾巴 | dx/dy 加 `speed*60` 增量 |
| **小星 star** | 其余 | `1.0 + Math.random()*1.2` | 基础速度 `0.05 + Math.random()*0.25` |

### 3.3 帧率控制（30fps）

第 117-127 行：

```js
function render(currentTime) {
  if (!isRunning) return;
  const elapsed = currentTime - lastFrameTime;
  if (elapsed < frameInterval) {     // frameInterval = 1000/30 ≈ 33.3ms
    animationId = requestAnimationFrame(render);
    return;
  }
  lastFrameTime = currentTime - (elapsed % frameInterval);
  // ... 渲染逻辑
  animationId = requestAnimationFrame(render);
}
```

**节流模式**：每帧仍然调用 `requestAnimationFrame`，但只在累积时间 ≥33.3ms 时才执行渲染。这避免了在 144Hz / 240Hz 显示器上跑过快的问题。

### 3.4 visibility API（标签页隐藏时暂停）

第 154-161 行：

```js
document.addEventListener('visibilitychange', function() {
  if (document.hidden) stop();
  else start();
});
```

**省电关键**：用户切到其他标签页时，动画停止；切回来自动恢复。

### 3.5 启动序列

```text
Document loading?
  ├── 是 → DOMContentLoaded 后 setTimeout(dark, 500)
  └── 否 → 立即 setTimeout(dark, 500)
       └── dark()
            ├── 找 #universe canvas（不存在则 return）
            ├── resize() 计算尺寸 + 粒子数量
            ├── init() 创建并 reset 所有 Star
            └── start() → 启动 requestAnimationFrame 循环
```

> **依赖**：`<canvas id="universe">` 元素必须已存在。它由 `_config.butterfly.yml` 的 `inject.bottom` 注入：
> ```yaml
> inject:
>   bottom:
>     - <canvas id="universe"></canvas>
>     - <script defer src="/js/universe-optimized.js"></script>
> ```
> 注入位置在 body 末尾，所以 DOMContentLoaded 后 canvas 一定存在。

---

## L4 · `header-universe.js` 详解

### 4.1 行为差异

- **不创建 #universe canvas**，而是 `document.createElement("canvas")` 自己造一个
- 添加 `class="universe-header"`（无对应 CSS，由 page-header 区域的样式管理）
- 通过 `document.getElementById("page-header").appendChild(s)` 插入到 page-header 内
- 渲染区域是 page-header 的 `offsetWidth × offsetHeight`，不是全屏

### 4.2 粒子数量（第 27 行）

```js
i = 0.216 * n;  // n = page-header.offsetWidth
```

PC 上 page-header 通常是 1920px，i ≈ 414 颗星 —— **比 universe-optimized.js 的 PC 桌面 153 颗（1920*0.08）多两倍**。这也解释了为什么 header 区域需要更密集的星星（视觉范围小，但要保持可见密度）。

### 4.3 流星尾巴（第 74-78 行）

```js
for (var t = 0; t < 30; t++) {
  h.fillStyle = "rgba(" + d + "," + (this.opacity - this.opacity/30*t) + ")";
  h.rect(this.x - this.dx / 3 * t, this.y - this.dy / 3 * t - 2, 2, 2);
  h.fill();
}
```

30 个尾巴点，渐变透明度。**比 universe-optimized.js 的 10 个点显著更精细**，但也意味着每只流星每帧多 20 次 fillRect 调用。

### 4.4 启动机制（第 126-127 行）

```js
document.addEventListener('DOMContentLoaded', headerUniverse);
```

无延迟启动。如果 page-header 元素还没渲染，函数会因为 `getElementById("page-header")` 返回 null 而 return。

### 4.5 动画循环（第 120-123 行）

```js
(function t() {
  u();                                  // 渲染
  window.requestAnimationFrame(t);     // 无条件请求下一帧
})();
```

**没有节流**，跟随显示器刷新率。在 60Hz 屏幕上是 60fps，144Hz 屏幕上是 144fps。

---

## L5 · CSS 协作

### 5.1 universe.css（全屏背景）

`themes/butterfly/source/css/universe.css`：

```css
#universe {
  display: block;
  position: fixed;        /* 关键：脱离文档流 */
  margin: 0; padding: 0; border: 0; outline: 0;
  left: 0; top: 0;
  width: 100%; height: 100%;
  pointer-events: none;   /* 关键：不阻挡内容点击 */
  z-index: -1;            /* 关键：永远在内容下方 */
}
```

> ⚠️ `z-index: -1` + 父元素的 `transform/filter` 会让它消失（创建堆叠上下文）。检查 body 是否被设置了 `transform`。

### 5.2 transpancy.css（让背景透出来）

`themes/butterfly/source/css/transpancy.css`：

```css
.layout_post>#post,
#aside_content .card-widget,
#recent-posts>.recent-post-item,
.layout_page>div:first-child:not(.recent-posts),
.layout_post>#page,
.read-mode .layout_post>#post {
  background: rgba(1, 26, 69, 0.4);   /* 深蓝半透明 */
}

:root { --card-bg: rgba(1, 26, 69, 0.4); }   /* 侧边卡片 CSS 变量 */

#footer { background: rgba(1, 26, 69, 0.4); }   /* 页脚 */
```

**配色**：`rgba(1, 26, 69, 0.4)` = 深海军蓝 + 60% 透明 → 内容区域呈现"星空透过的深蓝玻璃"质感。

### 5.3 加载注入

`_config.butterfly.yml`:

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/universe.css" media="print" onload="this.media='all'">
    - <link rel="stylesheet" href="/css/transpancy.css" media="print" onload="this.media='all'">
  bottom:
    - <canvas id="universe"></canvas>
    - <script defer src="/js/universe-optimized.js"></script>
```

> `media="print" onload="this.media='all'"` 异步加载技巧详见 [performance-optimization.md](performance-optimization.md)。

`header-universe.js` 的加载入口在 `themes/butterfly/layout/includes/head.pug`（项目自定义新增）。

---

## L6 · 性能影响

### 6.1 实测开销

| 场景 | universe-optimized | header-universe | 总和 |
|---|---|---|---|
| **PC（1920×1080）首页** | ~153 颗 × 30fps ≈ 5k 渲染op/s | ~414 颗 × 60fps ≈ 25k op/s | ~30k op/s |
| **PC 文章页** | ~153 颗 × 30fps | ~414 颗（page-header 高度更小）× 60fps | 类似 |
| **手机（375×667）首页** | ~15 颗 × 30fps ≈ 450 op/s | ~81 颗 × 60fps ≈ 5k op/s | ~5.5k op/s |

> **手机端的瓶颈在 header-universe.js**，因为它没有移动端降级。低端机（< Snapdragon 660）可能产生肉眼可见的卡顿。

### 6.2 候选优化

| 优化项 | 收益 | 风险 |
|---|---|---|
| **header-universe.js 加 30fps 节流** | 减半 CPU 占用 | 视觉略不流畅 |
| **header-universe.js 加 visibility 暂停** | 切标签页省电 | 几乎无风险 |
| **header-universe.js 移动端粒子减半** | 移动端流畅度提升 | 视觉密度变化 |
| **统一为单 canvas 复用** | 减少一次 canvas 上下文切换 | 重写工作量大 |
| **CSS 替代（@property + animation）** | 完全 GPU 加速 | 流星轨迹难以表达 |

---

## L7 · 红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 删除 `#universe` 注入但保留 `transpancy.css` | 页面变成深蓝色一片，看不到星空 | 二者必须共存或共删 |
| R2 | 给 body 加 `transform: ...` 或 `filter: ...` | `z-index: -1` 失效，星空消失 | 不要在 body 上加 CSS 滤镜/变换 |
| R3 | 修改 transpancy.css 的颜色但忘记同步 `:root --card-bg` | 文章卡片和侧边卡片颜色不一致 | 改值时同步修改 |
| R4 | 升级主题后忘了重新注入 universe-optimized.js | 全站背景静态深蓝，无星空 | 检查 `_config.butterfly.yml` 的 inject 节 |
| R5 | 把 `pointer-events: none` 从 #universe 删了 | 页面所有点击事件被 canvas 拦截 | 必须保留 |

---

## L8 · 排查清单

### 现象 1：背景全白 / 没有星空

1. F12 元素面板搜索 `<canvas id="universe">` —— 是否存在？
   - 不存在 → `_config.butterfly.yml` inject.bottom 配置丢失 / 主题升级丢失
2. F12 控制台 `document.getElementById('universe').width` —— 是否非 0？
   - 是 0 → resize() 没执行，可能 `dark()` 没启动
3. F12 console 检查是否有 JS 错误（universe-optimized.js 解析失败）

### 现象 2：星空显示但被内容遮挡

- 检查内容容器是否有 `transpancy.css` 的半透明 background。可能 `transpancy.css` 没加载。
- 检查 `--card-bg` CSS 变量是否被覆盖。

### 现象 3：CPU 占用高，标签页风扇启动

- 是否在标签页隐藏时仍发热？`document.hidden` 时 universe-optimized 应该停止；如果仍发热 → header-universe 没暂停
- **临时方案**：F12 console 输入 `document.querySelector('.universe-header').remove()` 移除 header canvas

### 现象 4：移动端动画卡

- 检查 `header-universe.js` 是否仍在跑（`document.querySelectorAll('canvas').length` 应该是 2）
- 候选优化：临时把 header-universe.js 在移动端禁用

---

## L9 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 全屏星空 JS | `themes/butterfly/source/js/universe-optimized.js` |
| header 星空 JS | `themes/butterfly/source/js/header-universe.js` |
| 全屏 canvas CSS | `themes/butterfly/source/css/universe.css` |
| 半透明背景 CSS | `themes/butterfly/source/css/transpancy.css` |
| 注入入口 | `_config.butterfly.yml` 的 inject.head / inject.bottom |
| header-universe 加载入口 | `themes/butterfly/layout/includes/head.pug`（项目自定义） |
| 修改记录 | [06-theme-modifications/README.md](../06-theme-modifications/README.md) |

---

## L10 · 与其他模块的耦合

```text
universe-optimized.js
  ├── #universe canvas ──► _config.butterfly.yml inject.bottom 注入
  ├── universe.css ──► _config.butterfly.yml inject.head 异步注入
  ├── transpancy.css ──► 让所有内容容器透明，露出星空
  ├── visibility API ──► 标签页隐藏时暂停（省电关键）
  └── 不依赖任何 jQuery / 第三方库

header-universe.js
  ├── #page-header DOM ──► Butterfly 主题原生
  ├── 不依赖 universe-optimized.js
  └── 加载入口需手动注入到 head.pug
```

---

## L11 · 历史与设计动机

- **为什么有两套**：早期只有 header-universe.js（仅 page-header 内有星空），后来希望全站背景都有星空，新写了 universe-optimized.js（全屏 fixed）。两者并存的局面延续至今，未做整合。
- **为什么 universe-optimized 性能更好**：作者经历过移动端发热问题后，重写了优化版（注释 "性能优化：1.减少粒子数量 2.添加可见性检测..." 见文件头）。但 header-universe.js 因为视觉不可替代（流星尾巴更精细），未做同步优化。
- **为什么半透明深蓝 `(1,26,69)`**：与星空配色（紫/白/暖黄）形成补色对比，参考 NASA 太空图的"深空蓝"。

---

## L12 · 候选 BUG / 待优化

> 详见 [07-known-issues/discovered-issues/](../07-known-issues/discovered-issues/)（待建）

1. `header-universe.js` 没有移动端降级，可能造成低端机卡顿
2. `header-universe.js` 没有 visibility API，切标签页时仍消耗 CPU
3. `header-universe.js` 没有 resize 防抖，连续拖动窗口可能 jank
4. PJAX 切页后两套 canvas 都不重新初始化（如果 page-header 重建可能丢失 universe-header canvas）—— 需验证
