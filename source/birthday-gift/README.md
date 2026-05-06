# 生日页面 — 操作指南

## 如何添加新事件

### 1. 创建事件文件夹

在 `source/birthday-gift/events/` 下新建一个文件夹，命名格式为 `数字前缀-英文标识`，例如：

```
04-university/
05-first-job/
06-travel/
```

数字前缀决定时间轴的排列顺序，越小越靠前。

### 2. 编写事件概述

在文件夹中创建 `index.md`，格式如下：

```markdown
---
title: 事件标题
date: 时间范围（如 2019-2023）
period: 阶段名称（如 大学）
mood: 心境标签（如 迷茫但坚定）
achievement: 主要成就（可选，没有就留空）
background: /birthday-gift/assets/背景图文件名.jpg（可选）
glowColor: "R, G, B"（边缘泛光颜色，如 "255, 200, 100"）
---

在这里写事件的详细描述，支持 Markdown 格式。

可以写多段文字，换行用空行分隔。
```

**字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 事件标题，显示在时间轴上 |
| `date` | 是 | 时间范围，显示在标题下方 |
| `period` | 是 | 阶段名称，如"童年""中学""大学" |
| `mood` | 是 | 心境标签，如"懵懂好奇""迷茫倔强" |
| `achievement` | 否 | 成就标签，会显示为金色徽章。没有就留空 |
| `background` | 否 | 背景图路径。没有则使用默认黑色背景 |
| `glowColor` | 否 | 边缘泛光的 RGB 颜色，格式 `"R, G, B"`。默认白色 |

### 3. 添加图片（可选）

如果事件有图片，按以下命名规则放入文件夹：

| 文件前缀 | 用途 | 示例 |
|----------|------|------|
| `thumb-` | 相册堆叠缩略图 | `thumb-1.jpg`, `thumb-2.jpg` |
| `photo-` | 原图（相册展开后显示） | `photo-1.jpg`, `photo-2.jpg` |
| `video-` | 视频文件 | `video-1.mp4` |
| `thumb-video-` | 视频缩略图（可选） | `thumb-video-1.jpg` |

**命名对应关系**：
- `thumb-1.jpg` ↔ `photo-1.jpg`（同序号自动关联）
- `thumb-2.jpg` ↔ `photo-2.jpg`
- `video-1.mp4` 会自动查找 `thumb-video-1.jpg` 作为封面

**图片格式**：jpg、jpeg、png、webp、gif
**视频格式**：mp4、webm

### 4. 重新生成页面

添加或修改事件后，执行：

```bash
npm run build    # 或: hexo clean && hexo generate
```

扫描器会自动检测文件夹变化，重新生成 `events-data.json`。

### 5. 本地预览

```bash
npm run server   # 或: hexo server
```

打开 `http://localhost:4000/birthday-gift/` 查看效果。

---

## 注意事项

1. **缩略图尺寸建议**：`thumb-*` 图片建议宽度 400px 左右，用于相册堆叠显示
2. **原图尺寸建议**：`photo-*` 图片可以大一些，相册展开后显示原图
3. **没有图片的事件**：如果不放任何 `thumb-*` 或 `video-*` 文件，页面会自动显示流星动画背景
4. **背景图**：`background` 字段指定的图片会被虚化处理作为页面背景
5. **排序**：事件按文件夹名排序，务必使用数字前缀（`01-`, `02-`...）

---

## 示例：完整的事件文件夹

```
source/birthday-gift/events/
└── 04-university/
    ├── index.md
    ├── thumb-1.jpg      # 相册堆叠显示
    ├── thumb-2.jpg
    ├── photo-1.jpg      # 相册展开后显示
    ├── photo-2.jpg
    └── video-1.mp4      # 视频
```

`index.md` 内容示例：

```markdown
---
title: 大学时光
date: 2019-2023
period: 大学
mood: 迷茫但坚定
achievement: ""
background: /birthday-gift/assets/bg-university.jpg
glowColor: "100, 150, 255"
---

大学选择了计算机专业。

那时候每天都在图书馆泡到闭馆，回宿舍的路上耳机里放着歌，觉得未来有无限可能。

大二第一次参加黑客马拉松，熬了48小时，最后只做出了一个半成品。但那种和队友一起为目标拼命的感觉，让我第一次真正爱上了编程。
```
