---
title: 鸿蒙开发数据持久化简述
date: 2025-05-23 20:46:19
tags:
  - 鸿蒙
  - 数据持久化
  - V2
  - 用户首选项
  - 数据库
  - Java
description: 本文将会对比鸿蒙开发的几种数据持久化方式（持续更新ing）
cover: /img/ArticleTopImgs/persistentTopImg.png
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

在鸿蒙开发中，想要实现数据的持久化存储主要有五种方式，分别是：[**用户首选项（Preferences）**](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/data-persistence-by-preferences)、[**键值型数据库（KV-Store）**](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/data-persistence-by-kv-store)、[**关系型数据库（RelationalStore）**](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/data-persistence-by-rdb-store)、[**向量数据库**](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/data-persistence-by-vector-store)、[**PersistenceV2**](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-new-persistencev2)。由于V1版本的状态管理已经不在推荐使用所以这里就不在列举了。在此前的开发中我仅用过状态管理V2版本中所提供的持久化存储UI状态的**PersistentceV2**的功能，在暂时没有尝试过其他的数据持久化方式，所以本文会对另外四种数据持久化的方式做出着重解析。

## 少量数据持久化存储

对于这四种数据持久化存储的方式，我们可以依据需要存储的数据量来进行划分，当需要存储的数据量很少时，可以使用**用户首选项（Preferences）**和**PersistenceV2**，当需要存储的数据量较多时，可以使用**关系型数据库（RelationalStore）**、**向量数据库**和**键值型数据库（KV-Store）**。

{% note success flat %}
这个划分并非绝对，但依据官方给出的建议，当需要存储的数据量**超过50MB**时，用户首选项会对象的创建以及持久化对象的创建会成为耗时操作可能造成线程阻塞，应用卡顿，所以此时我们就应当考虑使用数据库来进行数据持久化。
{% endnote %}

### 用户首选项（Preferences）与PersistenceV2的区别

| 特性         | PersistentStorage                          | Preferences                              |
|--------------|--------------------------------------------|------------------------------------------|
| 存储方式     | 持久化数据到设备磁盘，应用重启后数据保留   | 提供键值对存储，数据缓存在内存中         |
| 数据大小限制 | 推荐存储小于2KB的数据                      | 键为字符串（非空且≤1024字节），值（字符串≤16MB） |
| 性能         | 同步写入磁盘，大量数据可能影响UI性能       | 内存缓存，读写速度快                     |
| 使用场景     | 应用状态恢复、关键配置信息                 | 用户偏好设置、轻量级配置数据             |

![PersistentStorage](HarmonyOSPersistent/1.png)

总结来讲，这两者最关键的区别就在于是否直接存储至磁盘，PersistentceV2是在执行增删改查时直接在磁盘上进行操作的，大量的数据在同时进行本地化操作时会严重影响应用性能，并且这些进程是**直接在UI线程中执行的**，会大幅降低UI渲染效率。

![Preferences](HarmonyOSPersistent/2.png)

### 用户首选项的存储格式

用户首选项在API18之前的默认存储格式是XML格式，而在API18之后还可以选用GSKV格式。

#### XML格式

XML（可扩展标记语言，全称 **eXtensible Markup Language**）是一种用于描述数据和其结构的标记语言，广泛用于数据存储与传输。它具有良好的可读性和跨平台兼容性，适用于配置文件、数据交换格式等场景。  

1. **文档声明**  
    每个 XML 文档应以声明开头，定义版本和编码方式：  

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    ```

2. **根元素**
    XML 文档必须有一个根元素，所有其他元素都嵌套在其中：  

    ```xml
    <root>
        <!-- 其他内容 -->
    </root>
    ```

3. **标签匹配**  
    - 所有标签必须正确闭合，且大小写敏感。  
    - 开始标签：`<tag>`  
    - 结束标签：`</tag>`  

4. **嵌套结构**  
    元素可以包含子元素，但不能交叉嵌套：  

    ```xml
    <parent>
        <child>Content</child>
    </parent>
    ```

5. **属性**  
    属性为元素提供额外信息，必须用引号括起来：  

    ```xml
    <element attribute="value">Content</element>
    ```

6. **注释**  
    注释以 `<!--` 开头，以 `-->` 结尾：  

    ```xml
    <!-- 这是一个注释 -->
    ```

7. **特殊字符转义**  
    特殊字符需使用实体表示：  

    <table>
        <thead>
            <tr>
                <th>字符</th>
                <th>实体表示</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>&lt;</td>
                <td><code>&amp;lt;</code></td>
            </tr>
            <tr>
                <td>&gt;</td>
                <td><code>&amp;gt;</code></td>
            </tr>
            <tr>
                <td>&amp;</td>
                <td><code>&amp;amp;</code></td>
            </tr>
            <tr>
                <td>&quot;</td>
                <td><code>&amp;quot;</code></td>
            </tr>
            <tr>
                <td>&apos;</td>
                <td><code>&amp;apos;</code></td>
            </tr>
        </tbody>
    </table>

8. **空格处理**  
    XML 中多余的空白符会被解析器忽略，换行和缩进不会影响内容。  

##### XML命名规范  

- 名称区分大小写（如 `<Tag>` 和 `<tag>` 是不同的）。  
- 名称不能以数字或标点符号开头。  
- 推荐使用有意义的英文名称。  

##### 良好格式要求  

XML 文档必须是"良构的"（Well-formed），即没有语法错误，否则解析失败。  

##### 示例代码  

```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
    <user id="1">
        <name>XBXyftx</name>
        <email>xbxyftx@example.com</email>
    </user>
    <settings>
        <theme>dark</theme>
        <notifications enabled="true"/>
    </settings>
</config>
```

##### 应用场景  

XML 以其清晰的层级结构和通用性，在鸿蒙系统中曾被广泛用作用户首选项的默认存储格式（API18 及之前）。随着 GSKV 等新格式的引入，XML 虽已不再是唯一选择，但仍因其易读性和兼容性保留在许多系统的配置管理中。

#### GSKV格式

GSKV格式相比于XML格式，其最大的优势就是在于其具有`实时落盘`的特性，对用户首选项的数据进行修改之后其就会自动将修改后的数据写入磁盘中。

{% note warning flat %}
请注意，实时落盘特性不代表它的性能就会和PersistentceV2一样阻塞UI线程，降低整体应用的流畅度，因为其执行过程为异步进行读写操作，其执行过程不会阻塞UI线程。
{% endnote %}

首先对于XML格式，用户需要先去利用`put`或者`putSync`进行数据的修改，随后调用`flush`或者`flushSync`方法，将数据写入磁盘。

`put`方法是异步回调接口，可以直接在第三个参数处去传入一个回调函数来处理回调逻辑，也可以将接口所返回的`Promise`对象存入变量，在适合的地方进行回调处理。

```ts
put

put(key: string, value: ValueType, callback: AsyncCallback<void>): void

将数据写入缓存的Preferences实例中，可通过flush将Preferences实例持久化，使用callback异步回调。

put(key: string, value: ValueType): Promise<void>

将数据写入缓存的Preferences实例中，可通过flush将Preferences实例持久化，使用Promise异步回调。
```

而`putSync`方法是同步接口，无需回调函数。

```ts

putSync

putSync(key: string, value: ValueType): void

将数据写入缓存的Preferences实例中，可通过flush将Preferences实例持久化，此为同步接口。
```

{% note warning flat %}
请注意，到现在都还只是将数据写入到内存，而不是写入到磁盘，所以并没有IO过程，性能损耗极小。
{% endnote %}

而在需要持久化当前的用户设置时，就比如说通知开关，登录状态等轻量级设置时，我们需要手动调用`flush`或`flushSync`方法将数据写入磁盘，这样数据才能持久化。

`flush`函数时异步的，和`put`函数一样，可以在参数中去写入回调函数的处理逻辑，也可以用`Promise`对象的`then`函数来去处理回调逻辑。
`flushSync`函数时同步的，不需要回调函数。

现在我们再回头来看GSKV格式。首先我们纵观整个用户首选的API参考，仅有两个异步的`flush`接口有提示无需再GSKV格式中进行调用，而与之对应的`flushSync`接口则无此提示。

![3](HarmonyOSPersistent/3.png)

![4](HarmonyOSPersistent/4.png)

![5](HarmonyOSPersistent/5.png)

所以我由此推断GSKV格式的存储模式下，所谓的其执行逻辑是在数据发生改变时自动向任务队列中添加一个异步`flush`任务，进行执行。当然这部分只是我个人的推测，我暂时还没有找到更多相关的资料，毕竟是API18才有的功能，还是相当新的模式。

#### GSKV格式的核心优势

GSKV格式相比于XML格式，具有以下关键优势：

1. **实时落盘特性**：数据修改后会自动持久化，无需手动调用flush
2. **多进程并发支持**：支持多进程并发读写，这是XML格式所不具备的重要特性
3. **性能优化**：异步执行，不会阻塞UI线程

#### 使用场景对比

| 存储模式 | 适用场景 | 操作特点 |
|---------|---------|---------|
| XML格式 | 单进程、小数据量场景 | 内存操作，需手动flush |
| GSKV格式 | 多进程并发场景 | 实时落盘，支持并发 |

![6](HarmonyOSPersistent/6.png)

### 用户首选项的二次封装

在用户首选项中，我们通过`get`接口获取到的数据并不是直接可用的基础类型而是一个联合类型[ValueType](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-data-preferences#valuetype)，这就导致我们需要对其进行一个二次封装来保障我们的数据类型安全以及数据的可用性。

| 类型          | 说明                           |
| ------------- | ------------------------------ |
| number        | 表示值类型为数字。             |
| string        | 表示值类型为字符串。           |
| boolean       | 表示值类型为布尔值。           |
| Array\<number\>  | 表示值类型为数字类型的数组。   |
| Array\<boolean\> | 表示值类型为布尔类型的数组。   |
| Array\<string\>  | 表示值类型为字符串类型的数组。 |
| Uint8Array¹¹⁺  | 表示值类型为8位无符号整型的数组。 |
| object¹²⁺     | 表示值类型为对象。             |
| bigint¹²⁺     | 表示值类型为任意精度格式的整数。 |

#### 初始化

```ts
constructor(ctx: common.UIAbilityContext, pfName: string) {
    Logger.info(`初始化${pfName}首选项`, TAG)
    let xmlType = preferences.StorageType.XML;
    let gskvType = preferences.StorageType.GSKV;
    let options: preferences.Options = {name: pfName, storageType: xmlType}
    let observer = (key: string) => {
      Logger.info(`${key} changed`, TAG)
    }
    let isGskvSupported = preferences.isStorageTypeSupported(gskvType);
    if(isGskvSupported) {
      options = {name: pfName, storageType: gskvType}
      this.PFS_TYPE = gskvType;
    } else {
      this.PFS_TYPE = xmlType;
    }
    this.PFS = preferences.getPreferencesSync(ctx, options);
    this.PFS.on("change",  observer)
  }
```

首先在初始化时我们需要考虑设备的API版本，来对数据库的存储类型来进行兼容，虽然统一用`XML`格式可以确保最大规模的适配，但如果需要处理并发场景，那我们还是需要考虑`GSKV`格式的，使用我们这种写法也会是最通用的写法。

#### 查询接口

```ts
/**
   * 获取字符串
   * @param key 键
   * @returns 值
   */
  getStr(key: string): string {
    try {
      if (this.PFS.hasSync(key)) {
        const value: string = this.PFS.getSync(key, "") as string;
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return "";
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return "";
    }
  }

  /**
   * 获取数字
   * @param key 键
   * @returns 值
   */
  getNum(key: string): number {
    try {
      if (this.PFS.hasSync(key)) {
        const value: number = this.PFS.getSync(key, 0) as number;
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return 0;
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return 0;
    }
  }

  /**
   * 获取布尔值
   * @param key 键
   * @returns 值
   */
  getBool(key: string): boolean {
    try {
      if (this.PFS.hasSync(key)) {
        const value: boolean = this.PFS.getSync(key, false) as boolean;
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return false;
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return false;
    }
  }

  getStrArr(key: string): Array<string> {
    try {
      if (this.PFS.hasSync(key)) {
        const value: string[] = this.PFS.getSync(key, []) as string[];
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return [];
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return [];
    }
  }

  getNumArr(key: string): Array<number> {
    try {
      if (this.PFS.hasSync(key)) {
        const value: number[] = this.PFS.getSync(key, []) as number[];
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return [];
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return [];
    }
  }
```

在封装以下接口的时候我们都需要去有防御性编程的思想。要先去检查是否具有所查询的目标键，同时用try catch去捕获异常，如果异常发生则返回默认值。毕竟数据查询的过程是异常的高发阶段，我们不能因为这个数据查询错误导致整个APP的崩溃。

#### 写入接口

```ts
setStr(key: string, value: string): void {
    try {
      this.PFS.putSync(key, value);
      if (this.PFS_TYPE == preferences.StorageType.XML) {
        this.PFS.flushSync();
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setNum(key: string, value: number): void {
    try {
      this.PFS.putSync(key, value);
      if (this.PFS_TYPE == preferences.StorageType.XML) {
        this.PFS.flushSync();
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setBool(key: string, value: boolean): void {
    try {
      this.PFS.putSync(key, value);
      if (this.PFS_TYPE == preferences.StorageType.XML) {
        this.PFS.flushSync();
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setStrArr(key: string, value: Array<string>): void {
    try {
      this.PFS.putSync(key, value);
      if (this.PFS_TYPE == preferences.StorageType.XML) {
        this.PFS.flushSync();
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setNumArr(key: string, value: Array<number>): void {
    try {
      this.PFS.putSync(key, value);
      if (this.PFS_TYPE == preferences.StorageType.XML) {
        this.PFS.flushSync();
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }
```

#### 删除接口

```ts
deleteStr(key: string): string {
    try {
      if (this.PFS.hasSync(key)) {
        const value: string = this.PFS.getSync(key, "") as string;
        this.PFS.deleteSync(key);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return ""
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return ""
    }
  }

  deleteNum(key: string): number {
    try {
      if (this.PFS.hasSync(key)) {
        const value: number = this.PFS.getSync(key, 0) as number;
        this.PFS.deleteSync(key);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return 0
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return 0
    }
  }

  deleteBool(key: string): boolean {
    try {
      if (this.PFS.hasSync(key)) {
        const value: boolean = this.PFS.getSync(key, false) as boolean;
        this.PFS.deleteSync(key);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return false
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return false
    }
  }

  deleteStrArr(key: string): Array<string> {
    try {
      if (this.PFS.hasSync(key)) {
        const value: string[] = this.PFS.getSync(key, []) as string[];
        this.PFS.deleteSync(key);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return []
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return []
    }
  }

  deleteNumArr(key: string): Array<number> {
    try {
      if (this.PFS.hasSync(key)) {
        const value: number[] = this.PFS.getSync(key, []) as number[];
        this.PFS.deleteSync(key);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
        return value;
      } else {
        Logger.warn(`key: ${key} not exist`, TAG)
        return []
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return []
    }
  }

  deleteAll(): void {
    try {
      this.PFS.clearSync();
      if (this.PFS_TYPE == preferences.StorageType.XML) {
        this.PFS.flushSync();
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }
```

#### 资源释放接口

资源释放是一个很关键的环节，虽然现代的高级语言基本上都不需要程序员去向C/C++那样的去手动回收资源了，但我们在构造函数中去设置了一个监听器来进行日志的打印，来去进行数据的备份以及遵循数据库设计中**利用冗余信息来保障数据库的可恢复性**的思想，这个监听器的资源是需要我们手动去进行回收的，并不会被系统自动进行回收。所以我们还需要再去封装一个释放接口。

```ts
release() {
    if (this.PFS) {
      let observer = (key: string) => {
        Logger.info(`${key} changed`, TAG)
      }
      this.PFS.off("change", observer);
      preferences.removePreferencesFromCacheSync(this.ctx, this.PFS_NAME);
      this.PFS = null;
      this.PFS_TYPE = null;
      this.ctx = null;
      Logger.info(`${this.PFS_NAME} release success`, TAG)
      this.PFS_NAME = ""
    }
  }
```

完整工具类源码[原仓库传送门](https://gitee.com/pengyoucongcode/TxtEdit/blob/master/lib/lib_util/src/main/ets/PreferencesUtil.ets#)：

```ts
/*
 * Copyright (c) 2025/6/14 彭友聪
 * TxtEdit is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2. 
 * You may obtain a copy of Mulan PSL v2 at:
            http://license.coscl.org.cn/MulanPSL2 
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, 
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, 
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
 * See the Mulan PSL v2 for more details.  
 * 
 * Author: 彭友聪 
 * email：2923616405@qq.com 
 * date: 2025/6/14 16:33
 * file: PreferencesUtil.ets
 * product: DevEco Studio
 * */
import { common } from "@kit.AbilityKit";
import { Logger } from "lib_log";
import { preferences } from "@kit.ArkData";

const TAG = "[PreferencesUtil]";
/**
 * 首选项工具类
 */
export class PreferencesUtil {
  private PFS: preferences.Preferences|null;
  private PFS_TYPE: preferences.StorageType|null;
  private PFS_NAME: string;
  private ctx: common.UIAbilityContext|null;
  /**
   * 构造函数
   * @param ctx 上下文
   * @param pfName 首选项集合名
   */
  constructor(ctx: common.UIAbilityContext, pfName: string) {
    Logger.info(`初始化${pfName}首选项`, TAG)
    this.PFS_NAME = pfName;
    this.ctx = ctx;
    let xmlType = preferences.StorageType.XML;
    let gskvType = preferences.StorageType.GSKV;
    let options: preferences.Options = {name: pfName, storageType: xmlType}
    let observer = (key: string) => {
      Logger.info(`${key} changed`, TAG)
    }
    let isGskvSupported = preferences.isStorageTypeSupported(gskvType);
    if(isGskvSupported) {
      options = {name: pfName, storageType: gskvType}
      this.PFS_TYPE = gskvType;
    } else {
      this.PFS_TYPE = xmlType;
    }
    this.PFS = preferences.getPreferencesSync(ctx, options);
    this.PFS.on("change",  observer)
  }

  /**
   * 获取字符串
   * @param key 键
   * @returns 值
   */
  getStr(key: string): string {
    try {
      if (this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: string = this.PFS.getSync(key, "") as string;
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return "";
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return "";
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return "";
    }
  }

  /**
   * 获取数字
   * @param key 键
   * @returns 值
   */
  getNum(key: string): number {
    try {
      if (this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: number = this.PFS.getSync(key, "") as number;
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return 0;
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return 0;
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return 0;
    }
  }

  /**
   * 获取布尔值
   * @param key 键
   * @returns 值
   */
  getBool(key: string): boolean {
    try {
      if (this.PFS){
        if (this.PFS.hasSync(key)) {
          const value: boolean = this.PFS.getSync(key, false) as boolean;
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return false;
        }
      }else{
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return false;
      }

    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return false;
    }
  }

  getStrArr(key: string): Array<string> {
    try {
      if (this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: string[] = this.PFS.getSync(key, []) as string[];
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return [];
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return [];
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return [];
    }
  }

  getNumArr(key: string): Array<number> {
    try {
      if(this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: number[] = this.PFS.getSync(key, []) as number[];
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return [];
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return [];
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return [];
    }
  }

  setStr(key: string, value: string): void {
    try {
      if  (this.PFS) {
        this.PFS.putSync(key, value);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setNum(key: string, value: number): void {
    try {
      if  (this.PFS) {
        this.PFS.putSync(key, value);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setBool(key: string, value: boolean): void {
    try {
      if  (this.PFS) {
        this.PFS.putSync(key, value);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setStrArr(key: string, value: Array<string>): void {
    try {
      if(this.PFS){
        this.PFS.putSync(key, value);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  setNumArr(key: string, value: Array<number>): void {
    try {
      if(this.PFS) {
        this.PFS.putSync(key, value);
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  deleteStr(key: string): string {
    try {
      if(this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: string = this.PFS.getSync(key, "") as string;
          this.PFS.deleteSync(key);
          if (this.PFS_TYPE == preferences.StorageType.XML) {
            this.PFS.flushSync();
          }
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return ""
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return ""
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return ""
    }
  }

  deleteNum(key: string): number {
    try {
      if(this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: number = this.PFS.getSync(key, 0) as number;
          this.PFS.deleteSync(key);
          if (this.PFS_TYPE == preferences.StorageType.XML) {
            this.PFS.flushSync();
          }
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return 0
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return 0
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return 0
    }
  }

  deleteBool(key: string): boolean {
    try {
      if(this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: boolean = this.PFS.getSync(key, false) as boolean;
          this.PFS.deleteSync(key);
          if (this.PFS_TYPE == preferences.StorageType.XML) {
            this.PFS.flushSync();
          }
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return false
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return false
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return false
    }
  }

  deleteStrArr(key: string): Array<string> {
    try {
      if(this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: string[] = this.PFS.getSync(key, []) as string[];
          this.PFS.deleteSync(key);
          if (this.PFS_TYPE == preferences.StorageType.XML) {
            this.PFS.flushSync();
          }
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return []
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return []
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return []
    }
  }

  deleteNumArr(key: string): Array<number> {
    try {
      if (this.PFS) {
        if (this.PFS.hasSync(key)) {
          const value: number[] = this.PFS.getSync(key, []) as number[];
          this.PFS.deleteSync(key);
          if (this.PFS_TYPE == preferences.StorageType.XML) {
            this.PFS.flushSync();
          }
          return value;
        } else {
          Logger.warn(`key: ${key} not exist`, TAG)
          return []
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
        return []
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
      return []
    }
  }

  deleteAll(): void {
    try {
      if (this.PFS) {
        this.PFS.clearSync();
        if (this.PFS_TYPE == preferences.StorageType.XML) {
          this.PFS.flushSync();
        }
      } else {
        Logger.error(`key: ${this.PFS_NAME} 首选项未初始化`, TAG)
      }
    } catch (e) {
      Logger.error(`happen error: ${e}`, TAG)
    }
  }

  release() {
    if (this.PFS) {
      let observer = (key: string) => {
        Logger.info(`${key} changed`, TAG)
      }
      this.PFS.off("change", observer);
      preferences.removePreferencesFromCacheSync(this.ctx, this.PFS_NAME);
      this.PFS = null;
      this.PFS_TYPE = null;
      this.ctx = null;
      Logger.info(`${this.PFS_NAME} release success`, TAG)
      this.PFS_NAME = ""
    }
  }

}
```

这种工具类都是比较固定可移植的，只要理解其工作原理以及其核心功能，我们就可以去针对于具体业务进行微调即可。

## 大量数据持久化存储

对于大量数据存储我们就需要使用数据库来进行数据的持久化了。在API18版本之前我们只有**键值型数据库（KV-Store）**和**关系型数据库（RelationalStore）**这两种选则，而在API18版本之后我华为官方又为我们提供了第三种选择**向量数据库**。

我们首先来简单介绍一下比较常见也更容易理解的两种数据库。

### 键值型数据库（KV-Store）

键值对，这对于每一个程序员都在熟悉不过的组合了，这也造就了这种数据库简单易懂的特性，但与此同时这也导致了一个问题，就是其存储的数据**不能包含过于复杂的关系模型**，而官方所推荐的几个例子包括了：商品名称及对应价格、员工工号及今日是否已出勤等。一个键值对就可以**完整的去表示出我们所需要记录的全部信息**。这很重要，因为键值对数据库并不能像关系型数据库的那样利用建库建表来将大量关联的字段进行统一的存储以及查询。

当然这种数据库也包含了一些使用限制。这些限制主要是针对于大小和数量，当然也有对回调函数的处理逻辑进行的限制。

![7](HarmonyOSPersistent/7.png)

前三条都好说，重点是第四条中的`阻塞操作`一词该怎么理解，还有为什么要限制阻塞操作？

看到这个问题，我们需要深入理解一下什么是`阻塞操作`以及为什么KV-Store要对此进行限制。

#### 什么是阻塞操作？

简单来说，**阻塞操作**就是那些会让当前执行线程"停下来等待"的操作。比如说：

1. **同步I/O操作**：像同步读取一个大文件，程序就得等文件读完才能继续往下执行
2. **网络请求**：发起一个同步的HTTP请求，必须等服务器响应回来
3. **长时间计算任务**：比如一个复杂的算法运算，或者一个执行很久的循环
4. **线程睡眠**：比如`Thread.sleep()`这样的操作

这些操作的共同特点就是：**执行的时候会占用线程，让线程无法去处理其他事情**。

#### 为什么要限制阻塞操作？

这个限制的原因主要有以下几个方面：

1. **回调函数的执行环境很特殊**

    KV-Store的回调函数通常是在系统的事件循环线程中执行的，这些线程承担着很多重要的系统任务。如果我们在回调函数中执行阻塞操作，就相当于把这个重要的系统线程给"绑架"了。

    ```typescript
    // ❌ 错误示例：在回调中执行阻塞操作
    kvStore.get('userInfo', (err, data) => {
        if (!err) {
            // 这是一个阻塞操作，会让整个线程停下来等待
            let content = fs.readFileSync('bigFile.txt');

            // 在这5秒钟内，其他KV-Store操作都得等着
            setTimeout(() => {}, 5000);
        }
    });
    ```

2. **会影响整个应用的性能**

    想象一下，如果你在银行排队办业务，前面的人在窗口睡觉了，那么后面所有人都得等着。KV-Store的回调函数就是这个"窗口"，如果在回调里执行阻塞操作，后续所有的数据库操作都会被延迟，整个应用的响应速度就会变得很慢。

3. **可能造成数据不一致**

    在多进程或高并发场景下，如果回调函数被长时间阻塞，可能会导致数据状态的不一致。比如你正在更新一个计数器，但是更新操作被阻塞了，这时候其他进程可能已经修改了同一个数据，最终结果就可能不是你预期的。

#### 正确的处理方式

那么遇到需要执行耗时操作的情况怎么办呢？

- 方法一：**异步化处理**

    ```typescript
    // ✅ 正确示例：使用异步操作
    kvStore.get('userInfo', (err, data) => {
        if (!err) {
            // 不在回调中直接执行耗时操作，而是异步处理
            setTimeout(() => {
                performLongRunningTask();
            }, 0);

            // 或者使用Promise
            performAsyncTask().then(result => {
                // 处理结果
            });
        }
    });
    ```

- 方法二：**任务分离**

    ```typescript
    // ✅ 将计算密集型任务移到其他地方处理
    kvStore.get('data', (err, data) => {
        if (!err) {
            // 快速处理，然后把耗时任务交给其他地方
            processDataAsync(data);
        }
    });

    async function processDataAsync(data) {
        // 在这里执行耗时操作，不会阻塞KV-Store的回调
        const result = await heavyComputation(data);
        return result;
    }
    ```

{% note warning flat %}
记住一个原则：KV-Store的回调函数应该尽可能保持轻量级，只处理必要的业务逻辑，避免任何可能阻塞线程的操作。这样才能保证整个应用的高性能运行。
{% endnote %}

理解了这个限制背后的原因，我们在实际开发中就能更好地设计数据访问逻辑，避免踩坑。接下来，我们来看看关系型数据库（RelationalStore）的特点和使用场景。

## 关系型数据库（RelationalStore）

鸿蒙开发中的关系型数据库其实也是基于我们很熟悉的SQLite开源组件实现的。整体的操作方式与市面上常见的关系型数据库很类似，都可以利用SQL语句去进行对数据库的一系列操作。但肯定也还是存在差异的，鸿蒙为我们提供了很多的接口，可以直接通过**面向对象的方式去进行数据库的操作**。这个思想在很多主流的开发框架中都有去体现，就比如说是Java的SpringBoot，Python的Django，Node.js的Koa等等。接下来我们来一起分析一下关系型数据库的面向对象的操作方式。

### 关系型数据库的对象化模型

#### SpringBoot与MyBatis

首先我们要先思考一下，对于一个关系型数据库，我们需要去对其进行哪些核心操作呢？咱们来用`Springboot`和`MyBatis`来模拟一下。

```yml
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/order_system?useUnicode=true&characterEncoding=utf8&useSSL=true
    username: root
    password: **********
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
      connection-test-query: SELECT 1
```

首先在配置文件中设置要连接的数据库的配置信息，指定要连接的目标数据库的url、用户名、密码等设置。

```XML
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.xbxyftx.ordersystembackend.mapper.UserMapper">
    <resultMap id="BaseResultMap" type="org.xbxyftx.ordersystembackend.entity.User">
        <id column="id" property="id"/>
        <result column="username" property="username"/>
        <result column="password" property="password"/>
        <result column="created_at" property="createdAt"/>
    </resultMap>

    <select id="findById" resultMap="BaseResultMap">
        SELECT * FROM users WHERE id = #{id}
    </select>

    <select id="findByUsername" resultMap="BaseResultMap">
        SELECT * FROM users WHERE username = #{username}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO users (username, password, created_at)
        VALUES (#{username}, #{password}, NOW())
    </insert>

    <update id="update">
        UPDATE users
        SET password = #{password}
        WHERE id = #{id}
    </update>
</mapper> 
```

```java
// User.java
package org.xbxyftx.ordersystembackend.entity;

import java.time.LocalDateTime;

public class User {
    // 用户ID
    private Long id;
    // 用户名
    private String username;
    // 密码
    private String password;
    // 创建时间
    private LocalDateTime createdAt;

    // 获取用户ID
    public Long getId() { return id; }
    // 设置用户ID
    public void setId(Long id) { this.id = id; }
    
    // 获取用户名
    public String getUsername() { return username; }
    // 设置用户名
    public void setUsername(String username) { this.username = username; }
    
    // 获取密码
    public String getPassword() { return password; }
    // 设置密码
    public void setPassword(String password) { this.password = password; }
    
    // 获取创建时间
    public LocalDateTime getCreatedAt() { return createdAt; }
    // 设置创建时间
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

```java
package org.xbxyftx.ordersystembackend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.xbxyftx.ordersystembackend.entity.User;

@Mapper
public interface UserMapper {
    // 根据id查询用户
    User findById(@Param("id") Long id);
    // 根据用户名查询用户
    User findByUsername(@Param("username") String username);
    // 插入用户
    int insert(User user);
    // 更新用户
    int update(User user);
}
```

这里我引用了前一阵子写的一个点餐系统的后端代码，其中我们的数据库中有一个`User`实体，其具有`id`、`username`、`password`和`created_at`四个属性。在`UserMapper.xml`文件中我们将对数据库进行**查找**、**插入**以及**更新**操作的SQL语句及其对应的参数进行了映射与封装。

利用`mapper`标签将其映射到了`UserMapper`接口中，这样我们就可以通过`UserMapper`接口进行数据库的操作了，调用该接口传入对应参数就可以执行XML文件中所封装好的SQL语句，来对数据库进行操作。而与此同时，我们还利用`resultMap`标签**将数据库中的数据映射到实体类**中，这样我们就可以在Java代码中直接获取到数据库中的数据了。

```java
  // 注册用户
  @Override
  public User register(UserDTO userDTO) {
      // 检查用户名是否已存在
      if (userMapper.findByUsername(userDTO.getUsername()) != null) {
          throw new BusinessException("用户名已存在");
      }
      // 创建用户
      User user = new User();
      user.setUsername(userDTO.getUsername());
      // 对密码进行加密
      user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
      
      // 插入用户
      userMapper.insert(user);
      return user;
  }
  // 用户登录
  @Override
  public User login(String username, String password) {
      // 根据用户名查询用户
      User user = userMapper.findByUsername(username);
      if (user == null) {
          throw new BusinessException("用户不存在");
      }
      // 比较密码是否匹配
      if (!passwordEncoder.matches(password, user.getPassword())) {
          throw new BusinessException("密码错误");
      }
      return user;
  }
```

所谓的用面向对象思想来操作数据库，从这个注册用户函数以及用户登录函数就能很容易的理解。我们将从请求中获取的数据封装进一个对象中，通过对关键字段的查询来进行用户是否存在的判断，`UserDTO`是一个数据传输对象，用于封装用户注册时提交的数据。在插入用户的时候我们就无需去在函数中写SQL语句来进行写入，而是直接将需要插入的值封装进一个`User`对象中，通过`UserMapper`接口中的`insert`方法将数据插入到数据库中。

同样的，在登录函数中，我们从数据库中查询出来的数据也是会自动被封装进一个`User`对象中，而不是几个散落的值。我们只需要按照面向对象编程的思路去调用API，对对象进行操作就可以实现对数据库的操作，而不用在函数中直接的去编写SQL语句。

总结一下总共分为以下四步：

- 首先要指定需要操作的数据库
- 随后通过`Mapper`映射来拉出所需操作的接口
- 将获取到的数据或是需要写入的数据封装为`Entity`实例类的实例化对象进行数据操作
- 最后针对不同的事务类型封装不同的功能函数

![8](HarmonyOSPersistent/8.png)

OK，理解了这些之后，我们来类比着理解鸿蒙开发中的关系型数据库。官方所提供的API参考首先列举出的四种常用功能就是我们刚才所总结的四个步骤。

![9](HarmonyOSPersistent/9.png)

#### RdbPredicates

![10](HarmonyOSPersistent/10.png)

**RdbPredicates（关系型数据库谓词）**是鸿蒙关系型数据库中用于构建查询条件的核心工具类。

##### 什么是谓词？

在数据库查询中，**谓词（Predicates）**是用来描述查询条件的逻辑表达式，它用来判断某个条件是否为真。简单来说，谓词就是我们在SQL语句中常见的WHERE子句中的条件判断：

```sql
-- 这里的 "age > 18" 就是一个谓词
SELECT * FROM users WHERE age > 18;

-- "name = 'XBXyftx'" 也是一个谓词  
SELECT * FROM users WHERE name = 'XBXyftx';

-- 复合谓词：多个条件组合
SELECT * FROM users WHERE age > 18 AND city = '北京';
```

每个谓词都会对数据库中的每一行数据进行判断，返回true或false，只有返回true的数据行才会被包含在查询结果中。

##### RdbPredicates的核心优势

在鸿蒙的关系型数据库中，`RdbPredicates`提供了一种**面向对象的方式来构建SQL查询条件**，具有以下优势：

1. **类型安全**：避免SQL注入攻击，提供编译时类型检查
2. **链式调用**：支持方法链，代码更加简洁易读  
3. **动态构建**：可以根据业务逻辑动态添加查询条件
4. **跨平台一致性**：与鸿蒙数据库API完全集成

![11](HarmonyOSPersistent/11.png)

##### 常用谓词方法

RdbPredicates提供了丰富的方法来构建各种查询条件：

**基础比较操作：**

```typescript
// 等于条件
let predicates = new relationalStore.RdbPredicates("USER_TABLE");
predicates.equalTo("name", "XBXyftx");

// 不等于条件  
predicates.notEqualTo("status", "deleted");

// 大于、小于条件
predicates.greaterThan("age", 18);
predicates.lessThan("score", 100);
predicates.greaterThanOrEqualTo("level", 5);
predicates.lessThanOrEqualTo("price", 999.99);
```

**模糊查询：**

```typescript
// LIKE 模糊匹配
predicates.like("email", "%@gmail.com");

// 包含指定字符串
predicates.contains("description", "鸿蒙");

// 以指定字符串开头/结尾
predicates.beginsWith("phone", "138");
predicates.endsWith("filename", ".jpg");
```

**范围查询：**

```typescript
// IN 查询：在指定值集合中
predicates.in("category", ["技术", "生活", "学习"]);

// BETWEEN 查询：在指定范围内
predicates.between("create_time", "2024-01-01", "2024-12-31");
```

**空值判断：**

```typescript
// 判断字段是否为空
predicates.isNull("deleted_at");
predicates.isNotNull("avatar");
```

**逻辑组合：**

```typescript
// AND 组合条件
let predicates = new relationalStore.RdbPredicates("USER_TABLE");
predicates.equalTo("status", "active")
         .and()
         .greaterThan("age", 18)
         .and()
         .like("email", "%@company.com");

// OR 组合条件
predicates.equalTo("role", "admin")
         .or()
         .equalTo("role", "manager");

// 复杂组合（使用分组）
predicates.beginWrap()
         .equalTo("category", "VIP")
         .or()
         .greaterThan("points", 1000)
         .endWrap()
         .and()
         .equalTo("status", "active");
```

**排序和分页：**

```typescript
// 排序
predicates.orderByAsc("create_time");  // 升序
predicates.orderByDesc("score");       // 降序

// 分页
predicates.limitAs(10);                // 限制返回10条记录
predicates.offsetAs(20);               // 跳过前20条记录
```

##### 实际应用示例

让我们通过一个用户管理的实际例子来理解RdbPredicates的使用：

```typescript
import { relationalStore } from '@kit.ArkData';

// 示例1：查询活跃的成年用户
function getActiveAdultUsers(): Promise<relationalStore.ResultSet> {
  let predicates = new relationalStore.RdbPredicates("USER_TABLE");
  
  predicates.equalTo("status", "active")           // 状态为活跃
           .and()
           .greaterThanOrEqualTo("age", 18)        // 年龄大于等于18
           .and()
           .isNotNull("email")                     // 邮箱不为空
           .orderByDesc("last_login_time")         // 按最后登录时间降序
           .limitAs(50);                           // 限制50条记录
           
  return rdbStore.query(predicates, ["id", "name", "email", "age"]);
}

// 示例2：动态搜索用户
function searchUsers(keyword: string, minAge?: number, city?: string): Promise<relationalStore.ResultSet> {
  let predicates = new relationalStore.RdbPredicates("USER_TABLE");
  
  // 基础搜索条件：姓名或邮箱包含关键词
  predicates.beginWrap()
           .contains("name", keyword)
           .or()
           .contains("email", keyword)
           .endWrap();
  
  // 动态添加年龄条件
  if (minAge !== undefined) {
    predicates.and().greaterThanOrEqualTo("age", minAge);
  }
  
  // 动态添加城市条件
  if (city) {
    predicates.and().equalTo("city", city);
  }
  
  // 排除已删除用户
  predicates.and().notEqualTo("status", "deleted");
  
  return rdbStore.query(predicates);
}

// 示例3：复杂的业务查询 - 查找优质用户
function getPremiumUsers(): Promise<relationalStore.ResultSet> {
  let predicates = new relationalStore.RdbPredicates("USER_TABLE");
  
  // 优质用户条件：VIP用户 或者 积分大于5000的活跃用户
  predicates.beginWrap()
           .equalTo("membership", "VIP")
           .or()
           .beginWrap()
           .greaterThan("points", 5000)
           .and()
           .equalTo("status", "active")
           .endWrap()
           .endWrap()
           .and()
           .greaterThan("registration_days", 30)    // 注册超过30天
           .orderByDesc("points")                   // 按积分降序
           .orderByDesc("last_activity_time");      // 再按最后活跃时间降序
           
  return rdbStore.query(predicates);
}
```

##### RdbPredicates vs 原生SQL

通过对比可以更好地理解RdbPredicates的价值：

| 方面 | RdbPredicates | 原生SQL |
|------|---------------|---------|
| **类型安全** | ✅ 编译时检查 | ❌ 运行时才发现错误 |
| **SQL注入** | ✅ 自动防护 | ❌ 需手动处理 |
| **动态构建** | ✅ 支持条件式添加 | ❌ 需要字符串拼接 |
| **代码可读性** | ✅ 链式调用，结构清晰 | ❌ 复杂SQL难以维护 |
| **IDE支持** | ✅ 智能提示和补全 | ❌ 字符串内容无提示 |

```typescript
// RdbPredicates方式 - 类型安全、清晰易读
let predicates = new relationalStore.RdbPredicates("USER_TABLE");
predicates.equalTo("age", 25)
         .and()
         .like("name", "%张%")
         .orderByDesc("create_time");

// 等效的SQL - 容易出错，难以维护
let sql = "SELECT * FROM USER_TABLE WHERE age = ? AND name LIKE ? ORDER BY create_time DESC";
let args = [25, "%张%"];
```

通过RdbPredicates，我们可以用面向对象的方式构建复杂的查询条件，既保证了代码的安全性和可读性，又提供了强大的动态查询能力。这正是鸿蒙关系型数据库设计的精髓所在。

{% note success flat %}
至此我们就解决了数据查询的条件语句的映射。可以看到整个SQL语句都可以用`RdbPredicates`进行构建，一个SQL语句的谓词部分就会被封装进一个RdbPredicates对象中。在这个过程中我们就自动的防御了常规的SQL注入攻击，也是实现了SQL语句到对象属性的映射。
{% endnote %}
