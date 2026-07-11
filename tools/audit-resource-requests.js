#!/usr/bin/env node

/**
 * Audit generated Hexo resource references.
 *
 * Checks local asset targets referenced by generated HTML/CSS and optionally
 * probes direct external media resources. Reports are written outside the
 * repository by default so benchmark artifacts are not committed accidentally.
 */

'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT_ROOT = path.join(os.tmpdir(), 'hexo-resource-audits');
const LOCAL_ASSET_EXTENSION = /\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mp3|mp4|ogg|otf|pdf|png|svg|ttf|txt|wav|webm|webp|woff2?)(?:$|[?#])/i;
const EXTERNAL_MEDIA_EXTENSION = /\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mp3|mp4|ogg|otf|pdf|png|svg|ttf|wav|webm|webp|woff2?)(?:$|[?#])/i;
const HTML_ATTRIBUTE_PATTERN = /\b(src|href|poster|data-src|data-lazy-src|data-original|srcset|style)=(["'])(.*?)\2/gi;
const CSS_URL_PATTERN = /url\(\s*(["']?)(.*?)\1\s*\)/gi;

function parseArgs(argv) {
  const options = {
    publicDir: path.join(ROOT, 'public'),
    outputDir: null,
    probeExternal: true,
    externalConcurrency: 10,
    timeoutMs: 15000,
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
    } else if (argument === '--no-external') {
      options.probeExternal = false;
    } else if (argument === '--external-concurrency') {
      options.externalConcurrency = Number(value);
      index += 1;
    } else if (argument === '--timeout-ms') {
      options.timeoutMs = Number(value);
      index += 1;
    } else if (argument === '--help' || argument === '-h') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!Number.isInteger(options.externalConcurrency) || options.externalConcurrency < 1) {
    throw new Error('--external-concurrency must be a positive integer');
  }

  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1000) {
    throw new Error('--timeout-ms must be an integer of at least 1000');
  }

  return options;
}

function printUsage() {
  console.log(`Usage: node tools/audit-resource-requests.js [options]

Options:
  --public-dir <directory>          Generated site directory (default: public)
  --output-dir <directory>          Report directory (default: system temp directory)
  --no-external                     Skip external HTTP probing
  --external-concurrency <number>   Maximum concurrent external probes (default: 10)
  --timeout-ms <number>             Per-request timeout (default: 15000)
  -h, --help                        Show this help`);
}

async function collectFiles(directory, extension) {
  const files = [];

  async function walk(currentDirectory) {
    const entries = await fsp.readdir(currentDirectory, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      const target = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await walk(target);
      } else if (entry.name.toLowerCase().endsWith(extension)) {
        files.push(target);
      }
    }));
  }

  await walk(directory);
  return files.sort();
}

function addReference(collection, url, source) {
  const record = collection.get(url) || { url, count: 0, sources: new Set() };
  record.count += 1;
  record.sources.add(source);
  collection.set(url, record);
}

function isExternal(value) {
  return /^https?:\/\//i.test(value);
}

function toLocalPath(publicDir, sourceFile, value) {
  const pageRelativePath = path.relative(publicDir, sourceFile).split(path.sep).join('/');
  const resolved = new URL(value, `https://audit.local/${pageRelativePath}`);
  return path.join(publicDir, decodeURIComponent(resolved.pathname));
}

function getSrcsetUrls(value) {
  return value.split(',')
    .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
    .filter(Boolean);
}

function normalizeReference(value) {
  return value.trim();
}

async function scanGeneratedReferences(publicDir) {
  const htmlFiles = await collectFiles(publicDir, '.html');
  const cssFiles = await collectFiles(publicDir, '.css');
  const localReferences = new Map();
  const externalReferences = new Map();

  async function inspectValue(value, sourceFile) {
    const normalized = normalizeReference(value);
    if (!normalized || normalized.startsWith('#') || normalized.startsWith('data:') || normalized.startsWith('javascript:')) return;

    if (isExternal(normalized)) {
      if (EXTERNAL_MEDIA_EXTENSION.test(normalized)) {
        addReference(externalReferences, normalized, path.relative(publicDir, sourceFile));
      }
      return;
    }

    if (normalized.startsWith('//')) return;
    if (!LOCAL_ASSET_EXTENSION.test(normalized)) return;

    const localPath = toLocalPath(publicDir, sourceFile, normalized);
    addReference(localReferences, localPath, path.relative(publicDir, sourceFile));
  }

  for (const htmlFile of htmlFiles) {
    const html = await fsp.readFile(htmlFile, 'utf8');
    for (const match of html.matchAll(HTML_ATTRIBUTE_PATTERN)) {
      const attribute = match[1].toLowerCase();
      const value = match[3];
      if (attribute === 'style') {
        for (const cssMatch of value.matchAll(CSS_URL_PATTERN)) {
          await inspectValue(cssMatch[2], htmlFile);
        }
        continue;
      }

      const values = attribute === 'srcset' ? getSrcsetUrls(value) : [value];
      for (const item of values) await inspectValue(item, htmlFile);
    }
  }

  for (const cssFile of cssFiles) {
    const css = await fsp.readFile(cssFile, 'utf8');
    for (const match of css.matchAll(CSS_URL_PATTERN)) {
      await inspectValue(match[2], cssFile);
    }
  }

  return { htmlFiles, cssFiles, localReferences, externalReferences };
}

function serializeReferences(references, publicDir) {
  return [...references.values()]
    .map((record) => ({
      url: record.url,
      generatedReferences: record.count,
      generatedFiles: record.sources.size,
      sampleFiles: [...record.sources].sort().slice(0, 8),
      localPath: publicDir && record.url.startsWith(publicDir)
        ? path.relative(publicDir, record.url).split(path.sep).join('/')
        : undefined,
    }))
    .sort((left, right) => right.generatedReferences - left.generatedReferences || left.url.localeCompare(right.url));
}

async function probeExternal(url, timeoutMs) {
  const headers = { 'user-agent': 'HexoSettings-resource-audit/1.0' };
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers,
    });

    if ([405, 501].includes(response.status)) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { ...headers, range: 'bytes=0-0' },
      });
    }

    return {
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get('content-type') || '',
    };
  } catch (error) {
    return {
      error: error.name === 'TimeoutError' ? 'timeout' : `${error.name}: ${error.message}`,
    };
  }
}

async function probeAllExternal(references, concurrency, timeoutMs) {
  const records = serializeReferences(references);
  let nextIndex = 0;

  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (nextIndex < records.length) {
      const index = nextIndex;
      nextIndex += 1;
      records[index] = { ...records[index], ...(await probeExternal(records[index].url, timeoutMs)) };
    }
  }));

  return records.sort((left, right) => right.generatedReferences - left.generatedReferences || left.url.localeCompare(right.url));
}

function summarize(options, scan, externalResults) {
  const localReferences = serializeReferences(scan.localReferences, options.publicDir);
  const missingLocal = localReferences.filter((reference) => !fs.existsSync(reference.url));
  const failedExternal = externalResults.filter((reference) => reference.error || reference.status >= 400);

  return {
    metadata: {
      publicDir: options.publicDir,
      externalProbeEnabled: options.probeExternal,
      externalTimeoutMs: options.timeoutMs,
      externalConcurrency: options.externalConcurrency,
      note: 'External results describe the current machine, network, and observation time only.',
    },
    totals: {
      generatedHtmlFiles: scan.htmlFiles.length,
      generatedCssFiles: scan.cssFiles.length,
      uniqueLocalAssetTargets: localReferences.length,
      localAssetReferences: localReferences.reduce((total, reference) => total + reference.generatedReferences, 0),
      missingUniqueLocalAssetTargets: missingLocal.length,
      missingLocalAssetReferences: missingLocal.reduce((total, reference) => total + reference.generatedReferences, 0),
      uniqueExternalMediaTargets: externalResults.length,
      failedOrUnreachableExternalMediaTargets: failedExternal.length,
      failedOrUnreachableExternalMediaReferences: failedExternal.reduce((total, reference) => total + reference.generatedReferences, 0),
    },
    missingLocalAssets: missingLocal,
    failedExternalMedia: failedExternal,
    allExternalMedia: externalResults,
  };
}

function markdownReport(report) {
  const { metadata, totals } = report;
  const lines = [
    '# Generated Resource Audit',
    '',
    `- Public directory: \`${metadata.publicDir}\``,
    `- External probe: ${metadata.externalProbeEnabled ? 'enabled' : 'disabled'}`,
    `- Note: ${metadata.note}`,
    '',
    '## Totals',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Generated HTML files | ${totals.generatedHtmlFiles} |`,
    `| Generated CSS files | ${totals.generatedCssFiles} |`,
    `| Missing unique local asset targets | ${totals.missingUniqueLocalAssetTargets} |`,
    `| Missing local asset references | ${totals.missingLocalAssetReferences} |`,
    `| Failed or unreachable external media targets | ${totals.failedOrUnreachableExternalMediaTargets} |`,
    `| Failed or unreachable external media references | ${totals.failedOrUnreachableExternalMediaReferences} |`,
    '',
    '## Missing Local Assets',
    '',
  ];

  if (report.missingLocalAssets.length === 0) {
    lines.push('None.');
  } else {
    lines.push('| Target | References | Files | Sample generated file |');
    lines.push('| --- | ---: | ---: | --- |');
    for (const item of report.missingLocalAssets) {
      lines.push(`| \`/${item.localPath}\` | ${item.generatedReferences} | ${item.generatedFiles} | \`${item.sampleFiles[0] || ''}\` |`);
    }
  }

  lines.push('', '## Failed or Unreachable External Media', '');
  if (!metadata.externalProbeEnabled) {
    lines.push('External probing was disabled.');
  } else if (report.failedExternalMedia.length === 0) {
    lines.push('None.');
  } else {
    lines.push('| URL | Status / error | References | Files | Sample generated file |');
    lines.push('| --- | --- | ---: | ---: | --- |');
    for (const item of report.failedExternalMedia) {
      const result = item.error || item.status;
      lines.push(`| ${item.url} | ${result} | ${item.generatedReferences} | ${item.generatedFiles} | \`${item.sampleFiles[0] || ''}\` |`);
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.publicDir)) {
    throw new Error(`Generated directory does not exist: ${options.publicDir}`);
  }

  const scan = await scanGeneratedReferences(options.publicDir);
  const externalResults = options.probeExternal
    ? await probeAllExternal(scan.externalReferences, options.externalConcurrency, options.timeoutMs)
    : [];
  const report = summarize(options, scan, externalResults);

  const outputDir = options.outputDir || await fsp.mkdtemp(path.join(DEFAULT_OUTPUT_ROOT, 'run-'));
  await fsp.mkdir(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, 'resource-audit.json');
  const markdownPath = path.join(outputDir, 'resource-audit.md');
  await Promise.all([
    fsp.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
    fsp.writeFile(markdownPath, markdownReport(report)),
  ]);

  console.log(JSON.stringify({
    totals: report.totals,
    reportDirectory: outputDir,
    jsonReport: jsonPath,
    markdownReport: markdownPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
