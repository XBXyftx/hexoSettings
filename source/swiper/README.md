# 昨日重现图库维护说明

`/swiper/` 是一个 manifest 驱动的随机照片墙。图库采用两列瀑布流（极窄屏为一列），照片在接近视口时才开始请求，并在进入或离开可视范围时反复浮现、隐藏。

## 添加照片

1. 将图片放入 `source/swiper/images/`。
2. 推荐先执行 `npm run webp`，把 JPG、PNG、GIF 转换成 WebP。
3. 执行 `npm run build`。
4. Hexo 插件 `scripts/auto-image-list.js` 会生成 `public/swiper/images-auto.json`。

manifest 会记录每张图片的：

- 文件名和稳定 ID；
- 宽度、高度与文件字节数；
- 图片内容哈希 `revision`；
- 整个图库的 `catalogRevision`。

页面在图片加载前就能依据宽高预留位置；同名图片内容变化后，版本化 URL 也会更新，避免继续命中旧内容。

## 随机顺序

- 首次进入页面时使用无偏 Fisher–Yates 洗牌。
- 顺序只保存在当前标签页的 `sessionStorage`。
- 当前标签页刷新后保持顺序，新的浏览会话重新随机。
- manifest 内容变化时旧顺序自动失效。
- 页面上的“重新随机排列”只重建本次顺序和加载状态，**不会也无法清除浏览器 HTTP 图片缓存**。

旧的 `source/swiper/images.json` 不再参与运行时加载；唯一数据来源是构建生成的 manifest。

## 懒加载与低带宽策略

- 初始只创建带尺寸的空占位，不设置图片 `src`。
- 上下两个方向均使用对称的近视口范围；只有接近视口的图片才会进入统一队列。
- 桌面快速网络最多并发 3 张，移动端或 3G 最多 2 张，Save-Data/2G 最多 1 张。
- 图片使用普通同源 URL 和浏览器 HTTP 缓存，不再复制 Blob 到 IndexedDB。
- 离开视口只隐藏视觉内容，不删除已加载图片，避免反复下载。
- 增强灯箱只显示当前图片附近的 5 个序号，不批量下载全部缩略图。

## 可见性动画

严格视口观察器持续观察每一个卡片：

- 有正面积进入视口时添加 `is-visible`；
- 完全离开视口时立即移除 `is-visible`；
- 从上方回来时向下浮现，从下方进入时向上浮现；
- 不使用延迟定时器，因此不会产生旧进入/离开回调覆盖新状态的问题；
- `prefers-reduced-motion` 用户仍有正确显隐状态，但不执行位移和持续动画。

## 图片压缩

项目提供安全默认的检查/压缩命令：

```bash
# 先检查现有图库会如何处理，不改文件
npm run gallery:compress -- --reencode-webp --dry-run

# 显式原地压缩：最长边 2560px、质量 76、method 6
npm run gallery:compress -- --reencode-webp --in-place

# 自定义参数
npm run gallery:compress -- --reencode-webp --in-place --quality 72 --max-edge 2200 --method 6
```

注意：

- 必须安装 `cwebp`；macOS 可使用 `brew install webp`。
- 默认不重编码已有 WebP，也不会覆盖源文件；非原地结果写入仓库外层的 `.gallery-optimization-preview/`，不会被 manifest 当作正式照片。
- 原地替换属于破坏性操作，必须显式提供 `--reencode-webp --in-place`。
- 建议先运行 `--dry-run`，备份图片后再原地压缩。
- 压缩后重新运行 `npm run build`，让 manifest 更新尺寸和内容版本。

## 相关文件

- 页面语义结构：`source/swiper/index.md`
- manifest 生成器：`scripts/auto-image-list.js`
- 页面控制器：`themes/butterfly/source/js/yesterday-gallery.js`
- 页面样式：`themes/butterfly/source/css/yesterday-gallery.css`
- 增强图片预览：`themes/butterfly/source/js/lightbox-enhanced.js`
- 文章懒加载隔离：`themes/butterfly/source/js/lazy-loading-optimized.js`
- 压缩工具：`tools/optimize-gallery-images.js`
