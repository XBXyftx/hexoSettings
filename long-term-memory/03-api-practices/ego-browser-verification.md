# ego-browser 浏览器验证

> 真实浏览器验证工具的用法与本项目已验证流程。本地预览（localhost）视觉/DOM 验收的默认手段。

## 为什么引入

此前多次主题修改的验证卡在「内置浏览器策略拒绝访问本地预览地址」（见 [../06-theme-modifications/README.md](../06-theme-modifications/README.md) #12、#14、#15 的验证边界），大量视觉结论只能标记为「待人工确认」。ego-browser 提供可脚本驱动的真实浏览器，继承用户登录态，Agent 可独立完成本地预览的浏览器级验证，补齐「静态检查 → 构建 → 浏览器」证据链的最后一环。

## 工具事实

- 用户级 skill：`ego-browser`（通过 `Skill` 工具加载，或由用户激活）。
- 调用方式：`ego-browser nodejs <<'EOF' ... EOF`，heredoc 体作为 Node.js 脚本执行，browser helper（`js`、`cdp`、`click`、`scrollBy`、`openOrReuseTab` 等）已预加载。
- 任务空间（task space）：隔离的浏览上下文，继承用户登录态；跨 heredoc 轮次用 `useOrCreateTaskSpace(名字或数字 id)` 复用。
- 输出：只有 `cliLog()` 会打印到终端；`js()` 直接返回求值结果，不要 `JSON.parse`。
- `wait()` 与超时参数单位是**秒**。
- 用户从 GUI 接管任务空间是硬停止，不得重试或自动夺回；结束后用独立最后一轮 heredoc 调 `completeTaskSpace(id, { keep: false })`（默认关闭空间）。

## 本项目标准验证流程（已验证可用）

1. 后台启动 `npm run server`，用 `curl` 轮询 `http://localhost:4000/` 返回 200 后再开浏览器。
2. 第一轮 heredoc 用任务名建空间并记录返回的数字 `task.id`，后续轮次用数字 id 复用。
3. `openOrReuseTab('http://localhost:4000/', { wait: true, timeout: 30 })}` 打开页面。
4. 验证图片类元素（footer 徽章、lazy 图片）时：先 `scrollIntoView` 把元素滚进视口，再等 `load` 事件（并设超时兜底），**确认 `complete === true` 且 `naturalWidth > 0` 后再截图**。未加载的 `loading="lazy"` 图片 `getBoundingClientRect()` 为 0×0，截图会漏。
5. 页面状态用 `js()` 内单个 IIFE 一次取回（元素 rect、`naturalWidth`、链接 href 等）。
6. 截图用 CDP：`cdp('Page.captureScreenshot', { format: 'png' })` 返回 base64，Node 侧写 PNG 后用 `ReadMediaFile` 查看；细节用 `region` 参数按原图像素裁剪放大。
7. 收尾：`completeTaskSpace(id, { keep: false })`；停掉 hexo server 后台任务；删除临时截图。

## 已验证的坑（2026-08-10 实测）

| 现象 | 事实 | 应对 |
| --- | --- | --- |
| `help('captureScreenshot')` 等返回 `Unknown helper` | `help()` 文档缺失不代表函数不存在；`captureScreenshot`、`snapshotText` 等实际可用 | 不以 `help()` 判断 helper 可用性 |
| heredoc 内 `require('fs')` 报错 | heredoc 是 ESM 上下文（存在 top-level await），`require` 触发模块格式错误 | 用 `await import('fs')` |
| `serverFetch` 访问 github.com 超时 | Node 侧网络与本机浏览器网络栈不一致；同 URL 页面上下文 `fetch` 返回 200 | 外链探测优先在页面上下文 `fetch` |
| 滚动后立刻截图徽章缺失 | 图片加载期间页面高度变化，元素移出视口 | 截图前重新 `scrollIntoView` 并读 rect 确认在视口内 |

## 成功案例：2026-08-10 footer 部署状态徽章

**需求**：在博客 footer 放 Netlify 与 GitHub Pages（`xbxyftx.github.io`）两个部署状态徽章，并排显示。

**改动**（配置级，未改主题文件）：`_config.butterfly.yml` 的 `footer.custom_text` 在备案号后追加一个 `<div>`，内含三个并列徽章链接（2026-08-11 用户确认的最终形态——**三个部署域名并列，全部跳站点域名而非构建页**）：

- Netlify：`api.netlify.com/api/v1/badges/<site-id>/deploy-status` 状态图，链接 `https://xbxyftx.netlify.app/`（已 curl 确认 200 且为博客首页）。
- GitHub：Actions workflow status badge（`pages-build-deployment`，GitHub Pages 自动构建对应工作流），链接 `https://xbxyftx.github.io/`。
- 华为云：shields.io 静态徽章 `img.shields.io/badge/华为云-xbxyftx.top-blue`（中文 label 需 URL 编码），链接 `https://xbxyftx.top/`；私有服务器无构建状态 API，故用静态徽章保持视觉统一。

**查证结论（GitHub 官方文档，已验证）**：workflow badge URL 格式为 `https://github.com/OWNER/REPO/actions/workflows/WORKFLOW-FILE/badge.svg`；**私有仓库的徽章对外不可访问**——当前仓库公开，可用；若转私有徽章会失效。

**验证链**：

1. `npm run clean && npm run build` 成功；生成态 `public/index.html` footer 断言包含两个徽章（Hexo 外链处理器自动补 `target="_blank" rel="noopener"`，`image-dimensions.js` 只加 `loading="lazy"`，外链图不注入尺寸）。
2. ego-browser 打开本地预览：两个徽章 `complete === true`，自然尺寸 118×20 / 211×20，rect 同 y 坐标确认并排居中。
3. CDP 截图 + `ReadMediaFile` region 复核：`netlify | success` 与 `pages-build-deployment | passing` 视觉正常。

**状态**：本地构建与浏览器验证通过；未提交、未推送、未部署。
