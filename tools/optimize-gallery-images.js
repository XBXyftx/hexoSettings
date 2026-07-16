#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { imageSize } = require('image-size');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_INPUT = path.join(ROOT, 'source', 'swiper', 'images');
const DEFAULT_PREVIEW = path.join(ROOT, '.gallery-optimization-preview');

function usage() {
  console.log(`
Usage: node tools/optimize-gallery-images.js [options]

Options:
  --quality <1-100>       WebP quality (default: 76)
  --max-edge <pixels>     Downscale the longest edge (default: 2560)
  --method <0-6>          cwebp compression method (default: 6)
  --input <directory>     Gallery directory
  --preview-dir <dir>     Non-destructive output directory
  --reencode-webp         Re-encode existing WebP files
  --in-place              Replace source files after validation
  --dry-run               Report planned work without writing files
  --help                  Show this help

Safe defaults do not re-encode WebP files and do not replace source files.
Use --dry-run first. Destructive replacement requires --in-place explicitly.
`);
}

function parseArgs(argv) {
  const options = {
    quality: 76,
    maxEdge: 2560,
    method: 6,
    input: DEFAULT_INPUT,
    previewDir: DEFAULT_PREVIEW,
    reencodeWebp: false,
    inPlace: false,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      usage();
      process.exit(0);
    }
    if (argument === '--reencode-webp') options.reencodeWebp = true;
    else if (argument === '--in-place') options.inPlace = true;
    else if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--quality') options.quality = Number(argv[++index]);
    else if (argument === '--max-edge') options.maxEdge = Number(argv[++index]);
    else if (argument === '--method') options.method = Number(argv[++index]);
    else if (argument === '--input') options.input = path.resolve(argv[++index]);
    else if (argument === '--preview-dir') options.previewDir = path.resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }

  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) throw new Error('--quality must be an integer from 1 to 100');
  if (!Number.isInteger(options.maxEdge) || options.maxEdge < 320) throw new Error('--max-edge must be an integer of at least 320');
  if (!Number.isInteger(options.method) || options.method < 0 || options.method > 6) throw new Error('--method must be an integer from 0 to 6');
  if (options.inPlace && !options.reencodeWebp) throw new Error('--in-place requires --reencode-webp for the current WebP gallery');
  return options;
}

function commandExists(command) {
  return spawnSync(command, ['-version'], { stdio: 'ignore' }).status === 0;
}

function dimensions(file) {
  return imageSize(fs.readFileSync(file));
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.input)) throw new Error(`Input directory does not exist: ${options.input}`);
  if (!commandExists('cwebp')) throw new Error('cwebp is required. On macOS, install it with: brew install webp');
  if (!options.inPlace && !options.dryRun) fs.mkdirSync(options.previewDir, { recursive: true });

  const files = fs.readdirSync(options.input)
    .filter(file => /\.(?:webp|png|jpe?g)$/i.test(file))
    .sort();
  const targets = files.filter(file => options.reencodeWebp || !/\.webp$/i.test(file));

  console.log(`[Gallery Optimize] ${files.length} images found; ${targets.length} selected`);
  console.log(`[Gallery Optimize] quality=${options.quality}, max-edge=${options.maxEdge}, method=${options.method}, dry-run=${options.dryRun}, in-place=${options.inPlace}`);

  let originalBytes = 0;
  let optimizedBytes = 0;
  let processed = 0;
  let skipped = 0;

  for (const file of targets) {
    const source = path.join(options.input, file);
    const sourceStat = fs.statSync(source);
    const size = dimensions(source);
    const longestEdge = Math.max(size.width, size.height);
    const scale = Math.min(1, options.maxEdge / longestEdge);
    const outputWidth = Math.max(1, Math.round(size.width * scale));
    const outputHeight = Math.max(1, Math.round(size.height * scale));
    originalBytes += sourceStat.size;

    if (options.dryRun) {
      console.log(`[Dry Run] ${file}: ${size.width}x${size.height}, ${(sourceStat.size / 1024).toFixed(1)} KiB -> ${outputWidth}x${outputHeight}`);
      continue;
    }

    const temporary = path.join(os.tmpdir(), `gallery-${process.pid}-${processed}.webp`);
    const args = ['-quiet', '-q', String(options.quality), '-m', String(options.method), '-mt'];
    if (scale < 1) args.push('-resize', String(outputWidth), String(outputHeight));
    args.push(source, '-o', temporary);

    const result = spawnSync('cwebp', args, { stdio: 'inherit' });
    if (result.status !== 0 || !fs.existsSync(temporary) || fs.statSync(temporary).size === 0) {
      fs.rmSync(temporary, { force: true });
      throw new Error(`cwebp failed for ${source}`);
    }

    const outputSize = dimensions(temporary);
    if (outputSize.width !== outputWidth || outputSize.height !== outputHeight) {
      fs.rmSync(temporary, { force: true });
      throw new Error(`Dimension validation failed for ${source}`);
    }

    const resultBytes = fs.statSync(temporary).size;
    if (resultBytes >= sourceStat.size && /\.webp$/i.test(file) && scale === 1) {
      console.log(`[Skip] ${file}: optimized file is not smaller`);
      fs.rmSync(temporary, { force: true });
      optimizedBytes += sourceStat.size;
      skipped += 1;
      continue;
    }

    const destination = /\.webp$/i.test(file) ? source : source.replace(/\.[^.]+$/, '.webp');
    if (options.inPlace) {
      if (destination !== source && fs.existsSync(destination)) {
        fs.rmSync(temporary, { force: true });
        throw new Error(`Refusing to overwrite an existing destination: ${destination}`);
      }
      fs.renameSync(temporary, destination);
      if (destination !== source) fs.rmSync(source);
      console.log(`[Updated] ${file}: ${(sourceStat.size / 1024).toFixed(1)} -> ${(resultBytes / 1024).toFixed(1)} KiB`);
    } else {
      const preview = path.join(options.previewDir, path.basename(destination));
      fs.renameSync(temporary, preview);
      console.log(`[Preview] ${file}: wrote ${preview} (${(resultBytes / 1024).toFixed(1)} KiB)`);
    }
    optimizedBytes += resultBytes;
    processed += 1;
  }

  if (options.dryRun) {
    console.log('[Gallery Optimize] Dry run complete; no files changed.');
    return;
  }

  const saved = Math.max(0, originalBytes - optimizedBytes);
  console.log(`[Gallery Optimize] ${processed} written, ${skipped} kept; estimated saving ${(saved / 1024 / 1024).toFixed(2)} MiB`);
}

try {
  main();
} catch (error) {
  console.error(`[Gallery Optimize] ${error.message}`);
  process.exitCode = 1;
}
