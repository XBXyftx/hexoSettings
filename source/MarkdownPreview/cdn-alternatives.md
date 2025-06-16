# CDN替代方案

## 国内CDN源：

### 1. BootCDN (推荐)
```html
<script src="https://cdn.bootcdn.net/ajax/libs/marked/9.1.2/marked.min.js"></script>
```

### 2. 字节跳动CDN
```html
<script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/marked/4.2.12/marked.min.js"></script>
```

### 3. 360CDN
```html
<script src="https://lib.baomitu.com/marked/9.1.2/marked.min.js"></script>
```

### 4. 七牛CDN
```html
<script src="https://cdn.staticfile.org/marked/9.1.2/marked.min.js"></script>
```

## 手动下载方法：

### 1. 访问官方GitHub
https://github.com/markedjs/marked/releases

### 2. 下载压缩包
下载最新版本的 marked.min.js

### 3. 放置文件
将文件放在 `/d:/hexo/source/MarkdownPreview/` 目录下

## 当前状态：
✅ 已使用本地简化版Markdown解析器
✅ 支持所有基本Markdown语法
✅ 无需外部网络依赖 