# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a Chinese (`zh-CN`) Hexo 7 static blog using a maintained, checked-in Butterfly theme fork. The active theme is `butterfly`; root site settings are in `_config.yml` and theme behavior/settings are in `_config.butterfly.yml`.

The site deploys generated output to both GitHub Pages and a private Git remote. Do not run deploy commands unless explicitly requested.

## Commands

- `npm install` installs project dependencies.
- `npm run server` starts the local Hexo server.
- `npm run build` generates the site into `public/`; this is the primary validation command and runs the registered generation-time checks.
- `npm run clean` removes Hexo output and cache. Use `npm run clean && npm run build` for a clean validation build.
- `npm run dev` converts eligible images to WebP, cleans, then starts the server.
- `npm run opt` converts WebP assets, cleans, and builds.
- `npm run webp` dispatches to the platform-specific WebP conversion and Markdown-reference update scripts. It requires `cwebp`/`gif2webp` from libwebp (`brew install webp` on macOS).
- `npm run gallery:compress` optimizes source images for the Yesterday Gallery.
- `npm run pub` runs `opt` and deploys to both configured remotes; `npm run deploy` deploys existing output.
- `hexo new "Post Title"` creates a post; `hexo new page "page-name"` creates a page.

There is no unit-test or single-test runner. For generated-site audits, build first, then run:

- `node tools/audit-article-layout-stability.js` checks generated post image dimensions and lazy-load markup.
- `node tools/audit-resource-requests.js --no-external` checks generated local resource references without network probes. Omit `--no-external` to also probe external media.
- `node tools/verify-resource-requests.js` and `node tools/verify-toc-navigation.js` are targeted generated-site verification tools; use `--help` for their available options.

## Content And Build Architecture

- `source/_posts/` holds normal Markdown posts. `post_asset_folder: true` means a post can have a sibling asset directory; preserve local asset paths when editing posts.
- `source/` also holds standalone pages and interactive experiences. `LianlianKan`, `MarkdownPreview`, `birthday-gift`, and `swiper` keep their page code and related assets together. Shared client assets live in `source/css/`, `source/js/`, and `source/imgs/`.
- `themes/butterfly/` is customized directly, not merely an untouched dependency. Theme Pug layouts decide which custom scripts load for home, post, and gallery pages; inspect `themes/butterfly/layout/includes/additional-js.pug` before changing page-specific client behavior.
- Root `scripts/` files are Hexo lifecycle plugins and load automatically. They transform rendered output or generate source/output data during `hexo generate`; do not treat them as standalone commands.
- `scripts/math-protect.js` preserves math markup before Kramed renders Markdown. `scripts/image-dimensions.js` adds intrinsic dimensions and lazy-loading metadata to eligible local images after HTML rendering; its exclusions protect theme, GIF, cover, and birthday-page behavior.

## Generated Data Contracts

- `scripts/private-posts-scanner.js` scans `source/coffer/private-posts/*.md` before generation and rewrites the tracked `source/coffer/private-posts.json` manifest. A build can therefore modify this file.
- `scripts/birthday-gift-scanner.js` scans event folders under `source/birthday-gift/events/`, generates event data, and rewrites the tracked `source/birthday-gift/events-data.json` manifest.
- `scripts/auto-image-list.js` generates `swiper/images-auto.json` in Hexo output from `source/swiper/images/`. It includes dimensions, byte size, and revision hashes; `source/swiper/images.json` is a separate tracked file.
- `scripts/announcement-history-validator.js` validates `source/_data/announcements.yml` before generation. Announcement IDs must be unique lowercase slug-like strings, entries must be in strict reverse chronological order with timezone-bearing ISO timestamps, and declared local image dimensions/paths must match files under `source/`. A failed validation intentionally stops the build.
- `public/`, `db.json`, deploy directories, and gallery optimization previews are ignored generated/local artifacts. Do not edit `public/` as source.

## Configuration And Front Matter

- `_config.yml` configures Hexo, Markdown rendering, WebP/filter optimization, Mermaid, and the two deployment targets.
- `_config.butterfly.yml` configures navigation, layouts, assets, announcements, and enabled theme features. Announcement content is primarily data-driven through `source/_data/announcements.yml`; the theme `content` field is fallback compatibility content.
- Use post front matter appropriate to the content, typically `title`, `description`, `tags`, and `categories`; `typewriter` opts a post into the custom typewriter effect. Mermaid is supported.

## Reference Material

- `部署.txt` documents local environment/deployment setup.
- `long-term-memory/` contains design decisions and historical operational notes. Consult the relevant topic before changing complex custom features such as the gallery, announcement timeline, article loading/TOC behavior, or interactive pages.
