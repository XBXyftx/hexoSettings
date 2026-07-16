const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

const SUPPORTED_FORMATS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);

const shortHash = value => crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);

// Hexo plugin: generate the versioned manifest used by the Yesterday Gallery.
hexo.extend.generator.register('auto-image-list', function () {
  const imagesDir = path.join(this.source_dir, 'swiper', 'images');

  if (!fs.existsSync(imagesDir)) {
    console.log('[Auto Image List] images directory is missing; generating an empty manifest');
    return {
      path: 'swiper/images-auto.json',
      data: JSON.stringify({ schemaVersion: 2, catalogRevision: shortHash('[]'), images: [] }, null, 2)
    };
  }

  const files = fs.readdirSync(imagesDir)
    .filter(file => SUPPORTED_FORMATS.has(path.extname(file).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));

  const images = files.map(file => {
    const absolutePath = path.join(imagesDir, file);
    const buffer = fs.readFileSync(absolutePath);
    const dimensions = imageSize(buffer);

    if (!dimensions.width || !dimensions.height) {
      throw new Error(`[Auto Image List] Unable to read image dimensions: ${absolutePath}`);
    }

    return {
      id: file,
      file,
      width: dimensions.width,
      height: dimensions.height,
      bytes: buffer.length,
      revision: shortHash(buffer)
    };
  });

  const catalogRevision = shortHash(JSON.stringify(images));
  const totalBytes = images.reduce((sum, image) => sum + image.bytes, 0);
  console.log(`[Auto Image List] Generated ${images.length} images (${(totalBytes / 1024 / 1024).toFixed(1)} MB), revision ${catalogRevision}`);

  return {
    path: 'swiper/images-auto.json',
    data: JSON.stringify({ schemaVersion: 2, catalogRevision, images }, null, 2)
  };
});
