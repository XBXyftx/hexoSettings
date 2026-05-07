# 00-index — 导航速查

本目录是长期记忆的"接待区"，存放全局导航和快速定位信息。

---

## 子目录速查表

| 目录 | 内容 | 何时查阅 |
|------|------|---------|
| [`01-onboarding/`](../01-onboarding/) | 项目交接文档，新 AI 实例的第一站 | 每次新会话开始时 |
| [`02-requirements/`](../02-requirements/) | 内容规范、命名规则、front matter 要求 | 创建/修改文章前 |
| [`03-api-practices/`](../03-api-practices/) | Hexo API、主题配置、自定义脚本使用规则 | 修改技术实现前 |
| [`04-operations/`](../04-operations/) | 操作日志，记录每次实质性修改 | 上下文压缩后恢复时 |
| [`05-reference/`](../05-reference/) | 项目结构说明、部署配置、自定义功能清单 | 需要全局视角时 |
| [`06-theme-modifications/`](../06-theme-modifications/) | 主题文件修改跟踪 | 修改主题文件前 |
| [`07-known-issues/`](../07-known-issues/) | 已知问题和待修复项 | 遇到异常时 |

---

## 关键文件定位

### 配置文件

| 文件 | 路径 | 作用 |
|------|------|------|
| Hexo 主配置 | `/_config.yml` | 站点信息、URL、部署目标、插件 |
| 主题配置 | `/_config.butterfly.yml` | Butterfly 主题全部自定义设置 |
| 主题原始配置 | `/themes/butterfly/_config.yml` | 主题默认值（**禁止直接修改**） |
| 包依赖 | `/package.json` | npm 依赖和 scripts |

### 自定义脚本

| 脚本 | 路径 | 作用 |
|------|------|------|
| 自动图片列表 | `/scripts/auto-image-list.js` | 扫描 `source/swiper/images/` 生成轮播图索引 |
| 隐私文章扫描 | `/scripts/private-posts-scanner.js` | 扫描 `source/coffer/private-posts/` 生成索引（MD5优化） |
| 图片尺寸注入 | `/scripts/image-dimensions.js` | 为 `<img>` 标签注入 width/height 防布局抖动 |

### 自定义页面

| 页面 | 路径 | 类型 |
|------|------|------|
| 隐私文章入口 | `/source/coffer/` | 自定义受保护内容区 |
| 轮播图页面 | `/source/swiper/` | 自定义图片画廊 |
| 连连看游戏 | `/source/LianlianKan/` | 自定义小游戏页面 |
| Markdown 编辑器 | `/source/MarkdownPreview/` | 自定义在线工具 |
| 关于页面 | `/source/about/` | 自定义 HTML 关于页 |
| 生日礼物时间轴 | `/source/birthday-gift/` | 独立页面，给妈妈的生日礼物，事件驱动成长时间轴 |

---

## 快速决策树

```
你要做什么？
├── 新建/修改文章
│   └── 先读 02-requirements/ 的规范
│   └── 再读 03-api-practices/ 的 front matter 规则
├── 修改主题外观或功能
│   └── 先读 06-theme-modifications/ 的历史记录
│   └── 再读 03-api-practices/ 的技术约束
│   └── 修改后在 06-theme-modifications/ 记录
├── 修改自定义脚本
│   └── 先读 03-api-practices/ 的脚本说明
│   └── 再读 05-reference/ 的自定义功能清单
├── 修改生日礼物时间轴
│   └── 页面/交互先读 02-custom-pages/birthday-gift-timeline.md
│   └── 事件文案/图片先读 source/birthday-gift/README.md
│   └── 改完记录到 04-operations/operation-log.md
├── 部署或构建
│   └── 先读 05-reference/ 的部署配置
│   └── 执行后在 04-operations/ 记录
├── 遇到异常/报错
│   └── 先读 07-known-issues/ 看是否已知
│   └── 未记录则排查后在 07-known-issues/ 新增
└── 上下文压缩后恢复
    └── 读 04-operations/ 的最后几条记录
    └── 再读 01-onboarding/ 的项目概览
```
