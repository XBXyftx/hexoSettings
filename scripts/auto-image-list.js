const fs = require('fs');
const path = require('path');

// Hexo插件：自动生成图片列表
hexo.extend.generator.register('auto-image-list', function(locals) {
  const sourceDir = this.source_dir;
  const imagesDir = path.join(sourceDir, 'swiper', 'images');
  
  // 支持的图片格式
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  
  let imageList = [];
  
  try {
    // 检查images文件夹是否存在
    if (fs.existsSync(imagesDir)) {
      // 读取文件夹中的所有文件
      const files = fs.readdirSync(imagesDir);
      
      // 过滤出图片文件
      imageList = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return supportedFormats.includes(ext);
      }).sort(); // 按文件名排序
      
      console.log(`[Auto Image List] 找到 ${imageList.length} 张图片:`, imageList);
    } else {
      console.log('[Auto Image List] images文件夹不存在，创建空列表');
    }
  } catch (error) {
    console.error('[Auto Image List] 读取图片文件夹时出错:', error);
  }
  
  // 生成images.json文件
  return {
    path: 'swiper/images-auto.json',
    data: JSON.stringify(imageList, null, 2)
  };
}); 