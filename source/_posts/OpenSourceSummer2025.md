---
title: 开源之夏NowInOpenHarmony
date: 2025-06-29 14:01:21
tags:
  - 开源之夏
  - 鸿蒙
  - 项目
  - 技术向
cover:  /img/ArticleTopImgs/OpenSourceSummerTopImg.png
top: 20
description: 开源之夏2025项目开发笔记
typewriter: 🦋 这篇文章将会记录我的开源之夏2025项目开发笔记，记录我参与NowInOpenHarmony项目的完整历程。在这三个月的时间里，我将深入探索鸿蒙生态系统的奥秘，从初学者到贡献者的蜕变过程。我会详细记录每一次代码提交背后的思考，每一个技术难题的攻克过程，以及与导师协作的珍贵经历。从环境搭建到功能实现，从bug调试到性能优化，从技术分享到项目总结，这里将会是我技术成长轨迹的完整呈现。我相信这段开源贡献的经历不仅会提升我的编程技能和项目管理能力，更会让我深刻理解开源精神的价值所在。这将会成为我大学期间最具意义的技术实践，也是我走向更广阔技术世界的重要里程碑。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

我初次了解到开源之夏活动是在大一上半学期期间的第二届OpenHarmony技术峰会上，我听到了这个名字，当时的我对于OpenHarmony和OpenAtom都知之甚少，也没有能力去参与开源之夏的项目，所以也没有深入的了解。而真正的对开源之夏有所了解是发生在了大一下半学期的春耕校源行，在校源行的主会场，开放原子的工作人员也是介绍了一下开源之夏活动，我也是加入了活动群，但是并没有真正的报名参加，因为我依旧认为我没有能力承担独立的开发。而随着大二下的到来，我一直在由于大二升大三的这个暑假我是去实习还是在家里做项目，虽然手上有鸿小易这个待完善的项目，但我个人其实对如何继续完善它并没有很好的规划，我也担心我会不会因为这个项目的目标不明确而荒废一个假期。这个时候又是子安学长拯救了我，他推荐我去参与开源之夏，与此同时曾老师和开源协会团队也将开源之夏当做工作重点，我也因此决心要尝试去进行开源之夏的项目计划书的投递。

我登录到了开源之夏的活动官网，进行实名认证，提交了之后我就等着说审核完了再开始整项目计划书吧，结果第一次实名审核还没通过，有错。我只好修改再审，再审提交后没几天我们就全部结课了。我只好开始了期末复习，对于当时的我来说有一科“天书”我真是心里打鼓能不能过所以就全身心的投入到期末复习中，想着说等期末考完再投递。结果期末前三天我又突然担心起来会不会截止时间等不到我期末考完，于是又一次前往官网查看，结果发现还真等不到，我只好先放下手头的复习，因为那时各科复习都在稳步推进，“天书”也有了眉目，所以就花了5个小时左右，终于是把简历和项目计划书给整完了，期间还和导师通了几封邮件。有一说一这么晚才和导师联系而且我的项目计划书又是短时间干出来的，真怕过不了。

在期末考完之后我再次登录官网看会不会有什么进展，结果却看到了公告说时间延长了，到现在还没截止，哇我直接炸缸了。不过倒也还好，算是帮我省了点事，可以小小的放松一下了，期末周真的要死人了孩子。

随后又有几个兼职和老师的的项目机会横插在了我提交项目计划书到中选出结果的这段时间里。我内心也还是担心我无法中选，所以也先都拖着说等开源之夏的结果。就这样我怀着这种忐忑不安、但又充满希望的心境一路等待到了28号。

![1751195653463.png](https://bu.dusays.com/2025/06/29/686120088cd6b.png)

邮箱的提示音将我悬着的心放了下来，紧接着，协议的签署、群聊的组建、其他项目安排的善后就接二连三的排了上来，像是梦一样的确认了我的中选，以及接下来三个月我生活的基调。

![1751196415807.png](https://bu.dusays.com/2025/06/29/686123033e689.png)

我也是特意的问了一下老师能否写成博客文章的形式来进行记录，也是获得了老师的同意，要不没准这篇文章就胎死腹中了。

## 项目简介

### 项目名称

NowInOpenHarmony

### 项目背景

{% note default flat %}
目前OpenHarmony开源项目已成规模，生态日益繁荣，但与OpenHarmony相关的资讯平台多为网站且比较零散，另外OpenHarmony应用比较缺乏，应用生态是未来发展重点。结合上述两个现状，本选题目标为开发一款运行在OpenHarmony系统上的聚合OpenHarmony相关资讯的应用。
{% endnote %}

上面这段话是在开源之夏官网上的项目简介，我也算是深有感触，可能作为开发者有加入很多的开发者社群，还能算是能获取到比较丰富的OpenHarmony相关的资讯，但是作为普通用户，想要获取到OpenHarmony相关的资讯，却并不容易，而且OpenHarmony的应用生态也是比较缺乏的，所以这个项目也是很有意义的。

### 项目目标

{% note default flat %}

1. 使用ArkTS开发运行于OpenHarmony的资讯应用（内容包括OpenHarmony社区新闻、开发者论坛热门话题、版本发布信息等）；
2. 资讯内容来源建议： 1）使用Web开发框架开发服务器聚合OpenHarmony资讯网站，为应用提供接口，2）应用直接通过OpenHarmony社区网站获取资讯并展示。

{% endnote %}

所以现在的目标就很明确了要用py开发一个后端服务器来提供资讯内容，然后客户端通过网络请求来去获取到资讯内容，然后展示在界面上。

## 项目时间规划

{% timeline 2025,green %}

<!-- timeline 07-07 -->
7.7至7.13完成可行性验证以及方案设计
<!-- endtimeline -->

<!-- timeline 07-14 -->
7.14至7.27完成完成后端开发
<!-- endtimeline -->

<!-- timeline 07-28 -->
7.28至8.24完成鸿蒙端开发
<!-- endtimeline -->

<!-- timeline 08-24 -->
8.24至结项完成最终调优与报告撰写
<!-- endtimeline -->

{% endtimeline %}

## 核心问题

通过对项目目标的分析我们可以分析出有三个核心问题，依次打通这三个核心问题我们就可以完成这个项目了。

### 信息的获取

首先的问题就在于信息的获取。在官网上导师所提供的建议仅仅指出了信息的来源，但并没有说明我们该用什么手段获取到数据。我第一个想到的是爬虫，但不确定导师会不会去指定是用什么方式去进行数据的获取，所以我此前先给导师发了邮件进行询问，确认了可以使用爬虫的形式。

在确认了我中选之后我添加了老师的微信，而后面我和老师的微信沟通时老师又提出了可以参考此前的`TodayOpenHarmony`项目的形式直接使用[web组件](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-components-basic-web)来去展示现成的网页。不过我感觉这样的化可能界面的显示效果并不好，但我也还是先去分析一下`TodayOpenHarmony`的资讯获取形式吧。

#### TodayOpenHarmony项目分析

我们重点来看其资讯获取以及展示的形式，这是重点。整体采用了十分标准的`MVVM`架构，通过`ViewModel`来获取数据，然后通过`Model`来存储数据，最后通过`View`来展示数据。而数据获取的方式则是通过`web组件`来实现的，通过`web组件`来展示现成的网页。其数据来源部分的核心代码如下：


```ts
export const NewsListData: NewsItem[] = [
  new NewsItem({
    id: 1,
    type: '新闻',
    title: '基于OpenHarmony的团结引擎应用开发赛',
    subtitle: '促进万物互联产业的繁荣发展',
    image: $r('app.media.edu'),
    timestamp: '2024-03-11',
    views: 22500,
    link: 'https://www.openharmony.cn/unityEngine/illustrate',
    isLiked: false,
    likeCount: 806,
    isBookmarked: false,
    isExpanded: false,
    readTime: 5,
    commentCount: 0,
    shareCount: 0,
    tags: ['开发大赛', '物联网'],
    categoryId: 0
  }),

  new NewsItem({
    id: 2,
    type: '新闻',
    title: '开源鸿蒙开发者大会2025',
    subtitle: '展示开源鸿蒙操作系统的技术革新',
    image: $r('app.media.New'),
    timestamp: '2025-05-24',
    views: 23500,
    link: 'https://www.openharmony.cn/developer2025',
    isLiked: false,
    likeCount: 7000,
    isBookmarked: false,
    isExpanded: false,
    readTime: 10,
    commentCount: 0,  // 补充缺失字段
    shareCount: 0,    // 补充缺失字段
    tags:['HarmonyOS'],         // 补充默认值
    categoryId: 0,
  }),

  new NewsItem({
    id: 3,
    type: '活动',
    title: '解决方案学生挑战赛',
    subtitle: '线上',
    image: $r('app.media.student2'),
    timestamp: '2022-06-08',
    views: 2560,
    link: 'https://www.openharmony.cn/growthPlan/',
    isLiked: false,
    likeCount: 2560,
    isBookmarked: false,
    isExpanded: false,
    readTime: 15,
    tags: ['大赛', 'openharmony'],
    commentCount: 0,  // 补充缺失字段
    shareCount: 0,    // 补充缺失字段
    categoryId: 1,
  }),
  new NewsItem({
    id: 4,
    type: '活动',
    title: 'OpenHarmony技术大会',
    subtitle: '上海世博中心',
    image: $r('app.media.study'),
    views: 2200,
    likeCount: 4560,
    isLiked: false,
    timestamp: '2024-10-12',
    link: 'https://www.openharmony.cn/technology/',
    isBookmarked: false,
    readTime: 5,
    commentCount: 0,
    shareCount: 0,
    tags: ['大会', 'openharmony'],
    isExpanded: false,
    categoryId: 1,
  }),
  new LiveNewsItem({
    id: 5,
    type: '直播',
    title: '创新赛赋能直播',
    subtitle: '如何开发APP',
    author: '王工程师',
    views: 33500,
    isLiving: true,
    image: $r('app.media.lives'),
    timestamp: '03-16 20:00',
    link: 'https://www.bilibili.com/video/BV18G411i7bR/?spm_id_from=333.999.0.0&vd_source=791e4b558742fd98bce5bd7f4a0d2120',
    tags: ['直播视频', 'openharmony'],
    categoryId: 2,
    isLiked: false,
    isBookmarked: false,
    isExpanded: false,
    likeCount: 0,
    readTime: 0,
    commentCount: 0,
    shareCount: 0
  }),

  new BlogPostItem({
    id: 6,
    type: '博客',
    title: '分布式菜单创建点餐神器',
    subtitle: '节省顾客时间',
    author: '张工程师',
    content: '本文详细讲解如何利用分布式能力...',
    image: $r('app.media.bo'),
    views: 27500,
    likeCount: 3000,
    isLiked: false,
    timestamp: '2022-02-16',
    link: 'https://mp.weixin.qq.com/s/WHN75mnzJ0NtbAwySlEDJw',
    isBookmarked: false,
    readTime: 15,
    commentCount: 12,
    shareCount: 0,
    tags: ['文章', '应用'],
    isExpanded: false,
    categoryId: 3,
  }),

  new NewsItem({
    id: 7,
    type: '新闻',
    title: '第二届创新应用挑战赛',
    subtitle: '技术交锋创意迸发',
    image: $r('app.media.sai'),
    views: 2370,
    likeCount: 479,
    isLiked: false,
    timestamp: '2024-10-21',
    link:'https://www.openharmony.cn/innovationcompete/compete',
    isBookmarked: false,
    readTime: 15,
    commentCount: 0,
    shareCount: 0,
    tags: ['大赛'],
    isExpanded: false,
    categoryId: 0,
  }),
];
```

enm，没错它使用的是静态常量数据，并没有进行任何的数据获取，所以对我们的项目参考价值不大，然后我们再来看一看他是怎么展示的资讯。

```ts
// WebView容器
Web({
  src: this.url,
  controller: this.controller
})
  .width('100%')
  .height('100%')
  .onPageBegin(() => {
    this.isLoading = true;
  })
  .onPageEnd(() => {
    this.isLoading = false;
  })
  .onErrorReceive((err) => {
    console.error('[ERROR] 网页加载失败:', JSON.stringify(err));
    prompt.showToast({ message: '加载失败，请检查网络或网址' });
  })
```

它仅仅是将数据中的网页链接给到了web组件，然后通过web组件来展示网页，我们的项目会收集很多网页的信息，若是仅仅是将网页链接给到web组件而不是通过统一的数据格式来进行展示的话，我们整体的UI一致性以及美观度都会差一大截，所以我们需要将爬取的数据进行统一化的格式处理。

所以总体看下来这个项目对当前的项目参考意义不大。

### 资讯内容传递的格式

上文提到了直接才用展示网页的形式并不可取，所以我们就需要选择一种数据格式来进行前后端数据的传递。

#### 明确需求

首先我们需要明确一下需求，对于当前项目我们首先需要用爬虫爬取各个论坛的资讯内容，这些博文内容都是图文混排，同时可能包含有视频，所以我们的数据格式需要在传递文本之外还需要传递图片以及视频的链接。

我首先想到的就是我的Markdown格式，因为我的博客以及鸿小易还有其他一些项目使用的都是Markdown格式，且Markdown支持原生的图片链接格式，但问题在于Markdown格式中没有原生的视频格式。只能使用内挂HTML标签的形式去进行视频的上传。我并不确定在使用OpenHarmony三方库进行md渲染时会不会出现问题，所以暂时作为备案。

![1751960773950.png](https://bu.dusays.com/2025/07/08/686ccccad10e7.png)

随后就是当下最常用的json格式。json格式我可以采用两种形式，一种是将爬取的HTML文件直接作为一整个字段进行传输然后使用web组件进行渲染确实可以。不过这个方案需要注意整体UI界面的一致性，这一点可能需要针对不同的网站获取到的数据进行定制化的处理。因为各个网站的文章内容部分很有可能会插入一些其他的样式，链接标签等，同时又因为鸿蒙中的Web组件并没有提供很多的属性来通过ArkTS直接调整、改变HTML的结构以及样式，所以我们需要在后端就完成对HTML的格式化处理，这样在鸿蒙中直接展示的时候就不会出现样式错乱的问题。

![1751961129379.png](https://bu.dusays.com/2025/07/08/686cce2e7dcc0.png)

还有一种方式就是用`type`字段以及`value`字段来进行当前数据类型的区分，可以设置一个枚举类型规定三种数据类型，分别是`text`、`image`、`video`，然后根据不同的类型来决定`value`字段的值该被渲染为什么样的组件，通过这样的对象数组形式，利用循环渲染成文本、视频、图片组件。这样既可以传递文章的内容也可以正确的传递文章的结构。先暂时采用这种方式，并进行可行性验证。

### 资讯的渲染形式

## 方案设计与可行性验证

### 咨询信息获取

#### OpenHarmony官网资讯

首先我们要针对不同的网站编写不同的爬虫，所以我们首先要确认目标网站。

首先是OpenHarmony的官网，官网提供有很多的相关资讯，大多是以微信公众号的形式展现的，整体格式比较规整，我们先来进行爬取的尝试。

![1751974181082.png](https://bu.dusays.com/2025/07/08/686d0149b1aa2.png)

我找到了OpenHarmony官网的咨询页面，虽然咨询本身是很容易爬取的，但是要是想要自动爬取整个咨询页面的全部文章，我们就需要先获取到咨询页面的全部文章链接，然后针对每个链接进行爬取，最后将爬取到的数据整合到一起，所以我们需要先获取到咨询页面的全部文章链接。

![1751974351946.png](https://bu.dusays.com/2025/07/08/686d01d4c0807.png)

找到目标点击结构，对其进行分析。但在展开其单个文章卡片的全部结构之后并没有找到`<a>`标签，所以我们不能直接去爬取`<a>`标签中所指向的目标链接，这是典型的SPA（单页应用）架构。

![1751974611565.png](https://bu.dusays.com/2025/07/08/686d02d5afee0.png)

随后我改变了策略，转而模拟用户的点击行为并检测URL的变化以及检测网络请求，从网络请求的API的响应中获取URL。

```py
# openHarmony官网爬虫
import requests
from bs4 import BeautifulSoup
import json
import re
import time
from urllib.parse import urljoin, urlparse
import hashlib

# 尝试导入Selenium，如果失败则使用备用方案
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
    SELENIUM_AVAILABLE = True
    print("Selenium已安装，将使用JavaScript渲染功能")
except ImportError:
    SELENIUM_AVAILABLE = False
    print("Selenium未安装，将使用普通HTTP请求模式")

class OpenHarmonyCrawler:
    def __init__(self):
        self.base_url = "https://www.openharmony.cn"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        # 设置Chrome浏览器选项（仅在Selenium可用时）
        if SELENIUM_AVAILABLE:
            self.chrome_options = Options()
            self.chrome_options.add_argument('--headless')  # 无头模式
            self.chrome_options.add_argument('--no-sandbox')
            self.chrome_options.add_argument('--disable-dev-shm-usage')
            self.chrome_options.add_argument('--disable-gpu')
            self.chrome_options.add_argument('--window-size=1920,1080')
            self.chrome_options.add_argument(f'--user-agent={self.session.headers["User-Agent"]}')
        else:
            self.chrome_options = None

        self.driver = None

    def init_driver(self):
        """初始化浏览器驱动"""
        if not SELENIUM_AVAILABLE:
            print("Selenium不可用，跳过浏览器驱动初始化")
            return False

        try:
            self.driver = webdriver.Chrome(options=self.chrome_options)
            print("浏览器驱动初始化成功")
            return True
        except Exception as e:
            print(f"浏览器驱动初始化失败: {e}")
            print("请确保已安装Chrome浏览器和ChromeDriver")
            return False

    def close_driver(self):
        """关闭浏览器驱动"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            print("浏览器驱动已关闭")

    def get_page_content(self, url):
        """获取页面内容"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except Exception as e:
            print(f"获取页面失败: {url}, 错误: {e}")
            return None

    def get_page_content_with_js(self, url, wait_element_class=None, timeout=10):
        """使用Selenium获取JavaScript渲染后的页面内容"""
        if not SELENIUM_AVAILABLE or not self.driver:
            return None

        try:
            self.driver.get(url)

            # 等待特定元素加载完成
            if wait_element_class:
                wait = WebDriverWait(self.driver, timeout)
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, wait_element_class)))
            else:
                time.sleep(3)  # 默认等待3秒

            return self.driver.page_source
        except TimeoutException:
            print(f"页面加载超时: {url}")
            return None
        except Exception as e:
            print(f"获取页面失败: {url}, 错误: {e}")
            return None

    def verify_url_exists(self, url):
        """验证URL是否存在"""
        try:
            response = self.session.head(url, timeout=5)
            return response.status_code == 200
        except:
            return False

    def extract_articles_from_data_attributes(self, soup):
        """从data属性中提取文章信息"""
        articles = []
        print("尝试从data属性提取文章信息...")

        # 查找包含data-v属性的content-item
        content_items = soup.find_all('li', class_='content-item')

        for i, item in enumerate(content_items):
            try:
                # 查找文章标题
                title_elem = item.find(class_='item-title')
                title = title_elem.get_text().strip() if title_elem else f"文章{i+1}"

                # 查找日期
                date_elem = item.find(class_='item-time')
                date = date_elem.get_text().strip() if date_elem else ""

                # 查找描述
                desc_elem = item.find(class_='item-info')
                description = desc_elem.get_text().strip() if desc_elem else ""

                print(f"找到文章: {title} - {date}")

                # 尝试从元素属性中提取ID
                article_id = None

                # 检查data属性
                for attr_name, attr_value in item.attrs.items():
                    if 'id' in attr_name.lower() or 'key' in attr_name.lower():
                        article_id = str(attr_value)
                        break

                # 如果没找到ID，尝试从文本内容中提取
                if not article_id:
                    # 使用标题和日期生成一个唯一标识
                    content_hash = hashlib.md5((title + date).encode()).hexdigest()[:8]
                    article_id = content_hash

                # 构造可能的文章URL（基于常见的URL模式）
                possible_urls = [
                    f"{self.base_url}/newsDetail?id={article_id}",
                    f"{self.base_url}/newsDetail/{article_id}",
                    f"{self.base_url}/news/detail/{article_id}",
                    f"{self.base_url}/article/{article_id}",
                    f"{self.base_url}/newList?id=3&articleId={article_id}",
                ]

                articles.append({
                    'title': title,
                    'date': date,
                    'description': description,
                    'possible_urls': possible_urls
                })

            except Exception as e:
                print(f"处理第{i+1}个文章项失败: {e}")

        return articles

    def extract_article_links(self, news_list_url):
        """从资讯列表页面提取文章链接"""
        # 首先尝试使用Selenium获取动态内容
        content = self.get_page_content_with_js(news_list_url, timeout=15)
        if not content:
            print("Selenium获取失败，尝试使用requests")
            content = self.get_page_content(news_list_url)
            if not content:
                return []

        soup = BeautifulSoup(content, 'html.parser')
        article_links = []

        # 保存页面内容到文件以便调试
        with open('debug_page_js.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("JavaScript渲染后的页面内容已保存到 debug_page_js.html")

        print("正在查找文章链接...")

        # 新增：尝试从data属性提取文章信息
        articles_data = self.extract_articles_from_data_attributes(soup)
        if articles_data:
            print(f"从页面结构中提取到 {len(articles_data)} 个文章信息")
            # 先尝试验证这些URL是否有效
            for article in articles_data:
                for url in article['possible_urls']:
                    if self.verify_url_exists(url):
                        article_links.append(url)
                        print(f"验证有效URL: {url}")
                        break

        # 如果还是没找到，使用Selenium处理JavaScript点击事件
        if not article_links and self.driver:
            print("使用Selenium处理JavaScript导航...")
            try:
                # 等待页面完全加载
                time.sleep(5)

                # 查找content-item元素
                content_items = self.driver.find_elements(By.CLASS_NAME, "content-item")
                print(f"找到 {len(content_items)} 个content-item元素")

                for i, item in enumerate(content_items[:5]):  # 限制处理前5个
                    try:
                        print(f"处理第 {i+1} 个content-item...")

                        # 获取当前URL作为基准
                        original_url = self.driver.current_url

                        # 滚动到元素可见
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", item)
                        time.sleep(1)

                        # 点击元素
                        item.click()
                        time.sleep(3)  # 等待页面跳转

                        # 检查是否跳转到新页面
                        new_url = self.driver.current_url
                        if new_url != original_url:
                            print(f"  + 成功跳转到: {new_url}")
                            article_links.append(new_url)

                            # 返回列表页
                            self.driver.back()
                            time.sleep(3)
                        else:
                            print(f"  - 点击无效，URL未改变")

                    except Exception as e:
                        print(f"  - 处理第 {i+1} 个元素失败: {e}")
                        # 如果出错，尝试返回列表页
                        try:
                            self.driver.get(news_list_url)
                            time.sleep(3)
                        except:
                            pass

                if article_links:
                    print(f"通过点击事件找到 {len(article_links)} 个链接")

            except Exception as e:
                print(f"Selenium点击处理失败: {e}")

        # 如果仍然没找到，尝试查找所有链接
        if not article_links:
            print("最后尝试：查找所有链接...")
            all_links = soup.find_all('a', href=True)
            print(f"页面共有 {len(all_links)} 个链接")

            for link in all_links:
                href = link.get('href')
                link_text = link.get_text().strip()

                # 检查链接文本是否像新闻标题
                if href and link_text and len(link_text) > 5:
                    # 检查是否为相对链接或包含新闻相关关键词
                    if (href.startswith('/') or
                            any(keyword in href.lower() for keyword in ['news', 'article', 'detail']) or
                            any(keyword in link_text for keyword in ['新闻', '资讯', '动态', '公告', '发布'])):

                        full_url = urljoin(self.base_url, href)
                        article_links.append(full_url)
                        print(f"  + 找到疑似新闻链接: {full_url} - {link_text[:50]}")

        # 去重并过滤
        if article_links:
            unique_links = []
            seen = set()
            for link in article_links:
                if link not in seen and not any(exclude in link for exclude in ['javascript:', 'mailto:', '#']):
                    unique_links.append(link)
                    seen.add(link)

            print(f"去重后共有 {len(unique_links)} 个文章链接")
            return unique_links[:10]  # 最多返回10个链接

        print("未找到任何文章链接")
        return []

    def parse_article_content(self, article_url):
        """解析单个文章页面的内容"""
        content = self.get_page_content(article_url)
        if not content:
            return []

        soup = BeautifulSoup(content, 'html.parser')
        result_data = []

        # 根据页面结构寻找文章主体内容容器
        article_container = (
                soup.find(id='js_content') or  # 主要的文章内容容器
                soup.find(class_='rich_media_content') or  # 富媒体内容容器
                soup.find(id='page-content') or  # 页面内容容器
                soup.find(class_='rich_media_area_primary') or  # 主要媒体区域
                soup.find(class_=re.compile(r'article|content|detail', re.I)) or
                soup.find('article') or
                soup.find(id=re.compile(r'article|content|detail', re.I))
        )

        if not article_container:
            # 如果没找到专门的容器，尝试查找包含文章内容的其他容器
            article_container = soup.find('body')

        if article_container:
            # 遍历容器中的所有元素
            for element in article_container.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'img', 'video']):

                # 处理文本内容
                if element.name in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']:
                    text = element.get_text().strip()
                    if text and len(text) > 10:  # 过滤掉太短的文本
                        result_data.append({
                            "type": "text",
                            "value": text
                        })

                # 处理图片
                elif element.name == 'img':
                    img_src = element.get('src')
                    if img_src:
                        # 构造完整的图片URL
                        img_url = urljoin(self.base_url, img_src)
                        result_data.append({
                            "type": "image",
                            "value": img_url
                        })

                # 处理视频
                elif element.name == 'video':
                    video_src = element.get('src')
                    if video_src:
                        video_url = urljoin(self.base_url, video_src)
                        result_data.append({
                            "type": "video",
                            "value": video_url
                        })
                    # 检查video标签内的source元素
                    source_elements = element.find_all('source')
                    for source in source_elements:
                        video_src = source.get('src')
                        if video_src:
                            video_url = urljoin(self.base_url, video_src)
                            result_data.append({
                                "type": "video",
                                "value": video_url
                            })

        return result_data

    def crawl_openharmony_news(self):
        """爬取OpenHarmony资讯内容"""
        news_list_url = "https://www.openharmony.cn/newList?id=3"
        print(f"开始爬取资讯列表页面: {news_list_url}")

        # 初始化浏览器驱动
        if not self.init_driver():
            print("无法初始化浏览器驱动，将使用普通requests方式")

        try:
            # 获取文章链接
            article_links = self.extract_article_links(news_list_url)

            if not article_links:
                print("未找到任何文章链接")
                return []

            print(f"共找到 {len(article_links)} 篇文章")

            all_articles_data = []

            # 爬取每篇文章的内容
            for i, article_url in enumerate(article_links[:3]):  # 限制爬取前3篇文章，避免过度请求
                print(f"\n正在爬取第 {i+1} 篇文章: {article_url}")

                article_data = self.parse_article_content(article_url)

                if article_data:
                    article_info = {
                        "url": article_url,
                        "content": article_data
                    }
                    all_articles_data.append(article_info)
                    print(f"成功解析文章，共 {len(article_data)} 个内容块")
                else:
                    print("文章内容解析失败")

                # 添加延迟避免请求过快
                time.sleep(1)

            # 输出JSON结果
            print("\n" + "="*50)
            print("爬取结果JSON:")
            print("="*50)

            json_output = json.dumps(all_articles_data, ensure_ascii=False, indent=2)
            print(json_output)

            return all_articles_data

        finally:
            # 确保关闭浏览器驱动
            self.close_driver()

def main():
    """主函数"""
    print("OpenHarmony官网新闻爬虫启动...")
    print("注意：此脚本需要安装以下依赖:")
    print("  pip install requests beautifulsoup4 selenium")
    print("  同时需要安装Chrome浏览器和ChromeDriver")
    print("如果没有安装，将自动回退到普通HTTP请求模式")
    print("-" * 50)

    crawler = OpenHarmonyCrawler()
    try:
        results = crawler.crawl_openharmony_news()
        if results:
            print(f"\n爬取完成，共处理 {len(results)} 篇文章")
        else:
            print("\n爬取完成，但未找到任何文章")
    except Exception as e:
        print(f"爬取过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 确保清理资源
        if hasattr(crawler, 'driver') and crawler.driver:
            crawler.close_driver()

if __name__ == "__main__":
    main()
```

```python
D:\Anaconda\python.exe D:\HarmonyAppS\NowInOpenHarmony\ostest_integration_test\scenario\NowInOpenHarmony\Server\OpenHarmonypy.py 
Selenium已安装，将使用JavaScript渲染功能
OpenHarmony官网新闻爬虫启动...
注意：此脚本需要安装以下依赖:
  pip install requests beautifulsoup4 selenium
  同时需要安装Chrome浏览器和ChromeDriver
如果没有安装，将自动回退到普通HTTP请求模式
--------------------------------------------------
开始爬取资讯列表页面: https://www.openharmony.cn/newList?id=3
浏览器驱动初始化成功
JavaScript渲染后的页面内容已保存到 debug_page_js.html
正在查找文章链接...
尝试从data属性提取文章信息...
找到文章: 对话OpenHarmony开源先锋：如何用代码革新终端生态 - 2025.02.28
找到文章: 12强终极PK！第二届OpenHarmony创新应用挑战赛引爆开源热潮 - 2025.02.24
找到文章: 第二届OpenHarmony创新应用挑战赛决赛路演队伍揭晓 - 2025.02.20
找到文章: OpenHarmony社区2024年度运营报告发布，致谢每一位生态共建者！ - 2025.02.11
找到文章: 开源鸿蒙社区恭祝全体开发者2025新年快乐，新春大吉！ - 2025.01.29
找到文章: 共绘2025年开源新蓝图，OpenHarmony社区项目管理委员会年度工作会议在深圳成功举办 - 2025.01.27
找到文章: 对话OpenHarmony开源先锋：如何用代码革新终端生态 - 2025.02.28
找到文章: 12强终极PK！第二届OpenHarmony创新应用挑战赛引爆开源热潮 - 2025.02.24
找到文章: 第二届OpenHarmony创新应用挑战赛决赛路演队伍揭晓 - 2025.02.20
找到文章: OpenHarmony社区2024年度运营报告发布，致谢每一位生态共建者！ - 2025.02.11
找到文章: 开源鸿蒙社区恭祝全体开发者2025新年快乐，新春大吉！ - 2025.01.29
找到文章: 共绘2025年开源新蓝图，OpenHarmony社区项目管理委员会年度工作会议在深圳成功举办 - 2025.01.27
从页面结构中提取到 12 个文章信息
验证有效URL: https://www.openharmony.cn/newsDetail?id=6ffe8bf2
验证有效URL: https://www.openharmony.cn/newsDetail?id=4846eac5
验证有效URL: https://www.openharmony.cn/newsDetail?id=6cba5071
验证有效URL: https://www.openharmony.cn/newsDetail?id=6f5b68a4
验证有效URL: https://www.openharmony.cn/newsDetail?id=059ed888
验证有效URL: https://www.openharmony.cn/newsDetail?id=4683d67c
验证有效URL: https://www.openharmony.cn/newsDetail?id=6ffe8bf2
验证有效URL: https://www.openharmony.cn/newsDetail?id=4846eac5
验证有效URL: https://www.openharmony.cn/newsDetail?id=6cba5071
验证有效URL: https://www.openharmony.cn/newsDetail?id=6f5b68a4
验证有效URL: https://www.openharmony.cn/newsDetail?id=059ed888
验证有效URL: https://www.openharmony.cn/newsDetail?id=4683d67c
去重后共有 6 个文章链接
共找到 6 篇文章

正在爬取第 1 篇文章: https://www.openharmony.cn/newsDetail?id=6ffe8bf2
文章内容解析失败

正在爬取第 2 篇文章: https://www.openharmony.cn/newsDetail?id=4846eac5
文章内容解析失败

正在爬取第 3 篇文章: https://www.openharmony.cn/newsDetail?id=6cba5071
文章内容解析失败

==================================================
爬取结果JSON:
==================================================
[]
浏览器驱动已关闭

爬取完成，但未找到任何文章

进程已结束，退出代码为 0
```

这一版的效果并不好，爬到了一些URL，但在访问之后都是404页面，所以需要进一步改进。

这主要是因为URL中的ID并非真实ID为了解决这个问题我再次对浏览器的网络请求进行抓包分析。

![1751976824948.png](https://bu.dusays.com/2025/07/08/686d0b7d8248c.png)

```js
{
    "code": 0,
    "msg": "成功",
    "pageSize": 6,
    "pageNum": 1,
    "totalPage": 68,
    "totalNum": 407,
    "data": [
        {
            "id": 1533,
            "type": 3,
            "title": "对话OpenHarmony开源先锋：如何用代码革新终端生态",
            "source": null,
            "content": "2025年2月23日，由开放原子开源基金会主办的第二届OpenHarmony创新应用挑战赛决赛路演在北京圆满结束，作为第二届开放原子大赛的重要赛项之一，本届赛事汇聚全球418支团队，产出超过110个创新作品，集中展示了OpenHarmony在应用与游戏开发领域的前沿成果。",
            "textDetails": null,
            "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
            "url": "https://mp.weixin.qq.com/s/cHsMzPTmoYec-_VL6VllBQ",
            "advertiseImage": null,
            "advertiseUrl": null,
            "startTime": "2025.02.28",
            "endTime": null,
            "label": 0,
            "recommend": 0,
            "likesCount": 0,
            "shareCount": 0,
            "browseCount": 692,
            "skip": "0"
        },
        {
            "id": 1532,
            "type": 3,
            "title": "12强终极PK！第二届OpenHarmony创新应用挑战赛引爆开源热潮",
            "source": null,
            "content": "在智能化与万物互联的浪潮中，科技的每一次突破都可能颠覆未来格局。2024年10月21日，由开放原子开源基金会主办，OpenHarmony项目群工作委员会、厦门雅基软件有限公司联合承办的第二届OpenHarmony创新应用挑战赛正式启动。",
            "textDetails": null,
            "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
            "url": "https://mp.weixin.qq.com/s/2EeeruCTcZEq1qbydrgsKw",
            "advertiseImage": null,
            "advertiseUrl": null,
            "startTime": "2025.02.24",
            "endTime": null,
            "label": 0,
            "recommend": 0,
            "likesCount": 0,
            "shareCount": 0,
            "browseCount": 366,
            "skip": "0"
        },
        {
            "id": 1531,
            "type": 3,
            "title": "第二届OpenHarmony创新应用挑战赛决赛路演队伍揭晓",
            "source": null,
            "content": "第二届OpenHarmony创新应用挑战赛决赛路演队伍揭晓",
            "textDetails": null,
            "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
            "url": "https://mp.weixin.qq.com/s/scsUs8XKUMWp_kelThSetA",
            "advertiseImage": null,
            "advertiseUrl": null,
            "startTime": "2025.02.20",
            "endTime": null,
            "label": 0,
            "recommend": 0,
            "likesCount": 0,
            "shareCount": 0,
            "browseCount": 166,
            "skip": "0"
        },
        {
            "id": 1530,
            "type": 3,
            "title": "OpenHarmony社区2024年度运营报告发布，致谢每一位生态共建者！",
            "source": null,
            "content": "OpenHarmony社区2024年度运营报告发布！",
            "textDetails": null,
            "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
            "url": "https://mp.weixin.qq.com/s/njNirZfZFhwztz9zNnuc-A",
            "advertiseImage": null,
            "advertiseUrl": null,
            "startTime": "2025.02.11",
            "endTime": null,
            "label": 0,
            "recommend": 0,
            "likesCount": 0,
            "shareCount": 0,
            "browseCount": 121,
            "skip": "0"
        },
        {
            "id": 1528,
            "type": 3,
            "title": "开源鸿蒙社区恭祝全体开发者2025新年快乐，新春大吉！",
            "source": null,
            "content": "恭祝全体开发者2025新年快乐，新春大吉！",
            "textDetails": null,
            "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
            "url": "https://mp.weixin.qq.com/s/fVn6brUk2EnPbUcc3pLeCA",
            "advertiseImage": null,
            "advertiseUrl": null,
            "startTime": "2025.01.29",
            "endTime": null,
            "label": 0,
            "recommend": 0,
            "likesCount": 0,
            "shareCount": 0,
            "browseCount": 62,
            "skip": "0"
        },
        {
            "id": 1527,
            "type": 3,
            "title": "共绘2025年开源新蓝图，OpenHarmony社区项目管理委员会年度工作会议在深圳成功举办",
            "source": null,
            "content": "2025年1月12日上午，OpenHarmony社区项目管理委员会（PMC）（以下简称“PMC”）年度工作会议在深圳召开。本次会议全面总结了2024年PMC的工作及成果，以及明确了2025年PMC工作方向和重点工作，为OpenHarmony社区在2025年持续快速发展及繁荣打下厚实基础。",
            "textDetails": null,
            "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
            "url": "https://mp.weixin.qq.com/s/0q1ThRgDGocGMWp1ufHHrA",
            "advertiseImage": null,
            "advertiseUrl": null,
            "startTime": "2025.01.27",
            "endTime": null,
            "label": 0,
            "recommend": 0,
            "likesCount": 0,
            "shareCount": 0,
            "browseCount": 103,
            "skip": "0"
        }
    ]
}
```

获取这个对象数组之后我们就可以转变思路，先去访问`https://www.openharmony.cn/newList?id=3`这个网址去点击任意一个content-item后，通过网络监测获取最新响应数据，然后解析json获取目标URL，最后再访问这个URL获取最新内容。

```python
import requests
from bs4 import BeautifulSoup
import json
import re
import time
from urllib.parse import urljoin

class OpenHarmonyCrawler:
    def __init__(self):
        self.base_url = "https://www.openharmony.cn"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def get_page_content(self, url):
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except Exception as e:
            print(f"获取页面失败: {url}, 错误: {e}")
            return None

    def parse_article_content(self, article_url):
        content = self.get_page_content(article_url)
        if not content:
            return []
        soup = BeautifulSoup(content, 'html.parser')
        result_data = []
        article_container = (
            soup.find(id='js_content') or
            soup.find(class_='rich_media_content') or
            soup.find(id='page-content') or
            soup.find(class_='rich_media_area_primary') or
            soup.find(class_=re.compile(r'article|content|detail', re.I)) or
            soup.find('article') or
            soup.find(id=re.compile(r'article|content|detail', re.I))
        )
        if not article_container:
            article_container = soup.find('body')
        if article_container:
            for element in article_container.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'img', 'video']):
                if element.name in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']:
                    text = element.get_text().strip()
                    if text and len(text) > 10:
                        result_data.append({"type": "text", "value": text})
                elif element.name == 'img':
                    img_src = element.get('src')
                    if img_src:
                        img_url = urljoin(self.base_url, img_src)
                        result_data.append({"type": "image", "value": img_url})
                elif element.name == 'video':
                    video_src = element.get('src')
                    if video_src:
                        video_url = urljoin(self.base_url, video_src)
                        result_data.append({"type": "video", "value": video_url})
                    for source in element.find_all('source'):
                        video_src = source.get('src')
                        if video_src:
                            video_url = urljoin(self.base_url, video_src)
                            result_data.append({"type": "video", "value": video_url})
        return result_data

    def crawl_openharmony_news(self):
        api_url = f"{self.base_url}/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum=1&pageSize=6"
        print(f"请求API: {api_url}")
        try:
            resp = self.session.get(api_url, timeout=10)
            resp.raise_for_status()
            data = resp.json().get("data", [])
        except Exception as e:
            print(f"API请求失败: {e}")
            return []
        all_articles_data = []
        for i, item in enumerate(data):
            title = item.get("title", "")
            date = item.get("startTime", "")
            article_url = item.get("url")
            if not article_url:
                print(f"第{i+1}条新闻没有url字段，跳过")
                continue
            print(f"\n正在爬取第 {i+1} 篇文章: {title} | {article_url}")
            article_data = self.parse_article_content(article_url)
            if article_data:
                article_info = {
                    "title": title,
                    "date": date,
                    "url": article_url,
                    "content": article_data
                }
                all_articles_data.append(article_info)
                print(f"成功解析文章，共 {len(article_data)} 个内容块")
            else:
                print("文章内容解析失败")
            time.sleep(1)
        print("\n" + "="*50)
        print("爬取结果JSON:")
        print("="*50)
        json_output = json.dumps(all_articles_data, ensure_ascii=False, indent=2)
        print(json_output)
        return all_articles_data

def main():
    print("OpenHarmony官网新闻爬虫启动...")
    print("注意：此脚本需要安装以下依赖:")
    print("  pip install requests beautifulsoup4")
    print("-" * 50)
    crawler = OpenHarmonyCrawler()
    try:
        results = crawler.crawl_openharmony_news()
        if results:
            print(f"\n爬取完成，共处理 {len(results)} 篇文章")
        else:
            print("\n爬取完成，但未找到任何文章")
    except Exception as e:
        print(f"爬取过程中出现错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
```

```json
OpenHarmony官网新闻爬虫启动...
注意：此脚本需要安装以下依赖:
  pip install requests beautifulsoup4
--------------------------------------------------
请求API: https://www.openharmony.cn/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum=1&pageSize=6

正在爬取第 1 篇文章: 对话OpenHarmony开源先锋：如何用代码革新终端生态 | https://mp.weixin.qq.com/s/cHsMzPTmoYec-_VL6VllBQ
成功解析文章，共 21 个内容块

正在爬取第 2 篇文章: 12强终极PK！第二届OpenHarmony创新应用挑战赛引爆开源热潮 | https://mp.weixin.qq.com/s/2EeeruCTcZEq1qbydrgsKw
文章内容解析失败

正在爬取第 3 篇文章: 第二届OpenHarmony创新应用挑战赛决赛路演队伍揭晓 | https://mp.weixin.qq.com/s/scsUs8XKUMWp_kelThSetA
文章内容解析失败

正在爬取第 4 篇文章: OpenHarmony社区2024年度运营报告发布，致谢每一位生态共建者！ | https://mp.weixin.qq.com/s/njNirZfZFhwztz9zNnuc-A
文章内容解析失败

正在爬取第 5 篇文章: 开源鸿蒙社区恭祝全体开发者2025新年快乐，新春大吉！ | https://mp.weixin.qq.com/s/fVn6brUk2EnPbUcc3pLeCA
文章内容解析失败

正在爬取第 6 篇文章: 共绘2025年开源新蓝图，OpenHarmony社区项目管理委员会年度工作会议在深圳成功举办 | https://mp.weixin.qq.com/s/0q1ThRgDGocGMWp1ufHHrA
成功解析文章，共 27 个内容块

==================================================
爬取结果JSON:
==================================================
[
  {
    "title": "对话OpenHarmony开源先锋：如何用代码革新终端生态",
    "date": "2025.02.28",
    "url": "https://mp.weixin.qq.com/s/cHsMzPTmoYec-_VL6VllBQ",
    "content": [
      {
        "type": "text",
        "value": "2025年2月23日，由开放原子开源基金会主办的第二届OpenHarmony创新应用挑战赛决赛路演在北京圆满结束，作为第二届开放原子大赛的重要赛项之一，本届赛事汇聚全球418支团队，产出超过110个创新作品，集中展示了OpenHarmony在应用与游戏开发领域的前沿成果。这些凝聚智慧与协作的参赛作品，不仅在技术层面实现了多项突破，更在商业化应用层面验证了开源生态的无限潜力。赛事不仅彰显了开发者群体的创新活力，也凸显了OpenHarmony作为技术底座的重要价值，为开源技术生态发展注入革新的力量。"
      },
      {
        "type": "text",
        "value": "当代码与创意在OpenHarmony的数字沃土中生根发芽，我们不禁期待，这些开发者如何用实践诠释开源精神？他们的探索历程又蕴藏着怎样的创新思维？让我们跟随优秀团队，解开技术突破与生态协同的共生密码。"
      },
      {
        "type": "text",
        "value": "OpenHarmony创新应用赛题：让书柜学会“思考”"
      },
      {
        "type": "text",
        "value": "由“新大陆自动识别”团队开发的《智能书导》项目，是基于开源操作系统 OpenHarmony打造的图书馆管理应用，通过融合RFID 技术，实现图书馆管理流程的高效优化。团队开发该方案的初衷是帮助图书馆高效地完成图书借阅、查询等工作，减轻管理员负担，同时希望将技术推广至物流、商超、工厂等更多场景，拓展应用范围。"
      },
      {
        "type": "text",
        "value": "《智能书导》项目通过技术融合创新，深度整合OpenHarmony系统的分布式能力与RFID自动识别技术，利用前者实现图书信息的高效共享，借助后者完成图书的自动识别与数据交互。功能上，该项目集成了快速借还书、精准定位等核心功能，以及今日推荐等辅助功能，全面满足图书馆管理与读者服务需求。应用程序适配OpenHarmony 4.1 Release和5.0.2.50系统，可在多种设备上流畅运行，项目所用硬件也已通过兼容性测评，确保软硬件的无缝集成与高效协同。"
      },
      {
        "type": "text",
        "value": "《智能书导》的开发者徐金生表示：“未来团队将把项目核心代码贡献至OpenHarmony主干代码库，推动各模块与性能的提升。同时，计划进一步优化技术瓶颈，拓展项目对更多设备的适配能力。”"
      },
      {
        "type": "text",
        "value": "OpenHarmony创新应用赛题：用技术魔法规划繁琐旅行"
      },
      {
        "type": "text",
        "value": "由“领先风暴队”开发的《出行妈妈》项目，主要是为了解决旅行者在行程规划繁琐、信息整合困难以及个性化需求难以满足三大方面的痛点，提供省时省力的完美行程定制解决方案。该项目填补了OpenHarmony在旅游规划领域的空白，深度融合OpenHarmony 5.0.0 Release特性与旅游出行需求，提供 “规划+路线+玩法” 的一站式服务，支持出行规划记录与最佳路线推荐，为用户打造智能化旅行体验。"
      },
      {
        "type": "text",
        "value": "通过bindSheet绑定半模态组件，利用emitter实现跨组件通信，支持拖拽排序、原生时间组件及API12服务卡片的实时同步，并结合Flex+Scroll弹性布局适配动态界面，《出行妈妈》以技术魔法将复杂的旅行“任务”化繁为简。未来，团队将持续优化作品，计划引入分布式数据管理、AI驱动的个性化规划定制以及社区交互等功能，进一步提升用户体验。"
      },
      {
        "type": "text",
        "value": "在开发过程中，团队撰写了20余篇技术博客并发布至开源社区，其中多篇登上社区头条。后续，团队计划将项目中的自定义组件，如城市选择、时间选择和日历等，贡献至OpenHarmony主干代码库。作为一支年轻团队，参赛过程不仅显著提升了协作能力，也为团队积累了宝贵的实践经验。"
      },
      {
        "type": "text",
        "value": "Cocos游戏创新应用赛题：从孩童幻想到次世代飞行器"
      },
      {
        "type": "text",
        "value": "“gamemcu”团队打造的《星际穿越》项目，是一款高画质次世代模拟飞行游戏。玩家通过电视屏幕，即可见证掌心玩具蜕变为可操控的星际战舰，在动态的星云间完成飞行模拟。提到游戏背景，开发者陈炫烨说道：“灵感源于我的儿子，因为我经常能看到我儿子拿着玩具进行飞行模拟，于是我就把他的想象变成了一款游戏。”"
      },
      {
        "type": "text",
        "value": "《星际穿越》的核心优势在于其卓越的游戏渲染与镜头模拟技术。团队通过自定义高清渲染管线、重构PBR材质系统、高品质后期处理以及多边形GPU粒子系统等多项技术方案，精准还原环境光照，真实模拟人手抓取物体的触感，最终呈现出令人惊艳的飞船驾驶模拟体验。"
      },
      {
        "type": "text",
        "value": "此前，基于Cocos开发的游戏多以风格化为主，而团队勇于突破，首次尝试了次世代效果。未来，团队将通过教程、技术指引等开源方式，帮助更多开发者了解项目，降低开发门槛。希望这个源于父子温情的太空幻想，能够激发更多开发者对次世代游戏的创作热情。"
      },
      {
        "type": "text",
        "value": "Cocos游戏创新应用赛题：因为热爱，所以存在"
      },
      {
        "type": "text",
        "value": "由“路妖姬”团队开发的《引力线流星》项目，是一款宇宙题材的沙盒生存游戏。玩家将操控流浪地球，在复杂的宇宙引力环境中探索生存，建造飞船单位，并与外星文明展开资源争夺。"
      },
      {
        "type": "text",
        "value": "项目的核心优势在于对引力模拟的前沿探索，填补了OpenHarmony在游戏领域的空白。游戏采用2D物理系统精准模拟星球间的引力相互作用与轨道运动，为玩家打造高度拟真的宇宙物理环境与沉浸式体验。"
      },
      {
        "type": "text",
        "value": "作为携《引力线流星》项目首次参赛的开发者，刘瑞表示，赛事让他深入了解了如何参与社区开源，并与社区成员共同探讨技术，结识了众多志同道合的伙伴，为未来高效合作奠定了基础。同时，他呼吁更多开发者关注OpenHarmony及游戏开发领域，助力开源生态形成更强的“引力效应”。"
      },
      {
        "type": "text",
        "value": "融汇创新力量 共筑开源未来"
      },
      {
        "type": "text",
        "value": "第二届OpenHarmony创新应用挑战赛不仅是一次智慧与创新的较量，更是一场开源精神的深度实践。赛事联动产业、前沿科技与优秀人才，推动了OpenHarmony与Cocos的生态深度融合与发展，为开发者提供了施展才华的舞台，更助力开源技术加速落地。在这场融合创意与探索的盛宴中，优秀团队以实力塑造未来，终将推动创新从竞技场走向产业星辰大海。"
      },
      {
        "type": "text",
        "value": "未来，OpenHarmony社区将持续拓展应用边界，携手全球开发者共创数字时代的新范式，助力开源生态迈向更加繁荣、智能、可持续的新时代。"
      }
    ]
  },
  {
    "title": "共绘2025年开源新蓝图，OpenHarmony社区项目管理委员会年度工作会议在深圳成功举办",
    "date": "2025.01.27",
    "url": "https://mp.weixin.qq.com/s/0q1ThRgDGocGMWp1ufHHrA",
    "content": [
      {
        "type": "text",
        "value": "2025年1月12日上午，OpenHarmony社区项目管理委员会（PMC）（以下简称“PMC”）年度工作会议在深圳召开。本次会议全面总结了2024年PMC的工作及成果，以及明确了2025年PMC工作方向和重点工作，为OpenHarmony社区在2025年持续快速发展及繁荣打下厚实基础。"
      },
      {
        "type": "text",
        "value": "会议伊始，PMC主席任革林为本次会议致辞。他表示，PMC在过去一年里工作成果不断，尤其是社区发布了具有里程碑意义的OpenHarmony 5.0 Release版本，该版本在系统能力完备度和稳定性方面取得显著提升，全面实现对伙伴产品的规模化海量商用的支撑。同时，任革林也指出社区明年工作方向：强化版本规划，积极推动社区走出海外。当前社区版本不仅要完善技术底座对更多品类设备的支撑能力，还要勇于探索国际社区建设路径。此外，PMC主席任革林鼓励PMC成员及各SIG领导成员积极参与国际交流，发展海外开发人员，提升社区的国际影响力。"
      },
      {
        "type": "text",
        "value": "OpenHarmony社区项目管理委员会主席任革林"
      },
      {
        "type": "text",
        "value": "随后，PMC代表董金光对2024年PMC工作进行总结。他表示，过去一年社区共建成果丰硕，底座开发者人数达8100+，开发者结构日趋多元，社区健康度和活跃度持续提升。OpenHarmony社区5.0 Release版本有效赋能成员单位产品商用，同时SIG组在内容产出和活动组织方面仍需发力。2025年PMC工作重点为版本与产品规划、社区共建、技术攻关和出海等关键战略领域。"
      },
      {
        "type": "text",
        "value": "OpenHarmony社区项目管理委员会代表董金光"
      },
      {
        "type": "text",
        "value": "在SIG新建申请环节，卫星通信技术专家胡光明提出了北斗SIG的建设构想。他指出，北斗SIG将围绕北斗导航系统的核心能力，推动北斗导航系统与OpenHarmony的融合，打造高精度定位、短报文通信等特色应用。北斗SIG的工作重点是通过技术标准的制定和开发板的集成，以此填补OpenHarmony在导航定位授时方面的空白，推动应急救援、交通物流、大众服务等垂直行业的应用开发。在未来，北斗SIG将致力于建立开源鸿蒙的北斗开发平台，通过与高校、科研机构合作，培养更多基于OpenHarmony的北斗导航领域的专业人才，为社区拓展行业伙伴提供有力支持。"
      },
      {
        "type": "text",
        "value": "卫星通信技术专家胡光明"
      },
      {
        "type": "text",
        "value": "中移（杭州）信息技术有限公司家庭IoT产品部副总经理施超介绍了家庭网关（Gateway）SIG的规划。他指出，家庭网关SIG将聚焦家庭网关和路由器设备，弥补设备能力方面的不足，推动互联互通标准的建立，并通过开源合作加速行业标准化进程。施超提到，中国移动每年新增1.6亿台智能家庭硬件设备，然而这些设备普遍存在底座、芯片、应用以及服务缺乏统一性的问题。家庭网关SIG将致力于解决这些问题，通过OpenHarmony技术框架，实现家庭网络设备的统一管理。会上，PMC主席任革林补充表示，家庭网关（Gateway）SIG的成立将推动基于OpenHarmony的路由器安全能力进一步提升。在未来，家庭网关（Gateway）SIG将与芯片厂商合作，通过优化设备的内核架构，降低内存和CPU占用，提升设备性能。"
      },
      {
        "type": "text",
        "value": "中国移动（杭州）信息技术有限公司家庭IoT产品部副总经理施超"
      },
      {
        "type": "text",
        "value": "深圳鸿信智联数字科技有限公司CEO张兆生提出了Watch SIG的建设方案。他指出，随着智能手表市场的快速发展，Watch SIG 将致力于构建手表领域的技术标准体系，研发配套开发工具，推动手表应用生态走向繁荣。张兆生提到，手表产业的复杂性要求SIG在芯片、OS和应用之间建立紧密的协同关系。Watch SIG将围绕表盘设计、应用开发工具和北向应用接口标准化展开工作，推动手表设备的快速开发和商用。他表示，Watch SIG计划在2025年达成500万支手表的出货目标，并通过与方案商和品牌商的深度合作，加速手表生态的成熟。"
      },
      {
        "type": "text",
        "value": "深圳鸿信智联数字科技有限公司CEO张兆生"
      },
      {
        "type": "text",
        "value": "华为终端有限公司应用场景化解决方案专家张泰介绍了应用开发场景套件SIG的规划。他指出，应用开发场景套件SIG将围绕应用开发中的关键场景，提供开源库、Sample代码及开发指南，降低开发难度，并计划在2025年推出高性能组件库和多设备适配解决方案。张泰提到，当前开发者在应用开发中面临诸多挑战，如不同设备适配难度高、性能调优复杂等问题。应用开发场景套件SIG将通过提供标准化的开发组件和工具，帮助开发者快速上手并提升开发效率。他还表示，应用开发场景套件SIG将与众多头部生态伙伴合作，推动场景化开发套件的广泛应用。"
      },
      {
        "type": "text",
        "value": "华为终端有限公司应用场景化解决方案专家张泰"
      },
      {
        "type": "text",
        "value": "图形SIG、PMC图形领域代表黄然在工作报告中指出，图形SIG持续在图形架构、性能工具研发等方面投入，Smartperf已经成为OpenHarmony性能调试的关键工具。接下来，图形SIG将聚焦统一渲染、SceneBoard等核心技术深化应用与推广，积极推进与国际标准接轨，全力打造开源图形课程，携手社区伙伴提升图形技术竞争力，赋能带UI设备创新发展。游戏SIG着重强化三方库建设、优化工具与引擎协同、深化与团结引擎合作，为游戏开发者营造优质环境。开源图形驱动SIG全力支持OpenGL API、突破多GPU环境使能技术，助力图形处理能力跃升，满足多样化设备需求。针对统一渲染与分离渲染技术路线选择，经会上充分讨论，社区达成并行推进共识，兼顾不同设备性能，确保技术平稳演进。"
      },
      {
        "type": "text",
        "value": "图形SIG、PMC图形领域代表黄然"
      },
      {
        "type": "text",
        "value": "智能建筑SIG组长，西安建筑科技大学信控学院院党委书记、教授、博士生导师于军琪在工作报告中汇报了智能建筑SIG的工作进展。他指出，将紧密围绕智能建筑行业需求，全力打造施工现场安全监控与能源负荷管理两大价值场景，成功研发系列核心算法模块。后续计划加速应用移植与创新合作，有力推动OpenHarmony在智能建筑领域落地生根，助力建筑行业智能化转型，提升建筑安全与能源效率，践行绿色节能发展理念。"
      },
      {
        "type": "text",
        "value": "智能建筑SIG组长、西安建筑科技大学信控学院院党委书记、教授、博士生导师于军琪"
      },
      {
        "type": "text",
        "value": "开发板SIG组长，江苏润和软件股份有限公司副总裁刘洋在工作报告中对开发板SIG的工作进行了总结。他指出，尽管开发板SIG取得了一定的商用成果，但在开源工作中仍存在不足。为此，开发板SIG制定了2025年工作规划，将明确聚焦于L2标杆平台建设，引入新平台以优化选型；同时，大力加强南向开源工作，提升开源质量和规模；积极拓展海外合作，吸引国际企业参与。此外，开发板SIG还将发起招募行动，诚邀各界携手解决开发板从具备可用性向具备易用性迈进的关键难题，筑牢OpenHarmony硬件基础。"
      },
      {
        "type": "text",
        "value": "开发板SIG组长、江苏润和软件股份有限公司副总裁刘洋"
      },
      {
        "type": "text",
        "value": "QT SIG组长、成都中科合迅科技有限公司技术总监蔡万苍在工作报告中分享了QT SIG的工作进展。他全面总结了2024年适配成果与问题，在多项模块适配取得进展的同时，部分关键版本适配仍在攻坚。2025年规划稳步推进版本升级与持续演进，积极应对QT与OpenHarmony框架融合挑战，如渲染线程优化等问题。加强与应用厂家合作，推动QT框架在社区商用与开源协同发展，提升应用开发框架稳定性与兼容性。"
      },
      {
        "type": "text",
        "value": "QT SIG组长、成都中科合迅科技有限公司技术总监蔡万苍"
      },
      {
        "type": "text",
        "value": "会议期间，与会者积极互动，各抒己见，为社区发展建言献策。开放原子开源基金会技术监督委员会（TOC）主席谭中意、华为终端软件OpenHarmony使能部部长章晓峰、OpenHarmony项目群工作委员会执行总监陶铭、OpenHarmony PMC主席任革林等充分肯定PMC 2024年各项工作成果，并强调SIG运作对社区成功的关键作用，建议进一步加强SIG考核与协同合作，鼓励技术创新与国际交流，全力提升OpenHarmony社区影响力与竞争力，携手共创开源鸿蒙美好未来。"
      },
      {
        "type": "text",
        "value": "开放原子开源基金会技术监督委员会（TOC）主席谭中意"
      },
      {
        "type": "text",
        "value": "华为终端软件OpenHarmony使能部部长章晓峰"
      },
      {
        "type": "text",
        "value": "OpenHarmony项目群工作委员会执行总监陶铭"
      },
      {
        "type": "text",
        "value": "会议还表决通过了黄然、李锋和赵鹏分别担任PMC图形领域、规划领域和版本管理领域委员。同时，会议还通过了Crossplatformui SIG成员调整的建议，同意潘锦玲担任该SIG组长。"
      },
      {
        "type": "text",
        "value": "本次OpenHarmony社区PMC年度工作会议在热烈氛围中圆满落幕，通过全面总结经验、深入剖析问题、精心规划未来，为PMC发展明确方向。PMC将汇聚各方力量，推动OpenHarmony在全球开源生态中稳健前行，持续拓展应用边界，实现技术与生态协同创新发展，开启开源操作系统发展新征程。"
      }
    ]
  }
]
```

这套方案对于爬取的成功率以及内容的解析，成功率都大幅提升，但仍然存在两个问题。

首先一点就是在爬取目标网站的链接时仍然有无效URL导致无法访问的问题，还有就是爬取的URL数量不足，导致爬取的内容不够丰富，这一点是因为当前代码并没有包含模仿用户点击所有的文章卡片导致的获取数量不足。另外一点就是在于其生成的json格式文件中仅有`text`的type类型并没有将图片以及视频的type类型包含进去，这一点在后续的代码中会进行修改。

所以首先要去模仿用户点击全部的ul中的li才能获取全部的，链接，在点击完全部卡片之后再去将链接去重，将去重之后的结果进行逐一访问。

![1752049237718.png](https://bu.dusays.com/2025/07/09/686e265929f85.png)

在获取内容时也要注意要将img的src字段在其懒加载结束之后也读取到json中将type字段的值写成image，同时value字段填写爬取到的src值。

首先对于分页遍历，去重以及有效性验证的代码片段如下：

```python
def get_all_article_urls(self):
    all_urls = set()
    page_num = 1
    page_size = 20  # 可适当加大
    while True:
        api_url = f"{self.base_url}/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum={page_num}&pageSize={page_size}"
        print(f"请求API: {api_url}")
        try:
            resp = self.session.get(api_url, timeout=10)
            resp.raise_for_status()
            data = resp.json().get("data", [])
        except Exception as e:
            print(f"API请求失败: {e}")
            break
        if not data:
            break
        for item in data:
            url = item.get("url")
            if url:
                all_urls.add(url)
        page_num += 1
        time.sleep(0.5)  # 防止请求过快
    print(f"共获取到{len(all_urls)}条原始url，开始去重和有效性校验...")
    valid_urls = []
    for url in all_urls:
        try:
            r = self.session.head(url, timeout=5)
            if r.status_code == 200:
                valid_urls.append(url)
        except:
            continue
    print(f"有效url数量: {len(valid_urls)}")
    return valid_urls
```

所谓的验证有效性就是通过访问url的head请求，如果返回的状态码是200则说明该url是有效的，否则就是无效的。

对于获取内容以及将内容写入json文件的代码片段如下：

```python
def parse_article_content(self, article_url):
    content = self.get_page_content(article_url)
    if not content:
        return []
    soup = BeautifulSoup(content, 'html.parser')
    result_data = []
    article_container = (
        soup.find(id='js_content') or
        soup.find(class_='rich_media_content') or
        soup.find(id='page-content') or
        soup.find(class_='rich_media_area_primary') or
        soup.find(class_=re.compile(r'article|content|detail', re.I)) or
        soup.find('article') or
        soup.find(id=re.compile(r'article|content|detail', re.I))
    )
    if not article_container:
        article_container = soup.find('body')
    if article_container:
        for element in article_container.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'img', 'video']):
            if element.name in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']:
                text = element.get_text().strip()
                if text and len(text) > 10:
                    result_data.append({"type": "text", "value": text})
            elif element.name == 'img':
                img_src = element.get('data-src') or element.get('data-original') or element.get('src')
                if img_src:
                    img_url = urljoin(self.base_url, img_src)
                    result_data.append({"type": "image", "value": img_url})
            elif element.name == 'video':
                video_src = element.get('src')
                if video_src:
                    video_url = urljoin(self.base_url, video_src)
                    result_data.append({"type": "video", "value": video_url})
                for source in element.find_all('source'):
                    video_src = source.get('src')
                    if video_src:
                        video_url = urljoin(self.base_url, video_src)
                        result_data.append({"type": "video", "value": video_url})
    return result_data
```

在上述代码中，我们首先通过`get_page_content`方法获取文章内容，然后使用BeautifulSoup解析HTML。接着，我们查找文章的主要内容容器，如果找不到，则使用整个页面作为容器。然后，我们遍历容器中的所有元素，根据元素的类型（如`p`、`h1`、`h2`、`h3`、`h4`、`h5`、`h6`、`div`、`img`、`video`）提取相应的文本或URL，并将其添加到结果列表中。最后，我们返回结果列表。

在修改了代码并将上述算法函数进行参数微调以及适配合并进主函数的流程中后再次执行代码，进行测试。

![1752050837041.png](https://bu.dusays.com/2025/07/09/686e2c9736003.png)

![1752050683416.png](https://bu.dusays.com/2025/07/09/686e2bfe7bb88.png)

可以看到这次正确的爬取了全部的链接并且成功解析了绝大部分的链接，并且将图片以及视频的链接也成功爬取到了json文件中。

#### 后端项目框架构建

在完成了最基础的爬虫功能可行性测试之后我们就先构架一个完整的web服务框架来进行后续的web服务功能可行性验证。

我们选择采用FastAPI框架来构建我们的web服务框架，FastAPI是一个现代、快速（高性能）的Web框架，用于构建APIs，基于标准Python类型提示。

```text
Server/
├── api/                           # API接口模块
│   ├── __init__.py               # 包初始化文件
│   └── news.py                   # 新闻相关API接口
├── core/                          # 核心功能模块
│   ├── __init__.py               # 包初始化文件
│   ├── config.py                 # 配置管理
│   ├── database.py               # 数据库操作
│   ├── logging_config.py         # 日志配置
│   └── scheduler.py              # 定时任务调度
├── models/                        # 数据模型
│   ├── __init__.py               # 包初始化文件
│   └── news.py                   # 新闻数据模型
├── services/                      # 服务层
│   ├── __init__.py               # 包初始化文件
│   └── openharmony_crawler.py    # OpenHarmony爬虫服务
├── logs/                          # 日志文件目录
│   ├── openharmony_api_20250709.log  # 应用日志
│   └── error_20250709.log        # 错误日志
├── __pycache__/                   # Python缓存文件
├── .gitignore                     # Git忽略文件
├── Dockerfile                     # Docker镜像配置
├── docker-compose.yml             # Docker Compose配置
├── main.py                        # 主应用入口
├── openharmony_news.db            # SQLite数据库文件
├── README.md                      # 项目说明文档
├── requirements.txt               # Python依赖包
└── run.py                         # 应用启动脚本
```

- 核心文件

| 文件 | 主要作用 |
|------|----------|
| `main.py` | **主应用入口**，FastAPI应用配置，中间件设置，路由注册 |
| `run.py` | **启动脚本**，配置服务启动参数，提供便捷启动方式 |
| `requirements.txt` | **依赖管理**，列出所有Python包及其版本 |

- API接口层

| 文件 | 主要作用 |
|------|----------|
| `api/news.py` | **新闻API接口**，提供新闻列表、详情、爬取等接口 |

- 核心功能层

| 文件 | 主要作用 |
|------|----------|
| `core/config.py` | **配置管理**，应用配置、环境变量处理 |
| `core/database.py` | **数据库操作**，SQLite连接、表结构、CRUD操作 |
| `core/logging_config.py` | **日志配置**，日志格式、文件轮转、级别设置 |
| `core/scheduler.py` | **定时任务**，APScheduler配置、爬虫任务调度 |

- 数据模型层

| 文件 | 主要作用 |
|------|----------|
| `models/news.py` | **数据模型**，Pydantic模型定义，API响应格式 |

- 服务层

| 文件 | 主要作用 |
|------|----------|
| `services/openharmony_crawler.py` | **爬虫服务**，OpenHarmony官网数据采集 |

- 部署配置

| 文件 | 主要作用 |
|------|----------|
| `Dockerfile` | **Docker镜像**，容器化部署配置 |
| `docker-compose.yml` | **容器编排**，多服务部署配置 |
| `.gitignore` | **版本控制**，Git忽略文件配置 |

- 文档和日志

| 文件 | 主要作用 |
|------|----------|
| `README.md` | **项目文档**，使用说明、API文档 |
| `logs/` | **日志文件**，应用运行日志和错误日志 |
| `openharmony_news.db` | **数据库文件**，SQLite数据存储 |

---

接下来我们使用cmd进行接口测试。

```bash
C:\Users\ASUS>   curl http://localhost:8001/health
{"status":"healthy","timestamp":1752076452.5490837,"version":"1.0.0"}
```

首先测试的是提前预留的健康检查接口，可以看到返回了健康检查状态。是正常的。随后我们再去检测一下爬虫数据获取接口。

![1752077085669.png](https://bu.dusays.com/2025/07/10/686e931fce2d1.png)

请求之后没有任何反应，所以我打开后台进行日志的查看，发现日志是正常工作的，所以说明请求正常发送了，仅仅是因为我为了不过高频率的请求而被封禁IP而设置了少量间隔，整体的爬取速度很慢，所以才短时间内没有响应，在五分钟左后后我获得了数据。

![1752077973683.png](https://bu.dusays.com/2025/07/10/686e96990526d.png)

不过这也提醒我了，需要设置一个缓存机制，每一小时或是其他时长的间隔进行爬取，每次请求直接返回缓存好的数据，这样就不用再额外等待现场爬取数据了，当然也有可能有人就是想要刷新获取最新的数据，所以我们可以在前端的UI界面加一行提示符来提示用户我们的资讯更新间隔，并设计一个按钮专门用来获取现爬取的最新数据。

ok今天先测试到这里了。

#### 数据缓存与更新机制

现在我们需要添加一个缓存机制，就是当服务程序开始运行的时候先执行一遍爬取数据，在开机第一次爬取时将服务状态设置成准备中，然后将爬取的数据暂存，每隔半个小时再次进行一次数据爬取，爬取时接收到请求仍使用上一次储存的数据，在爬取完成后替换新的数据。替换数据的过程也要将服务状态设置为准备中。这样在编写前端逻辑时我们就可以先通过服务状态接口来进行判断是否可以获取新数据如果可以就获取当前缓存数据，否则则提示用户稍后再试。

虽然我的预期如此，但是在首次进行调试的时候还是发现了问题。

![1752133476018.png](https://bu.dusays.com/2025/07/10/686f6f67d2020.png)

在服务器启动后优先执行了数据的爬取并没有直接启动服务，导致长达六七分钟的时间我们的任何API都没办法被请求，这是因为当前代码的执行顺序FastAPI框架必须等待数据爬取结束后才完成服务的启动。不过先不急着停止本次服务，先等待下一次自动数据更新是否成功。

![1752134878048.png](https://bu.dusays.com/2025/07/10/686f74e27280f.png)

可以看到在时间到了半小时的间隔之后数据的重新爬取确实是正常的触发了，但问题在于我再次请求服务端状态接口时是迟迟没有响应

![1752134942432.png](https://bu.dusays.com/2025/07/10/686f7522714eb.png)

我的推测是整个后端服务为单线程，在爬取数据时就会阻塞当前线程，虽然请求成功发送了，服务端也正常接收了，但只是进入了等待队列，需要等待新的数据获取完成后才会真正的返回响应，所以既没有超时也没有响应，所以我们需要将爬取数据的过程放到一个单独的线程中去执行，这样就可以避免阻塞主线程，从而保证服务端可以正常响应请求。

经过了五分钟的等待，服务端终于返回了响应。

![1752135416102.png](https://bu.dusays.com/2025/07/10/686f76fcac501.png)

这也证实了我的猜想，当前的服务端逻辑存在严重问题，急需修正。

#### 多线程解决主线程阻塞问题

本次修改主要解决了**多线程阻塞问题**和**精细状态管理**两个核心问题，实现了服务启动后立即响应请求，爬虫任务在后台执行，且只有在写入数据库时才短暂设为"准备中"的优化。

---

**关键代码解释**

- **多线程调度器改进** (`core/scheduler.py`)

  **问题**: 原始实现中爬虫任务在主线程同步执行，导致服务启动时被阻塞6-7分钟。

  **解决方案**: 使用 `ThreadPoolExecutor` 将爬虫任务放到独立线程中执行。

  ```python
  class TaskScheduler:
      def __init__(self):
          self.scheduler = AsyncIOScheduler()
          # 新增：线程池管理爬虫任务
          self.thread_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="CrawlerWorker")
          self._setup_jobs()

      def _run_crawler_in_thread(self, task_name: str):
          """在线程中执行爬虫任务"""
          try:
              # 执行爬取（此时状态仍为ready，可以正常响应请求）
              crawler = OpenHarmonyCrawler()
              articles = crawler.crawl_openharmony_news()

              # 只有在写入数据库时才设置状态为准备中
              cache.update_cache(articles)

          except Exception as e:
              cache.set_status(ServiceStatus.ERROR, str(e))

      async def initial_cache_load(self):
          """初始缓存加载（服务启动时执行）"""
          # 在线程池中执行爬虫任务
          future = self.thread_pool.submit(self._run_crawler_in_thread, "初始缓存加载")
          # 不等待完成，让任务在后台执行，服务可以立即启动
          logger.info("初始缓存加载任务已提交到后台线程，服务可以立即响应请求")
  ```

  **关键改进**:

  - 使用 `ThreadPoolExecutor` 管理爬虫任务
  - 爬虫任务在独立线程执行，不阻塞主服务线程
  - 服务启动后立即可以响应请求

---

- **精细状态管理** (`core/cache.py`)

  **问题**: 原始实现中爬虫开始就设为"准备中"，整个爬虫过程都无法响应请求。

  **解决方案**: 只有在写入数据库时才设为"准备中"，其他时候使用数据库内容响应。

  ```python
  class NewsCache:
      def __init__(self):
          self._cache: List[NewsArticle] = []
          self._cache_lock = threading.RLock()
          self._status = ServiceStatus.READY  # 初始状态为就绪（改进前是PREPARING）
          self._is_updating = False  # 新增：标记是否正在更新

      def set_updating(self, is_updating: bool):
          """设置更新状态"""
          with self._cache_lock:
              self._is_updating = is_updating
              if is_updating:
                  logger.info("开始数据更新，状态设为准备中")
                  self.set_status(ServiceStatus.PREPARING)
              else:
                  logger.info("数据更新完成，状态设为就绪")
                  self.set_status(ServiceStatus.READY)

      def update_cache(self, news_data: List[NewsArticle]):
          """更新缓存数据"""
          with self._cache_lock:
              try:
                  # 设置更新状态为True，状态变为准备中
                  self.set_updating(True)

                  # 更新缓存
                  self._cache = news_data.copy()
                  self._last_update = datetime.now().isoformat()
                  self._update_count += 1

                  # 设置更新状态为False，状态变为就绪
                  self.set_updating(False)

              except Exception as e:
                  self.set_status(ServiceStatus.ERROR, error_msg)
                  self._is_updating = False
                  raise
  ```

  **关键改进**:
  - 初始状态改为 `READY`（改进前是 `PREPARING`）
  - 添加 `_is_updating` 标记精确控制状态
  - 通过 `set_updating()` 方法精确控制状态变化
  - 只有在写入数据库时才设为"准备中"

---

- **状态信息增强** (`core/cache.py`)

  ```python
  def get_status(self) -> Dict[str, Any]:
      """获取服务状态"""
      with self._cache_lock:
          return {
              "status": self._status.value,
              "last_update": self._last_update,
              "cache_count": len(self._cache),
              "update_count": self._update_count,
              "error_message": self._error_message,
              "is_updating": self._is_updating  # 新增：是否正在更新
          }
  ```

  **关键改进**:
  - 状态信息中增加 `is_updating` 字段
  - 客户端可以精确了解当前是否正在更新数据

  ---

- **测试脚本** (`test_fine_grained_status.py`)

  ```python
  def test_fine_grained_status():
      """测试精细状态管理"""
      # 监控状态变化
      for i in range(20):
          response = requests.get(f"{base_url}/api/news/status", timeout=5)
          status_data = response.json()
          status = status_data['status']
          is_updating = status_data.get('is_updating', False)
          cache_count = status_data['cache_count']

          print(f"[{timestamp}] 状态: {status} | 更新中: {is_updating} | 缓存: {cache_count} 条")

          # 如果状态变为ready且有数据，说明爬虫完成
          if status == 'ready' and cache_count > 0 and not is_updating:
              print("🎉 爬虫任务完成！")
              break
  ```

  **关键功能**:
  - 实时监控状态变化
  - 验证爬虫期间仍可获取数据
  - 测试并发请求响应

---

**改进效果对比**

| 方面 | 改进前 | 改进后 |
|------|--------|--------|
| **服务启动** | 需要等待爬虫完成（6-7分钟） | 立即启动并响应请求 |
| **爬虫执行** | 阻塞主线程，无法响应请求 | 后台线程执行，正常响应 |
| **状态管理** | 爬虫开始就设为准备中 | 只有写入数据库时才设为准备中 |
| **用户体验** | 等待时间长，体验差 | 即时响应，体验佳 |
| **并发支持** | 单线程阻塞 | 多线程并发处理 |

---

**改进后的服务端架构**

```text
主服务线程 (FastAPI)
    ├── 立即响应API请求
    ├── 使用现有缓存数据
    └── 状态管理
    
后台线程池 (ThreadPoolExecutor)
    ├── 爬虫任务执行
    ├── 数据采集和处理
    └── 数据库写入（短暂设为准备中）
```

这次改进彻底解决了单线程阻塞问题，实现了真正的非阻塞服务架构，同时通过精细状态管理最大化服务可用性。

![1752137517924.png](https://bu.dusays.com/2025/07/10/686f7f320d774.png)

此时可以看到在初次启动服务后

```text
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

先于爬虫的任务日志显示，在此期间我再次请求了 `/api/news/status`，可以看到返回的状态是 `ready`，并且缓存数量为0，说明爬虫任务还未结束，当前的数据库中并没有数据。但也可以看到我再此期间进行的请求与都正常的返回了响应，但是响应内容是空的，不可利用的，所以我们还需要进行优化。

对于这个问题，首先它在实际生产环境中并不常见，因为它仅会发生在服务器初次启动时，实际的生产环境中肯定**不会经常性的开关服务器**，同时Nginx的{% label **反向代理** orange %}以及{% label **均衡负载** orange %}也会保证在服务端升级维护时是多台服务器循环重启而非全部断联，也就是所谓的{% label **滚动升级** purple %}，来保障其{% label **高可用性原则** purple %}，基本不会发生以上现象。所以我们需要再次测试一下再后续的稳定运行阶段是否能在爬虫运行时保证主线程能正常的处理请求。同时我们也需要在客户端利用数据库来存储上一次加载的数据，以防止在启动时获取的数据为空或者是获取失败，这样可以极大的提高运行的稳定性。

![1752139864861.png](https://bu.dusays.com/2025/07/10/686f885d1b05c.png)

在写上面这段分析时刚好也等到了下一次更新，我在此期间再次请求了新闻列表接口，发现正常获取了数据，说明主子线程已经成功分离。（我才发现之前请求时少了个正斜杠……汗流浃背了）

到这里的话整体的架构就已经搭建出来了，我就可以继续收集更多的数据源了。

#### CSDN平台资讯

首先还是先去观察CSDN目标网页的网页结构，去观察其是如何进行页面跳转的，这将决定我们用什么手段去获取目标资讯页面的跳转URL。先是确认一下基地址。和OpenHarmony官网不同的点在于OpenHarmony官网是直接就有资讯页面的，而且是按照时间顺序排列的，我们直接自上而下的遍历就可以很自然的按照顺序去获取到我们所需要的资讯链接。但CSDN是一个全技术栈的程序员技术网站，我们只能输入关键词进行搜索，所以我要先将`OpenHarmony`输入搜索框并勾选好最新选项，我们才能按照时间顺序获取到按时间顺序排布的全部的资讯链接。

![1752153112189.png](https://bu.dusays.com/2025/07/10/686fbc1e064af.png)

```bash
https://so.csdn.net/so/search?spm=1000.2115.3001.4498&q=openHarmony&t=all&u=&s=new
```

此前我也在多篇博文中解析过URL中的一些常见参数，这里就在简单说一下吧。第一个参数`spm`虽然没有官方的解释不过我们还是能通过字段命名和值来猜个大概，它的含义应该是用于统计和追踪页面的来源、流量等信息，其数值是 CSDN 系统内部定义的编码，具体的分段数值（1000.2115.3001.4498）对应着网站内部的不同页面层级、模块或推广渠道等，对于普通用户来说，这个参数更多是网站后台用于数据分析和管理的标识，没有直接的实际使用意义。第二个参数`q`是 “query” 的缩写，代表搜索的关键词，这里表示用户搜索的内容是 “openHarmony”。第三个参数`t`代表搜索的内容类型，“all” 表示搜索全部类型的内容，在 CSDN 中，内容类型可能包括博客、问答、下载、资讯等，选择 “all” 即不限制内容类型进行搜索。第四个参数`u`可能与用户（user）相关，这里参数值为空，可能表示当前搜索没有限定特定用户发布的内容，即搜索范围是整个 CSDN 平台内符合关键词的内容，而非某个用户名下的内容。第五个参数`s`代表排序方式，“new” 表示按照内容的发布时间从新到旧进行排序，即搜索结果中，最新发布的与 “openHarmony” 相关的内容会排在较前面的位置，这也是在我勾选了最新之后出现的参数值所以还是比较确定的。

确认了基地址后就来分析我们的目标资源地址藏在了哪里。

![1752153958404.png](https://bu.dusays.com/2025/07/10/686fbf6a96048.png)

哇这个页面结构是真规整啊，我先展开每一个目标list-item查看其是否包含有我们的目标链接。

![1752156369968.png](https://bu.dusays.com/2025/07/10/686fc8d8cd004.png)

明文a标签，这可太美好了，我们直接取用其中的herf字段就可以作为资讯链接了，真是太美妙了。

```python
    def crawl(self):
        articles = []
        url = self.BASE_URL
        print(f"请求: {url} ...")
        resp = requests.get(url, headers=self.HEADERS, timeout=10)
        if resp.status_code != 200:
            print(f"请求失败: {resp.status_code}")
            return articles
        soup = BeautifulSoup(resp.text, "html.parser")
        for item in soup.select("div.list-item"):
            a_tag = item.select_one("a")
            title_tag = item.select_one("a.block-title")
            summary_tag = item.select_one(".search-detail")
            if a_tag and title_tag:
                articles.append({
                    "title": title_tag.get_text(strip=True),
                    "url": a_tag.get("href"),
                    "summary": summary_tag.get_text(strip=True) if summary_tag else ""
                })
        print(f"共获取到{len(articles)}篇文章")
        time.sleep(self.delay + random.random())
        return articles
```

将当前爬虫代码仅作为一个单独的文件进行测试，设置独立的main函数而不是直接接入主服务流程，在测试无误后再接入主服务流程，这样能保证在调试过程中不会影响到主服务流程的运行。接下来进行测试。

```text
请求: https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=openHarmony&t=&u=&s=new ...
共获取到0篇文章
共获取到0篇文章：

进程已结束，退出代码为 0
```

果然失败了，每多少第一次就成功的。先冷静的分析一下原因。

首先我考虑到的就是URL错误或失效，毕竟其中还包含了一些我们并不能确定的参数，于是我决定进行跳转进行测试。

![1752165651408.png](https://bu.dusays.com/2025/07/11/686fed1711bdd.png)

跳转之后显示成功，但还不能掉以轻心，我决定用CMD进行请求测试。

```bash
C:\Users\ASUS>curl https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=openHarmony&t=&u=&s=new
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="referrer" content="always"><meta name="report" content='{"spm":"1018.2226","disabled":"true"}'><meta name="csdn-baidu-search" content='{"keyword":""}'><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0;"><link rel="icon" href="https://csdnimg.cn/public/favicon.ico"><title></title><script src="https://g.csdnimg.cn/lib/jquery/3.7.1/jquery.min.js"></script><script src="https://g.csdnimg.cn/common/csdn-report/report.js"></script><script src="https://g.csdnimg.cn/baidu-search/1.0.12/baidu-search.js"></script><script>var CFG = {
        API_URL: '//so.csdn.net/so/',
        js_insert_first: true,
        js_insert_count: 0
      }</script><style>.hiddenToolbar {
        display: none !important;
      }</style><link href="https://csdnimg.cn/release/searchv2-fe/css/chunk-507d1eda.d0e4a7f0.css" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/css/chunk-ef13ade6.b7f2a69e.css" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/js/chunk-507d1eda.f1d6c6e7.js" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/js/chunk-ef13ade6.fb45640e.js" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/css/element-ui.6b92dc4c.css" rel="preload" as="style"><link href="https://csdnimg.cn/release/searchv2-fe/css/highlight.9276efd2.css" rel="preload" as="style"><link href="https://csdnimg.cn/release/searchv2-fe/css/index.183186f5.css" rel="preload" as="style"><link href="https://csdnimg.cn/release/searchv2-fe/js/element-ui.25bb7d6a.js" rel="preload" as="script"><link href="https://csdnimg.cn/release/searchv2-fe/js/highlight.6f38c3f5.js" rel="preload" as="script"><link href="https://csdnimg.cn/release/searchv2-fe/js/index.b1794c4a.js" rel="preload" as="script"><link href="https://csdnimg.cn/release/searchv2-fe/css/element-ui.6b92dc4c.css" rel="stylesheet"><link href="https://csdnimg.cn/release/searchv2-fe/css/highlight.9276efd2.css" rel="stylesheet"><link href="https://csdnimg.cn/release/searchv2-fe/css/index.183186f5.css" rel="stylesheet">    <script src="/cdn_cgi_bs_captcha/static/js/waf_captcha_embedded_bs.js"></script>
</head><body style="position: relative;"><noscript><strong>We're sorry but search-fe-v2 doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id="app"></div><script src="https://g.csdnimg.cn/common/csdn-login-box/csdn-login-box.js"></script><script src="https://g.csdnimg.cn/user-ordercart/3.0.1/user-ordercart.js"></script><script src="https://g.csdnimg.cn/lib/qrcode/1.0.0/qrcode.min.js"></script><script src="https://g.csdnimg.cn/user-ordertip/5.0.5_so_v2/user-ordertip.js"></script><script>const header = document.createElement('script')
      header.type = 'text/javascript'
      header.prod = 'so'
      header.skin = 'black'
      header.domain = '//so.csdn.net/so/'
      if (
        location.pathname.includes('/chat') ||
        location.pathname.includes('/so/ai') ||
        location.pathname.includes('/so/ask')
      ) {
        // PC端显示C知道自己的toolbar
        if (
          navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i)
        ) {
          header.src = '//csdnimg.cn/public/common/toolbar/js/m_toolbar-2.1.2.js'
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = '//csdnimg.cn/public/common/toolbar/content_toolbar_css/m_toolbar-1.1.1.css'
          document.head.appendChild(link)
          // 兼容app
          if (document.cookie.includes('CSDN-APP') || /csdn/i.test(window.navigator.userAgent)) {
            document.body.className = 'csdn-app'
          }
        }
      } else {
        header.src = 'https://g.csdnimg.cn/common/csdn-toolbar/csdn-toolbar.js'
      }
      document.body.appendChild(header)</script><script>;(function() {
        const isTest = location.host.indexOf('loc') > -1 || location.href.indexOf('cknow-lib-env=test') > -1
        const SCRIPTS_PRELOAD = {
          AI_SEARCH_CARD: {
            LOADED: false,
            SRC: isTest
              ? 'https://g.csdnimg.cn/aisearch/web-card/ai-search-card.js'
              : 'https://csdnimg.cn/release/aisearch/web-card/ai-search-card.js'
          }
        }

        const loadScript = function(name) {
          if (SCRIPTS_PRELOAD[name]) {
            const aiCardContentScript = document.createElement('script')
            aiCardContentScript.type = 'text/javascript'
            aiCardContentScript.onload = function() {
              SCRIPTS_PRELOAD[name].LOADED = true
              window.dispatchEvent(new CustomEvent(name + '.LOADED'))
            }
            aiCardContentScript.src = SCRIPTS_PRELOAD[name].SRC
            document.body.appendChild(aiCardContentScript)
          }
        }

        window.SCRIPTS_ONLOAD = function(name, callback) {
          if (SCRIPTS_PRELOAD[name].LOADED) {
            callback()
          } else {
            window.addEventListener(name + '.LOADED', callback)
          }
        }

        loadScript('AI_SEARCH_CARD')
      })()</script><script>if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        if (!/msie [6|7|8|9]/i.test(navigator.userAgent)) {
          if (!window.upgrade) {
            window.upgrade = true
            let s = document.createElement('script')
            s.src = 'https://g.csdnimg.cn/browser_upgrade/1.0.2/browser_upgrade.js'
            let x = document.getElementsByTagName('script')[0]
            x.parentNode.insertBefore(s, x)
          }
        }
      }</script><script>window.onload = function() {
        if (window.csdn && typeof window.csdn.configuration_tool_parameterv === 'function') {
          window.csdn.configuration_tool_parameterv({
            need_change_function: function(flag) {
              let c_toolbar = $('#csdn-toolbar')
              let s_toolbar = $('.so-toolbar')
              let advert = $('#csdn-toolbar .toolbar-advert')
              if (flag === 'fixed') {
                if (advert.length) advert.hide()
                s_toolbar.addClass('fixed').css('top', '0px')
                c_toolbar.addClass('hiddenToolbar')
              } else if (flag === 'noFixed') {
                if (advert.length) advert.show()
                s_toolbar.removeClass('fixed')
                c_toolbar.removeClass('hiddenToolbar')
              }
            }
          })
        }
      }</script><script src="//g.csdnimg.cn/fixed-sidebar/1.1.6/fixed-sidebar.js"></script><script src="//g.csdnimg.cn/user-tooltip/2.4/user-tooltip.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/element-ui.25bb7d6a.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/highlight.6f38c3f5.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/index.b1794c4a.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/chunk-vendors.b533e482.js"></script></body></html>'q' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
't' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
'u' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
's' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
```

enm,测试的时候后续的参数都被判定为一个cmd命令中的参数了，而不是URL的一部分。为了防止被系统误判，我们用双引号包裹再试一次。

```bash
C:\Users\ASUS>curl "https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=openHarmony&t=&u=&s=new"
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="referrer" content="always"><meta name="report" content='{"spm":"1018.2226","disabled":"true"}'><meta name="csdn-baidu-search" content='{"keyword":""}'><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0;"><link rel="icon" href="https://csdnimg.cn/public/favicon.ico"><title></title><script src="https://g.csdnimg.cn/lib/jquery/3.7.1/jquery.min.js"></script><script src="https://g.csdnimg.cn/common/csdn-report/report.js"></script><script src="https://g.csdnimg.cn/baidu-search/1.0.12/baidu-search.js"></script><script>var CFG = {
        API_URL: '//so.csdn.net/so/',
        js_insert_first: true,
        js_insert_count: 0
      }</script><style>.hiddenToolbar {
        display: none !important;
      }</style><link href="https://csdnimg.cn/release/searchv2-fe/css/chunk-507d1eda.d0e4a7f0.css" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/css/chunk-ef13ade6.b7f2a69e.css" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/js/chunk-507d1eda.f1d6c6e7.js" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/js/chunk-ef13ade6.fb45640e.js" rel="prefetch"><link href="https://csdnimg.cn/release/searchv2-fe/css/element-ui.6b92dc4c.css" rel="preload" as="style"><link href="https://csdnimg.cn/release/searchv2-fe/css/highlight.9276efd2.css" rel="preload" as="style"><link href="https://csdnimg.cn/release/searchv2-fe/css/index.183186f5.css" rel="preload" as="style"><link href="https://csdnimg.cn/release/searchv2-fe/js/element-ui.25bb7d6a.js" rel="preload" as="script"><link href="https://csdnimg.cn/release/searchv2-fe/js/highlight.6f38c3f5.js" rel="preload" as="script"><link href="https://csdnimg.cn/release/searchv2-fe/js/index.b1794c4a.js" rel="preload" as="script"><link href="https://csdnimg.cn/release/searchv2-fe/css/element-ui.6b92dc4c.css" rel="stylesheet"><link href="https://csdnimg.cn/release/searchv2-fe/css/highlight.9276efd2.css" rel="stylesheet"><link href="https://csdnimg.cn/release/searchv2-fe/css/index.183186f5.css" rel="stylesheet">    <script src="/cdn_cgi_bs_captcha/static/js/waf_captcha_embedded_bs.js"></script>
</head><body style="position: relative;"><noscript><strong>We're sorry but search-fe-v2 doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id="app"></div><script src="https://g.csdnimg.cn/common/csdn-login-box/csdn-login-box.js"></script><script src="https://g.csdnimg.cn/user-ordercart/3.0.1/user-ordercart.js"></script><script src="https://g.csdnimg.cn/lib/qrcode/1.0.0/qrcode.min.js"></script><script src="https://g.csdnimg.cn/user-ordertip/5.0.5_so_v2/user-ordertip.js"></script><script>const header = document.createElement('script')
      header.type = 'text/javascript'
      header.prod = 'so'
      header.skin = 'black'
      header.domain = '//so.csdn.net/so/'
      if (
        location.pathname.includes('/chat') ||
        location.pathname.includes('/so/ai') ||
        location.pathname.includes('/so/ask')
      ) {
        // PC端显示C知道自己的toolbar
        if (
          navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i)
        ) {
          header.src = '//csdnimg.cn/public/common/toolbar/js/m_toolbar-2.1.2.js'
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = '//csdnimg.cn/public/common/toolbar/content_toolbar_css/m_toolbar-1.1.1.css'
          document.head.appendChild(link)
          // 兼容app
          if (document.cookie.includes('CSDN-APP') || /csdn/i.test(window.navigator.userAgent)) {
            document.body.className = 'csdn-app'
          }
        }
      } else {
        header.src = 'https://g.csdnimg.cn/common/csdn-toolbar/csdn-toolbar.js'
      }
      document.body.appendChild(header)</script><script>;(function() {
        const isTest = location.host.indexOf('loc') > -1 || location.href.indexOf('cknow-lib-env=test') > -1
        const SCRIPTS_PRELOAD = {
          AI_SEARCH_CARD: {
            LOADED: false,
            SRC: isTest
              ? 'https://g.csdnimg.cn/aisearch/web-card/ai-search-card.js'
              : 'https://csdnimg.cn/release/aisearch/web-card/ai-search-card.js'
          }
        }

        const loadScript = function(name) {
          if (SCRIPTS_PRELOAD[name]) {
            const aiCardContentScript = document.createElement('script')
            aiCardContentScript.type = 'text/javascript'
            aiCardContentScript.onload = function() {
              SCRIPTS_PRELOAD[name].LOADED = true
              window.dispatchEvent(new CustomEvent(name + '.LOADED'))
            }
            aiCardContentScript.src = SCRIPTS_PRELOAD[name].SRC
            document.body.appendChild(aiCardContentScript)
          }
        }

        window.SCRIPTS_ONLOAD = function(name, callback) {
          if (SCRIPTS_PRELOAD[name].LOADED) {
            callback()
          } else {
            window.addEventListener(name + '.LOADED', callback)
          }
        }

        loadScript('AI_SEARCH_CARD')
      })()</script><script>if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        if (!/msie [6|7|8|9]/i.test(navigator.userAgent)) {
          if (!window.upgrade) {
            window.upgrade = true
            let s = document.createElement('script')
            s.src = 'https://g.csdnimg.cn/browser_upgrade/1.0.2/browser_upgrade.js'
            let x = document.getElementsByTagName('script')[0]
            x.parentNode.insertBefore(s, x)
          }
        }
      }</script><script>window.onload = function() {
        if (window.csdn && typeof window.csdn.configuration_tool_parameterv === 'function') {
          window.csdn.configuration_tool_parameterv({
            need_change_function: function(flag) {
              let c_toolbar = $('#csdn-toolbar')
              let s_toolbar = $('.so-toolbar')
              let advert = $('#csdn-toolbar .toolbar-advert')
              if (flag === 'fixed') {
                if (advert.length) advert.hide()
                s_toolbar.addClass('fixed').css('top', '0px')
                c_toolbar.addClass('hiddenToolbar')
              } else if (flag === 'noFixed') {
                if (advert.length) advert.show()
                s_toolbar.removeClass('fixed')
                c_toolbar.removeClass('hiddenToolbar')
              }
            }
          })
        }
      }</script><script src="//g.csdnimg.cn/fixed-sidebar/1.1.6/fixed-sidebar.js"></script><script src="//g.csdnimg.cn/user-tooltip/2.4/user-tooltip.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/element-ui.25bb7d6a.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/highlight.6f38c3f5.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/index.b1794c4a.js"></script><script src="https://csdnimg.cn/release/searchv2-fe/js/chunk-vendors.b533e482.js"></script></body></html>
```

可以看到，成功了。但仔细一看，获取到的页面内容很少，而且和我们使用浏览器开发者工具所看到的页面结构并不一样，没看到此前所看到的list以及其包含的list-item。这说明其页面内容是在加载后依据于设备类型进行动态生成的，属于是动态网页类型，而非静态网页。之前的OpenHarmony官网的资讯在更新了之后并不需要依赖搜索这种API来间接进行页面信息获取，所以属于是静态网页，可以直接分析结构进行信息的获取。

为了应对这种情况我们就需要使用所谓的“有头爬虫”。

---

1. 什么是“有头爬虫”？

  在爬取网页数据时，网页大致分为两类：**静态网页**和**动态网页**。  

  - **静态网页**：页面内容直接写在 HTML 里，用 requests、curl 等工具请求后就能直接看到完整内容，解析 HTML 即可提取数据。
  - **动态网页**：页面初始 HTML 只有骨架，真正的内容是通过 JavaScript 动态渲染出来的。只有浏览器加载并执行 JS 后，内容才会显示在页面上。

  对于动态网页，传统的 requests、curl 等“无头爬虫”无法获取到渲染后的内容。这时就需要用到**“有头爬虫”**（也叫“浏览器爬虫”）。

2. 有头爬虫的原理

  “有头爬虫”本质上是**自动化驱动真实浏览器**（如 Chrome、Edge、Firefox），模拟人类用户的操作流程。它会：

  - 打开浏览器窗口
  - 访问目标网页
  - 等待页面和 JS 脚本加载、执行
  - 获取渲染后的完整页面内容（包括 JS 动态生成的内容）
  - 解析并提取所需数据

常用的有头爬虫工具有 Selenium、Playwright、Puppeteer 等。

3. “有头爬虫”与“无头爬虫”的区别

| 类型         | 能力                  | 适用场景           |
|--------------|-----------------------|--------------------|
| 无头爬虫     | 只请求静态HTML        | 静态网页           |
| 有头爬虫     | 执行JS、渲染动态内容  | 动态网页、反爬较强 |

---

在本项目中，我们使用了 **Selenium + Chrome** 作为有头爬虫的实现方案。  
核心流程如下：

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

class CSDNOpenHarmonyCrawler:
    BASE_URL = "https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=openHarmony&t=&u=&s=new"

    def __init__(self, delay=1.5):
        self.delay = delay

    def crawl(self):
        articles = []
        options = Options()
        options.add_argument('--headless')  # 无界面模式，后台运行
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--window-size=1920,1080')
        driver = webdriver.Chrome(options=options)
        try:
            driver.get(self.BASE_URL)
            time.sleep(self.delay)  # 等待JS渲染
            soup = BeautifulSoup(driver.page_source, "html.parser")
            for item in soup.select("div.list-item"):
                a_tag = item.select_one("a")
                title_tag = item.select_one("a.block-title")
                summary_tag = item.select_one(".search-detail")
                if a_tag and title_tag:
                    articles.append({
                        "title": title_tag.get_text(strip=True),
                        "url": a_tag.get("href"),
                        "summary": summary_tag.get_text(strip=True) if summary_tag else ""
                    })
        finally:
            driver.quit()
        return articles
```

**解释：**

- 通过 Selenium 启动一个无头 Chrome 浏览器，访问 CSDN 搜索页面。
- 浏览器会自动执行页面中的所有 JavaScript，渲染出完整的资讯列表。
- 用 BeautifulSoup 解析渲染后的 HTML，提取 `div.list-item` 下的资讯标题、链接和摘要。
- 最终获取到的内容与浏览器 F12 看到的内容一致，**解决了动态网页无法直接爬取的问题**。

明天继续解决详细文章内容爬取的问题。

---

接下来我们来解决一下具体文章内容爬取的问题。

首先任一点开两篇文章的链接，对比其结构，统一网站的同一类型子页面内容的格式应该是一致的模板。

![1752215970486.png](https://bu.dusays.com/2025/07/11/6870b1a461fc5.png)

首先通过第一篇文章直接选择文章正文内容的容器就可以定位到正文然后再逐级向上找到包裹全部文章正文的极小容器，这样我们就可以通过该容器来获取到全部文章内容了。

id是`content_views`，类名可以不唯一，但是id肯定是唯一的，我们再找一篇文章进行一下验证。

![1752216326708.png](https://bu.dusays.com/2025/07/11/6870b308a30a4.png)

ok现在我们就可以确定我们的目标文章内容就是这个容器了。开始编写爬起代码。

```python
    def crawl(self):
        """使用Selenium获取渲染后的资讯内容，并爬取每篇文章详情页"""
        articles = []
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--window-size=1920,1080')
        driver = webdriver.Chrome(options=options)
        try:
            url = self.BASE_URL
            print(f"请求: {url} ...")
            driver.get(url)
            time.sleep(self.delay + random.random())  # 等待JS渲染
            soup = BeautifulSoup(driver.page_source, "html.parser")
            for item in soup.select("div.list-item"):
                a_tag = item.select_one("a")
                title_tag = item.select_one("a.block-title")
                # 修改简介提取方式
                summary_tag = item.select_one("p.row2")
                if a_tag and title_tag:
                    article_url = a_tag.get("href")
                    article = {
                        "title": title_tag.get_text(strip=True),
                        "url": article_url,
                        "summary": summary_tag.get_text(strip=True) if summary_tag else ""
                    }
                    # 进入详情页爬取正文、作者、时间
                    detail = self.crawl_article_detail(driver, article_url)
                    article.update(detail)
                    articles.append(article)
                    print(f"已获取: {article['title']} [{article_url}]")
                    time.sleep(self.delay + random.random())
            print(f"共获取到{len(articles)}篇文章")
        finally:
            driver.quit()
        return articles

    def crawl_article_detail(self, driver, url):
        """爬取CSDN博文详情页，提取正文内容、作者、时间等"""
        result = {
            "date": None,
            "author": {},
            "content": []
        }
        try:
            driver.get(url)
            time.sleep(self.delay + random.random())
            soup = BeautifulSoup(driver.page_source, "html.parser")
            # 正文内容
            content_blocks = []
            content_container = soup.find(id="content_views")
            if content_container:
                for elem in content_container.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "img", "pre", "code", "ul", "ol", "li"]):
                    if elem.name in ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "li"]:
                        text = elem.get_text(strip=True)
                        if text and len(text) > 0:
                            content_blocks.append({"type": "text", "value": text})
                    elif elem.name == "img":
                        img_src = elem.get("src")
                        if img_src:
                            content_blocks.append({"type": "image", "value": img_src})
                    elif elem.name in ["pre", "code"]:
                        code_text = elem.get_text("\n", strip=True)
                        if code_text:
                            content_blocks.append({"type": "code", "value": code_text})
            result["content"] = content_blocks
            # 作者信息
            author_box = soup.select_one("a.profile-href")
            if author_box:
                author_name = author_box.select_one("span.profile-name")
                author_img = author_box.select_one("img.profile-img")
                result["author"] = {
                    "name": author_name.get_text(strip=True) if author_name else None,
                    "avatar": author_img.get("src") if author_img else None,
                    "homepage": author_box.get("href")
                }
            # 发布时间
            # 常见位置：meta、时间标签、正文上方
            date_str = None
            meta_time = soup.find("meta", {"itemprop": "datePublished"})
            if meta_time and meta_time.get("content"):
                date_str = meta_time["content"]
            if not date_str:
                # 备选方案：查找常见时间标签
                time_tag = soup.find("span", class_="time") or soup.find("span", class_="publish-time")
                if time_tag:
                    date_str = time_tag.get_text(strip=True)
            result["date"] = date_str
        except Exception as e:
            print(f"详情页解析失败: {url}, 错误: {e}")
        return result
```

我对原有的资讯列表获取功能函数进行了升级，添加了简介的获取以及对文章内容函数的调用功能。

开始运行测试。

![1](OpenSourceSummer2025/1.png)

```js
      {
        "type": "text",
        "value": "​​Unity版本​​：2021.3 LTS（支持OpenHarmony 3.2+，官方推荐）；"
      },
      {
        "type": "text",
        "value": "​​OpenHarmony SDK​​：安装DevEco Studio（OpenHarmony开发工具）并配置LiteOS SDK（路径：File > Settings > SDK Manager）；"
      },
      {
        "type": "code",
        "value": "File > Settings > SDK Manager"
      },
      {
        "type": "text",
        "value": "​​交叉编译工具​​：OpenHarmony提供的ohos-gcc（版本r12p）与cmake（3.18+）；"
      },
      {
        "type": "code",
        "value": "ohos-gcc"
      },
      {
        "type": "code",
        "value": "cmake"
      },
      {
        "type": "text",
        "value": "​​调试工具​​：hdc（鸿蒙设备连接工具）、PerfTool（性能分析工具）。"
      },
```

我们可以看到在爬取的时候还成功获取了代码块中的内容，这也是之前在爬取OpenHarmony官网资讯时所没有考虑到的，因为官网的资讯大多类似于新闻报道类型的文章并不会过多的提及技术细节，只会从整体的视角介绍讲解，而CSDN与其是完全不同的性质，所以在客户端进行渲染时我也要考虑到这一点。

不过从结果来看还能发现两个问题，一个就是单一关键词的OpenHarmony资讯获取的数量还是太少了只有30篇，所以我应该想办法用多关键词进行爬取，另一个就是爬取的资讯中的代码部分处理的并不好。有一些代码块在获取后会有很奇怪的重复需要针对代码块进行特别的调优处理。这里我考虑可以将代码标签中的值用markdown格式来进行传递，在客户端解析时利用第三方markdown解析库进行解析。

```js
      {
        "type": "code",
        "value": "// EntryAbility.ets（OpenHarmony轻量系统）\nimport\nUIAbility\nfrom\n'@ohos.app.ability.UIAbility'\n;\nimport\nWindow\nfrom\n'@ohos.window'\n;\nexport\ndefault\nclass\nEntryAbility\nextends\nUIAbility\n{\nonCreate\n(\nwant, launchParam\n) {\nconsole\n.\nlog\n(\n'EntryAbility onCreate: 启动Unity游戏'\n);\n// 加载Unity渲染的View\nthis\n.\ncontext\n.\nsetUIContent\n(\nthis\n,\n'pages/UnityScene'\n,\nnull\n);\n}\nonDestroy\n(\n) {\nconsole\n.\nlog\n(\n'EntryAbility onDestroy: 关闭Unity'\n);\n}\nonWindowStageCreate\n(\nwindowStage: Window.WindowStage\n) {\n// 加载Unity生成的HAP包（或动态库）\nwindowStage.\nloadAbility\n(\nnew\nIntent\n.\nOperationBuilder\n()\n.\nwithAction\n(\nIntent\n.\nACTION_MAIN\n)\n.\nwithCategory\n(\nIntent\n.\nCATEGORY_LAUNCHER\n)\n.\nbuild\n()).\nthen\n(\n() =>\n{\nconsole\n.\nlog\n(\n'Unity场景加载完成'\n);\n}).\ncatch\n(\n(\nerr\n) =>\n{\nconsole\n.\nerror\n(\n'加载失败：'\n+\nJSON\n.\nstringify\n(err));\n});\n}\n}\nAI生成项目"
      },
      {
        "type": "code",
        "value": "// EntryAbility.ets（OpenHarmony轻量系统）\nimport\nUIAbility\nfrom\n'@ohos.app.ability.UIAbility'\n;\nimport\nWindow\nfrom\n'@ohos.window'\n;\nexport\ndefault\nclass\nEntryAbility\nextends\nUIAbility\n{\nonCreate\n(\nwant, launchParam\n) {\nconsole\n.\nlog\n(\n'EntryAbility onCreate: 启动Unity游戏'\n);\n// 加载Unity渲染的View\nthis\n.\ncontext\n.\nsetUIContent\n(\nthis\n,\n'pages/UnityScene'\n,\nnull\n);\n}\nonDestroy\n(\n) {\nconsole\n.\nlog\n(\n'EntryAbility onDestroy: 关闭Unity'\n);\n}\nonWindowStageCreate\n(\nwindowStage: Window.WindowStage\n) {\n// 加载Unity生成的HAP包（或动态库）\nwindowStage.\nloadAbility\n(\nnew\nIntent\n.\nOperationBuilder\n()\n.\nwithAction\n(\nIntent\n.\nACTION_MAIN\n)\n.\nwithCategory\n(\nIntent\n.\nCATEGORY_LAUNCHER\n)\n.\nbuild\n()).\nthen\n(\n() =>\n{\nconsole\n.\nlog\n(\n'Unity场景加载完成'\n);\n}).\ncatch\n(\n(\nerr\n) =>\n{\nconsole\n.\nerror\n(\n'加载失败：'\n+\nJSON\n.\nstringify\n(err));\n});\n}\n}"
      },
      {
        "type": "text",
        "value": "// EntryAbility.ets（OpenHarmony轻量系统）"
      },
      {
        "type": "text",
        "value": "// EntryAbility.ets（OpenHarmony轻量系统）"
      },
      {
        "type": "text",
        "value": "// EntryAbility.ets（OpenHarmony轻量系统）"
      },
```

问题的具体表现就像是上面这样，所以我们需要针对代码块的结构进行优化处理

#### CSDN资讯源的代码块结构专项优化

![2](OpenSourceSummer2025/2.png)

![3](OpenSourceSummer2025/3.png)

我确实没怎么注意过这个代码块的渲染细节，这仔细一看才看明白，关键字，变量名，注释等都是不同的类名来进行的渲染。究竟怎么依据各个语言的语法来进行区分与渲染，或者说我们常用的这套Markdown渲染成HTML的逻辑又是怎么实现的？确实很有趣，后面没准会单开一篇文章来研究一下，哈哈。

---

来让我们回归正题。在观察了代码块的页面结构后我对代码进行了升级改造。

```py
  elif elem.name == "pre":
      # 优化：合并整个pre下的代码行，按markdown代码块格式输出
      code_lines = []
      # 兼容CSDN高亮结构
      for code_div in elem.select("div.hljs-ln-code, code"):
          code_line = code_div.get_text("\n", strip=False)
          code_lines.append(code_line)
      if not code_lines:
          # 兜底：直接取pre的全部文本
          code_lines = [elem.get_text("\n", strip=False)]
      code_text = "".join(code_lines)
      # 检测语言类型
      lang = ""
      code_tag = elem.find("code")
      if code_tag and code_tag.has_attr("class"):
          for c in code_tag["class"]:
              if c.startswith("language-"):
                  lang = c.replace("language-", "")
                  break
      md_code = f"```{lang}\n{code_text}\n```"
      content_blocks.append({"type": "code", "value": md_code})
  elif elem.name == "code":
      # 跳过已被pre处理的code，避免重复
      if elem.parent and elem.parent.name == "pre":
          continue
      code_text = elem.get_text("\n", strip=True)
      if code_text:
          md_code = f"```{code_text}```"
          content_blocks.append({"type": "code", "value": md_code})
```

核心的爬取逻辑修改就在这里了，让我们再来测试一下。

在我看到我想看到的代码块之前我就发现了另一个问题，理论上讲我的代码已经去除了被pre标签包裹的code标签，但是实际上我的代码却将行内代码块也一并设置为了用` ``` ``` `代码块来进行包裹，这很显然是错误的。

```js
{
  "type": "code",
  "value": "```File > Settings > SDK Manager```"
},
{
  "type": "text",
  "value": "​​交叉编译工具​​：OpenHarmony提供的ohos-gcc（版本r12p）与cmake（3.18+）；"
},
{
  "type": "code",
  "value": "```ohos-gcc```"
},
{
  "type": "code",
  "value": "```cmake```"
},
```

我们先继续检索我们所想看到的代码块对象。

```js
      {
        "type": "code",
        "value": "```typescript\n// EntryAbility.ets（OpenHarmony轻量系统）\nimport\n \nUIAbility\n \nfrom\n \n'@ohos.app.ability.UIAbility'\n;\nimport\n \nWindow\n \nfrom\n \n'@ohos.window'\n;\n \nexport\n \ndefault\n \nclass\n \nEntryAbility\n \nextends\n \nUIAbility\n {\n  \nonCreate\n(\nwant, launchParam\n) {\n    \nconsole\n.\nlog\n(\n'EntryAbility onCreate: 启动Unity游戏'\n);\n    \n// 加载Unity渲染的View\n    \nthis\n.\ncontext\n.\nsetUIContent\n(\nthis\n, \n'pages/UnityScene'\n, \nnull\n);\n  }\n \n  \nonDestroy\n(\n) {\n    \nconsole\n.\nlog\n(\n'EntryAbility onDestroy: 关闭Unity'\n);\n  }\n \n  \nonWindowStageCreate\n(\nwindowStage: Window.WindowStage\n) {\n    \n// 加载Unity生成的HAP包（或动态库）\n    windowStage.\nloadAbility\n(\nnew\n \nIntent\n.\nOperationBuilder\n()\n      .\nwithAction\n(\nIntent\n.\nACTION_MAIN\n)\n      .\nwithCategory\n(\nIntent\n.\nCATEGORY_LAUNCHER\n)\n      .\nbuild\n()).\nthen\n(\n() =>\n {\n      \nconsole\n.\nlog\n(\n'Unity场景加载完成'\n);\n    }).\ncatch\n(\n(\nerr\n) =>\n {\n      \nconsole\n.\nerror\n(\n'加载失败：'\n + \nJSON\n.\nstringify\n(err));\n    });\n  }\n}// EntryAbility.ets（OpenHarmony轻量系统）import\n \nUIAbility\n \nfrom\n \n'@ohos.app.ability.UIAbility'\n;import\n \nWindow\n \nfrom\n \n'@ohos.window'\n; export\n \ndefault\n \nclass\n \nEntryAbility\n \nextends\n \nUIAbility\n {  \nonCreate\n(\nwant, launchParam\n) {    \nconsole\n.\nlog\n(\n'EntryAbility onCreate: 启动Unity游戏'\n);    \n// 加载Unity渲染的View    \nthis\n.\ncontext\n.\nsetUIContent\n(\nthis\n, \n'pages/UnityScene'\n, \nnull\n);  }   \nonDestroy\n(\n) {    \nconsole\n.\nlog\n(\n'EntryAbility onDestroy: 关闭Unity'\n);  }   \nonWindowStageCreate\n(\nwindowStage: Window.WindowStage\n) {    \n// 加载Unity生成的HAP包（或动态库）    windowStage.\nloadAbility\n(\nnew\n \nIntent\n.\nOperationBuilder\n()      .\nwithAction\n(\nIntent\n.\nACTION_MAIN\n)      .\nwithCategory\n(\nIntent\n.\nCATEGORY_LAUNCHER\n)      .\nbuild\n()).\nthen\n(\n() =>\n {      \nconsole\n.\nlog\n(\n'Unity场景加载完成'\n);    }).\ncatch\n(\n(\nerr\n) =>\n {      \nconsole\n.\nerror\n(\n'加载失败：'\n + \nJSON\n.\nstringify\n(err));    });  }}\n```"
      },
```

这一大段这么看咱们也不知道格式对不对我就直接利用三方插件进行一下渲染测试。

```bash
ohpm i @lidary/markdown
```

![4](OpenSourceSummer2025/4.png)

```ts
import { MarkdownV2 } from '@lidary/markdown';
@Entry
@ComponentV2
struct Index {
  @Local message: string = "```typescript\n// EntryAbility.ets（OpenHarmony轻量系统）\nimport\n \nUIAbility\n \nfrom\n \n'@ohos.app.ability.UIAbility'\n;\nimport\n \nWindow\n \nfrom\n \n'@ohos.window'\n;\n \nexport\n \ndefault\n \nclass\n \nEntryAbility\n \nextends\n \nUIAbility\n {\n  \nonCreate\n(\nwant, launchParam\n) {\n    \nconsole\n.\nlog\n(\n'EntryAbility onCreate: 启动Unity游戏'\n);\n    \n// 加载Unity渲染的View\n    \nthis\n.\ncontext\n.\nsetUIContent\n(\nthis\n, \n'pages/UnityScene'\n, \nnull\n);\n  }\n \n  \nonDestroy\n(\n) {\n    \nconsole\n.\nlog\n(\n'EntryAbility onDestroy: 关闭Unity'\n);\n  }\n \n  \nonWindowStageCreate\n(\nwindowStage: Window.WindowStage\n) {\n    \n// 加载Unity生成的HAP包（或动态库）\n    windowStage.\nloadAbility\n(\nnew\n \nIntent\n.\nOperationBuilder\n()\n      .\nwithAction\n(\nIntent\n.\nACTION_MAIN\n)\n      .\nwithCategory\n(\nIntent\n.\nCATEGORY_LAUNCHER\n)\n      .\nbuild\n()).\nthen\n(\n() =>\n {\n      \nconsole\n.\nlog\n(\n'Unity场景加载完成'\n);\n    }).\ncatch\n(\n(\nerr\n) =>\n {\n      \nconsole\n.\nerror\n(\n'加载失败：'\n + \nJSON\n.\nstringify\n(err));\n    });\n  }\n}// EntryAbility.ets（OpenHarmony轻量系统）import\n \nUIAbility\n \nfrom\n \n'@ohos.app.ability.UIAbility'\n;import\n \nWindow\n \nfrom\n \n'@ohos.window'\n; export\n \ndefault\n \nclass\n \nEntryAbility\n \nextends\n \nUIAbility\n {  \nonCreate\n(\nwant, launchParam\n) {    \nconsole\n.\nlog\n(\n'EntryAbility onCreate: 启动Unity游戏'\n);    \n// 加载Unity渲染的View    \nthis\n.\ncontext\n.\nsetUIContent\n(\nthis\n, \n'pages/UnityScene'\n, \nnull\n);  }   \nonDestroy\n(\n) {    \nconsole\n.\nlog\n(\n'EntryAbility onDestroy: 关闭Unity'\n);  }   \nonWindowStageCreate\n(\nwindowStage: Window.WindowStage\n) {    \n// 加载Unity生成的HAP包（或动态库）    windowStage.\nloadAbility\n(\nnew\n \nIntent\n.\nOperationBuilder\n()      .\nwithAction\n(\nIntent\n.\nACTION_MAIN\n)      .\nwithCategory\n(\nIntent\n.\nCATEGORY_LAUNCHER\n)      .\nbuild\n()).\nthen\n(\n() =>\n {      \nconsole\n.\nlog\n(\n'Unity场景加载完成'\n);    }).\ncatch\n(\n(\nerr\n) =>\n {      \nconsole\n.\nerror\n(\n'加载失败：'\n + \nJSON\n.\nstringify\n(err));    });  }}\n```";

  build() {
    Scroll(){
      MarkdownV2({
        content:this.message
      })
    }
    .height('100%')
    .width('100%')
  }
}
```

让我们来进行一下渲染测试。

![5](OpenSourceSummer2025/5.png)

果然，这些换行符都是异常的换行符，我们还是得重新进行代码逻辑的编写。

当前对于换行的处理我的想法是直接按照对象进行分段就可以，这样是当前代码的逻辑，但行内代码块注定是要单独开一个对象进行存储的这样一来我们的换行逻辑就不成立了，虽然我们可以将一行的内容全部存储到一个对象数组，将文字和行内代码，之要是同一行的就都存进一个对象数组中，这样就可以保证换行的准确性了。

当然这个方案固然可以解决问题，但我们还应当考虑数据的复杂度，过于复杂的数据结构是否有存在的必要，{% label “如无必要，勿增实体” red %}，这个彩色是外挂标签，但这也可以看做是换了个颜色的行内代码块，这本质上没什么区别，二者外观以及功能性都是相同的，这就够了。我们要明白我们的目标是什么，是让用户能看清楚，能看懂。所以我们其实可以先去找到原文章的效果去看一看行内代码的效果是不是那么重要。

![6](OpenSourceSummer2025/6.png)

这一段，有一说一，其实我在仔细看代码之前从来没有意识到过这是一个经过渲染的行内代码块，仅仅是将其当做了字体不一致的文本而已。虽然仔细看是有一圈淡淡的灰色，但对于浏览文本内容来讲并无任何区别。所以我们暂时不考虑行内代码的渲染，而是先考虑如何渲染文本。

我选择先忽略掉`<code>`标签，直接通过上下级关系来去将`<code>`标签的文字内容与前后文串联起来即可。

```py
    def crawl_article_detail(self, driver, url):
        """爬取CSDN博文详情页，提取正文内容、作者、时间等"""
        result = {
            "date": None,
            "author": {},
            "content": []
        }
        try:
            driver.get(url)
            time.sleep(self.delay + random.random())
            soup = BeautifulSoup(driver.page_source, "html.parser")
            # 正文内容
            content_blocks = []
            content_container = soup.find(id="content_views")
            if content_container:
                def append_text(text):
                    if not text:
                        return
                    if content_blocks and content_blocks[-1]["type"] == "text":
                        content_blocks[-1]["value"] += text
                    else:
                        content_blocks.append({"type": "text", "value": text})

                # 块级元素，每个生成一行
                for elem in content_container.find_all(["p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "div"], recursive=True):
                    # 跳过空div
                    if elem.name == "div" and not elem.get_text(strip=True):
                        continue
                    # 处理图片
                    imgs = elem.find_all("img")
                    for img in imgs:
                        img_src = img.get("src")
                        if img_src:
                            content_blocks.append({"type": "image", "value": img_src})
                    # 处理文本（包括code/strong等标签内容）
                    text = elem.get_text(separator="", strip=True)
                    if text:
                        content_blocks.append({"type": "text", "value": text})
                # 处理pre代码块
                for pre in content_container.find_all("pre", recursive=True):
                    code_lines = []
                    for code_div in pre.select("div.hljs-ln-code, code"):
                        code_line = code_div.get_text("\n", strip=False)
                        code_lines.append(code_line)
                    if not code_lines:
                        code_lines = [pre.get_text("\n", strip=False)]
                    code_text = "".join(code_lines)
                    lang = ""
                    code_tag = pre.find("code")
                    if code_tag and code_tag.has_attr("class"):
                        for c in code_tag["class"]:
                            if c.startswith("language-"):
                                lang = c.replace("language-", "")
                                break
                    md_code = f"```{lang}\n{code_text}\n```"
                    content_blocks.append({"type": "code", "value": md_code})
            result["content"] = content_blocks
            # 作者信息
            author_box = soup.select_one("a.profile-href")
            if author_box:
                author_name = author_box.select_one("span.profile-name")
                author_img = author_box.select_one("img.profile-img")
                result["author"] = {
                    "name": author_name.get_text(strip=True) if author_name else None,
                    "avatar": author_img.get("src") if author_img else None,
                    "homepage": author_box.get("href")
                }
            # 发布时间
            # 常见位置：meta、时间标签、正文上方
            date_str = None
            meta_time = soup.find("meta", {"itemprop": "datePublished"})
            if meta_time and meta_time.get("content"):
                date_str = meta_time["content"]
            if not date_str:
                # 备选方案：查找常见时间标签
                time_tag = soup.find("span", class_="time") or soup.find("span", class_="publish-time")
                if time_tag:
                    date_str = time_tag.get_text(strip=True)
            result["date"] = date_str
        except Exception as e:
            print(f"详情页解析失败: {url}, 错误: {e}")
        return result
```

再次进行测试。

![7](OpenSourceSummer2025/7.png)

可以看到，我们的行内代码被成功的忽视并拼接到了前后的文本中，而不是被单独提取出来。

但与此同时新的问题又浮现了出来。我们获取的数据中有重复的内容，这很可能是扫描了父级组件之后，又扫描了子组件，导致重复。我们需要在扫描子组件之前，先检查是否已经扫描过该组件，如果是，则跳过。

```py
processed_elements = set()

def is_child_of_processed(elem):
    """检查元素是否是已处理元素的子元素"""
    for parent in elem.parents:
        if parent in processed_elements:
            return True
    return False
```

我们新增一个集合用于存储已经存储过得元素，在获取组件文本内容之前我们要先去验证是否为已经处理过的元素的子组件，这样一来我们就可以避免重复扫描导致的重复内容。

在代码全部修改完成后我们从新测试。

```py
def crawl_article_detail(self, driver, url):
    """爬取CSDN博文详情页，提取正文内容、作者、时间等"""
    result = {
        "date": None,
        "author": {},
        "content": []
    }
    try:
        driver.get(url)
        time.sleep(self.delay + random.random())
        soup = BeautifulSoup(driver.page_source, "html.parser")
        # 正文内容
        content_blocks = []
        content_container = soup.find(id="content_views")
        if content_container:
            processed_elements = set()
            
            def is_child_of_processed(elem):
                """检查元素是否是已处理元素的子元素"""
                for parent in elem.parents:
                    if parent in processed_elements:
                        return True
                return Fals
            # 块级元素，每个生成一行，避免重复处理父子元素
            for elem in content_container.find_all(["p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "div"], recursive=True):
                # 跳过空div
                if elem.name == "div" and not elem.get_text(strip=True):
                    continue
                # 跳过已处理元素的子元素
                if is_child_of_processed(elem):
                    continue
                # 处理图片
                imgs = elem.find_all("img")
                for img in imgs:
                    img_src = img.get("src")
                    if img_src:
                        content_blocks.append({"type": "image", "value": img_src})
                # 处理文本（包括code/strong等标签内容）
                text = elem.get_text(separator="", strip=True)
                if text:
                    content_blocks.append({"type": "text", "value": text})
                    processed_elements.add(elem)
            # 处理pre代码块
            for pre in content_container.find_all("pre", recursive=True):
                # 跳过已被文本处理过的pre
                if pre in processed_elements:
                    continue
                code_lines = []
                for code_div in pre.select("div.hljs-ln-code, code"):
                    code_line = code_div.get_text("\n", strip=False)
                    code_lines.append(code_line)
                if not code_lines:
                    code_lines = [pre.get_text("\n", strip=False)]
                code_text = "".join(code_lines)
                lang = ""
                code_tag = pre.find("code")
                if code_tag and code_tag.has_attr("class"):
                    for c in code_tag["class"]:
                        if c.startswith("language-"):
                            lang = c.replace("language-", "")
                            break
                md_code = f"```{lang}\n{code_text}\n```"
                content_blocks.append({"type": "code", "value": md_code})
        result["content"] = content_blocks
        # 作者信息
        author_box = soup.select_one("a.profile-href")
        if author_box:
            author_name = author_box.select_one("span.profile-name")
            author_img = author_box.select_one("img.profile-img")
            result["author"] = {
                "name": author_name.get_text(strip=True) if author_name else None,
                "avatar": author_img.get("src") if author_img else None,
                "homepage": author_box.get("href")
            }
        # 发布时间
        # 常见位置：meta、时间标签、正文上方
        date_str = None
        meta_time = soup.find("meta", {"itemprop": "datePublished"})
        if meta_time and meta_time.get("content"):
            date_str = meta_time["content"]
        if not date_str:
            # 备选方案：查找常见时间标签
            time_tag = soup.find("span", class_="time") or soup.find("span", class_="publish-time")
            if time_tag:
                date_str = time_tag.get_text(strip=True)
        result["date"] = date_str
    except Exception as e:
        print(f"详情页解析失败: {url}, 错误: {e}")
    return result
```

![8](OpenSourceSummer2025/8.png)

顺利的去除的重复，那么对于CSDN内容的爬取就算成功了，接下来就该去解决搜索关键词有限导致爬取目标内容不足的问题了。

#### CSDN资源数量问题

由于当前整体的爬虫进度就很慢了，所以我决定使用一个新的线程去获取数据，随后再将两个线程的数据按时间顺讯进行合并。

---

**多线程执行逻辑分析**

现在让我详细分析我们的多线程爬虫实现：

1. 线程配置与URL设计

```python
urls_and_keywords = [
    {
        "url": "https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=openHarmony&t=&u=&s=new",
        "keyword": "openHarmony"
    },
    {
        "url": "https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99&t=all&u=&s=new&urw=",
        "keyword": "开源鸿蒙"
    }
]
```

我们设计了两个搜索关键词：
- **openHarmony**：英文关键词，覆盖技术文档和开发相关内容
- **开源鸿蒙**：中文关键词，覆盖更多中文社区讨论和应用案例

这样的设计可以最大化内容覆盖范围，避免单一关键词导致的内容不足问题。

2. 线程工作函数设计

```python
    def crawl_worker(search_config, result_list):
        """线程工作函数"""
        crawler = CSDNOpenHarmonyCrawler()
        articles = crawler.crawl(search_config["url"], search_config["keyword"])
        result_list.append(articles)
```

每个线程独立创建爬虫实例，避免共享状态冲突。通过 `result_list` 收集各线程结果。

3. 时间排序与合并逻辑

关键在于我们的日期解析函数，使用正则表达式处理多种日期格式：

```python
    @staticmethod
    def merge_and_sort_articles(articles_list):
        """合并多个文章列表并按日期排序"""
        merged_articles = []
        for articles in articles_list:
            merged_articles.extend(articles)
        
        # 为每篇文章添加排序用的日期对象
        for article in merged_articles:
            article['_sort_date'] = CSDNOpenHarmonyCrawler.extract_date_from_string(article.get('date'))
        
        # 按日期排序（最新的在前）
        merged_articles.sort(key=lambda x: x['_sort_date'] or datetime.min, reverse=True)
        
        # 移除临时排序字段
        for article in merged_articles:
            article.pop('_sort_date', None)
        
        return merged_articles
```

这个函数能够处理CSDN可能出现的各种日期格式，确保排序的准确性。

4. 完整的多线程执行流程

```python
def crawl_with_threading():
    """使用多线程爬取两个不同关键词的内容"""
    # 定义两个搜索URL
    urls_and_keywords = [
        {
            "url": "https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=openHarmony&t=&u=&s=new",
            "keyword": "openHarmony"
        },
        {
            "url": "https://so.csdn.net/so/search?spm=1000.2115.3001.4501&q=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99&t=all&u=&s=new&urw=",
            "keyword": "开源鸿蒙"
        }
    ]
    
    # 存储每个线程的结果
    results = []
    threads = []
    
    def crawl_worker(search_config, result_list):
        """线程工作函数"""
        crawler = CSDNOpenHarmonyCrawler()
        articles = crawler.crawl(search_config["url"], search_config["keyword"])
        result_list.append(articles)
    
    # 创建并启动线程
    for config in urls_and_keywords:
        thread_result = []
        thread = threading.Thread(target=crawl_worker, args=(config, thread_result))
        threads.append(thread)
        results.append(thread_result)
        thread.start()
    
    # 等待所有线程完成
    for thread in threads:
        thread.join()
    
    # 收集所有结果
    all_articles = []
    for thread_result in results:
        if thread_result:  # thread_result是列表，包含一个articles列表
            all_articles.extend(thread_result[0])
    
    print(f"\n=== 所有线程完成，开始合并结果 ===")
    print(f"总共获取到 {len(all_articles)} 篇文章")
    
    # 合并并按时间排序
    sorted_articles = CSDNOpenHarmonyCrawler.merge_and_sort_articles([all_articles])
    
    print(f"按时间排序完成，共 {len(sorted_articles)} 篇文章")
    
    return sorted_articles
```

ok，开始测试。

![9](OpenSourceSummer2025/9.png)

可以看到，我们的两个线程在同时获取最新的数据。不过Python的多线程其实属于是"假多线程"。

- 全局解释器锁（GIL）的限制

Python中存在一个叫做**全局解释器锁（Global Interpreter Lock，GIL）**的机制，这是CPython解释器的一个特性。GIL确保在任何时刻只有一个线程在执行Python字节码，这意味着：

1. **CPU密集型任务**：多线程并不能真正并行执行，反而可能因为线程切换的开销而变得更慢
2. **真正的并发**：只有在遇到I/O操作（如网络请求、文件读写）时，GIL才会被释放，允许其他线程执行

- 为什么我们的爬虫仍然有效？

虽然Python有GIL限制，但我们的CSDN爬虫仍然能从多线程中受益，原因如下：

```python
# 在我们的爬虫中，大部分时间都花在I/O操作上：
driver.get(search_url)              # 网络请求 - 释放GIL
time.sleep(self.delay + random.random())  # 睡眠等待 - 释放GIL
soup = BeautifulSoup(driver.page_source, "html.parser")  # CPU操作 - 持有GIL
driver.get(article_url)             # 网络请求 - 释放GIL
```

**关键点**：当线程A在等待网页加载时（I/O阻塞），GIL被释放，线程B可以开始执行自己的网络请求。这样两个爬虫线程实际上是在**交替执行**，而不是真正的**并行执行**。

- GIL的工作机制

```python
# 伪代码展示GIL的工作方式
def thread_execution_with_gil():
    # 线程A获得GIL
    thread_a_acquires_gil()
    
    # 线程A执行CPU操作
    parse_html()  # 持有GIL
    
    # 线程A遇到I/O操作
    make_network_request()  # 释放GIL，进入等待状态
    
    # 此时线程B可以获得GIL
    thread_b_acquires_gil()
    
    # 线程B执行自己的操作
    thread_b_parse_html()  # 持有GIL
    thread_b_make_request()  # 释放GIL
    
    # 当线程A的网络请求完成时，重新竞争GIL
    thread_a_network_response_received()
    # ... 循环往复
```

- 真正的并行替代方案

如果需要真正的并行处理，Python提供了几种替代方案：

{% tabs test4 %}
<!-- tab 多进程（multiprocessing） -->

```python
from multiprocessing import Process, Queue

def crawl_with_multiprocessing():
    """使用多进程实现真正的并行爬取"""
    queue = Queue()
    
    def crawl_process(search_config, result_queue):
        crawler = CSDNOpenHarmonyCrawler()
        articles = crawler.crawl(search_config["url"], search_config["keyword"])
        result_queue.put(articles)
    
    processes = []
    for config in urls_and_keywords:
        p = Process(target=crawl_process, args=(config, queue))
        processes.append(p)
        p.start()
    
    # 等待所有进程完成
    results = []
    for p in processes:
        results.append(queue.get())
        p.join()
    
    return results
```
<!-- endtab -->

<!-- tab 异步编程（asyncio） -->

```python
import asyncio
import aiohttp

async def async_crawl():
    """使用异步编程实现高并发爬取"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for config in urls_and_keywords:
            task = crawl_async(session, config)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return results
```

<!-- endtab -->
{% endtabs %}

- 为什么我们选择多线程？

尽管存在GIL限制，我们仍然选择多线程的原因：

1. **简单性**：实现简单，无需额外的进程间通信
2. **资源效率**：比多进程消耗更少的系统资源
3. **I/O密集特性**：我们的爬虫主要受网络I/O限制，多线程已经足够
4. **Selenium兼容性**：Selenium WebDriver在多线程环境下工作良好

Python的多线程确实受到GIL的限制，无法实现真正的CPU并行。但对于我们这种I/O密集型的网络爬虫任务，多线程仍然能够带来显著的性能提升。GIL在遇到I/O操作时会释放，允许其他线程执行，这正是我们的爬虫能够受益的原因。

如果未来需要处理更加CPU密集的任务（如大量的数据处理、图像处理等），那么考虑使用多进程或异步编程会是更好的选择。但对于当前的需求，多线程已经是一个既简单又有效的解决方案。

okay，回归正题，写这段的时候我们的爬虫也完成了工作让我们来看看结果。

额上面的看起来都没什么问题，但是下面的几条看起来就有点怪了。

```js
  {
    "title": "沸腾了！华为开源鸿蒙OS2.0！安卓会被淘汰吗？",
    "url": "https://blog.csdn.net/weixin_39016100/article/details/108525946?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522cb9ab9f418f13100393baa0c8eb1aaa0%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=cb9ab9f418f13100393baa0c8eb1aaa0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~time_text~default-29-108525946-null-null.142^v102^pc_search_result_base4&utm_term=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "点击上方“Github中文社区”，关注看遍Github好玩的项目大家好，我是hub哥今天鸿蒙OS开源代码公开了！！！没错！今天在华为开发者大会上，也是从9月10日起，HarmonyOS开...",
    "search_keyword": "开源鸿蒙",
    "date": "于 2020-09-10 20:15:41 发布",
    "author": {
      "name": "Github中文社区",
      "avatar": "https://profile-avatar.csdnimg.cn/5af19c4ff58e436d83205022d2ad1234_weixin_39016100.jpg!1",
      "homepage": "https://blog.csdn.net/weixin_39016100"
    },
    "content": [
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/370744e1190c99c8de088f5b7a706e3c.png"
      },
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/fe866ad2d04f269afd112092719e594f.png"
      },
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/609f5a565db9efa9d929c79438025217.png"
      },
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/fb9beec5cebedf3597eacb9b1a5d0a08.png"
      },
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/bc34bc591bd1668a15424f268781cca7.png"
      },
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/6b2793d9781a11e15943eb9bb303119b.png"
      },
      {
        "type": "image",
        "value": "https://i-blog.csdnimg.cn/blog_migrate/6e72c3f532a58018ff9163342840315f.gif"
      },
      {
        "type": "image",
        "value": "https://csdnimg.cn/release/blogv2/dist/pc/img/runCode/icon-arrowwhite.png"
      },
      {
        "type": "text",
        "value": "点击上方“Github中文社区”，关注看遍Github好玩的项目大家好，我是hub哥今天鸿蒙OS开源代码公开了！！！没错！今天在华为开发者大会上，也是从9月10日起，HarmonyOS开源代码公开了！项目仓库已经可以看了, 目前关注2.5k。鸿蒙OSOpenHarmony是开放原子开源基金会（OpenAtom Foundation）旗下开源项目，定位是一款面向全场景的开源分布式操作系统。其实在2019年 8月9日，华为鸿蒙1.0 ，OS揭开了面纱。2019年的在华为开发者大会上, 华为首款搭载鸿蒙OS终端正式亮相！荣耀智慧屏-首款搭载华为鸿蒙系统的荣耀智慧屏 系列8月10日震撼发布今天的大会上，余承东宣布，华为鸿蒙系统已经升级至2.0版本，即HarmonyOS 2.0。此次HarmonyOS的升级，不仅仅带来了分布式能力的全面提升，还为开发者提供了完整的分布式设备与应用开发生态，全面赋能全场景智慧生态。HarmonyOS主要包含如下系统:余承东讲话得到几点信息：从今天起将面向程序员提供大屏、手表、车机的鸿蒙OS2.0的beta版本今年12月份将提供鸿蒙2.0的beta版本2021年4月将面向内存128MB-4GB终端设备开源2021年10月以后将面向4GB以上所有设备开源明年起，华为智能手机将升级支持鸿蒙2.0一些总结在鸿蒙 OS 上，他们可以用一套代码开发出兼容多终端的软件，鸿蒙 OS 能做到自动适配。对开发者来说，所有设备都同一个系统，交互更好、学习成本更低，体验更加统一。如果明年4月 搭载鸿蒙OS的手机发布，并推动手机应用开发者加入，那么配合新的开发语言，又将提供一大批岗位，其实利好开发者！大厂需要华为生态渠道，客户端岗位需求会激增。和安卓系统形成竞对的局面，从而促使android提高体验和优化性能，避免以后收费。传送门鸿蒙官网：https://www.harmonyos.com开源项目官网：https://www.openatom.org/openharmony开源代码仓库：https://openharmony.gitee.com华为开发者联盟论坛：https://developer.huawei.com/consumer投票环节最后大家来投个票吧OK！到这就是这期分享如果觉得文章有意思，请点赞在看，分享。历史原创★ 程序员大佬女装登顶GitHub 热榜，太变态了！还以为逛 PornHub呢！★18禁警告！这个工具教你涂鸦画丁丁，数据还开源了★ 强！这个GitHub官方终端命令行工具！星标10K！真是让人相见恨晚啊★ 模糊妹子图变超清！这个神器能让模糊图秒变4K高清，瞬间觉得PS也没那么香了文稿征集令来啦！点个在看呗！AI生成项目php运行"
      },
      {
        "type": "code",
        "value": "```php\nOK！到这就是这期分享\n \n \n如果觉得文章有意思，请点赞在看，分享。\n \n \n \n历史原创\n \n★ 程序员大佬女装登顶GitHub 热榜，太变态了！还以为逛 PornHub呢！★ \n18\n 禁警告！这个工具教你涂鸦画丁丁，数据还开源了★ 强！这个GitHub官方终端命令行工具！星标\n10\nK！真是让人相见恨晚啊★ 模糊妹子图变超清！这个神器能让模糊图秒变\n4\nK高清，瞬间觉得PS也没那么香了\n \n \n \n文稿征集令来啦！ \n \n \n点个在看呗！OK！到这就是这期分享  如果觉得文章有意思，请点赞在看，分享。   历史原创 ★ 程序员大佬女装登顶GitHub 热榜，太变态了！还以为逛 PornHub呢！★ \n18\n 禁警告！这个工具教你涂鸦画丁丁，数据还开源了★ 强！这个GitHub官方终端命令行工具！星标\n10\nK！真是让人相见恨晚啊★ 模糊妹子图变超清！这个神器能让模糊图秒变\n4\nK高清，瞬间觉得PS也没那么香了   文稿征集令来啦！   点个在看呗！\n```"
      }
    ]
  },
  {
    "title": "1.OpenHarmony",
    "url": "http://ask.csdn.net/new?word=openHarmony",
    "summary": "OpenHarmonyOpenHarmony是开放原子开源基金会（OpenAtom Foundation）旗下开源项目，定位是一款面向全场景的开源分布式操作系统，第一个版本支持128K-128M设备上运行。 https://openharmony.gitee.comOpenHarmony...",
    "search_keyword": "openHarmony",
    "date": null,
    "author": {},
    "content": []
  },
  {
    "title": "智启未来 | 拓维信息携旗下开鸿智谷受邀参加开源鸿蒙开发者大会2025",
    "url": "https://blog.csdn.net/u011945431/article/details/148261304?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522cb9ab9f418f13100393baa0c8eb1aaa0%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=cb9ab9f418f13100393baa0c8eb1aaa0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~time_text~default-5-148261304-null-null.142^v102^pc_search_result_base4&utm_term=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "大会期间，拓维信息旗下开鸿智谷基于开源鸿蒙研发的在鸿OS、在鸿控制器、在鸿实验箱、在鸿行业PC、在鸿平板和在鸿智慧园区场景等软硬件创新产品及数智化解决方案悉数亮相，吸引了大量开发者和生态客户关注。...",
    "search_keyword": "开源鸿蒙",
    "date": null,
    "author": {},
    "content": []
  },
  {
    "title": "开源鸿蒙开发者大会2025交流区亮点纷呈，社区与生态伙伴共绘智能图景",
    "url": "https://blog.csdn.net/u011945431/article/details/148260001?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522cb9ab9f418f13100393baa0c8eb1aaa0%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=cb9ab9f418f13100393baa0c8eb1aaa0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~time_text~default-6-148260001-null-null.142^v102^pc_search_result_base4&utm_term=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "值得一提的是，本次大会的专题交流区首次展出了有关开源鸿蒙SIG 地图、开源鸿蒙Web SIG及W3C标准、统一互联PMC（筹）地图等丰富的信息，以及第二届中国研究生操作系统开源创新大赛开源鸿蒙赛道、开源鸿蒙人才生态...",
    "search_keyword": "开源鸿蒙",
    "date": null,
    "author": {},
    "content": []
  },
  {
    "title": "深开鸿联合中软国际、粤科金融集团发布国内首个开源鸿蒙创业投资基金",
    "url": "https://blog.csdn.net/luluningmeng1/article/details/142638398?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522cb9ab9f418f13100393baa0c8eb1aaa0%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=cb9ab9f418f13100393baa0c8eb1aaa0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~time_text~default-12-142638398-null-null.142^v102^pc_search_result_base4&utm_term=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "该基金不仅将为开源鸿蒙初创企业提供早期资本支持，还将通过与地方政府、企业、高校的合作，推动更多地区的创新创业项目落地，助力区域人才和产业生态的繁荣。韦家燊表示，未来深开鸿将在全国范围内推广“服务+资本...",
    "search_keyword": "开源鸿蒙",
    "date": null,
    "author": {},
    "content": []
  },
  {
    "title": "深开鸿联合深天使发布国内首个开源鸿蒙产业加速营",
    "url": "https://blog.csdn.net/luluningmeng1/article/details/142638371?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522cb9ab9f418f13100393baa0c8eb1aaa0%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=cb9ab9f418f13100393baa0c8eb1aaa0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~time_text~default-13-142638371-null-null.142^v102^pc_search_result_base4&utm_term=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "深天使开源鸿蒙产业加速营携手深开鸿及其生态合作伙伴，以“K计划”为抓手，在开源鸿蒙初创项目和企业中挖掘重点培育对象，进行深度孵化与激发潜能，助力这些团队和企业的快速成长。国内首个开源鸿蒙产业加速营发布...",
    "search_keyword": "开源鸿蒙",
    "date": null,
    "author": {},
    "content": []
  },
  {
    "title": "深开鸿与深信息联合成立开源鸿蒙高等工程师学院",
    "url": "https://blog.csdn.net/u011945431/article/details/130057959?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522cb9ab9f418f13100393baa0c8eb1aaa0%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=cb9ab9f418f13100393baa0c8eb1aaa0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~time_text~default-25-130057959-null-null.142^v102^pc_search_result_base4&utm_term=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "4月8日，在深圳信息职业技术学院（简称：深信息）与华为联合举办的“培养复合型数字人才，释放数字生产力”数字人才培养高峰论坛上，深开鸿与深信息联合成立“开源鸿蒙高等工程师学院”，旨在建设开源鸿蒙人才培养...",
    "search_keyword": "开源鸿蒙",
    "date": null,
    "author": {},
    "content": []
  },
  {
    "title": "华为开源操作系统鸿蒙开源地址链接",
    "url": "http://ask.csdn.net/new?word=%E5%BC%80%E6%BA%90%E9%B8%BF%E8%92%99",
    "summary": "华为开源操作系统鸿蒙开源地址链接:  华为开发资源:https://developer.huaweicloud.com/  华为终端开发者论坛:https://developer.huawei.com/consumer/cn/forumupgrading  华为系统liteOS老地址：...",
    "search_keyword": "开源鸿蒙",
    "date": null,
    "author": {},
    "content": []
  }
```

首先是"沸腾了！华为开源鸿蒙OS2.0！安卓会被淘汰吗？"这篇文章的文章内容顺序乱了，原文中的文本是穿插在图中间的而且比较靠前，爬取后就到后面了，暂时不清楚是什么原因。

![10](OpenSourceSummer2025/10.png)

还有就是后面这几篇都404了，可能是原作者删除了文章吧，明天得再加个404的检测机制。今天先这样了，累了累了。

---
