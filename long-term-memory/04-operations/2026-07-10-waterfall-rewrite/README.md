---
name: 2026-07-10 瀑布流重写
summary: 首页响应式瀑布流 P0 重写的基线、实施边界和验证记录
---

# 2026-07-10 首页瀑布流 P0 重写

> **状态**：实施中。本文只记录事实；未完成的验证不得写为已通过。
> **关联审计**：[2026-07-10 渲染性能与长期记忆事实审计](../../05-performance-audit/2026-07-10-render-performance-audit/README.md) 的 P0 项。

## 优化前远程备份基线

- **Git commit**：`69772c847d46b251eafa028394b6f1ebef291b68`
- **短哈希**：`69772c8`
- **提交说明**：`docs: 记录渲染性能审计基线`
- **远程位置**：`origin/master`
- **远程核验**：`origin/master` 已指向同一完整哈希。
- **备份时点**：2026-07-10，在任何瀑布流源码或样式改动之前。

按本次任务约束：上述提交已推送并验证；从现在开始直到本次实施结束，**不得再推送、强推、重写或以其他方式修改远程仓库**。恢复可基于该完整哈希在本地执行，任何恢复动作须先获得用户确认。

## 问题与目标

旧 `themes/butterfly/source/js/waterfall.js` 同时承担布局、移动端样式兜底和调试职责，移动端含有 100ms 全量 DOM 扫描、捕获式 scroll/touch/click/resize 监听、批量 `style.cssText` 重写及 `MutationObserver` 调试日志。这些逻辑会在访问首页时持续运行。

本次重写目标：

1. 首页文章卡片保持当前视觉语言、文章顺序、卡片内容和分页行为。
2. 大屏最大三列；中等宽度两列；窄屏一列，并且断点切换可靠。
3. 移动端不运行轮询、调试 observer、全局捕获式滚动监听或生产日志。
4. 只在明确的初始化、卡片/图片尺寸变化或容器宽度变化时重排；合并同一渲染帧内的重复请求。
5. 用 CSS 承担静态视觉样式，用最小 JS 只计算 masonry 坐标；不再注入运行时 `<style>`，不通过 `cssText` 清空卡片已有内联属性。
6. 保留窗口 resize / 设备旋转后的断点适配，且具备 `destroy()` 清理路径。

## 计划中的文件范围

- `themes/butterfly/source/js/waterfall.js`：整体重写为单一、可清理的 masonry 控制器。
- `themes/butterfly/source/css/styles.css`：移除移动端针对内联样式的属性选择器“看门狗”及已废弃的 `fade-in` 动画，只保留 CSS 单列和既有卡片视觉规则。
- `long-term-memory/06-theme-modifications/README.md`：完成后记录主题变更。
- 本文：补充实际验证结果、实现 commit（若用户后续要求提交）与遗留项。

不会修改文章、媒体、主配置、首页模板结构、分页模板或远程仓库。

## 验收与验证矩阵

| 场景 | 预期 |
| --- | --- |
| 大屏（≥1201px） | 恰为三列；卡片不重叠；列间距和卡片视觉稳定；分页位于最长列之后。 |
| 中等屏（769–1200px） | 恰为两列；不出现旧绝对定位残留、横向滚动或分页覆盖。 |
| 窄屏（≤768px） | 单列、文章顺序不变、间距稳定；滚动时没有 100ms 查询或样式重置。 |
| 图片延迟成功/失败 | 图片加载后仅请求一次合并重排；卡片不重叠；失败图片回退不阻断页面。 |
| resize / orientationchange | 断点前后重新布局，不遗留旧 width/left/top/height。 |
| 反复初始化/未来 PJAX | 控制器销毁 listener、observer、RAF 和图片监听器；不会重复绑定。 |
| 构建产物 | 完整 clean + generate 后首页加载对应 JS/CSS，Pug/Stylus 编译无错误。 |
| 浏览器人工回归 | 首页宽度切换、滚动、分页跳转、图片悬浮和深/浅色模式均保持可用。 |

## 当前验证状态

- [x] 修改前审计文档已提交并推送到 `origin/master`。
- [x] 已核验远程 `origin/master` 与基线完整哈希一致。
- [x] `node --check themes/butterfly/source/js/waterfall.js` 通过。
- [x] 独立编译 `waterfall-homepage.styl` 通过。
- [x] 静态检查确认 `waterfall.js` 不再包含 `setInterval`、`MutationObserver`、`console`、scroll/touch 监听。
- [x] 基于现有首页 15 张文章卡片的 jsdom harness：验证 1440px=3 列、1024px=2 列、375px=1 列、图片 load 的单帧合并重排，以及容器/卡片 `ResizeObserver` / PJAX teardown。
- [x] `npm run build` 已完成：121 个文件生成成功；未执行 WebP 转换、未执行部署、未修改远程仓库。
- [x] 本地 `http://localhost:4000/` 冒烟检查：首页、`/js/waterfall.js`、响应式 CSS 均以 HTTP 200 提供。
- [ ] 浏览器人工视觉回归与优化前后 Performance 对比：本环境没有可调用的真实浏览器自动化工具，仍需在本地浏览器完成。
