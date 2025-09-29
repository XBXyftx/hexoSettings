---
title: 编程小知识点
date: 2025-09-29 14:29:20
tags:
  - 技术向
cover:  /imgs/ArticleTopImgs/NowInOpenHarmonyPutawayTopImg.jpg
description: NowInOpenHarmony上架笔记
typewriter: 🚀 从开源之夏到应用上架的完整征程！本文记录了NowInOpenHarmony项目从开发完成到正式上架的全流程实践。深入探索了服务器部署的技术细节，包括Docker容器化、宝塔面板操作、环境配置等核心技术。特别详细地记录了部署过程中遇到的tar格式技术难题及其解决方案，通过实际踩坑经历深入理解了很多技术细节的本质区别。从GitHub分支管理到Ubuntu服务器配置，从环境搭建到镜像构建，每一个步骤都有详细的截图和说明。这不仅是一次技术实践的记录，更是从学生开发者向产品开发者转变的重要里程碑，见证了第一个正式上架应用的诞生过程。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

"hello world"欢迎来到我的新文章，我的朋友。我之所以突然想开这样一个不知道是干嘛的文章主要是在因为我经常混迹在各种技术群聊中去潜水，去窥视大佬的生活，听大佬讲话或多或少会有一些知识会流到我脑子里的吧（少女折寿中）。

![1](ProgrammingTips/1.png)

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
