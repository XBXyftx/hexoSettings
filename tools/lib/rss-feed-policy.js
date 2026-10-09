'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const { parseDocument, DomUtils } = require('htmlparser2');
const { encodeURL, escapeHTML, full_url_for } = require('hexo-util');

const FEED_VERSION = '4.0.0';
const ATOM_NS = 'http://www.w3.org/2005/Atom';
const MAX_BYTES = 1024 * 1024;
const CLOCK_TOLERANCE = 5 * 60 * 1000;
const XML_OPTIONS = {
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true
};
const PRIVATE_ROUTES = new Set([
  'coffer', 'birthday-gift', 'swiper', 'lianliankan', 'markdownpreview',
  'about', 'link', 'comments', 'tags', 'categories', 'archives'
]);
const FLAGS = ['published', 'draft', 'feed', 'private', 'hidden', 'hide'];
const asArray = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
const compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const fail = message => { throw new Error(`[RSS] ${message}`); };
const ensure = (condition, message) => { if (!condition) fail(message); };
const text = value => typeof value === 'string' ? value : value?.['#text'] || '';

function cleanText(value) {
  return String(value ?? '').replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/\s+/gu, ' ').trim();
}

function summaryText(value, limit) {
  let result = typeof value === 'string' ? value : '';
  if (/<\/?[a-z][^>]*>/i.test(result)) {
    const visit = node => {
      if (['script', 'style', 'iframe', 'object', 'template'].includes(node.name)) return '';
      if (node.type === 'text') return node.data;
      return (node.children || []).map(visit).join(' ');
    };
    result = visit(parseDocument(result));
  }
  result = cleanText(result);
  const chars = Array.from(result);
  return chars.length > limit ? `${chars.slice(0, limit - 1).join('')}\u2026` : result;
}

function relativePath(value, label) {
  ensure(typeof value === 'string' && value.length > 0, `${label} 必须是非空相对路径`);
  const normalized = value.replace(/\\/g, '/');
  ensure(!normalized.startsWith('/') && !/[:?#%\u0000-\u001F]/u.test(normalized)
    && normalized.split('/').every(part => part !== '..' && part !== '.'),
  `${label} 路径不安全`);
  return normalized;
}

function siteURL(config) {
  let url;
  try { url = new URL(config.url); } catch { fail('站点 url 无效'); }
  ensure(['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
    && !url.search && !url.hash, '站点 url 必须是无凭据的 HTTP(S) 地址');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}

function validateConfig(config) {
  const policy = config.rss_subscription;
  ensure(policy && typeof policy.enable === 'boolean', 'rss_subscription.enable 必须为布尔值');
  ensure(config.feed?.enable === false, '必须关闭 feed.enable，由受控入口生成');
  if (!policy.enable) return false;
  const feed = config.feed;
  ensure(policy.public_source_prefix === '_posts/' && policy.exclude_future === true,
    '公开文章目录和未来文章排除策略不能关闭');
  ensure(JSON.stringify(feed.type) === '["atom","rss2"]', 'feed.type 必须按 atom、rss2 排列');
  ensure(Array.isArray(feed.path) && feed.path.length === 2, '必须配置两个订阅路径');
  feed.path.forEach(p => {
    ensure(relativePath(p, 'feed.path') === p && /^[a-z0-9][a-z0-9/-]*\.xml$/.test(p),
      '订阅路径必须为安全的小写 XML 路径');
  });
  ensure(new Set(feed.path).size === 2, '订阅路径不能重复');
  ensure(Number.isInteger(feed.limit) && feed.limit > 0 && feed.limit <= 100, 'feed.limit 必须在 1 到 100 之间');
  ensure(Number.isInteger(feed.content_limit) && feed.content_limit >= 20 && feed.content_limit <= 1000,
    '摘要长度必须在 20 到 1000 之间');
  ensure(feed.content === false && feed.autodiscovery === false && feed.order_by === '-date source',
    '必须使用摘要模式、主题注入和固定日期排序');
  ensure(!feed.template && !feed.hub, '本方案不使用模板或推送 hub');
  ensure(cleanText(config.title) && cleanText(config.author), '站点标题和作者不能为空');
  siteURL(config);
  return true;
}

function articleURL(value, config) {
  let url;
  try { url = new URL(value); } catch { fail('文章永久链接无效'); }
  const base = siteURL(config);
  ensure(url.origin === base.origin && !url.username && !url.password && !url.search && !url.hash
    && url.pathname.startsWith(base.pathname), '文章链接必须属于本站');
  let decoded;
  try { decoded = decodeURIComponent(url.pathname.slice(base.pathname.length)); } catch { fail('文章链接编码无效'); }
  ensure(decoded && !/[%\\\u0000-\u001F]/u.test(decoded)
    && decoded.split('/').every(part => part !== '.' && part !== '..'), '文章链接路径不安全');
  ensure(!PRIVATE_ROUTES.has(decoded.split('/')[0].toLowerCase()), '文章链接不能指向私密或自定义页面');
  return encodeURL(url.href);
}

function timestamp(value, label) {
  const ms = value?.valueOf();
  const parsed = typeof ms === 'number' ? ms : Date.parse(value);
  ensure(Number.isFinite(parsed), `${label} 无效`);
  return parsed;
}

function projectPosts(query, config, now = Date.now()) {
  const selected = [];
  let excluded = 0;
  let fallbacks = 0;
  for (const post of query.toArray()) {
    const source = relativePath(post.source, '文章 source');
    if (!source.startsWith('_posts/')) { excluded++; continue; }
    for (const flag of FLAGS) {
      ensure(post[flag] === undefined || typeof post[flag] === 'boolean', `${source} 的 ${flag} 必须为布尔值`);
    }
    if (post.published !== true || post.draft === true || post.feed === false
      || post.private === true || post.hidden === true || post.hide === true
      || (post.password !== undefined && post.password !== null && post.password !== '')) {
      excluded++;
      continue;
    }
    const published = timestamp(post.date, `${source} 发布日期`);
    if (published > now) { excluded++; continue; }
    const updated = Math.max(published, post.updated == null ? published : timestamp(post.updated, `${source} 更新时间`));
    ensure(updated <= now + CLOCK_TOLERANCE, `${source} 更新时间超前，请检查时钟`);
    const permalink = articleURL(post.permalink, config);
    ensure(permalink === articleURL(full_url_for.call({ config }, post.path), config),
      `${source} 的路径与永久链接不一致`);
    let description = summaryText(post.description, config.feed.content_limit);
    if (!description) { description = '\u9605\u8bfb\u5168\u6587'; fallbacks++; }
    const categories = asArray(post.categories?.toArray()).concat(asArray(post.tags?.toArray())).map(category => ({
      name: cleanText(category.name),
      permalink: encodeURL(category.permalink)
    }));
    ensure(categories.every(c => c.name && new URL(c.permalink).origin === siteURL(config).origin),
      `${source} 分类或标签无效`);
    // Warehouse insertion order varies across clean builds.
    categories.sort((a, b) => compareText(a.permalink, b.permalink) || compareText(a.name, b.name));
    ensure(typeof post.date.clone === 'function', '文章日期必须使用 Hexo Moment 类型');
    selected.push({
      source,
      title: cleanText(post.title),
      description,
      permalink,
      date: post.date.clone(),
      updated: post.date.clone().add(updated - published, 'milliseconds'),
      categories: { toArray: () => categories },
      tags: { toArray: () => [] }
    });
  }
  selected.sort((a, b) => b.date.valueOf() - a.date.valueOf() || compareText(a.source, b.source));
  const posts = selected.slice(0, config.feed.limit);
  ensure(posts.length > 0, '没有可收录的公开文章，停止生成');
  ensure(posts.every(p => p.title), '公开文章标题不能为空');
  ensure(new Set(posts.map(p => p.permalink)).size === posts.length, '文章永久链接重复');
  return { posts, excluded, fallbacks };
}

function parseXML(xml) {
  ensure(typeof xml === 'string' && Buffer.byteLength(xml) > 0 && Buffer.byteLength(xml) <= MAX_BYTES,
    '订阅文件为空或超过大小限制');
  ensure(!/<!DOCTYPE|<!ENTITY/i.test(xml), '订阅文件不能包含 DTD 或实体声明');
  const result = XMLValidator.validate(xml);
  ensure(result === true, `订阅 XML 语法无效：${result?.err?.msg || ''}`);
  return new XMLParser(XML_OPTIONS).parse(xml);
}

function serializeFeed(xml, type, posts, config) {
  const doc = parseXML(xml);
  const latest = new Date(Math.max(...posts.map(p => p.updated.valueOf())));
  if (type === 'atom') {
    doc.feed.updated = latest.toISOString();
    doc.feed['@_xml:lang'] = config.language;
    const entries = asArray(doc.feed.entry);
    ensure(entries.length === posts.length, 'Atom 序列化条目数不一致');
    entries.forEach((entry, i) => {
      entry.title = { '#text': posts[i].title, '@_type': 'text' };
      entry.summary = { '#text': posts[i].description, '@_type': 'text' };
    });
  } else {
    doc.rss.channel.lastBuildDate = latest.toUTCString();
    const items = asArray(doc.rss.channel.item);
    ensure(items.length === posts.length, 'RSS 序列化条目数不一致');
    items.forEach((item, i) => {
      // feed4 passes guid as a string, but Feedsmith 2 expects an object.
      item.guid = { '#text': posts[i].permalink, '@_isPermaLink': 'true' };
      item.title = posts[i].title;
      item.description = escapeHTML(posts[i].description);
      // RSS author requires an email; the site only publishes an author name.
      delete item.author;
    });
  }
  return new XMLBuilder({ ...XML_OPTIONS, format: true, suppressEmptyNode: true, suppressBooleanAttributes: false }).build(doc);
}

function parsedFeed(xml, type, config, now = Date.now()) {
  const doc = parseXML(xml);
  const base = siteURL(config).href;
  let entries, updated, self, title;
  if (type === 'atom') {
    const feed = doc.feed;
    ensure(feed && feed['@_xmlns'] === ATOM_NS, 'Atom 命名空间无效');
    ensure(feed.id === base && text(feed.author?.name) === cleanText(config.author), 'Atom 站点身份无效');
    ensure(feed['@_xml:lang'] === config.language, 'Atom 语言无效');
    self = asArray(feed.link).find(link => link['@_rel'] === 'self')?.['@_href'];
    title = text(feed.title);
    updated = timestamp(feed.updated, 'Atom 顶层更新时间');
    entries = asArray(feed.entry).map(entry => {
      ensure(entry.content === undefined && entry.summary?.['@_type'] === 'text', 'Atom 必须只包含纯文本摘要');
      const links = asArray(entry.link);
      ensure(links.length === 1 && !links[0]['@_rel'], 'Atom 条目链接异常');
      ensure(text(entry.author?.name) === cleanText(config.author), 'Atom 条目作者异常');
      return {
        id: entry.id, link: links[0]['@_href'], title: text(entry.title), summary: text(entry.summary),
        published: timestamp(entry.published, '文章发布日期'), updated: timestamp(entry.updated, '文章更新时间'),
        categories: asArray(entry.category).map(c => ({ name: c['@_term'], permalink: c['@_scheme'] }))
      };
    });
  } else {
    const channel = doc.rss?.channel;
    ensure(channel && doc.rss['@_version'] === '2.0' && doc.rss['@_xmlns:atom'] === ATOM_NS, 'RSS 结构无效');
    ensure(channel.link === base && cleanText(text(channel.description)), 'RSS 站点信息无效');
    ensure(channel.language === config.language, 'RSS 语言无效');
    self = asArray(channel['atom:link']).find(link => link['@_rel'] === 'self')?.['@_href'];
    title = text(channel.title);
    updated = timestamp(channel.lastBuildDate, 'RSS 顶层更新时间');
    entries = asArray(channel.item).map(item => {
      ensure(item['content:encoded'] === undefined && item.enclosure === undefined && item.author === undefined,
        'RSS 条目出现非预期全文或媒体字段');
      ensure(item.guid?.['@_isPermaLink'] === 'true', 'RSS GUID 缺失或类型错误');
      const description = parseDocument(text(item.description));
      ensure(!DomUtils.findOne(node => node.type !== 'text' && node.type !== 'root', description.children, true),
        'RSS 摘要不能含 HTML 元素');
      return {
        id: text(item.guid), link: item.link, title: text(item.title), summary: DomUtils.textContent(description),
        published: timestamp(item.pubDate, '文章发布日期'),
        categories: asArray(item.category).map(c => ({ name: text(c), permalink: c['@_domain'] }))
      };
    });
  }
  ensure(title === cleanText(config.title), '订阅标题与配置不一致');
  const i = config.feed.type.indexOf(type);
  ensure(self === new URL(config.feed.path[i], base).href, '订阅 self 链接不正确');
  ensure(entries.length > 0 && entries.length <= config.feed.limit, '订阅条数不正确');
  ensure(updated <= now + CLOCK_TOLERANCE, '订阅更新时间超前');
  entries.forEach((entry, index) => {
    ensure(entry.id === articleURL(entry.link, config), '条目 ID 与永久链接不一致');
    ensure(entry.title && entry.summary && Array.from(entry.summary).length <= config.feed.content_limit,
      '条目标题或摘要无效');
    ensure(entry.published <= now && (!index || entry.published <= entries[index - 1].published),
      '文章排序错误或包含未来文章');
    if (type === 'atom') ensure(entry.updated >= entry.published && entry.updated <= now + CLOCK_TOLERANCE,
      '文章更新时间无效');
  });
  ensure(new Set(entries.map(e => e.id)).size === entries.length, '订阅包含重复 ID');
  return { entries, updated };
}

function verifyPair(routes, config, expected, now = Date.now()) {
  ensure(routes.length === 2, '必须同时生成两种格式');
  const feeds = config.feed.type.map((type, index) => {
    ensure(routes[index].path === config.feed.path[index], '生成路由与配置不一致');
    return parsedFeed(routes[index].data, type, config, now);
  });
  const comparable = entry => ({
    id: entry.id, title: entry.title, summary: entry.summary,
    published: Math.floor(entry.published / 1000), categories: entry.categories
  });
  try {
    assert.deepEqual(feeds[0].entries.map(comparable), feeds[1].entries.map(comparable));
    if (expected) {
      assert.deepEqual(feeds[0].entries.map(comparable), expected.map(p => ({
        id: p.permalink, title: p.title, summary: p.description,
        published: Math.floor(p.date.valueOf() / 1000), categories: p.categories.toArray()
      })));
      assert.deepEqual(feeds[0].entries.map(e => e.updated), expected.map(p => p.updated.valueOf()));
    }
  } catch { fail('两种订阅内容不一致，或偏离公开文章快照'); }
  ensure(feeds[0].updated === Math.max(...feeds[0].entries.map(e => e.updated)), 'Atom 顶层更新时间不正确');
  ensure(Math.floor(feeds[0].updated / 1000) === Math.floor(feeds[1].updated / 1000), '两种订阅更新时间不一致');
  return feeds[0];
}

function generateFeeds(context, locals, now = Date.now()) {
  const { config } = context;
  if (!validateConfig(config)) return { routes: [], posts: [] };
  ensure(require('hexo-generator-feed/package.json').version === FEED_VERSION, '订阅插件版本必须为 4.0.0');
  const [major, minor] = process.versions.node.split('.').map(Number);
  ensure(major > 20 || (major === 20 && minor >= 19), '订阅生成需要 Node >=20.19.0');
  config.feed.path.forEach(p => ensure(!fs.existsSync(path.join(context.source_dir, p)), 'source 存在同名订阅文件'));
  const projection = projectPosts(locals.posts, config, now);
  const posts = new locals.posts.constructor(projection.posts);
  const generator = require('hexo-generator-feed/lib/generator');
  const feedConfig = { ...config, title: cleanText(config.title), author: cleanText(config.author),
    subtitle: cleanText(config.subtitle || config.description), feed: { ...config.feed } };
  const routes = config.feed.type.map((type, i) => {
    const result = generator.call({ config: feedConfig }, { ...locals, posts }, type, config.feed.path[i]);
    ensure(result && typeof result.data === 'string', '订阅插件没有生成有效数据');
    return { path: result.path, data: serializeFeed(result.data, type, projection.posts, config) };
  });
  verifyPair(routes, config, projection.posts, now);
  return { ...projection, routes };
}

function articleFile(url, config, publicDir) {
  const checked = articleURL(url, config);
  const relative = decodeURIComponent(new URL(checked).pathname.slice(siteURL(config).pathname.length));
  const target = path.resolve(publicDir, relative.endsWith('/') ? `${relative}index.html` : relative);
  ensure(target.startsWith(path.resolve(publicDir) + path.sep), '文章目标超出 public');
  return target;
}

function checkDiscovery(html, config) {
  const document = parseDocument(html);
  const head = DomUtils.findOne(node => node.name === 'head', document.children, true);
  ensure(head, '页面缺少 head');
  const links = DomUtils.findAll(node => node.name === 'link' && node.attribs.rel === 'alternate'
    && ['application/atom+xml', 'application/rss+xml'].includes(node.attribs.type), head.children);
  ensure(links.length === 2, '页面必须包含且仅包含两个订阅声明');
  config.feed.type.forEach((type, i) => {
    const mime = type === 'atom' ? 'application/atom+xml' : 'application/rss+xml';
    ensure(links.filter(link => link.attribs.type === mime
      && new URL(link.attribs.href, siteURL(config)).href === new URL(config.feed.path[i], siteURL(config)).href).length === 1,
    '页面订阅声明地址或类型不正确');
  });
}

module.exports = {
  validateConfig, projectPosts, generateFeeds, parseXML, parsedFeed, verifyPair,
  articleFile, checkDiscovery, summaryText, MAX_BYTES
};
