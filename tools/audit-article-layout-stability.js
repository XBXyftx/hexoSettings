#!/usr/bin/env node

/**
 * Audit intrinsic image dimensions and lazy-loading markup in generated posts.
 *
 * Reports stay outside the repository by default so audit artifacts are never
 * deployed or committed accidentally.
 */

'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT_ROOT = path.join(os.tmpdir(), 'hexo-article-layout-audits');
const ARTICLE_PATTERN = /<article\b[^>]*\bid=(['"])article-container\1[^>]*>([\s\S]*?)<\/article>/i;
const IMAGE_PATTERN = /<img\b([^>]*)>/gi;
const ATTRIBUTE_PATTERN = /\b([\w:-]+)=(['"])(.*?)\2/gi;

function parseArgs(argv) {
  const options = {
    publicDir: path.join(ROOT, 'public'),
    outputDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--public-dir') {
      options.publicDir = path.resolve(value);
      index += 1;
    } else if (argument === '--output-dir') {
      options.outputDir = path.resolve(value);
      index += 1;
    } else if (argument === '--help' || argument === '-h') {
      console.log('Usage: node tools/audit-article-layout-stability.js [--public-dir public] [--output-dir directory]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

async function collectHtmlFiles(directory) {
  const files = [];

  async function walk(current) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    await Promise.all(entries.map(async entry => {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) return walk(target);
      if (entry.name.toLowerCase().endsWith('.html')) files.push(target);
    }));
  }

  await walk(directory);
  return files.sort();
}

function parseAttributes(value) {
  const attributes = {};
  for (const match of value.matchAll(ATTRIBUTE_PATTERN)) {
    attributes[match[1].toLowerCase()] = match[3];
  }
  return attributes;
}

function classifySource(source = '') {
  if (/^https?:\/\//i.test(source)) return 'external';
  if (source.startsWith('data:')) return 'data';
  if (/^\/\d{4}\/\d{2}\/\d{2}\//.test(source)) return 'post-asset';
  if (source.startsWith('/img/') || source.startsWith('/imgs/')) return 'site-asset';
  return 'other-local';
}

function inspectArticle(html, sourceFile, publicDir) {
  const article = html.match(ARTICLE_PATTERN);
  if (!article) return null;

  const images = [];
  for (const match of article[2].matchAll(IMAGE_PATTERN)) {
    const attributes = parseAttributes(match[1]);
    const source = attributes.src || attributes['data-src'] || attributes['data-lazy-src'] || '';
    const hasWidth = Boolean(attributes.width);
    const hasHeight = Boolean(attributes.height);
    images.push({
      source,
      sourceType: classifySource(source),
      hasWidth,
      hasHeight,
      hasIntrinsicDimensions: hasWidth && hasHeight,
      nativeLazy: attributes.loading === 'lazy',
      customLazy: Boolean(attributes['data-src'] || attributes['data-lazy-src']),
    });
  }

  return {
    file: path.relative(publicDir, sourceFile).split(path.sep).join('/'),
    images,
  };
}

function summarize(articles) {
  const totals = {
    articlePages: articles.length,
    articleImages: 0,
    intrinsicDimensionImages: 0,
    missingIntrinsicDimensionImages: 0,
    nativeLazyImages: 0,
    customLazyImages: 0,
    sourceTypes: {},
    missingDimensionsBySourceType: {},
  };

  const pagesWithMissingDimensions = [];
  for (const article of articles) {
    let missing = 0;
    for (const image of article.images) {
      totals.articleImages += 1;
      totals.sourceTypes[image.sourceType] = (totals.sourceTypes[image.sourceType] || 0) + 1;
      if (image.hasIntrinsicDimensions) totals.intrinsicDimensionImages += 1;
      else {
        totals.missingIntrinsicDimensionImages += 1;
        totals.missingDimensionsBySourceType[image.sourceType] = (totals.missingDimensionsBySourceType[image.sourceType] || 0) + 1;
        missing += 1;
      }
      if (image.nativeLazy) totals.nativeLazyImages += 1;
      if (image.customLazy) totals.customLazyImages += 1;
    }
    if (missing) pagesWithMissingDimensions.push({ file: article.file, missing, total: article.images.length });
  }

  pagesWithMissingDimensions.sort((left, right) => right.missing - left.missing || right.total - left.total || left.file.localeCompare(right.file));
  return { totals, pagesWithMissingDimensions };
}

function markdownReport(report) {
  const { totals, pagesWithMissingDimensions } = report;
  const lines = [
    '# Article Layout Stability Audit',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Generated article pages | ${totals.articlePages} |`,
    `| Article images | ${totals.articleImages} |`,
    `| Images with width + height | ${totals.intrinsicDimensionImages} |`,
    `| Images missing either dimension | ${totals.missingIntrinsicDimensionImages} |`,
    `| Native lazy images in generated markup | ${totals.nativeLazyImages} |`,
    `| Custom lazy images in generated markup | ${totals.customLazyImages} |`,
    '',
    '## Missing Dimension Sources',
    '',
    '| Source type | Images without width + height |',
    '| --- | ---: |',
  ];

  for (const [sourceType, count] of Object.entries(totals.missingDimensionsBySourceType).sort((left, right) => right[1] - left[1])) {
    lines.push(`| ${sourceType} | ${count} |`);
  }

  lines.push('', '## Pages With Most Missing Dimensions', '', '| Page | Missing images | Total article images |', '| --- | ---: | ---: |');
  for (const page of pagesWithMissingDimensions.slice(0, 30)) {
    lines.push(`| \`${page.file}\` | ${page.missing} | ${page.total} |`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.publicDir)) throw new Error(`Generated directory does not exist: ${options.publicDir}`);

  const files = await collectHtmlFiles(options.publicDir);
  const inspected = (await Promise.all(files.map(async file => inspectArticle(await fsp.readFile(file, 'utf8'), file, options.publicDir)))).filter(Boolean);
  const report = { publicDir: options.publicDir, ...summarize(inspected), articles: inspected };
  const outputDir = options.outputDir || await fsp.mkdtemp(path.join(DEFAULT_OUTPUT_ROOT, 'run-'));
  await fsp.mkdir(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, 'article-layout-stability.json');
  const markdownPath = path.join(outputDir, 'article-layout-stability.md');
  await Promise.all([
    fsp.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
    fsp.writeFile(markdownPath, markdownReport(report)),
  ]);

  console.log(JSON.stringify({ totals: report.totals, reportDirectory: outputDir, jsonReport: jsonPath, markdownReport: markdownPath }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
