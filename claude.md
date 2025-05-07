# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Offshore Rapport v3 is a static magazine-style website designed to showcase articles, categories, and author information. It's built as a pure static site without a backend framework, using vanilla JavaScript and CSS.

## Commands

### Local Development

```bash
# Install dev dependencies
npm install

# Start local development server
npm run serve
```

The site will be available at http://localhost:8080

### Deployment

The site can be deployed using either Fly.io or Netlify:

```bash
# Fly.io deployment
fly launch  # First-time setup
fly deploy  # Deploy updates

# Netlify deployment is automatic via GitHub connection
```

## Code Architecture

### Data Model and Content Flow

The site follows a content-first architecture with a clear data flow:

1. **Data Sources**: JSON files in `/data/` directory store articles, authors, and categories
2. **Data Loading Layer**: `data-loader.js` handles fetching, caching, and providing structured access
3. **UI Rendering Layer**: Individual JS modules render content to specific page templates
4. **Page Templates**: Standalone HTML files (`index.html`, `article.html`, etc.) provide the structure

### Key Components

#### Data Loading System

The data loading system (`js/data-loader.js`) provides a central module (`OffshoreRapportData`) with these features:
- Local storage caching with expiration
- In-memory cache fallback
- Data access methods for articles, categories, and authors
- Advanced filtering and searching capabilities

Example usage:
```javascript
// Get all articles
const articles = await OffshoreRapportData.getAllArticles();

// Get articles by category
const fishingArticles = await OffshoreRapportData.getArticlesByCategory('fisheries');

// Search articles
const searchResults = await OffshoreRapportData.searchArticles('wind energy');
```

#### Content Structure

Articles have a rich content structure that supports various content blocks:
- Paragraphs
- Headings
- Images with captions
- Quotes with attributions
- Lists (bullet and numbered)

This structure is rendered by the `article-renderer.js` module which dynamically creates DOM elements based on the content type.

#### CSS Architecture

The CSS follows a modular structure:
- Base styles (`_reset.css`, `_typography.css`)
- Component styles (`buttons.css`, `cards.css`, `navigation.css`)
- Layout styles (`layout.css`)
- Variables and theming (`variables.css`)
- Animations (`animations.css`)
- Main CSS imports all modules (`main.css`)

## Deployment Configuration

### Docker/Nginx

The site uses a simple Nginx-based Docker configuration:
- Alpine-based Nginx container
- Custom Nginx configuration with cache headers and gzip compression
- Single-page application routing support via `try_files`

### Fly.io

The `fly.toml` file configures the Fly.io deployment with:
- HTTP to HTTPS redirection
- TCP health checks
- Concurrency limits

## Adding New Content

To add new content:

1. Create a new article entry in `data/articles.json` following the existing schema
2. Ensure any referenced categories exist in `data/categories.json`
3. Ensure any referenced authors exist in `data/authors.json`
4. The article will automatically appear in listings and be accessible via its slug

## Common Tasks

### Adding a new article category

1. Add a new category entry to `data/categories.json` with a unique ID and slug
2. New articles can now reference this category

### Implementing a new content block type

1. Add the new content type to the article schema in `data/articles.json`
2. Update the `article-renderer.js` to handle the new content type in the rendering logic

### Updating the navigation

The navigation structure is defined in the HTML templates. Update the `<nav>` section in each HTML file to maintain consistent navigation across pages.