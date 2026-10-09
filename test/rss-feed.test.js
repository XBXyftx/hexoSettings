'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const Hexo = require('hexo');
const yaml = require('js-yaml');
const policy = require('../tools/lib/rss-feed-policy');
const { checkFeed } = require('../tools/check-feed');

const NOW = Date.parse('2026-10-09T00:00:00Z');
function config() {
  return {
    url: 'https://example.invalid', title: 'Test', author: 'Author', language: 'zh-CN',
    subtitle: 'Public posts', source_dir: 'source', public_dir: 'public', archive_dir: 'archives',
    permalink: ':year/:month/:day/:title/', future: true, render_drafts: true,
    feed: {
      enable: false, type: ['atom', 'rss2'], path: ['atom.xml', 'rss.xml'], limit: 30,
      content: false, content_limit: 240, order_by: '-date source', autodiscovery: false, icon: '/img/logo.webp'
    },
    rss_subscription: { enable: true, public_source_prefix: '_posts/', exclude_future: true }
  };
}
function article(slug = 'public', fields = {}) {
  return { source: `_posts/${slug}.md`, slug, title: slug, description: 'Public summary',
    date: new Date('2026-09-01T00:00:00Z'), updated: new Date('2026-09-02T00:00:00Z'), published: true, ...fields };
}
async function fixture(posts = [article()], mutate = () => {}) {
  const h = new Hexo(process.cwd(), { silent: true });
  Object.assign(h.config, config());
  mutate(h.config);
  h.extend.filter.register('post_permalink', require('../node_modules/hexo/dist/plugins/filter/post_permalink'));
  await h.model('Post').insert(posts);
  h.locals.invalidate();
  const locals = h.locals.toObject();
  return { h, locals, generate: () => policy.generateFeeds(h, locals, NOW) };
}

test('real feed4 XML generation works with Hexo7 and retains GUID, text and categories', async () => {
  const f = await fixture([article('中文 空格', { title: '中文 & <Test>', description: 'a < b & x \u{1F680}\u0001' })]);
  await f.h.model('Post').first().setTags(['中文 & Tag']);
  const result = f.generate();
  const parsed = policy.verifyPair(result.routes, f.h.config, result.posts, NOW);
  assert.equal(parsed.entries[0].summary, 'a < b & x \u{1F680}');
  assert.match(result.routes[1].data, /<guid isPermaLink="true">/);
  assert.doesNotMatch(result.routes[1].data, /<author>/);
  assert.equal(parsed.entries[0].categories[0].name, '中文 & Tag');
  assert.equal(parsed.entries[0].id.includes('%25E4'), false);
});

test('exclude drafts, private flags, passwords, pages, opt-out and future posts before limiting', async () => {
  const posts = [article('连连看')];
  for (const flag of ['draft', 'private', 'hidden', 'hide']) posts.push(article(flag, { [flag]: true }));
  posts.push(article('off', { feed: false }), article('unpublished', { published: false }),
    article('draft-dir', { source: '_drafts/secret.md' }), article('page', { source: 'coffer/secret.md' }),
    article('birthday', { source: 'birthday-gift/index.md' }), article('game', { source: 'LianlianKan/index.md' }),
    article('password', { password: 'synthetic-test-value' }), article('future', { date: new Date('2027-01-01') }));
  const f = await fixture(posts);
  assert.equal(f.generate().posts.length, 1);
  assert.equal(f.generate().posts[0].title, '连连看');
});

test('selection uses date/source, ignores pins, does not mutate original models', async () => {
  const f = await fixture(Array.from({ length: 35 }, (_, i) => article(`p${String(i).padStart(2, '0')}`, {
    date: new Date(Date.UTC(2026, 0, i + 1)), updated: new Date('2026-03-01'), top: 100 - i
  })).concat(article('filtered', { feed: false, date: new Date('2026-09-08') })));
  const before = f.locals.posts.toArray().map(p => ({ source: p.source, description: p.description, date: p.date.valueOf() }));
  const r = f.generate();
  assert.equal(r.posts.length, 30);
  assert.equal(r.posts[0].source, '_posts/p34.md');
  assert.deepEqual(f.locals.posts.toArray().map(p => ({ source: p.source, description: p.description, date: p.date.valueOf() })), before);
  const equal = await fixture([article('z'), article('a')]);
  assert.deepEqual(equal.generate().posts.map(p => p.source), ['_posts/a.md', '_posts/z.md']);
});

test('boolean strings and unsafe sources fail closed', async () => {
  for (const flag of ['feed', 'private', 'hidden', 'hide', 'draft']) {
    const f = await fixture();
    f.locals.posts.first()[flag] = 'false';
    assert.throws(f.generate, /必须为布尔值/);
  }
  for (const source of ['/absolute.md', '../_posts/a.md', 'C:\\_posts\\a.md', '_posts/../coffer/a.md', '']) {
    const f = await fixture();
    f.locals.posts.first().source = source;
    assert.throws(f.generate, /路径/);
  }
});

test('summary is bounded and missing descriptions never copy body content', async () => {
  const f = await fixture([
    article('long', { description: '\u{1F680}'.repeat(300) }),
    article('empty', { description: '', content: '<script>PRIVATE_BODY_SENTINEL</script>' }),
    article('html', { description: '<p>Hello</p><script>PRIVATE_BODY_SENTINEL</script><style>HIDDEN</style>' })
  ]);
  const result = f.generate();
  assert.equal(Array.from(result.posts.find(p => p.source.includes('long')).description).length, 240);
  assert.equal(result.fallbacks, 1);
  assert.doesNotMatch(result.routes.map(r => r.data).join(''), /PRIVATE_BODY_SENTINEL|HIDDEN/);
  assert.equal(result.posts.find(p => p.source.includes('html')).description, 'Hello');
});

test('old entry update changes top-level time without changing IDs or order', async () => {
  const f = await fixture([article('new'), article('old', { date: new Date('2025-01-01'), updated: new Date('2026-10-01') })]);
  const first = f.generate();
  const parsed = policy.verifyPair(first.routes, f.h.config, first.posts, NOW);
  assert.equal(parsed.entries[0].title, 'new');
  assert.equal(parsed.updated, Date.parse('2026-10-01'));
  assert.deepEqual(first.routes, f.generate().routes);
  const ids = parsed.entries.map(p => p.id);
  f.locals.posts.last().updated = new Date('2026-10-02');
  const next = f.generate();
  assert.deepEqual(policy.verifyPair(next.routes, f.h.config, next.posts, NOW).entries.map(p => p.id), ids);
});

test('category insertion order does not change feed bytes', async () => {
  const f = await fixture();
  const categories = [
    { name: 'Z', permalink: 'https://example.invalid/tags/Z/' },
    { name: 'A', permalink: 'https://example.invalid/tags/A/' }
  ];
  const post = f.locals.posts.first();
  Object.defineProperty(post, 'tags', { value: { toArray: () => categories } });
  const before = f.generate().routes;
  categories.reverse();
  assert.deepEqual(f.generate().routes, before);
});

test('changing summary, adding, excluding and removing records updates feeds automatically', async () => {
  const f = await fixture();
  const id = policy.verifyPair(f.generate().routes, f.h.config, undefined, NOW).entries[0].id;
  f.locals.posts.first().description = 'Revised summary';
  let result = f.generate();
  assert.equal(policy.verifyPair(result.routes, f.h.config, result.posts, NOW).entries[0].id, id);
  assert.match(result.routes[0].data, /Revised summary/);
  await f.h.model('Post').insert(article('second'));
  f.h.locals.invalidate();
  result = policy.generateFeeds(f.h, f.h.locals.toObject(), NOW);
  assert.equal(result.posts.length, 2);
  const second = f.h.model('Post').findOne({ slug: 'second' });
  second.feed = false;
  await second.save();
  f.h.locals.invalidate();
  result = policy.generateFeeds(f.h, f.h.locals.toObject(), NOW);
  assert.equal(result.posts.length, 1);
  await f.h.model('Post').findOne({ slug: 'second' }).remove();
  f.h.locals.invalidate();
  assert.equal(policy.generateFeeds(f.h, f.h.locals.toObject(), NOW).posts.length, 1);
});

test('empty, invalid dates, future updated and forbidden permalinks block generation', async () => {
  const empty = await fixture([article('off', { feed: false })]);
  assert.throws(empty.generate, /没有可收录/);
  const future = await fixture([article('x', { updated: new Date('2027-01-01') })]);
  assert.throws(future.generate, /更新时间超前/);
  const invalid = await fixture();
  invalid.locals.posts.first().date = new Date('invalid');
  assert.throws(invalid.generate, /发布日期/);
  for (const url of ['https://elsewhere.invalid/a', 'https://example.invalid/coffer/a/', 'https://example.invalid/birthday-gift/a/']) {
    const f = await fixture();
    Object.defineProperty(f.locals.posts.first(), 'permalink', { value: url });
    assert.throws(f.generate, /链接/);
  }
});

test('duplicate permanent URLs, source collisions and plugin version drift fail closed', async t => {
  const duplicate = await fixture([article('one'), article('two')]);
  for (const post of duplicate.locals.posts.toArray()) post.__permalink = '/2026/01/01/same/';
  assert.throws(duplicate.generate, /永久链接重复/);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-rss-source-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(path.join(directory, 'atom.xml'), 'collision');
  const collision = await fixture();
  collision.h.source_dir = directory;
  assert.throws(collision.generate, /同名订阅文件/);
  const f = await fixture();
  const metadata = require('hexo-generator-feed/package.json');
  const version = metadata.version;
  try {
    metadata.version = '0.0.0';
    assert.throws(f.generate, /版本必须/);
  } finally { metadata.version = version; }
});

test('invalid config and duplicate XML paths are rejected; disabling only local entry is supported', async () => {
  for (const mutate of [
    c => { c.feed.enable = true; }, c => { c.feed.content = true; },
    c => { c.feed.path = ['atom.xml', 'atom.xml']; }, c => { c.feed.path[0] = '../atom.xml'; },
    c => { c.rss_subscription.exclude_future = false; }, c => { c.feed.limit = 0; }
  ]) {
    const f = await fixture(undefined, mutate);
    assert.throws(f.generate, /\[RSS\]/);
  }
  const f = await fixture(undefined, c => { c.rss_subscription.enable = false; });
  assert.deepEqual(f.generate().routes, []);
});

test('XML corruption, DTD, removed GUID and unexpected content fail validation', async () => {
  const f = await fixture();
  const routes = f.generate().routes;
  assert.throws(() => policy.parseXML('<feed>'), /语法/);
  assert.throws(() => policy.parseXML('<!DOCTYPE feed><feed/>'), /DTD/);
  assert.throws(() => policy.verifyPair([routes[0], { ...routes[1],
    data: routes[1].data.replace(/<guid[^>]*>[^<]*<\/guid>/, '') }], f.h.config, undefined, NOW), /GUID/);
  assert.throws(() => policy.verifyPair([{ ...routes[0],
    data: routes[0].data.replace('</entry>', '<content>unexpected</content></entry>') }, routes[1]], f.h.config, undefined, NOW), /纯文本摘要/);
});

test('plugin default entry is inert and runtime dependency errors remain generator errors', async () => {
  const f = await fixture();
  vm.runInNewContext(`(function () {${fs.readFileSync(require.resolve('hexo-generator-feed'), 'utf8')}\n})()`, {
    hexo: f.h, require, module: { exports: {} }
  });
  assert.equal(f.h.extend.generator.get('atom'), undefined);
  assert.equal(f.h.extend.generator.get('rss2'), undefined);
  let generator;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/rss-feed.js'), 'utf8'), {
    hexo: { extend: { generator: { register: (_, fn) => { generator = fn; } } } },
    require: () => { throw new Error('DEPENDENCY_MISSING'); }
  });
  assert.throws(() => generator.call(f.h, f.locals), /DEPENDENCY_MISSING/);
});

test('file checker validates actual outputs and blocks missing feeds, targets and discovery links', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-rss-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const f = await fixture();
  const result = f.generate();
  const cfg = f.h.config;
  fs.writeFileSync(path.join(dir, '_config.yml'), yaml.dump(config()));
  const pub = path.join(dir, 'public');
  const html = '<html><head><link rel="alternate" type="application/atom+xml" href="/atom.xml">'
    + '<link rel="alternate" type="application/rss+xml" href="/rss.xml"></head><body>type="application/rss+xml"</body></html>';
  const files = ['index.html', 'archives/index.html', ...result.posts.map(p =>
    path.relative(pub, policy.articleFile(p.permalink, cfg, pub)))];
  files.forEach(file => { fs.mkdirSync(path.dirname(path.join(pub, file)), { recursive: true }); fs.writeFileSync(path.join(pub, file), html); });
  result.routes.forEach(route => fs.writeFileSync(path.join(pub, route.path), route.data));
  assert.equal(checkFeed(dir).count, 1);
  fs.renameSync(path.join(pub, 'rss.xml'), path.join(pub, 'held.xml'));
  assert.throws(() => checkFeed(dir));
  fs.renameSync(path.join(pub, 'held.xml'), path.join(pub, 'rss.xml'));
  const articlePath = policy.articleFile(result.posts[0].permalink, cfg, pub);
  fs.renameSync(articlePath, `${articlePath}.held`);
  assert.throws(() => checkFeed(dir));
  fs.renameSync(`${articlePath}.held`, articlePath);
  fs.writeFileSync(path.join(pub, 'index.html'), '<html><head></head></html>');
  assert.throws(() => checkFeed(dir), /两个订阅声明/);

  const command = 'node -e "require(process.argv[1]).checkFeed(process.argv[2])" "'
    + path.resolve(__dirname, '../tools/check-feed.js') + '" "' + dir + '" && node -e "console.log(\'DEPLOY_SENTINEL\')"';
  const gated = spawnSync(command, { shell: true, encoding: 'utf8', timeout: 10000 });
  assert.notEqual(gated.status, 0);
  assert.doesNotMatch(gated.stdout, /DEPLOY_SENTINEL/);
});
