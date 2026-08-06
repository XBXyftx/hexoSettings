# 自定义功能完整清单

> **当前事实基线（2026-07-10）**：本文原先包含若干已删除脚本和旧加载位置。现存功能与运行时性能风险以 [2026-07-10 渲染性能与长期记忆事实审计](../05-performance-audit/2026-07-10-render-performance-audit/README.md) 为准；历史名称只在需要追溯旧提交时参考。

本项目在标准 Hexo + Butterfly 基础上，拥有大量自定义功能。本文档是所有自定义功能的权威参考。

---

## 一、自定义 Hexo 脚本（scripts/）

### 1. auto-image-list.js

| 项 | 值 |
|---|---|
| **作用** | 自动扫描 `source/swiper/images/` 生成轮播图索引 |
| **输出** | `source/swiper/images-auto.json` |
| **触发** | Hexo `generate` 阶段 |
| **支持格式** | jpg, jpeg, png, gif, webp, bmp, svg |
| **依赖** | Node.js fs, path |

**工作原理**：
1. 扫描 `source/swiper/images/` 目录
2. 读取每张图片的 EXIF 信息或文件名提取日期
3. 生成包含 title、path、date 的 JSON 数组
4. 写入 `images-auto.json`

**使用方式**：将新图片放入 `source/swiper/images/`，运行 `hexo generate` 时自动生成索引。

---

### 2. private-posts-scanner.js

| 项 | 值 |
|---|---|
| **作用** | 扫描隐私文章目录，生成索引文件 |
| **输出** | `source/coffer/private-posts.json` |
| **触发** | Hexo `before_generate` 阶段 |
| **优化** | MD5 哈希检测，避免不必要的重新扫描 |
| **依赖** | crypto (MD5), fs, path |

**解析字段**：title, date, tags, categories, description, cover

**额外计算**：
- 中文字数统计
- 英文单词数统计
- 自动摘要（前 N 字符）
- 最后修改时间

**使用方式**：将隐私文章放入 `source/coffer/private-posts/`，生成时自动更新索引。

---

### 3. image-dimensions.js

| 项 | 值 |
|---|---|
| **作用** | 为 `<img>` 标签注入 width/height，防止 CLS |
| **触发** | `after_render:html`，priority 100 |
| **依赖** | image-size 包 |

**排除项**：Logo、公告GIF、背景图、封面图、友链头像

**路径解析顺序**：source_dir → public_dir → theme_source → post_asset_folder

---

## 二、自定义页面

### 1. 隐私文章系统（coffer/）

| 项 | 值 |
|---|---|
| **入口** | `/coffer/` |
| **文章目录** | `source/coffer/private-posts/` |
| **索引文件** | `source/coffer/private-posts.json`（自动生成） |
| **前端逻辑** | `source/js/coffer.js` |
| **保护方式** | 前端密码验证（JavaScript） |

**文件结构**：
```
coffer/
├── README.md              # 系统说明
├── USAGE.md               # 使用指南
├── index.html             # 入口页面（密码输入）
├── private-posts.json     # 自动生成的索引
└── private-posts/         # 隐私文章
    ├── HarmonyGuide.md
    └── my-first-private-post.md
```

**限制**：当前仅前端密码验证，敏感内容不应仅依赖此系统保护。

---

### 2. 轮播图系统（swiper/）

| 项 | 值 |
|---|---|
| **入口** | `/swiper/` |
| **图片目录** | `source/swiper/images/` |
| **索引文件** | `source/swiper/images.json` + `images-auto.json` |
| **依赖插件** | hexo-butterfly-swiper |

**文件结构**：
```
swiper/
├── README.md
├── images.json            # 手动维护的索引
├── images-auto.json       # 自动生成的索引
├── index.md               # 轮播图页面
└── images/                # 200+ 张 webp 图片
```

**注意**：`images-auto.json` 由 `scripts/auto-image-list.js` 自动生成，不应手动编辑。

---

### 3. 连连看游戏（LianlianKan/）

| 项 | 值 |
|---|---|
| **入口** | `/LianlianKan/` |
| **类型** | 独立小游戏页面 |
| **技术** | 纯前端 JavaScript |

**文件**：`index.md`（包含游戏逻辑）+ `imgs/`（8 张游戏素材）

---

### 4. Markdown 在线编辑器（MarkdownPreview/）

| 项 | 值 |
|---|---|
| **入口** | `/MarkdownPreview/` |
| **类型** | 在线工具页面 |
| **技术** | marked.js + 自定义样式 |

**文件**：`index.md`（主页面）+ `marked.min.js`（解析器）+ 备份文件

---

### 5. 自定义关于页面（about/）

| 项 | 值 |
|---|---|
| **入口** | `/about/` |
| **类型** | 完全自定义 HTML 页面 |
| **特点** | 非 Markdown，直接写 HTML |

**文件**：`index.html`（45KB 自定义 HTML）+ `index/`（40+ 张图片）+ `lazy-loading-about.js`

---

### 6. 生日礼物时间轴页面（birthday-gift/）

| 项 | 值 |
|---|---|
| **入口** | `/birthday-gift/` |
| **类型** | 完全独立页面（`layout: false`） |
| **特点** | 送给妈妈的生日礼物；用成长事件整屏切换呈现“我的成长与感谢” |

**当前实现入口**：[`02-custom-pages/birthday-gift-timeline.md`](../02-custom-pages/birthday-gift-timeline.md)

**核心文件**：

- `source/birthday-gift/index.html` — 独立页面、顶部“给妈妈的生日礼物”标题、内联 CSS、弹层 DOM
- `source/js/birthday-gift.js` — 整屏滚动、文字块独立滚动、相册/图片/视频弹层、流星 Canvas
- `scripts/birthday-gift-scanner.js` — 扫描事件目录并生成 `events-data.json`
- `source/birthday-gift/events/` — 每个子目录是一条成长事件
- `source/birthday-gift/README.md` — 作者新增事件/放图指南

**主题隔离策略**：

- `layout: false` 跳过 Butterfly 主题 layout 包装
- 页面样式自包含，不依赖主题类名或全局 CSS
- 全局图片尺寸/懒加载注入对生日页做隔离，避免干扰自定义懒加载
- 事件数据由 Hexo 扫描器生成，正常新增事件不需要改 HTML/JS

**当前交互能力**：

- 鼠标滚轮、键盘、触摸切换整屏事件
- 长文案可在文字块内部滚动，不抢整屏切换
- 普通图片（如 `01.jpg`）可直接被识别为相册媒体
- 无媒体事件使用流星/抽象视觉替代空相册
- 顶部标题明确页面是“给妈妈的生日礼物”

---

## 三、自定义 CSS（source/css/ + themes/butterfly/source/css/）

### source/css/ 中的自定义样式

| 文件 | 作用 | 加载位置 |
|------|------|---------|
| `lazy-loading-stable.css` | 历史防 CLS 样式文件 | 当前不加载；内在尺寸由 HTML `width`/`height` 属性保留 |
| `lazy-loading.css` | 历史基础占位样式文件 | 当前不加载；不得恢复全文高代价 placeholder 动画 |
| `vscode-breadcrumb-toc.css` | VS Code 面包屑导航样式 | head.pug（仅文章页） |
| `toc-toggle-group.css` | 文章目录 hideToggle 折叠项样式 | head.pug（仅文章页） |

### themes/butterfly/source/css/ 中的自定义样式

| 文件 | 作用 | 加载位置 |
|------|------|---------|
| `universe.css` | 星空背景 canvas 样式 | inject head |
| `entrance-popup.css` | 入场弹窗样式 | `head.pug` 全站 |
| `lazy-loading-optimized.css` | 文章图片原生 lazy 协调器的静态/近视口占位状态 | `head.pug`（仅文章页） |
| `readmode-enhanced.css` | 阅读模式增强 | inject head |
| `rightmenu.css` | 自定义右键菜单 | inject head |
| `styles.css` | 通用自定义样式 | inject head |
| `transpancy.css` | 透明效果 | inject head |
| `twikoo.css` | Twikoo 评论样式 | inject head |
| `typewriter-effect.css` | 打字机效果 | head.pug（仅文章页） |
| `center-atom.css` | 中心原子动画 | — |
| `swiper.css` | 轮播图样式 | — |
| `_page/waterfall-homepage.styl` | 瀑布流布局 | — |

---

## 四、自定义 JS（source/js/ + themes/butterfly/source/js/）

### source/js/ 中的自定义脚本

| 文件 | 作用 | 大小 |
|------|------|------|
| `coffer.js` | 隐私文章系统前端逻辑 | ~10KB |
| `birthday-gift.js` | 生日页面交互逻辑 | ~30KB |
| `typed.umd.js` | Typed.js 打字机库 | ~10KB |
| `vscode-breadcrumb-toc.js` | VS Code 面包屑导航 | ~8KB |
| `toc-toggle-group.js` | 目录 hideToggle 折叠项联动（点击展开内容块、滚动联动、hash 兜底） | ~4KB |
| `katex/` | KaTeX 0.16.19 完整库（含 auto-render） | ~303KB |

### themes/butterfly/source/js/ 中的自定义脚本

| 文件 | 作用 | 加载位置 |
|------|------|---------|
| `universe-optimized.js` | 全屏星空/流星 Canvas 动画 | inject bottom |
| `header-universe.js` | Header 星空 Canvas | `head.pug` 全站 |
| `entrance-popup.js` | 入场弹窗逻辑 | `additional-js.pug` 全站 |
| `entrance-popup-config.js` | 弹窗配置 | `additional-js.pug` 全站 |
| `typewriter-effect.js` | 文章打字机效果 | `additional-js.pug`（仅文章页） |
| `waterfall.js` | 瀑布流 masonry 引擎 | `additional-js.pug`（仅首页；已改为按需响应式布局，无移动端 100ms 轮询/调试监听） |
| `lazy-loading-optimized.js` | 文章原生 lazy 协调、近视口占位和目录重锚定用媒体结算事件 | inject bottom |
| `happy-title.js` | 标签页标题特效 | inject bottom |
| `rightmenu.js` | 自定义右键菜单 | inject bottom |
| `lightbox-enhanced.js` | 灯箱增强 | inject bottom |
| `preloader-optimized.js` | 预加载优化 | 文件存在；当前加载路径需以产物验证 |
| `cache-manager.js` | 缓存管理（已禁用） | 不加载 |
| `nyan.js` | Nyan cat 动画 | 不加载 |
| `router.js` | 路由逻辑 | 不加载 |
| `tw_cn.js` | 简繁转换 | 主题按配置决定 |
| `twikoo.js` | Twikoo 本地运行时（约 938KB） | 评论容器进入视口后动态加载 |

---

## 五、主题级功能增强

### 1. 瀑布流布局（Layout 8）

| 项 | 值 |
|---|---|
| **配置项** | `index_layout: 8` |
| **实现文件** | `indexPostUI.pug` + `index.pug` + `waterfall.js` + `waterfall-homepage.styl` |
| **说明** | 首页文章卡片以瀑布流/masonry 方式排列，非 Butterfly 原生支持；移动端当前通过 CSS 单列，但脚本仍保留高频“保护/调试”逻辑，见 2026-07-10 审计 P0 |

### 2. 打字机效果

| 项 | 值 |
|---|---|
| **触发条件** | 文章 front matter 中有 `typewriter` 字段 |
| **实现文件** | `typewriter-effect.js` + `typewriter-effect.css` |
| **数据传递** | `config_site.pug` 将 `page.typewriter` 暴露到 `GLOBAL_CONFIG_SITE` |
| **效果** | 文章副标题逐字打出动画 |

### 3. VS Code 面包屑导航

| 项 | 值 |
|---|---|
| **适用页面** | 仅文章页面 |
| **实现文件** | `vscode-breadcrumb-toc.js` + `vscode-breadcrumb-toc.css` |
| **效果** | 文章顶部显示当前阅读位置，类似 VS Code 的面包屑导航 |

### 4. 星空背景

| 项 | 值 |
|---|---|
| **实现文件** | `universe-optimized.js` + `header-universe.js` + `universe.css` + `<canvas id="universe">` |
| **加载位置** | 全屏 canvas/JS 由 inject bottom 注入；header Canvas 脚本由 `head.pug` 全站加载 |
| **效果** | 全站星空背景叠加页头星空，两个独立 30fps Canvas 在前台同时运行；隐藏标签页会暂停 |

### 5. 入场弹窗

| 项 | 值 |
|---|---|
| **实现文件** | `entrance-popup.js` + `entrance-popup.css` + `layout.pug` 中的 HTML |
| **加载位置** | `layout.pug` 硬编码 HTML 结构，JS/CSS 通过 head.pug 加载 |
| **效果** | 首次访问时显示欢迎弹窗 |

### 6. 建站时间统计

| 项 | 值 |
|---|---|
| **建站时间** | 2024-04-25 18:30 |
| **实现位置** | `footer.pug` 中的内联 JavaScript |
| **效果** | footer 显示已运行天数/小时/分钟/秒 |

### 7. 自定义右键菜单

| 项 | 值 |
|---|---|
| **实现文件** | `rightmenu.js` + `rightmenu.css` |
| **加载位置** | inject bottom |
| **效果** | 替换浏览器默认右键菜单 |

### 8. 自定义懒加载系统

| 项 | 值 |
|---|---|
| **说明** | 主题内置 `lazyload.enable` 当前关闭。文章采用浏览器原生 `loading="lazy"`，由 `lazy-loading-optimized.js` 仅跟踪近视口媒体结算和 placeholder 状态；目录跳转在晚到媒体结算后有限重锚定。about 有独立 `lazy-loading-about.js`；旧 `lazy-loading.js`、native、刷新脚本已物理删除。 |
| **当前注意** | 本地图片有 build-time `width`/`height`，外部图片和 data URI 没有可信可自动写入的尺寸；目录最终定位已校正，普通阅读 CLS 仍需可信原图尺寸/备份才能进一步收敛。 |

### 9. 预加载动画

| 项 | 值 |
|---|---|
| **样式** | spincat |
| **实现文件** | `preloader-optimized.js` |
| **主题配置** | `preloader.enable: true`, `load_style: spincat` |

---

## 六、功能依赖关系图

```
Hexo 生成流程
├── auto-image-list.js ──→ swiper/images-auto.json
├── private-posts-scanner.js ──→ coffer/private-posts.json
└── image-dimensions.js ──→ 为所有 <img> 注入尺寸

页面渲染
├── layout.pug ──→ 入场弹窗 HTML 结构
├── head.pug ──→ 自定义 CSS/JS 链接 + header-universe.js
├── additional-js.pug ──→ 条件加载（首页/文章页）的 JS
├── footer.pug ──→ 建站时间统计
└── config_site.pug ──→ 暴露 typewriter 到全局配置

浏览器端
├── universe-optimized.js ──→ 星空背景
├── typewriter-effect.js ──→ 打字机效果（依赖 GLOBAL_CONFIG_SITE.typewriter）
├── waterfall.js ──→ 瀑布流布局（仅首页）
├── vscode-breadcrumb-toc.js ──→ 面包屑导航（仅文章页）
├── toc-toggle-group.js ──→ 目录 hideToggle 折叠项联动（仅文章页）
├── coffer.js ──→ 隐私文章密码验证
├── entrance-popup.js ──→ 入场弹窗
├── rightmenu.js ──→ 自定义右键菜单
└── lazy-loading*.js ──→ 图片/视频懒加载
```
