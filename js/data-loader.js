/**
 * Data Loader for Offshore Rapport v3
 * Handles loading JSON data from the data directory
 */

class DataLoader {
    constructor() {
        this.articlesData = null;
        this.authorsData = null;
        this.categoriesData = null;
    }

    /**
     * Load all data files
     */
    async loadAllData() {
        try {
            await Promise.all([
                this.loadArticles(),
                this.loadAuthors(),
                this.loadCategories()
            ]);
            console.log('All data loaded successfully');
            return {
                articles: this.articlesData,
                authors: this.authorsData,
                categories: this.categoriesData
            };
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    /**
     * Load articles data
     */
    async loadArticles() {
        try {
            const response = await fetch('data/articles.json');
            this.articlesData = await response.json();
            return this.articlesData;
        } catch (error) {
            console.error('Error loading articles:', error);
            throw error;
        }
    }

    /**
     * Load authors data
     */
    async loadAuthors() {
        try {
            const response = await fetch('data/authors.json');
            this.authorsData = await response.json();
            return this.authorsData;
        } catch (error) {
            console.error('Error loading authors:', error);
            throw error;
        }
    }

    /**
     * Load categories data
     */
    async loadCategories() {
        try {
            const response = await fetch('data/categories.json');
            this.categoriesData = await response.json();
            return this.categoriesData;
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    }
}

// Export the DataLoader instance
const dataLoader = new DataLoader();
export default dataLoader;