/**
 * Butterfly
 * 自定义图片加载控制
 * 阻止文章内图片自动加载，但保留topimg、头像等非文章图片的正常加载
 */

'use strict'

const urlFor = require('hexo-util').url_for.bind(hexo)

// 自定义图片占位符处理
const customImageProcessor = htmlContent => {
  // 使用透明像素作为占位符
  const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  // 替换所有文章内容中的图片，将src移到data-original-src
  return htmlContent.replace(/(<img[^>]*?\s+src\s*=\s*)(["'])(.*?)\2([^>]*?>)/ig, (match, beforeSrc, quote, srcValue, afterSrc) => {
    // 添加自定义类名和数据属性，用于后续JavaScript处理
    const processedImg = `${beforeSrc}${quote}${placeholder}${quote} data-original-src=${quote}${srcValue}${quote} class="post-img-deferred"${afterSrc}`
    return processedImg
  })
}

// 只对文章内容进行图片延迟加载处理
hexo.extend.filter.register('after_post_render', data => {
  // 强制处理所有文章内容，不依赖lazyload配置
  data.content = customImageProcessor(data.content)
  return data
})
