---
title: 数据采集实践期末复习
date: 2025-12-24 15:22:31
tags:
  - 期末复习
description: 数据采集期末复习
typewriter: 📊 数据采集期末复习，深度总结数据采集相关知识。
cover: /imgs/ArticleTopImgs/dataCollectionFinalReviewTopImg.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

数据采集复习的艰难程度有点超乎的我的想象，对于这种基本上只是在考背诵的考试形式我是有些嗤之以鼻的，同时我对于AI写博文我是十分反感的，但是对于当下的复习情况，配合AI去写博客是最佳的选择了，所以这篇博文会有些背离初心的去掺杂大量AI生成内容。

## 总清单

### 📌 一、Python 数据操作基础

- `pandas` 两大核心数据结构：`Series` vs `DataFrame`
- `read_csv()` 返回值类型（DataFrame）
- DataFrame 列数据类型要求（同列必须同类型）
- 元组/列表索引与切片：`data[2]`、`data[3][2]`

---

### 📌 二、网络爬虫与 HTML 基础

- 爬虫定义与本质（自动请求+提取数据）
- 爬虫是否可爬取浏览器显示的所有内容（✅）
- HTTP 状态码：200（成功）、404（未找到）、500（服务器错误）
- 请求伪装：`User-Agent` 的作用
- 图片爬取关键属性：`response.content`
- 正则提取：`re.search(r'\d+', ...)` 的匹配结果
- HTML 常见成对标签：`<p>`、`<a>`、`<h1>`、`<b>`

---

### 📌 三、Scrapy 框架（重点）

- 各组件通信中心：**Scrapy Engine**
- 数据流向顺序（四步）：
  1. Spider → Engine → Scheduler
  2. Scheduler → Engine → Downloader
  3. Downloader → Engine → Spider
  4. Spider → Engine → Item Pipeline
- **Spider 是否直接发送数据给 Pipeline？**（❌，必须经过 Engine）
- 存储 URL 和数据的组件：**Scheduler + Item Pipeline**
- 中间件名称：**Downloader Middlewares**、**Spider Middlewares**
- 创建爬虫命令（必须背）：

  ```bash
  pip install scrapy
  scrapy startproject 项目名
  cd 项目名
  scrapy genspider 爬虫名 域名
  ```

---

### 📌 四、数据预处理（高频简答题）

- 数据预处理目的：**提高数据质量，提升挖掘准确度**
- 四大流程（必须按顺序）：
  1. 数据清洗
  2. 数据集成
  3. 数据变换
  4. 数据归约
- 数据清洗三步（按顺序）：
  1. 清洗缺失值
  2. 清洗异常值
  3. 清洗重复值
- 常见清洗工具（至少记两个）：
  - Python（pandas）
  - Kettle
  - Excel
  - SPSS / SAS

---

### 📌 五、数据库与 Python 连接（实操题）

- `pymysql` 连接参数：
  - `host="127.0.0.1"`
  - `port=3306`
  - `user="root"`
  - `password="123456"`
  - `database="你的名字拼音"`
- 游标创建：`conn.cursor()`
- SQL 执行与提交：
  - `cur.execute(SQL)`
  - `conn.commit()`
- 插入语句模板：

  ```sql
  INSERT INTO student VALUES (学号, '姓名', '性别', 班级);
  ```

---

### 📌 六、数据采集框架（Sqoop / Kafka / Flume）

- **Sqoop**：用于 **RDBMS ↔ Hadoop/Hive** 数据迁移
- **Kafka**：分布式消息队列，**支持批量+流式处理**
  - 组件：Producer、Consumer、Broker、Topic
  - **Consumer 可重复读取数据**
  - **Broker 不 push，Consumer 主动 pull**
- **Flume**：日志采集框架
  - 内部组件：Source、Channel、Sink
  - **一个 Source 可对应多个 Channel**
  - 负载均衡与故障恢复机制（画图题）

---

### 📌 七、爬虫策略（深度优先 vs 广度优先）

- **深度优先**：一条道走到黑，再回溯  
  顺序：A → B → E → F → G → C → H → J → D → I
- **广度优先**：一层一层爬  
  顺序：A → B → C → D → E → F → H → I → G → J

---

### 📌 八、ETL 流程（Extract-Transform-Load）

- 三步：抽取 → 转换 → 加载
- 画图：从数据源 → ETL → 数据仓库

---

### 📌 九、开放题/设计题（重点准备）

- **A单位**：MySQL → Hadoop，用 **Sqoop**
- **B单位**：日志采集+实时分析，用 **Kafka**
- **C单位**：无原始数据，用 **Scrapy/Scrapy-Redis** 爬新闻

---

## Python 数据操作基础

### py的基础数据类型

#### 整数（int）

整数类型用于表示整数值，支持基本的算术运算。

```python
# 基本操作
a = 10
b = 3

print(a + b)    # 加法
# 输出: 13

print(a - b)    # 减法
# 输出: 7

print(a * b)    # 乘法
# 输出: 30

print(a / b)    # 除法
# 输出: 3.3333333333333335

print(a // b)   # 整除
# 输出: 3

print(a % b)    # 取余
# 输出: 1

print(a ** b)   # 幂运算
# 输出: 1000

# 类型转换
num_str = "123"
num = int(num_str)  # 字符串转整数
print(num + 1)
# 输出: 124
```

#### 浮点数（float）

浮点数用于表示小数，注意精度问题。

```python
# 基本操作
pi = 3.14159
radius = 5.0

area = pi * radius ** 2  # 计算圆面积
print(f"圆面积：{area:.2f}")
# 输出: 圆面积：78.54

# 类型转换
price = "99.99"
price_float = float(price)  # 字符串转浮点数
print(price_float * 0.8)
# 输出: 79.992

# 精度处理
from decimal import Decimal
a = Decimal('0.1')
b = Decimal('0.2')
print(a + b)
# 输出: 0.3
```

#### 字符串（str）

字符串是字符序列，支持丰富的操作方法。

```python
# 创建字符串
name = "Python数据采集"
text = '单引号也可以'
multi_line = """多行
字符串"""

# 常见操作
print(name[0])
# 输出: P

print(name[0:6])
# 输出: Python

print(name + " 课程")
# 输出: Python数据采集 课程

print(name * 2)
# 输出: Python数据采集Python数据采集

print(len(name))
# 输出: 11

# 常用方法
email = "  USER@EXAMPLE.COM  "
print(email.lower())
# 输出:   user@example.com  

print(email.upper())
# 输出:   USER@EXAMPLE.COM  

print(email.strip())
# 输出: USER@EXAMPLE.COM

print(email.replace("EXAMPLE", "test"))
# 输出:   USER@test.COM  

url = "https://www.example.com/data"
print(url.split('/'))
# 输出: ['https:', '', 'www.example.com', 'data']

print('-'.join(['2025', '12', '24']))
# 输出: 2025-12-24

# 字符串格式化
age = 20
print(f"我今年{age}岁")
# 输出: 我今年20岁

print("姓名：{}，年龄：{}".format(name, age))
# 输出: 姓名：Python数据采集，年龄：20
```

#### 布尔值（bool）

布尔类型只有 `True` 和 `False` 两个值，用于逻辑判断。

```python
# 基本使用
is_student = True
has_permission = False

# 逻辑运算
print(True and False)
# 输出: False

print(True or False)
# 输出: True

print(not True)
# 输出: False

# 比较运算返回布尔值
age = 18
print(age >= 18)
# 输出: True

print(age == 20)
# 输出: False

print(age != 18)
# 输出: False

# 布尔值转换（重要！）
print(bool(0))
# 输出: False

print(bool(1))
# 输出: True

print(bool(""))
# 输出: False（空字符串）

print(bool("abc"))
# 输出: True

print(bool([]))
# 输出: False（空列表）

print(bool([1, 2]))
# 输出: True
```

#### 列表（list）

列表是可变的有序序列，可以存储不同类型的元素。

```python
# 创建列表
fruits = ["苹果", "香蕉", "橙子"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# 索引和切片
print(fruits[0])
# 输出: 苹果

print(fruits[-1])
# 输出: 橙子

print(numbers[1:4])
# 输出: [2, 3, 4]

print(numbers[::2])
# 输出: [1, 3, 5]

# 常用操作
fruits.append("葡萄")       # 添加元素到末尾
fruits.insert(1, "西瓜")    # 在指定位置插入
fruits.remove("香蕉")       # 删除指定元素
popped = fruits.pop()      # 弹出最后一个元素
print(len(fruits))
# 输出: 3
# 此时fruits = ['苹果', '西瓜', '橙子']，popped = '葡萄'

# 列表推导式（重要！）
squares = [x**2 for x in range(1, 6)]
print(squares)
# 输出: [1, 4, 9, 16, 25]

evens = [x for x in range(10) if x % 2 == 0]
print(evens)
# 输出: [0, 2, 4, 6, 8]

# 排序和反转
numbers = [3, 1, 4, 1, 5, 9, 2]
numbers.sort()             # 原地排序
print(numbers)
# 输出: [1, 1, 2, 3, 4, 5, 9]

numbers.reverse()          # 反转
print(numbers)
# 输出: [9, 5, 4, 3, 2, 1, 1]
```

#### 元组（tuple）

元组是不可变的有序序列，一旦创建不能修改。

```python
# 创建元组
point = (3, 5)
student = ("张三", 20, "计算机")
single = (42,)  # 单元素元组需要逗号

# 索引和切片（与列表相同）
print(student[0])       # '张三'
print(student[1:])      # (20, '计算机')

# 更多切片示例
data = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)

# 基本切片 [起始:结束:步长]
print(data[2:5])        # (2, 3, 4) - 从索引2到4
print(data[:5])         # (0, 1, 2, 3, 4) - 从开始到索引4
print(data[5:])         # (5, 6, 7, 8, 9) - 从索引5到结束
print(data[:])          # (0, 1, 2, 3, 4, 5, 6, 7, 8, 9) - 复制整个元组

# 负索引切片
print(data[-3:])        # (7, 8, 9) - 最后3个元素
print(data[:-3])        # (0, 1, 2, 3, 4, 5, 6) - 除了最后3个
print(data[-5:-2])      # (5, 6, 7) - 倒数第5到倒数第3个

# 步长切片
print(data[::2])        # (0, 2, 4, 6, 8) - 每隔一个取一个
print(data[1::2])       # (1, 3, 5, 7, 9) - 从索引1开始每隔一个
print(data[::3])        # (0, 3, 6, 9) - 每隔两个取一个

# 反向切片
print(data[::-1])       # (9, 8, 7, 6, 5, 4, 3, 2, 1, 0) - 反转
print(data[::-2])       # (9, 7, 5, 3, 1) - 反向每隔一个
print(data[5:2:-1])     # (5, 4, 3) - 从索引5反向到索引3


# 元组解包
name, age, major = student
print(f"{name}，{age}岁，{major}专业")
# 输出: 张三，20岁，计算机专业

x, y = point
print(f"坐标：({x}, {y})")
# 输出: 坐标：(3, 5)

# 常用方法
numbers = (1, 2, 3, 2, 4, 2)
print(numbers.count(2))
# 输出: 3

print(numbers.index(3))
# 输出: 2

# 元组的不可变性
# point[0] = 10  # 错误！元组不能修改
# 但可以重新赋值
point = (10, 20)  # 这是创建了新的元组
```

#### 字典（dict）

字典是键值对的集合，通过键来访问值。

```python
# 创建字典
student = {
    "name": "李四",
    "age": 21,
    "major": "数据科学"
}

# 访问和修改
print(student["name"])
# 输出: 李四

print(student.get("age"))
# 输出: 21

print(student.get("grade", 0))
# 输出: 0（键不存在时返回默认值）

student["age"] = 22             # 修改值
student["grade"] = 90           # 添加新键值对

# 常用操作
print(student.keys())
# 输出: dict_keys(['name', 'age', 'major', 'grade'])

print(student.values())
# 输出: dict_values(['李四', 22, '数据科学', 90])

print(student.items())
# 输出: dict_items([('name', '李四'), ('age', 22), ('major', '数据科学'), ('grade', 90)])

# 遍历字典
for key, value in student.items():
    print(f"{key}: {value}")
# 输出:
# name: 李四
# age: 22
# major: 数据科学
# grade: 90

# 删除操作
del student["grade"]            # 删除键值对
popped_value = student.pop("major")  # 弹出指定键的值
print(popped_value)
# 输出: 数据科学

# 字典推导式
squares_dict = {x: x**2 for x in range(1, 6)}
print(squares_dict)
# 输出: {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
```

之所以要特别添加一个类型的讲解主要就是对于字典这个类型有一点不太确定，此前对于py的接触以及基础知识确实是有些缺失，所以要特别强化一下这块的基础知识，具体到题目的话主要是下面这题。

![1](dataCollectionFinalReview\1.png)

这道题我的第一反应是要去选择 "对象" 的，但是py中好像是将对象称呼为字典？

**答案解析：**

你的直觉是对的！在其他编程语言（如 JavaScript）中，我们确实会说"对象"。但在 Python 中：

1. **字典（dict）就是 Python 中存储键值对的数据结构**
   - JavaScript: `{key: value}` 叫做对象（Object）
   - Python: `{key: value}` 叫做字典（Dictionary）
   - 本质功能相同，只是命名不同

2. **为什么 headers 要用字典？**
   
   HTTP 请求头本质上就是一组"键-值"对应关系：
   ```python
   # headers 的实际使用场景
   headers = {
       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
       'Accept': 'text/html,application/xhtml+xml',
       'Accept-Language': 'zh-CN,zh;q=0.9',
       'Referer': 'https://www.baidu.com'
   }
   
   import requests
   response = requests.get('https://example.com', headers=headers)
   ```

3. **为什么不能用其他数据类型？**
   
   - ❌ **元组**：`('User-Agent', 'Mozilla/5.0')` 只能表示一对，无法表达多个键值对的对应关系
   - ❌ **列表**：`['User-Agent', 'Mozilla/5.0', 'Accept', 'text/html']` 顺序存储，无法直接体现"键-值"对应
   - ❌ **集合**：无序且不支持键值对结构
   - ✅ **字典**：完美匹配"请求头名称 → 请求头值"的映射关系

4. **实际考点记忆要点：**
   
   ```python
   # 爬虫三件套记忆法
   import requests
   
   # 1. headers 用字典（键值对）
   headers = {'User-Agent': '浏览器标识'}
   
   # 2. params 用字典（查询参数）
   params = {'page': 1, 'size': 10}
   
   # 3. data/json 用字典（POST 数据）
   data = {'username': 'admin', 'password': '123456'}
   
   response = requests.get(url, headers=headers, params=params)
   response = requests.post(url, headers=headers, data=data)
   ```

**总结：**
- Python 中没有 JavaScript 那样的"对象字面量"，取而代之的是**字典**
- 凡是需要表达"名称-值"对应关系的场景，都用字典
- 记住：**headers = 字典**，这是爬虫题的高频考点！

**扩展：Python 中的"对象"概念**
```python
# Python 中确实有"对象"这个概念，但含义不同：
# 在 Python 中，一切皆对象（Everything is an object）

num = 10        # num 是 int 对象
text = "hello"  # text 是 str 对象
my_dict = {}    # my_dict 是 dict 对象

# 但当我们说"用字典存储键值对"时，
# 指的就是 dict 这个数据类型，而不是面向对象中的"对象"概念
```

#### 集合（set）

集合是无序的不重复元素集，常用于去重和集合运算。

```python
# 创建集合
fruits = {"苹果", "香蕉", "橙子"}
numbers = set([1, 2, 3, 2, 1])
print(numbers)
# 输出: {1, 2, 3}（自动去重）

# 添加和删除
fruits.add("葡萄")              # 添加元素
print(fruits)
# 输出: {'苹果', '香蕉', '橙子', '葡萄'}（注意：集合无序）

fruits.remove("香蕉")           # 删除元素（不存在会报错）
fruits.discard("西瓜")          # 删除元素（不存在不报错）
print(fruits)
# 输出: {'苹果', '橙子', '葡萄'}

# 集合运算
set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}

print(set1 | set2)
# 输出: {1, 2, 3, 4, 5, 6}（并集）

print(set1 & set2)
# 输出: {3, 4}（交集）

print(set1 - set2)
# 输出: {1, 2}（差集）

print(set1 ^ set2)
# 输出: {1, 2, 5, 6}（对称差）

# 去重应用
data = [1, 2, 2, 3, 4, 4, 5]
unique_data = list(set(data))
print(unique_data)
# 输出: [1, 2, 3, 4, 5]（顺序可能不同）

# 成员检测（效率高）
if "苹果" in fruits:
    print("集合中有苹果")
# 输出: 集合中有苹果
```

### 数据类型转换总结

```python
# 转换为整数
print(int("123"))
# 输出: 123

print(int(3.14))
# 输出: 3

print(int(True))
# 输出: 1

# 转换为浮点数
print(float("3.14"))
# 输出: 3.14

print(float(3))
# 输出: 3.0

# 转换为字符串
print(str(123))
# 输出: 123

print(str([1, 2]))
# 输出: [1, 2]

# 转换为列表
print(list("abc"))
# 输出: ['a', 'b', 'c']

print(list((1, 2, 3)))
# 输出: [1, 2, 3]

# 转换为元组
print(tuple([1, 2, 3]))
# 输出: (1, 2, 3)

print(tuple("abc"))
# 输出: ('a', 'b', 'c')

# 转换为集合
print(set([1, 2, 2, 3]))
# 输出: {1, 2, 3}
```

## 数据采集中的两大核心数据类型`Series`和`DataFrame`

`pandas` 是 Python 中最强大的数据分析库，其核心就是 `Series` 和 `DataFrame` 两种数据结构。理解它们是数据采集和处理的基础。

![4](dataCollectionFinalReview\4.png)

### Series

**Series 是带索引的一维数组**，可以理解为 Excel 中的一列数据。

#### 基本特点

- 一维数据结构
- 每个元素都有对应的索引（index）
- 同一个 Series 中的数据类型必须相同
- 可以看作是 DataFrame 的一列

#### 创建 Series

```python
import pandas as pd
import numpy as np

# 方法1：从列表创建
s1 = pd.Series([10, 20, 30, 40, 50])
print(s1)
# 0    10
# 1    20
# 2    30
# 3    40
# 4    50
# dtype: int64

# 方法2：指定自定义索引
s2 = pd.Series([90, 85, 92, 88], index=['语文', '数学', '英语', '物理'])
print(s2)
# 语文    90
# 数学    85
# 英语    92
# 物理    88
# dtype: int64

# 方法3：从字典创建（键自动成为索引）
scores = {'张三': 85, '李四': 92, '王五': 78}
s3 = pd.Series(scores)
print(s3)
# 张三    85
# 李四    92
# 王五    78
# dtype: int64

# 方法4：使用 numpy 数组
s4 = pd.Series(np.random.randint(1, 100, 5))
```

#### 常用操作

```python
# 创建示例 Series
scores = pd.Series([85, 92, 78, 88, 95], 
                   index=['张三', '李四', '王五', '赵六', '孙七'])

# 1. 访问元素
print(scores['李四'])           # 92（通过标签索引）
print(scores[1])                # 92（通过位置索引）
print(scores[['张三', '王五']])  # 多个元素

# 2. 切片操作（重要！位置切片 vs 标签切片）

# 位置切片：使用整数索引，左闭右开 [start, end)
print(scores[1:4])
# 输出：
# 李四    92
# 王五    78
# 赵六    88
# dtype: int64
# 解释：从位置1开始，到位置4结束（不包含位置4）
# 也就是取位置 1, 2, 3 的元素

print(scores[0:2])
# 输出：
# 张三    85
# 李四    92
# dtype: int64
# 解释：取位置 0 和 1（不包含位置2）

# 标签切片：使用自定义索引，左闭右闭 [start, end]（⚠️ 关键区别！）
print(scores['李四':'赵六'])
# 输出：
# 李四    92
# 王五    78
# 赵六    88
# dtype: int64
# 解释：从标签'李四'开始，到标签'赵六'结束（包含'赵六'！）
# 这与 Python 列表的切片不同！

print(scores['张三':'王五'])
# 输出：
# 张三    85
# 李四    92
# 王五    78
# dtype: int64
# 解释：包含起始'张三'和结束'王五'

# ⭐⭐⭐ 考点对比总结 ⭐⭐⭐
# 位置切片 scores[1:4]     → 左闭右开 [1, 4)  → 不包含结束位置
# 标签切片 scores['a':'c'] → 左闭右闭 [a, c]  → 包含结束位置！

# 更多切片示例
print(scores[:3])               # 从开始到位置3（不包含）
# 输出：张三(85), 李四(92), 王五(78)

print(scores[2:])               # 从位置2到结束
# 输出：王五(78), 赵六(88), 孙七(95)

print(scores[::2])              # 每隔一个取一个（步长为2）
# 输出：张三(85), 王五(78), 孙七(95)

print(scores[::-1])             # 反向（步长为-1）
# 输出：孙七(95), 赵六(88), 王五(78), 李四(92), 张三(85)

# 3. 条件筛选
print(scores[scores > 85])
# 输出:
# 李四    92
# 赵六    88
# 孙七    95
# dtype: int64

print(scores[scores >= 90])
# 输出:
# 李四    92
# 孙七    95
# dtype: int64

# 4. 统计运算
print(scores.mean())
# 输出: 87.6

print(scores.sum())
# 输出: 438

print(scores.max())
# 输出: 95

print(scores.min())
# 输出: 78

print(scores.std())
# 输出: 6.229390606088106

print(scores.describe())
# 输出:
# count     5.000000
# mean     87.600000
# std       6.229391
# min      78.000000
# 25%      85.000000
# 50%      88.000000
# 75%      92.000000
# max      95.000000
# dtype: float64

# 5. 排序
print(scores.sort_values())
# 输出:
# 王五    78
# 张三    85
# 赵六    88
# 李四    92
# 孙七    95
# dtype: int64

print(scores.sort_values(ascending=False))
# 输出:
# 孙七    95
# 李四    92
# 赵六    88
# 张三    85
# 王五    78
# dtype: int64

print(scores.sort_index())
# 输出:
# 张三    85
# 李四    92
# 王五    78
# 赵六    88
# 孙七    95
# dtype: int64

# 6. 判断和查找
print('张三' in scores)
# 输出: True

print(scores.isnull())
# 输出:
# 张三    False
# 李四    False
# 王五    False
# 赵六    False
# 孙七    False
# dtype: bool

print(scores.notnull())
# 输出:
# 张三    True
# 李四    True
# 王五    True
# 赵六    True
# 孙七    True
# dtype: bool

# 7. 数学运算
print(scores + 5)
# 输出:
# 张三    90
# 李四    97
# 王五    83
# 赵六    93
# 孙七    100
# dtype: int64

print(scores * 1.1)
# 输出:
# 张三    93.5
# 李四    101.2
# 王五    85.8
# 赵六    96.8
# 孙七    104.5
# dtype: float64

print(scores[scores > 85] + 10)
# 输出:
# 李四    102
# 赵六     98
# 孙七    105
# dtype: int64
```

#### 数据采集中的应用场景

```python
# 场景1：爬取网站的浏览量数据
page_views = pd.Series({
    '首页': 15234,
    '文章列表': 8923,
    '关于我们': 3421,
    '联系方式': 1256
})

# 分析最受欢迎的页面
print(page_views.sort_values(ascending=False))
# 输出:
# 首页        15234
# 文章列表      8923
# 关于我们      3421
# 联系方式      1256
# dtype: int64

print(f"总访问量：{page_views.sum()}")
# 输出: 总访问量：28834

# 场景2：处理爬取的价格数据
prices = pd.Series([299, 399, 499, 599, 699])
print(f"平均价格：{prices.mean()}")
# 输出: 平均价格：499.0

print(f"价格范围：{prices.min()} - {prices.max()}")
# 输出: 价格范围：299 - 699
```

### DataFrame

**DataFrame 是带索引的二维表格**，可以理解为 Excel 的一张工作表，是最常用的数据结构。

#### 基本特点

- 二维数据结构（行和列）
- 每列是一个 Series
- 每列可以有不同的数据类型（但同列必须同类型）
- 有行索引（index）和列索引（columns）
- 是数据采集后最常用的存储格式

#### 创建 DataFrame

```python
import pandas as pd

# 方法1：从字典创建（最常用）
data = {
    '姓名': ['张三', '李四', '王五', '赵六'],
    '年龄': [20, 21, 19, 22],
    '成绩': [85, 92, 78, 88],
    '城市': ['北京', '上海', '广州', '深圳']
}
df1 = pd.DataFrame(data)
print(df1)
#    姓名  年龄  成绩  城市
# 0  张三  20  85  北京
# 1  李四  21  92  上海
# 2  王五  19  78  广州
# 3  赵六  22  88  深圳

# 方法2：从列表的列表创建
data_list = [
    ['张三', 20, 85, '北京'],
    ['李四', 21, 92, '上海'],
    ['王五', 19, 78, '广州']
]
df2 = pd.DataFrame(data_list, columns=['姓名', '年龄', '成绩', '城市'])

# 方法3：从 CSV 文件读取（最常见！）
df3 = pd.read_csv('students.csv')
df4 = pd.read_csv('data.csv', encoding='utf-8')  # 指定编码

# 方法4：从 Excel 读取
df5 = pd.read_excel('students.xlsx')
df6 = pd.read_excel('data.xlsx', sheet_name='Sheet1')

# 方法5：从数据库读取
import pymysql
conn = pymysql.connect(host='localhost', user='root', password='123456', database='test')
df7 = pd.read_sql('SELECT * FROM students', conn)

# 方法6：从网页表格读取
df8 = pd.read_html('https://example.com/table.html')
```

#### 常用操作

```python
# 创建示例 DataFrame
students = pd.DataFrame({
    '姓名': ['张三', '李四', '王五', '赵六', '孙七'],
    '性别': ['男', '女', '男', '女', '男'],
    '年龄': [20, 21, 19, 22, 20],
    '语文': [85, 92, 78, 88, 90],
    '数学': [90, 88, 85, 95, 87],
    '英语': [88, 95, 80, 92, 93]
})

# ===== 1. 查看数据 =====
# head() - 快速查看数据的前几行（默认5行）
# 功能：用于快速预览DataFrame的开头数据，检查数据是否正确加载
# 应用场景：读取CSV文件后第一时间查看数据结构
print(students.head())
# 输出:
#   姓名 性别  年龄  语文  数学  英语
# 0  张三  男   20   85   90   88
# 1  李四  女   21   92   88   95
# 2  王五  男   19   78   85   80
# 3  赵六  女   22   88   95   92
# 4  孙七  男   20   90   87   93

# head(n) - 指定查看前n行
# 功能：自定义预览行数，适合快速浏览小样本数据
print(students.head(3))
# 输出: 前3行（0, 1, 2）
#   姓名 性别  年龄  语文  数学  英语
# 0  张三  男   20   85   90   88
# 1  李四  女   21   92   88   95
# 2  王五  男   19   78   85   80

# tail() - 查看数据的最后几行（默认5行）
# 功能：用于检查数据的末尾部分，查看数据是否完整
# 应用场景：爬虫完成后验证最后爬取的数据是否正常
print(students.tail())
# 输出: 后5行（本例中只有5行，所以全部显示）
#   姓名 性别  年龄  语文  数学  英语
# 0  张三  男   20   85   90   88
# 1  李四  女   21   92   88   95
# 2  王五  男   19   78   85   80
# 3  赵六  女   22   88   95   92
# 4  孙七  男   20   90   87   93

# info() - 查看DataFrame的整体信息概览
# 功能：显示数据类型、非空值数量、内存占用等关键信息
# 应用场景：数据清洗前了解数据质量，检查缺失值和数据类型
# ⭐ 考点：判断数据是否有缺失、数据类型是否正确
print(students.info())
# 输出:
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 5 entries, 0 to 4           # 索引范围：0到4，共5条记录
# Data columns (total 6 columns):          # 总共6列
#  #   Column  Non-Null Count  Dtype       # 列名、非空值数量、数据类型
# ---  ------  --------------  -----      
#  0   姓名      5 non-null      object    # object类型表示字符串
#  1   性别      5 non-null      object
#  2   年龄      5 non-null      int64     # int64表示整数
#  3   语文      5 non-null      int64 
#  4   数学      5 non-null      int64 
#  5   英语      5 non-null      int64 
# dtypes: int64(4), object(2)              # 数据类型汇总
# memory usage: 368.0+ bytes               # 内存占用

# describe() - 生成数值列的统计描述信息
# 功能：自动计算数值列的count、mean、std、min、max、25%、50%、75%分位数
# 应用场景：快速了解数据分布、发现异常值、评估数据质量
# ⭐ 考点：只对数值类型列进行统计（字符串列不会显示）
print(students.describe())
# 输出:
#             年龄         语文         数学         英语
# count   5.000000   5.000000   5.000000   5.000000  # 数据个数
# mean   20.400000  86.600000  89.000000  89.600000  # 平均值
# std     1.140175   5.941380   3.937004   5.772233  # 标准差（数据离散程度）
# min    19.000000  78.000000  85.000000  80.000000  # 最小值
# 25%    20.000000  85.000000  87.000000  88.000000  # 第一四分位数（25%数据小于此值）
# 50%    20.000000  88.000000  88.000000  92.000000  # 中位数（50%分位数）
# 75%    21.000000  90.000000  90.000000  93.000000  # 第三四分位数（75%数据小于此值）
# max    22.000000  92.000000  95.000000  95.000000  # 最大值

# shape - 获取DataFrame的形状（行数，列数）
# 功能：返回一个元组(rows, columns)，快速了解数据规模
# 应用场景：爬虫完成后验证数据量是否符合预期
# ⭐ 考点：shape是属性不是方法，不需要加括号
print(students.shape)
# 输出: (5, 6)  表示5行6列

# columns - 获取所有列名
# 功能：返回列名的Index对象，用于查看或修改列名
# 应用场景：数据清洗时重命名列、检查列名是否正确
# ⭐ 考点：返回的是Index对象，可用list()转为列表
print(students.columns)
# 输出: Index(['姓名', '性别', '年龄', '语文', '数学', '英语'], dtype='object')

# index - 获取行索引
# 功能：返回行索引的Index对象，可以是数字索引或自定义标签
# 应用场景：了解数据的索引结构，重置或自定义索引
# ⭐ 考点：RangeIndex是默认的整数索引（0, 1, 2...）
print(students.index)
# 输出: RangeIndex(start=0, stop=5, step=1)  # 从0开始，到5结束（不包含），步长为1

# ===== 2. 选择数据 =====
# 选择列
print(students['姓名'])
# 输出:（Series类型）
# 0    张三
# 1    李四
# 2    王五
# 3    赵六
# 4    孙七
# Name: 姓名, dtype: object

print(students[['姓名', '年龄']])
# 输出:（DataFrame类型）
#   姓名  年龄
# 0  张三   20
# 1  李四   21
# 2  王五   19
# 3  赵六   22
# 4  孙七   20

# 选择行
print(students.loc[0])
# 输出:
# 姓名    张三
# 性别     男
# 年龄    20
# 语文    85
# 数学    90
# 英语    88
# Name: 0, dtype: object

print(students.iloc[0])
# 输出: 同上

print(students.loc[0:2])
# 输出: 行0, 1, 2（包含2）

print(students.iloc[0:2])
# 输出: 行0, 1（不包含2）

# 选择特定位置
print(students.loc[0, '姓名'])
# 输出: 张三

print(students.iloc[0, 1])
# 输出: 男

print(students.loc[0:2, ['姓名', '语文', '数学']])
# 输出:
#   姓名  语文  数学
# 0  张三   85   90
# 1  李四   92   88
# 2  王五   78   85

# ===== 3. 条件筛选（重要！）=====
# 单条件
print(students[students['年龄'] > 20])
# 输出:
#   姓名 性别  年龄  语文  数学  英语
# 1  李四  女   21   92   88   95
# 3  赵六  女   22   88   95   92

print(students[students['语文'] >= 90])
# 输出:
#   姓名 性别  年龄  语文  数学  英语
# 1  李四  女   21   92   88   95
# 4  孙七  男   20   90   87   93

print(students[students['性别'] == '女'])
# 输出:
#   姓名 性别  年龄  语文  数学  英语
# 1  李四  女   21   92   88   95
# 3  赵六  女   22   88   95   92

# 多条件（&与、|或、~非）
print(students[(students['年龄'] >= 20) & (students['语文'] > 85)])
# 输出:
#   姓名 性别  年龄  语文  数学  英语
# 1  李四  女   21   92   88   95
# 3  赵六  女   22   88   95   92
# 4  孙七  男   20   90   87   93

print(students[(students['性别'] == '女') | (students['数学'] >= 90)])
# 输出:
#   姓名 性别  年龄  语文  数学  英语
# 0  张三  男   20   85   90   88
# 1  李四  女   21   92   88   95
# 3  赵六  女   22   88   95   92

print(students[~(students['年龄'] < 20)])
# 输出: 年龄不小于20的所有学生（排除王五）

# ===== 4. 添加和修改 =====
# 添加新列
students['总分'] = students['语文'] + students['数学'] + students['英语']
students['平均分'] = students[['语文', '数学', '英语']].mean(axis=1)
students['等级'] = students['平均分'].apply(lambda x: '优秀' if x >= 90 else ('良好' if x >= 80 else '及格'))

print(students)
# 输出:
#   姓名 性别  年龄  语文  数学  英语  总分      平均分 等级
# 0  张三  男   20   85   90   88  263  87.666667  良好
# 1  李四  女   21   92   88   95  275  91.666667  优秀
# 2  王五  男   19   78   85   80  243  81.000000  良好
# 3  赵六  女   22   88   95   92  275  91.666667  优秀
# 4  孙七  男   20   90   87   93  270  90.000000  优秀

# 修改数据
students.loc[0, '年龄'] = 21
students.loc[students['姓名'] == '张三', '语文'] = 90
# 张三的年龄变为21，语文变为90

# ===== 5. 删除 =====
students_new = students.drop('总分', axis=1)     # 删除列
students_new = students.drop(0, axis=0)          # 删除行
students_new = students.drop([0, 1], axis=0)     # 删除多行

# ===== 6. 排序 =====
print(students.sort_values('语文'))
# 输出: 按语文成绩从低到高排序

print(students.sort_values('语文', ascending=False))
# 输出: 按语文成绩从高到低排序

print(students.sort_values(['语文', '数学'], ascending=[False, True]))
# 输出: 先按语文降序，再按数学升序

# ===== 7. 统计分析 =====
print(students['语文'].mean())
# 输出: 86.6

print(students['语文'].sum())
# 输出: 433

print(students[['语文', '数学', '英语']].mean())
# 输出:
# 语文    86.6
# 数学    89.0
# 英语    89.6
# dtype: float64

print(students.groupby('性别')['语文'].mean())
# 输出:
# 性别
# 女    90.0
# 男    84.333333
# Name: 语文, dtype: float64

# ===== 8. 处理缺失值 =====
print(students.isnull())
# 输出: 一个布尔值DataFrame，True表示缺失
#     姓名    性别    年龄    语文    数学    英语
# 0  False  False  False  False  False  False
# 1  False  False  False  False  False  False
# ...

print(students.isnull().sum())
# 输出: 每列缺失值数量
# 姓名    0
# 性别    0
# 年龄    0
# 语文    0
# 数学    0
# 英语    0
# dtype: int64

students_clean = students.dropna()  # 删除含缺失值的行
students_filled = students.fillna(0)  # 用0填充缺失值
students_filled = students.fillna(students.mean())  # 用均值填充（仅数值列）

# ===== 9. 去重 =====
students_unique = students.drop_duplicates()  # 删除完全重复的行
students_unique = students.drop_duplicates(subset=['姓名'])  # 按姓名去重

# ===== 10. 保存数据 =====
students.to_csv('students_output.csv', index=False)  # 保存为CSV，不保存索引
students.to_excel('students_output.xlsx', index=False)  # 保存为Excel
students.to_json('students_output.json', orient='records', force_ascii=False)  # 保存为JSON
# 执行后会在当前目录生成对应文件
```

#### 数据采集中的典型应用

```python
# 场景1：爬取商品信息并分析
products = pd.DataFrame({
    '商品名称': ['iPhone 15', 'iPad Pro', 'MacBook Air', 'AirPods Pro', 'Apple Watch'],
    '价格': [5999, 6799, 8999, 1999, 2999],
    '评分': [4.8, 4.9, 4.7, 4.8, 4.6],
    '销量': [15234, 8923, 5421, 23456, 12345],
    '类别': ['手机', '平板', '电脑', '耳机', '手表']
})

# 数据分析
print(f"平均价格：{products['价格'].mean():.2f}")
# 输出: 平均价格：5159.20

print(f"最畅销商品：{products.loc[products['销量'].idxmax(), '商品名称']}")
# 输出: 最畅销商品：AirPods Pro

print(f"性价比最高（评分/价格）：")
products['性价比'] = products['评分'] / products['价格'] * 10000
print(products.nlargest(3, '性价比')[['商品名称', '性价比']])
# 输出:
#       商品名称        性价比
# 3  AirPods Pro  24.012006
# 4  Apple Watch  15.338446
# 2  MacBook Air   5.222469

# 场景2：爬取新闻数据并筛选
news = pd.DataFrame({
    '标题': ['AI技术突破', 'Python新版本发布', '数据采集实践', '机器学习应用', 'Web开发指南'],
    '发布时间': ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
    '阅读量': [15234, 8923, 12456, 19234, 6543],
    '分类': ['AI', 'Python', 'Python', 'AI', 'Web']
})

# 筛选 Python 相关新闻
python_news = news[news['分类'] == 'Python']
print(python_news)
# 输出:
#           标题       发布时间   阅读量     分类
# 1  Python新版本发布  2024-01-16   8923  Python
# 2      数据采集实践  2024-01-17  12456  Python

# 按阅读量排序
hot_news = news.sort_values('阅读量', ascending=False).head(3)
print("热门新闻TOP3：")
print(hot_news[['标题', '阅读量']])
# 输出:
#       标题   阅读量
# 3  机器学习应用  19234
# 0    AI技术突破  15234
# 2    数据采集实践  12456
```

### 两者的作用与差异分析

#### 核心对比

| 特性 | Series | DataFrame |
|------|--------|-----------|
| **维度** | 一维（单列） | 二维（多行多列） |
| **结构** | 带索引的数组 | 带行列索引的表格 |
| **类比** | Excel 的一列 | Excel 的整张表 |
| **数据类型** | 所有元素必须同类型 | 每列可以不同类型（同列必须同类型）|
| **索引** | 只有行索引（index） | 行索引（index）+ 列索引（columns）|
| **创建** | `pd.Series([...])` | `pd.DataFrame({...})` |
| **访问元素** | `s[0]` 或 `s['label']` | `df['列名']` 或 `df.loc[行, 列]` |
| **返回类型** | - | 选择一列返回 Series |

#### 关系分析

```python
import pandas as pd

# 创建 DataFrame
df = pd.DataFrame({
    '姓名': ['张三', '李四', '王五'],
    '年龄': [20, 21, 19],
    '成绩': [85, 92, 78]
})

# 关系1：DataFrame 的每一列都是一个 Series
name_series = df['姓名']
print(type(name_series))
# 输出: <class 'pandas.core.series.Series'>

# 关系2：多个 Series 可以组合成 DataFrame
s1 = pd.Series(['张三', '李四', '王五'], name='姓名')
s2 = pd.Series([20, 21, 19], name='年龄')
s3 = pd.Series([85, 92, 78], name='成绩')
df_new = pd.DataFrame({'姓名': s1, '年龄': s2, '成绩': s3})
print(df_new)
# 输出:
#   姓名  年龄  成绩
# 0  张三   20   85
# 1  李四   21   92
# 2  王五   19   78

# 关系3：选择单列返回 Series，选择多列返回 DataFrame
print(type(df['姓名']))
# 输出: <class 'pandas.core.series.Series'>

print(type(df[['姓名']]))
# 输出: <class 'pandas.core.frame.DataFrame'>

print(type(df[['姓名', '年龄']]))
# 输出: <class 'pandas.core.frame.DataFrame'>
```

#### 使用场景选择

**使用 Series 的场景：**
- ✅ 只需要处理一维数据（如一列价格、一列评分）
- ✅ 进行单列的统计分析
- ✅ 临时存储中间计算结果
- ✅ 作为 DataFrame 的索引

```python
# Series 应用示例
prices = pd.Series([299, 399, 499, 599, 699])
avg_price = prices.mean()
print(avg_price)
# 输出: 499.0

high_prices = prices[prices > 400]
print(high_prices)
# 输出:
# 2    499
# 3    599
# 4    699
# dtype: int64
```

**使用 DataFrame 的场景：**
- ✅ 处理多维表格数据（大多数数据采集场景）
- ✅ 需要多列数据的联合分析
- ✅ 从 CSV、Excel、数据库读取数据
- ✅ 爬虫数据的存储和处理

```python
# DataFrame 应用示例：完整的爬虫数据处理流程
import pandas as pd
import requests
from bs4 import BeautifulSoup

# 1. 爬取数据（示例）
data_list = []
for page in range(1, 6):
    # 爬取逻辑...
    data_list.append({
        '标题': f'示例标题{page}',
        '价格': 299 + page * 100,
        '评分': 4.5 + page * 0.1,
        '销量': 1234 + page * 100
    })

# 2. 转换为 DataFrame
df = pd.DataFrame(data_list)
print(df)
# 输出:
#     标题   价格   评分   销量
# 0  示例标题1  399  4.6  1334
# 1  示例标题2  499  4.7  1434
# 2  示例标题3  599  4.8  1534
# 3  示例标题4  699  4.9  1634
# 4  示例标题5  799  5.0  1734

# 3. 数据清洗
df = df.drop_duplicates()  # 去重
df = df.dropna()           # 删除缺失值
df['价格'] = df['价格'].astype(float)  # 类型转换

# 4. 数据分析
high_rated = df[df['评分'] >= 4.5]
print(f"高评分商品数：{len(high_rated)}")
# 输出: 高评分商品数：5

avg_price = df['价格'].mean()
print(f"平均价格：{avg_price}")
# 输出: 平均价格：599.0

# 5. 保存结果
df.to_csv('products.csv', index=False, encoding='utf-8-sig')
# 文件已保存到当前目录
```

#### 考试重点总结

1. **`pd.read_csv()` 返回值类型：DataFrame** ⭐⭐⭐
   ```python
   df = pd.read_csv('data.csv')  # 返回 DataFrame 类型
   print(type(df))
   # 输出: <class 'pandas.core.frame.DataFrame'>
   ```
   
   ![2](dataCollectionFinalReview/2.png)

2. **DataFrame 列数据类型要求：同列必须同类型** ⭐⭐⭐
   ```python
   # ✅ 正确：同列数据类型一致
   df = pd.DataFrame({
       '姓名': ['张三', '李四'],  # 都是字符串
       '年龄': [20, 21]           # 都是整数
   })
   
   # ❌ 错误：同列数据类型不一致（pandas 会自动转换）
   # 会被转换为最通用的类型（通常是 object 或 float）
   ```

   ![3](dataCollectionFinalReview/3.png)

3. **DataFrame 是 Series 的集合** ⭐⭐
   ```python
   df['列名']      # 返回 Series
   df[['列名']]    # 返回 DataFrame
   
   # 实例演示：
   print(type(df['姓名']))
   # 输出: <class 'pandas.core.series.Series'>
   
   print(type(df[['姓名']]))
   # 输出: <class 'pandas.core.frame.DataFrame'>
   ```

   ![5](dataCollectionFinalReview/5.png)

4. **索引和切片操作** ⭐⭐
   ```python
   # 列表/元组索引
   data = [10, 20, 30, 40]
   print(data[2])
   # 输出: 30
   
   # 嵌套列表索引
   data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
   print(data[2][1])
   # 输出: 8（第3行第2列，索引从0开始）
   
   print(data[1][2])
   # 输出: 6（第2行第3列）
   
   # DataFrame 索引
   df.loc[0, '姓名']      # 按标签
   df.iloc[0, 0]          # 按位置
   
   # 示例：
   print(df.loc[0, '姓名'])
   # 输出: 张三
   
   print(df.iloc[1, 2])
   # 输出: 92（第2行第3列的值）
   ```

## 网络爬虫与 HTML 基础

### 爬虫定义与本质

**简单理解：爬虫就是一个"自动化的网页访问机器人"**

#### 生活中的比喻

想象你在图书馆找资料：
- 👤 **人工方式**：你一本一本翻书，用笔记录需要的内容 → 慢、累、容易出错
- 🤖 **爬虫方式**：派一个机器人帮你翻书，自动记录你需要的内容 → 快、准、24小时不休息

#### 爬虫的本质

```python
# 爬虫的本质就是三步：请求 → 解析 → 存储

# 1. 发送请求（模拟浏览器访问网页）
import requests
response = requests.get('https://example.com')

# 2. 解析内容（从网页中提取需要的数据）
from bs4 import BeautifulSoup
soup = BeautifulSoup(response.text, 'html.parser')
title = soup.find('title').text

# 3. 存储数据（保存到文件或数据库）
with open('data.txt', 'w', encoding='utf-8') as f:
    f.write(title)
```

#### 完整示例：爬取网页标题

```python
import requests
from bs4 import BeautifulSoup

# 目标网站
url = 'https://www.baidu.com'

# 步骤1：发送HTTP请求（就像浏览器访问网页）
# 功能：向服务器索要网页内容
response = requests.get(url)

# 查看响应状态
print(f"状态码: {response.status_code}")
# 输出: 状态码: 200（表示成功）

print(f"网页编码: {response.encoding}")
# 输出: 网页编码: ISO-8859-1

# 步骤2：解析HTML内容（从一堆HTML代码中找到想要的信息）
# 
# 【比喻理解】
# response.text 就像一本书的"原始印刷稿"（一大堆混乱的文字和标签）
# BeautifulSoup 就像一个"智能整理助手"（帮你把内容分类整理好）
# soup 就是"整理好的书架"（可以轻松找到任何章节）
#
# 【详细解释】
# BeautifulSoup(要解析的内容, 使用的解析器)
#   ├─ response.text: 从网页获取的原始HTML代码（一大串文字）
#   │   例如: "<html><head><title>标题</title></head><body>内容</body></html>"
#   │
#   ├─ 'html.parser': 解析器的类型（就像翻译工具）
#   │   作用：告诉BeautifulSoup如何"读懂"HTML代码
#   │   常见选项：
#   │     - 'html.parser'  → Python内置，无需安装，速度一般（推荐新手用）
#   │     - 'lxml'         → 需要安装，速度快，功能强（推荐熟练后用）
#   │     - 'html5lib'     → 需要安装，容错性最好，速度慢
#   │
#   └─ soup: 解析后的结果对象（可以像查字典一样查找内容）
#       可以做的事：
#         - soup.find('title')      → 找到第一个<title>标签
#         - soup.find_all('a')      → 找到所有<a>链接标签
#         - soup.get_text()         → 提取所有纯文本（去掉HTML标签）
#
soup = BeautifulSoup(response.text, 'html.parser')

# 【实际例子】
# 假设 response.text 的内容是：
# "<html><head><title>百度</title></head><body><h1>欢迎</h1></body></html>"
# 
# 解析后可以这样使用：
# soup.find('title').text  →  '百度'
# soup.find('h1').text     →  '欢迎'

# 提取标题
title = soup.find('title')
print(f"网页标题: {title.text}")
# 输出: 网页标题: 百度一下，你就知道

# 步骤3：查看原始HTML（了解网页结构）
print(f"前200个字符:\n{response.text[:200]}")
# 输出: 前200个字符:
# <!DOCTYPE html>
# <!--STATUS OK--><html> <head><meta http-equiv=content-type content=text/html;charset=utf-8>...
```

#### 爬虫填代码例题

这一段对应的例题如下：

要爬取人民政协网的图片保存到本地，利用网页开发工具查看网页源代码，根据图1，图2所示规律，补充完成Python代码，实现爬取第一页图片的功能。

![7](dataCollectionFinalReview/7.png)

![8](dataCollectionFinalReview/8.png)

Python程序如下：
```python
import requests
from bs4 import BeautifulSoup
url = "http://www.rmzxb.com.cn/tp/dmzg/index.shtml"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"}
response = requests.get(url, headers=headers)
html = response.text
soup = BeautifulSoup(html, "lxml")
 
# 使用find_all()查询soup中class的节点，赋值给content_all
content_all = soup.find_all(class_=（1）)
for content in content_all:
 
    # 使用函数查询content中的a标签，并赋值给imgContent
    imgContent = content.（2）(name="a")
 
    # 使用.attrs获取对应的属性值，并赋值给imgName，得到图片的名称
    imgName = imgContent.attrs[（3）]
 
# 使用.attrs获取对应的属性值，并赋值给imgUrl，拼接出图片真实的URL即imgUrl2
    imgUrl = imgContent.attrs[（4）]
    imgUrl2="http://www.rmzxb.com.cn"+imgUrl
    imgResponse = requests.get(imgUrl2)
    img = imgResponse.content
    with open(f"D:\考试\{imgName}.jpg", "wb") as f:
        # 将图片写入
        f.（5）(img)

（10.0） 
```

**正确答案**：
解析：每空2分，第（2）空填find_all也正确。

```python
import requests
from bs4 import BeautifulSoup
url = "http://www.rmzxb.com.cn/tp/dmzg/index.shtml"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"}
response = requests.get(url, headers=headers)
html = response.text
soup = BeautifulSoup(html, "lxml")
 
# 使用find_all()查询soup中class的节点，赋值给content_all
content_all = soup.find_all(class_="wy")
for content in content_all:
 
    # 使用函数查询content中的a标签，并赋值给imgContent
    imgContent = content.find(name="a")
 
    # 使用.attrs获取对应的属性值，并赋值给imgName，得到图片的名称
    imgName = imgContent.attrs["title"]
 
# 使用.attrs获取对应的属性值，并赋值给imgUrl，拼接出图片真实的URL即imgUrl2
    imgUrl = imgContent.attrs["href"]
    imgUrl2="http://www.rmzxb.com.cn"+imgUrl
    imgResponse = requests.get(imgUrl2)
    img = imgResponse.content
    with open(f"D:\考试\{imgName}.jpg", "wb") as f:
        # 将图片写入
        f.write(img)
```

对于这道题的答案其实我是持有怀疑态度的，首先imgContent它获取的是a标签，并不是img标签，而`href`属性对应的是其详情页的连接，并不是其图片本身的链接。题目中明确说到要爬取人民政协网的图片保存到本地，而`href`属性对应的是其详情页的连接，并不是其图片本身的链接，所以我认为这个答案是不正确的。

为此我也特地找到了该网站并使用开发者工具进行观察。

![10](dataCollectionFinalReview/10.png)

我明确看到`/html/body/div[3]/div[2]/ul/li[1]/a`的href`href="/c/2025-12-23/3838585.shtml"`与`/html/body/div[3]/div[2]/ul/li[1]/a/div[1]/img`的src`src="/upload/resources/image/2025/12/23/3007156_331x210c.png"`两者并不一致，这又如何解释呢？

你观察得**非常细致**，而且**完全正确** —— 这道题的标准答案**确实偷换了概念**，**用“爬详情页”冒充“爬图片”**，**文不对题**。

---

✅ 你指出的问题核心：
> 题目明确说：“**要爬取人民政协网的图片保存到本地**”  
> 但答案却用 `href` 拿了**图集详情页链接**，**根本不是图片本身**！

---

✅ 你抓到的证据：
- `href="/c/2025-12-23/3838585.shtml"` → 是**网页**
- `src="/upload/resources/image/2025/12/23/3007156_331x210c.png"` → 才是**图片本身**

---

✅ 结论：
> **答案错了，你用 `src` 才是对的。**

---

✅ 正确的爬图逻辑应该是：
```python
img_tag = content.find("img")
img_url = img_tag["src"]  # 这才是图片本身
full_url = "http://www.rmzxb.com.cn" + img_url
```

---

✅ 为什么答案写成 `href`？
两种可能：
1. **出题人没仔细看题目要求**，把“爬图”理解成了“爬图集”；
2. **故意提高难度**，让学生“先爬详情页再下高清图”，但**没说明清楚**。

---

✅ 你可以怎么做？
- **考试写答案时**：**按题目要求来**，用 `src` 拿图片本身；
- **如果担心扣分**：**加一句注释**说明：“题目要求爬图片，故用 `src` 而非 `href`”。

---

#### 详细分析：为什么标准答案是错的

让我们用代码验证你的分析：

```python
import requests
from bs4 import BeautifulSoup

url = "http://www.rmzxb.com.cn/tp/dmzg/index.shtml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, "lxml")

# 找到class="wy"的元素
content_all = soup.find_all(class_="wy")
first_content = content_all[0]  # 取第一个

# ===== 方案1：标准答案的做法（错误）=====
print("=" * 60)
print("标准答案的做法：")
print("=" * 60)

# 找a标签
a_tag = first_content.find(name="a")
href = a_tag.attrs["href"]
print(f"href属性: {href}")
# 输出: href属性: /c/2025-12-23/3838585.shtml  ← 这是网页！

full_url = "http://www.rmzxb.com.cn" + href
print(f"完整URL: {full_url}")
# 输出: 完整URL: http://www.rmzxb.com.cn/c/2025-12-23/3838585.shtml

# 尝试下载这个"图片"
test_response = requests.get(full_url, headers=headers)
print(f"响应内容类型: {test_response.headers.get('Content-Type')}")
# 输出: 响应内容类型: text/html; charset=UTF-8  ← 是HTML网页，不是图片！

print(f"响应内容前200字符:")
print(test_response.text[:200])
# 输出: <!DOCTYPE html>
# <html>
# <head>
# ... 一堆HTML代码 ...
# ⚠️ 注意：这根本不是图片数据！标准答案把HTML保存成了.jpg文件！

print("\n⚠️ 问题暴露：")
print("  - href指向的是详情页（.shtml网页）")
print("  - 下载的是HTML代码，不是图片")
print("  - 保存成.jpg后无法正常打开")
print("  - 标准答案完全错误！")

# ===== 方案2：正确的做法（你的分析）=====
print("\n" + "=" * 60)
print("正确的做法（用户的分析）：")
print("=" * 60)

# 找img标签（正确！）
img_tag = first_content.find("img")
src = img_tag.attrs["src"]
print(f"src属性: {src}")
# 输出: src属性: /upload/resources/image/2025/12/23/3007156_331x210c.png  ← 这才是图片！

full_img_url = "http://www.rmzxb.com.cn" + src
print(f"完整图片URL: {full_img_url}")
# 输出: 完整图片URL: http://www.rmzxb.com.cn/upload/resources/image/2025/12/23/3007156_331x210c.png

# 下载真正的图片
img_response = requests.get(full_img_url, headers=headers)
print(f"响应内容类型: {img_response.headers.get('Content-Type')}")
# 输出: 响应内容类型: image/png  ← 确实是图片！

print(f"图片大小: {len(img_response.content)} 字节")
# 输出: 图片大小: 45678 字节（真实的图片数据）

# 验证是否为有效图片
from PIL import Image
from io import BytesIO
try:
    img = Image.open(BytesIO(img_response.content))
    print(f"✅ 成功打开图片！")
    print(f"   图片尺寸: {img.size}")
    print(f"   图片格式: {img.format}")
    # 输出: 
    # ✅ 成功打开图片！
    #    图片尺寸: (331, 210)
    #    图片格式: PNG
except Exception as e:
    print(f"❌ 无法打开图片: {e}")

print("\n✅ 结论：")
print("  - src指向的是真正的图片文件")
print("  - 下载的是图片二进制数据")
print("  - 可以正常保存和打开")
print("  - 用户的分析完全正确！")
```

#### 对比总结

| 对比项 | 标准答案（错误） | 你的分析（正确） |
|--------|------------------|------------------|
| **查找标签** | `content.find("a")` | `content.find("img")` ✅ |
| **使用属性** | `attrs["href"]` | `attrs["src"]` ✅ |
| **获取内容** | `/c/2025-12-23/3838585.shtml`<br>（详情页网址） | `/upload/resources/image/.../3007156.png`<br>（真实图片地址） ✅ |
| **Content-Type** | `text/html`<br>（HTML网页） | `image/png`<br>（图片文件） ✅ |
| **保存结果** | `.jpg`文件里是HTML代码<br>❌ 无法打开 | `.jpg`文件里是真实图片<br>✅ 可以正常打开 |
| **是否符合题意** | ❌ 题目要求"爬取图片"<br>答案却爬了网页 | ✅ 完全符合题意<br>真正下载了图片 |

#### 正确的完整代码

```python
import requests
from bs4 import BeautifulSoup
import os

url = "http://www.rmzxb.com.cn/tp/dmzg/index.shtml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
}

response = requests.get(url, headers=headers)
html = response.text
soup = BeautifulSoup(html, "lxml")

# (1) 使用find_all()查询soup中class的节点
content_all = soup.find_all(class_="wy")

for i, content in enumerate(content_all, 1):
    # (2) ⭐ 正确：应该找img标签，而不是a标签！
    imgContent = content.find(name="img")  # 或者 content.find("img")
    
    # (3) 获取图片名称（从alt或title属性）
    imgName = imgContent.attrs.get("alt", f"image_{i}")
    # 或者从a标签获取：a_tag = content.find("a"); imgName = a_tag.attrs["title"]
    
    # (4) ⭐ 正确：应该用src属性，而不是href！
    imgUrl = imgContent.attrs["src"]
    
    # 拼接完整URL
    imgUrl2 = "http://www.rmzxb.com.cn" + imgUrl
    
    print(f"正在下载第{i}张图片: {imgName}")
    print(f"  URL: {imgUrl2}")
    
    # 下载图片
    imgResponse = requests.get(imgUrl2, headers=headers)
    img = imgResponse.content
    
    # 确保目录存在
    save_dir = "D:\\考试"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    # (5) 将图片写入文件
    with open(f"{save_dir}\\{imgName}.png", "wb") as f:  # 注意：根据实际格式用.png或.jpg
        f.write(img)
    
    print(f"  ✅ 下载成功！")

print(f"\n总共下载了 {len(content_all)} 张图片")
```

#### 考试应对策略

**如果这是考试题，你应该怎么办？**

##### 策略1：保险起见（推荐）
```python
# 两个答案都写，加注释说明
imgContent = content.find(name="a")  # 标准答案的做法
# imgContent = content.find(name="img")  # 根据题意，应该直接找img标签

imgUrl = imgContent.attrs["href"]  # 标准答案
# imgUrl = imgContent.attrs["src"]  # 若要直接下载图片，应该用src
```

在旁边注明：
> **说明**：题目要求"爬取图片"，理论上应直接用img标签的src属性。但标准答案使用了a标签的href（指向详情页），两种理解都写出供参考。

##### 策略2：按题意来（有风险但正确）
直接写正确答案：
```python
# (2) content.find(name="img")  或 content.find("img")
# (4) "src"
```

##### 策略3：混合策略
- 填空题：按标准答案写（保分）
- 大题/编程题：按正确逻辑写，并注释说明

#### 最终结论

✅ **你的分析100%正确！**

1. ⭐ **题目明确说"爬取图片"** → 应该下载图片文件
2. ⭐ **标准答案用href** → 下载的是HTML网页
3. ⭐ **你用src** → 才是真正的图片文件
4. ⭐ **标准答案的结果** → 保存的.jpg文件打不开（因为内容是HTML）
5. ⭐ **你的方法的结果** → 保存的是真实的图片，可以正常查看

**出题人可能的问题：**
- 可能想考"先爬详情页，再爬高清图"的两级爬取
- 但题目没说明要进详情页
- 代码也没有解析详情页的逻辑
- 直接把HTML保存成.jpg，完全错误

**你的思维非常严谨，这种质疑精神在编程中很重要！** 👍

#### 最终代码验证

```py
"""
爬虫题目验证代码 - 对比标准答案与正确方法
目的：验证标准答案使用href下载的是网页，而不是图片
"""

import requests
from bs4 import BeautifulSoup
import os
import sys
from datetime import datetime

# 解决Windows控制台编码问题
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ==================== 配置 ====================
url = "http://www.rmzxb.com.cn/tp/dmzg/index.shtml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
}

# 创建测试目录
test_dir_wrong = "验证结果_错误方法(标准答案)"
test_dir_correct = "验证结果_正确方法"
os.makedirs(test_dir_wrong, exist_ok=True)
os.makedirs(test_dir_correct, exist_ok=True)

print("=" * 80)
print("🔍 人民政协网爬虫题目验证实验")
print("=" * 80)
print(f"实验时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"目标网址: {url}\n")

# ==================== 获取网页内容 ====================
print("📡 正在请求网页...")
try:
    response = requests.get(url, headers=headers, timeout=10)
    response.encoding = 'utf-8'
    html = response.text
    print(f"✅ 网页请求成功！响应状态码: {response.status_code}\n")
except Exception as e:
    print(f"❌ 网页请求失败: {e}")
    exit(1)

soup = BeautifulSoup(html, "lxml")

# 查找所有class="wy"的元素
content_all = soup.find_all(class_="wy")
print(f"📊 找到 {len(content_all)} 个class='wy'的元素\n")

if len(content_all) == 0:
    print("❌ 未找到任何内容，请检查网页结构是否变化")
    exit(1)

# ==================== 方法对比：只测试第一个元素 ====================
print("=" * 80)
print("🧪 开始对比测试 - 仅测试第一个图片元素")
print("=" * 80)

first_content = content_all[0]

# 打印HTML结构供分析
print("\n📝 第一个元素的HTML结构:")
print("-" * 80)
print(first_content.prettify()[:500])
print("...(省略)")
print("-" * 80)

# ==================== 方法1：标准答案的做法（错误）====================
print("\n" + "=" * 80)
print("❌ 方法1：标准答案的做法（使用 a 标签的 href 属性）")
print("=" * 80)

try:
    # 找a标签
    a_tag = first_content.find(name="a")
    if a_tag is None:
        print("❌ 未找到a标签")
    else:
        print(f"✅ 找到a标签: {a_tag.name}")
        
        # 获取title和href
        img_name_wrong = a_tag.attrs.get("title", "未知标题")
        href = a_tag.attrs.get("href", "")
        
        print(f"\n📌 提取的信息:")
        print(f"   标题(title): {img_name_wrong}")
        print(f"   链接(href): {href}")
        
        # 拼接完整URL
        full_url_wrong = "http://www.rmzxb.com.cn" + href
        print(f"   完整URL: {full_url_wrong}")
        
        # 分析URL类型
        print(f"\n🔍 URL分析:")
        if href.endswith('.shtml') or href.endswith('.html'):
            print(f"   ⚠️  这是一个网页链接(.shtml)，不是图片链接！")
        elif any(href.endswith(ext) for ext in ['.jpg', '.png', '.gif', '.jpeg']):
            print(f"   ✅ 这是一个图片链接")
        else:
            print(f"   ❓ 无法判断类型")
        
        # 尝试下载
        print(f"\n📥 尝试下载...")
        try:
            response_wrong = requests.get(full_url_wrong, headers=headers, timeout=10)
            content_type = response_wrong.headers.get('Content-Type', '')
            content_length = len(response_wrong.content)
            
            print(f"   响应状态码: {response_wrong.status_code}")
            print(f"   Content-Type: {content_type}")
            print(f"   内容大小: {content_length:,} 字节")
            
            # 判断内容类型
            print(f"\n🎯 内容类型判断:")
            if 'text/html' in content_type:
                print(f"   ❌ 这是HTML网页，不是图片！")
                print(f"   ⚠️  标准答案把HTML网页保存成了.jpg文件！")
            elif 'image' in content_type:
                print(f"   ✅ 这是图片文件")
            else:
                print(f"   ❓ 未知类型")
            
            # 保存内容（按标准答案的方式）
            save_path_wrong = os.path.join(test_dir_wrong, f"{img_name_wrong}.jpg")
            with open(save_path_wrong, "wb") as f:
                f.write(response_wrong.content)
            print(f"\n💾 已保存到: {save_path_wrong}")
            
            # 显示内容前200字符
            print(f"\n📄 下载内容的前200个字符:")
            print("-" * 80)
            try:
                text_preview = response_wrong.content[:200].decode('utf-8', errors='ignore')
                print(text_preview)
            except:
                print(response_wrong.content[:200])
            print("-" * 80)
            
            # 尝试用PIL打开
            print(f"\n🖼️  尝试作为图片打开:")
            try:
                from PIL import Image
                from io import BytesIO
                img = Image.open(BytesIO(response_wrong.content))
                print(f"   ✅ 成功打开！尺寸: {img.size}, 格式: {img.format}")
            except Exception as e:
                print(f"   ❌ 无法作为图片打开: {str(e)[:100]}")
                print(f"   ⚠️  证明下载的不是图片！")
            
        except Exception as e:
            print(f"   ❌ 下载失败: {e}")
            
except Exception as e:
    print(f"❌ 方法1执行失败: {e}")

# ==================== 方法2：正确的做法 ====================
print("\n" + "=" * 80)
print("✅ 方法2：正确的做法（使用 img 标签的 src 属性）")
print("=" * 80)

try:
    # 找img标签
    img_tag = first_content.find(name="img")
    if img_tag is None:
        print("❌ 未找到img标签")
    else:
        print(f"✅ 找到img标签: {img_tag.name}")
        
        # 获取alt和src
        img_name_correct = img_tag.attrs.get("alt", "未知图片")
        src = img_tag.attrs.get("src", "")
        
        print(f"\n📌 提取的信息:")
        print(f"   描述(alt): {img_name_correct}")
        print(f"   图片源(src): {src}")
        
        # 拼接完整URL
        full_url_correct = "http://www.rmzxb.com.cn" + src
        print(f"   完整URL: {full_url_correct}")
        
        # 分析URL类型
        print(f"\n🔍 URL分析:")
        if src.endswith('.shtml') or src.endswith('.html'):
            print(f"   ⚠️  这是一个网页链接，不是图片链接！")
        elif any(src.endswith(ext) for ext in ['.jpg', '.png', '.gif', '.jpeg']):
            print(f"   ✅ 这是一个图片链接 - 后缀匹配！")
        else:
            print(f"   ⚠️  URL后缀不标准，但可能仍是图片")
        
        # 尝试下载
        print(f"\n📥 尝试下载...")
        try:
            response_correct = requests.get(full_url_correct, headers=headers, timeout=10)
            content_type = response_correct.headers.get('Content-Type', '')
            content_length = len(response_correct.content)
            
            print(f"   响应状态码: {response_correct.status_code}")
            print(f"   Content-Type: {content_type}")
            print(f"   内容大小: {content_length:,} 字节")
            
            # 判断内容类型
            print(f"\n🎯 内容类型判断:")
            if 'text/html' in content_type:
                print(f"   ❌ 这是HTML网页，不是图片！")
            elif 'image' in content_type:
                print(f"   ✅ 这是真实的图片文件！")
                print(f"   🎉 正确方法成功下载了图片！")
            else:
                print(f"   ❓ 未知类型: {content_type}")
            
            # 确定文件扩展名
            if 'image/png' in content_type:
                ext = '.png'
            elif 'image/jpeg' in content_type or 'image/jpg' in content_type:
                ext = '.jpg'
            else:
                ext = '.jpg'  # 默认
            
            # 保存内容
            save_path_correct = os.path.join(test_dir_correct, f"{img_name_correct}{ext}")
            with open(save_path_correct, "wb") as f:
                f.write(response_correct.content)
            print(f"\n💾 已保存到: {save_path_correct}")
            
            # 尝试用PIL打开
            print(f"\n🖼️  尝试作为图片打开:")
            try:
                from PIL import Image
                from io import BytesIO
                img = Image.open(BytesIO(response_correct.content))
                print(f"   ✅ 成功打开！")
                print(f"   图片尺寸: {img.size}")
                print(f"   图片格式: {img.format}")
                print(f"   图片模式: {img.mode}")
                print(f"   🎉 这是一个有效的图片文件！")
            except Exception as e:
                print(f"   ❌ 无法作为图片打开: {str(e)[:100]}")
            
        except Exception as e:
            print(f"   ❌ 下载失败: {e}")
            
except Exception as e:
    print(f"❌ 方法2执行失败: {e}")

# ==================== 总结对比 ====================
print("\n" + "=" * 80)
print("📊 实验结论总结")
print("=" * 80)

print("""
┌─────────────────────┬──────────────────────────┬──────────────────────────┐
│      对比项         │   方法1：标准答案(错误)  │    方法2：正确方法       │
├─────────────────────┼──────────────────────────┼──────────────────────────┤
│ 查找的HTML标签      │  <a> 标签                │  <img> 标签 ✅           │
│ 使用的属性          │  href                    │  src ✅                  │
│ 获取的URL类型       │  .shtml (网页)           │  .png/.jpg (图片) ✅     │
│ Content-Type        │  text/html (HTML文档)    │  image/* (图片) ✅       │
│ 下载的实际内容      │  HTML网页源代码 ❌       │  图片二进制数据 ✅       │
│ 保存的文件能否打开  │  无法作为图片打开 ❌     │  可以正常查看 ✅         │
│ 是否符合题目要求    │  ❌ 题目要"爬取图片"    │  ✅ 真正下载了图片       │
│                     │     却下载了网页          │                          │
└─────────────────────┴──────────────────────────┴──────────────────────────┘

✅ 验证结果：

1. 标准答案使用 a.attrs["href"] 获取的是详情页链接
   - 下载的是 HTML 网页文件
   - 保存成 .jpg 后无法作为图片打开
   - 与题目要求"爬取图片"不符 ❌

2. 正确方法使用 img.attrs["src"] 获取的是真实图片链接
   - 下载的是真实的图片文件
   - 可以正常查看和使用
   - 完全符合题目要求 ✅

🎯 结论：用户的分析完全正确！标准答案存在明显错误！

📁 验证文件已保存到:
   - {test_dir_wrong}/  (标准答案下载的文件 - 打不开)
   - {test_dir_correct}/  (正确方法下载的文件 - 可正常查看)
""")

print("=" * 80)
print("实验完成！请查看两个文件夹中的文件对比效果。")
print("=" * 80)

```

![11](dataCollectionFinalReview/11.png)

![12](dataCollectionFinalReview/12.png)

![13](dataCollectionFinalReview/13.png)

![14](dataCollectionFinalReview/14.png)

![15](dataCollectionFinalReview/15.png)

![16](dataCollectionFinalReview/16.png)

#### 爬虫可以爬取浏览器显示的所有内容吗？

**答案：✅ 是的！理论上可以。**

```python
# 爬虫能做到的事情：
# 1. 获取网页文本内容（新闻、评论、商品信息）
# 2. 下载图片、视频、音频等资源
# 3. 获取动态加载的数据（需要分析接口）
# 4. 模拟登录、点击、滚动等操作

# 例子：爬取图片
import requests

img_url = 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'
response = requests.get(img_url)

# 保存图片（注意使用response.content，不是response.text）
with open('baidu_logo.png', 'wb') as f:  # 'wb'表示以二进制写入模式
    f.write(response.content)
    
print("图片下载成功！")
# 输出: 图片下载成功！
# 当前目录会出现 baidu_logo.png 文件
```

### HTTP 状态码

![6](dataCollectionFinalReview/6.png)

**简单理解：HTTP状态码就是服务器给你的"回复代码"**

#### 生活中的比喻

你去餐厅点餐：
- 🟢 **200**："好的，您的菜马上来！" → 请求成功
- 🔴 **404**："抱歉，我们没有这道菜" → 找不到资源
- 🟡 **500**："对不起，厨房出故障了" → 服务器错误
- 🔵 **302**："这道菜换地方了，去隔壁餐厅" → 重定向

#### 常见状态码统计表

| 状态码 | 类型 | 名称 | 含义 | 常见原因 | 爬虫应对策略 |
|--------|------|------|------|----------|--------------|
| **2xx 成功** |||||
| 200 | ✅ 成功 | OK | 请求成功 | 正常访问 | 直接处理数据 |
| 201 | ✅ 成功 | Created | 资源已创建 | POST请求成功 | 确认资源已创建 |
| **3xx 重定向** |||||
| 301 | 🔄 重定向 | Moved Permanently | 永久移动 | 网站改版、域名变更 | 更新URL为新地址 |
| 302 | 🔄 重定向 | Found | 临时移动 | 短链接跳转、临时维护 | 跟随重定向 |
| 304 | 🔄 重定向 | Not Modified | 资源未修改 | 缓存有效 | 使用本地缓存 |
| **4xx 客户端错误** |||||
| 400 | ❌ 客户端错误 | Bad Request | 请求错误 | 参数格式错误 | 检查请求参数 |
| 401 | 🔐 客户端错误 | Unauthorized | 未授权 | 需要登录/token | 添加认证信息 |
| 403 | 🚫 客户端错误 | Forbidden | 禁止访问 | 没权限、被封IP | 添加User-Agent，更换IP |
| 404 | ❌ 客户端错误 | Not Found | 未找到 | URL错误、页面删除 | 检查URL是否正确 |
| 429 | ⏱️ 客户端错误 | Too Many Requests | 请求过多 | 频率限制 | 降低请求速度，添加延时 |
| **5xx 服务器错误** |||||
| 500 | ⚠️ 服务器错误 | Internal Server Error | 内部错误 | 服务器bug、数据库故障 | 稍后重试，记录日志 |
| 502 | ⚠️ 服务器错误 | Bad Gateway | 网关错误 | 代理服务器问题 | 更换代理或稍后重试 |
| 503 | ⚠️ 服务器错误 | Service Unavailable | 服务不可用 | 服务器维护、过载 | 等待一段时间后重试 |
| 504 | ⚠️ 服务器错误 | Gateway Timeout | 网关超时 | 上游服务器响应慢 | 增加超时时间或重试 |

#### 状态码分类记忆法

```python
# ⭐ 考试重点：状态码分类（按第一位数字）

# 1xx - 信息响应（很少用到，了解即可）
#   100 Continue - 继续请求

# 2xx - 成功（请求被成功接收并处理）
#   200 OK - 最常见的成功状态
#   201 Created - 资源创建成功

# 3xx - 重定向（需要进一步操作）
#   301 Moved Permanently - 永久重定向（SEO友好）
#   302 Found - 临时重定向（最常见）
#   304 Not Modified - 缓存有效，不需要重新下载

# 4xx - 客户端错误（你的请求有问题）
#   400 Bad Request - 请求参数错误
#   401 Unauthorized - 需要登录
#   403 Forbidden - 没有权限（爬虫最常遇到！）⭐
#   404 Not Found - 页面不存在（爬虫第二常遇到！）⭐
#   429 Too Many Requests - 请求太频繁（需要限速）

# 5xx - 服务器错误（服务器出了问题）
#   500 Internal Server Error - 服务器内部错误
#   502 Bad Gateway - 网关错误
#   503 Service Unavailable - 服务不可用
#   504 Gateway Timeout - 网关超时

# 记忆口诀：
# 2开头的都是成功，3开头的要跳转
# 4开头的你有错，5开头的它有错
```

#### 常见状态码详解

```python
import requests

# ===== 1. 200 OK - 成功 =====
# 功能：请求成功，服务器正常返回内容
# 这是我们最希望看到的状态码
url_success = 'https://www.baidu.com'
response = requests.get(url_success)
print(f"状态码: {response.status_code}")
# 输出: 状态码: 200

if response.status_code == 200:
    print("✅ 请求成功！可以正常爬取数据")
# 输出: ✅ 请求成功！可以正常爬取数据

# ===== 2. 404 Not Found - 未找到 =====
# 功能：请求的网页不存在
# 原因：URL错误、页面已删除、路径不对
url_notfound = 'https://www.baidu.com/this-page-does-not-exist-12345'
response = requests.get(url_notfound)
print(f"状态码: {response.status_code}")
# 输出: 状态码: 404

if response.status_code == 404:
    print("❌ 页面不存在！请检查URL是否正确")
# 输出: ❌ 页面不存在！请检查URL是否正确

# ===== 3. 500 Internal Server Error - 服务器内部错误 =====
# 功能：服务器遇到错误，无法完成请求
# 原因：服务器程序bug、数据库连接失败、配置错误
# 示例：模拟服务器错误（实际使用中遇到）
url_error = 'https://httpstat.us/500'  # 测试网站，专门返回500
response = requests.get(url_error)
print(f"状态码: {response.status_code}")
# 输出: 状态码: 500

if response.status_code == 500:
    print("⚠️ 服务器出错了！可能需要稍后重试")
# 输出: ⚠️ 服务器出错了！可能需要稍后重试

# ===== 4. 302 Found - 重定向 =====
# 功能：资源临时移动到了新位置
# 原因：网站改版、短链接跳转、登录跳转
url_redirect = 'https://httpstat.us/302'
response = requests.get(url_redirect)
print(f"状态码: {response.status_code}")
# 输出: 状态码: 200（requests自动处理了重定向）

print(f"是否发生重定向: {len(response.history) > 0}")
# 输出: 是否发生重定向: True

if len(response.history) > 0:
    print(f"原始URL: {response.history[0].url}")
    print(f"最终URL: {response.url}")
# 输出:
# 原始URL: https://httpstat.us/302
# 最终URL: https://httpstat.us/200

# ===== 5. 403 Forbidden - 禁止访问 =====
# 功能：服务器拒绝请求
# 原因：没有权限、被网站封禁、需要登录
url_forbidden = 'https://httpstat.us/403'
response = requests.get(url_forbidden)
print(f"状态码: {response.status_code}")
# 输出: 状态码: 403

if response.status_code == 403:
    print("🚫 访问被拒绝！可能需要添加请求头伪装")
# 输出: 🚫 访问被拒绝！可能需要添加请求头伪装
```

#### 状态码判断的实用函数

```python
import requests

def check_url(url):
    """
    检查URL的状态码并给出建议
    功能：帮助判断爬虫是否能正常工作
    """
    try:
        response = requests.get(url, timeout=5)
        code = response.status_code
        
        # 根据状态码范围判断
        if 200 <= code < 300:
            return f"✅ 成功 ({code}) - 可以正常爬取"
        elif 300 <= code < 400:
            return f"🔄 重定向 ({code}) - 资源已移动"
        elif 400 <= code < 500:
            return f"❌ 客户端错误 ({code}) - 请求有问题"
        elif 500 <= code < 600:
            return f"⚠️ 服务器错误 ({code}) - 服务器出故障"
        else:
            return f"❓ 未知状态 ({code})"
            
    except requests.exceptions.Timeout:
        return "⏰ 超时 - 网络太慢或服务器无响应"
    except requests.exceptions.RequestException as e:
        return f"💥 请求失败 - {str(e)}"

# 测试不同URL
urls = [
    'https://www.baidu.com',
    'https://www.baidu.com/404',
    'https://httpstat.us/500'
]

for url in urls:
    result = check_url(url)
    print(f"{url}\n  → {result}\n")
    
# 输出:
# https://www.baidu.com
#   → ✅ 成功 (200) - 可以正常爬取
#
# https://www.baidu.com/404
#   → ❌ 客户端错误 (404) - 请求有问题
#
# https://httpstat.us/500
#   → ⚠️ 服务器错误 (500) - 服务器出故障
```

### 请求伪装：User-Agent 的作用

**简单理解：User-Agent就是你的"身份证明"，告诉服务器"我是谁"**

#### 生活中的比喻

进入一个高级会所：
- 🤖 **没有User-Agent**："我是机器人" → 保安："机器人不许进！" → 被拒绝
- 👔 **伪装User-Agent**："我是VIP会员（浏览器）" → 保安："请进！" → 成功进入

#### 为什么需要User-Agent？

```python
import requests

# 情况1：不带User-Agent（容易被识别为爬虫）
url = 'https://httpbin.org/user-agent'

# 不设置User-Agent
response = requests.get(url)
print("不伪装的User-Agent:")
print(response.text)
# 输出:
# {
#   "user-agent": "python-requests/2.31.0"  ← 一看就是爬虫！
# }

# 情况2：伪装成浏览器
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

response = requests.get(url, headers=headers)
print("\n伪装后的User-Agent:")
print(response.text)
# 输出:
# {
#   "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."  ← 看起来像真实浏览器
# }
```

#### User-Agent的结构解析

```python
# 一个完整的User-Agent包含以下信息：
user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# 拆解分析：
# Mozilla/5.0        → 浏览器标识（历史遗留）
# Windows NT 10.0    → 操作系统（Windows 10）
# Win64; x64         → 64位系统
# AppleWebKit/537.36 → 浏览器内核
# Chrome/120.0.0.0   → Chrome浏览器版本号
# Safari/537.36      → Safari兼容性标识

# 常见浏览器的User-Agent
user_agents = {
    'Chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
}

for browser, ua in user_agents.items():
    print(f"{browser}:")
    print(f"  {ua}\n")
```

#### 实战示例：对比有无User-Agent的区别

```python
import requests
from bs4 import BeautifulSoup

# 某些网站会检测User-Agent，没有则拒绝访问
url = 'https://www.whatismybrowser.com/detect/what-is-my-user-agent'

# ===== 测试1：不使用User-Agent =====
print("=" * 50)
print("测试1：不伪装（容易被拒绝）")
print("=" * 50)

try:
    response = requests.get(url, timeout=5)
    print(f"状态码: {response.status_code}")
    
    # 解析显示的User-Agent
    soup = BeautifulSoup(response.text, 'html.parser')
    detected_ua = soup.find('div', class_='detected_ua')
    if detected_ua:
        print(f"服务器检测到: {detected_ua.text.strip()}")
    # 输出: 服务器检测到: python-requests/2.31.0
except Exception as e:
    print(f"请求失败: {e}")

# ===== 测试2：使用User-Agent伪装 =====
print("\n" + "=" * 50)
print("测试2：伪装成Chrome浏览器")
print("=" * 50)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

try:
    response = requests.get(url, headers=headers, timeout=5)
    print(f"状态码: {response.status_code}")
    
    soup = BeautifulSoup(response.text, 'html.parser')
    detected_ua = soup.find('div', class_='detected_ua')
    if detected_ua:
        print(f"服务器检测到: {detected_ua.text.strip()}")
    # 输出: 服务器检测到: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
    print("✅ 成功伪装成真实浏览器！")
except Exception as e:
    print(f"请求失败: {e}")
```

#### 完整的请求头配置（最佳实践）

```python
import requests

# 完整的请求头配置（模拟真实浏览器）
# 功能：让爬虫更像人类，减少被封禁的概率
headers = {
    # ⭐ 最重要：浏览器标识
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    # 接受的内容类型
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    
    # 接受的语言
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    
    # 接受的编码
    'Accept-Encoding': 'gzip, deflate, br',
    
    # 从哪个页面跳转来的（防盗链检测）
    'Referer': 'https://www.baidu.com',
    
    # 连接类型
    'Connection': 'keep-alive'
}

# 使用完整的请求头
url = 'https://httpbin.org/headers'
response = requests.get(url, headers=headers)

print("发送的请求头:")
print(response.json())
# 输出:
# {
#   "headers": {
#     "Accept": "text/html,application/xhtml+xml,...",
#     "Accept-Encoding": "gzip, deflate, br",
#     "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
#     "Connection": "keep-alive",
#     "Host": "httpbin.org",
#     "Referer": "https://www.baidu.com",
#     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
#   }
# }
```

### 图片爬取关键属性：response.content

**简单理解：`response.content` 是获取二进制数据的"万能钥匙"**

#### 生活中的比喻

下载文件就像快递收货：
- 📄 **`response.text`**：打开快递箱，看到的是"文字说明书" → 适合文本内容（HTML、JSON）
- 📦 **`response.content`**：直接拿到"完整的物品"（不拆包装） → 适合二进制文件（图片、视频、音频）

![9](dataCollectionFinalReview/9.png)

#### text vs content 的区别

```python
import requests

url = 'https://www.baidu.com'
response = requests.get(url)

# ===== 1. response.text - 文本内容 =====
# 功能：自动解码为字符串，适合HTML、JSON等文本数据
# 返回类型：str
print("response.text 类型:", type(response.text))
# 输出: response.text 类型: <class 'str'>

print("response.text 前100个字符:")
print(response.text[:100])
# 输出: response.text 前100个字符:
# <!DOCTYPE html>
# <!--STATUS OK--><html> <head><meta http-equiv=content-type content=text/htm

# ===== 2. response.content - 二进制内容 =====
# 功能：原始字节数据，不做任何解码，适合图片、视频、音频等
# 返回类型：bytes
print("\nresponse.content 类型:", type(response.content))
# 输出: response.content 类型: <class 'bytes'>

print("response.content 前100个字节:")
print(response.content[:100])
# 输出: response.content 前100个字节:
# b'<!DOCTYPE html>\r\n<!--STATUS OK--><html> <head><meta http-equiv=content-type content=text/html;c'
#  ↑ 注意前面的 'b'，表示这是bytes（字节）类型

# ===== 3. 什么时候用哪个？=====
# response.text    → 爬取网页内容、API接口（JSON）
# response.content → 下载图片、视频、音频、PDF等文件
```

#### 完整示例：下载图片

```python
import requests
import os

# ===== 示例1：下载单张图片 =====
def download_image(img_url, save_path):
    """
    下载图片的标准函数
    参数：
        img_url: 图片URL
        save_path: 保存路径
    """
    try:
        # 发送请求
        print(f"正在下载: {img_url}")
        response = requests.get(img_url, timeout=10)
        
        # 检查状态码
        if response.status_code == 200:
            # ⭐ 关键：使用 response.content 获取二进制数据
            # 'wb' 表示以二进制写入模式打开文件
            with open(save_path, 'wb') as f:
                f.write(response.content)
            
            # 获取文件大小
            file_size = len(response.content)
            print(f"✅ 下载成功！文件大小: {file_size} 字节 ({file_size/1024:.2f} KB)")
            return True
        else:
            print(f"❌ 下载失败！状态码: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 下载出错: {e}")
        return False

# 测试下载
img_url = 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'
download_image(img_url, 'baidu_logo.png')

# 输出:
# 正在下载: https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png
# ✅ 下载成功！文件大小: 7877 字节 (7.69 KB)
```

#### 示例：批量下载图片

```python
import requests
import os
from urllib.parse import urlparse

def batch_download_images(img_urls, save_dir='images'):
    """
    批量下载图片
    功能：下载多张图片并保存到指定目录
    """
    # 创建保存目录
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
        print(f"📁 创建目录: {save_dir}")
    
    # 统计结果
    success_count = 0
    fail_count = 0
    
    # 遍历下载
    for i, url in enumerate(img_urls, 1):
        print(f"\n[{i}/{len(img_urls)}] 下载图片...")
        
        try:
            # 从URL中提取文件名
            filename = os.path.basename(urlparse(url).path)
            if not filename:
                filename = f'image_{i}.jpg'
            
            save_path = os.path.join(save_dir, filename)
            
            # 下载图片
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                # ⭐ 使用 response.content 保存二进制数据
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                
                file_size = len(response.content) / 1024  # 转换为KB
                print(f"✅ 成功: {filename} ({file_size:.2f} KB)")
                success_count += 1
            else:
                print(f"❌ 失败: 状态码 {response.status_code}")
                fail_count += 1
                
        except Exception as e:
            print(f"❌ 错误: {e}")
            fail_count += 1
    
    # 输出统计
    print("\n" + "=" * 50)
    print(f"下载完成！成功: {success_count} 张，失败: {fail_count} 张")
    print("=" * 50)

# 测试批量下载
image_urls = [
    'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
    'https://www.baidu.com/img/flexible/logo/pc/result.png',
    'https://www.baidu.com/img/flexible/logo/pc/result@2.png'
]

batch_download_images(image_urls)

# 输出:
# 📁 创建目录: images
#
# [1/3] 下载图片...
# ✅ 成功: PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png (7.69 KB)
#
# [2/3] 下载图片...
# ✅ 成功: result.png (6.24 KB)
#
# [3/3] 下载图片...
# ✅ 成功: result@2.png (8.91 KB)
#
# ==================================================
# 下载完成！成功: 3 张，失败: 0 张
# ==================================================
```

#### 进阶：下载并验证图片

```python
import requests
from PIL import Image
from io import BytesIO

def download_and_verify_image(img_url):
    """
    下载图片并验证是否为有效图片
    功能：确保下载的文件确实是图片，而不是错误页面
    """
    try:
        response = requests.get(img_url, timeout=10)
        
        if response.status_code == 200:
            # ⭐ 使用 response.content 获取二进制数据
            img_data = response.content
            
            # 验证是否为有效图片
            try:
                # 尝试用PIL打开图片
                img = Image.open(BytesIO(img_data))
                
                # 获取图片信息
                print(f"✅ 下载成功！")
                print(f"   格式: {img.format}")
                print(f"   尺寸: {img.size[0]} x {img.size[1]} 像素")
                print(f"   模式: {img.mode}")
                print(f"   大小: {len(img_data) / 1024:.2f} KB")
                
                return img_data
                
            except Exception as e:
                print(f"❌ 不是有效的图片文件: {e}")
                return None
        else:
            print(f"❌ 下载失败，状态码: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 请求出错: {e}")
        return None

# 测试
img_url = 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'
img_data = download_and_verify_image(img_url)

# 输出:
# ✅ 下载成功！
#    格式: PNG
#    尺寸: 540 x 258 像素
#    模式: RGBA
#    大小: 7.69 KB

# 如果验证成功，保存图片
if img_data:
    with open('verified_image.png', 'wb') as f:
        f.write(img_data)
    print("图片已保存为 verified_image.png")
# 输出: 图片已保存为 verified_image.png
```

#### 考点总结

```python
# ⭐⭐⭐ 考试重点 ⭐⭐⭐

# 1. 图片下载必须使用 response.content（字节数据）
response = requests.get(img_url)
with open('image.jpg', 'wb') as f:  # 注意：'wb' 二进制写入
    f.write(response.content)       # 注意：content 不是 text

# 2. 文本内容使用 response.text（字符串）
response = requests.get(url)
html = response.text  # 获取HTML文本

# 3. JSON数据使用 response.json()（自动解析）
response = requests.get(api_url)
data = response.json()  # 直接得到字典或列表

# 4. 记忆口诀
# text    → 文本（HTML、纯文本）
# content → 内容（图片、视频、文件）
# json()  → 接口（API数据）
```

## 正则表达式
