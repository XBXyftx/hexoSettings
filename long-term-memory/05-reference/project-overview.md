# 项目结构详解 — XBXyftx Hexo 博客

> **当前事实基线（2026-07-10）**：本文文件树中的文章数、媒体、资源注入和部分旧懒加载名称可能随内容演进；运行时性能与资源加载的权威现状见 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md)。

## 1. 完整文件树

```
d:\hexo\hexoSettings/
├── _config.yml                          # Hexo 主配置
├── _config.butterfly.yml                # Butterfly 主题配置（核心）
├── _config.butterfly.optimized.yml      # 主题配置备份/优化版
├── _config.landscape.yml                # Landscape 主题配置（未使用）
├── package.json                         # npm 依赖和 scripts
├── package-lock.json                    # npm 锁定文件
├── CLAUDE.md                            # Claude Code 项目说明
├── AGENTS.md                            # Agent 配置
├── db.json                              # Hexo 数据库/缓存
├── .gitignore                           # Git 忽略规则
├── 部署.txt                              # 部署备忘（中文）
├── cjlintignore.cfg                     # 代码检查配置
│
├── scaffolds/                           # Hexo 文章/页面模板
│   ├── post.md
│   ├── page.md
│   └── draft.md
│
├── scripts/                             # 自定义 Hexo 脚本
│   ├── auto-image-list.js               # 轮播图自动生成
│   ├── private-posts-scanner.js         # 隐私文章扫描
│   ├── image-dimensions.js              # 图片尺寸注入
│   ├── birthday-gift-scanner.js         # 生日页面事件扫描
│   └── math-protect.js                  # KaTeX 公式保护
│
├── source/                              # 博客内容源
│   ├── _posts/                          # 当前文章源（数量以工作树扫描为准）
│   │   ├── [文章名].md                   # 文章正文
│   │   └── [文章名]/                     # 文章 asset 文件夹（图片等）
│   │
│   ├── _data/
│   │   └── link.yml                     # 友情链接配置
│   │
│   ├── about/                           # 关于页面
│   │   ├── index.html                   # 自定义 HTML 关于页
│   │   ├── index/                       # 关于页图片资源（40+张）
│   │   ├── lazy-loading-about.js
│   │   └── wechat.webp
│   │
│   ├── categories/
│   │   └── index.md                     # 分类索引页
│   │
│   ├── tags/
│   │   └── index.md                     # 标签索引页
│   │
│   ├── comments/
│   │   └── index.md                     # 留言板页面
│   │
│   ├── link/
│   │   └── index.md                     # 友链页面
│   │
│   ├── coffer/                          # 【自定义】隐私文章系统
│   │   ├── README.md                    # 隐私系统说明
│   │   ├── USAGE.md                     # 使用说明
│   │   ├── index.html                   # 隐私入口页面
│   │   ├── private-posts.json           # 自动生成的索引
│   │   └── private-posts/               # 隐私文章目录
│   │       ├── HarmonyGuide.md
│   │       └── my-first-private-post.md
│   │
│   ├── swiper/                          # 【自定义】轮播图系统
│   │   ├── README.md
│   │   ├── images.json                  # 手动维护索引
│   │   ├── images-auto.json             # 自动生成索引
│   │   └── images/                      # 轮播图图片（200+张 webp）
│   │
│   ├── LianlianKan/                     # 【自定义】连连看游戏
│   │   ├── index.md
│   │   └── imgs/                        # 游戏素材图片
│   │
│   ├── MarkdownPreview/                 # 【自定义】Markdown 编辑器
│   │   ├── index.md                     # 主页面
│   │   ├── index-backup.md
│   │   ├── index-backup-original.md
│   │   ├── cdn-alternatives.md
│   │   └── marked.min.js                # Markdown 解析器
│   │
│   ├── css/                             # 【自定义】自定义样式表
│   │   ├── lazy-loading-stable.css
│   │   ├── lazy-loading.css
│   │   └── vscode-breadcrumb-toc.css
│   │
│   ├── js/                              # 【自定义】自定义脚本
│   │   ├── coffer.js                    # 隐私文章逻辑
│   │   ├── birthday-gift.js             # 生日页面交互
│   │   ├── typed.umd.js                 # Typed.js 打字机库
│   │   ├── vscode-breadcrumb-toc.js     # VS Code 面包屑导航
│   │   └── katex/                       # KaTeX 0.16.19 完整库（303KB）
│   │
│   └── imgs/                            # 图片资源
│       ├── ArticleTopImgs/              # 文章封面图（50+张 webp）
│       ├── cofferTopImg/                # 隐私文章封面图
│       ├── gifs/                        # 动态图
│       └── [各种头像和装饰图片]
│
├── themes/
│   └── butterfly/                       # Butterfly 主题（大量修改）
│       ├── _config.yml                  # 主题默认配置（禁止修改）
│       ├── package.json
│       ├── plugins.yml
│       ├── README.md / README_CN.md
│       ├── LICENSE
│       │
│       ├── languages/                   # 多语言文件
│       ├── layout/                      # Pug 模板（128个文件，8个被修改）
│       │   ├── includes/
│       │   │   ├── layout.pug           # 【修改】添加入场弹窗 HTML
│       │   │   ├── head.pug             # 【修改】添加自定义 CSS/JS 链接
│       │   │   ├── additional-js.pug    # 【修改】添加自定义 JS 加载
│       │   │   ├── footer.pug           # 【修改】添加建站时间统计
│       │   │   ├── mixins/indexPostUI.pug  # 【修改】瀑布流布局 8
│       │   │   ├── head/config_site.pug    # 【修改】暴露 typewriter 字段
│       │   │   └── ...
│       │   ├── index.pug                # 【修改】瀑布流 masonry 类
│       │   └── ...
│       │
│       ├── scripts/                     # 主题内部脚本
│       └── source/                      # 主题静态资源（大量自定义 CSS/JS）
│           ├── css/                     # 主题样式 + 大量自定义 CSS
│           └── js/                      # 主题脚本 + 大量自定义 JS
│
└── long-term-memory/                    # 【本次新增】长期记忆目录
    ├── MEMORY.md
    ├── 00-index/
    ├── 01-onboarding/
    ├── 02-requirements/
    ├── 03-api-practices/
    ├── 04-operations/
    ├── 05-reference/
    ├── 06-theme-modifications/
    └── 07-known-issues/
```

---

## 2. 部署配置

### 双目标部署

| 目标 | Git 仓库 | 分支 | 用途 |
|------|---------|------|------|
| GitHub Pages | `git@github.com:XBXyftx/XBXyftx.github.io.git` | main | 主要访问入口，全球 CDN |
| 私有服务器 | `git@113.47.8.204:/home/git/blog.git` | main | 备用访问，国内加速 |

### _config.yml 中的 deploy 配置

```yaml
deploy:
  type: git
  repo:
    github: git@github.com:XBXyftx/XBXyftx.github.io.git,main
    server: git@113.47.8.204:/home/git/blog.git,main
```

### 部署验证清单

每次部署后必须验证：
- [ ] GitHub Pages 访问正常（https://xbxyftx.top）
- [ ] 私有服务器访问正常
- [ ] 最新文章已同步
- [ ] 轮播图正常显示
- [ ] 隐私文章入口可访问
- [ ] 评论系统加载正常

---

## 3. 依赖清单

### 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| hexo | ^7.3.0 | 静态站点生成器 |
| hexo-asset-image | github 版 | 文章内图片处理 |
| hexo-deployer-git | ^4.0.0 | Git 部署 |
| hexo-renderer-kramed | ^0.1.4 | Markdown 渲染 |
| hexo-renderer-pug | ^3.0.0 | Pug 模板渲染 |
| hexo-renderer-stylus | ^3.0.1 | Stylus 样式渲染 |

### 主题增强插件

| 包名 | 版本 | 用途 |
|------|------|------|
| hexo-butterfly-envelope | ^1.0.15 | 信封评论样式 |
| hexo-butterfly-extjs | ^1.4.18 | 主题扩展 JS |
| hexo-butterfly-swiper | ^1.0.12 | 轮播图 |
| hexo-butterfly-tag-plugins-plus | ^1.0.18 | 增强标签插件 |
| hexo-filter-gitcalendar | ^1.0.11 | GitHub 贡献日历 |
| hexo-filter-mermaid-diagrams | ^1.0.5 | Mermaid 图表构建期插件；站内当前无 Mermaid 内容，P2 已关闭前端 Mermaid，新增图表前需恢复固定版本的按需加载链 |
| hexo-generator-index-pin-top | ^0.2.2 | 文章置顶 |
| hexo-wordcount | ^6.0.1 | 字数统计 |

### 其他工具

| 包名 | 版本 | 用途 |
|------|------|------|
| hexo-filter-webp | — | WebP 图片转换 |
| image-size | ^2.0.2 | 获取图片尺寸 |
| vanilla-lazyload | ^19.1.3 | 依赖仍安装，但主题原生 `lazyload.enable` 当前关闭；不应据此推断它在生产页加载 |

---

## 4. npm Scripts

| 命令 | 实际执行 | 用途 |
|------|---------|------|
| `npm run dev` | `webp && clean && server` | 开发模式 |
| `npm run build` | `hexo generate` | 生成静态文件 |
| `npm run clean` | `hexo clean` | 清理缓存 |
| `npm run deploy` | `hexo deploy` | 部署到双目标 |
| `npm run pub` | `opt && deploy` | 完整发布流程 |
| `npm run opt` | `webp && clean && build` | 优化构建（不部署） |
| `npm run webp` | `dispatch-webp.js` 自动调度 | 批量转 webp + 更新引用（[详细文档](../03-api-practices/webp-conversion.md)） |
| `npm run server` | `hexo server` | 仅启动本地服务器 |
