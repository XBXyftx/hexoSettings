---
title: 鸿蒙网络请求学习笔记
date: 2025-01-27 17:26:07
tags:
  - 鸿蒙
  - 技术向
  - 网络请求
cover: https://raw.githubusercontent.com/XBXyftx/hexoimgs/main/20250127014253.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://XBXyftx.github.io
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---
# http网络请求

## 核心概念

### 服务器

在网络上提供服务器的一台电脑，比如提供数据服务

### http模块

鸿蒙内置的模块，专门用于处理http网络请求，用http协议与服务器进行交流

可以用 `import http from '@ohos.net.http'`来进行调用。

由于需要进行网络请求，所以我们还需要在配置文件 `module.json5`下添加如下代码

```ArkTS
"requestPermissions": [
   {
      "name": "ohos.permission.INTERNET"
    }
 ],
```

完整代码如下

```ArkTS
{
  "module": {
    "name": "entry",
    "type": "entry",
    "description": "$string:module_desc",
    "mainElement": "EntryAbility",
    "deviceTypes": [
      "phone",
      "tablet",
      "2in1"
    ],
    "deliveryWithInstall": true,
    "installationFree": false,
    "pages": "$profile:main_pages",
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET"
      }
    ],
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entryability/EntryAbility.ets",
        "description": "$string:EntryAbility_desc",
        "icon": "$media:layered_image",
        "label": "$string:EntryAbility_label",
        "startWindowIcon": "$media:startIcon",
        "startWindowBackground": "$color:start_window_background",
        "exported": true,
        "skills": [
          {
            "entities": [
              "entity.system.home"
            ],
            "actions": [
              "action.system.home"
            ]
          }
        ]
      }
    ]
  }
}
```

### HTTP协议

协议基本可以理解为格式，类似于写信写邮件的格式规范，规定了客户端与服务器通信时的格式。

三者关系大致如下图所示。

![2](https://raw.githubusercontent.com/XBXyftx/hexoimgs/main/20250127181340.png)

### URL

URL（Uniform Resource Locator）统一资源定位符，相当于信封上目的地的地址，每一个有效的URL都指向着唯一的一个资源。

就比如我现在这篇博客的地址

```
https://xbxyftx.github.io/2025/01/27/%E9%B8%BF%E8%92%99http/
```

`https`是协议 `xbxyftx.github.io`是域名 `2025/01/27/%E9%B8%BF%E8%92%99http/`是资源地址。

域名指的是你要访问哪一台服务器，而一个服务器中会有很多的资源存放在不同的位置，所以需要在域名后加上资源地址来指向对应资源。

### JSON

[JSON](https://developer.mozilla.org/zh-CN/docs/Glossary/JSON) 是一种按照 JavaScript 对象语法的数据格式，虽然它是基于 JavaScript 语法，但它独立于 JavaScript，许多程序环境能够读取（解读）和生成 JSON。

目前json主要分为两种，json和json5。json5的诞生主要是为了解决json不支持添加注释的问题，两者功能类似。在鸿蒙的stage模型的工程文件中包含了大量的json5文件，是鸿蒙原生应用的重要组成部分。

其语法规则大致为以下几点：

1. **是一个字符串（配置文件中两边可以不写引号）**
2. **属性名用双引号包裹，**
3. **属性值如果是字符串也必须用双引号包裹**
4. **对象****{}****,数组****[]**

就像是以下格式就是一个标准的json字符串

```ArkTS
{
	"name":"XBXyftx",
	"age":22,
	"fruits":["apple","pear","grape"]
}
```

当然json经常被拿来和xml进行比较，就比如上面的json字符串，转化为xml就是这样：

```xml
<root>
	<name>XBXyftx</name>
	<age>22</age>
	<fruits>apple</fruits>
	<fruits>pear</fruits>
	<fruits>grape</fruits>
</root>
```

而json相对于xml的主要优势在于：

* 没有结束标签,长度更短,读写更快
* 能够直接被JavaScript解释器解析
* 可以使用数组

#### json与对象的互相转化

在鸿蒙中，我们可以使用`JSON.parse()`方法来解析json字符串。

```ArkTS
interface IPeople{
  name:string
  age:number
  fruits:string[]
}
const json:IPeople = JSON.parse('{"name":"XBXyftx","age":22,"fruits":["apple","pear","grape"]}')
console.log(json.name)
console.log(json.age.toString())
console.log(json.fruits.toString())
```

输出结果如下

```ArkTS
XBXyftx
22
apple,pear,grape
```

而当我们需要将对象转化成json字符串时，可以使用`JSON.stringify()`方法。

```ArkTS
const json2:IPeople = {
  name:'A',
  age:18,
  fruits:['苹果','香蕉']
}
console.log(JSON.stringify(json2))
```

输出结果如下：

```ArkTS
{"name":"A","age":18,"fruits":["苹果","香蕉"]}
```

## http模块的使用

```
//导入http模块
import { http } from '@kit.NetworkKit';
//创建http请求模块
const req = http.createHttp()
//发送请求到指定URL
req.request('https://api-vue-base.itheima.net/api/joke')
  .then((res:http.HttpResponse)=>{
    AlertDialog.show({
      message:JSON.stringify(res)
    })
  })
```

then事件用于处理http请求接收到的响应数据，当成功获取到响应后就会进入到then代码块中。

获取到的数据如下图所示。

![](https://raw.githubusercontent.com/XBXyftx/hexoimgs/main/20250127223839.png)

分析获取到的数据可知我们所需要的笑话的键值为 `"result"`，由此我们就可以使用`res.result.toString()`

```
import http from '@ohos.net.http';
@Entry
@Component
struct Notebook_use {
  @State message: string = 'Hello World';
  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(20)
        Button('看笑话')
          .onClick(() => {
            const req = http.createHttp()
            req.request('https://api-vue-base.itheima.net/api/joke')
              .then((res: http.HttpResponse) => {
                // AlertDialog.show({ message: JSON.stringify(res) })
                this.message = res.result.toString()
              })
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}
```

这样我们就可以根据返回的json数据来进行UI显示了。
这就是一个简单的http网络请求，和在本地写好数据集来进行UI显示的效果是一样的，整体思路是不变的。

