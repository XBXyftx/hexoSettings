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
- `tools/update-markdown-images.ps1` - Markdown 和配置文件图片引用更新脚本
- `tools/convert-to-webp.ps1` - 本地图片 WebP 转换脚本

#### 1.2 本地图片处理
- 本地图片（`source/img`, `source/imgs` 等目录）会自动转换为 WebP
- 转换工具: `cwebp` (静态图), `gif2webp` (动态图)
- 质量设置: 75

#### 1.3 图片尺寸处理（2026-02-22 新增）
- **文件**: `scripts/image-dimensions.js`
- **功能**: Hexo 生成阶段自动获取图片尺寸并添加 `width`/`height` 属性
- **目的**: 解决懒加载导致的布局偏移（CLS）问题
- **缓存**: 使用内存缓存避免重复读取文件

---

### 2. 懒加载系统

#### 2.1 核心文件
- `source/js/lazy-loading.js` - 基础懒加载逻辑（兼容旧版）
- `source/js/lazy-loading-native.js` - 原生懒加载优化版（推荐）
- `source/js/lazy-loading-optimized.js` - IntersectionObserver 优化版
- `source/css/lazy-loading.css` - 占位符样式
- `source/css/lazy-loading-stable.css` - 稳定的懒加载样式（解决布局偏移）

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

#### 2.4 目录跳转优化（2026-02-22 新增）
- **问题**: 点击目录跳转时，滚动过程中图片加载导致页面高度变化，跳转位置偏移
- **解决方案**:
  1. **图片尺寸插件**: 为所有图片添加 `width`/`height` 属性，浏览器可预留正确空间
  2. **原生懒加载**: 使用 `loading="lazy"` 替代自定义懒加载，减少布局偏移
  3. **预加载机制**: 目录跳转前预加载目标区域图片
- **实现文件**: 
  - `scripts/image-dimensions.js` - Hexo 插件，生成时添加图片尺寸
  - `source/js/lazy-loading-native.js` - 原生懒加载 + 预加载支持
  - `themes/butterfly/source/js/main.js` - 目录跳转逻辑优化
- **排除规则**: 头像、公告栏等关键图片不添加懒加载，避免首屏闪烁

#### 2.5 PJAX 支持
所有懒加载脚本都支持 PJAX 无刷新加载：
```javascript
document.addEventListener('pjax:complete', init);
```

---

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
scripts/              # Hexo 插件脚本
```

---

### 4. WebP 转换工作流

#### 4.1 本地图片转换流程
1. 运行 `tools/convert-to-webp.ps1`
2. 扫描 `source/img`, `source/imgs`, `themes/butterfly/source/img` 等目录
3. 将 PNG/JPG/GIF 转换为 WebP
4. **转换成功后自动删除原图**

#### 4.2 Markdown 引用更新流程
1. 运行 `tools/update-markdown-images.ps1`
2. 扫描所有 `.md` 文件和配置文件（`_config.butterfly.yml`, `_config.yml`）
3. 更新图片引用为 `.webp`（**排除外部图床白名单**）
4. 支持格式：
   - Front-matter: `cover: path.webp`
   - Markdown: `![alt](path.webp)`
   - HTML: `<img src="path.webp">`
   - 配置: `img: /img/logo.webp`, `favicon: /img/logo.webp`

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

---

### 5. 主题自定义

#### 5.1 Butterfly 主题修改位置
- `themes/butterfly/layout/` - 布局模板（pug）
- `themes/butterfly/source/js/` - 主题 JavaScript
- `themes/butterfly/source/css/` - 主题样式

#### 5.2 自定义注入点
- `themes/butterfly/layout/includes/head.pug` - 头部 CSS/JS
- `themes/butterfly/layout/includes/additional-js.pug` - 底部 JS

#### 5.3 目录跳转相关修改（2026-02-22）
- **文件**: `themes/butterfly/source/js/main.js`
- **修改**: `tocItemClickFn` 函数，添加预加载和位置修正逻辑
- **依赖**: `window.lazyLoadPreload()` 函数（来自 `lazy-loading-native.js`）

#### 5.4 智能文档导航栏（2026-03-02）
- **文件**: `source/js/vscode-breadcrumb-toc.js`, `source/css/vscode-breadcrumb-toc.css`
- **功能**: VS Code 风格的面包屑导航，显示当前章节层级
- **注入点**: 主题模板 `head.pug` 和 `additional-js.pug` 条件加载（仅文章页）

---

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

### 2026-03-02: VS Code 风格智能文档导航栏
- **新增**: 智能文档导航栏（VS Code Breadcrumb 风格）
- **功能**:
  - 显示当前章节标题和父级标题（层级关系）
  - 阅读进度条（底部蓝色细线）
  - 返回顶部按钮
  - 点击标题可跳转对应章节
- **显示逻辑**:
  - 页面在顶部（滚动 < 100px）：隐藏
  - 向下滚动（滚动 ≥ 100px）：显示，固定在原生导航栏下方
  - 原生导航栏收起（`nav-visible` 类移除）：一起隐藏
- **实现文件**:
  - `source/js/vscode-breadcrumb-toc.js` - 核心逻辑
  - `source/css/vscode-breadcrumb-toc.css` - 样式（深色/浅色主题适配）
- **主题适配**: 支持深色/浅色主题自动切换，支持 `data-theme` 属性覆盖

---

### 2026-02-22: 图片懒加载布局偏移修复
- **问题**: 点击目录跳转时，滚动过程中图片加载导致页面高度变化，最终位置偏移，需要反复点击才能正确定位
- **根本原因**: 懒加载占位符固定高度（150px/200px）与实际图片高度不一致，图片加载后造成布局偏移（CLS）
- **解决方案**:
  1. **Hexo 图片尺寸插件** (`scripts/image-dimensions.js`): 生成阶段获取图片真实尺寸，添加 `width`/`height` 属性
  2. **原生懒加载** (`source/js/lazy-loading-native.js`): 使用浏览器原生 `loading="lazy"`，配合尺寸属性预留空间
  3. **目录跳转预加载** (`main.js`): 点击目录时预加载目标区域图片，等待加载完成后再跳转
  4. **稳定 CSS** (`source/css/lazy-loading-stable.css`): 使用 `aspect-ratio` 保持图片比例，添加 `scroll-margin-top` 优化锚点跳转
- **排除规则**: 头像（`alt="avatar"`）、公告栏（`class="announcementImg"`）等首屏关键图片不添加懒加载

### 2026-02-22: 配置文件 WebP 转换支持
- **更新**: `tools/update-markdown-images.ps1`
- **变更**:
  - 新增对 `_config.butterfly.yml` 和 `_config.yml` 的处理
  - 支持转换的配置项: `img`, `favicon`, `default_top_img`, `index_img`, `archive_img`, `tag_img`, `category_img`, `footer_img`, `background`, `logo`, `error_img.flink`, `error_img.post_page`
  - 保持外部图床白名单排除规则

### 2026-02-22: WebP 转换脚本增强
- **更新**: `tools/convert-to-webp.ps1`
- **变更**:
  - 转换成功后**自动删除原图**（PNG/JPG/GIF）
  - 处理已存在 WebP 的对应原图（直接删除）
  - 添加严格的转换验证（检查 `$LASTEXITCODE` 和文件大小）
  - WebP 损坏时自动重新转换
- **安全机制**:
  - 验证 WebP 文件有效（存在且非空）后才删除原图
  - 转换失败时保留原图

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
3. 确认图片有 `loading="lazy"` 属性

### Q4: 目录跳转位置偏移
**解决方案**:
1. 确认已运行 `hexo clean && hexo generate` 重新生成
2. 检查图片尺寸插件是否正常工作（查看生成日志中的 `[Image Dimensions]` 输出）
3. 确认浏览器支持原生懒加载（Chrome 76+, Firefox 75+, Safari 15.4+）

---

## 待办事项

- [ ] 考虑为所有外部图床图片添加刷新按钮支持
- [ ] 优化懒加载首次加载体验
- [ ] 评估是否需要 Service Worker 缓存
- [ ] 监控图片尺寸插件对生成时间的影响

---

## 相关链接

- **Butterfly 主题文档**: https://butterfly.js.org/
- **Hexo 官方文档**: https://hexo.io/
- **bu.dusays.com 图床**: https://bu.dusays.com/

---

*最后更新: 2026-02-22*
