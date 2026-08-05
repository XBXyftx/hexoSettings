---
title: rustTips
date: 2026-08-05 14:50:35
tags:
  - rust
  - 技术向
cover: /imgs/ArticleTopImgs/RustTipsTopImg.webp
description: rs学习笔记
typewriter:
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

长期以来我学过的语言、高频使用的语言都属于是抽象层级比较高的高级编程语言，像是py、js、ts、arkts、java等，都不太需要你去过多的关注底层的细节，封装好的库和垃圾回收机制等会为你处理好底层的浮点数精度差异啊，内存回收啊，类型转化啊之类的问题，C语言虽然大一学过，但由于没有真正的应用过也没有更进一步的了解课程内容之外的部分所以其实最后也并不太能说我学过。

就这样，我用高抽象层级的语言写了一个又一个项目，处理了一个又一个bug，就渐渐的在心理上筑起了一道壁垒，认为需要手动处理底层问题的rs，c，cpp这些语言会很难很繁琐，而且我的领域确实是用不到，所以长期以来就没用动力push我去开始学习这些语言。

随着我畏难情绪筑起的壁垒越来越高的同时，AI的能力正以一个更加难以想象的速度去上涨。渐渐的我发现我不熟悉的领域我也可以借助AI去完成了，以及行业的实际趋势，我意识到未来每个称需要都要或多或少的向着全栈去发展，同时AI增长的速度以及我实践的成功经验正一点点的帮我拆掉我心中筑起的壁垒，于是我结合最近的实际业务需求以及我自身对于各个大厂的技术选择倾向，决定开始学习rs。

![1](rustTips/1.webp)

当然在此也是安利一下我们伟大的rust语言圣经。

<style>
.rs-portal{position:relative;margin:1.8rem 0 2.2rem;border:2.5px solid #ce422b;background:#262019;box-shadow:10px 10px 0 rgba(206,66,43,.32);color:#f6ead8}
.rs-portal-head{display:flex;align-items:center;justify-content:space-between;gap:.9rem;flex-wrap:wrap;padding:1.05rem 1.3rem;background:#ce422b}
.rs-portal-titlebox{display:flex;align-items:center;gap:.75rem;min-width:0}
.rs-portal-gear{width:32px;height:32px;flex:none;color:#241812}
.rs-portal-titletext{margin:0;font-size:1.3rem;font-weight:800;letter-spacing:.05em;line-height:1.25;color:#241812}
.rs-portal-sub{display:block;margin-top:.2rem;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-size:.64rem;font-weight:400;letter-spacing:.16em;color:rgba(36,24,18,.72)}
.rs-portal-no{flex:none;padding:.34em .75em;border:1.5px solid rgba(36,24,18,.55);font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-size:.66rem;letter-spacing:.18em;color:#241812;white-space:nowrap}
.rs-portal-grid{display:grid;grid-template-columns:1.95fr 1fr;gap:10px;padding:1.15rem 1.3rem 0}
.rs-portal-fig{position:relative;margin:0;border:2px solid #ce422b;background:#17110c;overflow:hidden;line-height:0}
.rs-portal-fig img{width:100%;height:auto;display:block;border-radius:0}
.rs-portal-tag{position:absolute;top:0;left:0;z-index:2;padding:.24em .65em;background:#ce422b;color:#f6ead8;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-size:.62rem;letter-spacing:.12em;line-height:1.5}
.rs-portal-meta{margin:0;padding:.85rem 1.3rem 0;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-size:.74rem;letter-spacing:.08em;line-height:1.7;color:rgba(246,234,216,.62)}
.rs-portal-meta b{color:#ef7a50;font-weight:700}
.rs-portal-divider{position:relative;margin:1.05rem 1.3rem;border-top:2px dashed rgba(246,234,216,.28);text-align:center}
.rs-portal-divider span{position:relative;top:-.75em;padding:0 .85em;background:#262019;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-size:.62rem;letter-spacing:.32em;color:rgba(246,234,216,.45)}
.rs-portal-btn{display:flex;align-items:center;justify-content:center;gap:.7rem;margin:0 1.3rem 1.35rem;padding:.95rem 1.2rem;background:#ce422b;border:2.5px solid #17110c;box-shadow:5px 5px 0 #17110c;color:#fff7ec !important;font-size:1.02rem;font-weight:800;letter-spacing:.08em;text-decoration:none !important;transition:transform .18s ease,box-shadow .18s ease}
.rs-portal-btn:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 #17110c;color:#ffffff !important}
.rs-portal-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #17110c}
.rs-portal-btn .rs-portal-gear{width:22px;height:22px;color:#fff7ec;transition:transform .5s cubic-bezier(.22,1,.36,1)}
.rs-portal-btn:hover .rs-portal-gear{transform:rotate(120deg)}
.rs-portal-btn-url{font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-size:.76em;font-weight:400;letter-spacing:.14em;opacity:.88}
@media (max-width:768px){
.rs-portal{box-shadow:6px 6px 0 rgba(206,66,43,.32)}
.rs-portal-head{padding:1rem 1rem}
.rs-portal-grid{grid-template-columns:1fr;padding:1rem 1rem 0}
.rs-portal-meta{padding:.85rem 1rem 0}
.rs-portal-divider{margin:1rem 1rem}
.rs-portal-btn{margin:0 1rem 1.15rem}
}
@media (prefers-reduced-motion:reduce){
.rs-portal-btn,.rs-portal-btn .rs-portal-gear{transition:none}
}
</style>

<div class="rs-portal"><div class="rs-portal-head"><div class="rs-portal-titlebox"><svg class="rs-portal-gear" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M0 -30A30 30 0 1 1 0 30A30 30 0 1 1 0 -30ZM0 -13A13 13 0 1 0 0 13A13 13 0 1 0 0 -13Z"/><g fill="currentColor"><rect x="-6.5" y="-47" width="13" height="18" rx="2"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(45)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(90)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(135)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(180)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(225)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(270)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(315)"/></g></svg><p class="rs-portal-titletext">RUST 语言圣经<span class="rs-portal-sub">THE RUST COURSE · 为中国用户量身打造的 RUST 教程</span></p></div><span class="rs-portal-no">PORTAL // COURSE.RS</span></div><div class="rs-portal-grid"><figure class="rs-portal-fig"><span class="rs-portal-tag">FIG.01 — 在线阅读</span><img src="rustTips/3.webp" alt="Rust 语言圣经在线阅读界面截图" width="1670" height="853" loading="lazy"></figure><figure class="rs-portal-fig"><span class="rs-portal-tag">FIG.02 — README</span><img src="rustTips/2.webp" alt="Rust 语言圣经 GitHub README 截图" width="927" height="921" loading="lazy"></figure></div><p class="rs-portal-meta">// <b>170+</b> 章节 × <b>110+</b> 万字 × <b>800+</b> 小时纯手工 · 新手入门 / 老手提升 · 开源免费</p><div class="rs-portal-divider"><span>ADMIT ONE · 一票直达</span></div><a class="rs-portal-btn" href="https://course.rs" target="_blank" rel="noopener noreferrer"><svg class="rs-portal-gear" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M0 -30A30 30 0 1 1 0 30A30 30 0 1 1 0 -30ZM0 -13A13 13 0 1 0 0 13A13 13 0 1 0 0 -13Z"/><g fill="currentColor"><rect x="-6.5" y="-47" width="13" height="18" rx="2"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(45)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(90)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(135)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(180)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(225)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(270)"/><rect x="-6.5" y="-47" width="13" height="18" rx="2" transform="rotate(315)"/></g></svg><span>进入传送门</span><span class="rs-portal-btn-url">course.rs</span><span aria-hidden="true">→</span></a></div>

（上面这个卡片是K3做的，没skill没细致的描述词，就说符合rust风格，怎么样还挺不错的吧）

所以这篇文章注定不是一个完整的rust学习经历也不会是一个完整的rust教程，只是用于记录一下一些关键的点而已。


