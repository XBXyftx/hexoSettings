const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['source/MarkdownPreview/workbench/workbench.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'source/MarkdownPreview/workbench/workbench.bundle.js',
  legalComments: 'none',
  minify: true
}).catch(() => process.exit(1));
