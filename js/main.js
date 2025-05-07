/**
 * Offshore Rapport v3 - Data Loader Module
 * Handles fetching and caching JSON data.
 */

const OffshoreRapportData = (() => {
    const ARTICLES_URL = 'data/articles.json';
    const CATEGORIES_URL = 'data/categories.json'; // Assuming this exists
    const AUTHORS_URL = 'data/authors.json'; // Assuming this exists
    const CACHE_KEY_PREFIX = 'offshoreRapportData_';
    const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    let allArticlesCache = null;
    let categoriesCache = null;
    let authorsCache = null;

    // --- Caching Utilities ---
    function setCache(key, data) {
        const cacheEntry = {
            timestamp: Date.now(),
            data: data,
        };
        try {
            localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheEntry));
        } catch (e) {
            console.warn("Could not write to localStorage:", e);
            // Fallback for in-memory cache if localStorage fails
            if (key === 'articles') allArticlesCache = cacheEntry.data;
            if (key === 'categories') categoriesCache = cacheEntry.data;
            if (key === 'authors') authorsCache = cacheEntry.data;
        }
    }

    function getCache(key) {
        try {
            const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
            if (!item) return null;
            const cacheEntry = JSON.parse(item);
            if (Date.now() - cacheEntry.timestamp > CACHE_EXPIRY_MS) {
                localStorage.removeItem(CACHE_KEY_PREFIX + key); // Expire cache
                return null;
            }
            return cacheEntry.data;
        } catch (e) {
            console.warn("Could not read from localStorage:", e);
            // Fallback check in-memory cache
            if (key === 'articles') return allArticlesCache;
            if (key === 'categories') return categoriesCache;
            if (key === 'authors') return authorsCache;
            return null;
        }
    }

    // --- Data Fetching ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch data from ${url}:`, error);
            throw error; // Re-throw to be caught by caller
        }
    }

    // --- Article Data Access ---
    async function getAllArticles(forceRefresh = false) {
        const cachedData = getCache('articles');
        if (cachedData && !forceRefresh) {
            console.log("Using cached articles data.");
            return cachedData;
        }
        console.log("Fetching fresh articles data...");
        const data = await fetchData(ARTICLES_URL);
        setCache('articles', data);
        return data;
    }

    async function getArticlesByCategory(categorySlug, limit = null) {
        const allArticles = await getAllArticles();
        const filtered = allArticles.filter(article => article.category === categorySlug || article.category.slug === categorySlug); // Handle simple string or object category
         // Sort by date descending (newest first) - ensure date format is parseable!
        filtered.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

        return limit ? filtered.slice(0, limit) : filtered;
    }

     async function getArticleById(articleId) {
        const allArticles = await getAllArticles();
        return allArticles.find(article => article.id === articleId);
    }

    async function searchArticles(searchTerm) {
         const allArticles = await getAllArticles();
         const lowerCaseSearchTerm = searchTerm.toLowerCase();
         return allArticles.filter(article =>
            article.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            article.summary.toLowerCase().includes(lowerCaseSearchTerm) ||
            (article.keywords && article.keywords.some(kw => kw.toLowerCase().includes(lowerCaseSearchTerm)))
        );
    }

    // --- Category Data Access ---
    async function getAllCategories(forceRefresh = false) {
         const cachedData = getCache('categories');
         if (cachedData && !forceRefresh) {
             console.log("Using cached categories data.");
             return cachedData;
         }
         console.log("Fetching fresh categories data...");
         const data = await fetchData(CATEGORIES_URL);
         setCache('categories', data);
         return data;
     }

     async function getCategoryInfo(categorySlug) {
         const allCategories = await getAllCategories();
         const category = allCategories.find(cat => cat.slug === categorySlug);
         if (!category) throw new Error(`Category with slug "${categorySlug}" not found.`);
         return category;
     }

     // --- Author Data Access ---
     async function getAllAuthors(forceRefresh = false) {
          const cachedData = getCache('authors');
          if (cachedData && !forceRefresh) {
              console.log("Using cached authors data.");
              return cachedData;
          }
          console.log("Fetching fresh authors data...");
          const data = await fetchData(AUTHORS_URL);
          setCache('authors', data);
          return data;
      }

      async function getAuthorById(authorId) {
          const allAuthors = await getAllAuthors();
          const author = allAuthors.find(auth => auth.id === authorId);
          if (!author) console.warn(`Author with ID "${authorId}" not found.`); // Warn instead of error
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