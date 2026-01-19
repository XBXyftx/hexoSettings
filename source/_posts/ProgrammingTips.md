---
title: 编程小知识点
date: 2025-09-29 14:29:20
tags:
  - 技术向
cover: /imgs/ArticleTopImgs/ProgrammingTipsTopImg.webp
description: 各种杂七杂八的程序员下饭菜
typewriter: 💡 程序员的"潜水收获"合集！本文汇聚了作者在各种技术群聊中潜水学习到的编程小知识点。从Git版本控制的核心区别到文件压缩格式的性能对比，每个知识点都源自实际开发中的踩坑经历。深入解析git pull vs fetch、rebase vs merge等经典面试题的本质差异，详细对比tar.gz vs zip的技术原理和应用场景。通过生动的比喻和实用的代码示例，让复杂的技术概念变得通俗易懂。这不仅是技术知识的整理，更是"听大佬讲话"后的干货提炼，为开发者提供随时查阅的实用工具手册。适合下饭阅读，让学习变得轻松有趣！
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

"hello world"欢迎来到我的新文章，我的朋友。我之所以突然想开这样一个不知道是干嘛的文章主要是在因为我经常混迹在各种技术群聊中去潜水，去窥视大佬的生活，听大佬讲话或多或少会有一些知识会流到我脑子里的吧（少女折寿中）。

![1](ProgrammingTips/1.webp)

所以呢，我决定去开一篇文章专门记录一下这些散落在脑海各处的零散的知识点。于是这篇文章就诞生了，各位读者就当是一个随即更新的趣味读物就好了。（下饭下饭下饭）

## git类

### git pull 和 git fetch 的区别

这个问题简直是面试经典必考题，经常有同学搞混这两个命令。简单来说：

**git fetch：** 只是把远程仓库的更新拉取到本地，但不会自动合并到当前分支。就像是你去菜市场买了菜回来，但还没有做饭。

```bash
git fetch origin main
# 这时候远程的更新已经在本地了，但你的工作目录没有变化
# 你可以通过 git log origin/main 查看远程分支的提交记录
# 如果想合并，需要手动执行
git merge origin/main
```

**git pull：** 相当于 `git fetch` + `git merge` 的组合技，一步到位把远程更新拉取并合并到当前分支。

```bash
git pull origin main
# 等价于：
# git fetch origin main
# git merge origin/main
```

**什么时候用哪个？**

- 用 `git fetch`：当你想先看看远程有什么更新，再决定是否合并时
- 用 `git pull`：当你确定要直接合并远程更新时（大多数情况）

**坑点提醒：**
如果你的本地分支有未提交的修改，`git pull` 可能会产生冲突或者失败。这时候要么先 `git stash` 保存修改，要么先 `git commit` 提交修改。

### git rebase 和 git merge 的区别

又是一个让新手头疼的问题！两者都是用来合并分支的，但效果完全不同：

**git merge：** 会创建一个新的合并提交，保留分支的历史记录。就像是两条河流汇聚成一条大河，你还能看出原来的两条支流。

```bash
git checkout main
git merge feature-branch
# 会产生这样的提交历史：
#   A---B---C---M  (main)
#        \     /
#         D---E    (feature-branch)
```

**git rebase：** 会把你的提交"搬移"到目标分支的最新提交之后，让提交历史看起来是线性的。就像是把支流的水重新倒进主河道。

```bash
git checkout feature-branch
git rebase main
# 会产生这样的提交历史：
#   A---B---C---D'---E'  (feature-branch)
```

**什么时候用哪个？**

- 用 `git merge`：
  - 在主分支合并功能分支时（保留开发历史）
  - 多人协作的公共分支
  - 想保持真实的开发时间线

- 用 `git rebase`：
  - 整理自己的功能分支，让提交历史更干净
  - 同步主分支的最新代码到功能分支
  - **注意：永远不要在公共分支上使用 rebase！**

**黄金法则：** 如果你的分支已经推送到远程仓库并且有其他人在使用，就不要用 rebase！

### issue、PR、MR的区别和最佳实践

这三个概念经常让新手搞混，特别是PR和MR！简单来说就是不同平台的叫法不同：

**基本概念区别：**

- **Issue：** 问题跟踪，用来报告bug、提出功能需求、讨论技术方案
- **PR (Pull Request)：** GitHub的术语，请求将你的代码合并到目标分支
- **MR (Merge Request)：** GitLab的术语，功能和PR完全一样，只是叫法不同

**实际使用流程：**

```bash
# 标准的开源贡献流程
1. 创建Issue描述问题/需求
2. Fork项目到自己账户
3. 创建功能分支：git checkout -b fix/issue-123
4. 开发并提交代码
5. 推送到自己的fork：git push origin fix/issue-123
6. 创建PR/MR请求合并
7. 代码审查和讨论
8. 合并到主分支
```

**Issue编写最佳实践：**

```markdown
# Bug报告模板
## 问题描述
简洁描述遇到的问题

## 复现步骤
1. 打开应用
2. 点击登录按钮
3. 输入错误密码
4. 出现白屏

## 预期行为
应该显示错误提示信息

## 实际行为
页面变成白屏，无任何提示

## 环境信息
- 浏览器：Chrome 118.0
- 操作系统：Windows 11
- 应用版本：v1.2.3

## 附加信息
[截图或错误日志]
```

**PR/MR标题和描述技巧：**

```markdown
# 好的PR标题示例：
feat: 新增用户登录功能 (#123)
fix: 修复购物车数量计算错误 (#456)
docs: 更新API文档中的认证说明
refactor: 重构用户管理模块提升性能

# PR描述模板：
## 改动内容
- 新增了用户登录API接口
- 添加了JWT token验证中间件
- 完善了错误处理机制

## 关联Issue
Closes #123

## 测试情况
- [x] 单元测试通过
- [x] 集成测试通过
- [x] 手动测试验证

## 截图/GIF
[如果有UI改动，提供截图]
```

**代码审查的沟通艺术：**

作为**审查者**：

```markdown
# ❌ 不好的评论
"这代码写得有问题"

# ✅ 建设性的评论
"建议这里使用 Array.find() 替代 forEach，可以提高性能并且更语义化"
```

作为**PR作者**：

```markdown
# ❌ 防御性回应
"这样写没问题啊，之前就是这么做的"

# ✅ 开放的回应
"好建议！我来修改一下，顺便加个单元测试验证这个逻辑"
```

**平台差异对比：**

| 特性 | GitHub | GitLab | Gitee |
|------|--------|--------|-------|
| 合并请求名称 | Pull Request | Merge Request | Pull Request |
| Issue模板 | ✅ | ✅ | ✅ |
| 代码审查 | ✅ | ✅ | ✅ |
| CI/CD集成 | GitHub Actions | GitLab CI | Gitee Go |
| 项目管理 | Projects | Issues Board | 任务 |

**实用技巧分享：**

```bash
# 快速创建Issue链接的PR
git commit -m "fix: 修复登录bug

Closes #123
Fixes #456"

# PR模板自动化
# 在.github/pull_request_template.md添加模板

# 关联多个Issue
git commit -m "feat: 新功能

Related to #123, #456
Closes #789"
```

**踩坑经验：**

- Issue描述要具体，不要只写"有bug"或"不工作"
- PR不要太大，建议控制在500行代码以内
- 提交信息要规范，推荐使用conventional commits格式
- 代码审查要及时回复，超过24小时容易被遗忘
- 合并前确保CI通过，不要让broken build进入主分支

这套流程用熟了，你就是团队协作的行家了！🚀

### 对主分支的保护

这个话题在团队协作中太重要了！主分支保护规则就像是代码仓库的"安全防护网"，防止有害代码直接进入主分支。

**为什么需要分支保护？**

没有保护的主分支就像是开放式厨房，任何人都能随意"加料"：

- 直接push破坏性代码导致项目无法启动
- 跳过代码审查引入安全漏洞
- 强制推送覆盖掉其他人的提交
- 删除重要分支造成代码丢失

**GitHub分支保护规则设置：**

进入仓库设置 → Branches → Add rule，核心配置项：

```yaml
分支保护规则配置清单：
✅ Require pull request reviews before merging
   - Required number of reviewers: 1-2人
   - Dismiss stale reviews: 代码更新后重新审查
   - Require review from code owners: 需要代码负责人审查

✅ Require status checks to pass
   - 必须通过CI/CD流水线
   - 单元测试、集成测试、代码扫描

✅ Require branches to be up to date
   - 合并前必须先同步最新代码

✅ Require conversation resolution
   - PR中的讨论必须解决完毕

✅ Restrict pushes that create files over 100MB
   - 防止大文件进入仓库

❌ Allow force pushes (危险！永远不要开启)
❌ Allow deletions (防止分支被误删)
```

**GitLab保护设置对比：**

```bash
# GitLab的保护级别更细致
Settings → Repository → Protected Branches

保护级别：
- No one: 无人可以推送
- Developers + Maintainers: 开发者和维护者
- Maintainers: 仅维护者
- No one, Developers + Maintainers: 仅通过MR

合并权限：
- No one: 无人可以合并
- Developers + Maintainers: 开发者和维护者可合并
- Maintainers: 仅维护者可合并
```

**实际团队配置建议：**

**小团队（2-5人）配置：**

```yaml
主分支保护：
- 至少1人代码审查
- 必须通过基础CI（测试+构建）
- 允许管理员绕过（紧急情况）
- 删除源分支（保持仓库整洁）

开发分支：
- 不设置保护（开发自由度）
```

**大团队（10+人）配置：**

```yaml
主分支保护：
- 至少2人代码审查，包含1个代码负责人
- 必须通过完整CI/CD流水线
- 强制更新到最新代码
- 所有讨论必须解决
- 管理员也不能绕过规则

预发布分支：
- 至少1人审查
- 必须通过测试
- 仅维护者可合并

功能分支：
- 命名规范：feature/功能名
- 自动删除已合并分支
```

**CODEOWNERS文件应用：**

在仓库根目录创建`.github/CODEOWNERS`：

```bash
# 全局代码负责人
* @team-lead @senior-dev

# 前端代码
/src/components/ @frontend-team
/src/pages/ @frontend-team @ui-designer

# 后端API
/api/ @backend-team
/database/ @backend-team @dba

# 基础设施
/.github/ @devops-team
/docker/ @devops-team
/kubernetes/ @devops-team

# 文档
/docs/ @tech-writer @product-manager
README.md @team-lead

# 敏感配置
/config/production/ @team-lead @devops-team
```

**自动化保护脚本：**

```bash
#!/bin/bash
# 批量设置分支保护的GitHub CLI脚本

REPO="your-org/your-repo"
BRANCHES=("main" "develop" "release/*")

for branch in "${BRANCHES[@]}"; do
    gh api repos/$REPO/branches/$branch/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["ci/tests","ci/build"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":2}' \
        --field restrictions=null

    echo "✅ Protected branch: $branch"
done
```

**常见踩坑和解决方案：**

1. **紧急修复无法合并：**
```bash
# 设置hotfix分支例外规则
# 或临时调整保护规则（记得改回来！）
```

2. **CI经常失败导致无法合并：**
```bash
# 检查CI配置，确保测试稳定
# 考虑添加重试机制
# 设置合理的超时时间
```

3. **代码审查效率低：**
```bash
# 设置自动分配审查者
# 限制PR大小（建议<500行）
# 建立审查时间SLA（如24小时内）
```

**分支保护的"渐进式"策略：**

```bash
第一阶段：基础保护
- 禁止直接推送到main
- 必须通过PR合并

第二阶段：质量门槛
- 增加CI检查要求
- 至少1人代码审查

第三阶段：严格管控
- 多人审查机制
- 强制代码负责人审查
- 完整的自动化测试

第四阶段：企业级
- 签名提交要求
- 安全扫描通过
- 合规性检查
```

记住：分支保护不是为了给开发者添麻烦，而是为了让整个团队写出更高质量的代码！🛡️

### GitHub的一些常用功能

主要聚焦几个实用性很强的功能：GitHub Pages、Actions、Codespace和大文件处理。这些都是日常开发中经常用到的！

**GitHub Pages部署：**

最简单的静态网站部署方案，免费且好用：

```bash
# 方法1：直接从分支部署
Settings → Pages → Source: Deploy from a branch
选择 main 分支的 / (root) 或 /docs 文件夹

# 方法2：GitHub Actions自动部署（推荐）
# .github/workflows/pages.yml
name: Deploy to Pages
on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

**GitHub Actions实用案例：**

除了部署，Actions还能做很多自动化工作：

```yaml
# 自动代码格式化和提交
name: Auto Format Code
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ref: ${{ github.head_ref }}

      - name: Format code
        run: |
          npm install
          npm run format

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git diff --staged --quiet || git commit -m "Auto format code"
          git push
```

```yaml
# 定时任务 - 每天检查依赖更新
name: Daily Dependency Check
on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点
  workflow_dispatch:

jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for updates
        run: |
          npm outdated > outdated.txt || true
          if [ -s outdated.txt ]; then
            echo "发现过期依赖:" >> $GITHUB_STEP_SUMMARY
            cat outdated.txt >> $GITHUB_STEP_SUMMARY
          fi
```

**GitHub Codespace云端开发：**

直接在浏览器里写代码，环境配置自动化：

```json
// .devcontainer/devcontainer.json
{
  "name": "Node.js Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",

  // 预装VSCode扩展
  "extensions": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ],

  // 端口转发
  "forwardPorts": [3000, 8080],

  // 容器启动后执行的命令
  "postCreateCommand": "npm install",

  // 自定义设置
  "settings": {
    "terminal.integrated.defaultProfile.linux": "bash",
    "editor.formatOnSave": true
  },

  // 预装系统工具
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

**大文件处理 - Git LFS：**

当你的仓库有图片、视频、模型文件等大文件时：

```bash
# 安装Git LFS
git lfs install

# 跟踪大文件类型
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "*.pdf"
git lfs track "*.zip"
git lfs track "*.mp4"

# 跟踪特定文件
git lfs track "models/large-model.bin"

# 查看跟踪的文件
git lfs ls-files

# 提交.gitattributes文件
git add .gitattributes
git commit -m "Add Git LFS tracking"

# 正常提交大文件
git add large-file.zip
git commit -m "Add large file via LFS"
git push
```

**LFS使用注意事项：**

```bash
# 检查LFS状态
git lfs status

# 下载所有LFS文件
git lfs pull

# 只下载特定文件
git lfs pull --include="*.png"

# 节省空间 - 不下载LFS文件
git lfs clone https://github.com/user/repo.git --no-checkout

# 查看存储用量
git lfs ls-files -s  # 显示文件大小
```

**大文件的替代方案：**

```bash
# 方案1：Release附件
# 将大文件上传到GitHub Release中
gh release create v1.0.0 large-file.zip

# 方案2：外部CDN
# 使用CDN存储大文件，仓库只保存链接
echo "https://cdn.example.com/assets/video.mp4" > video-link.txt

# 方案3：子模块
# 将大文件仓库作为子模块引入
git submodule add https://github.com/user/assets.git assets

# 方案4：GitHub大文件存储限制
# 免费账户：1GB LFS存储 + 1GB带宽/月
# Pro账户：2GB LFS存储 + 2GB带宽/月
# 超出部分：$5/GB存储，$1/GB带宽
```

**实用技巧总结：**

```bash
# Pages自定义域名
# 在仓库根目录添加CNAME文件，内容为你的域名
echo "blog.yourdomain.com" > CNAME

# Actions调试技巧
# 在workflow中添加调试步骤
- name: Debug
  run: |
    echo "Working directory: $(pwd)"
    echo "Environment variables:"
    env | sort
    echo "File structure:"
    ls -la

# Codespace性能优化
# 选择合适的机器类型：2-core, 4-core, 8-core
# 及时关闭不用的Codespace避免计费

# LFS成本控制
# 定期清理不需要的大文件历史
git lfs prune --recent  # 清理30天前的文件
```

这四个功能组合使用，基本能解决大部分开发和部署需求！🎯

## 文件格式类

### tar.gz 和 zip 的区别

这个问题在我最近Docker部署踩坑的时候深刻体会到了！原来以为压缩包就是压缩包，没想到里面还有这么多门道。

**压缩原理的区别：**

**tar.gz：** 这是一个两步式压缩过程

1. 先用tar进行**归档**（打包多个文件成一个文件，但不压缩）
2. 再用gzip进行**压缩**（减小文件体积）

```bash
# 两步式操作
tar -cf archive.tar file1 file2 file3  # 先打包
gzip archive.tar                       # 再压缩，得到archive.tar.gz

# 一步到位
tar -czf archive.tar.gz file1 file2 file3
```

**zip：** 一步式压缩，直接将文件压缩并打包成一个文件。

```bash
zip archive.zip file1 file2 file3
```

**平台兼容性：**

- **tar.gz：** Linux/Unix原生支持，Windows需要额外工具
- **zip：** 几乎所有平台都原生支持，Windows首选

**压缩效率对比：**

| 格式 | 压缩率 | 压缩速度 | 解压速度 | 占用内存 |
|------|--------|----------|----------|----------|
| tar.gz | 高 | 中等 | 快 | 低 |
| zip | 中等 | 快 | 中等 | 中等 |

**实际应用场景：**

- **tar.gz：**
  - Linux服务器部署（Docker镜像、源码分发）
  - 长期存储备份
  - 网络传输（体积小）
  - 保持Unix文件权限

- **zip：**
  - 跨平台文件分享
  - Windows环境
  - 需要快速压缩的场景
  - 办公文档打包

**有趣的发现：**

在我Docker部署的时候发现，宝塔面板只接受`.tar`文件作为构建上下文，不接受`.tar.gz`！原因是Docker构建时需要频繁随机访问文件，压缩格式会影响性能。这让我明白了一个道理：**工具选择要基于实际需求，不是越小越好！**

**命令小贴士：**

```bash
# 查看压缩包内容（不解压）
tar -tzf archive.tar.gz
unzip -l archive.zip

# 解压到指定目录
tar -xzf archive.tar.gz -C /target/dir
unzip archive.zip -d /target/dir

# 压缩时排除某些文件
tar --exclude='*.log' -czf archive.tar.gz /source/dir
zip -r archive.zip /source/dir -x "*.log"
```

**IDE和VSCode中的实际应用：**

在日常开发中，tar.gz格式在IDE和编辑器插件开发中扮演着重要角色：

**VSCode扩展(.vsix文件)：**
VSCode的插件本质上就是一个重命名的zip文件，但在Linux/Mac开发环境中，开发者经常使用tar.gz来打包和分发源码：

```bash
# VSCode插件开发工作流
# 1. 打包插件源码进行备份
tar -czf my-extension-v1.0.0.tar.gz --exclude=node_modules --exclude=.git .

# 2. 团队协作时分享插件源码
tar -czf shared-extension.tar.gz src/ package.json README.md

# 3. CI/CD流水线中的插件构建
tar -xzf extension-source.tar.gz
npm install
vsce package
```

**IDE插件的分发格式：**

不同IDE对压缩格式的偏好各不相同：

| IDE | 插件格式 | 开发时常用压缩 | 源码分发偏好 |
|-----|----------|---------------|-------------|
| VSCode | .vsix (zip) | zip/tar.gz | tar.gz |
| IntelliJ | .jar/.zip | tar.gz | tar.gz |
| Eclipse | .jar | tar.gz | tar.gz |
| Sublime | .sublime-package (zip) | tar.gz | tar.gz |

**实际开发场景应用：**

1. **插件模板下载：**

    ```bash
    # 很多插件脚手架工具使用tar.gz分发
    npx create-vscode-ext my-plugin
    # 内部实际执行：
    curl -L template-url.tar.gz | tar -xz
    ```

2. **跨平台开发：**

    ```bash
    # Linux/Mac开发者习惯
    tar -czf vscode-theme-dark.tar.gz themes/ package.json

    # Windows开发者上传到GitHub Releases
    # GitHub Actions自动将tar.gz转为各平台格式
    ```

3. **插件源码管理：**

    ```bash
    # 开源插件的Release流程
    git archive --format=tar.gz --prefix=my-plugin/ HEAD > my-plugin-1.2.3.tar.gz
    ```

**为什么IDE生态偏爱tar.gz？**

1. **保持权限信息：** tar.gz能保持文件的执行权限，对脚本类插件很重要
2. **更好的压缩比：** 源码文件通常包含大量文本，gzip压缩效果更好
3. **Unix工具链兼容：** 大部分开发工具原生支持tar.gz解压
4. **Git友好：** 与Git的archive命令天然集成

**实用技巧：**

```bash
# 快速创建不包含开发文件的插件包
tar -czf clean-extension.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='src/**/*.test.ts' \
    .

# 验证插件包内容（不解压）
tar -tzf my-plugin.tar.gz | head -20

# 解压插件到临时目录进行测试
mkdir temp-test && tar -xzf plugin.tar.gz -C temp-test
```

这就是为什么我在Docker部署时对tar格式"刮目相看"的原因，它不仅仅是个压缩工具，更是整个开发生态链的重要一环！

## git进阶

### git stash 的正确打开方式

有时候改到一半突然要切分支救火？`git stash` 就是你的“临时储物柜”。但用不好容易把东西“塞丢”。

**常用命令速记：**

```bash
# 保存当前改动（含暂存区），并写上备注
git stash push -m "WIP: 修复登录逻辑"

# 交互式只保存部分改动（按h/?看帮助）
git stash push -p -m "WIP: 只stash选中的hunk"

# 包含未跟踪文件（新建但未git add）
git stash push -u -m "WIP: 包含未跟踪文件"

# 查看和预览差异
git stash list
git stash show -p stash@{0}

# 取回改动（apply保留stash，pop取回并删除）
git stash apply stash@{0}
git stash pop

# 还原暂存状态（连同index一起恢复）
git stash apply --index stash@{0}

# 删除指定/全部stash
git stash drop stash@{2}
git stash clear
```

**坑点提醒：**

- `pop` 会在应用成功后删除记录，冲突中断时容易“半上不下”，稳妥选 `apply` + `drop`。
- 混用 `-u` 可能把一堆未跟踪文件塞进来，回收时容易冲突；建议对生成物（dist、logs）用 `.gitignore` 管住。
- 长期 stash 容易遗忘，习惯用 `-m` 写清楚缘由；超过两条就该考虑拉个临时分支提交。

**更优实践：**

```bash
# 直接把当前工作变成临时分支，安全又可回溯
git switch -c wip/fix-login
git commit -am "wip: 半成品，先保底保存"
```

### git worktree 并行开发神器

一个仓库，多处同时工作，不用来回切分支，更不需要额外 clone。

```bash
# 查看现有工作树
git worktree list

# 为功能分支创建新的工作树目录
git worktree add ../proj-feature feature/improve-login

# 基于远程分支创建并检出到新工作树
git worktree add -b feature/abtest ../proj-abtest origin/main

# 清理已合并/不再需要的工作树
git worktree remove ../proj-feature
```

**使用场景：**

- 同时修复线上 hotfix 与开发新功能，不互相打扰。
- 本地跑两个版本的服务做 AB 对比。

**注意事项：**

- 新目录不能放在原仓库内部（避免嵌套）。
- 分支在不同工作树同时检出是被禁止的（避免踩踏）。

### submodule vs subtree 的取舍

复用子仓库时，常见两条路：`git submodule` 和 `git subtree`。

**核心区别：**

- submodule：主仓库存“指针”，子仓库独立版本。更新需显式 `git submodule update`。
- subtree：把子仓库内容合并到主仓库某目录下，可选择压缩历史（`--squash`）。

**快速上手：**

```bash
# submodule
git submodule add https://github.com/user/lib.git libs/lib
git submodule update --init --recursive

# subtree（把lib放入 libs/lib 目录，并压缩历史）
git subtree add --prefix=libs/lib https://github.com/user/lib.git main --squash

# 后续拉取上游更新
git subtree pull --prefix=libs/lib https://github.com/user/lib.git main --squash
```

**选型建议：**

- 需要独立发布/版本边界清晰/第三方库：选 submodule。
- 倾向扁平化管理/不想额外初始化步骤：选 subtree。

## 跨平台细节

### 换行符 LF vs CRLF 与 .gitattributes

团队跨 Windows / macOS / Linux 开发，最容易“无意义 diff”的就是换行符与编码。

**推荐设置：**

```gitattributes
# 自动规范文本文件换行
* text=auto

# 强制脚本用 LF（避免Linux执行失败）
*.sh text eol=lf
*.bash text eol=lf
Dockerfile text eol=lf

# Windows 脚本保留 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf

# 二进制与图片禁止当文本处理
*.png -text
*.jpg -text
*.gif -text
*.pdf -text
*.zip -text
```

**本地 Git 建议：**

```bash
# macOS/Linux
git config --global core.autocrlf input   # 提交时转LF，检出不改

# Windows（两种都可，二选一）
git config --global core.autocrlf true    # 检出CRLF，提交转LF（更通用）
# 或
git config --global core.autocrlf input   # 避免工作区被自动改行尾
```

**编辑器对齐：**

```editorconfig
root = true

[*]
end_of_line = lf
charset = utf-8
insert_final_newline = true
indent_style = space
indent_size = 2

[*.bat]
end_of_line = crlf
```

**修复历史被错误换行污染：**

```bash
# 新增 .gitattributes 后，重新规范索引
git rm --cached -r .
git reset --hard
```

## 压缩与发布进阶

### tar.zst / 7z / tar.gz 该怎么选

当体积和速度都很敏感时，可以考虑更现代的压缩算法。

**经验结论：**

- tar.zst（zstd）：压缩/解压都很快，压缩比通常优于 gzip；适合 CI 构建缓存与大体量源码归档。
- 7z（LZMA2）：极致压缩比，但压缩慢；适合离线分发、长期归档。
- tar.gz：生态最广、工具最友好；适合“到处都能用”的默认选择。

**命令小抄：**

```bash
# zstd：-T 并发，-19 高压缩（时间更长）
tar -I 'zstd -T0 -19' -cf archive.tar.zst src/
tar -I zstd -xf archive.tar.zst -C /target

# 7z：极限压缩
7z a -t7z -m0=lzma2 -mx=9 -mmt=on archive.7z src/

# gz：兼容性最佳
tar -czf archive.tar.gz src/
```

**发布建议：**

- 开源项目 Release：提供 `tar.gz` 为主，额外附上 `tar.zst`（写明需 zstd）。
- 内网/CI 工具链：优先 `tar.zst` 提升速度；注意构建机需安装 zstd。

以上就是这次的补充小结：把“应急的 stash”“并行的 worktree”“复用的子仓”“跨平台的换行”和“压缩选型”这几件日常高频小事盘清楚，你的团队协作和交付体验会明显顺滑起来。🎯
