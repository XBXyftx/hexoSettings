---
name: 连连看小游戏实现
description: 响应式连连看游戏 — 动态棋盘尺寸计算、直线/单折/双折连接检测、CSS 自定义属性响应式、8 种图片素材
type: project
---

# 连连看小游戏 — 实现

> **何时阅读**：游戏不显示、棋盘尺寸异常、连接检测逻辑 bug、新增/替换图片素材时。
> **关联文档**：[cdn-strategy.md](../03-api-practices/cdn-strategy.md)（无 CDN 依赖，纯本地）

---

## L1 · TL;DR

- `/LianlianKan/` 是一个**纯前端连连看消除游戏**，使用原生 JS + CSS 自定义属性实现响应式。
- **动态棋盘**：普通页面按页面容器计算；全屏模式按完整视口计算偶数行列，并将棋盘尺寸填满可用区域。
- **连接检测**：支持直线、单折线（1 个拐角）、双折线（2 个拐角）三种匹配路径。
- **8 种本地 JPEG 图片**（`1.jpg` ~ `8.jpg`），CSS 背景图渲染；运行时扩展名必须与 `source/LianlianKan/imgs/` 中受版本控制的素材一致。

---

## L2 · 响应式断点

通过 CSS 自定义属性切换方块大小：

| 断点 | block-size | gap |
|---|---|---|
| 默认（> 1200px） | 45px | 6px |
| ≤ 1200px | 40px | 5px |
| ≤ 768px | 35px | 4px |
| ≤ 480px | 30px | 3px |

---

## L3 · 棋盘尺寸计算

```js
function calculateBoardSize() {
  // 1. 找到页面主容器宽度
  // 2. 可用宽度 = 容器宽度 - 80px
  // 3. 按当前 block-size 计算列数
  // 4. 确保行列数为偶数（配对数 = 行×列/2）
  // 5. 如果总数 < 100，自动增加行数
}
```

每个尺寸的图片有 `totalBlocks / 2` 个配对（从 8 种图片中循环选取）。

---

## L4 · 连接检测算法

### 4.1 三种路径

```text
直线（checkStraightLine）：
  同行 → 遍历中间列，全部为 0 则通过
  同列 → 遍历中间行，全部为 0 则通过

单折线（checkOneCorner）：
  尝试 2 个拐角点（行交叉、列交叉）
  拐角点必须为空 → 两条直线都通 → 通过

双折线（checkTwoCorners）：
  遍历所有列 → 找两个拐角点（同行不同列）
  遍历所有行 → 找两个拐角点（同列不同行）
  三直线段都通 → 通过
```

### 4.2 消除动画

```js
function removeBlocks(...blocks) {
  isProcessing = true;  // 阻止快速连点
  blocks.forEach(b => {
    gameData[b.row][b.col] = 0;
    b.element.style.backgroundImage = 'none';
  });
  setTimeout(() => isProcessing = false, 200);
}
```

---

## L5 · 胜利条件

```js
gameData.flat().every(cell => cell === 0)
// → 显示 "🎉 挑战成功！" 2s → 自动重开
```

---

## L6 · 交互细节

| 操作 | 行为 |
|---|---|
| 点击方块 | 高亮选中（`.selected`：缩小 + 绿色阴影） |
| 选第二个方块 | 自动检测匹配 → 消除或取消选择 |
| `isProcessing` 锁 | 消除动画期间阻止新点击 |
| "新游戏" 按钮 | 重新计算尺寸 → 重洗牌 → 重绘棋盘 |
| "全屏游玩" 按钮 | 使用 Fullscreen API 让整个游戏区域进入沉浸模式；Esc 或按钮可退出，按钮文字和 `aria-pressed` 会同步；进入/退出时按目标区域重新洗牌和绘制，以全屏视口填满棋盘 |
| 窗口 resize | 延迟 100ms → 尺寸变化则重新初始化 |

---

## L7 · 红线

| # | 红线 | 后果 |
|---|---|---|
| R1 | 删除 `source/LianlianKan/imgs/` 中的图片 | 对应编号的方块显示空白 |
| R2 | 把图片数量改少但不同步修改 `IMGS_COUNT` | 多出的编号 404 |
| R3 | 改变图片引用扩展名却没有生成并提交对应素材 | 背景图全数 404；黑色棋盘会看起来像黑屏 |
| R4 | 给游戏容器设置 `overflow: hidden` | 棋盘可能被裁剪 |

---

## L8 · 文件位置速查

| 内容 | 路径 |
|---|---|
| 游戏页面 | `source/LianlianKan/index.md` |
| 全屏实现 | `source/LianlianKan/index.md` 内联 `toggleFullscreen()`、`fullscreenchange` 同步与 `:fullscreen` 样式 |
| 图片素材 | `source/LianlianKan/imgs/1.jpg` ~ `8.jpg` |
