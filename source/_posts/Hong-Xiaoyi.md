---
title: 鸿小易二代！
date: 2025-11-04 19:45:52
tags:
  - 鸿蒙
  - 技术向
  - 项目
  - V2
  - 鸿小易
  - 扣子
  - 智能体
top: 15
description: 鸿小易（第二代），你的鸿蒙开发好帮手！！！
typewriter: 🤖 打造专属鸿蒙开发AI助手的完整指南！鸿小易二代在孙妈，扎导，黄导，卜导的助力下能走多远呢？让我们拭目以待吧！！！
cover: /imgs/ArticleTopImgs/hxyTopImg.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

上一次鸿小易的开发整体都是属于对于第一个完整项目的探索心态去做的，模仿着子安学长曾经的代码规范去照猫画虎，而现在完全不一样了，我在经历了NowInOpenHarmony项目的开发之后，我现在对于整体代码的规范性，以及鸿蒙一多的三层架构的作用和应当拥有的一些基础功能都有了一定的了解。

## 基础功能迁移

### API升级

当下鸿蒙6已经公测，我们也没有理由再用我们原本的API15去继续开发了，我们就直接干到最新的API20就好了。

### 三模块创建与依赖关系建立

这里就没什么好说的就直接创建动态资源共享包之后，再将我们的entry模块改名为product，最后再在feature和product的`oh-package.json5`中的"dependencies"字段中去添加我们的包路径并自动执行`ohpm install`命令就好。

```json
{
  "name": "feature",
  "version": "1.0.0",
  "description": "Please describe the basic information.",
  "main": "Index.ets",
  "author": "",
  "license": "Apache-2.0",
  "packageType": "InterfaceHar",
  "dependencies": {
    "common": "file:../common"
  }
}
```

类似如此，也是简单的给我自己留个档，以后开发好找。

### 日志工具迁移

Logger日志工具这属于是我们更古不变的东西了，每个开发者都应该是有这样一套日志工具的，标志着自己的识别码、负责的业务功能分区识别码等。这里我们直接复制过去就行。

```json

