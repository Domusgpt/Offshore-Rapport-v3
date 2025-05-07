/**
 * Offshore Rapport v3 - Tag Filter Module
 * Handles filtering articles by tags on category pages.
 */
const OffshoreRapportTagFilter = (() => {
    let allCategoryArticles = [];
    let articlesContainerElement = null;
    let tagFilterContainerElement = null;
    let activeTag = null;

    function renderTags(articles) {
        if (!tagFilterContainerElement) return;

        const allTags = new Set();
        articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => allTags.add(tag));
            } else if (article.keywords && Array.isArray(article.keywords)) {
                 // Fallback to keywords if tags are missing
                article.keywords.forEach(kw => allTags.add(kw));
            }
        });

        if (allTags.size === 0) {
            tagFilterContainerElement.style.display = 'none';
            return;
        }

        tagFilterContainerElement.style.display = 'flex'; // Ensure visible
        let tagsHtml = '<button class="tag-filter active" data-tag="all">All Topics</button>'; // "All" button
        [...allTags].sort().forEach(tag => {
            tagsHtml += `<button class="tag-filter" data-tag="${tag}">${tag}</button>`;
        });

        tagFilterContainerElement.innerHTML = tagsHtml;
        addTagEventListeners();
    }

    function filterArticlesByTag(tag) {
        activeTag = tag;
        let filteredArticles;

        if (tag === 'all' || !tag) {
            filteredArticles = allCategoryArticles;
        } else {
            filteredArticles = allCategoryArticles.filter(article =>
                 (article.tags && article.tags.includes(tag)) ||
                 (article.keywords && article.keywords.includes(tag)) // Also check keywords
            );
        }

        OffshoreRapportRenderer.renderArticleGrid(filteredArticles, articlesContainerElement);
         // Re-initialize animations for the new set of cards
        OffshoreRapportAnimations.initializeScrollAnimations(articlesContainerElement);

        // Update active button state
        const buttons = tagFilterContainerElement.querySelectorAll('.tag-filter');
        buttons.forEach(button => {
            if (button.dataset.tag === tag) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    function addTagEventListeners() {
        if (!tagFilterContainerElement) return;
        tagFilterContainerElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('tag-filter')) {
                const selectedTag = event.target.dataset.tag;
                if (selectedTag !== activeTag) {
                    filterArticlesByTag(selectedTag);
                }
            }
        });
    }

    function initialize(articles, articlesContainer, tagContainer) {
        if (!articles || !articlesContainer || !tagContainer) {
            console.error("Tag Filter: Missing required elements or data for initialization.");
            return;
        }
        console.log("Initializing Tag Filter...");
        allCategoryArticles = articles;
        articlesContainerElement = articlesContainer;
        tagFilterContainerElement = tagContainer;
        activeTag = 'all'; // Default to showing all

        renderTags(allCategoryArticles); // Render the tag buttons
    }

    // Public API
    return {
        initialize
    };
})();