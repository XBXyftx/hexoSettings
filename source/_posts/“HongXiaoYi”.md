---
title: 鸿小易项目开发笔记
date: 2025-03-31 15:34:18
tags:
  - 鸿蒙
  - 技术向
  - 项目
  - V2
  - 鸿小易
  - 扣子
  - 智能体
top: 15
swiper_index: 1
description: 鸿小易，你的鸿蒙开发好帮手。
cover: /img/ArticleTopImgs/hxyTopImg.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 概述

本项目是基于`扣子coze`平台搭建的智能体对话流后端，接入用鸿蒙开发制作的客户端，以及Web技术开发的网页端的智能体应用。
专注于回答鸿蒙开发相关问题，用以弥补当前市面上并没有能准确回答鸿蒙开发相关问题的AI模型的空缺。
本智能体以鸿蒙开发文档为知识库进行数据检索与解答，目前还有一些幻觉与混淆问题，但在持续优化中。

目前准备开始尝试接入华为账号登录系统以及应用接续功能。

## 前言

在当下这个AI大爆炸的时代，如果再去做一些传统的应用不仅竞争压力大，开发周期长，涉及的技术栈众多，如果不系统的进行学习，开发时会因为基础不牢看不懂一些专业名字，不明白其含义而导致耗费大量时间去debug。但如果我们为了一个项目而去逐一的系统学习多个技术栈，那学习成本又会高的离谱，需要花费极长的时间才能达到一个项目的开发水平，这对于我们的学习来说是不现实的。

而AI的时代，任何一个普通人都可以拥有“100个AI员工”来给自己打工，我们不能再去死学知识，你学一辈子也是追不上AI的知识储备量的，所以我们要学会利用AI去做到以往我们所不敢想象的事情，让自己在各个领域都能利用AI去辅助自己完成自己的事业。去**让自己成为`“超级个体”`**。

而我开发这个应用的灵感是来自于我自身在学习鸿蒙开发的过程中，经常遇到一些问题，在各个社区搜索文章帖子的确是能找到一些答案，但很显然大多数帖子的API版本或是DevEcoStudio的日期太过陈旧，尤其是对于鸿蒙这样一个新兴技术，API的更新速度是非常快的，所以我就想能不能开发一个应用，让我在学习鸿蒙开发的过程中，能快速的找到答案，而不是在各个社区搜索文章帖子，这样不仅浪费时间，而且还会让自己的学习效率降低。

与此同时我也试图去让AI去给我改BUG写ArkTS代码，但很显然市面上常见的那几家AI对于鸿蒙开发的相关知识都知之甚少，毕竟鸿蒙开发还处于起步发展阶段，尤其是鸿蒙星河版，当前的用户基数，软件生态的完善程度还都有待发展，所以各家AI在训练时也不会有太多鸿蒙相关的数据，尤其是鸿蒙开发的专业数据以及代码。

大多数AI在我给它一段`ArkTS`代码后它的理解都是这是TS的某个第三方库，然后就开始了一些奇怪的`虚构推理`……。而对于其他语言比如C，Java，Python等来说，绝大多数常用API各家大模型都是能熟练地掌握的，所以对于像我这种计算机科班生来说，这种落差还是非常明显的。

所以我就决心要去做一款专门为鸿蒙开发者答疑的AI智能体应用。

## 项目规划

### 前端

对于前端来说我肯定是要制作鸿蒙原生应用的，做成鸿蒙星河版的智能体应用。但与此同时我也会制作一个网页版，毕竟网页版的上线代价是远远低于上架鸿蒙星河版的应用市场的。

### 后端

这个项目的后端只是一个轻量化的后端，只需要实现处理用户的对话请求，分析出关键词进行搜索，综合用户问题进行回复即可。

## 后端开发笔记

### 初识扣子

在遇到扣子之前我一直被困于不会后端这一点上，以往做过的APP或是demo都是用的现成的接口，并没有说是自己开发过后端接口，所以这一直限制着我开发选题种类。
纯粹的拉一个AI的接口过来并没有意义，因为现在市面上并没有能满足我鸿蒙开发需求的AI出现，所以需要的是一个利用AI解析用户的问题并从华为官方文档中拉出相关部分的文档，并依据文档中的内容去进行回答的智能体。

在我们亲爱的孙学长的提点与演示下，我了解到了扣子，这种新的轻量化低代码后端范式。
利用编程的思维进行不同功能模块的拖动式编程，就像是各个功能函数都已经被封装好了我只需要告诉他们该如何去运行而已，这令我兴奋不已。
零基础的人都可以上手实现自己的网站小程序，我这种有编程基础但又没系统学过后端的人，也可以利用扣子来实现自己的后端。

于是我选择了扣子。

### 创建工作流

首先我们要理清楚我们的工作流需要实现哪些功能，每一步的输入输出是什么。

1. 接收前端传回的用户的问题
2. 分析问题中的关键词
3. 从华为官方文档中搜索相关内容
4. 结合用户问题和搜索结果进行回复
5. 返回回复给前端

扣子官方为我们提供了数种写好的功能模块，我们只需要设置输入输出的变量以及相关参数就可以实现我们的工作流。
大体就如下图所示：

![工作流](“HongXiaoYi”/1.png)

对于上面提到的5个核心功能我们所需要的主要功能模块如下：

1. 接收前端传回的用户的问题：`开始触发器`
2. 分析问题中的关键词：`关键词提取大模型`
3. 从华为官方文档中搜索相关内容：`网页浏览插件`以及`知识库检索模块`
4. 结合用户问题和搜索结果进行回复：`答复生成大模型`
5. 返回回复给前端：`返回前端数据`

{% note info flat  %}
当然扣子官方只是提供了市面上一些常见大模型的调用接口，并没有说已经训练好了专门用于处理关键词以及回答问题的模型，所以我们需要自己去编写提示词去告诉AI你是谁你现在需要做什么，以什么样的格式去进行结果的输出。
{% endnote %}

### 关键词提取大模型

本项目的大模型我们统一使用`DeepSeek-V3-0324`，一方面他是我们的开源国产之光，另一方面也是更重要的一方面是它的训练语言中包含了远超国外模型的中文含量，还包含了大名鼎鼎的**“弱智吧”**的高质量中文数据。它对于理解用户用中文进行的提问相比国外的模型是有天然的优势的。
同时其输出的语言风格更贴近中国人的中国话，更符合我们的开发习惯。

![关键词提取大模型](“HongXiaoYi”/3.png)

#### 输入

由于本模型的主要处理目标是从用户的提问中提取关键词，所以我们需要将用户的问题作为输入。

![输入](“HongXiaoYi”/2.png)

#### 提示词

对于提示词，扣子官方已经提供了一些提示词模板，整体我们需要采用md格式来让大模型更好的去理解自己的职责以及我们的需求。

{% note info flat  %}
由于我们的需求是从用户的问题中提取关键词，所以我们需要在提示词中加入`提取关键词`这个关键词，以此来告诉大模型我们的需求。
{% endnote %}

![提示词](“HongXiaoYi”/4.png)

#### 输出

我们在提示词中已经限制了大模型**仅输出十个相关的关键词**，所以我们需要将输出的类型设置为字符串数组，以便我们在后续的代码中进行处理。

![输出](“HongXiaoYi”/5.png)

{% note warning flat %}
限制提取的关键词的数量是为了避免大模型输出太多关键词，因为大模型的发散性思维还是非常厉害的，可能会对用户的问题产生过分解读，导致召回的关键词过多，严重拖慢工作流的回复速度。当然**召回的关键词越多回复准确的概率也就越大**这一点还是需要权衡一下的。
{% endnote %}

#### 搜索依据

虽然我们已经提供了足够详细的提示词，但大模型并不知道鸿蒙开发所需的文档在哪，也不知道自可能的关键词有哪些，所以我们还需要为他提供鸿蒙开发的官方文档链接合集，并且在提供文档URL的同时去提供文档的标题，这样大模型才能更好的去理解我们的需求。

![搜索依据](“HongXiaoYi”/6.png)

这个文档中都是形如`htttps://example.com  | 简介`的链接与链接的简介。大模型就会从这其中寻找与用户提的问题最相关的五个关键词以备后续解析使用。

{% note danger flat  %}
此处的URL数据是使用爬虫技术爬取，我**仅仅**是爬取了鸿蒙开发文档根目录下该文件夹的**全部子文件夹的URL并没有爬取网页内容**，请大家**务必遵纪守法，不要滥用爬虫技术！！！**
{% endnote %}

### 循环体处理

#### 知识库检索URL召回

由于扣子官方提供的知识库检索功能模块只能依据一个字符串检索并返回一个到20个相关内容，但很显然我们不能将最小匹配度降低来实现多个关键词在同一个字符串中进行检索召回，这样可能导致召回的内容并非我们所需的内容。

![循环体处理](“HongXiaoYi”/7.png)

所以我们需要使用循环体来实现多个关键词的检索召回，并且将每个关键词的召回内容进行合并，以便后续的回答生成大模型进行分析。

{% note warning flat %}
循环体本身直接输出的是并非是整个循环结果的集合，它具体输出的模式我并没有太弄清楚，我们需要手动去添加一个循环体中间变量来去将每一次执行的结果进行合并。
{% endnote %}

点开循环体的属性界面添加一个中间变量，命名为`resultSums`，类型为字符串字符串数组，并将输出变量也设置为这个集合。

![循环体处理](“HongXiaoYi”/8.png)

扣子官方提供的循环体模块支持三种循环模式，分别是：

1. 数组循环
2. 指定循环次数
3. 无限循环

这三种循环也是在开发中很常用的三种循环方式，绝大多数语言也都是包含这种三种循环方式的。

* 数组循环可以在每一次循环中自动取出当前数组的元素`item`以及其对应的索引值`Index`,比较适合对**单一数组的每一项进行操作**。
* 指定循环次数就是字面意思，它的循环操作对象**不一定是数组**，但也可以利用索引值同时操作**多个数组**。
* 无限循环可以在循环体中**添加一个条件来控制循环的结束**，比较适合进行一些不知道在多少步会结束，但能明确一定会结束的操作，就像是下棋，每一句的总步数和总时间是未知的，但我们可以通过**判断是否出现了胜利**来判断是否结束。
  
{% note danger flat %}
在使用无限循环的循环体时一定要去**添加一个条件来控制循环的结束**，否则会导致死循环，导致工作流的卡死以及**程序的崩溃**。
{% endnote %}

由于我们的需求是关键词数组的**每一项**进行URL的召回以及后续处理，同时我们**只有一个数组需要进行遍历操作**所以我们需要使用数组循环来进行处理。

![循环体处理](“HongXiaoYi”/9.png)

#### 对召回数据进行格式处理

由于知识库检索模块的**返回值是一个JSON对象**并不是一个单纯的URL字符串，所以我们需要对其进行数据结构的分析以及URL路径的提取处理。

我们对知识库检索模块进行试运行以获取其输出的数据结构：

![对召回数据进行格式处理](“HongXiaoYi”/10.png)

可以看到其返回值中包含了大量的转义符，我对于这个转义符的处理一开始并没有立即的很到位，我还以为我需要在代码中去对其进行处理，所以在定义接口时还特别的添加了像是`"URL\"`这种键值，现在看来有点小蠢了（笑）。

我首先想到的是通过代码模块去进行数据的提取，但我被他给的示例代码给误导了。

![对召回数据进行格式处理](“HongXiaoYi”/11.png)

官方给出的默认代码事例获取外部传入的参数靠的是点语法，但我在使用点语法时始终在报错，于是我决定去看看文档里是怎么说的。

![对召回数据进行格式处理](“HongXiaoYi”/12.png)

好好好，索引格式，nb。`:(`
能不能把示例代码和文档格式对齐啊！！！

修改代码ing……

```js
async function main({ params }: Args): Promise<Output> {
    const URL:string = (JSON.parse(params['input']) as UrlInput).URL\;
    // 构建输出对象
    const ret = {
        "key0": URL,
    };

    return ret;
}
interface UrlInput{
    "URL\\":string
}
```

{% note danger flat %}
此处并非正确代码请勿使用！！！
{% endnote %}

果然是一下子就不报错了呢。

但由于我在局部进行测试时，我都是手动输入手动复制上一个节点的输出然后再输入到下一个节点进行测试的，就导致我复制的内容格式并不正确，包含了太多额外的转义符，导致输出的结果经常带着大量`\\\`这种三连转义符，属实是有点难蚌，所以我就认为是扣子的数据格式问题，所以我采用了更加直接干脆的方式————使用大模型模块，让大模型去做数据处理。

简简单单写个大模型提示词，让大模型去提取出URL路径，然后再将其作为输出返回给下一个节点。

![对召回数据进行格式处理](“HongXiaoYi”/13.png)

的确干脆而且效果显著，整个工作流一下就畅通了。

![对召回数据进行格式处理](“HongXiaoYi”/14.png)

但现在的工作流很显然是存在问题的，就是整体回复速度还是太慢了，最后一个最终结果输出大模型的速度慢是可以理解的，也是必要的思考时间，但我们为了一个单纯的字符串处理也使用大模型来进行处理，这是非常不理智的。

所以我决定再次使用代码进行数据格式的处理。

```js
async function main({ params }: Args): Promise<Output> {
    const URL:string = (JSON.parse(params['input']) as UrlInput).URL;
    // 构建输出对象
    const ret = {
        "key0": URL,
    };

    return ret;
}
interface UrlInput{
    URL:string
}
```

我这次决心不管那些转义符然后再去进行整体的测试而不是手动输入单独的节点测试。

![对召回数据进行格式处理](“HongXiaoYi”/15.png)

这次的测试结果还是非常理想的，和我猜测的一样就是我手动输入的节点测试数据导致无用转义符被意外保留。我只需要按照正常编程一样去处理数据就可以了。不需要考虑转义符问题。
同时本次测试将提取URL的时间从原本的一秒到两秒压缩到了0.06秒左右，这是巨大的提升，尤其是在循环多次的情况下。
当然我们应当对进行包装并使用工作流加以包装处理。

#### 网页信息浏览

由于我们上一步处理出来的只是URL，并不是URL指向的网页内容，所以我们还需要网页阅读插件来去获取网页内容。

![网页信息浏览](“HongXiaoYi”/16.png)

我尝试了这两种网页阅读器，但他们都是基于自己的理解去进行网页内容的总结，并不是整个网页的完整内容，这与我的初心相违背，所以我弃用了他们。
随后我选择利用插件直接获取整个网页的HTML源码然后交给大模型去理解。于是我选择了

![网页信息浏览](“HongXiaoYi”/17.png)

#### 循环体中间变量的处理

由于我们想要让输出的结果是打包以字符串数组的形式进行输出，所以我们还需要在每一次循环中将本次循环的结果添加进中间变量中。

![循环体中间变量的处理](“HongXiaoYi”/18.png)

```js
async function main({ params }: Args): Promise<Output> {
    params['resultSums'].push(params['input']);
    console.log(JSON.stringify(params['resultSums']));
    // 构建输出对象
    const ret = {
        "key0": JSON.stringify(params['resultSums']), 
    };

    return ret;
}
```

{% note success flat %}
本函数其实关键语句仅有`params['resultSums'].push(params['input']);`一句，其他的都是为了便于监测调试结果而添加的。
{% endnote %}

### 并发处理

既然我们已经是利用云上计算了，我们也没有必要再去省那一点空间，我们需要的是更快的回复。
所以循环体中的逻辑我们是可以利用多线程并发来进行处理的，这样可以大大提升结果的输出速度。

![并发处理](“HongXiaoYi”/19.png)

将原来的循环模块改为批处理模块来进行多线程并发处理。

![并发处理](“HongXiaoYi”/20.png)

考虑到以后为了回答精度的调整我们将并发线程以及总处理量都拉高一些为以后调教留出空间。
经过测试整个**并发流程耗时仅一秒**相比于原本的循环体需要11到12秒左右是一个巨大的提升。

同时由于批处理模块的输出是会对所有数据进行自动打包封装的所以我们就不在需要手动处理中间变量来进行数据打包封装了。

### 最终答复大模型

经过前面的工作流处理我们获取了回答用户问题所需要的一部分文档信息，现在我们将再创建一个大模型节点去处理文档信息并去进行最终回答的输出。
对于最终回答大模型的提示词我们不能像之前的大模型提示词一样的去只编写它需要实现的功能、他的工作流是怎样的运作的，我们还需要去写**他给用户的回答应该是以怎样的语气，什么样的语言风格去进行回答**。因为它是**直接与用户去沟通的大模型**而不是一个单纯是被向前在工作流之中给我打工的大模型。

用户既然是来问问题的那我们自然要去限定他的回复语气是耐心地，同时要禁止它对用户进行反问。
与此同时我们要考虑到我们未来的用户群体中可能有海外的技术人员，所以我们不能说让大模型一味地回复中文，而是应该让它回复与提问者一致的语言。

同时为了防止大模型产生幻觉影响最终结果的解读，我们应当尽可能多的去强调原问题的重要性，查到的数据如果经过研判是对解答问题无关的信息那就应当被无视掉。

{% note warning flat %}
如今的大模型大多有着很严重的幻觉问题，所以我们应当将HTML数据和用于原问题输入之外还去输入第一个大模型选出的知识库中的关键词。
{% endnote %}

所以我们可以看到最终回复大模型是有三条线作为输入的。

![最终答复大模型](“HongXiaoYi”/21.png)

最终的工作流如下图所示：

![最终答复大模型](“HongXiaoYi”/22.png)

### 输出格式

对于这一点我其实考虑了几种方案，对于网页端好说，输出的MD格式有很多方式进行渲染，像是我的博客就是用MD编写然后再改写成HTML进行网页显示的。主要问题在于鸿蒙端的渲染方式。之前子安学长在`鸿蒙+DeepSeek探索流失传输新纪元`活动中有提到鸿蒙并没有提供原生的MD渲染组件或是格式转换API，所以我就在考虑是否要直接转化成HTML然后再输出这样其实对于网页对于鸿蒙端来说都是十分便捷的数据格式。

于是我开始在扣子的插件库中寻找我需要的MD转HTML的插件，确实找到了一大堆。

![最终答复大模型](“HongXiaoYi”/23.png)

但效果吗enm……只能说是都不尽如人意了，好像都各自对网页的美学有一套独特的理解，毕竟MD并不会标明背景颜色字体颜色字体粗细的具体数值等CSS样式，就导致这些转换插件所转换出的网页文件有一种野蛮生长的美感。

于是我决定就渲染最原始的MD格式。

在OpenHarmony的三方库中心仓中找到了我的救星：

![MD三方库](“HongXiaoYi”/24.png)

[三方库传送门](https://ohpm.openharmony.cn/#/cn/detail/@lidary%2Fmarkdown)

我们点开他的github库可以看到他整体的渲染效果还是非常理想的。

![MD三方库](“HongXiaoYi”/25.png)

这样一来我们就可以不用再找插件直接去进行MD格式的输出了。

### 转换为对话流

在一开始我对于扣子的理解并不到位，并不清楚他的工作流与对话流有什么区别，所以我就先将这个项目创建为了工作流，但在我测试时发现我只能进行一轮对话。这很显然是不符合我们的需求的，所以我决定将我们的项目转换为对话流。

#### 工作流与对话流的区别

我们在切换成对话流后首先要明白对话流相比于工作流的区别，工作流是一个**一次性的工作流**，它的输入输出都是为了解决一个明确的需求去实现的，而对话流是一个**可以进行多次对话的对话流**，它的工作流执行是可以依据与与用户对话的上下文去进行的，这也是我们需要将我们的项目转换为对话流的原因。
而对于两者优劣势的对比我就直接放官方文档了。

以下是转换后的 Markdown 表格格式：

| **分类**       | **工作流**                                                                 | **对话流**                                                                 |
|----------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------|
| **用途**       | 用于处理功能类的请求，通过顺序执行节点实现功能（如生成报告、海报、绘本等）。               | 基于对话场景，适合交互式复杂业务逻辑（如智能客服、虚拟伴侣等）。                          |
| **节点特性**    | - 大模型节点不支持查看对话历史。<br>- 开始节点无需会话名称。                           | - 模型类节点支持读取对话历史。<br>- 开始节点必须传入会话名称，记录对话上下文。                 |
| **角色配置**    | 不支持角色配置。                                                           | 支持单独配置角色（名称、头像、开场白等），应用于 Chat SDK 或 AI 对话组件绑定场景。             |
| **用户界面**    | 支持布局组件、展示组件等丰富类型。                                           | 仅支持 AI 对话组件（聊天面板形式，适用于移动端/网页端）。                                |
| **发布渠道**    | 支持 API、模板、商店（不支持社交渠道、Web SDK、小程序）。                     | 支持所有渠道（API&SDK、小程序、社交渠道、商店、模板等）。                             |
| **API 调用**    | 通过 `执行工作流` 或 `执行工作流（流式响应）` 接口调用。                         | 通过 `执行对话流` 接口调用。                                               |

##### 关键差异说明

1. **对话历史**：对话流支持上下文记忆，工作流无此功能。
2. **角色配置**：对话流可定制角色属性，工作流无此选项。
3. **交互方式**：工作流为线性执行，对话流为多轮对话。
4. **发布灵活性**：对话流支持更广泛的终端适配（如小程序、社交平台）。

### 角色设定

因为对话流支持设置角色设定，所以在转变为对话流之后我首先需要的就是去设置角色设定。

![角色设定](“HongXiaoYi”/26.png)

### 对话历史信息

扣子的对话流支持提供上下文记忆给大模型，所以我们就可以在最终回复大模型的提示词中加入对话历史信息来进行回答的生成。
但关键词检索大模型并不能添加，因为这样有可能会压榨我们的新问题的关键词找回条数以及精度。

![对话历史信息](“HongXiaoYi”/27.png)

{% note danger flat %}
不过仍有一个现存问题在于，我并没有办法在提示词中像是`{{对话历史}}`这样的方式去引用对话历史信息，所以我只能通过手动写要利用对话上下文去进行分析，我并不确定这样写是否能真的让大模型去阅读当前的上下文信息。效果有待测试。
{% endnote %}

## 鸿蒙端功能测试笔记

### 流式API接口测试

扣子的对话流项目在发布后其接口调用方式是流式传输接口，对此我需要先创建一个项目进行测试。

![流式API接口测试](“HongXiaoYi”/28.png)

#### 数据定义

为了规范数据的传输，我们需要定义一系列的接口以及枚举类型来规范数据的传输。

```ts
interface ICoZePostBody<K = string, V = undefined> {
  /**
   * 待执行的对话流 ID，此对话流应已发布。
   */
  workflow_id: string
  /**
   * 对话中用户问题和历史消息。数组长度限制为 50，即最多传入 50 条消息。
   * 你需要通过此字段传入本次对话中用户的问题，也就是对话流的输入参数 USER_INPUT 的值。
   * 可以同时传入多条历史消息，也就是本次对话的上下文。多条消息应按对话顺序排列，最后一条消息应为 role=user 的记录，也就是**本次对话**中用户的问题；其他消息为历史消息。
   */
  additional_messages: IHXYAdditionalMessagesItem[]
  /**
   * 设置对话流的输入参数。
   * 对话流的输入参数  USER_INPUT 应在 additional_messages 中传入，在 parameters 中的 USER_INPUT 不生效。
   * 如果 parameters 中未指定 CONVERSATION_NAME 或其他输入参数，则使用参数默认值运行对话流；如果指定了这些参数，则使用指定值。
   */
  parameters: Map<K, V>
  /**
   * 需要关联的扣子应用 ID。调用对话流时，必须指定 app_id 或 bot_id，便于模型调用智能体或应用的数据库、变量等数据处理问题。
   */
  app_id?: string
  /**
   * 需要关联的智能体 ID。 调用对话流时，必须指定 app_id 或 bot_id，便于模型调用智能体或应用的数据库、变量等数据处理问题。
   */
  bot_id?: string
  /**
   * 对话流对应的会话 ID，对话流产生的消息会保存到此对话中。会话默认为开始节点设置的 CONVERSATION_NAME，也可以通过 conversation_id 参数指定会话。
   */
  conversation_id?: string
  /**
   * 用于指定一些额外的字段，以 Map[String][String] 格式传入。例如某些插件会隐式用到的经纬度等字段。
   目前仅支持以下字段：
   latitude：String 类型，表示经度。
   longitude：String 类型，表示纬度。
   user_id：String 类型，表示用户 ID。
   */
  ext?: Map<CoZePostBody_ExtKeys, string>
}

/**
 * 扣子流式接口Body部分字段map的键值枚举类型
 */
enum CoZePostBody_ExtKeys {
  /**
   * latitude：String 类型，表示经度。
   */
  Latitude = 'latitude',
  /**
   * longitude：String 类型，表示纬度。
   */
  Longitude = 'longitude',
  /**
   * user_id：String 类型，表示用户 ID。
   */
  User_id = 'user_id'
}

/**
 * 对话中用户问题和历史消息。
 * 指定 content 时，应同时设置 content_type。
 * 暂不支持多模态（文本、图片、文件混合输入）、卡片等类型的内容。
 * 设置meta_data时应当设置两个泛型参数
 */
interface IHXYAdditionalMessagesItem<K = undefined, V = undefined> {
  /**
   * 发送这条消息的实体。
   */
  role: AdditionalMessages_Role
  /**
   * 消息类型。默认为 question。
   */
  type?: AdditionalMessages_Type
  /**
   * 消息的内容，仅支持纯文本。
   */
  content?: string
  /**
   * 消息内容的类型。
   */
  content_type?: string
  /**
   * 创建消息时的附加消息，获取消息时也会返回此附加消息。
   * 自定义键值对，应指定为 Map 对象格式。长度为 16 对键值对，其中键（key）的长度范围为 1～64 个字符，值（value）的长度范围为 1～512 个字符。
   */
  meta_data?: Map<K, V>
}

/**
 * user：代表该条消息内容是用户发送的。
 * assistant：代表该条消息内容是模型发送的。
 */
enum AdditionalMessages_Role {
  User = 'user',
  Assistant = 'assistant'
}

/**
 * question：用户输入内容。
 * answer：模型返回给用户的消息内容，支持增量返回。如果对话流绑定了消息节点，可能会存在多 answer 场景，此时可以用流式返回的结束标志来判断所有 answer 完成。
 * function_call：智能体对话过程中调用函数（function call）的中间结果。
 * tool_response：调用工具 （function call）后返回的结果。
 */
enum AdditionalMessages_Type {
  Question = 'question',
  Answer = 'answer',
  Function_call = 'function_call',
  Tool_response = 'tool_response'
}
```

以上部分基本均为官方文档的内容，我在此处进行了一些修改与补充。注释编写的十分详细，我在这里只强调几个重要的点。

1. 对于`additional_messages`字段，我们需要将用户的问题作为当前数组的最后一条消息传入，并且将其`role`字段设置为`user`，这样大模型才能正确地理解我们的问题。
2. `USER_INPUT`的工作流参数需要以`IHXYAdditionalMessagesItem`对象的`Content`字段进行传入，直接写在`parameters`是没用的。
3. 设置了`content`之后我们还必须要设置`content_type`字段，来进行类型限制。

随后我们需要对相关请求数据进行字段配置。

```ts
const sessionConfig: rcp.SessionConfiguration = {
  headers: {
    Authorization: "Bearer pat_iu*************************************",
    "Content-Type": "application/json"
  },
  requestConfiguration: {
    transfer: {
      timeout: {
        transferMs: 120000
      }
    },
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          AlertDialog.show({
            message:s
          })
          console.log(s)
        }
      }
    }
  }
}


const ai:ICoZePostBody = {
  workflow_id: '7487986***********',
  additional_messages: [
    {
      role:AdditionalMessages_Role.User,
      content:'我进行鸿蒙开发应当做什么准备',
      content_type:'string'
    } as IHXYAdditionalMessagesItem
  ],
  parameters: new Map<string, string>([['CONVERSATION_NAME','test']])

}
```

在测试请求发送函数中我假设了用户的提问是`我进行鸿蒙开发应当做什么准备`，并且指定了对话流的ID为`7487986***********`，并且指定了会话名称为`test`。
在实际开发中我只需要将这个数组提取为一个全局变量去获取用户输入的内容并包装为对象传入这个数组即可。

{% note success flat %}
这里我遮盖了我自己的工作流ID和Token秘钥，实际开发中请自行替换。
{% endnote %}

#### 发送请求

在UI上绑定发送请求的函数即可，本项目仅做测试。

```ts
        .onClick(() => {
          requestAi()
        })
```

#### 响应检测

在配置请求配置项时我设置了`httpEventsHandler`字段，来对请求的不同事件的触发进行监听与数据处理。当收到后端发来的数据时就会触发`onDataReceive`回调函数，而为了监听返回的数据格式是否正确以及是否为流式返回的模式，我将每个数据都进行控台的打印。

![响应检测](“HongXiaoYi”/29.png)

数据以及流式效果全都成功了！！！
（撒花）

### 第三方MD解析组件库测试

我们刚完成了流式API的测试，接下来我们就需要将我们的流式数据进行解析，由于鸿蒙开发并没有提供原生的MD解析渲染API，所以我们需要使用OpenHarmony的第三方组件库来进行解析。

#### 三方库安装

```bash
ohpm install @lidary/markdown
```

命令执行后可以再在第三方包管理模块的文件夹下看到我们刚才安装的三方库。

![三方库安装](“HongXiaoYi”/30.png)

这样就安装成功了。

#### 全局变量定义

```ts
const msgModel: MessageModel = AppStorageV2.connect(MessageModel, 'msg', () => new MessageModel())!;
```

我们首先创建一个全局变量来存储以及共享我们所接受的流式数据。
随后我们在数据获取监听器的回调函数中添加对数据进行增量的处理。
因为此处我们仅做测试所以我们先只定义一种接口来去接收流式数据。

```ts
interface IHXYConversationMessage_Event {
  event: string;
  data: IHXYConversationMessage_DeltaData;
}
```

#### 组件使用

在组件中使用组件库中的组件。

```ts
import { MessageModel, requestAi } from './api';
import { AppStorageV2, promptAction } from '@kit.ArkUI';
import { MarkdownV2 } from '@lidary/markdown';

@Entry
@ComponentV2
struct Index {
  @Local message: MessageModel = AppStorageV2.connect(MessageModel, 'msg')!
  @Monitor('message.content')
  onChange(){
    promptAction.showToast({
      message:this.message.content
    })
  }
  build() {
    Navigation() {
      Scroll() {
        Column({ space: 10 }) {
          Button('点我获取数据')
            .onClick(() => {
              promptAction.showToast({
                message: '点击触发'
              })
              console.log('点击触发')
              requestAi()
            })
          Column() {
            if (!this.message.hasEnd) {
              LoadingProgress()
                .size({
                  width: 20,
                  height: 20
                })
            }
            MarkdownV2({
              content: this.message.content,
              fontStyle: {
                fontColor: Color.White
              }
            })
              .width('100%')
            Text(this.message.content)
              .fontSize(20)
              .fontColor(Color.White)
          }
          .alignItems(HorizontalAlign.Start)
          .width('80%')
          .backgroundColor('#9035006e')
          .padding(10)

        }
        .linearGradient({
          direction: GradientDirection.Bottom,
          colors: [['#ff002cff', 0], ['#ff000000', 0.5]]
        })
        .borderRadius(15)
        .margin(20)
        .width('100%')
        .height('100%')
      }

    }
    .title('MD组件测试')
    .height('100%')
    .width('100%')
  }
}
```

进行测试：

![组件使用](“HongXiaoYi”/31.png)

enmm……果然报错了

#### 错误分析

问了下AI：

![组件使用](“HongXiaoYi”/32.png)

无法写入磁盘……，指的应该不是这个，而是无法写入AppStorageV2。

因为报错的是Rcp网络请求模块，所以我又看了一下报错信息中的握手时间等网络相关信息发现一切正常，而且我能正常的去获取到我们的流式传输创建的数据包以及流式传输正在处理的事件包。
所以我认为当前的问题并非是出在网络请求部分，而是出在了我们的数据处理过程中。
我添加了大量日志，将每一步都数据处理的结果都打印出来。
每一步操作后都添加一步日志的打印，打印执行的操作，以及被执行变量的值。

此时奇怪的现象出现了**我除了在第一次收获到数据包也就是流式返回创建数据包以及流式返回正在处理的事件包后，其他的日志都没有打印出来**。
我非常疑惑，怀疑是添加日志的操作没有保存当前运行的还是老版本呢的代码。

但在经过了重启IDE以及重新连接真机的操作后日志依旧没有变化，还是仅执行到了打印第一次收到的两个数据包的部分甚至连对这两个数据包进行解析的部分都没有执行。

![组件使用](“HongXiaoYi”/33.png)

我开始回顾我的整体数据处理过程，并且回顾之前子安学长在HSD的活动中讲解的大模型流式返回数据的注意点。
在思考了一顿时间后我发现了问题所在。

#### 错误原因与解决

![组件使用](“HongXiaoYi”/34.png)

我们注意看着一块，流式响应接口返回的数据时`ArrayBuffer`类型并不是json字符串格式，在将他解析为字符串`s`后我们观察它的结构。

```json
event: conversation.message.delta
data: {
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": "#",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
}
```

event字段和data字段是分开的并不是被包裹在同一个对象中的！
所以我们直接用内置的`JSON.parse`函数去解析这个字符串是会报错的。
所谓的无法写入也是因为这个原因！！！

于是我迅速进行修改，不再直接使用`JSON.parse`函数去解析字符串，而是使用`split`方法对字符串以`'data: '`字符为分割依据进行切割，从而切割出`data`字段，再用`JSON.parse`函数去解析字符串中的`data`字段。

```ts
const sessionConfig: rcp.SessionConfiguration = {
  headers: {
    Authorization: "Bearer pat_iuGVoKCI6tgDJal7l7GFqJGCMLPkpXrcYaYBwc2icILL0gRLmAJ07xegxb1ZG0cN",
    "Content-Type": "application/json"
  },
  requestConfiguration: {
    transfer: {
      timeout: {
        transferMs: 1200000
      }
    },
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          msgModel.hasEnd = false
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          console.log('onDataReceive原始数据  ' + s)
          try {
            if (s.includes('conversation.message.delta')) {
              s.split('data: ').forEach((item:string,index)=>{
                const data = s.split('data: ')[(index*2)+1]
                const event = s.split('data: ')[index*2]
                console.log('读取到的event：'+event)
                console.log('读取到的data'+data)
                const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                console.log('message.event= ' + data)
                console.log('onDataReceive写入： ' + message_data.content)
                console.log('msgModel.hasEnd= ' + msgModel.hasEnd)
                msgModel.content += message_data.content
              })

            } else if (s.includes('done')) {
              msgModel.hasEnd = true
            }
          }catch (err){
            console.error(err)
          }

        }
      }
    }
  }
}
```

经过修改后我们再次进行测试,流失传输效果成功实现！！！
MD组件也正常运作进行渲染了。

## AI对话行业解决方案

我们虽然已经做出来了流式返回的发出与接收，但是我们还是需要去了解一下这个技术以及其在AI对话行业的应用。

### SSE（Server-Sent Events）简介

SSE 是一种允许服务器向客户端发送实时更新的 Web 技术。它基于 HTTP 协议，服务器可以在客户端建立连接后，持续向客户端发送事件流。客户端通过监听这些事件流，实时获取服务器端的更新。SSE 是单向通信，仅允许服务器向客户端发送数据。

### HTTP 轮询简介

HTTP 轮询是一种客户端定期向服务器发送请求以获取最新数据的技术。客户端会按照设定的时间间隔，不断地向服务器发送请求，服务器在每次接收到请求后返回最新的数据。这种方式是双向的，但由于客户端需要不断发送请求，可能会造成不必要的网络流量和服务器负载。

### 对比表格

| 特性 | SSE | HTTP 轮询 |
| --- | --- | --- |
| 通信方向 | 单向（服务器到客户端） | 双向 |
| 实时性 | 高，服务器可立即推送更新 | 取决于轮询间隔，可能存在延迟 |
| 网络开销 | 低，一旦连接建立，只需持续发送事件 | 高，客户端需要定期发送请求 |
| 服务器负载 | 低，只需在有更新时发送数据 | 高，需要频繁处理客户端请求 |
| 实现复杂度 | 相对较低，基于 HTTP 协议 | 相对较高，需要处理轮询逻辑 |
| 兼容性 | 现代浏览器支持良好，但旧浏览器可能不支持 | 所有浏览器都支持 |

这个表格总结了 SSE 和 HTTP 轮询在通信方向、实时性、网络开销、服务器负载、实现复杂度和兼容性等方面的差异。在选择使用哪种技术时，需要根据具体的应用场景和需求来决定。如果需要实时更新且对网络开销和服务器负载有要求，SSE 可能是更好的选择；如果对实时性要求不高且需要支持旧浏览器，HTTP 轮询可能更合适。

{% note success flat %}
总而言之对于当下绝大多数应用场景SSE都是更好的选择，它可以用更小的网络开销，无需频繁发送请求，数据实时性也更高。
除非是适配老旧浏览器以及需要频繁双向通信的场景会用到HTTP轮询。
{% endnote %}

### SSE在本项目的应用解析

在本项目中，SSE（Server-Sent Events）可以用于实现服务器向客户端的实时数据推送，特别是在AI对话场景中，为用户提供更流畅的交互体验。以下是SSE在本项目中的具体应用方式：

#### 实时对话回复

在用户与AI智能体进行对话时，服务器可以使用SSE技术将AI的回复以事件流的形式**实时推送给客户端**。这样，用户**无需等待整个回复生成完成，就可以逐步看到AI的回复内容**，大大提高了交互的实时性和流畅性。

例如，当用户提出问题后，服务器开始调用大模型进行回复生成。在生成过程中，服务器可以将已经生成的部分回复内容通过SSE推送给客户端，客户端在接收到这些内容后立即显示给用户。这样，用户可以在等待完整回复的同时，开始阅读和理解部分内容，减少了等待时间的感知。

#### 状态更新通知

除了对话回复，SSE还可以用于向客户端发送系统**状态更新通知**。例如，当服务器正在处理用户的请求时，可以通过SSE向客户端发送处理进度信息，让用户了解请求的处理状态。

具体来说，当用户发起一个问题时，服务器可能需要进行**多个步骤的处理**，如关键词提取、文档检索、回复生成等。在每个步骤完成后，服务器可以通过SSE向客户端发送相应的状态更新信息，如“正在提取关键词”、“正在检索文档”、“正在生成回复”等。这样，用户可以实时了解服务器的处理进度，增强了用户对系统的信任感。

#### SSE模式的返回数据格式分析

对于SSE模式其返回的JSON数据基本都会包含两部分：

1. `event`:用于指定事件的类型。如果指定了事件类型，客户端可以通过监听该类型的事件来处理消息。
2. `data`:用于携带实际的数据，是最常用的字段。如果数据有多行，可以使用多个 data 字段，每行一个。

对此我们可以使用我们后端发回的数据来进行分析

```JSON
event: conversation.chat.created
data: {
    "id": "7488569408730791948",
    "conversation_id": "7488569389520945191",
    "created_at": 1743568436,
    "last_error": {
        "code": 0,
        "msg": ""
    },
    "status": "created",
    "usage": {
        "token_count": 0,
        "output_count": 0,
        "input_count": 0
    },
    "section_id": "7488569389520945191",
    "inserted_additional_messages": [
        {
            "id": "7488569389340672063"
        }
    ]
}
```

可以看到`event`字段的值为`conversation.chat.created`，这代表这是一个对话创建事件。
而`data`字段则是一个JSON对象，包含了对话的ID、对话ID、创建时间、错误信息、对话状态、使用情况、章节ID以及插入的附加消息等信息。

```JSON
event: conversation.chat.in_progress
data: {
    "id": "7488569408730791948",
    "conversation_id": "7488569389520945191",
    "created_at": 1743568436,
    "last_error": {
        "code": 0,
        "msg": ""
    },
    "status": "in_progress",
    "usage": {
        "token_count": 0,
        "output_count": 0,
        "input_count": 0
    },
    "section_id": "7488569389520945191",
    "inserted_additional_messages": [
        {
            "id": "7488569389340672063"
        }
    ]
}
```

注意看第一行的`event`字段的值变为`conversation.chat.in_progress`，这代表当前对话正在加载中，同时还包含了当前已经使用的token数量信息、当前会话的ID、创建的时间戳。
能够成功收到这个信息说明我们的对话流开始思考如何回答我们的问题了。

接下来在接收到的数据包就应该是最终回复大模型所输出的内容了。

```JSON
event: conversation.message.delta
data: {
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": "#",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
}

event: conversation.message.delta
data: {
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": " 鸿蒙开发准备工作指南",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
}
```

我们可以看到现在我们不断收到的数据包就是我们所需要的正文信息了由于第一条正文信息仅仅是Md格式中的一级标题标识符`#`，所以我又放了一条来作为示例。
`event`字段的值变为了`conversation.message.delta`，这代表这是一个对话消息的增量事件。我们就可以开始将当前收到的最新的数据包中的正文信息添加到我们需要进行渲染的字符串变量上了。

最后为了标志当前流式传输数据已经结束，服务端还会传来对话流结束事件包。

```JSON
event: conversation.message.completed
data: {
    "id": "7488569645440729099",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "verbose",
    "content": "{\"msg_type\":\"generate_answer_finish\",\"data\":\"{\\\"finish_reason\\\":0,\\\"FinData\\\":\\\"\\\"}\",\"from_module\":null,\"from_unit\":null}",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191",
    "created_at": 1743568492,
    "updated_at": 1743568492
}
event: conversation.chat.completed
data: {
    "id": "7488569408730791948",
    "conversation_id": "7488569389520945191",
    "created_at": 1743568436,
    "completed_at": 1743568492,
    "last_error": {
        "code": 0,
        "msg": ""
    },
    "status": "completed",
    "usage": {
        "token_count": 27240,
        "output_count": 1072,
        "input_count": 26168
    },
    "section_id": "7488569389520945191",
    "inserted_additional_messages": [
        {
            "id": "7488569389340672063"
        }
    ]
}
```

我们可以看到在流失传输结束后服务端会发送两个事件为`conversation.message.completed`和`conversation.chat.completed`的数据包。
这两个数据包一个包含了当前对话流返回的完整内容，另一个则是包含了当前对话流的使用情况信息。
这样我们就可以通过这两个数据包来获取当前对话流的使用情况信息了。

{% note warning flat %}
这两个数据包的作用并不一样，一个是用来标志当前对话流的返回内容已经结束，另一个则是用来标志当前对话流已经结束。
{% endnote %}

最后为了终止本次对话流的SEE单向连接，服务端还会返回一个事件为`done`的数据包。

```json
event: done
data: {
    "debug_url": "https://www.coze.cn/work_flow?execute_id=7488569393241391167&space_id=7486837278376427535&workflow_id=7487986803871760399&execute_mode=2"
}
```

这样我们就完成了一个完整的对话流的SEE单向连接。

## 鸿蒙端侧正式开发笔记

经历了前些天的功能测试之后我们就可以正式开始进行鸿蒙端的开发了。

### 工程结构搭建

从这个项目开始我们要将制作的应用包含一多能力，为此我们就需要去进行工程结构的标准化，不能再将全部功能都放在同一个模块中。

#### 创建通用特性包以及特性能力包

在工程目录层级下创建`common`文件夹，用于存放通用的特性包。
在工程目录层级下创建`feature`文件夹，用于存放通用的特性能力包。
最后在创建一个`products`文件夹，用于存放产品定制层。

![工程结构](“HongXiaoYi”/35.png)

对于这三个包的功能我就直接放官方文档了：

“一多”推荐在应用开发过程中使用如下的“三层工程结构”。

* common（公共能力层）：用于存放公共基础能力集合（如工具库、公共配置等）。

  common层可编译成一个或多个HAR包或HSP包（HAR中的代码和资源跟随使用方编译，如果有多个使用方，它们的编译产物中会存在多份相同拷贝；而HSP中的代码和资源可以独立编译，运行时在一个进程中代码也只会存在一份），其只可以被products和features依赖，不可以反向依赖。

* features（基础特性层）：用于存放基础特性集合（如应用中相对独立的各个功能的UI及业务逻辑实现等）。

  各个feature高内聚、低耦合、可定制，供产品灵活部署。不需要单独部署的feature通常编译为HAR包或HSP包，供products或其它feature使用，但是不能反向依赖products层。需要单独部署的feature通常编译为Feature类型的HAP包，和products下Entry类型的HAP包进行组合部署。features层可以横向调用及依赖common层。

* products（产品定制层）：用于针对不同设备形态进行功能和特性集成。

  products层各个子目录各自编译为一个Entry类型的HAP包，作为应用主入口。products层不可以横向调用。

总而言之，像是日志的打印工具封装、网络请求的封装、通用动画的常量等可以应用在本项目的多个页面，乃至其他项目中的我们称之为公共能力层。

{% note info flat %}
与此同时公共能力是都可以独立运行的，不需要去依赖于特性能力以及产品定制层。
{% endnote %}

而基础特性层则是依赖于公共能力层的一些功能，像是要依赖于公共能力层的网络请求以及日志打印工具还有相关常量枚举类型的特性能力，像是要用网络请求模块进行制定API的数据获取的特性能力等。

产品定制层则是包含了绝大多数的页面渲染以及交互逻辑处理的模式，这一层我们要符合`MVVM`模式。

#### 工程结构

![工程结构](“HongXiaoYi”/36.png)

### 公共能力层

#### 日志工具封装

在过去我们用的都是`console.log()`来进行日志的输出，`console`中虽然为我们封装了很多js中常用的输出方式，诸如：`log`、`warn`、`error`等，但是其弊端也很明显。

1. 无法进行日志的分类，导致日志混杂在一起，难以定位问题。
2. 无法进行日志的过滤，导致日志过多，难以定位问题。
3. 无法进行日志的格式化，导致日志输出不美观。

hilog为我们提供了上述问题的解决方案，hilog为我们提供了日志的分类、过滤和格式化等功能。
hilog通过鸿蒙底层的重构之后，为我们提供了更加高效的日志输出方式。

```ts
function debug(domain: number, tag: string, format: string, ...args: any[]): void;
function info(domain: number, tag: string, format: string, ...args: any[]): void;
function warn(domain: number, tag: string, format: string, ...args: any[]): void;
function error(domain: number, tag: string, format: string, ...args: any[]): void;
function fatal(domain: number, tag: string, format: string, ...args: any[]): void;
function isLoggable(domain: number, tag: string, level: LogLevel): boolean;
```

* 参数 domain：用于指定输出日志所对应的业务领域，取值范围为 0x0000~0xFFFF，开发者可以根据需要进行自定义。
* 参数 tag：用于指定日志标识，可以为任意字符串，建议标识调用所在的类或者业务行为。
* 参数 format：格式字符串，用于日志的格式化输出。%{public}s 字符串 %{public}d 数字
* 参数 args：可以为 0 个或多个参数，可以为 0 个或多个参数，是格式字符串中参数类型对应的参数列表。

所以我们要对hilog进行本项目的封装。

```ts
import { hilog } from '@kit.PerformanceAnalysisKit'
const tag = 'XBXLogger'
/**
 * hilog的业务封装类
 * 内置了业务领域的输出格式，开发者个人标识，以及信息的格式化方式
 * 包含了hilog的四种日志打印模式
 * 支持传入一个字符串作为输出内容
 */
class Logger{
  private domain:number // 十六进制输出业务格式
  private tag:string // 制定的自己的标识
  private format:string = '%{public}s' //格式化方式

  constructor(domain: number = 0x0000, tag: string = '') {
    this.domain = domain
    this.tag = tag
  }
  debug(args: string): void {
    hilog.debug(this.domain, this.tag, this.format, args);
  }

  info(args: string): void {
    hilog.info(this.domain, this.tag, this.format, args);
  }

  warn(args: string): void {
    hilog.warn(this.domain, this.tag, this.format, args);
  }

  error(args: string): void {
    hilog.error(this.domain, this.tag, this.format, args);
  }

}

export const logger:Logger = new Logger(0x1234,tag)
```

进行一下自己的个人标识以及业务领域的设定，这样就可以方便的进行日志的分类和过滤了。

#### 一多断点系统移植

对于一多的断点系统我们直接移植此前在[鸿蒙一多能力](https://xbxyftx.top/2025/03/16/yiduo/#%E5%AA%92%E4%BD%93%E6%9F%A5%E8%AF%A2)这篇博客中分析过的断点系统即可

但此前我的所有数据模型和核心工具类都放在了同一个文件中，那时候是为了学习方便，并没有进行模块化的处理，但在这个项目中我们要规范化。

![工程结构](“HongXiaoYi”/37.png)

在数据模型包中存储断点系统和断点状态的所有接口和类数据模型。在工具包中存储断点系统工具类。

#### 导出流构建

在多模块项目中导出流是很重要的，来自树状结构各个分支下的export文件都需要统一汇总到模块根目录下的`Index.ets`文件中，才能被其他模块引用。但如果全交给这一个文件去进行导出处理很显然会导致导出的行数过多，结构复杂难以维护，所以我们需要在各个树状结构的分值节点添加导出节点，来将本分支下的所有导出文件进行汇总打包，这样在模块根目录下我们就只需要去导出子节点的那一个导出汇总文件即可。

![工程结构](“HongXiaoYi”/38.png)

{% note info flat  %}
导出流的构建在每一个包都要做，绝不会只局限在这里进行一次，后续需要持续维护输出流的构建。
{% endnote %}

#### 启动与停止断点系统服务

我们需要在页面构建的生命周期钩子中去启动和停止断点系统服务，这样才能保证断点系统服务的正常运行。

```ts
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');
    AppStorageV2.connect(GetBreakPointSystem,GET_BREAK_POINT_SYSTEM,()=>new GetBreakPointSystem())!.getBreakPointSystem().start()
    logger.warn(ENTRYABILITY_LOG_TAG+'断点系统已经启动')
  }

  onDestroy(): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onDestroy');
    AppStorageV2.connect(GetBreakPointSystem,GET_BREAK_POINT_SYSTEM,()=>new GetBreakPointSystem())!.getBreakPointSystem().stop()
    logger.warn(ENTRYABILITY_LOG_TAG+'断点系统已经关闭')
  }
```

{% note success flat %}
详尽的日志是一个合格的应用程序所必须的，当UI失去响应时我们只能依据日志来进行当前状态的监控以及bug的排查。
{% endnote %}

### 特性层

#### cozeAPI

由于我们的cozeAPI是需要对全局变量进行读写操作的同时要依赖于日志打印工具，所以我们需要将其封装为一个特性能力包并将其在之前测试的版本基础上进行改动。

![工程结构](“HongXiaoYi”/39.png)

首先依旧像是断点监听系统一样的将数据模型以及功能函数进行分割。与此同时将一部分测试变量命名进行了修改，以**明确变量的功能**。。

在测试阶段我们其实遗留了一个问题，就是在处理流式接口返回的数据时，总是会出现同一条报错，就如下图所示：

![工程结构](“HongXiaoYi”/40.png)

报错发生的位置很显然是我们在进行数据处理的时候发生了类型错误的问题，所以还需要要在次审视一下我们的处理过程。

```JSON
event: conversation.message.delta
data: {
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": "#",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
}

event: conversation.message.delta
data: {
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": " 鸿蒙开发准备工作指南",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
}
```

对于这个数据结构，我们首先是无法直接用`JSON.parse`函数去解析的，因为它并不是一个JSON字符串。于是我考虑到要对他进行关键字剪切处理来对其进行解析。
而这个数据的特殊之处并不只在于不是标准JSON字符串这一点，与此同时它一次流式传输发回的数据包**包含了两个事件和数据**，所以我们应当进行两次数据的采集工作。

等等，**两次数据的分割与采集？**
如果我默认将数据按照`data`进行拆分，我获得的其实是长度为三的字符串数组，而不是长度为四的数组。

```ts
if (s.includes('conversation.message.delta')) {
  s.split('data: ').forEach((item:string,index)=>{
    const data = s.split('data: ')[(index*2)+1]
    const event = s.split('data: ')[index*2]
    console.log('读取到的event： '+event)
    console.log('读取到的data： '+data)
    const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
    console.log('onDataReceive写入： ' + message_data.content)
    msgModel.content += message_data.content
    console.log('msgModel.hasEnd= ' + msgModel.hasEnd)
  })
} else if (s.includes('done')) {
  msgModel.hasEnd = true
}
```

如果我按照我以上的代码对上面的案例我们以`data:`为分割符，那获得的是：

```ts
[
  'event: conversation.message.delta',
  '{
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": "#",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
  }
  event: conversation.message.delta',
  '{
    "id": "7488569482340810764",
    "conversation_id": "7488569389520945191",
    "role": "assistant",
    "type": "answer",
    "content": " 鸿蒙开发准备工作指南",
    "content_type": "text",
    "chat_id": "7488569408730791948",
    "section_id": "7488569389520945191"
  }'
]
```

我们所获得的数组并不能直接去获取到我们所需要的`data`对象,我们需要进行分类讨论，当索引为0时不做处理，索引为1时要在进行字符串的切割，将我们所需的`data`对象切割出来,最后在索引为2时直接获取到我们所需的`data`对象即可。

```ts
  if (s.includes('conversation.message.delta')) {
    s.split('data: ').forEach((item: string, index) => {
      if (index === 1) {
      const data = item.split('event: ')[0]
      logger.info('____________________________')
      logger.info('读取到的data： ' + data)
      const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
      logger.info('onDataReceive写入： ' + message_data.content)
      CurrentMsg.content += message_data.content
      logger.info('msgModel.hasEnd= ' + CurrentMsg.hasEnd)
      logger.info('____________________________')
      }else if (index === 2){
        const data = item
        logger.info('____________________________')
        logger.info('读取到的data： ' + data)
        const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
        logger.info('onDataReceive写入： ' + message_data.content)
        CurrentMsg.content += message_data.content
        logger.info('msgModel.hasEnd= ' + CurrentMsg.hasEnd)
        logger.info('____________________________')
      }
    })
  } else if (s.includes('done')) {
    CurrentMsg.hasEnd = true
  }
```

#### 对话历史的记录与传输

在扣子的API中我们可以看到需要传输的有一项是对话历史的对象数组，而这个数组的数量上限是50条，所以我们需要将这个数组进行包装，以便于控制数组的长度。

![工程结构](“HongXiaoYi”/41.png)

```ts
import { logger } from 'common';
import { IHXYCozeMessagesItem } from '..'

const MESSAGE_LIST = 'MessageList:  '

/**
 * 扣子对话历史工具类
 */
@ObservedV2
export class HistoryMessageList {
  /**
   * 传输给扣子的对话历史
   * 数量上限为50
   */
  @Trace private list: CozeHistoryMessagesItem[] = []

  /**
   * 添加聊天记录
   * 检测数组长度防止超过30
   * @param Message 待添加对话记录对象
   */
  public addMessage(Message: CozeHistoryMessagesItem) {
    if (this.list.length >= 30) {
      logger.warn(MESSAGE_LIST + '当前数组长度超过30')
      // 如果数组长度超过30，删除数组的第一位
      this.list.shift();
    }
    logger.info(MESSAGE_LIST + '当前数组长度:  ' + this.list.length)
    // 加入新的消息
    this.list.push(Message);
  }

  public clone(){
    const newList = this.list.map(item=>item.clone())
    logger.debug(MESSAGE_LIST+'list:  '+this.list.toString())
    logger.debug(MESSAGE_LIST+'newList:  '+newList.toString())
    return newList
  }
  public getList(): CozeHistoryMessagesItem<undefined, undefined>[]{
    return this.clone()
  }
}
```

为了减小网络请求的数据负担，我们将50条减到30条，通过包装后的添加方式来实现数组长度的控制，并将`List`数组设为私有属性，防止外部篡改数组，保障数据的安全性。
与此同时利用深克隆来进行数组的复制，防止外部获取到原始数据进行篡改。

{% note info flat %}
当然这个类还有**可拓展性**，像是重置数组内容以便于开启新的对话，清空数组内容以便于删除对话记录等功能都可以在这个类中进行拓展。
{% endnote %}

#### 调整扣子API

此前我们针对于流式传输结束的处理仅仅是将当前的信息对象进行结束标识，我们现在需要将结束的对话内容记录到我们的对话历史中，在下一次用户发送新的消息时将其作为对话历史的一部分进行传输。
为此我们就需要在原本的`onDataReceive`函数中进行修改。

```ts
/**
 * 当前需要发送给AI的聊天记录
 */
const historyMessageList: HistoryMessageList = AppStorageV2.connect(HistoryMessageList, MESSAGE_LIST,()=>new HistoryMessageList())!


const ON_DATA_RECEIVE = 'onDataReceive:  ';
const sessionConfig: rcp.SessionConfiguration = {
  headers: {
    Authorization: "Bearer pat_iuGVoKCI6tgDJal7l7GFqJGCMLPkpXrcYaYBwc2icILL0gRLmAJ07xegxb1ZG0cN",
    "Content-Type": "application/json"
  },
  requestConfiguration: {
    transfer: {
      timeout: {
        transferMs: 12000
      }
    },
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          currentMsg.hasEnd = false
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          console.log('onDataReceive原始数据：  ' + s)
          try {
            if (s.includes('conversation.message.delta')) {
              s.split('data: ').forEach((item: string, index) => {
                if (index === 1) {
                const data = item.split('event: ')[0]
                logger.info('____________________________')
                logger.info('读取到的data： ' + data)
                const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                logger.info('onDataReceive写入： ' + message_data.content)
                currentMsg.content += message_data.content
                logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
                logger.info('____________________________')
                }else if (index === 2){
                  const data = item
                  logger.info('____________________________')
                  logger.info('读取到的data： ' + data)
                  const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                  logger.info('onDataReceive写入： ' + message_data.content)
                  currentMsg.content += message_data.content
                  logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
                  logger.info('____________________________')
                }
              })
            } else if (s.includes('done')) {
              logger.warn(ON_DATA_RECEIVE+ '当前对话流式传输结束，开始进行对话历史写入')
              currentMsg.hasEnd = true
              const message = new CozeHistoryMessagesItem(HistoryMessages_Role.Assistant)
              message.content_type= STRING
              message.content=currentMsg.content!
              historyMessageList.addMessage(message)
              logger.warn(ON_DATA_RECEIVE+'历史添加完毕')
            }
          } catch (err) {
            logger.error(ON_DATA_RECEIVE+ 'onDataReceive捕获异常: ' + err)
          }

        }
      }
    }
  }
}


export function requestCozeAi() {
  const ai: ICoZePostBody = {
    workflow_id: '7487986803871760399',
    additional_messages:historyMessageList.getList(),
    parameters: new Map<string, string>([['CONVERSATION_NAME', 'HXY' + Date.now()]])
  }
  promptAction.showToast({
    message: '发送请求成功'
  })
  console.log('进入requestAi')
  const session = rcp.createSession(sessionConfig)
  session.post('https://api.coze.cn/v1/workflows/chat', ai)
    .catch((err: BusinessError) => {
      logger.error(err.message)
    })
    .finally(() => {
      logger.info('requestCozeAi:  ' + '数据传输已完成')
      session.close()
      logger.warn('session已关闭')
    })
}
```

在修改结束逻辑的同时我也将`requestCozeAi`函数的请求参数**由测试对象改为了历史对话数组**，这样就可以将历史对话数组作为请求参数进行传输了。

### 产品定制层

接下来就该进行产品定制层的UI开发了，首先我会先做一个demo测试整个对话流是否能正常进行对话，随后我会再去UI进行美化。

#### 系统环境信息获取

我们需要依据用户当前的深浅色模式来进行颜色上的适配所以我们需要获取到用户的系统环境信息。

{% note info flat  %}
V1版本与V2版本的获取方式不同，所以我们需要参考V2版本的官方文档来去进行数据的获取。
{% endnote %}

首先我们先定义一个包含我们所需要的系统信息的类，并以单实例模式创建对象并导出。

```ts
import { ConfigurationConstant } from '@kit.AbilityKit';
import { logger } from '../../../../../Index';

const ENV_LOG_TAG = 'Env:  '

@ObservedV2
class Env {
  /**
   * 语言模式
   */
  @Trace language: string | undefined;
  /**
   * 颜色模式，0是深色模式，1是浅色模式
   */
  @Trace colorMode: ConfigurationConstant.ColorMode | undefined;
  /**
   * 唯一实例
   */
  private static instance: Env | null = null;

  private constructor() {
    this.language = undefined;
    this.colorMode = undefined;
  }

  public static getInstance(): Env {
    if (!Env.instance) {
      logger.warn(ENV_LOG_TAG + '当前没有实例，已经创建唯一实例')
      Env.instance = new Env();
    }
    logger.info(ENV_LOG_TAG + '获取唯一实例')
    return Env.instance;
  }
}

/**
 * 当前系统环境参数对象
 */
export let env: Env = Env.getInstance();
```

随后我们在页面构建的生命周期钩子中去获取到系统环境信息。

```ts
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');

    AppStorageV2.connect(GetBreakPointSystem,GET_BREAK_POINT_SYSTEM,()=>new GetBreakPointSystem())!.getBreakPointSystem().start()
    logger.warn(ENTRYABILITY_LOG_TAG+'断点系统已经启动')

    AppStorageV2.connect(ViewMessageModel, MSG, () => new ViewMessageModel())
    logger.warn(ENTRYABILITY_LOG_TAG+'当前信息对象已经初始化完成')

    AppStorageV2.connect(HistoryMessageList, MESSAGE_LIST,()=>new HistoryMessageList())
    logger.warn(ENTRYABILITY_LOG_TAG+'扣子对话历史记录数组初始化完成')

    env.language = this.context.config.language;
    env.colorMode = this.context.config.colorMode;
    logger.warn(ENTRYABILITY_LOG_TAG+'env数据:  '+'env.language: '+env.language+' env.colorMode: '+env.colorMode)
  }
```

{% note info flat  %}
我们这里对系统信息进行获取与封装主要是为了备用，主要的背景颜色还有字体颜色我们直接在`base`和`dark`文件夹下的`color.json`文件中进行同名配置系统就会**自动进行适配**。
{% endnote %}

#### 深浅色切换测试

我们先对当前的页面的深浅色切换功能进行一下测试。

```ts
import { BreakpointState, env, Env, logger } from 'common'
import { ViewMessageModel } from 'feature1/src/main/ets/modules/CozeApiModules/CozeApiModule'

@Entry
@ComponentV2
struct Index {
  /**
   * 渲染对话列表数组
   */
  @Local viewMessageList: ViewMessageModel[] = []
  @Local breakPointState: BreakpointState<Object> = BreakpointState.of({
    xs: 'xs',
    sm: 'sm',
    xl: 'xl',
    xxl: 'xxl',
    md: 'md',
    lg: 'lg'
  })
  @Local env:Env = env
  @Monitor('env.colorMode')
  onColorModeChange(){
    logger.warn('onColorModeChange:  '+'当前颜色模式编号为'+env.colorMode)
  }

  build() {
    Navigation() {
      Column(){
        Text('深浅色模式测试')
          .fontSize(30)
          .fontColor($r('app.color.test_fontcolor'))
          .backgroundColor('#003b2222')
      }
      .justifyContent(FlexAlign.Center)
      .width('100%')
      .height('100%')

    }
    .linearGradient({
      direction:GradientDirection.Bottom,
      colors:[[$r('app.color.total_main_linearGradient_0'),0],[$r('app.color.total_main_linearGradient_0point5'),0.5]]
    })
    .hideTitleBar(true)
    .hideToolBar(true)
    .height('100%')
    .width('100%')
  }
}
```

<video width="100%" controls>
  <source src="42.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

我们可以看到，我们在切换深浅色模式时，系统就会自动调用对应的配置文件进行颜色的替换。
但通过日志我们还能看到一个问题就是，我们手动获取的数据由于仅仅是在界面构建的生命周期钩子中进行获取，所以我们在切换深浅色模式时，系统并不会自动调用对应的获取方法，所以我们的监听器并没有见听到深浅色模式的变化。

![工程结构](“HongXiaoYi”/43.png)

所以我们暂时搁置手动适配的这个方案。

#### 初始化Navigation及其页面栈

在全局变量中初始化页面栈，同时初始化`BuilderMap`。

```ts
    AppStorageV2.connect(NavPathStack,NAV_PATH_STUCK,()=>new NavPathStack())
    logger.warn(ENTRYABILITY_LOG_TAG+'页面栈初始化完成')

  @Builder
  NavDestMap(name: string) {
    if (name === NavDests.MAIN) {
      Main()
    } else if (name === NavDests.CHAT) {
      Chat()
    }
  }
```

首页我们作为开屏显示，并设定计时器在两秒之后从开屏页面跳转至主页面。

```ts
import { BreakpointState, env, Env, logger, NavDests, NAV_PATH_STUCK } from 'common'
import { ViewMessageModel } from 'feature1/src/main/ets/modules/CozeApiModules/CozeApiModule'
import { AppStorageV2 } from '@kit.ArkUI'
import { Chat } from './navDestsComponents/Chat'

@Entry
@ComponentV2
struct Main {
  /**
   * 渲染对话列表数组
   */
  @Local viewMessageList: ViewMessageModel[] = []
  @Local breakPointState: BreakpointState<Object> = BreakpointState.of({
    xs: 'xs',
    sm: 'sm',
    xl: 'xl',
    xxl: 'xxl',
    md: 'md',
    lg: 'lg'
  })
  @Local navPathStuck: NavPathStack = AppStorageV2.connect(NavPathStack, NAV_PATH_STUCK)!
  @Local env: Env = env

  @Monitor('env.colorMode')
  onColorModeChange() {
    logger.warn('onColorModeChange:  ' + '当前颜色模式编号为' + env.colorMode)
  }

  @Builder
  NavDestMap(name: string) {
    if (name === NavDests.MAIN) {
      Main()
    } else if (name === NavDests.CHAT) {
      Chat()
    }
  }

  onPageShow(): void {
    setTimeout(() => {
      this.navPathStuck.pushPath({ name: NavDests.CHAT })
    }, 2000)
  }

  build() {
    Column() {
      Navigation(this.navPathStuck) {
        GridRow() {
          GridCol({ span: { sm: 12, md: 10, lg: 8 }, offset: { sm: 0, md: 1, lg: 2 } }) {
            Column() {
              Image($rawfile('logo.jpg'))
                .width(100)
                .borderRadius(25)
              Text('鸿小易')
                .fontSize(50)
                .fontColor($r('app.color.test_fontcolor'))
              Row({ space: 20 }) {
                Text('鸿蒙开发智能体')
                  .fontSize(25)
                  .width(30)
                  .fontColor($r('app.color.test_fontcolor'))
                  .margin({ bottom: 25 })
                Text('您的开发好帮手')
                  .fontSize(25)
                  .width(30)
                  .fontColor($r('app.color.test_fontcolor'))
                  .margin({ top: 25 })
              }
            }
            .justifyContent(FlexAlign.SpaceEvenly)
            .padding({ top: '20%', bottom: '10%' })
            .width('100%')
            .height('100%')
          }

        }
        .width('100%')
        .height('100%')

      }
      .backgroundColor(Color.Transparent)
      .padding(10)
      .navDestination(this.NavDestMap)
      .hideTitleBar(true)
      .hideToolBar(true)
      .height('100%')
      .width('100%')
      .hideBackButton(true)
      .titleMode(NavigationTitleMode.Mini)
      .mode(NavigationMode.Stack)
    }
    .expandSafeArea()
    .linearGradient({
      direction: GradientDirection.Bottom,
      colors: [[$r('app.color.total_main_linearGradient_0'), 0],
        [$r('app.color.total_main_linearGradient_0point5'), 0.5]]
    })
  }
}
```

![浅色模式](“HongXiaoYi”/44.jpg)
![深色模式](“HongXiaoYi”/45.jpg)

深色浅色模式看起来还是都很不错的。

#### 聊天记录列表组件

聊天记录的渲染很简单，只需要依据我们的`viewMessageList`数组来进行渲染即可。
依据于`type`属性来进行分类渲染，用不同的颜色和左右列来进行区分。
同时依据与`hasEnd`属性来进行判断是否需要显示加载动画。

```ts
import { ViewMessageModel } from "feature1";

@ComponentV2
export struct ContentComp {
  @Param @Require messages: ViewMessageModel[];
  @Param @Require hasEnd: boolean;
  @Param @Require content: string;
  @Param @Require currentIndex: number;

  build() {
    Column() {
      List({ space: '5vp' }) {
        Repeat(this.messages)
          .each((msg: RepeatItem<ViewMessageModel>) => {
            ListItem() {
              if (msg.item.type === 0) {
                Column() {
                  Text(msg.item.content)
                    .backgroundColor(Color.Green)
                    .padding(10)
                    .fontColor(Color.White)
                    .borderRadius(5)
                    .visibility(msg.item.content == '' ? Visibility.None : Visibility.Visible)

                  if (!this.hasEnd && this.currentIndex == msg.index) {
                    Column({ space: '5vp' }) {
                      LoadingProgress()
                        .size({
                          width: '20vp',
                          height: '20vp'
                        })
                        .color(Color.White)
                      Text(this.content)
                        .fontColor(Color.White)
                    }
                    .backgroundColor(Color.Green)
                    .padding(10)
                    .alignItems(HorizontalAlign.Start)
                    .borderRadius(5)
                  }

                  Blank()
                }
                .width('80%')
                .alignItems(HorizontalAlign.Start)
              } else if (msg.item.type === 1) {
                Row() {
                  Blank()
                  Text(msg.item.content)
                    .backgroundColor(Color.Orange)
                    .padding(10)
                    .borderRadius(5)
                }
                .width('100%')

              }
            }
          })
      }
      .width('100%')
      .height('100%')
    }
    .backgroundColor(Color.Transparent)
  }
}
```

#### 问题发送组件

这个组件将会包含一个文本输入框，一个发送按钮，发送按钮的点击事件需要与主页面的渲染数据列表以及对话历史列表进行数据交互，所以我们需要利用`@Event`装饰器去暴露一个回调函数来进行数据传输以及聊天记录的添加。

```ts
import { promptAction } from "@kit.ArkUI";
import { logger } from "common/Index";

@ComponentV2
export struct ToolBarComp {
  @Local content: string = '';


  @Event submit: (content: string) => void;

  build() {
    Row({ space: '10vp' }) {
      TextInput({ placeholder: '请输入内容', text: this.content })
        .layoutWeight(3)
        .onChange((value: string) => {
          this.content = value;
        })
      Button('发送')
        .layoutWeight(1)
        .clickEffect({ level: ClickEffectLevel.LIGHT })
        .onClick(() => {
          if (this.content === '') {
            logger.warn('消息为空')
            promptAction.showToast({
              message: '发送消息不能为空',
              duration: 3000
            })
          } else {
            this.submit(this.content);

            this.content = ''
          }
        })
    }
    .height('10%')
    .width('100%')

    .padding(10)
    .expandSafeArea()
  }

}
```

而主页面对于`submit`回调函数的编写则是重中之重，发送请求获取数据在此前的测试阶段就已经完成，重点在于如何渲染多轮对话的数据，在获取到数据之前我们就需要让聊天记录列表组件渲染出当前的对话框，并显示加载动画。
所以我们在点击发送按钮后就先行创建一个空内容的对话记录对象，将其添加到对话历史数组中，随后我们就可以调用`requestCozeAi`函数来进行请求了。

```ts
  ToolBarComp({
    submit: (content: string) => {
      this.viewMessageList.push({ content: content, type: 1, hasEnd: true });
      this.viewMessageList.push({ content: '', type: 0, hasEnd: true });
      const history: CozeHistoryMessagesItem = new CozeHistoryMessagesItem(HistoryMessages_Role.User)
      history.content_type = CONTENT_TYPE_STRING
      history.content = content
      this.historyMsgs.addMessage(history)
      logger.info('Chat:  ' + 'addMessage成功' + content)
      this.currentMsg.currentIndex = this.viewMessageList.length - 1;
      this.currentMsg.hasEnd = false;
      requestCozeAi()
    }
  })
```

当然与此同时由于我们`requestCozeAi`函数在获取完当前的对话数据后只会去添加到对话历史记录数组，并不会添加到渲染数组中，所以在`hasEnd`属性变为true时对话内容就会消失，所以我们还需要对`hasEnd`属性进行监听，当变化为true时就去替换原始的空内容对象，并将当前的信息对象清空以便于接收下一条对话信息。

```ts
  @Monitor ('currentMsg.hasEnd')
  onContentEnd(): void {
    if (this.currentMsg.hasEnd) {
      this.viewMessageList.pop();
      this.viewMessageList.push({ content: this.currentMsg.content!.replace('null', ''), type: 0, hasEnd: true });
      this.currentMsg.content = '';
    }
  }
```

#### 使用MD第三方库

在测试了多轮对话功能正常之后，我现在准备将原生文本组件替换为之前测试过的三方库，来渲染`MarkDown`格式的文本。

不过这次在安装时却出现了异常的报错。

![报错](“HongXiaoYi”/46.png)

通过报错信息我们可以看到是依赖问题，而且依赖错误发生的位置并不是三方库的下载，三方库并没有开始下载。
通过在CSDN查阅报错信息，发现问题出现在`common`模块错误的依赖了作为入口模块的`default`模块，导致了`common`模块的依赖错误。

```ts
{
  "name": "common",
  "version": "1.0.0",
  "description": "公共能力层",
  "main": "Index.ets",
  "author": "",
  "license": "Apache-2.0",
  "dependencies": {
    "default": "file:../../product/default"
  }
}
```

我们可以看到，`common`模块依赖了`default`模块，而`default`模块又依赖了`common`模块，这样就形成了一个循环依赖的问题。

```ts
{
  "name": "common",
  "version": "1.0.0",
  "description": "公共能力层",
  "main": "Index.ets",
  "author": "",
  "license": "Apache-2.0",
  "dependencies": {}
}
```

将错误的依赖信息删除即可。

![解决](“HongXiaoYi”/47.png)

安装成功。

随后将原生文本组件替换为三方库。

```ts
import { ViewMessageModel } from "feature1";
import { MarkdownV2 } from '@lidary/markdown';
@ComponentV2
export struct ContentComp {
  @Param @Require messages: ViewMessageModel[];
  @Param @Require hasEnd: boolean;
  @Param @Require content: string;
  @Param @Require currentIndex: number;

  build() {
    Column() {
      Stack({alignContent:Alignment.Bottom}){
        List({ space: '5vp' }) {
          Repeat(this.messages)
            .each((msg: RepeatItem<ViewMessageModel>) => {
              ListItem() {
                if (msg.item.type === 0) {
                  Column() {
                    // Text(msg.item.content)
                    //   .backgroundColor(Color.Green)
                    //   .padding(10)
                    //   .fontColor(Color.White)
                    //   .borderRadius(5)
                    //   .visibility(msg.item.content == '' ? Visibility.None : Visibility.Visible)
                    MarkdownV2({
                      content:msg.item.content,
                      lineSpace:6,
                      fontStyle:{
                        fontColor:$r('app.color.chat_ai_fontcolor'),
                        fontSize:14
                      }
                    })
                      .padding(10)
                      .backgroundColor($r('app.color.chat_ai_bg_color'))
                      .visibility(msg.item.content == '' ? Visibility.None : Visibility.Visible)
                      .borderRadius(5)

                    if (!this.hasEnd && this.currentIndex == msg.index) {
                      Column({ space: '5vp' }) {
                        Row({space:10}){
                          LoadingProgress()
                            .size({
                              width: '20vp',
                              height: '20vp'
                            })
                            .color(Color.White)
                          Text('思考中')
                            .fontSize(14)
                            .fontColor($r('app.color.chat_ai_fontcolor'))
                        }

                        // Text(this.content)
                        //   .fontColor(Color.White)
                        MarkdownV2({
                          content:this.content,
                          lineSpace:6,
                          fontStyle:{
                            fontColor:$r('app.color.chat_ai_fontcolor'),
                            fontSize:14
                          },
                          theme:{
                            themeColor:$r('app.color.chat_ai_md_theme_color')
                          }
                        })
                      }
                      .backgroundColor($r('app.color.chat_ai_bg_color'))
                      .padding(10)
                      .alignItems(HorizontalAlign.Start)
                      .borderRadius(5)
                    }

                    Blank()
                  }
                  .width('80%')
                  .alignItems(HorizontalAlign.Start)
                } else if (msg.item.type === 1) {
                  Row() {
                    Blank()
                    Text(msg.item.content)
                      .backgroundColor($r('app.color.chat_human_bg_color'))
                      .padding(10)
                      .borderRadius(5)
                  }
                  .width('100%')

                }
              }
            })
        }
        .scrollBar(BarState.Off)
        .width('100%')
        .height('100%')
        Column()
          .width('100%')
          .height(35)
          .linearGradient({
            direction:GradientDirection.Bottom,
            colors:[[$r('app.color.chat_tool_hide_bar_color'),0],[$r('app.color.total_main_linearGradient_0point5'),1]]
          })
      }

    }
    .backgroundColor(Color.Transparent)
  }
}
```

与此同时我还添加了一个覆盖层，放置在聊天记录列表组件底部用于进行渐隐渐现的过度效果。

#### 键盘区域规避

这一部分我们直接将面试通项目的代码移植过来即可。
首先是获取当前应用的上下文对象。

```ts
    AppStorageV2.connect<GetContext>(GetContext, CONTEXT, () => new GetContext(this.context))
    logger.warn(ENTRYABILITY_LOG_TAG+'获取上下文对象成功')
```

由于上下文对象无法直接存储到全局变量中，所以我们需要在`GetContext`类中进行存储。同时再定义一个包装上下规避高度的类，用于在键盘区域显示时进行高度的调整。

```ts
/**
 * 存储开启沉浸式模式后的导航栏和状态栏规避高度信息
 * top:     顶部状态栏规避高度
 * bottom:  底部导航栏规避高度
 */
@ObservedV2
export class AvoidArea {
  @Trace top: number = 0;
  @Trace bottom: number = 0;
}

/**
 * 上下文对象包装类
 * 用于在AppStorageV2中存储上下文对象
 */
@ObservedV2
export class GetContext{
  @Trace context:Context

  constructor(context: Context) {
    this.context = context
  }

}
```

随后定义一个类用来包裹开启全屏和关闭全屏的方法。

```ts
import { AppStorageV2, promptAction, window } from '@kit.ArkUI'
import { AvoidArea } from '../../../models/utils/AvoidArea';
import { FULL_SCREEN_LOG_TAG, GetContext, logger } from '../../../ExportCentre'
import { CONTEXT } from '../../../entryability/EntryAbility';

export const AVOID_AREA = 'AvoidAres';
/**
 * 初始化AppStorageV2中的AvoidAres键值
 * 用于存储需要规避区域的高度值
 */
const avoid_area = AppStorageV2.connect(AvoidArea, AVOID_AREA, () => new AvoidArea())!

class FullScreen {
  /**
   * 开启沉浸式方法
   * 依赖于当前应用的上下文对象
   */
  async enable() {
    logger.debug(FULL_SCREEN_LOG_TAG+'进入FullScreen.enable')
    try {
      const context = AppStorageV2.connect<GetContext>(GetContext, CONTEXT)
      if (context) {
        logger.info(FULL_SCREEN_LOG_TAG+'找到Context')
        //获取当前窗口
        const win = await window.getLastWindow(context.context)
        //设置当前窗口为沉浸式模式
        await win.setWindowLayoutFullScreen(true)

        //获取顶部区域
        const topArea = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM).topRect
        //将顶部高度存储到AppStorage
        logger.info(FULL_SCREEN_LOG_TAG+'topAreaHeight: ' + px2vp(topArea.height))


        //获取底部区域和底部区域高度
        const bottomArea = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR).bottomRect
        logger.info(FULL_SCREEN_LOG_TAG+'bottomAreaHeight: ' + px2vp(bottomArea.height))


        avoid_area.top = px2vp(topArea.height);
        avoid_area.bottom = px2vp(bottomArea.height)
        logger.debug(FULL_SCREEN_LOG_TAG+'avoid_area数据更新完成')

      } else {
        logger.warn(FULL_SCREEN_LOG_TAG+'未找到Context')
      }

    } catch (err) {
      logger.error(err)
      promptAction.showToast({ message: err })
    }
  }

  /**
   * 关闭沉浸式方法
   * 依赖于当前应用的上下文对象
   */
  async disable(){
    logger.debug(FULL_SCREEN_LOG_TAG+'进入FullScreen.disable')
    try {
      const context = AppStorageV2.connect<GetContext>(GetContext, CONTEXT)
      if (context) {
        logger.info(FULL_SCREEN_LOG_TAG+'找到Context')
        //获取当前窗口
        const win = await window.getLastWindow(context.context)
        //设置当前窗口为沉浸式模式
        await win.setWindowLayoutFullScreen(false)

        avoid_area.top = 0
        avoid_area.bottom = 0
        logger.debug(FULL_SCREEN_LOG_TAG+'avoid_area数据更新完成')

      } else {
        logger.warn(FULL_SCREEN_LOG_TAG+'未找到Context')
      }

    } catch (err) {
      logger.error(err)
      promptAction.showToast({ message: err })
    }
  }
}

export const fullScreen = new FullScreen()
```

但写到这我倒是意识到了一个问题，这个解决方案只能在页面创建时区更新一次避让区域的高度，而无法在后续的应用生命周期里去进行更新。
所以我对这个方案进行了暂缓。

#### 键盘区域规避最终方案

在对面试通方案移植的方案搁浅之后我开始了文档的阅读。

我的第一个设想是在`TextInput`组件的点击事件或是焦点事件中去更新一次规避区域的高度。
但很显然这样麻烦的手动实现应该并不是官方希望的做法，这种基础功能应该是有自动实现的API的。所以我还需要继续查找。

紧接着我想到了之前在开发面试通时的一个疑问，我在编写开启沉浸式模式以及关闭沉浸式模式时，我还需要手动控制进行规避高度的获取和更新，而`expandSafeArea`方法则是可以自动获取规避区域的高度，那官方预留的这个方法和这个属性有什么区别吗？

于是我就回到了一直在用但是一直没仔细看过文档的`expandSafeArea`方法。

点开安全区域文档之后我才知道，原来安全区域不只这一个属性，而且这个属性还有参数可以填……（对不起我是罪人）

![expandSafeArea](“HongXiaoYi”/48.png)

于是我依照文档所示修改了键盘区域的避让方式。

```ts
    windowStage.loadContent('pages/Main', (err) => {
      windowStage.getMainWindowSync().getUIContext().setKeyboardAvoidMode(KeyboardAvoidMode.OFFSET);
      logger.warn(ENTRYABILITY_LOG_TAG+'KeyboardAvoidMode:  '+JSON.stringify(windowStage.getMainWindowSync().getUIContext().getKeyboardAvoidMode()))
      if (err.code) {
        hilog.error(DOMAIN, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err));
        return;
      }
      hilog.info(DOMAIN, 'testTag', 'Succeeded in loading the content.');
    });
```

<video width="100%" controls>
  <source src="49.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

enm……经过测试这个方案并不能实现我想要的效果。
此前我也曾多次遇到按照文档中的API编写后没有实现效果的情况，一部分是文档API的代码和最新版本不相符，就像是之前在调试扣子工作流时遇到的情况一样，但是这种事少数情况，更多的情况是我遗漏了一些细节。

![expandSafeArea](“HongXiaoYi”/50.png)

官方文档中使用的都是`TextArea`组件而不是`TextInput`组件。我尝试了使用`TextArea`组件，但结果还是一样的。

随后我怀疑到会不会是`expandSafeArea`属性被滥用导致的，因为我在许多位置都使用了该属性于是我删除了根组件以外的全部`expandSafeArea`属性。

<video width="100%" controls>
  <source src="51.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

成功了，事实证明与组件种类无关。

随后我又进行了测试，我将文本框加上`expandSafeArea`属性，发送按钮不加，最终就实现了只有发送按钮避让的效果。

<video width="100%" controls>
  <source src="52.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

#### 开屏页分离

当前的代码仍然存在一个潜在问题，就是用户打开应用，开屏页退去后，如果点击了系统的返回按钮，应用会从主页面从新退回开屏页。这很显然是错误的，我们不能在进入应用后还能再次回到开屏页同时无法从新进入主页面。

<video width="100%" controls>
  <source src="53.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

所以我们需要将主页面在开屏页后就进行销毁处理。

我的第一个方案是将开屏页从`Navigation`组件中分离单独做成一个`navDestination`组件，然后调用`replacePath`方法进行销毁。

![expandSafeArea](“HongXiaoYi”/54.png)

但这个方案又遇到了另一个问题，就是在于开屏页确实是从页面栈中移出了，但问题是用户点击返回按钮后依旧会回到一个空白的主页面，因为将开屏页从`Navigation`组件中分离后，**主页面依旧存在而且为空**，所以这并没有解决问题，同时在跳转时会有一个明显的淡黑色透明组件框的拖延，这并不符合我们的预期。

所以我决定将开屏页从一个组件转换为一个页面，并将chat组件直接放置于`Navigation`组件中。这样就可以销毁掉开屏页的同时保证主页面无需一次从空页面跳转到聊天页的无意义跳转了。
效果如下：

<video width="100%" controls>
  <source src="55.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

<video width="100%" controls>
  <source src="56.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

整体开屏效果更加**干脆利落**。

与此同时我并不是将整个`Chat`组件拆开复制到了`Main`组件中，而是在**保持`Chat`组件的独立性的同时去进行导出与调用**，这样在后续开发中可以将主界面也就是`Navigation`组件替换为其他页面，诸如多个聊天页面的列表，添加`Tabs`组件**拓展更多的功能**等。

```ts
  @Builder
  NavDestMap(name: string) {
    if (name === NavDests.MAIN) {
      Main()
    } else if (name === NavDests.CHAT) {
      Chat()
    }
  }

  // aboutToAppear(): void {
  //   this.navPathStuck.pushPath({name:NavDests.CHAT})
  // }


  build() {
    Column() {
      Navigation(this.navPathStuck) {
        Chat()
      }
      .backgroundColor(Color.Transparent)
      .padding(10)
      .navDestination(this.NavDestMap)
      .hideTitleBar(true)
      .hideToolBar(true)
      .height('100%')
      .width('100%')
      .hideBackButton(true)
      .titleMode(NavigationTitleMode.Mini)
      .mode(NavigationMode.Stack)
    }
    .expandSafeArea()
    .linearGradient({
      direction: GradientDirection.Bottom,
      colors: [[$r('app.color.total_main_linearGradient_0'), 0],
        [$r('app.color.total_main_linearGradient_0point5'), 0.5]]
    })
  }
```

保留了将`Chat`组件重新拆分出去的代码，以便于**后续拓展**。

#### `hasEnd`修改位置调整

在测试中，有时候会出现在当前轮次对话接收完毕后，顶部的思考中提示字符以及加载动画并不消失，与此同时发送按钮也不会自动弹出，整个程序陷入了无法进行下轮对话的状态。

{% note info flat  %}
debug的一个很重要的手段就是去寻找多个现象的共同点，像是加载动画不消失和发送按钮不弹出两者之间的共同点就在于`hasEnd`属性变化是两者的触发条件，所以说明问题出现在`hasEnd`属性的切换上。
{% endnote %}

随后我查看了日志，发现问题出在了最后在解析`done`事件的数据包时发生了数据格式错误，JSON内置解析函数没有正常的执行解析导致将对话写入对话历史记录中的操作没有执行，再起之后的`hasEnd`属性也没有被正确的赋值，所以导致了加载动画和发送按钮的问题。

所以我在`finally`回调函数中去对`hasEnd`属性进行了赋值，这样就可以保证在任何情况下都能正确的赋值。

```ts
  session.post('https://api.coze.cn/v1/workflows/chat', ai)
    .catch((err: BusinessError) => {
      logger.error(err.message)
    })
    .finally(() => {
      currentMsg.hasEnd = true
      logger.info('requestCozeAi:  ' + '数据传输已完成')
      session.close()
      logger.warn('requestCozeAi:  '+'session已关闭')
    })
```

{% note warning flat %}
由于在发现这个bug时我并没有录屏截图留存，所以现在我只能通过描述来进行复现，以后在遇到bug时应当**先行留档**。
{% endnote %}

但在这个bug修复后虽然会正常的结束当前轮次的对话了，但新的bug出现了。

<video width="100%" controls>
  <source src="57.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

在当前轮次对话结束的瞬间，整个对话内容会被复制一次，并写入渲染列表中。

{% note danger flat  %}
请注意这里的解决方案并非最终解决方案，在实现打字机效果后对这个问题有了新发现，重复写入问题的成因并非`hasEnd`属性变化导致。
[新解决方案传送门](https://xbxyftx.top/2025/03/31/%E2%80%9Chongxiaoyi%E2%80%9D/#%E5%86%85%E5%AE%B9%E9%87%8D%E5%A4%8D%E5%86%99%E5%85%A5%E9%97%AE%E9%A2%98)
{% endnote %}

![expandSafeArea](“HongXiaoYi”/58.jpg)

对于这个问题我们要分析当前bug的成因，首先触发渲染数组的写入事件是当前对话对象的`hasEnd`属性监听器，当该属性发生变化时就会触发写入事件，既然触发了两次写入事件，那就说明`hasEnd`属性发生了两次变化，我们需要找到冗余的一次变化。

```ts
  @Monitor ('currentMsg.hasEnd')
  onContentEnd(): void {
    if (this.currentMsg.hasEnd) {
      this.viewMessageList.pop();
      this.viewMessageList.push({ content: this.currentMsg.content!.replace('null', ''), type: 0, hasEnd: true });
      this.currentMsg.content = '';
    }
  }
```

在修改上一个BUG时我仅仅是在`finally`回调函数中去对`hasEnd`属性进行了赋值，并没有将检测到`done`事件数据包时的代码块进行修改，所以这里还保留了一次`hasEnd`属性的变化，所以这里就找到了冗余的一次变化。

```ts
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          currentMsg.hasEnd = false
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          console.log('onDataReceive原始数据：  ' + s)
          try {
            if (s.includes('conversation.message.delta')) {
              s.split('data: ').forEach((item: string, index) => {
                if (index === 1) {
                const data = item.split('event: ')[0]
                logger.info('____________________________')
                logger.info('读取到的data： ' + data)
                const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                logger.info('onDataReceive写入： ' + message_data.content)
                currentMsg.content += message_data.content.replace('null', '')
                logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
                logger.info('____________________________')
                }else if (index === 2){
                  const data = item
                  logger.info('____________________________')
                  logger.info('读取到的data： ' + data)
                  const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                  logger.info('onDataReceive写入： ' + message_data.content)
                  currentMsg.content += message_data.content.replace('null', '')
                  logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
                  logger.info('____________________________')
                }
              })
            }
          } catch (err) {
            logger.error(ON_DATA_RECEIVE+ 'onDataReceive捕获异常: ' + err)
          }

        }
      }
    }
```

这里我将`done`事件的判断直接删除，因为我在分析其功能之后发现与`finally`回调函数的功能一致，所以我直接将其功能代码转移至`finally`回调函数中。
这样就避免了手动处理数据时可能产生的数据类型问题。

```ts
  session.post('https://api.coze.cn/v1/workflows/chat', ai)
    .catch((err: BusinessError) => {
      logger.error(err.message)
    })
    .finally(() => {
      logger.warn('requestCozeAi:  '+ '当前对话流式传输结束，开始进行对话历史写入')
      const message = new CozeHistoryMessagesItem(HistoryMessages_Role.Assistant)
      message.content_type= CONTENT_TYPE_STRING
      message.content=currentMsg.content!
      historyMessageList.addMessage(message)
      logger.warn('requestCozeAi:  '+'历史添加完毕')
      currentMsg.hasEnd = true
      logger.info('requestCozeAi:  ' + '数据传输已完成')
      session.close()
      logger.warn('requestCozeAi:  '+'session已关闭')
    })
```

修改完后进行多次测试，该现象并没有再次发生。

至此我的最初版本算是告一段落了。

我将应用版本号修改为了`1.0.1`。

![版本号](“HongXiaoYi”/59.jpg)

## 鸿蒙端侧优化开发笔记

最初版本的应用已经开发完毕从这部分开始就是对应用的优化以及后续拓展的开发。

### 打字机效果

在当前版本中，我们采用的只是将当前数据包中的内容直接完整的写入到当前的对话渲染对象中，这样的效果就是在进行输出时的效果非常生硬，输出的频率以及每次的内容量都是只能由扣子平台进行控制。整体的输出效果是非常生硬的，虽然相比直接输出整段回答是要好很多，但这并不足以满足我对与应用优化的要求。

我的目标是如下视频所示的效果：

<video width="100%" controls>
  <source src="60.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

在这个效果中，我们可以看到在进行输出时，每次的输出内容都是按照一定的时间间隔进行输出的，效果非常的流畅，这样的效果就更加符合我们的预期。

#### AI尝试

我本以为这是个很简单的效果，随便AI一下就能解决。于是我就让通义千问帮我修改了一下。

```ts
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          currentMsg.hasEnd = false;
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          console.log('onDataReceive原始数据：  ' + s);
          try {
            if (s.includes('conversation.message.delta')) {
              s.split('data: ').forEach((item: string, index) => {
                if (index === 1 || index === 2) {
                  const data = item.split('event: ')[0];
                  logger.info('____________________________');
                  logger.info('读取到的data： ' + data);
                  const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData;
                  logger.info('onDataReceive写入： ' + message_data.content);
                  typeWriterEffect(message_data.content.replace('null', ''), 0);
                  logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd);
                  logger.info('____________________________');
                }
              });
            }
          } catch (err) {
            logger.error(ON_DATA_RECEIVE + 'onDataReceive捕获异常: ' + err);
          }
        }
      }
    }

function typeWriterEffect(text: string, index: number) {
  if (index < text.length) {
    currentMsg.content += text.charAt(index);
    setTimeout(() => typeWriterEffect(text, index + 1), 50); // 每50毫秒输出一个字符
  } else {
    currentMsg.hasEnd = true;
  }
}
```

看起来很美好对吧，每次将接收到的数组进行遍历，随后将待添加字符串每隔50毫秒录入一个字符，这样就可以实现固定时间的输出来进行打字机输出效果了。
但在实际测试时才能将它的缺陷展示出来。

<video width="100%" controls>
  <source src="61.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

enm……很显然50毫秒还是太短了，整体根本看不出来打字机效果，与此同时还有另一个问题就是在将当前接收到的文字全部写入后，下一个数据包还没有获取到或是没有解析完成，导致两次输出之间还有及其明显的速度差异，显得还是十分卡顿，并不符合我们的预期。

{% note primary flat %}
很多时候都是这样，理论上看似十分美好，但实际测试才能真正的去暴露问题，这也是学习编程不能只学理论不实操的原因。
{% endnote %}

随后我将间隔时间由50毫秒改为了200毫秒，却又出现了新的问题：

<video width="100%" controls>
  <source src="62.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

可以看到输出的过程在频繁地闪烁，而且输出的内容大多是乱码，但在仔细观察这些乱码之后我发现这并不是简单的乱码，而是**正常内容被切割后的错序排列**。
与此同时，我们可以看到当前页面的右下角的发送按钮出现了**频繁地闪烁**，反复的处于当前对话结束以及当前对话开始的状态，这**一点能反映出`hasEnd`属性在反复的变化**。

由此可知我们的问题还是出在了`hasEnd`状态的变化机制上，这一点产生的原因也不难猜测，因为刚才50ms的时间间隔，两个数据包之间解析与写入的间隔较大，而当间隔设为200ms之后，**单次数据的写入时间被大大拉长**，上一次数据在写入**完成之前**就会去进行下一次的写入，`setTimeout`这个异步函数在**同一时间有多个异步任务等待被执行**，主线程就会穿插执行这多个异步任务，所以就会出现**数据的乱序排列**。

这个过程我并没有开启多线程处理，整体都是利用主线程来进行简单的异步处理，js、ts、以及ArkTS的单线程异步处理都是用事件循环机制实现的。程序执行时会首先执行非异步代码，将异步代码放入事件队列中，在主线程执行完全部非异步代码后，会从事件队列中取出异步代码进行执行。
大致的执行流程如下图所示：

![事件循环](“HongXiaoYi”/63.png)

这张图并不准确，只是大致示意主线程的执行过程，在一条语句写入期间，其他异步任务会将它们写入的字符串穿插在上一条语句的字符串中，随着数据包的接受与解析，这种穿插情况会愈发明显，最终就会出现**乱序排列**的情况。

而对于`hasEnd`属性的反复变化其实也很好理解，因为在**每个异步函数将其需要写入的字符串写入完成后就会去将`hasEnd`属性进行赋值**，所以就会出现反复的变化。

由此我们可以总结出需要改变的两点：

1. 创建缓存区，将全部获取的数据都写入到缓存区中，然后统一通过一个异步函数去进行写入，这样就可以避免多个异步混合执行导致的写入顺序问题。
2. 调整`hasEnd`属性的赋值时机，将其赋值时机调整到异步函数写入完成后，这样就可以避免`hasEnd`属性在写入完成之前就进行赋值，导致的反复变化问题。

在分析出当前结论之前，我还进行了另一种尝试，只修改了`hasEnd`属性的赋值时机，并没有修改写入缓存区的代码。

```ts
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          currentMsg.hasEnd = false
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          console.log('onDataReceive原始数据：  ' + s)
          try {
            if (s.includes('conversation.message.delta')) {
              s.split('data: ').forEach((item: string, index) => {
                if (index === 1) {
                  const data = item.split('event: ')[0]
                  logger.info('____________________________')
                  logger.info('读取到的data： ' + data)
                  const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                  logger.info('onDataReceive写入： ' + message_data.content)
                  const dataWaitToAdd = message_data.content.replace('null', '')
                  let i = 0
                  const id = setInterval(()=>{
                    if (i<dataWaitToAdd.length) {
                      logger.warn('i='+i+'  dataWaitToAdd.charAt(i)  '+dataWaitToAdd.charAt(i))
                      currentMsg.content += dataWaitToAdd.charAt(i)
                      i++
                    }else if (i===dataWaitToAdd.length){
                      clearInterval(id)
                    }
                  },200)

                  logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
                  logger.info('____________________________')
                } else if (index === 2) {
                  const data = item
                  logger.info('____________________________')
                  logger.info('读取到的data： ' + data)
                  const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
                  logger.info('onDataReceive写入： ' + message_data.content)
                  const dataWaitToAdd = message_data.content.replace('null', '')
                  let i = 0
                  const id = setInterval(()=>{
                    if (i<dataWaitToAdd.length) {
                      logger.warn('i='+i+'  dataWaitToAdd.charAt(i)  '+dataWaitToAdd.charAt(i))
                      currentMsg.content += dataWaitToAdd.charAt(i)
                      i++
                    }else if (i===dataWaitToAdd.length){
                      clearInterval(id)
                    }
                  },200)
                  logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
                  logger.info('____________________________')
                }
              })
            }
          } catch (err) {
            logger.error(ON_DATA_RECEIVE + 'onDataReceive捕获异常: ' + err)
          }

        }
      }
    }
```

这段代码中我将原本拆分出去的函数功能合并到了数据处理回调函数中，这里在写入后并不会直接修改`hasEnd`属性，而是仅进行数据的写入工作，整体依旧是多个异步操作，所以显示的数据依旧是乱序的。

<video width="100%" controls>
  <source src="64.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

这个测试也进一步的验证了我的猜想，因为这个测试中并没与进行频繁的`hasEnd`属性值切换操作，所以所有数据不会因为监听到了`hasEnd`属性的变化而进行清空操作，全部数据都有被正常的写入到了渲染数据对象中。
与此同时我们仔细的阅读当前的文字也是能看出原本的文本是正常的，以及被打乱的痕迹。
更直观的，通过日志：

![日志](“HongXiaoYi”/65.png)

我们可以看到异步操作是黄色的警告字体，而同步操作是白色的信息字体，每当接收到数据后就会**先去执行同步的代码然后再穿插着执行异步代码**，当前**异步写入字符的索引i的顺序是乱的**，这就很好的验证了我的猜想。

#### 最终方案

经过以上分析，我首先去创建了一个字符串缓冲区，在接收到第一条数据后等待一秒去进行输出，这是为了防止网络卡顿导致接收到的数据量少，在数据传输结束之前就终止了输出。
随后我将`hasEnd`属性的赋值时机调整到了异步函数写入完成后，这样就可以避免`hasEnd`属性在写入完成之前就进行赋值，导致的反复变化问题。

```ts
@ObservedV2
  /**
   * 打字机效果的数据接收缓冲区
   */
class TypeStringBuffer {
  /**
   * 启动标识符
   */
  @Trace private startSign: boolean = false
  /**
   * 待输出字符串数组
   */
  @Trace private charArray: string[] = []
  currentMsg: ViewMessageModel = AppStorageV2.connect(ViewMessageModel, MSG, () => new ViewMessageModel())!;

  strAdd(addStr: string) {
    if (addStr === '') {
      logger.warn('StringBuffer.strAdd:  ' + 'str为空')
      return
    }
    logger.warn('StringBuffer.strAdd:  '+'addstr='+addStr)
    for (let i=0;i<addStr.length;i++) {
      this.charArray.push(addStr.charAt(i));
    }
    logger.warn('StringBuffer.strAdd:  ' + 'charArray=' + this.charArray.join(''));
  }

  start() {
    if (this.startSign) {
      logger.warn('StringBuffer.start:  '+'已经在执行')
    }else {
      this.startSign = true;
      setTimeout(() => {
        const id = setInterval(() => {
          if (this.charArray.length > 0) {
            const currentChar = this.charArray.shift()!; // 取出并删除第一个字符
            logger.warn('StringBuffer.start:  '+'currentChar='+currentChar)
            this.currentMsg.content += currentChar;
            logger.warn('StringBuffer.start:  ' + '输出字符=' + currentChar);
          } else {
            clearInterval(id);
            this.startSign = false;
            logger.warn('StringBuffer.start:  ' + '所有字符已输出');
            this.currentMsg.hasEnd=true
          }
        }, 100);
      }, 1000);
    }
  }
}

export const typeStringBuffer: TypeStringBuffer = new TypeStringBuffer()
```

随后就是激动人心的测试环节：

<video width="100%" controls>
  <source src="66.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

ok成功了，这里显得有点慢是为了演示方便观察，所以将字符写入的间隔改为了100ms，后续只需要将间隔进行调整即可。

<video width="100%" controls>
  <source src="67.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

修改字符输出速度之后整体的流畅度还是非常完美的。

### 欢迎字段

当前版本中，用户进入APP后面对的就是一个冷冰冰的聊天界面，并没有任何的欢迎字段，这对于用户来说是非常不友好的，所以我打算在用户进入APP后展示一个欢迎字段。

单一的欢迎词还是略显乏味，所以我决定多定义几个欢迎词然后每次随机获取。

```ts
export const WELCOME_WORD = [
  'HI，我是鸿小易，一名鸿蒙开发专家，有任何鸿蒙开发的问题都可以问我哦。',
  'Hello Wold，欢迎来到鸿蒙开发的世界，我是鸿蒙开发专家鸿小易，欢迎问我鸿蒙开发问题。',
  'Hi开发者！鸿小易在此待命，HarmonyOS应用开发中的疑难杂症，我们一起来攻克吧！',
  '欢迎进入鸿蒙世界！我是你的开发伙伴鸿小易，从环境配置到分布式开发，任何卡点都欢迎随时交流~',
  '你好呀~我是鸿小易，专注鸿蒙生态开发指导。无论是ArkUI还是Stage模型的问题，我都准备好为你解答啦！'
]
```

由于这一部分会直接修改渲染数据，而且依赖于特性层的字符串缓冲区，所以我们将他封装在特性层的API中。

```ts
@ObservedV2
export class WelcomeApi{
  /**
   * 随机获取欢迎词并进行打字机输出
   */
  public static welcome (){
    const currentWelcomeWord :string =WELCOME_WORD[Math.floor(Math.random() * WELCOME_WORD.length)]
    logger.warn(WELCOME_API_LOG_TAG+currentWelcomeWord)
    typeStringBuffer.strAdd(currentWelcomeWord)
    typeStringBuffer.start()
  }
}
```

![欢迎词](“HongXiaoYi”/68.jpg)

enm……失败了，看看日志。

![日志](“HongXiaoYi”/69.png)

获取欢迎词成功了，字符串缓冲区的打字机效果也生效了，但是页面没有显示。
对于页面显示，我们需要思考显示页面的关键是什么，我们的对话列表是循环渲染的`viewMessageList`，所以说明我们的当前对话信息对象并**没有被存储进渲染对话列表中**。
由此我们可以继续推测到是我们没有进行与用户**点击发送按钮之后的相同操作**，也就是**没有新建待渲染的空对象**。

所以我们先回到`Chat`页面组件将我们的`viewMessageList`属性在初始化时就留出我们的欢迎语空对象。

```ts
  @Local viewMessageList: ViewMessageModel[] = [{ content: '', type: 0, hasEnd: true }]
```

随后回到欢迎Api进行当前对话信息对象的初始化工作。

```ts
  /**
   * 随机获取欢迎词并进行打字机输出
   */
  public static welcome (){
    const currentWelcomeWord :string =WELCOME_WORD[Math.floor(Math.random() * WELCOME_WORD.length)]
    logger.warn(WELCOME_API_LOG_TAG+currentWelcomeWord)
    typeStringBuffer.strAdd(currentWelcomeWord)
    AppStorageV2.connect(ViewMessageModel, MSG, () => new ViewMessageModel())!.hasEnd=false
    AppStorageV2.connect(ViewMessageModel, MSG, () => new ViewMessageModel())!.type=0
    AppStorageV2.connect(ViewMessageModel, MSG, () => new ViewMessageModel())!.currentIndex=0
    typeStringBuffer.start()
  }
```

进行测试。

<video width="100%" controls>
  <source src="70.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

ok成功了，欢迎词也显示出来了。

但这也暴露出了另一个问题，我们在进行渲染是时会固定的刷新出一个null在开头，而且在写入完成后，它还会消失，就很奇怪。

### 解决null问题

对于这个问题，我的想法是添加当前对话信息对象的监听器，来打印当前的对话信息。

```ts
  @Monitor('currentMsg.content')
  onContentChange():void{
    logger.debug('currentMsg.content:  '+this.currentMsg.content)
  }
```

![日志](“HongXiaoYi”/71.png)

对于这个现象我认为是在`AppStorageV2`中进行对象的初始化时并没有写初始化`content`属性的值，其值为`null`所以才导致了直接在其之上添加字符会导致`null`的显示。

```ts
/**
 * 对话渲染数据模型
 */
@ObservedV2
export class ViewMessageModel {
  /**
   * 人类是1Ai是0
   */
  type: number | null = null;
  @Trace hasEnd: boolean = true;
  @Trace content: string = '';
  @Trace currentIndex?: number;
}
```

修改渲染模型的默认值。

再次测试。

![日志](“HongXiaoYi”/72.png)

<video width="100%" controls>
  <source src="73.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

ok成功了，null问题解决了。

### 卡顿问题

当前的版本还是存在比较严重的卡顿问题，我怀疑是在实现打字机效果时，频繁的对文字缓冲区进行删改操作导致的。

所以我决定先将删的操作去除，利用动态更新待输出字符串长度的方式进行优化。与此同时去除无用日志打印。同时去除无用Trace修饰符

```ts
import { logger } from 'common'
import { ViewMessageModel } from '..';
import { AppStorageV2 } from '@kit.ArkUI';
import { MSG } from '../../constants';

@ObservedV2
  /**
   * 打字机效果的数据接收缓冲区
   */
class TypeStringBuffer {
  /**
   * 启动标识符
   */
  private startSign: boolean = false
  /**
   * 待输出字符串数组
   */
  private charArray: string[] = []
  currentMsg: ViewMessageModel = AppStorageV2.connect(ViewMessageModel, MSG, () => new ViewMessageModel())!;

  strAdd(addStr: string) {
    if (addStr === '') {
      logger.warn('StringBuffer.strAdd:  ' + 'str为空')
      return
    }
    // logger.warn('StringBuffer.strAdd:  '+'addstr='+addStr)
    for (let i=0;i<addStr.length;i++) {
      this.charArray.push(addStr.charAt(i));
    }
    // logger.warn('StringBuffer.strAdd:  ' + 'charArray=' + this.charArray.join(''));
  }

  start() {
    if (this.startSign) {
      logger.warn('StringBuffer.start:  '+'已经在执行')
    }else {
      this.startSign = true;
      setTimeout(() => {
        let index = 0
        const id = setInterval(() => {
          if (this.charArray.length > 0 && index<this.charArray.length) {
            const currentChar = this.charArray[index]
            // logger.warn('StringBuffer.start:  '+'currentChar='+currentChar)
            this.currentMsg.content += currentChar;
            index++
            // logger.warn('StringBuffer.start:  ' + '输出字符=' + currentChar + '  index='+index);
          } else {
            clearInterval(id);
            this.startSign = false;
            logger.warn('StringBuffer.start:  ' + '所有字符已输出');
            this.currentMsg.hasEnd=true
            this.charArray=[]
          }
        }, 50);
      }, 1000);
    }
  }
}

export const typeStringBuffer: TypeStringBuffer = new TypeStringBuffer()
```

<video width="100%" controls>
  <source src="76.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

这个视频我特意录的长了些，可以看出现在的问题在于一开始整体的滚动是很丝滑的，但是越往后他的效果就越卡顿，这是为什么呢？
这个改动效果不明显，先将改动进行回退。

#### 转机

![日志](“HongXiaoYi”/77.png)

在我和骏哥的讨论中我意识到了一个问题在于渐变色很可能对于需要高频率渲染的场景造成较大压力，于是我将聊天框的百分之60不透明度删除，再次测试。
结果大差不差，就不放视频了。

现在已经几乎排除了所有的性能问题，但依旧成效不大。

![日志](“HongXiaoYi”/78.png)

于是我接着将这些“花里胡哨”的东西都去掉了，只保留了最基本的功能。
但测试结果还是不算理想。

至此基本可以排除是性能的问题了……

随后骏哥提出了一个很让人震惊但确实可能性很大的猜想：

![日志](“HongXiaoYi”/79.png)

我草很有道理诶，这种并非程序本身问题的场外因素确实有可能造成意料之外的卡顿。

{% note primary flat %}
写到这时我不禁想到了对弈的胜负不只局限于棋盘之中，盘外招虽被大多数人所鄙视，但我们却又无法忽视盘外招所造成的影响，所以**要学会向后退**，退到棋盘之外，让视野变大，才能更好的发现问题。
{% endnote %}

于是我换了另一种解决方案：
添加一个监听器，每当当前渲染的文字内容发生改变时，也就是打字机新增了字符后就去将列表滚动到底部。

```ts
  listScroller:Scroller = new Scroller()
  @Monitor('content')
  onChange(){
    this.listScroller.scrollEdge(Edge.Bottom)
  }
```

<video width="100%" controls>
  <source src="80.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

这样直接取消了用户手动滚动的可能，同时也变相解决了卡顿问题。

但这个问题仍存在疑点，因为上面视频第一秒和第50秒的帧率感觉明显不一样，而且我都是在手动滚动，这和骏哥的猜测并不相符，但现在暂时没有新想法，就先暂时搁置吧。

### 打印速度问题

当前还存在一个问题就是当我的打字机效果字符之间的间隔时长过长像是100ms左右，就会显得打印过慢，这对于用户来说是非常不友好的，浪费时间。
但如果打印过快像是20ms一个字符左右又会导致出现，字符缓冲区内容打印完成了，`hasEnd`属性进行了切换，但当前对话信息并没有结束，这就会导致同一条回复被割裂成了两个文本框。

所以我们还需要去修改`hasEnd`属性的赋值判断条件。

我想到的解决方案是双标志符
一个是当前缓冲区已经没有字符了，另一个是当前流式传输已经结束。

```ts

      setTimeout(() => {
        const id = setInterval(() => {
          if (this.charArray.length > 0 && !this.rcpEnd) {
            const currentChar = this.charArray.shift()!; // 取出并删除第一个字符
            logger.warn('StringBuffer.start:  '+'currentChar='+currentChar)
            this.currentMsg.content += currentChar;
          } else if(this.charArray.length===0 && !this.rcpEnd) {
            logger.warn('StringBuffer.start:  '+'当前无数据但流失传输未结束')
          } else if (this.rcpEnd && this.charArray.length===0){
            clearInterval(id);
            this.startSign = false;
            logger.warn('StringBuffer.start:  ' + '所有字符已输出');
            this.currentMsg.hasEnd=true
          }
        }, 30);
      }, 1000);
```

<video width="100%" controls>
  <source src="81.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

经过多次调整，10ms输出一个字符，延迟两秒预制数据算是比较均衡的方案。整体效果也是非常喜人。
观察日志也可以发现整体的输出速度与数据的获取速度基本成正比，无数据情况发生极少。

### 内容重复写入问题

在之前没有制作打字机效果之前就出现过内容重复写入的效果，只不过那时候没有设置缓冲区所以整体是统一出现的，导致我误判成为了因为`hasEnd`属性的赋值时机问题。
但在制作了缓冲区之后我才发现他是逐行打印出来的，这就说明问题并不出在了`hasEnd`属性的赋值时机上，而是在数据的处理过程中。

![日志](“HongXiaoYi”/82.png)

数据处理的过程中向缓冲区重复写入了当前的完整数据，导致了重复写入的问题。
这也是引出了我曾经的猜想，因为同一个数据包中包含了两条数据，如果同一个数据包中第一条是我们所需要的数据，而第二条则是我们所不需要的标志性数据，那就会出现重复写入了最后总结性时间数据的问题。

所以我们还需要在加一步判断。

```ts
  try {
    typeStringBuffer.rcpEnd = false
    let secondIsCompleted: boolean = false
    if (s.includes('conversation.message.delta')) {
      s.split('data: ').forEach((item: string, index) => {
        if (index === 1) {
          const data = item.split('event: ')[0]
          const secondEvent = item.split('event: ')[1]
          if (secondEvent.includes('message.completed')) {
            secondIsCompleted = true
            logger.warn('onDataReceive 第二个事件为completed')
          }
          logger.info('____________________________')
          logger.info('读取到的data： ' + data)
          const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
          const dataWaitToAdd = message_data.content.replace('null', '')
          logger.info('onDataReceive 向字符缓冲区写入： ' + dataWaitToAdd)
          typeStringBuffer.strAdd(dataWaitToAdd)
          typeStringBuffer.start()
          logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
          logger.info('____________________________')
        } else if (index === 2 && !secondIsCompleted) {
          const data = item
          logger.info('____________________________')
          logger.info('读取到的data： ' + data)
          const message_data = JSON.parse(data) as IHXYConversationMessage_DeltaData
          logger.info('onDataReceive 向字符缓冲区写入： ' + message_data.content)
          const dataWaitToAdd = message_data.content.replace('null', '')
          typeStringBuffer.strAdd(dataWaitToAdd)
          logger.info('msgModel.hasEnd= ' + currentMsg.hasEnd)
          logger.info('____________________________')
        }
      })
    }
  } catch (err) {
    logger.error(ON_DATA_RECEIVE + 'onDataReceive捕获异常: ' + err)
  }
```

经测试暂未发现问题，后续会继续测试。

### 数据包丢失

![日志](“HongXiaoYi”/83.jpg)

在测试中发现，有时候后端发回的数据会包含有仅一个事件的情况，这直接打破了我们之前一直在沿用的数据解析算法，导致了类型错误，数据解析工作全部失败。

![日志](“HongXiaoYi”/85.png)

这时我才想起来骏哥说过的“逐行解析“的含金量啊……

![日志](“HongXiaoYi”/84.png)

我怎么敢说出已经解决了这种话的……

```ts
    tracing: {
      httpEventsHandler: {
        onDataReceive: (inComingData: ArrayBuffer) => {
          currentMsg.hasEnd = false
          const bufferFrom: Uint8Array = new Uint8Array(inComingData);
          const s = new util.TextDecoder().decodeToString(bufferFrom);
          logger.info('onDataReceive原始数据：  ' + s)
          const lines:string[] = s.split('\n');
          let deltaDataLines:number[]=[]
          typeStringBuffer.rcpEnd = false
          try {
            lines.forEach((item:string,index:number)=>{
              if (item.includes('conversation.message.delta')) {
                deltaDataLines.push(index+1)
              }
            })
            lines.forEach((item:string,index:number)=>{
              if (deltaDataLines.includes(index)) {
                const message_data = (JSON.parse(item) as IHXYConversationMessage_DeltaData).content.replace('null', '')
                logger.info('________________________________________________________')
                typeStringBuffer.strAdd(message_data)
                typeStringBuffer.start()
                logger.info('onDataReceive 向字符缓冲区写入： ' + message_data)
                logger.info('________________________________________________________')
              }
            })
          } catch (err) {
            logger.error(ON_DATA_RECEIVE + 'onDataReceive捕获异常: ' + err)
          }

        }
      }
    }
```

在我理清思路写下这些代码的时候才意识到原来这段代码可以这么简洁……

![日志](“HongXiaoYi”/86.png)

奥不对，没有对data进行数据拆解。

```ts
  lines.forEach((item:string,index:number)=>{
    if (deltaDataLines.includes(index)) {
      const data = item.split('data: ')[1]
      const message_data = (JSON.parse(data) as IHXYConversationMessage_DeltaData).content.replace('null', '')
      logger.info('________________________________________________________')
      logger.info('onDataReceive data='+data)
      typeStringBuffer.strAdd(message_data)
      typeStringBuffer.start()
      logger.info('onDataReceive 向字符缓冲区写入： ' + message_data)
      logger.info('________________________________________________________')
    }
  })
```

后续测试的日志证明数据包的数量不仅会少，还会更多。

![日志](“HongXiaoYi”/87.png)

{% note danger flat %}
挖掘数据共同点，抽象化重复性的通用操作是非常重要的，不能仅针对当前数据定制处理方案，这样一旦数据发生变化就会导致处理方案失效。
{% endnote %}

### 对话历史信息记录与上下文关联回复生成

之前虽然大模型偶尔会生成类似于”根据我们之前的对话“这种话，但那都是因为我的大模型提示词中包含了这句话。实际生成的有效内容可以看得出来都是伪历史，也就是说大模型依据我的语义去猜测的，而不是依据我之前的对话去生成的。

但是我在前面的开发笔记也记录了我存储对话历史并回传的操作，为什么没有生效呢。
在这种时刻我们就需要去回归文档，去仔细的阅读生效条件，去寻找问题的根本原因。

首先在大模型节点的会话历史按钮，它是这么描述的

![文档](“HongXiaoYi”/91.png)

利用一个唯一标识来去存储对话历史记录，这很合理，那有没有可能是我的唯一标识变化了？

![日志](“HongXiaoYi”/93.png)

果然，我的标识在每次发送请求时都会进行刷新。我之前没意识到这一点，真是不应该。

```ts
const date = `${Date.now()}${Math.floor(Math.random() * 1000)}`
```

将当前的唯一标识进行提取，仅在应用启动时生成一次。

但经过测试上下文**依旧没有被成功读取**。

于是我继续翻找文档：

![文档](“HongXiaoYi”/94.png)

从这两个参数来看我之前的理解应该是正确的，用传参的形式将对话历史信息传递给大模型，但在测试时表现出的效果证明我肯定还有遗漏的点。

![日志](“HongXiaoYi”/95.png)

对话流产生的消息会保存到此对话中,这个描述说实话有点暧昧。
对话流产生的消息到底包不包含用户的问题，会话ID指的是什么？指的是当前的一问一答还是说当前页面的所有对话？

![日志](“HongXiaoYi”/96.png)

`additional_messages`对象类型中明明已经包含了发送这条消息的实体这个选项，那为什么还要在云端再存一次。真的很奇怪
但在看了官方给出的实例后发现都填写了这一字段的值，所以我也先进行尝试吧。

```ts
  const ai: ICoZePostBody = {
    workflow_id: '7487986803871760399',
    additional_messages: historyMessageList.getList(),
    parameters: new Map<string, string>([['CONVERSATION_NAME', 'HXY' + date]]),
    conversation_id: date
  }
```

![日志](“HongXiaoYi”/97.png)

请求对象直接关闭了，返回的数据包为错误信息`“Invalid request parameters. Please check your input and ensure all required fields are correctly formatted and within allowed ranges.”`
参数问题。

我的猜测是我的参数值为纯数字，虽然我在客户端将它设定为字符串，但在网络请求的过程中并不会携带类型进行传输，纯数字可能会被服务器认为是一个`int`类型导致参数错误。

```ts
  const ai: ICoZePostBody = {
    workflow_id: '7487986803871760399',
    additional_messages: historyMessageList.getList(),
    parameters: new Map<string, string>([['CONVERSATION_NAME', 'HXY' + date]]),
    conversation_id: 'abc'+date
  }
```

于是在我进行字符的拼接之后，就成功实现了上下文的读取！！！

![日志](“HongXiaoYi”/98.jpg)

## 后端优化笔记

此前我也提到过我们的智能体后端依旧存在着一些幻觉以及近似内容混淆的问题。
所以这里我们需要继续去进行优化。

### 调整大模型节点生成随机性

大模型的生成随机性指的就是**发散思维**的程度，这个数值越低，大模型生成的语言越精准，仅会依据提供的问题和数据去进行回答，不会有过多的`"人话"`，会有更多的介绍性、描述性的语言。而这个数值越高，大模型的发散性思维越强，越适合创作性的任务，越适合去生成一些具有创造性的内容。

所以我将关键词提取大模型的生成随机性调整为了0.2。因为还需要去理解用户可能比较口语化的内容所以生成随机性也不能拉的太低。

![调整大模型节点生成随机性](“HongXiaoYi”/74.png)

然后将最终回复生成大模型的生成随机性调整为了0.6。相比于关键词提取大模型，最终回复大模型会直接与用户交流，需要有一些衔接词以及有`"人情味"`的语句，但与此同时又不能太过发散导致虚构一些不存在的内容，所以我们需要调整至中值左右。

![调整大模型节点生成随机性](“HongXiaoYi”/75.png)

### 优化提示词

当前的提示词字数还是不够用灵活，而且用户所输入的问题也是多样化的，很有可能会涉及到上下文，也有可能有一些没有包含技术点的问题，所以我们需要对提示词进行优化，告诉大模型在面对不同情况的问题时该如何去回答。

![优化提示词](“HongXiaoYi”/88.png)

首先添加了一段最重要的要求，用来强调最常见的几种情形，也是此前它表现不太好的几种情况。

![优化提示词](“HongXiaoYi”/89.png)

随后在工作流程中更加明细了遇到各种类型问题时的处理模式。

随后又调整了对话历史轮数，提升到了5轮，虽然token消耗会多一些，但对话的上下文关联效果也会更好。

## 接入华为账号登录系统

为了能够实现应用接续以及后续用户对话记录留存等功能，我们需要接入华为账号登录系统。

### 华为账户登录概述

Account Kit（华为账号服务）提供简单、快速、安全的登录功能，让用户快捷地使用华为账号登录应用。用户授权后，Account Kit可提供头像、昵称、手机号码等信息，帮助应用更了解用户。

[Account Kit文档传送门](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/account-introduction)

同时华为官方也是给出了事例工程来提供相关开发的参考。

[华为账号登录示例代码](https://gitee.com/harmonyos_samples/accountkit-samplecode-clientdemo-arkts)

### 官方demo运行测试与代码分析

这一部分我会单独拆出一篇文章来进行记录。

[传送门](https://xbxyftx.top/2025/05/14/accountkittest/)

## 特别鸣谢

{% flink %}
- class_name: 特别鸣谢
  class_desc: 感谢对鸿小易开发提供鼎力支持的各位
  link_list:
    - name: 李昌骏
      link: https://whlcj.github.io/
      avatar: /JunAv.png
      descr: iOS大佬
    - name: 孙博辰
      link: https://xbxyftx.top/2025/03/31/%E2%80%9Chongxiaoyi%E2%80%9D/#%E7%89%B9%E5%88%AB%E9%B8%A3%E8%B0%A2
      avatar: /sbcAv.jpg
      descr: 亲妈级好学长
{% endflink %}
