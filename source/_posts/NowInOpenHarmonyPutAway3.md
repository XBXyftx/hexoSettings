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
typewriter: 🚀 从开源之夏到应用上架的完整征程！本文记录了NowInOpenHarmony项目后端服务的部署优化过程，重点关注宝塔面板的使用以及后端运维的技术细节。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

之前我们已经完成了对NowInOpenHarmony后端服务的部署，但是依旧会时不时的出现CPU占用率跑满的情况，第一次遇到的时候并没有保留日志，这一次我又遇到了相同的情况，下决心要解决这个问题。于是，这篇文章就应运而生了。

这个活看起来确实不像是开发该干的，但是对于个人开发者来说肯定是不会有专人来辅助自己进行运维的，与此同时自己去进行优化也是对于项目架构思想以及Vibe Coding能力的一次锻炼。

## 问题数据捕获与分析

### 起因

在上一天文章中我们仅仅是针对于自己的后端进行了优化，并没有真正意义上的去整个后端进行监测和优化，毕竟我们的后端是包含了两个docker容器。一个是我们的后端服务，一个是我们的WebDriver服务，这是当前我们后端服务数据源爬虫所刚需依赖的在线容器。针对于服务端的代码我已经反复让GPT帮助我进行修改优化以及死循环可能性的测试了，同时也降低了爬虫所使用线程池的数量，但是依旧是没有解决问题。于是我就怀疑是不是我们的WebDriver服务出现了问题。

恰好今天上午在登陆宝塔面板检查运行情况时发现了相同的问题，我一登陆上去就发现CPU的占用率再一次被拉满了。

这一次我及时的进行了截图留存。

![1](NowInOpenHarmonyPutAway3/1.jpg)

我操了，查看进程占用率居然要氪金。我真服了，先继续看截图吧，后面问AI要命令去查看进程的资源占用情况吧。

![2](NowInOpenHarmonyPutAway3/2.jpg)

![3](NowInOpenHarmonyPutAway3/3.jpg)

![4](NowInOpenHarmonyPutAway3/4.jpg)

![5](NowInOpenHarmonyPutAway3/5.jpg)

到这里可以看出，我的后端服务容器的占用率始终是很稳定的，WebDriver容器会经常性的出现占用率飙升到200%的情况，这是我完全没想到的，首先是我压根就不知道占用率还能突破100%，其次是我不理解为什么从官方镜像进行拉去并创建的容器会出现这种不稳定的情况。随后我立刻下载了最近三天的日志文件。

### 告警形式

这个时候我突然想到为什么我之前明明设置了CPU5分钟内的均值到达80%后就给我发送邮件进行提醒，但是我却一封邮件都没收到过，所以我就去检查了一下告警设置和告警日志。

![6](NowInOpenHarmonyPutAway3/6.png)

原来告警是正常的触发了，是因为我163邮箱的服务器设置有问题。我去检查了一下决定帮顶一下公众号通知方式，这种方式更加保险，毕竟没有需要自己配置地址和密钥的步骤，都是由官方进行配置的。

![7](NowInOpenHarmonyPutAway3/7.png)

### 问题分析

![8](NowInOpenHarmonyPutAway3/8.jpg)

在观察了一下CPU整体的占用率图之后发现，这个问题是经常出现的占用率是经常性的飙高。这时我突然想到，不会我的后端服务也一并将我的流量包耗尽了吧（我还得留着当我的博客服务器啊啊啊啊）。

![9](NowInOpenHarmonyPutAway3/9.png)

奥还好并没有。

现在我就怀疑会不会是WebDriver的镜像对于我服务器的负担太重了？还是什么其他原因。

```bash
结论

现象基本锁定在 Selenium 容器：在你截图里多次飙到 200%（2 核=200%），而 API 容器稳定。
代码层面确有并发隐患：手动接口会“并行触发两次增强爬虫”（日志里同一秒出现两条“初始化增强版手机Banner爬虫”）。来源是 api/banner.py 的手动接口一边调度器后台跑，一边本进程再跑一次，容易叠加峰值。
先做的两步（不改业务效果，直接止血）

重建 Selenium 容器（限制并发会话=1、给 CPU 限额、会话超时）
docker rm -f selenium
docker run -d --name selenium --network ohnet -p 4444:4444 --shm-size=2g --restart unless-stopped -e SE_NODE_MAX_SESSIONS=1 -e SE_NODE_OVERRIDE_MAX_SESSIONS=true -e SE_SESSION_REQUEST_TIMEOUT=30 -e SE_NODE_SESSION_TIMEOUT=60 --cpus="0.8" selenium/standalone-chromium:latest
运行时观察
docker stats --no-stream | egrep 'NIOHServer|selenium'
curl -s http://127.0.0.1:4444/status | grep -E '"ready"[[:space:]]*:[[:space:]]*true'
建议代码级修正（避免“双启动”）

修改手动接口：只跑一种方式（二选一）
方案A：仅立即执行（删除/注释“scheduler.manual_banner_crawl()”）
或方案B：仅交给调度器后台跑（移除 run_in_executor 的即时执行）
增加“正在更新”防抖
手动接口先读 banner_cache.get_status()，若 is_updating=true 则直接返回“正在更新，稍后再试”，避免叠加。
定位与验证

哪些 Chrome 进程在跑：
docker exec -it selenium sh -lc "ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head"
docker exec -it selenium sh -lc "pgrep -fa chromium || pgrep -fa google-chrome || true"
Selenium 会话是否泄漏：
curl -s http://127.0.0.1:4444/status | jq '.value' 2>/dev/null | egrep -i 'session|slot|busy|max'
如果再次出现长期 100%：立刻抓三样
docker stats 快照
selenium 容器 ps/top
NIOHServer 日志尾部，查看是否又出现两条“初始化增强版手机Banner爬虫”
可选优化（按需）

我可以提交补丁：
修复手动接口“双启动”+“防抖”
给 Selenium 端再加 Chrome 低耗参数（已加大部分，如需我会补 --headless=new、更多禁用项）
任务互斥标记（BannerCache 增加原子互斥，避免 API 与调度器重入）
要我现在就按“方案A（仅立即执行+防抖）”改 api/banner.py 并打包吗？
```

嗯，看来可以手动添加对于镜像的资源占用限制。我现在应该再将我刚下载的日志文件给他看看。

```bash
结论（根因指向 Selenium 暴露端口被外部滥用）

在 selenium 日志中多次出现可疑会话请求，明显不是你服务发出的正常请求：
“args: [--utility-cmd-prefix=bash /…]”
“args: [-cimport base64;exec(base64…], binary: /usr/bin/python3”
这些是典型通过 ChromeOptions 注入命令的攻击扫描/执行尝试，说明 4444 对公网暴露后被外部访问。
这些请求在多时段出现，且与调度时间不完全对齐；且你的面板截图显示 selenium 容器 CPU 峰值 200%（2核被打满），与被外部创建会话强行执行/渲染高度吻合。
正常业务会话的特征很清晰：带我们设置的一长串 headless/禁用参数、mobileEmulation、binary=/usr/bin/chromium，且每次日志紧随“🎉 Selenium方法获取到 4 张轮播图”。可疑请求与之差异明显。
API 容器日志整体健康，仅偶发一次 “coroutine was never awaited” 警告，不是拉满 CPU 的主因。
建议（立即执行）

立刻取消 4444 映射，限制到内网网络 ohnet 使用（NIOHServer 通过服务名 selenium 访问）：
docker rm -f selenium
docker run -d --name selenium --network ohnet --shm-size=2g --restart unless-stopped -e SE_NODE_MAX_SESSIONS=1 -e SE_NODE_OVERRIDE_MAX_SESSIONS=true -e SE_SESSION_REQUEST_TIMEOUT=20 -e SE_NODE_SESSION_TIMEOUT=60 --cpus="0.8" selenium/standalone-chromium:latest
健康检测改为容器内或从 app 容器：docker exec NIOHServer curl -s http://selenium:4444/status
如果必须在宿主调试 4444，建议仅临时开放，或用面板/防火墙禁止外网到 4444（允许本机/内网）：
ufw deny 4444 或等价的安全组/面板规则（优先安全组/面板）。
建议（代码与配置加固）

我方已把调度错峰和并发下调，保持即可；若仍见峰值，再把 selenium 容器 CPU/memory 限制写入 compose 并开启 auto-restart。
避免手动接口“双启动”造成叠加（你的日志这两天未再出现，但建议实做）：手动接口要么只调调度器，要么只立即执行，并在开始前检查 banner_cache.is_updating 做防抖。
保持我们新增的 CSS background-image 提取，减少反复刷新页面的开销。
如何验证

重新按“仅内网”方式启动 selenium 后，宿主机外部将无法访问 http://<公网IP>:4444/status；但在 app 容器内 curl selenium:4444/status 为 ready:true。
观察 1～2 小时 docker stats：selenium CPU 峰值应只在定时或手动抓取的瞬间短暂升高；若仍频繁飙升，grep 日志 “Session request received by the Distributor” 的节奏应已显著下降，且不再出现可疑 “python3/base64/utility-cmd-prefix=bash” 片段。
证据摘录（来自你提供的日志）

3b0e…-json.txt 多次出现：
“Capabilities {… args: [--utility-cmd-prefix=bash /…], …}”
“Capabilities {… args: [-cimport base64;exec(base64…], binary: /usr/bin/python3, …}”
ab91…-json.txt（API）：周期性“初始化增强版…使用远程WebDriver…Selenium方法获取到 4 张轮播图”，属正常业务。偶发 RuntimeWarning 不是 CPU 根因。
需要我把 compose(dev/prod) 里的 selenium 服务去掉 ports 映射并加上资源限制，顺便修正手动接口的“防抖+单触发”吗？
```

！！！原来是这个镜像使用了一个常见的对外暴露的4444端口导致我的服务器被攻击，导致了CPU占用率飙升。

### 解决方案

现在我需要让gpt给我命令去禁止webdriver的对外暴露端口，并限制其CPU占用率。

现在的状态是NIOHServer和selenium两个容器都在运行，我所需要的指令是，先关停这两个容器然后在重启的时候限制死selenium的CPU占用率最高为60%，同时禁止4444端口的对外暴露，同时还要确保NIOHServer容器能够正常访问selenium容器。

```bash
docker rm -f NIOHServer selenium 2>/dev/null || true
```

```bash
docker network create ohnet || true
```

```bash
docker run -d --name selenium --network ohnet
--shm-size=2g --restart unless-stopped
-e SE_NODE_MAX_SESSIONS=1
-e SE_NODE_OVERRIDE_MAX_SESSIONS=true
-e SE_SESSION_REQUEST_TIMEOUT=20
-e SE_NODE_SESSION_TIMEOUT=60
--cpus="0.6"
selenium/standalone-chromium:latest
```

```bash
docker run -d --name NIOHServer --network ohnet
-p 32776:8001 --shm-size=1g
-e TZ=Asia/Shanghai
-e ENABLE_SCHEDULER=true
-e BANNER_USE_ENHANCED=true
-e SELENIUM_REMOTE_URL=http://selenium:4444/wd/hub
-e SELENIUM_USE_USER_DATA_DIR=false
openharmony-server:latest
```

```bash
docker exec -it NIOHServer sh -lc "curl -s http://selenium:4444/status | grep -E '"ready"[[:space:]]*:[[:space:]]*true' || true"
```

```bash
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}' | egrep 'NIOHServer|selenium'
```
