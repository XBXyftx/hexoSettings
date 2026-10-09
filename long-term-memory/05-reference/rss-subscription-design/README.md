---
name: RSS 自动订阅接入方案
description: 面向 Hexo 7.3.0 与定制 Butterfly 5.3.2 的订阅生成、公开文章边界、版本选择和发布验收方案
type: project
---

# RSS 自动订阅接入方案

> 调查日期：2026-10-09（Asia/Shanghai）。
> 状态：**已实施、完成分轮实测并清理测试内容，当前双部署为 `190c74d4a`，线上验收通过**；已获授权正式提交并推送源码。下文保留原始设计；实际结果与差异以[实施记录](implementation.md)为准。
> 用户已确认：只收录公开博客文章，排除草稿、coffer 私密目录及游戏、图库、生日等自定义页面。
> 最新授权：用户要求清理临时内容、部署后 commit/push 并更新长期记忆；原试验期的源码远程冻结限制已解除，历史备份 `fd010fd4bdf7f74b86d3af017638fe4d84c66aa2` 仍保留。

## 1. 阅读入口

| 文档 | 内容 |
| --- | --- |
| 本文 | 推荐架构、配置契约、内容与更新时间策略、实施步骤 |
| [实施与验证记录](implementation.md) | 当前实际代码、兼容性修正、测试结果和远程备份边界 |
| [版本与源码证据](compatibility-and-evidence.md) | 实装版本、上游版本差异、生命周期、只读实验与历史文档纠偏 |
| [验证与发布清单](verification-plan.md) | 单元测试、真实构建、浏览器验收、发布阻断、回退和后续升级 |
| [技术实践索引](../../03-api-practices/README.md) | 本项目生成器和脚本边界 |
| [部署链文档](../../03-api-practices/deployment-pipeline.md) | 原有发布流程；其中历史失准项见证据文档 |

## 2. 结论与范围

**建议保留 Hexo 7.3.0、Butterfly 5.3.2、kramed 及现有渲染链不变，采用固定版本 `hexo-generator-feed@4.0.0` 的 XML 生成实现，加一个项目自己的薄生成入口与发布前校验。**

这是原设计阶段的选型结论；后续已完成依赖安装、真实序列化、全站构建与线上验证，具体范围和剩余限制见实施记录，不扩大为所有阅读器与设备的兼容性承诺。

目标：

- 日常仍然只执行 `npm run pub`；不手工编辑 XML、文章清单或订阅更新时间。
- 一次构建同时输出 `public/atom.xml` 与 `public/rss.xml`，随网站静态文件进入现有双部署链。
- 最近 30 篇公开文章，发布日期倒序；摘要模式，不包含完整正文和客户端脚本。
- 新增、修改、移除文章后，下次构建重新计算订阅窗口。
- RSS 校验失败时停止发布，不能默默发布缺失、失效或越界的订阅源。

不包含：Hexo/主题升级、全文订阅、分类订阅、邮件通知、定时发布、实时推送、独立 RSS 服务、私密系统安全改造。

“30 篇、双格式、摘要、图标入口”是本方案的推荐默认值；用户明确确认的是公开文章收录边界，不应把其他建议记录成已验收。

## 3. 当前基线

以下为 2026-10-09 的代码事实，不沿用根记忆中的旧计数：

| 项目 | 实际状态 |
| --- | --- |
| 本地运行环境 | Node v24.15.0 |
| Hexo | 声明 `^7.3.0`，lock 和实装均为 `7.3.0` |
| Butterfly | 仓库内定制主题，`package.json` 为 `5.3.2` |
| 公开文章 | `source/_posts/` 顶层 61 篇 Markdown；全部有非空 `description` |
| 日期字段 | 61 篇均无显式 `updated`；当前 `updated_option: mtime` |
| 内容复杂度 | 10 篇正文超过 100,000 字符；5 篇带公式标志；6 篇包含 `<script` 文本，可能包括教程示例 |
| 订阅现状 | 未安装 feed 插件；未配置 feed；source/public 均无三个常见订阅文件 |
| 草稿/未来文章 | `render_drafts: false`、`future: true`；扫描未发现未来日期文章 |
| 主题入口 | `social` 同时用于首页社交区和作者卡；`inject.head` 已在使用 |
| PJAX | 根主题配置为 `false`，不应按“已开启”设计 |

已有文章 `source/_posts/ToBistuMaker.md` 带用户修改，本次只读，未覆盖。分析基点为 `ff0290c`；基点只用于定位源码，不代表构建或部署证据。

## 4. 方案取舍

| 方案 | 优点 | 问题 | 判断 |
| --- | --- | --- | --- |
| A. 官方插件默认入口，只加配置 | 改动最少 | 无 `feed:false` 支持；只检查 `draft`，不等于 Hexo 7 的 `published`；默认摘要回退会直接截 HTML | 不满足明确的防误收录契约 |
| B. 默认入口加后置包装 | 使用 `generator.get/register` 即可包装 | 包装脚本加载失败可能留下未筛选的原始生成器；要另补“包装确实运行”的证明 | 可行，但默认失效方式不理想 |
| C. 禁用默认入口，本地薄入口调用固定插件实现 | 筛选先于序列化；适配失败不会退回无筛选生成；仍复用成熟 XML 库 | 依赖插件内部 `lib/generator` 路径，必须锁版本并有契约测试 | **推荐** |
| D. 完全自制 XML 或独立 RSS 服务 | 自由度高 | 转义、协议维护或服务运维成本不必要 | 不采用 |

方案 C 没有复制或修改 `node_modules` 中的代码。项目负责“哪些文章、哪些字段”，插件负责“如何生成两种 XML”。

## 5. 自动化链路

```text
npm run pub
  -> npm run opt
     -> webp（保留既有行为）
     -> clean
     -> npm run build
        -> prebuild: build:markdown-preview（原样保留）
        -> hexo generate
           -> 原有文章渲染/扫描器
           -> rss-feed 生成器
              -> 公开文章筛选
              -> 独立字段快照与排序
              -> 固定 feed 插件生成 Atom/RSS
              -> 对生成结果执行结构与收录校验
           -> 写入 public/
        -> postbuild: check:feed（拟新增）
  -> hexo deploy（仅前面所有命令成功后执行）
```

`after_generate` 处于路由准备之后、静态文件全部落盘之前，不能在其中假设 `public/*.xml` 已写完。落盘校验放在 npm `postbuild`。

拟保留 `pub`、`opt` 字符串不变，只新增：

```json
{
  "postbuild": "npm run check:feed",
  "check:feed": "node ./tools/check-feed.js"
}
```

这样原命令体验不变，检查失败可通过已有 `&&` 中断到达 `deploy`。直接运行 `hexo generate` 会跳过 npm `postbuild`，但生成器内校验仍执行；直接 `hexo deploy` 或 `npm run deploy` 不保证重新生成/校验，不能把它们描述成等价的安全发布入口。

## 6. 配置契约

以下片段为设计，不应在文档阶段应用到实际配置：

```yaml
# _config.yml
feed:
  # 只关闭插件默认生成入口；由 rss_subscription 的受控入口生成。
  enable: false
  type:
    - atom
    - rss2
  path:
    - atom.xml
    - rss.xml
  limit: 30
  content: false
  content_limit: 240
  order_by: '-date source'
  icon: /img/logo.webp
  autodiscovery: false

rss_subscription:
  enable: true
  public_source_prefix: _posts/
  exclude_future: true
```

重要约束：

- `feed.enable:false` **不是整个功能的开关**，而是禁止第三方默认入口绕过本地策略；总开关是新增的 `rss_subscription.enable`。
- `rss_subscription.*` 为本地设计字段，官方插件不认识；必须由拟新增代码实现、校验和测试。
- 不配置 `feed.template`。4.0.0 的入口虽然保留部分参数处理，实际生成器不再使用 Nunjucks 模板。
- 配置路径禁止外部 URL、绝对磁盘路径、`..`，两条路径不得重复，也不得与 `source/` 静态文件冲突。
- 启用时验证精确插件版本、生成函数存在、Node 满足插件发布包要求。不能自动降级到 3.0.0，也不能失败后改成直接读取所有文章。
- `content_limit` 只是防御性设置，不能误以为它会截断已有 `description`；实际摘要由本地适配统一处理。

## 7. 公开文章白名单

输入只能是 `locals.posts`，不能递归扫描整个 `source/`，不能拼接 `locals.pages`、coffer 索引或生日事件 JSON。

先筛选再排序再取 30 条，保证被排除项不会占用名额：

1. 规范化 `post.source` 为站点源目录相对路径；明确拒绝绝对路径、父级穿越及缺失 source。
2. 要求路径严格以 `_posts/` 开头，不能只判断是否包含 `_posts`。
3. 要求 `post.published === true`；同时排除 `post.draft === true`。
4. 排除 `post.feed === false`。该字段为本地适配新增能力，不是插件内置功能。
5. 防御性排除 `private:true`、`hidden:true`、`hide:true` 以及非空 `password`。它们是本项目 RSS 策略，不宣称是 Hexo 通用安全标准。
6. 日期必须有效；按本次构建固定的时间点排除尚未到达发布日期的文章，独立于现有全站 `future:true`。
7. 验证 permalink 为主站同源的 HTTP(S) 地址，且不进入 coffer、自定义页面等禁用路由；路径或元数据异常应报错，不能猜测后继续。
8. 标志字段出现 `"false"` 等字符串或无法解释的值时，应明确报错，防止 YAML 类型误写被静默忽略。

普通 `source/_posts/连连看.md` 是介绍游戏的公开文章，可以收录；`source/LianlianKan/` 是游戏页面，不能收录。同理，不用标题或关键词判断是否私密。

排除 RSS 只阻止订阅传播，不能隐藏静态站原始资源，不能撤回阅读器已经缓存的内容。

## 8. 生成器边界

拟新增 `scripts/rss-feed.js` 注册一个名为 `rss-feed` 的生成器，一次返回两个 `{path, data}` 结果：

- 复用 `hexo.extend.generator.register`，不改内置生成器或 Hexo 全局 locals。
- 执行生成器时再加载并校验 `hexo-generator-feed/lib/generator`。加载/筛选/校验异常直接抛出，禁止 catch 后返回空数组冒充成功。
- 第三方入口已关闭，缺失本地脚本时不会剩下原始 feed 路由；`postbuild` 会因两个文件缺失阻止标准发布。
- 只提取所需字段到独立快照，不改 `post.description/date/updated/content` 等共享模型。
- `Warehouse 5.toArray()` 返回底层数组，不能在它上面原地 `sort`。使用复制数组或返回新 Query 的 `filter/sort`。
- 日期倒序、source 升序作为同日期的稳定次排序；忽略 `top`、`swiper_index`。
- 当前插件需要 Query 的 `sort/filter/limit/first/toArray`。以当前 Query 构造器包装字段快照的方式已做定向内存实验；这属于需要测试覆盖的 Warehouse 版本适配点，不作为永久公共 API 承诺。
- categories/tags 在快照中保持插件所需的 `toArray` 契约；只投影名称和链接，不复制数据库内部状态。
- 两种格式共享同一个筛选快照和构建时刻，防止跨午夜或 watch 更新产生不同集合。

只记录 `[RSS] 收录 N 篇，排除 M 篇` 和可定位的错误类别；不得把私密目录正文、密码值、完整被排除记录输出进日志。

## 9. 摘要、链接与更新

### 9.1 摘要

推荐纯文本摘要，优先使用现有 `description`，统一空白、清理 XML 禁止控制字符，按 Unicode 字符边界截到 240 字并补省略号。

当前 61 篇均有纯文本且不超过 240 字的描述，不需要批量修改文章。

历史例外缺少描述时，第一版自动使用“阅读全文”并记录警告，不直接截取正文 HTML。以后如需要正文自动摘要，应增加 HTML 解析流程，移除 script/style/iframe 等内容后取文本，作为单独扩展；不能用简单去标签正则假装完成安全净化。

不映射 `cover` 到 `image/enclosure`，避免阅读器重复封面和媒体 MIME 问题。站点图标可以使用已有 `/img/logo.webp`，实际阅读器显示兼容性列入验收。

### 9.2 稳定身份

- Atom `id`、RSS `guid` 使用 Hexo 现有 canonical permalink，RSS `pubDate` 和 Atom `published` 使用原始文章 `date`。
- 不使用构建时间、数据库 `_id` 或更新时间组成条目身份。
- 当前 `:title` 实际使用文件派生的 slug，并不直接等于 front matter 展示标题；改文件名、日期、slug 或 permalink 都可能改变订阅身份。
- 更换站点域名或 URL 策略应单独做迁移，不能承诺阅读器自动去重。

### 9.3 更新时间

默认保留文章的 `updated` 语义：显式 `updated` 优先，否则沿用 Hexo 7 从文件 mtime 推导的时间；没有值时回退发布日期。无需每次手工填写新字段。

必须如实说明：

- 同一机器源文件未改时，clean/build 不会自行修改文章 mtime；正常重复发布不应把每篇文章时间改成“现在”。
- 新电脑 clone、恢复文件、WebP 引用改写可能改变 mtime。**稳定 ID 不等于所有阅读器都不会重新标记未读。**
- RSS 2.0 默认条目没有独立 updated；标题/摘要会变化，但读者是否收到再次提醒取决于阅读器。
- 摘要模式下，正文改动不保证摘要变化；30 篇窗口之外的旧文修改也不保证传播。
- 不全站切换 `updated_option:date`，那会改变已有文章页语义，也会失去自动修改时间。
- 如果将来明确要求跨机器的“真实内容修改时间”也必须稳定，再单独设计持久化内容哈希台账；本期不引入状态文件、Git 日志扫描或强制手填 updated。

插件 4.0.0 的 feed 顶层更新时间只取排序后的第一篇。建议适配器在序列化后用结构化 XML 解析/构建 API，将 Atom 顶层 `updated` 和 RSS `lastBuildDate` 设置为本次窗口内最大的有效条目更新时间，**只更新顶层，不修改条目日期、不把旧文顶到前面**。需要独立回归证明命名空间、转义和空元素未被破坏；若此定向处理不能通过测试，不能用正则替换日期草率上线。

未来日期仍按原始发布时间过滤；如 mtime 早于发布日期，对 feed 投影取不早于发布日期的值，不写回 Markdown。明显超出当前时间的 updated 应阻断并提示检查时钟或显式日期。

## 10. Butterfly 入口

不改 `themes/butterfly/`，不新增前端 JS：

```yaml
# 合并进根 _config.butterfly.yml 的已有 social，不能另建重复键。
social:
  fas fa-rss: /atom.xml || RSS订阅 || '#f28c28'
```

该配置复用首页与作者卡模板，已有 `target="_blank"`。Atom 作为主入口；RSS 2.0 同时通过自动发现提供。

在现有 `inject.head` 列表末尾追加两条声明：

```html
<link rel="alternate" type="application/atom+xml" title="XBXyftx - Atom" href="/atom.xml">
<link rel="alternate" type="application/rss+xml" title="XBXyftx - RSS" href="/rss.xml">
```

插件 `autodiscovery:false`，保证注入职责唯一。采用主题注入的理由是插件会在整段 HTML 中搜索 MIME 字符串，正文代码示例也可能使它误判“已有声明”。

独立 `layout:false` 页面不保证继承主题注入，这是有意限定，不为了 RSS 修改私密页、游戏页或生日页。以后启用 PJAX 时检查 RSS 链接不被当作 HTML 页面局部加载；当前无需修改 PJAX 配置。

## 11. 依赖与拟修改文件

| 文件 | 实施阶段用途 |
| --- | --- |
| `package.json`、`package-lock.json` | 精确固定 feed 4.0.0；新增 XML 解析依赖及 postbuild 校验命令 |
| `_config.yml` | 增加 feed 与 rss_subscription；保留主题、permalink、future、updated_option |
| `_config.butterfly.yml` | social 图标、两条 head 声明 |
| `scripts/rss-feed.js`（拟新增） | 薄生成入口、错误传播、两条路由 |
| `tools/lib/rss-feed-policy.js`（拟新增） | 公开筛选、字段投影、元数据与 XML 校验公共实现 |
| `tools/check-feed.js`（拟新增） | 不启动 Hexo 全站构建的落盘校验 CLI |
| `test/rss-feed.test.js`（拟新增） | Node 内置测试运行器的契约/边界用例 |
| 本专题和操作记录 | 更新实施、验证、部署的实际状态 |

共享辅助代码放在 `tools/lib/`，避免 `scripts/` 自动加载所有文件造成重复注册。XML 解析依赖应直接声明、固定审核过的版本，不能偷用插件的传递依赖路径；可优先评估与 Feedsmith 依赖树兼容的 `fast-xml-parser`，具体版本、许可证和已知风险在实施时复核。

本期不新增 RSS 说明页，不升级 kramed，不调整图片优化脚本，不批量给文章补字段。

## 12. 实施顺序与交接

1. 再核对 git diff、Node、lock、主题版本，保护用户文章改动；审阅本方案并获得实施授权。
2. 固定依赖，先在受控验证环境跑真实 XML 输出与 Hexo 7 模型测试；通过后接入本地生成器。
3. 加入配置、主题现有入口与校验命令，检查锁文件没有连带升级 Hexo、主题或无关包。
4. 按[验证清单](verification-plan.md)完成单元、clean build、输出审计和 ego-browser 双断点验收。
5. 更新本专题为“已实施/本地已验证”，仍不等于已部署。
6. 单独取得发布授权后才运行 `npm run pub`，分别核对两个目标的 XML 与主站响应。

当前交接：已按用户要求清理测试内容并部署，进行正式源码交付；原始方案的 mtime、30 篇窗口和旧文提醒限制仍有效。未来新改动仍遵守项目提交、推送和部署授权规则。

历史设计阶段验证：当时专题内部 11 个相对文件链接存在，索引入口已同步，`git diff --check` 通过；当时仅写文档。后续实施和上线状态以页首及实施记录为准。
