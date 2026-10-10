'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Hexo = require('hexo');
const moment = require('moment');
const { openUpdateState, hashContent } = require('../tools/lib/rss-update-state');
const { generateFeeds } = require('../tools/lib/rss-feed-policy');

const PUBLISHED = Date.parse('2025-01-01T00:00:00Z');
const COMMITTED = '2025-02-03T04:05:06Z';
const NOW = Date.parse('2026-10-10T00:00:00Z');
const RAW = '---\ntitle: Example\ndate: 2025-01-01 00:00:00\ndescription: Summary\n---\nOriginal body\n';
const SOURCE = '_posts/中文 example.md';

function fixture(t, withGit = true) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'rss-time-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const context = {
    base_dir: base, source_dir: path.join(base, 'source'), log: { warn() {}, info() {} },
    config: { rss_subscription: { state_path: '.rss-feed-state.json' } }
  };
  const file = path.join(context.source_dir, SOURCE);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, RAW);
  const git = (...args) => execFileSync('git', ['-C', base, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
  const commit = (date = COMMITTED) => {
    git('add', '.');
    execFileSync('git', ['-C', base, '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
      'commit', '-m', 'Fixture change'], { stdio: 'pipe', env: {
      ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date
    } });
  };
  if (withGit) { git('init'); commit(); }
  const post = () => ({ raw: fs.readFileSync(file, 'utf8'), updated: moment(fs.statSync(file).mtimeMs) });
  const resolve = (now = NOW) => {
    const state = openUpdateState(context, now);
    const updated = state.resolve(post(), SOURCE, PUBLISHED);
    state.save();
    return updated;
  };
  return { context, file, git, commit, post, resolve, stateFile: path.join(base, '.rss-feed-state.json') };
}

test('first baseline uses Git content commit, not local mtime, and ignores later unrelated commits', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.context.base_dir, 'announcement.txt'), 'Unrelated');
  f.commit('2026-09-01T00:00:00Z');
  fs.utimesSync(f.file, new Date(NOW), new Date(NOW));
  assert.equal(f.resolve(), Date.parse(COMMITTED));
  const record = JSON.parse(fs.readFileSync(f.stateFile)).posts[SOURCE];
  assert.equal(record.basis, 'git');
});

test('BOM, CRLF and final newline changes do not advance timestamp; Markdown spaces still matter', t => {
  const f = fixture(t);
  fs.writeFileSync(f.file, '\uFEFF' + RAW.replace(/\n/g, '\r\n') + '\r\n');
  f.commit('2026-09-02T00:00:00Z');
  assert.equal(f.resolve(), Date.parse(COMMITTED));
  assert.equal(hashContent(RAW), hashContent('\uFEFF' + RAW.replace(/\n/g, '\r\n')));
  assert.notEqual(hashContent('body  \nnext'), hashContent('body\nnext'));
});

test('unchanged content survives mtime changes, state reload and clean output removal', t => {
  const f = fixture(t);
  assert.equal(f.resolve(), Date.parse(COMMITTED));
  const original = fs.readFileSync(f.stateFile);
  const stat = fs.statSync(f.stateFile);
  fs.utimesSync(f.file, new Date(NOW), new Date(NOW));
  fs.mkdirSync(path.join(f.context.base_dir, 'public'));
  fs.rmSync(path.join(f.context.base_dir, 'public'), { recursive: true });
  assert.equal(f.resolve(NOW + 60000), Date.parse(COMMITTED));
  assert.deepEqual(fs.readFileSync(f.stateFile), original);
  assert.equal(fs.statSync(f.stateFile).mtimeMs, stat.mtimeMs);
});

test('real dirty content updates once at observation time and remains stable after commit', t => {
  const f = fixture(t);
  f.resolve();
  fs.appendFileSync(f.file, '\nChanged body');
  fs.utimesSync(f.file, new Date(PUBLISHED), new Date(PUBLISHED));
  assert.equal(f.resolve(), NOW);
  assert.equal(f.resolve(NOW + 60000), NOW);
  f.commit('2026-10-10T00:02:00Z');
  assert.equal(f.resolve(NOW + 180000), NOW);
  const record = JSON.parse(fs.readFileSync(f.stateFile)).posts[SOURCE];
  assert.equal(record.basis, 'observed');
  assert.equal(record.source_commit, undefined);
});

test('copied workspace with synchronized ledger remains stable without Git', t => {
  const f = fixture(t);
  f.resolve();
  const other = fixture(t, false);
  fs.copyFileSync(f.stateFile, other.stateFile);
  fs.utimesSync(other.file, new Date(NOW), new Date(NOW));
  assert.equal(other.resolve(), Date.parse(COMMITTED));
});

test('new or dirty unbaselined posts use observation time, exported history fallback uses publication', t => {
  const f = fixture(t);
  fs.appendFileSync(f.file, '\nUncommitted');
  assert.equal(f.resolve(), NOW);
  const fresh = '_posts/new.md';
  const state = openUpdateState(f.context, NOW);
  assert.equal(state.resolve({ raw: RAW }, fresh, PUBLISHED), NOW);
  const exported = fixture(t, false);
  assert.equal(exported.resolve(), PUBLISHED);
});

test('explicit updated takes precedence, invalid or future explicit dates fail', t => {
  const f = fixture(t);
  const state = openUpdateState(f.context, NOW);
  const raw = RAW.replace('title: Example', 'updated: 2025-07-01T00:00:00Z\ntitle: Example');
  assert.equal(state.resolve({ raw, updated: moment.utc('2025-07-01') }, SOURCE, PUBLISHED), Date.parse('2025-07-01'));
  assert.throws(() => state.resolve({ raw: RAW.replace('title: Example', 'updated: invalid\ntitle: Example'),
    updated: moment.utc(COMMITTED) }, SOURCE, PUBLISHED), /显式 updated/);
  assert.throws(() => state.resolve({ raw, updated: moment.utc('2027-01-01') }, SOURCE, PUBLISHED), /超前/);
});

test('corrupt, conflicted, unsupported and invalid ledger records fail without overwrite', t => {
  const f = fixture(t);
  for (const value of ['<<<<<<< HEAD', '{}', '{"version":2,"posts":{}}',
    '{"version":1,"posts":{"_posts/a":{"content_hash":"bad","updated":"bad"}}}']) {
    fs.writeFileSync(f.stateFile, value);
    assert.throws(() => openUpdateState(f.context, NOW), /台账/);
    assert.equal(fs.readFileSync(f.stateFile, 'utf8'), value);
  }
});

test('stale simultaneous writer fails instead of overwriting newer state', t => {
  const f = fixture(t);
  const first = openUpdateState(f.context, NOW);
  const second = openUpdateState(f.context, NOW);
  first.resolve(f.post(), SOURCE, PUBLISHED); second.resolve(f.post(), SOURCE, PUBLISHED);
  first.save();
  assert.throws(() => second.save(), /其他构建/);
});

test('shallow clone rejects missing baseline but can reuse synchronized state', t => {
  const f = fixture(t);
  f.resolve();
  f.commit('2026-10-09T00:00:00Z');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rss-shallow-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  execFileSync('git', ['clone', '--depth=1', `file://${f.context.base_dir}`, dir], { stdio: 'pipe' });
  const ctx = { ...f.context, base_dir: dir, source_dir: path.join(dir, 'source') };
  const state = openUpdateState(ctx, NOW);
  assert.equal(state.resolve(f.post(), SOURCE, PUBLISHED), Date.parse(COMMITTED));
  assert.throws(() => state.resolve({ raw: RAW }, '_posts/new.md', PUBLISHED), /完整 Git 历史/);
});

test('integration preserves identity/publication, persists all public posts only, fails transactionally', async t => {
  const f = fixture(t);
  const h = new Hexo(f.context.base_dir, { silent: true });
  Object.assign(h.config, {
    url: 'https://example.invalid', title: 'Test', subtitle: 'Summary', author: 'Author', language: 'zh-CN',
    render_drafts: true, future: true,
    feed: { enable: false, type: ['atom', 'rss2'], path: ['atom.xml', 'rss.xml'], content: false,
      content_limit: 240, limit: 1, order_by: '-date source', autodiscovery: false },
    rss_subscription: { enable: true, public_source_prefix: '_posts/', exclude_future: true, state_path: '.rss-feed-state.json' }
  });
  h.extend.filter.register('post_permalink', require('../node_modules/hexo/dist/plugins/filter/post_permalink'));
  await h.model('Post').insert([
    { source: SOURCE, slug: 'stable', raw: RAW, date: PUBLISHED, updated: NOW, description: 'Summary', title: 'Test' },
    { source: '_posts/older.md', slug: 'older', raw: RAW, date: PUBLISHED - 1000, description: 'Old', title: 'Old' },
    { source: '_posts/private.md', slug: 'private', raw: 'PRIVATE', date: PUBLISHED, private: true },
    { source: '_drafts/draft.md', slug: 'draft', raw: 'DRAFT', date: PUBLISHED, published: false },
    { source: '_posts/future.md', slug: 'future', raw: 'FUTURE', date: NOW + 86400000 }
  ]);
  const originalUpdated = h.model('Post').findOne({ source: SOURCE }).updated.valueOf();
  const first = generateFeeds(h, h.locals.toObject(), NOW);
  assert.equal(first.posts.length, 1);
  assert.equal(first.posts[0].updated.valueOf(), Date.parse(COMMITTED));
  const records = JSON.parse(fs.readFileSync(f.stateFile)).posts;
  assert.deepEqual(Object.keys(records).sort(), [SOURCE, '_posts/older.md'].sort());
  assert.equal(h.model('Post').findOne({ source: SOURCE }).updated.valueOf(), originalUpdated);
  const previousFile = fs.readFileSync(f.stateFile);
  assert.deepEqual(first.routes, generateFeeds(h, h.locals.toObject(), NOW + 60000).routes);
  h.locals.get('posts').first().raw += '\nChanged';
  const next = generateFeeds(h, h.locals.toObject(), NOW + 120000);
  assert.equal(next.posts[0].date.valueOf(), first.posts[0].date.valueOf());
  assert.equal(next.posts[0].permalink, first.posts[0].permalink);
  assert.equal(next.posts[0].updated.valueOf(), NOW + 120000);
  assert.notDeepEqual(fs.readFileSync(f.stateFile), previousFile);
  const successful = fs.readFileSync(f.stateFile);
  h.locals.get('posts').first().title = '';
  assert.throws(() => generateFeeds(h, h.locals.toObject(), NOW + 180000), /标题/);
  assert.deepEqual(fs.readFileSync(f.stateFile), successful);
});
