# RSS 实施、验证与上线

> 日期：2026-10-09。主入口：[方案](README.md)。
> 状态：**临时测试内容已清除，当前双部署为 `190c74d4a`，线上清理验收通过**。用户已授权将 RSS 实现、正式公告和文档提交并推送源码远程，原“源码远程停留在 fd010fd”的试验期限制已解除；该历史备份提交仍保留。首次上线见第 7 节，分轮实测见第 8 节，收尾见第 9 节。

## 1. 备份与授权

- 用户明确要求先 commit/push 当前状态，再在本地尝试 RSS，远程保持备份状态。
- 已提交 `fd010fd4bdf7f74b86d3af017638fe4d84c66aa2`，消息为 `chore: snapshot blog state before RSS implementation`。
- 该提交包含原有文章修改、RSS 设计专题和索引更新，已推送 `origin/master`。
- 推送后、实施后均用 `git ls-remote origin refs/heads/master` 核对远程 SHA；本地 HEAD 也保持该提交。
- 本地实施阶段没有继续 commit/push/deploy，不创建远程试验分支，不执行 pub、opt、webp。随后用户明确要求上线，授权范围仅扩展到站点双部署；源码远程备份仍不变。
- 回退基点已经存在，但没有授权自动回退；需要回退时采用审阅过的逐文件补丁，禁止 reset --hard 或覆盖用户新改动。

## 2. 实际文件

| 文件 | 实际作用 |
| --- | --- |
| `package.json`、`package-lock.json` | 固定 feed 4.0.0、fast-xml-parser 5.11.2；新增 test:feed、check:feed、postbuild |
| `_config.yml` | 插件默认入口关闭、本地入口启用、双格式、30 篇、240 字摘要 |
| `_config.butterfly.yml` | social 增加 RSS；inject.head 增加两种格式的声明 |
| `scripts/rss-feed.js` | 在生成回调内加载策略，依赖异常直接阻断生成 |
| `tools/lib/rss-feed-policy.js` | 公开文章白名单、独立投影、稳定排序、XML 适配与双格式校验 |
| `tools/check-feed.js` | 检查实际磁盘 XML、文章文件与 32 页自动发现声明 |
| `test/rss-feed.test.js` | 14 组真实模型/序列化/失败路径测试，多项参数化边界 |

初始实现未改 `themes/butterfly/`、公开文章正文、图片优化脚本、coffer/生日扫描器。后续按用户授权，仅追加一篇文章的测试句和一期公告，详见第 8 节。

Hexo 仍为 7.3.0、Butterfly 仍为 5.3.2；安装仅新增 14 个依赖节点，原 lock 中已有非根节点无改动、无移除。

## 3. 实施中发现的兼容性问题

这些是实际 XML 或全站构建发现的问题，补充此前只读调查：

1. **RSS GUID 未输出**：feed4 向 Feedsmith2 传字符串 guid，实际输出缺失；用结构化 XML 构建补 `guid isPermaLink="true"`，与 Atom ID 一致。
2. **RSS 作者字段不合规**：只有作者姓名时插件输出 `<author>Author</author>`，不满足 RSS author 的邮箱格式；删除 RSS 可选 author，Atom 保留作者名称。
3. **文本类型与转义**：显式给 Atom title/summary 设置 `type="text"`；RSS description 先作 HTML 文本编码，再由 XMLBuilder 编码，避免阅读器将摘要中的 `<...>` 解释为标签。
4. **顶层时间**：Atom updated、RSS lastBuildDate 统一使用窗口内最大更新时间，不改条目顺序和 ID。
5. **布尔属性序列化**：XMLBuilder 关闭 `suppressBooleanAttributes`，保证输出 `isPermaLink="true"`，而非非法无值 XML 属性。
6. **标签顺序不稳定**：重复 clean build 发现 Warehouse 并行建库导致标签集合顺序改变。只在 RSS 字段副本中按 permalink/name 排序，修正后连续两次构建文件哈希完全一致。

其他落地细节：

- 对已有 description 中的 HTML 做结构化文本提取，移除 script/style/iframe/object/template；缺失 description 仍用“阅读全文”，不取正文。
- 标志字段类型错误阻断，未来 updated 容忍最多 5 分钟时钟误差，超过阻断。
- 当前标题对应的 RSS 图标遵循原主题断点：**桌面首页首屏社交区原本隐藏，入口在作者卡；移动首页首屏显示社交图标**。没有为 RSS 改主题布局。

## 4. 验证结果

`已验证`：

- `npm run test:feed`：14 组通过，包含真实 feed4 + Feedsmith XML、Hexo7/Warehouse5 模型。
- 草稿、published:false、feed:false、私密标志、非文章目录、未来日期排除；相同标题关键词的公开文章保留。
- 新增、摘要修改、单篇排除、移除 fixture 均自动反映在订阅中。
- 中文、空格、特殊字符、emoji、控制字符、240 字截断、分类标签正确。
- 重复 ID、非法路径、插件版本漂移、静态 XML 冲突、缺 GUID、意外全文字段等失败路径阻断。
- 无真实部署的 `校验失败 && DEPLOY_SENTINEL` 演练：进程非零退出，后续标记命令未执行。
- 多次 `clean -> build` 成功，每次生成 2400 文件；postbuild 自动校验双格式 30 篇和 32 个页面声明。
- 最终连续两次干净构建 XML 字节相同；文章源文件未改。
- ego-browser 1440x1000 桌面、390x844 移动检查：作者卡/首页图标正确，无新增横向溢出，字体已加载；点击图标打开 atom.xml。
- 浏览器读取 Atom/RSS 均为 HTTP 200、application/xml，DOMParser 无错误，各 30 条；RSS 有 30 个 GUID。
- 代表文章移动端存在两条声明，正文页正常；Feedsmith parseFeed 可读两种最终文件并识别 30 条。
- `git diff --check` 通过；远程与本地 HEAD 均保留备份 SHA。

最终输出（本地验证后已按第 7 节部署）：

| 文件 | 大小 | SHA-256 |
| --- | --- | --- |
| `public/atom.xml` | 26150 字节 | `4c016c90615c790bd3de61e8a0b9ee1fdef79fe5c1164e81161242d3aed394f3` |
| `public/rss.xml` | 24244 字节 | `cbcf6ac446cd1b1a2e46ad7d15c99e392e38b3272db1a0bde9c07be7cc0a0d21` |

临时日志和截图不进入仓库，不携带访客卡等隐私画面入长期记忆。

## 5. 安全与剩余边界

- `npm audit` 查询：73 项告警（5 low、22 moderate、43 high、3 critical）。新增依赖节点未命中该次审计告警；不等于全面安全保证。
- 未执行 npm audit fix，未升级旧依赖；仓库原有告警作为独立维护项。
- 实际阅读器 UI 的订阅/未读行为、真实移动设备、Safari/Firefox 仍待验证；双部署和当次线上响应已按第 7 节核对，未来更新的缓存刷新行为未作长期观察。
- RSS 更新时间仍依赖 mtime，换电脑检出/恢复文件可能让旧文 updated 变化；30 篇窗口外的旧文修改不承诺通知。
- `npm run pub` 已因 build 的 postbuild 自动包含校验，但**本次没有运行 pub**，它仍会执行既有 WebP 转换与双部署。
- 直接 hexo deploy 不受 npm postbuild 保护；单独 check:feed 只证明现有产物，不证明源文件已同步生成。
- 禁用时需成对移除图标和 head 声明，避免保留死链接；删除线上 feed 会影响既有订阅者。

## 6. 本地试用

日常使用方式不变，写文章后发布会自动更新。只在本地复验可执行：

```text
npm run test:feed
npm run clean
npm run build
npm run server -- --port 4000
```

预览路径为 `/atom.xml` 和 `/rss.xml`。已按用户后续要求上线、清理并进入正式源码交付；任何未来新变更的发布仍需相应授权。

## 7. 2026-10-09 首次上线

**用户授权**：“现在上线试试实际线上效果”。本次只发布站点产物，不改变源码备份基点，不做图片转换。

执行顺序：

1. `npm run test:feed`：14 组通过；`git diff --check` 通过。
2. `npm run clean` 后执行 `npm run build`：生成 2400 文件，postbuild 校验双格式 30 篇与 32 页订阅声明。
3. `npm run deploy`：两个配置目标均完成推送，从 `80ddb2c036668da0423b2c3d47ba5b58da488a1a` 更新到 `10f99bb27311276ef5f1108f14866bcb807941d1`。
4. 分别执行远程引用查询，两个站点仓库 `main` 均为新部署 SHA；源码本地 HEAD、origin/master 仍为 `fd010fd4bdf7f74b86d3af017638fe4d84c66aa2`。

`已验证` 的线上结果（通过 ego-browser 实际访问，不以 Git 推送日志代替 HTTP）：

| 目标 | Atom / RSS 响应 | 内容 | 入口 |
| --- | --- | --- | --- |
| `https://xbxyftx.top` | 均 200，`text/xml`，有 ETag | 两种文件 SHA-256 与第 4 节一致，各 30 条 | 首页/归档/代表文章均有两条声明；桌面作者卡与移动首页图标正常 |
| `https://xbxyftx.github.io` | 均 200，`application/xml`，有 ETag，`Cache-Control: max-age=600` | 两种文件 SHA-256 与第 4 节一致，各 30 条 | 首页、归档、代表文章声明通过，移动入口存在 |

- 主站 1440x1000 与 390x844 截图复核通过，未见新增横向溢出；轮播容器有 `swiper-ready`。
- 移动首页点击 RSS，真实打开 `https://xbxyftx.top/atom.xml`，浏览器读取到 30 条 entry，无 XML 解析错误。
- 两个站点的 `/archives/` 与 `/2026/09/01/ToBistuMaker/` 均返回 200，自动发现声明校验通过；主站代表文章移动 DOM 正常。
- GitHub Actions 公开 API 返回 403，因此**没有获取到 Actions 任务结论**。不能将其写成 Actions 成功或失败；GitHub Pages 实际新文件已独立验证可用。
- 首次网页导航有外部资源等待导致 load 超时，但导航已提交、DOM 可用；后续按 RSS 元素与响应验证，没有将该超时当作订阅故障。

本次未运行 `npm run pub`，因为没有新图片需求，采用 clean/build/deploy 保留相同的 feed 生成与校验阶段且避免原 WebP 副作用。日常 pub 的自动更新接入方式不变。

线上订阅地址：`https://xbxyftx.top/atom.xml` 和 `https://xbxyftx.top/rss.xml`。阅读器拉取频率与 GitHub Pages 的 600 秒缓存可能使下一次更新延迟可见；未承诺即时通知。

## 8. 正文与公告分轮线上实测

**授权与方法**：用户允许在一篇文章末尾增加测试句后推送检查 RSS，再单独修改公告推送检查 RSS。优先使用用户指定路径的 ego-browser skill，单一任务空间完成线上基线、两轮响应比对和公告 DOM/截图验证。只推送站点产物，源码备份不变。

两轮均执行 clean、build（2400 文件，postbuild 通过）、deploy；不执行 WebP，不手改 XML、不改 front matter 的 date/description/updated，不修改 RSS 实现来配合结果。

| 阶段 | 站点部署 SHA | RSS lastBuildDate（北京时间） | 实测结果 |
| --- | --- | --- | --- |
| 基线 | `10f99bb27311276ef5f1108f14866bcb807941d1` | 2026-10-09 09:57:21 | 30 条，摘要模式 |
| 文章正文追加 | `06bbfd088ab2aa5d4ed21118cff951bb0877e931` | 2026-10-09 14:12:40 | RSS 顶层时间改变；全部 item 深比较不变；Atom 仅目标 entry.updated 与顶层 updated 改变 |
| 仅追加公告 | `f425e8f478719b3b3cae8838567ecd9b9095ea9c` | 2026-10-09 14:12:40 | 公告已上线，RSS/Atom 与上一轮逐字相同 |

### 文章轮

- 目标：`source/_posts/ToBistuMaker.md`，对应 `/2026/09/01/ToBistuMaker/`。
- 仅末尾追加：`RSS 自动更新测试（2026-10-09，RSS-ARTICLE-20261009）：此行用于验证文章正文修改后，订阅源会随发布自动更新。`
- 浏览器取回线上文章 HTML，状态 200，确认测试句存在。
- 线上 RSS 状态 200，`lastBuildDate` 从 `Fri, 09 Oct 2026 01:57:21 GMT` 变为 `Fri, 09 Oct 2026 06:12:40 GMT`。
- 30 个 RSS item 深比较完全相同：GUID、link、title、description、pubDate、category 均未变。
- Atom 恰好一条 entry 变化：目标文章 updated 为 `2026-10-09T06:12:40.576Z`，ID 不变。
- 测试句不进入 feed，因为 feed 使用未修改的 description，而非全文。**不能据此宣称 RSS 阅读器一定会再次提醒正文修改。**

### 公告轮

- 只在 `source/_data/announcements.yml` 顶部新增 `2026-10-09-141640-rss-subscription`，标题“RSS 订阅已上线！”，标记 `RSS-ANNOUNCEMENT-20261009`；保留旧公告，共 24 期。
- 公告验证期间目标文章 mtime 与文章轮完全相同；其他 60 篇文章的内容 SHA 和 mtime 与原始基线一致。
- 主站与 GitHub Pages 首页均 200，包含新公告标记；真实 DOM 为当前公告，桌面截图正常，无横向溢出。
- 两种线上 feed 均 200，与文章轮内容逐字一致，新公告没有进入订阅列表，顶层更新时间未变。
- 比较采用文件正文 SHA 和 XML 字段，不把 HTTP Last-Modified 或 ETag 当作文章更新时间。

两轮后 feed 指纹：

```text
rss.xml  21c1357d7e2b2c42a090d5d07cf0f654a23cdf2670ae369fd957f6f9e064727e
atom.xml e9e3ec4ec6859ad8b6557510178ac552b774c5bdd72c79564b1348389055d5ff
```

**双目标证据**：每轮两站点仓库 main 的 ls-remote 均与对应部署 SHA 一致；主站与 GitHub Pages 两种 XML 均与预期本地产物一致。源码 origin/master 最终仍为 `fd010fd4bdf7f74b86d3af017638fe4d84c66aa2`。

**当时留存状态**：两轮实测结束时暂留测试句与公告标记供用户核对。随后用户要求清理，已按第 9 节删除并重新部署；本节保留标记名称仅作为历史证据，不代表线上仍有测试内容。

## 9. 测试清理与正式交付

用户明确授权“清除临时添加的内容之后部署，随后 commit 并推送远程，更新长期记忆文档”。

- 删除文章末尾的测试句和公告 closing 中的验证标记，保留第 24 期“RSS 订阅已上线！”的正式文案。
- 文章正文与测试前备份逐字一致（忽略文件末尾换行）；没有删除用户原有段落，也没有人为恢复 mtime。
- 14 组 RSS 测试、clean build 与 postbuild 检查通过，仍生成 2400 文件、30 条订阅、32 页声明。
- 执行 `npm run deploy`，两个站点目标均从 `f425e8f47` 更新至 `190c74d4a5be8355850f0a9ae496e793be306dab`，分别核对远程 main。
- ego-browser 对主站与 GitHub Pages 取回首页、目标文章、Atom 和 RSS：响应均 200，两个临时标记不存在，正式 RSS 公告存在，订阅文件与本地逐字一致。
- 未执行 webp/opt/pub；没有图片转换、主题升级或无关代码修改。
- 用户的新授权允许源码 origin/master 正常前进，`fd010fd4bdf7f74b86d3af017638fe4d84c66aa2` 仍是可追溯的实施前历史备份，不再是必须保持远程 HEAD 的约束。

清理后订阅指纹：

```text
atom.xml 129f94e820dd9e9a00dcf6b5b7fc28b49501421931f7388f8e7674ca2297c144
rss.xml  77251d02799c62506a280abba8cc1dbc454e9048f427f9373adcf151d488154d
```

源码提交包含实现、固定依赖、回归测试、正式公告及本专题记录；不提交 public、部署缓存或临时日志截图。提交与推送结果在完成后追加核对记录。
