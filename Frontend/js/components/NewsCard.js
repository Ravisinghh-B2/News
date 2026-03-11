import { getFrom, showToast, timeAgo } from '../utils.js';
import { saveArticle } from '../api.js';

export function createNewsCard(article) {
  const card = document.createElement('article');
  card.className = 'news-card';
  card.setAttribute('role', 'article');

  const categoryStr = (article.category || 'general').toLowerCase();
  
  const placeholders = {
      technology: '/assets/placeholders/technology.jpg',
      sports: '/assets/placeholders/sports.jpg',
      business: '/assets/placeholders/business.jpg',
      health: '/assets/placeholders/health.jpg',
      science: '/assets/placeholders/science.jpg',
      entertainment: '/assets/placeholders/entertainment.jpg',
      world: '/assets/placeholders/world.jpg',
      general: '/assets/placeholders/news.jpg'
  };

  const categoryPlaceholder = placeholders[categoryStr] || placeholders['general'];
  const defaultImage = '/assets/placeholders/news.jpg';

  const imageUrl = article.image || article.imageUrl || article.urlToImage || article.thumbnail || '';
  const finalImage = imageUrl || categoryPlaceholder;

  const publishedTime = article.publishedAt ? timeAgo(article.publishedAt) : '';
  const user = getFrom('user');

  card.innerHTML = `
    <div class="img-wrapper">
      <img src="${finalImage}" alt="${(article.title || '').substring(0, 80)}" loading="lazy"
           onerror="this.onerror=null; this.src='${categoryPlaceholder}';">
      <div class="card-tags">
        <span class="news-category-tag">${article.category || 'News'}</span>
        ${article.subCategory ? `<span class="news-subcategory-tag">${article.subCategory}</span>` : ''}
      </div>
    </div>
    <div class="news-content">
      <h3 class="news-title">${article.title || 'Untitled'}</h3>
      <p class="news-description">${article.description || 'Click to read the full story from the original source.'}</p>
      ${article.alsoCoveredBy && article.alsoCoveredBy.length > 0
      ? `<div class="also-covered">
            <span class="covered-label"><i class="fas fa-layer-group"></i> Coverage from ${article.alsoCoveredBy.length + 1} Sources</span>
            <div class="covered-sources">
              ${article.alsoCoveredBy.slice(0, 4).map(s =>
        `<a href="${s.url}" target="_blank" rel="noopener" class="covered-source-link">${s.source}</a>`
      ).join('')}
              ${article.alsoCoveredBy.length > 4 ? `<span class="more-sources">+${article.alsoCoveredBy.length - 4} more</span>` : ''}
            </div>
          </div>`
      : ''
    }
      <div class="news-footer">
        <div class="news-meta">
          <span class="news-source"><i class="fas fa-globe"></i> ${article.source || 'Unknown'}</span>
          ${publishedTime ? `<span class="news-time"><i class="far fa-clock"></i> ${publishedTime}</span>` : ''}
        </div>
        <div class="news-actions">
          ${user ? `<button class="save-btn" title="Save Article" aria-label="Save article"><i class="far fa-bookmark"></i></button>` : ''}
          <a href="${article.url || '#'}" target="_blank" rel="noopener" class="read-more-link" aria-label="Read full article">
            Read More <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  // Save button handler
  if (user) {
    const saveBtn = card.querySelector('.save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const icon = saveBtn.querySelector('i');
        try {
          const result = await saveArticle(article, user.token);
          if (result.message === 'Article saved successfully') {
            icon.classList.replace('far', 'fas');
            saveBtn.classList.add('saved');
            showToast('Article saved!', 'success');
          } else {
            showToast(result.message || 'Already saved', 'info');
          }
        } catch (error) {
          showToast('Login required to save', 'error');
        }
      });
    }
  }

  return card;
}

// Compact card for sidebar
export function createCompactCard(article) {
  const card = document.createElement('div');
  card.className = 'compact-card';

  const categoryStr = (article.category || 'general').toLowerCase();
  
  const placeholders = {
      technology: '/assets/placeholders/technology.jpg',
      sports: '/assets/placeholders/sports.jpg',
      business: '/assets/placeholders/business.jpg',
      health: '/assets/placeholders/health.jpg',
      science: '/assets/placeholders/science.jpg',
      entertainment: '/assets/placeholders/entertainment.jpg',
      world: '/assets/placeholders/world.jpg',
      general: '/assets/placeholders/news.jpg'
  };

  const categoryPlaceholder = placeholders[categoryStr] || placeholders['general'];
  const defaultImage = '/assets/placeholders/news.jpg';

  const imageUrl = article.image || article.imageUrl || article.urlToImage || article.thumbnail || '';
  const finalImage = imageUrl || categoryPlaceholder;

  const publishedTime = article.publishedAt ? timeAgo(article.publishedAt) : '';

  card.innerHTML = `
  <div class="compact-img" style="flex: 0 0 100px; height: 100px; overflow: hidden; border-radius: 0.5rem;">
      <img src="${finalImage}" alt="${(article.title || '').substring(0, 80)}" loading="lazy" 
           onerror="this.onerror=null; this.src='${categoryPlaceholder}';" 
           style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div class="compact-info" style="flex: 1; min-width: 0;">
      <h4 class="compact-title">
        <a href="${article.url || '#'}" target="_blank" rel="noopener">${article.title || 'Untitled'}</a>
      </h4>
      <div class="compact-meta">
        <span class="compact-source">${article.source || 'Unknown'}</span>
        ${publishedTime ? `<span class="compact-time">${publishedTime}</span>` : ''}
      </div>
      ${article.alsoCoveredBy && article.alsoCoveredBy.length > 0
      ? `<div class="compact-covered">
            <span>+${article.alsoCoveredBy.length} source${article.alsoCoveredBy.length > 1 ? 's' : ''}</span>
          </div>`
      : ''
    }
    </div>
  `;

  return card;
}
