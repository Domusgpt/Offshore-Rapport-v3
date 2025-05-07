/**
 * Offshore Rapport v3 - Data Loader Module
 * Handles fetching and caching JSON data.
 */

const OffshoreRapportData = (() => {
    const ARTICLES_URL = 'data/articles.json';
    const CATEGORIES_URL = 'data/categories.json';
    const AUTHORS_URL = 'data/authors.json';
    const CACHE_KEY_PREFIX = 'offshoreRapportData_v3_'; // Added version to cache key
    const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    // In-memory cache fallback
    let inMemoryCache = {
        articles: null,
        categories: null,
        authors: null
    };

    // --- Caching Utilities ---
    function setCache(key, data) {
        const cacheEntry = {
            timestamp: Date.now(),
            data: data,
        };
        // Update in-memory cache first
        inMemoryCache[key] = cacheEntry.data;
        try {
            localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheEntry));
            // console.log(`[Cache] Data set for key: ${key}`);
        } catch (e) {
            console.warn(`Could not write to localStorage for key ${key}:`, e);
        }
    }

    function getCache(key) {
        try {
            const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
            if (!item) {
                // console.log(`[Cache] No localStorage item for key: ${key}. Checking memory.`);
                return inMemoryCache[key]; // Return from memory if not in localStorage
            }
            const cacheEntry = JSON.parse(item);
            if (Date.now() - cacheEntry.timestamp > CACHE_EXPIRY_MS) {
                console.log(`[Cache] Expired for key: ${key}. Removing.`);
                localStorage.removeItem(CACHE_KEY_PREFIX + key);
                inMemoryCache[key] = null; // Clear memory cache too
                return null;
            }
            // console.log(`[Cache] Data retrieved for key: ${key}`);
            // Sync in-memory cache if it was empty
            if (!inMemoryCache[key]) {
                inMemoryCache[key] = cacheEntry.data;
            }
            return cacheEntry.data;
        } catch (e) {
            console.warn(`Could not read/parse localStorage for key ${key}:`, e);
            // Fallback check in-memory cache again
            return inMemoryCache[key];
        }
    }

    // --- Data Fetching ---
    async function fetchData(url, key) {
        // Check cache first
        const cachedData = getCache(key);
        if (cachedData) {
            // console.log(`Using cached data for ${key}.`);
            return cachedData;
        }

        // console.log(`Fetching fresh data for ${key} from ${url}...`);
        try {
            const response = await fetch(url, { cache: 'no-store' }); // Prevent browser caching interfering
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            const data = await response.json();
            setCache(key, data); // Store fresh data in cache
            return data;
        } catch (error) {
            console.error(`Failed to fetch data from ${url}:`, error);
            // Attempt to return potentially stale in-memory cache on fetch failure
            if (inMemoryCache[key]) {
                console.warn(`Returning stale in-memory cache for ${key} due to fetch error.`);
                return inMemoryCache[key];
            }
            throw error; // Re-throw if no cache available
        }
    }

    // --- Public Data Access Methods ---
    async function getAllArticles() {
        return await fetchData(ARTICLES_URL, 'articles');
    }

    async function getAllCategories() {
        return await fetchData(CATEGORIES_URL, 'categories');
    }

    async function getAllAuthors() {
        return await fetchData(AUTHORS_URL, 'authors');
    }

    async function getArticlesByCategory(categorySlug, limit = null) {
        const allArticles = await getAllArticles();
        const filtered = allArticles.filter(article =>
            (article.category?.slug === categorySlug) || (typeof article.category === 'string' && article.category === categorySlug)
        );
        // Sort by date descending (newest first)
        filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        return limit ? filtered.slice(0, limit) : filtered;
    }

    async function getArticleById(articleId) {
        const allArticles = await getAllArticles();
        return allArticles.find(article => article.id === articleId);
    }

    async function searchArticles(searchTerm) {
         const allArticles = await getAllArticles();
         if (!searchTerm) return allArticles; // Return all if search is empty
         const lowerCaseSearchTerm = searchTerm.toLowerCase();
         return allArticles.filter(article =>
            article.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
            article.summary?.toLowerCase().includes(lowerCaseSearchTerm) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))) ||
            (article.keywords && article.keywords.some(kw => kw.toLowerCase().includes(lowerCaseSearchTerm))) ||
            (article.content && article.content.some(block => block.content?.toLowerCase().includes(lowerCaseSearchTerm))) // Search content blocks
        );
    }

     async function getCategoryInfo(categorySlug) {
         const allCategories = await getAllCategories();
         const category = allCategories.find(cat => cat.slug === categorySlug);
         if (!category) {
             console.warn(`Category with slug "${categorySlug}" not found in data.`);
             // Return a default/fallback object
             return {
                id: `cat-${categorySlug}`,
                name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                slug: categorySlug,
                description: `Articles related to ${categorySlug}.`,
                color: '#6c757d', // Default gray
                pattern: null
             };
         }
         return category;
     }

      async function getAuthorById(authorId) {
          if (!authorId) return null;
          const allAuthors = await getAllAuthors();
          const author = allAuthors.find(auth => auth.id === authorId);
          if (!author) console.warn(`Author with ID "${authorId}" not found.`);
          return author;
      }


    // --- Public API ---
    return {
        getAllArticles,
        getArticlesByCategory,
        getArticleById,
        searchArticles,
        getAllCategories,
        getCategoryInfo,
        getAllAuthors,
        getAuthorById
    };
})();