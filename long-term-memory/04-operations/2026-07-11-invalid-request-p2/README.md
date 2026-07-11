---
name: 2026-07-11 P2 失效请求修复
summary: 清理已验证的本地和全局失效资源请求，保留无法安全复原的远程文章原图并量化修复结果
status: completed
rollback_baseline: 8863b704ab99f792cd10bd97fcb5651aa68cecec
---

# 2026-07-11 P2 — 失效请求修复与网络正确性治理

> **状态**：本地实施中。P2 回滚基点 `8863b704ab99f792cd10bd97fcb5651aa68cecec` 已于开始修改前推送至 `origin/master`。在本次 P2 实施、构建、测试和文档记录完成前，**不再推送、部署、强推或以任何方式修改远程**。
>
> **范围**：只处理已证实失效、且可在不猜测原始内容的前提下安全修复的请求；不做视觉重设计，不处理星空效果，不虚构丢失的外部文章原图。
>
> **构建授权**：允许执行一次 `npm run build` 用于本地测试；该命令允许更新其生成文件 `source/coffer/private-posts.json`，但不允许部署。

---

## 1. 目标与非目标

### 1.1 目标

1. 消除全站 Mermaid `mermaid@undefined` 404；
2. 修复 WebP 转换后仍指向旧 GIF/JPG/PNG 的全局 fallback 与默认页头图；
3. 修复已存在同名 WebP 的友链、文章友链和文章资源引用；
4. 修复 MarkdownPreview 公开页面中已验证失效的演示图片 URL；
5. 新增可复用的本地资源审计工具，在生成态量化本地缺失资源与可探测外部媒体请求；
6. 明确区分“已修复”“无法安全修复”和“探测不确定”的结果，避免把未处理资源写成已解决。

### 1.2 非目标

- 不改动页面布局、色彩、动画、星空或媒体加载策略；
- 不将缺失的远程图片随意替换成无关本地编号图片；
- 不迁移 102 个视频或所有外链图片；
- 不修改远程仓库和部署目标；
- 不把外部网络探测结果当作永久可用性承诺。

---

## 2. 回滚与工作区边界

| 项目 | 值 |
| --- | --- |
| P2 基点 | `8863b704ab99f792cd10bd97fcb5651aa68cecec` |
| 基点内容 | P1 星空实验归档、实际星空回退与长期记忆记录 |
| 远程状态 | 基点已推送至 `origin/master` |
| P2 远程规则 | 基点之后不推送、不部署、不改远程 |
| 无关未跟踪文件 | `source/_posts/ModelMusings/7.png`；不纳入本次修改、测试或提交 |

如本轮结果不符合预期，应优先恢复 P2 涉及文件至该基点；不得使用 `git reset --hard` 覆盖无关后续工作。

---

## 3. 审计方法与基线

### 3.1 生成态扫描

对当前 `public/` 的 182 个 HTML 文件扫描 `src`、`href`、`poster` 等资源属性，并检查根相对本地资源是否存在于 `public/`。该扫描不将页面路由、锚点、HTML 链接或第三方 API 当作静态资源。

| 指标 | 基线 |
| --- | ---: |
| 生成 HTML 页面 | 182 |
| 唯一缺失根相对静态资源 | 12 |
| 缺失根相对资源引用总数 | 1,846 |
| `/img/404.jpg` fallback 声明 | 1,462 |
| `/img/friend_404.gif` fallback 声明 | 374 |
| 其余直接缺失本地资源引用 | 10 |

### 3.2 外部直接媒体探测

从生成 HTML 提取 145 个唯一的外部 CSS、JS、图片、视频和字体 URL，以 `HEAD`（必要时可降级为小范围 GET）探测。探测时仅代表本机、当前网络、当前时间；CDN 的临时限制、反爬或网络故障会被记录为不确定，不直接等同于内容永久失效。

已确认的失败包括：

| 请求 | 生成引用 | 受影响页面 | 结果 | 现状 |
| --- | ---: | ---: | --- | --- |
| `https://unpkg.com/mermaid@undefined/dist/mermaid.min.js` | 178 | 178 | HTTP 404 | 全站无意义失败请求 |
| GitHub Raw 文章图（7 个 URL） | 7 | 2 | HTTP 404 | 正文图片破损，原图不在仓库 |
| LeetCode 文章图（1 个 URL） | 1 | 1 | HTTP 404 | 正文图片破损，原图不在仓库 |
| MarkdownPreview `.webp` 演示图 | 4 | 2 | HTTP 404 | 演示页面可见破图；同 URL `.jpg` 可用 |
| 友链外部头像 `img.picui.cn` | 1 | 1 | 连接失败 | 不纳入本轮自动修复，需后续人工确认 |

### 3.3 内容存在性验证

- `source/` 中未发现 Mermaid fence 或 `{% mermaid %}` 内容；关闭 Mermaid 不会删除现有图表。
- 102 个生成态本地视频 source 均解析至存在文件；不纳入本轮。
- 7 个 GitHub Raw 图和 1 个 LeetCode 图在工作树及 Git 历史中均未找到同名原图；不替换。
- 外部背景、首页图、tag 图等高覆盖 `bu.dusays.com` 资源在审计时可访问，不改动。

---

## 4. 已确认的修复对象与策略

### 4.1 全局 Mermaid 失效请求

- **来源**：`_config.butterfly.yml` 开启 Mermaid，`themes/butterfly/layout/includes/footer.pug` 将缺少版本号拼接成 `mermaid@undefined`。
- **显示状态**：当前无 Mermaid 内容，因此用户不会失去图表；Network 仍会显示每页 404。
- **策略**：将 `mermaid.enable` 设为 `false`，从主题已有条件链中移除无用 loader。未来首次引入 Mermaid 时，需使用已固定版本并且只在含 Mermaid 的页面按需加载。

### 4.2 全局图片 fallback

- **来源**：`error_img.flink` 与 `error_img.post_page` 仍指向 `friend_404.gif` / `404.jpg`；同位置 WebP 文件已经存在。
- **显示状态**：正常主资源成功时不显现；任一封面、头像或友链图片失败时，二次 fallback 也会失败，导致用户看到破图。
- **策略**：仅将配置改为 `/img/friend_404.webp` 与 `/img/404.webp`。

### 4.3 默认页头图

- **来源**：`default_top_img` 仍指向已不存在的 `/img/bg2.png`，而 `/img/bg2.webp` 已存在。
- **显示状态**：未显式设置 `top_img` 的页面会请求旧 PNG 并显示空白/缺失页头背景；浏览器抽样已确认 MarkdownPreview 返回本地 HTTP 404。
- **策略**：仅将默认配置改为 `/img/bg2.webp`；不改变图片内容或页面布局。

### 4.4 已有 WebP 的 stale 引用

- `source/_data/link.yml`：7 个友链头像仍为 PNG/JPG，同名 WebP 已存在。
- `source/_posts/“HongXiaoYi”.md`：2 个 `flink` 头像误指向文章路由 PNG/JPG；全局 WebP 已存在。
- `source/_posts/yiDuo.md`：3 处全角 `！[` 使已有图片渲染为链接。
- `source/_posts/OpenSourceSummer2025.md`：1 处全角 `！[`；2 处将实际 `22.mp4` 错写成不存在图片或页面相对视频 URL。
- **策略**：改为同名已存在 WebP，修正 Markdown 感叹号，并以 post asset folder 可解析的 `<video>` 引用实际 MP4。

### 4.5 MarkdownPreview 演示图

- **来源**：正式 `index.md` 与公开 `index-backup-original.md` 各有 2 个实际渲染 `.webp` URL，返回 404；代码示例中的字符串也保留相同 URL，但不会发起浏览器资源请求。
- **策略**：仅把实际显示和示例中的 `.webp` URL 改为已验证 HTTP 206 / `image/jpeg` 的同路径 `.jpg`，使示例源码和显示结果一致。

---

## 5. 有意保留的已知失败

以下资源已经确认失败，但没有可验证的原始本地副本。本轮不以猜测性替换掩盖内容缺失：

1. `鸿蒙网络请求学习笔记.md` 的 4 张 GitHub Raw 图片；
2. `鸿蒙中文包.md` 的 3 张 GitHub Raw 图片；
3. `EverydayAlgorithm.md` 的 1 张 LeetCode 图片；
4. `link.yml` 的 `img.picui.cn` 头像连接失败（外部可用性不确定，暂不擅自更换）。

它们会在最终资源报告中作为“确认遗留 / 待人工提供原图或许可的替代图”单列，绝不计入已修复数。

---

## 6. 验证与量化标准

实施后运行一次 `npm run build`，并执行：

1. JS/YAML 静态校验与 `git diff --check`；
2. 生成态本地资源扫描；
3. 外部直接媒体探测；
4. 临时本地 HTTP server + Headless Chrome 访问首页、友链页、两篇受修文章、MarkdownPreview，采集实际网络失败数与关键 DOM 断言；
5. 对比基线与当前的 JSON/Markdown 报告。

预期的、可严格断言的变化：

| 指标 | 基线 | 目标 |
| --- | ---: | ---: |
| Mermaid `@undefined` 页面请求 | 178 | 0 |
| Mermaid HTTP 404 引用 | 178 | 0 |
| 失效 fallback 声明 | 1,836 | 0 |
| 可安全修复的缺失根相对资源目标 | 16 | 0 |
| 已发现的默认页头背景 PNG 请求 | 18 个生成页面 | 0 |
| MarkdownPreview 失效 `.webp` 直接媒体引用 | 4 | 0 |
| 明确保留的远程正文图片失败 | 8 | 8（单列遗留） |

### 7.1 实施结果

已完成以下安全修复：

1. `_config.butterfly.yml`
   - 关闭当前无内容使用的 Mermaid；
   - `error_img.flink` 改为 `/img/friend_404.webp`；
   - `error_img.post_page` 改为 `/img/404.webp`；
   - `default_top_img` 改为已存在的 `/img/bg2.webp`。
2. `source/_data/link.yml`
   - 将 7 个已存在同名 WebP 的友链头像从旧 PNG/JPG 更新为 WebP；
   - 不修改 `img.picui.cn` 外部头像，因为当前探测只得到连接失败，无法可靠判断其长期可用性。
3. 文章内容
   - `yiDuo.md`：修正 3 处全角 `！[`，恢复 20、23、26 三张已存在图片的正常渲染；
   - `OpenSourceSummer2025.md`：修正 11.webp 的全角 Markdown 感叹号；将不存在的 22.webp 改为实际存在的 `22.mp4` 视频元素，继续使用 post asset folder 的页面相对 URL；
   - `“HongXiaoYi”.md`：将 2 个 `flink` 头像更新为对应 WebP，生成时解析到文章资源目录中的同名 WebP；
   - MarkdownPreview 正式页和公开 backup 页：4 处失效 `.webp` 示例 URL 改为同路径已验证可用的 `.jpg`，包括示例代码与实际展示，避免文档示例和输出不一致。
4. 新增本地检查工具
   - `tools/audit-resource-requests.js`：扫描生成 HTML/CSS 的本地静态资源目标，并可受限并发探测外部媒体；默认报告只写系统临时目录；
   - `tools/verify-resource-requests.js`：临时本地 server + 独立 Headless Chrome profile 检查 6 个代表页面的 DOM、请求和本地 HTTP 错误；默认报告只写系统临时目录。

### 7.2 最终量化结果

| 指标 | 基线 | 修复后 | 变化 |
| --- | ---: | ---: | ---: |
| 生成 HTML 页面 | 182 | 182 | 0 |
| 本地缺失唯一资源目标 | 16（旧审计规则） | **0** | 已清零 |
| 本地缺失资源引用 | 1,850（旧审计规则） | **0** | 已清零 |
| Mermaid `@undefined` 外部请求 | 178 | **0** | -178 |
| 外部失败/不可达媒体目标 | 12 | 9 | -3 |
| 外部失败/不可达媒体引用 | 369 | 9 | -360 |
| Headless Chrome 代表页 HTTP ≥400 | 1（修复中途发现的 `bg2.png`） | **0** | 已清零 |
| Headless Chrome 禁止旧 URL DOM / 请求 | — | **0 / 0** | 通过 |

外部探测目标数量从 206 增到 207、生成本地引用数量从 11,212 增到 11,675，属于审计器新增对 HTML inline-style `url()` 和更多属性扫描后的覆盖扩大，不能被解读为网络负载增加。缺失数和失败数以修复前后的同一审计器口径为准：最终 0 个本地缺失目标、9 个有意保留的远程失败目标。

### 7.3 实际验证

- `npm run build` 成功：182 个文件生成，未部署；授权允许的 `source/coffer/private-posts.json` 没有产生工作区差异。
- `node --check tools/audit-resource-requests.js`、`node --check tools/verify-resource-requests.js` 通过。
- 修改后的 `_config.butterfly.yml` 与 `source/_data/link.yml` 经 YAML parser 成功解析。
- `git diff --check` 通过。
- 最终本地资源审计：`/tmp/hexo-resource-final2-local-rgbAYM/resource-audit.md`，本地缺失为 0。
- 最终外部资源审计：`/tmp/hexo-resource-final-external-kjG7OQ/resource-audit.md`，只剩 9 个明确列出的远程失败/不可达资源。
- 最终浏览器验证：`/tmp/hexo-resource-browser-final3-YxRX4J/browser-resource-verification.md`；首页、友链页、yiDuo、HongXiaoYi、OpenSourceSummer2025、MarkdownPreview 共 6 页均为：禁止旧 URL DOM 0、禁止旧 URL 请求 0、浏览器 HTTP ≥400 0、本地加载失败 0。

### 7.4 明确保留的遗留问题

仍有 9 个外部媒体目标在本机探测中失败/不可达：7 个 GitHub Raw 正文图片、1 个 LeetCode 正文图片、1 个 `img.picui.cn` 友链头像。前 8 张正文图因原始文件不在工作树或 Git 历史中，本轮不猜测替换；外部头像仅发生连接失败，不足以安全判定为永久失效。详见第 5 节。

### 7.5 远程与部署状态

P2 基点推送后，本轮没有远程推送、部署、强推或其他远程写操作。所有构建、审计和浏览器测试都在本地进行。
