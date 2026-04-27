---
title: 怎样用好 Vibe Coding，大幅减少重复编码？
date: 2026-04-27 21:20:55
tags:
  - AI
  - 技术向
  - K2.6
  - KimiCode
  - DeepSeek-V4-Pro
cover: /imgs/ArticleTopImgs/VibeTipsTopImg.webp
description: Vibe Coding经验分享
typewriter: 
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

所谓vibe coding氛围编程觉得其实就是借助AI的力量去帮你写代码，但是很多人觉得有了AI之后就不需要程序员了，只要有了AI，我想做什么他都能帮我写出来。但真到自己上手的时候：一是找不到强力的模型。二是不会用AI编程的工具，三是只会向AI去描述自己抽象到极致的想法，完全不考虑实际实现起来有多么的困难，也不考虑自己的描述是否能让AI理解自己所真正想要的东西，最后大概率的结果就是得到了一坨，一坨与自己想法差距巨大，AI味十足的shit。而我，作为一名科班出身的程序员，经历了古法编程的时代见证了AI的崛起，从在网页上问AI自己这段代码哪儿错了，到使用claude code进行完整的工程级的项目开发。自身对于vibe coding的经验可以说是比较丰富了，市面上主流的Agent基本都使用过。

同时我自身所处的领域也比较特殊，鸿蒙开发对于绝大多数模型来说，都是没有过多训练语料的一个领域，对于鸿蒙开发相关的基础知识在训练数据里所占的比例是远低于其他专业技术栈的，其生成的代码质量，大多依赖于我给予的信息以及仿照现有的代码。因此，我也被迫去学习了很多很多关于Agent方面的知识，以便于弥补模型能力的不足。毕竟对于其他语言，你哪怕没有上下文，模型简单读个局部一下也都能猜到你要干什么，而且生成的也都是有成熟案例的最优质的代码。相反，对于鸿蒙开发来说，上下文就是至关重要的。如果你没有严格的约束以及提供充足的API信息的话，模型会按照其他前端语言的范式去进行编写，最终就会产生大量的语法规范上的问题，以及接口乱用的问题。
