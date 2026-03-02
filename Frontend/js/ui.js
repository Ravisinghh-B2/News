import { formatDate, getFrom, showToast } from './utils.js';
import { saveArticle } from './api.js';
import { createNewsCard } from './components/NewsCard.js';

export function renderNewsCards(articles) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  if (!articles || articles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No articles found</h3>
        <p>Try a different category or search term.</p>
      </div>
    `;
    return;
  }

  articles.forEach(article => {
    const card = createNewsCard(article);
    grid.appendChild(card);
  });
}

export function clearNewsGrid() {
  const grid = document.getElementById('news-grid');
  if (grid) grid.innerHTML = '';
}
