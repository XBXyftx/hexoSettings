---
name: Q8 — elemecdn @latest 锁版本(B14)
description: _config.butterfly.yml 中所有 elemecdn 资源使用 @latest 或无版本标签,上游更新可能引入 breaking change
type: project
---

# Q8 — elemecdn CDN 资源版本锁定(B14)

> **状态**: 🔍 深度调研完成,准备执行
> **关联**: [../../../07-known-issues/discovered-issues/README.md#-b14-elemecdn-使用-latest-标签](../../../07-known-issues/discovered-issues/README.md)(B14) · [../../../03-api-practices/cdn-strategy.md](../../../03-api-practices/cdn-strategy.md)

---

## L1 · TL;DR

在 `_config.butterfly.yml` 中,将 12 处 elemecdn 资源 URL 从 `@latest`/无版本 改为固定版本号:

| 包名 | 当前写法 | 目标写法 | npm 版本 |
|---|---|---|---|
| hexo-butterfly-tag-plugins-plus | `@latest` | `@1.0.18` | 1.0.18 |
| hexo-butterfly-envelope | 无版本 | `@1.0.15` | 1.0.15 |
| hexo-butterfly-swiper | 无版本 | `@1.0.12` | 1.0.12 |

**改动范围**: 仅 `_config.butterfly.yml` 中的 URL 字符串替换,零代码变更。

---

## L2 · 问题描述

`_config.butterfly.yml` 中有 12 处 elemecdn CDN URL 未锁定版本:

**显式 @latest(4 处,B14)**:
- `:1154` `hexo-butterfly-tag-plugins-plus@latest/lib/assets/font-awesome-animation.min.css`
- `:1157` `hexo-butterfly-tag-plugins-plus@latest/lib/assets/issues.js`
- `:1159` `hexo-butterfly-tag-plugins-plus@latest/lib/assets/carousel-touch.js`
- `:1160` `hexo-butterfly-tag-plugins-plus@latest/lib/tag_plugins.css`

**隐式 latest 无版本(8 处)**:
- `:1224-1227` `hexo-butterfly-envelope/lib/...` (4 张图片)
- `:1276-1279` `hexo-butterfly-swiper/lib/...` (2 CSS + 2 JS)

`@latest` 和无版本都指向 npm 最新版。Akilar(插件作者)发布新版本时,文件路径、API 或行为可能变化,导致站点构建产物异常。

---

## L3 · 深度调研结果

### 3.1 依赖关系全图

```
_config.butterfly.yml ──► hexo.theme.config ──► 插件读取 ──► hexo.extend.injector.register()
     │                                              │
     │ tag_plugins.CDN.anima                        │ tag_plugins: head_end 注入 animaCDN + tag_plugins_css
     │ tag_plugins.CDN.issues                       │ tag_plugins: body_end 注入 issuesCDN (仅 issues: true 时)
     │ tag_plugins.CDN.carousel                     │ tag_plugins: head_end 注入 carouselCDN (仅配置存在时)
     │ tag_plugins.CDN.tag_plugins_css              │
     │                                              │
     │ swiper.swiper_css                            │ swiper: head_end 注入 swiper_css + custom_css
     │ swiper.swiper_js                             │ swiper: body_end 注入 swiper_js + custom_js
     │ swiper.custom_css                            │
     │ swiper.custom_js                             │
     │                                              │
     │ envelope_comment.custom_pic.cover            │ envelope: generator 生成 comments/index.html,
     │ envelope_comment.custom_pic.line             │          图片 URL 写入 HTML src 属性
     │ envelope_comment.custom_pic.beforeimg        │
     │ envelope_comment.custom_pic.afterimg         │
```

**关键发现**:
- 所有 12 个 URL 都在**构建时**被读取,写入生成的静态 HTML
- 运行时浏览器只负责加载这些 URL,不感知版本
- 修改配置中的 URL = 修改生成的 HTML 中的 `src`/`href`

### 3.2 插件源码确认

**hexo-butterfly-tag-plugins-plus (node_modules 本地已安装)**:

```js
// index.js:13-18
animaCDN: config.CDN.anima ? urlFor(config.CDN.anima) : 'https://unpkg.zhimg.com/hexo-butterfly-tag-plugins-plus@latest/...',
issuesCDN: config.CDN.issues ? urlFor(config.CDN.issues) : 'https://unpkg.zhimg.com/hexo-butterfly-tag-plugins-plus@latest/...',
carouselCDN: config.CDN.carousel ? urlFor(config.CDN.carousel) : ...,
tag_plugins_css: config.CDN.tag_plugins_css ? urlFor(config.CDN.tag_plugins_css) : 'https://unpkg.zhimg.com/hexo-butterfly-tag-plugins-plus@latest/...'
```

**hexo-butterfly-swiper (node_modules 本地已安装)**:

```js
// index.js:45-48
swiper_css: config.swiper_css ? urlFor(config.swiper_css) : "https://unpkg.zhimg.com/hexo-butterfly-swiper/lib/swiper.min.css",
swiper_js: config.swiper_js ? urlFor(config.swiper_js) : "https://unpkg.zhimg.com/hexo-butterfly-swiper/lib/swiper.min.js",
custom_css: config.custom_css ? urlFor(config.custom_css) : "https://unpkg.zhimg.com/hexo-butterfly-swiper/lib/swiperstyle.css",
custom_js: config.custom_js ? urlFor(config.custom_js) : "https://unpkg.zhimg.com/hexo-butterfly-swiper/lib/swiper_init.js"
```

**hexo-butterfly-envelope (node_modules 本地已安装)**:

```js
// index.js:14-17
cover: config.custom_pic.cover ? urlFor(config.custom_pic.cover) : "https://unpkg.zhimg.com/hexo-butterfly-envelope/lib/violet.jpg",
line: config.custom_pic.line ? urlFor(config.custom_pic.line) : "https://unpkg.zhimg.com/hexo-butterfly-envelope/lib/line.png",
beforeimg: config.custom_pic.beforeimg ? urlFor(config.custom_pic.beforeimg) : "https://unpkg.zhimg.com/hexo-butterfly-envelope/lib/before.png",
afterimg: config.custom_pic.afterimg ? urlFor(config.custom_pic.afterimg) : "https://unpkg.zhimg.com/hexo-butterfly-envelope/lib/after.png"
```

### 3.3 版本差异确认

| 包名 | npm view 版本 | tarball 验证 | 文件路径确认 |
|---|---|---|---|
| hexo-butterfly-tag-plugins-plus | 1.0.18 | `npm pack` ✅ | `lib/assets/font-awesome-animation.min.css` ✅ |
| | | | `lib/assets/issues.js` ✅ |
| | | | `lib/assets/carousel-touch.js` ✅ |
| | | | `lib/tag_plugins.css` ✅ |
| hexo-butterfly-envelope | 1.0.15 | `npm pack` ✅ | `lib/violet.jpg` ✅ |
| | | | `lib/line.png` ✅ |
| | | | `lib/before.png` ✅ |
| | | | `lib/after.png` ✅ |
| hexo-butterfly-swiper | 1.0.12 | `npm pack` ✅ | `lib/swiper.min.css` ✅ |
| | | | `lib/swiper.min.js` ✅ |
| | | | `lib/swiperstyle.css` ✅ |
| | | | `lib/swiper_init.js` ✅ |

**结论**: `@latest` 当前 = `1.0.18`(tag-plugins-plus), 固定到该版本 = 零行为变化。elemecdn 是 npm 镜像,`@version` 路径必然存在。

### 3.4 `issues: false` 的影响

`_config.butterfly.yml:1150` 设置 `issues: false`。根据插件源码(index.js:38-39):

```js
if (data.issues){
  hexo.extend.injector.register('body_end', js_text, "default");
}
```

`data.issues = false` → `issues.js` 和 `jqueryCDN` **不会被注入**。

因此 `issues` CDN URL 虽在配置中,但已是**死配置**。仍对其加版本锁定,以防未来启用 `issues: true` 时意外加载浮动版本。

### 3.5 修正后潜在崩溃隐患排查

| 隐患 | 评估 | 结论 |
|---|---|---|
| `@1.0.18` 在 elemecdn 返回 404 | elemecdn 是 npm 镜像,`npm pack` 已验证包和路径存在 | ❌ 不存在 |
| 固定版本比当前 @latest 旧 | `npm view` 确认 1.0.18 就是 latest | ❌ 不存在(不是降级) |
| 插件未来版本有 breaking change | 固定版本后不会自动升级,恰恰避免了此问题 | ❌ 不存在 |
| 构建产物 HTML 中 URL 格式错误 | 仅替换 `@latest` → `@1.0.18`,URL 格式不变 | ❌ 不存在 |
| 浏览器缓存导致旧资源残留 | 新 URL = 新缓存键,反而更利于缓存控制 | ❌ 不存在(是优点) |

**综合判定: 零崩溃隐患,可安全执行。**

---

## L4 · 实现方案

### 修改文件

`_config.butterfly.yml`

### 修改步骤

1. 打开 `_config.butterfly.yml`
2. 定位 tag_plugins CDN 区块(:1154-1160)
3. 4 处 `@latest` → `@1.0.18`
4. 定位 envelope_comment custom_pic 区块(:1224-1227)
5. 4 处 `hexo-butterfly-envelope/lib` → `hexo-butterfly-envelope@1.0.15/lib`
6. 定位 swiper CDN 区块(:1276-1279)
7. 4 处 `hexo-butterfly-swiper/lib` → `hexo-butterfly-swiper@1.0.12/lib`
8. 每处加注释说明版本号和锁定日期

### Diff(预期)

```diff
  # tag_plugins CDN(:1154-1160)
-       anima: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@latest/lib/assets/font-awesome-animation.min.css
+       anima: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@1.0.18/lib/assets/font-awesome-animation.min.css # 锁版本 @1.0.18 (2026-05-04 Q8 / B14)
-       issues: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@latest/lib/assets/issues.js
+       issues: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@1.0.18/lib/assets/issues.js # 锁版本 @1.0.18 (2026-05-04 Q8 / B14)
-       carousel: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@latest/lib/assets/carousel-touch.js
+       carousel: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@1.0.18/lib/assets/carousel-touch.js # 锁版本 @1.0.18 (2026-05-04 Q8 / B14)
-       tag_plugins_css: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@latest/lib/tag_plugins.css
+       tag_plugins_css: https://npm.elemecdn.com/hexo-butterfly-tag-plugins-plus@1.0.18/lib/tag_plugins.css # 锁版本 @1.0.18 (2026-05-04 Q8 / B14)

  # envelope_comment custom_pic(:1224-1227)
-       cover: https://npm.elemecdn.com/hexo-butterfly-envelope/lib/violet.jpg
+       cover: https://npm.elemecdn.com/hexo-butterfly-envelope@1.0.15/lib/violet.jpg # 锁版本 @1.0.15 (2026-05-04 Q8)
  ... (其余 3 处类似)

  # swiper CDN(:1276-1279)
-     swiper_css: https://npm.elemecdn.com/hexo-butterfly-swiper/lib/swiper.min.css
+     swiper_css: https://npm.elemecdn.com/hexo-butterfly-swiper@1.0.12/lib/swiper.min.css # 锁版本 @1.0.12 (2026-05-04 Q8)
  ... (其余 3 处类似)
```

---

## L5 · 验证步骤

```text
1. git diff _config.butterfly.yml → 12 处 URL 变更,无其他修改
2. hexo clean && hexo generate → 不报错
3. 检查生成产物中 elemecdn URL:
   grep -r "elemecdn" public/ | grep -v ".map"
   → 所有 URL 应含 @1.0.18/@1.0.15/@1.0.12,无 @latest
4. 浏览含 tag plugin 标签的文章 → 样式正常
5. 浏览 /comments/ (留言板) → 信封图片正常显示
6. 首页 swiper 轮播 → 正常显示
```

---

## L6 · 回滚步骤

```bash
git revert <Q8-commit-hash>     # 单项回滚
# 或
git reset --hard 3ec6ebd        # 完全回到基线
```

---

## L7 · 实际执行结果

_(执行后填充)_
