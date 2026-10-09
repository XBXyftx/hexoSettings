# RSS 版本兼容性与代码证据

> 调查日期：2026-10-09。主入口：[RSS 接入方案](README.md)。
> `代码事实` 与 `已验证` 分开列出；本报告不宣称已安装插件或已完成网站集成。
> 这是实施前调查快照；后续真实安装、GUID/作者兼容性问题和集成结果见[实施记录](implementation.md)，不能把本页的捕获桩结果当成当时已验证 XML。

## 1. 实装与上游版本

`代码事实`：根 package、lock、实际 `require(.../package.json)` 和主题本地清单交叉核对：

| 组件 | 本地版本 | 上游查询结果 | RSS 决策 |
| --- | --- | --- | --- |
| Node | 24.15.0 | 未进行 Node 最新版本选型 | 已满足 feed4 声明要求；其他发布机器须检查 |
| Hexo | 7.3.0 | 8.1.2，2026-05-06 发布 | 保留 7.3.0 |
| Butterfly | 5.3.2 定制版 | 5.7.0，2026-08-04 发布 | 保留本地版本和定制 |
| feed 插件 | 未安装 | 4.0.0，2026-02-08 发布 | 固定 4.0.0 为候选，完整集成待验 |
| kramed renderer | 0.1.4 | 本次未查询其最新版本 | 不换渲染器 |
| Pug renderer | 3.0.0 | 本次未查询其最新版本 | 仅复用现有模板入口 |
| Warehouse | 5.0.1 | Hexo 8 使用 6.x 范围 | Query 适配按 5.0.1 测试 |
| 根 hexo-util | 3.3.0 | feed4 精确依赖 4.0.0 | 允许 npm 为不同消费者分别解析，不强制覆盖根版本 |
| index-pin-top | 0.2.2 | 本次未查询其最新版本 | 独立排序，避免共享集合副作用 |
| deployer-git | 4.0.0 | 本次未查询其最新版本 | 保留双部署 |
| filter-optimize | 0.3.1 | 本次未查询其最新版本 | 按实际入口判断，不能只相信配置注释 |

上游数据来自 npm registry 与官方 GitHub releases，二者对三项最新发布版本相互印证。**这些是 2026-10-09 查询快照，不是未来实施时永远成立的 latest。**

## 2. feed 2/3/4 的实际差异

| 维度 | 2.2.0 | 3.0.0 | 4.0.0 |
| --- | --- | --- | --- |
| npm 发布日期 | 2019-11-27 | 2020-08-09 | 2026-02-08 |
| Node engines | >=8.10.0 | >=10.13.0 | >=20.19.0 |
| 主要运行依赖 | Nunjucks ^3、hexo-util ^1.3 | Nunjucks ^3、hexo-util ^2.1 | Feedsmith 2.9.0、hexo-util 4.0.0 |
| 开发测试 Hexo 声明 | ^4.0.0 | ^5.0.0 | 8.1.1 |
| 自定义 XML 模板 | 本次未深入该版本模板实现 | `template` 确实传给 Nunjucks | 生成器不读取 template |
| `enable:false` | 本次未深入该版本入口 | 不支持 | 支持，且在注册生成器前退出 |
| 单篇 `feed:false` | 本次未深入该版本筛选 | 不检查 | 不检查 |
| 草稿筛选 | 本次未深入该版本筛选 | `post.draft !== true` | `post.draft !== true` |

3.0.0 与 4.0.0 的 npm 元数据均未声明强制 Hexo peerDependency。因此：

- “4.0.0 用 Hexo 8.1.1 跑开发测试”不能推导为“只能运行于 Hexo 8”。
- “4.0.0 依赖 hexo-util 4”不能推导为“必须升级站点 Hexo 或所有 hexo-util 消费者”。
- 同样，缺少 peer 限制也不能推导为已验证兼容。真实序列化和全站构建仍是放行条件。
- 3.0.0 并非天然更适合 Hexo 7；它的开发测试基线反而是 Hexo 5，并引入老 Nunjucks 模板行为。

3.0.0 的 RSS 模板还会为启用评论的文章输出 `#disqus_thread`，而本站使用 Twikoo；4.0.0 生成实现没有这个硬编码。不能照搬旧教程模板。

官方 README 中“Hexo 4+: 2.x”属于过时的粗粒度说明，不能替代当前发布包 engines、源码与回归测试。4.0.0 release notes 汇总了历史 Node 16/18 变更，实际要求以发布包的 `>=20.19.0` 为准。

## 3. Hexo 7 真实生命周期

核心源码为本地 `node_modules/hexo/dist/`，不是从最新文档反推旧版本：

| 源码位置 / 符号 | 代码事实 | 设计影响 |
| --- | --- | --- |
| `hexo/index.js::_bindLocals` | posts 是 Post 查询；`_showDrafts()` 为真时不加 published 条件 | feed 自己检查 published，不能依赖默认生产配置 |
| `plugins/processor/post.js` | `_posts/` 和 `_drafts/` 映射 Post；草稿存 `published:false` | `draft !== true` 不足以表达当前模型草稿 |
| `plugins/processor/asset.js::processPage` | 普通源目录可渲染文件进入 Page | coffer、自定义页面不应进入 posts 数据源 |
| `hexo/load_plugins.js` | 先 loadModules，后 loadScripts；加载错误 catch 后记录日志 | 不能认为加载失败必然导致命令非零 |
| `extend/generator.js::register` | 同名注册替换；回调参数数目 >1 被当作 callback 风格包装 | 自定义生成器只接受一个 locals 参数 |
| `hexo/index.js::_runGenerators` | 生成器通过 `Reflect.apply(generator,this,[siteLocals])` 执行，异步 map | 不依赖生成器之间的执行先后，不改共享 locals |
| `hexo/index.js::_generate` | before_generate -> 路由刷新 -> after_generate | after_generate 不是静态文件全部落盘 |
| `plugins/console/generate.js` | load 完成后 firstGenerate 才写 public | XML 文件校验放 postbuild |
| `hexo/index.js::createLoadThemeRoute` | 主题 HTML 渲染后执行 injector 与 `_after_html_render` | XML 原始字符串路由不经过主题 HTML 过滤链 |
| `plugins/console/generate.js::wrapDataStream` | 非 bail 模式会记录部分流错误，不原样传递 | 检查命令退出码之外还要检查实际文件 |

`scripts/` 会被自动加载，辅助代码应放 `tools/lib/`，不把测试或任意库文件放入自动加载目录。

`scripts/private-posts-scanner.js` 与 `scripts/birthday-gift-scanner.js` 在 before_generate 写 JSON；它们不会因为本期 feed 方案而变成文章输入。本次不调用 Hexo.init/load，也不执行扫描器，以免仅调查就改写生成数据。

## 4. 时间、排序与共享状态

- `_config.yml` 使用 `timezone:''`、`updated_option:'mtime'`、`future:true`。
- `plugins/processor/post.js`：显式 updated 优先，其次按 updated_option，默认用 `stats.mtime`。
- `plugins/filter/post_permalink.js`：当前 `:title` 对应 slug；`date` 参与路径，展示标题不直接用于该占位符。
- `warehouse/dist/query.js::toArray` 直接返回 `this.data`；`sort` 使用 `this.data.slice().sort`，`filter` 新建数组和 Query。
- `hexo-generator-index-pin-top/lib/generator.js` 使用 `posts.data = posts.data.sort(...)`，确实修改共享集合。
- feed4 本身使用 Query.sort，不会直接继承置顶排序；本地适配仍必须保留这种“独立集合”语义，不可把 `toArray().sort()` 当复制。
- feed4 顶层 updated 只取第一篇，不是所有条目 updated 的最大值；修改窗口内旧文时，两者可能不一致。
- feed4 copyright 使用 `new Date().getFullYear()`，跨年即使文章未变也可能改变 XML 字节；不能用“永远逐字相同”定义协议稳定性。

本机对 61 篇文章做了内存日期转换比较：从空时区改成 Asia/Shanghai 的日期路径变化数为 0，但这只证明当前 Asia/Shanghai 环境，不是跨机器验证。**本期不顺手修改全站 timezone**。其他构建机器应使用一致时区，未来统一 timezone 必须单独审计文章 URL。

## 5. Butterfly 5.3.2 与 5.7.0

`代码事实`：

- 本地 `layout/includes/header/social.pug` 与上游 5.7.0 同路径内容在规范化换行后保持相同格式：图标键、`link || title || color`、`target="_blank"`。
- 本地首页 `header/index.pug` 与 `widget/card_author.pug` 都引用这一 social partial。
- 本地与 5.7.0 的 `head.pug` 都保留 `injectHtml(theme.inject.head)`；feed 声明不依赖新版专属 API。
- 本地 head 包含多项自定义文章 CSS、公告、加载效果等资源，不应整体替换为上游模板。
- 5.7.0 package 新增 `hexo-util ^4.0.0`、`moment-timezone ^0.6.3` 依赖；5.3.2 package 仅声明 Pug/Stylus renderer。无需为 RSS 承担主题升级面。
- 当前 `_config.butterfly.yml` 的 PJAX 为 false。现有社交链接即使以后开启 PJAX，也通过 `_blank` 被当前 PJAX 选择器排除。

结论只覆盖 RSS 所需入口，不代表两版 Butterfly 全部配置和定制都兼容。

## 6. 默认自动发现的局限

feed4 `lib/autodiscovery.js`：

1. 在整个输入字符串查找 `application/atom+xml` 或 `application/rss+xml`，不限定 `<head>`。
2. 发现其中一种 MIME 就直接返回，不能保证双格式都存在。
3. 注入依赖精确的小写 `<head>` 正则；不覆盖任意 HTML 结构。
4. 插入标题字符串不是完整的 HTML 属性转义方案；本站标题简单，但不应扩大其通用保证。

定向实验已复现正文中原样 MIME 代码示例触发跳过。当前缓存的首页和归档页 HTML 可以正常被插入两个 link，但它们不是本次新构建产物。

因此推荐关闭插件 autodiscovery，通过既有主题 `inject.head` 明确放置两条声明。正文示例、第三方注入或另一个 feed 声明不会影响该路径。

## 7. 已执行的只读验证

| 检查 | 结果 | 不能由此推导 |
| --- | --- | --- |
| package / lock / 实装版本交叉检查 | 上表一致 | 不代表所有发布机器一致 |
| front matter 结构化扫描 | 61 篇，全有 description，无显式 updated、feed/私密标志、permalink override 或未来日期 | 不代表私密系统具备访问安全 |
| npm registry + GitHub release 查询 | 最新发布信息相互吻合 | 不代表将来版本不变 |
| npm 发布 tarball SHA-512 校验 | feed4、hexo-util4、Feedsmith2.9 均与 registry integrity 匹配 | 不等于依赖安全审计 |
| Hexo7 + Warehouse5 内存模型 | 自定义 feed 字段保留；公开筛选得到预期集合，原 Query 不变 | 不等于全站生成 |
| 字段快照重新包装 Query | source/date 排序正确，修改快照 description 不影响原模型 | 不保证 Warehouse6 构造器永远相同 |
| feed4 生成器 + hexo-util4 的实际相关函数 + Hexo7 模型 | 模型接口可调用；默认包含 draft/optout/future，过滤后仅剩公开记录；Atom ID 与 RSS GUID 一致 | **Feedsmith 的两个序列化函数被数据捕获桩替代，未验证真实 XML 输出** |
| feed4 自动发现定向实验 | 正常 head 插两条；正文 MIME 示例导致跳过 | 不等于本地 UI 新功能验收 |
| 现有 public 首页、归档字符串内存实验 | 两者 head 结构可插入声明 | 缓存文件可能过时，不是本次 build 证据 |
| 当前时区日期比较 | 61 篇路径日期无变化 | 不是 UTC/Windows/远端 CI 测试 |

实验未运行 npm install/clean/build/pub，没有调用 Hexo.init/load 或向数据库保存。官方源码从发布 tarball 读取到内存，不写入 node_modules；只执行已读取的相关函数，不执行包安装脚本。

工具限制：web.run 在本次调查未返回可用结果，后续通过 ego-browser 访问官方 GitHub API/源码，通过 Node 读取 npm registry 和校验发布包。浏览器跨域访问 registry 失败后使用 Node fetch，未将网络失败解释为资源不存在。

## 8. 历史文档纠偏

以下只纠正与 RSS 决策直接相关的推断，不在本次顺带重写旧报告：

- [旧 Hexo 8 报告](../../05-performance-audit/2026-05-07-hexo-upgrade-feasibility/README.md)声称 hexo-util4 移除 gravatar；实际 4.0.0 发布包仍导出 gravatar，feed4 也导入它。
- “不同 hexo-util 大版本不能共存”不能成立为一般结论，Node/npm 可分别解析依赖。是否冲突应看实际 API 和解析路径。
- 旧报告把生成器 this 绑定当作新版本差异；当前 Hexo7 已明确使用 Reflect.apply 绑定上下文。
- [部署链旧文档](../../03-api-practices/deployment-pipeline.md)称 clean 删除 `.deploy_git`；当前 Hexo clean 只处理数据库、public 和 after_clean，deployer-git 入口未注册删除部署目录的 hook。
- 同文档称双部署失败相互独立；当前 deploy console 使用 Promise.each，第一目标 reject 会中断后续目标。不能凭“pub 运行过”认定双目标成功。
- filter-optimize 0.3.1 的实际入口仅在 css.bundle 或 js.bundle 为真时注册 after_generate；本站两个 bundle 均为 false，不能仅凭 `html.minify:true` 宣称它实际执行了全站压缩。

因此，本方案不以旧报告中的“必须升级/必须替换/必然不兼容”作为 RSS 前置条件。也不运行旧报告里的 reset、checkout、删依赖等回退命令。

## 9. 可追溯来源

外部均为官方发布者的一手材料；查询日期均为 2026-10-09：

| 编号 | 来源 |
| --- | --- |
| S1 | `https://registry.npmjs.org/hexo` |
| S2 | `https://registry.npmjs.org/hexo-generator-feed` |
| S3 | `https://registry.npmjs.org/hexo-theme-butterfly` |
| S4 | `https://api.github.com/repos/hexojs/hexo/releases/latest` |
| S5 | `https://api.github.com/repos/jerryc127/hexo-theme-butterfly/releases/latest` |
| S6 | `https://api.github.com/repos/hexojs/hexo-generator-feed/releases/latest` |
| S7 | `https://github.com/hexojs/hexo-generator-feed/tree/v4.0.0`，重点 index、lib/generator、lib/autodiscovery、test/index |
| S8 | `https://github.com/hexojs/hexo-generator-feed/tree/3.0.0`，重点 index、lib/generator、atom.xml、rss2.xml |
| S9 | `https://github.com/jerryc127/hexo-theme-butterfly/tree/5.7.0`，重点 package、head、header/social |
| S10 | `https://github.com/hexojs/hexo/blob/v8.1.2/lib/hexo/index.ts` |
| S11 | `https://registry.npmjs.org/hexo-util/4.0.0` 及其 dist.tarball |
| S12 | `https://registry.npmjs.org/feedsmith/2.9.0` 及其 dist.tarball |

关键源码指纹（SHA-256）：

```text
npm feed4 package/index.js
370b57c0a72b6f402ec4ffa4cfffe671b4b57885e9264d7d0ce1a63ce433829e
npm feed4 package/lib/generator.js
ae9683fbc11b2254d3267bea775c0abb89a18f3d150d0596806a1bb175c288c7
npm feed4 package/lib/autodiscovery.js
b6a4f402909df553747c74a6759eedec78d307fa43605252dcee6ff4c47fceac
local node_modules/hexo/dist/hexo/index.js
bec07a8ce3cf7a82c2e9aeb6e02435d9e6acf77d2ab672a4784b50b1669f69e1
```

未来 Hexo8 的相关入口仍存在，生成器上下文也相同，但 `_generate` 新增了 before_generate 前的 locals.invalidate，且 Warehouse 升为 6.x。故当前薄适配有迁移基础，但升级时须重跑契约测试，不能直接标为“已兼容 Hexo8”。
