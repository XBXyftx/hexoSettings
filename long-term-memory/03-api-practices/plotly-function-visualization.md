---
name: Plotly 函数可视化渲染规范
description: 在 Hexo 博客文章中嵌入 Plotly 交互式函数图像的模板、代码规范与注意事项
type: reference
---

# Plotly 函数可视化渲染规范

> **适用范围**: 所有需要在博客文章中展示数学函数图像（一维曲线、3D 曲面等）的场景
> **关联**: `source/_posts/最优化理论.md` · `source/_posts/高性能计算复习.md`

---

## 一、基本方案

采用 **Plotly.js**（CDN 引入）在文章 HTML 中直接绘制交互式图表。无需额外 Hexo 插件，兼容 Butterfly 主题的 PJAX 导航。

| 类型 | CDN 地址 | 用途 |
|------|----------|------|
| Plotly.js | `https://cdn.plot.ly/plotly-2.27.0.min.js` | 2D/3D 交互式绘图 |

---

## 二、一维函数曲线（2D Line）

用于展示单变量函数 $y = f(x)$ 的图像，如凸函数/凹函数对比、阿姆达尔定律曲线等。

### 2.1 模板代码

```markdown
<div id="unique-plot-id" style="width:100%;height:450px;margin:20px 0;"></div>

<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script>
(function() {
  var x = [];
  var y = [];

  // 生成数据点
  for (var i = a; i <= b; i += step) {
    x.push(parseFloat(i.toFixed(3)));
    y.push(f(i));  // 替换为实际函数
  }

  var trace1 = {
    x: x,
    y: y,
    type: 'scatter',
    mode: 'lines',
    name: '函数名称',
    line: { color: '#2ecc71', width: 3 },
    hovertemplate: 'x: %{x:.3f}<br>y: %{y:.3f}<extra></extra>'
  };

  // 关键点标注（可选）
  var keyPoints = {
    x: [x1, x2],
    y: [y1, y2],
    type: 'scatter',
    mode: 'markers+text',
    name: '关键点',
    marker: { size: 10, color: '#e74c3c' },
    text: ['标注1', '标注2'],
    textposition: 'top center',
    textfont: { size: 12 },
    hoverinfo: 'skip'
  };

  // 参考线（可选）
  var refLine = {
    x: [xmin, xmax],
    y: [yval, yval],
    type: 'scatter',
    mode: 'lines',
    name: '参考线名称',
    line: { color: '#3498db', width: 1.5, dash: 'dash' },
    hoverinfo: 'skip'
  };

  var layout = {
    title: {
      text: '图表标题',
      font: { size: 16 }
    },
    xaxis: {
      title: '横轴名称',
      range: [xmin, xmax],
      zeroline: true,
      gridcolor: '#eee'
    },
    yaxis: {
      title: '纵轴名称',
      range: [ymin, ymax],
      zeroline: true,
      gridcolor: '#eee'
    },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
    margin: { l: 60, r: 30, b: 50, t: 50 },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: '#fff'
  };

  Plotly.newPlot('unique-plot-id', [trace1, keyPoints, refLine], layout, {responsive: true});
})();
</script>
```

### 2.2 实际案例：阿姆达尔定律曲线

文章：`source/_posts/高性能计算复习.md`

```markdown
<div id="amdahl-plot" style="width:100%;height:450px;margin:20px 0;"></div>

<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script>
(function() {
  var fe = [];
  var sn = [];

  // Fe 从 0 到 0.999（避免 Fe=1 时除零）
  for (var i = 0; i <= 0.999; i += 0.002) {
    fe.push(parseFloat(i.toFixed(3)));
    sn.push(10 / (10 - 9 * i));  // Sn = 10 / (10 - 9Fe)
  }

  var trace1 = {
    x: fe, y: sn, type: 'scatter', mode: 'lines',
    name: 'Sn = 10 / (10 - 9Fe)',
    line: { color: '#2ecc71', width: 3 },
    hovertemplate: 'Fe: %{x:.3f}<br>Sn: %{y:.3f}<extra></extra>'
  };

  var keyPoints = {
    x: [0, 0.5, 5/9, 0.8, 0.9],
    y: [1, 10/5.5, 2, 10/(10-7.2), 10/(10-8.1)],
    type: 'scatter', mode: 'markers+text',
    name: '关键点', marker: { size: 10, color: '#e74c3c' },
    text: ['Fe=0, Sn=1', 'Fe=0.5, Sn≈1.82', 'Fe=5/9, Sn=2', 'Fe=0.8, Sn=5', 'Fe=0.9, Sn≈9.09'],
    textposition: 'top center', textfont: { size: 12 }, hoverinfo: 'skip'
  };

  var lineSn2 = {
    x: [0, 1], y: [2, 2], type: 'scatter', mode: 'lines',
    name: 'Sn = 2', line: { color: '#3498db', width: 1.5, dash: 'dash' }, hoverinfo: 'skip'
  };

  var lineSn10 = {
    x: [0, 1], y: [10, 10], type: 'scatter', mode: 'lines',
    name: 'Sn = 10（上限）', line: { color: '#9b59b6', width: 1.5, dash: 'dash' }, hoverinfo: 'skip'
  };

  var layout = {
    title: { text: '阿姆达尔定律：全局加速比 Sn 与可改进比例 Fe 的关系（Se = 10）', font: { size: 16 } },
    xaxis: { title: '可改进比例 Fe', range: [-0.02, 1.02], zeroline: true, gridcolor: '#eee' },
    yaxis: { title: '全局加速比 Sn', range: [0, 11], zeroline: true, gridcolor: '#eee' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
    margin: { l: 60, r: 30, b: 50, t: 50 },
    plot_bgcolor: '#fafafa', paper_bgcolor: '#fff'
  };

  Plotly.newPlot('amdahl-plot', [trace1, keyPoints, lineSn2, lineSn10], layout, {responsive: true});
})();
</script>
```

---

## 三、3D 曲面（3D Surface）

用于展示二元函数 $z = f(x, y)$ 的图像，如鞍点可视化。

### 3.1 模板代码

```markdown
<div id="surface-plot" style="width:100%;height:500px;margin:20px 0;"></div>

<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script>
(function() {
  var x = [], y = [], z = [];
  var step = 0.1;
  var range = 2;

  for (var i = -range; i <= range; i += step) {
    var row = [];
    for (var j = -range; j <= range; j += step) {
      row.push(f(i, j));  // 替换为实际二元函数
    }
    z.push(row);
    x.push(parseFloat(i.toFixed(2)));
  }
  for (var j = -range; j <= range; j += step) {
    y.push(parseFloat(j.toFixed(2)));
  }

  var data = [{
    z: z, x: x, y: y,
    type: 'surface',
    colorscale: 'Viridis',
    colorbar: { title: '函数值', titleside: 'right' }
  }];

  var layout = {
    title: { text: '曲面标题', font: { size: 16 } },
    scene: {
      xaxis: { title: 'x', range: [-2, 2] },
      yaxis: { title: 'y', range: [-2, 2] },
      zaxis: { title: 'z', range: [-4, 4] },
      camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
    },
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };

  Plotly.newPlot('surface-plot', data, layout, {responsive: true, displayModeBar: true});
})();
</script>
```

### 3.2 实际案例：鞍点函数

文章：`source/_posts/最优化理论.md`

函数：$f(x,y) = x^2 - y^2$，实现与上述模板一致，`type: 'surface'`。

---

## 四、关键规范

### 4.1 命名与 ID

- `<div id="...">` 必须在**同一篇文章内唯一**，建议使用 `文章主题-plot` 格式
- 示例：`amdahl-plot`、`convex-plot`、`saddle-plot`

### 4.2 避免除零与越界

- 生成数据时，循环上限应略小于理论边界（如 `0.999` 而非 `1.0`）
- 使用 `parseFloat(i.toFixed(N))` 避免浮点精度导致的坐标冗余

### 4.3 颜色规范

| 用途 | 推荐色值 |
|------|----------|
| 主曲线 | `#2ecc71`（绿） |
| 关键点/标注 | `#e74c3c`（红） |
| 参考虚线 | `#3498db`（蓝） |
| 上限/辅助线 | `#9b59b6`（紫） |
| 弦线/对比线 | `#3498db`（蓝，dash） |

### 4.4 响应式与布局

- `responsive: true` 必须启用，确保移动端适配
- `margin` 建议设置 `l: 60, r: 30, b: 50, t: 50`，为轴标签留足空间
- 背景色使用 `plot_bgcolor: '#fafafa'` 区分绘图区与页面背景

### 4.5 hover 提示

- 主曲线使用 `hovertemplate` 自定义悬浮提示，隐藏多余的 trace 名称
- 参考线和标注点使用 `hoverinfo: 'skip'` 避免干扰

```javascript
hovertemplate: 'Fe: %{x:.3f}<br>Sn: %{y:.3f}<extra></extra>'
```

---

## 五、PJAX 兼容性

Butterfly 主题使用 PJAX 无刷新导航。Plotly 图表在 PJAX 跳转后**不会自动销毁**，可能导致内存泄漏或 ID 冲突。

**当前实践**：
- 单篇文章中图表 ID 保持唯一
- 未观察到明显的 PJAX 内存问题（图表数据量通常较小）
- 若未来遇到性能问题，可在 `additional-js.pug` 中添加 PJAX 完成时的 `Plotly.purge()` 清理逻辑

---

## 六、与其他渲染方案的对比

| 方案 | 工具 | 适用场景 | 交互性 | 复杂度 |
|------|------|----------|--------|--------|
| **Plotly.js** | CDN 引入 | 函数图像、3D 曲面、数据可视化 | 高（缩放/平移/悬停） | 低 |
| Mermaid | Hexo 插件 | 流程图、时序图、类图 | 无 | 低 |
| KaTeX | 主题集成 | 数学公式渲染 | 无 | 中 |
| HTML Canvas | 手写 JS | 自定义动画、游戏 | 高 | 高 |

---

## 七、快速参考

```markdown
# 新增函数图像的步骤
1. 确定函数表达式和数据范围
2. 复制一维或三维模板代码到文章目标位置
3. 替换 div id（确保文章内唯一）
4. 替换数据生成循环中的函数 f(x) 或 f(x, y)
5. 调整 layout 中的标题、轴名称、范围
6. 添加关键点标注和参考线（按需）
7. 设置颜色（按需）
8. hexo clean && hexo generate 验证
```
