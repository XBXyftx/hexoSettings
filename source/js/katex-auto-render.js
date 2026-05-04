/**
 * KaTeX 客户端自动渲染脚本
 * 功能：在页面加载后扫描 $...$ 和 $$...$$ 语法，使用 KaTeX 渲染
 * 依赖：katex.min.js + auto-render.min.js（由本脚本动态加载）
 */

(function() {
  'use strict';

  var isLoaded = false;

  function renderMath() {
    var container = document.getElementById('article-container');
    if (!container || typeof window.renderMathInElement !== 'function') return;

    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false,
      trust: false
    });
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (callback) script.onload = callback;
    document.head.appendChild(script);
  }

  function init() {
    if (isLoaded) {
      renderMath();
      return;
    }

    var container = document.getElementById('article-container');
    if (!container) return;

    // 检查页面中是否有数学公式语法
    var hasMath = /\$[^\$\n]+?\$/.test(container.textContent);
    if (!hasMath) return;

    isLoaded = true;

    // 加载 KaTeX JS
    loadScript('/js/katex/katex.min.js', function() {
      // 加载 auto-render 扩展
      loadScript('/js/katex/auto-render.min.js', function() {
        renderMath();
      });
    });
  }

  // 初始加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // PJAX 导航后重新渲染
  document.addEventListener('pjax:complete', function() {
    isLoaded = false;
    init();
  });
})();
