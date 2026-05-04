---
name: 全面审计发现的候选 BUG 与优化项清单
description: 从全部项目文档和源码审计中聚合发现的 20+ 项问题——重复文件、死代码、性能隐患、安全缺陷、缓存失效
type: project
---

# 全面审计发现的候选 BUG 与优化项

> **何时阅读**：规划技术债务清理、评估修复优先级、了解项目已知问题全景时。
> **来源**：本次全项目审计中从所有源码文件、配置文件和已生成的长期记忆文档中交叉验证发现。

---

## 严重程度定义

| 级别 | 含义 | 行动 |
|---|---|---|
| 🔴 **高** | 影响核心功能或存在安全/数据风险 | 应尽快修复 |
| 🟡 **中** | 性能或可维护性隐患 | 下次迭代修复 |
| 🟢 **低** | 冗余或可优化但不紧急 | 择机处理 |

---

## 1. 重复文件

### 🔴 B1: lazy-loading-native.js 双份存在（**已修正：内容不完全相同**）

- **位置**：`source/js/lazy-loading-native.js`（159 行）和 `themes/butterfly/source/js/lazy-loading-native.js`（159 行）
- **内容**：⚠️ **MD5 不同**（`source/js`=`93A7…E414`，`themes/`=`B2F1…D47A`），不是 100% 复制粘贴
- **Hexo 行为**：当同名文件同时存在于 `source/` 和 `themes/<theme>/source/`，**`source/` 会覆盖 `themes/`**——浏览器拿到的是 `source/js/lazy-loading-native.js` 的内容
- **后果**：`themes/butterfly/source/js/lazy-loading-native.js` 实际是被遮蔽的死文件，但其内容与 source/ 那份不同步——长期维护时容易引发"我改了文件没生效"的疑问
- **建议**：先做 diff 看清两者差异，如果 themes/ 那份是过时备份则删除；如果有独特内容则需先合并；**不要盲删任一份**

---

## 2. 死代码（**已修正：原列入死代码的文件实际仍在加载**）

### 🟢 B2: lazy-loading.js 387 行 — **已修正：仍在使用，不是死代码**

- **位置**：`source/js/lazy-loading.js`（387 行）
- **当初判断**：不被 inject 引用 → 误判为死代码
- **实际**：被 `themes/butterfly/layout/includes/additional-js.pug:37` 通过 `script(src=url_for('/js/lazy-loading.js'))` 加载
- **结论**：**不可删除**。删除会破坏图片懒加载兼容回退（jQuery + scroll 监听的旧版）
- **后续**：如要简化懒加载架构，需先确认 `lazy-loading-optimized.js` 已完全覆盖兼容回退场景，再统一收敛

### 🟢 B3: lazy-loading.css 235 行 — **已修正：仍在使用，不是死代码**

- **位置**：`source/css/lazy-loading.css`（235 行，魔法漩涡风格占位符）
- **当初判断**：不被 inject 引用 → 误判为死代码
- **实际**：被 `themes/butterfly/layout/includes/head.pug:62` 通过 `link(rel='stylesheet', href=url_for('/css/lazy-loading.css'))` 加载
- **结论**：**不可删除**。删除会丢失占位符样式，部分页面（特别是用 `lazy-loading.js` 兼容路径的）将看到无样式占位
- **后续**：如要清理"魔法漩涡风格"占位符，需先确认所有页面都用 `lazy-loading-optimized.css` 的占位符再切换

> **教训**（同时给本项目和未来 AI 阅读者）：判断"是否被引用"必须 grep **三个层面**——`_config.butterfly.yml` inject 节、`source/` 内引用、**主题 pug 模板**。漏掉主题 pug 是本次审计的事实错误，已在 2026-05-04 修正。

---

## 3. 性能隐患

### 🟡 B4: header-universe.js 没有性能优化

- **位置**：`themes/butterfly/source/js/header-universe.js`（124 行）
- **问题**：
  - 无 FPS 节流（始终 60fps+，universe-optimized.js 限制 30fps）
  - 无 visibility API 暂停（切标签页仍然渲染）
  - 无移动端降级（粒子数量 = width × 0.216，不随屏幕缩小）
  - 无 resize 防抖
  - 流星尾巴 30 点（vs optimized 的 10 点）
- **影响**：移动端低端机卡顿、标签页后台持续耗电
- **建议**：移植 universe-optimized.js 的优化模式（30fps 节流 + visibility 暂停 + 移动端减半）

### 🟡 B5: 多套懒加载 3 秒周期扫描

- **位置**：`source/js/lazy-image-refresh.js`（每 3s setInterval）和 `source/js/lazy-video-refresh.js`（每 3s setInterval）
- **问题**：两个脚本各自每 3 秒扫描一次失败项，长会话累积。scroll 监听器也每 500ms 扫描。
- **建议**：统一扫描循环，或改为 `requestIdleCallback`

### 🟡 B6: swiper 瀑布流无分页加载全部 70+ 张图

- **位置**：`source/swiper/index.md` 内联 JS
- **问题**：70+ 张 webp 一次性全部加载，无分页/虚拟滚动。首次访问流量大 (~30MB+)
- **建议**：实现虚拟滚动或分页加载

### 🟢 B7: 关于页 avatar-ring 永久旋转无暂停

- **位置**：`source/about/index.html` 内联 CSS
- **问题**：`conic-gradient` 光环 `animation: rotate 4s linear infinite`，永久运行，无 visibility 暂停
- **建议**：添加 `prefers-reduced-motion` 媒体查询 + 页面隐藏时暂停

---

## 4. PJAX 内存泄漏

### 🟡 B8: typewriter-effect.js 不清理旧 setInterval

- **位置**：`themes/butterfly/source/js/typewriter-effect.js`
- **问题**：PJAX 切页时 `main()` 重新执行，但旧的 `TypeWriter` 实例的 `setInterval` 未被清除。浏览多篇文章后打字机会累积多个 timer 导致速度异常。
- **建议**：在 `main()` 开头先 `clearInterval(this.timer)`

### 🟡 B9: lazy-loading-optimized.js 不清理 IntersectionObserver

- **位置**：`themes/butterfly/source/js/lazy-loading-optimized.js`
- **问题**：PJAX 切页时重新 `createObserver()`，旧的 observer 未 `disconnect()`
- **建议**：在重新初始化前 disconnect 旧 observer

### 🟡 B10: lazy-loading-about.js 不清理 setInterval

- **位置**：`source/about/lazy-loading-about.js`
- **问题**：3D 轮播的 `setInterval` 在 PJAX 离开 /about/ 后仍然运行
- **建议**：实现 `destroy()` 方法并在页面离开时调用

---

## 5. 安全隐患

### 🔴 B11: coffer 密码明文硬编码

- **位置**：`source/js/coffer.js` 第 7 行：`correctPassword: '10021021'`
- **问题**：密码明文存储在客户端 JS 中，任何人 F12 查看即可获取
- **影响**：这是个"仪式性"保护，不是真正的安全措施
- **建议**：如果不需要真正安全，保持现状；否则需改为服务端验证

### 🟡 B12: coffer 私密文章可直接访问

- **位置**：`source/coffer/private-posts/` 下的 .md 文件
- **问题**：Hexo 会将它们渲染为 HTML 放在 `public/coffer/private-posts/*.html`，任何人知道文件名即可直接访问，绕过密码页面
- **建议**：使用 hexo 的 `skip_render` 或 `published: false`

---

## 6. CDN 与缓存

### 🟡 B13: algolia_search 是唯一的 bytecdntp 残留

- **位置**：`_config.butterfly.yml` CDN.option.algolia_search
- **URL**：`https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/instantsearch.js/2.10.5/instantsearch.min.js`
- **状态**：其他 10 个 bytecdntp 引用已迁移至 cdnjs，仅此一个未处理
- **建议**：迁移至 cdnjs 或 tianli0 CDN

### 🟡 B14: elemecdn 使用 @latest 标签

- **位置**：`_config.butterfly.yml` CDN.option.tag_plugins.CDN
- **URL 示例**：`hexo-butterfly-tag-plugins-plus@latest/lib/...`
- **问题**：`@latest` 意味着每次构建可能拉取不同版本，作者发 breaking change 时博客静默受影响
- **建议**：固定版本号

### 🟢 B15: 本地 JS/CSS 文件无版本号

- **位置**：inject.head/bottom 中的所有本地资源
- **问题**：文件无 hash/version query，修改后浏览器可能使用旧缓存（GitHub Pages 默认 cache 10 分钟）
- **建议**：重大更新时加 `?v=N` query string

---

## 7. 冗余加载

### 🟡 B16: jQuery 被加载两次

- **位置**：
  - inject.bottom: `<script defer src="/js/jquery-3.6.0.min.js">`（本地，全站）
  - CDN.option.tag_plugins.CDN.jquery: `cdnjs.cloudflare.com/.../jquery/3.6.0/jquery.min.js`（tag_plugins 独立引用）
- **影响**：同一版本被引用两次（tag_plugins 可能不加载第二次，因为 `window.jQuery` 已存在），但配置冗余
- **建议**：tag_plugins 可移除自己的 jquery 引用

### 🟡 B17: Font Awesome 被引用两次（不同层）

- **位置**：
  - inject.head: 6.5.1（全站，异步）
  - CDN.option.fontawesome: 6.5.1（Butterfly 内部组件）
- **影响**：同一版本在 head 中被注入一次、主题模板又注入一次
- **建议**：统一为一个入口

---

## 8. 数据重复

### 🟢 B18: swiper 页面 about carousel data-carousel 值重复

- **位置**：`source/about/index.html`
- **问题**：`data-carousel="ai"` 出现在 line 834 和 line 1029，`data-carousel="harmony"` 出现在 line 816 和 line 1141
- **影响**：lazy-loading-about.js 如果按 data-carousel 值区分行为，可能找到错误容器
- **建议**：检查 JS 是否有影响，如不需要则改成唯一值

---

## 9. 无障碍

### 🟢 B19: typewriter 不响应 prefers-reduced-motion（打字行为本身）

- **位置**：`themes/butterfly/source/js/typewriter-effect.js`
- **问题**：CSS 中的 shimmer 和 cursor blink 会响应 `prefers-reduced-motion: reduce`，但 JS 的逐字打字（`setInterval(..., 20)`）不会停止
- **建议**：检测 `matchMedia('prefers-reduced-motion: reduce')` → 直接显示全文，跳过打字动画

---

## 10. 资源清理

### 🟡 B20: swiper 瀑布流 preloadedImages Map 中的 Object URL 可能泄漏

- **位置**：`source/swiper/index.md` 内联 JS
- **问题**：`URL.createObjectURL(blob)` 创建的 URL 存储在 `data-object-url` 属性中，但在卡片图片加载完成后未及时释放（只在整个 preloadedImages Map 被清空时释放）
- **建议**：图片加载完成后立即 `URL.revokeObjectURL`

---

## 汇总统计（**2026-05-04 更新**）

| 严重程度 | 数量 | 项 |
|---|---|---|
| 🔴 高 | 1 | B11 (hardcoded password) |
| 🟡 中 | 12 | B4, B5, B6, B8, B9, B10, B12, B13, B14, B16, B17, B20 |
| 🟢 低 | 3 | B7, B15, B18, B19 |
| ⚠️ 已修正（非真实 BUG / 不可删） | 2 | B2 (仍在加载，不可删), B3 (仍在加载，不可删) |
| 🔍 待重新评估 | 1 | B1 (两份 MD5 不同，需先 diff) |
| **总计（原始项数）** | **20** | |

---

## 建议修复优先级（**2026-05-04 更新**）

```text
🟢 已通过 Q1-Q7 快速修复批次处理（详见 04-operations/2026-05-04-quick-fixes/）：
  Q1 → B13 (algolia URL)
  Q2 → B7  (avatar-ring 无障碍)
  Q3 → B16 (jquery 去重)
  Q5 → B12 (coffer skip_render)
  Q7 → B19 (typewriter JS 无障碍)

第一优先级（安全决策）：
  1. B11 — 评估 coffer 是否需要服务端验证

第二优先级（性能 + 稳定性，需中等改动）：
  2. B4  — header-universe.js 性能优化
  3. B8  — typewriter PJAX 内存泄漏
  4. B9  — lazy-loading PJAX 内存泄漏
  5. B10 — lazy-loading-about PJAX 内存泄漏
  6. B14 — elemecdn @latest 固定版本（需 npm view 调研）

第三优先级（架构改造，需大改）：
  7. B5  — 多套 3s 扫描合并
  8. B6  — swiper 70+ 张分页/虚拟滚动
  9. B17 — Font Awesome 重复（需改主题 pug）
  10. B20 — swiper Object URL 泄漏

第四优先级（先调研再行动）：
  11. B1  — lazy-loading-native 双份 diff（先看差异，再决定）
  12. B15 — 资源 hash 版本号（build hook 改造）
  13. B18 — about carousel data-carousel 重复（先读 lazy-loading-about.js）

不在 BUG 列表（已修正）：
  ❌ B2 — lazy-loading.js 仍在 additional-js.pug 加载，不可删
  ❌ B3 — lazy-loading.css 仍在 head.pug 加载，不可删
```
