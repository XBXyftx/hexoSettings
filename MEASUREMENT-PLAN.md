# 首页瀑布流性能量化方案

## 目标

量化提交 `9988ac4`（`perf: 重写首页响应式瀑布流`）相对于优化前基线 `69772c8` 的实际收益。评估对象只限首页瀑布流；不把全站星空、页脚计时器等其他持续任务错误归因给本次改动。

## 已确认的静态对照

| 指标 | 优化前 `69772c8` | 当前实现 `9988ac4` | 解释 |
|---|---:|---:|---|
| `waterfall.js` 源码体积 | 26,246 B | 8,462 B | 减少 17,784 B，约 67.8%。这是源码/未压缩静态体积，不等同于页面总下载量。 |
| 移动端 `setInterval` | 2 | 0 | 删除每 100ms 的卡片扫描/重置循环。 |
| `MutationObserver` | 1 | 0 | 删除生产调试型 DOM 观察。 |
| `console.*` | 47 | 0 | 删除生产调试输出。 |
| `style.cssText` 整体覆写 | 10 | 0 | 改为仅写入或清理模块拥有的 CSS 属性。 |
| 当前首页 fixture | 15 张卡片 / 15 张封面图 | 相同内容 | 实测时必须用同一页、同一分页状态。 |

静态数据证明异常工作已被移除，但不能替代真实设备 CPU、耗电、帧率或发热结论。

## 可比测试矩阵

| 场景 | 视口 | 时长 | 每个版本重复次数 | 首要指标 |
|---|---:|---:|---:|---|
| 移动端空闲 | 375 × 812，DPR 2 | 60 秒 | 3 | 空闲脚本活动、CPU、长任务、FPS |
| 移动端连续滚动 | 375 × 812，DPR 2 | 30 秒 | 3 | 滚动帧、Main thread、Layout/Style、长任务 |
| 断点切换 | 1440 → 1024 → 375px | 每档等待 5 秒 | 3 | 3/2/1 列正确性、重排次数、无重叠 |
| 桌面稳定性 | 1440 × 900，DPR 1 | 30 秒空闲 + 30 秒滚动 | 3 | 初次布局、图片 settle 后重排、无布局错位 |

所有对比必须使用：同一台设备、同一 Chrome 版本、相同缩放比例、相同网络条件、相同主题（建议固定深色模式）、同一首页数据。每组至少取中位数，避免单次偶发 GC、缓存或后台进程影响结论。

## 需要采集的结果

### 1. 结构性指标（可直接做结论）

- 空闲 60 秒内：是否存在每 100ms 重复执行的瀑布流脚本任务。
- 滚动 30 秒内：是否存在瀑布流监听器引发的整批卡片内联样式覆写。
- Console：是否仍产生瀑布流调试日志。
- 布局：375px 为一列、769–1200px 为两列、>1200px 为三列；分页始终位于卡片之后。

### 2. Chrome Performance trace 指标（核心）

每次 trace 在 DevTools Performance 面板记录以下值：

| 指标 | 记录方法 | 如何比较 |
|---|---|---|
| Main thread busy time | 查看录制区间内主线程脚本、Style、Layout、Paint 的累计时长 | 各版本三次中位数；越低越好。 |
| 脚本活动次数与原因 | 在 Bottom-up / Call tree 搜索 `waterfall`、`setInterval`、`forceResetMobile`、`WaterfallLayout` | 旧版应有 10Hz 轮询；新版空闲时不应有周期性瀑布流任务。 |
| Rendering: Recalculate Style / Layout | 在 Summary 或 Bottom-up 记录总耗时和调用次数 | 滚动与空闲都比较；新版应消除由监听器反复触发的整批重写。 |
| Long tasks | 搜索超过 50ms 的主线程任务并记录数量、最长时长 | 不把其他脚本任务归因给瀑布流；记录调用栈。 |
| Frames / FPS | 打开 FPS meter 或 Performance Frames 轨道 | 比较滚动时掉帧、低于 50 FPS 的区间。 |
| JS heap（辅助） | Memory 轨道或 Performance monitor | 仅关注是否持续上升；瀑布流改动不应产生监听器/observer 泄漏。 |

### 3. 用户体验指标（辅助而非唯一结论）

- 首页首次显示到卡片稳定排列的时间；以 trace 中第一个完整卡片布局时刻为准。
- 30 秒滚动时可感知卡顿次数（每次卡顿截图/标注时间）。
- 设备温度、风扇噪声和电量下降只能作为主观佐证，不能单独作为量化结论。

## 自动化采集器设计

仓库没有 Playwright、Puppeteer 或 Lighthouse 依赖，但本机存在 Google Chrome，并可从 Node 使用现有的 `ws` 包连接 Chrome DevTools Protocol。建议新增一个仅本地运行、不会被首页加载的工具：

`tools/benchmark-waterfall.js`

职责：

1. 使用独立 Chrome profile 和固定命令行参数启动本地 Chrome；不访问或修改生产站点。
2. 访问本地 `hexo server` 的首页；执行冷缓存与热缓存两类运行。
3. 分别以 375×812、1024×900、1440×900 视口运行。
4. 通过 CDP 采集 Performance trace、`Performance.getMetrics`、Console、Network 请求和 DOM 布局断言。
5. 运行 60 秒空闲与 30 秒可控滚动；记录瀑布流调用/样式写入次数、Long Task、Layout/Style 时长、FPS 样本、内存变化。
6. 输出带时间戳的 JSON 原始数据、trace 文件及 Markdown 汇总到 Git 忽略的本地目录，例如 `.local-benchmarks/waterfall/<run-id>/`。
7. 将当前 `waterfall.js` 与从 Git 读取的 `69772c8:themes/butterfly/source/js/waterfall.js` 分别作为待测脚本，保持同一份生成首页 HTML、资源和 Chrome 配置，从而做同机 A/B 对比。

为保证不影响访客，采集器不应：

- 修改生产运行时脚本以埋点；
- 提交、推送、部署生成结果或 trace；
- 运行 `npm run pub`、`npm run dev`、`npm run opt` 或 `npm run webp`；
- 以外部网络测速替代同机 A/B 比较。

## 手工 DevTools 操作（可立即执行）

1. 在一个终端执行 `npm run server`，打开本地首页。
2. Chrome 打开 DevTools → Performance；勾选 Screenshots、Web Vitals，必要时在 Rendering 面板开启 FPS meter。
3. 在 Device Toolbar 选择 375 × 812、DPR 2；保持网络与 CPU 默认值，不混入 DevTools throttle。
4. 先录制 60 秒不操作的空闲 trace；再新建一次 30 秒连续滚动 trace。每类做三次。
5. 在 trace 的 Bottom-up 中检索 `waterfall`、`setInterval`、`forceResetMobile`，导出 `.json` trace。
6. 针对 1024px 与 1440px，截图确认 2 列与 3 列，缩放/旋转后确认无卡片重叠和分页覆盖。
7. 把 trace 文件、截图和 Console 导出结果提供给分析者；以同指标表计算中位数与百分比变化。

## 判定原则

可以明确声称：

- 移动端的 100ms 瀑布流轮询、调试 observer、生产 console 输出和 `cssText` 全量覆写已被移除。
- 在真实 trace 中未出现旧版的 10Hz 瀑布流空闲任务（若 trace 证实）。
- 某个具体指标在指定设备、浏览器、时长和中位数下改善了 X%。

不能仅凭本方案声称：

- 所有访问者 CPU 降低固定百分比；
- 所有设备不会发热或风扇不会转；
- 首页整体 Lighthouse / LCP 改善均由瀑布流改动造成。

后续报告必须注明测试日期、Git commit、Chrome 版本、设备、视口、缓存状态、运行次数和统计方式。
