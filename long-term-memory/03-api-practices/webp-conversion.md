# WebP 图片转换工作流 — 完整指南

> **定位**：本文档是博客图片优化系统的权威参考。
> **何时必读**：（1）首次在新机器上克隆项目；（2）准备运行 `npm run webp / dev / opt / pub` 任一命令；（3）需要新增图片到博客；（4）`cwebp not found` 等报错排查。

---

## L1 · TL;DR（先读这里）

- **它做什么**：扫描 `source/` 与 `themes/butterfly/source/` 下的图片，把 `.png/.jpg/.jpeg/.gif` 转换为 `.webp`，**并同步替换所有 Markdown / 配置文件中的图片引用**。
- **入口命令**：`npm run webp`
- **⚠️ 关键警告**：转换成功后会**直接删除源文件**（png/jpg/jpeg/gif 原图被物理删除）。运行前请确认源图已纳入 git 跟踪。
- **首次使用前提**：本机必须安装 `libwebp`（提供 `cwebp` / `gif2webp` 命令行工具）。未安装时脚本会以 `Error: cwebp not found!` 终止。

---

## L2 · 首次使用 — 环境准备（新机器必做）

> 来源：项目根目录 `部署.txt`，整理为如下规范步骤。仅在 **Windows + PowerShell** 环境验证过。

### 步骤 1：解锁 PowerShell 脚本执行权限

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

> 默认策略 `Restricted` 会阻止 `.ps1` 脚本运行。`RemoteSigned` 仅对当前用户生效，且只允许已签名的远程脚本，是安全与可用的折中。

### 步骤 2：安装 Scoop 包管理器（已有可跳过）

```powershell
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### 步骤 3：通过 Scoop 安装 libwebp

```powershell
scoop install main/libwebp
```

> 这一步同时提供 `cwebp.exe`（处理 png/jpg/jpeg）与 `gif2webp.exe`（处理 gif）两个命令行工具，安装到 `~\scoop\shims\` 并自动加入 PATH。

### 步骤 4：刷新当前会话的环境变量（避免重启终端）

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
```

### 步骤 5：验证安装

```powershell
cwebp -version
gif2webp -version
```

两条命令都能输出版本号 = 环境就绪。

> **脚本兜底逻辑**：即便 PATH 未刷新，`convert-to-webp.ps1` 也会主动尝试 `$HOME\scoop\shims\cwebp.exe` 和 `C:\Users\$env:USERNAME\scoop\shims\cwebp.exe` 两个常见路径作为后备。

---

## L3 · 命令清单与组合关系

| 命令 | 实际执行 | 何时用 |
|---|---|---|
| `npm run webp` | `convert-to-webp.ps1` → `update-markdown-images.ps1` | 仅做图片转换 + 引用更新，不构建不部署 |
| `npm run dev` | `webp` → `clean` → `hexo server` | **写完文章后**：转换图片并启动本地预览 |
| `npm run opt` | `webp` → `clean` → `build` | 仅本地构建优化产物（不部署） |
| `npm run pub` | `opt` → `deploy` | **正式发布**：转换 + 构建 + 部署 |

> 链路：`pub ⊃ opt ⊃ webp`。任何 `dev / opt / pub` 都会先跑 `webp`，所以日常工作流不需要单独执行 `npm run webp`。

---

## L4 · 脚本细节（按需深读）

### 4.1 `tools/convert-to-webp.ps1` — 图片转换脚本

| 项 | 配置 |
|---|---|
| **扫描根** | `source/` 和 `themes/butterfly/source/` |
| **扫描子目录** | source 下：`img, imgs, _posts, about, swiper, coffer, birthday-gift`；theme 下：`img` |
| **递归** | 是（`Get-ChildItem -Recurse`） |
| **处理格式** | `.png, .jpg, .jpeg, .gif` |
| **不处理** | 其他扩展名（包括已经是 `.webp` 的） |
| **转换工具** | `cwebp`（普通图片）/ `gif2webp`（GIF 动图） |
| **质量参数** | `-q 75`（GIF 额外加 `-mixed`） |
| **输出位置** | 与源文件同目录、同文件名，扩展名替换为 `.webp` |
| **删除源文件** | ✅ 转换成功后删除原图（不可逆） |

**三种处理分支**：

1. **Webp 不存在 / 源更新**：调用 cwebp 转换 → 校验输出 → 成功则删除源文件。
2. **Webp 已存在且有效**：跳过转换，**直接删除源文件**（保留已有 webp）。
3. **Webp 文件损坏**（大小为 0）：删除坏文件 → 重新转换 → 成功则删除源文件。

> 「Webp 已存在则直接删源」是日常重复运行时几乎所有图片走的分支，所以脚本是**幂等**的。

### 4.2 `tools/update-markdown-images.ps1` — 引用同步脚本

| 项 | 配置 |
|---|---|
| **扫描根** | `source/` |
| **扫描范围** | `source/` 下所有 Markdown 文件（包括 `birthday-gift/events/*/index.md`） |
| **处理格式** | `.md` 文件 + 项目根的 `_config.yml`、`_config.butterfly.yml` |

**Markdown 中替换的位置**：

| 类型 | 模式 | 示例（替换前 → 替换后） |
|---|---|---|
| Front-matter | `cover/top_img/index_img/bg_img/load_image/background: …` | `cover: /imgs/foo.png` → `cover: /imgs/foo.webp` |
| Markdown 语法 | `![](…)` 中的路径 | `![](bar/x.jpg)` → `![](bar/x.webp)` |
| HTML 标签 | `<img src="…">` | `src="x.jpeg"` → `src="x.webp"` |

**配置文件中替换的字段**（`_config.yml` / `_config.butterfly.yml`）：

`img, favicon, default_top_img, index_img, archive_img, tag_img, category_img, footer_img, background, logo, error_img.flink, error_img.post_page`

**自动排除的远程图床**（不会被替换为 webp）：

- `https://bu.dusays.com/...`
- `https://raw.githubusercontent.com/...`
- `https://*.github.io/...`
- `https://*.githubusercontent.com/...`

> 这套排除规则是为了避免破坏 GitHub Raw 与图床 URL，因为远端文件不存在 `.webp` 版本。

**写入编码**：UTF-8 无 BOM（避免某些 Markdown 渲染器的编码问题）。

### 与生日页面的关系

`source/birthday-gift/` 已纳入转换脚本扫描范围。事件目录中的普通相册图片、`thumb-*` / `photo-*` 图片、视频封面、以及 `source/birthday-gift/imgs/` 下的背景图都会被转换。`update-markdown-images.ps1` 会同步更新事件 `index.md` front matter 里的 `background` 字段，避免背景图源文件删除后路径失效。

---

## L5 · 在项目工作流中的位置

### 标准创作流程

```
1. hexo new "文章标题"          # 创建文章 + asset 文件夹
2. 把 png/jpg 图片放入 asset/   # 不需要手动改成 webp
3. 写正文，引用图片用 png/jpg   # ![](文章名/图.png)
4. npm run dev                   # 自动转 webp + 改引用 + 起本地服务器
5. 浏览器预览确认无误
6. npm run pub                   # 正式发布（再次执行 webp 是幂等的）
```

> **关键观察**：作者写文章时**不需要关心 webp 扩展名**——脚本会负责把 `.png` 引用改写成 `.webp`。先用 png/jpg 工作，发布前一键转换。

### 与项目其它系统的交互

| 系统 | 关联点 |
|---|---|
| `auto-image-list.js`（轮播图扫描） | 该脚本支持 webp 格式，所以 swiper 图片在 webp 转换后仍能被正确收录 |
| `private-posts-scanner.js`（隐私文章） | `source/coffer/` 在 webp 转换的扫描列表内，隐私文章的图片也会被转换 |
| `image-dimensions.js`（注入 width/height） | 在 webp 转换之后运行（构建期），读取的是 webp 文件，不冲突 |
| `hexo-asset-image` | 文章相对路径图片（如 `文章名/图.webp`）由它解析 |

---

## L6 · 重要注意事项（违反会出问题）

| # | 注意事项 | 后果 |
|---|---|---|
| 1 | **运行前必须 `git add` 源图** | 否则误转后源文件被删，git 中也没记录，源图永久丢失 |
| 2 | **不要把图床 URL 写成 png 后缀**（如 `https://bu.dusays.com/foo.png`） | 排除规则只看域名，但你的本地不会有这个文件，反而 update 脚本不会动它（这点是正确行为，但要知道为何不会被替换） |
| 3 | **不要在 `_posts` 之外手动创建 png/jpg 引用** | 例如自定义 page 的某些目录不在扫描范围（如 `MarkdownPreview`、`LianlianKan` 等），引用不会被自动替换 |
| 4 | **首次运行前必须装 libwebp** | 否则脚本以红字 `Error: cwebp not found!` 退出，且会跳过 GIF |
| 5 | **GIF 转换依赖 `gif2webp`** | 没装时 GIF 文件会被跳过（黄字 `[Skip] gif2webp not found`），原 GIF 保留 |
| 6 | **重命名图片后必须重跑 `npm run webp`** | 旧 webp 不会被自动清理；重命名后引用错误 |
| 7 | **避免在 webp 进行中编辑文件** | update 脚本是整文件读写，并发编辑可能丢失改动 |

---

## L7 · 常见问题排查

| 报错 / 现象 | 原因 | 解决 |
|---|---|---|
| `Error: cwebp not found!` | 未安装 libwebp 或 PATH 未刷新 | 见 L2 步骤 3-4 |
| `[Skip] gif2webp not found: xxx.gif` | libwebp 安装不完整 | `scoop install main/libwebp` 重装 |
| `[Failed] Convert failed: xxx` | 源图损坏或权限问题 | 用图片查看器打开源图验证；检查文件占用 |
| `[Invalid] WebP corrupted, reconverting` | 上次转换被中断留下 0 字节 webp | 脚本会自动处理（删坏文件后重转），无需干预 |
| Markdown 引用未更新 | 文章不在扫描目录列表内 | 检查文件路径是否在 `_posts/about/coffer/categories/tags/link` 之一 |
| 图床图片被意外加上 `.webp` | URL 不匹配排除规则 | 在 `update-markdown-images.ps1` 的 `$excludePatterns` 中追加该域名 |
| 部署后图片 404 | webp 文件未生成但引用已改 | 重新跑 `npm run webp`；检查 `convert-to-webp.ps1` 是否报错 |

---

## L8 · 文件位置速查（深度参考）

| 用途 | 路径 |
|---|---|
| 转换脚本 | `tools/convert-to-webp.ps1` |
| 引用同步脚本 | `tools/update-markdown-images.ps1` |
| npm scripts 定义 | `package.json` 的 `scripts` 段 |
| 命令记录原始来源 | `部署.txt`（项目根） |
| 主配置文件 | `_config.yml`、`_config.butterfly.yml` |

> 修改任一脚本前，必须在 `04-operations/operation-log.md` 记录改动。