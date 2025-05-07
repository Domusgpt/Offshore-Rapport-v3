/**
 * Offshore Rapport v3 - Dashboard Functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    const articlesTableBody = document.getElementById('articles-table-body');
    const newArticleBtn = document.getElementById('new-article-btn');
    const articlesSection = document.getElementById('articles-section');
    const articleFormSection = document.getElementById('article-form-section');
    const articleForm = document.getElementById('article-form');
    const cancelFormBtn = document.getElementById('cancel-form');
    const jsonPreview = document.getElementById('json-preview');

    // Basic Navigation
    const sidebarLinks = document.querySelectorAll('.dashboard-nav a');
    const sections = document.querySelectorAll('.dashboard-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('href').substring(1) + '-section';

            // Toggle active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Toggle visible section
            sections.forEach(section => {
                if (section.id === targetSectionId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });

             // Special handling for form visibility
            if (targetSectionId !== 'article-form-section') {
                hideArticleForm();
            }
            if (targetSectionId === 'articles-section') {
                 loadArticlesTable(); // Reload table when switching to articles view
             }

        });
    });


    // --- Article Loading ---
    async function loadArticlesTable() {
        if (!articlesTableBody) return;
        articlesTableBody.innerHTML = '<tr><td colspan="4">Loading articles...</td></tr>';

        try {
            const articles = await OffshoreRapportData.getAllArticles(); // Use data loader
             articles.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)); // Sort newest first

            if (articles.length === 0) {
                articlesTableBody.innerHTML = '<tr><td colspan="4">No articles found.</td></tr>';
                return;
            }

            articlesTableBody.innerHTML = articles.map(article => `
                <tr>
                    <td>${article.title || 'N/A'}</td>
                    <td>${article.category?.name || article.category || 'N/A'}</td>
                    <td>${formatDate(article.publicationDate)}</td>
                    <td class="action-buttons">
                        <button class="action-button edit" data-id="${article.id}" title="Edit">✏️</button>
                        <button class="action-button delete" data-id="${article.id}" title="Delete">🗑️</button>
                         <a href="article.html?id=${article.id}" target="_blank" class="action-button view" title="View">👁️</a>
                    </td>
                </tr>
            `).join('');

             // Add event listeners for edit/delete after rendering
            addTableActionListeners();

        } catch (error) {
            console.error("Error loading articles for dashboard:", error);
            articlesTableBody.innerHTML = '<tr><td colspan="4">Error loading articles.</td></tr>';
        }
    }

    function addTableActionListeners() {
         articlesTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit')) {
                const articleId = e.target.dataset.id;
                editArticle(articleId);
            } else if (e.target.classList.contains('delete')) {
                 const articleId = e.target.dataset.id;
                 deleteArticle(articleId);
             }
         });
    }

    // --- Article Form Handling ---
    function showArticleForm(articleData = null) {
        articlesSection.style.display = 'none';
        articleFormSection.style.display = 'block';
        // Reset form first
        articleForm.reset();
        document.getElementById('keywords-container').innerHTML = '';
        document.getElementById('takeaways-container').innerHTML = '<div class="takeaway-item"><input type="text" class="form-control takeaway-input" placeholder="Enter a key takeaway"><span class="remove-takeaway">✕</span></div>';
         updateJsonPreview(); // Update with empty structure

        if (articleData) {
            // Populate form with article data
            document.getElementById('article-title').value = articleData.title || '';
            document.getElementById('article-category').value = articleData.category?.slug || articleData.category || '';
            document.getElementById('article-source-name').value = articleData.sourceName || '';
            document.getElementById('article-source-url').value = articleData.sourceUrl || '';
            document.getElementById('article-date').value = articleData.publicationDate || '';
            document.getElementById('article-summary').value = articleData.summary || '';
            document.getElementById('article-type').value = articleData.articleType || '';
            document.getElementById('article-image').value = articleData.mainImageUrl || '';
             document.getElementById('article-image-alt').value = articleData.imageAltText || '';

            // Populate keywords
            const keywordsContainer = document.getElementById('keywords-container');
            (articleData.keywords || []).forEach(kw => addKeywordPill(kw, keywordsContainer));

            // Populate takeaways
             const takeawaysContainer = document.getElementById('takeaways-container');
             takeawaysContainer.innerHTML = ''; // Clear default
             (articleData.keyTakeaways || []).forEach(tw => addTakeawayInput(takeawaysContainer, tw));
             if ((articleData.keyTakeaways || []).length === 0) { // Add one empty if none exist
                 addTakeawayInput(takeawaysContainer);
             }

            articleForm.dataset.editingId = articleData.id; // Store ID for saving
            updateJsonPreview(); // Show populated JSON
        } else {
            delete articleForm.dataset.editingId; // Ensure no ID when adding new
        }
    }

    function hideArticleForm() {
        articleFormSection.style.display = 'none';
        articlesSection.style.display = 'block';
         articleForm.reset(); // Clear form
         delete articleForm.dataset.editingId;
    }

     // Keywords Handling
    const addKeywordBtn = document.getElementById('add-keyword');
    const keywordInput = document.getElementById('article-keywords');
    const keywordsContainer = document.getElementById('keywords-container');

    addKeywordBtn?.addEventListener('click', () => {
        const keyword = keywordInput.value.trim();
        if (keyword && !keywordExists(keyword)) {
            addKeywordPill(keyword, keywordsContainer);
            keywordInput.value = '';
            updateJsonPreview();
        }
         keywordInput.focus();
    });
    keywordInput?.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') {
             e.preventDefault(); // Prevent form submission
             addKeywordBtn.click();
         }
     });

    keywordsContainer?.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-keyword')) {
            e.target.closest('.keyword-pill').remove();
             updateJsonPreview();
        }
    });

    function addKeywordPill(keyword, container) {
        const pill = document.createElement('span');
        pill.className = 'keyword-pill';
        pill.dataset.keyword = keyword;
        pill.innerHTML = `${keyword} <span class="remove-keyword" title="Remove keyword">✕</span>`;
        container.appendChild(pill);
    }

    function keywordExists(keyword) {
        return !!keywordsContainer.querySelector(`.keyword-pill[data-keyword="${keyword}"]`);
    }

     // Key Takeaways Handling
    const addTakeawayBtn = document.getElementById('add-takeaway');
    const takeawaysContainer = document.getElementById('takeaways-container');

     addTakeawayBtn?.addEventListener('click', () => {
         addTakeawayInput(takeawaysContainer);
         updateJsonPreview(); // Update after adding empty
     });

    takeawaysContainer?.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-takeaway')) {
            const itemToRemove = e.target.closest('.takeaway-item');
             // Don't remove the last one
             if (takeawaysContainer.querySelectorAll('.takeaway-item').length > 1) {
                 itemToRemove.remove();
                 updateJsonPreview();
             } else {
                 // Clear the value of the last one instead
                 itemToRemove.querySelector('input').value = '';
                 updateJsonPreview();
             }
        }
    });

    function addTakeawayInput(container, value = '') {
         const div = document.createElement('div');
         div.className = 'takeaway-item';
         div.innerHTML = `
             <input type="text" class="form-control takeaway-input" placeholder="Enter a key takeaway" value="${value}">
             <span class="remove-takeaway" title="Remove takeaway">✕</span>
         `;
          // Add listener to update JSON preview on input change
         div.querySelector('input').addEventListener('input', updateJsonPreview);
         container.appendChild(div);
    }

    // JSON Preview Update
    function updateJsonPreview() {
         if (!jsonPreview || !articleForm) return;

         const articleData = {
            id: articleForm.dataset.editingId || generateArticleId(document.getElementById('article-title').value, document.getElementById('article-date').value), // Generate ID for new articles
            title: document.getElementById('article-title').value,
            slug: createSlug(document.getElementById('article-title').value),
            sourceName: document.getElementById('article-source-name').value,
            sourceUrl: document.getElementById('article-source-url').value,
            publicationDate: document.getElementById('article-date').value,
            retrievalDate: new Date().toISOString().split('T')[0], // Today's date
            category: document.getElementById('article-category').value, // Store slug for now
            summary: document.getElementById('article-summary').value,
            keywords: Array.from(keywordsContainer.querySelectorAll('.keyword-pill')).map(pill => pill.dataset.keyword),
            keyTakeaways: Array.from(takeawaysContainer.querySelectorAll('.takeaway-item input'))
                              .map(input => input.value.trim())
                              .filter(val => val !== ''), // Collect non-empty takeaways
             articleType: document.getElementById('article-type').value,
             mainImageUrl: document.getElementById('article-image').value || null,
             imageAltText: document.getElementById('article-image-alt').value || null,
             // Placeholder for richer structure if needed later
             // authors: [],
             // hero: {},
             // content: [],
             // relatedArticles: [],
             // metadata: {}
        };

         jsonPreview.textContent = JSON.stringify(articleData, null, 2);
    }

     // Helper to create slug
     function createSlug(title) {
        if (!title) return '';
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with single
     }

      // Helper to generate a somewhat unique ID
      function generateArticleId(title, date) {
         const slugPart = createSlug(title).substring(0, 50);
         const datePart = date ? date.replace(/-/g, '') : Date.now().toString().slice(-8);
         return `${slugPart}-${datePart}`;
     }

     // Add event listeners to form fields to update JSON preview
    articleForm?.addEventListener('input', updateJsonPreview);
    articleForm?.addEventListener('change', updateJsonPreview); // For select elements

    // --- Form Actions ---
    newArticleBtn?.addEventListener('click', () => showArticleForm());
    cancelFormBtn?.addEventListener('click', hideArticleForm);

    articleForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveArticle();
    });

    async function editArticle(articleId) {
        try {
            const article = await OffshoreRapportData.getArticleById(articleId);
            if (article) {
                showArticleForm(article);
            } else {
                alert(`Article with ID ${articleId} not found.`);
            }
        } catch (error) {
             console.error("Error fetching article for editing:", error);
             alert("Failed to load article data for editing.");
         }
    }

    function saveArticle() {
        // **IMPORTANT:** This is a SIMULATION for a static site.
        // It updates the JSON preview but doesn't actually save data persistently.
        // In a real application, this would send data to a backend API.
        alert("Article data generated! (Check JSON Preview).\n\nNote: This dashboard is for preview and structure generation. No data is saved persistently in this static demo.");
        console.log("Simulating save. Generated JSON:");
        console.log(jsonPreview.textContent);
        // Optionally: You could try updating the in-memory cache or localStorage
        // for a slightly more interactive demo, but it won't persist across sessions
        // without a backend or more complex local storage management.
        hideArticleForm();
        loadArticlesTable(); // Refresh table (won't show changes unless cache is updated)
    }

     function deleteArticle(articleId) {
        // **IMPORTANT:** Simulation only.
        if (confirm(`Are you sure you want to delete article ${articleId}? This action cannot be undone in this demo.`)) {
            alert(`Simulating deletion of article ${articleId}.`);
             console.log(`Simulating deletion of article ${articleId}.`);
             // Remove from table visually
             const row = articlesTableBody.querySelector(`button.delete[data-id="${articleId}"]`)?.closest('tr');
             if (row) row.remove();
             // In a real app: Send DELETE request to API, then reload table on success.
        }
     }


    // Initial Load
    loadArticlesTable();


    // --- Helper to format date for table ---
    function formatDate(dateString) {
         if (!dateString) return 'N/A';
         try {
             const date = new Date(dateString);
             if (isNaN(date.getTime())) return dateString; // Return original if invalid
             return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
         } catch (e) {
             return dateString;
         }
    }

}); // End DOMContentLoaded