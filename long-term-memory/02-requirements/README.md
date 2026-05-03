# 02-requirements — 内容规范与命名规则

本目录存放博客内容创作和文件管理的规范。

---

## 文件命名规范

### 文章文件

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 技术文章 | 英文驼峰/PascalCase | `VibeTips.md`, `AITrainingCamp.md` |
| 中文标题文章 | 中文直接命名 | `鸿蒙记事本项目.md`, `butterfly主题美化.md` |
| 项目笔记 | 项目名 + 笔记/项目 | `HongYiXun.md`, `OpenSourceSummer2025.md` |
| 学习笔记 | 学科/主题 + 笔记 | `computerNetFinalReview.md` |

### Asset 文件夹

- 每篇文章的 asset 文件夹名必须与文章文件名完全一致（不含 `.md` 后缀）
- 示例：`VibeTips.md` → `VibeTips/` 文件夹
- **例外**：`数组.md`、`HMNodejs.md`、`鸿蒙中文包.md` 三篇文章无 asset 文件夹

---

## Front Matter 规范

### 必填字段

```yaml
---
title: 文章标题
date: YYYY-MM-DD HH:MM:SS
tags:
  - 标签1
  - 标签2
cover: /imgs/ArticleTopImgs/文章封面图.webp
description: 文章的SEO描述，50-150字为宜
---
```

### 可选字段

| 字段 | 用途 | 示例 |
|------|------|------|
| `typewriter` | 文章副标题打字机效果文本 | `typewriter: Vibe Coding 经验分享` |
| `top` | 置顶权重（数值越大越靠前） | `top: 16` |
| `swiper_index` | 轮播图展示顺序 | `swiper_index: 3` |
| `categories` | 文章分类 | `categories: [技术向, 鸿蒙]` |
| `post_copyright` | 版权声明块 | 见下方模板 |

### 版权声明模板

```yaml
post_copyright:
  copyright_author: XBXyftx
  copyright_author_href: https://github.com/XBXyftx
  copyright_url: https://xbxyftx.top
  copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
```

---

## 标签分类体系

当前博客使用的主要标签类别：

| 类别 | 代表标签 |
|------|---------|
| **技术方向** | `鸿蒙`, `AI`, `技术向`, `算法`, `hexo博客搭建` |
| **AI 工具** | `ClaudeCode`, `KimiCode`, `Cursor`, `CodeX`, `Agent`, `Skills` |
| **项目** | `项目`, `V2`, `HongYiXun`, `鸿易讯` |
| **学习** | `期末复习`, `新生训练营` |
| **个人** | `独白`, `创客空间` |

---

## 图片规范

1. **格式**：优先使用 `.webp`，兼顾质量和体积
2. **封面图路径**：`/imgs/ArticleTopImgs/文章名TopImg.webp`
3. **文章内图片**：放在文章同名的 asset 文件夹内，使用相对路径 `文章名/图片名.webp`
4. **批量转换**：使用 `npm run webp` 将新图片转换为 webp 并自动更新 markdown 引用 — 首次使用前需安装 `libwebp`，且会**删除源图原图**，详见 [03-api-practices/webp-conversion.md](../03-api-practices/webp-conversion.md)
5. **尺寸**：封面图建议宽度 1200px 以上，比例 16:9 或 3:2

> 💡 **作者写作时不必关心扩展名**：直接以 `.png/.jpg` 引用图片，发布前的 `npm run dev/opt/pub` 会自动把扩展名替换为 `.webp` 并完成转换。

---

## 新建文章流程

1. 使用 `hexo new "文章标题"` 创建（会自动生成 asset 文件夹）
2. 填写完整的 front matter（必填字段不可少）
3. 将配图放入 asset 文件夹
4. 运行 `npm run webp` 转换图片格式
5. 本地预览 `npm run server`
6. 确认无误后执行 `npm run pub` 发布
