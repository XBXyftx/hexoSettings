---
name: 2026-05-04 第一梯队修复批次(Q8-Q13)
description: 第一梯队(中等改动、单文件)问题的深度调研 + 逐一修复 + 独立 commit + 回滚文档
type: project
---

# 2026-05-04 第一梯队修复批次(Q8-Q13)

> **何时阅读**: 审查本批次修复内容、确认是否影响功能、需要回滚某一项时。
> **关联文档**: [../../07-known-issues/discovered-issues/README.md](../../07-known-issues/discovered-issues/README.md)(原 BUG 清单) · [../2026-05-04-quick-fixes/README.md](../2026-05-04-quick-fixes/README.md)(上一批 Q1-Q7)

---

## L1 · TL;DR(30 秒)

| 项 | 主题 | 风险 | 状态 | 详细文档 | 依赖 |
|---|---|---|---|---|---|
| **Q8** | elemecdn @latest 锁版本(B14) | 🟢 0 | ✅ 已完成 | [Q8.md](Q8-elemecdn-lock-version.md) | `_config.butterfly.yml` |
| **Q9** | lazy-loading-optimized observer disconnect(B9) | 🟢 0 | ✅ 已完成 | [Q9.md](Q9-observer-disconnect.md) | `themes/butterfly/source/js/lazy-loading-optimized.js` |
| **Q10** | lazy-loading-about destroy() 激活(B10) | 🟢 0 | ⏳ 待执行 | [Q10.md](Q10-destroy-activation.md) | `source/about/lazy-loading-about.js` + caller |
| **Q11** | typewriter clearInterval 防 PJAX 泄漏(B8) | 🟡 低 | ⏳ 待执行 | [Q11.md](Q11-typewriter-clearinterval.md) | `themes/butterfly/source/js/typewriter-effect.js` |
| **Q12** | Font Awesome 重复加载(B17) | 🟡 低(修主题) | ⏳ 待执行 | [Q12.md](Q12-font-awesome-dedup.md) | 主题 pug + `06-theme-modifications/` |
| **Q13** | header-universe 性能优化(B4) | 🟡 中 | ⏳ 待执行 | [Q13.md](Q13-header-universe-optimization.md) | `themes/butterfly/source/js/header-universe.js` |

---

## L2 · 回滚策略

```text
回滚基线: commit 3ec6ebd(上一批回填后的最新可用版本)
  ↑ 该 commit 是已知无问题的可使用版本

每个 Q* 单独 commit → 任何一项有问题可独立 revert:
  git revert <Q*-commit-hash>           # 撤销单项
  git reset --hard 3ec6ebd              # 完全回到基线(破坏性,慎用)
```

---

## L3 · 受影响功能矩阵

| 功能 | 影响项 | 风险等级 | 必测页面 |
|---|---|---|---|
| tag_plugins 动画/样式 | Q8 | 极低 | 任意含 tag plugin 标签的文章 |
| 首页/文章页懒加载 | Q9 | 极低 | 首页、任意文章页 |
| 关于页 3D 轮播 | Q10 | 极低 | `/about/` |
| 文章页打字机 | Q11 | 低 | 任意含 `typewriter:` 字段的文章 |
| 全站图标 | Q12 | 低 | 全站(导航栏、侧边栏、文章内图标) |
| 首页宇宙背景 | Q13 | 中 | 首页 |

---

## L4 · 执行时的检查清单

```text
执行前:
  [ ] 当前是否在 commit 3ec6ebd 或其下游
  [ ] 已读对应 Q*.md 的"L3 实现方案"和"L4 验证步骤"
  [ ] git status 干净(无未提交的其他改动)

执行中:
  [ ] 严格按照 Q*.md 的"修改步骤"操作
  [ ] 不顺手做无关的修改
  [ ] 修改后立即运行 grep / 简单构建确认

执行后:
  [ ] hexo clean && hexo generate 不报错
  [ ] 浏览受影响的页面(约 30 秒)
  [ ] git diff 查看改动是否符合预期
  [ ] commit message 引用本目录路径
  [ ] 在对应 Q*.md 写"L6 实际执行结果"小节
  [ ] 更新本 README L1 表格的"状态"列
```

---

## L5 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 本目录(修复文档模块) | `long-term-memory/04-operations/2026-05-04-tier1-fixes/` |
| 原 BUG 清单 | `long-term-memory/07-known-issues/discovered-issues/README.md` |
| 主题修改记录 | `long-term-memory/06-theme-modifications/` |
| 回滚基线 commit | `3ec6ebd` |

---

## L6 · 时间线(按 commit 推进时填充)

- **2026-05-04 (基线)**: commit `3ec6ebd` — Q1-Q7 全部回填完成,所有功能正常
- **2026-05-04**: commit `9316093` — Q8 完成 — elemecdn 12 处 CDN URL 锁定到当前 npm 版本(B14)
- **2026-05-04**: commit `81d67c9` — Q9 完成 — lazy-loading-optimized observer disconnect 防 PJAX 泄漏(B9)
- _(后续条目按实际 commit 时间填入)_
