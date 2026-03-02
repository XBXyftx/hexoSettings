/**
 * Hexo 插件：获取图片尺寸并添加到 HTML
 * 解决懒加载导致的布局偏移问题
 */

'use strict';

const fs = require('fs');
const path = require('path');

// 尝试导入 image-size
let sizeOf;
try {
  const imageSize = require('image-size');
  sizeOf = imageSize.default || imageSize;
  if (typeof sizeOf !== 'function') {
    sizeOf = imageSize.imageSize || imageSize;
  }
} catch (err) {
  console.error('[Image Dimensions] Failed to load image-size:', err.message);
  sizeOf = null;
}

// 基础路径
const BASE_DIR = hexo.base_dir;
const SOURCE_DIR = path.join(BASE_DIR, 'source');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const THEME_SOURCE_DIR = path.join(BASE_DIR, 'themes', 'butterfly', 'source');

// 缓存
const dimensionsCache = new Map();

// 需要排除的 class（这些区域的图片不添加尺寸和懒加载）
const EXCLUDE_CLASSES = [
  'site-icon',      // Logo，CSS 固定尺寸
  'announcementImg', // 公告栏 GIF
  'post-bg',        // 文章背景图
  'cover',          // 封面图
  'friend-avatar'   // 友链头像
];

// 需要排除的 alt 文本
const EXCLUDE_ALTS = ['avatar'];

// 需要排除的图片路径模式
const EXCLUDE_PATH_PATTERNS = [
  /\/img\/logo\.png$/,
  /\/img\/favicon/,
  /\/imgs\/gifs\//
];

function resolveImagePath(src) {
  if (!src || src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) {
    return null;
  }

  const srcPath = src.startsWith('/') ? src.substring(1) : src;
  
  let imgPath = path.join(SOURCE_DIR, srcPath);
  if (fs.existsSync(imgPath)) return imgPath;
  
  imgPath = path.join(PUBLIC_DIR, srcPath);
  if (fs.existsSync(imgPath)) return imgPath;
  
  imgPath = path.join(THEME_SOURCE_DIR, srcPath);
  if (fs.existsSync(imgPath)) return imgPath;

  const dateMatch = srcPath.match(/^(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/(.+)$/);
  if (dateMatch) {
    const [, year, month, day, slugEncoded, imgName] = dateMatch;
    const slug = decodeURIComponent(slugEncoded);
    
    const postDir = path.join(SOURCE_DIR, '_posts', slug);
    if (fs.existsSync(postDir)) {
      imgPath = path.join(postDir, imgName);
      if (fs.existsSync(imgPath)) return imgPath;
    }
  }

  return null;
}

function getImageDimensions(src) {
  if (!sizeOf) return null;
  if (dimensionsCache.has(src)) return dimensionsCache.get(src);

  const imgPath = resolveImagePath(src);
  if (!imgPath) return null;

  try {
    const buffer = fs.readFileSync(imgPath);
    const dimensions = sizeOf(buffer);
    if (dimensions && dimensions.width && dimensions.height) {
      const result = { width: dimensions.width, height: dimensions.height };
      dimensionsCache.set(src, result);
      return result;
    }
  } catch (err) {
    // 忽略错误
  }
  return null;
}

function shouldExclude(attrs, src) {
  const classMatch = attrs.match(/class=["']([^"']*)["']/i);
  if (classMatch) {
    const classNames = classMatch[1];
    for (const excludeClass of EXCLUDE_CLASSES) {
      if (classNames.includes(excludeClass)) {
        return true;
      }
    }
  }
  
  const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
  if (altMatch) {
    const alt = altMatch[1];
    for (const excludeAlt of EXCLUDE_ALTS) {
      if (alt === excludeAlt) {
        return true;
      }
    }
  }
  
  for (const pattern of EXCLUDE_PATH_PATTERNS) {
    if (pattern.test(src)) {
      return true;
    }
  }
  
  return false;
}

function processImages(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string' || !htmlContent.includes('<img')) {
    return htmlContent;
  }

  const imgRegex = /<img([^>]*)>/gi;
  let modifiedCount = 0;
  let matchCount = 0;
  let lazyCount = 0;
  let skipCount = 0;

  const result = htmlContent.replace(imgRegex, (match, attrs) => {
    matchCount++;
    
    const hasWidth = /\swidth=/i.test(attrs);
    const hasHeight = /\sheight=/i.test(attrs);
    const hasLoading = /\sloading=/i.test(attrs);

    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return match;
    
    const src = srcMatch[1];
    let newAttrs = attrs;

    const isExcluded = shouldExclude(attrs, src);
    if (isExcluded) {
      skipCount++;
    }

    if ((!hasWidth || !hasHeight) && sizeOf && !isExcluded) {
      const dimensions = getImageDimensions(src);
      if (dimensions) {
        if (!hasWidth) newAttrs += ` width="${dimensions.width}"`;
        if (!hasHeight) newAttrs += ` height="${dimensions.height}"`;
        modifiedCount++;
      }
    }

    if (!hasLoading && !isExcluded) {
      newAttrs += ' loading="lazy"';
      lazyCount++;
    }

    return `<img${newAttrs}>`;
  });

  if (matchCount > 0) {
    console.log(`[Image Dimensions] 匹配 ${matchCount} 张，添加尺寸 ${modifiedCount} 张，懒加载 ${lazyCount} 张，跳过 ${skipCount} 张`);
  }

  return result;
}

hexo.extend.filter.register('after_render:html', function(str) {
  if (typeof str === 'string') {
    return processImages(str);
  }
  return str;
}, 100);

console.log('[Hexo Plugin] Image dimensions plugin loaded');
