---
title: 数据采集实践期末复习
date: 2025-12-24 15:22:31
tags:
  - 期末复习
description: 数据采集期末复习
typewriter: 📊 数据采集期末复习，深度总结数据采集相关知识。
cover: /imgs/ArticleTopImgs/SASTopImg.jpg
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

print(a + b)    # 加法：13
print(a - b)    # 减法：7
print(a * b)    # 乘法：30
print(a / b)    # 除法：3.3333...
print(a // b)   # 整除：3
print(a % b)    # 取余：1
print(a ** b)   # 幂运算：1000

# 类型转换
num_str = "123"
num = int(num_str)  # 字符串转整数
print(num + 1)      # 124
```

#### 浮点数（float）

浮点数用于表示小数，注意精度问题。

```python
# 基本操作
pi = 3.14159
radius = 5.0

area = pi * radius ** 2  # 计算圆面积
print(f"圆面积：{area:.2f}")  # 保留两位小数

# 类型转换
price = "99.99"
price_float = float(price)  # 字符串转浮点数
print(price_float * 0.8)    # 打8折：79.992

# 精度处理
from decimal import Decimal
a = Decimal('0.1')
b = Decimal('0.2')
print(a + b)  # 精确结果：0.3
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
print(name[0])          # 索引：'P'
print(name[0:6])        # 切片：'Python'
print(name + " 课程")   # 拼接：'Python数据采集 课程'
print(name * 2)         # 重复：'Python数据采集Python数据采集'
print(len(name))        # 长度：11

# 常用方法
email = "  USER@EXAMPLE.COM  "
print(email.lower())    # 转小写：'  user@example.com  '
print(email.upper())    # 转大写：'  USER@EXAMPLE.COM  '
print(email.strip())    # 去除首尾空格
print(email.replace("EXAMPLE", "test"))  # 替换

url = "https://www.example.com/data"
print(url.split('/'))   # 分割：['https:', '', 'www.example.com', 'data']
print('-'.join(['2025', '12', '24']))  # 连接：'2025-12-24'

# 字符串格式化
age = 20
print(f"我今年{age}岁")  # f-string格式化
print("姓名：{}，年龄：{}".format(name, age))
```

#### 布尔值（bool）

布尔类型只有 `True` 和 `False` 两个值，用于逻辑判断。

```python
# 基本使用
is_student = True
has_permission = False

# 逻辑运算
print(True and False)   # 与：False
print(True or False)    # 或：True
print(not True)         # 非：False

# 比较运算返回布尔值
age = 18
print(age >= 18)        # True
print(age == 20)        # False
print(age != 18)        # False

# 布尔值转换（重要！）
print(bool(0))          # False
print(bool(1))          # True
print(bool(""))         # False（空字符串）
print(bool("abc"))      # True
print(bool([]))         # False（空列表）
print(bool([1, 2]))     # True
```

#### 列表（list）

列表是可变的有序序列，可以存储不同类型的元素。

```python
# 创建列表
fruits = ["苹果", "香蕉", "橙子"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# 索引和切片
print(fruits[0])        # '苹果'
print(fruits[-1])       # '橙子'（负索引从末尾开始）
print(numbers[1:4])     # [2, 3, 4]
print(numbers[::2])     # [1, 3, 5]（步长为2）

# 常用操作
fruits.append("葡萄")       # 添加元素到末尾
fruits.insert(1, "西瓜")    # 在指定位置插入
fruits.remove("香蕉")       # 删除指定元素
popped = fruits.pop()      # 弹出最后一个元素
print(len(fruits))         # 列表长度

# 列表推导式（重要！）
squares = [x**2 for x in range(1, 6)]  # [1, 4, 9, 16, 25]
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]

# 排序和反转
numbers = [3, 1, 4, 1, 5, 9, 2]
numbers.sort()             # 原地排序
print(numbers)             # [1, 1, 2, 3, 4, 5, 9]
numbers.reverse()          # 反转
print(numbers)             # [9, 5, 4, 3, 2, 1, 1]
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

x, y = point
print(f"坐标：({x}, {y})")

# 常用方法
numbers = (1, 2, 3, 2, 4, 2)
print(numbers.count(2))    # 统计元素出现次数：3
print(numbers.index(3))    # 查找元素索引：2

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
print(student["name"])          # '李四'
print(student.get("age"))       # 21
print(student.get("grade", 0))  # 键不存在时返回默认值0

student["age"] = 22             # 修改值
student["grade"] = 90           # 添加新键值对

# 常用操作
print(student.keys())           # 获取所有键
print(student.values())         # 获取所有值
print(student.items())          # 获取所有键值对

# 遍历字典
for key, value in student.items():
    print(f"{key}: {value}")

# 删除操作
del student["grade"]            # 删除键值对
popped_value = student.pop("major")  # 弹出指定键的值

# 字典推导式
squares_dict = {x: x**2 for x in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
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
numbers = set([1, 2, 3, 2, 1])  # {1, 2, 3}（自动去重）

# 添加和删除
fruits.add("葡萄")              # 添加元素
fruits.remove("香蕉")           # 删除元素（不存在会报错）
fruits.discard("西瓜")          # 删除元素（不存在不报错）

# 集合运算
set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}

print(set1 | set2)  # 并集：{1, 2, 3, 4, 5, 6}
print(set1 & set2)  # 交集：{3, 4}
print(set1 - set2)  # 差集：{1, 2}
print(set1 ^ set2)  # 对称差：{1, 2, 5, 6}

# 去重应用
data = [1, 2, 2, 3, 4, 4, 5]
unique_data = list(set(data))  # [1, 2, 3, 4, 5]

# 成员检测（效率高）
if "苹果" in fruits:
    print("集合中有苹果")
```

### 数据类型转换总结

```python
# 转换为整数
int("123")      # 123
int(3.14)       # 3
int(True)       # 1

# 转换为浮点数
float("3.14")   # 3.14
float(3)        # 3.0

# 转换为字符串
str(123)        # '123'
str([1, 2])     # '[1, 2]'

# 转换为列表
list("abc")         # ['a', 'b', 'c']
list((1, 2, 3))     # [1, 2, 3]

# 转换为元组
tuple([1, 2, 3])    # (1, 2, 3)
tuple("abc")        # ('a', 'b', 'c')

# 转换为集合
set([1, 2, 2, 3])   # {1, 2, 3}
```

## 数据采集中的两大核心数据类型`Series`和`DataFrame`

`pandas` 是 Python 中最强大的数据分析库，其核心就是 `Series` 和 `DataFrame` 两种数据结构。理解它们是数据采集和处理的基础。

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

# 2. 切片操作
print(scores[1:4])              # 位置切片
print(scores['李四':'赵六'])     # 标签切片（注意：包含结束位置！）

# 3. 条件筛选
print(scores[scores > 85])      # 筛选大于85分的
print(scores[scores >= 90])     # 筛选优秀学生

# 4. 统计运算
print(scores.mean())            # 平均值：87.6
print(scores.sum())             # 总和：438
print(scores.max())             # 最大值：95
print(scores.min())             # 最小值：78
print(scores.std())             # 标准差
print(scores.describe())        # 统计摘要

# 5. 排序
print(scores.sort_values())             # 按值排序
print(scores.sort_values(ascending=False))  # 降序
print(scores.sort_index())              # 按索引排序

# 6. 判断和查找
print('张三' in scores)         # True（判断索引是否存在）
print(scores.isnull())          # 检查空值
print(scores.notnull())         # 检查非空值

# 7. 数学运算
print(scores + 5)               # 每个值加5
print(scores * 1.1)             # 每个值乘1.1（加权）
print(scores[scores > 85] + 10) # 优秀学生加10分
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
print(f"总访问量：{page_views.sum()}")

# 场景2：处理爬取的价格数据
prices = pd.Series([299, 399, 499, 599, 699])
print(f"平均价格：{prices.mean()}")
print(f"价格范围：{prices.min()} - {prices.max()}")
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
print(students.head())          # 查看前5行
print(students.head(3))         # 查看前3行
print(students.tail())          # 查看后5行
print(students.info())          # 数据信息（类型、非空值数量）
print(students.describe())      # 数值列的统计摘要
print(students.shape)           # 形状：(5, 6) - 5行6列
print(students.columns)         # 列名
print(students.index)           # 行索引

# ===== 2. 选择数据 =====
# 选择列
print(students['姓名'])         # 单列（返回 Series）
print(students[['姓名', '年龄']]) # 多列（返回 DataFrame）

# 选择行
print(students.loc[0])          # 按标签选择（第0行）
print(students.iloc[0])         # 按位置选择（第0行）
print(students.loc[0:2])        # 行切片（包含结束位置）
print(students.iloc[0:2])       # 位置切片（不包含结束位置）

# 选择特定位置
print(students.loc[0, '姓名'])  # 第0行的姓名
print(students.iloc[0, 1])      # 第0行第1列
print(students.loc[0:2, ['姓名', '语文', '数学']])  # 多行多列

# ===== 3. 条件筛选（重要！）=====
# 单条件
print(students[students['年龄'] > 20])
print(students[students['语文'] >= 90])
print(students[students['性别'] == '女'])

# 多条件（&与、|或、~非）
print(students[(students['年龄'] >= 20) & (students['语文'] > 85)])
print(students[(students['性别'] == '女') | (students['数学'] >= 90)])
print(students[~(students['年龄'] < 20)])  # 不小于20

# ===== 4. 添加和修改 =====
# 添加新列
students['总分'] = students['语文'] + students['数学'] + students['英语']
students['平均分'] = students[['语文', '数学', '英语']].mean(axis=1)
students['等级'] = students['平均分'].apply(lambda x: '优秀' if x >= 90 else ('良好' if x >= 80 else '及格'))

# 修改数据
students.loc[0, '年龄'] = 21
students.loc[students['姓名'] == '张三', '语文'] = 90

# ===== 5. 删除 =====
students_new = students.drop('总分', axis=1)     # 删除列
students_new = students.drop(0, axis=0)          # 删除行
students_new = students.drop([0, 1], axis=0)     # 删除多行

# ===== 6. 排序 =====
print(students.sort_values('语文'))                      # 按语文成绩升序
print(students.sort_values('语文', ascending=False))     # 降序
print(students.sort_values(['语文', '数学'], ascending=[False, True]))  # 多列排序

# ===== 7. 统计分析 =====
print(students['语文'].mean())      # 某列平均值
print(students['语文'].sum())       # 某列总和
print(students[['语文', '数学', '英语']].mean())  # 多列统计
print(students.groupby('性别')['语文'].mean())    # 分组统计

# ===== 8. 处理缺失值 =====
print(students.isnull())            # 检查缺失值
print(students.isnull().sum())      # 每列缺失值数量
students_clean = students.dropna()  # 删除含缺失值的行
students_filled = students.fillna(0)  # 用0填充缺失值
students_filled = students.fillna(students.mean())  # 用均值填充

# ===== 9. 去重 =====
students_unique = students.drop_duplicates()  # 删除重复行
students_unique = students.drop_duplicates(subset=['姓名'])  # 按特定列去重

# ===== 10. 保存数据 =====
students.to_csv('students_output.csv', index=False)  # 保存为CSV
students.to_excel('students_output.xlsx', index=False)  # 保存为Excel
students.to_json('students_output.json', orient='records', force_ascii=False)  # 保存为JSON
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
print(f"最畅销商品：{products.loc[products['销量'].idxmax(), '商品名称']}")
print(f"性价比最高（评分/价格）：")
products['性价比'] = products['评分'] / products['价格'] * 10000
print(products.nlargest(3, '性价比')[['商品名称', '性价比']])

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

# 按阅读量排序
hot_news = news.sort_values('阅读量', ascending=False).head(3)
print("热门新闻TOP3：")
print(hot_news[['标题', '阅读量']])
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
print(type(name_series))  # <class 'pandas.core.series.Series'>

# 关系2：多个 Series 可以组合成 DataFrame
s1 = pd.Series(['张三', '李四', '王五'], name='姓名')
s2 = pd.Series([20, 21, 19], name='年龄')
s3 = pd.Series([85, 92, 78], name='成绩')
df_new = pd.DataFrame({'姓名': s1, '年龄': s2, '成绩': s3})

# 关系3：选择单列返回 Series，选择多列返回 DataFrame
print(type(df['姓名']))         # Series
print(type(df[['姓名']]))       # DataFrame
print(type(df[['姓名', '年龄']])) # DataFrame
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
high_prices = prices[prices > 400]
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
        '标题': '示例标题',
        '价格': 299,
        '评分': 4.8,
        '销量': 1234
    })

# 2. 转换为 DataFrame
df = pd.DataFrame(data_list)

# 3. 数据清洗
df = df.drop_duplicates()  # 去重
df = df.dropna()           # 删除缺失值
df['价格'] = df['价格'].astype(float)  # 类型转换

# 4. 数据分析
high_rated = df[df['评分'] >= 4.5]
avg_price = df['价格'].mean()

# 5. 保存结果
df.to_csv('products.csv', index=False, encoding='utf-8-sig')
```

#### 考试重点总结

1. **`pd.read_csv()` 返回值类型：DataFrame** ⭐⭐⭐
   ```python
   df = pd.read_csv('data.csv')  # 返回 DataFrame 类型
   ```

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

3. **DataFrame 是 Series 的集合** ⭐⭐
   ```python
   df['列名']      # 返回 Series
   df[['列名']]    # 返回 DataFrame
   ```

4. **索引和切片操作** ⭐⭐
   ```python
   # 列表/元组索引
   data = [10, 20, 30, 40]
   print(data[2])     # 30
   
   # 嵌套列表索引
   data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
   print(data[3][2])  # 9（注意：第4行第3列，索引从0开始）
   
   # DataFrame 索引
   df.loc[行标签, 列标签]
   df.iloc[行位置, 列位置]
   ```


