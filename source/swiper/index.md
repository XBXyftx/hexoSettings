---
title: 图图图图图
date: 2025-05-26 16:03:13
type: about
top_img: /img/swiperTopImg.jpg  # 自定义顶部图
comments: true  # 是否开启评论
description: "这里是你的个人简介"
---

<style>
  /* 瀑布流样式 */
  .waterfall-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
  }

  .waterfall-grid {
    position: relative;
    width: 100%;
  }

    .waterfall-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 2px solid transparent;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
    transform: translateY(50px) scale(0.9);
    position: absolute;
    cursor: pointer;
    visibility: hidden; /* 初始隐藏，防止未定位时显示 */
  }

  .waterfall-item.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    visibility: visible; /* 定位完成后显示 */
  }

  .waterfall-item.positioned {
    visibility: visible; /* 定位完成后立即显示 */
  }

  .waterfall-item:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    border: 2px solid transparent;
    background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)) padding-box,
                linear-gradient(135deg, #00f5ff, #0080ff, #00ff80, #00f5ff) border-box;
  }

  .waterfall-item img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }

  .waterfall-item:hover img {
    transform: scale(1.08);
  }

    /* 移除文字遮罩层，只保留图片放大效果 */

  /* 加载动画 */
  .loading-indicator {
    text-align: center;
    padding: 40px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
  }

  .loading-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: rgba(255, 255, 255, 0.8);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 10px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 浮现动画变体 */
  .waterfall-item:nth-child(odd) {
    animation-delay: 0.1s;
  }

  .waterfall-item:nth-child(even) {
    animation-delay: 0.2s;
  }

  .waterfall-item:nth-child(3n) {
    animation-delay: 0.3s;
  }

  /* 空状态提示样式 */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin: 20px 0;
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .upload-area {
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    margin: 20px 0;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .upload-area:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }

  .upload-area.dragover {
    border-color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }

  /* 移动端适配 - 保持两列布局 */
  @media (max-width: 768px) {
    .waterfall-container {
      padding: 15px;
    }

    .waterfall-item {
      border-radius: 8px;
    }

    .waterfall-item:hover {
      transform: translateY(-3px) scale(1.04);
    }
  }

  @media (max-width: 480px) {
    .waterfall-container {
      padding: 10px;
    }

    .waterfall-item {
      border-radius: 6px;
    }

    .waterfall-item:hover {
      transform: translateY(-2px) scale(1.03);
    }
  }

  /* 滚动条美化 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }


</style>

<div class="waterfall-container">
  <div class="upload-area" id="uploadArea" style="display: none;">
    <div style="color: rgba(255, 255, 255, 0.7); margin-bottom: 10px;">
      📁 将图片拖拽到这里或点击选择图片
    </div>
    <div style="font-size: 14px; color: rgba(255, 255, 255, 0.5);">
      支持 JPG、PNG、GIF、WebP 格式
    </div>
    <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
  </div>
  
  <div class="waterfall-grid" id="waterfallGrid">
    <!-- 图片将通过JavaScript动态加载 -->
  </div>
  
  <div class="loading-indicator" id="loadingIndicator">
    <div class="loading-spinner"></div>
    <div>正在扫描图片文件...本功能为测试功能数据加载较慢请耐心等待一分钟左右</div>
  </div>
</div>

<script>
  // 配置参数
  const config = {
    // 图片文件夹路径（相对于当前页面）
    imageFolderPath: '/swiper/images/',
    // 支持的图片格式
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    loadDelay: 200, // 每张图片加载间隔
    observerOptions: {
      threshold: 0.1,
      rootMargin: '50px'
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('waterfallGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    let loadedCount = 0;
    let currentImages = [];
    let columnHeights = [0, 0]; // 两列的高度
    const getGap = () => window.innerWidth <= 480 ? 10 : (window.innerWidth <= 768 ? 12 : 15);
    const columnWidth = () => (grid.offsetWidth - getGap()) / 2; // 计算列宽

    // 创建Intersection Observer用于监听元素进入视口
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, config.observerOptions);

    // 尝试自动读取本地图片文件夹
    async function loadLocalImages() {
      try {
        // 优先尝试读取自动生成的图片列表
        const autoResponse = await fetch('/swiper/images-auto.json');
        if (autoResponse.ok) {
          const imageList = await autoResponse.json();
          if (imageList.length > 0) {
            console.log('使用自动扫描的图片列表:', imageList);
            return imageList.map(filename => config.imageFolderPath + filename);
          }
        }
      } catch (error) {
        console.log('无法读取自动生成的图片列表，尝试手动配置...');
      }

      try {
        // 备用：尝试读取手动配置的images.json文件
        const response = await fetch('/swiper/images.json');
        if (response.ok) {
          const imageList = await response.json();
          if (imageList.length > 0) {
            console.log('使用手动配置的图片列表:', imageList);
            return imageList.map(filename => config.imageFolderPath + filename);
          }
        }
      } catch (error) {
        console.log('无法读取手动配置的images.json，尝试其他方法...');
      }

      // 最后备用：尝试常见的图片文件名
      const commonNames = [
        '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
        '1.png', '2.png', '3.png', '4.png', '5.png',
        'image1.jpg', 'image2.jpg', 'image3.jpg',
        'photo1.jpg', 'photo2.jpg', 'photo3.jpg',
        'pic1.jpg', 'pic2.jpg', 'pic3.jpg'
      ];

      const validImages = [];
      for (const name of commonNames) {
        try {
          const testUrl = config.imageFolderPath + name;
          const response = await fetch(testUrl, { method: 'HEAD' });
          if (response.ok) {
            validImages.push(testUrl);
          }
        } catch (error) {
          // 忽略错误，继续检查下一个
        }
      }

      return validImages.length > 0 ? validImages : null;
    }

        // 创建图片元素
    function createImageItem(src, index, filename = '') {
      const item = document.createElement('div');
      item.className = 'waterfall-item';
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = filename || `图片 ${index + 1}`;
      img.loading = 'lazy'; // 懒加载
      
      item.appendChild(img);

      // 图片加载完成后的处理
      img.onload = () => {
        positionItem(item, img);
        loadedCount++;
        
        // 延迟一点时间再检查是否全部加载完成，确保布局稳定
        setTimeout(() => {
          if (loadedCount === currentImages.length) {
            hideLoadingIndicator();
            updateGridHeight();
            // 触发所有图片的浮现动画
            triggerVisibilityAnimation();
          }
        }, 50);
      };

      // 图片加载失败的处理
      img.onerror = () => {
        item.style.display = 'none';
        loadedCount++;
        
        setTimeout(() => {
          if (loadedCount === currentImages.length) {
            hideLoadingIndicator();
            updateGridHeight();
            triggerVisibilityAnimation();
          }
        }, 50);
      };

      // 添加点击事件
      item.addEventListener('click', () => {
        openImageModal(src, index, filename);
      });

      return item;
    }

    // 定位图片到瀑布流中
    function positionItem(item, img) {
      const width = columnWidth();
      const gap = getGap();
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const height = width * aspectRatio;
      
      // 找到较短的列
      const shortestColumn = columnHeights[0] <= columnHeights[1] ? 0 : 1;
      
      // 设置图片位置和大小
      item.style.width = width + 'px';
      item.style.height = height + 'px';
      item.style.left = shortestColumn * (width + gap) + 'px';
      item.style.top = columnHeights[shortestColumn] + 'px';
      
      // 标记为已定位，可以显示
      item.classList.add('positioned');
      
      // 更新列高度
      columnHeights[shortestColumn] += height + gap;
    }

    // 更新网格容器高度
    function updateGridHeight() {
      const maxHeight = Math.max(...columnHeights);
      grid.style.height = maxHeight + 'px';
    }

    // 重置瀑布流布局
    function resetLayout() {
      columnHeights = [0, 0];
      grid.style.height = 'auto';
    }

    // 触发所有图片的可见性动画
    function triggerVisibilityAnimation() {
      const items = grid.querySelectorAll('.waterfall-item.positioned');
      items.forEach((item, index) => {
        // 使用Intersection Observer监听元素
        setTimeout(() => {
          observer.observe(item);
        }, index * 50); // 错开动画时间
      });
    }

    // 逐个加载图片
    function loadImages(imageList) {
      currentImages = imageList;
      loadedCount = 0;
      grid.innerHTML = ''; // 清空现有内容
      resetLayout(); // 重置布局

      if (imageList.length === 0) {
        showEmptyState();
        hideLoadingIndicator();
        return;
      }

      imageList.forEach((src, index) => {
        setTimeout(() => {
          const filename = src.split('/').pop();
          const item = createImageItem(src, index, filename);
          grid.appendChild(item);
          
          // 不在这里添加observer，等所有图片加载完成后统一处理
        }, index * config.loadDelay);
      });
    }

    // 显示空状态
    function showEmptyState() {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.innerHTML = `
        <div class="empty-state-icon">📷</div>
        <div style="font-size: 18px; margin-bottom: 10px;">暂无图片</div>
        <div style="font-size: 14px; opacity: 0.7;">
          请将图片文件放入 images 文件夹，或使用下方上传功能
        </div>
      `;
      grid.appendChild(emptyDiv);
      
      // 显示上传区域
      uploadArea.style.display = 'block';
    }

    // 隐藏加载指示器
    function hideLoadingIndicator() {
      setTimeout(() => {
        loadingIndicator.style.opacity = '0';
        setTimeout(() => {
          loadingIndicator.style.display = 'none';
        }, 300);
      }, 500);
    }

    // 处理文件上传
    function handleFiles(files) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );

      if (imageFiles.length === 0) {
        alert('请选择有效的图片文件！');
        return;
      }

      const imageUrls = [];
      let processedCount = 0;

      // 显示加载状态
      loadingIndicator.style.display = 'block';
      loadingIndicator.style.opacity = '1';
      loadingIndicator.querySelector('div:last-child').textContent = '正在处理上传的图片...';

      imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageUrls[index] = {
            src: e.target.result,
            name: file.name
          };
          processedCount++;
          
          if (processedCount === imageFiles.length) {
            // 所有文件都处理完成，加载图片
            const validUrls = imageUrls.filter(item => item);
            loadUploadedImages(validUrls);
            uploadArea.style.display = 'none'; // 隐藏上传区域
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // 加载上传的图片
    function loadUploadedImages(imageData) {
      currentImages = imageData;
      loadedCount = 0;
      grid.innerHTML = ''; // 清空现有内容
      resetLayout(); // 重置布局

      imageData.forEach((item, index) => {
        setTimeout(() => {
          const imageItem = createImageItem(item.src, index, item.name);
          grid.appendChild(imageItem);
          
          // 不在这里添加observer，等所有图片加载完成后统一处理
        }, index * config.loadDelay);
      });
    }

    // 设置文件上传事件
    function setupFileUpload() {
      uploadArea.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
      });

      // 拖拽上传
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
      });
    }

    // 图片模态框
    function openImageModal(src, index, filename) {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      const img = document.createElement('img');
      img.src = src;
      img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        transform: scale(0.8);
        transition: transform 0.3s ease;
      `;

      const closeBtn = document.createElement('div');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        color: white;
        font-size: 40px;
        cursor: pointer;
        z-index: 10001;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transition: background 0.3s ease;
      `;

      const infoBar = document.createElement('div');
      infoBar.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 14px;
        backdrop-filter: blur(10px);
      `;
      infoBar.textContent = filename || `图片 ${index + 1}`;

      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      });

      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      });

      modal.appendChild(img);
      modal.appendChild(closeBtn);
      modal.appendChild(infoBar);
      document.body.appendChild(modal);

      // 动画显示
      setTimeout(() => {
        modal.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, 10);

      // 关闭模态框
      const closeModal = () => {
        modal.style.opacity = '0';
        img.style.transform = 'scale(0.8)';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      };

      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      // ESC键关闭
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
    }



    // 重新布局所有图片
    function relayoutImages() {
      resetLayout();
      const items = grid.querySelectorAll('.waterfall-item');
      
      // 先隐藏所有图片
      items.forEach(item => {
        item.classList.remove('positioned');
      });
      
      // 重新定位
      items.forEach(item => {
        const img = item.querySelector('img');
        if (img && img.complete && img.naturalHeight > 0) {
          positionItem(item, img);
        }
      });
      
      updateGridHeight();
      
      // 重新触发可见性动画
      setTimeout(() => {
        triggerVisibilityAnimation();
      }, 100);
    }

    // 初始化
    async function initialize() {
      setupFileUpload();

      // 窗口大小变化时重新布局
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(relayoutImages, 300);
      });

      // 尝试加载本地图片
      const localImages = await loadLocalImages();
      
      if (localImages && localImages.length > 0) {
        console.log('找到本地图片:', localImages.length, '张');
        loadImages(localImages);
      } else {
        console.log('未找到本地图片，显示空状态');
        // 直接显示空状态，不加载任何备用图片
        showEmptyState();
        hideLoadingIndicator();
      }
    }

    initialize();

    // 添加键盘导航支持
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });

    // 添加触摸滑动优化
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 100;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // 向上滑动，快速滚动到底部
          if (window.pageYOffset < document.body.scrollHeight - window.innerHeight - 100) {
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          }
        } else {
          // 向下滑动，快速滚动到顶部
          if (window.pageYOffset > 100) {
            window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          }
        }
      }
    }
  });
</script>
