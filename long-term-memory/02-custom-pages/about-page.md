---
name: 关于页面（About）实现
description: 个人介绍页面的卡片式布局、7 个 card-row、3D 轮播走马灯、lazy-loading-about.js 懒加载协同
type: project
---

# 关于页面（About） — 实现

> **何时阅读**：修改个人介绍内容、3D 轮播不动、卡片图片不显示、新增 card-row 时。
> **关联文档**：[lazy-loading-system.md](../03-api-practices/lazy-loading-system.md)（lazy-loading-about.js 详解）· [cdn-strategy.md](../03-api-practices/cdn-strategy.md)（Font Awesome 图标依赖）

---

## L1 · TL;DR

- `/about/` 是一个**静态个人介绍页面**，包含头像旋转光环、个人标签、7 个 card-row、联系方式区。
- **图片懒加载**由 `lazy-loading-about.js` 管理（详见懒加载系统文档 L8）。
- **3D 走马灯**有 5 个状态（active/prev/next/prev-hidden/next-hidden），基于 `translateZ` + `rotateY` 实现景深感。
- 页面**不经过 Hexo 模板**（独立 HTML，自带全部 `<style>` 和 `<script>`）。

---

## L2 · 页面结构

```text
.about-container
├── .hero-section           # 头像旋转光环 + 名字 + 标签
├── .cards-container        # 7 个 card-row
│   ├── 鸿蒙开发者           # HarmonyOS 认证
│   ├── 开源鸿蒙共建者       # NowInOpenHarmony 项目
│   ├── 前端探索者           # 网易云 + 连连看 项目
│   ├── 创客空间社长         # bistumaker.cn 链接
│   ├── HSD校园大使          # 跑跑码特挑战赛统计
│   ├── 花粉俱乐部部长       # 华为北京研究所参观
│   ├── AI辅助编程专家       # VSCode/Cursor/Trae 工具
│   ├── iflab导师团成员      # 社团大联盟
│   ├── HAP Store 开发者    # 鸿蒙应用分发
│   └── 鸿蒙体验先行者       # 北京鸿蒙先锋
└── .contact-section         # GitHub / Email / WeChat
```

---

## L3 · 头像旋转光环

```css
.avatar-ring {
  border-radius: 50%;
  background: conic-gradient(/* 12 段灰阶 */) border-box;
  animation: rotate 4s linear infinite;
}
```

conic-gradient 从 0deg 到 360deg 的 12 段灰阶（`#0f0f0f → #333333` 循环），border-box 裁剪，配合 `rotate` keyframes 持续旋转。**4s 循环，永久播放，无暂停机制**。

---

## L4 · 3D 走马灯（carousel）

每个 card-row 的图片区域是一个 `.carousel-container`，内含 `.carousel-slide` 元素，由 `lazy-loading-about.js` 控制状态切换。

### 4.1 5 个状态

| 状态 | translateX | translateZ | rotateY | z-index | 可见性 |
|---|---|---|---|---|---|
| **active** | 0 | 100px | 0 | 100 | 完全可见 |
| **prev** | -45% | -150px | 35deg | 50 | 半透明 + 模糊 |
| **next** | 45% | -150px | -35deg | 50 | 半透明 + 模糊 |
| **prev-hidden** | -70% | -300px | 45deg | 10 | 完全透明 |
| **next-hidden** | 70% | -300px | -45deg | 10 | 完全透明 |

### 4.2 自动轮播参数

```js
// 错峰启动
delay = cardRowIndex * 800ms
// 错峰周期
interval = 3500 + (cardRowIndex % 4) * 500ms  // 3.5s ~ 5s
// hover 暂停
!carousel.matches(':hover')
```

> 详见 [lazy-loading-system.md L8](../03-api-practices/lazy-loading-system.md)

---

## L5 · 图片布局模式

同一个页面使用了 4 种图片布局：

| 模式 | 使用位置 | CSS |
|---|---|---|
| **3D 走马灯** | 大多数 card-row | `.carousel-container` + translateZ |
| **图片 + 画廊** | 鸿蒙开发者 | 单张主图 + 5 缩略图网格 |
| **统计数字** | HSD校园大使 | 无图，纯数字统计 |
| **工具标签** | AI辅助编程专家 | 无图，tag 云 |

---

## L6 · 响应式

| 断点 | 变化 |
|---|---|
| 1024px | card 从横向变纵向（`flex-direction: column`），3 列变 2 列 |
| 768px | 标题缩小、社交链接纵向排列、2 列变 1 列 |
| 480px | 标签纵向、项目链接纵向、单列图片 |

---

## L7 · 红线

| # | 红线 | 后果 |
|---|---|---|
| R1 | 删除 `lazy-loading-about.js` 但保留 `data-carousel` 属性 | 走马灯完全不动，图片不加载（全部是 `data-original` 占位） |
| R2 | 改 `.carousel-container` 的 `perspective: 1500px` | 3D 景深感变化，可能使 prev/next 图片重叠或距离过远 |
| R3 | 给 `.card-row` 中图片添加 `loading="lazy"` | 与 lazy-loading-about.js 的 src→data-original 机制冲突 |

---

## L8 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 页面 HTML | `source/about/index.html` |
| 懒加载 + 轮播 JS | `source/about/lazy-loading-about.js` |
| 图片目录 | `source/about/index/`（40+ 张 webp） |
| 微信二维码 | `source/about/wechat.webp` |
