#!/usr/bin/env node

/**
 * Exercise selected generated pages in isolated Headless Chrome instances.
 *
 * The verifier serves a local public directory, records browser network events,
 * and asserts that P2-repaired URL fragments do not occur in the DOM or
 * attempted requests. It writes reports outside the repository by default.
 */

'use strict';

const { createServer } = require('node:http');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const WebSocket = require('ws');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT_ROOT = path.join(os.tmpdir(), 'hexo-resource-browser-verification');
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
].filter(Boolean);
const DEFAULT_PAGES = [
  '/',
  '/link/',
  '/2025/03/16/yiDuo/',
  '/2025/03/31/%E2%80%9CHongXiaoYi%E2%80%9D/',
  '/2025/06/29/OpenSourceSummer2025/',
  '/MarkdownPreview/',
];
const FORBIDDEN_FRAGMENTS = [
  'mermaid@undefined',
  '/img/friend_404.gif',
  '/img/404.jpg',
  '/img/bg2.png',
  '6805d63ef1902.webp',
  '/img/logo.png',
  '/img/LaiAv.jpg',
  '/imgs/JunAv.png',
  '/imgs/WangPengChengAv.png',
  '/imgs/huZiAv.png',
  '/imgs/LiJiaPengAv.png',
  '/img/avatar.jpg',
  '/JunAv.png',
  '/sbcAv.jpg',
  'OpenSourceSummer2025/22.webp',
];

function parseArgs(argv) {
  const options = {
    publicDir: path.join(ROOT, 'public'),
    outputDir: null,
    pages: DEFAULT_PAGES,
    settleMs: 3500,
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
    } else if (argument === '--pages') {
      options.pages = value.split(',').map((item) => item.trim()).filter(Boolean);
      index += 1;
    } else if (argument === '--settle-ms') {
      options.settleMs = Number(value);
      index += 1;
    } else if (argument === '--help' || argument === '-h') {
      console.log('Usage: node tools/verify-resource-requests.js [--public-dir public] [--output-dir directory] [--pages /,/link/] [--settle-ms 3500]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!Number.isInteger(options.settleMs) || options.settleMs < 0) {
    throw new Error('--settle-ms must be a non-negative integer');
  }

  return options;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
  }[extension] || 'application/octet-stream';
}

async function createStaticServer(publicDir) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      let decodedPath = decodeURIComponent(requestUrl.pathname);
      if (decodedPath.endsWith('/')) decodedPath += 'index.html';
      const target = path.resolve(publicDir, `.${decodedPath}`);
      if (!target.startsWith(`${publicDir}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const file = await fsp.readFile(target);
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': mimeType(target),
      });
      response.end(file);
    } catch {
      response.writeHead(404, { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function waitForChrome(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Chrome did not expose CDP on port ${port}`);
}

async function startChrome() {
  const profileDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'hexo-resource-browser-profile-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  let lastError;

  for (const chromePath of CHROME_PATHS) {
    if (chromePath.includes('/') && !existsSync(chromePath)) continue;
    const child = spawn(chromePath, [
      '--headless=new',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-allow-origins=*',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      const version = await Promise.race([
        waitForChrome(port, 5000),
        new Promise((_, reject) => child.once('error', reject)),
      ]);
      return {
        child,
        browserWebSocketDebuggerUrl: version.webSocketDebuggerUrl,
        profileDir,
      };
    } catch (error) {
      lastError = error;
      child.kill('SIGKILL');
    }
  }

  await fsp.rm(profileDir, { recursive: true, force: true });
  throw lastError || new Error('No supported Chrome executable found');
}

function createCdpClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  const pending = new Map();
  const events = [];
  let nextId = 1;

  const opened = new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });

  socket.on('message', (raw) => {
    const message = JSON.parse(raw.toString());
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    } else if (message.method) {
      events.push(message);
    }
  });

  function command(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = nextId;
      nextId += 1;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  return {
    opened,
    command,
    events,
    close: () => new Promise((resolve) => {
      socket.once('close', resolve);
      socket.close();
    }),
  };
}

function getBrowserPort(browserWebSocketDebuggerUrl) {
  const browserUrl = new URL(browserWebSocketDebuggerUrl);
  return Number(browserUrl.port);
}

async function createPageTarget(browserWebSocketDebuggerUrl) {
  const browser = createCdpClient(browserWebSocketDebuggerUrl);
  await browser.opened;
  const { targetId } = await browser.command('Target.createTarget', { url: 'about:blank' });
  await browser.close();

  const browserUrl = new URL(browserWebSocketDebuggerUrl);
  const targets = await fetch(`http://127.0.0.1:${browserUrl.port}/json/list`, {
    signal: AbortSignal.timeout(5000),
  }).then((response) => response.json());
  const target = targets.find((item) => item.id === targetId);
  if (!target?.webSocketDebuggerUrl) {
    throw new Error(`Unable to resolve DevTools WebSocket for target ${targetId}`);
  }

  return target.webSocketDebuggerUrl;
}

function unique(items) {
  return [...new Set(items)];
}

function normalizeNetworkEvents(events, localBaseUrl) {
  const failures = [];
  const responses = [];
  const requestUrls = [];

  for (const event of events) {
    if (event.method === 'Network.requestWillBeSent') {
      requestUrls.push(event.params.request.url);
    }
    if (event.method === 'Network.loadingFailed') {
      const request = events.find((candidate) => candidate.method === 'Network.requestWillBeSent'
        && candidate.params.requestId === event.params.requestId);
      const requestUrl = request?.params.request.url || '';
      if (requestUrl.startsWith(localBaseUrl) && !event.params.canceled && event.params.errorText !== 'net::ERR_ABORTED') {
        failures.push({
          errorText: event.params.errorText,
          type: event.params.type,
          canceled: Boolean(event.params.canceled),
          url: requestUrl,
        });
      }
    }
    if (event.method === 'Network.responseReceived' && event.params.response.status >= 400) {
      responses.push({
        status: event.params.response.status,
        url: event.params.response.url,
        type: event.params.type,
      });
    }
  }

  return { failures, responses, requestUrls: unique(requestUrls) };
}

async function verifyPage(browserWebSocketDebuggerUrl, url, settleMs, localBaseUrl) {
  const targetWebSocketDebuggerUrl = await createPageTarget(browserWebSocketDebuggerUrl);
  const page = createCdpClient(targetWebSocketDebuggerUrl);
  await page.opened;
  await page.command('Network.enable');
  await page.command('Page.enable');
  await page.command('Network.setCacheDisabled', { cacheDisabled: true });
  await page.command('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  try {
    await page.command('Page.navigate', { url });

    const deadline = Date.now() + 20000;
    while (Date.now() < deadline && !page.events.some((event) => event.method === 'Page.loadEventFired')) {
      await sleep(100);
    }
    await sleep(settleMs);

    const expression = `(() => {
      const attributes = ['src', 'href', 'poster', 'data-src', 'data-lazy-src', 'data-original', 'onerror'];
      const values = [...document.querySelectorAll('*')].flatMap((element) => attributes
        .filter((attribute) => element.hasAttribute(attribute))
        .map((attribute) => element.getAttribute(attribute)));
      const text = document.documentElement.outerHTML;
      const forbidden = ${JSON.stringify(FORBIDDEN_FRAGMENTS)}.filter((fragment) => text.includes(fragment));
      return {
        title: document.title,
        forbidden,
        localVideoSources: [...document.querySelectorAll('video source')].map((source) => source.getAttribute('src')),
        imageCount: document.images.length,
        attributeValueCount: values.length,
      };
    })()`;
    const evaluation = await page.command('Runtime.evaluate', { expression, returnByValue: true });
    const network = normalizeNetworkEvents(page.events, localBaseUrl);

    return {
      url,
      dom: evaluation.result.value,
      network,
      forbiddenRequests: network.requestUrls.filter((requestUrl) => FORBIDDEN_FRAGMENTS.some((fragment) => requestUrl.includes(fragment))),
    };
  } finally {
    await page.close();
    await fetch(`http://127.0.0.1:${getBrowserPort(browserWebSocketDebuggerUrl)}/json/close/${new URL(targetWebSocketDebuggerUrl).pathname.split('/').at(-1)}`, {
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }
}

function markdownReport(report) {
  const lines = [
    '# Browser Resource Verification',
    '',
    `- Pages checked: ${report.pages.length}`,
    `- Settle window per page: ${report.settleMs} ms`,
    '',
    '| Page | Forbidden DOM fragments | Forbidden network requests | HTTP >=400 responses | Loading failures |',
    '| --- | ---: | ---: | ---: | ---: |',
  ];

  for (const page of report.pages) {
    lines.push(`| ${page.url} | ${page.dom.forbidden.length} | ${page.forbiddenRequests.length} | ${page.network.responses.length} | ${page.network.failures.length} |`);
  }

  lines.push('', '## Page Details', '');
  for (const page of report.pages) {
    lines.push(`### ${page.url}`, '');
    lines.push(`- Forbidden DOM fragments: ${page.dom.forbidden.length ? page.dom.forbidden.join(', ') : 'none'}`);
    lines.push(`- Forbidden network requests: ${page.forbiddenRequests.length ? page.forbiddenRequests.join(', ') : 'none'}`);
    lines.push(`- HTTP >=400 responses: ${page.network.responses.length ? page.network.responses.map((item) => `${item.status} ${item.url}`).join('; ') : 'none'}`);
    lines.push(`- Loading failures: ${page.network.failures.length ? page.network.failures.map((item) => item.errorText).join('; ') : 'none'}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.publicDir)) throw new Error(`Generated directory does not exist: ${options.publicDir}`);

  const outputDir = options.outputDir || await fsp.mkdtemp(path.join(DEFAULT_OUTPUT_ROOT, 'run-'));
  await fsp.mkdir(outputDir, { recursive: true });
  const server = await createStaticServer(options.publicDir);
  let chrome;

  try {
    chrome = await startChrome();
    const pages = [];
    for (const page of options.pages) {
      const pathname = page.startsWith('/') ? page : `/${page}`;
      pages.push(await verifyPage(chrome.browserWebSocketDebuggerUrl, `${server.baseUrl}${pathname}`, options.settleMs, server.baseUrl));
    }

    const report = {
      publicDir: options.publicDir,
      baseUrl: server.baseUrl,
      settleMs: options.settleMs,
      forbiddenFragments: FORBIDDEN_FRAGMENTS,
      pages,
      totals: {
        pages: pages.length,
        forbiddenDomFragments: pages.reduce((total, page) => total + page.dom.forbidden.length, 0),
        forbiddenNetworkRequests: pages.reduce((total, page) => total + page.forbiddenRequests.length, 0),
        httpErrorResponses: pages.reduce((total, page) => total + page.network.responses.length, 0),
        loadingFailures: pages.reduce((total, page) => total + page.network.failures.length, 0),
      },
    };

    const jsonPath = path.join(outputDir, 'browser-resource-verification.json');
    const markdownPath = path.join(outputDir, 'browser-resource-verification.md');
    await Promise.all([
      fsp.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
      fsp.writeFile(markdownPath, markdownReport(report)),
    ]);
    console.log(JSON.stringify({ totals: report.totals, reportDirectory: outputDir, jsonReport: jsonPath, markdownReport: markdownPath }, null, 2));
  } finally {
    if (chrome) {
      chrome.child.kill('SIGKILL');
      await new Promise((resolve) => chrome.child.once('exit', resolve));
      await fsp.rm(chrome.profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    }
    await server.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
