#!/usr/bin/env node

/**
 * Local A/B benchmark for the P1 layered starfield refactor.
 *
 * It serves two generated Hexo sites locally, launches isolated headless
 * Chrome instances, and compares observable starfield behavior. Results go to
 * the system temp directory unless --output-dir is provided.
 */

'use strict';

const { createServer } = require('node:http');
const { spawn } = require('node:child_process');
const { mkdtemp, mkdir, readFile, rm, writeFile } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { URL } = require('node:url');
const WebSocket = require('ws');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT = path.join(os.tmpdir(), 'hexo-starfield-benchmarks');
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
].filter(Boolean);
const METRIC_NAMES = [
  'TaskDuration',
  'ScriptDuration',
  'LayoutDuration',
  'RecalcStyleDuration',
  'JSHeapUsedSize',
  'Nodes',
];
const VIEWPORTS = {
  mobile: { name: 'mobile', width: 375, height: 812, deviceScaleFactor: 2, touch: true },
  tablet: { name: 'tablet', width: 1024, height: 900, deviceScaleFactor: 1, touch: false },
  desktop: { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, touch: false },
};

function parseArgs(argv) {
  const options = {
    baselineDir: null,
    currentDir: path.join(ROOT, 'public'),
    outputDir: DEFAULT_OUTPUT,
    runs: 3,
    durationSeconds: 15,
    settleSeconds: 3,
    viewports: ['mobile', 'tablet', 'desktop'],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--baseline-dir') {
      options.baselineDir = path.resolve(value);
      index += 1;
    } else if (argument === '--current-dir') {
      options.currentDir = path.resolve(value);
      index += 1;
    } else if (argument === '--output-dir') {
      options.outputDir = path.resolve(value);
      index += 1;
    } else if (argument === '--runs') {
      options.runs = Number(value);
      index += 1;
    } else if (argument === '--duration-seconds') {
      options.durationSeconds = Number(value);
      index += 1;
    } else if (argument === '--settle-seconds') {
      options.settleSeconds = Number(value);
      index += 1;
    } else if (argument === '--viewports') {
      options.viewports = value.split(',').map((name) => name.trim()).filter(Boolean);
      index += 1;
    } else if (argument === '--help' || argument === '-h') {
      console.log(`Usage:
  node tools/benchmark-starfield.js --baseline-dir <baseline-public-dir> [options]

Options:
  --current-dir <dir>        Current generated directory (default: ./public)
  --output-dir <dir>         Result directory (default: system temp directory)
  --runs <n>                 Repetitions per version / viewport (default: 3)
  --duration-seconds <n>     Visible and offscreen observation window (default: 15)
  --settle-seconds <n>       Wait after navigation (default: 3)
  --viewports <csv>          mobile,tablet,desktop (default: all three)`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.baselineDir) throw new Error('--baseline-dir is required.');
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('--runs must be a positive integer.');
  for (const name of ['durationSeconds', 'settleSeconds']) {
    if (!Number.isFinite(options[name]) || options[name] < 0) throw new Error(`${name} must be non-negative.`);
  }
  options.viewports.forEach((name) => {
    if (!VIEWPORTS[name]) throw new Error(`Unknown viewport "${name}".`);
  });
  return options;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentChange(baseline, current) {
  if (!Number.isFinite(baseline) || !Number.isFinite(current) || baseline === 0) return null;
  return ((current - baseline) / baseline) * 100;
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }[extension] || 'application/octet-stream';
}

async function startStaticServer(directory) {
  if (!existsSync(directory)) throw new Error(`Static directory does not exist: ${directory}`);
  const root = path.resolve(directory);
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      const pathname = decodeURIComponent(requestUrl.pathname);
      const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      let filePath = path.resolve(root, relativePath);
      if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      if (existsSync(filePath) && path.extname(filePath) === '') filePath = path.join(filePath, 'index.html');
      const body = await readFile(filePath);
      response.writeHead(200, { 'cache-control': 'no-store', 'content-type': mimeType(filePath) });
      response.end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    socket.on('message', (message) => {
      const payload = JSON.parse(message.toString());
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(`${pending.method}: ${payload.error.message}`));
        else pending.resolve(payload.result || {});
        return;
      }
      (this.listeners.get(payload.method) || []).forEach((listener) => listener(payload.params || {}));
    });
    socket.on('close', () => {
      this.pending.forEach((pending) => pending.reject(new Error('Chrome DevTools connection closed.')));
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function findAvailablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForChrome(port, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw new Error(`Chrome did not expose DevTools: ${lastError?.message || 'timeout'}`);
}

async function stopChrome(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill('SIGTERM');
  if (!await Promise.race([exited.then(() => true), sleep(5000).then(() => false)])) {
    child.kill('SIGKILL');
    await Promise.race([exited, sleep(5000)]);
  }
}

async function removeDirectoryWhenReady(directory) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await rm(directory, { recursive: true, force: true, maxRetries: 0 });
      return;
    } catch (_) {
      await sleep(250);
    }
  }
}

async function launchChrome() {
  const debugPort = await findAvailablePort();
  const profileDirectory = await mkdtemp(path.join(os.tmpdir(), 'hexo-starfield-chrome-'));
  let lastError;
  for (const chromePath of CHROME_PATHS) {
    if (chromePath.includes('/') && !existsSync(chromePath)) continue;

    let child;
    try {
      child = spawn(chromePath, [
        `--remote-debugging-port=${debugPort}`,
        `--user-data-dir=${profileDirectory}`,
        '--headless=new',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-features=Translate,OptimizationHints,MediaRouter',
        '--remote-allow-origins=*',
        'about:blank',
      ], { stdio: 'ignore' });
      const spawnError = new Promise((_, reject) => child.once('error', reject));
      const version = await Promise.race([waitForChrome(debugPort, 5000), spawnError]);
      return { child, debugPort, profileDirectory, version: version.Browser || 'unknown' };
    } catch (error) {
      lastError = error;
      await stopChrome(child);
    }
  }
  await removeDirectoryWhenReady(profileDirectory);
  throw new Error(`Unable to launch Chrome. ${lastError?.message || ''}`);
}

async function createPage(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Chrome could not create a target: ${response.status}.`);
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  return new CdpClient(socket);
}

const INSTRUMENTATION = `(() => {
  const counters = {
    scriptLoads: {},
    rafRequestsByScript: {},
    rafCallbacksByScript: {},
    canvasFrames: {},
    longTasks: [],
  };
  Object.defineProperty(window, '__starfieldBenchmark', { value: counters, configurable: false });

  const scriptUrl = () => (document.currentScript?.src || new Error().stack || 'unknown')
    .match(/(?:header-universe|universe-optimized)\\.js/)?.[0] || 'other';
  const isStarfieldStack = () => /(header-universe|universe-optimized)\\.js/.test(new Error().stack || '');

  const nativeRequestAnimationFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    const source = scriptUrl();
    if (!isStarfieldStack()) return nativeRequestAnimationFrame.call(this, callback);
    counters.rafRequestsByScript[source] = (counters.rafRequestsByScript[source] || 0) + 1;
    return nativeRequestAnimationFrame.call(this, (timestamp) => {
      counters.rafCallbacksByScript[source] = (counters.rafCallbacksByScript[source] || 0) + 1;
      callback(timestamp);
    });
  };

  const nativeClearRect = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function(...args) {
    const canvas = this.canvas;
    const key = canvas?.id === 'universe'
      ? 'background'
      : canvas?.classList?.contains('universe-header')
        ? 'header'
        : null;
    if (key && isStarfieldStack()) counters.canvasFrames[key] = (counters.canvasFrames[key] || 0) + 1;
    return nativeClearRect.apply(this, args);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('script[src]').forEach((script) => {
      const source = script.src.match(/(?:header-universe|universe-optimized)\\.js/)?.[0];
      if (source) counters.scriptLoads[source] = (counters.scriptLoads[source] || 0) + 1;
    });
  }, { once: true });

  if (window.PerformanceObserver) {
    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => counters.longTasks.push({ duration: entry.duration, startTime: entry.startTime }));
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}
  }
})();`;

async function configurePage(client, viewport, reducedMotion) {
  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Network.enable'),
    client.send('Performance.enable'),
  ]);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: false,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: viewport.touch,
    maxTouchPoints: viewport.touch ? 5 : 1,
  });
  await client.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }],
  });
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: INSTRUMENTATION });
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
}

async function navigate(client, url) {
  await client.send('Page.navigate', { url });
  await sleep(2500);
}

async function evaluate(client, expression, awaitPromise = false) {
  const result = await client.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  return result.result?.value;
}

async function getMetrics(client) {
  const { metrics } = await client.send('Performance.getMetrics');
  return Object.fromEntries(metrics.filter((metric) => METRIC_NAMES.includes(metric.name)).map((metric) => [metric.name, metric.value]));
}

function metricDelta(start, end) {
  return Object.fromEntries(METRIC_NAMES.map((name) => [name, (end[name] || 0) - (start[name] || 0)]));
}

async function getState(client) {
  return evaluate(client, `(() => {
    const header = document.getElementById('page-header');
    const background = document.getElementById('universe');
    const headerCanvas = header?.querySelector('canvas.universe-header');
    const controller = window.__XBXyftxStarfieldController__;
    const computed = headerCanvas ? getComputedStyle(headerCanvas) : null;
    const headerRect = header?.getBoundingClientRect();
    const nav = document.getElementById('nav');
    const title = document.getElementById('site-title') || document.querySelector('#post-info, #page-site-info');
    return {
      controller: controller ? {
        running: controller.running,
        tier: controller.tier,
        particleCounts: {
          background: controller.backgroundStars.length,
          bright: controller.brightStars.length,
          dim: controller.dimStars.length,
          meteors: controller.meteor ? 1 : 0,
        },
      } : null,
      canvasCounts: {
        total: document.querySelectorAll('canvas').length,
        background: background ? 1 : 0,
        header: headerCanvas ? 1 : 0,
      },
      headerCanvas: headerCanvas ? {
        position: computed.position,
        zIndex: computed.zIndex,
        pointerEvents: computed.pointerEvents,
        width: headerCanvas.width,
        height: headerCanvas.height,
      } : null,
      headerInViewport: headerRect ? headerRect.bottom > 0 && headerRect.top < innerHeight : false,
      inputSafety: (() => {
        const pointIsUnblocked = (element) => {
          if (!element) return true;
          const rect = element.getBoundingClientRect();
          const x = Math.min(Math.max(1, rect.left + Math.min(rect.width / 2, 12)), innerWidth - 1);
          const y = Math.min(Math.max(1, rect.top + Math.min(rect.height / 2, 12)), innerHeight - 1);
          const top = document.elementFromPoint(x, y);
          return top !== headerCanvas && !headerCanvas?.contains(top);
        };
        return {
          navClickable: pointIsUnblocked(nav),
          titleClickable: pointIsUnblocked(title),
        };
      })(),
      scripts: Array.from(document.scripts).map((script) => script.src).filter((src) => /(?:header-universe|universe-optimized)\\.js/.test(src)),
    };
  })()`);
}

async function getInstrumentation(client) {
  return evaluate(client, 'JSON.parse(JSON.stringify(window.__starfieldBenchmark || {}))');
}

function subtractCounters(start, end) {
  const subtractObject = (startObject = {}, endObject = {}) => Object.fromEntries([...new Set([...Object.keys(startObject), ...Object.keys(endObject)])]
    .map((key) => [key, (endObject[key] || 0) - (startObject[key] || 0)]));
  const startTasks = start.longTasks || [];
  const endTasks = end.longTasks || [];
  return {
    rafRequestsByScript: subtractObject(start.rafRequestsByScript, end.rafRequestsByScript),
    rafCallbacksByScript: subtractObject(start.rafCallbacksByScript, end.rafCallbacksByScript),
    canvasFrames: subtractObject(start.canvasFrames, end.canvasFrames),
    longTasks: endTasks.slice(startTasks.length),
  };
}

async function observe(client, durationSeconds) {
  const startMetrics = await getMetrics(client);
  const startInstrumentation = await getInstrumentation(client);
  await sleep(durationSeconds * 1000);
  const endMetrics = await getMetrics(client);
  const endInstrumentation = await getInstrumentation(client);
  return {
    metrics: metricDelta(startMetrics, endMetrics),
    instrumentation: subtractCounters(startInstrumentation, endInstrumentation),
  };
}

async function scrollHeaderOffscreen(client) {
  await evaluate(client, 'window.scrollTo(0, Math.min(document.documentElement.scrollHeight - innerHeight, Math.max(innerHeight + 120, document.getElementById(\'page-header\')?.offsetHeight + 120 || 0)))');
  await sleep(400);
}

async function runVersion({ version, url, viewport, options }) {
  const chrome = await launchChrome();
  let client;
  try {
    client = await createPage(chrome.debugPort);
    await configurePage(client, viewport, false);
    await navigate(client, url);
    await sleep(options.settleSeconds * 1000);
    const visibleBefore = await getState(client);
    const visible = await observe(client, options.durationSeconds);
    await scrollHeaderOffscreen(client);
    const offscreenBefore = await getState(client);
    const offscreen = await observe(client, options.durationSeconds);
    const offscreenAfter = await getState(client);
    client.close();
    await stopChrome(chrome.child);
    await removeDirectoryWhenReady(chrome.profileDirectory);
    client = null;

    const reducedChrome = await launchChrome();
    let reducedClient;
    try {
      reducedClient = await createPage(reducedChrome.debugPort);
      await configurePage(reducedClient, viewport, true);
      await navigate(reducedClient, url);
      await sleep(options.settleSeconds * 1000);
      const reducedBefore = await getState(reducedClient);
      const reduced = await observe(reducedClient, options.durationSeconds);
      const reducedAfter = await getState(reducedClient);
      return {
        version,
        viewport: viewport.name,
        chromeVersion: reducedChrome.version,
        visibleBefore,
        visible,
        offscreenBefore,
        offscreen,
        offscreenAfter,
        reducedBefore,
        reduced,
        reducedAfter,
      };
    } finally {
      if (reducedClient) reducedClient.close();
      await stopChrome(reducedChrome.child);
      await removeDirectoryWhenReady(reducedChrome.profileDirectory);
    }
  } finally {
    if (client) client.close();
    await stopChrome(chrome.child);
    await removeDirectoryWhenReady(chrome.profileDirectory);
  }
}

function summarize(results) {
  const groups = {};
  results.forEach((result) => {
    const key = `${result.version}/${result.viewport}`;
    (groups[key] ||= []).push(result);
  });
  return Object.fromEntries(Object.entries(groups).map(([key, samples]) => {
    const medianValue = (selector) => median(samples.map(selector));
    return [key, {
      samples: samples.length,
      visible: {
        taskDurationMs: medianValue((sample) => sample.visible.metrics.TaskDuration * 1000),
        scriptDurationMs: medianValue((sample) => sample.visible.metrics.ScriptDuration * 1000),
        backgroundFrames: medianValue((sample) => sample.visible.instrumentation.canvasFrames.background || 0),
        headerFrames: medianValue((sample) => sample.visible.instrumentation.canvasFrames.header || 0),
        rafCallbacks: medianValue((sample) => Object.values(sample.visible.instrumentation.rafCallbacksByScript).reduce((total, value) => total + value, 0)),
        longTaskCount: medianValue((sample) => sample.visible.instrumentation.longTasks.length),
      },
      offscreen: {
        taskDurationMs: medianValue((sample) => sample.offscreen.metrics.TaskDuration * 1000),
        scriptDurationMs: medianValue((sample) => sample.offscreen.metrics.ScriptDuration * 1000),
        backgroundFrames: medianValue((sample) => sample.offscreen.instrumentation.canvasFrames.background || 0),
        headerFrames: medianValue((sample) => sample.offscreen.instrumentation.canvasFrames.header || 0),
        rafCallbacks: medianValue((sample) => Object.values(sample.offscreen.instrumentation.rafCallbacksByScript).reduce((total, value) => total + value, 0)),
        longTaskCount: medianValue((sample) => sample.offscreen.instrumentation.longTasks.length),
      },
      reduced: {
        backgroundFrames: medianValue((sample) => sample.reduced.instrumentation.canvasFrames.background || 0),
        headerFrames: medianValue((sample) => sample.reduced.instrumentation.canvasFrames.header || 0),
        rafCallbacks: medianValue((sample) => Object.values(sample.reduced.instrumentation.rafCallbacksByScript).reduce((total, value) => total + value, 0)),
      },
    }];
  }));
}

function formatNumber(value) {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '—';
}

function formatMs(value) {
  return Number.isFinite(value) ? value.toFixed(2) : '—';
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : '—';
}

function createReport({ options, chromeVersion, results, summary }) {
  const lines = [
    '# P1 星空动效本地 A/B 测量',
    '',
    '> 自动生成于本地 Headless Chrome。该结果只描述受控静态产物的行为与 Chrome 累计 metrics，不代表生产网络、GPU、温度、风扇或所有设备的体验。',
    '',
    '## 条件',
    '',
    `- Chrome：${chromeVersion}`,
    `- 每版本 / 视口重复：${options.runs} 次，使用中位数。`,
    `- 可见与离开页头观察窗口：${options.durationSeconds}s；导航后稳定等待：${options.settleSeconds}s。`,
    `- 视口：${options.viewports.map((name) => `${name} (${VIEWPORTS[name].width}×${VIEWPORTS[name].height} DPR ${VIEWPORTS[name].deviceScaleFactor})`).join('；')}。`,
    '',
    '## 中位数汇总',
    '',
    '| 版本 / 视口 | 可见：Task(ms) | 可见：Script(ms) | 可见：背景帧 | 可见：顶部帧 | 可见：RAF 回调 | 离屏：背景帧 | 离屏：顶部帧 | 离屏：RAF 回调 | reduced-motion：背景/顶部帧 | reduced-motion：RAF 回调 |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ];
  Object.entries(summary).forEach(([key, data]) => {
    lines.push(`| ${key} | ${formatMs(data.visible.taskDurationMs)} | ${formatMs(data.visible.scriptDurationMs)} | ${formatNumber(data.visible.backgroundFrames)} | ${formatNumber(data.visible.headerFrames)} | ${formatNumber(data.visible.rafCallbacks)} | ${formatNumber(data.offscreen.backgroundFrames)} | ${formatNumber(data.offscreen.headerFrames)} | ${formatNumber(data.offscreen.rafCallbacks)} | ${formatNumber(data.reduced.backgroundFrames)} / ${formatNumber(data.reduced.headerFrames)} | ${formatNumber(data.reduced.rafCallbacks)} |`);
  });

  lines.push('', '## 当前相对基线的可见窗口差异', '', '| 视口 | TaskDuration | ScriptDuration | 背景帧 | 顶部帧 | RAF 回调 |');
  lines.push('|---|---:|---:|---:|---:|---:|');
  options.viewports.forEach((viewport) => {
    const baseline = summary[`baseline/${viewport}`]?.visible;
    const current = summary[`current/${viewport}`]?.visible;
    if (!baseline || !current) return;
    lines.push(`| ${viewport} | ${formatPercent(percentChange(baseline.taskDurationMs, current.taskDurationMs))} | ${formatPercent(percentChange(baseline.scriptDurationMs, current.scriptDurationMs))} | ${formatPercent(percentChange(baseline.backgroundFrames, current.backgroundFrames))} | ${formatPercent(percentChange(baseline.headerFrames, current.headerFrames))} | ${formatPercent(percentChange(baseline.rafCallbacks, current.rafCallbacks))} |`);
  });

  lines.push('', '## 结构与层级断言', '');
  lines.push('| 版本 | 视口 | 星空脚本入口 | 背景 / 顶部 canvas | 当前星体数量（背景 / 高亮 / 低亮） | canvas pointer-events | nav / title 点击可达 |');
  lines.push('|---|---|---|---|---|---|---|');
  results.forEach((result) => {
    const state = result.visibleBefore;
    const counts = state.controller?.particleCounts || {};
    lines.push(`| ${result.version} | ${result.viewport} | ${state.scripts.map((src) => path.basename(src)).join(', ') || '无'} | ${state.canvasCounts.background} / ${state.canvasCounts.header} | ${counts.background ?? '—'} / ${counts.bright ?? '—'} / ${counts.dim ?? '—'} | ${state.headerCanvas?.pointerEvents || '—'} | ${state.inputSafety?.navClickable ? '通过' : '失败'} / ${state.inputSafety?.titleClickable ? '通过' : '失败'} |`);
  });

  lines.push('', '## 解读边界', '', '- `clearRect` 次数代表该 canvas 在窗口内的整帧清除；不是 GPU 耗时，也不等同于实际显示帧率。', '- 基线与当前页面均含其他首页脚本，因此 `TaskDuration` 和 `ScriptDuration` 只能作为同环境 A/B 辅助指标。', '- `prefers-reduced-motion` 验收要求是测试窗口内没有持续 RAF 或 canvas 清屏；首次静态绘制不计为持续动画。', '- Headless Chrome 不可替代有头浏览器下的实际视觉、GPU 合成、风扇、温度、触摸和生产网络验收。', '');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.outputDir, { recursive: true });
  const [baselineServer, currentServer] = await Promise.all([
    startStaticServer(options.baselineDir),
    startStaticServer(options.currentDir),
  ]);
  const resultDirectory = await mkdtemp(path.join(options.outputDir, 'run-'));
  const results = [];
  try {
    for (const viewportName of options.viewports) {
      const viewport = VIEWPORTS[viewportName];
      for (let run = 1; run <= options.runs; run += 1) {
        process.stdout.write(`[${viewportName}] baseline ${run}/${options.runs}\n`);
        results.push(await runVersion({ version: 'baseline', url: baselineServer.url, viewport, options }));
        process.stdout.write(`[${viewportName}] current ${run}/${options.runs}\n`);
        results.push(await runVersion({ version: 'current', url: currentServer.url, viewport, options }));
      }
    }
    const summary = summarize(results);
    const chromeVersion = results[0]?.chromeVersion || 'unknown';
    const rawFile = path.join(resultDirectory, 'raw-results.json');
    const reportFile = path.join(resultDirectory, 'report.md');
    await writeFile(rawFile, `${JSON.stringify({ options, results, summary }, null, 2)}\n`);
    await writeFile(reportFile, createReport({ options, chromeVersion, results, summary }));
    console.log(`Results: ${resultDirectory}`);
    console.log(`Report: ${reportFile}`);
  } finally {
    await Promise.all([baselineServer.close(), currentServer.close()]);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
