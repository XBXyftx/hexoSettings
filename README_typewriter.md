# Hexo Butterfly 主题文章打字机效果功能

## 功能说明

这个功能为 Hexo 博客的 Butterfly 主题添加了文章页面的打字机效果，能够在文章内容的最前方以打字机动画的形式展示文章的简介描述（description 字段）。

## 功能特性

- ✨ **优雅的打字机动画**：模拟真实的打字效果，带有光标闪烁
- 📱 **完整的移动端适配**：支持手机、平板等各种屏幕尺寸
- 🎨 **美观的视觉设计**：渐变背景、微光动画效果
- 🌓 **深色模式支持**：自动适配 Butterfly 主题的深色模式
- ⚡ **性能优化**：只在文章页面加载，支持 PJAX，减少动画对性能的影响
- 🎯 **智能延迟**：等待页面完全加载和加载动画结束后延迟 2 秒开始

## 工作原理

1. **页面检测**：只在文章页面（`#post` 元素存在）执行
2. **内容获取**：从页面的 `meta[name="description"]` 标签获取文章简介
3. **加载等待**：等待页面加载动画结束，然后延迟 2 秒
4. **动态插入**：在文章内容容器（`#article-container`）的最前方插入打字机容器
5. **打字动画**：以每个字符 80ms 的速度展示打字效果
6. **光标闪烁**：打字完成后光标开始闪烁动画

## 文件结构

```
themes/butterfly/
├── source/
│   ├── js/
│   │   └── typewriter-effect.js    # 打字机效果 JavaScript
│   └── css/
│       └── typewriter-effect.css   # 打字机效果样式
└── layout/includes/
    ├── head.pug                    # 已修改：添加 CSS 引用
    └── additional-js.pug           # 已修改：添加 JS 引用
```

## 样式适配

### 桌面端
- 渐变背景色：蓝紫色渐变
- 圆角边框：12px
- 阴影效果：柔和阴影
- 图标：引用图标 + 文字排列

### 平板端 (768px - 1024px)
- 稍微缩小间距和字体
- 保持水平布局

### 手机端 (≤768px)
- 改为垂直布局（图标在上，文字在下）
- 优化间距和字体大小
- 适配小屏幕显示

### 小屏手机 (≤480px)
- 进一步缩小间距
- 优化极小屏幕的显示效果

### 横屏模式
- 针对低高度屏幕优化
- 减少垂直间距

## 深色模式适配

系统自动检测 `[data-theme="dark"]`，在深色模式下：
- 背景渐变：黑灰色渐变
- 阴影效果：调整为白色半透明阴影

## 性能优化

- **条件加载**：只在文章页面加载相关 CSS 和 JS
- **减少动画**：对于 `prefers-reduced-motion` 用户禁用动画
- **内存管理**：使用 Promise 和定时器管理，避免内存泄漏
- **PJAX 支持**：支持 Butterfly 主题的 PJAX 无刷新切换

## 使用方法

1. **确保文章有 description 字段**
   在文章的 Front Matter 中添加：
   ```yaml
   ---
   title: 文章标题
   description: 这里是文章的简介描述，会显示在打字机效果中
   ---
   ```

2. **重新生成博客**
   ```bash
   hexo clean
   hexo generate
   hexo server
   ```

3. **访问文章页面**
   进入任何一篇有 description 的文章，等待 2 秒后即可看到打字机效果

## 自定义配置

### 修改打字速度
在 `typewriter-effect.js` 中修改：
```javascript
const typewriter = new TypeWriter(typewriterText, description, 80); // 80ms per character
```

### 修改延迟时间
在 `typewriter-effect.js` 中修改：
```javascript
setTimeout(() => {
  initTypewriterEffect();
}, 2000); // 2000ms = 2 seconds
```

### 修改样式颜色
在 `typewriter-effect.css` 中修改背景渐变：
```css
.post-typewriter-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 注意事项

1. **需要 description 字段**：如果文章没有 description，打字机效果不会显示
2. **FontAwesome 依赖**：使用了 `fas fa-quote-left` 图标，需要确保主题加载了 FontAwesome
3. **浏览器兼容性**：使用了 ES6+ 语法，需要现代浏览器支持
4. **PJAX 兼容**：已经处理了 PJAX 的兼容性问题

## 故障排除

1. **打字机效果不显示**
   - 检查文章是否有 description 字段
   - 检查浏览器控制台是否有 JavaScript 错误
   - 确认文件路径正确

2. **样式显示异常**
   - 检查 CSS 文件是否正确加载
   - 确认没有其他 CSS 冲突

3. **PJAX 环境下不工作**
   - 确认已经添加了 `pjax:complete` 事件监听

## 更新日志

- **v1.0.0** (2025-01-26)
  - 初始版本发布
  - 支持基本的打字机效果
  - 完整的移动端适配
  - 深色模式支持
  - PJAX 兼容性 