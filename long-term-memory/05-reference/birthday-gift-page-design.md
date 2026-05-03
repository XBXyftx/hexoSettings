# 生日礼物特限页面 — 完整设计方案

## 执行摘要

为用户的母亲（一名经历过非典、新冠抗疫一线的护士）创建一个生日礼物特限页面。页面需要在现有 Hexo + Butterfly 博客框架下实现，在顶部导航栏新增入口，包含深情文案和庆祝动画。

**核心约束**：必须在 Hexo 渲染体系内工作，不可破坏现有主题修改和自定义功能。

---

## 一、Hexo 框架限制深度分析

### 1.1 页面渲染链路

```
source/birthday-gift/index.md
    ↓ Hexo Markdown渲染 (kramed引擎)
source/birthday-gift/index.html (中间产物)
    ↓ Butterfly theme/layout/*.pug 包装
    ↓ 注入到 #content-inner 容器中
public/birthday-gift/index.html (最终产物)
```

### 1.2 已验证的技术约束

| 约束项 | 具体表现 | 影响 |
|--------|---------|------|
| **主题Layout强制包装** | 所有 Markdown 页面默认被 `layout.pug` → `#content-inner` 包装 | 无法做真正的全屏独立页面 |
| **全局CSS污染** | 主题注入 `styles.css`、`transpancy.css` 等全局样式 | 自定义样式需高特异性覆盖 |
| **底部脚本强制加载** | `additional-js.pug` 无条件加载网络监控、懒加载、弹窗等脚本 | 可能产生控制台报错或性能开销 |
| **Canvas背景冲突** | `universe-optimized.js` 在 body 底部注入 `<canvas id="universe">` | 若页面使用同名 canvas 会冲突 |
| **预加载动画** | `preloader.enable: true` + `spincat` 样式 | 页面加载前会先显示主题预加载动画 |
| **PJAX限制** | `pjax.enable: false`（当前已关闭）| 无需考虑 PJAX 路由兼容 |
| **暗黑模式强制** | inject head 中硬编码 `<script>document.documentElement.setAttribute('data-theme','dark');</script>` | 页面默认在暗黑模式下渲染 |

### 1.3 突破约束的方案：`layout: false`

**关键发现**：现有项目中的 `source/coffer/README.md` 和 `source/coffer/USAGE.md` 使用了 `layout: false` front matter。

**作用**：告诉 Hexo 跳过 Butterfly 主题 layout 包装，直接输出渲染后的 HTML。

**但仍存的渲染处理**：
- Markdown 引擎仍会将文件内容从 Markdown 转为 HTML
- 内联 HTML 标签（`<style>`、`<script>`、`<div>`）会被保留
- 最终输出到 `public/birthday-gift/index.html`

**结论**：使用 `layout: false` + 内联完整 HTML 是最优方案——既能摆脱主题 layout 的 DOM 结构束缚，又能利用 Hexo 的页面路由系统。

---

## 二、技术实现方案

### 2.1 文件结构

```
source/
└── birthday-gift/
    ├── index.md              # 主页面（layout: false，内含完整HTML）
    ├── imgs/                 # 页面专属图片（妈妈的照片等）
    │   ├── photo-sars.webp   # 非典时期照片（如有）
    │   ├── photo-covid.webp  # 新冠时期照片（如有）
    │   ├── photo-family.webp # 家庭合照（如有）
    │   └── bg-heart.webp     # 装饰性背景图（可选）
    └── music/                # 背景音乐（可选）
        └── birthday-bgm.mp3
```

### 2.2 Front Matter 配置

```yaml
---
title: 献给最美的白衣天使
subtitle: 生日快乐，妈妈
date: 2026-05-04
description: 献给我最亲爱的妈妈——一位平凡而伟大的护士
keywords: [生日, 感恩, 护士, 母亲]
layout: false
---
```

### 2.3 导航菜单配置

在 `_config.butterfly.yml` 的 `menu:` 节中添加：

```yaml
menu:
  首页: / || fas fa-home
  文库||fas fa-list:
    归档: /archives/ || fas fa-archive
    标签: /tags/ || fas fa-tags
    秘密基地: /coffer/ || fa-solid fa-key
  Myself||fa-solid fa-i:
    友情链接: /link/ || fas fa-link
    昨日重现: /swiper/ || fa-solid fa-star-of-david
    关于我: /about/ || fas fa-heart
  留言板: /comments/ || fa-solid fa-comment
  连连看: /LianlianKan/ || fa-solid fa-gamepad
  MD在线编辑器: /MarkdownPreview/ || fa-solid fa-file-code
  妈妈生日快乐: /birthday-gift/ || fa-solid fa-heart-pulse   # ← 新增
```

> **图标选择**：`fa-solid fa-heart-pulse`（心跳/医疗主题）或 `fa-solid fa-cake-candles`（生日蛋糕主题）。建议用 `fa-heart-pulse`，呼应护士职业。

### 2.4 完整页面 HTML 骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>献给最美的白衣天使 | 生日快乐</title>
  <meta name="description" content="献给我最亲爱的妈妈">
  <!-- 页面专属样式 -->
  <style>
    /* 全局重置：隔离主题样式污染 */
    .birthday-page,
    .birthday-page * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .birthday-page {
      font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      background: #0a0a0f;
      color: #f0f0f0;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }
    /* ... 更多样式见第四节 ... */
  </style>
</head>
<body>
  <div class="birthday-page">
    <!-- 页面内容 -->
  </div>
  <!-- 页面专属脚本 -->
  <script>
    // ... 动画逻辑 ...
  </script>
</body>
</html>
```

**关键隔离策略**：
- 所有样式包裹在 `.birthday-page` 命名空间下
- 使用 `!DOCTYPE html` 确保浏览器以标准模式渲染
- 不显式引入任何主题 CSS/JS，完全独立

---

## 三、页面文案设计

### 3.1 文案风格定位

- **基调**：真诚、温暖、略带克制的深情（不煽情、不浮夸）
- **口吻**：儿子对母亲的倾诉，有敬意也有亲昵
- **语言**：用户的个人风格——口语化、有画面感、偶尔自嘲（"口才不太好"式的真诚）

### 3.2 页面结构文案

#### 第一幕：开场 — 心跳

```
【视觉】深色背景上，一个缓慢跳动的心电图/心跳动画
      线条由护士帽的轮廓渐变为心跳波形

【文字】
    2003 年，我还是个不太记事的孩子
    但我知道，那一年有一种叫「非典」的东西
    让很多人都害怕了

    而我的妈妈
    穿上了防护服，走进了隔离区

    （停顿，心跳声渐强）

    那时候我不懂什么叫「一线」
    我只知道，妈妈有几天没有回家
```

#### 第二幕：时间轴 — 二十年

```
【视觉】一条发光的水平时间轴，从 2003 延伸到 2020
      两个节点高亮闪烁

【文字】
    2020 年，新冠疫情来了

    这一次，我没有那么小了
    我在新闻里看到武汉封城
    看到一批批医护人员逆行出征

    而我的妈妈
    这次站在了后方
    但她做的事，同样重要——

    她为那些即将奔赴武汉的医生护士们
    一遍又一遍地演示防护服的穿脱
    每一个细节都不放过
    因为你们知道，一个疏漏
    就可能让一个人回不来

    他们是前线的战士
    而妈妈，是战士们的「教练组」
```

#### 第三幕：转折 — 我的故事

```
【视觉】画面从冷色调的医护蓝，渐变为温暖的橙黄色
      背景出现淡淡的代码/鸿蒙LOGO元素

【文字】
    妈妈不太懂编程
    她甚至不太分得清「前端」和「后端」
    但她知道，她儿子喜欢这个东西

    我提了什么需求，只要她觉得合理
    从来不会说「不」

    有时候她甚至会——
    跑去问她那些在医院信息科工作的同事
    问他们关于鸿蒙、关于 IT 行业的事情
    问完之后再来跟我聊

    （笑）
    其实她转述的那些话，我经常听得哭笑不得
    但那种「拼了命也想支持你」的样子
    我一直都记得
```

#### 第四幕：高潮 — 告白

```
【视觉】背景浮现大量缓缓上升的光点（萤火虫/孔明灯效果）
      中央出现一朵用光点构成的康乃馨

【文字】
    有人说，护士是白衣天使
    但我觉得，这个词不够

    天使不用在隔离区里熬通宵
    天使不用一遍遍地教别人穿防护服直到嗓子哑了
    天使也不用明明什么都不懂
    还要硬着头皮去帮儿子问东问西

    你是天使
    但你比天使更真实、更坚韧、更可爱

    生日快乐，妈妈
    谢谢你一直站在我身后
    让我可以放心地往前冲
```

#### 第五幕：落款

```
【视觉】光点汇聚成日期和署名

【文字】
    —— 你的儿子，永远爱你
    2026 年 5 月
```

### 3.3 备用短文案（若用户偏好简洁版）

如果用户觉得上面的太长，可以用精简版：

```
2003 年非典，你走进隔离区
2020 年新冠，你在后方守护着去武汉的人

这些年，你守护了那么多人
而我，是最被偏爱的那一个

你不懂代码，不懂鸿蒙
但你懂我

谢谢你，拼尽全力的样子
我都看见了

生日快乐，妈妈
```

---

## 四、视觉与动画设计方案

### 4.1 整体视觉风格

| 元素 | 规格 |
|------|------|
| **主色调** | 深空黑 `#0a0a0f` → 医护蓝 `#1a3a5c` 渐变 |
| ** accent 色** | 暖金色 `#ffd700`（代表温暖、感恩） |
| **辅助色** | 柔和粉 `#ffb6c1`（康乃馨）、天使白 `#f8f9fa` |
| **字体** | 标题：系统无衬线 + 字重 700；正文：系统无衬线 + 字重 400；行高 1.8 |
| **背景特效** | 粒子系统 + 呼吸光晕 |

### 4.2 动画系统清单

#### 动画 A：开场心跳线（Heartbeat Line）

```css
/* 用 CSS + SVG 实现 */
.heartbeat-line {
  stroke: #ff6b6b;
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 3s ease-out forwards, pulse 1.5s ease-in-out infinite 3s;
}
@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

**实现方式**：SVG `<path>` 元素绘制心电图波形，CSS stroke-dasharray 实现描边动画。

#### 动画 B：时间轴滚动高亮（Scroll Timeline）

```javascript
// IntersectionObserver 监听时间轴节点进入视口
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.timeline-node').forEach(node => observer.observe(node));
```

**实现方式**：页面滚动时，时间轴上的 2003、2020、现在 三个节点依次发光高亮，配合文字渐入。

#### 动画 C：粒子上升系统（Rising Particles）

```javascript
// Canvas 粒子系统
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 10;
    this.size = Math.random() * 3 + 1;
    this.speed = Math.random() * 1 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.3;
  }
  update() {
    this.y -= this.speed;
    this.x += Math.sin(this.y * 0.01) * 0.5; // 轻微摇摆
    if (this.y < -10) this.y = canvas.height + 10;
  }
  draw() {
    ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

**实现方式**：Canvas 2D 绘制金色粒子从底部缓缓上升，模拟萤火虫/光尘效果。在告白段落时粒子密度增加。

#### 动画 D：文字渐入打字机（Fade-in Typewriter）

```css
.reveal-text {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out;
}
.reveal-text.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
// 已有 typed.umd.js 可用，但为避免依赖外部脚本，建议内联实现
function typeWriter(element, text, speed = 80) {
  let i = 0;
  element.textContent = '';
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
```

**实现方式**：每个段落文字在滚动进入视口时先执行打字机效果（逐字显示），增加仪式感。

#### 动画 E：康乃馨绽放（CSS Flower Bloom）【可选高级特效】

```css
/* 用多个旋转的div模拟花瓣 */
.petal {
  position: absolute;
  width: 40px;
  height: 80px;
  background: linear-gradient(to top, #ff6b9d, #ffb6c1);
  border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%;
  transform-origin: bottom center;
  opacity: 0;
  animation: bloom 2s ease-out forwards;
}
.petal:nth-child(1) { transform: rotate(0deg); animation-delay: 0s; }
.petal:nth-child(2) { transform: rotate(72deg); animation-delay: 0.2s; }
/* ... 共5片花瓣 */

@keyframes bloom {
  0% { transform: rotate(var(--rotation)) scale(0); opacity: 0; }
  100% { transform: rotate(var(--rotation)) scale(1); opacity: 1; }
}
```

**实现方式**：纯 CSS 花瓣元素围绕中心旋转排列，配合缩放动画实现绽放效果。在「高潮 — 告白」段落时触发。

### 4.3 页面布局结构

```
┌─────────────────────────────────────────────┐
│  全屏 Section 1: 开场心跳                      │
│  ┌─────────────────────────────────────┐    │
│  │      SVG 心跳线动画                   │    │
│  │      「2003 年，我还是个...」          │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  全屏 Section 2: 时间轴                        │
│  ┌─────────────────────────────────────┐    │
│  │   ○──────●──────●──────○            │    │
│  │  2003         2020      现在         │    │
│  │   非典        新冠教练组    我的成长   │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  全屏 Section 3: 我的故事                      │
│  ┌─────────────────────────────────────┐    │
│  │    「妈妈不太懂编程...」               │    │
│  │    （背景渐变为暖色调）                │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  全屏 Section 4: 告白高潮                      │
│  ┌─────────────────────────────────────┐    │
│  │    粒子上升 + 康乃馨绽放              │    │
│  │    「生日快乐，妈妈」                  │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  全屏 Section 5: 落款                          │
│  ┌─────────────────────────────────────┐    │
│  │    光点汇聚成日期                     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 4.4 响应式设计

| 断点 | 调整 |
|------|------|
| **> 1024px** | 全屏分区，文字居中，字体较大 |
| **768-1024px** | 时间轴改为垂直排列，文字稍小 |
| **< 768px** | 单栏布局，粒子数量减半，简化动画 |

---

## 五、主题兼容性方案

### 5.1 与现有主题修改的冲突避免

| 现有修改 | 潜在冲突 | 解决方案 |
|---------|---------|---------|
| `layout.pug` 入场弹窗 `#entrance-popup` | 页面使用 `layout: false` 已规避 | ✅ 无冲突 |
| `head.pug` 自定义 CSS/JS 链接 | 页面使用 `layout: false` 已规避 | ✅ 无冲突 |
| `additional-js.pug` 底部脚本 | 页面使用 `layout: false` 已规避 | ✅ 无冲突 |
| `footer.pug` 建站时间 | 页面使用 `layout: false` 已规避 | ✅ 无冲突 |
| `inject.bottom` 星空 canvas | 页面使用 `layout: false` 已规避 | ✅ 无冲突 |
| 全局 `data-theme="dark"` | 页面自身设置深黑背景，一致 | ✅ 无冲突 |

### 5.2 命名空间隔离

```css
/* 所有选择器以 .birthday-page 为根，防止泄漏 */
.birthday-page { /* 页面根容器 */ }
.birthday-page .hero-section { /* 开场区域 */ }
.birthday-page .timeline-section { /* 时间轴区域 */ }
.birthday-page .story-section { /* 故事区域 */ }
.birthday-page .confession-section { /* 告白区域 */ }
.birthday-page .signature-section { /* 落款区域 */ }
.birthday-page #particle-canvas { /* 粒子画布 */ }
```

### 5.3 脚本隔离

```javascript
// 使用 IIFE 防止全局变量污染
(function() {
  'use strict';
  // 所有变量和函数局限在此作用域
  const birthdayPage = {
    init() { /* ... */ },
    initParticles() { /* ... */ },
    initTypewriter() { /* ... */ },
    initTimeline() { /* ... */ }
  };
  
  if (document.querySelector('.birthday-page')) {
    birthdayPage.init();
  }
})();
```

---

## 六、实施步骤

### Step 1：准备资源（用户侧）

- [ ] 收集妈妈的职业照片（非典时期、新冠时期、日常工作，如有）
- [ ] 收集家庭合照（可选）
- [ ] 确认妈妈的生日日期（用于页面标题/落款）
- [ ] 决定文案版本（完整版 / 精简版）

### Step 2：创建页面目录和文件

```bash
# 创建目录
mkdir -p source/birthday-gift/imgs

# 复制图片资源（如有）
cp /path/to/photos/* source/birthday-gift/imgs/
```

创建 `source/birthday-gift/index.md`，front matter：

```yaml
---
title: 献给最美的白衣天使
subtitle: 生日快乐，妈妈
date: 2026-05-04
description: 献给我最亲爱的妈妈——一位平凡而伟大的护士
keywords: [生日, 感恩, 护士, 母亲]
layout: false
---
```

### Step 3：编写页面 HTML/CSS/JS

将第四节设计的动画和第三节的文案实现为内联 HTML。具体代码参考「附录：完整页面代码模板」。

### Step 4：配置导航菜单

编辑 `_config.butterfly.yml`，在 `menu:` 节末尾添加：

```yaml
  妈妈生日快乐: /birthday-gift/ || fa-solid fa-heart-pulse
```

### Step 5：本地测试

```bash
npm run clean
npm run server
# 访问 http://localhost:4000/birthday-gift/
```

### Step 6：构建与部署

```bash
npm run pub
```

---

## 七、风险与回滚

### 7.1 风险清单

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| `layout: false` 不生效，页面仍被主题包装 | 低 | 高 | 在本地测试验证页面源码中无 `#content-inner` 等主题 DOM |
| 移动端动画卡顿 | 中 | 中 | 检测 `touch` 设备，自动降级粒子数量 |
| 图片资源缺失导致布局异常 | 低 | 低 | 所有图片设置 `min-height` + 备用背景色 |
| 主题升级后导航配置丢失 | 中 | 低 | 已记录于 `06-theme-modifications/README.md` |
| 用户对文案不满意 | 中 | 中 | 提供完整版和精简版两个文案选项 |

### 7.2 回滚方案

如需移除生日页面：

1. 删除 `source/birthday-gift/` 目录
2. 在 `_config.butterfly.yml` 的 `menu:` 中移除 `妈妈生日快乐` 行
3. 运行 `npm run pub` 重新部署

---

## 八、附录：完整页面代码模板

> **注意**：以下代码为设计阶段模板，实际实施时需根据用户提供的照片、具体生日日期、文案偏好进行填充和调整。

```markdown
---
title: 献给最美的白衣天使
subtitle: 生日快乐，妈妈
date: 2026-05-04
description: 献给我最亲爱的妈妈——一位平凡而伟大的护士
keywords: [生日, 感恩, 护士, 母亲]
layout: false
---

<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>献给最美的白衣天使 | 生日快乐</title>
  <meta name="description" content="献给我最亲爱的妈妈">
  <style>
    /* ========== 基础重置与隔离 ========== */
    .birthday-page, .birthday-page * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .birthday-page {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
                   'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
      background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
      color: #f0f0f0;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }

    /* ========== 全屏分区 ========== */
    .section {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      position: relative;
    }

    /* ========== 文字样式 ========== */
    .section-title {
      font-size: clamp(1.8rem, 4vw, 3rem);
      font-weight: 700;
      text-align: center;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #ffd700, #ffb6c1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .section-text {
      font-size: clamp(1rem, 2.5vw, 1.4rem);
      line-height: 2;
      text-align: center;
      max-width: 700px;
      color: rgba(255,255,255,0.85);
    }
    .section-text .highlight {
      color: #ffd700;
      font-weight: 600;
    }

    /* ========== 心跳动画 ========== */
    .heartbeat-container {
      width: 300px;
      height: 120px;
      margin-bottom: 3rem;
    }
    .heartbeat-line {
      stroke: #ff6b6b;
      stroke-width: 2.5;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 800;
      stroke-dashoffset: 800;
      animation: drawHeartbeat 2.5s ease-out forwards,
                 pulseHeartbeat 2s ease-in-out infinite 2.5s;
      filter: drop-shadow(0 0 8px rgba(255,107,107,0.5));
    }
    @keyframes drawHeartbeat {
      to { stroke-dashoffset: 0; }
    }
    @keyframes pulseHeartbeat {
      0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px rgba(255,107,107,0.5)); }
      50% { opacity: 0.6; filter: drop-shadow(0 0 4px rgba(255,107,107,0.3)); }
    }

    /* ========== 时间轴 ========== */
    .timeline {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 3rem 0;
      position: relative;
    }
    .timeline-line {
      width: 300px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #4a90e2, #ffd700, transparent);
      position: relative;
    }
    .timeline-node {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #1a1a2e;
      border: 3px solid #4a90e2;
      position: relative;
      transition: all 0.5s ease;
      cursor: default;
    }
    .timeline-node.active {
      border-color: #ffd700;
      box-shadow: 0 0 20px rgba(255,215,0,0.5);
      transform: scale(1.3);
    }
    .timeline-label {
      position: absolute;
      top: 35px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.9rem;
      color: rgba(255,255,255,0.6);
      white-space: nowrap;
    }
    .timeline-node.active .timeline-label {
      color: #ffd700;
    }

    /* ========== 粒子画布 ========== */
    #particle-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    /* ========== 渐入动画类 ========== */
    .fade-in {
      opacity: 0;
      transform: translateY(30px);
      transition: all 1s ease-out;
    }
    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ========== 落款 ========== */
    .signature {
      font-size: 1.2rem;
      color: rgba(255,215,0,0.8);
      font-style: italic;
      margin-top: 2rem;
    }

    /* ========== 响应式 ========== */
    @media (max-width: 768px) {
      .timeline {
        flex-direction: column;
        gap: 2rem;
      }
      .timeline-line {
        width: 2px;
        height: 200px;
        background: linear-gradient(180deg, transparent, #4a90e2, #ffd700, transparent);
      }
      .section {
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="birthday-page">
    <!-- 粒子背景层 -->
    <canvas id="particle-canvas"></canvas>

    <!-- 第一幕：开场心跳 -->
    <section class="section" id="scene-opening">
      <div class="heartbeat-container">
        <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
          <path class="heartbeat-line" d="M0,50 L60,50 L75,20 L90,80 L105,50 L120,50 L135,20 L150,80 L165,50 L180,50 L195,20 L210,80 L225,50 L240,50 L255,20 L270,80 L285,50 L300,50"/>
        </svg>
      </div>
      <h1 class="section-title fade-in">献给最美的白衣天使</h1>
      <p class="section-text fade-in">
        2003 年，我还是个不太记事的孩子<br>
        但我知道，那一年有一种叫「非典」的东西<br>
        让很多人都害怕了<br><br>
        而我的妈妈，穿上了防护服，走进了隔离区
      </p>
    </section>

    <!-- 第二幕：时间轴 -->
    <section class="section" id="scene-timeline">
      <h2 class="section-title fade-in">二十年，从未退缩</h2>
      <div class="timeline">
        <div class="timeline-node" data-year="2003">
          <span class="timeline-label">2003 · 非典一线</span>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-node" data-year="2020">
          <span class="timeline-label">2020 · 后方教练组</span>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-node" data-year="now">
          <span class="timeline-label">现在 · 依然守护</span>
        </div>
      </div>
      <p class="section-text fade-in">
        2020 年，新冠疫情来了<br><br>
        我的妈妈站在后方<br>
        为那些即将奔赴武汉的医生护士们<br>
        一遍又一遍地演示防护服的穿脱<br><br>
        他们是前线的战士<br>
        而妈妈，是战士们的 <span class="highlight">「教练组」</span>
      </p>
    </section>

    <!-- 第三幕：我的故事 -->
    <section class="section" id="scene-story">
      <h2 class="section-title fade-in">她不懂代码，但她懂我</h2>
      <p class="section-text fade-in">
        妈妈不太懂编程<br>
        她甚至不太分得清「前端」和「后端」<br><br>
        但她知道，她儿子喜欢这个东西<br>
        我提了什么需求，只要她觉得合理<br>
        从来不会说「不」<br><br>
        有时候她甚至会——<br>
        跑去问她那些在医院信息科工作的同事<br>
        问他们关于鸿蒙、关于 IT 行业的事情<br><br>
        问完之后再来跟我聊<br>
        其实她转述的那些话，我经常听得哭笑不得<br>
        但那种 <span class="highlight">「拼了命也想支持你」</span> 的样子<br>
        我一直都记得
      </p>
    </section>

    <!-- 第四幕：告白 -->
    <section class="section" id="scene-confession">
      <h2 class="section-title fade-in">生日快乐</h2>
      <p class="section-text fade-in">
        有人说，护士是白衣天使<br>
        但我觉得，这个词不够<br><br>
        天使不用在隔离区里熬通宵<br>
        天使不用一遍遍地教别人穿防护服直到嗓子哑了<br>
        天使也不用明明什么都不懂<br>
        还要硬着头皮去帮儿子问东问西<br><br>
        你是天使<br>
        但你比天使更真实、更坚韧、更可爱<br><br>
        <span class="highlight" style="font-size: 1.3em;">生日快乐，妈妈</span><br>
        谢谢你一直站在我身后<br>
        让我可以放心地往前冲
      </p>
    </section>

    <!-- 第五幕：落款 -->
    <section class="section" id="scene-signature">
      <p class="signature fade-in">
        —— 你的儿子，永远爱你<br>
        2026 年 5 月
      </p>
    </section>
  </div>

  <script>
    /* ========== 粒子系统 ========== */
    (function() {
      const canvas = document.getElementById('particle-canvas');
      const ctx = canvas.getContext('2d');
      let particles = [];
      let animationId;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      // 检测移动设备，减少粒子数量
      const isMobile = window.matchMedia('(pointer: coarse)').matches;
      const PARTICLE_COUNT = isMobile ? 30 : 80;

      class Particle {
        constructor() {
          this.reset();
        }
        reset() {
          this.x = Math.random() * canvas.width;
          this.y = canvas.height + Math.random() * 100;
          this.size = Math.random() * 2.5 + 0.5;
          this.speed = Math.random() * 0.8 + 0.3;
          this.opacity = Math.random() * 0.4 + 0.2;
          this.sway = Math.random() * 2 - 1;
          this.swaySpeed = Math.random() * 0.02 + 0.01;
          this.time = 0;
        }
        update() {
          this.y -= this.speed;
          this.time += this.swaySpeed;
          this.x += Math.sin(this.time) * this.sway * 0.5;
          if (this.y < -10) this.reset();
        }
        draw() {
          ctx.fillStyle = `rgba(255, 215, ${100 + Math.random() * 100}, ${this.opacity})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height; // 初始分布在全屏
        particles.push(p);
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
    })();

    /* ========== 滚动渐入 ========== */
    (function() {
      const fadeElements = document.querySelectorAll('.fade-in');
      const timelineNodes = document.querySelectorAll('.timeline-node');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

      fadeElements.forEach(el => observer.observe(el));
      timelineNodes.forEach(node => observer.observe(node));
    })();

    /* ========== 打字机效果（告白段落） ========== */
    (function() {
      const confessionText = document.querySelector('#scene-confession .section-text');
      if (!confessionText) return;

      const originalHTML = confessionText.innerHTML;
      let hasTyped = false;

      const typeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasTyped) {
            hasTyped = true;
            // 可以在此处添加打字机动画逻辑
            // 为简化，使用渐入替代
            confessionText.style.transition = 'opacity 1.5s ease-out';
            confessionText.style.opacity = '1';
          }
        });
      }, { threshold: 0.5 });

      typeObserver.observe(confessionText);
    })();
  </script>
</body>
</html>
```

---

## 九、设计决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 页面实现方式 | `layout: false` + 内联完整 HTML | 摆脱主题 layout 限制，实现全屏沉浸式体验 |
| 导航位置 | `menu` 最后一项 | 不破坏现有导航结构，视觉突出 |
| 动画技术 | CSS3 + Canvas 2D + IntersectionObserver | 不引入外部依赖，兼容现有浏览器 |
| 文案结构 | 五幕剧式叙事 | 有起承转合，情感递进自然 |
| 色彩方案 | 深空黑 + 医护蓝 + 暖金 | 符合护士职业特征，同时温暖不冰冷 |
| 是否使用 Typed.js | 否（内联简化实现） | 避免额外脚本加载，页面完全自包含 |
| 是否添加背景音乐 | 建议不加 | 考虑到用户可能在各种场景打开，自动播放音乐体验差 |

---

*方案版本：v1.0*  
*设计日期：2026-05-04*  
*关联文档：[`custom-features-catalog.md`](custom-features-catalog.md)、[`project-overview.md`](project-overview.md)*
