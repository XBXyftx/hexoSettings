# AGENTS.md - Hexo Blog Project Guide

This file provides comprehensive guidance for AI coding agents working with this Hexo blog project.

## Project Overview

This is a **Hexo static site generator blog** using the **Butterfly theme**. The blog is written in Chinese (zh-CN) and focuses on technology topics including HarmonyOS development, algorithms, and web development.

- **Site URL**: https://xbxyftx.top
- **Author**: XBXyftx
- **Language**: Chinese (zh-CN)
- **Hexo Version**: 7.3.0
- **Theme**: Butterfly (customized)

## Technology Stack

### Core Framework
- **Hexo** 7.3.0 - Static site generator built on Node.js
- **Node.js** - Runtime environment
- **NPM** - Package management

### Templating & Rendering
- **EJS** - Embedded JavaScript templating
- **Pug** - Template engine for HTML
- **Stylus** - CSS preprocessor
- **Kramed** - Markdown renderer (GitHub Flavored Markdown)

### Key Plugins & Dependencies
| Plugin | Purpose |
|--------|---------|
| `hexo-deployer-git` | Git-based deployment |
| `hexo-butterfly-envelope` | Envelope-style comment page |
| `hexo-butterfly-extjs` | Extended JavaScript for theme |
| `hexo-butterfly-swiper` | Homepage carousel/swiper |
| `hexo-butterfly-tag-plugins-plus` | Enhanced tag plugins |
| `hexo-filter-mermaid-diagrams` | Mermaid diagram support |
| `hexo-generator-index-pin-top` | Pinned posts on homepage |
| `hexo-wordcount` | Word count and reading time |
| `hexo-asset-image` | Asset folder image handling |
| `image-size` | Image dimension detection |
| `vanilla-lazyload` | Lazy loading for images |

## Project Structure

```
d:\hexo\hexoSettings\
├── _config.yml                 # Main Hexo configuration
├── _config.butterfly.yml       # Butterfly theme configuration
├── package.json                # NPM dependencies and scripts
├── scaffolds/                  # Post/page templates
│   ├── post.md                 # New post template
│   ├── page.md                 # New page template
│   └── draft.md                # Draft template
├── scripts/                    # Custom Hexo plugins (auto-loaded)
│   ├── auto-image-list.js      # Auto-generates image gallery JSON
│   ├── private-posts-scanner.js # Private posts management
│   └── image-dimensions.js     # Image dimension injection
├── tools/                      # PowerShell automation scripts
│   ├── convert-to-webp.ps1     # Convert images to WebP
│   ├── update-markdown-images.ps1 # Update image refs to WebP
│   └── *.ps1                   # Other utility scripts
├── source/                     # Content source
│   ├── _posts/                 # Blog posts (Markdown + assets)
│   │   ├── post-name.md        # Post content
│   │   └── post-name/          # Asset folder (images, etc.)
│   ├── coffer/                 # Private/password-protected content
│   │   └── private-posts/      # Private posts directory
│   ├── swiper/                 # Image gallery/swiper
│   ├── about/                  # About page
│   ├── link/                   # Friend links page
│   ├── comments/               # Comments/guestbook page
│   ├── LianlianKan/            # Custom game page (连连看)
│   ├── MarkdownPreview/        # Markdown editor page
│   ├── imgs/                   # Global images
│   ├── css/                    # Custom CSS
│   ├── js/                     # Custom JavaScript
│   └── _data/                  # Data files (YAML)
├── themes/                     # Theme directory
│   └── butterfly/              # Butterfly theme files
├── public/                     # Generated static files (build output)
└── .deploy_git/                # Deployment cache
```

## Build Commands

All commands are available via npm scripts in `package.json`:

### Development
```bash
# Start local development server
npm run server
# or: hexo server

# Full dev workflow: WebP conversion + clean + server
npm run dev
```

### Build
```bash
# Clean generated files and cache
npm run clean
# or: hexo clean

# Generate static files
npm run build
# or: hexo generate

# Full optimized build: WebP + clean + build
npm run opt
```

### Image Optimization
```bash
# Convert images to WebP and update references
npm run webp
# Runs: convert-to-webp.ps1 + update-markdown-images.ps1
```

### Deployment
```bash
# Deploy to configured git repositories
npm run deploy
# or: hexo deploy

# Full publish workflow: WebP + opt + deploy
npm run pub
```

## Content Creation

### Creating a New Post
```bash
hexo new "Post Title"
```

This creates:
- `source/_posts/post-title.md` - Post markdown file
- `source/_posts/post-title/` - Asset folder for images

### Post Front Matter Template
```yaml
---
title: 文章标题
date: 2025-01-01 12:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类
description: SEO描述文本
typewriter: 打字机效果的文本内容
cover: /imgs/ArticleTopImgs/image.webp
swiper_index: 1  # 轮播图排序
---
```

### Creating a New Page
```bash
hexo new page "page-name"
```

### Key Front Matter Fields
| Field | Description |
|-------|-------------|
| `title` | Post title (required) |
| `date` | Publication date |
| `tags` | Array of tags |
| `categories` | Array of categories |
| `description` | SEO description |
| `typewriter` | Typewriter effect text (custom feature) |
| `cover` | Article cover image path |
| `swiper_index` | Carousel display order |

## Custom Features

### 1. Typewriter Effect
A custom implementation that displays animated typing text at the beginning of posts.

- **Script**: `themes/butterfly/source/js/typewriter-effect.js`
- **CSS**: `themes/butterfly/source/css/typewriter-effect.css`
- **Usage**: Add `typewriter: "your text here"` in post front matter
- **Trigger**: Only activates on posts with the `typewriter` field

### 2. Private Posts System
Password-protected posts stored in `source/coffer/private-posts/`.

- **Scanner**: `scripts/private-posts-scanner.js`
- **Output**: `source/coffer/private-posts.json`
- **Features**: 
  - MD5 hashing for change detection
  - Automatic word count calculation
  - Excerpt generation
  - Metadata extraction

### 3. Auto Image Gallery
Automatically generates image list for the swiper/carousel.

- **Script**: `scripts/auto-image-list.js`
- **Source**: `source/swiper/images/`
- **Output**: `swiper/images-auto.json`
- **Supported formats**: jpg, jpeg, png, gif, webp, bmp, svg

### 4. Image Dimension Injection
Automatically adds width/height attributes to images to prevent layout shift.

- **Script**: `scripts/image-dimensions.js`
- **Features**:
  - Lazy loading (loading="lazy")
  - Dimension extraction using image-size
  - Exclusion list for specific image types
  - Caching for performance

### 5. WebP Optimization Pipeline
Automated image conversion and reference updating.

- **Converter**: `tools/convert-to-webp.ps1`
  - Converts png/jpg/gif to WebP
  - Deletes source files after conversion
  - Uses cwebp and gif2webp tools
- **Updater**: `tools/update-markdown-images.ps1`
  - Updates image references in Markdown files
  - Updates configuration files
  - Skips external URLs (bu.dusays.com, GitHub)

## Configuration Files

### Main Config (`_config.yml`)
Key settings:
- `url`: https://xbxyftx.top
- `theme`: butterfly
- `post_asset_folder: true` - Enable asset folders
- `deploy`: Dual deployment to GitHub Pages and private server

### Theme Config (`_config.butterfly.yml`)
Key sections:
- `nav`: Navigation menu configuration
- `menu`: Menu items (Chinese)
- `social`: Social media links
- `index_layout: 8`: Waterfall masonry layout
- `comments`: Twikoo comment system
- `inject`: Custom CSS/JS injection
- `lazyload`: Disabled (handled by custom script)

## Deployment Configuration

The blog deploys to two destinations simultaneously:

1. **GitHub Pages**
   - Repository: `git@github.com:XBXyftx/XBXyftx.github.io.git`
   - Branch: main

2. **Private Server**
   - Host: `git@113.47.8.204:/home/git/blog.git`
   - Branch: main

## Code Style Guidelines

### JavaScript (Hexo Plugins)
- Use CommonJS (`require`/`module.exports`)
- Follow existing plugin structure with `hexo.extend.*`
- Include logging with `[PluginName]` prefix
- Handle errors gracefully with try-catch
- Use Chinese for user-facing console messages

### PowerShell Scripts
- Include parameter defaults for paths
- Use UTF-8 encoding for file operations
- Color-coded console output (Green=success, Red=error, Yellow=warning)
- Functions should return boolean for success/failure
- Comments in Chinese

### Markdown Content
- Use WebP format for images
- Reference images relatively: `![alt](post-name/image.webp)`
- Use tag plugins: `{% note style %}` for callouts
- Include proper front matter for all posts

## External Dependencies

### Required System Tools
- **cwebp** - WebP conversion tool (install via scoop: `scoop install main/libwebp`)
- **gif2webp** - Animated WebP conversion

### CDN Resources
- Font Awesome 6.5.1
- Various libraries via cdnjs/cloudflare
- Twikoo comment system (self-hosted on Netlify)

## Development Workflow

1. **Create content**: `hexo new "Title"`
2. **Add images**: Place in post's asset folder
3. **Optimize**: `npm run webp` (converts images)
4. **Preview**: `npm run dev` (local server)
5. **Build**: `npm run opt` (optimized build)
6. **Deploy**: `npm run pub` (publish to both servers)

## Troubleshooting

### Image Issues
- Run `npm run webp` to convert new images
- Check that image paths are relative in Markdown
- Verify WebP files exist after conversion

### Build Issues
- Run `npm run clean` before building
- Check for YAML syntax errors in front matter
- Verify all dependencies are installed: `npm install`

### Deployment Issues
- Ensure SSH keys are configured for both remotes
- Check Git remote URLs in `_config.yml`
- Verify network access to both destinations

## Security Considerations

- Private posts use client-side protection only
- Sensitive content should not rely solely on the private posts feature
- SSH keys for deployment should be properly secured
- No hardcoded credentials in source files

## Performance Optimizations

1. **WebP images** - Smaller file sizes
2. **Lazy loading** - Images load on scroll
3. **Dimension injection** - Prevents layout shift
4. **CDN resources** - Fast library loading
5. **Canvas effects disabled** - CPU-intensive features turned off
6. **Comment lazy loading** - Comments load on demand

## Notes for AI Agents

- This is a Chinese-language blog; maintain Chinese in user-facing content
- The project uses Windows PowerShell scripts; avoid bash-specific commands
- Asset folders are enabled; always place post images in the companion folder
- WebP optimization is mandatory; run `npm run webp` after adding images
- Custom scripts in `/scripts` are auto-loaded by Hexo during build
- The typewriter feature requires both JS and CSS modifications
- Test changes locally with `npm run dev` before deploying
