/**
 * 生日页面事件扫描器
 * 扫描 source/birthday-gift/events/ 下的所有子文件夹
 * 解析 index.md 的 front matter 和正文，识别媒体文件
 * 生成 birthday-gift/events-data.json 供页面使用
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 缓存上次扫描的哈希
let lastScanHash = '';
// 扫描结果缓存，供 generator 使用
let cachedEventsData = null;

// 支持的图片格式
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXTS = ['.mp4', '.webm'];

/**
 * 扫描事件文件夹并生成数据
 */
function scanEvents() {
  const eventsDir = path.join(hexo.source_dir, 'birthday-gift', 'events');

  // 检查目录是否存在
  if (!fs.existsSync(eventsDir)) {
    cachedEventsData = [];
    return cachedEventsData;
  }

  // 获取所有子文件夹（事件文件夹）
  const eventDirs = fs.readdirSync(eventsDir)
    .filter(name => {
      const fullPath = path.join(eventsDir, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort(); // 按文件夹名排序（01-, 02- ...）

  // 计算目录内容的哈希值，用于检测变化
  const currentHash = crypto.createHash('md5');
  eventDirs.forEach(dirName => {
    const dirPath = path.join(eventsDir, dirName);
    const files = fs.readdirSync(dirPath).sort();
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      currentHash.update(`${dirName}/${file}:${stats.mtime.getTime()}:${stats.size}`);
    });
  });

  const currentHashValue = currentHash.digest('hex');

  // 如果内容没有变化，返回缓存
  if (currentHashValue === lastScanHash && cachedEventsData !== null) {
    return cachedEventsData;
  }

  lastScanHash = currentHashValue;
  console.log('[Birthday Gift Scanner] 检测到事件变化，开始扫描...');

  const events = [];

  eventDirs.forEach((dirName, index) => {
    const dirPath = path.join(eventsDir, dirName);
    const mdPath = path.join(dirPath, 'index.md');

    if (!fs.existsSync(mdPath)) {
      console.warn(`[Birthday Gift Scanner] 跳过 ${dirName}: 缺少 index.md`);
      return;
    }

    try {
      const content = fs.readFileSync(mdPath, 'utf8');

      // 解析 front matter
      const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!frontMatterMatch) {
        console.warn(`[Birthday Gift Scanner] 跳过 ${dirName}: 无效的 front matter`);
        return;
      }

      const frontMatter = frontMatterMatch[1];
      const markdownContent = content.substring(frontMatterMatch[0].length).trim();

      // 解析 front matter 字段
      const titleMatch = frontMatter.match(/title:\s*(.+?)(?:\r?\n|$)/);
      const dateMatch = frontMatter.match(/date:\s*(.+?)(?:\r?\n|$)/);
      const periodMatch = frontMatter.match(/period:\s*(.+?)(?:\r?\n|$)/);
      const moodMatch = frontMatter.match(/mood:\s*(.+?)(?:\r?\n|$)/);
      const achievementMatch = frontMatter.match(/achievement:\s*["']?(.+?)["']?(?:\r?\n|$)/);
      const backgroundMatch = frontMatter.match(/background:\s*(.+?)(?:\r?\n|$)/);
      const glowColorMatch = frontMatter.match(/glowColor:\s*["']?(.+?)["']?(?:\r?\n|$)/);

      // 渲染 markdown 正文为 HTML
      let contentHtml = '';
      if (markdownContent) {
        try {
          const renderResult = hexo.render.renderSync({
            text: markdownContent,
            engine: 'markdown'
          });
          contentHtml = renderResult ? renderResult.toString() : '';
        } catch (err) {
          console.warn(`[Birthday Gift Scanner] Markdown 渲染失败 ${dirName}:`, err.message);
          contentHtml = `<p>${markdownContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
        }
      }

      // 扫描媒体文件
      const files = fs.readdirSync(dirPath);
      const thumbnails = [];
      const fullImages = [];
      const videos = [];

      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const filePath = `/birthday-gift/events/${dirName}/${file}`;

        if (file.startsWith('thumb-') && IMAGE_EXTS.includes(ext)) {
          thumbnails.push({
            src: filePath,
            filename: file,
            ext: ext
          });
        } else if (file.startsWith('photo-') && IMAGE_EXTS.includes(ext)) {
          fullImages.push({
            src: filePath,
            filename: file,
            ext: ext
          });
        } else if (file.startsWith('video-') && VIDEO_EXTS.includes(ext)) {
          videos.push({
            src: filePath,
            filename: file,
            ext: ext
          });
        }
      });

      // 按文件名排序
      thumbnails.sort((a, b) => a.filename.localeCompare(b.filename));
      fullImages.sort((a, b) => a.filename.localeCompare(b.filename));
      videos.sort((a, b) => a.filename.localeCompare(b.filename));

      // 构建媒体列表（缩略图对应的原图）
      const mediaList = [];
      thumbnails.forEach(thumb => {
        const thumbIndex = thumb.filename.replace('thumb-', '').replace(thumb.ext, '');
        const photoName = `photo-${thumbIndex}${thumb.ext}`;
        const fullSrc = fullImages.find(p => p.filename === photoName);

        mediaList.push({
          thumb: thumb.src,
          full: fullSrc ? fullSrc.src : thumb.src,
          type: 'image'
        });
      });

      // 添加视频
      videos.forEach(video => {
        const videoIndex = video.filename.replace('video-', '').replace(video.ext, '');
        const thumbName = `thumb-video-${videoIndex}.jpg`;
        const thumbFile = thumbnails.find(t => t.filename === thumbName);

        mediaList.push({
          thumb: thumbFile ? thumbFile.src : '',
          full: video.src,
          type: 'video'
        });
      });

      const eventData = {
        id: dirName,
        order: index + 1,
        title: titleMatch ? titleMatch[1].trim().replace(/['"]/g, '') : dirName,
        date: dateMatch ? dateMatch[1].trim().replace(/['"]/g, '') : '',
        period: periodMatch ? periodMatch[1].trim().replace(/['"]/g, '') : '',
        mood: moodMatch ? moodMatch[1].trim().replace(/['"]/g, '') : '',
        achievement: achievementMatch ? achievementMatch[1].trim().replace(/['"]/g, '') : '',
        background: backgroundMatch ? backgroundMatch[1].trim().replace(/['"]/g, '') : '',
        glowColor: glowColorMatch ? glowColorMatch[1].trim().replace(/['"]/g, '') : '255, 255, 255',
        contentHtml: contentHtml,
        media: mediaList,
        hasMedia: mediaList.length > 0,
        mediaCount: mediaList.length
      };

      events.push(eventData);
      console.log(`[Birthday Gift Scanner] 已处理: ${eventData.title} (${mediaList.length} 个媒体)`);

    } catch (error) {
      console.error(`[Birthday Gift Scanner] 处理失败 ${dirName}:`, error.message);
    }
  });

  cachedEventsData = events;
  console.log(`[Birthday Gift Scanner] 完成: 共 ${events.length} 个事件`);

  // 同时写入 source 目录供开发参考
  const sourceOutputPath = path.join(hexo.source_dir, 'birthday-gift', 'events-data.json');
  fs.writeFileSync(sourceOutputPath, JSON.stringify(events, null, 2), 'utf8');

  return events;
}

// before_generate filter：在生成前扫描
hexo.extend.filter.register('before_generate', function() {
  scanEvents();
}, 100);

// generator：将 JSON 输出到 public 目录
hexo.extend.generator.register('birthday-gift-data', function(locals) {
  const events = cachedEventsData !== null ? cachedEventsData : scanEvents();

  return {
    path: 'birthday-gift/events-data.json',
    data: JSON.stringify(events, null, 2)
  };
});

console.log('[Hexo Plugin] Birthday gift scanner loaded');
