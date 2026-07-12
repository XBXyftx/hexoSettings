#!/usr/bin/env node

/**
 * Verify TOC navigation remains anchored while delayed article media settles.
 *
 * The verifier serves a generated site locally, opens a selected article in an
 * isolated Headless Chrome instance, delays image responses, clicks a far TOC
 * item, then reports the target heading's final offset. All output stays in
 * the system temporary directory by default.
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
const DEFAULT_OUTPUT_ROOT = path.join(os.tmpdir(), 'hexo-toc-navigation-verification');
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
].filter(Boolean);

function parseArgs(argv) {
  const options = {
    publicDir: path.join(ROOT, 'public'),
    outputDir: null,
    page: '/2025/06/29/OpenSourceSummer2025/',
    target: null,
    width: 1440,
    height: 900,
    imageDelayMs: 700,
    layoutShiftPx: 240,
    shiftDelayMs: 700,
    settleMs: 4200,
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
    } else if (argument === '--page') {
      options.page = value;
      index += 1;
    } else if (argument === '--target') {
      options.target = value;
      index += 1;
    } else if (argument === '--width') {
      options.width = Number(value);
      index += 1;
    } else if (argument === '--height') {
      options.height = Number(value);
      index += 1;
    } else if (argument === '--image-delay-ms') {
      options.imageDelayMs = Number(value);
      index += 1;
    } else if (argument === '--layout-shift-px') {
      options.layoutShiftPx = Number(value);
      index += 1;
    } else if (argument === '--shift-delay-ms') {
      options.shiftDelayMs = Number(value);
      index += 1;
    } else if (argument === '--settle-ms') {
      options.settleMs = Number(value);
      index += 1;
    } else if (argument === '--help' || argument === '-h') {
      console.log('Usage: node tools/verify-toc-navigation.js [--page /path/] [--target heading-id] [--width 1440] [--height 900] [--image-delay-ms 700] [--layout-shift-px 240] [--shift-delay-ms 700] [--settle-ms 4200]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  for (const key of ['width', 'height', 'imageDelayMs', 'layoutShiftPx', 'shiftDelayMs', 'settleMs']) {
    if (!Number.isInteger(options[key]) || options[key] < 0) throw new Error(`${key} must be a non-negative integer`);
  }

  return options;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
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
      response.writeHead(200, { 'cache-control': 'no-store', 'content-type': mimeType(target) });
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
  return { baseUrl: `http://127.0.0.1:${address.port}`, close: () => new Promise(resolve => server.close(resolve)) };
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
  const profileDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'hexo-toc-browser-profile-'));
  const port = 9500 + Math.floor(Math.random() * 300);
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
      return { child, profileDir, browserWebSocketDebuggerUrl: version.webSocketDebuggerUrl };
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

  socket.on('message', raw => {
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

  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId;
    nextId += 1;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  return { opened, command, events, close: () => new Promise(resolve => { socket.once('close', resolve); socket.close(); }) };
}

async function createPageTarget(browserWebSocketDebuggerUrl) {
  const browser = createCdpClient(browserWebSocketDebuggerUrl);
  await browser.opened;
  const { targetId } = await browser.command('Target.createTarget', { url: 'about:blank' });
  await browser.close();

  const browserUrl = new URL(browserWebSocketDebuggerUrl);
  const targets = await fetch(`http://127.0.0.1:${browserUrl.port}/json/list`, { signal: AbortSignal.timeout(5000) }).then(response => response.json());
  const target = targets.find(item => item.id === targetId);
  if (!target?.webSocketDebuggerUrl) throw new Error(`Unable to resolve DevTools WebSocket for target ${targetId}`);
  return target.webSocketDebuggerUrl;
}

async function waitForLoad(page) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline && !page.events.some(event => event.method === 'Page.loadEventFired')) {
    await sleep(50);
  }
}

async function evaluate(page, expression) {
  const result = await page.command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  return result.result.value;
}

function pageProbe(targetId) {
  return `(() => {
    const heading = document.getElementById(${JSON.stringify(targetId)});
    const header = document.getElementById('page-header');
    const expectedOffset = Math.max(header?.classList.contains('nav-fixed') ? 70 : 0, window.innerWidth <= 768 ? 70 : 90);
    return {
      headingExists: Boolean(heading),
      targetTop: heading ? heading.getBoundingClientRect().top : null,
      expectedOffset,
      error: heading ? heading.getBoundingClientRect().top - expectedOffset : null,
      scrollY: window.scrollY,
      lazyState: window.articleImageLazyLoad?.getState?.() || null,
      dynamicPlaceholders: document.querySelectorAll('#article-container .lazy-placeholder-active').length,
      totalPlaceholders: document.querySelectorAll('#article-container .lazy-placeholder').length,
    };
  })()`;
}

async function runVerification(options, server, chrome) {
  const pageWebSocketDebuggerUrl = await createPageTarget(chrome.browserWebSocketDebuggerUrl);
  const page = createCdpClient(pageWebSocketDebuggerUrl);
  await page.opened;
  await page.command('Network.enable');
  await page.command('Page.enable');
  await page.command('Runtime.enable');
  await page.command('Network.setCacheDisabled', { cacheDisabled: true });
  await page.command('Emulation.setDeviceMetricsOverride', { width: options.width, height: options.height, deviceScaleFactor: 1, mobile: options.width <= 768 });

  try {
    await page.command('Network.setBlockedURLs', { urls: [] });
    await page.command('Page.navigate', { url: `${server.baseUrl}${options.page.startsWith('/') ? options.page : `/${options.page}`}` });
    await waitForLoad(page);
    await sleep(300);

    const targetId = options.target || await evaluate(page, `(() => {
      const links = [...document.querySelectorAll('.toc-link')];
      const candidate = links.find(link => {
        const id = decodeURIComponent(link.getAttribute('href') || '').replace(/^#/, '');
        const heading = document.getElementById(id);
        return heading && heading.getBoundingClientRect().top > window.innerHeight * 2;
      });
      return candidate ? decodeURIComponent(candidate.getAttribute('href')).replace(/^#/, '') : null;
    })()`);
    if (!targetId) throw new Error('No far TOC target was found; provide --target explicitly');

    await page.command('Fetch.enable', { patterns: [{ urlPattern: `${server.baseUrl}/*`, resourceType: 'Image', requestStage: 'Request' }] });
    const fetchHandler = setInterval(() => {
      const pending = page.events.filter(event => event.method === 'Fetch.requestPaused' && !event.handled);
      pending.forEach(event => {
        event.handled = true;
        setTimeout(() => page.command('Fetch.continueRequest', { requestId: event.params.requestId }).catch(() => {}), options.imageDelayMs);
      });
    }, 20);

    const before = await evaluate(page, pageProbe(targetId));
    const injectedShift = await evaluate(page, `(() => {
      const heading = document.getElementById(${JSON.stringify(targetId)});
      const article = document.getElementById('article-container');
      if (!heading || !article || ${options.layoutShiftPx} === 0) return false;
      const spacer = document.createElement('div');
      spacer.id = 'toc-verification-layout-shift';
      spacer.style.cssText = 'height: 0; overflow: hidden; pointer-events: none;';
      heading.parentNode.insertBefore(spacer, heading);
      window.setTimeout(() => { spacer.style.height = '${options.layoutShiftPx}px'; }, ${options.shiftDelayMs});
      return true;
    })()`);
    const clicked = await evaluate(page, `(() => {
      const link = [...document.querySelectorAll('.toc-link')].find(item => decodeURIComponent(item.getAttribute('href') || '').replace(/^#/, '') === ${JSON.stringify(targetId)});
      if (!link) return false;
      link.click();
      return true;
    })()`);
    if (!clicked) throw new Error(`TOC link for target ${targetId} was not found`);

    await sleep(options.settleMs);
    clearInterval(fetchHandler);
    await page.command('Fetch.disable').catch(() => {});
    const after = await evaluate(page, pageProbe(targetId));
    return { targetId, injectedShift, before, after, absoluteError: Math.abs(after.error) };
  } finally {
    await page.close();
  }
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
    const result = await runVerification(options, server, chrome);
    const report = {
      options: { ...options, publicDir: options.publicDir },
      pass: result.absoluteError <= 3,
      result,
    };
    const jsonPath = path.join(outputDir, 'toc-navigation.json');
    const markdownPath = path.join(outputDir, 'toc-navigation.md');
    await Promise.all([
      fsp.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
      fsp.writeFile(markdownPath, `# TOC Navigation Verification\n\n- Target: \`${result.targetId}\`\n- Final offset error: ${result.absoluteError.toFixed(2)} px\n- Pass (≤3 px): ${report.pass ? 'yes' : 'no'}\n`),
    ]);
    console.log(JSON.stringify({ pass: report.pass, result, reportDirectory: outputDir, jsonReport: jsonPath, markdownReport: markdownPath }, null, 2));
    if (!report.pass) process.exitCode = 1;
  } finally {
    if (chrome) {
      chrome.child.kill('SIGKILL');
      await new Promise(resolve => chrome.child.once('exit', resolve));
      await fsp.rm(chrome.profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    }
    await server.close();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
