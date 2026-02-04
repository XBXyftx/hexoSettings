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
  <source src="28.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>
