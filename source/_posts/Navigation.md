---
title: Navigation与NavDestination
date: 2025-03-13 20:06:11
tags:
  - 鸿蒙
  - 技术向
  - V2
top: 11
cover: https://raw.githubusercontent.com/XBXyftx/hexoImgs4/main/202503111700917.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://XBXyftx.github.io
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

在开发面试通的过程中我突然想做一些丝滑的动画，但我发现我好像从来没用过`Navigation`和`NavDestination`，所以我决定好好研究一下这两个组件的用法。
接下来我就会和大家一起去学习这两个组件的使用以及动画效果的是实现。

## 组件用途

这里还是先附上两者的官方文档：
[Navigation API15](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ts-basic-components-navigation)

[NavDestination API15](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ts-basic-components-navdestination)

这两者都是用于进行页面跳转的组件，`Navigation`是用于定义导航图，而`NavDestination`则是用于定义具体的页面。
两者自带一多能力，可以依据当前设备进行导航方式的选择。

![1](Navigation/1.png)

这是在直板机场景下采用单栏显示模式，子页面的内容会直接替换掉主页面的内容。
而当我们处于折叠屏展开或是平板场景下则会采用分栏展示模式，子页面的内容会被分栏展示在主页面的右侧。

![2](Navigation/2.png)

两者的区别如下图所示。

![3](Navigation/3.png)

`Navigation`常用于首页的根组件，两者结合常用于类似设置的场景，可以进行多级跳转，或在平板上进行分栏展示子页面内容，同时支持系统默认动画或是自定义转场动画。其效果可以参考以下视频：

直板机：
<video width="100%" controls>
  <source src="4.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

平板：
<video width="100%" controls>
  <source src="4.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

## Navigation的跳转逻辑

对于`Navigation`组件来说它不能直接想是`router`一样直接跳转，而是需要配合一下几个辅助条件才能实现跳转：

* 子页面根组件`NavDestination`
* 路由表`RouterMap`
* 页面栈`NavPathStack`
  
这几者的关系如下图所示：

![6](Navigation/6.png)

`Navigation`作为路由导航的根视图容器，而`NavDestination`则是用来显示`Navigation`的内容区域，一般作为跳转的目标页面。

### `RouterMap`

路由表`RouterMap`是用于定义页面跳转的规则，它负责存储路径和对应视图组件的映射关系，我们可以将他理解为一个小型的数据库，我们要去哪里都需要通过在`RouterMap`中查找路径来实现跳转。

而在跳转时只需要通过`NavPathStack`提供的路由方式传入需要跳转的页面配置名称即可。

然后对于`RouterMap`的配置项及其含义我们可以参考下表：

| 配置项 | 含义 |
| --- | --- |
| `name` | 页面名称，用于在`NavPathStack`中进行跳转 |
| `pageSourceFile` | 跳转目标页面在当前包内的路径，是相对于`src`文件夹的相对路径 |
| `buildFunction` | 目标页入口函数名称，用于构建目标页面的视图组件，必须以@Builder进行修饰 |
| `data` | 自定义字段。可以通过配置项读取接口getConfigInRouteMap获取 |

#### `RouterMap`的配置文件

为了存储`RouterMap`的配置项，我们需要在`resources/base/profile`文件夹下创建一个配置文件，并将其命名为`router_map.json`。

然后我们在`module.json5`中添加如下配置，用以绑定`routerMap`的配置文件：

```json5
{
  "module": {
    "routerMap": "$profile:router_map",
    ......
  }
}
```

然后我们就可以在`router_map.json`中添加我们的配置项了，如下所示：

```json5
{
  "routerMap" : [
    {
      "name":"Second",
      "pageSourceFile":"src/main/ets/pages/Second.ets",
      "buildFunction": "SecondNevBuilder",
      "data":{
        "description": "这是第二页"
      }
    }
  ]
}
```

这样我们就完成了对`RouterMap`的配置。
