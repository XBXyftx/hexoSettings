/**
 * 生日页面交互脚本
 * 整屏滚动时间轴 + 相册系统 + 懒加载 + 流星效果
 */
(function() {
  'use strict';

  // ========== 配置 ==========
  const CONFIG = {
    transitionDuration: 800,  // 整屏切换动画时长(ms)
    scrollThreshold: 50,      // 触摸滑动阈值(px)
    preloadNextBg: true,      // 预加载下一个背景图
    meteorFPS: 30             // 流星效果帧率
  };

  // ========== 状态 ==========
  let eventsData = [];
  let currentIndex = 0;
  let isTransitioning = false;
  let touchStartY = 0;
  let meteorAnimationId = null;
  let meteorCtx = null;
  let meteorStars = [];
  let isMeteorActive = false;

  // DOM 元素引用
  const els = {};

  // ========== 初始化 ==========
  function init() {
    cacheElements();
    loadEvents();
    bindEvents();
  }

  function cacheElements() {
    els.loadingScreen = document.getElementById('loadingScreen');
    els.loadingBarFill = document.getElementById('loadingBarFill');
    els.bgLayer = document.getElementById('bgLayer');
    els.edgeGlow = document.getElementById('edgeGlow');
    els.timelineContainer = document.getElementById('timelineContainer');
    els.progressDots = document.getElementById('progressDots');
    els.meteorCanvas = document.getElementById('meteorCanvas');
    els.albumModal = document.getElementById('albumModal');
    els.albumModalClose = document.getElementById('albumModalClose');
    els.albumModalContent = document.getElementById('albumModalContent');
    els.lightboxModal = document.getElementById('lightboxModal');
    els.lightboxModalClose = document.getElementById('lightboxModalClose');
    els.lightboxImage = document.getElementById('lightboxImage');
    els.videoModal = document.getElementById('videoModal');
    els.videoModalClose = document.getElementById('videoModalClose');
    els.videoPlayer = document.getElementById('videoPlayer');
  }

  // ========== 加载事件数据 ==========
  function loadEvents() {
    updateLoadingProgress(20);

    fetch('/birthday-gift/events-data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load events data');
        return res.json();
      })
      .then(data => {
        eventsData = data;
        updateLoadingProgress(60);
        renderEvents();
        renderProgressDots();
        initBackgrounds();
        updateLoadingProgress(100);

        setTimeout(() => {
          if (els.loadingScreen) {
            els.loadingScreen.classList.add('hidden');
          }
          // 预加载第一个事件的缩略图
          preloadEventMedia(0);
          // 初始化流星效果
          initMeteorCanvas();
          // 更新流星状态
          updateMeteorState();
        }, 600);
      })
      .catch(err => {
        console.error('[Birthday Gift] 加载事件数据失败:', err);
        els.timelineContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:rgba(255,255,255,0.5);"><p>加载失败，请刷新页面重试</p></div>';
        if (els.loadingScreen) els.loadingScreen.classList.add('hidden');
      });
  }

  function updateLoadingProgress(percent) {
    if (els.loadingBarFill) {
      els.loadingBarFill.style.width = percent + '%';
    }
  }

  // ========== 渲染事件 ==========
  function renderEvents() {
    if (!eventsData.length) {
      els.timelineContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:rgba(255,255,255,0.5);"><p>暂无事件</p></div>';
      return;
    }

    const html = eventsData.map((event, index) => {
      const isFirst = index === 0;
      const mediaHtml = event.hasMedia
        ? renderAlbumStack(event.media, event.id)
        : '<div class="album-placeholder">回忆在时光中流淌</div>';

      const achievementHtml = event.achievement
        ? '<span class="event-achievement">' + escapeHtml(event.achievement) + '</span>'
        : '';

      return '<section class="event-section" data-index="' + index + '" data-event-id="' + event.id + '">' +
        '<div class="event-content">' +
          '<div class="event-text">' +
            '<div class="event-period">' + escapeHtml(event.period) + ' · ' + escapeHtml(event.date) + '</div>' +
            '<h2 class="event-title">' + escapeHtml(event.title) + '</h2>' +
            '<div class="event-mood">心境：' + escapeHtml(event.mood) + '</div>' +
            '<div class="event-body">' + event.contentHtml + '</div>' +
            achievementHtml +
          '</div>' +
          '<div class="event-album">' + mediaHtml + '</div>' +
        '</div>' +
      '</section>';
    }).join('');

    els.timelineContainer.innerHTML = html;

    // 绑定相册点击事件
    document.querySelectorAll('.album-stack').forEach(stack => {
      stack.addEventListener('click', function() {
        const eventId = this.dataset.eventId;
        openAlbumModal(eventId);
      });
    });
  }

  // ========== 渲染相册堆叠 ==========
  function renderAlbumStack(media, eventId) {
    // 最多显示3张缩略图
    const thumbs = media.slice(0, 3);
    const count = media.length;

    let thumbsHtml = '';
    thumbs.forEach((item, i) => {
      thumbsHtml += '<div class="album-thumb" data-type="' + item.type + '" data-src="' + item.full + '"' +
        ' style="background-image:url(' + item.thumb + ')" data-index="' + i + '"></div>';
    });

    const countHtml = count > 3 ? '<div class="album-count">+' + (count - 3) + '</div>' : '';

    return '<div class="album-stack" data-event-id="' + eventId + '">' +
      thumbsHtml + countHtml +
    '</div>';
  }

  // ========== 渲染进度指示器 ==========
  function renderProgressDots() {
    if (!eventsData.length) return;

    const html = eventsData.map((_, i) => {
      return '<div class="progress-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"></div>';
    }).join('');

    els.progressDots.innerHTML = html;

    document.querySelectorAll('.progress-dot').forEach(dot => {
      dot.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        if (index !== currentIndex && !isTransitioning) {
          goToEvent(index);
        }
      });
    });
  }

  // ========== 初始化背景 ==========
  function initBackgrounds() {
    if (!eventsData.length) return;

    const html = eventsData.map((event, index) => {
      const bgUrl = event.background || '';
      return '<div class="bg-item' + (index === 0 ? ' active' : '') + '"' +
        ' data-index="' + index + '"' +
        ' style="background-image:url(' + bgUrl + ')"' +
      '></div>';
    }).join('');

    els.bgLayer.innerHTML = html;

    // 设置初始泛光颜色
    if (eventsData[0]) {
      updateGlowColor(eventsData[0].glowColor);
    }
  }

  // ========== 整屏滚动切换 ==========
  function goToEvent(index) {
    if (index < 0 || index >= eventsData.length || isTransitioning) return;

    isTransitioning = true;
    const direction = index > currentIndex ? 'down' : 'up';
    currentIndex = index;

    // 移动容器
    els.timelineContainer.style.transform = 'translateY(-' + (index * 100) + 'vh)';

    // 切换背景
    document.querySelectorAll('.bg-item').forEach((bg, i) => {
      bg.classList.toggle('active', i === index);
    });

    // 更新泛光颜色
    const event = eventsData[index];
    if (event && event.glowColor) {
      updateGlowColor(event.glowColor);
    }

    // 更新进度指示器
    document.querySelectorAll('.progress-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // 预加载媒体
    preloadEventMedia(index);
    if (CONFIG.preloadNextBg && index < eventsData.length - 1) {
      preloadEventMedia(index + 1);
    }

    // 更新流星状态
    updateMeteorState();

    // 解锁
    setTimeout(() => {
      isTransitioning = false;
    }, CONFIG.transitionDuration);
  }

  function nextEvent() {
    if (currentIndex < eventsData.length - 1) {
      goToEvent(currentIndex + 1);
    }
  }

  function prevEvent() {
    if (currentIndex > 0) {
      goToEvent(currentIndex - 1);
    }
  }

  function updateGlowColor(color) {
    document.documentElement.style.setProperty('--glow-color', color || '255, 255, 255');
  }

  // ========== 预加载媒体 ==========
  function preloadEventMedia(index) {
    if (index < 0 || index >= eventsData.length) return;
    const event = eventsData[index];
    if (!event || !event.hasMedia) return;

    // 预加载缩略图
    event.media.forEach(item => {
      if (item.thumb) {
        const img = new Image();
        img.src = item.thumb;
      }
    });
  }

  // ========== 事件绑定 ==========
  function bindEvents() {
    // 鼠标滚轮
    let wheelTimeout = null;
    window.addEventListener('wheel', function(e) {
      if (isTransitioning) {
        e.preventDefault();
        return;
      }

      if (isModalOpen()) return;

      e.preventDefault();

      if (wheelTimeout) return;

      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 100);

      if (e.deltaY > 0) {
        nextEvent();
      } else if (e.deltaY < 0) {
        prevEvent();
      }
    }, { passive: false });

    // 触摸滑动
    window.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function(e) {
      if (isTransitioning || isModalOpen()) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > CONFIG.scrollThreshold) {
        if (diff > 0) {
          nextEvent();
        } else {
          prevEvent();
        }
      }
    }, { passive: true });

    // 键盘导航
    window.addEventListener('keydown', function(e) {
      if (isModalOpen()) {
        if (e.key === 'Escape') {
          closeAllModals();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextEvent();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        prevEvent();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToEvent(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToEvent(eventsData.length - 1);
      }
    });

    // 相册弹层关闭
    els.albumModalClose.addEventListener('click', closeAlbumModal);
    els.albumModal.addEventListener('click', function(e) {
      if (e.target === els.albumModal) closeAlbumModal();
    });

    // 大图弹层关闭
    els.lightboxModalClose.addEventListener('click', closeLightboxModal);
    els.lightboxModal.addEventListener('click', function(e) {
      if (e.target === els.lightboxModal) closeLightboxModal();
    });

    // 视频弹层关闭
    els.videoModalClose.addEventListener('click', closeVideoModal);
    els.videoModal.addEventListener('click', function(e) {
      if (e.target === els.videoModal) closeVideoModal();
    });
  }

  // ========== 弹层状态 ==========
  function isModalOpen() {
    return els.albumModal.classList.contains('open') ||
           els.lightboxModal.classList.contains('open') ||
           els.videoModal.classList.contains('open');
  }

  function closeAllModals() {
    closeAlbumModal();
    closeLightboxModal();
    closeVideoModal();
  }

  // ========== 相册弹层 ==========
  function openAlbumModal(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event || !event.hasMedia) return;

    const html = event.media.map((item, i) => {
      if (item.type === 'image') {
        return '<div class="album-modal-item" data-type="image" data-src="' + item.full + '"' +
          ' style="background-image:url(' + item.thumb + ')" data-index="' + i + '"></div>';
      } else if (item.type === 'video') {
        return '<div class="album-modal-item" data-type="video" data-src="' + item.full + '"' +
          ' style="background-image:url(' + (item.thumb || item.full) + ')" data-index="' + i + '">' +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">' +
            '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.2)"/><polygon points="19,16 19,32 35,24" fill="white"/></svg>' +
          '</div>' +
        '</div>';
      }
      return '';
    }).join('');

    els.albumModalContent.innerHTML = html;
    els.albumModal.classList.add('open');

    // 绑定点击事件
    document.querySelectorAll('.album-modal-item').forEach(item => {
      item.addEventListener('click', function() {
        const type = this.dataset.type;
        const src = this.dataset.src;

        if (type === 'image') {
          openLightbox(src);
        } else if (type === 'video') {
          openVideo(src);
        }
      });
    });
  }

  function closeAlbumModal() {
    els.albumModal.classList.remove('open');
  }

  // ========== 大图弹层 ==========
  function openLightbox(src) {
    els.lightboxImage.src = src;
    els.lightboxModal.classList.add('open');
  }

  function closeLightboxModal() {
    els.lightboxModal.classList.remove('open');
    els.lightboxImage.src = '';
  }

  // ========== 视频弹层 ==========
  function openVideo(src) {
    els.videoPlayer.src = src;
    els.videoPlayer.load();
    els.videoModal.classList.add('open');
    els.videoPlayer.play().catch(() => {});
  }

  function closeVideoModal() {
    els.videoModal.classList.remove('open');
    els.videoPlayer.pause();
    els.videoPlayer.src = '';
  }

  // ========== 流星效果 ==========
  function initMeteorCanvas() {
    const canvas = els.meteorCanvas;
    if (!canvas) return;

    meteorCtx = canvas.getContext('2d');
    resizeMeteorCanvas();
    window.addEventListener('resize', resizeMeteorCanvas);

    // 初始化星星
    createMeteorStars();
  }

  function resizeMeteorCanvas() {
    if (!els.meteorCanvas) return;
    els.meteorCanvas.width = window.innerWidth;
    els.meteorCanvas.height = window.innerHeight;
  }

  function createMeteorStars() {
    meteorStars = [];
    const count = Math.floor(window.innerWidth * 0.06); // 比 universe 少
    for (let i = 0; i < count; i++) {
      meteorStars.push(createStar());
    }
  }

  function createStar() {
    const isComet = Math.random() < 0.05; // 5% 流星概率
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 1.5,
      dx: isComet ? 3 + Math.random() * 4 : (Math.random() - 0.5) * 0.3,
      dy: isComet ? 3 + Math.random() * 4 : (Math.random() - 0.5) * 0.3,
      opacity: Math.random(),
      isComet: isComet,
      tail: [],
      maxTailLength: isComet ? 15 : 0
    };
  }

  function updateMeteorState() {
    if (!eventsData.length) return;

    const event = eventsData[currentIndex];
    const shouldShowMeteor = !event.hasMedia;

    if (shouldShowMeteor && !isMeteorActive) {
      isMeteorActive = true;
      els.meteorCanvas.classList.add('active');
      startMeteorAnimation();
    } else if (!shouldShowMeteor && isMeteorActive) {
      isMeteorActive = false;
      els.meteorCanvas.classList.remove('active');
      stopMeteorAnimation();
    }
  }

  let lastMeteorFrame = 0;
  function startMeteorAnimation() {
    if (meteorAnimationId) return;

    function animate(timestamp) {
      if (!isMeteorActive) return;

      // FPS 节流
      if (timestamp - lastMeteorFrame < 1000 / CONFIG.meteorFPS) {
        meteorAnimationId = requestAnimationFrame(animate);
        return;
      }
      lastMeteorFrame = timestamp;

      const ctx = meteorCtx;
      const w = els.meteorCanvas.width;
      const h = els.meteorCanvas.height;

      ctx.clearRect(0, 0, w, h);

      meteorStars.forEach(star => {
        // 更新位置
        star.x += star.dx;
        star.y += star.dy;

        // 边界检查
        if (star.x > w) star.x = 0;
        if (star.x < 0) star.x = w;
        if (star.y > h) star.y = 0;
        if (star.y < 0) star.y = h;

        // 更新透明度
        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity > 1) star.opacity = 1;
        if (star.opacity < 0.2) star.opacity = 0.2;

        // 流星尾巴
        if (star.isComet) {
          star.tail.unshift({ x: star.x, y: star.y, opacity: star.opacity });
          if (star.tail.length > star.maxTailLength) {
            star.tail.pop();
          }

          // 绘制尾巴
          star.tail.forEach((pt, i) => {
            const ratio = 1 - (i / star.tail.length);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, star.r * ratio * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (pt.opacity * ratio * 0.6) + ')';
            ctx.fill();
          });
        }

        // 绘制星星
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.isComet
          ? 'rgba(255, 255, 255, ' + star.opacity + ')'
          : 'rgba(226, 225, 142, ' + star.opacity + ')';
        ctx.fill();
      });

      meteorAnimationId = requestAnimationFrame(animate);
    }

    meteorAnimationId = requestAnimationFrame(animate);
  }

  function stopMeteorAnimation() {
    if (meteorAnimationId) {
      cancelAnimationFrame(meteorAnimationId);
      meteorAnimationId = null;
    }
    if (meteorCtx && els.meteorCanvas) {
      meteorCtx.clearRect(0, 0, els.meteorCanvas.width, els.meteorCanvas.height);
    }
  }

  // ========== 工具函数 ==========
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
