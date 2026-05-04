---
name: 图片瀑布流（Swiper/昨日重现）完整实现
description: Hexo 自动扫描图片 + IndexedDB 缓存 + 两列瀑布流布局 + IntersectionObserver 懒加载 + 极光浮现动画 + 拖拽上传的完整系统
type: project
---

# 图片瀑布流（Swiper/昨日重现） — 完整实现

> **何时阅读**：首页轮播/瀑布流图片不显示、IndexedDB 缓存问题排查、瀑布流布局错乱、性能优化、新增图片格式支持时。
> **关联文档**：[auto-image-list.js](#l3-组件-1-scriptsauto-image-listjs) · [cdn-strategy.md](../03-api-practices/cdn-strategy.md)（swiper 插件从 elemecdn 加载）· [lazy-loading-system.md](../03-api-practices/lazy-loading-system.md)（IntersectionObserver 模式参考）

---

## L1 · TL;DR（30 秒看完）

- `/swiper/` 页面实现了一个**两列绝对定位瀑布流**图片画廊，带极光主题浮现动画、IndexedDB 缓存和拖拽上传。
- **自动图片发现**：`scripts/auto-image-list.js` 扫描 `source/swiper/images/` 生成 `images-auto.json`
- **IndexedDB 缓存**：70+ 张图片首次加载后缓存在浏览器中（100MB 上限，7 天过期）
- **分批并发加载**：每批 20 张、6 并发、80ms 间隔、10s 批次超时
- **首页轮播（swiper）**：另一个独立组件，由 `hexo-butterfly-swiper` 插件驱动，从 elemecdn 加载

---

## L2 · 两套"swiper"的区别

| 维度 | `/swiper/` 页面（瀑布流） | 首页 swiper（轮播） |
|---|---|---|
| 实现方式 | 内联 JS + CSS（~1500 行在 markdown 中） | `hexo-butterfly-swiper` 插件 |
| 数据来源 | `scripts/auto-image-list.js` → `images-auto.json` | 读取 `source/swiper/images/` 目录 |
| 布局 | 两列绝对定位瀑布流 | Swiper 轮播组件 |
| CDN | 不使用（全自写） | elemecdn（swiper.min.css/js） |
| 缓存 | IndexedDB（100MB / 7天） | 无自定义缓存 |
| 启用状态 | 始终可访问 | `swiper.enable: true` |

---

## L3 · 组件 1：`scripts/auto-image-list.js`（Hexo Generator）

### 3.1 注册方式

```js
hexo.extend.generator.register('auto-image-list', function(locals) {
  // ...
  return {
    path: 'swiper/images-auto.json',
    data: JSON.stringify(imageList, null, 2)
  };
});
```

这是一个 **generator**（不是 filter），直接向 Hexo 路由注册了一个虚拟文件 `swiper/images-auto.json`。生成的内容会写入 `public/swiper/images-auto.json`。

### 3.2 扫描逻辑

| 步骤 | 行为 |
|---|---|
| 1. 定位目录 | `source/swiper/images/`（不存在则返回空列表） |
| 2. 过滤文件 | 支持的扩展名：`.jpg/.jpeg/.png/.gif/.webp/.bmp/.svg` |
| 3. 排序 | 按文件名自然排序 |
| 4. 输出 | `["1.webp", "2.webp", ...]` 写入 JSON |

### 3.3 与 `images.json` 的关系

`source/swiper/images.json` 是一个手动维护的备用列表。`images-auto.json` 优先级更高（前端先尝试 fetch 它）。

---

## L4 · 组件 2：瀑布流 JS（内联在 `index.md` 中）

### 4.1 配置项

```js
const config = {
  imageFolderPath: '/swiper/images/',
  supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
  loadDelay: 80,           // 每个 item 创建间隔（ms）
  concurrentLoads: 6,      // 并发加载数
  preloadCount: 10,        // 预加载前 N 张
  imageTimeout: 5000,      // 单张超时（ms）
  batchTimeout: 10000,     // 批超时（ms）
  observerOptions: {
    threshold: [0, 0.1, 0.25, 0.5],
    rootMargin: '150px 0px 300px 0px'
  },
  cache: {
    dbName: 'SwiperImageCache',
    dbVersion: 1,
    storeName: 'images',
    maxCacheSize: 100 * 1024 * 1024,  // 100MB
    cacheExpiry: 7 * 24 * 60 * 60 * 1000  // 7天
  }
};
```

### 4.2 布局算法

**两列绝对定位瀑布流**：

```text
1. 获取容器宽度 → columnWidth = (grid.offsetWidth - gap) / 2
2. 维护 columnHeights = [0, 0]
3. 每张图：
   → 取较短的列（0 或 1）
   → position: absolute; left = col * (width + gap); top = columnHeights[col]
   → columnHeights[col] += height + gap
4. 全部定位后 → grid.style.height = max(columnHeights)
```

> 这种算法在图片尺寸差异大时效果好（瀑布流天然避免了大图把小图挤到下方的问题），但需要**先知道图片尺寸**才能定位——因此使用 `new Image()` 预加载获取 naturalWidth/Height。

### 4.3 加载流程

```text
initialize()
  → IndexedDB 初始化 + 清理过期缓存
  → loadLocalImages()
      ├── fetch /swiper/images-auto.json（优先）
      ├── fetch /swiper/images.json（备用）
      └── 尝试常见文件名（最后备用）
  → enhanceAuroraRandomization(imageList)
      ├── 智能分组（hash命名/数字命名/混合）
      ├── Fisher-Yates 多轮洗牌 + 自定义 LCG 随机
      └── 交错合并各组
  → loadImages()
      ├── preloadInitialImages(前10张)
      └── loadNextBatch() 循环
           ├── 每批 20 张
           ├── 6 并发 + 80ms 间隔
           ├── preloadImageWithCache() → 先查 IndexedDB 再 fetch
           ├── createImageItem() → positionItem() → 定位到较短列
           └── 全部加载后 triggerVisibilityAnimation()
```

### 4.4 IndexedDB 缓存管理器

| 操作 | 行为 |
|---|---|
| **init** | 打开/创建 `SwiperImageCache` v1 数据库，清理过期项 |
| **get(url)** | 查 IndexedDB → 检查过期（7天）→ 返回 blob 或 null |
| **set(url, blob)** | 检查总大小 → 超 100MB 则 LRU 清理 → 写入 blob + timestamp |
| **cleanExpiredCache** | 遍历 index 'timestamp' → 删除过期项 |
| **getCacheStats(urls)** | 返回 `{ total, cached, remaining }` 用于进度显示 |

### 4.5 IntersectionObserver 浮现动画

```text
每张图片进入视口 → 计算交叠比例
  → 延迟 = base(100ms) + random(0-200ms) + visibilityDelay
  → 添加 randomRotation(-1.5°~1.5°)
  → classList.add('visible')
    → opacity 0→1, translateY 80px→0, rotateX 15deg→0
    → auroraGlow 1.2s + auroraFloat 4s infinite
  → 离开视口 → 100ms 延迟后 remove 'visible'
```

### 4.6 备用显示机制

如果 IntersectionObserver 失效（常见于 `position: absolute` 元素），有**三层保护**：
1. `triggerVisibilityAnimation()` — 加载完成后手动触发
2. `startLoadingMonitor()` — 每 5s 检查是否有视口内未显示图片
3. `visibilitychange` / `focus` 事件 — 页面恢复焦点时重新检查

### 4.7 缓存清理功能

页面顶部有"🗑️ 清除图片缓存"按钮：
- 调用 `indexedDB.deleteDatabase('SwiperImageCache')`
- 清理内存中的 `preloadedImages` Map + Object URL
- 重新初始化缓存系统
- `location.reload()` 刷新页面

---

## L5 · 极光随机化算法

### 5.1 目标

防止相似文件名（sha256 hash 命名）的图片在瀑布流中聚集，使视觉分布更均匀。

### 5.2 算法

```js
enhanceAuroraRandomization(imageList):
  1. 分组：hash命名 / 数字命名 / 混合
  2. 各组内 Fisher-Yates 洗牌（3 轮 + 自定义 LCG 随机数）
  3. 交错合并（轮流从各组取一张）
  4. 整体再洗牌一次
```

---

## L6 · 性能考量

| 维度 | 现状 | 备注 |
|---|---|---|
| **图片数量** | 70+ 张 webp | 全量加载无分页，首次访问压力大 |
| **内存占用** | IndexedDB 最多 100MB + 内存 Map 缓存 | 可控 |
| **布局重排** | 每张图片触发 updateGridHeight | 批次结束才最终更新 |
| **并发控制** | 6 并发 + 80ms 间隔 | 避免了同时创建大量 DOM |
| **超时保护** | 单张 5s / 批次 10s | 挂掉的图不会阻塞后续 |
| **监控开销** | 5s 周期检查（加载完成后停止） | 开销极小 |

---

## L7 · 红线

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 删除 `scripts/auto-image-list.js` | `images-auto.json` 不再生成，瀑布流回退到备用列表/空状态 | 保留 |
| R2 | 删除 IndexedDB 初始化代码 | 每次访问都重新下载全部 70+ 张图，流量剧增 | 保留缓存系统 |
| R3 | 修改 `imageFolderPath` 但不同步移动图片文件 | 所有图片 404 | 同步迁移 |
| R4 | 把瀑布流 JS 抽取到外部文件但忘记处理 Hexo 模板变量 | markdown 内联 JS 中的 emoji 可能被 hexo 渲染破坏 | 保持内联或使用 `{% raw %}` 包裹 |

---

## L8 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 瀑布流页面 | `source/swiper/index.md`（内联 CSS + JS ~1500 行） |
| 自动扫描脚本 | `scripts/auto-image-list.js` |
| 图片目录 | `source/swiper/images/` |
| 备用列表 | `source/swiper/images.json` |
| 自动索引（生成） | `public/swiper/images-auto.json` |
| 使用说明 | `source/swiper/README.md` |
