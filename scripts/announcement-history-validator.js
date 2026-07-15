'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { imageSize } = require('image-size');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const TEXT_FIELDS = ['lead', 'title', 'closing'];
const ENTRY_FIELDS = new Set([
  'id',
  'published_at',
  'source_commit',
  'lead',
  'title',
  'items',
  'paragraphs',
  'closing',
  'image',
  'archived_image_url'
]);
const IMAGE_FIELDS = new Set(['src', 'alt', 'width', 'height']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasBody(entry) {
  return TEXT_FIELDS.some(field => isNonEmptyString(entry[field]))
    || (Array.isArray(entry.items) && entry.items.length > 0)
    || (Array.isArray(entry.paragraphs) && entry.paragraphs.length > 0)
    || (entry.image && isNonEmptyString(entry.image.src));
}

function validateTextArray(entry, field, errors, label) {
  if (entry[field] === undefined) return;
  if (!Array.isArray(entry[field]) || entry[field].some(item => !isNonEmptyString(item))) {
    errors.push(`${label}.${field} 必须是非空字符串数组`);
  }
}

function validateAllowedFields(value, allowedFields, errors, label) {
  Object.keys(value).forEach(field => {
    if (!allowedFields.has(field)) errors.push(`${label} 包含未知字段：${field}`);
  });
}

function validateLocalImage(entry, errors, label) {
  if (entry.image === undefined) return;
  if (!entry.image || typeof entry.image !== 'object' || Array.isArray(entry.image)) {
    errors.push(`${label}.image 必须是对象`);
    return;
  }

  validateAllowedFields(entry.image, IMAGE_FIELDS, errors, `${label}.image`);
  const { src, alt, width, height } = entry.image;
  if (!isNonEmptyString(src)) errors.push(`${label}.image.src 不能为空`);
  if (typeof alt !== 'string') errors.push(`${label}.image.alt 必须填写；装饰图可使用空字符串`);
  if (!Number.isInteger(width) || width <= 0) errors.push(`${label}.image.width 必须是正整数`);
  if (!Number.isInteger(height) || height <= 0) errors.push(`${label}.image.height 必须是正整数`);

  if (!isNonEmptyString(src)) return;
  if (!src.startsWith('/') || src.startsWith('//') || src.includes('\\')) {
    errors.push(`${label}.image.src 必须是站点内根路径，不能使用外部 URL：${src}`);
    return;
  }

  const sourceRoot = path.resolve(hexo.source_dir);
  const filePath = path.resolve(sourceRoot, src.replace(/^\/+/, ''));
  if (filePath !== sourceRoot && !filePath.startsWith(`${sourceRoot}${path.sep}`)) {
    errors.push(`${label}.image.src 不能越过 source 目录：${src}`);
    return;
  }
  if (!fs.existsSync(filePath)) {
    errors.push(`${label}.image.src 指向不存在的本地文件：${src}`);
    return;
  }

  try {
    const dimensions = imageSize(fs.readFileSync(filePath));
    if (dimensions.width !== width || dimensions.height !== height) {
      errors.push(`${label}.image 尺寸与文件不符：配置 ${width}x${height}，实际 ${dimensions.width}x${dimensions.height}`);
    }
  } catch (error) {
    errors.push(`${label}.image 无法读取尺寸：${src}（${error.message}）`);
  }
}

hexo.extend.helper.register('announcement_date', (value, format) => {
  return moment.parseZone(value).format(format);
});

hexo.extend.filter.register('before_generate', () => {
  const announcementConfig = hexo.theme.config.aside.card_announcement;
  const historyConfig = announcementConfig.history;
  const errors = [];

  if (!historyConfig || typeof historyConfig !== 'object' || Array.isArray(historyConfig)) {
    errors.push('aside.card_announcement.history 必须是对象');
  } else {
    if (!Number.isInteger(historyConfig.initial_visible) || historyConfig.initial_visible <= 0) {
      errors.push('aside.card_announcement.history.initial_visible 必须是正整数');
    }
    if (!isNonEmptyString(historyConfig.date_format)) {
      errors.push('aside.card_announcement.history.date_format 必须是非空字符串');
    }
  }

  const announcements = hexo.locals.get('data').announcements;
  if (announcements === undefined) {
    if (errors.length > 0) {
      throw new Error(`[Announcement History] 配置校验失败：\n- ${errors.join('\n- ')}`);
    }
    hexo.log.warn('[Announcement History] source/_data/announcements.yml 不存在，将使用旧 content 兜底');
    return;
  }

  if (!Array.isArray(announcements)) {
    errors.push('顶层必须是公告数组');
  } else if (announcements.length === 0) {
    errors.push('至少需要保留一条公告；如需关闭公告卡，请设置 aside.card_announcement.enable: false');
  } else {
    const ids = new Set();
    let previousTimestamp = Infinity;

    announcements.forEach((entry, index) => {
      const label = `第 ${index + 1} 条公告`;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(`${label} 必须是对象`);
        return;
      }

      validateAllowedFields(entry, ENTRY_FIELDS, errors, label);

      if (!isNonEmptyString(entry.id) || !ID_PATTERN.test(entry.id)) {
        errors.push(`${label}.id 必须是小写字母、数字和连字符组成的非空标识`);
      } else if (ids.has(entry.id)) {
        errors.push(`${label}.id 重复：${entry.id}`);
      } else {
        ids.add(entry.id);
      }

      if (!isNonEmptyString(entry.published_at) || !DATE_PATTERN.test(entry.published_at)) {
        errors.push(`${label}.published_at 必须是带时区的完整 ISO 8601 时间`);
      } else {
        const parsedDate = moment.parseZone(entry.published_at, moment.ISO_8601, true);
        if (!parsedDate.isValid()) {
          errors.push(`${label}.published_at 不是有效日期：${entry.published_at}`);
        } else {
          const timestamp = parsedDate.valueOf();
          if (timestamp >= previousTimestamp) {
            errors.push(`${label}.published_at 必须早于上一条，文件需按发布时间严格倒序排列`);
          } else {
            previousTimestamp = timestamp;
          }
        }
      }

      if (entry.source_commit !== undefined && !isNonEmptyString(entry.source_commit)) {
        errors.push(`${label}.source_commit 如存在则必须是非空字符串`);
      }
      if (entry.archived_image_url !== undefined && !isNonEmptyString(entry.archived_image_url)) {
        errors.push(`${label}.archived_image_url 如存在则必须是非空字符串`);
      }
      TEXT_FIELDS.forEach(field => {
        if (entry[field] !== undefined && !isNonEmptyString(entry[field])) {
          errors.push(`${label}.${field} 如存在则必须是非空字符串`);
        }
      });
      validateTextArray(entry, 'items', errors, label);
      validateTextArray(entry, 'paragraphs', errors, label);
      validateLocalImage(entry, errors, label);

      if (!hasBody(entry)) errors.push(`${label} 没有可显示的正文`);
    });
  }

  if (errors.length > 0) {
    throw new Error(`[Announcement History] 配置校验失败：\n- ${errors.join('\n- ')}`);
  }

  hexo.log.info(`[Announcement History] 已校验 ${announcements.length} 期公告`);
});
