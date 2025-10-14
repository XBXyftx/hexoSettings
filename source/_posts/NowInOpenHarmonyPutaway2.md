---
title: NowInOpenHarmony上架笔记之再起新征程
date: 2025-10-12 14:17:05
tags:
  - 开源之夏
  - 鸿蒙
  - 项目
  - 技术向
  - NowInOpenHarmony
cover:  /imgs/ArticleTopImgs/NowInOpenHarmonyPutawayTopImg.jpg
description: NowInOpenHarmony上架笔记2，记录OpenHarmony官网重构后的新征程
typewriter: 🚀 从开源之夏到应用上架的完整征程！本文记录了NowInOpenHarmony项目从开发完成到正式上架的全流程实践。深入探索了服务器部署的技术细节，包括Docker容器化、宝塔面板操作、环境配置等核心技术。特别详细地记录了部署过程中遇到的tar格式技术难题及其解决方案，通过实际踩坑经历深入理解了很多技术细节的本质区别。从GitHub分支管理到Ubuntu服务器配置，从环境搭建到镜像构建，每一个步骤都有详细的截图和说明。这不仅是一次技术实践的记录，更是从学生开发者向产品开发者转变的重要里程碑，见证了第一个正式上架应用的诞生过程。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

时隔一个国庆假期，我在抛去一切技术焦虑尽情的享受假期之后也是回来重振旗鼓，准备开始开展NowInOpenHarmony的后端重构之旅了。这个项目我不能放弃，这是当下我距离正式上架最近的一个项目，而且我也已经成果实现了针对于后端的docker容器化部署，同时有了之前踩坑的经历我会用更加直接切中要害的方式去进行调整。

## 新版OpenHarmony官网的内容变化

重构的第一件事肯定是要去审视一下我们新的数据源————新版NowInOpenHarmony官网，看看它和旧版相比有哪些变化，以及这些变化对我们项目的影响。记得在国庆前我看到openharmony官网的更新的时候我是有点绝望的因为我是压根没有看到原来那个咨询页面和博文页面依旧存在，只看到了新的首页。所以我先去整体的浏览一遍看看有没有可以作为新版数据源的页面。

![1](NowInOpenHarmonyPutaway2/1.png)

在浏览的时候我看到了导航栏的这个分栏，我瞬间捕捉到了关键词“咨询”和“动态”，我立刻点进去看，不看不知道一看吓一跳，原来这就是原来那个网页！！！

![2](NowInOpenHarmonyPutaway2/2.png)

卧槽原来它并没有被废弃，只是从原来的根域名被新主页给挤压到old前缀的子域名了，太好了，不仅不用去寻找新的数据源，还不用重新针对新的页面去进行重构了。

![3](NowInOpenHarmonyPutaway2/3.png)

## 重构后端

这里当然还是先请出我们的老朋友CC啦。

### 让CC的新对话熟悉现在的后端逻辑

在和AI连续的对话构建一个项目固然是方便毕竟上下文连贯AI的记忆也是很连贯的，但也是会有死钻牛角尖的情况出现，AI也很容易陷入到自己的惯性思维中不能自拔，最后越改越屎所以我一定是要开一个新对话去进行编程的。

对于一个新的对话，熟悉当前的项目结构是很重要的，对于CC来说他是有一个独特的优势在于`/init`指令可以一键让CC对当前的项目有一个最初始的印象，了解项目的架构同时去编写或是更新项目的claude.md文件。

在执行`/init`之后还不够，由于我们所需要的是修改一个爬虫逻辑中的一个细节所以我还是决定让CC进一步的去阅读并理解一下三个爬虫的逻辑以及工作流程，并告诉他我们接下来的工作主要是围绕这三个文件去进行展开的。

```bash
现在请你着重关注关注后端服务中针对于openharmony官网囊咨询页面的爬虫 @services/openharmony_crawler.py 博文页面爬虫 @services/openharmony_blog_crawler.py 还有轮播图爬虫 @services/openharmony_image_crawler.py 我们接下来的工作重点在于针对于这三个爬虫的重构升级，现在请你先仔细阅读并给我理清三个爬虫的逻辑，暂时不要修改任何代码

我已经仔细阅读了三个爬虫的代码，现在为您详细梳理它们的逻辑架构：
1. OpenHarmony官网新闻爬虫 (openharmony_crawler.py)
核心流程
API获取文章列表 → 快速有效性校验 → 逐篇解析内容 → 分批回调写入
关键特性
数据源
API端点: https://www.openharmony.cn/backend/knowledge/secondaryPage/queryBatch?type=3
type=3 表示官方动态类型
两阶段爬取策略 (openharmony_crawler.py:41-127) 阶段1: 高效批量获取文章元信息
每页300条数据（减少API请求次数）
分页遍历直到无数据
URL去重（使用字典）
日期标准化为 YYYY-MM-DD 格式
请求间隔：0.3秒
阶段2: 智能有效性校验 (openharmony_crawler.py:95-127)
快速抽样: 只检查前10个URL
阈值判断: 有效率≥80% → 跳过完整校验
降级策略: 有效率<80% → 完整URL校验
使用 HEAD 请求减少带宽消耗
内容解析 (openharmony_crawler.py:129-167)
多选择器策略：尝试多种容器class/id
支持元素类型：p, h1-h6, div, img, video
文本过滤：长度>10字符
图片处理：data-src > data-original > src
输出格式：{type: "text"|"image"|"video", value: string}
分批处理机制 (openharmony_crawler.py:223-279)
默认batch_size=20篇
累积到批次大小后立即执行回调
处理剩余批次（不足batch_size的部分）
回调失败不影响爬取继续
数据格式化 (openharmony_crawler.py:199-221)
{
    "id": "MD5(url)[:16]",  # 16位哈希ID
    "title": string,
    "date": "YYYY-MM-DD",    # 标准化日期
    "url": string,
    "content": [{type, value}],
    "category": "官方动态",
    "summary": string,
    "source": "OpenHarmony",
    "created_at": ISO8601,
    "updated_at": ISO8601
}
2. OpenHarmony技术博客爬虫 (openharmony_blog_crawler.py)
核心流程
API分页获取 → 提取文章元信息 → 逐篇解析内容 → 分批回调写入 → 数据验证
关键特性
数据源
API端点: 同官网爬虫，但 type=2 表示技术博客
每页200条数据
分页获取 (openharmony_blog_crawler.py:57-115)
获取 totalPage 和 totalNum
循环处理每页数据
请求间隔：0.5秒
响应格式验证：检查 code == 0
元信息提取 (openharmony_blog_crawler.py:117-143)
必需字段验证：title, url
日期格式转换：将 "2024.06.06" → "2024-06-06"
提取 content 字段作为 summary
内容解析增强 (openharmony_blog_crawler.py:168-235)
更多容器选择器（包括 main, article-content）
支持额外元素：pre, code
code块单独处理为 {type: "code", value: string}
文本过滤：长度>10字符
分批处理 (openharmony_blog_crawler.py:258-334)
与官网爬虫完全一致的逻辑
默认batch_size=20
日志前缀：[OpenHarmony博客] 便于区分
数据格式化差异 (openharmony_blog_crawler.py:237-256)
{
    # ... 同官网爬虫
    "category": "技术博客",  # 区别于"官方动态"
    "source": "OpenHarmony技术博客",
}
数据验证 (openharmony_blog_crawler.py:336-367)
检查必需字段：id, title, url, content, source
检查内容非空
检查URL有效性（以http开头）
返回有效文章统计
3. OpenHarmony轮播图爬虫 (openharmony_image_crawler.py)
核心流程
获取手机版页面 → 查找banner-img元素 → 下载图片 → 保存本地
关键特性
数据源
目标页面: https://www.openharmony.cn/mainPlay/
手机版User-Agent模拟iPhone
请求头配置 (openharmony_image_crawler.py:32-43)
'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1...)',
'Sec-Fetch-Dest': 'document',
'Cache-Control': 'max-age=0'
图片查找策略 (openharmony_image_crawler.py:64-103)
CSS选择器：class 包含 "banner-img"
图片URL优先级：data-src > data-original > src
提取元数据：alt, class, id
URL转换：相对路径 → 绝对路径
下载机制 (openharmony_image_crawler.py:105-168)
文件名处理：
优先使用URL中的文件名
无扩展名时从Content-Type推断
已存在文件添加时间戳避免覆盖
下载超时：30秒
结果返回：status, filename, file_path, file_size
错误捕获：返回失败状态和错误信息
完整爬取流程 (openharmony_image_crawler.py:170-217)
获取页面HTML
解析所有banner图片
逐张下载（间隔1秒）
统计成功/失败数量
返回详细结果列表
轻量级方法 (openharmony_image_crawler.py:219-227)
get_banner_image_info(): 只获取图片URL信息，不下载
三个爬虫的共性与差异
共性特征
统一的Session管理: 都使用 requests.Session() 保持连接
User-Agent伪装: 模拟真实浏览器
超时控制: 防止请求挂起
日志记录: 详细的emoji标记日志
错误处理: try-except捕获，不中断整体流程
请求间隔: 避免过于频繁的请求
核心差异
特性	官网新闻	技术博客	轮播图
数据源	API (type=3)	API (type=2)	HTML解析
页面大小	300条/页	200条/页	N/A
有效性校验	✅ 智能抽样	❌ 无	❌ 无
分批回调	✅ 支持	✅ 支持	❌ 不支持
内容类型	text/image/video	text/image/video/code	仅image
本地下载	❌ 仅URL	❌ 仅URL	✅ 下载到本地
数据验证	❌ 无	✅ 完整验证	✅ 下载验证
category	"官方动态"	"技术博客"	N/A
潜在问题点
性能瓶颈
官网/博客爬虫的内容解析是同步的（每篇文章1秒间隔）
没有并发下载机制
轮播图爬虫每次都重新下载，无缓存机制
健壮性问题
官网爬虫的快速校验可能不准确（只检查10个URL）
博客爬虫缺少URL有效性预检
所有爬虫缺少重试机制
图片爬虫依赖特定class名称，易失效
数据一致性
两个新闻爬虫使用相同的ID生成方式（MD5），可能冲突
日期格式化逻辑在两个爬虫中略有不同
content结构验证不完整（批处理回调中有验证，但爬虫本身没有）
可维护性
HTML解析选择器硬编码
三个爬虫缺少统一的基类
配置项（超时、间隔）分散在代码中
建议的重构方向
如果后续要升级这三个爬虫，可以考虑：
统一基类架构: 抽象公共逻辑（Session管理、错误处理、重试机制）
并发优化: 引入异步爬取或线程池
智能缓存: 轮播图增加本地缓存和更新检测
健壮性增强:
统一的重试装饰器
更完善的URL有效性检查
响应式选择器配置
监控指标: 爬取耗时、成功率、数据质量统计
您想先从哪个方向开始重构？
```

### 重构过程

#### 文件重命名

我首先让CC先帮我针对于官网的咨询页爬虫进行一下重命名，因为当初他是第一个开发的就没有很规范的命名，而py这个东西又是解释型语言，不同文件之间调用有基本上是跑起来解释到那里才知道有问题，所以我就直接用CC去进行重构还是更快捷一些。

![4](NowInOpenHarmonyPutaway2/4.png)

嗯，就还挺爽的。

#### old子域名重构

这一块的话我得向CC阐述一下来龙去脉并给他新的API。所以首先我需要先去官网进行一下抓包找到之前用于获取目标网页的那个api接口，我希望它只是将原来的这套网页代码的基地址换成了新的子域名而不是说进行了完整的重构。这样我就只需要更换一下API就好了。

![5](NowInOpenHarmonyPutaway2/5.png)

![6](NowInOpenHarmonyPutaway2/6.png)

```json
// https://old.openharmony.cn/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum=1&pageSize=20
{
  "code": 0,
  "msg": "成功",
  "pageSize": 20,
  "pageNum": 1,
  "totalPage": 21,
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
      "browseCount": 961,
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
      "browseCount": 478,
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
      "browseCount": 233,
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
      "browseCount": 145,
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
      "browseCount": 76,
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
      "browseCount": 121,
      "skip": "0"
    },
    {
      "id": 1526,
      "type": 3,
      "title": "开源鸿蒙项目群新增捐赠人（2024年12月）",
      "source": null,
      "content": "2024年12月，新增以下单位成为开源鸿蒙项目群捐赠人：• 中国南方电网有限责任公司成为A类捐赠人• 宝马诚迈信息技术有限公司成为B类捐赠人",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/OG5vZWwXk5EaM5iomCCXzA",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2025.01.21",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 119,
      "skip": "0"
    },
    {
      "id": 1525,
      "type": 3,
      "title": "开源鸿蒙社区隆重致谢授牌2024年度社区贡献单位和个人",
      "source": null,
      "content": "2024 年，开源鸿蒙社区在各方共建下成绩卓著。截至2024年12月31日，开源鸿蒙社区成员单位已达 63 家，其中2024年新增 28家捐赠单位；累计发布 8 个大版本，2024年发布了OpenHarmony 4.1 Release与 5.0 Release；累计建立 68个 SIG，累计代码行数超1.2亿行。开源鸿蒙社区成功举办OpenHarmony开发者大会2024、第三届OpenHarmony技术大会、Oniro分论坛等多个社区旗舰活动，发布了《OpenHarmony共建地图3.0》并致谢授牌12家“百人代码贡献单位”和8家“应用建设领航单位”，社区代码共建单位超70家。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/ns496Jff0FPMBuwgqnVTpg",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2025.01.16",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 15,
      "skip": "0"
    },
    {
      "id": 1524,
      "type": 3,
      "title": "厚植根基，同启新程！一文回顾 2024 OpenHarmony 社区年度工作会议精彩瞬间",
      "source": null,
      "content": "2025年1月10日-11日，OpenAtom OpenHarmony（开放原子开源鸿蒙，以下简称“OpenHarmony”或“开源鸿蒙”）社区2024年度工作会议于深圳盛大启幕，这场备受瞩目的盛会汇聚了开源鸿蒙社区众多成员单位，共同回顾过去一年OpenHarmony社区在技术研发、生态建设、教育推广等关键领域的卓越成就，并携手展望2025年发展宏图，旨在为OpenHarmony社区的持续繁荣注入新动力，引领开源技术迈向更广阔的发展天地，为构建智能互联的未来奠定坚实基石。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/HFsNyhAxd17Ad4vRDYCAUQ",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2025.01.16",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 16,
      "skip": "0"
    },
    {
      "id": 1523,
      "type": 3,
      "title": "第二届OpenHarmony创新应用挑战赛决赛晋级名单公示",
      "source": null,
      "content": "2024年10月21日，第二届OpenHarmony创新应用挑战赛正式启动，双赛题总奖金高达50万元，吸引了全国各地418支队伍参赛。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/JxWvIBGmTbUobjAaSQ3ViQ",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2025.01.13",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 9,
      "skip": "0"
    },
    {
      "id": 1520,
      "type": 3,
      "title": "一元复始 万象更新|开源鸿蒙社区祝广大开发者元旦快乐！",
      "source": null,
      "content": "祝广大开发者元旦快乐！",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/5DjNglcGividIsKrEeVrFA",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2025.01.01",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 146,
      "skip": null
    },
    {
      "id": 1519,
      "type": 3,
      "title": "OpenHarmony程序分析框架论文入选第50届国际软件工程大会ICSE2025",
      "source": null,
      "content": "近日，ICSE 2025软件工程实践Track放榜，面向OpenAtom OpenHarmony（以下简称“OpenHarmony”）的ArkTS程序分析基础框架--方舟程序分析器（论文题目为《ArkAnalyzer：The Static Analysis Framework for OpenHarmony》）被接收。这是OpenHarmony相关研究首次在ICSE发表论文，这篇文章的接收意味着OpenHarmony正式被国际软件工程研究人员认可，为学术界研究OpenHarmony提供了参考。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/RbTdqoOWJ6zv-bkFjZDb6g",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.31",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 54,
      "skip": null
    },
    {
      "id": 1518,
      "type": 3,
      "title": "OpenHarmony开发者激励计划 | 2024年度精彩回顾",
      "source": null,
      "content": "2024年度精彩回顾",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/U1S4BXOFVMjFdKUdJ5lzgw",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.31",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 149,
      "skip": null
    },
    {
      "id": 1517,
      "type": 3,
      "title": "开源鸿蒙荣获开放原子“2024年度操作系统领域国内活跃开源项目”",
      "source": null,
      "content": "12月20日，2024开放原子开发者大会暨首届开源技术学术大会在武汉圆满召开。在大会开幕式“2024年度国内活跃开源项目&开发者致谢仪式”上，开放原子开源鸿蒙（OpenAtom OpenHarmony，简称“开源鸿蒙”或“OpenHarmony”）荣获“2024年度操作系统领域国内活跃开源项目”。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/mdfnnjNLiUrvnEk6PcVBTw",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.27",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 16,
      "skip": null
    },
    {
      "id": 1516,
      "type": 3,
      "title": "OpenHarmony项目群10-11月新增捐赠人",
      "source": null,
      "content": "2024年10月，新增以下单位成为OpenHarmony项目群捐赠人：\n博赛数字科技集团有限公司成为C类捐赠人\n元心信息科技集团有限公司成为C类捐赠人\n上海健麾信息技术股份有限公司成为B类捐赠人\n2024年11月，新增以下单位成为OpenHarmony项目群捐赠人：\n武汉风行在线技术有限公司成为C类捐赠人\n诚迈科技（南京）股份有限公司成为A类捐赠人",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/8BD9TnuVTJaM4zn_58Te5A",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.25",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 19,
      "skip": null
    },
    {
      "id": 1515,
      "type": 3,
      "title": "大咖导师 源力唤醒|第二届开源鸿蒙创新应用挑战赛导师阵容重磅亮相",
      "source": null,
      "content": "导师阵容亮相",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/Mc2_FPR7qpO1zWAVxF5JOQ",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.24",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 7,
      "skip": null
    },
    {
      "id": 1514,
      "type": 3,
      "title": "与鸿同行，探索无限！开源鸿蒙技术分论坛在武汉成功举办",
      "source": null,
      "content": "12月20日，由开放原子开源基金会、中国通信学会主办，深圳开鸿数字产业发展有限公司（以下简称“深开鸿”）协办的2024开放原子开发者大会暨首届开源技术学术大会——开源鸿蒙技术分论坛在武汉顺利举行。本次论坛通过南北向开发赋能，融合前沿的行业案例经验，生动展现了开源鸿蒙在驱动技术创新与产业升级中的优势与无限潜能。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/-WQvIFzU9g00dzJcQQQBGQ",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.23",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 4,
      "skip": null
    },
    {
      "id": 1513,
      "type": 3,
      "title": "开源鸿蒙5.0重磅发布，共赴万物智联未来",
      "source": null,
      "content": "12月20日，在2024开放原子开发者大会暨首届开源技术学术大会开幕式上，开放原子开源鸿蒙（即OpenAtom OpenHarmony，简称“开源鸿蒙”或“OpenHarmony”）项目群重磅发布了开源鸿蒙操作系统5.0 Release版本。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/WQIbV9kwnhzeREaJHnEFVg",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.20",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 56,
      "skip": null
    },
    {
      "id": 1512,
      "type": 3,
      "title": "源鸿蒙 5.0 Release版本关键特性解读",
      "source": null,
      "content": "开源鸿蒙 5.0 Release版本是开源鸿蒙操作系统的一个里程碑，在系统能力、性能优化等多个方面进一步增强。本文将从系统功能、性能优化，安全和隐私保护以及分布式能力等角度，解读该版本的关键特性。如果想了解该版本完整的特性，请参考版本的Release notes。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/eA1ckQBLTnHEO0af98nDKg",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": "2024.12.18",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 23,
      "skip": null
    },
    {
      "id": 1507,
      "type": 3,
      "title": "精彩预告 | 2024开放原子开发者大会OpenHarmony技术分论坛等您来！",
      "source": null,
      "content": "2024年12月20日，2024开放原子开发者大会暨首届开源技术学术大会即将在武汉举行。深开鸿在会上将承办“OpenHarmony技术分论坛”，通过南北向开发赋能，结合行业案例经验，让开发者更好更快地上手OpenHarmony开发流程。通过与不同技术的结合创新，展现OpenHarmony的技术优势和更多探索可能，诚邀更多开发者共赴这场探索之旅。",
      "textDetails": null,
      "backgroundImage": "https://images.openharmony.cn/%E5%86%85%E5%AE%B9%E5%B0%81%E9%9D%A2/%E8%B5%84%E8%AE%AF/%E6%B4%BB%E5%8A%A8%E5%9B%9E%E9%A1%BE.png",
      "url": "https://mp.weixin.qq.com/s/Bsx93rP5cj-vMgFjwIIeXg",
      "advertiseImage": null,
      "advertiseUrl": null,
      "startTime": " 2024.12.17",
      "endTime": null,
      "label": 0,
      "recommend": 0,
      "likesCount": 0,
      "shareCount": 0,
      "browseCount": 135,
      "skip": null
    }
  ]
}
```

```json
// https://old.openharmony.cn/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum=1&pageSize=2
{
  "code": 0,
  "msg": "成功",
  "pageSize": 2,
  "pageNum": 1,
  "totalPage": 204,
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
      "browseCount": 961,
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
      "browseCount": 478,
      "skip": "0"
    }
  ]
}
```

啊啊啊太感动了哥们，完全没变，和我猜想的一样。

```txt
现在的任务是这样的，当前的三个爬虫都是在官网重构之前的，现在我们的数据源根地址变成了https://old.openharmony.cn/像是 @services/openharmony_news_crawler.py 中所用的数据源API api_url = f"{self.base_url}/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum={page_num}&pageSize={page_size}"这一段就要变成https://old.openharmony.cn/backend/knowledge/secondaryPage/queryBatch?type=3&pageNum=1&pageSize=300 请以此类推，在保持原有模板字符串拼接URL的基础上将基地址进行更换
```

![7](NowInOpenHarmonyPutaway2/7.png)

等了一会儿终于是跑完了，全部修改完成，现在让我试试吧。

![8](NowInOpenHarmonyPutaway2/8.png)

啊啊啊牛逼成功了，接下来就该去打包了。

### 打包上线

#### 本地打包

有了上一次的经验我决定先将当前项目在本地打包成tar文件，因为服务器的CPU只有两核打包确实是太慢了，所以我现在开始让cc帮我去进行打包。

在等待cc执行玩之后我还是遇到了那个问题，我无法单独打包为tar，总是会直接被打包为.tar.gz格式，我尝试先去和CC交涉一下，看看是不是因为CC理解错了。

![9](NowInOpenHarmonyPutaway2/9.png)

奥，原来还真是CC写错了。

![10](NowInOpenHarmonyPutaway2/10.png)

#### 云端部署镜像

嘶，到了云端我才发现我好像理解错了，我只记得上次错在了导入镜像时需要的是tar不是tar.gz但是这次我直接选择tar包进行镜像导入的时候却还是报错了。

![11](NowInOpenHarmonyPutaway2/11.png)

![12](NowInOpenHarmonyPutaway2/12.png)

enm，我先给豆包看看吧。

![13](NowInOpenHarmonyPutaway2/13.png)

奥，纯粹的打包成tar文件是不够的我们还需要用docker save来去导出标准的镜像包文件。

![14](NowInOpenHarmonyPutaway2/14.png)

原来是这个原因。那我还是老老实实的去用命令行在云端构建吧。

![15](NowInOpenHarmonyPutaway2/15.png)

又开始了这个漫长的构建过程。

![16](NowInOpenHarmonyPutaway2/16.png)

![17](NowInOpenHarmonyPutaway2/17.png)

仔细观察日志发现了问题，原来是之前的爬虫修改过程有遗漏，还漏了几个基地址还是原来的老地址没有更新所以导致了404。

![18](NowInOpenHarmonyPutaway2/18.png)

#### 轮播图爬取问题

在经历了漫长的斗争之后，现在剩下的问题就在于轮播图接口始终是无法使用的状态，之前报过一个奇怪的错，再让CC修复了之后本地测试轮播图接口也是正常的，现在就是不知道为什么在远程部署后始终是无法访问。

当然我有一个推测是因为远程的处理器不如本地的好导致咨询的爬取占用了主要的资源导致轮播图爬虫的爬取被放到了后面，所以看起来像是轮播图的爬虫没有爬到数据。所以我决定先去等待一会儿，等第一轮爬取完全结束之后再去访问轮播图接口。

![19](NowInOpenHarmonyPutaway2/19.png)

已经全部结束了但是依旧没有数据。

![20](NowInOpenHarmonyPutaway2/20.png)

新闻接口是正常的。所以我现在怀疑就是因为Selenium在Docker容器中无法启动Chrome浏览器导致的。

![21](NowInOpenHarmonyPutaway2/21.png)

在更新了最新一版的镜像文件之后我再次去进行了尝试，但是依旧是报了和之前相同的错误。

```bash
2025-10-13 11:52:51 - services.enhanced_mobile_banner_crawler - ERROR - ❌ Selenium WebDriver错误: Message: session not created: probably user data directory is already in use, please specify a unique value for --user-data-dir argument, or don't use --user-data-dir
Stacktrace:
#0 0x55706355c6a2 <unknown>
#1 0x557062fcc8ab <unknown>
#2 0x5570630083aa <unknown>
#3 0x55706300230f <unknown>
#4 0x5570630512a7 <unknown>
#5 0x557063050a07 <unknown>
#6 0x557063041e97 <unknown>
#7 0x55706300fbb1 <unknown>
#8 0x557063010995 <unknown>
#9 0x55706352661e <unknown>
#10 0x557063529a7f <unknown>
#11 0x55706352951c <unknown>
#12 0x557063529f29 <unknown>
#13 0x55706350fffb <unknown>
#14 0x55706352a2b4 <unknown>
#15 0x5570634f988d <unknown>
#16 0x557063549339 <unknown>
#17 0x55706354952f <unknown>
#18 0x55706355b059 <unknown>
#19 0x7f6356c33b7b <unknown>
```

这里就说明了是因为使用selenium进行动态爬取时因为远程并没有谷歌浏览器以及浏览器的驱动程序导致了无法启动。我思考的解决方案有两种：一是直接将谷歌浏览器以及驱动程序下载到服务器上，二是更换动态爬取的方式。

#### 更换codex

额，中间出了一点小状况导致我的CC401了，在和佳澎经过了一段长久的讨论之后我换成了codex，使用gpt5来去继续辅助我的工作。

我决定先去将上面的博文喂给它去弥补一下当前的工作状态。

![22](NowInOpenHarmonyPutaway2/22.png)

![23](NowInOpenHarmonyPutaway2/23.png)

![24](NowInOpenHarmonyPutaway2/24.png)

好好好，“顺手”你GPT5还是有点狂傲在里面的，算然确实是顺手的事，但Claude可不会这么说。

对于这个需求来说GPT5的high模式使用体感和Claude很类似，插件的便捷程度和界面的美观程度更胜于Claude，等我再多用一用再去进行评价吧，现在先再次部署进行轮播图接口的测试。

![25](NowInOpenHarmonyPutaway2/25.png)

果然还是没有办法一帆风顺吗。再打包并且部署了最新版本的代码之后依旧出现了熟悉的报错。

```bash
2025-10-14 04:11:21 - services.enhanced_mobile_banner_crawler - WARNING - ⚠️ 首次启动Chrome失败: Message: session not created: probably user data directory is already in use, please specify a unique value for --user-data-dir argument, or don't use --user-data-dir
Stacktrace:
#0 0x561fa3c466a2 <unknown>
#1 0x561fa36b68ab <unknown>
#2 0x561fa36f23aa <unknown>
#3 0x561fa36ec30f <unknown>
#4 0x561fa373b2a7 <unknown>
#5 0x561fa373aa07 <unknown>
#6 0x561fa372be97 <unknown>
#7 0x561fa36f9bb1 <unknown>
#8 0x561fa36fa995 <unknown>
#9 0x561fa3c1061e <unknown>
#10 0x561fa3c13a7f <unknown>
#11 0x561fa3c1351c <unknown>
#12 0x561fa3c13f29 <unknown>
#13 0x561fa3bf9ffb <unknown>
#14 0x561fa3c142b4 <unknown>
#15 0x561fa3be388d <unknown>
#16 0x561fa3c33339 <unknown>
#17 0x561fa3c3352f <unknown>
#18 0x561fa3c45059 <unknown>
#19 0x7f4f9ed69b7b <unknown>
2025-10-14T04:11:21.692726145Z
2025-10-14 04:11:21 - services.enhanced_mobile_banner_crawler - INFO - 🧭 使用Chrome二进制: /usr/bin/chromium
2025-10-14 04:11:21 - services.enhanced_mobile_banner_crawler - INFO - 📁 使用临时用户目录: /tmp/chrome_user_data_1_bf3792d4
2025-10-14 04:11:22 - services.enhanced_mobile_banner_crawler - ERROR - ❌ Selenium WebDriver错误: Message: session not created: probably user data directory is already in use, please specify a unique value for --user-data-dir argument, or don't use --user-data-dir
Stacktrace:
#0 0x564ea30b96a2 <unknown>
#1 0x564ea2b298ab <unknown>
#2 0x564ea2b653aa <unknown>
#3 0x564ea2b5f30f <unknown>
#4 0x564ea2bae2a7 <unknown>
#5 0x564ea2bada07 <unknown>
#6 0x564ea2b9ee97 <unknown>
#7 0x564ea2b6cbb1 <unknown>
#8 0x564ea2b6d995 <unknown>
#9 0x564ea308361e <unknown>
#10 0x564ea3086a7f <unknown>
#11 0x564ea308651c <unknown>
#12 0x564ea3086f29 <unknown>
#13 0x564ea306cffb <unknown>
#14 0x564ea30872b4 <unknown>
#15 0x564ea305688d <unknown>
#16 0x564ea30a6339 <unknown>
#17 0x564ea30a652f <unknown>
#18 0x564ea30b8059 <unknown>
#19 0x7fadc5fd4b7b <unknown>
2025-10-14T04:11:22.381714535Z
2025-10-14 04:11:22 - services.enhanced_mobile_banner_crawler - INFO - 🧹 已清理临时用户目录: /tmp/chrome_user_data_1_bf3792d4
2025-10-14 04:11:22 - services.enhanced_mobile_banner_crawler - INFO - 📱 尝试方法3: 传统HTML解析（兜底）
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 📱 已设置手机端请求头，User-Agent: Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWeb...
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🚀 开始爬取OpenHarmony手机版banner图片
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🎯 目标URL: https://old.openharmony.cn/mainPlay
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 📱 正在请求手机版页面: https://old.openharmony.cn/mainPlay
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 📱 已设置手机端请求头，User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac O...
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 📱 页面加载成功，内容长度: 534649 字符
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - ✅ 成功获取手机版页面内容
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 开始解析HTML内容，查找banner相关图片...
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 找到 0 个包含 banner-img 类名的元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*banner.*' 找到 1 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*swiper.*slide.*' 找到 0 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*carousel.*' 找到 5 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*slider.*' 找到 0 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*hero.*' 找到 0 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*main.*banner.*' 找到 0 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 通过模式 '.*top.*banner.*' 找到 0 个元素
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🔍 页面总共有 16 张图片，筛选可能的banner图片...
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 🎯 共提取到 0 张唯一的banner相关图片
2025-10-14 04:11:22 - services.mobile_banner_crawler - WARNING - 🔍 未找到banner图片，分析页面结构...
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - 📊 页面调试信息：
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 总图片数量: 16
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 图片1: src=https://images.openharmony.cn/compatibility/标识下载/p..., class=['logo-pic'], alt=无
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 图片2: src=/_nuxt/img/search.2585098.png..., class=['search-img'], alt=
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 图片3: src=/_nuxt/img/close.9ee23e2.svg..., class=['close-img'], alt=
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 图片4: src=/_nuxt/img/search.2585098.png..., class=['search-img-instance'], alt=
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 图片5: src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAA..., class=['menu-img-instance'], alt=无
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 可能的banner容器数量: 3
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 容器1: class=['banner'], 包含图片=0张
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 容器2: class=['el-carousel', 'el-carousel--horizontal'], 包含图片=0张
2025-10-14 04:11:22 - services.mobile_banner_crawler - INFO - - 容器3: class=['el-carousel__container'], 包含图片=0张
2025-10-14 04:11:22 - services.mobile_banner_crawler - WARNING - ⚠️ 未找到任何banner图片
2025-10-14 04:11:22 - services.enhanced_mobile_banner_crawler - INFO - 🎉 总共获取到 0 张唯一的banner图片
2025-10-14 04:11:22 - services.enhanced_mobile_banner_crawler - ERROR - ❌ 保存结果失败: [Errno 2] No such file or directory: ''
```