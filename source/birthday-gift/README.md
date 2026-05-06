# 生日页面事件编写指南

这份文档只说明一件事：以后新增或修改生日页面的“成长事件”时，你需要创建哪些文件、怎么命名、每个字段会影响页面的哪个部分。

生日页面入口是 `source/birthday-gift/index.html`，页面数据由 `scripts/birthday-gift-scanner.js` 自动扫描 `source/birthday-gift/events/` 生成。正常新增事件时，不需要改 HTML 或 JS。

## 一次新增事件需要创建什么

每个事件都是 `source/birthday-gift/events/` 下的一个子文件夹。

最小可用结构：

```text
source/birthday-gift/events/
└── 04-university/
    └── index.md
```

带图片/视频的完整结构：

```text
source/birthday-gift/events/
└── 04-university/
    ├── index.md
    ├── thumb-1.webp
    ├── photo-1.webp
    ├── thumb-2.webp
    ├── photo-2.webp
    ├── thumb-video-1.webp
    └── video-1.mp4
```

快速放图结构：

```text
source/birthday-gift/events/
└── 04-university/
    ├── index.md
    ├── 01.jpg
    ├── 02.jpg
    └── 03.jpg
```

文件夹名建议使用 `两位数字-英文标识`：

```text
04-university
05-first-award
06-harmony-blogger
```

数字前缀决定时间轴顺序，越小越靠前。英文标识只用于维护和 URL，建议短、稳定、不要用中文或空格。

## 必须创建：index.md

每个事件文件夹必须有一个 `index.md`。它包含两部分：

- 顶部 front matter：事件标题、时间、心境、背景、泛光颜色等元数据
- 正文 Markdown：这段事件的叙述文案

注意：真实文件里 front matter 的开始和结束都要写三条短横线。下面示例用 `[---]` 表示，复制时请把 `[---]` 改成真正的 `---`。

```text
[---]
title: 大学时光
date: 2019-2023
period: 大学
mood: 迷茫但坚定
achievement: 鸿蒙开发技术博主
background: /birthday-gift/imgs/bg-university.webp
glowColor: "100, 150, 255"
[---]

大学我选择了计算机专业。

那时候每天都在图书馆泡到闭馆，回宿舍的路上耳机里放着歌，觉得未来有无限可能。

大二第一次参加比赛，熬了很久，最后结果并不完美。但那种为了一个目标持续推进的感觉，让我第一次真正意识到，自己正在靠近想成为的人。
```

## front matter 字段说明

| 字段 | 必填 | 示例 | 页面效果 |
|------|------|------|----------|
| `title` | 是 | `大学时光` | 主标题，大字号显示 |
| `date` | 是 | `2019-2023` | 标题上方的时间标签 |
| `period` | 是 | `大学` | 标题上方的阶段标签 |
| `mood` | 是 | `迷茫但坚定` | 标题下方的“心境”文案 |
| `achievement` | 否 | `鸿蒙开发技术博主` | 正文下方的金色成就徽章 |
| `background` | 否 | `/birthday-gift/imgs/bg-now.webp` | 当前事件的虚化背景图 |
| `glowColor` | 否 | `"100, 255, 150"` | 当前事件的屏幕边缘泛光颜色 |

字段建议：

- `title` 控制在 2 到 8 个汉字，太长会影响大标题观感。
- `date` 可以写年份范围，也可以写具体时间，如 `2024.09`。
- `period` 建议是阶段词，如 `童年`、`中学`、`大学`、`现在`。
- `mood` 建议是 2 到 6 个字的情绪/心境短语。
- `achievement` 没有就写空字符串：`achievement: ""`。
- `background` 不写或文件不存在时，页面会使用内置回退背景。
- `glowColor` 必须是 RGB 字符串，格式为 `"R, G, B"`，不要写 `rgb(...)` 或十六进制颜色。

## 正文写法

`index.md` 的正文支持普通 Markdown。

推荐写法：

```text
第一段写这段经历的起点。

第二段写关键变化、关键人物或关键场景。

第三段写这件事对自己的影响。
```

正文建议：

- 用空行分段，不要把所有内容写成一整段。
- 每个事件建议 3 到 8 段。
- 可以使用加粗、列表、引用，但不要大量使用复杂排版。
- 页面会自动把 Markdown 渲染成统一的文字格式。
- 如果正文很长，页面内会出现局部滚动，不会破坏整屏切换。

## 可选：图片文件

图片分为两类：

- `thumb-*`：缩略图，只在主页面相册堆叠和相册列表中加载
- `photo-*`：原图，只在用户点击图片查看大图时加载

如果你只是临时放图或不想维护缩略图，也可以直接放普通图片名，比如 `01.jpg`、`02.webp`、`family-photo.jpg`。扫描器会自动把这些普通图片加入相册，缩略图和原图都使用同一个文件。

命名规则：

```text
thumb-1.webp   对应   photo-1.webp
thumb-2.webp   对应   photo-2.webp
thumb-3.webp   对应   photo-3.webp
```

推荐格式：

- 缩略图：`webp`，宽度约 400 到 800px
- 原图：`webp` 或 `jpg`，宽度建议 1600 到 2560px
- 支持格式：`jpg`、`jpeg`、`png`、`webp`、`gif`

注意：

- 序号必须一致，`thumb-1.webp` 会自动找 `photo-1.webp`。
- 如果只有 `thumb-1.webp`，没有 `photo-1.webp`，点击大图时会使用缩略图本身。
- 如果只有 `photo-1.webp`，没有 `thumb-1.webp`，扫描器也会收录，但主页面会直接用原图当缩略图，不推荐。
- 普通图片名也会被收录，例如 `01.jpg`。但图片较大时会影响首屏相册加载，正式使用仍建议补 `thumb-*` 缩略图。
- 普通图片中，`bg`、`background`、`cover`、`poster` 这几个名字会被视作辅助图，不会自动加入相册。
- 图片文件建议放在事件自己的文件夹里，不要放到全局 `imgs/`，方便整组事件迁移。

## 可选：视频文件

视频文件使用 `video-*` 命名，视频封面使用 `thumb-video-*` 命名。

命名规则：

```text
thumb-video-1.webp   对应   video-1.mp4
thumb-video-2.webp   对应   video-2.mp4
```

推荐格式：

- 视频：`mp4` 优先，也支持 `webm`
- 视频封面：`webp` 优先，也支持 `jpg`、`jpeg`、`png`
- 封面尺寸建议和图片缩略图一致，宽度约 400 到 800px

注意：

- 有视频时尽量提供 `thumb-video-*`，否则相册里会显示占位封面。
- 视频不会在主页面预加载，只有点击播放时才加载。
- 视频文件不要太大，移动端访问会很慢。

## 可选：背景图

背景图由 `index.md` 里的 `background` 字段指定。

你可以把背景图放在全局背景目录：

```text
source/birthday-gift/imgs/bg-university.webp
```

然后在 `index.md` 中写：

```text
background: /birthday-gift/imgs/bg-university.webp
```

也可以把背景图放在事件文件夹：

```text
source/birthday-gift/events/04-university/bg.webp
```

然后写：

```text
background: /birthday-gift/events/04-university/bg.webp
```

背景图建议：

- 使用 `webp`
- 横图优先，建议 1920x1080 或接近 16:9
- 不要选主体太靠边的图，因为页面会做放大、虚化和暗化处理
- 背景只是氛围图，正文可读性优先

## 无媒体事件会怎样

如果一个事件文件夹里只有 `index.md`，没有图片和视频：

- 主页面右侧会显示抽象记忆球
- 背景会启用流星 Canvas 效果
- 仍然会使用 `background` 和 `glowColor` 控制氛围

这种状态是被支持的，不是错误。

## 一个完整事件示例

文件结构：

```text
source/birthday-gift/events/
└── 04-university/
    ├── index.md
    ├── bg.webp
    ├── thumb-1.webp
    ├── photo-1.webp
    ├── thumb-2.webp
    ├── photo-2.webp
    ├── thumb-video-1.webp
    └── video-1.mp4
```

`index.md`：

```text
[---]
title: 大学时光
date: 2019-2023
period: 大学
mood: 迷茫但坚定
achievement: 第一次独立完成完整项目
background: /birthday-gift/events/04-university/bg.webp
glowColor: "100, 150, 255"
[---]

大学我选择了计算机专业。

刚开始的时候，我只是觉得代码很神奇。屏幕上那些看起来冰冷的字符，真的可以变成一个能被别人使用的东西。

后来我慢慢意识到，技术不只是兴趣，它也能成为一种表达方式。每一次把问题拆开、解决、再整理成文章，都是在把自己走过的路留下来。

那段时间并不轻松，但它让我确定了一件事：我愿意继续往前走。
```

## 新增事件后的操作流程

1. 在 `source/birthday-gift/events/` 下创建事件文件夹。
2. 创建并填写 `index.md`。
3. 可选：放入普通图片，或按性能更好的方式放入 `thumb-*`、`photo-*`、`video-*`、`thumb-video-*`、背景图。
4. 运行构建：

```powershell
npm.cmd run build
```

PowerShell 可能会拦截 `npm`，所以在 Windows 下优先使用 `npm.cmd`。

5. 本地预览：

```powershell
npm.cmd run server
```

然后打开：

```text
http://localhost:4000/birthday-gift/
```

## 常见问题

### 事件没有出现在页面里

检查：

- 事件文件夹是否在 `source/birthday-gift/events/` 下
- 文件夹里是否有 `index.md`
- `index.md` 的 front matter 是否有开始和结束的三条短横线
- 构建是否成功执行

### 图片没有出现在相册里

检查：

- 扩展名是否是支持格式
- 如果使用规范命名，序号是否对应，如 `thumb-1.webp` 和 `photo-1.webp`
- 如果使用普通命名，文件名是否不是 `bg`、`background`、`cover`、`poster`
- 是否重新执行了构建，让扫描器刷新 `events-data.json`

### 视频没有封面

检查：

- 是否存在 `thumb-video-1.webp`
- 是否和 `video-1.mp4` 序号一致

### 背景没有变化

检查：

- `background` 是否是以 `/birthday-gift/...` 开头的公开路径
- 对应文件是否真的存在于 `source/birthday-gift/...`
- 如果路径不存在，扫描器会自动使用内置回退背景

## 命名速查表

| 文件 | 是否必需 | 作用 |
|------|----------|------|
| `index.md` | 必需 | 事件文案和元数据 |
| `bg.webp` | 可选 | 当前事件背景图 |
| `01.jpg` | 可选 | 普通图片，会自动加入相册 |
| `thumb-1.webp` | 可选 | 第 1 张图片缩略图 |
| `photo-1.webp` | 可选 | 第 1 张图片原图 |
| `thumb-video-1.webp` | 可选 | 第 1 个视频封面 |
| `video-1.mp4` | 可选 | 第 1 个视频 |
