---
title: 昨日重现
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
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: translateY(80px) scale(0.8) rotateX(15deg);
  position: absolute;
  cursor: pointer;
  visibility: hidden; /* 初始隐藏，防止未定位时显示 */
}

.waterfall-item.visible {
  opacity: 1;
  transform: translateY(0) scale(1) rotateX(0deg);
  visibility: visible; /* 定位完成后显示 */
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3),
              0 0 0 2px rgba(135, 206, 250, 0.5),
              0 0 0 4px rgba(0, 255, 127, 0.4);
  animation: colorfulGlow 0.8s ease-out;
}

@keyframes colorfulGlow {
  0% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
                0 0 0 0px rgba(135, 206, 250, 0),
                0 0 0 0px rgba(0, 255, 127, 0);
  }
  50% {
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3),
                0 0 0 3px rgba(135, 206, 250, 0.8),
                0 0 0 6px rgba(0, 255, 127, 0.7);
  }
  100% {
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3),
                0 0 0 2px rgba(135, 206, 250, 0.5),
                0 0 0 4px rgba(0, 255, 127, 0.4);
  }
}

.waterfall-item.positioned {
  visibility: visible; /* 定位完成后立即显示 */
}

.waterfall-item:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4),
              0 0 0 3px rgba(135, 206, 250, 0.8),
              0 0 0 6px rgba(0, 255, 127, 0.7);
  border: 2px solid transparent;
  background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)) padding-box,
              linear-gradient(135deg, #87ceeb, #00ff7f, #87ceeb) border-box;
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
.loading-indicator, .load-more-indicator {
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

/* 进度指示器样式 */
.progress-indicator {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 15px 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  opacity: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 15px auto;
  max-width: 400px;
  text-align: center;
}

.progress-text {
  margin-bottom: 8px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00f5ff, #0080ff);
  border-radius: 2px;
  transition: width 0.3s ease;
  width: 0%;
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

  .progress-indicator {
    margin: 10px;
    font-size: 12px;
    padding: 12px 15px;
  }

  .preload-indicator {
    margin: 10px;
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

/* 优化滚动性能 */
html {
  scroll-behavior: auto; /* 确保不会有意外的平滑滚动 */
}

body {
  -webkit-overflow-scrolling: touch; /* iOS 滚动优化 */
  overscroll-behavior: auto; /* 允许原生滚动行为 */
}

.waterfall-container {
  -webkit-overflow-scrolling: touch; /* iOS 滚动优化 */
  overscroll-behavior: auto; /* 允许原生滚动行为 */
  contain: layout style paint; /* CSS containment 优化 */
}

/* 图片加载优化 */
.waterfall-item img {
  will-change: transform; /* 提示浏览器优化变换 */
  content-visibility: auto; /* 内容可见性优化 */
  contain: layout style paint; /* CSS containment */
}

/* 预加载提示 */
.preload-indicator {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 10px auto;
  max-width: 300px;
  text-align: center;
}

.preload-indicator.visible {
  opacity: 1;
  visibility: visible;
}
</style>

<div class="waterfall-container">
  <div style="text-align: center; margin-bottom: 20px; color: rgba(255, 255, 255, 0.8); font-size: 18px; font-weight: 500;">
    📸 本功能仍为beta测试版，欢迎大家在评论区提意见
  </div>
  
  <div style="text-align: center; margin-bottom: 15px;">
    <button id="clearCacheBtn" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); color: rgba(255, 255, 255, 0.8); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
      🗑️ 清除图片缓存
    </button>
    <span id="cacheStatus" style="margin-left: 15px; font-size: 12px; color: rgba(255, 255, 255, 0.6);"></span>
  </div>
  
  <!-- 进度指示器放在清除按钮和图片之间 -->
  <div class="progress-indicator" id="progressIndicator">
    <div class="progress-text">已加载 <span id="loadedCount">0</span> / <span id="totalCount">0</span> 张图片</div>
    <div class="cache-text" id="cacheText" style="font-size: 12px; opacity: 0.8; margin-top: 4px;"></div>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
  </div>

  <div class="preload-indicator" id="preloadIndicator">
    🚀 预加载中...
  </div>
  
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
  loadDelay: 100, // 增加加载间隔到100ms，减少并发压力
  concurrentLoads: 4, // 减少并发数量到4，避免浏览器限制
  preloadCount: 5, // 减少预加载数量到5
  imageTimeout: 8000, // 增加单图超时到8秒
  batchTimeout: 15000, // 增加批次超时到15秒
  observerOptions: {
    threshold: 0.1, // 降低阈值，更早触发显示
    rootMargin: '50px' // 增加边距，提前加载
  },
  // 缓存配置
  cache: {
    dbName: 'SwiperImageCache',
    dbVersion: 1,
    storeName: 'images',
    maxCacheSize: 100 * 1024 * 1024, // 100MB缓存限制
    cacheExpiry: 7 * 24 * 60 * 60 * 1000 // 7天过期
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('waterfallGrid');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const progressIndicator = document.getElementById('progressIndicator');
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  let loadedCount = 0;
  let currentImages = [];
  let allImages = []; // 存储所有图片
  let currentBatch = 0; // 当前批次
  let isLoading = false; // 是否正在加载
  let columnHeights = [0, 0]; // 两列的高度
  const BATCH_SIZE = 20; // 减少每批数量，增加并发
  let activeLoads = 0; // 当前活跃的加载任务数
  let loadQueue = []; // 加载队列
  let preloadedImages = new Map(); // 预加载的图片缓存
  const getGap = () => window.innerWidth <= 480 ? 10 : (window.innerWidth <= 768 ? 12 : 15);
  const columnWidth = () => (grid.offsetWidth - getGap()) / 2; // 计算列宽
  let imageCache = null; // IndexedDB 缓存实例
  let cacheStats = { total: 0, cached: 0, remaining: 0 }; // 缓存统计

  // IndexedDB 缓存管理器
  class ImageCacheManager {
    constructor() {
      this.db = null;
      this.ready = false;
    }

    async init() {
      try {
        const request = indexedDB.open(config.cache.dbName, config.cache.dbVersion);
        
        request.onerror = () => {
          console.warn('IndexedDB 初始化失败，将使用内存缓存');
          this.ready = false;
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(config.cache.storeName)) {
            const store = db.createObjectStore(config.cache.storeName, { keyPath: 'url' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        this.db = await new Promise((resolve, reject) => {
          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onerror = () => reject(request.error);
        });

        this.ready = true;
        console.log('🗄️ IndexedDB 缓存初始化成功');
        
        // 清理过期缓存
        await this.cleanExpiredCache();
        
      } catch (error) {
        console.warn('IndexedDB 不可用，使用内存缓存:', error);
        this.ready = false;
      }
    }

    async get(url) {
      if (!this.ready || !this.db) return null;
      
      try {
        const transaction = this.db.transaction([config.cache.storeName], 'readonly');
        const store = transaction.objectStore(config.cache.storeName);
        const request = store.get(url);
        
        const result = await new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
        });

        if (result) {
          // 检查是否过期
          const now = Date.now();
          if (now - result.timestamp > config.cache.cacheExpiry) {
            await this.delete(url);
            return null;
          }
          console.log(`📦 从缓存加载图片: ${url.split('/').pop()}`);
          return result.blob;
        }
        
        return null;
      } catch (error) {
        console.warn('缓存读取失败:', error);
        return null;
      }
    }

    async set(url, blob) {
      if (!this.ready || !this.db) return false;
      
      try {
        // 检查缓存大小限制
        await this.checkCacheSize();
        
        const transaction = this.db.transaction([config.cache.storeName], 'readwrite');
        const store = transaction.objectStore(config.cache.storeName);
        
        const cacheItem = {
          url: url,
          blob: blob,
          timestamp: Date.now(),
          size: blob.size
        };
        
        await new Promise((resolve, reject) => {
          const request = store.put(cacheItem);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        console.log(`💾 图片已缓存: ${url.split('/').pop()} (${(blob.size / 1024).toFixed(1)}KB)`);
        return true;
      } catch (error) {
        console.warn('缓存写入失败:', error);
        return false;
      }
    }

    async delete(url) {
      if (!this.ready || !this.db) return;
      
      try {
        const transaction = this.db.transaction([config.cache.storeName], 'readwrite');
        const store = transaction.objectStore(config.cache.storeName);
        await new Promise((resolve) => {
          const request = store.delete(url);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      } catch (error) {
        console.warn('缓存删除失败:', error);
      }
    }

    async checkCacheSize() {
      if (!this.ready || !this.db) return;
      
      try {
        const transaction = this.db.transaction([config.cache.storeName], 'readonly');
        const store = transaction.objectStore(config.cache.storeName);
        const request = store.getAll();
        
        const items = await new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });

        const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
        
        if (totalSize > config.cache.maxCacheSize) {
          console.log(`🧹 缓存超限 (${(totalSize / 1024 / 1024).toFixed(1)}MB)，开始清理...`);
          
          // 按时间戳排序，删除最旧的项目
          items.sort((a, b) => a.timestamp - b.timestamp);
          
          let cleanedSize = 0;
          const targetSize = config.cache.maxCacheSize * 0.8; // 清理到80%
          
          for (const item of items) {
            if (totalSize - cleanedSize <= targetSize) break;
            
            await this.delete(item.url);
            cleanedSize += item.size || 0;
          }
          
          console.log(`✅ 清理完成，释放 ${(cleanedSize / 1024 / 1024).toFixed(1)}MB 空间`);
        }
      } catch (error) {
        console.warn('缓存大小检查失败:', error);
      }
    }

    async cleanExpiredCache() {
      if (!this.ready || !this.db) return;
      
      try {
        const transaction = this.db.transaction([config.cache.storeName], 'readwrite');
        const store = transaction.objectStore(config.cache.storeName);
        const index = store.index('timestamp');
        
        const now = Date.now();
        const expiredBefore = now - config.cache.cacheExpiry;
        
        const range = IDBKeyRange.upperBound(expiredBefore);
        const request = index.openCursor(range);
        
        let cleanedCount = 0;
        await new Promise((resolve) => {
          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              cursor.delete();
              cleanedCount++;
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => resolve();
        });
        
        if (cleanedCount > 0) {
          console.log(`🧹 清理了 ${cleanedCount} 个过期缓存项`);
        }
      } catch (error) {
        console.warn('过期缓存清理失败:', error);
      }
    }

    async getCacheStats(urls) {
      if (!this.ready || !this.db) {
        return { total: urls.length, cached: 0, remaining: urls.length };
      }
      
      try {
        const transaction = this.db.transaction([config.cache.storeName], 'readonly');
        const store = transaction.objectStore(config.cache.storeName);
        
        let cachedCount = 0;
        const now = Date.now();
        
        for (const url of urls) {
          const request = store.get(url);
          const result = await new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
          });
          
          if (result && (now - result.timestamp <= config.cache.cacheExpiry)) {
            cachedCount++;
          }
        }
        
        return {
          total: urls.length,
          cached: cachedCount,
          remaining: urls.length - cachedCount
        };
      } catch (error) {
        console.warn('缓存统计失败:', error);
        return { total: urls.length, cached: 0, remaining: urls.length };
      }
    }
  }

  // 创建Intersection Observer用于监听元素进入视口
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const item = entry.target;
      
      if (entry.isIntersecting) {
        // 进入视口，添加浮现动画
        if (!item.classList.contains('visible')) {
          // 随机延迟，让图片逐个浮现
          const delay = Math.random() * 300 + 50; // 50-350ms 随机延迟
          
          setTimeout(() => {
            item.classList.add('visible');
            console.log(`🎬 图片进入视口浮现显示，延迟: ${delay.toFixed(0)}ms`);
          }, delay);
        }
      } else {
        // 离开视口，立即隐藏等待下次浮现动画
        if (item.classList.contains('visible')) {
          item.classList.remove('visible');
          console.log(`👻 图片离开视口，隐藏等待下次浮现`);
        }
      }
    });
  }, {
    threshold: 0.1, // 当图片10%可见时触发
    rootMargin: '50px' // 提前50px开始动画
  });

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

  // 数组随机打乱函数
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 带缓存的图片预加载
  async function preloadImageWithCache(src) {
    if (preloadedImages.has(src)) {
      return preloadedImages.get(src);
    }

    try {
      // 首先尝试从缓存获取
      if (imageCache && imageCache.ready) {
        const cachedBlob = await imageCache.get(src);
        if (cachedBlob) {
          const img = new Image();
          const objectUrl = URL.createObjectURL(cachedBlob);
          
          return new Promise((resolve, reject) => {
            img.onload = () => {
              // 不要立即释放 objectUrl，因为图片可能还在使用
              img.setAttribute('data-object-url', objectUrl);
              preloadedImages.set(src, img);
              resolve(img);
            };
            img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              reject(new Error(`Cached image load failed: ${src}`));
            };
            img.src = objectUrl;
          });
        }
      }

      // 缓存中没有，从网络加载
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // 保存到缓存
      if (imageCache && imageCache.ready) {
        await imageCache.set(src, blob);
      }

      // 创建图片对象
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          img.setAttribute('data-object-url', objectUrl);
          preloadedImages.set(src, img);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Network image load failed: ${src}`));
        };
        img.src = objectUrl;
      });

    } catch (error) {
      console.warn(`图片预加载失败: ${src}`, error);
      throw error;
    }
  }

  // 清理对象URL（在图片不再需要时调用）
  function cleanupImageUrl(img) {
    const objectUrl = img.getAttribute('data-object-url');
    if (objectUrl && objectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl);
      img.removeAttribute('data-object-url');
    }
  }

  // 并发加载管理器
  function processLoadQueue() {
    while (loadQueue.length > 0 && activeLoads < config.concurrentLoads) {
      const task = loadQueue.shift();
      activeLoads++;
      
      task().finally(() => {
        activeLoads--;
        processLoadQueue(); // 继续处理队列
      });
    }
  }

  // 添加加载任务到队列
  function addToLoadQueue(loadTask) {
    loadQueue.push(loadTask);
    processLoadQueue();
  }

  // 创建图片元素（使用预加载）
  function createImageItem(src, index, filename = '', onLoadCallback = null) {
    const item = document.createElement('div');
    item.className = 'waterfall-item';
    
    const img = document.createElement('img');
    img.alt = filename || `图片 ${index + 1}`;
    img.title = filename || `图片 ${index + 1}`;
    img.loading = 'eager'; // 改为eager加载，因为我们有并发控制
    img.setAttribute('data-fancybox', 'gallery'); // 为博客的fancybox添加属性
    
    item.appendChild(img);

    // 添加超时处理
    let loadTimeout;
    let hasLoaded = false;

    const handleLoadComplete = (success = true) => {
      if (hasLoaded) return; // 防止重复调用
      hasLoaded = true;
      
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      
      if (success) {
        console.log(`✅ 图片 ${index + 1} (${filename}) 加载成功`);
      } else {
        console.warn(`❌ 图片 ${index + 1} (${filename}) 加载失败或超时`);
      }
      
      // 调用回调函数
      if (onLoadCallback) {
        onLoadCallback();
      }
    };

    // 使用预加载的图片或直接加载
    const loadImage = async () => {
      try {
        let preloadedImg;
        
        // 使用带缓存的预加载
        preloadedImg = await preloadImageWithCache(src);
        const cacheStatus = preloadedImg.getAttribute('data-object-url') ? '(缓存)' : '(网络)';
        console.log(`📥 加载图片 ${index + 1} ${cacheStatus}: ${filename}`);
        
        // 设置图片源（如果使用缓存，src 已经是 blob URL）
        if (preloadedImg.getAttribute('data-object-url')) {
          img.src = preloadedImg.src;
        } else {
          img.src = src;
        }
        
        // 图片源已在上面设置
        
        // 确保容器有宽度再进行定位
        if (grid.offsetWidth > 0) {
          positionItem(item, preloadedImg);
        } else {
          // 如果容器宽度为0，等待一下再重试
          setTimeout(() => {
            if (grid.offsetWidth > 0) {
              positionItem(item, preloadedImg);
            } else {
              console.warn(`容器宽度为0，无法定位图片: ${src}`);
              // 使用默认布局，并直接显示
              item.style.position = 'relative';
              item.style.width = '100%';
              item.style.marginBottom = '15px';
              item.classList.add('positioned');
              item.classList.add('visible'); // 直接显示，不依赖Observer
              
              // 通知博客的图片查看器处理新添加的图片
              const img = item.querySelector('img');
              if (img && window.btf && window.btf.loadLightbox) {
                setTimeout(() => {
                  window.btf.loadLightbox([img]);
                }, 100);
              }
              
              console.log(`🎬 图片使用默认布局并直接显示: ${filename}`);
            }
          }, 100);
        }
        
        handleLoadComplete(true);
      } catch (error) {
        console.warn(`图片加载失败: ${src}`, error);
        item.style.display = 'none';
        handleLoadComplete(false);
      }
    };

    // 设置超时处理（增加到配置的超时时间）
    loadTimeout = setTimeout(() => {
      if (!hasLoaded) {
        console.warn(`⏰ 图片加载超时(${config.imageTimeout}ms): ${src}`);
        item.style.display = 'none';
        handleLoadComplete(false);
      }
    }, config.imageTimeout);

    // 图片点击事件交给博客本身的图片查看器处理

    // 开始加载
    loadImage();

    return item;
  }

  // 修改定位函数，支持预加载的图片对象
  function positionItem(item, imgElement) {
    const containerWidth = grid.offsetWidth;
    if (containerWidth <= 0) {
      console.warn('容器宽度为0，延迟定位');
      setTimeout(() => positionItem(item, imgElement), 100);
      return;
    }

    const width = columnWidth();
    const gap = getGap();
    
    // 如果传入的是预加载的图片对象，使用其尺寸
    const naturalWidth = imgElement.naturalWidth || imgElement.width;
    const naturalHeight = imgElement.naturalHeight || imgElement.height;
    
    if (naturalWidth && naturalHeight && width > 0) {
      const aspectRatio = naturalHeight / naturalWidth;
      const height = width * aspectRatio;
      
      // 找到较短的列
      const shortestColumn = columnHeights[0] <= columnHeights[1] ? 0 : 1;
      
      // 设置图片位置和大小
      item.style.position = 'absolute';
      item.style.width = width + 'px';
      item.style.height = height + 'px';
      item.style.left = shortestColumn * (width + gap) + 'px';
      item.style.top = columnHeights[shortestColumn] + 'px';
      
      // 标记为已定位，可以显示
      item.classList.add('positioned');
      
      // 更新列高度
      columnHeights[shortestColumn] += height + gap;
      
      // 通知博客的图片查看器处理新添加的图片
      const img = item.querySelector('img');
      if (img && window.btf && window.btf.loadLightbox) {
        setTimeout(() => {
          window.btf.loadLightbox([img]);
        }, 100);
      }
      
      console.log(`📍 定位图片: 列${shortestColumn}, 位置(${shortestColumn * (width + gap)}, ${columnHeights[shortestColumn] - height - gap}), 尺寸(${width}x${height})`);
    } else {
      console.warn('无法获取图片尺寸或宽度为0，使用默认布局');
      item.style.position = 'relative';
      item.style.width = '100%';
      item.style.marginBottom = '15px';
      item.classList.add('positioned');
      
      // 通知博客的图片查看器处理新添加的图片
      const img = item.querySelector('img');
      if (img && window.btf && window.btf.loadLightbox) {
        setTimeout(() => {
          window.btf.loadLightbox([img]);
        }, 100);
      }
    }
  }

  // 更新网格容器高度
  function updateGridHeight() {
    const maxHeight = Math.max(...columnHeights);
    if (maxHeight > 0) {
      grid.style.height = maxHeight + 'px';
      console.log(`📏 更新容器高度: ${maxHeight}px`);
    } else {
      // 如果计算高度为0，使用实际内容高度
      const items = grid.querySelectorAll('.waterfall-item.positioned');
      if (items.length > 0) {
        let actualMaxHeight = 0;
        items.forEach(item => {
          const itemBottom = item.offsetTop + item.offsetHeight;
          if (itemBottom > actualMaxHeight) {
            actualMaxHeight = itemBottom;
          }
        });
        if (actualMaxHeight > 0) {
          grid.style.height = (actualMaxHeight + 20) + 'px'; // 添加一些底部间距
          console.log(`📏 使用实际内容高度: ${actualMaxHeight + 20}px`);
        }
      }
    }
  }

  // 重置瀑布流布局
  function resetLayout() {
    columnHeights = [0, 0];
    grid.style.height = 'auto';
  }

  // 触发所有图片的可见性动画
  function triggerVisibilityAnimation() {
    const items = grid.querySelectorAll('.waterfall-item.positioned');
    console.log(`🎬 设置可见性监听，共 ${items.length} 个已定位的图片`);
    
    items.forEach((item, index) => {
      // 先移除之前的监听，避免重复
      observer.unobserve(item);
      
      // 重置图片状态，所有图片都需要重新触发动画
      item.classList.remove('visible');
      
      // 为所有图片设置Observer监听，让它们都有浮现动画
      observer.observe(item);
      console.log(`👀 重新设置监听: 图片 ${index}`);
    });
  }

  // 触发新加载图片的动画
  function triggerNewItemsAnimation(startIndex) {
    const allItems = grid.querySelectorAll('.waterfall-item.positioned');
    const newItems = Array.from(allItems).slice(startIndex);
    
    console.log(`🎬 设置新图片监听，从索引 ${startIndex} 开始，共 ${newItems.length} 个新图片`);
    
    newItems.forEach((item, index) => {
      // 先移除之前的监听，避免重复
      observer.unobserve(item);
      
      // 确保新图片初始状态为隐藏
      item.classList.remove('visible');
      
      // 为所有新图片设置Observer监听，让它们都有浮现动画
      observer.observe(item);
      console.log(`👀 设置新图片监听: 索引 ${startIndex + index}`);
    });
  }

  // 分批加载图片（优化版 + 随机化 + 缓存）
  async function loadImages(imageList) {
    // 随机打乱图片顺序
    const randomizedImages = shuffleArray(imageList);
    console.log(`🎲 图片列表已随机打乱: ${randomizedImages.length} 张图片`);
    
    allImages = randomizedImages;
    currentBatch = 0;
    loadedCount = 0;
    activeLoads = 0;
    loadQueue = [];
    grid.innerHTML = ''; // 清空现有内容
    resetLayout(); // 重置布局

    if (randomizedImages.length === 0) {
      showEmptyState();
      hideLoadingIndicator();
      return;
    }

    // 获取缓存统计
    if (imageCache && imageCache.ready) {
      cacheStats = await imageCache.getCacheStats(randomizedImages);
      console.log(`📊 缓存统计: ${cacheStats.cached}/${cacheStats.total} 张图片已缓存，需要加载 ${cacheStats.remaining} 张`);
      
      // 更新加载提示
      const loadingText = loadingIndicator.querySelector('div:last-child');
      if (loadingText) {
        loadingText.textContent = `正在加载图片...已缓存 ${cacheStats.cached} 张，需下载 ${cacheStats.remaining} 张`;
      }
    }

    console.log(`🚀 开始加载 ${randomizedImages.length} 张图片，并发数: ${config.concurrentLoads}`);

    // 显示进度指示器（当图片数量大于1批时）
    if (randomizedImages.length > BATCH_SIZE) {
      showProgressIndicator();
      updateProgress();
    }

    // 预加载前几张图片
    preloadInitialImages(randomizedImages);

    // 加载第一批图片
    loadNextBatch();
  }

  // 预加载初始图片
  async function preloadInitialImages(imageList) {
    const preloadList = imageList.slice(0, config.preloadCount);
    console.log(`🔄 开始预加载前 ${preloadList.length} 张图片`);
    
    // 显示预加载指示器
    const preloadIndicator = document.getElementById('preloadIndicator');
    if (preloadIndicator && preloadList.length > 0) {
      preloadIndicator.textContent = `🚀 预加载中... 0/${preloadList.length}`;
      preloadIndicator.classList.add('visible');
    }
    
    let completedCount = 0;
    const preloadPromises = preloadList.map(async (src, index) => {
      try {
        await preloadImageWithCache(src);
        completedCount++;
        console.log(`✅ 预加载完成: 图片 ${index + 1}`);
        
        // 更新预加载指示器
        if (preloadIndicator) {
          preloadIndicator.textContent = `🚀 预加载中... ${completedCount}/${preloadList.length}`;
        }
      } catch (error) {
        completedCount++;
        console.warn(`❌ 预加载失败: 图片 ${index + 1}`, error);
        
        // 即使失败也要更新计数
        if (preloadIndicator) {
          preloadIndicator.textContent = `🚀 预加载中... ${completedCount}/${preloadList.length}`;
        }
      }
    });

    // 并发预加载，但不等待全部完成
    Promise.allSettled(preloadPromises).then(() => {
      console.log(`�� 预加载阶段完成`);
      
      // 隐藏预加载指示器
      if (preloadIndicator) {
        preloadIndicator.textContent = `✅ 预加载完成`;
        setTimeout(() => {
          preloadIndicator.classList.remove('visible');
        }, 1500);
      }
    });
  }

  // 加载下一批图片（并发优化版）
  function loadNextBatch() {
    if (isLoading || currentBatch * BATCH_SIZE >= allImages.length) {
      return;
    }

    isLoading = true;
    const startIndex = currentBatch * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, allImages.length);
    const batchImages = allImages.slice(startIndex, endIndex);
    
    console.log(`🚀 开始并发加载第 ${currentBatch + 1} 批图片: ${startIndex + 1}-${endIndex} (共 ${allImages.length} 张)`);
    
    // 更新加载提示（仅在第一批时显示主加载指示器）
    if (currentBatch === 0) {
      const loadingText = loadingIndicator.querySelector('div:last-child');
      if (loadingText) {
        loadingText.textContent = `正在并发加载第 ${currentBatch + 1} 批图片 (${startIndex + 1}-${endIndex}/${allImages.length})...`;
      }
    }

    let batchLoadedCount = 0;
    
    // 设置批次超时机制
    const batchTimeout = setTimeout(() => {
      if (batchLoadedCount < batchImages.length) {
        console.warn(`⚠️ 批次 ${currentBatch + 1} 加载超时(${config.batchTimeout}ms)，强制完成。已加载 ${batchLoadedCount}/${batchImages.length} 张`);
        
        // 强制完成当前批次
        currentBatch++;
        isLoading = false;
        
        // 更新容器高度并触发显示动画
        setTimeout(() => {
          updateGridHeight();
          triggerVisibilityAnimation();
        }, 200);
        
        // 继续加载下一批
        if (currentBatch * BATCH_SIZE < allImages.length) {
          setTimeout(() => {
            loadNextBatch();
          }, 500);
        } else {
          console.log('🎉 所有图片加载完成（部分可能超时）！');
        }
      }
    }, config.batchTimeout);

    // 预加载下一批图片
    if (currentBatch * BATCH_SIZE + BATCH_SIZE < allImages.length) {
      const nextBatchStart = (currentBatch + 1) * BATCH_SIZE;
      const nextBatchEnd = Math.min(nextBatchStart + config.preloadCount, allImages.length);
      const nextBatchImages = allImages.slice(nextBatchStart, nextBatchEnd);
      
      console.log(`🔄 预加载下一批的前 ${nextBatchImages.length} 张图片`);
      nextBatchImages.forEach(src => {
        preloadImageWithCache(src).catch(() => {}); // 静默处理预加载错误
      });
    }
    
    // 使用并发队列加载当前批次
    batchImages.forEach((src, batchIndex) => {
      const globalIndex = startIndex + batchIndex;
      const filename = src.split('/').pop();
      
      // 添加到并发加载队列
      addToLoadQueue(async () => {
        return new Promise((resolve) => {
          // 延迟创建，避免同时创建太多DOM元素
          setTimeout(() => {
            const item = createImageItem(src, globalIndex, filename, () => {
              batchLoadedCount++;
              loadedCount++;
              
              console.log(`批次 ${currentBatch + 1}: 已加载 ${batchLoadedCount}/${batchImages.length} 张，总计 ${loadedCount}/${allImages.length} 张`);
              
              // 更新进度
              updateProgress();
              
              // 当前批次加载完成
              if (batchLoadedCount === batchImages.length) {
                // 清除批次超时定时器
                clearTimeout(batchTimeout);
                
                currentBatch++;
                isLoading = false;
                
                console.log(`✅ 第 ${currentBatch} 批图片加载完成！(${batchImages.length}张)`);
                
                // 如果是第一批，隐藏加载指示器并显示内容
                if (currentBatch === 1) {
                  hideLoadingIndicator();
                  // 强制更新高度，确保没有空白
                  setTimeout(() => {
                    updateGridHeight();
                    // 再次确保高度正确
                    setTimeout(() => {
                      updateGridHeight();
                      triggerVisibilityAnimation();
                      
                      // 备用机制：如果3秒后还有隐藏的图片，检查是否在视口内
                      setTimeout(() => {
                        const hiddenItems = grid.querySelectorAll('.waterfall-item.positioned:not(.visible)');
                        if (hiddenItems.length > 0) {
                          console.log(`📊 发现 ${hiddenItems.length} 个隐藏图片，检查是否在视口内`);
                          hiddenItems.forEach(item => {
                            const rect = item.getBoundingClientRect();
                            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
                            if (isInViewport) {
                              console.warn(`⚠️ 视口内图片未显示，强制显示`);
                              item.classList.add('visible');
                            }
                          });
                        }
                      }, 3000);
                    }, 100);
                  }, 50);
                } else {
                  // 强制更新高度，确保没有空白
                  setTimeout(() => {
                    updateGridHeight();
                    // 再次确保高度正确
                    setTimeout(() => {
                      updateGridHeight();
                      triggerNewItemsAnimation(startIndex);
                    }, 100);
                  }, 50);
                }
                
                // 检查是否还有更多图片需要加载，如果有则自动继续加载
                if (currentBatch * BATCH_SIZE < allImages.length) {
                  console.log(`🔄 还有 ${allImages.length - currentBatch * BATCH_SIZE} 张图片待加载，继续自动加载...`);
                  // 短暂延迟后自动加载下一批
                  setTimeout(() => {
                    loadNextBatch();
                  }, 200);
                } else {
                  console.log('🎉 所有图片加载完成！');
                }
              }
              
              resolve();
            });
            grid.appendChild(item);
          }, batchIndex * config.loadDelay);
        });
      });
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

  // 显示进度指示器
  function showProgressIndicator() {
    progressIndicator.style.display = 'block';
    setTimeout(() => {
      progressIndicator.style.opacity = '1';
    }, 10);
  }

  // 隐藏进度指示器
  function hideProgressIndicator() {
    progressIndicator.style.opacity = '0';
    setTimeout(() => {
      progressIndicator.style.display = 'none';
    }, 300);
  }

  // 更新进度
  function updateProgress() {
    const totalCount = allImages.length;
    const loadedCountSpan = document.getElementById('loadedCount');
    const totalCountSpan = document.getElementById('totalCount');
    const progressFill = document.getElementById('progressFill');
    const cacheText = document.getElementById('cacheText');
    
    if (loadedCountSpan) loadedCountSpan.textContent = loadedCount;
    if (totalCountSpan) totalCountSpan.textContent = totalCount;
    
    const percentage = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;
    if (progressFill) progressFill.style.width = percentage + '%';
    
    // 更新缓存信息
    if (cacheText && cacheStats.total > 0) {
      const cachePercentage = ((cacheStats.cached / cacheStats.total) * 100).toFixed(1);
      cacheText.textContent = `💾 ${cacheStats.cached} 张已缓存 (${cachePercentage}%) | 🌐 ${cacheStats.remaining} 张需下载`;
    }
    
    // 输出详细的进度信息
    console.log(`📊 进度更新: ${loadedCount}/${totalCount} (${percentage.toFixed(1)}%)`);
    
    // 当全部加载完成时，延迟隐藏进度指示器
    if (loadedCount >= totalCount && totalCount > 0) {
      console.log('🎯 所有图片加载完成，准备隐藏进度指示器');
      setTimeout(() => {
        hideProgressIndicator();
      }, 2000);
    }
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
    // 将上传的图片转换为URL格式
    const imageUrls = imageData.map(item => item.src);
    
    // 使用分批加载逻辑
    allImages = imageUrls;
    currentBatch = 0;
    loadedCount = 0;
    grid.innerHTML = ''; // 清空现有内容
    resetLayout(); // 重置布局

    // 显示加载指示器
    loadingIndicator.style.display = 'block';
    loadingIndicator.style.opacity = '1';
    
    // 开始分批加载
    loadNextBatch();
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

  // 设置缓存控制功能
  function setupCacheControls() {
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const cacheStatus = document.getElementById('cacheStatus');

    // 更新缓存状态显示
    const updateCacheStatus = async () => {
      if (imageCache && imageCache.ready && allImages.length > 0) {
        const stats = await imageCache.getCacheStats(allImages);
        const cacheSize = await getCacheSize();
        cacheStatus.textContent = `${stats.cached}/${stats.total} 张已缓存 (${cacheSize})`;
      } else {
        cacheStatus.textContent = '缓存未初始化';
      }
    };

    // 获取缓存大小
    const getCacheSize = async () => {
      if (!imageCache || !imageCache.ready || !imageCache.db) return '0KB';
      
      try {
        const transaction = imageCache.db.transaction([config.cache.storeName], 'readonly');
        const store = transaction.objectStore(config.cache.storeName);
        const request = store.getAll();
        
        const items = await new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });

        const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
        
        if (totalSize < 1024) return `${totalSize}B`;
        if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)}KB`;
        return `${(totalSize / 1024 / 1024).toFixed(1)}MB`;
      } catch (error) {
        return '未知';
      }
    };

    // 清除缓存按钮事件
    clearCacheBtn.addEventListener('click', async () => {
      if (!imageCache || !imageCache.ready) {
        alert('缓存系统未初始化');
        return;
      }

      const confirmed = confirm('确定要清除所有图片缓存吗？这将删除本地存储的所有图片数据。');
      if (!confirmed) return;

      try {
        clearCacheBtn.textContent = '🔄 清除中...';
        clearCacheBtn.disabled = true;

        // 删除数据库
        const deleteRequest = indexedDB.deleteDatabase(config.cache.dbName);
        await new Promise((resolve, reject) => {
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onblocked = () => {
            console.warn('数据库删除被阻塞，尝试强制清理');
            resolve();
          };
        });

        // 清理内存缓存
        preloadedImages.forEach((img) => {
          cleanupImageUrl(img);
        });
        preloadedImages.clear();

        // 重新初始化缓存系统
        imageCache = new ImageCacheManager();
        await imageCache.init();

        alert('缓存清除成功！页面将刷新以应用更改。');
        location.reload();

      } catch (error) {
        console.error('清除缓存失败:', error);
        alert('清除缓存失败: ' + error.message);
      } finally {
        clearCacheBtn.textContent = '🗑️ 清除图片缓存';
        clearCacheBtn.disabled = false;
      }
    });

    // 初始化时更新状态
    setTimeout(updateCacheStatus, 1000);
    
    // 定期更新缓存状态
    setInterval(updateCacheStatus, 10000);
  }

  // 图片模态框功能已移除，使用博客本身的图片查看器

  // 重新布局所有图片
  function relayoutImages() {
    resetLayout();
    const items = grid.querySelectorAll('.waterfall-item');
    
    // 先隐藏所有图片并移除监听
    items.forEach(item => {
      item.classList.remove('positioned', 'visible');
      observer.unobserve(item);
    });
    
    // 重新定位
    items.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.complete && img.naturalHeight > 0) {
        positionItem(item, img);
      }
    });
    
    // 多次更新高度确保正确
    updateGridHeight();
    setTimeout(() => {
      updateGridHeight();
    }, 100);
    setTimeout(() => {
      updateGridHeight();
    }, 300);
    
    // 重新触发可见性动画
    setTimeout(() => {
      triggerVisibilityAnimation();
    }, 200);
  }

  // 加载状态监控
  function startLoadingMonitor() {
    const monitorInterval = setInterval(() => {
      if (allImages.length > 0) {
        const progress = (loadedCount / allImages.length * 100).toFixed(1);
        const expectedBatch = Math.ceil(loadedCount / BATCH_SIZE);
        console.log(`🔍 加载监控: ${loadedCount}/${allImages.length} (${progress}%) - 当前批次: ${currentBatch + 1} - 正在加载: ${isLoading}`);
        
        // 检查是否有异常情况
        if (isLoading && currentBatch > 0) {
          const currentBatchStart = (currentBatch - 1) * BATCH_SIZE;
          const currentBatchEnd = Math.min(currentBatchStart + BATCH_SIZE, allImages.length);
          console.log(`📋 当前批次详情: 第${currentBatch}批 (${currentBatchStart + 1}-${currentBatchEnd})`);
        }
        
        // 检查Observer是否正常工作
        const positionedItems = grid.querySelectorAll('.waterfall-item.positioned');
        const visibleItems = grid.querySelectorAll('.waterfall-item.visible');
        const hiddenCount = positionedItems.length - visibleItems.length;
        
        if (hiddenCount > 0) {
          console.log(`📊 状态检查: ${positionedItems.length} 个已定位图片，${visibleItems.length} 个已显示，${hiddenCount} 个等待滚动显示`);
          
          // 检查是否有图片在视口内但未显示（可能是Observer失效）
          let needsObserverReset = false;
          positionedItems.forEach(item => {
            if (!item.classList.contains('visible')) {
              const rect = item.getBoundingClientRect();
              const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
              if (isInViewport) {
                console.warn(`⚠️ 发现视口内未显示的图片，Observer可能失效`);
                needsObserverReset = true;
              }
            }
          });
          
          // 如果Observer失效，重新设置监听
          if (needsObserverReset) {
            console.log(`🔄 重新设置Observer监听`);
            positionedItems.forEach(item => {
              if (!item.classList.contains('visible')) {
                observer.unobserve(item);
                observer.observe(item);
              }
            });
          }
        }
        
        // 如果加载完成，停止监控
        if (loadedCount >= allImages.length) {
          console.log('✅ 加载监控: 所有图片已加载完成');
          
          // 最终检查：确保Observer正常工作
          setTimeout(() => {
            const finalPositionedItems = grid.querySelectorAll('.waterfall-item.positioned');
            const finalVisibleItems = grid.querySelectorAll('.waterfall-item.visible');
            const finalHiddenCount = finalPositionedItems.length - finalVisibleItems.length;
            
            console.log(`🎉 加载完成状态：${finalPositionedItems.length} 个图片已定位，${finalVisibleItems.length} 个已显示，${finalHiddenCount} 个等待滚动显示`);
            
            // 检查Observer是否正常工作
            if (finalHiddenCount > 0) {
              let inViewportCount = 0;
              finalPositionedItems.forEach(item => {
                if (!item.classList.contains('visible')) {
                  const rect = item.getBoundingClientRect();
                  const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
                  if (isInViewport) {
                    inViewportCount++;
                  }
                }
              });
              
              if (inViewportCount > 0) {
                console.warn(`⚠️ 最终检查：有 ${inViewportCount} 个图片在视口内但未显示，Observer可能有问题`);
                // 重新设置Observer
                finalPositionedItems.forEach(item => {
                  if (!item.classList.contains('visible')) {
                    observer.unobserve(item);
                    observer.observe(item);
                  }
                });
              } else {
                console.log(`✅ Observer工作正常，${finalHiddenCount} 个图片在视口外等待滚动显示`);
              }
            }
          }, 3000);
          
          clearInterval(monitorInterval);
        }
      }
    }, 5000); // 每5秒检查一次
    
    return monitorInterval;
  }

  // 初始化
  async function initialize() {
    // 初始化缓存系统
    imageCache = new ImageCacheManager();
    await imageCache.init();
    
    setupFileUpload();
    setupCacheControls();

    // 窗口大小变化时重新布局
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(relayoutImages, 300);
    });

    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
      // 清理所有对象 URL
      preloadedImages.forEach((img) => {
        cleanupImageUrl(img);
      });
      preloadedImages.clear();
    });

    // 尝试加载本地图片
    const localImages = await loadLocalImages();
    
    if (localImages && localImages.length > 0) {
      console.log('找到本地图片:', localImages.length, '张');
      await loadImages(localImages); // 注意这里改为 await
      
      // 启动加载监控
      startLoadingMonitor();
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

  // 页面焦点恢复时检查Observer状态
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && allImages.length > 0) {
      console.log('🔍 页面重新获得焦点，检查Observer状态');
      setTimeout(() => {
        const positionedItems = grid.querySelectorAll('.waterfall-item.positioned');
        const visibleItems = grid.querySelectorAll('.waterfall-item.visible');
        const hiddenCount = positionedItems.length - visibleItems.length;
        
        if (hiddenCount > 0) {
          console.log(`📊 焦点恢复检查：${hiddenCount} 个图片等待滚动显示`);
          
          // 检查是否有图片在视口内但未显示
          let needsReset = false;
          positionedItems.forEach(item => {
            if (!item.classList.contains('visible')) {
              const rect = item.getBoundingClientRect();
              const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
              if (isInViewport) {
                needsReset = true;
              }
            }
          });
          
          if (needsReset) {
            console.log(`🔄 重新设置Observer（页面焦点恢复）`);
            positionedItems.forEach(item => {
              if (!item.classList.contains('visible')) {
                observer.unobserve(item);
                observer.observe(item);
              }
            });
          }
        }
      }, 500);
    }
  });

  // 窗口焦点恢复时也进行检查
  window.addEventListener('focus', () => {
    if (allImages.length > 0) {
      console.log('🔍 窗口重新获得焦点，检查Observer状态');
      setTimeout(() => {
        const positionedItems = grid.querySelectorAll('.waterfall-item.positioned');
        const visibleItems = grid.querySelectorAll('.waterfall-item.visible');
        const hiddenCount = positionedItems.length - visibleItems.length;
        
        if (hiddenCount > 0) {
          console.log(`📊 窗口焦点检查：${hiddenCount} 个图片等待滚动显示`);
          
          // 检查是否有图片在视口内但未显示
          let needsReset = false;
          positionedItems.forEach(item => {
            if (!item.classList.contains('visible')) {
              const rect = item.getBoundingClientRect();
              const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
              if (isInViewport) {
                needsReset = true;
              }
            }
          });
          
          if (needsReset) {
            console.log(`🔄 重新设置Observer（窗口焦点恢复）`);
            positionedItems.forEach(item => {
              if (!item.classList.contains('visible')) {
                observer.unobserve(item);
                observer.observe(item);
              }
            });
          }
        }
      }, 500);
    }
  });
});
</script>
