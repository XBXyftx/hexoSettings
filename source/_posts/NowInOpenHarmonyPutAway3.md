---
title: NowInOpenHarmony上架笔记之后端部署优化
date: 2025-10-12 14:17:05
tags:
  - 开源之夏
  - 鸿蒙
  - 项目
  - 技术向
  - NowInOpenHarmony
cover:  /imgs/ArticleTopImgs/NowInOpenHarmonyPutawayTopImg.jpg
description: NowInOpenHarmony上架笔记2，记录在后端初次部署后反复出现
typewriter: 🚀 从开源之夏到应用上架的完整征程！本文记录了NowInOpenHarmony项目后端服务的部署优化过程，重点关注宝塔面板的使用以及后端运维的技术细节。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

之前我们已经完成了对NowInOpenHarmony后端服务的部署，但是依旧会时不时的出现CPU占用率跑满的情况，第一次遇到的时候并没有保留日志，这一次我又遇到了相同的情况，下决心要解决这个问题。于是，这篇文章就应运而生了。

这个活看起来确实不像是开发该干的，但是对于个人开发者来说肯定是不会有专人来辅助自己进行运维的，与此同时自己去进行优化也是对于项目架构思想以及Vibe Coding能力的一次锻炼。

## 问题数据捕获与分析

### 起因

在上一天文章中我们仅仅是针对于自己的后端进行了优化，并没有真正意义上的去整个后端进行监测和优化，毕竟我们的后端是包含了两个docker容器。一个是我们的后端服务，一个是我们的WebDriver服务，这是当前我们后端服务数据源爬虫所刚需依赖的在线容器。针对于服务端的代码我已经反复让GPT帮助我进行修改优化以及死循环可能性的测试了，同时也降低了爬虫所使用线程池的数量，但是依旧是没有解决问题。于是我就怀疑是不是我们的WebDriver服务出现了问题。

恰好今天上午在登陆宝塔面板检查运行情况时发现了相同的问题，我一登陆上去就发现CPU的占用率再一次被拉满了。

这一次我及时的进行了截图留存。

![1](NowInOpenHarmonyPutAway3/1.jpg)

我操了，查看进程占用率居然要氪金。我真服了，先继续看截图吧，后面问AI要命令去查看进程的资源占用情况吧。

![2](NowInOpenHarmonyPutAway3/2.jpg)

![3](NowInOpenHarmonyPutAway3/3.jpg)

![4](NowInOpenHarmonyPutAway3/4.jpg)

![5](NowInOpenHarmonyPutAway3/5.jpg)

到这里可以看出，我的后端服务容器的占用率始终是很稳定的，WebDriver容器会经常性的出现占用率飙升到200%的情况，这是我完全没想到的，首先是我压根就不知道占用率还能突破100%，其次是我不理解为什么从官方镜像进行拉去并创建的容器会出现这种不稳定的情况。随后我立刻下载了最近三天的日志文件。

### 告警形式

这个时候我突然想到为什么我之前明明设置了CPU5分钟内的均值到达80%后就给我发送邮件进行提醒，但是我却一封邮件都没收到过，所以我就去检查了一下告警设置和告警日志。

![6](NowInOpenHarmonyPutAway3/6.png)

原来告警是正常的触发了，是因为我163邮箱的服务器设置有问题。我去检查了一下决定帮顶一下公众号通知方式，这种方式更加保险，毕竟没有需要自己配置地址和密钥的步骤，都是由官方进行配置的。

![7](NowInOpenHarmonyPutAway3/7.png)

### 问题分析

![8](NowInOpenHarmonyPutAway3/8.jpg)

在观察了一下CPU整体的占用率图之后发现，这个问题是经常出现的占用率是经常性的飙高。这时我突然想到，不会我的后端服务也一并将我的流量包耗尽了吧（我还得留着当我的博客服务器啊啊啊啊）。

![9](NowInOpenHarmonyPutAway3/9.png)

奥还好并没有。

现在我就怀疑会不会是WebDriver的镜像对于我服务器的负担太重了？还是什么其他原因。
