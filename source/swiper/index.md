---
title: 昨日重现
date: 2025-05-26 16:03:13
type: about
top_img: /img/swiperTopImg.webp
comments: true
description: "让散落的旧日照片，在滚动中重新浮现"
---

<section id="yesterday-gallery" class="yesterday-gallery" data-manifest="/swiper/images-auto.json" aria-label="昨日重现照片墙">
  <header class="yesterday-gallery__intro">
    <p class="yesterday-gallery__eyebrow">YESTERDAY ONCE MORE</p>
    <p class="yesterday-gallery__description">每次会话都会重新洗牌。照片仅在接近视野时依次加载，离开后隐入雾中，再次经过时重新浮现。</p>
    <div class="yesterday-gallery__controls">
      <button class="yesterday-gallery__reset" type="button" data-gallery-reset>
        <i class="fas fa-shuffle" aria-hidden="true"></i>
        <span>重新随机排列</span>
      </button>
      <span class="yesterday-gallery__hint">只重置本次浏览顺序，不清除浏览器图片缓存</span>
    </div>
    <div class="yesterday-gallery__status" data-gallery-status role="status" aria-live="polite">正在整理记忆碎片…</div>
  </header>

  <div class="yesterday-gallery__grid" data-gallery-grid aria-busy="true"></div>

  <noscript>
    <p class="yesterday-gallery__noscript">请启用 JavaScript 以浏览随机照片墙。</p>
  </noscript>
</section>
