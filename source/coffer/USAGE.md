---
title: 私密文章系统快速使用指南
date: 2025-05-28 10:02:06
type: usage
layout: false
---

# 🔒 私密文章系统快速使用指南

## 🚀 快速开始

### 1. 修改密码
**⚠️ 重要：首先修改默认密码！**

编辑 `source/coffer/index.md` 文件，找到：
```javascript
correctPassword: 'mySecretPassword2024', // 请修改这个密码！
```
将密码改为你自己的安全密码。

### 2. 添加私密文章
在 `source/coffer/private-posts/` 目录中创建 `.md` 文件：

```markdown
---
title: 我的私密文章
date: 2025-05-28 10:30:00
tags: [标签1, 标签2]
categories: [分类]
description: 文章描述
---

# 文章内容

这里写你的私密内容...
```

### 3. 生成和访问
```bash
# 生成静态文件
hexo generate

# 启动本地服务器
hexo server

# 访问 http://localhost:4000/coffer/
```

## 🔑 默认密码
当前默认密码：`mySecretPassword2024`

**请立即修改为你自己的密码！**

## 📁 文件结构
```
source/coffer/
├── index.md              # 主页面（包含密码配置）
├── private-posts/         # 私密文章目录
│   ├── *.md              # 你的私密文章
├── private-posts.json    # 自动生成的文章列表
└── README.md             # 详细说明文档
```

## ✨ 功能特性
- 🔒 密码保护访问
- 📱 响应式设计
- 🔍 搜索和筛选
- 🏷️ 标签管理
- 📖 全屏阅读
- 🎨 现代化UI

## 🛡️ 安全提醒
- 使用强密码
- 定期更换密码
- 不要在公共场所输入密码
- 注意：这是客户端验证，不是真正的服务器端安全

## 📞 获取帮助
如有问题，请查看 `README.md` 获取详细说明。 