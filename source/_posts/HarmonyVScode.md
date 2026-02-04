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