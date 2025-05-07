/**
 * Offshore Rapport v3 - Article Renderer Module
 * Handles creating HTML elements from article data.
 */

const OffshoreRapportRenderer = (() => {

    function formatDate(dateString) {
         if (!dateString) return '';
         try {
             const date = new Date(dateString);
             // Check if the date is valid
             if (isNaN(date.getTime())) {
                // Try parsing common formats if default fails
                const parts = dateString.split('-');
                if (parts.length === 3) {
                   const parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                   if (!isNaN(parsedDate.getTime())) {
                      return parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                   }
                }
                console.warn(`Invalid date format encountered: ${dateString}`);
                return dateString; // Return original string if parsing fails
             }
             return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
         } catch (e) {
             console.error(`Error formatting date: ${dateString}`, e);
             return dateString; // Return original string on error
         }
     }

    function calculateReadingTime(article) {
        // Basic estimation: 200 words per minute
        // Improve this by actually counting words in article.content if available
        const wordCount = (article.summary?.split(' ').length || 0) + (article.content?.reduce((acc, block) => acc + (block.content?.split(' ').length || 0), 0) || 0);
        const minutes = Math.ceil(wordCount / 200);
        return minutes > 0 ? `${minutes} Min Read` : '';
    }

    function createArticleCard(article) {
        if (!article) return null;

        const card = document.createElement('article');
        card.className = `article-card card animate-on-scroll from-bottom card-hover-lift article-card-category-${article.category?.slug || article.category || 'default'}`; // Add category class

        const categorySlug = article.category?.slug || article.category || 'default';
        const categoryName = article.category?.name || categorySlug.replace('-', ' ');

        // Default image if none provided
        const imageUrl = article.mainImageUrl || `https://source.unsplash.com/random/600x400/?${categorySlug},ocean`;
        const imageAlt = article.imageAltText || article.title || `Image related to ${categoryName}`;

         const readingTime = calculateReadingTime(article);
         const formattedDate = formatDate(article.publicationDate);

        card.innerHTML = `
            <a href="article.html?id=${article.id}" class="article-link">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${imageAlt}" loading="lazy">
                </div>
                <div class="card-content">
                    ${categoryName ? `<span class="category-pill ${categorySlug}">${categoryName}</span>` : ''}
                    <h3>${article.title || 'Untitled Article'}</h3>
                    <p class="excerpt">${article.summary || ''}</p>
                    <div class="article-meta">
                         <span class="metadata">${formattedDate ? `${formattedDate}` : ''} ${readingTime ? `• ${readingTime}` : ''}</span>
                         ${article.sourceName ? `<span class="byline">Source: ${article.sourceName}</span>` : ''}
                     </div>
                    ${article.keywords && article.keywords.length > 0 ? `
                    <div class="article-card-tags">
                        ${article.keywords.slice(0, 3).map(tag => `<span class="article-card-tag">${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                </div>
            </a>`;
        return card;
    }

    function renderArticleGrid(articles, containerElement) {
         if (!containerElement) {
             console.error("Container element for rendering articles not found.");
             return;
         }
         containerElement.innerHTML = ''; // Clear existing content or loading indicator

         if (!articles || articles.length === 0) {
             containerElement.innerHTML = '<p>No articles available in this category.</p>';
             return;
         }

         articles.forEach(article => {
             const card = createArticleCard(article);
             if (card) {
                containerElement.appendChild(card);
             }
         });
     }

     function renderArticleContentBlock(block) {
         switch(block.type) {
            case 'paragraph':
                return `<p>${block.content}</p>`;
            case 'heading':
                return `<h${block.level}>${block.content}</h${block.level}>`;
             case 'image':
                 const imgUrl = block.src || `https://source.unsplash.com/random/1000x600/?${block.altText || 'ocean'}`;
                 const imgAlt = block.altText || block.caption || 'Article image';
                 return `
                     <figure class="article-image">
                         <img src="${imgUrl}" alt="${imgAlt}" loading="lazy">
                         ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                     </figure>`;
             case 'quote':
                 return `
                     <blockquote>
                         <p>${block.content}</p>
                         ${block.attribution ? `<cite>– ${block.attribution}</cite>` : ''}
                     </blockquote>`;
            case 'list':
                const listTag = block.style === 'ordered' ? 'ol' : 'ul';
                const itemsHtml = block.items.map(item => `<li>${item}</li>`).join('');
                return `<${listTag}>${itemsHtml}</${listTag}>`;
             // Add more block types as needed (e.g., video, code block)
             default:
                 console.warn(`Unsupported content block type: ${block.type}`);
                 return '';
         }
     }


    async function renderArticlePage(article) {
         if (!article) return;

         const categorySlug = article.category?.slug || article.category || 'default';
         const categoryName = article.category?.name || categorySlug.replace('-', ' ');

         // Set Meta Info
         document.title = `${article.title} | ${categoryName} | Offshore Rapport`;
         document.querySelector('meta[name="description"]').setAttribute("content", article.summary || article.title);
         document.body.className = `article-page ${categorySlug}`;

         // Update Header elements
         const headerCategoryPill = document.querySelector('.article-header .category-pill');
         const headerTitle = document.querySelector('.article-header .article-title');
         const headerByline = document.querySelector('.article-header .byline');
         const headerMetadata = document.querySelector('.article-header .metadata');

         if (headerCategoryPill) {
             headerCategoryPill.textContent = categoryName;
             headerCategoryPill.className = `category-pill ${categorySlug}`;
         }
         if (headerTitle) headerTitle.textContent = article.title;

         // Author Info - fetch if needed
         let authorText = article.authors?.[0]?.name ? `By ${article.authors[0].name}` : (article.sourceName ? `From ${article.sourceName}` : '');
          if (headerByline) headerByline.textContent = authorText;

         const readingTime = calculateReadingTime(article);
         const formattedDate = formatDate(article.publicationDate);
         const updatedDate = article.updateDate ? formatDate(article.updateDate) : null;
         if (headerMetadata) headerMetadata.textContent = `Published: ${formattedDate} ${readingTime ? `• ${readingTime}` : ''} ${updatedDate ? `• Updated: ${updatedDate}` : ''}`;

        // Update Hero Image
         const heroImageElement = document.querySelector('.article-hero .hero-image img');
         const heroFigcaptionElement = document.querySelector('.article-hero .hero-image figcaption');
         const defaultHeroUrl = `https://source.unsplash.com/random/1400x800/?${categorySlug},ocean,${article.keywords?.[0] || ''}`;
         const heroUrl = article.hero?.image || article.mainImageUrl || defaultHeroUrl;
         const heroAlt = article.hero?.altText || article.imageAltText || article.title;
         const heroCaption = article.hero?.caption || article.hero?.credit || '';

         if (heroImageElement) {
            heroImageElement.src = heroUrl;
            heroImageElement.alt = heroAlt;
         }
         if (heroFigcaptionElement) {
            heroFigcaptionElement.textContent = heroCaption;
            heroFigcaptionElement.style.display = heroCaption ? 'block' : 'none';
         }

         // Render Article Content
         const contentWrapper = document.querySelector('.article-content .content-wrapper');
         if (contentWrapper) {
            // Start with lead paragraph if exists, otherwise use summary
            let contentHtml = `<p class="lead">${article.summary}</p>`;

            if (article.content && Array.isArray(article.content)) {
                contentHtml += article.content.map(renderArticleContentBlock).join('');
            } else {
                 // Fallback if content structure is missing or wrong
                 console.warn("Article content array is missing or invalid. Displaying summary only.");
             }

             // Render Tags
              if (article.tags && article.tags.length > 0) {
                 contentHtml += `
                     <div class="article-tags">
                         ${article.tags.map(tag => `<a href="category.html?category=${categorySlug}&tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}
                     </div>`;
              }

             contentWrapper.innerHTML = contentHtml; // Replace content
         } else {
             console.error("Content wrapper element not found.");
         }

        // Update Sidebar Author Bio (Fetch if needed)
         const authorBioContainer = document.querySelector('.author-bio');
         if (authorBioContainer && article.authors && article.authors.length > 0) {
             const authorId = article.authors[0].id;
             const author = await OffshoreRapportData.getAuthorById(authorId); // Assume async fetch
             if (author) {
                authorBioContainer.innerHTML = `
                    <img src="${author.avatar || 'https://source.unsplash.com/random/100x100/?person'}" alt="${author.name}" class="author-image">
                    <h3>${author.name}</h3>
                    <p>${author.bio || 'Contributor at Offshore Rapport.'}</p>
                `;
             } else {
                 // Fallback if author data isn't available but name is
                 authorBioContainer.innerHTML = `<h3>${article.authors[0].name}</h3><p>${article.authors[0].role || 'Contributor'}</p>`;
             }
         } else if (authorBioContainer) {
             authorBioContainer.style.display = 'none'; // Hide if no author
         }

        // Update Related Articles (Placeholder/Simple Links)
        const relatedList = document.querySelector('.related-articles ul');
        if (relatedList && article.relatedArticles && article.relatedArticles.length > 0) {
            // In a real app, you'd fetch titles for these IDs
            relatedList.innerHTML = article.relatedArticles.map(relId =>
                `<li><a href="article.html?id=${relId}">Related Article (${relId.substring(0, 8)}...)</a></li>`
            ).join('');
        } else if (relatedList) {
            document.querySelector('.related-articles').style.display = 'none'; // Hide if no related
        }


        // Populate "More From Category" section
        const moreArticlesContainer = document.querySelector('.more-articles .article-grid');
        if (moreArticlesContainer) {
            OffshoreRapportData.getArticlesByCategory(categorySlug, 4) // Get 4 articles
                .then(moreArticles => {
                    // Filter out the current article and take the first 3 others
                    const displayArticles = moreArticles.filter(a => a.id !== article.id).slice(0, 3);
                    renderArticleGrid(displayArticles, moreArticlesContainer);
                     OffshoreRapportAnimations.initializeScrollAnimations(moreArticlesContainer);
                })
                .catch(err => console.error("Error loading more articles:", err));
        }
     }

    // Public API
    return {
        createArticleCard,
        renderArticleGrid,
        renderArticlePage
        // initializeAnimations: OffshoreRapportAnimations.initializeScrollAnimations // Expose for convenience? Or keep separate.
    };
})();