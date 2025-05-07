# Offshore Rapport v3

Offshore Rapport is a static magazine-style website designed to showcase articles, categories, and author information.

## Features

- Responsive design for all device sizes
- Article filtering by categories and tags
- Dynamic content loading from JSON data
- Author profiles
- Dashboard for content overview

## Project Structure

```
Offshore-Rapport-v3/
├── css/
│   ├── base/
│   │   ├── _reset.css
│   │   └── _typography.css
│   ├── components/
│   │   ├── cards.css
│   │   └── navigation.css
│   ├── layout.css
│   ├── variables.css
│   ├── animations.css
│   └── main.css
├── data/
│   ├── articles.json
│   ├── authors.json
│   └── categories.json
├── js/
│   ├── dashboard/
│   │   └── dashboard.js
│   ├── main.js
│   ├── data-loader.js
│   ├── article-renderer.js
│   ├── animation-manager.js
│   ├── content-filter.js
│   └── tag-filter.js
├── index.html
├── article.html
├── category.html
├── dashboard.html
├── Dockerfile
├── fly.toml
├── netlify.toml
├── nginx.conf
├── package.json
└── README.md
```

## Getting Started

### Local Development

1. Clone the repository
2. Open `index.html` in your browser or use a local server:
   ```
   npm install
   npm run serve
   ```
3. The site will be available at http://localhost:8080

### Deployment

This project can be deployed using:

1. **Fly.io**:
   ```
   fly launch
   fly deploy
   ```

2. **Netlify**:
   Just connect your GitHub repository to Netlify, and it will deploy automatically.

## License

ISC