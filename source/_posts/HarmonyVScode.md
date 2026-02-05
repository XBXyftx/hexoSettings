---
title: VScode的鸿蒙化尝试
date: 2026-02-03 14:52:55
tags:
  - AI
  - 技术向
  - K2.5
  - KimiCode
  - 鸿蒙
  - 项目
cover: /imgs/ArticleTopImgs/HarmonyVScodeTopImg.webp
description: 一个大胆的想法，一次勇敢的尝试
typewriter: 用最新国产最强开源大模型来进行VScode的鸿蒙化尝试，我相信这会是一个很有想法很有价值的尝试。
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

这个想法是在我前两天深夜睡不着的时候突然冒出来的，当然此前我也想过进行这样的尝试，毕竟VScode这样一个开源神器，对于开发者来说几乎是必不可缺的，这不是某个语言，某个技术栈的专用工具，而是一个万金油平台，一次移植的移植成功，换来的将会是鸿蒙生态的革命性突破。

## 初步规划

### 确定MVP移植功能列表

想要移植VScode一上来就适配全量功能肯定是不显示的，我最想解决的问题其实是在鸿蒙平板上写博客这件事，我原本尝试过的两种方案一个是用网页版VScode写完了push到仓库等拿到电脑后部署，还有一个就是用CodeSpace，这个东西启动太慢了，而且有用量限制。相比之下我觉得现阶段开发一个和网页版VScode功能类似的软件是比较现实的，想在鸿蒙上直接运行任何语言的代码并不是件简单的事，但是对于编辑和git拉取推送，以及对于常见语言种类的高亮支持我认为还是可以一做的。

我先用k2.5的Agent模式去进行一下完整项目设计的规划并给我写一套方案。

![1](HarmonyVScode/1.webp)

### 确认架构可行性

我先用DevEco创建好原生的C++项目框架随后让K2.5结合真实的软件框架进行一下可行性的分析。

```txt
 ✅ 可行性评估：可以实现

  你的技术选型是合理的：

  • CodeMirror 6 确实是移动端的更好选择（比Monaco轻量）
  • isomorphic-git 可以在WebView中运行
  • ArkUI + WebView 混合架构在鸿蒙上是标准做法

  ─────────────────────────────────────────────────────────────────────────────
  ⚠️ 需要关注的不合理/风险点

  1. UI层割裂问题（架构设计缺陷）

  你的设计是：侧边栏/状态栏用 ArkUI，编辑器用 WebView(CodeMirror)

  问题：

  • 视觉风格难以统一（字体、颜色、间距）
  • 交互体验割裂（比如拖拽文件到编辑器、主题同步）
  • 状态管理复杂（ArkTS 和 WebView JS 之间需要频繁通信）

  建议： 考虑编辑器区域也用原生 ArkUI 实现，或者整个应用都用 WebView（但这样会 
  失去原生感）

  ─────────────────────────────────────────────────────────────────────────────
  2. 文件系统桥接过于乐观

  你计划用 lightning-fs + FileBridge 适配鸿蒙文件系统，但这存在隐患：

  isomorphic-git → lightning-fs (内存/IndexedDB) → FileBridge → @ohos.file.fs  

  问题：

  • lightning-fs 是浏览器端的抽象文件系统，不是为原生文件系统设计的
  • Git操作会频繁读写，双层桥接性能损耗大
  • 大仓库（如Linux内核）会占用大量内存

  建议： 直接为 isomorphic-git 编写自定义 fs 适配器，跳过 lightning-fs

  ─────────────────────────────────────────────────────────────────────────────
  3. Git网络请求未考虑

  isomorphic-git 默认使用浏览器 fetch API，但在鸿蒙 WebView 中：

  • 跨域限制可能更严格
  • SSH 协议完全不支持（isomorphic-git 本身就不支持）
  • 私有仓库的认证流程需要额外处理

  建议： 明确Git只支持HTTPS + Token认证，且需要测试WebView中的网络行为

  ─────────────────────────────────────────────────────────────────────────────
  4. 缺少关键细节

   缺失项         影响
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   软键盘处理     平板上代码编辑体验核心，未提及
   存储位置规划   沙盒目录 vs 公共目录（Documents）
   目标鸿蒙版本   API 9 和 API 11+ 文件API差异大
   构建流程       如何将npm依赖打包进hap

  ─────────────────────────────────────────────────────────────────────────────
  5. Tree-sitter WASM 的潜在问题

  WebView 中运行 WASM 需要：

  • 开启 wasm-unsafe-eval CSP
  • 鸿蒙 WebView 对 WASM 支持需要验证（不同系统WebView内核不同）

  建议： 先做PoC验证 WASM 在鸿蒙 WebView 中的可行性

  ─────────────────────────────────────────────────────────────────────────────
  📝 修改建议

  架构调整建议

  原方案：ArkUI(UI) ←→ WebView(编辑器+Git+文件系统) ←→ NAPI桥接

  建议改为：
  方案A（轻量）：ArkUI(UI) ←→ WebView(仅编辑器渲染) ←→ ArkTS(业务逻辑+Git+文件)
  方案B（全WebView）：纯WebView应用，用CodeMirror + isomorphic-git + 虚拟文件系
  统

  阶段性调整建议

  Phase 1 应该增加：验证 WebView 中 CodeMirror 的输入体验（软键盘、中文输入）  

  Phase 2 应该明确：文件系统直接操作鸿蒙原生API，不要经过 lightining-fs        

  ─────────────────────────────────────────────────────────────────────────────
  总结

   维度         评估
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   技术可行性   ✅ 可以实现
   架构合理性   ⚠️ 需要调整（主要是文件系统桥接）
   工期预估     ⚠️ 12周偏紧，建议16周
   风险等级     中等（主要风险在WebView性能和文件系统）

  我的建议： 先做一个最小可行原型（只用CodeMirror + 简单文件读写），验证核心体 
  验后再继续开发。特别是要验证 WebView中代码编辑的软键盘体验，这是平板代码编辑 
  器的核心痛点。

  你觉得这些反馈有帮助吗？有哪些点你想进一步讨论？

```

核心问题主要出现在UI一致性和文件读写上，对于git的文件读写问题我此前看到过一个开源鸿蒙的项目，可供参考。[GitNext](https://gitcode.com/OpenHarmonyPCDeveloper/GitNext)

由于命令行工具没法直接阅读完整网页，我直接下载源码ZIP。

![2](HarmonyVScode/2.webp)

### 外部记忆准备

在之前的开发中我有意识到过上下文长度限制导致的问题，不过此前的经验不足，一直是要不然自己手动重新描述，要不然是借助工具自身的总结能力，就像是Kiro会简单总结上一段对话的主要内容，但是会损失很多细节导致本要成功的效果会被新的上下文干扰导致失败，所以我们需要去专门开启一个文档记录todoList并且记录进度以及实现细节。

（有一说一其实我之前博客就有点这个功能的意味。）

![3](HarmonyVScode/3.webp)

## 代码编辑器

这部分的主要功能包含文件中现有内容的显示，文件内容的编辑，内容的实时高光渲染，以及文件内容的保存。

### 高光渲染的技术栈抉择

对于这部分最大的问题就是在于代码高亮器，如果全面原生重构工作量过大，利用WebView可以直接套用CodeMirror 6，虽然会有性能损失，但现在不实操也拿不出实际的性能损失数据。

所以我决定先去观察一下现在已经上架华为应用市场的一些MarkDown编辑器和一些代码编辑器，看看他们是怎么做的。

![4](HarmonyVScode/4.webp)

![5](HarmonyVScode/5.webp)

![6](HarmonyVScode/6.webp)

![7](HarmonyVScode/7.webp)

![8](HarmonyVScode/8.webp)

可以看到其实整体来讲都是使用的WebView，而且甚至有整个应用完整的都是使用WebView的，性能上我并没有感受到什么差别，所以我们完全没必要重复造轮子，直接使用WebView即可。

### 代码编辑器开发

ok，接下来开始正式开发，我们先来尝试一下最核心的两大功能之一的代码编辑器，git有开源项目作为参照相对来讲应该会简单一些，所以先来啃难啃的。

首先进行的是先利用CodeMirror 6去开发一个代码编辑器的MVP版本，先进行代码实时高亮渲染的可行性验证。

Kimi的第一版代码出现严重谬误，它编写了大量的TS代码，这是我想到的，因为之前我已经和它进行了相当长时间的对话都是关于鸿蒙项目的，也没有超出上下文长度限制，我就默认它会正确编写了，看来开始得动用skills了。

![9](HarmonyVScode/9.webp)

仓库链接我也放在这里，大家可以自行取用。

[skill-arkts-syntax-assistant](https://github.com/SummerKaze/skill-arkts-syntax-assistant)

[arkts_skills](https://github.com/FadingLight9291117/arkts_skills)

[arkts-agent-skill](https://github.com/aresbit/arkts-agent-skill)

同时为了防止它再犯病，我决定进行手动回滚后新开一个对话窗口，同时为了更好的观感体验更换到了VScode的插件来继续Vibe。

![10](HarmonyVScode/10.webp)

可以说是宝藏skills了。

生成的第一版代码中使用的全都是V1版本的状态管理，所以我安装完Skills后的第一件事就是将V1升级到V2。

![11](HarmonyVScode/11.webp)

![12](HarmonyVScode/12.webp)

看起来可以说是相当唬人了，但问题也是相当严重，一方面是在第一版编写完后我连着让K2.5改了四五次的报错串，另一方面是当前的版本仅仅是一个界面，这个编辑器并没有真正实质性的内容？我在阅读源码之后确认了我的想法。

![13](HarmonyVScode/13.webp)

![14](HarmonyVScode/14.webp)

他给我的选项可以看出当前我们的信息存在一些差距。

- 首先它不知道我已经成功编译并部署
- 2是它并不明确我要的不是CDN而是纯本地的编辑器。

同步信息并明确需求。

![15](HarmonyVScode/15.webp)

哦？！那很期待了。

测试的过程中出现了大量的配置问题，并且在其反复修改后发现配置文件被制造了巨量异常修改和错误，于是准备回滚并换为cursor使用Claude Opus 4.5进行尝试。

### Claude Opus 4.5

![16](HarmonyVScode/16.webp)

```txt
✅ MVP 版本完成总结
1. CodeMirror 本地构建 ✓
创建 editor-builder/ 构建目录
使用 esbuild 打包 CodeMirror 6 模块
生成 codemirror-bundle.js (~605KB)
支持语言：JavaScript、TypeScript、ArkTS、Python、HTML、CSS、JSON、Markdown、XML
构建命令:
cd editor-buildernpm installnpm run build
2. 文件创建/读写功能 ✓
新建文件按钮 📄
新建文件夹按钮 📁
文件类型切换
文件名合法性校验
文件大小显示
错误提示 Toast
3. WebView 桥接优化 ✓
新增 EditorStatus 接口
状态实时同步回调
markClean() / focus() 方法
内容缓存机制（编辑器未就绪时自动队列）
Promise API 改进
4. 组件状态响应 ✓
编辑器状态栏（行列号、修改状态）
底部状态栏（工作区路径、语言、编码）
编辑器就绪指示器
保存成功提示
5. 长期记忆文档 ✓
记录所有修改内容
更新任务进度
更新技术备忘
📁 新增/修改文件列表
HMVScode/├── editor-builder/                    # [新增] 构建工具│   ├── package.json│   ├── build.js│   └── src/editor.js├── entry/src/main/│   ├── resources/rawfile/editor/│   │   ├── index.html                 # [更新]│   │   └── codemirror-bundle.js       # [新增]│   └── ets/│       ├── infrastructure/bridge/│       │   └── EditorBridge.ts        # [更新]│       ├── components/│       │   ├── EditorComponent.ets    # [更新]│       │   └── FileTreeComponent.ets  # [更新]│       └── pages/│           └── Index.ets              # [更新]├── doc/长期记忆.md                     # [更新]└── .gitignore                         # [更新]
现在项目已经具备完整的代码编辑 MVP 功能，包括：
📂 文件浏览和选择
📄 新建文件/文件夹
✏️ 代码编辑（本地 CodeMirror）
🎨 多语言语法高亮
💾 文件保存
📊 状态栏信息展示
```

![17](HarmonyVScode/17.webp)

![18](HarmonyVScode/18.webp)

现在点击新建文件或是新建文件夹都会出现报错，应该是文件系统的权限问题。但编辑器是已经可以使用的了但点击编辑器右上角的保存也是没有用的。

所以我们需要旅顺一下逻辑，我们应当拉起文件选择器让用户去选择工作位置随后再渲染文件树。

<video width="100%" controls>
  <source src="20.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

<video width="100%" controls>
  <source src="21.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

当前问题：

1. 当前文件系统权限确实是正常了，但是拉起的文件选择器选择的是具体的文件而不是目录。
2. 我在手动创建了md文件之后利用文件系统选择后，首页的“工作目录”确实显示的是正确的路径，但我点击新建文件或是查看当前文件夹下文件时，拉起的WebView编辑器都是默认的空的无后缀“test”文件。
3. 再选择文件后左侧的文件树依旧是空的，同时点击编辑器右上角的保存按钮也是没有反应的。

对于WebView编辑器都是默认的空文件这个问题出在文件内容的读取上，我们可以做一层中间层，将文件内容先读到内存后由中间层将文件内容传递给WebView编辑器，点击保存后在由中间层读取WebView编辑器的内容并写入文件系统。同时还要修复我们选择的是文件夹而不是具体文件这个问题。

将上面这段给到Claude后它完成了新一轮的修复，现在再来测试一下。

![22](HarmonyVScode/22.webp)

![23](HarmonyVScode/23.webp)

![24](HarmonyVScode/24.webp)

![25](HarmonyVScode/25.webp)

首先要肯定的是这一次的改动修复了选择的是文件而不是文件夹的bug，但是文件树的渲染当前文件夹下的文件及其子文件夹的功能依旧没有实现，同时仍然无法正常访问到当前文件夹下的文件，我需要更多日志来辅助排查问题。同时新建文件和新建文件夹两个功能依旧无法使用。现在优先解决文件树渲染的问题。

````md


在鸿蒙（HarmonyOS）中渲染文件树，可通过以下两种核心方案实现，均基于 **ArkUI 声明式范式**和 **RenderNode 节点操作**能力：

---

### **方案一：使用 NodeController + RenderNode 动态构建树形结构**
**适用场景**：需精确控制节点位置、层级和渲染属性的复杂文件树（如带缩进、图标、交互动画）。  
**实现步骤**：  
1. **定义文件树节点数据结构**：  
   ```typescript
   class FileNode {
     name: string;
     children: FileNode[] = [];
     // 其他属性（类型、图标等）
   }
   ```

2. **创建自定义 NodeController**：  
   继承 `NodeController`，在 `makeNode()` 中动态构建子树（示例简化）：  
   ```typescript
   import { FrameNode, NodeController, RenderNode } from '@kit.ArkUI';

   class FileTreeController extends NodeController {
     private rootNode: FrameNode | null = null;

     // 递归构建渲染节点
     private buildRenderNode(fileNode: FileNode, depth: number): RenderNode {
       const node = new RenderNode();
       // 设置节点位置（缩进=深度×偏移量）
       node.frame = { x: 20 * depth, y: 0, width: 200, height: 40 };
       node.backgroundColor = 0xFFF5F5F5;

       // 添加子节点（递归）
       fileNode.children.forEach(child => {
         const childNode = this.buildRenderNode(child, depth + 1);
         node.appendChild(childNode);
       });
       return node;
     }

     makeNode(uiContext: UIContext): FrameNode | null {
       this.rootNode = new FrameNode(uiContext);
       const rootRenderNode = this.rootNode.getRenderNode();
       const fileTreeRoot = this.buildRenderNode(yourFileData, 0); // 从深度0开始
       rootRenderNode?.appendChild(fileTreeRoot);
       return this.rootNode;
     }
   }
   ```

3. **在 UI 中挂载 NodeContainer**：  
   ```typescript
   @Component
   struct FileTreeComponent {
     private controller: FileTreeController = new FileTreeController();

     build() {
       Column() {
         NodeContainer(this.controller)
           .width('100%')
           .height('100%')
       }
     }
   }
   ```

---

****方案二：结合 List 组件 + 递归嵌套实现****
**适用场景**：简单文件树，需利用列表性能优化（如大数据量）。  
**关键技巧**：  
- 使用 `@Builder` 递归渲染子节点  
- 通过 `List` 的 `LazyForEach` 优化性能  

```typescript
@Entry
@Component
struct FileTreeList {
  @State rootData: FileNode[] = []; // 根节点数据

  // 递归构建子节点
  @Builder
  TreeNode(node: FileNode) {
    Column() {
      Row() {
        Text(node.name).fontSize(16)
        // 可展开图标（根据是否有子节点显示）
      }
      .onClick(() => { /* 展开/折叠逻辑 */ })

      // 子节点列表（递归）
      if (node.isExpanded && node.children.length > 0) {
        List({ space: 8 }) {
          LazyForEach(node.children, (child: FileNode) => {
            ListItem() {
              this.TreeNode(child) // 递归调用
            }
          })
        }
        .margin({ left: 20 }) // 缩进
      }
    }
  }

  build() {
    List({ space: 10 }) {
      LazyForEach(this.rootData, (item: FileNode) => {
        ListItem() {
          this.TreeNode(item)
        }
      })
    }
  }
}
```

---

****关键差异与选型建议****
| **特性**               | NodeController + RenderNode          | List + 递归嵌套               |
|------------------------|--------------------------------------|-------------------------------|
| **渲染控制粒度**       | 像素级（位置/动画/裁剪）             | 组件级（依赖布局系统）        |
| **性能**               | 更优（直接操作渲染树）               | 依赖列表优化                  |
| **复杂度**             | 较高（需手动管理节点）               | 较低（声明式嵌套）            |
| **适用场景**           | 定制化强、动态更新的树               | 静态/中等规模树               |

> **注意事项**：  
> - **动态更新**：若需增删节点，在 `NodeController` 中调用 `rebuild()` 触发重绘。  
> - **交互事件**：通过 `RenderNode` 的 `onTouch()` 捕获点击事件，结合状态管理展开/折叠。  
> - **性能优化**：深层嵌套时，在递归方案中使用 `LazyForEach` 避免内存溢出。
内容由AI生成，仅供参考
````

````md


在鸿蒙应用开发中，获取用户指定文件夹并渲染子文件树需通过以下步骤实现：

### 一、获取用户文件夹URI
使用文件选择器（Picker）获取用户选择的文件夹URI：
```typescript
import { picker } from '@kit.FileKit';

// 调用文件夹选择器
async function selectFolder() {
  try {
    const folderUri = await picker.selectFolder();
    return folderUri; // 返回格式：'file://docs/storage/Users/currentUser/Documents'
  } catch (err) {
    console.error('选择文件夹失败', err);
  }
}
```

**二、遍历子文件树**
通过`@kit.FileKit`的`fs`模块解析文件夹内容：
```typescript
import { fs } from '@kit.FileKit';

async function buildFileTree(folderUri: string) {
  const dir = fs.openDirSync(folderUri);
  let fileTree = [];

  try {
    let entry;
    while ((entry = await dir.read())) {
      const stat = await fs.stat(entry.path);
      fileTree.push({
        name: entry.name,
        path: entry.path,
        type: stat.isDirectory ? 'folder' : 'file',
        children: stat.isDirectory ? await buildFileTree(entry.path) : []
      });
    }
  } finally {
    dir.closeSync();
  }
  return fileTree;
}
```

**三、渲染文件树组件**
使用`TreeContainer`组件实现递归渲染：
```typescript
@Component
struct FileTree {
  @State fileData: any[] = []

  build() {
    TreeContainer() {
      ForEach(this.fileData, (item: any) => {
        TreeItem() {
          Row() {
            Image(item.type === 'folder' ? $r('app.media.folder') : $r('app.media.file'))
              .width(24)
              .height(24)
            Text(item.name).margin({ left: 8 })
          }
        }.onClick(() => {
          if (item.type === 'folder') {
            this.expandFolder(item); // 展开子目录
          }
        })
      })
    }
  }

  // 展开子文件夹逻辑
  private expandFolder(item: any) {
    buildFileTree(item.path).then(children => {
      item.children = children;
      this.fileData = [...this.fileData];
    });
  }
}
```

### 四、完整调用流程
```typescript
@Entry
@Component
struct MainPage {
  @State fileTree: any[] = []

  build() {
    Column() {
      Button('选择文件夹')
        .onClick(async () => {
          const uri = await selectFolder();
          this.fileTree = await buildFileTree(uri);
        })
      
      FileTree({ fileData: this.fileTree })
    }
  }
}
```

### 关键注意事项
1. **权限声明**  
   在`module.json5`中添加文件访问权限：
   ```json
   "requestPermissions": [
     { "name": "ohos.permission.FILE_ACCESS" },
     { "name": "ohos.permission.READ_MEDIA" }
   ]
   ```

2. **URI处理原则**  
   - 直接传递URI给`fs`模块操作，禁止解析URI路径片段
   - 媒体文件URI需通过`photoAccessHelper`转换（参考搜索结果<sup class="quote">1</sup>）

3. **性能优化**  
   - 使用`LazyForEach`渲染大型文件树
   - 分批次加载子目录（每次加载50条目）

> 完整实现可参考开源项目中的文件管理器案例（搜索结果<sup class="quote">2</sup>），该项目使用`ColumnSplit`布局和`Grid`组件实现了类似功能，支持文件夹导航与文件图标展示。
内容由AI生成，仅供参考
````

![26](HarmonyVScode/26.webp)

```log
02-04 20:48:53.772   49744-49744   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: down: 170740
02-04 20:48:53.772   49744-49744   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:D:170740][OnPointerEvent:649] recv
02-04 20:48:53.772   49744-49744   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:0,InputId:170740,wid:1156,ac:2
02-04 20:48:53.775   49744-49744   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:170740, fId:0, T:0, I=0, M=0
02-04 20:48:53.776   49744-49744   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:170740, TTHNI:fId: 0{ T: page, D: 6 };{ T: Scroll, D: 12 };
02-04 20:48:53.776   49744-49744   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:170740, TTHRTI: T ClickRecognizer info: { T: Scroll }; { T: Row };T PanRecognizer info: { T: Scroll };
02-04 20:48:53.780   49744-49744   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:170740, last id:-1
02-04 20:48:53.780   49744-49744   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:170740,wid:1156,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-04 20:48:53.780   49744-49744   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move: 170741
02-04 20:48:53.780   49744-52208   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] RVS_ENABLE_CHECK Result: 0
02-04 20:48:53.854   49744-49744   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move, first: 170742-(2026-02-04 20:48:53.780ms), 170755, count: 14, last: ac: up: 170756
02-04 20:48:53.854   49744-49744   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:U:170756][OnPointerEvent:649] recv
02-04 20:48:53.854   49744-49744   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:1,InputId:170756,wid:1156,ac:4
02-04 20:48:53.855   49744-49744   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:170756, fId:0, T:1, I=0, M=0
02-04 20:48:53.855   49744-49744   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-04 20:48:53.855   49744-49744   C0390B/com.xbx...AceScrollable  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Scrollable GestureJudge:0, 0
02-04 20:48:53.855   49744-49744   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click gesture judge reject
02-04 20:48:53.855   49744-49744   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-04 20:48:53.855   49744-49744   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] CLK RACC, T: Row
02-04 20:48:53.857   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] ParseWindow: not window mode.
02-04 20:48:53.857   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Opening folder picker...
02-04 20:48:53.857   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] parseDocumentPickerSelectOption start
02-04 20:48:53.857   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] parseDocumentPickerSelectOption end
02-04 20:48:53.857   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] modalPicker start 
02-04 20:48:53.857   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPicker:499)][picker]: StartModalPicker begin.
02-04 20:48:53.857   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(ParseArgsStartModalPicker:480)][picker]: ParseArgsStartModalPicker begin.
02-04 20:48:53.857   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(AsyncContextSetStaticObjectInfo:444)][picker]: AsyncContextSetStaticObjectInfo begin.
02-04 20:48:53.857   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:389)][picker]: StartPickerExtension begin.
02-04 20:48:53.857   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:395)][picker] Will get uiContent by context.
02-04 20:48:53.858   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:414)][picker]: SetParam end, udkey = 
02-04 20:48:53.858   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:428)][picker]: will CreateModalUIExtension by extType: filePicker, pickerType: select
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@95][ID: 1] The modal UIExtension is created.
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Create UIExtensionNode
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@979][ID: 1] RegisterPipelineEvent
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@931][ID: 1] OnAttachToFrameNode
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@454][ID: 1] The current state is 'NONE' when UpdateWant, needCheck: '0'.
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@481][ID: 1] The ability KeyAsync 0, uIExtensionUsage: 0.
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@645][ID: 1] The session is created with bundle=, ability=, componentId=109.
02-04 20:48:53.858   49744-49744   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 1156
02-04 20:48:53.858   49744-49744   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 1156 enable 1
02-04 20:48:53.858   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@688][ID: 1] Want param isNotifyOccupiedAreaChange is 1, realHostWindowId: 1156, parentWindowType: 1
02-04 20:48:53.859   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     GeneratePersistentId: persistentId: 0, persistentId_: 1277493251
02-04 20:48:53.859   49744-50595   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     persistentId: 1277493251, bundleName: , moduleName: , abilityName: , isDensityFollowHost_: 0, density_: 1.800000
02-04 20:48:53.860   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@868][ID: 1] The state is changing from 'NONE' to 'FOREGROUND'.
02-04 20:48:53.860   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@980][ID: 1] NotifyForeground, persistentid = 1277493251, hostWindowId = 1156, windowSceneId = -1, IsSceneBoardWindow: 0, componentId=109.
02-04 20:48:53.860   49744-49744   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 1156
02-04 20:48:53.860   49744-49744   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 1156 enable 1
02-04 20:48:53.860   49744-50595   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Activate session, id=1277493251
02-04 20:48:53.860   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@223][ID: 1] OnAttachContext newInstanceId: 100000, oldInstanceId: 100000, isMoving: 0, detachContextHappened: 0.
02-04 20:48:53.860   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@185][ID: 1] OnAttachToMainTree, isMoving: 0
02-04 20:48:53.860   49744-49744   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] modalNode->GetParent() 3 mark IsProhibitedAddChildNode when sessionId -1277493251,prohibitedRemoveByRouter: 0, isAllowAddChildBelowModalUec: 0.
02-04 20:48:53.860   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: ModalPage/110 show
02-04 20:48:53.860   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] View: page/23 lost focus
02-04 20:48:53.860   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Scope(Stack/26) has no last focusNode.
02-04 20:48:53.861   49744-49744   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-04 20:48:53.861   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: create modal page, sessionId=1277493251, isProhibitBack=0, isAsyncModalBinding=0, isAllowedBeCovered=0, prohibitedRemoveByRouter=0, isAllowAddChildBelowModalUec=0, prohibitedRemoveByNavigation=1
02-04 20:48:53.861   49744-52208   C03924/com.xbx...Accessibility  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] send accessibility componentType:ModalPage event:536870912 accessibilityId:103
02-04 20:48:53.862   49744-52208   C03924/com.xbx...Accessibility  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] send accessibility componentType:Row event:1 accessibilityId:50
02-04 20:48:53.862   49744-49744   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:170756, last id:170755
02-04 20:48:53.862   49744-49744   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:170756,wid:1156,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-04 20:48:53.863   49744-52217   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerExecute:60)][picker]: StartModalPickerExecute begin
02-04 20:48:53.863   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1258][ID: 1] NotifyDisplayArea displayArea=RectT (0.00, 0.00) - [2800.00 x 1840.00], curWindow=Rect (0.00, 0.00) - [2800.00 x 1840.00], reason=0, duration=0, persistentId=1277493251, componentId=109.
02-04 20:48:53.864   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Request focus on focusView: ModalPage/110.
02-04 20:48:53.864   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FocusSwitch end, Stack/secure_field onBlur, ModalPage/secure_field onFocus, start: 2, end: 1, update: 2
02-04 20:48:53.864   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (ModalPage/110). isDynamic: 0
02-04 20:48:53.864   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FrameNode(ModalPage/110) notNeedSoftKeyboard.
02-04 20:48:53.871   49744-50595   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Activate ret:0, persistentId:1277493251
02-04 20:48:54.211   49744-50514   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::Unmarshalling, Node: 218029719814145, Name: com.huawei.hmos.filemanagerFilePickerUIExtAbility
02-04 20:48:54.211   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ConnectInner: [id: 1277493251] state: 0,isTerminating:0, callingPid:50764, disableDelegator:0
02-04 20:48:54.211   49744-50595   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     InitSessionPropertyWhenConnect: [id: 1277493251] requestedOrientation: 0, defaultRequestedOrientation: 0, userRequestedOrientation: 0
02-04 20:48:54.211   49744-50595   C0420C/com.xbx...code/WMSEvent  com.xbxyftx.HMVScode  I     SetCallingPid: id:1277493251, 50764
02-04 20:48:54.211   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:54.211   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:54.211   49744-50595   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  E     GetScreenSession: Error found screen session with id: 18446744073709551615
02-04 20:48:54.212   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ConnectInner: set session id 1277493251 disableDelegator 0
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@575][ID: 1] The session is connected and the current state is 'FOREGROUND'.
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1455][ID: 1] OnRemoteReady the current state is 'FOREGROUND'.
02-04 20:48:54.212   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionComponent/secure_field RequestFocusImmediately isOnMainTree:1
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] focused state notified to uiextension, persistentid = 1277493251, componentId=109.
02-04 20:48:54.212   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FocusSwitch end, ModalPage/secure_field onBlur, UIExtensionComponent/secure_field onFocus, start: 2, end: 1, update: 2
02-04 20:48:54.212   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (UIExtensionComponent/109). isDynamic: 0
02-04 20:48:54.212   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtension(UIExtensionComponent/109) not need process.
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] focused state notified to uiextension, persistentid = 1277493251, componentId=109.
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionManager register listener
02-04 20:48:54.212   49744-49744   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 1156
02-04 20:48:54.212   49744-49744   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 1156 enable 1
02-04 20:48:54.212   49744-49744   C0395F/com.xbx...amicComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Create UIExtensionAccessibilityChildTreeCallback
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1703][ID: 1] treeId: 0, id: 102
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1697][ID: 1] UIExtension: 102 register child tree, realHostWindowId: 1156
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=1002.
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=1001.
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=3002.
02-04 20:48:54.212   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2184][ID: 1] NotifyHostWindowMode: instanceId = 100000, followStrategy = 0, mode = 1
02-04 20:48:54.214   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionSurface: isDisappearing = 0, paintRect = RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-04 20:48:54.215   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1258][ID: 1] NotifyDisplayArea displayArea=RectT (0.00, 0.00) - [2800.00 x 1840.00], curWindow=Rect (0.00, 0.00) - [2800.00 x 1840.00], reason=0, duration=0, persistentId=1277493251, componentId=109.
02-04 20:48:54.215   49744-49744   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  E     GetScreenSession: Error found screen session with id: 18446744073709551615
02-04 20:48:54.215   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1277493251 to clear the focus state, componentId=109.
02-04 20:48:54.215   49744-49744   C01402/com.xbx...VScode/RSNode  com.xbxyftx.HMVScode  I     RSNode::AddChild, Id: 213648853172312, SurfaceNode:[Id: 218029719814145, name: com.huawei.hmos.filemanagerFilePickerUIExtAbility]
02-04 20:48:54.215   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1825][ID: 1] HandleVisibleAreaChange visible: 1, curVisible: 0, ratio: 1.000000, displayArea: RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-04 20:48:54.215   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1656][ID: 1] The component is changing from 'visible' to 'visible'.
02-04 20:48:54.222   49744-50514   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Foreground: [id: 1277493251] state:1, isTerminating:0
02-04 20:48:54.222   49744-50514   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     SetActive: new active:1, id:1277493251, state:2
02-04 20:48:54.222   49744-50557   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     NotifyExtensionSecureLimitChange: windowId: 1156, isLimite: 1
02-04 20:48:54.223   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:54.223   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:54.223   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:54.223   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:54.294   49744-50514   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 0, id: 1156
02-04 20:48:54.295   49744-50514   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window unfocus
02-04 20:48:54.295   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_INACTIVE
02-04 20:48:54.295   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 1156 lost focus.
02-04 20:48:54.295   49744-49744   C0391D/com.xbx...code/AceMouse  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] VsyncMouseFormat mouseFormat_ and lastVsyncMouseFormat_ = 0 is same.
02-04 20:48:54.295   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionComponent/secure_fieldtrigger onBlurInternal by 1
02-04 20:48:54.295   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Blur Internal.
02-04 20:48:54.295   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1277493251 to clear the focus state, componentId=109.
02-04 20:48:54.295   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] unfocused state notified to uiextension, persistentid = 1277493251, componentId=109.
02-04 20:48:54.295   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1277493251 to clear the focus state, componentId=109.
02-04 20:48:54.297   49744-50514   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 1156, isHighlight: 0,
02-04 20:48:54.297   49744-50514   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window unactive
02-04 20:48:54.297   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_INACTIVE
02-04 20:48:55.281   49744-52519   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     11:RecordSymbolAndBacktrace:397 Process:com.xbxyftx.HMVScode,Tid:52217,Qos:2,CWorker:2,EWorker:1,SWorker:1,TaskType:2,timeout:1s
02-04 20:48:55.283   49744-52519   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     12:RecordSymbolAndBacktrace:405 Tid:52217, Name:OS_FFRT_2_3
                                                                                               #00 pc 00000000001d94f0 /lib/ld-musl-aarch64.so.1
                                                                                               #01 pc 00000000000d57e0 /system/lib64/libc++.so
                                                                                               #02 pc 0000000000023d04 /system/lib64/module/file/libpicker.z.so
                                                                                               #03 pc 0000000000077a0c /system/lib64/platformsdk/libace_napi.z.so
                                                                                               #04 pc 0000000000013b0c /system/lib64/platformsdk/libuv.so
                                                                                               #05 pc 00000000000b2d6c /system/lib64/ndk/libffrt.so
                                                                                               #06 pc 00000000000b2bc4 /system/lib64/ndk/libffrt.so
                                                                                               #07 pc 00000000000aecb0 /system/lib64/ndk/libffrt.so
                                                                                               #08 pc 00000000000627ac /system/lib64/ndk/libffrt.so
                                                                                               #09 pc 0000000000062a14 /system/lib64/ndk/libffrt.so
                                                                                               #10 pc 0000000000062634 /system/lib64/ndk/libffrt.so
                                                                                               #11 pc 0000000000062324 /system/lib64/ndk/libffrt.so
                                                                                               #12 pc 00000000001d1658 /lib/ld-musl-aarch64.so.1
02-04 20:48:59.283   49744-52519   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     13:RecordSymbolAndBacktrace:397 Process:com.xbxyftx.HMVScode,Tid:52217,Qos:2,CWorker:2,EWorker:1,SWorker:0,TaskType:2,timeout:5s
02-04 20:48:59.287   49744-52519   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     14:RecordSymbolAndBacktrace:405 Tid:52217, Name:OS_FFRT_2_3
                                                                                               #00 pc 00000000001d94f0 /lib/ld-musl-aarch64.so.1
                                                                                               #01 pc 00000000000d57e0 /system/lib64/libc++.so
                                                                                               #02 pc 0000000000023d04 /system/lib64/module/file/libpicker.z.so
                                                                                               #03 pc 0000000000077a0c /system/lib64/platformsdk/libace_napi.z.so
                                                                                               #04 pc 0000000000013b0c /system/lib64/platformsdk/libuv.so
                                                                                               #05 pc 00000000000b2d6c /system/lib64/ndk/libffrt.so
                                                                                               #06 pc 00000000000b2bc4 /system/lib64/ndk/libffrt.so
                                                                                               #07 pc 00000000000aecb0 /system/lib64/ndk/libffrt.so
                                                                                               #08 pc 00000000000627ac /system/lib64/ndk/libffrt.so
                                                                                               #09 pc 0000000000062a14 /system/lib64/ndk/libffrt.so
                                                                                               #10 pc 0000000000062634 /system/lib64/ndk/libffrt.so
                                                                                               #11 pc 0000000000062324 /system/lib64/ndk/libffrt.so
                                                                                               #12 pc 00000000001d1658 /lib/ld-musl-aarch64.so.1
02-04 20:48:59.589   49744-50514   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  W     [ui_ability_thread434]null abilityHandler_ or requestCode is -1
02-04 20:48:59.590   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1547][ID: 1] OnResult the state is changing from 'FOREGROUND' to 'DESTRUCTION'.
02-04 20:48:59.590   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnResultForModal:59)][picker] OnResultForModal enter. resultCode is 0,
02-04 20:48:59.591   49744-50557   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Background: Background ExtensionSession, id: 1277493251, state: 3
02-04 20:48:59.591   49744-50514   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     NotifyExtensionSecureLimitChange: windowId: 1156, isLimite: 0
02-04 20:48:59.591   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:59.591   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:59.591   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:59.591   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:59.591   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2275][ID: 1] UEC UpdatWMSUIExtProperty state=DESTRUCTION.
02-04 20:48:59.596   49744-50514   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Disconnect: [id: 1277493251] Disconnect session, state: 5
02-04 20:48:59.596   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:59.596   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:59.596   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:48:59.596   49744-50595   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:48:59.596   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@790][ID: 1] The session is disconnected and the current state is 'DESTRUCTION'.
02-04 20:48:59.596   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1489][ID: 1] OnRelease the state is changing from 'DESTRUCTION' to 'DESTRUCTION' and releaseCode = 0.
02-04 20:48:59.596   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnRelease:36)][picker] OnRelease enter. release code is 0
02-04 20:48:59.596   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: close modal page, sessionId=1277493251
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1021][ID: 1] OnReleaseDone, persistentid = 1277493251, componentId=109.
02-04 20:48:59.597   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] The sessionId 1277493251 does not exist
02-04 20:48:59.597   49744-49744   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-04 20:48:59.597   49744-49744   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-04 20:48:59.597   49744-50595   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Destroy session done with persistentId: 1277493251
02-04 20:48:59.597   49744-50595   C01336/com.xbx....HMVScode/AMS  com.xbxyftx.HMVScode  I     [AMC459]name:  , persistentId: 1277493251
02-04 20:48:59.597   49744-49744   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ModalPage node remove from parent node
02-04 20:48:59.597   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: ModalPage/110 close
02-04 20:48:59.597   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] View: ModalPage/110 lost focus
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@306][ID: 1] OnDetachContext instanceId: 100000, isMoving: 0, isOnDetachContext: 0.
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionManager unregister listener
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@347][ID: 1] UnRegisterUIExtensionManagerEvent
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1010][ID: 1] UnRegisterPipelineEvent
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1825][ID: 1] HandleVisibleAreaChange visible: 0, curVisible: 1, ratio: 0.000000, displayArea: RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1656][ID: 1] The component is changing from 'visible' to 'invisible'.
02-04 20:48:59.597   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@205][ID: 1] OnDetachFromMainTree, isMoving: 0
02-04 20:48:59.598   49744-49744   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ResetRootNode -1277493251.
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Destory UIExtensionNode
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1010][ID: 1] UnRegisterPipelineEvent
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@100][ID: 1] The modal UIExtension is destroyed.
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@133][ID: 1] LogoutModalUIExtension sessionId 0.
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1473][ID: 1] ModalOnDestroy the current state is 'DESTRUCTION'.
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: close modal page, sessionId=1277493251
02-04 20:48:59.599   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnDestroy:81)][picker] OnDestroy enter.
02-04 20:48:59.599   49744-49744   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] [@1876][ID: 1] UIExtension pattern instanceId 100000 not equal frame node instanceId -1
02-04 20:48:59.599   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionSurface: OnDetachFromFrameNode
02-04 20:48:59.599   49744-49744   C02C02/PARAM                    com.xbxyftx.HMVScode  W     Selinux check name resourceschedule.memmgr.dma.reclaimable in u:object_r:resourceschedule_writeable_param:s0 [585 0 0] failed
02-04 20:48:59.599   49744-49744   C02C02/PARAM                    com.xbxyftx.HMVScode  W     deny access resourceschedule.memmgr.dma.reclaimable label 29480 66
02-04 20:48:59.599   49744-49744   C02C02/PARAM                    com.xbxyftx.HMVScode  W     SystemReadParam failed!name is:resourceschedule.memmgr.dma.reclaimable,err:1002
02-04 20:48:59.599   49744-49744   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::~RSSurfaceNode, Node: 218029719814145, Name: com.huawei.hmos.filemanagerFilePickerUIExtAbility
02-04 20:48:59.599   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] The sessionId 1277493251 does not exist
02-04 20:48:59.602   49744-50514   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 1, id: 1156
02-04 20:48:59.602   49744-52211   C03924/com.xbx...Accessibility  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] send accessibility componentType:ModalPage event:134217728 accessibilityId:103
02-04 20:48:59.603   49744-50514   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window focus
02-04 20:48:59.603   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-04 20:48:59.603   49744-50514   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: timeStamp:1770209339598, highlightId:1156, isHighlight:1, isSyncNotify:1, current:1770209269651, new:1770209339598
02-04 20:48:59.603   49744-50514   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 1156, isHighlight: 1,
02-04 20:48:59.603   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 1156 get focus.
02-04 20:48:59.603   49744-50514   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window active
02-04 20:48:59.603   49744-49744   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-04 20:48:59.606   49744-49744   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WinFocusMove end, NULL/secure_field onBlur, Stack/secure_field onFocus, start: 1, end: 1, update: 2
02-04 20:48:59.606   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (Stack/26). isDynamic: 0
02-04 20:48:59.606   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Trigger Window Focus Callback
02-04 20:48:59.606   49744-49744   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] need keyboard : 0.
02-04 20:48:59.606   49744-49744   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     id: 1156, isNeedKeyboard: 0, keepKeyboardFlag: 0
02-04 20:48:59.606   49744-49744   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     RequestInputMethodCloseKeyboard: Notify InputMethod framework close keyboard start.
02-04 20:48:59.674   49744-52217   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerExecute:73)][picker]: StartModalPickerExecute is ready.
02-04 20:48:59.675   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerAsyncCallbackComplete:242)][picker]: StartModalPickerAsyncCallbackComplete begin.
02-04 20:48:59.675   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(MakeResultWithPickerCallBack:222)][picker]: resCode is 0.
02-04 20:48:59.675   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(MakeResultWithArr:88)][picker]: ability.params.stream size. 1 
02-04 20:48:59.675   49744-49744   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_napi_utils.cpp(InvokeJSAsyncMethod:48)][picker]: InvokeJSAsyncMethod begin.
02-04 20:48:59.676   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] document select selectResult: : errorcode is = 0, selecturi is = file://docs/storage/Users/currentUser/******e
02-04 20:48:59.676   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Selected folder URI: file://docs/storage/Users/currentUser/HMVScode
02-04 20:48:59.676   49744-52217   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  I     [PersistPermission:347] PersistPermission pathPolicies size: 1
02-04 20:48:59.677   49744-52217   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  E     [ErrorCodeConversion:93] The app does not have the authorization URI permission
02-04 20:48:59.678   49744-49744   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-04 20:48:59.678   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  W     [Index] Failed to persist permission: 201 Permission verification failed
02-04 20:48:59.678   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Loading selected folder: file://docs/storage/Users/currentUser/HMVScode
02-04 20:48:59.678   49744-52217   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  I     [ActivatePermission:426] ActivatePermission pathPolicies size: 1
02-04 20:48:59.679   49744-52217   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  E     [ErrorCodeConversion:93] The app does not have the authorization URI permission
02-04 20:48:59.679   49744-49744   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-04 20:48:59.679   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  W     [Index] Failed to activate permission: 201 Permission verification failed
02-04 20:48:59.679   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Workspace root set to: file://docs/storage/Users/currentUser/HMVScode
02-04 20:48:59.679   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] loadDirectory called, targetPath: file://docs/storage/Users/currentUser/HMVScode
02-04 20:48:59.679   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] currentPath: file://docs/storage/Users/currentUser/HMVScode
02-04 20:48:59.679   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFiles called with path: file://docs/storage/Users/currentUser/HMVScode
02-04 20:48:59.679   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] isUri: true
02-04 20:48:59.679   49744-52217   C04388/com.xbx...code/file_api  com.xbxyftx.HMVScode  E     [listfile.cpp:275->FilterFileRes] Failed to scan dir
02-04 20:48:59.680   49744-49744   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-04 20:48:59.680   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  E     [FileService] listFiles error: {"code":13900002}
02-04 20:48:59.680   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  E     [FileTreeViewModel] Failed to load directory: {"name":"FileServiceError","code":"LIST_ERROR"}
02-04 20:48:59.680   49744-49744   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Folder loaded successfully, file count: 0
02-04 20:48:59.858   49744-50514   C057C2/com.xbx...PCObjectProxy  com.xbxyftx.HMVScode  I     hd:27 ct:1
02-04 20:48:59.859   49744-50514   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     ~ExtensionSession: id=1277493251
```

上面这一坨是我执行一次打开文件夹选择文件后的日志。接下来我会用这些日志来分析问题。

![27](HarmonyVScode/27.webp)

额，果然，鸿蒙文件系统的相关资料还是太少了，对于这个路径的写法很容易直接套用其他操作系统的导致这种问题发生。

```log
02-04 20:58:33.538   64993-1183    C02D10/com.xbx...RemoteService  com.xbxyftx.HMVScode  I     GetHiViewRemoteService: refresh remote service instance.
02-04 20:58:33.543   64993-64993   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [gc] IdleGCTrigger: trigger full gc
02-04 20:58:36.426   64993-64993   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: down: 172290
02-04 20:58:36.426   64993-64993   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:D:172290][OnPointerEvent:649] recv
02-04 20:58:36.426   64993-64993   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:12,InputId:172290,wid:1173,ac:2
02-04 20:58:36.427   64993-64993   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:172290, fId:0, T:0, I=0, M=0
02-04 20:58:36.428   64993-64993   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:172290, TTHNI:fId: 0{ T: page, D: 6 };{ T: Scroll, D: 12 };
02-04 20:58:36.428   64993-64993   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:172290, TTHRTI: T ClickRecognizer info: { T: Scroll }; { T: Row };T PanRecognizer info: { T: Scroll };
02-04 20:58:36.429   64993-64993   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:172290, last id:172288
02-04 20:58:36.429   64993-64993   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:172290,wid:1173,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-04 20:58:36.429   64993-64993   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move: 172291
02-04 20:58:36.499   64993-64993   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move, first: 172292-(2026-02-04 20:58:36.433ms), 172302, count: 11, last: ac: up: 172303
02-04 20:58:36.499   64993-64993   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:U:172303][OnPointerEvent:649] recv
02-04 20:58:36.499   64993-64993   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:13,InputId:172303,wid:1173,ac:4
02-04 20:58:36.500   64993-64993   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:172303, fId:0, T:1, I=0, M=0
02-04 20:58:36.500   64993-64993   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-04 20:58:36.500   64993-64993   C0390B/com.xbx...AceScrollable  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Scrollable GestureJudge:0, 0
02-04 20:58:36.500   64993-64993   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click gesture judge reject
02-04 20:58:36.500   64993-64993   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-04 20:58:36.500   64993-64993   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] CLK RACC, T: Row
02-04 20:58:36.501   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] ParseWindow: not window mode.
02-04 20:58:36.501   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Opening folder picker...
02-04 20:58:36.501   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] parseDocumentPickerSelectOption start
02-04 20:58:36.501   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] parseDocumentPickerSelectOption end
02-04 20:58:36.501   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] modalPicker start 
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPicker:499)][picker]: StartModalPicker begin.
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(ParseArgsStartModalPicker:480)][picker]: ParseArgsStartModalPicker begin.
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(AsyncContextSetStaticObjectInfo:444)][picker]: AsyncContextSetStaticObjectInfo begin.
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:389)][picker]: StartPickerExtension begin.
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:395)][picker] Will get uiContent by context.
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:414)][picker]: SetParam end, udkey = 
02-04 20:58:36.501   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:428)][picker]: will CreateModalUIExtension by extType: filePicker, pickerType: select
02-04 20:58:36.501   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@95][ID: 1] The modal UIExtension is created.
02-04 20:58:36.501   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Create UIExtensionNode
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@979][ID: 1] RegisterPipelineEvent
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@931][ID: 1] OnAttachToFrameNode
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@454][ID: 1] The current state is 'NONE' when UpdateWant, needCheck: '0'.
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@481][ID: 1] The ability KeyAsync 0, uIExtensionUsage: 0.
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@645][ID: 1] The session is created with bundle=, ability=, componentId=126.
02-04 20:58:36.502   64993-64993   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 1173
02-04 20:58:36.502   64993-64993   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 1173 enable 1
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@688][ID: 1] Want param isNotifyOccupiedAreaChange is 1, realHostWindowId: 1173, parentWindowType: 1
02-04 20:58:36.502   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     GeneratePersistentId: persistentId: 0, persistentId_: 1339953155
02-04 20:58:36.502   64993-65235   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     persistentId: 1339953155, bundleName: , moduleName: , abilityName: , isDensityFollowHost_: 0, density_: 1.800000
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@868][ID: 1] The state is changing from 'NONE' to 'FOREGROUND'.
02-04 20:58:36.502   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@980][ID: 1] NotifyForeground, persistentid = 1339953155, hostWindowId = 1173, windowSceneId = -1, IsSceneBoardWindow: 0, componentId=126.
02-04 20:58:36.502   64993-64993   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 1173
02-04 20:58:36.502   64993-64993   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 1173 enable 1
02-04 20:58:36.502   64993-65235   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Activate session, id=1339953155
02-04 20:58:36.503   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@223][ID: 1] OnAttachContext newInstanceId: 100000, oldInstanceId: 100000, isMoving: 0, detachContextHappened: 0.
02-04 20:58:36.503   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@185][ID: 1] OnAttachToMainTree, isMoving: 0
02-04 20:58:36.503   64993-64993   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] modalNode->GetParent() 3 mark IsProhibitedAddChildNode when sessionId -1339953155,prohibitedRemoveByRouter: 0, isAllowAddChildBelowModalUec: 0.
02-04 20:58:36.503   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: ModalPage/127 show
02-04 20:58:36.503   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] View: page/23 lost focus
02-04 20:58:36.503   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Scope(Stack/26) has no last focusNode.
02-04 20:58:36.503   64993-64993   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-04 20:58:36.503   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: create modal page, sessionId=1339953155, isProhibitBack=0, isAsyncModalBinding=0, isAllowedBeCovered=0, prohibitedRemoveByRouter=0, isAllowAddChildBelowModalUec=0, prohibitedRemoveByNavigation=1
02-04 20:58:36.503   64993-1183    C03924/com.xbx...Accessibility  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] send accessibility componentType:ModalPage event:536870912 accessibilityId:120
02-04 20:58:36.503   64993-1183    C03924/com.xbx...Accessibility  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] send accessibility componentType:Row event:1 accessibilityId:50
02-04 20:58:36.503   64993-64993   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:172303, last id:172302
02-04 20:58:36.503   64993-64993   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:172303,wid:1173,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-04 20:58:36.504   64993-1488    C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerExecute:60)][picker]: StartModalPickerExecute begin
02-04 20:58:36.509   64993-65235   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Activate ret:0, persistentId:1339953155
02-04 20:58:36.509   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1258][ID: 1] NotifyDisplayArea displayArea=RectT (0.00, 0.00) - [2800.00 x 1840.00], curWindow=Rect (0.00, 0.00) - [2800.00 x 1840.00], reason=0, duration=0, persistentId=1339953155, componentId=126.
02-04 20:58:36.509   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Request focus on focusView: ModalPage/127.
02-04 20:58:36.509   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FocusSwitch end, Stack/secure_field onBlur, ModalPage/secure_field onFocus, start: 2, end: 1, update: 2
02-04 20:58:36.509   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (ModalPage/127). isDynamic: 0
02-04 20:58:36.509   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FrameNode(ModalPage/127) notNeedSoftKeyboard.
02-04 20:58:36.839   64993-65171   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::Unmarshalling, Node: 2675764625409, Name: com.huawei.hmos.filemanagerFilePickerUIExtAbility
02-04 20:58:36.840   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ConnectInner: [id: 1339953155] state: 0,isTerminating:0, callingPid:623, disableDelegator:0
02-04 20:58:36.840   64993-65235   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     InitSessionPropertyWhenConnect: [id: 1339953155] requestedOrientation: 0, defaultRequestedOrientation: 0, userRequestedOrientation: 0
02-04 20:58:36.840   64993-65235   C0420C/com.xbx...code/WMSEvent  com.xbxyftx.HMVScode  I     SetCallingPid: id:1339953155, 623
02-04 20:58:36.840   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:36.840   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:36.840   64993-65235   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  E     GetScreenSession: Error found screen session with id: 18446744073709551615
02-04 20:58:36.840   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ConnectInner: set session id 1339953155 disableDelegator 0
02-04 20:58:36.840   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@575][ID: 1] The session is connected and the current state is 'FOREGROUND'.
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1455][ID: 1] OnRemoteReady the current state is 'FOREGROUND'.
02-04 20:58:36.841   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionComponent/secure_field RequestFocusImmediately isOnMainTree:1
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] focused state notified to uiextension, persistentid = 1339953155, componentId=126.
02-04 20:58:36.841   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FocusSwitch end, ModalPage/secure_field onBlur, UIExtensionComponent/secure_field onFocus, start: 2, end: 1, update: 2
02-04 20:58:36.841   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (UIExtensionComponent/126). isDynamic: 0
02-04 20:58:36.841   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtension(UIExtensionComponent/126) not need process.
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] focused state notified to uiextension, persistentid = 1339953155, componentId=126.
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionManager register listener
02-04 20:58:36.841   64993-64993   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 1173
02-04 20:58:36.841   64993-64993   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 1173 enable 1
02-04 20:58:36.841   64993-64993   C0395F/com.xbx...amicComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Create UIExtensionAccessibilityChildTreeCallback
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1703][ID: 1] treeId: 0, id: 119
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1697][ID: 1] UIExtension: 119 register child tree, realHostWindowId: 1173
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=1002.
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=1001.
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=3002.
02-04 20:58:36.841   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2184][ID: 1] NotifyHostWindowMode: instanceId = 100000, followStrategy = 0, mode = 1
02-04 20:58:36.842   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionSurface: isDisappearing = 0, paintRect = RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-04 20:58:36.842   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1258][ID: 1] NotifyDisplayArea displayArea=RectT (0.00, 0.00) - [2800.00 x 1840.00], curWindow=Rect (0.00, 0.00) - [2800.00 x 1840.00], reason=0, duration=0, persistentId=1339953155, componentId=126.
02-04 20:58:36.842   64993-64993   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  E     GetScreenSession: Error found screen session with id: 18446744073709551615
02-04 20:58:36.842   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1339953155 to clear the focus state, componentId=126.
02-04 20:58:36.842   64993-64993   C01402/com.xbx...VScode/RSNode  com.xbxyftx.HMVScode  I     RSNode::AddChild, Id: 279142809469032, SurfaceNode:[Id: 2675764625409, name: com.huawei.hmos.filemanagerFilePickerUIExtAbility]
02-04 20:58:36.842   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1825][ID: 1] HandleVisibleAreaChange visible: 1, curVisible: 0, ratio: 1.000000, displayArea: RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-04 20:58:36.842   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1656][ID: 1] The component is changing from 'visible' to 'visible'.
02-04 20:58:36.849   64993-65171   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Foreground: [id: 1339953155] state:1, isTerminating:0
02-04 20:58:36.849   64993-65171   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     SetActive: new active:1, id:1339953155, state:2
02-04 20:58:36.850   64993-65194   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     NotifyExtensionSecureLimitChange: windowId: 1173, isLimite: 1
02-04 20:58:36.850   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:36.850   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:36.850   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:36.850   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:36.935   64993-65194   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 0, id: 1173
02-04 20:58:36.935   64993-65194   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window unfocus
02-04 20:58:36.935   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_INACTIVE
02-04 20:58:36.935   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 1173 lost focus.
02-04 20:58:36.935   64993-64993   C0391D/com.xbx...code/AceMouse  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] VsyncMouseFormat mouseFormat_ and lastVsyncMouseFormat_ = 0 is same.
02-04 20:58:36.935   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionComponent/secure_fieldtrigger onBlurInternal by 1
02-04 20:58:36.935   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Blur Internal.
02-04 20:58:36.935   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1339953155 to clear the focus state, componentId=126.
02-04 20:58:36.935   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] unfocused state notified to uiextension, persistentid = 1339953155, componentId=126.
02-04 20:58:36.935   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1339953155 to clear the focus state, componentId=126.
02-04 20:58:36.938   64993-65194   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 1173, isHighlight: 0,
02-04 20:58:36.938   64993-65194   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window unactive
02-04 20:58:36.938   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_INACTIVE
02-04 20:58:37.536   64993-1392    C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     7:RecordSymbolAndBacktrace:397 Process:com.xbxyftx.HMVScode,Tid:1488,Qos:2,CWorker:2,EWorker:1,SWorker:1,TaskType:2,timeout:1s
02-04 20:58:37.537   64993-1392    C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     8:RecordSymbolAndBacktrace:405 Tid:1488, Name:OS_FFRT_2_4
                                                                                               #00 pc 00000000001d94f0 /lib/ld-musl-aarch64.so.1
                                                                                               #01 pc 00000000000d57e0 /system/lib64/libc++.so
                                                                                               #02 pc 0000000000023d04 /system/lib64/module/file/libpicker.z.so
                                                                                               #03 pc 0000000000077a0c /system/lib64/platformsdk/libace_napi.z.so
                                                                                               #04 pc 0000000000013b0c /system/lib64/platformsdk/libuv.so
                                                                                               #05 pc 00000000000b2d6c /system/lib64/ndk/libffrt.so
                                                                                               #06 pc 00000000000b2bc4 /system/lib64/ndk/libffrt.so
                                                                                               #07 pc 00000000000aecb0 /system/lib64/ndk/libffrt.so
                                                                                               #08 pc 00000000000627ac /system/lib64/ndk/libffrt.so
                                                                                               #09 pc 0000000000062a14 /system/lib64/ndk/libffrt.so
                                                                                               #10 pc 0000000000062634 /system/lib64/ndk/libffrt.so
                                                                                               #11 pc 0000000000062324 /system/lib64/ndk/libffrt.so
                                                                                               #12 pc 00000000001d1658 /lib/ld-musl-aarch64.so.1
02-04 20:58:41.539   64993-1392    C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     9:RecordSymbolAndBacktrace:397 Process:com.xbxyftx.HMVScode,Tid:1488,Qos:2,CWorker:2,EWorker:1,SWorker:0,TaskType:2,timeout:5s
02-04 20:58:41.540   64993-1392    C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     10:RecordSymbolAndBacktrace:405 Tid:1488, Name:OS_FFRT_2_4
                                                                                               #00 pc 00000000001d94f0 /lib/ld-musl-aarch64.so.1
                                                                                               #01 pc 00000000000d57e0 /system/lib64/libc++.so
                                                                                               #02 pc 0000000000023d04 /system/lib64/module/file/libpicker.z.so
                                                                                               #03 pc 0000000000077a0c /system/lib64/platformsdk/libace_napi.z.so
                                                                                               #04 pc 0000000000013b0c /system/lib64/platformsdk/libuv.so
                                                                                               #05 pc 00000000000b2d6c /system/lib64/ndk/libffrt.so
                                                                                               #06 pc 00000000000b2bc4 /system/lib64/ndk/libffrt.so
                                                                                               #07 pc 00000000000aecb0 /system/lib64/ndk/libffrt.so
                                                                                               #08 pc 00000000000627ac /system/lib64/ndk/libffrt.so
                                                                                               #09 pc 0000000000062a14 /system/lib64/ndk/libffrt.so
                                                                                               #10 pc 0000000000062634 /system/lib64/ndk/libffrt.so
                                                                                               #11 pc 0000000000062324 /system/lib64/ndk/libffrt.so
                                                                                               #12 pc 00000000001d1658 /lib/ld-musl-aarch64.so.1
02-04 20:58:43.141   64993-65194   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  W     [ui_ability_thread434]null abilityHandler_ or requestCode is -1
02-04 20:58:43.141   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1547][ID: 1] OnResult the state is changing from 'FOREGROUND' to 'DESTRUCTION'.
02-04 20:58:43.141   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnResultForModal:59)][picker] OnResultForModal enter. resultCode is 0,
02-04 20:58:43.142   64993-65171   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Background: Background ExtensionSession, id: 1339953155, state: 3
02-04 20:58:43.142   64993-65194   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     NotifyExtensionSecureLimitChange: windowId: 1173, isLimite: 0
02-04 20:58:43.142   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:43.142   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:43.142   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2275][ID: 1] UEC UpdatWMSUIExtProperty state=DESTRUCTION.
02-04 20:58:43.142   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:43.142   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:43.148   64993-65194   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Disconnect: [id: 1339953155] Disconnect session, state: 5
02-04 20:58:43.148   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:43.148   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:43.148   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-04 20:58:43.148   64993-65235   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-04 20:58:43.148   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@790][ID: 1] The session is disconnected and the current state is 'DESTRUCTION'.
02-04 20:58:43.148   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1489][ID: 1] OnRelease the state is changing from 'DESTRUCTION' to 'DESTRUCTION' and releaseCode = 0.
02-04 20:58:43.148   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnRelease:36)][picker] OnRelease enter. release code is 0
02-04 20:58:43.148   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: close modal page, sessionId=1339953155
02-04 20:58:43.148   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1021][ID: 1] OnReleaseDone, persistentid = 1339953155, componentId=126.
02-04 20:58:43.149   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] The sessionId 1339953155 does not exist
02-04 20:58:43.149   64993-65235   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Destroy session done with persistentId: 1339953155
02-04 20:58:43.149   64993-64993   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-04 20:58:43.149   64993-64993   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-04 20:58:43.149   64993-65235   C01336/com.xbx....HMVScode/AMS  com.xbxyftx.HMVScode  I     [AMC459]name:  , persistentId: 1339953155
02-04 20:58:43.149   64993-64993   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ModalPage node remove from parent node
02-04 20:58:43.149   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: ModalPage/127 close
02-04 20:58:43.149   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] View: ModalPage/127 lost focus
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@306][ID: 1] OnDetachContext instanceId: 100000, isMoving: 0, isOnDetachContext: 0.
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionManager unregister listener
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@347][ID: 1] UnRegisterUIExtensionManagerEvent
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1010][ID: 1] UnRegisterPipelineEvent
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1825][ID: 1] HandleVisibleAreaChange visible: 0, curVisible: 1, ratio: 0.000000, displayArea: RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1656][ID: 1] The component is changing from 'visible' to 'invisible'.
02-04 20:58:43.149   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@205][ID: 1] OnDetachFromMainTree, isMoving: 0
02-04 20:58:43.149   64993-1383    C03924/com.xbx...Accessibility  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] send accessibility componentType:ModalPage event:134217728 accessibilityId:120
02-04 20:58:43.149   64993-64993   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ResetRootNode -1339953155.
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Destory UIExtensionNode
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1010][ID: 1] UnRegisterPipelineEvent
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@100][ID: 1] The modal UIExtension is destroyed.
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@133][ID: 1] LogoutModalUIExtension sessionId 0.
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1473][ID: 1] ModalOnDestroy the current state is 'DESTRUCTION'.
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: close modal page, sessionId=1339953155
02-04 20:58:43.151   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnDestroy:81)][picker] OnDestroy enter.
02-04 20:58:43.151   64993-64993   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] [@1876][ID: 1] UIExtension pattern instanceId 100000 not equal frame node instanceId -1
02-04 20:58:43.151   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionSurface: OnDetachFromFrameNode
02-04 20:58:43.151   64993-64993   C02C02/PARAM                    com.xbxyftx.HMVScode  W     Selinux check name resourceschedule.memmgr.dma.reclaimable in u:object_r:resourceschedule_writeable_param:s0 [585 0 0] failed
02-04 20:58:43.151   64993-64993   C02C02/PARAM                    com.xbxyftx.HMVScode  W     deny access resourceschedule.memmgr.dma.reclaimable label 29480 66
02-04 20:58:43.151   64993-64993   C02C02/PARAM                    com.xbxyftx.HMVScode  W     SystemReadParam failed!name is:resourceschedule.memmgr.dma.reclaimable,err:1002
02-04 20:58:43.151   64993-64993   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::~RSSurfaceNode, Node: 2675764625409, Name: com.huawei.hmos.filemanagerFilePickerUIExtAbility
02-04 20:58:43.151   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] The sessionId 1339953155 does not exist
02-04 20:58:43.153   64993-65194   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 1, id: 1173
02-04 20:58:43.154   64993-65194   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window focus
02-04 20:58:43.155   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-04 20:58:43.155   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 1173 get focus.
02-04 20:58:43.155   64993-65194   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: timeStamp:1770209923149, highlightId:1173, isHighlight:1, isSyncNotify:1, current:1770209890151, new:1770209923149
02-04 20:58:43.155   64993-65194   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 1173, isHighlight: 1,
02-04 20:58:43.155   64993-65194   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window active
02-04 20:58:43.155   64993-64993   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-04 20:58:43.158   64993-64993   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WinFocusMove end, NULL/secure_field onBlur, Stack/secure_field onFocus, start: 1, end: 1, update: 2
02-04 20:58:43.158   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (Stack/26). isDynamic: 0
02-04 20:58:43.158   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Trigger Window Focus Callback
02-04 20:58:43.158   64993-64993   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] need keyboard : 0.
02-04 20:58:43.158   64993-64993   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     id: 1173, isNeedKeyboard: 0, keepKeyboardFlag: 0
02-04 20:58:43.158   64993-64993   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     RequestInputMethodCloseKeyboard: Notify InputMethod framework close keyboard start.
02-04 20:58:43.218   64993-1488    C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerExecute:73)][picker]: StartModalPickerExecute is ready.
02-04 20:58:43.218   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerAsyncCallbackComplete:242)][picker]: StartModalPickerAsyncCallbackComplete begin.
02-04 20:58:43.218   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(MakeResultWithPickerCallBack:222)][picker]: resCode is 0.
02-04 20:58:43.218   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(MakeResultWithArr:88)][picker]: ability.params.stream size. 1 
02-04 20:58:43.218   64993-64993   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_napi_utils.cpp(InvokeJSAsyncMethod:48)][picker]: InvokeJSAsyncMethod begin.
02-04 20:58:43.218   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] document select selectResult: : errorcode is = 0, selecturi is = file://docs/storage/Users/currentUser/******e
02-04 20:58:43.218   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Selected folder URI: file://docs/storage/Users/currentUser/HMVScode
02-04 20:58:43.219   64993-1488    C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  I     [PersistPermission:347] PersistPermission pathPolicies size: 1
02-04 20:58:43.220   64993-1488    C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  E     [ErrorCodeConversion:93] The app does not have the authorization URI permission
02-04 20:58:43.220   64993-64993   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-04 20:58:43.220   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  W     [Index] Failed to persist permission: 201 Permission verification failed
02-04 20:58:43.220   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Loading selected folder: file://docs/storage/Users/currentUser/HMVScode
02-04 20:58:43.221   64993-1488    C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  I     [ActivatePermission:426] ActivatePermission pathPolicies size: 1
02-04 20:58:43.221   64993-1488    C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  E     [ErrorCodeConversion:93] The app does not have the authorization URI permission
02-04 20:58:43.221   64993-64993   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-04 20:58:43.221   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  W     [Index] Failed to activate permission: 201 Permission verification failed
02-04 20:58:43.221   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Workspace root set to: file://docs/storage/Users/currentUser/HMVScode
02-04 20:58:43.222   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] loadDirectory called, targetPath: file://docs/storage/Users/currentUser/HMVScode
02-04 20:58:43.222   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] currentPath: file://docs/storage/Users/currentUser/HMVScode
02-04 20:58:43.222   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFiles called with path: file://docs/storage/Users/currentUser/HMVScode
02-04 20:58:43.222   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] isUri: true
02-04 20:58:43.222   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] actualPath after conversion: /storage/Users/currentUser/HMVScode
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFile returned 1 items
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Processing file: md.md
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Added file: md.md type: file
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFiles result count: 1
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] Got files: 1
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] Added file: md.md type: file
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] fileList updated, count: 1
02-04 20:58:43.223   64993-64993   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Folder loaded successfully, file count: 1
02-04 20:58:43.455   64993-65194   C057C2/com.xbx...PCObjectProxy  com.xbxyftx.HMVScode  I     hd:29 ct:1
02-04 20:58:43.455   64993-65194   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     ~ExtensionSession: id=1339953155
02-04 20:58:43.456   64993-65194   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ~Session: id:1339953155
```

这是经过一次修改的日志，可以看到这一次路径的问题被修复了但是UI上依旧没有正确渲染。

![28](HarmonyVScode/28.webp)

<video width="100%" controls>
  <source src="29.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

<video width="100%" controls>
  <source src="30.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

通过上面两个测试视频可以看出当前版本可以正确的渲染当前层架下的全部文件以及文件夹，但是依旧存在严重的问题

1. 子文件夹无法正常展开
2. 文件点击后右侧webView打开的文件仍是默认的test无后缀文件
3. 新建文件夹和新建文件功能无法正常使用

我首先针对于前两个问题进行更多的日志截取。

```log
02-05 13:42:45.937   30099-30099   C02C11/appspawn/APPSPAWN        pid-30099             I     AppSpawnChild id 571 flags:0xc
02-05 13:42:45.937   30099-30099   C02C02/PARAM                    pid-30099             I     ResetParamSecurityLabel Fd:19
02-05 13:42:45.938   30099-30099   C02D33/com.xbx...HitraceOption  pid-30099             I     FilterAppTrace com.xbxyftx.HMVScode 30099
02-05 13:42:45.949   30099-30099   C02C11/com.xbx...code/APPSPAWN  pid-30099             W     errno:2 bind mount /system/data to /mnt/sandbox/100/com.xbxyftx.HMVScode/system/data
02-05 13:42:45.950   30099-30099   C02C11/com.xbx...code/APPSPAWN  pid-30099             I     file /mnt/sandbox/100/com.xbxyftx.HMVScode/data/service/el1/public/hosts_user/hosts already exist
02-05 13:42:45.950   30099-30099   C02C11/com.xbx...code/APPSPAWN  pid-30099             W     errno:2 bind mount /system/etc/hosts to /mnt/sandbox/100/com.xbxyftx.HMVScode/data/service/el1/public/hosts_user/hosts
02-05 13:42:45.950   30099-30099   C02C11/com.xbx...code/APPSPAWN  pid-30099             W     errno:2 bind mount /vendor/lib to /mnt/sandbox/100/com.xbxyftx.HMVScode/vendor/lib
02-05 13:42:45.952   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /data/app/el1/public/aot_compiler/ark_cache/com.xbxyftx.HMVScode to /mnt/sandbox/100/com.xbxyftx.HMVScode/data/storage/ark-cache
02-05 13:42:45.952   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     check dir /data/app/el1/public/aot_compiler/ark_cache/com.xbxyftx.HMVScode failed,strerror:No such file or directory
02-05 13:42:45.954   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:13 private mount to /mnt/sandbox/100/com.xbxyftx.HMVScode/data/service/el0/public/for-all-app '524288' failed
02-05 13:42:45.955   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /chip_prod/etc/passthrough to /mnt/sandbox/100/com.xbxyftx.HMVScode/chip_prod/etc/passthrough
02-05 13:42:45.955   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:13 private mount to /mnt/sandbox/100/com.xbxyftx.HMVScode/vendor/etc/vulkan '524288' failed
02-05 13:42:45.959   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /vendor/etc/silk to /mnt/sandbox/100/com.xbxyftx.HMVScode/vendor/etc/silk
02-05 13:42:45.960   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /system/asan/lib64 to /mnt/sandbox/100/com.xbxyftx.HMVScode/system/asan/lib64
02-05 13:42:45.960   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /vendor/asan/lib64 to /mnt/sandbox/100/com.xbxyftx.HMVScode/vendor/asan/lib64
02-05 13:42:45.960   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:13 private mount to /mnt/sandbox/100/com.xbxyftx.HMVScode/chip_prod/lib64/passthrough '524288' failed
02-05 13:42:45.961   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /system/app/ohos.global.systemres to /mnt/sandbox/100/com.xbxyftx.HMVScode/data/global/systemResources
02-05 13:42:45.963   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  W     errno:2 bind mount /data/preload/app to /mnt/sandbox/100/com.xbxyftx.HMVScode/data/preload/app
02-05 13:42:45.968   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  I     path /storage/Users/currentUser/Download/com.xbxyftx.HMVScode mode 0x3
02-05 13:42:45.968   30099-30099   C05A06/com.xbx...ode/CODE_SIGN  com.xbxyftx.HMVScode  E     [XpmIoctl]:Ioctl cmd 40087803 failed: Invalid argument (ignore)
02-05 13:42:45.973   30099-30099   C05A05/com.xbx...EnhanceClient  com.xbxyftx.HMVScode  I     [RegisterCheckCallback]Register secComp: sessionId=582536576, seqNum=******052.
02-05 13:42:45.975   30099-30099   C02D0B/com.xbx...ode/HICHECKER  com.xbxyftx.HMVScode  I     hichecker param is empty.
02-05 13:42:45.976   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     SelectWebcoreBeforeProcessRun: SelectWebcoreBeforeProcessRun for app com.xbxyftx.HMVScode.
02-05 13:42:45.976   30099-30099   C02C11/com.xbx...code/APPSPAWN  com.xbxyftx.HMVScode  I     ClearEnvAndReturnSuccess 4
02-05 13:42:45.976   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [MAINTHD3066]mainthread start, pid:30099
02-05 13:42:45.980   30099-30099   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  I     1:QueueMonitor:46 timeout:30000000 us
02-05 13:42:45.981   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [MAINTHD425]attach
02-05 13:42:45.984   30099-30134   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [MAINTHD819]ScheduleLaunchAbility called, ability EntryAbility, type is 1.
02-05 13:42:45.985   30099-30099   C03900/com.xbx...ACE_UIContent  com.xbxyftx.HMVScode  I     [69]AceForwardCompatibility [com.xbxyftx.HMVScode] force:1 newpipe:1
02-05 13:42:45.986   30099-30139   C02D06/com.xbx...Scode/XCollie  com.xbxyftx.HMVScode  I     Start init Async Stack.
02-05 13:42:45.988   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [MAINTHD1751]SmartGC: process is start. enable warm startup SmartGC: 0
02-05 13:42:45.988   30099-30142   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     2:operator():110 [-1954711160] set priority warn ret[1] eno[0]
02-05 13:42:45.988   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [ecmascript] asmint: 1, aot: 0, jit: 1, baseline jit: 0, bundle name: com.xbxyftx.HMVScode
02-05 13:42:45.989   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [ecmascript] multi-thread check enabled: 0
02-05 13:42:45.989   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [pgo] reset pgo profiler, pgo profiler is disabled
02-05 13:42:45.992   30099-30099   C03301/com.xbx...MVScode/LIBUV  com.xbxyftx.HMVScode  I     init:4528
02-05 13:42:45.992   30099-30099   C03301/com.xbx...MVScode/LIBUV  com.xbxyftx.HMVScode  I     init:4528, backend_fd:26
02-05 13:42:45.992   30099-30099   C03301/com.xbx...MVScode/LIBUV  com.xbxyftx.HMVScode  I     open:4528, pipefd[0]:29
02-05 13:42:45.992   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [ecmascript] can not find aot file
02-05 13:42:45.997   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     StartServer, componentName = <private>
02-05 13:42:45.997   30099-30099   C01321/com.xbx...ode/JsRuntime  com.xbxyftx.HMVScode  W     [CSM162]not Connected
02-05 13:42:45.997   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [ecmascript] JSNApi::NotifyDebugMode, tid = 30099, debugApp = 1, isDebugMode = 0, instanceId = 0
02-05 13:42:45.999   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [compiler] __jit_debug_register_code() is called.
02-05 13:42:45.999   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [compiler] success to register stub.an to debugger.
02-05 13:42:46.000   30099-30099   C01201/com.xbx...eamonIoWaiter  com.xbxyftx.HMVScode  E     MUST initialized before adding fds
02-05 13:42:46.001   30099-30141   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [DRH395]File existed. dir: /data/storage/el2/base/cache/rawheap
02-05 13:42:46.001   30099-30099   C01E00/com.xbx...sourceManager  com.xbxyftx.HMVScode  W     update userId, currentUserId_= 0, userId= 100
02-05 13:42:46.003   30099-30155   C01653/com.xbx...vePreferences  com.xbxyftx.HMVScode  W     LoadFromDisk: The settingXml /***/el1/***/i18*** load failed.
02-05 13:42:46.004   30099-30141   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [DRH375]success to AclSetAccess, path: /data/storage/el2/base/cache/rawheap
02-05 13:42:46.006   30099-30154   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.hdc.jdwp remoteWatcherId 634 success
02-05 13:42:46.006   30099-30154   C02D13/com.xbx...Scode/HDC_LOG  com.xbxyftx.HMVScode  I     AddWatchHdcdJdwp rc:0
02-05 13:42:46.006   30099-30154   C02D13/com.xbx...Scode/HDC_LOG  com.xbxyftx.HMVScode  I     connect success cfd:35
02-05 13:42:46.006   30099-30154   C02D13/com.xbx...Scode/HDC_LOG  com.xbxyftx.HMVScode  I     Send2Jdwp send pid:30099, pp:com.xbxyftx.HMVScode, isDebug:1, msglen:32
02-05 13:42:46.011   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [application_cleaner94]ClearTempData
02-05 13:42:46.014   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [js_ability_stage190]AbilityStage::LoadModule
02-05 13:42:46.014   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [js_ability_stage935]null stage
02-05 13:42:46.014   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [js_ability_stage233]Not found AbilityStage.js
02-05 13:42:46.015   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA348]called
02-05 13:42:46.015   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [ecmascript] start to execute module buffer with secure memory: /data/storage/el1/bundle/entry/ets/entryability/EntryAbility.abc
02-05 13:42:46.015   30099-30144   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [pgo] will save profiler to file /data/storage/ark-profile/rt_entry.ap
02-05 13:42:46.016   30099-30139   C02D06/com.xbx...Scode/XCollie  com.xbxyftx.HMVScode  I     Init async stack successfully.
02-05 13:42:46.016   30099-30139   C02D06/com.xbx...Scode/XCollie  com.xbxyftx.HMVScode  I     Finish init Async Stack.
02-05 13:42:46.017   30099-30099   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  I     [js_environment290]timing: 2
02-05 13:42:46.017   30099-30099   C01320/com.xbx...MVScode/JSENV  com.xbxyftx.HMVScode  I     Callee constructor is OK string
02-05 13:42:46.017   30099-30099   C01320/com.xbx...MVScode/JSENV  com.xbxyftx.HMVScode  I     Ability::constructor callee is object [object Object]
02-05 13:42:46.018   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA393]End
02-05 13:42:46.018   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [ui_ability_thread169]Lifecycle:Attach
02-05 13:42:46.019   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [MAINTHD2710]called
02-05 13:42:46.019   30099-30099   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [gc] app is not inBackground
02-05 13:42:46.021   30099-30136   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [ui_ability_thread317]name:EntryAbility,targeState:5,isNewWant:0
02-05 13:42:46.021   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [ui_ability_thread236]Lifecycle:name EntryAbility
02-05 13:42:46.021   30099-30099   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  I     AddDisplayIdFromAms: abilityToken and display[0] has been added.
02-05 13:42:46.023   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onCreate
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [ohos_application1111]current 2, pre 0
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [ohos_application1140]fontSize empty
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [ohos_application1171]current 2, pre 0
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [ohos_application1175]language empty
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [ohos_application1194]language and locale empty
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [ohos_application287]configuration_: {"0#const.build.characteristics":"tablet","0#input.pointer.device":"true","0#ohos.app.fontSizeScale":"nonFollowSystem","0#ohos.application.densitydpi":"xldpi","0#ohos.application.direction":"horizontal","0#ohos.application.displayid":"0","0#ohos.system.colorMode":"dark","0#ohos.system.colorMode.isSetByApp":"isSetByApp","0#ohos.system.fontSizeScale":"1.0","0#ohos.system.fontWeightScale":"1.000000","0#ohos.system.hour":"true","0#ohos.system.language":"zh-Hans-CN","0#ohos.system.locale":"zh-Hans-CN","0#ohos.system.mcc":"460","0#ohos.system.mnc":"00"}, config: {"0#ohos.system.colorMode":"dark","0#ohos.system.colorMode.isSetByApp":"isSetByApp"}
02-05 13:42:46.023   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  E     UpdateConfigurationSyncForAll: root is null
02-05 13:42:46.023   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onConfigurationUpdated
02-05 13:42:46.023   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onConfigurationUpdated, time: 0
02-05 13:42:46.023   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onConfigurationUpdate
02-05 13:42:46.023   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onConfigurationUpdate, time: 0
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [js_ability_stage822]Not found AbilityStage.js
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [js_ability_stage822]Not found AbilityStage.js
02-05 13:42:46.023   30099-30099   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  I     [ohos_application311]ignoreWindowContext size 0
02-05 13:42:46.023   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  E     UpdateConfigurationForAll: root is null
02-05 13:42:46.023   30099-30099   A00000/com.xbx...Scode/testTag  com.xbxyftx.HMVScode  I     Ability onCreate
02-05 13:42:46.024   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onCreate, time: 1
02-05 13:42:46.024   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  E     [ui_ability_impl305]hasSaveData_: false
02-05 13:42:46.024   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  W     [JUA1088]formatRegex: []
02-05 13:42:46.024   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     Init: WindowScene with window session!
02-05 13:42:46.024   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     Init: set isModuleAbilityHookEnd
02-05 13:42:46.024   30099-30099   C04204/com.xbx...VScode/WMSScb  com.xbxyftx.HMVScode  I     RS multi-instance enabled: 1, deviceType tablet
02-05 13:42:46.029   30099-30156   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [application_cleaner225]obtain file properties failed
02-05 13:42:46.029   30099-30156   C01317/com.xbx...VScode/AppKit  com.xbxyftx.HMVScode  W     [application_cleaner116]path: <private>
02-05 13:42:46.031   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSLogManager init log flag: 0x0(0)
02-05 13:42:46.031   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSFrameRateLinker::Create id: 129274220642304
02-05 13:42:46.031   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     VsyncStation: id 129274220642305 created
02-05 13:42:46.031   30099-30099   C04200/com.xbx...neSessionImpl  com.xbxyftx.HMVScode  I     WindowSceneSessionImpl: [WMSCom] Constructor HMVScode0
02-05 13:42:46.031   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  E     SetWindowType: permission denied!
02-05 13:42:46.031   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Create: Window Create name:HMVScode0, state:0, mode:0
02-05 13:42:46.039   30099-30099   C01201/com.xbx...eamonIoWaiter  com.xbxyftx.HMVScode  E     MUST initialized before adding fds
02-05 13:42:46.039   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Create: SetIsAbilityHookOff 0
02-05 13:42:46.039   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  W     IsWindowSessionInvalid: already destroyed or not created! id: 0 state_: 0
02-05 13:42:46.039   30099-30099   C04200/com.xbx...neSessionImpl  com.xbxyftx.HMVScode  W     AdjustWindowAnimationFlag: session invalid!
02-05 13:42:46.039   30099-30099   C04200/com.xbx...neSessionImpl  com.xbxyftx.HMVScode  I     Remove window flag WINDOW_FLAG_SHOW_WHEN_LOCKED
02-05 13:42:46.039   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Connect: in
02-05 13:42:46.040   30099-30136   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     NotifyAppHookWindowInfoUpdated: in
02-05 13:42:46.041   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     Connect: updateRect when connect.preRect:[0,0,0,0]rect:[0,0,2800,1840]
02-05 13:42:46.041   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Connect: Window Connect [name:HMVScode0, id:226, type:1], ret:0
02-05 13:42:46.041   30099-30099   C04218/com.xbx...MVScode/WMSPc  com.xbxyftx.HMVScode  I     MakeSubOrDialogWindowDragableAndMoveble: Called 226.
02-05 13:42:46.042   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     NotifyWindowStatusChange: id:226, windowMode:1, windowStatus:1, lastWindowStatus:0, skipRedundantWindowStatusNotifications:0
02-05 13:42:46.042   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     SetConfigWindowLimitsVP: id:226, windowLimits:[0 0 0 0 0.000000 0.000000 1.000000 1]
02-05 13:42:46.042   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     GetSystemSizeLimits: px[5184,5184,576,432], vp[2880,2880,320,240], configMax:2880, vpr:1.800000, winType:1
02-05 13:42:46.042   30099-30099   C0421A/com.xbx...e/WMSLayoutPc  com.xbxyftx.HMVScode  I     GetSupportedWindowModesConfiguration: winId: 226, windowModeSupportType: 15
02-05 13:42:46.042   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     GetConfigurationFromAbilityInfo: windowId: 226, windowModeSupportType: 15, isAncoSupportMultiWindow: 1, isAncoInPc:0
02-05 13:42:46.042   30099-30099   C0420F/com.xbx...de/WMSRecover  com.xbxyftx.HMVScode  I     RegisterSessionRecoverCallbackFunc: persistentId=226
02-05 13:42:46.042   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     UpdateDefaultStatusBarColor: win=226, appColor=dark
02-05 13:42:46.042   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     SetSpecificBarProperty: win [226 HMVScode0] type 2108 1 ffffff ffffffff 0 4
02-05 13:42:46.042   30099-30136   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     SetAppHookWindowInfo: Id:226, preHookWindowInfo:[enableHookWindow: false, widthHookRatio: 1.000000], newHookWindowInfo:[enableHookWindow: false, widthHookRatio: 1.000000]
02-05 13:42:46.042   30099-30136   C0421D/com.xbx...e/WMSRotation  com.xbxyftx.HMVScode  I     SetCurrentRotation: currentRotation: 270
02-05 13:42:46.043   30099-30136   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     UpdateRect: id:226 name:HMVScode0 rect:[0 0 2800 1840]->[0 0 2800 1840] reason:0 displayId:0
02-05 13:42:46.043   30099-30136   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  W     NotifySingleHandTransformChange: id:226, uiContent is nullptr
02-05 13:42:46.044   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  I     IsMainHandlerAvailable: id:226, isAvailable:1
02-05 13:42:46.044   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  I     IsMainHandlerAvailable: id:226, isAvailable:1
02-05 13:42:46.044   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][SetWindowInputEventConsumer:364] enter
02-05 13:42:46.045   30099-30099   C02800/com.xbx...ode/MMIClient  com.xbxyftx.HMVScode  I     [][OnConnected:267] Connection to server succeeded, fd:38
02-05 13:42:46.045   30099-30099   C02800/com.xbx...ode/MMIClient  com.xbxyftx.HMVScode  I     [][AddFdListener:166] Server was listening
02-05 13:42:46.045   30099-30099   C02800/com.xbx...ode/MMIClient  com.xbxyftx.HMVScode  I     [][StartEventRunner:127] reuse current event handler, thread name:
02-05 13:42:46.045   30099-30099   C02800/com.xbx...ode/MMIClient  com.xbxyftx.HMVScode  I     [][StartEventRunner:130] File fd is in listening
02-05 13:42:46.045   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][SetWindowInputEventConsumer] leave
02-05 13:42:46.045   30099-30099   C0420C/com.xbx...code/WMSEvent  com.xbxyftx.HMVScode  I     AddInputWindow: SetWindowInputEventConsumer success, wid:226
02-05 13:42:46.045   30099-30099   C0420C/com.xbx...code/WMSEvent  com.xbxyftx.HMVScode  I     LoadGameController: in
02-05 13:42:46.047   30099-30099   C04732/com.xbx...ameController  com.xbxyftx.HMVScode  I     [(RegisterEntryModule:24)]begin load gamecontroller_event
02-05 13:42:46.047   30099-30099   C04732/com.xbx...ameController  com.xbxyftx.HMVScode  I     [(StartInputToTouch:57)]Begin StartInputToTouch
02-05 13:42:46.047   30099-30099   C0420C/com.xbx...code/WMSEvent  com.xbxyftx.HMVScode  I     LoadGameController: dlopen GameController success
02-05 13:42:46.047   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     ConnectServer: start connect
02-05 13:42:46.047   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     ConnectServer: end connect
02-05 13:42:46.047   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  W     RegisterGetWMSWindowListCallback: callback has registered
02-05 13:42:46.047   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     RegisterGetWMSWindowListCallback: winId: 226
02-05 13:42:46.047   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     UpdateColorMode: winId: 226, colorMode: dark
02-05 13:42:46.047   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     UpdateColorMode: winId: 226, colorMode: dark, hasDarkRes: 1
02-05 13:42:46.047   30099-30099   C0421C/com.xbx...ode/WMSCompat  com.xbxyftx.HMVScode  I     SetPcAppInpadSpecificSystemBarInvisible: isPcAppInpadSpecificSystemBarInvisible: 0
02-05 13:42:46.047   30099-30099   C0421C/com.xbx...ode/WMSCompat  com.xbxyftx.HMVScode  I     SetPcAppInpadOrientationLandscape: isPcAppInpadOrientationLandscape: 0
02-05 13:42:46.048   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  E     singleton_container.cpp GetSingleton: cant get OHOS::Rosen::WindowInfoReporter
02-05 13:42:46.048   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onWindowStageCreate
02-05 13:42:46.048   30099-30099   A00000/com.xbx...Scode/testTag  com.xbxyftx.HMVScode  I     Ability onWindowStageCreate
02-05 13:42:46.048   30099-30099   C04200/com.xbx...JsWindowStage  com.xbxyftx.HMVScode  I     LoadContent: [NAPI]
02-05 13:42:46.048   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onWindowStageCreate, time: 0
02-05 13:42:46.048   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onWillForeground
02-05 13:42:46.048   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onWillForeground, time: 0
02-05 13:42:46.048   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     GoForeground: reason: 4
02-05 13:42:46.048   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Show: Window show [name: HMVScode0, id: 226, type: 1], reason: 4, state:1, requestState:1
02-05 13:42:46.048   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     GetSystemSizeLimits: px[5184,5184,576,432], vp[2880,2880,320,240], configMax:2880, vpr:1.800000, winType:1
02-05 13:42:46.048   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     UpdateNewSize: fullscreen or compatible mode could not update new size, Id: 226
02-05 13:42:46.049   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     IsSystemDensityChanged: windowId: 226, lastDensity: -1.000000, currDensity: 1.800000
02-05 13:42:46.049   30099-30099   C04200/com.xbx...owSessionImpl  com.xbxyftx.HMVScode  W     UpdateViewportConfig: uiContent is null!
02-05 13:42:46.049   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [ui_ability_impl430]wnd call, AfterForeground
02-05 13:42:46.049   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  W     GetAttachStateSyncResult: lifecycleCallback is null
02-05 13:42:46.049   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSFrameRateLinker::Create id: 129274220642305
02-05 13:42:46.051   30099-30136   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 1, id: 226
02-05 13:42:46.051   30099-30165   C04732/com.xbx...ameController  com.xbxyftx.HMVScode  I     [(GetSelfBundleName:49)]The current bundleName [com.xbxyftx.HMVScode]. version [1.0.0]
02-05 13:42:46.051   30099-30165   C04732/com.xbx...ameController  com.xbxyftx.HMVScode  I     [(IsCommonApp:88)]The [com.xbxyftx.HMVScode] is a common app.
02-05 13:42:46.053   30099-30136   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 226, isHighlight: 1,
02-05 13:42:46.053   30099-30136   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  W     NotifySingleHandTransformChange: id:226, uiContent is nullptr
02-05 13:42:46.053   30099-30136   C04200/com.xbx...owSessionImpl  com.xbxyftx.HMVScode  I     NotifyTransformChange: in
02-05 13:42:46.054   30099-30099   C01706/com.xbx...rameReportExt  com.xbxyftx.HMVScode  I     RsFrameReportExt:[LoadLibrary] load library success!
02-05 13:42:46.054   30099-30099   C01706/com.xbx...rameReportExt  com.xbxyftx.HMVScode  I     RsFrameReportExt:[Init] dlopen libframe_ui_intf.so success!
02-05 13:42:46.055   30099-30165   C04732/com.xbx...ameController  com.xbxyftx.HMVScode  I     [(ReadJsonFromFile:214)]load game_support_key_mapping.json file success.
02-05 13:42:46.055   30099-30165   C04732/com.xbx...ameController  com.xbxyftx.HMVScode  I     [(DoAsyncTask:71)]The app does not support input-to-touch feature.
02-05 13:42:46.055   30099-30099   C01706/com.xbx...t-FrameUiIntf  com.xbxyftx.HMVScode  I     [Init]:ret:1, inited:1
02-05 13:42:46.055   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     InitWaterfallMode: winId: 226
02-05 13:42:46.055   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     NotifyWaterfallModeChange: winId: 226, waterfall: 0, stat: 2
02-05 13:42:46.056   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     NotifyAfterDidForeground: reason: 4
02-05 13:42:46.056   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     NotifyFreeMultiWindowModeResume: IsPcMode 1, isColdStart 1
02-05 13:42:46.056   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Show: Window show success [name:HMVScode0, id:226, type:1]
02-05 13:42:46.056   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     NotifyWindowStatusChange: id:226, windowMode:1, windowStatus:1, lastWindowStatus:1, skipRedundantWindowStatusNotifications:0
02-05 13:42:46.056   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     NotifyWindowStatusDidChange: Id:226, WindowMode:1, windowStatus:1, lastWindowStatus:0, listenerSize:0, rect:[0 0 2800 1840]
02-05 13:42:46.056   30099-30099   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  W     OnDisplayInfoChange: data is not changed.
02-05 13:42:46.056   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onForeground
02-05 13:42:46.056   30099-30099   A00000/com.xbx...Scode/testTag  com.xbxyftx.HMVScode  I     Ability onForeground
02-05 13:42:46.056   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onForeground, time: 0
02-05 13:42:46.057   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     NotifyAfterDidForeground execute
02-05 13:42:46.057   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1854]JsUIAbility call js, name: onDidForeground
02-05 13:42:46.057   30099-30099   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  I     [JUA1899]end, name: onDidForeground, time: 0
02-05 13:42:46.057   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     GoResume: in
02-05 13:42:46.057   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Resume: in, isColdStart: 1, isDidForeground: 0
02-05 13:42:46.057   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     NotifyAfterLifecycleResumed: in
02-05 13:42:46.057   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     SetUIContentInner: pages/Index, state:2, persistentId: 226
02-05 13:42:46.057   30099-30099   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     SetUIContentComplete: persistentId=226
02-05 13:42:46.057   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:-1:undefined)] CreateUIContent.
02-05 13:42:46.057   30099-30099   C03934/com.xbx...de/AceUIEvent  com.xbxyftx.HMVScode  I     [(-1:-1:undefined)] report ace loaded
02-05 13:42:46.057   30099-30099   C04707/com.xbx...e/HaAceEngine  com.xbxyftx.HMVScode  I     OnAceLoaded end
02-05 13:42:46.058   30099-30099   C0391F/com.xbx...code/AceImage  com.xbxyftx.HMVScode  W     [(-2:-1:undefined)] mkdir cache file path failed.
02-05 13:42:46.058   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:-1:undefined)] Init RenderService UniRender Type:0
02-05 13:42:46.058   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:-1:undefined)] [com.xbxyftx.HMVScode][entry][-1]: UIContent: apiCompatibleVersion: 60002022, apiTargetVersion: 60002022, and apiReleaseType: Release, useNewPipe: 1
02-05 13:42:46.059   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.sys.arkui.animationscale remoteWatcherId 634 success
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  E     [(-2:-1:undefined)] ConfigXMLParserBase ParseInternalWithBundleName failed
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(-2:-1:undefined)] ArkUiFeatureParamManager failed to parse xml file
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  E     [(-2:-1:undefined)] ConfigXMLParserBase read system UI correction config file failed
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(-2:-1:undefined)] ArkUiFeatureParamManager failed to load UI correction config file
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:-1:undefined)] SetLocale language tag: zh-CN, select language: zh-CN
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:-1:undefined)] [com.xbxyftx.HMVScode][entry][-1]: SetLanguage: zh, colorMode: dark, deviceAccess: 1
02-05 13:42:46.059   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:-1:undefined)] [com.xbxyftx.HMVScode][entry][-1]: Initialize UIContent isModelJson:true
02-05 13:42:46.061   30099-30099   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(-2:-1:undefined)] subscribe hsp Update successfully
02-05 13:42:46.061   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetHapPath, Use hap path to load resource
02-05 13:42:46.061   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     RegisterWaterfallModeChangeListener: winId: 226
02-05 13:42:46.062   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  I     GetSurfaceNode: name:HMVScode0, id:226
02-05 13:42:46.062   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  I     GetSurfaceNode: name:HMVScode0, id:226
02-05 13:42:46.062   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetRSSurfaceNode 129274220642305
02-05 13:42:46.062   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  E     RSRenderNodeDrawableAdapter::OnGenerate, node type 1 is not supported
02-05 13:42:46.062   30099-30099   C01406/com.xbx...HMVScode/skia  com.xbxyftx.HMVScode  E     RSRenderNode::InitRenderParams failed
02-05 13:42:46.064   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::SetAbilityState, surfaceNodeId:[129274220642305], ability state: foreground
02-05 13:42:46.064   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.sys.graphic.animationscale remoteWatcherId 634 success
02-05 13:42:46.064   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] will create parallel PageRouterManager!
02-05 13:42:46.065   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] Invalid config:zh_CN-long-notround-horizontal-dark-tablet-xhdpi
02-05 13:42:46.065   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::SetAbilityState, surfaceNodeId:[129274220642305], ability state: background
02-05 13:42:46.065   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] set translateManager to pipeline, instanceId:100000
02-05 13:42:46.065   30099-30099   C0421D/com.xbx...e/WMSRotation  com.xbxyftx.HMVScode  I     RegisterOrientationChangeListener: in
02-05 13:42:46.065   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] AddPersistAfterLayoutTask size: 1
02-05 13:42:46.065   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Debug touch pass mode 0
02-05 13:42:46.067   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load absolute_path /system/lib64/libtransform_interaction_ext.z.so: check ns accessible failed namespace=ndk.
02-05 13:42:46.067   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load /system/lib64/libtransform_interaction_ext.z.so failed, namespace=ndk no inherits, errno=2
02-05 13:42:46.067   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load /system/lib64/libtransform_interaction_ext.z.so failed, namespace=default, errno=2
02-05 13:42:46.067   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     dlopen_impl load library header failed for /system/lib64/libtransform_interaction_ext.z.so
02-05 13:42:46.067   30099-30099   C03934/com.xbx...de/AceUIEvent  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] AceTransform load failed: Error loading shared library /system/lib64/libtransform_interaction_ext.z.so: No such file or directory
02-05 13:42:46.067   30099-30099   C03937/com.xbx...e/AceResource  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ResourceAdapter UpdateResConfig with colorMode dark
02-05 13:42:46.067   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] not found systemTheme in HapModuleInfo, loading default OHOS_THEME
02-05 13:42:46.067   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Cannot Get File List from resources/styles/
02-05 13:42:46.067   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] GetAsset failed: resources/styles/default.json
02-05 13:42:46.073   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] root node OnAttachToFrameNode, id:0
02-05 13:42:46.073   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Rosenwindow set root, rsId:129274220642307
02-05 13:42:46.074   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ContainerModalViewEnhance BuildTitle called
02-05 13:42:46.074   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] read abc file success!
02-05 13:42:46.079   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ContainerModalViewEnhance BuildTitle called
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains icon_primary!
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains icon_on_primary!
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains interactive_hover!
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains interactive_click!
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains warning!
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains window_left_screen!
02-05 13:42:46.079   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style container_modal_pattern not contains window_right_screen!
02-05 13:42:46.079   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] read abc file success!
02-05 13:42:46.081   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ContainerModalViewEnhance BuildCustomButtonRow called
02-05 13:42:46.081   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] read abc file success!
02-05 13:42:46.088   30099-30099   C02B61/com.xbx...e/ImageSource  com.xbxyftx.HMVScode  I     CreatePixelMap success, id:1770270166083747,dSize:0,0,sSize:512,512,dHdr:1,sHdr:1,memType:2,cost 3814 us
02-05 13:42:46.088   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetAppIcon successfully
02-05 13:42:46.088   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetAppTitle successfully
02-05 13:42:46.088   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetColorConfigurationUpdate
02-05 13:42:46.088   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetColorConfigurationUpdate isDark = 1
02-05 13:42:46.089   30099-30099   C02220/com.xbx...tentionClient  com.xbxyftx.HMVScode  I     in Connect, enter
02-05 13:42:46.089   30099-30099   C02220/com.xbx...tentionClient  com.xbxyftx.HMVScode  I     in Connect, Connecting IntentionService success
02-05 13:42:46.089   30099-30099   C02220/com.xbx...tentionClient  com.xbxyftx.HMVScode  I     in Connect, leave
02-05 13:42:46.089   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  E     [(AccessibilitySystemAbilityClientImpl:57)]accessibility service is ready.
02-05 13:42:46.090   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix accessibility.config.ready remoteWatcherId 634 success
02-05 13:42:46.090   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] focusWindowId: 0, realHostWindowId: 0
02-05 13:42:46.090   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: window focus
02-05 13:42:46.090   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix debug.graphic.frame remoteWatcherId 634 success
02-05 13:42:46.091   30099-30099   C03D00/cpu_boost                com.xbxyftx.HMVScode  E     dev/flo open failed.
02-05 13:42:46.091   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] font path exist
02-05 13:42:46.091   30099-30099   C0390C/com.xbx...Scode/AceFont  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] LoadThemeFont:default.ttf
02-05 13:42:46.091   30099-30099   C03D00/utils_base               com.xbxyftx.HMVScode  E     Failed to exec mmap, errno = 22
02-05 13:42:46.091   30099-30099   C03D00/utils_base               com.xbxyftx.HMVScode  E     WriteToAshmem: invalid input or not map
02-05 13:42:46.091   30099-30099   C03D00/utils_base               com.xbxyftx.HMVScode  E     ReadFromAshmem: invalid input or not map
02-05 13:42:46.091   30099-30099   C01408/com.xbx...HMVScode/Text  com.xbxyftx.HMVScode  E     LoadThemeFont: Failed to load font default.ttf
02-05 13:42:46.091   30099-30099   C0390C/com.xbx...Scode/AceFont  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] LoadThemeFont failed, familyName:default.ttf
02-05 13:42:46.091   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ArkUIInvisibleFreeze: 0
02-05 13:42:46.091   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: SetMinPlatformVersion is 60002022
02-05 13:42:46.091   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     RegisterAvoidAreaChangeListener: win 226
02-05 13:42:46.092   30099-30099   C04201/com.xbx...essionManager  com.xbxyftx.HMVScode  E     [nodict]Read result failed, code is: 3.
02-05 13:42:46.092   30099-30099   C04201/com.xbx...essionManager  com.xbxyftx.HMVScode  E     [nodict]Read result failed, code is: 5.
02-05 13:42:46.094   30099-30140   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     UpdateRect: id:226 name:HMVScode0 rect:[0 0 2800 1840]->[0 0 2800 1840] reason:23 displayId:0
02-05 13:42:46.094   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetAvoidAreaByType: win [226 HMVScode0] type 0 times 1 area top [0 0 2800 82] 
02-05 13:42:46.094   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetAvoidAreaByType: win [226 HMVScode0] type 1 times 2 area empty
02-05 13:42:46.095   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetAvoidAreaByType: win [226 HMVScode0] type 4 times 3 area bottom [910 1781 980 59] 
02-05 13:42:46.095   30099-30099   C03917/com.xbx...e/AceSafeArea  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] InitializeSafeArea systemInsets:SafeAreaInsets left_: [start: 0, end: 0], top_: [start: 0, end: 82], right_: [start: 0, end: 0], bottom_: [start: 0, end: 0], cutoutInsets:SafeAreaInsets left_: [start: 0, end: 0], top_: [start: 0, end: 0], right_: [start: 0, end: 0], bottom_: [start: 0, end: 0], navInsets:SafeAreaInsets left_: [start: 0, end: 0], top_: [start: 0, end: 0], right_: [start: 0, end: 0], bottom_: [start: 1781, end: 1840]
02-05 13:42:46.095   30099-30099   C0394E/com.xbx...ode/AceWindow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Initialize displayId: 0, availableRect: [0, 0, 2800, 1840]
02-05 13:42:46.096   30099-30099   C02504/com.xbx...ode/thp_extra  com.xbxyftx.HMVScode  I     GetProcessName[68]name is: com.xbxyftx.HMVScode
02-05 13:42:46.096   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: Initialize: pages/Index
02-05 13:42:46.096   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] RunPage:pages/Index
02-05 13:42:46.096   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] GetAsset failed: manifest.json
02-05 13:42:46.097   30099-30099   C0421C/com.xbx...ode/WMSCompat  com.xbxyftx.HMVScode  I     RegisterNavigateCallbackForPageCompatibleModeIfNeed: content is nullptr or page is empty
02-05 13:42:46.097   30099-30099   C04200/com.xbx....HMVScode/WMS  com.xbxyftx.HMVScode  I     InitUIContent: [0, 0]
02-05 13:42:46.097   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     SetUIContentInner: single hand, id:226, posX:0, posY:0, scaleX:1.000000, scaleY:1.000000
02-05 13:42:46.097   30099-30099   C04219/com.xbx...code/WMSDecor  com.xbxyftx.HMVScode  I     UpdateDecorEnable: decorVisible:0, id: 226
02-05 13:42:46.097   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: UpdateWindowVisible: 0, hasDecor: 1
02-05 13:42:46.097   30099-30153   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] Subscribe touch.events.pass.through Event
02-05 13:42:46.097   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: NotifyWindowMode mode = 1
02-05 13:42:46.098   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window foreground
02-05 13:42:46.098   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_SHOW
02-05 13:42:46.098   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::SetAbilityState, surfaceNodeId:[129274220642305], ability state: foreground
02-05 13:42:46.098   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ArkUI requests first Vsync.
02-05 13:42:46.098   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     RequestVsync: First vsync has requested, nodeId: 129274220642305
02-05 13:42:46.098   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] window state change to show
02-05 13:42:46.098   30099-30099   C04219/com.xbx...code/WMSDecor  com.xbxyftx.HMVScode  E     GetTitleButtonVisible: device not support
02-05 13:42:46.098   30099-30099   C04219/com.xbx...code/WMSDecor  com.xbxyftx.HMVScode  I     UpdateTitleButtonVisibility: [hideSplit, hideMaximize, hideMinimizeButton, hideCloseButton]:[0, 0, 0, 0]
02-05 13:42:46.099   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     UpdateViewportConfig: Id: 226, reason: 0, windowRect: [0 0 2800 1840], displayOrientation: 3, config[0, 0, 0, 1.800000]
02-05 13:42:46.099   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window focus
02-05 13:42:46.099   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window active
02-05 13:42:46.099   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     NotifyAfterUIContentReady: Renotify transform, id:226, scaleX:1.000000, scaleY:1.000000
02-05 13:42:46.099   30099-30099   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-05 13:42:46.099   30099-30099   A00000/com.xbx...Scode/testTag  com.xbxyftx.HMVScode  I     Succeeded in loading the content.
02-05 13:42:46.099   30099-30099   C04200/com.xbx...JsWindowStage  com.xbxyftx.HMVScode  I     Window [226, HMVScode0] load content end, ret=0
02-05 13:42:46.099   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     NotifyAvoidAreaChange: win 226 api 22 type 0 area top [0 0 2800 82] 
02-05 13:42:46.099   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     NotifyAvoidAreaChange: win 226 api 22 type 2 area empty
02-05 13:42:46.099   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     NotifyAvoidAreaChange: win 226 api 22 type 3 area empty
02-05 13:42:46.099   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     NotifyAvoidAreaChange: win 226 api 22 type 4 area bottom [910 1781 980 59] 
02-05 13:42:46.099   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     UpdateViewportConfig: Id: 226, reason: 0, windowRect: [0 0 2800 1840], displayOrientation: 3, config[0, 0, 0, 1.800000]
02-05 13:42:46.099   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-05 13:42:46.099   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.099   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.099   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.099   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 226 get focus.
02-05 13:42:46.099   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] Current focus view can not found!
02-05 13:42:46.099   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Request focus on rootFocusHub: root/0
02-05 13:42:46.100   30099-30099   C04208/com.xbx...ode/WMSLayout  com.xbxyftx.HMVScode  I     UpdateViewportConfig: Id: 226, reason: 23, windowRect: [0 0 2800 1840], displayOrientation: 3, config[0, 0, 0, 1.800000]
02-05 13:42:46.100   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Page router manager is creating page[1]: url: pages/Index path: pages/Index.js, recoverable: yes, namedRouter: no
02-05 13:42:46.105   30099-30150   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.ace.trace.layout.enabled remoteWatcherId 634 success
02-05 13:42:46.106   30099-30150   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.ace.trace.inputevent.enabled remoteWatcherId 634 success
02-05 13:42:46.107   30099-30150   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix const.security.developermode.state remoteWatcherId 634 success
02-05 13:42:46.107   30099-30150   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.ace.debug.statemgr.enabled remoteWatcherId 634 success
02-05 13:42:46.108   30099-30150   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.ace.debug.boundary.enabled remoteWatcherId 634 success
02-05 13:42:46.110   30099-30150   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.ace.performance.monitor.enabled remoteWatcherId 634 success
02-05 13:42:46.118   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     Init: begin to init native media player napi properties
02-05 13:42:46.118   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     Init: [PROXYCONTROLLER] NapiProxyConfig::Init is called
02-05 13:42:46.118   30099-30099   C03F01/com.xbx...HMVScode/NAPI  com.xbxyftx.HMVScode  I     [NMM:1282]Module:file.photoAccessHelper
02-05 13:42:46.119   30099-30099   C03F01/com.xbx...HMVScode/NAPI  com.xbxyftx.HMVScode  W     [NMM:1199] Name mismatch: file.photoAccessHelperNative != file.photoAccessHelper
02-05 13:42:46.124   30099-30099   C02B01/com.xbx...VScode/CAMERA  com.xbxyftx.HMVScode  I     {Onload():63} CameraPickerNapi::OnLoad
02-05 13:42:46.124   30099-30099   C02B01/com.xbx...VScode/CAMERA  com.xbxyftx.HMVScode  I     {Init():463} CameraPickerNapi::Init is called
02-05 13:42:46.126   30099-30099   C03F01/com.xbx...HMVScode/NAPI  com.xbxyftx.HMVScode  W     [NMM:1199] Name mismatch: web.webnativemessagingextensionmanager_napi != web.webNativeMessagingExtensionManager
02-05 13:42:46.128   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     JsConstructor: NapiWebviewController::JsConstructor start
02-05 13:42:46.129   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     Init: [webview]: init load resources bundle path /data/storage/el1/bundle
02-05 13:42:46.129   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     GetArkwebLibPath: get arkweb lib path: /data/storage/el1/bundle/arkwebcore/libs/arm64
02-05 13:42:46.129   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     GetArkwebNameSpace: get arkweb name space: nweb_ns
02-05 13:42:46.129   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libhitrace_ndk.z.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.129   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libhilog_ndk.z.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.130   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libqos.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.130   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libffrt.z.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.130   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohinputmethod.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.130   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohavsession.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.130   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohfileuri.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.131   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libnet_ssl.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.131   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohaudio.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.132   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libability_runtime.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.132   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libnative_rdb_ndk.z.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.132   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libability_access_control.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.132   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohinput.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.133   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libpasteboard.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.133   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libnative_window_manager.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.133   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libdeviceinfo_ndk.z.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.133   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohpreferences.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.133   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohsensor.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.134   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohbattery_info.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.134   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libohcommonevent.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.134   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libimage_packer.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.134   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libnative_color_space_manager.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.134   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libimage_source.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.135   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libtime_service_ndk.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.135   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libnet_connection.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.135   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libtelephony_data.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.135   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     load libtelephony_radio.so failed, namespace=default no inherits, errno=2
02-05 13:42:46.160   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     ArkWebBridgeHelperLoadLibFile: succeed to load lib file /data/storage/el1/bundle/arkwebcore/libs/arm64/libarkweb_engine.so
02-05 13:42:46.160   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     ArkWebBridgeHelperSharedInit: g_webEngineInitFlag set to true. setActiveWebEngineVersion will be ignored.
02-05 13:42:46.160   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     GetWebEngine: call func NotifyProcessDependedOnWeb and return code is 0
02-05 13:42:46.160   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  E     GetWebEngine: api level of arkweb core is 0
02-05 13:42:46.160   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     GetWebEngine: web engine libraryloaded
02-05 13:42:46.161   30099-30099   C02C02/PARAM                    com.xbxyftx.HMVScode  E     Failed to connect server /dev/unix/socket/paramservice 13
02-05 13:42:46.161   30099-30099   C02C02/PARAM                    com.xbxyftx.HMVScode  E     connect param server failed!
02-05 13:42:46.161   30099-30099   C02C02/PARAM                    com.xbxyftx.HMVScode  I     SystemSetParameter name web.flowbuffer.maxfd id:4 ret:114
02-05 13:42:46.161   30099-30099   C02C0B/BEGET                    com.xbxyftx.HMVScode  E     [param_request.c:217]SystemSetParameter failed! name is :web.flowbuffer.maxfd, the errNum is:114
02-05 13:42:46.161   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_native_object.cc:136] NativeArkWeb BindWebTagToWebInstance webTag:arkweb:0
02-05 13:42:46.162   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Application filesDir: /data/storage/el2/base/haps/entry/files
02-05 13:42:46.162   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Workspace root set to: /data/storage/el2/base/haps/entry/files
02-05 13:42:46.163   30099-30141   C04388/com.xbx...code/file_api  com.xbxyftx.HMVScode  E     [prop_n_exporter.cpp:302->operator()] Accesscore finish ret -2
02-05 13:42:46.163   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style text_pattern not contains linear_split_child_min_size!
02-05 13:42:46.163   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style text_pattern not contains menu_celia_ask_is_support!
02-05 13:42:46.164   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: page/23 show
02-05 13:42:46.164   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] page show
02-05 13:42:46.165   30099-30099   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-05 13:42:46.165   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] StageManager FrameNode notNeedSoftKeyboard.
02-05 13:42:46.165   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Container not SceneBoardWindow.
02-05 13:42:46.165   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] set primary page nullptr
02-05 13:42:46.165   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] No need for home page recognition
02-05 13:42:46.165   30099-30099   C03925/com.xbx...ode/AceRouter  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] LoadPage Success
02-05 13:42:46.165   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     JsConstructor: NapiWebviewController::JsConstructor start
02-05 13:42:46.165   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_native_object.cc:136] NativeArkWeb BindWebTagToWebInstance webTag:arkweb:1
02-05 13:42:46.165   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] ParseWindow: not window mode.
02-05 13:42:46.165   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Opening folder picker...
02-05 13:42:46.165   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] parseDocumentPickerSelectOption start
02-05 13:42:46.165   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] parseDocumentPickerSelectOption end
02-05 13:42:46.166   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] modalPicker start 
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPicker:499)][picker]: StartModalPicker begin.
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(ParseArgsStartModalPicker:480)][picker]: ParseArgsStartModalPicker begin.
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(AsyncContextSetStaticObjectInfo:444)][picker]: AsyncContextSetStaticObjectInfo begin.
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:389)][picker]: StartPickerExtension begin.
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:395)][picker] Will get uiContent by context.
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:414)][picker]: SetParam end, udkey = 
02-05 13:42:46.166   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartPickerExtension:428)][picker]: will CreateModalUIExtension by extType: filePicker, pickerType: select
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@95][ID: 1] The modal UIExtension is created.
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Create UIExtensionNode
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@979][ID: 1] RegisterPipelineEvent
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@931][ID: 1] OnAttachToFrameNode
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@454][ID: 1] The current state is 'NONE' when UpdateWant, needCheck: '0'.
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@481][ID: 1] The ability KeyAsync 0, uIExtensionUsage: 0.
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@645][ID: 1] The session is created with bundle=, ability=, componentId=44.
02-05 13:42:46.166   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 226
02-05 13:42:46.166   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 226 enable 1
02-05 13:42:46.166   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@688][ID: 1] Want param isNotifyOccupiedAreaChange is 1, realHostWindowId: 226, parentWindowType: 1
02-05 13:42:46.167   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     GeneratePersistentId: persistentId: 0, persistentId_: 1197027330
02-05 13:42:46.167   30099-30175   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     persistentId: 1197027330, bundleName: , moduleName: , abilityName: , isDensityFollowHost_: 0, density_: 1.800000
02-05 13:42:46.167   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@868][ID: 1] The state is changing from 'NONE' to 'FOREGROUND'.
02-05 13:42:46.167   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@980][ID: 1] NotifyForeground, persistentid = 1197027330, hostWindowId = 226, windowSceneId = -1, IsSceneBoardWindow: 0, componentId=44.
02-05 13:42:46.167   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 226
02-05 13:42:46.167   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 226 enable 1
02-05 13:42:46.168   30099-30175   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Activate session, id=1197027330
02-05 13:42:46.168   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@223][ID: 1] OnAttachContext newInstanceId: 100000, oldInstanceId: 100000, isMoving: 0, detachContextHappened: 0.
02-05 13:42:46.168   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@185][ID: 1] OnAttachToMainTree, isMoving: 0
02-05 13:42:46.168   30099-30099   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] modalNode->GetParent() 3 mark IsProhibitedAddChildNode when sessionId -1197027330,prohibitedRemoveByRouter: 0, isAllowAddChildBelowModalUec: 0.
02-05 13:42:46.168   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: ModalPage/45 show
02-05 13:42:46.168   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] View: page/23 lost focus
02-05 13:42:46.168   30099-30099   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-05 13:42:46.168   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: create modal page, sessionId=1197027330, isProhibitBack=0, isAsyncModalBinding=0, isAllowedBeCovered=0, prohibitedRemoveByRouter=0, isAllowAddChildBelowModalUec=0, prohibitedRemoveByNavigation=1
02-05 13:42:46.168   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] NotifyWindowMode aliveUIExtensions = 0
02-05 13:42:46.168   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: HideWindowTitleButton hideSplit: 0, hideMaximize: 0, hideMinimize: 0, hideClose: 0
02-05 13:42:46.168   30099-30141   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerExecute:60)][picker]: StartModalPickerExecute begin
02-05 13:42:46.168   30099-30099   C0394E/com.xbx...ode/AceWindow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update displayWindowRect in UpdateViewportConfig to : Rect (0.00, 0.00) - [2800.00 x 1840.00]
02-05 13:42:46.168   30099-30099   C03917/com.xbx...e/AceSafeArea  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetIsFullScreen 1
02-05 13:42:46.171   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style 125829872 not contains scrollable_pattern!
02-05 13:42:46.172   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Root node request first frame.
02-05 13:42:46.172   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-05 13:42:46.172   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.172   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.172   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.172   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 226 get focus.
02-05 13:42:46.172   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-05 13:42:46.173   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.173   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.173   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:46.173   30099-30099   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     VsyncCallbackInner: First vsync has come back, nodeId: 129274220642305
02-05 13:42:46.176   30099-30099   C01408/com.xbx...HMVScode/Text  com.xbxyftx.HMVScode  I     InitTextBundleConfig: Adapter text height enabled 0
02-05 13:42:46.180   30099-30175   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Activate ret:0, persistentId:1197027330
02-05 13:42:46.184   30099-30099   C03952/com.xbx...ode/AceAppBar  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] Get rect of buttons failed, buttonRow are hidden
02-05 13:42:46.185   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1258][ID: 1] NotifyDisplayArea displayArea=RectT (0.00, 0.00) - [2800.00 x 1840.00], curWindow=Rect (0.00, 0.00) - [2800.00 x 1840.00], reason=0, duration=0, persistentId=1197027330, componentId=44.
02-05 13:42:46.186   30099-30099   C01408/com.xbx...HMVScode/Text  com.xbxyftx.HMVScode  W     generatePaintRegion: Call generatePaintRegion when paragraph is not formatted
02-05 13:42:46.188   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ArkUi flush first frame messages.
02-05 13:42:46.188   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Request focus on focusView: ModalPage/45.
02-05 13:42:46.188   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WinFocusMove end, root/secure_field onBlur, ModalPage/secure_field onFocus, start: 2, end: 1, update: 2
02-05 13:42:46.188   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (ModalPage/45). isDynamic: 0
02-05 13:42:46.188   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Trigger Window Focus Callback
02-05 13:42:46.188   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] need keyboard : 0.
02-05 13:42:46.188   30099-30099   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     id: 226, isNeedKeyboard: 0, keepKeyboardFlag: 0
02-05 13:42:46.188   30099-30099   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     RequestInputMethodCloseKeyboard: Notify InputMethod framework close keyboard start.
02-05 13:42:46.191   30099-30099   C03903/com.xbxy...AceSubWindow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] hide menu ng exit, window not exist
02-05 13:42:46.191   30099-30099   C04216/com.xbx...de/WMSPattern  com.xbxyftx.HMVScode  I     FlushLayoutSize: NotifyFrameLayoutFinishFromApp, id: 226, rect: [0 0 2800 1840], notifyListener: 0
02-05 13:42:46.191   30099-30099   C02D66/com.xbx...w-PerfMonitor  com.xbxyftx.HMVScode  I     ProcessJank: JankFrameMonitor::ProcessJank jank >= threshold
02-05 13:42:46.579   30099-30168   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::Unmarshalling, Node: 129411659595777, Name: com.huawei.hmos.filemanagerFilePickerUIExtAbility
02-05 13:42:46.580   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ConnectInner: [id: 1197027330] state: 0,isTerminating:0, callingPid:30131, disableDelegator:0
02-05 13:42:46.580   30099-30175   C04202/com.xbx...Scode/WMSMain  com.xbxyftx.HMVScode  I     InitSessionPropertyWhenConnect: [id: 1197027330] requestedOrientation: 0, defaultRequestedOrientation: 0, userRequestedOrientation: 0
02-05 13:42:46.580   30099-30175   C0420C/com.xbx...code/WMSEvent  com.xbxyftx.HMVScode  I     SetCallingPid: id:1197027330, 30131
02-05 13:42:46.580   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:46.580   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:46.580   30099-30175   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  E     GetScreenSession: Error found screen session with id: 18446744073709551615
02-05 13:42:46.580   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ConnectInner: set session id 1197027330 disableDelegator 0
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@575][ID: 1] The session is connected and the current state is 'FOREGROUND'.
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1455][ID: 1] OnRemoteReady the current state is 'FOREGROUND'.
02-05 13:42:46.580   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionComponent/secure_field RequestFocusImmediately isOnMainTree:1
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] focused state notified to uiextension, persistentid = 1197027330, componentId=44.
02-05 13:42:46.580   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FocusSwitch end, ModalPage/secure_field onBlur, UIExtensionComponent/secure_field onFocus, start: 2, end: 1, update: 2
02-05 13:42:46.580   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (UIExtensionComponent/44). isDynamic: 0
02-05 13:42:46.580   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtension(UIExtensionComponent/44) not need process.
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] focused state notified to uiextension, persistentid = 1197027330, componentId=44.
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionManager register listener
02-05 13:42:46.580   30099-30099   C04217/com.xbxy...WMSAttribute  com.xbxyftx.HMVScode  I     GetExtensionConfig: waterfall: 0, winId: 226
02-05 13:42:46.580   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetGestureBackEnabled: win 226 enable 1
02-05 13:42:46.580   30099-30099   C0395F/com.xbx...amicComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Create UIExtensionAccessibilityChildTreeCallback
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1697][ID: 1] UIExtension: 37 register child tree, realHostWindowId: 226
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=1002.
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=1001.
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2169][ID: 1] RegisterUIExtBusinessConsumeCallback businessCode=3002.
02-05 13:42:46.580   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2184][ID: 1] NotifyHostWindowMode: instanceId = 100000, followStrategy = 0, mode = 1
02-05 13:42:46.584   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionSurface: isDisappearing = 0, paintRect = RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-05 13:42:46.584   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1258][ID: 1] NotifyDisplayArea displayArea=RectT (0.00, 0.00) - [2800.00 x 1840.00], curWindow=Rect (0.00, 0.00) - [2800.00 x 1840.00], reason=0, duration=0, persistentId=1197027330, componentId=44.
02-05 13:42:46.584   30099-30099   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  E     GetScreenSession: Error found screen session with id: 18446744073709551615
02-05 13:42:46.584   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1197027330 to clear the focus state, componentId=44.
02-05 13:42:46.584   30099-30099   C01402/com.xbx...VScode/RSNode  com.xbxyftx.HMVScode  I     RSNode::AddChild, Id: 129274220642332, SurfaceNode:[Id: 129411659595777, name: com.huawei.hmos.filemanagerFilePickerUIExtAbility]
02-05 13:42:46.584   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1825][ID: 1] HandleVisibleAreaChange visible: 1, curVisible: 0, ratio: 1.000000, displayArea: RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-05 13:42:46.584   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1656][ID: 1] The component is changing from 'visible' to 'visible'.
02-05 13:42:46.589   30099-30168   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Foreground: [id: 1197027330] state:1, isTerminating:0
02-05 13:42:46.589   30099-30168   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     SetActive: new active:1, id:1197027330, state:2
02-05 13:42:46.589   30099-30140   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     NotifyExtensionSecureLimitChange: windowId: 226, isLimite: 1
02-05 13:42:46.589   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:46.589   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:46.589   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:46.589   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:46.656   30099-30168   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 0, id: 226
02-05 13:42:46.656   30099-30168   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window unfocus
02-05 13:42:46.656   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_INACTIVE
02-05 13:42:46.656   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 226 lost focus.
02-05 13:42:46.656   30099-30099   C0391D/com.xbx...code/AceMouse  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] VsyncMouseFormat mouseFormat_ and lastVsyncMouseFormat_ = 0 is same.
02-05 13:42:46.656   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionComponent/secure_fieldtrigger onBlurInternal by 1
02-05 13:42:46.656   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Blur Internal.
02-05 13:42:46.656   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1197027330 to clear the focus state, componentId=44.
02-05 13:42:46.656   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@869][ID: 1] unfocused state notified to uiextension, persistentid = 1197027330, componentId=44.
02-05 13:42:46.656   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@860][ID: 1] Notify uiextension, persistentid = 1197027330 to clear the focus state, componentId=44.
02-05 13:42:46.657   30099-30168   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 226, isHighlight: 0,
02-05 13:42:46.657   30099-30168   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window unactive
02-05 13:42:46.658   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_INACTIVE
02-05 13:42:47.015   30099-30099   C01356/com.xbx...code/Recovery  com.xbxyftx.HMVScode  I     [app_recovery468]fileDir: /data/storage/el2/base/files
02-05 13:42:47.490   30099-30157   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     3:RecordSymbolAndBacktrace:397 Process:com.xbxyftx.HMVScode,Tid:30141,Qos:2,CWorker:2,EWorker:1,SWorker:1,TaskType:2,timeout:1s
02-05 13:42:47.492   30099-30157   C01719/com.xbx...HMVScode/ffrt  com.xbxyftx.HMVScode  W     4:RecordSymbolAndBacktrace:405 Tid:30141, Name:OS_FFRT_2_0
                                                                                               #00 pc 00000000001d94f0 /lib/ld-musl-aarch64.so.1
                                                                                               #01 pc 00000000000d57e0 /system/lib64/libc++.so
                                                                                               #02 pc 0000000000023d04 /system/lib64/module/file/libpicker.z.so
                                                                                               #03 pc 0000000000077a0c /system/lib64/platformsdk/libace_napi.z.so
                                                                                               #04 pc 0000000000013b0c /system/lib64/platformsdk/libuv.so
                                                                                               #05 pc 00000000000b2d6c /system/lib64/ndk/libffrt.so
                                                                                               #06 pc 00000000000b2bc4 /system/lib64/ndk/libffrt.so
                                                                                               #07 pc 00000000000aecb0 /system/lib64/ndk/libffrt.so
                                                                                               #08 pc 00000000000627ac /system/lib64/ndk/libffrt.so
                                                                                               #09 pc 0000000000062a14 /system/lib64/ndk/libffrt.so
                                                                                               #10 pc 0000000000062634 /system/lib64/ndk/libffrt.so
                                                                                               #11 pc 0000000000062324 /system/lib64/ndk/libffrt.so
                                                                                               #12 pc 00000000001d1658 /lib/ld-musl-aarch64.so.1
02-05 13:42:47.989   30099-30147   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [gc] SmartGC: app cold start just finished
02-05 13:42:51.090   30099-30168   C01332/com.xbx...ode/UIAbility  com.xbxyftx.HMVScode  W     [ui_ability_thread434]null abilityHandler_ or requestCode is -1
02-05 13:42:51.090   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1547][ID: 1] OnResult the state is changing from 'FOREGROUND' to 'DESTRUCTION'.
02-05 13:42:51.090   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnResultForModal:59)][picker] OnResultForModal enter. resultCode is 0,
02-05 13:42:51.092   30099-30168   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     NotifyExtensionSecureLimitChange: windowId: 226, isLimite: 0
02-05 13:42:51.092   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@2275][ID: 1] UEC UpdatWMSUIExtProperty state=DESTRUCTION.
02-05 13:42:51.092   30099-30140   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Background: Background ExtensionSession, id: 1197027330, state: 3
02-05 13:42:51.092   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:51.092   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:51.092   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:51.092   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:51.096   30099-30140   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     Disconnect: [id: 1197027330] Disconnect session, state: 5
02-05 13:42:51.096   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@790][ID: 1] The session is disconnected and the current state is 'DESTRUCTION'.
02-05 13:42:51.096   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1489][ID: 1] OnRelease the state is changing from 'DESTRUCTION' to 'DESTRUCTION' and releaseCode = 0.
02-05 13:42:51.096   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnRelease:36)][picker] OnRelease enter. release code is 0
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: close modal page, sessionId=1197027330
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] [@1021][ID: 1] OnReleaseDone, persistentid = 1197027330, componentId=44.
02-05 13:42:51.096   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeFunc is null
02-05 13:42:51.096   30099-30175   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     sessionStateChangeNotifyManagerFunc is null
02-05 13:42:51.096   30099-30175   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     Destroy session done with persistentId: 1197027330
02-05 13:42:51.096   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] The sessionId 1197027330 does not exist
02-05 13:42:51.096   30099-30099   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-05 13:42:51.096   30099-30175   C01336/com.xbx....HMVScode/AMS  com.xbxyftx.HMVScode  I     [AMC459]name:  , persistentId: 1197027330
02-05 13:42:51.096   30099-30099   C03922/com.xbx...AceNavigation  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] can't find inner navigation
02-05 13:42:51.096   30099-30099   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ModalPage node remove from parent node
02-05 13:42:51.096   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] view: ModalPage/45 close
02-05 13:42:51.096   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] View: ModalPage/45 lost focus
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@306][ID: 1] OnDetachContext instanceId: 100000, isMoving: 0, isOnDetachContext: 0.
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionManager unregister listener
02-05 13:42:51.096   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@347][ID: 1] UnRegisterUIExtensionManagerEvent
02-05 13:42:51.097   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1010][ID: 1] UnRegisterPipelineEvent
02-05 13:42:51.097   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1825][ID: 1] HandleVisibleAreaChange visible: 0, curVisible: 1, ratio: 0.000000, displayArea: RectT (0.00, 0.00) - [2800.00 x 1840.00].
02-05 13:42:51.097   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1656][ID: 1] The component is changing from 'visible' to 'invisible'.
02-05 13:42:51.097   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@205][ID: 1] OnDetachFromMainTree, isMoving: 0
02-05 13:42:51.097   30099-30099   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ResetRootNode -1197027330.
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Destory UIExtensionNode
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1010][ID: 1] UnRegisterPipelineEvent
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@100][ID: 1] The modal UIExtension is destroyed.
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@133][ID: 1] LogoutModalUIExtension sessionId 0.
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [@1473][ID: 1] ModalOnDestroy the current state is 'DESTRUCTION'.
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] [com.xbxyftx.HMVScode][entry][100000]: close modal page, sessionId=1197027330
02-05 13:42:51.100   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [modal_ui_callback.cpp(OnDestroy:81)][picker] OnDestroy enter.
02-05 13:42:51.100   30099-30099   C0392A/com.xbx...sionComponent  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] [@1876][ID: 1] UIExtension pattern instanceId 100000 not equal frame node instanceId -1
02-05 13:42:51.100   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] UIExtensionSurface: OnDetachFromFrameNode
02-05 13:42:51.100   30099-30140   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     UpdateFocusState: focus: 1, id: 226
02-05 13:42:51.100   30099-30099   C02C02/PARAM                    com.xbxyftx.HMVScode  W     Selinux check name resourceschedule.memmgr.dma.reclaimable in u:object_r:resourceschedule_writeable_param:s0 [581 0 0] failed
02-05 13:42:51.100   30099-30099   C02C02/PARAM                    com.xbxyftx.HMVScode  W     deny access resourceschedule.memmgr.dma.reclaimable label 29480 66
02-05 13:42:51.100   30099-30099   C02C02/PARAM                    com.xbxyftx.HMVScode  W     SystemReadParam failed!name is:resourceschedule.memmgr.dma.reclaimable,err:1002
02-05 13:42:51.100   30099-30099   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSSurfaceNode::~RSSurfaceNode, Node: 129411659595777, Name: com.huawei.hmos.filemanagerFilePickerUIExtAbility
02-05 13:42:51.100   30099-30140   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]: window focus
02-05 13:42:51.101   30099-30140   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: timeStamp:1770270171098, highlightId:226, isHighlight:1, isSyncNotify:1, current:0, new:1770270171098
02-05 13:42:51.101   30099-30140   C04207/com.xbx...code/WMSFocus  com.xbxyftx.HMVScode  I     NotifyHighlightChange: windowId: 226, isHighlight: 1,
02-05 13:42:51.101   30099-30140   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] [com.xbxyftx.HMVScode][entry][100000]:window active
02-05 13:42:51.101   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] The sessionId 1197027330 does not exist
02-05 13:42:51.101   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-05 13:42:51.101   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:51.101   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:51.101   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:51.101   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Window: 226 get focus.
02-05 13:42:51.101   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Request focus on rootFocusHub: root/0
02-05 13:42:51.101   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Update application state , state: ON_ACTIVE
02-05 13:42:51.101   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:51.101   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:51.101   30099-30099   C01D02/com.xbx...ility_asacfwk  com.xbxyftx.HMVScode  I     [(SubscribeStateObserver:551)]Observer has subscribed!
02-05 13:42:51.108   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Request focus on focusView: page/23.
02-05 13:42:51.108   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WinFocusMove end, NULL/secure_field onBlur, Stack/secure_field onFocus, start: 2, end: 1, update: 2
02-05 13:42:51.108   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (Stack/26). isDynamic: 0
02-05 13:42:51.108   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Trigger Window Focus Callback
02-05 13:42:51.108   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] need keyboard : 0.
02-05 13:42:51.108   30099-30099   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     id: 226, isNeedKeyboard: 0, keepKeyboardFlag: 0
02-05 13:42:51.108   30099-30099   C0420B/com.xbx...e/WMSKeyboard  com.xbxyftx.HMVScode  I     RequestInputMethodCloseKeyboard: Notify InputMethod framework close keyboard start.
02-05 13:42:51.109   30099-30141   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerExecute:73)][picker]: StartModalPickerExecute is ready.
02-05 13:42:51.111   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(StartModalPickerAsyncCallbackComplete:242)][picker]: StartModalPickerAsyncCallbackComplete begin.
02-05 13:42:51.111   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(MakeResultWithPickerCallBack:222)][picker]: resCode is 0.
02-05 13:42:51.111   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_n_exporter.cpp(MakeResultWithArr:88)][picker]: ability.params.stream size. 1 
02-05 13:42:51.111   30099-30099   C01304/com.xbx...anagerService  com.xbxyftx.HMVScode  I     [picker_napi_utils.cpp(InvokeJSAsyncMethod:48)][picker]: InvokeJSAsyncMethod begin.
02-05 13:42:51.111   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [picker] document select selectResult: : errorcode is = 0, selecturi is = file://docs/storage/Users/currentUser/******e
02-05 13:42:51.111   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Selected folder URI: file://docs/storage/Users/currentUser/HMVScode
02-05 13:42:51.111   30099-30141   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  I     [PersistPermission:347] PersistPermission pathPolicies size: 1
02-05 13:42:51.121   30099-30141   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  E     [ErrorCodeConversion:93] The app does not have the authorization URI permission
02-05 13:42:51.121   30099-30099   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-05 13:42:51.121   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  W     [Index] Failed to persist permission: 201 Permission verification failed
02-05 13:42:51.121   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Loading selected folder: file://docs/storage/Users/currentUser/HMVScode
02-05 13:42:51.122   30099-30141   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  I     [ActivatePermission:426] ActivatePermission pathPolicies size: 1
02-05 13:42:51.123   30099-30168   C01810/com.xbx...ode/SA_CLIENT  com.xbxyftx.HMVScode  W     OnLoadSaSucInner SA:183 spend 0ms
02-05 13:42:51.123   30099-30141   C04313/com.xbx...ppFileService  com.xbxyftx.HMVScode  E     [ErrorCodeConversion:93] The app does not have the authorization URI permission
02-05 13:42:51.123   30099-30099   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-05 13:42:51.123   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  W     [Index] Failed to activate permission: 201 Permission verification failed
02-05 13:42:51.123   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Workspace root set to: file://docs/storage/Users/currentUser/HMVScode
02-05 13:42:51.123   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] loadDirectory called, targetPath: file://docs/storage/Users/currentUser/HMVScode
02-05 13:42:51.123   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] currentPath: file://docs/storage/Users/currentUser/HMVScode
02-05 13:42:51.124   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFiles called with path: file://docs/storage/Users/currentUser/HMVScode
02-05 13:42:51.124   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] isUri: true
02-05 13:42:51.124   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] actualPath after conversion: /storage/Users/currentUser/HMVScode
02-05 13:42:51.124   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFile returned 2 items
02-05 13:42:51.124   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Processing file: md.md
02-05 13:42:51.124   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Added file: md.md type: file
02-05 13:42:51.125   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Processing file: test
02-05 13:42:51.125   30099-30099   C03913/com.xbx...Scode/AceText  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] destroy TxtParagraph with placeholderCnt_ 0, textAlign_ 0, count 0
02-05 13:42:51.127   30099-30099   C02C03/com.xbx...PARAM_WATCHER  com.xbxyftx.HMVScode  E     [nodict]Read result failed, code is: 1.
02-05 13:42:51.127   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  E     Failed to add watcher for persist.rosen.animationtrace.enabled
02-05 13:42:51.127   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  E     SystemWatchParameter is failed!keyPrefix is:persist.rosen.animationtrace.enabled,errNum is:-1
02-05 13:42:51.127   30099-30099   C02C0B/BEGET                    com.xbxyftx.HMVScode  E     [service_watcher.c:83]WatchParameter failed! the errNum is -1
02-05 13:42:51.128   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix sys.graphic.openTestModeTrace remoteWatcherId 634 success
02-05 13:42:51.128   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] Added file: test type: directory
02-05 13:42:51.128   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] listFiles result count: 2
02-05 13:42:51.128   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] Got files: 2
02-05 13:42:51.128   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] Added file: test type: directory
02-05 13:42:51.128   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] Added file: md.md type: file
02-05 13:42:51.129   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileTreeViewModel] fileList updated, count: 2
02-05 13:42:51.129   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Folder loaded successfully, file count: 2
02-05 13:42:51.134   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style 125829872 not contains scroll_bar_pattern!
02-05 13:42:51.135   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style 125829872 not contains list_pattern!
02-05 13:42:51.413   30099-30140   C057C2/com.xbx...PCObjectProxy  com.xbxyftx.HMVScode  I     hd:27 ct:1
02-05 13:42:51.413   30099-30140   C0420D/com.xbx...code/WMSUiext  com.xbxyftx.HMVScode  I     ~ExtensionSession: id=1197027330
02-05 13:42:51.413   30099-30140   C0420A/com.xbx...Scode/WMSLife  com.xbxyftx.HMVScode  I     ~Session: id:1197027330
02-05 13:42:53.989   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: down: 25688
02-05 13:42:53.989   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:D:25688][OnPointerEvent:649] recv
02-05 13:42:53.989   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:0,InputId:25688,wid:226,ac:2
02-05 13:42:53.989   30099-30147   C03F00/com.xbx...e/ArkCompiler  com.xbxyftx.HMVScode  I     [gc] SmartGC: app cold start finished
02-05 13:42:53.990   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25688, fId:0, T:0, I=0, M=0
02-05 13:42:53.991   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25688, TTHNI:fId: 0{ T: page, D: 6 };{ T: List, D: 16 };{ T: Row, D: 20 };
02-05 13:42:53.991   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25688, TTHRTI: T ClickRecognizer info: { T: Row };
02-05 13:42:53.993   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:25688, last id:-1
02-05 13:42:53.993   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:25688,wid:226,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-05 13:42:54.032   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move: 25689
02-05 13:42:54.033   30099-30573   C0390D/com.xbx...de/AceOverlay  com.xbxyftx.HMVScode  I     [(-1:100000:singleton)] RVS_ENABLE_CHECK Result: 0
02-05 13:42:54.043   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move, first: 25690-(2026-02-05 13:42:54.037ms), count: 1, last: ac: up: 25691
02-05 13:42:54.043   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:U:25691][OnPointerEvent:649] recv
02-05 13:42:54.043   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:1,InputId:25691,wid:226,ac:4
02-05 13:42:54.044   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25691, fId:0, T:1, I=0, M=0
02-05 13:42:54.044   30099-30099   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-05 13:42:54.045   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] CLK RACC, T: Row
02-05 13:42:54.047   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:25691, last id:25690
02-05 13:42:54.047   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:25691,wid:226,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-05 13:42:55.109   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: down: 25692
02-05 13:42:55.109   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:D:25692][OnPointerEvent:649] recv
02-05 13:42:55.109   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:2,InputId:25692,wid:226,ac:2
02-05 13:42:55.110   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25692, fId:0, T:0, I=0, M=0
02-05 13:42:55.110   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25692, TTHNI:fId: 0{ T: page, D: 6 };{ T: List, D: 16 };{ T: Row, D: 20 };
02-05 13:42:55.110   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25692, TTHRTI: T ClickRecognizer info: { T: Row };
02-05 13:42:55.111   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:25692, last id:25690
02-05 13:42:55.111   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:25692,wid:226,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-05 13:42:55.111   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move: 25693
02-05 13:42:55.204   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move, first: 25694-(2026-02-05 13:42:55.115ms), 25709, count: 16, last: ac: up: 25710
02-05 13:42:55.204   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:U:25710][OnPointerEvent:649] recv
02-05 13:42:55.204   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:3,InputId:25710,wid:226,ac:4
02-05 13:42:55.205   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25710, fId:0, T:1, I=0, M=0
02-05 13:42:55.205   30099-30099   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-05 13:42:55.205   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] CLK RACC, T: Row
02-05 13:42:55.206   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:25710, last id:25709
02-05 13:42:55.206   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:25710,wid:226,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-05 13:43:02.078   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: down: 25711
02-05 13:43:02.078   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:D:25711][OnPointerEvent:649] recv
02-05 13:43:02.078   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:4,InputId:25711,wid:226,ac:2
02-05 13:43:02.079   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25711, fId:0, T:0, I=0, M=0
02-05 13:43:02.079   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25711, TTHNI:fId: 0{ T: page, D: 6 };{ T: List, D: 16 };{ T: Row, D: 20 };
02-05 13:43:02.080   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25711, TTHRTI: T ClickRecognizer info: { T: Row };
02-05 13:43:02.081   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:25711, last id:25709
02-05 13:43:02.081   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:25711,wid:226,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-05 13:43:02.081   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move: 25712
02-05 13:43:02.209   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [][OnPointerEvent:242] ac: move, first: 25713-(2026-02-05 13:43:02.083ms), 25734, count: 22, last: ac: up: 25735
02-05 13:43:02.209   30099-30099   C02805/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [P:U:25735][OnPointerEvent:649] recv
02-05 13:43:02.209   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     HandleInputEvent: eid:5,InputId:25735,wid:226,ac:4
02-05 13:43:02.210   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] ITK Id:25735, fId:0, T:1, I=0, M=0
02-05 13:43:02.210   30099-30099   C0391E/com.xbx...de/AceGesture  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Click try accept
02-05 13:43:02.210   30099-30099   C03951/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] CLK RACC, T: Row
02-05 13:43:02.211   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] File selected: file:/docs/storage/Users/currentUser/HMVScode/md.md
02-05 13:43:02.212   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [FileService] readFile: file:/docs/storage/Users/currentUser/HMVScode/md.md -> actualPath: file:/docs/storage/Users/currentUser/HMVScode/md.md
02-05 13:43:02.212   30099-30099   C03919/com.xbx...InputTracking  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Consumed id:25735, last id:25734
02-05 13:43:02.212   30099-30099   C04213/com.xbxy...InputKeyFlow  com.xbxyftx.HMVScode  I     ConsumePointerEventInner: InputId:25735,wid:226,pointId:0,srcType:2,rect:[0,0,2800,1840],notify:1
02-05 13:43:02.214   30099-30099   C01320/com.xbx...MVScode/JsEnv  com.xbxyftx.HMVScode  W     [source_map145]the stack without line info
02-05 13:43:02.214   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  E     [FileService] readFile error: {"code":13900002}
02-05 13:43:02.224   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  E     [Index] Failed to open file: 打开文件失败: {"name":"FileServiceError","code":"READ_ERROR"}
02-05 13:43:02.226   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     JsConstructor: NapiWebviewController::JsConstructor start
02-05 13:43:02.226   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_native_object.cc:136] NativeArkWeb BindWebTagToWebInstance webTag:arkweb:2
02-05 13:43:02.228   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] InitMagnifier
02-05 13:43:02.232   30099-30099   C02B3F/com.xbx...PROCESSENGINE  com.xbxyftx.HMVScode  I     [video_processing_client.cpp][CheckService 352] Try to check VPE SA.
02-05 13:43:02.232   30099-30099   C057C2/com.xbx...PCObjectProxy  com.xbxyftx.HMVScode  E     PrintErrorDetailedInfo 163: failed, handle:0 error:7 desc:*.accessToken proxy:3213957120 time:13336590914684
02-05 13:43:02.232   30099-30099   C02B3F/com.xbx...PROCESSENGINE  com.xbxyftx.HMVScode  I     [video_processing_client.cpp][CheckService 365] Loading VPE SA...
02-05 13:43:02.232   30099-30099   C02B3F/com.xbx...PROCESSENGINE  com.xbxyftx.HMVScode  E     [nodict][video_processing_client.cpp][GetFeatureParameter 79] proxy is null!
02-05 13:43:02.232   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::OnAttachToFrameNode, web id = -1
02-05 13:43:02.233   30099-30099   C02B3F/com.xbx...PROCESSENGINE  com.xbxyftx.HMVScode  I     [video_processing_client.cpp][CheckService 346] SA is loading, so wait for the result directly .
02-05 13:43:02.233   30099-30099   C02B3F/com.xbx...PROCESSENGINE  com.xbxyftx.HMVScode  E     [nodict][video_processing_client.cpp][GetFeatureParameter 79] proxy is null!
02-05 13:43:02.233   30099-30099   C03900/com.xbx....HMVScode/Ace  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] AddTranslateListener WebView nodeId:152
02-05 13:43:02.233   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] SetNestedScrollExt nestedScroll: NestedScrollOptionsExt scrollUp: 1, scrollDown: 1, scrollLeft: 1, scrollRight: 1
02-05 13:43:02.233   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] renderMode is 0
02-05 13:43:02.233   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::onNativeMessage connect 
02-05 13:43:02.233   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::onNativeMessage DisconnectFunction
02-05 13:43:02.233   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebviewController::innerCanIUse
02-05 13:43:02.233   30099-30099   C02C0B/BEGET                    com.xbxyftx.HMVScode  E     [init_syscap.c:52]Failed get paramName.
02-05 13:43:02.233   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     canIUse SystemCapability.Security.Huks.CryptoExtension supported is false
02-05 13:43:02.234   30099-30099   C01402/com.xbx...VScode/RSNode  com.xbxyftx.HMVScode  I     RSNode::AddChild, Id: 129274220642423, SurfaceNode:[Id: 129274220642424, name: RosenWeb]
02-05 13:43:02.234   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] web controller is nullptr
02-05 13:43:02.234   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Web isInit 1
02-05 13:43:02.235   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::UpdateBackgroundColorRightNow, color=#FFFFFFFF, web id = -1
02-05 13:43:02.235   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] DragDrop WebEventHub init drag event ok
02-05 13:43:02.235   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] DragDrop, init drag event done, isReceivedArkDrag_ is 0
02-05 13:43:02.235   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::CheckAndSetWebNestedScrollExisted
02-05 13:43:02.235   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::CheckAndSetWebNestedScrollExisted
02-05 13:43:02.235   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::OnRenderToForeground
02-05 13:43:02.236   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::OnActive webId:-1, isActive:1
02-05 13:43:02.236   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::SetActiveStatusInner webId:-1, isActive_:1, isActive:1, isForce:0
02-05 13:43:02.237   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Not safe area, drawsize_ : [2289.00 x 1627.00], web id : -1
02-05 13:43:02.237   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::UpdateImageOverlayStatus, event = 3, status = 0
02-05 13:43:02.238   30099-30099   C03934/com.xbx...de/AceUIEvent  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] exp=1 ratio=0.992010 152-145 reason=1
02-05 13:43:02.238   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::OnVisibleAreaChange webId:-1, isVisible:1, old_isVisible:1, isVisibleActiveEnable:1, isDialogNested:0, isFocus:0
02-05 13:43:02.239   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetAvoidAreaByType: win [226 HMVScode0] type 0 times 4 area top [0 0 2800 82] 
02-05 13:43:02.240   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetAvoidAreaByType: win [226 HMVScode0] type 1 times 5 area empty
02-05 13:43:02.240   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     GetAvoidAreaByType: win [226 HMVScode0] type 4 times 6 area bottom [910 1781 980 59] 
02-05 13:43:02.240   30099-30099   C04209/com.xbx...Scode/WMSImms  com.xbxyftx.HMVScode  I     RegisterAvoidAreaChangeListener: win 226
02-05 13:43:02.240   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] RegisterAvoidAreaChangeListener result:0
02-05 13:43:02.249   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     GetArkwebLibPath: get arkweb lib path: /data/storage/el1/bundle/arkwebcore/libs/arm64
02-05 13:43:02.249   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     GetArkwebNameSpace: get arkweb name space: nweb_ns
02-05 13:43:02.249   30099-30099   C03F00/MUSL-LDSO                com.xbxyftx.HMVScode  W     dlns_create2 ns is exist.
02-05 13:43:02.249   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  E     ArkWebBridgeHelperLoadLibFile: dlns_create failed for '/data/storage/el1/bundle/arkwebcore/libs/arm64': Invalid argument (errno=17)
02-05 13:43:02.249   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     ArkWebBridgeHelperLoadLibFile: succeed to load lib file /data/storage/el1/bundle/arkwebcore/libs/arm64/libarkweb_engine.so
02-05 13:43:02.249   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     ArkWebBridgeHelperSharedInit: g_webEngineInitFlag set to true. setActiveWebEngineVersion will be ignored.
02-05 13:43:02.250   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix web.debug.trace remoteWatcherId 634 success
02-05 13:43:02.250   30099-30099   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix web.render.dump remoteWatcherId 634 success
02-05 13:43:02.250   30099-30140   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     DispatchAllWatcherInfo: no observers in this key: web.debug.trace
02-05 13:43:02.250   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     AttachSysPropObserver: properties key invalid in attach
02-05 13:43:02.250   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [hitrace_adapter_impl.cpp:97] hitrace enableflags: 0
02-05 13:43:02.251   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1022] CreateNWeb NWebId: 1, size 1*1, enhance surface 0
02-05 13:43:02.251   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_output_handler.cc:105] NWeb size change from 0*0 to 1*1, nweb id = 0
02-05 13:43:02.251   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [nweb_output_handler.cc:134] resize for emulator early failed, result = 40001000
02-05 13:43:02.254   30099-30099   C02F26/com.xbxy...DSMM_SERVICE  com.xbxyftx.HMVScode  I     [IsAdvSecModeOn]:GetParameter got AdvSecMode: 0
02-05 13:43:02.254   30099-30099   C02F26/com.xbxy...DSMM_SERVICE  com.xbxyftx.HMVScode  I     [IsAdvSecModeOn]:AdvSecMode OFF
02-05 13:43:02.255   30099-30099   C02F26/com.xbxy...DSMM_SERVICE  com.xbxyftx.HMVScode  I     [DsmmAdvSecModeGetByFeature]:DsmmAdvSecModeGetByFeature: AdvSecMode OFF, skip load SA
02-05 13:43:02.257   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_advanced_security.cc:70] get advanced sec val 0
02-05 13:43:02.257   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:917] file ohos-command-line does not exist.
02-05 13:43:02.258   30099-30099   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  W     redo Connect
02-05 13:43:02.258   30099-30099   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     Start to ConnectService
02-05 13:43:02.258   30099-30099   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     GetSystemAbilityManager success
02-05 13:43:02.258   30099-30099   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     GetSystemAbility success
02-05 13:43:02.258   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1485] Init web engine, native window opt for emulator in init, result = 0
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:722] HasBackgroundColorWithInit, background color = -1
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:701] DrapDrop InitAppTempDir --ohos-temp-dir=/data/storage/el2/base/haps/entry/temp
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:808] NWebDelegate::Init incognito_mode:0[shared]
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_delegate.cc:2230] NWebDelegate::InitializeCef, is_initialized:0
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:321] NWebApplication::RunAfterContextInitialized, set complete_callback_
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:85] NWebApplication::InitializeCef, is_initialized:0
02-05 13:43:02.259   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_file_writer_cleaner.cc:83] GetDeletePendingFiles.
02-05 13:43:02.260   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_file_writer_cleaner.cc:92] GetDeletePendingFiles get pending_files end.
02-05 13:43:02.260   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [context.cc:513] CefContext::Initialize
02-05 13:43:02.260   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [content_main_runner_impl.cc:890] ContentMainRunnerImpl::Initialize::kTraceConfigSharedMemoryDescriptor is registered.
02-05 13:43:02.261   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [icu_util.cc:192] /data/storage/el1/bundle/nweb/entry/resources/rawfile/icudtl.dat not exists.
02-05 13:43:02.261   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [icu_util_ohos.h:56] icu data file length: 10467680
02-05 13:43:02.261   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [date_time_format_adapter_impl.cpp:125] stop time_zone listen.
02-05 13:43:02.261   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [date_time_format_adapter_impl.cpp:128] stop listen fail. Please RegTimezoneEvent first.
02-05 13:43:02.262   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  W     [resource_util.cc:87] Please customize CefSettings.root_cache_path for your application. Use of the default value may lead to unintended process singleton behavior.
02-05 13:43:02.263   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [filesystem_posix.cc:63] mkdir : No such file or directory (2)
02-05 13:43:02.263   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [crash_reporting.cc:209] Crash reporting enabled for process: browser
02-05 13:43:02.264   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [trace_startup_config.cc:309] TraceStartupConfig::EnableFromConfigFile::trace_config_file: /data/storage/el1/bundle/arkwebcore/libs/ohos-trace-config.json
02-05 13:43:02.264   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [trace_startup_config.cc:311] The trace config file does not exist.
02-05 13:43:02.265   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_policy_handler.cc:86] InitPolicyFromFile policy_file_path_: /data/storage/el2/base/cache/web/BrowserEnterprisePolicy.json
02-05 13:43:02.265   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_policy_handler.cc:98] InitPolicyFromFile initial policy: {}
02-05 13:43:02.271   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [migration_filter.cc:73] enter FilterOnLoad
02-05 13:43:02.271   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [migration_filter.cc:132] MigrationFinished(0)
02-05 13:43:02.271   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [migration_filter.cc:82] exit FilterOnLoad, already success
02-05 13:43:02.271   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [policy_loader_ohos.cc:72] PolicyLoaderOhos Init api version: 22
02-05 13:43:02.271   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_policy_handler.cc:119] BrowserPolicyHandler policy bundle gotten
02-05 13:43:02.275   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [memory_system.cc:246] gwp-asan is off for this process, enable_type = none, process_type = 
02-05 13:43:02.276   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [data_pack_for_include.cc:171] DataPack::LoadFromPath resources/rawfile/arkweb_100_percent.pak, data file length: 1078357
02-05 13:43:02.276   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [data_pack_for_include.cc:171] DataPack::LoadFromPath resources/rawfile/arkweb_200_percent.pak, data file length: 1474303
02-05 13:43:02.276   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [data_pack_for_include.cc:171] DataPack::LoadFromPath resources/rawfile/locales/zh-CN.pak, data file length: 521203
02-05 13:43:02.276   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [data_pack_for_include.cc:171] DataPack::LoadFromPath resources/rawfile/resources.pak, data file length: 10018054
02-05 13:43:02.277   30099-30830   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_policy_handler.cc:172] BrowserPolicyHandler add new observer
02-05 13:43:02.277   30099-30830   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [policy_loader_ohos.cc:45] Recv edm policy change event and reload policy.
02-05 13:43:02.277   30099-30830   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_policy_handler.cc:119] BrowserPolicyHandler policy bundle gotten
02-05 13:43:02.280   30099-30832   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30832, role: 0
02-05 13:43:02.282   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][RegisterDevListener:1803] enter
02-05 13:43:02.282   30099-30099   C02800/com.xbx...putDeviceImpl  com.xbxyftx.HMVScode  I     [][RegisterDevListener:41] Register listener of change of input devices
02-05 13:43:02.282   30099-30099   C02800/com.xbx...putDeviceImpl  com.xbxyftx.HMVScode  I     [][StartListeningToServer:310] Start monitoring changes of input devices
02-05 13:43:02.282   30099-30099   C02800/com.xbx...putDeviceImpl  com.xbxyftx.HMVScode  I     [][RegisterDevListener:76] Succeed to register listener of change of input devices
02-05 13:43:02.282   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][RegisterDevListener] leave
02-05 13:43:02.283   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:228] DeviceDataManager ignore this mouse device
02-05 13:43:02.287   30099-30099   C015B0/com.xbx...tMgrSubSystem  com.xbxyftx.HMVScode  E     RegisterNetConnCallback failed
02-05 13:43:02.287   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [net_connect_adapter_impl.cpp:360] register NetConnCallback failed, ret = 201.
02-05 13:43:02.287   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [network_change_notifier_passive_for_include.cc:272] register ohos net connect callback failed.
02-05 13:43:02.288   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [net_connect_adapter_impl.cpp:156] get all nets failed, ret = 201.
02-05 13:43:02.295   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     RegNetProxyEvent: reg netproxy event
02-05 13:43:02.299   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_features.cc:191] hmz1106, kDefaultPassthroughCommandDecoder, DISABLE
02-05 13:43:02.302   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     RegisterBackgroundTaskPolicyCallback: BackgroundTaskAdapterImpl:: applicationStateChangeCallback_ is registered.
02-05 13:43:02.302   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [background_task_holder.cc:67] BackgroundTaskHolder::backgroundStateChangeCallbackAdapter_ is registered.
02-05 13:43:02.302   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [background_task_policy.cc:84] [BGTASKPOLICY] OnPassedToGraph
02-05 13:43:02.302   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_features.cc:191] hmz1106, kDefaultPassthroughCommandDecoder, DISABLE
02-05 13:43:02.303   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30840, role: 2
02-05 13:43:02.303   30099-30840   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_features.cc:191] hmz1106, kDefaultPassthroughCommandDecoder, DISABLE
02-05 13:43:02.304   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30843, role: 4
02-05 13:43:02.305   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [cdm_registration.cc:240] [DRM]AddSoftwareSecureWidevine
02-05 13:43:02.305   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [cdm_registration.cc:426] [DRM]AddWiseplay
02-05 13:43:02.305   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [cdm_registration.cc:418] [DRM]AddSoftwareSecureWiseplay
02-05 13:43:02.305   30099-30840   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_features.cc:191] hmz1106, kDefaultPassthroughCommandDecoder, DISABLE
02-05 13:43:02.305   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [media_stream_manager.cc:1532] MSM::InitializeMaybeAsync([hash=6fead0347359aff6])
02-05 13:43:02.306   30099-30840   C01400/com.xbx...OpenGLWrapper  com.xbxyftx.HMVScode  I     Failed to get env NEED_OPENGL or the value of NEED_OPENGL is not 1
02-05 13:43:02.306   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [media_stream_manager.cc:1532] MDM::MediaDevicesManager()
02-05 13:43:02.306   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [media_stream_manager.cc:1532] MSM::MediaStreamManager([hash=6fead0347359aff6])
02-05 13:43:02.306   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30845, role: 0
02-05 13:43:02.307   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [event_creator.cc:105] event_message: network qualicy changed http_rtt_ms -1 transport_rtt_ms -1 downstream_throughput_kbps -1 effective_connection_type Offline
02-05 13:43:02.308   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [keyed_service_base_factory_for_include.cc:32] WARNING: read file empty: /data/storage/el1/bundle/arkwebcore/etc/disabled_services.json
02-05 13:43:02.309   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [keyed_service_base_factory_for_include.cc:32] WARNING: read file empty: /data/storage/el1/bundle/arkwebcore/etc/disabled_services.json
02-05 13:43:02.310   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_network_service_ext.cc:162] Register network context and set network timeout 0 second(s)
02-05 13:43:02.310   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [page_res_parallel_preload_mgr_impl.cc:37] PRPPreload.GetPRParallelPreloadModeInner is not Mobile or PC, NONE
02-05 13:43:02.310   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_network_service_ext.cc:181] Network service set network timeout 30 second(s)
02-05 13:43:02.310   30099-30840   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix debug.graphic.debug_layer remoteWatcherId 634 success
02-05 13:43:02.317   30099-30840   C0140A/com.xbx...iGraphicsCore  com.xbxyftx.HMVScode  I     IGraphicsCoreGameOptPrepare(433): [0020080c] pn: com.xbxyftx.HMVScode, p: 30099
02-05 13:43:02.317   30099-30840   C0140A/com.xbx...iGraphicsCore  com.xbxyftx.HMVScode  I     IGraphicsCoreGameOptPrepare(450): [0030080c] no spt app: com.xbxyftx.HMVScode
02-05 13:43:02.317   30099-30840   C01400/com.xbx...OpenGLWrapper  com.xbxyftx.HMVScode  E     EglWrapperHookLayer init Failed!
02-05 13:43:02.317   30099-30840   C01400/com.xbx...OpenGLWrapper  com.xbxyftx.HMVScode  E     invalid display pointer.
02-05 13:43:02.317   30099-30840   C01400/com.xbx...OpenGLWrapper  com.xbxyftx.HMVScode  E     EGLDislay is invalid.
02-05 13:43:02.317   30099-30840   C01400/com.xbx...OpenGLWrapper  com.xbxyftx.HMVScode  W     ThreadPrivateDataCtl::SetError error = 12296.
02-05 13:43:02.317   30099-30840   C0470A/com.xbx...meServicePerf  com.xbxyftx.HMVScode  I     [(CreateReportThread:101)]GameService-graphics: begin create thread
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     LoadApsPlugin
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  W     redo Connect
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     Start to ConnectService
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     GetSystemAbilityManager success
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  I     GetSystemAbility success
02-05 13:43:02.318   30099-30840   C057C2/com.xbx...PCObjectProxy  com.xbxyftx.HMVScode  E     PrintErrorDetailedInfo 180: failed, handle:29 error:29201 desc:(subErr:4 SubErrDesc:outer:operation not permitted) *.IApsManager proxy:3242363776 time:13336676823434
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  W     [ApsManagerProxy::RegisterGameFpsListener] Send Request faild code = 29201
02-05 13:43:02.318   30099-30840   C01409/com.xbx...e/APS_MANAGER  com.xbxyftx.HMVScode  E     ApsGameFpsController::RegisterGameFpsListener delete callback
02-05 13:43:02.319   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [browser_prefs.cc:2111] [DRM]RegisterProfilePrefs
02-05 13:43:02.320   30099-30840   C01490/com.xbx...HMVScode/BASE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  base munmap 0x6f00000000 len 0x100000000 fail
02-05 13:43:02.320   30099-30840   C01490/com.xbx...HMVScode/BASE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  process destroy 4g fail.
02-05 13:43:02.321   30099-30840   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  Device init, apimode 1, sys64
02-05 13:43:02.322   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [account_consistency_mode_manager.cc:77] Desktop Identity Consistency cannot be enabled as no OAuth client ID and client secret have been configured.
02-05 13:43:02.322   30099-30853   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  async worker started.
02-05 13:43:02.323   30099-30840   C02C03/PARAM_WATCHER            com.xbxyftx.HMVScode  I     Add watcher keyPrefix persist.graphic.profiler.beta_dfx remoteWatcherId 634 success
02-05 13:43:02.327   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [cookie_manager_impl_ext.cc:431] CefCookieManagerImplExt::SetNetWorkCookieManager cookie_manager_remote
02-05 13:43:02.327   30099-30856   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [cookie_manager_impl_ext.cc:407] CefCookieManagerImplExt::SetNetWorkCookieManagerRemoteAsync
02-05 13:43:02.327   30099-30856   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [cookie_manager_impl_ext.cc:385] CefCookieManagerImplExt::SetNetWorkCookieManagerRemoteComplete
02-05 13:43:02.328   30099-30840   C01490/com.xbx...code/VK_QUEUE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  ~QueueInternal start.
02-05 13:43:02.329   30099-30855   C01490/com.xbx...HMVScode/BASE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  Termiate softQHandler done.
02-05 13:43:02.329   30099-30840   C01490/com.xbx...HMVScode/BASE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  wait handler Termiated done.
02-05 13:43:02.329   30099-30840   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_factory_ohos.cc:112] create offscreen glsurface by surfacelessEGL.
02-05 13:43:02.330   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_extension_proxy_dispatcher.cc:40] NWebExtensionProxyDispatcher::NotifyProxyInfo
02-05 13:43:02.330   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_extension_proxy_dispatcher.cc:43] No web extension proxy listener
02-05 13:43:02.332   30099-30840   C01490/com.xbx...code/VK_QUEUE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  ~QueueInternal start.
02-05 13:43:02.332   30099-30840   C01490/com.xbx...HMVScode/BASE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  wait handler Termiated done.
02-05 13:43:02.332   30099-30858   C01490/com.xbx...HMVScode/BASE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  Termiate softQHandler done.
02-05 13:43:02.333   30099-30840   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_factory_ohos.cc:112] create offscreen glsurface by surfacelessEGL.
02-05 13:43:02.334   30099-30840   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [viz_main_impl.cc:85] VizNullHypothesis is disabled (not a warning)
02-05 13:43:02.335   30099-30859   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30859, role: 2
02-05 13:43:02.335   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [dynamic_frame_rate_decision.cc:49] start init curent_task_runner_
02-05 13:43:02.335   30099-30840   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30841, role: 0
02-05 13:43:02.336   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_network_service_ext.cc:162] Register network context and set network timeout 30 second(s)
02-05 13:43:02.342   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [libc_interceptor.cc:280] Your system is broken: dlsym doesn't work! This has been reported to be caused by Nvidia's libGL. You should expect time related functions to misbehave. https://bugs.chromium.org/p/chromium/issues/detail?id=16800
02-05 13:43:02.345   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [extension_registry_info_manager.cc:502] ExtensionRegistryInfoManager::init
02-05 13:43:02.346   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [task_queue_util.cc:99] extension is not service worker-based
02-05 13:43:02.346   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [extension_registry_info_manager.cc:683] ExtensionRegistryInfoManager::Loaded
02-05 13:43:02.346   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [notification_platform_bridge_ohos.cc:372] NotificationPlatformBridgeOhos::Close: id=app.background.crashed.ahfgeienlihckogmohjhadlkjgocpleb
02-05 13:43:02.346   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_notification_manager_delegate.cc:85] notification_delegate_listener is null
02-05 13:43:02.346   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [url_pattern_set.cc:298] Invalid url pattern: arkweb://resources/*
02-05 13:43:02.347   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [url_pattern_set.cc:298] Invalid url pattern: arkweb://resources/*
02-05 13:43:02.347   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [task_queue_util.cc:99] extension is not service worker-based
02-05 13:43:02.347   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [extension_registry_info_manager.cc:683] ExtensionRegistryInfoManager::Loaded
02-05 13:43:02.347   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [notification_platform_bridge_ohos.cc:372] NotificationPlatformBridgeOhos::Close: id=app.background.crashed.mhjfbmdgcfjbbpaeojofohoefgiehjai
02-05 13:43:02.347   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_notification_manager_delegate.cc:85] notification_delegate_listener is null
02-05 13:43:02.348   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [ua_push_config.cc:167] [UAPushLog]start ReadConfigInfoFromPrefs
02-05 13:43:02.348   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  E     [ua_push_config.cc:176] [UAPushLog]user_pref_value for PrefService: user_agent.push_config is not a dictionary or is not exit
02-05 13:43:02.348   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [alloy_browser_engine_global_config.cc:145] No value for PrefService: nweb_ex.browser_engine_global_config_info
02-05 13:43:02.348   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [alloy_browser_engine_global_config.cc:85] Can not upate browser engine global config for version is zero
02-05 13:43:02.348   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [request_context_impl.cc:280] CefRequestContextImpl::ExecuteWhenBrowserContextInitialized, not on ui
02-05 13:43:02.348   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_network_service_ext.cc:162] Register network context and set network timeout 30 second(s)
02-05 13:43:02.351   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [cookie_manager_impl_ext.cc:431] CefCookieManagerImplExt::SetNetWorkCookieManager cookie_manager_remote
02-05 13:43:02.351   30099-30868   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [cookie_manager_impl_ext.cc:407] CefCookieManagerImplExt::SetNetWorkCookieManagerRemoteAsync
02-05 13:43:02.351   30099-30868   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [cookie_manager_impl_ext.cc:385] CefCookieManagerImplExt::SetNetWorkCookieManagerRemoteComplete
02-05 13:43:02.355   30099-30845   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_network_service_ext.cc:162] Register network context and set network timeout 30 second(s)
02-05 13:43:02.355   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [alloy_browser_engine_global_config.cc:145] No value for PrefService: nweb_ex.browser_engine_global_config_info
02-05 13:43:02.355   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [request_context_impl.cc:280] CefRequestContextImpl::ExecuteWhenBrowserContextInitialized, not on ui
02-05 13:43:02.356   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [browser_process_impl_ext.cc:57] adblock path: /data/storage/el2/base/cache/web
02-05 13:43:02.356   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [context.cc:639] CefContext::OnContextInitialized
02-05 13:43:02.356   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [request_context_impl.cc:280] CefRequestContextImpl::ExecuteWhenBrowserContextInitialized, not on ui
02-05 13:43:02.356   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:184] NWebApplication::OnContextInitialized, begin
02-05 13:43:02.356   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:188] NWebApplication::OnContextInitialized, into callback
02-05 13:43:02.356   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:3775] NWebDelegate::OnContextInitializeComplete
02-05 13:43:02.356   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:340] NWebApplication::CreateBrowser
02-05 13:43:02.356   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:382] NWebApplication::CreateBrowser, 2
02-05 13:43:02.358   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [render_process_host_impl.cc:4934] Request to create a new rendering process, current count: 0 Max: 72
02-05 13:43:02.360   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [background_task_policy.cc:93] [BGTASKPOLICY] OnPageNodeAdded
02-05 13:43:02.360   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [background_task_policy.cc:193] BackgroundTaskPolicy::MaybeChangeBackgroundTask  page_node hash=8439a4932dbe168a visible_page_num_: 1 media_playing_num_: 0 audio_state_num_: 0 is_request_background_task_: 0
02-05 13:43:02.360   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [background_task_policy.cc:226] [BGTASKPOLICY] no change return
02-05 13:43:02.360   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [alloy_browser_host_impl.cc:194] AlloyBrowserHostImpl::CreateInternal, begin
02-05 13:43:02.361   30099-30099   C01C02/com.xbx....HMVScode/PBS  com.xbxyftx.HMVScode  I     PasteboardObserver# New Pasteboard Observer.
02-05 13:43:02.361   30099-30099   C01C01/com.xbx....HMVScode/PBC  com.xbxyftx.HMVScode  I     GetPasteboardService# GetPasteboardService start.
02-05 13:43:02.361   30099-30099   C01C01/com.xbx....HMVScode/PBC  com.xbxyftx.HMVScode  I     GetPasteboardService# Get PasteboardServiceProxy succeed.
02-05 13:43:02.362   30099-30099   C01C07/com.xbx...HMVScode/PBCA  com.xbxyftx.HMVScode  E     OH_Pasteboard_Subscribe# subscribe observer failed
02-05 13:43:02.363   30099-30140   C01C01/com.xbx....HMVScode/PBC  com.xbxyftx.HMVScode  I     OnAddSystemAbility# pasteboard service started
02-05 13:43:02.364   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [arkweb_web_contents_view_osr_ext.cc:42] CefWebContentsViewOSR::WebContentsCreated
02-05 13:43:02.364   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [alloy_browser_host_impl_utils.cc:266] SafeBrowsing enabled, creating safe browsing tab helper
02-05 13:43:02.364   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:1144] NWebHandlerDelegate::OnAfterCreated IsPopup 0
02-05 13:43:02.364   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [request_context_impl.cc:280] CefRequestContextImpl::ExecuteWhenBrowserContextInitialized, not on ui
02-05 13:43:02.364   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [request_context_impl.cc:280] CefRequestContextImpl::ExecuteWhenBrowserContextInitialized, not on ui
02-05 13:43:02.364   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [request_context_impl.cc:280] CefRequestContextImpl::ExecuteWhenBrowserContextInitialized, not on ui
02-05 13:43:02.364   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_file_writer_cleaner.cc:97] DeleteDownloadTempDir.
02-05 13:43:02.364   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [custom_crashpad_handler.cc:222] Start ReportCrashpadFiles .... crashpad_target_location is /data/storage/el2/base/crashpad
02-05 13:43:02.364   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [custom_crashpad_handler.cc:227] return ReportCrashpadFiles fail cause brower has no start crashpad_target_location is /data/storage/el2/base/crashpad
02-05 13:43:02.364   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [ark_web_frame_host_impl.cc:79] UpdatePixelRatio in browser CefFrameHostImpl start, ratio:1.8
02-05 13:43:02.365   30099-30099   C04201/com.xbx....HMVScode/DMS  com.xbxyftx.HMVScode  I     oh_display_manager.cpp OH_NativeDisplayManager_IsFoldable: [DMNDK] get display isFoldable=0.
02-05 13:43:02.365   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1416] GetVirtualPixelRatio ratio: 1.800000
02-05 13:43:02.365   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [nweb_autolayout.cc:49] Failed to read Config.json from 
02-05 13:43:02.365   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  W     [arkweb_browser_host_ext.cc:1752] CefBrowserHostBase::UpdateLocale no need to update locale
02-05 13:43:02.365   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1576] NWebImpl::InitWebEngine, isReady:1
02-05 13:43:02.365   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     StartListen: start netproxy listen
02-05 13:43:02.365   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     Changed: start NetProxy changed
02-05 13:43:02.365   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [proxy_config_service_ohos.cc:378] ohos_network ProxySettingsChangedTo has_proxy_override_ 0, proxy host 
02-05 13:43:02.365   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [proxy_config_service_ohos.cc:378] ohos_network ProxySettingsChangedTo has_proxy_override_ 0, proxy host 
02-05 13:43:02.365   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [proxy_config_service_ohos.cc:378] ohos_network ProxySettingsChangedTo has_proxy_override_ 0, proxy host 
02-05 13:43:02.365   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [proxy_config_service_ohos.cc:378] ohos_network ProxySettingsChangedTo has_proxy_override_ 0, proxy host 
02-05 13:43:02.366   30099-30099   C015B0/com.xbx...etConnManager  com.xbxyftx.HMVScode  I     registerCallback id:0.
02-05 13:43:02.366   30099-30099   C01305/com.xbx...HMVScode/Base  com.xbxyftx.HMVScode  E     [zip_file.cpp(Open:280)]realpath error: 2, pathName: /module_update/ArkWebCore/app/com.huawei.hmos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to initialize extractor for HAP file: /module_update/ArkWebCore/app/com.huawei.hmos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C01305/com.xbx...HMVScode/Base  com.xbxyftx.HMVScode  E     [zip_file.cpp(Open:280)]realpath error: 2, pathName: /system/app/com.ohos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to initialize extractor for HAP file: /system/app/com.ohos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to get ArkWeb version from any of the specified paths
02-05 13:43:02.366   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_safe_browsing_ua_push_config.cc:49] NWebSafeBrowsingUAPushConfig::EnableUAPushConfig, enable
02-05 13:43:02.366   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_impl.cc:1037] CreateNWeb NWebId: 1 successfully
02-05 13:43:02.366   30099-30099   C01305/com.xbx...HMVScode/Base  com.xbxyftx.HMVScode  E     [zip_file.cpp(Open:280)]realpath error: 2, pathName: /module_update/ArkWebCore/app/com.huawei.hmos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to initialize extractor for HAP file: /module_update/ArkWebCore/app/com.huawei.hmos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C01305/com.xbx...HMVScode/Base  com.xbxyftx.HMVScode  E     [zip_file.cpp(Open:280)]realpath error: 2, pathName: /system/app/com.ohos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to initialize extractor for HAP file: /system/app/com.ohos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.366   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to get ArkWeb version from any of the specified paths
02-05 13:43:02.367   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1107] NWebImpl::InitializeWebEngine, begin
02-05 13:43:02.367   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:917] file ohos-command-line does not exist.
02-05 13:43:02.367   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:85] NWebApplication::InitializeCef, is_initialized:1
02-05 13:43:02.367   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:89] has initialized cef.
02-05 13:43:02.367   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     InitWebEngine: succeed to init web engine
02-05 13:43:02.367   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:707] RegisterNWebHandler
02-05 13:43:02.368   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.368   30099-30099   C02802/com.xbx...lEventHandler  com.xbxyftx.HMVScode  I     [][ReadMaxTouchPoints:318] Config of touchscreen.MaxTouchPoints:10
02-05 13:43:02.368   30099-30099   C02802/com.xbx...lEventHandler  com.xbxyftx.HMVScode  I     [][ReadMaxTouchPoints:330] touchscreen.MaxTouchPoints:10
02-05 13:43:02.368   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.368   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.369   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_preference_delegate.cc:424] Put JavaScript Enabled:1
02-05 13:43:02.371   30099-30099   C02B91/com.xbx...ode/AVSession  com.xbxyftx.HMVScode  I     [CurlSetRequestOptions]DoDownload curl easy_perform failure: URL using bad/illegal format or missing URL
02-05 13:43:02.372   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     OH_NativeArkWeb_BindWebTagToWebInstance: native OH_NativeArkWeb_BindWebTagToWebInstance webTag: arkweb:1
02-05 13:43:02.372   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_native_object.cc:136] NativeArkWeb BindWebTagToWebInstance webTag:arkweb:1
02-05 13:43:02.372   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [arkweb_native_object.cc:67] NativeArkWeb valid callback is nullptr
02-05 13:43:02.372   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  I     OH_NativeArkWeb_GetJavaScriptProxyValidCallback: native OH_Web_GetValidCallback, webTag: arkweb:1
02-05 13:43:02.372   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  W     SetWebId: native validCallback is null, callback nothing
02-05 13:43:02.372   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  E     ParseString: Not a valid napi string
02-05 13:43:02.372   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:2721] RegisterArkJSfunction name : harmonyBridge
02-05 13:43:02.373   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_inputmethod_handler.cc:1491] NWebInputMethodHandler::SetWindowIdForIME windowId: 226
02-05 13:43:02.373   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  W     ParsePerfConfig: not found perf config for web_config: LowerFrameRateConfig/visibleAreaRatio
02-05 13:43:02.373   30099-30099   C04500/com.xbx...Scode/webview  com.xbxyftx.HMVScode  W     ParsePerfConfig: not found perf config for web_config: LowerFrameRateConfig/visibleAreaRatioV2
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] visibleRatio lenth is over 4.
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  E     [(100000:100000:scope)] visibleRatio lenth is over 4.
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] max visible rate to lower frame rate:0.100000
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] max visible rate to half frame rate:0.300000
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] RegisterSurfaceOcclusionChangeCallback succeed, surfacenode id:129274220642424, ret: 0
02-05 13:43:02.373   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1707] NWebImpl::SetDrawMode 0, nweb_id = 1
02-05 13:43:02.373   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:1723] NWebImpl::SetFitContentMode 0, nweb_id = 1
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Web register contextMenu life cycle callback.
02-05 13:43:02.373   30099-30099   C03926/com.xbx...code/AceTheme  com.xbxyftx.HMVScode  W     [(100000:100000:scope)] style 125829872 not contains hyperlink_pattern!
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDataDetectorAdapter::UpdateDataDetectorConfig
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDataDetectorAdapter::SetSelectDataDetectorConfig start
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::InitSelectDataDetector
02-05 13:43:02.373   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Web InitAIDetectResult
02-05 13:43:02.373   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:3952] NWebDelegate::SetForceEnableZoom 0
02-05 13:43:02.373   30099-30099   C01305/com.xbx...HMVScode/Base  com.xbxyftx.HMVScode  E     [zip_file.cpp(Open:280)]realpath error: 2, pathName: /module_update/ArkWebCore/app/com.huawei.hmos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.373   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to initialize extractor for HAP file: /module_update/ArkWebCore/app/com.huawei.hmos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.373   30099-30099   C01305/com.xbx...HMVScode/Base  com.xbxyftx.HMVScode  E     [zip_file.cpp(Open:280)]realpath error: 2, pathName: /system/app/com.ohos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.373   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to initialize extractor for HAP file: /system/app/com.ohos.arkwebcore/ArkWebCore.hap
02-05 13:43:02.373   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     GetArkWebVersion: Failed to get ArkWeb version from any of the specified paths
02-05 13:43:02.374   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:6407] popup window opt for emulator in init, result = 0
02-05 13:43:02.374   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] RegisterNativeJavaScriptProxy arkMessager have 1 callback
02-05 13:43:02.374   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:6602] NWebImpl::RegisterNativeJavaScriptProxy arkMessager
02-05 13:43:02.374   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_preference_delegate.cc:424] Put JavaScript Enabled:1
02-05 13:43:02.374   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::UpdateBypassVsyncCondition condition:0
02-05 13:43:02.374   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_preference_delegate.cc:112] NWebPreferenceDelegate::SetBypassVsyncCondition condition:0
02-05 13:43:02.374   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [arkweb_browser_host_ext.cc:1421] ArkWebBrowserHostExtImpl::SetBypassVsyncCondition condition:0
02-05 13:43:02.374   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_preference_delegate.cc:518] set zoomControlAccess:1 zoom_control_access_:1
02-05 13:43:02.375   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_engine_impl.cc:103] SetWebDebuggingAccess(0), g_web_debugging_enabled[0], g_web_debugging_port[0]
02-05 13:43:02.375   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_preference_delegate.cc:575] Put Pinch Smooth Mode:0
02-05 13:43:02.376   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [feature_list_utils.cc:37] set Scrollbar:0 state:2
02-05 13:43:02.376   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [feature_list_utils.cc:56] scroll add feature: OverlayScrollbar state:2
02-05 13:43:02.376   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [feature_list_utils.cc:56] scroll add feature: ForceScrollbar state:2
02-05 13:43:02.376   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_preference_delegate.cc:1228] NWebPreferenceDelegate::PutWebMediaAVSessionEnabled enable:1
02-05 13:43:02.376   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [media_session_impl_for_include.cc:133] media avsession MediaSessionImpl::PutWebMediaAVSessionEnabled enable is: 1
02-05 13:43:02.376   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::UpdateGestureFocusMode mode:0
02-05 13:43:02.377   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:5892] SetSurfaceDensity: 1.8
02-05 13:43:02.377   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  E     IsExistCaptureTask: cameraManager_ is nullptr
02-05 13:43:02.377   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:1976] NWebDelegate::OnWindowShow, nweb id = 1
02-05 13:43:02.377   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [alloy_browser_host_impl_ext.cc:1732] AlloyBrowserHostImplExt::SetVisible nweb_id: 1, visible 1
02-05 13:43:02.377   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_output_handler.cc:105] NWeb size change from 1*1 to 2289*1627, nweb id = 1
02-05 13:43:02.377   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_output_handler.cc:132] need to resize for emulator early firstly, result = 0
02-05 13:43:02.379   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:221] NWebApplication::OnBeforeChildProcessLaunch
02-05 13:43:02.379   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:257] hap package is not decompresssed
02-05 13:43:02.379   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:221] NWebApplication::OnBeforeChildProcessLaunch
02-05 13:43:02.379   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_application.cc:257] hap package is not decompresssed
02-05 13:43:02.379   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [arkweb_render_widget_host_view_osr_utils.cc:77] compositor construct, widget = 1
02-05 13:43:02.379   30099-30873   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [feature_list_utils.cc:67] scrollbar modify features
02-05 13:43:02.380   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     SaveBrowserConnect: AafwkAppMgrClientAdapterImpl SaveBrowserConnect success!
02-05 13:43:02.380   30099-30873   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_child_process_launcher_helper_utils.cc:76] Initiate a request to AMS to create a child process, child type: renderer
02-05 13:43:02.380   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     StartChildProcess: AafwkAppMgrClientAdapterImpl::StartChildProcess, renderParamNew = /system/bin/web_render#--type=renderer#--string-annotations#--enable-crash-reporter=,#--user-data-dir=/data/storage/el2/base#--user-data-dir=/data/storage/el2/base/cache/web#--log-severity=info#--ohos-scheme-handler-custom-scheme={}#--user-hap-path=/data/storage/el1/bundle/entry.hap#--no-sandbox#--enable-touch-drag-drop#--enable-viewport#--no-zygote#--use-mobile-user-agent#--ozone-platform=headless#--bundle-installation-dir=/data/storage/el1/bundle#--bundle-name=com.xbxyftx.HMVScode#--virtual-pixel-ratio=1.800000#--ohos-enable-gwp-asan-type=none#--lang=zh-CN#--num-raster-threads=4#--gpu-rasterization-msaa-sample-count=1#--enable-main-frame-before-activation#--renderer-client-id=4#--time-ticks-at-unix-epoch=-1770256845641580#--launch-time-ticks=13336738144#--shared-files#--field-trial-handle=3,i,13610334412958861162,13634238228049375509,262144#--enable-features=ForceScrollbar,OverlayScrollbar,UseOzonePlatform#--disable-features=BackForwardCache,FencedFrames#--variations-seed-version#--enable-logging=stderr#--v=2#--v=2#--appEngineVersion=2, renderPid = 0
02-05 13:43:02.382   30099-30832   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [res_reporter.cc:53] ResReporter:[LoadLibrary] load library success!
02-05 13:43:02.382   30099-30832   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [res_reporter.cc:36] ResReporter::[Init] dlopen libframe_ui_intf.so success!
02-05 13:43:02.383   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [arkweb_render_widget_host_view_osr_utils.cc:189] CefRenderWidgetHostViewOSR::ShowWithVisibility compositor
02-05 13:43:02.383   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [render_widget_host_view_osr.cc:470] CefRenderWidgetHostViewOSR::ShowWithVisibility AttachToCompositor
02-05 13:43:02.383   30099-30140   C02B3F/com.xbx...PROCESSENGINE  com.xbxyftx.HMVScode  I     [video_processing_client.cpp][OnSaLoad 405] SA load success.
02-05 13:43:02.383   30099-30140   C01810/com.xbx...ode/SA_CLIENT  com.xbxyftx.HMVScode  W     OnLoadSaSucInner SA:66134 spend 1ms
02-05 13:43:02.383   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [navigation_request.cc:2687] event_message:  is_browser_initiated_: 1 was_redirected_: 0 (9A97DD4B9DEB0125914F82FEBEBEA8DC)
02-05 13:43:02.384   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_extension_tabs_dispatcher.cc:620] extension api listener is null
02-05 13:43:02.384   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:2089] NWebHandlerDelegate::OnBeforeBrowse
02-05 13:43:02.385   30099-30830   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [async_document_subresource_filter_for_include.cc:52] ruleset and user ruleset null
02-05 13:43:02.385   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Node: Web/secure_field RequestFocus.
02-05 13:43:02.385   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [display_cutout_host_ohos.cc:54] SetDisplayCutoutSafeArea x:0,0 y:0,0->x:0,0 y:0,33
02-05 13:43:02.385   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDataDetectorAdapter::GetAIMenu getting menu from ai_engine
02-05 13:43:02.395   30099-30099   C03F01/com.xbx...HMVScode/NAPI  com.xbxyftx.HMVScode  I     [NMM:339]Head:aes_sec, isApp:0
02-05 13:43:02.398   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Get AI entity menu from ai_engine
02-05 13:43:02.399   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] Web/secure_field RequestFocusImmediately isOnMainTree:1
02-05 13:43:02.399   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::HandleFocusEvent webId:1, needOnFocus: 0.
02-05 13:43:02.399   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:3178] NWebDelegate::OnFocus set web focus, nweb_id = 1
02-05 13:43:02.399   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:3269] nweb_handler request focus successful, source = 1, nweb_id = 1
02-05 13:43:02.399   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [render_widget_host_view_osr.cc:1668] CefRenderWidgetHostViewOSR::SetFocus:1
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_inputmethod_handler.cc:478] ReAttchOnfocus, don't need reattach input method
02-05 13:43:02.400   30099-30099   C0391C/com.xbx...code/AceFocus  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FocusSwitch end, Stack/secure_field onBlur, Web/secure_field onFocus, start: 2, end: 1, update: 2
02-05 13:43:02.400   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] current focus node: (Web/152). isDynamic: 0
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_inputmethod_handler.cc:1149] NWebInputMethodHandler is_editable_node_ = 0
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_impl.cc:5006] no hittest edit text, web close keyboard.
02-05 13:43:02.400   30099-30099   C03933/com.xbx...e/AceKeyboard  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] FrameNode(Web/152) notNeedSoftKeyboard.
02-05 13:43:02.400   30099-30099   C02D66/com.xbx...w-PerfMonitor  com.xbxyftx.HMVScode  I     ProcessJank: JankFrameMonitor::ProcessJank jank >= threshold
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 0
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 1
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 2
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 4
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 6
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.400   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 7
02-05 13:43:02.400   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 8
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 9
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:159] DeviceDataManager add touchpad device id: 11
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 12
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 13
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:146] DeviceDataManager add mouse device id: 14
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_device_data_manager_utils.cc:134] DeviceDataManager add keyboard device id: 14
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum:2825] enter
02-05 13:43:02.401   30099-30099   C02800/com.xbx...utManagerImpl  com.xbxyftx.HMVScode  I     [][GetMaxMultiTouchPointNum] leave
02-05 13:43:02.401   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [pointer_device_ohos.cc:156] MultiModal returns 10
02-05 13:43:02.404   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_application.cc:213] There is no web inited callback to run.
02-05 13:43:02.404   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_file_writer_cleaner.cc:78] OnBackgroundTaskFinished.
02-05 13:43:02.405   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [media_session_ohos.cc:120] MediaSessionInfoChanged media avsession before Prepare return for type invalid
02-05 13:43:02.405   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [battery_mgr_client_adapter_impl.cpp:106] Reg Battery Event
02-05 13:43:02.405   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [battery_status_manager_ohos.cc:138] start listening battery change
02-05 13:43:02.405   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [battery_status_manager_ohos.cc:47] start listen
02-05 13:43:02.405   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [battery_mgr_client_adapter_impl.cpp:112] start battery listen
02-05 13:43:02.406   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [battery_status_manager_ohos.cc:58] fisrt request battery info
02-05 13:43:02.406   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [battery_mgr_client_adapter_impl.cpp:180] request batteryInfo
02-05 13:43:02.406   30099-30099   C02921/com.xbx...de/BatteryFwk  com.xbxyftx.HMVScode  I     Connecting PowerMgrService success, pid=30099
02-05 13:43:02.407   30099-30888   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [create_video_capture_device_factory.cc:104] CreateVideoCaptureDeviceFactory
02-05 13:43:02.407   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [media_session_ohos.cc:182] MediaSessionImagesChangedmedia avsession avsession_adapter_ or metadata is null return
02-05 13:43:02.407   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [media_session_ohos.cc:201] MediaSessionPositionChanged media avsession avsession_adapter_ or position or av_position_ null
02-05 13:43:02.408   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:114] ResourceURLLoader url: resource://rawfile/editor/index.***, path: resources/rawfile/editor/index.html
02-05 13:43:02.409   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:160] GetRawFileData length: 13025
02-05 13:43:02.409   30099-30889   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30889, role: 2
02-05 13:43:02.409   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:245] ResourceURLLoader AddHeader mime_type text/html
02-05 13:43:02.409   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:250] total_bytes_to_send: 12001
02-05 13:43:02.410   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [navigation_url_loader_impl.cc:1109] is_download 0 must_download 0 known_mime_type 1 mime_type text/html
02-05 13:43:02.411   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_extension_manager_dispatcher.cc:220] NWebExtensionManagerDispatcher::OnExtensionInitLoadEndCallBack
02-05 13:43:02.411   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [nweb_extension_manager_dispatcher.cc:222] No web extension manager listener
02-05 13:43:02.412   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [render_frame_host_impl.cc:11605] event_message: commit navigation in main frame, routing_id: 1, url: ***, 9A97DD4B9DEB0125914F82FEBEBEA8DC
02-05 13:43:02.416   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_factory_ohos.cc:112] create offscreen glsurface by surfacelessEGL.
02-05 13:43:02.418   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_surface_egl_ohos.cc:44] CreateNativeViewGLSurfaceEGLOhos:: normal surface, widgetid = 1
02-05 13:43:02.419   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_surface_egl_ohos.cc:73] NativeViewGLSurfaceEGLOhos add window ref.
02-05 13:43:02.419   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_surface.cc:233] gl_surface, InitializeGLSurface
02-05 13:43:02.419   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [external_begin_frame_source_ohos.cc:86] ExternalBeginFrameSourceOHOS constructor!!!
02-05 13:43:02.419   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [external_begin_frame_source_ohos.cc:58] VSyncUserData constructor!!!
02-05 13:43:02.419   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [root_compositor_frame_sink_impl_ext.cc:63] rootCompositorFrameSinkImpl::SetDrawMode
02-05 13:43:02.419   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_display_utils.cc:211] SetDrawMode mode=0
02-05 13:43:02.419   30099-30859   C01406/com.xbx...code/OHOS::RS  com.xbxyftx.HMVScode  I     RSFrameRateLinker::Create id: 129274220642306
02-05 13:43:02.425   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30887, tid:30887, role: 2
02-05 13:43:02.425   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportStatusData: ReportWindowStatus status: 0, uid: 20020233, pid: 30887, windowId: 226, nwebId: 1, sn: 0
02-05 13:43:02.426   30099-30859   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30891, role: 0
02-05 13:43:02.426   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_display_utils.cc:296] Display::Resize newSize = 2290x1628
02-05 13:43:02.426   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [direct_renderer.cc:172] DirectRenderer::SetVisible status change, visible_ = 1
02-05 13:43:02.428   30099-30873   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [feature_list_utils.cc:67] scrollbar modify features
02-05 13:43:02.428   30099-30873   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [feature_list_utils.cc:67] scrollbar modify features
02-05 13:43:02.428   30099-30873   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_child_process_launcher_helper_utils.cc:76] Initiate a request to AMS to create a child process, child type: renderer
02-05 13:43:02.428   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     StartChildProcess: AafwkAppMgrClientAdapterImpl::StartChildProcess, renderParamNew = /system/bin/web_render#--type=renderer#--string-annotations#--enable-crash-reporter=,#--user-data-dir=/data/storage/el2/base#--user-data-dir=/data/storage/el2/base/cache/web#--log-severity=info#--ohos-scheme-handler-custom-scheme={}#--user-hap-path=/data/storage/el1/bundle/entry.hap#--no-sandbox#--enable-touch-drag-drop#--enable-viewport#--no-zygote#--use-mobile-user-agent#--ozone-platform=headless#--bundle-installation-dir=/data/storage/el1/bundle#--bundle-name=com.xbxyftx.HMVScode#--virtual-pixel-ratio=1.800000#--ohos-enable-gwp-asan-type=none#--lang=zh-CN#--num-raster-threads=4#--gpu-rasterization-msaa-sample-count=1#--enable-main-frame-before-activation#--renderer-client-id=3#--time-ticks-at-unix-epoch=-1770256845641580#--launch-time-ticks=13336786518#--shared-files#--field-trial-handle=3,i,13610334412958861162,13634238228049375509,262144#--enable-features=ForceScrollbar,OverlayScrollbar,UseOzonePlatform#--disable-features=BackForwardCache,FencedFrames#--variations-seed-version#--enable-logging=stderr#--v=2#--v=2#--appEngineVersion=2, renderPid = 0
02-05 13:43:02.434   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [async_layer_tree_frame_sink_utils.cc:79] web render log: first call SubmitCompositorFrame, local_surface_id = LocalSurfaceId(1, 1, 410A...)
02-05 13:43:02.442   30099-30840   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30099, tid:30890, role: 2
02-05 13:43:02.467   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_surface_egl_ohos.cc:189] NativeViewGLSurfaceEGLOhos::SetNativeInnerWeb is 0
02-05 13:43:02.467   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_surface_egl_ohos.cc:197] NativeViewGLSurfaceEGLOhos::SetBypassVsyncCondition is 0
02-05 13:43:02.471   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30892, tid:30892, role: 2
02-05 13:43:02.472   30099-30873   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportStatusData: ReportWindowStatus status: 0, uid: 20020233, pid: 30892, windowId: 226, nwebId: 1, sn: 1
02-05 13:43:02.472   30099-30889   C02510/com.xbx...code/load_hdi  com.xbxyftx.HMVScode  W     LoadHdiImpl failed to get symbol of 'MapperImplRelease', do_dlsym failed: Symbol not found: MapperImplRelease, version: null so=/vendor/lib64/chipsetsdk/libmapper_service_1.0.z.so
02-05 13:43:02.473   30099-30889   C02510/com.xbx...code/load_hdi  com.xbxyftx.HMVScode  W     LoadHdiImpl failed to get symbol of 'MetadataImplRelease', do_dlsym failed: Symbol not found: MetadataImplRelease, version: null so=/vendor/lib64/chipsetsdk/libmetadata_service_1.1.z.so
02-05 13:43:02.473   30099-30889   C02510/com.xbx...code/load_hdi  com.xbxyftx.HMVScode  W     LoadHdiImpl failed to get symbol of 'MapperImplRelease', do_dlsym failed: Symbol not found: MapperImplRelease, version: null so=/vendor/lib64/chipsetsdk/libmapper_service_1.2.z.so
02-05 13:43:02.474   30099-30889   C02510/com.xbx...code/load_hdi  com.xbxyftx.HMVScode  W     LoadHdiImpl failed to get symbol of 'MapperImplRelease', do_dlsym failed: Symbol not found: MapperImplRelease, version: null so=/vendor/lib64/passthrough/libmapper_service_1.3.z.so
02-05 13:43:02.474   30099-30889   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  [VULKAN DFX] Image event: Create; w: 2290; h: 1628; fmt: 12; id: 1319000000002596; type: 6; usage: 1288
02-05 13:43:02.475   30099-30889   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gl_surface_egl_ohos.cc:87] web render log: first call SwapBuffers, size = 2290x1628
02-05 13:43:02.475   30099-30891   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [external_begin_frame_source_ohos.cc:121] OnVSync data is nullptr
02-05 13:43:02.476   30099-30889   C01706/com.xbx...rameReportExt  com.xbxyftx.HMVScode  I     RsFrameReportExt:[LoadLibrary] load library success!
02-05 13:43:02.476   30099-30889   C01706/com.xbx...rameReportExt  com.xbxyftx.HMVScode  I     RsFrameReportExt:[Init] dlopen libframe_ui_intf.so success!
02-05 13:43:02.476   30099-30889   C01404/com.xbx...de/FrameSched  com.xbxyftx.HMVScode  I     [nodict]load library success!
02-05 13:43:02.672   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_render_process_host_impl_utils.cc:569] TEST0324 ReportKeyThread pid = 30887, tid = 30915, role = 0
02-05 13:43:02.672   30099-30832   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30887, tid:30915, role: 0
02-05 13:43:02.673   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_render_process_host_impl_utils.cc:550] [themefont] valid font:/data/themes/a/app/fonts/default.ttf
02-05 13:43:02.673   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [arkweb_render_process_host_impl_ext.cc:128] UpdateReaderModeConfig param reader_mode_config_data is null
02-05 13:43:02.675   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [date_time_format_adapter_impl.cpp:57] Reg Timezone Event.
02-05 13:43:02.675   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [date_time_format_adapter_impl.cpp:87] start time_zone listen.
02-05 13:43:02.678   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     AttachSysPropObserver: properties key invalid in attach
02-05 13:43:02.678   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [sysprop_render_observer_ohos.cc:101] SysPropRenderObserverOhosImpl start to listen system parameter.
02-05 13:43:02.691   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_render_process_host_impl_utils.cc:569] TEST0324 ReportKeyThread pid = 30887, tid = 30917, role = 2
02-05 13:43:02.691   30099-30832   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30887, tid:30917, role: 2
02-05 13:43:02.712   30099-30862   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [gpu_mojo_media_client_ohos.cc:69] GetPlatformSupportedVideoDecoderConfigs
02-05 13:43:02.763   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_render_process_host_impl_utils.cc:569] TEST0324 ReportKeyThread pid = 30892, tid = 30926, role = 0
02-05 13:43:02.763   30099-30832   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30892, tid:30926, role: 0
02-05 13:43:02.764   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [arkweb_render_process_host_impl_ext.cc:128] UpdateReaderModeConfig param reader_mode_config_data is null
02-05 13:43:02.765   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [render_process_state_handler.cc:111] RenderProcessStateHandler::UpdateRenderProcessState: ReportRenderProcessStatus render_id: 30892 report_background_state: 0
02-05 13:43:02.781   30099-30832   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_render_process_host_impl_utils.cc:569] TEST0324 ReportKeyThread pid = 30892, tid = 30929, role = 2
02-05 13:43:02.781   30099-30832   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30892, tid:30929, role: 2
02-05 13:43:02.790   30099-30099   C04500/com.xbx...de/webadapter  com.xbxyftx.HMVScode  I     ReportKeyThread: ReportKeyThread status: 0, uid: 20020233, pid: 30892, tid:30892, role: 2
02-05 13:43:02.808   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:1829] NWebHandlerDelegate::OnNavigationEntryCommitted
02-05 13:43:02.808   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::UpdateImageOverlayStatus, event = 3, status = 0
02-05 13:43:02.809   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [oh_autofill_manager.cc:568] Reset
02-05 13:43:02.810   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  E     [declarative_content_is_bookmarked_condition_delegate.cc:158] RequestIsBookmarked failed to search url in bookmarks
02-05 13:43:02.810   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:1667] NWebHandlerDelegate::OnLoadStart
02-05 13:43:02.810   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::UpdateImageOverlayStatus, event = 3, status = 0
02-05 13:43:02.810   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [arkweb_native_object.cc:76] NativeArkWeb load start callback is nullptr
02-05 13:43:02.810   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:5013] NWebHandlerDelegate::OnLoadStarted
02-05 13:43:02.810   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_contents_delegate.cc:701] load type = 1
02-05 13:43:02.810   30099-30859   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_display_utils.cc:296] Display::Resize newSize = 2289x1627
02-05 13:43:02.811   30099-30099   C02B91/com.xbx...ode/AVSession  com.xbxyftx.HMVScode  I     [CurlSetRequestOptions]DoDownload curl easy_perform failure: URL using bad/illegal format or missing URL
02-05 13:43:02.811   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [media_avsession_adapter_impl.cpp:411] UpdateMetaData return updated: 1
02-05 13:43:02.811   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [EditorComponent] Page begin loading
02-05 13:43:02.811   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::InitDataDetector
02-05 13:43:02.811   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDataDetectorAdapter::Init config changed = 1, enable = 0
02-05 13:43:02.811   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDataDetectorAdapter::SetNWebConfig WebId: 1
02-05 13:43:02.811   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_delegate.cc:5410] NWebDelegate::SetDataDetectorEnable: 0
02-05 13:43:02.818   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:114] ResourceURLLoader url: resource://rawfile/editor/codemirror-bundle.***, path: resources/rawfile/editor/codemirror-bundle.js
02-05 13:43:02.818   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:160] GetRawFileData length: 619496
02-05 13:43:02.819   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:245] ResourceURLLoader AddHeader mime_type text/javascript
02-05 13:43:02.819   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [file_url_loader_factory_for_include.cc:250] total_bytes_to_send: 618472
02-05 13:43:02.819   30099-30889   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  [VULKAN DFX] Image event: Create; w: 2289; h: 1627; fmt: 12; id: 1319000000002597; type: 6; usage: 1288
02-05 13:43:02.824   30099-30099   C02B91/com.xbx...ode/AVSession  com.xbxyftx.HMVScode  I     [CurlSetRequestOptions]DoDownload curl easy_perform failure: URL using bad/illegal format or missing URL
02-05 13:43:02.824   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [media_avsession_adapter_impl.cpp:411] UpdateMetaData return updated: 1
02-05 13:43:02.868   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:329] [cloud control] succeed to init safe browsing CloudControl client.
02-05 13:43:02.868   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:378] [cloud control] GetConfigFilePathByType, type is -1
02-05 13:43:02.869   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:413] [cloud control] GetConfigFilePathByType, type is -1
02-05 13:43:02.869   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:378] [cloud control] GetConfigFilePathByType, type is -1
02-05 13:43:02.869   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:413] [cloud control] GetConfigFilePathByType, type is -1
02-05 13:43:02.869   30099-30829   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [nweb_safe_browsing_cloud_control_config.cc:209] [cloud control] read changed_config_list_cache failed.
02-05 13:43:02.869   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:378] [cloud control] GetConfigFilePathByType, type is 2
02-05 13:43:02.869   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:413] [cloud control] GetConfigFilePathByType, type is 2
02-05 13:43:02.869   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:378] [cloud control] GetConfigFilePathByType, type is 2
02-05 13:43:02.870   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:413] [cloud control] GetConfigFilePathByType, type is 2
02-05 13:43:02.870   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:378] [cloud control] GetConfigFilePathByType, type is 3
02-05 13:43:02.870   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:413] [cloud control] GetConfigFilePathByType, type is 3
02-05 13:43:02.870   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:378] [cloud control] GetConfigFilePathByType, type is 3
02-05 13:43:02.871   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:413] [cloud control] GetConfigFilePathByType, type is 3
02-05 13:43:02.871   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  I     [safe_browsing_client.cpp:342] [cloud control] begin to check CloudControl update V2, req id is -1
02-05 13:43:02.871   30099-30829   C057C2/com.xbx...PCObjectProxy  com.xbxyftx.HMVScode  E     PrintErrorDetailedInfo 163: failed, handle:0 error:1 desc:*.accessToken proxy:3213957120 time:13337229947653
02-05 13:43:02.872   30099-30829   C01810/com.xbx...ode/SA_CLIENT  com.xbxyftx.HMVScode  E     LoadSystemAbility SA:66234 invalid error:1!
02-05 13:43:02.872   30099-30829   C01810/com.xbx...ode/SA_CLIENT  com.xbxyftx.HMVScode  E     LoadSystemAbility failed!
02-05 13:43:02.872   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  W     [sa_client_helper.h:42] failed to load system ability 66234,timeout is 4000ms
02-05 13:43:02.872   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  W     [safe_browsing_client.cpp:214] failed to load system ability
02-05 13:43:02.872   30099-30829   C04500/com.xbx...owsingService  com.xbxyftx.HMVScode  W     [safe_browsing_client.cpp:348] [cloud control] provider_ null
02-05 13:43:02.908   30099-30099   A01194/com.xbx...RKWEB-CONSOLE  com.xbxyftx.HMVScode  I     [CONSOLE:31] "[HMVSCodeEditor] Bundle loaded successfully", source: resource://rawfile/editor/codemirror-bundle.js (31)
02-05 13:43:02.916   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] OnRootLayerChanged width : 2289, height : 1628
02-05 13:43:02.920   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [browser_contents_delegate.cc:664] invokeVisualStateCallback success: 1
02-05 13:43:02.920   30099-30099   A04510/com.xbx....HMVScode/cef  com.xbxyftx.HMVScode  I     [arkweb_browser_contents_delegate_ext.cc:212] ArkWebBrowserContentsDelegateExt::OldPageNoLongerRendered
02-05 13:43:02.921   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:1745] NWebHandlerDelegate::OnPageVisible
02-05 13:43:02.921   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(-2:100000:singleton)] WebClientImpl::OnPageVisible override enter
02-05 13:43:02.921   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::OnPageVisible, web id = 1
02-05 13:43:02.921   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] The developer has not registered this OnPageVisible event
02-05 13:43:02.921   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:3185] OnScaleInited scale: 100
02-05 13:43:02.932   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Bridge] Editor is ready
02-05 13:43:02.932   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [Index] Editor bridge is ready
02-05 13:43:02.933   30099-30889   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  [VULKAN DFX] Image event: Create; w: 2289; h: 1627; fmt: 12; id: 1319000000002598; type: 6; usage: 1288
02-05 13:43:02.933   30099-30099   A01194/com.xbx...RKWEB-CONSOLE  com.xbxyftx.HMVScode  I     [CONSOLE:365] "[Editor] Initialized successfully", source: resource://rawfile/editor/index.html (365)
02-05 13:43:02.936   30099-30889   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  [VULKAN DFX] Image event: Create; w: 2289; h: 1627; fmt: 12; id: 1319000000002599; type: 6; usage: 1288
02-05 13:43:02.942   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [arkweb_content_subresource_filter_throttle_manager_ext.cc:155] [AdBlock] subresource map.size():0
02-05 13:43:02.943   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:1700] NWebHandlerDelegate::OnLoadEnd
02-05 13:43:02.943   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:1704] NWebHandlerDelegate:: Mainframe OnLoadEnd
02-05 13:43:02.943   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  W     [arkweb_native_object.cc:85] NativeArkWeb load end callback is nullptr
02-05 13:43:02.943   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [nweb_handler_delegate.cc:5025] NWebHandlerDelegate::OnLoadFinished
02-05 13:43:02.943   30099-30099   A03D00/com.xbx...MVScode/JSAPP  com.xbxyftx.HMVScode  I     [EditorComponent] Page end loading
02-05 13:43:02.943   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::OnScrollEndRecursive
02-05 13:43:02.944   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] OnPageFinished:Start to RunJsInit.
02-05 13:43:02.944   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebPattern::OnScrollEndRecursive
02-05 13:43:02.944   30099-30889   C01490/com.xbx...HMVScode/CORE  com.xbxyftx.HMVScode  W     [nodict]<HM_GPU> #  [VULKAN DFX] Image event: Create; w: 2289; h: 1627; fmt: 12; id: 1319000000002600; type: 6; usage: 1288
02-05 13:43:03.692   30099-30852   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [ohos_video_encode_accelerator.cc:44] ohos video encode accelerator create
02-05 13:43:03.692   30099-30852   C02B30/com.xbx...AVCodecClient  com.xbxyftx.HMVScode  I     {GetAVCodecProxy} In
02-05 13:43:03.694   30099-30852   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [ohos_video_encode_accelerator.cc:66] OHOSVideoEncodeAccelerator::GetSupportedProfiles, maxWidth: 4096, maxHeight: 4096, maxframeRate120
02-05 13:43:03.694   30099-30852   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [ohos_video_encode_accelerator.cc:66] OHOSVideoEncodeAccelerator::GetSupportedProfiles, maxWidth: 4096, maxHeight: 4096, maxframeRate120
02-05 13:43:03.694   30099-30852   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [ohos_video_encode_accelerator.cc:196] virtual void media::OHOSVideoEncodeAccelerator::Destroy()
02-05 13:43:03.694   30099-30852   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [ohos_video_encode_accelerator.cc:49] ohos video encode accelerator destroy
02-05 13:43:03.922   30099-30099   C0391B/com.xbx...VScode/AceWeb  com.xbxyftx.HMVScode  I     [(100000:100000:scope)] WebDelegate::EnableHardware, web id = 1
02-05 13:43:04.319   30099-30846   C0470A/com.xbx...meServicePerf  com.xbxyftx.HMVScode  E     [(HandleBufferData:65)]GameService-graphics: game opt disable
02-05 13:43:04.783   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [extension_updater.cc:397] Starting update check 0
02-05 13:43:04.783   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [extension_updater.cc:336] Extension ahfgeienlihckogmohjhadlkjgocpleb is not auto updateable
02-05 13:43:04.783   30099-30099   A04510/com.xbx...code/chromium  com.xbxyftx.HMVScode  I     [extension_updater.cc:336] Extension mhjfbmdgcfjbbpaeojofohoefgiehjai is not auto updateable

```

对于新建文件夹和新建文件功能可以参考以下官网AI回答。

````md
在鸿蒙（HarmonyOS）应用中创建文件夹和文件需通过文件管理接口实现，以下是具体步骤和代码示例：

**1. 创建文件夹**
使用 `fs.mkdirSync()` 或异步方法创建目录，支持递归创建：
```typescript
import { fileIo } from '@kit.CoreFileKit';

const dirPath = '/data/storage/el2/base/files/myFolder';
try {
  // 检查路径是否存在
  if (!fileIo.accessSync(dirPath)) {
    // 递归创建目录（recursive: true）
    fileIo.mkdirSync(dirPath, 0o775);  // 0o775为Unix权限位
    console.log('文件夹创建成功');
  }
} catch (err) {
  console.error(`创建失败: ${JSON.stringify(err)}`);
}
```

**2. 创建文件**
通过 `fileIo.openSync()` 的 `CREATE` 模式创建文件：
```typescript
const filePath = `${dirPath}/newFile.txt`;
try {
  // 创建并打开文件（读写模式）
  const fd = fileIo.openSync(filePath, 
    fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE);
  console.log('文件创建成功，文件描述符:', fd);
  
  // 写入内容（可选）
  const content = "Hello HarmonyOS!";
  fileIo.writeSync(fd, content);
  
  // 关闭文件
  fileIo.closeSync(fd);
} catch (err) {
  console.error(`文件操作失败: ${JSON.stringify(err)}`);
}
```

### 3. 关键参数说明
| **接口/参数**          | **作用**                               |
|------------------------|----------------------------------------|
| `fs.accessSync()`      | 检查路径是否存在                       |
| `fs.mkdirSync()`       | 同步创建目录                           |
| `recursive: true`      | 递归创建多级目录（如`a/b/c`）          |
| `fileIo.openSync()`    | 创建/打开文件                          |
| `OpenMode.CREATE`      | 不存在时创建文件                       |
| `OpenMode.READ_WRITE`  | 读写模式                               |

**4. 注意事项**
1. **路径权限**：  
    - 应用沙箱内路径通常为 `/data/storage/el2/base/...`
    - 访问公共目录需申请 `ohos.permission.FILE_ACCESS` 权限
2. **加密分区**：  
   支持 EL2/EL3/EL4 分区（参考网页7），通过不同路径区分：
   ```typescript
   const el3Path = 'data/app/el3/...';  // 切换加密分区
   ```
3. **错误处理**：  
    - 文件已存在时 `CREATE` 模式会覆盖原文件
    - 父目录不存在需启用 `recursive` 或先创建父目录

> 完整示例参考鸿蒙文件管理模块（网页7），包含文件监听、移动、重命名等扩展功能。实际开发中建议封装为工具类复用操作逻辑。
内容由AI生成，仅供参考

````
