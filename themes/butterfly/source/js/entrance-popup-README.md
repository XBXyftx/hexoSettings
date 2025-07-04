# 入场弹窗功能使用说明

## 功能介绍

入场弹窗功能会在用户进入网站或跳转到新页面时，在右上角显示一个精美的弹窗，展示来自预设文本数组中的随机内容。弹窗具有以下特点：

- ✅ 响应式设计，完美适配PC端和移动端
- ✅ 渐变背景，美观大方
- ✅ 3秒自动关闭
- ✅ 提供手动关闭按钮
- ✅ 支持ESC键关闭
- ✅ 不覆盖主要内容
- ✅ 支持暗色模式
- ✅ 可根据页面类型和特殊日期显示不同内容

## 文件结构

```
themes/butterfly/source/
├── css/
│   └── entrance-popup.css          # 弹窗样式文件
├── js/
│   ├── entrance-popup-config.js    # 配置文件（可自定义）
│   ├── entrance-popup.js          # 主要逻辑文件
│   └── entrance-popup-README.md   # 使用说明（本文件）
```

## 自定义配置

### 1. 修改弹窗文本

编辑 `themes/butterfly/source/js/entrance-popup-config.js` 文件：

```javascript
// 默认文本数组
texts: [
  '欢迎来到我的博客！希望您在这里找到有价值的内容～',
  '感谢您的访问！记得收藏本站以便下次再来哦～',
  // 在这里添加更多文本...
],
```

### 2. 调整弹窗行为

```javascript
// 弹窗显示配置
settings: {
  autoCloseTime: 3000,     // 自动关闭时间（毫秒）
  showOnEveryPage: true,   // 是否在每个页面都显示
  animationDelay: 500,     // 页面加载后延迟显示时间（毫秒）
  enableEscapeClose: true, // 是否允许按ESC键关闭
  enableOverlayClose: false, // 是否允许点击遮罩层关闭
  title: '温馨提示',       // 弹窗标题
},
```

### 3. 设置页面特定文本

```javascript
// 特定页面配置
pageSpecific: {
  // 首页特定文本
  home: [
    '欢迎来到XBXyftx的博客！',
    // 更多首页文本...
  ],
  // 文章页面特定文本
  post: [
    '感谢您阅读我的文章！',
    // 更多文章页面文本...
  ],
  // 归档页面特定文本
  archive: [
    '这里汇集了我的所有文章～',
    // 更多归档页面文本...
  ]
},
```

### 4. 设置节日特殊文本

```javascript
// 节日/特殊日期配置
seasonal: {
  // 春节
  'spring-festival': {
    dates: ['02-01', '02-15'], // 日期范围 (MM-DD格式)
    texts: [
      '新春快乐！祝您在新的一年里技术更进一步！',
      // 更多春节文本...
    ]
  },
  // 程序员节
  'programmer-day': {
    dates: ['10-24'],
    texts: [
      '程序员节快乐！致敬每一位辛勤的代码工作者！',
      // 更多程序员节文本...
    ]
  }
},
```

## 样式自定义

### 1. 修改弹窗颜色

编辑 `themes/butterfly/source/css/entrance-popup.css` 文件：

```css
.popup-content {
  /* 修改背景渐变 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 暗色模式 */
[data-theme="dark"] .popup-content {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}
```

### 2. 调整弹窗大小

```css
.popup-content {
  max-width: 320px;  /* 最大宽度 */
  min-width: 280px;  /* 最小宽度 */
}
```

### 3. 修改动画效果

```css
.entrance-popup {
  /* 修改过渡时间 */
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.popup-content {
  /* 修改初始位置 */
  transform: translateY(-20px);
}
```

## 控制弹窗显示

### 1. 手动控制弹窗

```javascript
// 显示弹窗
window.EntrancePopup.show();

// 隐藏弹窗
window.EntrancePopup.hide();

// 获取当前配置
const config = window.EntrancePopup.getConfig();

// 获取当前文本数组
const texts = window.EntrancePopup.getTexts();
```

### 2. 根据条件控制显示

在 `entrance-popup-config.js` 中修改 `shouldShowPopup` 函数：

```javascript
// 检查是否应该显示弹窗
function shouldShowPopup() {
  const config = getConfig();
  
  // 例：只在首页显示
  if (getCurrentPageType() !== 'home') {
    return false;
  }
  
  // 例：检查本地存储，一天只显示一次
  const today = new Date().toDateString();
  const lastShown = localStorage.getItem('popup-last-shown');
  if (lastShown === today) {
    return false;
  }
  localStorage.setItem('popup-last-shown', today);
  
  return config.showOnEveryPage;
}
```

## 兼容性说明

- 支持现代浏览器（Chrome 60+、Firefox 60+、Safari 12+、Edge 79+）
- 兼容移动设备（iOS Safari、Android Chrome）
- 支持键盘操作（ESC键关闭）
- 适配不同屏幕尺寸

## 故障排除

### 1. 弹窗不显示

- 检查浏览器控制台是否有JavaScript错误
- 确认配置文件路径正确
- 检查 `showOnEveryPage` 配置是否为 `true`

### 2. 样式显示异常

- 检查CSS文件是否正确加载
- 确认没有其他样式冲突
- 检查暗色模式适配

### 3. 移动端显示问题

- 检查CSS媒体查询是否正确
- 确认viewport设置正确
- 测试不同设备的显示效果

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的弹窗功能
- 响应式设计
- 支持自定义配置

---

如有问题或建议，请在GitHub Issues中反馈。 