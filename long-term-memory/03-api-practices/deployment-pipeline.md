---
name: 部署脚本完整图谱（dev / opt / pub 三条主线）
description: 项目所有发布相关 npm script 的端到端解释、调用链、副作用与红线，对应用户重点关注的"部署脚本三条主线"
type: project
---

# 部署脚本完整图谱 — dev / opt / pub 三条主线

> **何时阅读**：调整任何 npm script、改动 `package.json`、修改 `tools/*.ps1`、调整 `_config.yml` 中 `deploy` 节、双部署任一目标失败时。
> **关联文档**：[webp-conversion.md](webp-conversion.md)（webp 步骤的详细规则） · [project-overview.md](../05-reference/project-overview.md)（npm scripts 速查表）。

---

## L1 · TL;DR（30 秒看完）

- 项目共有 **3 条主部署/构建链**：`npm run dev` / `npm run opt` / `npm run pub`，外加 1 条原子 `npm run webp`。
- 三条主链共享同一个前缀步骤 `webp`（即"先把图片全部转成 webp，再做后续工作"）。
- **包含关系**：`pub` ⊃ `opt` ⊃ `webp`；`dev` 与 `opt` 平级，区别在于一个跑 `hexo server`、一个跑 `hexo generate`；`pub` 在 `opt` 之后追加 `hexo deploy`。
- **副作用警告**：webp 步骤会**物理删除源图原图**，且**修改 markdown / 配置文件中的图片引用**。详细见 [webp-conversion.md](webp-conversion.md)。
- **部署目标 2 个**：GitHub Pages（`git@github.com:XBXyftx/XBXyftx.github.io.git`）+ 私有服务器（`git@113.47.8.204:/home/git/blog.git`），双发布。

---

## L2 · 三条主线一览

```text
┌──────────────────────────────────────────────────────────────────────────┐
│   npm run pub        ─►   webp → clean → build (= generate) → deploy     │
│   npm run opt        ─►   webp → clean → build (= generate)              │
│   npm run dev        ─►   webp → clean → server (= hexo server)          │
│   npm run webp       ─►   convert-to-webp.ps1  →  update-markdown-images.ps1   │
└──────────────────────────────────────────────────────────────────────────┘
```

**记忆口诀**：

| 链 | 用途 | 终点 |
|---|---|---|
| `dev` | 写完文章后看本地预览 | `http://localhost:4000` |
| `opt` | 优化构建，但不发布 | `public/` 静态文件 |
| `pub` | 一键全自动发布上线 | GitHub Pages + 私有服务器 |

> 用户在 `部署.txt` 里的原话：
> - `npm run dev`：写完文章后，执行图片 WebP 转换并启动本地预览。
> - `npm run opt`：仅执行优化和本地静态文件构建。
> - `npm run pub`：全自动化流程，执行优化后直接发布上线。

---

## L3 · 命令清单（取自 `package.json`）

```json
{
  "scripts": {
    "build":  "hexo generate",
    "clean":  "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server",
    "webp":   "node ./tools/dispatch-webp.js",
    "webp:win": "pwsh ./tools/convert-to-webp.ps1 && pwsh ./tools/update-markdown-images.ps1",
    "webp:mac": "bash ./tools/convert-to-webp.sh && bash ./tools/update-markdown-images.sh",
    "opt":    "npm run webp && npm run clean && npm run build",
    "pub":    "npm run opt && hexo deploy",
    "dev":    "npm run webp && npm run clean && hexo server"
  }
}
```

> `npm run webp` 通过 `tools/dispatch-webp.js` 自动检测 OS 并调用对应脚本（`.ps1` 或 `.sh`），Windows/macOS/Linux 均可直接使用。

---

## L4 · 每一步具体做了什么

### 4.1 `npm run webp`（共享前置步骤，副作用最大）

`webp` = `convert-to-webp.ps1` ➜ `update-markdown-images.ps1`，**两条 PowerShell 脚本顺序执行，前者失败后者不会跑**（`&&` 短路）。

#### 子步骤 1：`tools/convert-to-webp.ps1`

| 项 | 行为 |
|---|---|
| **扫描根** | `source/` 下：`img / imgs / _posts / about / swiper / coffer`；`themes/butterfly/source/` 下：`img` |
| **目标格式** | `.png / .jpg / .jpeg / .gif` |
| **转换工具** | `cwebp -q 75`（PNG/JPG），`gif2webp -q 75 -mixed`（GIF） |
| **依赖** | 必须本机已安装 `libwebp`（安装步骤见 L5） |
| **fallback 路径** | `$HOME\scoop\shims\cwebp.exe`、`C:\Users\$env:USERNAME\scoop\shims\cwebp.exe` |
| **三个分支** | ① webp 不存在或源图更新 → 重转 → 删源图  ② webp 存在且有效 → 仅删源图  ③ webp 损坏 → 删 webp 重转 → 删源图 |
| **副作用 ⚠️** | 转换成功后**物理删除**对应 `.png/.jpg/.jpeg/.gif`（不可逆）|

> ⚠️ **删图前必须先 `git add` 跟踪原图**，否则误用此命令将永久丢失源图（webp 是有损压缩，无法回滚）。

#### 子步骤 2：`tools/update-markdown-images.ps1`

| 项 | 行为 |
|---|---|
| **扫描根** | `source/` 下：`_posts / about / coffer / categories / tags / link`；额外：`_config.yml` + `_config.butterfly.yml` |
| **替换目标** | 把所有指向 `.png/.jpg/.jpeg/.gif` 的引用改成 `.webp` |
| **替换位置** | ① Markdown 的 `![](...)`  ② HTML 的 `src="..."`  ③ Front-matter 的 `cover / top_img / index_img / bg_img / load_image`  ④ 配置文件的 `img / favicon / default_top_img / index_img / archive_img / tag_img / category_img / footer_img / background / logo / error_img.flink / error_img.post_page` |
| **排除域名** | `bu.dusays.com`、`raw.githubusercontent.com`、`*.github.io`、`*.githubusercontent.com`（这些远端地址的引用保持不变）|
| **写回编码** | UTF-8 **不带 BOM**（避免编辑器或后续工具误识别） |

> **副作用 ⚠️**：`_config.yml` 与 `_config.butterfly.yml` 会被**直接改写**。如果你刚临时改了配置但没提交，请先 `git stash` 或 `git add` 后再跑此命令，避免丢失改动。

完整规则（首次环境配置、错误码、CI 注意事项）见 [webp-conversion.md](webp-conversion.md)。

---

### 4.2 `npm run clean` → `hexo clean`

| 行为 | 说明 |
|---|---|
| 删除 `public/` | 所有上次生成的静态文件 |
| 删除 `db.json` | Hexo 文章/页面数据库缓存 |
| 删除 `.deploy_git/` | hexo-deployer-git 的工作副本（如果存在） |

> **强制约束**：每次 `hexo generate` 之前都必须 `hexo clean`，否则主题模板修改、自定义脚本输出（`auto-image-list.js`、`private-posts-scanner.js`、`image-dimensions.js`）的产物可能被旧缓存覆盖。

---

### 4.3 `npm run build` → `hexo generate`

| 行为 | 说明 |
|---|---|
| 主题渲染 | 使用 Butterfly 模板 + `_config.butterfly.yml` |
| Markdown 渲染 | `kramed`（非默认 `marked`） |
| 自定义生成器 | `scripts/auto-image-list.js`（生成 `swiper/images-auto.json`） |
| 自定义过滤器 | `scripts/private-posts-scanner.js`（生成 `coffer/private-posts.json`） + `scripts/image-dimensions.js`（HTML 注入 width/height + loading="lazy"）|
| 第三方插件 | `hexo-asset-image`（asset 文件夹相对路径解析）、`hexo-filter-mermaid-diagrams`、`hexo-filter-gitcalendar`、`hexo-butterfly-swiper` 等 |
| **输出** | `public/` 完整站点 |

> **关键耦合**：`image-dimensions.js` 依赖 `image-size` 包对图片解析尺寸；如果 webp 转换出问题导致缺图，此处会有大量警告，但不致命。

---

### 4.4 `npm run server` → `hexo server`（仅 dev 链使用）

启动本地预览服务器，默认 `http://localhost:4000`。增量 watch：修改 markdown / scss / pug 会自动刷新；修改主题模板需要重启。

> **dev 链的 watch 限制**：因为 `dev` 在 `server` 之前已经做过 `clean + webp`，所以 server 启动时的初始构建用的是干净状态。后续 watch 是 hexo 内部增量。

---

### 4.5 `npm run deploy` / `pub` 末段的 `hexo deploy`

| 项 | 内容 |
|---|---|
| **插件** | `hexo-deployer-git`（package.json 依赖中显式声明） |
| **流程** | 把 `public/` 内容推送到 `_config.yml` 中 `deploy` 节配置的所有 git 仓库 |
| **目标 1** | `git@github.com:XBXyftx/XBXyftx.github.io.git` 的 `main` 分支（GitHub Pages） |
| **目标 2** | `git@113.47.8.204:/home/git/blog.git` 的 `main` 分支（私有服务器） |
| **运行时** | 在项目根 `.deploy_git/` 临时目录初始化 git，逐个 push |
| **认证** | 依赖本机 `~/.ssh/` 中已配置的 SSH key（GitHub 与私有服务器都走 SSH） |

> 部署日志会显示每个目标的 push 结果。**双部署的失败是独立的**：GitHub 失败不影响私服推送，反之亦然。务必检查日志确认两边都 OK。

---

## L5 · 首次环境准备（新机器要跑通 webp 必须完成）

### Windows

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install main/libwebp
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
```

### macOS

```bash
brew install powershell webp
```

### 所有平台通用

```bash
git config --global user.name "XBXyftx"
git config --global user.email "shuaixbx02@outlook.com"
ssh-keygen -t ed25519 -C "shuaixbx02@outlook.com"
```

> 完整步骤见 [webp-conversion.md](webp-conversion.md) 的 L2 节，以及项目根 `部署.txt`。
>
> ⚠️ 如果只是**写文章和本地预览**，不需要 libwebp。此前提仅在你想跑 `webp / dev / opt / pub` 任一命令时强制要求。临时绕过：直接 `hexo server`。

---

## L6 · 三条主线选择决策树

```text
你的目的是什么？
├── 只想看本地预览（不发布）
│   ├── 这次有新加图片？  ──►  npm run dev   （会触发 webp）
│   └── 没动图片？        ──►  hexo server   （直接起本地，不动文件）
│
├── 想生成静态文件但暂不发布（CI 校验、自查）
│   ├── 有新图？  ──►  npm run opt
│   └── 没新图？  ──►  npm run clean && npm run build
│
└── 要发布上线
    ├── 标准流程        ──►  npm run pub        （webp + clean + build + deploy）
    ├── 已经 build 过、只想推送  ──►  hexo deploy
    └── 部署失败要重发    ──►  npm run clean && npm run build && hexo deploy
                              （webp 已经做过，没必要再删一次原图）
```

> **常见错误**：第二次发布时再跑 `npm run pub`。这等于又跑了一次 webp，但这一次因为 markdown 引用早就指向 `.webp`，扫描时不会再有源图被删——**除非你新增了 png/jpg 文件**。但 update-markdown-images.ps1 仍会全量扫描所有 markdown，速度上会慢一截。无害，但不必要。

---

## L7 · 红线（这些行为会破坏部署链）

| # | 红线 | 后果 | 正确做法 |
|---|---|---|---|
| R1 | 在没有 libwebp 的机器跑 `webp / dev / opt / pub` | 转换失败，源图未被删但 markdown 引用已经被改，导致**所有图片找不到** | 先装 libwebp，或先回滚 git |
| R2 | webp 转换前不 `git add` 源图 | 删图后无法找回 | 写完文章先 `git add source/_posts/`，再跑 webp |
| R3 | 跳过 `clean` 直接 `build` | 自定义脚本输出（image-list、private-posts、image-dimensions）和主题修改可能用旧缓存 | 永远是 clean → build |
| R4 | 修改 `_config.yml` 的 `deploy` 节但不验证 | 推不到目标仓库 | 修改后跑一次 `hexo deploy` 看日志 |
| R5 | 双部署其中一边失败就不管 | 用户看到的是两个版本不一致 | 失败重试，或修复 SSH 后重新 deploy |
| R6 | 修改 `tools/*.ps1` 后不在 [04-operations/operation-log.md](../04-operations/operation-log.md) 留痕 | 后续 AI 不知道为什么脚本行为变了 | 改完写一条 operation log |
| R7 | 直接编辑 `swiper/images-auto.json` 或 `coffer/private-posts.json` | 下次 `hexo generate` 会被 scripts 覆盖 | 编辑源（图片文件夹 / md 文件），让脚本自动重生 |

---

## L8 · 部署后必检清单

每次 `npm run pub` 完成后逐项核对：

- [ ] 终端日志看到两次 `Branch 'main' set up to track remote branch 'main'` 或 `Everything up-to-date`，两个目标都成功
- [ ] GitHub Actions（如有）没有红色失败
- [ ] 浏览器访问 [https://xbxyftx.top](https://xbxyftx.top) 加载正常
- [ ] 浏览器访问私有服务器域名加载正常（CDN 缓存可能延迟 1-2 分钟）
- [ ] 最新一篇文章可以在首页/归档页找到
- [ ] 轮播图（首页）正常滚动
- [ ] 隐私文章入口（`/coffer/`）能进入并显示文章列表
- [ ] 评论系统加载（任一文章页底部应出现 Twikoo 输入框）
- [ ] 控制台 Network 面板没有 404 / 503

---

## L9 · 常见排查

### 错误 1：`hexo deploy` 卡在第一个仓库

**症状**：日志停在 `Pushing to git@github.com:XBXyftx/XBXyftx.github.io.git`，超时。

**原因**：本机网络访问 GitHub 的 22 端���被拦截（公司网/校园网常见）。

**解决**：执行 [L5 步骤 4 的 SSH 配置](#l5--首次环境准备新机器要跑通-webp-必须完成)，让 SSH 走 443 端口。

---

### 错误 2：`webp` 跑完所有 markdown 都找不到图

**症状**：`hexo server` 起来后所有图都 404。

**根本原因**：`update-markdown-images.ps1` 把引用改成了 `.webp`，但 `convert-to-webp.ps1` 因为 libwebp 没装，转换失败但没 abort 整个流程。

**解决**：

1. `git checkout` 还原所有 markdown 与 `_config*.yml`
2. 装 libwebp（[L5](#l5--首次环境准备新机器要跑通-webp-必须完成)）
3. 重新跑 `npm run webp`

---

### 错误 3：发布后 GitHub Pages 显示 404 或旧版本

**原因**：

- `public/` 没生成（漏跑了 `build`）
- `hexo-deployer-git` 推到了错误的分支（默认 `main`，确认 `_config.yml` 的 `deploy.branch`）
- GitHub Pages 设置里源分支不是 `main`

**解决**：先 `cd .deploy_git && git log` 确认本地的部署副本是最新的，再去 GitHub Settings → Pages 检查 source。

---

### 错误 4：`npm run pub` 中途中断后再跑

**症状**：再次跑 `pub` 时，webp 一闪而过（很快），看起来"什么都没做"。

**原因**：源图已经在上次跑完后被删除了，markdown 引用也已是 `.webp`，所以这次没有可转换的目标。**这是正常行为**。后面的 clean / build / deploy 仍会正常执行。

---

## L10 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 主入口 | `package.json` 的 `scripts` 节 |
| 跨平台调度器 | `tools/dispatch-webp.js` |
| webp 转换 (Win) | `tools/convert-to-webp.ps1` |
| webp 转换 (Mac) | `tools/convert-to-webp.sh` |
| 引用同步 (Win) | `tools/update-markdown-images.ps1` |
| 引用同步 (Mac) | `tools/update-markdown-images.sh` |
| 部署目标 | `_config.yml` 的 `deploy` 节 |
| 用户备忘 | `部署.txt`（项目根） |
| 详细 webp 文档 | [webp-conversion.md](webp-conversion.md) |
| 自定义生成器 | `scripts/auto-image-list.js`、`scripts/private-posts-scanner.js`、`scripts/image-dimensions.js` |
| 双部署仓库 | `git@github.com:XBXyftx/XBXyftx.github.io.git` + `git@113.47.8.204:/home/git/blog.git` |

---

## L11 · 与其他模块的耦合

```text
deployment-pipeline
  ├── webp-conversion.md ─── L2 / L4.1 完整规则
  ├── scripts/auto-image-list.js ─── 在 build 阶段生成 swiper 索引
  ├── scripts/private-posts-scanner.js ─── 在 before_generate 生成隐私索引
  ├── scripts/image-dimensions.js ─── 在 after_render:html 注入图片尺寸
  ├── _config.yml#deploy ─── 决定推送目标
  ├── _config.butterfly.yml#inject ─── 决定打包进 public 的 CSS/JS
  └── 06-theme-modifications/ ─── 主题模板被改后必须 clean 才能生效
```

> **如果删除/重命名 `tools/*.ps1`**：所有四条 npm script（`webp / dev / opt / pub`）都会立即失效，且 `package.json` 不会自动同步。在做这件事前请：
>
> 1. 在 [04-operations/operation-log.md](../04-operations/operation-log.md) 记录
> 2. 同步更新 `package.json` 的 `scripts`
> 3. 更新 [webp-conversion.md](webp-conversion.md) 与本文档
