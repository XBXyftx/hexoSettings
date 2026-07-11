(() => {
  'use strict';

  const GLOBAL_KEY = '__XBXyftxStarfieldController__';
  const BREAKPOINTS = {
    mobile: 768,
    tablet: 1200,
  };
  const FRAME_INTERVALS = {
    mobile: 1000 / 20,
    tablet: 1000 / 30,
    desktop: 1000 / 36,
  };
  const STAR_PALETTES = {
    background: [
      { core: '216, 229, 255', glow: '130, 156, 247' },
      { core: '211, 244, 255', glow: '102, 190, 238' },
      { core: '239, 223, 255', glow: '181, 137, 244' },
    ],
    bright: [
      { core: '248, 250, 255', glow: '169, 184, 255' },
      { core: '229, 246, 255', glow: '111, 205, 255' },
      { core: '250, 234, 255', glow: '211, 151, 255' },
    ],
    dim: [
      { core: '191, 205, 255', glow: '104, 127, 222' },
      { core: '181, 224, 255', glow: '83, 167, 220' },
      { core: '218, 190, 255', glow: '159, 101, 224' },
    ],
  };
  const PARTICLE_BUDGETS = {
    mobile: { background: 6, bright: 3, dim: 12, meteorMinDelay: null, meteorMaxDelay: null },
    tablet: { background: 10, bright: 5, dim: 20, meteorMinDelay: 10000, meteorMaxDelay: 16000 },
    desktop: { background: 14, bright: 7, dim: 30, meteorMinDelay: 7000, meteorMaxDelay: 13000 },
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function getTier(width) {
    if (width <= BREAKPOINTS.mobile) return 'mobile';
    if (width <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  }

  function getPixelRatio(tier) {
    const ceiling = tier === 'mobile' ? 1.25 : 1.5;
    return Math.min(window.devicePixelRatio || 1, ceiling);
  }

  class StarfieldController {
    constructor() {
      this.backgroundCanvas = null;
      this.backgroundContext = null;
      this.header = null;
      this.headerCanvas = null;
      this.headerContext = null;
      this.backgroundSize = { width: 0, height: 0 };
      this.headerSize = { width: 0, height: 0 };
      this.tier = 'desktop';
      this.budget = PARTICLE_BUDGETS.desktop;
      this.backgroundStars = [];
      this.brightStars = [];
      this.dimStars = [];
      this.meteor = null;
      this.nextMeteorAt = 0;
      this.headerInView = false;
      this.headerEnabled = false;
      this.destroyed = false;
      this.running = false;
      this.animationFrame = null;
      this.resizeTimer = null;
      this.lastFrameTime = 0;
      this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.intersectionObserver = null;
      this.resizeObserver = null;

      this.render = this.render.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      this.handleMotionPreferenceChange = this.handleMotionPreferenceChange.bind(this);
      this.handlePjaxSend = this.handlePjaxSend.bind(this);
    }

    init() {
      if (this.running || !document.body) return;

      this.destroyed = false;
      this.backgroundCanvas = document.getElementById('universe');
      this.header = document.getElementById('page-header');

      if (!this.backgroundCanvas) return;

      this.backgroundContext = this.getContext(this.backgroundCanvas);
      this.headerEnabled = this.canRenderHeader();

      if (this.headerEnabled) {
        this.headerCanvas = this.getOrCreateHeaderCanvas();
        this.headerContext = this.getContext(this.headerCanvas);
      }

      this.bindLifecycle();
      this.rebuild();

      if (this.reducedMotionQuery.matches) {
        this.drawStaticFrame();
        return;
      }

      this.start();
    }

    getContext(canvas) {
      if (!canvas) return null;
      return canvas.getContext('2d');
    }

    canRenderHeader() {
      return Boolean(this.header
        && !this.header.classList.contains('not-top-img')
        && this.header.offsetHeight > 80);
    }

    getOrCreateHeaderCanvas() {
      const existing = this.header.querySelector('canvas.universe-header');
      if (existing) return existing;

      const canvas = document.createElement('canvas');
      canvas.className = 'universe-header';
      canvas.setAttribute('aria-hidden', 'true');
      this.header.appendChild(canvas);
      return canvas;
    }

    bindLifecycle() {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      this.reducedMotionQuery.addEventListener('change', this.handleMotionPreferenceChange);
      document.addEventListener('pjax:send', this.handlePjaxSend);

      if (typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', this.handleResize, { passive: true });
      } else {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(document.documentElement);
      }

      if (this.headerEnabled && typeof IntersectionObserver !== 'undefined') {
        this.intersectionObserver = new IntersectionObserver((entries) => {
          this.headerInView = entries.some((entry) => entry.isIntersecting);
        }, { threshold: 0 });
        this.intersectionObserver.observe(this.header);
        this.headerInView = this.isHeaderInViewport();
      } else {
        this.headerInView = this.headerEnabled && this.isHeaderInViewport();
      }
    }

    unbindLifecycle() {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.reducedMotionQuery.removeEventListener('change', this.handleMotionPreferenceChange);
      document.removeEventListener('pjax:send', this.handlePjaxSend);
      window.removeEventListener('resize', this.handleResize);
      this.resizeObserver?.disconnect();
      this.intersectionObserver?.disconnect();
      this.resizeObserver = null;
      this.intersectionObserver = null;
    }

    isHeaderInViewport() {
      if (!this.header) return false;
      const rect = this.header.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    handleResize() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => {
        this.resizeTimer = null;
        this.headerEnabled = this.canRenderHeader();

        if (this.headerEnabled && !this.headerCanvas) {
          this.headerCanvas = this.getOrCreateHeaderCanvas();
          this.headerContext = this.getContext(this.headerCanvas);
          if (!this.intersectionObserver && typeof IntersectionObserver !== 'undefined') {
            this.intersectionObserver = new IntersectionObserver((entries) => {
              this.headerInView = entries.some((entry) => entry.isIntersecting);
            }, { threshold: 0 });
          }
          this.intersectionObserver?.observe(this.header);
          this.headerInView = this.headerInView || this.isHeaderInViewport();
        }

        if (!this.headerEnabled && this.headerCanvas) {
          this.headerCanvas.remove();
          this.headerCanvas = null;
          this.headerContext = null;
          this.intersectionObserver?.disconnect();
          this.intersectionObserver = null;
          this.headerInView = false;
        }

        this.rebuild();
        this.ensureAnimationState();
      }, 160);
    }

    handleVisibilityChange() {
      this.ensureAnimationState();
    }

    handleMotionPreferenceChange() {
      if (this.reducedMotionQuery.matches) {
        this.stop();
        this.drawStaticFrame();
      } else {
        this.rebuild();
        this.ensureAnimationState();
      }
    }

    handlePjaxSend() {
      this.destroy();
    }

    rebuild() {
      this.tier = getTier(window.innerWidth);
      this.budget = PARTICLE_BUDGETS[this.tier];
      this.resizeCanvas(this.backgroundCanvas, this.backgroundContext, this.backgroundSize, window.innerWidth, window.innerHeight);

      if (this.headerEnabled) {
        this.resizeCanvas(
          this.headerCanvas,
          this.headerContext,
          this.headerSize,
          this.header.offsetWidth,
          this.header.offsetHeight,
        );
      }

      this.backgroundStars = this.createStars(this.budget.background, this.backgroundSize, 'background');
      this.brightStars = this.headerEnabled
        ? this.createStars(this.budget.bright, this.headerSize, 'bright')
        : [];
      this.dimStars = this.headerEnabled
        ? this.createStars(this.budget.dim, this.headerSize, 'dim')
        : [];
      this.meteor = null;
      this.nextMeteorAt = this.budget.meteorMinDelay === null
        ? Number.POSITIVE_INFINITY
        : performance.now() + randomBetween(this.budget.meteorMinDelay, this.budget.meteorMaxDelay);
      this.lastFrameTime = 0;
    }

    resizeCanvas(canvas, context, size, width, height) {
      if (!canvas || !context) return;

      const pixelRatio = getPixelRatio(this.tier);
      size.width = Math.max(0, Math.round(width));
      size.height = Math.max(0, Math.round(height));
      canvas.width = Math.round(size.width * pixelRatio);
      canvas.height = Math.round(size.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    createStars(count, size, type) {
      if (size.width === 0 || size.height === 0) return [];

      return Array.from({ length: count }, () => {
        const isBright = type === 'bright';
        const isDim = type === 'dim';
        const radius = isBright
          ? randomBetween(1.8, 3.2)
          : isDim
            ? randomBetween(0.7, 1.35)
            : randomBetween(1.15, 2.1);
        return {
          x: randomBetween(0, size.width),
          y: randomBetween(0, size.height),
          radius,
          glowRadius: radius * (isBright
            ? randomBetween(1.9, 2.4)
            : isDim
              ? randomBetween(3.4, 4.8)
              : randomBetween(3.8, 5.2)),
          palette: STAR_PALETTES[type][Math.floor(Math.random() * STAR_PALETTES[type].length)],
          opacity: isBright
            ? randomBetween(0.58, 0.92)
            : isDim
              ? randomBetween(0.24, 0.57)
              : randomBetween(0.14, 0.32),
          velocityX: randomBetween(0.0015, isBright ? 0.004 : 0.006),
          velocityY: randomBetween(-0.003, 0.003),
          phase: randomBetween(0, Math.PI * 2),
          twinkleRate: isBright
            ? randomBetween(0.00045, 0.0008)
            : randomBetween(0.0002, 0.00045),
        };
      });
    }

    start() {
      if (this.running || document.hidden || this.reducedMotionQuery.matches || this.destroyed) return;
      this.running = true;
      this.lastFrameTime = 0;
      this.animationFrame = window.requestAnimationFrame(this.render);
    }

    stop() {
      this.running = false;
      if (this.animationFrame !== null) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }

    ensureAnimationState() {
      if (this.destroyed || document.hidden || this.reducedMotionQuery.matches) {
        this.stop();
        return;
      }

      this.start();
    }

    render(timestamp) {
      if (!this.running) return;

      const frameInterval = this.tier === 'mobile'
        ? FRAME_INTERVALS.mobile
        : this.tier === 'tablet'
          ? FRAME_INTERVALS.tablet
          : FRAME_INTERVALS.desktop;
      if (this.lastFrameTime === 0) this.lastFrameTime = timestamp;

      const elapsed = timestamp - this.lastFrameTime;
      if (elapsed >= frameInterval) {
        const delta = Math.min(elapsed, 100);
        this.lastFrameTime = timestamp - (elapsed % frameInterval);
        this.update(delta, timestamp);
        this.draw(timestamp);
      }

      this.animationFrame = window.requestAnimationFrame(this.render);
    }

    update(delta, timestamp) {
      this.updateStars(this.backgroundStars, this.backgroundSize, delta);

      if (!this.headerInView || !this.headerEnabled) return;

      this.updateStars(this.brightStars, this.headerSize, delta);
      this.updateStars(this.dimStars, this.headerSize, delta);

      if (this.budget.meteorMinDelay !== null && !this.meteor && timestamp >= this.nextMeteorAt) {
        this.meteor = this.createMeteor();
      }

      if (this.meteor) {
        this.meteor.x += this.meteor.velocityX * delta;
        this.meteor.y += this.meteor.velocityY * delta;
        this.meteor.age += delta;

        if (this.meteor.age >= this.meteor.duration
          || this.meteor.x > this.headerSize.width + this.meteor.tailLength
          || this.meteor.y < -this.meteor.tailLength) {
          this.meteor = null;
          this.nextMeteorAt = this.budget.meteorMinDelay === null
            ? Number.POSITIVE_INFINITY
            : timestamp + randomBetween(this.budget.meteorMinDelay, this.budget.meteorMaxDelay);
        }
      }
    }

    updateStars(stars, size, delta) {
      stars.forEach((star) => {
        star.x += star.velocityX * delta;
        star.y += star.velocityY * delta;

        if (star.x > size.width + star.radius) star.x = -star.radius;
        if (star.y > size.height + star.radius) star.y = -star.radius;
        if (star.y < -star.radius) star.y = size.height + star.radius;
      });
    }

    createMeteor() {
      const fromLeft = Math.random() > 0.5;
      const tailLength = randomBetween(76, 112);
      const speed = randomBetween(0.72, 1.02);
      const angle = randomBetween(-0.88, -0.58);
      return {
        x: fromLeft ? -tailLength : randomBetween(0, this.headerSize.width * 0.55),
        y: fromLeft
          ? randomBetween(this.headerSize.height * 0.35, this.headerSize.height * 0.82)
          : this.headerSize.height + tailLength,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        tailLength,
        tailDots: 32,
        age: 0,
        duration: randomBetween(900, 1300),
      };
    }

    draw(timestamp) {
      this.drawStars(this.backgroundContext, this.backgroundSize, this.backgroundStars, 'background', timestamp);

      if (!this.headerInView || !this.headerEnabled) return;

      this.clear(this.headerContext, this.headerSize);
      this.drawStarGroup(this.headerContext, this.brightStars, 'bright', timestamp);
      this.drawStarGroup(this.headerContext, this.dimStars, 'dim', timestamp);
      this.drawMeteor();
    }

    drawStaticFrame() {
      const timestamp = performance.now();
      this.drawStars(this.backgroundContext, this.backgroundSize, this.backgroundStars, 'background', timestamp);

      if (!this.headerEnabled) return;

      this.clear(this.headerContext, this.headerSize);
      this.drawStarGroup(this.headerContext, this.brightStars, 'bright', timestamp);
      this.drawStarGroup(this.headerContext, this.dimStars, 'dim', timestamp);
    }

    drawStars(context, size, stars, type, timestamp) {
      this.clear(context, size);
      this.drawStarGroup(context, stars, type, timestamp);
    }

    clear(context, size) {
      if (!context || size.width === 0 || size.height === 0) return;
      context.clearRect(0, 0, size.width, size.height);
    }

    drawStarGroup(context, stars, type, timestamp) {
      if (!context) return;

      stars.forEach((star) => {
        const twinkle = type === 'bright'
          ? 0.76 + Math.sin(timestamp * star.twinkleRate + star.phase) * 0.24
          : type === 'dim'
            ? 0.96 + Math.sin(timestamp * star.twinkleRate + star.phase) * 0.12
            : 0.86 + Math.sin(timestamp * star.twinkleRate + star.phase) * 0.14;
        const opacity = Math.max(0, star.opacity * twinkle);
        const { x, y, radius, glowRadius, palette } = star;
        const glow = context.createRadialGradient(x, y, 0, x, y, glowRadius);

        glow.addColorStop(0, `rgba(${palette.core}, ${Math.min(1, opacity * 1.25)})`);
        glow.addColorStop(0.18, `rgba(${palette.core}, ${opacity * 0.92})`);
        glow.addColorStop(0.48, `rgba(${palette.glow}, ${opacity * 0.3})`);
        glow.addColorStop(1, `rgba(${palette.glow}, 0)`);

        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, glowRadius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(${palette.core}, ${Math.min(1, opacity * 1.1)})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
    }

    drawMeteor() {
      if (!this.headerContext || !this.meteor) return;

      const { x, y, velocityX, velocityY, tailLength, tailDots, age, duration } = this.meteor;
      const life = Math.min(age / 180, 1, (duration - age) / 180);
      const unitLength = Math.hypot(velocityX, velocityY) || 1;
      const directionX = velocityX / unitLength;
      const directionY = velocityY / unitLength;
      const headRadius = 1.25;
      const tailStart = headRadius * 0.92;
      const context = this.headerContext;
      const headGlow = context.createRadialGradient(x, y, 0, x, y, 5.5);

      headGlow.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, life)})`);
      headGlow.addColorStop(0.24, `rgba(221, 240, 255, ${Math.max(0, life) * 0.82})`);
      headGlow.addColorStop(1, 'rgba(167, 196, 255, 0)');

      // 光点严格沿速度反方向排布，形成与前进方向平行的细长拖尾。
      for (let index = 0; index < tailDots; index += 1) {
        const progress = index / (tailDots - 1);
        const distance = tailStart + (tailLength - tailStart) * progress;
        const dotX = x - directionX * distance;
        const dotY = y - directionY * distance;
        const dotRadius = Math.max(0.16, headRadius * 0.78 * Math.pow(1 - progress, 1.42));
        const dotOpacity = Math.max(0, life) * 0.78 * Math.pow(1 - progress, 1.15);
        const dotGlow = context.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotRadius * 2.8);

        dotGlow.addColorStop(0, `rgba(248, 252, 255, ${dotOpacity})`);
        dotGlow.addColorStop(0.42, `rgba(193, 222, 255, ${dotOpacity * 0.5})`);
        dotGlow.addColorStop(1, 'rgba(150, 194, 255, 0)');
        context.fillStyle = dotGlow;
        context.beginPath();
        context.arc(dotX, dotY, dotRadius * 2.8, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(242, 250, 255, ${dotOpacity})`;
        context.beginPath();
        context.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = headGlow;
      context.beginPath();
      context.arc(x, y, 5.5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(255, 255, 255, ${Math.max(0, life)})`;
      context.beginPath();
      context.arc(x, y, headRadius, 0, Math.PI * 2);
      context.fill();
    }

    destroy() {
      if (this.destroyed) return;

      this.destroyed = true;
      this.stop();
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
      this.unbindLifecycle();
      this.headerCanvas?.remove();
      this.headerCanvas = null;
      this.headerContext = null;
      this.headerEnabled = false;
      this.headerInView = false;
    }
  }

  function initializeStarfield() {
    window[GLOBAL_KEY]?.destroy();
    const controller = new StarfieldController();
    window[GLOBAL_KEY] = controller;
    controller.init();
  }

  document.addEventListener('pjax:complete', initializeStarfield);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStarfield, { once: true });
  } else {
    initializeStarfield();
  }
})();
