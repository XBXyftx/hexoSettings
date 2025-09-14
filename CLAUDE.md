# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hexo static site generator blog using the Butterfly theme. The blog is deployed to both GitHub Pages and a private server. It features a typewriter effect for posts, private post management, and automatic image list generation.

## Common Commands

### Development
- `npm run server` - Start local development server
- `hexo server` - Alternative way to start server
- `hexo new "Post Title"` - Create a new blog post
- `hexo new page "page-name"` - Create a new page

### Build & Deploy
- `npm run clean` - Clean generated files and cache
- `npm run build` or `hexo generate` - Generate static files
- `npm run deploy` or `hexo deploy` - Deploy to configured git repositories

### Maintenance
- `hexo clean && hexo generate` - Full rebuild (recommended before deploy)

## Architecture & Key Features

### Theme Configuration
- **Main theme**: Butterfly (located in `themes/butterfly/`)
- **Primary config**: `_config.yml` (main Hexo config)
- **Theme config**: `_config.butterfly.yml` (Butterfly theme settings)

### Custom Features

#### Typewriter Effect
- Custom typewriter animation for blog posts
- Implemented via theme modifications (see `README_typewriter.md`)
- Uses `typewriter` field in post front matter
- Only displays on posts that have the `typewriter` field

#### Private Posts System
- Custom script: `scripts/private-posts-scanner.js`
- Scans `source/coffer/private-posts/` directory
- Generates `source/coffer/private-posts.json` for secure access
- Uses MD5 hashing to detect changes and optimize performance

#### Auto Image Gallery
- Custom script: `scripts/auto-image-list.js`
- Automatically generates image list from `source/swiper/images/`
- Creates `swiper/images-auto.json` for gallery functionality
- Supports: jpg, jpeg, png, gif, webp, bmp, svg

### Deployment Configuration
- **Dual deployment**: GitHub Pages + Private server
- **GitHub**: `git@github.com:XBXyftx/XBXyftx.github.io.git` (main branch)
- **Private server**: `git@113.47.8.204:/home/git/blog.git` (main branch)

### Content Structure
- **Posts**: `source/_posts/` - Main blog content
- **Pages**: `source/[page-name]/` - Static pages (about, links, etc.)
- **Assets**: `source/imgs/` - Images and media files
- **Private content**: `source/coffer/` - Protected content area
- **Interactive features**: `source/LianlianKan/`, `source/MarkdownPreview/`

### Key Dependencies
- `hexo-asset-image` - Enhanced image processing
- `hexo-deployer-git` - Git deployment
- `hexo-butterfly-*` - Theme enhancements and plugins
- `hexo-filter-mermaid-diagrams` - Diagram support
- `hexo-wordcount` - Reading time and word count

### Post Front Matter
When creating posts, use these fields:
```yaml
---
title: Post Title
description: SEO description
typewriter: Text for typewriter effect (optional)
tags: [tag1, tag2]
categories: [category]
---
```

### Development Notes
- Blog uses Chinese language (`zh-CN`)
- Post asset folders are enabled (`post_asset_folder: true`)
- Mermaid diagrams are supported
- Custom CSS/JS can be added to `source/css/` and `source/js/`
- Scripts in `/scripts` directory are auto-loaded by Hexo

### Performance Optimizations
- Private posts scanner uses file hashing to avoid unnecessary rescans
- Auto image list generator only processes supported formats
- Theme uses lazy loading for images