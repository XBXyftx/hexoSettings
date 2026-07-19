# Blog Project Rules

> 博客项目的硬性边界。Agent 生命周期和任务路由见 [agent.md](agent.md)，文档维护规范见 [document-authoring-rules.md](document-authoring-rules.md)。

## 1. 内容与源文件

- 文章源文件位于 `source/_posts/`；修改文章前检查 front matter、同名 asset 目录和图片引用。
- 新文章按项目现有规范填写 `title`、`date`、`tags`、`categories`、`description` 和 `cover`；已有文章缺少字段时先判断是否属于历史例外，不批量改写无关文章。
- 文章图片优先使用 WebP，并使用文章 asset 目录中的相对路径；外部图片只能在来源可靠且需求明确时修改。
- Markdown 中的 HTML、主题标签插件、公式、Mermaid 和脚本片段必须遵守对应技术文档；不要把复杂 HTML 当作普通 Markdown 任意重排。
- 中文是博客主要语言；面向读者的新增文案保持中文，代码和路径遵循现有命名。

## 2. Hexo、脚本与生成数据

- 使用 CommonJS 和现有 `hexo.extend.*` 注册方式；脚本日志保留 `[PluginName]` 前缀并处理异常。
- `scripts/` 是 Hexo 生命周期插件，不要把生成态 JSON 当作唯一源文件，也不要未经确认删除或重命名脚本。
- 运行 `npm run build` 或 `hexo generate` 前先执行 clean；构建后检查 `git status`，因为扫描器可能重写 `source/coffer/private-posts.json` 或其他生成数据。
- 不为验证运行会删除源图的 `npm run webp`、`npm run opt` 或 `npm run pub`，除非用户明确授权并已确认备份/版本控制状态。
- 不直接编辑 `public/`、`.deploy_git/` 或其他生成输出修复源问题。

## 3. Butterfly 主题

- 不修改 `themes/butterfly/_config.yml` 默认配置；优先使用根 `_config.butterfly.yml`、`source/css/`、`source/js/` 或已有注入点。
- 修改 `themes/butterfly/` 前必须阅读 `06-theme-modifications/README.md` 和相关运行时文档。
- 每次主题文件修改都在 `06-theme-modifications/` 留下事实记录：文件、原因、改动、关联资源、可回滚性和验证状态。
- 涉及 PJAX、懒加载、Canvas、ResizeObserver、交互状态或页面生命周期时，必须检查初始化幂等性、销毁路径、移动端和 reduced-motion 行为。
- 主题修改不得顺手升级 Butterfly、Hexo 大版本或重构无关样式；先建立基线和回滚点。

## 4. 构建、部署与外部服务

- 本地构建、生成态资源审计和浏览器验证只能证明当前机器/当前时间的结果，不代表设备或线上环境必然通过。
- 部署前必须确认用户明确授权、目标范围和当前 Git 状态；双部署的 GitHub Pages 与私有服务器都需要单独记录结果。
- 不在文档、配置或脚本中写入 SSH 密钥、密码、Token、私有路径或真实敏感内容。
- `source/coffer/` 是客户端保护系统，不得承诺服务端保密；公开站点上的敏感内容必须迁移到真正受保护的服务。

## 5. Git 与授权

- 保留用户已有工作区差异；不使用 `git reset --hard`、`git checkout --`、批量删除或覆盖来“清理”工作区。
- 未经明确授权不得 `git commit`、`git push`、`hexo deploy`、`npm run deploy`、`npm run pub` 或修改远程仓库。
- 提交记录只作为历史证据，不作为测试、构建、浏览器、设备或部署证据。

## 6. 完成前检查

- 检查目标文件 diff 和 `git diff --check`。
- 检查 Markdown 链接、front matter、索引入口和生成文件契约。
- 删除临时日志、调试开关和临时文件，除非用户明确要求保留。
- 明确列出已执行的验证和仍待人工/浏览器/设备/网络验证的项目。
