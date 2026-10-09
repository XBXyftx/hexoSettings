'use strict';

hexo.extend.generator.register('rss-feed', function (locals) {
  // Load inside the generator so dependency/policy failures reject generation.
  const { generateFeeds } = require('../tools/lib/rss-feed-policy');
  const result = generateFeeds(this, locals);
  if (result.routes.length) {
    this.log.info(`[RSS] 已生成双格式订阅：收录 ${result.posts.length} 篇，排除 ${result.excluded} 篇`);
    if (result.fallbacks) this.log.warn(`[RSS] ${result.fallbacks} 篇文章缺少摘要，使用阅读全文提示`);
  }
  return result.routes;
});
