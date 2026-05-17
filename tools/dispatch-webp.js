#!/usr/bin/env node
// Platform dispatcher for webp scripts
// Called by npm run webp — automatically picks .ps1 (Windows) or .sh (macOS/Linux)
const { execSync } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const ext = isWindows ? 'ps1' : 'sh';
const cmd = isWindows ? 'pwsh' : 'bash';
const toolsDir = path.resolve(__dirname);

function run(script) {
    const full = path.join(toolsDir, script);
    console.log(`[dispatch] Running: ${cmd} ${full}`);
    execSync(`${cmd} "${full}"`, { stdio: 'inherit', cwd: toolsDir });
}

run(`convert-to-webp.${ext}`);
run(`update-markdown-images.${ext}`);
