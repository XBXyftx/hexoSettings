# 博客懒加载优化与目录跳转修复报告

## 一、问题背景

### 1.1 原始问题
博客在使用图片懒加载后，点击右侧文章目录向下快速跳转时，由于以下原因导致跳转位置偏移：

1. **占位符高度固定**：懒加载占位符使用固定的 `min-height: 150px/200px`
2. **图片加载时机**：滚动过程中经过的图片被加载，文档总高度动态变化
3. **滚动距离计算错误**：`scrollToDest` 计算的目标位置基于旧的 DOM 高度

### 1.2 衍生问题
在修复过程中发现并解决了以下问题：

1. **头像/公告栏图片消失**：图片尺寸插件给所有图片添加了 `loading="lazy"`，导致首屏关键图片被延迟加载
2. **Logo 被拉伸**：`site-icon` 图片被添加了不合适的 `width/height` 属性，与 CSS 固定高度冲突

---

## 二、解决方案架构

采用**多层级**解决方案，从根本上消除布局偏移：

```
┌─────────────────────────────────────────────────────────────┐
│  第一层：构建时优化 (Hexo 插件)                               │
│  ├─ 自动获取图片真实尺寸                                      │
│  ├─ 添加 width/height 属性                                   │
│  └─ 浏览器可预留正确空间                                      │
├─────────────────────────────────────────────────────────────┤
│  第二层：运行时优化 (原生懒加载)                              │
│  ├─ 使用 loading="lazy"                                     │
│  ├─ 浏览器自动优化加载时机                                    │
│  └─ 保留淡入过渡效果                                         │
├─────────────────────────────────────────────────────────────┤
│  第三层：交互优化 (目录跳转)                                  │
│  ├─ 预加载目标区域图片                                       │
│  ├─ 等待加载完成后跳转                                       │
│  └─ 重新计算目标位置                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、详细实现

### 3.1 Hexo 图片尺寸插件

**文件**: `scripts/image-dimensions.js`

**功能**:
- 在 Hexo 生成阶段（`after_render:html`）处理所有 HTML
- 读取图片文件获取真实尺寸
- 为 `<img>` 标签添加 `width`、`height` 和 `loading="lazy"` 属性
- 计算并添加 `data-aspect-ratio` 用于 CSS

**排除规则**:
```javascript
// 不添加尺寸和懒加载的 class
EXCLUDE_CLASSES = [
  'site-icon',      // Logo，CSS 固定尺寸
  'announcementImg', // 公告栏 GIF
  'post-bg',        // 文章背景图
  'cover',          // 封面图
  'friend-avatar'   // 友链头像
];

// 不添加懒加载的 alt 文本
EXCLUDE_ALTS = ['avatar'];

// 不处理的图片路径
EXCLUDE_PATH_PATTERNS = [
  /\/img\/logo\.png$/,
  /\/img\/favicon/,
  /\/imgs\/gifs\//
];
```

**技术细节**:
- 使用 `image-size` 库读取图片尺寸
- 支持多种路径解析（`source/`, `public/`, `themes/butterfly/source/`）
- 特殊处理文章目录图片（`post_asset_folder` 模式）
- 内存缓存避免重复读取文件

**生成示例**:
```html
<!-- 文章图片 -->
<img src="/2025/01/24/xxx/image.webp" 
     alt="描述" 
     width="1919" 
     height="1079" 
     loading="lazy">

<!-- Logo（被排除） -->
<img class="site-icon" src="/img/logo.webp" alt="Logo">
```

---

### 3.2 原生懒加载脚本

**文件**: `source/js/lazy-loading-native.js`

**特点**:
- 使用浏览器原生 `loading="lazy"`（Chrome 76+, Firefox 75+, Safari 15.4+）
- 保留淡入效果（`fadeInDuration: 600ms`）
- 支持目录跳转预加载

**核心函数**:
```javascript
// 预加载目标区域图片
function preloadImagesNearElement(element, offset = 800) {
  const targetTop = element.getBoundingClientRect().top + window.scrollY;
  const images = document.querySelectorAll('#article-container img[loading="lazy"]');
  
  images.forEach(img => {
    const imgTop = img.getBoundingClientRect().top + window.scrollY;
    const distance = Math.abs(imgTop - targetTop);
    
    if (distance < offset && !img.complete) {
      // 强制加载
      img.loading = 'eager';
    }
  });
}
```

**全局导出**:
```javascript
window.lazyLoadPreload = preloadImagesNearElement;
window.lazyLoadRefresh = init;
```

---

### 3.3 稳定懒加载样式

**文件**: `source/css/lazy-loading-stable.css`

**核心样式**:

```css
/* 文章图片使用 aspect-ratio 保持比例 */
#article-container img {
  aspect-ratio: attr(width) / attr(height);
  height: auto;
  max-width: 100%;
}

/* 无尺寸信息的图片使用默认占位符 */
#article-container img[loading="lazy"]:not([width]):not([height]):not(.lazy-loaded) {
  min-height: 200px;
  background: linear-gradient(...);
  animation: lazyShimmer 1.5s ease-in-out infinite;
}

/* 标题锚点跳转优化 */
#article-container h1,
#article-container h2,
#article-container h3,
#article-container h4,
#article-container h5,
#article-container h6 {
  scroll-margin-top: 90px;  /* 导航栏高度 + 间距 */
}

/* 非文章区域图片不受影响 */
#page-header img,
.avatar img,
.related-post-item img,
.aside-card img,
.footer img {
  aspect-ratio: auto !important;
  min-height: auto !important;
}
```

---

### 3.4 目录跳转优化

**文件**: `themes/butterfly/source/js/main.js`

**修改位置**: `tocItemClickFn` 函数

**优化逻辑**:
```javascript
const tocItemClickFn = e => {
  const target = e.target.closest('.toc-link');
  if (!target) return;

  e.preventDefault();
  
  const targetId = decodeURI(target.getAttribute('href')).replace('#', '');
  const targetEle = document.getElementById(targetId);
  if (!targetEle) return;

  // 预加载目标区域的图片
  const preloadAndScroll = async () => {
    if (typeof window.lazyLoadPreload === 'function') {
      await window.lazyLoadPreload(targetEle, 1000);
    }
    
    // 给 DOM 一点时间更新
    requestAnimationFrame(() => {
      // 重新计算目标位置
      const targetPos = btf.getEleTop(targetEle);
      btf.scrollToDest(targetPos, 300);
    });
  };

  preloadAndScroll();
};
```

---

### 3.5 配置更新脚本增强

**文件**: `tools/update-markdown-images.ps1`

**新增功能**:
- 同时处理 Markdown 文件和配置文件
- 支持 `_config.butterfly.yml` 和 `_config.yml`
- 自动转换配置项中的图片路径

**支持的配置项**:
```yaml
# 会被自动转换的配置项
img: /img/logo.png              → /img/logo.webp
favicon: /img/logo.png          → /img/logo.webp
default_top_img: /img/bg.png    → /img/bg.webp
index_img: /img/bg.png          → /img/bg.webp
archive_img: /img/archive.png   → /img/archive.webp
tag_img: /img/tag.png           → /img/tag.webp
category_img: /img/cat.png      → /img/cat.webp
footer_img: /img/footer.png     → /img/footer.webp
background: /img/bg.png         → /img/bg.webp
```

**排除规则**:
```powershell
$excludePatterns = @(
    'https://bu\.dusays\.com',           # 杜说图床
    'https://raw\.githubusercontent\.com', # GitHub Raw
    'https?://[^/]+\.github\.io',        # GitHub Pages
    'https?://[^/]+\.githubusercontent\.com'
)
```

---

## 四、文件变更清单

### 4.1 新增文件

| 文件 | 说明 |
|------|------|
| `scripts/image-dimensions.js` | Hexo 插件，生成时添加图片尺寸 |
| `source/js/lazy-loading-native.js` | 原生懒加载脚本 |
| `source/css/lazy-loading-stable.css` | 稳定的懒加载样式 |

### 4.2 修改文件

| 文件 | 修改内容 |
|------|----------|
| `themes/butterfly/source/js/main.js` | 目录跳转逻辑，添加预加载 |
| `tools/update-markdown-images.ps1` | 支持配置文件处理 |
| `source/js/lazy-loading.js` | 兼容原生懒加载 |
| `themes/butterfly/layout/includes/head.pug` | 引入新 CSS |
| `themes/butterfly/layout/includes/additional-js.pug` | 引入新 JS |

---

## 五、关键修复记录

### 5.1 修复 1：头像/公告栏图片消失

**问题**: 图片尺寸插件给所有图片添加了 `loading="lazy"`，导致首屏关键图片被延迟加载，显示为空白。

**解决**: 添加排除规则
```javascript
const EXCLUDE_CLASSES = ['announcementImg', 'site-icon', ...];
const EXCLUDE_ALTS = ['avatar'];
const EXCLUDE_PATH_PATTERNS = [/\/img\/logo\.png$/, ...];
```

### 5.2 修复 2：Logo 被拉伸

**问题**: `site-icon` 图片被添加了 `width="905" height="905"`，但 CSS 中设置了固定高度 `36px`，导致图片被拉伸成扁平状（905×36）。

**解决**: 将 `site-icon` 加入完全排除列表（不添加尺寸属性，不添加懒加载）
```javascript
// 修改前
if ((!hasWidth || !hasHeight) && sizeOf) {
  // 添加尺寸...
}

// 修改后
if ((!hasWidth || !hasHeight) && sizeOf && !isExcluded) {
  // 添加尺寸...
}
```

---

## 六、使用方法

### 6.1 首次部署

```powershell
# 1. 清理缓存
hexo clean

# 2. 更新配置文件中的图片引用
.\tools\update-markdown-images.ps1

# 3. 转换本地图片为 WebP
.\tools\convert-to-webp.ps1

# 4. 生成网站
hexo generate

# 5. 部署
hexo deploy
```

### 6.2 日常更新

```powershell
# 添加新文章后
hexo clean && hexo generate && hexo deploy

# 图片尺寸插件会自动处理新生成的 HTML
```

---

## 七、效果验证

### 7.1 检查图片尺寸

生成的 HTML 中文章图片应包含：
```html
<img src="/2025/01/24/xxx/image.webp" 
     alt="描述" 
     width="1919" 
     height="1079" 
     loading="lazy">
```

### 7.2 检查排除项

Logo 和头像应**不包含**尺寸和懒加载属性：
```html
<!-- Logo -->
<img class="site-icon" src="/img/logo.webp" alt="Logo">

<!-- 头像 -->
<img src="/img/logo.webp" alt="avatar"/>
```

### 7.3 检查目录跳转

1. 打开一篇长文章
2. 点击右侧目录跳转到靠后的章节
3. 应能一次跳转到正确位置，无需反复点击

---

## 八、注意事项

### 8.1 浏览器兼容性

- **原生懒加载**: Chrome 76+, Firefox 75+, Safari 15.4+, Edge 79+
- **降级方案**: 不支持原生懒加载的浏览器会直接加载图片（无延迟）

### 8.2 性能影响

- **生成时间**: 图片尺寸插件会增加约 1-2 秒的生成时间（取决于图片数量）
- **运行时**: 无额外性能开销，原生懒加载由浏览器优化

### 8.3 维护建议

1. **新图片**: 无需特殊处理，插件会自动获取尺寸
2. **外部图片**: 确保在排除规则中添加新图床域名
3. **特殊图片**: 如需排除特定图片，添加相应 class 到 `EXCLUDE_CLASSES`

---

## 九、故障排除

### Q1: 图片仍然加载慢

- 检查是否正确排除了首屏关键图片
- 确认 CDN 或图床服务正常

### Q2: 目录跳转仍然偏移

- 确认已运行 `hexo clean` 并重新生成
- 检查控制台是否有 JavaScript 错误
- 验证图片尺寸插件是否正常工作（查看生成日志中的 `[Image Dimensions]`）

### Q3: 某些图片显示异常

- 检查图片文件是否存在且未损坏
- 查看浏览器开发者工具中的 Network 标签
- 确认图片路径是否正确

---

## 十、相关文件

- **本文档**: `doc/lazy-loading-optimization-report.md`
- **长期记忆**: `doc/long-term-memory.md`
- **Hexo 插件**: `scripts/image-dimensions.js`
- **懒加载脚本**: `source/js/lazy-loading-native.js`
- **样式文件**: `source/css/lazy-loading-stable.css`

---

**最后更新**: 2026-02-22
