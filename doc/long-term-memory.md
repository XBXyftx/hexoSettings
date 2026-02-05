# 博客项目长期记忆报告

## 项目概述
- **项目名称**: XBXyftx 的 Hexo 博客
- **主题**: Butterfly（深度自定义）
- **主要技术栈**: Hexo, Node.js, JavaScript, PowerShell
- **创建时间**: 2025年

---

## 关键配置与约定

### 1. 图片处理规则

#### 1.1 外部图床白名单（不转换为 WebP）
以下域名的图片**禁止**转换为 WebP 格式，需保持原始格式：

| 域名 | 说明 | 原始格式 |
|------|------|----------|
| `https://bu.dusays.com` | 杜说图床 | PNG/JPG |
| `https://raw.githubusercontent.com` | GitHub Raw | PNG |

**相关脚本**: 
- `tools/update-markdown-images.ps1` - Markdown 图片引用更新脚本
- `tools/convert-to-webp.ps1` - 本地图片 WebP 转换脚本

#### 1.2 本地图片处理
- 本地图片（`source/img`, `source/imgs` 等目录）会自动转换为 WebP
- 转换工具: `cwebp` (静态图), `gif2webp` (动态图)
- 质量设置: 75

### 2. 懒加载系统

#### 2.1 核心文件
- `source/js/lazy-loading.js` - 基础懒加载逻辑
- `source/js/lazy-loading-optimized.js` - IntersectionObserver 优化版
- `source/css/lazy-loading.css` - 占位符样式

#### 2.2 图片刷新按钮功能（2026-02-04 新增）
- **文件**: `source/js/lazy-image-refresh.js`, `source/css/lazy-image-refresh.css`
- **功能**: 图片加载失败时显示刷新按钮，支持手动重新加载
- **冷却时间**: 5 秒（防止恶意连点）
- **触发条件**: 
  - 图片加载错误（502等）
  - 目录跳转后检测
  - 滚动停止后检测

#### 2.3 视频懒加载刷新功能（2026-02-04 新增）
- **文件**: `source/js/lazy-video-refresh.js`, `source/css/lazy-video-refresh.css`
- **功能**: 
  - MP4 视频懒加载（IntersectionObserver）
  - 视频加载失败时显示刷新按钮
  - 支持手动重新加载视频
- **冷却时间**: 5 秒（防止恶意连点）
- **触发条件**: 
  - 视频加载错误
  - 目录跳转后检测
  - 滚动停止后检测
- **全局函数**: 
  - `window.lazyVideoRefresh.refresh(video)` - 刷新指定视频
  - `window.lazyVideoRefresh.refreshAll()` - 刷新所有失败的视频

#### 2.4 PJAX 支持
所有懒加载脚本都支持 PJAX 无刷新加载：
```javascript
document.addEventListener('pjax:complete', init);
```

### 3. 目录结构约定

```
source/
├── _posts/           # 公开文章
├── coffer/           # 私密文章（加密）
│   └── private-posts/
├── img/              # 图片资源
├── imgs/             # 更多图片资源
├── js/               # 自定义 JavaScript
├── css/              # 自定义 CSS
└── about/            # 关于页面

tools/                # 构建工具脚本
doc/                  # 项目文档（本目录）
```

### 4. WebP 转换工作流

#### 4.1 本地图片转换流程
1. 运行 `tools/convert-to-webp.ps1`
2. 扫描 `source/img`, `source/imgs` 等目录
3. 将 PNG/JPG/GIF 转换为 WebP
4. 保留原文件（可选删除）

#### 4.2 Markdown 引用更新流程
1. 运行 `tools/update-markdown-images.ps1`
2. 扫描所有 `.md` 文件
3. 更新图片引用为 `.webp`（**排除外部图床白名单**）
4. 支持三种格式：
   - Front-matter: `cover: path.webp`
   - Markdown: `![alt](path.webp)`
   - HTML: `<img src="path.webp">`

#### 4.3 图床图片恢复流程
如果外部图床图片被错误转换为 WebP：

**bu.dusays.com 图片恢复**:
```powershell
.\tools\restore-budusays-simple.ps1
```

**raw.githubusercontent.com 图片恢复**:
```powershell
.\tools\restore-github-simple.ps1
```

### 5. 主题自定义

#### 5.1 Butterfly 主题修改位置
- `themes/butterfly/layout/` - 布局模板（pug）
- `themes/butterfly/source/js/` - 主题 JavaScript
- `themes/butterfly/source/css/` - 主题样式

#### 5.2 自定义注入点
- `themes/butterfly/layout/includes/head.pug` - 头部 CSS/JS
- `themes/butterfly/layout/includes/additional-js.pug` - 底部 JS

### 6. 网络监控工具

#### 6.1 文件
- `source/js/network-monitor.js` - 请求监控
- `source/js/topimg-monitor.js` - 顶部图片监控

#### 6.2 功能
- 监控图片加载失败（502/503错误）
- 统计请求成功率
- 自动重试机制

---

## 重要历史变更

### 2026-02-04: 图片懒加载刷新功能
- **新增**: 图片刷新按钮功能
- **原因**: 服务器带宽限制导致图片502错误
- **实现**: 
  - 添加 `lazy-image-refresh.js` 和 `lazy-image-refresh.css`
  - 5秒冷却时间防止恶意连点
  - 目录跳转后自动检测失败图片

### 2026-02-04: 视频懒加载刷新功能
- **新增**: MP4视频懒加载和刷新按钮功能
- **原因**: 博客包含视频内容，需要懒加载优化性能和刷新机制
- **实现**: 
  - 添加 `lazy-video-refresh.js` 和 `lazy-video-refresh.css`
  - 使用 IntersectionObserver 实现懒加载
  - 视频加载失败时显示"重新加载"按钮
  - 5秒冷却时间防止恶意连点
  - 支持目录跳转后检测和滚动检测

### 2026-02-04: 修复图床图片 WebP 转换问题
- **问题**: bu.dusays.com 和 raw.githubusercontent.com 图片被错误转换为 WebP
- **修复**:
  - 恢复 107 张 bu.dusays.com 图片为原始格式（PNG/JPG）
  - 恢复 7 张 raw.githubusercontent.com 图片为 PNG
  - 更新 `update-markdown-images.ps1` 添加排除规则
- **新增脚本**:
  - `tools/restore-budusays-simple.ps1`
  - `tools/restore-github-simple.ps1`

---

## 常见问题与解决方案

### Q1: 图片显示 502 错误
**解决方案**:
1. 等待自动检测，刷新按钮会自动出现
2. 点击刷新按钮手动重新加载
3. 或在控制台执行 `window.lazyImageRefresh.refreshAll()`

### Q2: 外部图床图片被错误转换为 WebP
**解决方案**:
1. 运行对应的恢复脚本
2. 检查 `update-markdown-images.ps1` 的排除规则是否包含该域名

### Q3: 懒加载不工作
**检查项**:
1. 确认在文章页面（有 `#post` 或 `#article-container`）
2. 检查控制台是否有错误
3. 确认图片有 `lazy-image` 或 `lazy-placeholder` 类

---

## 待办事项

- [ ] 考虑为所有外部图床图片添加刷新按钮支持
- [ ] 优化懒加载首次加载体验
- [ ] 评估是否需要 Service Worker 缓存

---

## 相关链接

- **Butterfly 主题文档**: https://butterfly.js.org/
- **Hexo 官方文档**: https://hexo.io/
- **bu.dusays.com 图床**: https://bu.dusays.com/

---

*最后更新: 2026-02-04*
