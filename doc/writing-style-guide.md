# 最优化理论笔记写作规范

本文档记录《最优化理论》笔记的格式规范，确保全文风格统一。

---

## 一、标题层级规范

### 1.1 章节标题（二级标题）
```markdown
## 章节名
```
- 如：`## 线性规划`

### 1.2 节标题（三级标题）
```markdown
### 具体名称
```
- 使用具体描述性名称
- 如：`### 数学建模`（而非 `### 建模`）

### 1.3 小节标题（四级标题）
```markdown
#### 动作的提出/建立
```
- 使用"的"字结构
- 如：`#### 问题的提出`、`#### 数学模型的建立`

### 1.4 例题/案例标题
**不使用五级标题**，改用**加粗文本**：
```markdown
**例题：工厂生产计划**
```

---

## 二、内容块格式

### 2.1 数学模型组成块

**决策变量**、**目标函数**、**约束条件**、**模型构成**等作为内容块的引导语：

- **不使用加粗**，直接书写
- 后面加冒号，然后换行
- 如：
```markdown
决策变量：

- $x_1$：甲产品的生产数量
- $x_2$：乙产品的生产数量
```

### 2.2 代码块语言标识

纯文本代码块使用 `plantext` 标识：
```markdown
```plantext
数学模型 = 目标函数 + 约束条件
```
```

---

## 三、分隔线使用规范

### 3.1 节之间使用分隔线
在主要章节（二级标题）之间使用 `---`：
```markdown
---

## 线性规划
```

### 3.2 小节与例题之间
**例题前不使用分隔线**，直接使用加粗标题：
```markdown
#### 问题的提出

线性规划主要用于解决...

---

**例题：工厂生产计划**

某工厂生产...
```

---

## 四、数学公式格式

{% note info %}
**详细数学公式规范请参考** [`math-formats-guide.md`](./math-formats-guide.md)

该文档包含：
- MathJax 支持的公式格式
- 表格中数学公式的冲突处理（使用 `&#124;` 替代 `|`）
- 公式编号方法
- 常见公式示例（矩阵、对齐方程组等）
{% endnote %n
### 前置要求

在文章 Front-matter 中必须添加 `mathjax: true`：
```yaml
---
title: 文章标题
date: 2026-01-01 00:00:00
mathjax: true   # ← 必须添加！
---
```

### 4.1 行内公式
使用 `$...$`：
```markdown
$x_1$、$x_2$ 表示决策变量
```

### 4.2 块级公式
使用 `$$...$$`，注意换行：
```markdown
$$
\max Z = 2x_1 + 3x_2
$$
```

### 4.3 方程组
使用 `cases` 环境：
```markdown
$$
\begin{cases}
2x_1 + x_2 \leq 8 & \text{（原料约束）} \\
x_1 + 2x_2 \leq 6 & \text{（电力约束）} \\
x_1 \geq 0, \ x_2 \geq 0 & \text{（非负约束）}
\end{cases}
$$
```

---

## 五、表格格式

### 5.1 数据表格
居中对齐，表头加粗：
```markdown
| 资源 | 甲产品 ($x_1$) | 乙产品 ($x_2$) | 资源限量 |
|:----:|:--------------:|:--------------:|:--------:|
| 原料 | 2 单位/件 | 1 单位/件 | 8 单位 |
| 电力 | 1 单位/件 | 2 单位/件 | 6 单位 |
```

### 5.2 说明表格
```markdown
| 组成部分 | 本例中的体现 |
|:--------:|:-------------|
| **目标函数** | $\max Z = 2x_1 + 3x_2$（追求最大利润）|
```

---

## 六、列表格式

### 6.1 无序列表

**每个无序列表前面必须空一行**，与上文内容保持视觉分隔：

```markdown
上文内容：

- 列表项1
- 列表项2
- 列表项3
```

**正确示例：**
```markdown
决策变量：

- $x_1$：甲产品的生产数量
- $x_2$：乙产品的生产数量
```

**错误示例（列表前未空行）：**
```markdown
决策变量：
- $x_1$：甲产品的生产数量
- $x_2$：乙产品的生产数量
```

### 6.2 有序列表

**同理，每个有序列表前面也必须空一行**：

```markdown
解题步骤：

1. 建立数学模型
2. 确定约束条件
3. 求解最优解
```

### 6.3 嵌套列表

嵌套列表同样遵循"列表前空一行"的原则，且子列表与父列表项之间保持缩进：

```markdown
优化方法：

- 线性规划

  - 单纯形法
  - 内点法

- 非线性规划

  - 梯度下降法
  - 牛顿法
```

---

## 七、段落与空行

### 7.1 段落间距
- 段落之间保留一个空行
- 标题与内容之间不加空行（Hexo 渲染会自动处理）

### 7.2 例外情况
代码块、表格前后根据视觉效果适当调整。

---

## 八、总结速查表

| 元素 | 格式 | 示例 |
|:----:|:-----|:-----|
| 二级标题 | `## 名称` | `## 线性规划` |
| 三级标题 | `### 具体名称` | `### 数学建模` |
| 四级标题 | `#### 的提出/建立` | `#### 问题的提出` |
| 例题标题 | `**例题：名称**` | `**例题：工厂生产计划**` |
| 内容引导 | `名称：` | `决策变量：` |
| 代码块 | `plantext` | 纯文本用 plantext |
| 节分隔 | `---` | 主要章节间使用 |

---

## 九、版本记录

| 日期 | 版本 | 说明 |
|:----:|:----:|:-----|
| 2026-03-09 | v1.0 | 初始规范，基于用户修改总结 |

---

## 十、可视化图表（Plotly.js）

本笔记使用 **Plotly.js** 实现交互式数学函数可视化，帮助理解抽象概念。

### 10.1 使用场景

适用于展示：
- 鞍点函数（$f(x,y) = x^2 - y^2$）
- 凸函数与凹函数对比
- 优化算法的收敛过程
- 可行域与等值线

### 10.2 基础模板

```markdown
<div id="chart-id" style="width:100%;height:400px;margin:20px 0;"></div>

<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script>
(function() {
  // 生成数据
  var x = [], y = [];
  for (var i = -5; i <= 5; i += 0.1) {
    x.push(i);
    y.push(i * i);  // f(x) = x^2
  }

  var trace = {
    x: x,
    y: y,
    type: 'scatter',
    mode: 'lines',
    name: 'f(x) = x²',
    line: { color: '#2ecc71', width: 3 }
  };

  var layout = {
    title: { text: '图表标题', font: { size: 16 } },
    xaxis: { title: 'x', zeroline: true },
    yaxis: { title: 'y', zeroline: true },
    margin: { l: 50, r: 20, b: 50, t: 50 }
  };

  Plotly.newPlot('chart-id', [trace], layout, {responsive: true});
})();
</script>
```

### 10.3 3D 曲面图模板

```markdown
<div id="surface-plot" style="width:100%;height:500px;margin:20px 0;"></div>

<script>
(function() {
  var x = [], y = [], z = [];
  var step = 0.1, range = 2;
  
  for (var i = -range; i <= range; i += step) {
    var row = [];
    for (var j = -range; j <= range; j += step) {
      row.push(i*i - j*j);  // f(x,y) = x² - y²
    }
    z.push(row);
    x.push(parseFloat(i.toFixed(2)));
    y.push(parseFloat(j.toFixed(2)));
  }

  var data = [{
    z: z, x: x, y: y,
    type: 'surface',
    colorscale: 'Viridis'
  }];

  var layout = {
    title: { text: '鞍点函数 f(x,y) = x² - y²' },
    scene: {
      xaxis: { title: 'x' },
      yaxis: { title: 'y' },
      zaxis: { title: 'z' }
    }
  };

  Plotly.newPlot('surface-plot', data, layout);
})();
</script>
```

### 10.4 注意事项

1. **div id 唯一性**：每个图表的 `id` 必须唯一
2. **自执行函数**：使用 `(function() {...})()` 避免变量污染全局作用域
3. **响应式设置**：添加 `{responsive: true}` 使图表自适应容器宽度
4. **CDN 引入**：确保引入 Plotly.js `<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>`

### 10.5 交互功能

Plotly.js 图表默认支持：
- 🖱️ **鼠标拖动**：旋转（3D）/ 平移（2D）
- 📜 **滚轮缩放**：放大/缩小
- 🔍 **框选放大**：拖拽框选区域放大
- 📊 **悬停提示**：显示坐标值
- 📷 **保存图片**：点击工具栏相机图标

---

## 十一、提示块标签（Note）

本博客使用 Butterfly 主题的 `{% note %}` 标签创建提示块，支持多种样式：

### 11.1 基础语法

```markdown
{% note [style] [flat] %}
提示内容
{% endnote %}
```

- `style`：样式类型（可选，默认为 default）
- `flat`：扁平化样式（可选，添加后去掉边框阴影）

### 11.2 七种样式示例

#### 1. default（默认）
```markdown
{% note flat %}
默认提示块标签
{% endnote %}
```

{% note flat %}
默认提示块标签
{% endnote %}

#### 2. default（显式指定）
```markdown
{% note default flat %}
default 提示块标签
{% endnote %}
```

{% note default flat %}
default 提示块标签
{% endnote %}

#### 3. primary（主要）
```markdown
{% note primary flat %}
primary 提示块标签
{% endnote %}
```

{% note primary flat %}
primary 提示块标签
{% endnote %}

#### 4. success（成功）
```markdown
{% note success flat %}
success 提示块标签
{% endnote %}
```

{% note success flat %}
success 提示块标签
{% endnote %}

#### 5. info（信息）
```markdown
{% note info flat %}
info 提示块标签
{% endnote %}
```

{% note info flat %}
info 提示块标签
{% endnote %}

#### 6. warning（警告）
```markdown
{% note warning flat %}
warning 提示块标签
{% endnote %}
```

{% note warning flat %}
warning 提示块标签
{% endnote %}

#### 7. danger（危险）
```markdown
{% note danger flat %}
danger 提示块标签
{% endnote %}
```

{% note danger flat %}
danger 提示块标签
{% endnote %}

### 11.3 使用建议

| 样式 | 使用场景 |
|:----:|:---------|
| `default` | 一般性提示、注意事项 |
| `primary` | 重要概念、核心定义 |
| `success` | 正确结果、成功提示 |
| `info` | 补充信息、参考链接 |
| `warning` | 警告信息、需要特别注意 |
| `danger` | 错误提示、严重后果警示 |

### 11.4 与无 flat 参数的区别

添加 `flat` 参数后，提示块采用**扁平化设计**（无边框阴影），更适合现代简约风格。不添加 `flat` 则会有立体阴影效果。
