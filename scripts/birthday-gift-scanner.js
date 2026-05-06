/**
 * 生日页面事件扫描器
 * 扫描 source/birthday-gift/events/ 下的事件文件夹，生成前端使用的 JSON 数据。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let frontMatterParser = null;
try {
  frontMatterParser = require('hexo-front-matter');
} catch (error) {
  frontMatterParser = null;
}

let lastScanHash = '';
let cachedEventsData = null;

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXTS = ['.mp4', '.webm'];
const FALLBACK_BACKGROUNDS = [
  '/birthday-gift/imgs/bg-childhood.webp',
  '/birthday-gift/imgs/bg-teenager.webp',
  '/birthday-gift/imgs/bg-now.webp'
];
const FALLBACK_GLOW_COLORS = [
  '255, 206, 139',
  '124, 178, 255',
  '116, 232, 174'
];

function scanEvents() {
  const eventsDir = path.join(hexo.source_dir, 'birthday-gift', 'events');

  if (!fs.existsSync(eventsDir)) {
    cachedEventsData = [];
    return cachedEventsData;
  }

  const eventDirs = fs.readdirSync(eventsDir)
    .filter(name => {
      const fullPath = path.join(eventsDir, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  const currentHash = createEventsHash(eventsDir, eventDirs);
  if (currentHash === lastScanHash && cachedEventsData !== null) {
    return cachedEventsData;
  }

  lastScanHash = currentHash;
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
      const parsed = parseEventMarkdown(mdPath);
      const media = scanMedia(dirPath, dirName);
      const background = resolveBackground(parsed.frontMatter.background, index);
      const glowColor = normalizeGlowColor(parsed.frontMatter.glowColor, index);

      const eventData = {
        id: dirName,
        order: events.length + 1,
        title: normalizeText(parsed.frontMatter.title) || dirName,
        date: normalizeText(parsed.frontMatter.date),
        period: normalizeText(parsed.frontMatter.period),
        mood: normalizeText(parsed.frontMatter.mood),
        achievement: normalizeText(parsed.frontMatter.achievement),
        background,
        glowColor,
        contentHtml: renderMarkdown(parsed.body, dirName),
        media,
        hasMedia: media.length > 0,
        mediaCount: media.length
      };

      events.push(eventData);
      console.log(`[Birthday Gift Scanner] 已处理: ${eventData.title} (${media.length} 个媒体)`);
    } catch (error) {
      console.error(`[Birthday Gift Scanner] 处理失败 ${dirName}:`, error.message);
    }
  });

  cachedEventsData = events;
  console.log(`[Birthday Gift Scanner] 完成: 共 ${events.length} 个事件`);
  writeSourceData(events);
  return events;
}

function createEventsHash(eventsDir, eventDirs) {
  const hash = crypto.createHash('md5');

  eventDirs.forEach(dirName => {
    const dirPath = path.join(eventsDir, dirName);
    const files = fs.readdirSync(dirPath).sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) return;
      hash.update(`${dirName}/${file}:${stats.mtimeMs}:${stats.size}`);
    });
  });

  return hash.digest('hex');
}

function parseEventMarkdown(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  const parsed = frontMatterParser ? frontMatterParser.parse(raw) : fallbackParseFrontMatter(raw);

  return {
    frontMatter: parsed || {},
    body: parsed && typeof parsed._content === 'string' ? parsed._content.trim() : ''
  };
}

function fallbackParseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { _content: raw };

  const frontMatter = {};
  match[1].split(/\r?\n/).forEach(line => {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) return;
    frontMatter[field[1]] = stripQuotes(field[2]);
  });
  frontMatter._content = raw.slice(match[0].length);
  return frontMatter;
}

function renderMarkdown(markdown, dirName) {
  if (!markdown) return '<p>这段时光还在整理中。</p>';

  try {
    const rendered = hexo.render.renderSync({
      text: markdown,
      engine: 'markdown'
    });
    return rendered ? rendered.toString() : '';
  } catch (error) {
    console.warn(`[Birthday Gift Scanner] Markdown 渲染失败 ${dirName}: ${error.message}`);
    return markdown
      .split(/\n{2,}/)
      .map(paragraph => `<p>${escapeHtml(paragraph.trim())}</p>`)
      .join('\n');
  }
}

function scanMedia(dirPath, dirName) {
  const files = fs.readdirSync(dirPath)
    .filter(file => fs.statSync(path.join(dirPath, file)).isFile())
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  const thumbs = new Map();
  const photos = new Map();
  const videoThumbs = new Map();
  const videos = new Map();
  const plainImages = [];

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const basename = path.basename(file, ext);
    const publicPath = `/birthday-gift/events/${dirName}/${file}`;

    let match = basename.match(/^thumb-video-(.+)$/);
    if (match && IMAGE_EXTS.includes(ext)) {
      videoThumbs.set(match[1], { src: publicPath, filename: file, ext });
      return;
    }

    match = basename.match(/^thumb-(.+)$/);
    if (match && IMAGE_EXTS.includes(ext)) {
      thumbs.set(match[1], { src: publicPath, filename: file, ext });
      return;
    }

    match = basename.match(/^photo-(.+)$/);
    if (match && IMAGE_EXTS.includes(ext)) {
      photos.set(match[1], { src: publicPath, filename: file, ext });
      return;
    }

    match = basename.match(/^video-(.+)$/);
    if (match && VIDEO_EXTS.includes(ext)) {
      videos.set(match[1], { src: publicPath, filename: file, ext });
      return;
    }

    if (IMAGE_EXTS.includes(ext) && !isReservedImageFile(basename)) {
      plainImages.push({ src: publicPath, filename: file, ext });
    }
  });

  const media = [];

  Array.from(thumbs.keys()).sort(naturalSort).forEach(key => {
    const thumb = thumbs.get(key);
    const photo = findPhotoForKey(photos, key);
    media.push({
      type: 'image',
      thumb: thumb.src,
      full: photo ? photo.src : thumb.src
    });
  });

  Array.from(photos.keys()).sort(naturalSort).forEach(key => {
    if (thumbs.has(key)) return;
    const photo = photos.get(key);
    media.push({
      type: 'image',
      thumb: photo.src,
      full: photo.src
    });
  });

  plainImages.sort((a, b) => naturalSort(a.filename, b.filename)).forEach(image => {
    media.push({
      type: 'image',
      thumb: image.src,
      full: image.src
    });
  });

  Array.from(videos.keys()).sort(naturalSort).forEach(key => {
    const video = videos.get(key);
    const poster = videoThumbs.get(key) || thumbs.get(`video-${key}`) || null;
    media.push({
      type: 'video',
      thumb: poster ? poster.src : '',
      poster: poster ? poster.src : '',
      full: video.src
    });
  });

  return media;
}

function isReservedImageFile(basename) {
  return /^(bg|background|cover|poster)$/i.test(basename);
}

function findPhotoForKey(photos, key) {
  if (photos.has(key)) return photos.get(key);

  const normalizedKey = String(key).replace(/^0+/, '') || '0';
  for (const [photoKey, photo] of photos.entries()) {
    const normalizedPhotoKey = String(photoKey).replace(/^0+/, '') || '0';
    if (normalizedPhotoKey === normalizedKey) return photo;
  }

  return null;
}

function resolveBackground(value, index) {
  const clean = normalizeText(value);
  if (clean && sourceAssetExists(clean)) return clean;

  if (clean) {
    console.warn(`[Birthday Gift Scanner] 背景不存在，使用回退图: ${clean}`);
  }

  return FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length];
}

function sourceAssetExists(publicPath) {
  if (!publicPath || /^https?:\/\//i.test(publicPath)) return true;
  const cleanPath = publicPath.replace(/^\/+/, '').replace(/\?.*$/, '');
  const sourcePath = path.join(hexo.source_dir, cleanPath);
  return fs.existsSync(sourcePath);
}

function normalizeGlowColor(value, index) {
  const fallback = FALLBACK_GLOW_COLORS[index % FALLBACK_GLOW_COLORS.length];
  const match = String(value || '').match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
  if (!match) return fallback;

  return [match[1], match[2], match[3]]
    .map(part => Math.max(0, Math.min(255, Number(part) || 0)))
    .join(', ');
}

function writeSourceData(events) {
  const outputPath = path.join(hexo.source_dir, 'birthday-gift', 'events-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf8');
}

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return stripQuotes(String(value).trim());
}

function stripQuotes(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function naturalSort(a, b) {
  return String(a).localeCompare(String(b), 'zh-CN', { numeric: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

hexo.extend.filter.register('before_generate', function() {
  scanEvents();
}, 100);

hexo.extend.generator.register('birthday-gift-data', function() {
  const events = cachedEventsData !== null ? cachedEventsData : scanEvents();

  return {
    path: 'birthday-gift/events-data.json',
    data: JSON.stringify(events, null, 2)
  };
});

console.log('[Hexo Plugin] Birthday gift scanner loaded');
