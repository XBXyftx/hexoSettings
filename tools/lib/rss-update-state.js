'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const frontMatter = require('hexo-front-matter');

const STATE_VERSION = 1;
const fail = message => { throw new Error(`[RSS 更新时间] ${message}`); };
const normalize = raw => raw.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n').replace(/\n+$/u, '');
const hashContent = raw => crypto.createHash('sha256').update(normalize(raw)).digest('hex');

function git(baseDir, args) {
  return execFileSync('git', ['--literal-pathspecs', '-C', baseDir, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000, maxBuffer: 32 * 1024 * 1024
  });
}

function validateState(value) {
  if (!value || value.version !== STATE_VERSION || !value.posts
    || Array.isArray(value.posts) || typeof value.posts !== 'object') fail('台账结构无效，请检查文件，不能静默重建');
  for (const [source, record] of Object.entries(value.posts)) {
    if (!source.startsWith('_posts/') || source.split('/').includes('..')
      || !record || !/^[a-f0-9]{64}$/u.test(record.content_hash)
      || typeof record.updated !== 'string' || !Number.isFinite(Date.parse(record.updated))
      || new Date(record.updated).toISOString() !== record.updated
      || !['git', 'observed', 'explicit', 'published'].includes(record.basis)
      || (record.source_commit !== undefined && !/^[a-f0-9]{40,64}$/u.test(record.source_commit))) {
      fail('台账记录无效，请检查文件，不能回退到 mtime');
    }
  }
}

function openUpdateState(context, now = Date.now()) {
  const name = context.config.rss_subscription.state_path;
  if (typeof name !== 'string' || !/^\.[a-z0-9-]+\.json$/u.test(name)) fail('台账必须是项目根目录的隐藏 JSON 文件');
  const file = path.join(context.base_dir, name);
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) fail('台账不能是符号链接');
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  let state = { version: STATE_VERSION, posts: {} };
  if (original !== null) {
    try { state = JSON.parse(original); } catch { fail('台账不是有效 JSON，请修复后重试'); }
    validateState(state);
  }
  const next = {};
  let repository;
  let gitResolved = false;
  let shallow = false;
  const counts = { reused: 0, git: 0, observed: 0, explicit: 0, published: 0 };

  function repositoryRoot() {
    if (!gitResolved) {
      try {
        repository = git(context.base_dir, ['rev-parse', '--show-toplevel']).trim();
        shallow = git(repository, ['rev-parse', '--is-shallow-repository']).trim() === 'true';
      } catch {
        // An exported source tree may still use a synchronized ledger.
        repository = null;
      }
      gitResolved = true;
    }
    return repository;
  }

  function baseline(source, hash, published) {
    const root = repositoryRoot();
    if (!root) {
      context.log?.warn('[RSS] 缺少 Git 历史，未建基线文章暂用发布日期；请同步更新时间台账');
      return { updated: new Date(published).toISOString(), basis: 'published' };
    }
    if (shallow) fail('首次建立或补充基线需要完整 Git 历史，请补全历史或同步匹配的台账');
    const candidate = path.resolve(context.source_dir, source);
    const filename = fs.existsSync(candidate)
      ? fs.realpathSync(candidate)
      : path.resolve(fs.realpathSync(context.source_dir), source);
    const relative = path.relative(root, filename).split(path.sep).join('/');
    if (relative.startsWith('../') || path.isAbsolute(relative)) fail('文章源文件不在当前 Git 仓库内');
    let tracked;
    try {
      tracked = git(root, ['ls-tree', '--name-only', 'HEAD', '--', relative]).trim();
    } catch {
      fail('无法读取 Git HEAD，请确认仓库至少有一次有效提交');
    }
    if (!tracked) return { updated: new Date(now).toISOString(), basis: 'observed' };
    let current, history;
    try {
      current = git(root, ['show', `HEAD:${relative}`]);
      if (hashContent(current) !== hash) return { updated: new Date(now).toISOString(), basis: 'observed' };
      history = git(root, ['log', '--format=%H %cI', 'HEAD', '--', relative]).split('\n').filter(Boolean);
    } catch { fail('读取文章 Git 内容历史失败，停止生成'); }
    let record;
    // Skip commits which only change line endings/BOM/final newlines.
    for (const line of history) {
      const [commit, date] = line.split(' ');
      let content;
      try { content = git(root, ['show', `${commit}:${relative}`]); } catch { break; }
      if (hashContent(content) !== hash) break;
      const time = Date.parse(date);
      if (!Number.isFinite(time)) fail('Git 提交时间无效');
      record = { updated: new Date(Math.max(published, time)).toISOString(), basis: 'git', source_commit: commit };
    }
    if (!record) fail('无法为已跟踪文章建立 Git 基线');
    return record;
  }

  function resolve(post, source, published) {
    if (typeof post.raw !== 'string') fail('缺少文章原始 Markdown，不能使用渲染结果或 mtime 猜测');
    const hash = hashContent(post.raw);
    const previous = state.posts[source];
    const metadata = frontMatter.parse(post.raw);
    let record;
    if (Object.prototype.hasOwnProperty.call(metadata, 'updated')) {
      // Hexo has already applied the site's timezone to an explicit updated.
      const explicit = post.updated?.valueOf();
      if (!metadata.updated || !Number.isFinite(Date.parse(metadata.updated)) || !Number.isFinite(explicit)) {
        fail('文章显式 updated 无效');
      }
      record = { updated: new Date(Math.max(published, explicit)).toISOString(), basis: 'explicit' };
      counts.explicit++;
    } else if (previous?.content_hash === hash) {
      record = { ...previous };
      counts.reused++;
    } else if (previous) {
      record = { updated: new Date(Math.max(now, published, Date.parse(previous.updated))).toISOString(), basis: 'observed' };
      counts.observed++;
    } else {
      record = baseline(source, hash, published);
      counts[record.basis]++;
    }
    const updated = Math.max(published, Date.parse(record.updated));
    if (!Number.isFinite(updated) || updated > now + 5 * 60 * 1000) fail('内容更新时间超前，请检查日期或时钟');
    next[source] = { content_hash: hash, ...record, updated: new Date(updated).toISOString() };
    return updated;
  }

  function save() {
    const sorted = Object.fromEntries(Object.keys(next).sort().map(key => [key, next[key]]));
    const value = `${JSON.stringify({ version: STATE_VERSION, posts: sorted }, null, 2)}\n`;
    if (value === original) return false;
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current !== original) fail('台账被其他构建修改，请串行构建后重试');
    const temporary = `${file}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    try {
      fs.writeFileSync(temporary, value, { encoding: 'utf8', flag: 'wx' });
      fs.renameSync(temporary, file);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    return true;
  }

  return { resolve, save, counts };
}

module.exports = { openUpdateState, hashContent };
