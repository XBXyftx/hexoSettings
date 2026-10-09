'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { validateConfig, verifyPair, articleFile, checkDiscovery, MAX_BYTES } = require('./lib/rss-feed-policy');

function checkFeed(baseDir = path.resolve(__dirname, '..')) {
  const config = yaml.load(fs.readFileSync(path.join(baseDir, '_config.yml'), 'utf8'));
  if (!validateConfig(config)) return { disabled: true };
  const publicDir = path.resolve(baseDir, config.public_dir || 'public');
  const routes = config.feed.path.map(feedPath => {
    const filename = path.join(publicDir, feedPath);
    if (fs.statSync(filename).size > MAX_BYTES) throw new Error('[RSS] 订阅文件超过大小限制');
    return { path: feedPath, data: fs.readFileSync(filename, 'utf8') };
  });
  const feed = verifyPair(routes, config);
  const articleFiles = feed.entries.map(entry => articleFile(entry.link, config, publicDir));
  for (const file of articleFiles) {
    if (!fs.statSync(file).isFile()) throw new Error('[RSS] 文章目标文件不存在');
  }
  const pages = [path.join(publicDir, 'index.html'),
    path.join(publicDir, config.archive_dir || 'archives', 'index.html'), ...articleFiles];
  for (const page of pages) checkDiscovery(fs.readFileSync(page, 'utf8'), config);
  return { count: feed.entries.length, pages: pages.length, bytes: routes.map(route => Buffer.byteLength(route.data)) };
}

if (require.main === module) {
  try {
    const result = checkFeed();
    console.log(result.disabled ? '[RSS] 订阅已关闭' : `[RSS] 校验通过：双格式 ${result.count} 篇文章，${result.pages} 个页面订阅声明`);
  } catch (error) {
    console.error(error.message.startsWith('[RSS]') ? error.message : `[RSS] 文件校验失败：${error.code || error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { checkFeed };
