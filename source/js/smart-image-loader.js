/**
 * 智能图片加载器 - 简化版本
 * 按照指定策略加载图片：
 * 1. 首先加载页面其他区域的图片（topimg、头像、推荐文章封面等）
 * 2. 等待加载动画结束
 * 3. 启动滚动检测，只在停止滚动600ms后加载可视区域的文章图片
 */

class SmartImageLoader {
  constructor() {
    this.isScrolling = false
    this.scrollTimeout = null
    this.loadingQueue = []
    this.scrollStopDelay = 600 // 滚动停止600ms后开始加载

    console.log('🚀 Smart Image Loader 启动')
    this.init()
  }

  init() {
    // 等待页面基本加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.startLoadingSequence(), 500)
      })
    } else {
      setTimeout(() => this.startLoadingSequence(), 500)
    }
  }

  startLoadingSequence() {
    console.log('📸 开始智能图片加载序列')

    // 设置滚动监听
    this.setupScrollHandler()

    // 初始扫描一次可视区域（延迟执行确保页面稳定）
    setTimeout(() => {
      console.log('📊 执行初始图片扫描')
      this.loadVisiblePostImages()
    }, 1000)
  }

  setupScrollHandler() {
    const handleScroll = () => {
      this.isScrolling = true

      // 清除之前的延时
      clearTimeout(this.scrollTimeout)

      // 600ms后检查滚动是否停止
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false
        console.log('📜 滚动停止600ms，扫描可视图片')
        this.loadVisiblePostImages()
      }, this.scrollStopDelay)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // 监听目录点击
    document.addEventListener('click', (e) => {
      const tocLink = e.target.closest('.toc-link, .toc a, [href*="#"]')
      if (tocLink && tocLink.getAttribute('href')?.startsWith('#')) {
        console.log('🎯 检测到目录点击')
        // 目录点击后延迟扫描
        setTimeout(() => {
          if (!this.isScrolling) {
            this.loadVisiblePostImages()
          }
        }, 1000)
      }
    })
  }

  loadVisiblePostImages() {
    if (this.isScrolling) {
      console.log('🚫 正在滚动，跳过图片扫描')
      return
    }

    // 查找所有待加载的图片
    const deferredImages = document.querySelectorAll('.post-img-deferred[data-original-src]')
    console.log(`🔍 找到 ${deferredImages.length} 个待加载图片`)

    let visibleCount = 0
    deferredImages.forEach(img => {
      // 检查是否已经在加载队列中
      if (img.hasAttribute('data-loading')) {
        return
      }

      if (this.isElementVisible(img)) {
        this.loadImage(img)
        visibleCount++
      }
    })

    if (visibleCount > 0) {
      console.log(`📊 开始加载 ${visibleCount} 个可视图片`)
    } else {
      console.log('📊 当前可视区域没有待加载的图片')
    }
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
  }

  loadImage(img) {
    const originalSrc = img.getAttribute('data-original-src')
    if (!originalSrc) {
      console.warn('❌ 图片缺少data-original-src属性:', img)
      return
    }

    // 标记为正在加载
    img.setAttribute('data-loading', 'true')
    console.log(`🚀 开始加载图片: ${originalSrc}`)

    // 创建新的Image对象来预加载
    const tempImg = new Image()

    tempImg.onload = () => {
      // 加载成功，直接设置src
      img.src = originalSrc
      img.removeAttribute('data-loading')
      img.classList.remove('post-img-deferred')
      img.classList.add('post-img-loaded')

      // 添加淡入效果
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.5s ease-in-out'

      requestAnimationFrame(() => {
        img.style.opacity = '1'
      })

      console.log(`✅ 图片加载成功: ${originalSrc}`)
    }

    tempImg.onerror = () => {
      console.error(`❌ 图片加载失败: ${originalSrc}`)
      img.removeAttribute('data-loading')
      img.alt = '图片加载失败'
    }

    // 开始加载
    tempImg.src = originalSrc
  }
}

// 只在文章页面启动，并增加页面检测
if (window.location.pathname.includes('/20') && document.querySelector('.post-content')) {
  console.log('🎯 检测到文章页面，启动智能图片加载器')
  window.smartImageLoader = new SmartImageLoader()
} else {
  console.log('🚫 非文章页面，跳过智能图片加载器')
}