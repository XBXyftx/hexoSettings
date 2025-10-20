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
typewriter: 🚀 从开源之夏到应用上架的完整征程！本文记录了NowInOpenHarmony项目从开发完成到正式上架的全流程实践。深入探索了服务器部署的技术细节，包括Docker容器化、宝塔面板操作、环境配置等核心技术。特别详细地记录了部署过程中遇到的tar格式技术难题及其解决方案，通过实际踩坑经历深入理解了很多技术细节的本质区别。从GitHub分支管理到Ubuntu服务器配置，从环境搭建到镜像构建，每一个步骤都有详细的截图和说明。这不仅是一次技术实践的记录，更是从学生开发者向产品开发者转变的重要里程碑，见证了第一个正式上架应用的诞生过程。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

之前我们已经完成了对NowInOpenHarmony后端服务的部署，但是依旧会时不时的出现CPU占用率跑满的情况，第一次遇到的时候并没有保留日志，这一次我又遇到了相同的情况，下决心要解决这个问题。于是，这篇文章就应运而生了。