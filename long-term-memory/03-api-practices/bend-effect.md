---
name: Bend 页面边缘折叠效果尝试（已回退）
description: 归档 Canvas UI Bend 的兼容性调查、替代实现、验证结果与最终回退结论
---

# Bend 页面边缘折叠效果尝试（已回退）

> **当前结论（2026-07-30）**：用户视觉验收认为效果很差，Bend JS/CSS、主题入口、右键开关和独立生日页接入已完整删除或恢复。当前站点没有 Bend 资源、控制器、效果 DOM 或 `blog:bend-enabled` 业务入口。

## 尝试背景

用户提供的 Canvas UI Bend 上游实现依赖实验性 `CanvasRenderingContext2D.drawElementImage` 与 `HTMLCanvasElement.requestPaint`。当时 Codex 内置浏览器均不支持这两个 API，直接复制 React 组件无法可靠捕获并重绘页面内容。

因此实验版本采用不接管页面 DOM 的 CSS 3D 顶、底折叠层：根据页面滚动、鼠标位置和边缘滚轮输入改变角度、阴影与透明度。这只是保留 Bend 交互语义的兼容替代，并非上游 HTML-in-Canvas 的逐像素重映射；最终视觉表现未被采用。

## 当时实现范围

- 实验文件：`bend-effect.js`、`bend-effect.css`，并曾修改 `head.pug`、右键菜单 JS/CSS/Pug 和 `source/birthday-gift/index.html`。
- 页面范围：Butterfly 非文章页及 `layout:false` 的生日页；文章页通过模板与运行时双重排除。
- 参数语义：`zone=240`、`angle=80`、`rounding=150`、`perspective=700`、`ease=240`、`smoothing=0.1`、`tumble=0.5`、`tilt=0.5`、`direction=in`，顶部和底部启用。
- 生命周期：效果层 `pointer-events:none`，RAF 收敛即停，页面隐藏暂停，支持销毁/重建与 reduced-motion 降级。
- 实验开关：右键菜单使用 `blog:bend-enabled` 持久化偏好；实验回退后该入口不再属于当前站点功能。

## 验证与回退

实验版本曾通过 JS/diff、clean build、176 个生成路由资源隔离，以及内置浏览器的开关持久化、文章隔离、reduced-motion、生日页滚动和代表自定义页交互检查。这些证据只描述已删除的实验版本，不能视为当前运行时事实。

回滚基点为已远程备份的 `7c77314`。2026-07-30 已受控恢复全部非记忆文件，未使用 `git reset --hard`，未执行 fetch、pull、push、deploy 或其他远程操作。完整时间线见操作日志 #51，主题文件尝试登记见主题修改 #17。
