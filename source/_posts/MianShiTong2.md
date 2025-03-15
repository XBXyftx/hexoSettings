---
title: 面试通项目开发笔记2
date: 2025-03-11 17:01:28
tags:
  - 鸿蒙
  - 技术向
  - 项目
  - V2
top: 11
cover: /img/ArticleTopImgs/MSTTopImg.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://XBXyftx.github.io
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

Hello world!我又回来开发面试通项目啦~

还没看过第一篇的建议先回头去补一补[面试通项目开发笔记](https://xbxyftx.github.io/2025/02/27/MianShiTong/)

上一篇中我们费劲千辛万苦完成了准备阶段的工具类封装：

* 基于`hilog`封装了日志工具类`Logger`
* 封装了利用应用上下文对象获取当前窗口并设置窗口沉浸式效果的工具类`FullScreen`
* 准备好了修改深浅色模式时所需要的状态栏文字颜色切换工具`StatusBar`

随后进入正式阶段，我们完成了首页的组件划分与封装，以及首页的布局设计与实现：

* 首先是整体应用最外层`Tabs`组件的构建，在其中拆分出了首页、项目、面经、我的四个页面的组件。
* 然后是首页组件的构建，我们由上到下封装了搜索、打卡、轮播图、题目难度标签等公共组件，还封装了独属于首页的专属组件，分类题目列表以及分类筛选按钮。
* 随后我们对原有的Axios请求对象封装进行了重构，填写了项目后端API的基地址，编写了获取请求对象的泛型函数将所需输入的泛型进行化简，并设置了拦截器用于简化返回的数据。
