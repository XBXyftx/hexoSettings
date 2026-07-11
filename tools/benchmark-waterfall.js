#!/usr/bin/env node

/**
 * Local A/B benchmark for the homepage waterfall implementation.
 *
 * It serves two already-generated Hexo public directories on separate local
 * ports and records Chrome DevTools Protocol metrics for each version.
 * Nothing is deployed, committed, or written into either public directory.
 *
 * Example:
 *   node tools/benchmark-waterfall.js \
 *     --baseline-dir /tmp/hexo-waterfall-baseline/public \
 *     --current-dir public \
 *     --runs 3 --idle-seconds 60 --scroll-seconds 30 --trace
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
const DEFAULT_OUTPUT = path.join(os.tmpdir(), 'hexo-waterfall-benchmarks');
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
  'LayoutCount',
  'RecalcStyleCount',
  'JSHeapUsedSize',
  'Nodes',
];

const VIEWPORTS = {
  mobile: { name: 'mobile', width: 375, height: 812, deviceScaleFactor: 2, mobile: false, touch: true, expectedColumns: 1 },
  tablet: { name: 'tablet', width: 1024, height: 900, deviceScaleFactor: 1, mobile: false, touch: false, expectedColumns: 2 },
  desktop: { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, mobile: false, touch: false, expectedColumns: 3 },
};

function parseArgs(argv) {
  const options = {
    baselineDir: null,
    currentDir: path.join(ROOT, 'public'),
    outputDir: DEFAULT_OUTPUT,
    runs: 3,
    idleSeconds: 60,
    scrollSeconds: 30,
    settleSeconds: 5,
    viewports: ['mobile', 'tablet', 'desktop'],
    trace: false,
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
    } else if (argument === '--idle-seconds') {
      options.idleSeconds = Number(value);
      index += 1;
    } else if (argument === '--scroll-seconds') {
      options.scrollSeconds = Number(value);
      index += 1;
    } else if (argument === '--settle-seconds') {
      options.settleSeconds = Number(value);
      index += 1;
    } else if (argument === '--viewports') {
      options.viewports = value.split(',').map((name) => name.trim()).filter(Boolean);
      index += 1;
    } else if (argument === '--trace') {
      options.trace = true;
    } else if (argument === '--help' || argument === '-h') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.baselineDir) {
    throw new Error('--baseline-dir is required. Generate the baseline public directory from commit 69772c8 first.');
  }

  for (const [name, value] of Object.entries({
    runs: options.runs,
    idleSeconds: options.idleSeconds,
    scrollSeconds: options.scrollSeconds,
    settleSeconds: options.settleSeconds,
  })) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative number.`);
    }
  }

  if (!Number.isInteger(options.runs) || options.runs < 1) {
    throw new Error('runs must be a positive integer.');
  }

  for (const name of options.viewports) {
    if (!VIEWPORTS[name]) {
      throw new Error(`Unknown viewport "${name}". Use: ${Object.keys(VIEWPORTS).join(', ')}.`);
    }
  }

  return options;
}

function printUsage() {
  console.log(`Usage:
  node tools/benchmark-waterfall.js --baseline-dir <baseline-public-dir> [options]

Options:
  --current-dir <dir>       Current generated directory (default: ./public)
  --output-dir <dir>        Result directory (default: system temp directory)
  --runs <n>                Repetitions for every version/viewport (default: 3)
  --idle-seconds <n>        Idle duration per run (default: 60)
  --scroll-seconds <n>      Programmatic scroll duration per run (default: 30)
  --settle-seconds <n>      Wait after load before sampling (default: 5)
  --viewports <csv>         mobile,tablet,desktop (default: all three)
  --trace                   Save Chrome trace JSON for every run

This tool only serves local files and launches a temporary Chrome profile.`);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function stopChrome(child) {
  if (!child || child.exitCode !== null || child.killed) return;

  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill('SIGTERM');
  const stopped = await Promise.race([
    exited.then(() => true),
    sleep(5000).then(() => false),
  ]);

  if (!stopped && child.exitCode === null) {
    child.kill('SIGKILL');
    await Promise.race([exited, sleep(5000)]);
  }
}

async function removeDirectoryWhenReady(directory) {
  let lastError;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await rm(directory, { recursive: true, force: true, maxRetries: 0 });
      return;
    } catch (error) {
      lastError = error;
      await sleep(250);
    }
  }

  throw lastError;
}

function median(values) {
  const numbers = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (numbers.length === 0) return null;
  const middle = Math.floor(numbers.length / 2);
  return numbers.length % 2 === 0
    ? (numbers[middle - 1] + numbers[middle]) / 2
    : numbers[middle];
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
    '.mjs': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }[extension] || 'application/octet-stream';
}

async function startStaticServer(directory) {
  if (!existsSync(directory)) {
    throw new Error(`Static directory does not exist: ${directory}`);
  }

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

      if (existsSync(filePath) && path.extname(filePath) === '') {
        filePath = path.join(filePath, 'index.html');
      }

      const body = await readFile(filePath);
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': mimeType(filePath),
      });
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
    server,
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
        if (payload.error) {
          pending.reject(new Error(`${pending.method}: ${payload.error.message}`));
        } else {
          pending.resolve(payload.result || {});
        }
        return;
      }

      const listeners = this.listeners.get(payload.method) || [];
      listeners.forEach((listener) => listener(payload.params || {}));
    });

    socket.on('close', () => {
      for (const pending of this.pending.values()) {
        pending.reject(new Error('Chrome DevTools connection closed.'));
      }
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

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
    return () => this.off(method, listener);
  }

  off(method, listener) {
    const listeners = this.listeners.get(method) || [];
    this.listeners.set(method, listeners.filter((item) => item !== listener));
  }

  once(method, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        remove();
        reject(new Error(`Timed out waiting for ${method}.`));
      }, timeoutMs);
      const remove = this.on(method, (params) => {
        clearTimeout(timer);
        remove();
        resolve(params);
      });
    });
  }

  close() {
    this.socket.close();
  }
}

async function waitForChrome(port, timeoutMs = 20000) {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }

  throw new Error(`Chrome did not expose DevTools on port ${port}: ${lastError?.message || 'timeout'}`);
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

async function launchChrome() {
  const debugPort = await findAvailablePort();
  const profileDirectory = await mkdtemp(path.join(os.tmpdir(), 'hexo-waterfall-chrome-'));
  let child;
  let lastError;

  for (const chromePath of CHROME_PATHS) {
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

      const version = await waitForChrome(debugPort, 5000);
      return { child, debugPort, profileDirectory, version: version.Browser || 'unknown' };
    } catch (error) {
      lastError = error;
      await stopChrome(child);
      child = null;
    }
  }

  await removeDirectoryWhenReady(profileDirectory);
  throw new Error(`Unable to launch Chrome. Set CHROME_PATH if needed. ${lastError?.message || ''}`);
}

async function createPage(debugPort) {
  const endpoint = `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent('about:blank')}`;
  const response = await fetch(endpoint, { method: 'PUT' });
  if (!response.ok) throw new Error(`Chrome could not create a page target: ${response.status}.`);
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
    createdAt: performance.now(),
    waterfallIntervalsCreated: 0,
    waterfallIntervalTicks: 0,
    waterfallMutationObserversCreated: 0,
    waterfallCssTextWrites: 0,
    waterfallListeners: {},
    waterfallConsoleCalls: 0,
    longTasks: [],
  };
  Object.defineProperty(window, '__waterfallBenchmark', { value: counters, configurable: false });

  const isWaterfallStack = () => (new Error().stack || '').includes('waterfall.js');

  const nativeSetInterval = window.setInterval;
  window.setInterval = function(callback, delay, ...args) {
    if (!isWaterfallStack()) return nativeSetInterval.call(this, callback, delay, ...args);
    counters.waterfallIntervalsCreated += 1;
    return nativeSetInterval.call(this, (...callbackArgs) => {
      counters.waterfallIntervalTicks += 1;
      return typeof callback === 'function'
        ? callback.apply(this, callbackArgs)
        : Function(callback)();
    }, delay, ...args);
  };

  const NativeMutationObserver = window.MutationObserver;
  if (NativeMutationObserver) {
    function InstrumentedMutationObserver(callback) {
      if (isWaterfallStack()) counters.waterfallMutationObserversCreated += 1;
      return new NativeMutationObserver(callback);
    }
    InstrumentedMutationObserver.prototype = NativeMutationObserver.prototype;
    window.MutationObserver = InstrumentedMutationObserver;
  }

  const styleDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
  if (styleDescriptor && styleDescriptor.get && styleDescriptor.set) {
    Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
      configurable: true,
      enumerable: styleDescriptor.enumerable,
      get: styleDescriptor.get,
      set(value) {
        if (isWaterfallStack()) counters.waterfallCssTextWrites += 1;
        return styleDescriptor.set.call(this, value);
      },
    });
  }

  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (isWaterfallStack()) {
      counters.waterfallListeners[type] = (counters.waterfallListeners[type] || 0) + 1;
    }
    return nativeAddEventListener.call(this, type, listener, options);
  };

  const nativeConsole = window.console;
  ['log', 'warn', 'error', 'info', 'debug'].forEach((method) => {
    const original = nativeConsole[method];
    nativeConsole[method] = function(...args) {
      if (isWaterfallStack()) counters.waterfallConsoleCalls += 1;
      return original.apply(this, args);
    };
  });

  if (window.PerformanceObserver) {
    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => counters.longTasks.push({
          duration: entry.duration,
          startTime: entry.startTime,
        }));
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}
  }
})();`;

async function configurePage(client, viewport) {
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
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: viewport.touch,
    maxTouchPoints: viewport.touch ? 5 : 1,
  });
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: INSTRUMENTATION });
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
}

async function navigate(client, url) {
  const loadEvent = client.once('Page.loadEventFired', 45000);
  await client.send('Page.navigate', { url });
  try {
    await loadEvent;
  } catch (error) {
    // A third-party resource can hold up load even though the local page is usable.
    console.warn(`  Load event warning: ${error.message}`);
  }
}

function metricsToObject(metrics) {
  const output = {};
  for (const metric of metrics) {
    if (METRIC_NAMES.includes(metric.name)) output[metric.name] = metric.value;
  }
  return output;
}

function metricDelta(start, end) {
  const output = {};
  for (const name of METRIC_NAMES) {
    if (name === 'JSHeapUsedSize' || name === 'Nodes') {
      output[name] = (end[name] ?? 0) - (start[name] ?? 0);
    } else {
      output[name] = (end[name] ?? 0) - (start[name] ?? 0);
    }
  }
  return output;
}

async function getMetrics(client) {
  const { metrics } = await client.send('Performance.getMetrics');
  return metricsToObject(metrics);
}

async function evaluate(client, expression, awaitPromise = false) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  }
  return result.result?.value;
}

async function getLayoutState(client, expectedColumns) {
  return evaluate(client, `(() => {
    const container = document.querySelector('#recent-posts.waterfall-masonry .waterfall-container');
    const items = Array.from(container?.querySelectorAll('.waterfall-item') || []);
    const rects = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        position: getComputedStyle(item).position,
      };
    });
    const xs = [...new Set(rects.map((rect) => rect.x))];
    const overlaps = rects.some((first, index) => rects.slice(index + 1).some((second) =>
      first.x < second.x + second.width && first.x + first.width > second.x &&
      first.y < second.y + second.height && first.y + first.height > second.y
    ));
    const pagination = document.querySelector('#pagination');
    const containerRect = container?.getBoundingClientRect();
    const paginationRect = pagination?.getBoundingClientRect();
    const positions = [...new Set(rects.map((rect) => rect.position))];
    const viewport = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      mobileMediaQuery: window.matchMedia('(max-width: 768px)').matches,
    };
    return {
      cardCount: items.length,
      imageCount: container ? container.querySelectorAll('img').length : 0,
      columnCount: xs.length,
      expectedColumns: ${expectedColumns},
      positions,
      hasOverlap: overlaps,
      paginationBelowContainer: !paginationRect || !containerRect || paginationRect.top >= containerRect.bottom,
      viewport,
    };
  })()`);
}

async function getInstrumentation(client) {
  return evaluate(client, 'JSON.parse(JSON.stringify(window.__waterfallBenchmark || {}))');
}

function instrumentationDelta(start, end) {
  const startTasks = start.longTasks || [];
  const endTasks = end.longTasks || [];
  const longTasks = endTasks.slice(startTasks.length);
  const listenerTypes = new Set([
    ...Object.keys(start.waterfallListeners || {}),
    ...Object.keys(end.waterfallListeners || {}),
  ]);

  return {
    waterfallIntervalsCreated: (end.waterfallIntervalsCreated || 0) - (start.waterfallIntervalsCreated || 0),
    waterfallIntervalTicks: (end.waterfallIntervalTicks || 0) - (start.waterfallIntervalTicks || 0),
    waterfallMutationObserversCreated: (end.waterfallMutationObserversCreated || 0) - (start.waterfallMutationObserversCreated || 0),
    waterfallCssTextWrites: (end.waterfallCssTextWrites || 0) - (start.waterfallCssTextWrites || 0),
    waterfallConsoleCalls: (end.waterfallConsoleCalls || 0) - (start.waterfallConsoleCalls || 0),
    waterfallListeners: Object.fromEntries([...listenerTypes].map((type) => [
      type,
      (end.waterfallListeners?.[type] || 0) - (start.waterfallListeners?.[type] || 0),
    ])),
    longTasks,
  };
}

async function scrollFor(client, durationSeconds) {
  if (durationSeconds === 0) return;
  await evaluate(client, `new Promise((resolve) => {
    const duration = ${Math.round(durationSeconds * 1000)};
    const started = performance.now();
    const speed = 1200;
    const step = (now) => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (max > 0) {
        const distance = ((now - started) / 1000) * speed;
        const period = max * 2;
        const phase = period ? distance % period : 0;
        window.scrollTo(0, phase <= max ? phase : period - phase);
      }
      if (now - started < duration) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  })`, true);
}

async function startTrace(client) {
  const traceEvents = [];
  const remove = client.on('Tracing.dataCollected', ({ value }) => traceEvents.push(...value));
  await client.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing',
    options: 'record-as-much-as-possible',
    transferMode: 'ReportEvents',
  });
  return async () => {
    const complete = client.once('Tracing.tracingComplete', 60000);
    await client.send('Tracing.end');
    await complete;
    remove();
    return traceEvents;
  };
}

async function benchmarkScenario(client, scenario, durationSeconds, saveTrace) {
  const startMetrics = await getMetrics(client);
  const startInstrumentation = await getInstrumentation(client);
  const stopTrace = saveTrace ? await startTrace(client) : null;

  if (scenario === 'idle') {
    await sleep(durationSeconds * 1000);
  } else {
    await scrollFor(client, durationSeconds);
  }

  const endMetrics = await getMetrics(client);
  const endInstrumentation = await getInstrumentation(client);
  const trace = stopTrace ? await stopTrace() : null;
  return {
    scenario,
    durationSeconds,
    metrics: metricDelta(startMetrics, endMetrics),
    instrumentation: instrumentationDelta(startInstrumentation, endInstrumentation),
    trace,
  };
}

function summarize(results) {
  const grouped = {};
  for (const item of results) {
    const key = `${item.version}/${item.viewport}/${item.scenario}`;
    grouped[key] ||= [];
    grouped[key].push(item);
  }

  const output = {};
  for (const [key, samples] of Object.entries(grouped)) {
    output[key] = {
      samples: samples.length,
      metrics: Object.fromEntries(METRIC_NAMES.map((name) => [
        name,
        median(samples.map((sample) => sample.metrics[name])),
      ])),
      instrumentation: {
        waterfallIntervalsCreated: median(samples.map((sample) => sample.instrumentation.waterfallIntervalsCreated)),
        waterfallIntervalTicks: median(samples.map((sample) => sample.instrumentation.waterfallIntervalTicks)),
        waterfallMutationObserversCreated: median(samples.map((sample) => sample.instrumentation.waterfallMutationObserversCreated)),
        waterfallCssTextWrites: median(samples.map((sample) => sample.instrumentation.waterfallCssTextWrites)),
        waterfallConsoleCalls: median(samples.map((sample) => sample.instrumentation.waterfallConsoleCalls)),
        longTaskCount: median(samples.map((sample) => sample.instrumentation.longTasks?.length || 0)),
        longTaskDurationMs: median(samples.map((sample) => (sample.instrumentation.longTasks || [])
          .reduce((total, task) => total + task.duration, 0))),
      },
    };
  }
  return output;
}

function createMarkdownReport({ options, chromeVersion, results, summary }) {
  const lines = [
    '# 首页瀑布流本地 A/B 性能结果',
    '',
    '> 本报告由 `tools/benchmark-waterfall.js` 自动生成。它比较两个本地静态产物；不代表生产 CDN、服务器响应、真实设备温度或所有访问者的结果。',
    '',
    '## 测试条件',
    '',
    `- Chrome：${chromeVersion}`,
    `- 重复次数：每个版本 / 视口 ${options.runs} 次，汇总使用中位数。`,
    `- 空闲：${options.idleSeconds}s；滚动：${options.scrollSeconds}s；加载后稳定等待：${options.settleSeconds}s。`,
    `- 视口：${options.viewports.map((name) => `${name} (${VIEWPORTS[name].width}×${VIEWPORTS[name].height})`).join('；')}`,
    '- 缓存：Chrome cache disabled；每次运行使用临时浏览器 profile。',
    '',
    '## 汇总（中位数）',
    '',
    '| 版本 / 视口 / 场景 | TaskDuration (ms) | Script (ms) | Layout (ms) | Recalc Style (ms) | Layout count | 瀑布流 interval ticks | cssText writes | MutationObserver | long task count |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ];

  for (const [key, data] of Object.entries(summary)) {
    const metric = data.metrics;
    const instrumentation = data.instrumentation;
    lines.push(`| ${key} | ${formatMs(metric.TaskDuration)} | ${formatMs(metric.ScriptDuration)} | ${formatMs(metric.LayoutDuration)} | ${formatMs(metric.RecalcStyleDuration)} | ${formatNumber(metric.LayoutCount)} | ${formatNumber(instrumentation.waterfallIntervalTicks)} | ${formatNumber(instrumentation.waterfallCssTextWrites)} | ${formatNumber(instrumentation.waterfallMutationObserversCreated)} | ${formatNumber(instrumentation.longTaskCount)} |`);
  }

  lines.push('', '## 同场景版本差异（当前相对基线）', '');
  lines.push('| 视口 / 场景 | TaskDuration | ScriptDuration | LayoutDuration | RecalcStyleDuration | 说明 |');
  lines.push('|---|---:|---:|---:|---:|---|');

  for (const viewport of options.viewports) {
    for (const scenario of ['idle', 'scroll']) {
      const baseline = summary[`baseline/${viewport}/${scenario}`];
      const current = summary[`current/${viewport}/${scenario}`];
      if (!baseline || !current) continue;
      lines.push(`| ${viewport} / ${scenario} | ${formatPercent(percentChange(baseline.metrics.TaskDuration, current.metrics.TaskDuration))} | ${formatPercent(percentChange(baseline.metrics.ScriptDuration, current.metrics.ScriptDuration))} | ${formatPercent(percentChange(baseline.metrics.LayoutDuration, current.metrics.LayoutDuration))} | ${formatPercent(percentChange(baseline.metrics.RecalcStyleDuration, current.metrics.RecalcStyleDuration))} | 负值代表当前本地测量更低；零或极小样本请结合 trace 判断。 |`);
    }
  }

  lines.push('', '## 布局断言', '');
  lines.push('| 版本 | 视口 | 卡片 | 列数 / 期望 | 重叠 | 分页在卡片后 | 定位方式 |');
  lines.push('|---|---|---:|---:|---|---|---|');
  for (const item of results.filter((result) => result.layout)) {
    const layout = item.layout;
    lines.push(`| ${item.version} | ${item.viewport} | ${layout.cardCount} | ${layout.columnCount} / ${VIEWPORTS[item.viewport].expectedColumns} | ${layout.hasOverlap ? '是' : '否'} | ${layout.paginationBelowContainer ? '是' : '否'} | ${layout.positions.join(', ')} |`);
  }

  lines.push('', '## 解读边界', '', '- `TaskDuration`、`ScriptDuration`、`LayoutDuration` 与 `RecalcStyleDuration` 是 Chrome 累计 metric 在测试区间内的增量。它们包含该页面其他相同任务；只有 A/B 差异可用来估计瀑布流实现影响。', '- `interval ticks`、`cssText writes` 和 `MutationObserver` 由页面加载前的轻量监测器统计，专门匹配来自 `waterfall.js` 的调用。', '- headless Chrome 不适合对风扇、温度、GPU 合成负荷或真实触摸滚动做最终结论。请按 `MEASUREMENT-PLAN.md` 在受影响设备的有头 Chrome DevTools 中复测。', '');

  return `${lines.join('\n')}\n`;
}

function formatMs(value) {
  return Number.isFinite(value) ? (value * 1000).toFixed(2) : '—';
}

function formatNumber(value) {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '—';
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : '—';
}

async function runVersion({ version, url, viewport, options, outputDirectory }) {
  const chrome = await launchChrome();
  let client;

  try {
    client = await createPage(chrome.debugPort);
    await configurePage(client, viewport);
    await navigate(client, url);
    await sleep(options.settleSeconds * 1000);

    const layout = await getLayoutState(client, viewport.expectedColumns);
    const idle = await benchmarkScenario(client, 'idle', options.idleSeconds, options.trace);
    const scroll = await benchmarkScenario(client, 'scroll', options.scrollSeconds, options.trace);

    for (const scenario of [idle, scroll]) {
      if (scenario.trace) {
        const traceFile = path.join(outputDirectory, `${version}-${viewport.name}-${scenario.scenario}.trace.json`);
        await writeFile(traceFile, JSON.stringify({ traceEvents: scenario.trace }));
        scenario.traceFile = traceFile;
        delete scenario.trace;
      }
    }

    return [
      { version, viewport: viewport.name, layout, chromeVersion: chrome.version, ...idle },
      { version, viewport: viewport.name, layout, chromeVersion: chrome.version, ...scroll },
    ];
  } finally {
    if (client) client.close();
    await stopChrome(chrome.child);
    await removeDirectoryWhenReady(chrome.profileDirectory);
  }
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
  let chromeVersion = 'unknown';

  console.log(`Baseline: ${baselineServer.url} (${options.baselineDir})`);
  console.log(`Current:  ${currentServer.url} (${options.currentDir})`);
  console.log(`Results:  ${resultDirectory}`);

  try {
    for (const viewportName of options.viewports) {
      const viewport = VIEWPORTS[viewportName];
      for (const version of [
        { name: 'baseline', url: baselineServer.url },
        { name: 'current', url: currentServer.url },
      ]) {
        for (let run = 1; run <= options.runs; run += 1) {
          console.log(`Running ${version.name} / ${viewport.name} / ${run}/${options.runs}…`);
          const runResults = await runVersion({
            version: version.name,
            url: version.url,
            viewport,
            options,
            outputDirectory: resultDirectory,
          });
          chromeVersion = runResults[0].chromeVersion;
          runResults.forEach((result) => { result.run = run; });
          results.push(...runResults);
        }
      }
    }
  } finally {
    await Promise.all([baselineServer.close(), currentServer.close()]);
  }

  const summary = summarize(results);
  const report = createMarkdownReport({ options, chromeVersion, results, summary });
  const rawFile = path.join(resultDirectory, 'raw-results.json');
  const reportFile = path.join(resultDirectory, 'report.md');

  await writeFile(rawFile, JSON.stringify({ options, chromeVersion, results, summary }, null, 2));
  await writeFile(reportFile, report);
  console.log(`\nCompleted. Read ${reportFile}`);
}

main().catch((error) => {
  console.error(`Benchmark failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
