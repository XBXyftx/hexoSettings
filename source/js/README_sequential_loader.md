# Sequential Image Loader 顺序图片加载器

## 🚀 功能介绍

Sequential Image Loader 是专为解决服务器带宽限制导致的图片加载503错误问题而设计的图片加载器。特别适用于带宽受限的服务器环境，能够：

- ✅ **顺序加载图片**：避免并发请求过多导致的503错误
- ✅ **智能重试机制**：自动重试失败的图片请求
- ✅ **懒加载支持**：只在图片进入视口时才加载
- ✅ **进度显示**：实时显示加载进度
- ✅ **主题集成**：完美兼容Butterfly主题的各种功能
- ✅ **性能优化**：减少服务器压力，提升用户体验

## 📋 文件说明

### 核心文件
- `sequential-image-loader.js` - 核心加载器
- `sequential-loader-config.js` - 配置文件
- `sequential-integration.js` - 主题集成脚本
- `sequential-loader.css` - 样式文件

### 配置选项

```javascript
window.sequentialLoaderConfig = {
  // 是否启用（默认：true）
  enabled: true,
  
  // 最大并发数（推荐：1，适合1mb/s带宽）
  maxConcurrent: 1,
  
  // 超时时间（毫秒，默认：15000）
  timeout: 15000,
  
  // 重试次数（默认：3）
  retryCount: 3,
  
  // 请求延迟（毫秒，给服务器减压）
  requestDelay: 800,
  
  // 重试延迟（毫秒）
  retryDelay: 3000,
  
  // 是否显示进度条
  showProgress: true,
  
  // 是否启用懒加载
  enableLazyload: true,
  
  // 视口检测边距
  rootMargin: '200px'
};
```

## 🔧 安装与配置

### 1. 文件部署
已自动集成到Butterfly主题配置中，相关文件位于：
- `source/js/sequential-*.js`
- `source/css/sequential-loader.css`

### 2. 主题配置
在 `_config.butterfly.yml` 的 `inject.head` 中已添加：
```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/sequential-loader.css">
    - <script src="/js/sequential-loader-config.js"></script>
    - <script src="/js/sequential-image-loader.js" defer></script>
    - <script src="/js/sequential-integration.js" defer></script>
```

### 3. 个性化配置
在 `sequential-loader-config.js` 中根据你的服务器情况调整：

**高带宽服务器（>5mb/s）：**
```javascript
maxConcurrent: 2,
requestDelay: 300,
retryDelay: 1000
```

**低带宽服务器（<1mb/s）：**
```javascript
maxConcurrent: 1,
requestDelay: 1200,
retryDelay: 5000
```

## 📊 使用统计

### 查看加载状态
```javascript
// 获取加载统计
const stats = window.sequentialImageLoader.getStats();
console.log(stats);
// 输出：{ total: 50, loaded: 45, loading: 2, pending: 3, failed: 0 }
```

### 监听加载事件
```javascript
// 监听单张图片加载完成
document.addEventListener('sequentialImageLoaded', (e) => {
  console.log('图片加载完成：', e.detail.src);
});

// 监听所有图片加载完成
document.addEventListener('sequentialImagesLoaded', (e) => {
  console.log('所有图片加载完成：', e.detail);
});
```

## 🎯 针对性优化

### 博客文章页面
- 图片较多，启用懒加载
- 适中的并发数和延迟

### 首页瀑布流
- 图片密集，严格控制并发
- 较长的请求延迟

### 相册页面
- 大图较多，增加超时时间
- 更长的重试延迟

## 🔍 故障排除

### 常见问题

**1. 图片仍然出现503错误**
- 减少 `maxConcurrent` 为 1
- 增加 `requestDelay` 到 1500ms 或更高
- 增加 `retryDelay` 到 5000ms

**2. 图片加载太慢**
- 检查网络连接
- 适当增加 `maxConcurrent`（但不要超过2）
- 减少 `requestDelay`

**3. 进度条不显示**
- 确认 `showProgress: true`
- 检查CSS文件是否正确加载

**4. 与其他插件冲突**
- 检查浏览器控制台错误
- 确认加载顺序正确

### 调试模式
在浏览器控制台启用详细日志：
```javascript
// 查看当前状态
window.sequentialImageLoader.getStats();

// 重新扫描图片
window.sequentialImageLoader.rescan();

// 手动重试失败的图片
document.querySelectorAll('img.sequential-error').forEach(img => {
  img.click(); // 点击重试
});
```

## 🔄 更新日志

### v1.0.0 (当前版本)
- ✅ 核心顺序加载功能
- ✅ 懒加载支持
- ✅ 重试机制
- ✅ 进度显示
- ✅ Butterfly主题集成
- ✅ 瀑布流布局支持
- ✅ 自定义lightbox集成

## 🤝 技术支持

如果遇到问题或需要自定义配置，可以：

1. 检查浏览器控制台的日志信息
2. 根据你的服务器配置调整参数
3. 查看网络面板确认请求状态

## 📈 性能建议

1. **服务器端优化**：
   - 开启图片压缩
   - 使用WebP格式
   - 配置适当的缓存策略

2. **客户端优化**：
   - 适当的并发控制
   - 合理的重试间隔
   - 启用懒加载

3. **用户体验**：
   - 显示加载进度
   - 提供重试功能
   - 失败图片占位符

通过合理配置这些参数，可以在保证图片正常加载的同时，最大化用户体验。
