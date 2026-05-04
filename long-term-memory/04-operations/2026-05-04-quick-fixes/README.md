---
name: 2026-05-04 快速修复批次（Q1-Q7）
description: 全面审计后的第一轮快速修复 — 6 项可在 1 小时内安全完成的小改动，按批次提交，每项可独立回滚
type: project
---

# 2026-05-04 快速修复批次

> **何时阅读**：审查这一批修复的内容、确认是否影响功能、需要回滚某一项时。
> **关联文档**：[../../../07-known-issues/discovered-issues/README.md](../../../07-known-issues/discovered-issues/README.md)（原 BUG 清单）· [../active-task-comprehensive-audit.md](../active-task-comprehensive-audit.md)（审计任务备忘录）

---

## L1 · TL;DR（30 秒）

| 项 | 主题 | 风险 | 状态 | 详细文档 |
|---|---|---|---|---|
| **Q1** | 修正 algolia_search 的 bytecdntp 残留 URL → cdnjs | 🟢 0 | 待执行 | [Q1.md](Q1-algolia-bytecdntp.md) |
| **Q2** | avatar-ring 增加 `prefers-reduced-motion` 媒体查询 | 🟢 0 | 待执行 | [Q2.md](Q2-avatar-ring-reduced-motion.md) |
| **Q3** | 删除 tag_plugins 中重复的 jQuery 引用 | 🟡 低 | 待执行 | [Q3.md](Q3-jquery-dedup.md) |
| **Q5** | coffer 私密文章添加 `skip_render` 防直链访问 | 🟡 低 | 待执行 | [Q5.md](Q5-coffer-skip-render.md) |
| **Q7** | typewriter JS 增加 `prefers-reduced-motion` 检测 | 🟡 低（修主题） | 待执行 | [Q7.md](Q7-typewriter-reduced-motion.md) |

> **不在本批**：Q4（elemecdn @latest 锁版本）需要先 `npm view` 调研，作为下一批；Q6（Font Awesome 重复）实际需要改主题 pug，不在快速修复范围。

---

## L2 · 回滚策略

```text
回滚基线：commit 59c6f94（"完成全项目深度审查长期记忆构建"）
  ↑ 该 commit 是已知无问题的可使用版本

每个 Q* 单独 commit → 任何一项有问题可独立 revert：
  git revert <Q*-commit-hash>           # 撤销单项
  git reset --hard 59c6f94              # 完全回到基线（破坏性，慎用）

文档预先建立 + 每项独立 commit 的目的：
  1. 出问题时知道是哪一项造成的（二分定位）
  2. 修复完成后文档已就绪，不会有"修了忘了记"
  3. 任意时间点的 commit 都是可生产部署的版本
```

---

## L3 · 各项修复的执行顺序

按"风险递增"分三批，每批结束后 commit + 必要构建验证：

```text
批次 1（极快、零风险）
  Q1 — algolia URL 替换
  Q2 — avatar-ring CSS 媒体查询
  → commit "fix: 批次1 (Q1+Q2) algolia URL + avatar-ring 无障碍"

批次 2（低风险、需构建验证）
  Q3 — jquery 去重
  Q5 — coffer skip_render
  → commit "fix: 批次2 (Q3+Q5) jquery 去重 + coffer 直链防护"

批次 3（涉及主题文件，需 06-theme-modifications/ 留痕）
  Q7 — typewriter JS prefers-reduced-motion
  → commit "fix: 批次3 (Q7) typewriter 无障碍支持"
```

> 实际执行可能按 1 项 1 commit 的方式，更细粒度回滚。每项 commit 后会更新本表的"状态"列。

---

## L4 · 执行时的检查清单

每项修复执行前 / 中 / 后必走：

```text
执行前：
  [ ] 当前是否在 commit 59c6f94 或其下游
  [ ] 已读对应 Q*.md 的"实现方案"和"验证步骤"
  [ ] git status 干净（无未提交的其他改动）

执行中：
  [ ] 严格按照 Q*.md 的"修改步骤"操作
  [ ] 不顺手做无关的修改
  [ ] 修改后立即运行 grep / 简单构建确认

执行后：
  [ ] hexo clean && hexo generate 不报错
  [ ] 浏览受影响的页面（约 30 秒）
  [ ] git diff 查看改动是否符合预期
  [ ] commit message 引用本目录路径
  [ ] 在对应 Q*.md 写"实际执行结果"小节
  [ ] 更新本 README L1 表格的"状态"列
```

---

## L5 · 受影响功能矩阵

| 功能 | 影响项 | 风险等级 | 必测页面 |
|---|---|---|---|
| Algolia 站内搜索 | Q1 | 极低 | 搜索框（如启用） |
| 关于页头像旋转 | Q2 | 极低 | `/about/`（默认行为不变，仅 reduced-motion 用户停止旋转） |
| Tag 标签插件（issues/carousel/anima） | Q3 | 中 | 任何含 `{% issues %}` / `{% carousel %}` / `{% timeline %}` 的文章 |
| 私密文章列表 | Q5 | 中 | `/coffer/`（密码页 + 解锁后的列表） |
| 文章页打字机 | Q7 | 低 | 任意含 `typewriter:` 字段的文章（例如最新文章） |

---

## L6 · 不在本批次的项（明确排除）

| 项 | 原因 | 后续处理 |
|---|---|---|
| B1 lazy-loading-native.js 重复 | MD5 不同，需先做 diff | 下一批：先调研内容差异 |
| B2 lazy-loading.js 387 行 | **被 additional-js.pug 加载，不是死代码** | 修正 BUG 清单事实错误 |
| B3 lazy-loading.css 235 行 | **被 head.pug 加载，不是死代码** | 修正 BUG 清单事实错误 |
| B4 header-universe 性能 | 需移植 universe-optimized 整套机制 | 中等改动，单独排期 |
| B5 多个 3s 扫描 | 重构为统一调度，影响面广 | 大改，需详细方案 |
| B6 swiper 无分页 | 70+ 张一次性加载，需虚拟滚动 | 大改 |
| B8/B9/B10 PJAX 内存泄漏 | 需补 destroy 钩子 + PJAX 事件监听 | 中等改动，需多次切页测试 |
| B11 coffer 密码硬编码 | 安全模型决策，非技术问题 | 需用户确认是否升级到服务端 |
| B14 elemecdn @latest | 需 npm view 调研后再固定版本 | 本批后立即处理 |
| B15 资源无版本号 | build hook 改造 | 大改 |
| B17 Font Awesome 重复 | 需改主题 pug | 中等改动 |
| B18 carousel data 重复 | 需先读 lazy-loading-about.js 选择器逻辑 | 调研后再定 |
| B20 Object URL 泄漏 | swiper 内联 JS 较复杂 | 中等改动 |

---

## L7 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 本目录（fix 文档模块） | `long-term-memory/04-operations/2026-05-04-quick-fixes/` |
| 原 BUG 清单 | `long-term-memory/07-known-issues/discovered-issues/README.md` |
| 审计任务备忘录 | `long-term-memory/04-operations/active-task-comprehensive-audit.md` |
| 主题修改记录 | `long-term-memory/06-theme-modifications/` |

---

## L8 · 时间线（按 commit 推进时填充）

> 每完成一项就在此处追加一行（YYYY-MM-DD HH:MM commit-hash 描述）

- **2026-05-04 (基线)**：commit `59c6f94` — 文档体系建成，所有功能正常
- _（后续条目按实际 commit 时间填入）_
