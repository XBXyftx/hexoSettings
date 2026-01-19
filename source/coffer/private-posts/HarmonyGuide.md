---
title: 孙妈专供鸿蒙特性速览手册
date: 2025-07-16 10:30:00
tags: [个人, 想法, 测试]
categories: [私密日记]
description: 孙妈专供来了孙妈专供来啦！！！
cover: /imgs/cofferTopImg/SUNHarmonyTopIMG.webp
---

## 前言

为了让孙妈快速备考特此提供本指引文档。

{% note danger flat %}
孙妈专用，凡人勿入！！！
{% endnote %}

来，咱们就跟着指南文档走。

![1752655422806.png](https://bu.dusays.com/2025/07/16/6877664161ae4.webp)

## 一多

这里我就先放一下[指南文档传送门](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-multi-device-overview)

### 工程组织重点

1. 三种层级的一多：**界面级，功能级，工程级**
2. 应用三层架构：**Product层（产品定制层），Feature层（基础特性层），Common层（公共能力层）**

三大层级**高内聚低耦合**。只能逐级向下依赖不能反向向上依赖。也就是说**Product层**可以依赖**Feature层**和**Common层**，**Feature层**可以依赖**Common层**，但是**Common层**不能依赖**Product层**和**Feature层**。

### 界面开发重点

核心就是两种[响应式](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-multi-device-responsive-layout)和[自适应](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-multi-device-adaptive-layout)。

#### 自适应

下面这个表看一下就好了，知道大概有哪些内容，可以看这篇[博客](https://xbxyftx.top/2025/03/16/yiDuo/#%E8%87%AA%E9%80%82%E5%BA%94%E5%B8%83%E5%B1%80)

| 自适应布局能力 | 使用场景 | 实现方式 |
|--------------|----------|----------|
| 拉伸能力 | 容器组件尺寸发生变化时，增加或减小的空间全部分配给容器组件内指定区域。 | Flex布局的flexGrow和flexShrink属性 |
| 均分能力 | 容器组件尺寸发生变化时，增加或减小的空间均匀分配给容器组件内所有空白区域。 | Row组件、Column组件或Flex组件的justifyContent属性设置为FlexAlign.SpaceEvenly |
| 占比能力 | 子组件的宽或高按照预设的比例，随容器组件发生变化。 | 基于通用属性的两种实现方式：<br> - 将子组件的宽高设置为父组件宽高的百分比<br> - layoutWeight属性 |
| 缩放能力 | 子组件的宽高按照预设的比例，随容器组件发生变化，且变化过程中子组件的宽高比不变。 | 布局约束的aspectRatio属性 |
| 延伸能力 | 容器组件内的子组件，按照其在列表中的先后顺序，随容器组件尺寸变化显示或隐藏。 | 基于容器组件的两种实现方式：<br> - 通过List组件实现<br> - 通过Scroll组件配合Row组件或Column组件实现 |
| 隐藏能力 | 容器组件内的子组件，按照其预设的显示优先级，随容器组件尺寸变化显示或隐藏。相同显示优先级的子组件同时显示或隐藏。 | 布局约束的displayPriority属性 |
| 折行能力 | 容器组件尺寸发生变化时，如果布局方向尺寸不足以显示完整内容，自动换行。 | Flex组件的wrap属性设置为FlexWrap.Wrap |

#### 响应式

响应式布局的重点在于**断点**，这个机制和web中的媒体查询最大宽度为多少px类似。

![1752656421975.png](https://bu.dusays.com/2025/07/16/68776a29064b1.webp)

![1](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20250711181253.87610381517529925957874265428532:50001231000000:2800:ADEA2F2FCC8366405021EF28E7F14DDE6C7DD31D3A3F41FBEE1DB4757FB047B4.webp)

{% note success flat %}
横向断点以应用窗口宽度为判断条件，纵向断点根据应用窗口的高宽比进行判断
{% endnote %}

响应式布局的核心组件是[GridRow](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ts-container-gridrow)和[GridCol](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ts-container-gridcol)。

{% note success flat %}
一个GridRow组件只能以一个或多个GridCol为组件。GridCol可以包含由一个根子组件。

```ts
@Entry
@ComponentV2
struct Index {

  build() {

    GridRow(){

      GridCol(){
        Column(){

        }
      }
      GridCol(){
        Column(){

        }
      }
      GridCol(){
        Column(){

        }
      }
    }

  }
}
```

{% endnote %}

GridRow就是一个白板，GridCol就是白板上的海报，一个宽“12列”的白板可以一行放下一个宽为“12列”的海报也可以放下一个宽“8列”和一个宽“4列”的海报。整体的排布顺序从左向右从上向下。同时也可以设置{% label 左边开始偏移的列数 red %}来进行留空或居中等操作。

## 自由流转

[传送门](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/distributed-overview)

这个玩意咱们讨论过很多次，核心就是在同一账号的星河版账号上可以自由切换设备同时保留当前的应用进度。

核心就一个词，{% label 分布式软总线 red %}。

![1](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20250716163547.63664843999279118532520875091958:50001231000000:2800:432CCB2DCCDCE8D02D32916D779B12404C80E9F1269E7B3F1C774946B2C0BF78.webp)

一张图看懂了就行，然后记住三个接口就行。

- 在源端，通过UIAbility的onContinue()回调，开发者可以保存待接续的业务数据
- 在对端，同一UIAbility通过onCreate/onNewWant接口恢复业务数据

![2](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20250716163547.33317382165895960652785701896989:50001231000000:2800:C0EB417E3AC7E678EFD578D75603512C38C6CFC534BB1F676C5F535240D7513A.webp)

小结一下onCreate是冷启动，onNewWant是热启动。

当然还包含[跨设备拖拽](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/distributed-drag)和[跨设备剪切板](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/distributed-pasteboard)这些看文档就好也没啥可说的。

## 数据持久化

当然从分布式架构还可以扯出来一块就是数据持久化与数据同步。首先可以浅浅看一下[这篇博客](https://xbxyftx.top/2025/05/23/HarmonyOSPersistent/)

这里主要是说一下同应用跨设备数据同步。核心的三种同步对象就是键值型数据库、关系型数据库以及分布式数据对象。前两种就是数据库，后面这个**分布式数据对象是应用流转时获取接续数据用的**

![1](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20250716162323.68055553184127680288373629482746:50001231000000:2800:F3EECA9D64115D569022B3B3243726E1CF1215D4F32DC8B2E9DA6C67DB7C30F9.webp)

分布式数据对象即实现了{% label 对“变量”的“全局”访问 pink %}。向应用开发者提供内存对象的创建、查询、删除、修改、订阅等基本数据对象的管理能力，同时具备分布式能力。

## AI

这块我是真的没太研究过，就直接[传送门](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/cann-kit-guide)了

然后就是与AI相关的[向量数据库](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/data-persistence-by-vector-store)
