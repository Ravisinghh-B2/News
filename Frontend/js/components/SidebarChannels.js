import { createCompactCard } from './NewsCard.js';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

/**
 * RelatedNewsSidebar
 * Fetches and displays real related news articles for the active category.
 * Falls back to channel links if fetch fails.
 */
export class SidebarChannels {
  constructor() {
    this.container = null;
    this.category  = 'general';
    this._abortCtrl = null;
  }

  create(parentSelector = '.news-section') {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;

    // Remove existing sidebar
    const existing = parent.querySelector('.related-sidebar');
    if (existing) existing.remove();

    // Create layout wrapper if not exists
    let layout = parent.querySelector('.category-layout');
    if (!layout) {
      layout = document.createElement('div');
      layout.className = 'category-layout';
      const newsGrid = parent.querySelector('#news-grid');
      const mainContent = document.createElement('div');
      mainContent.className = 'main-content';
      if (newsGrid) {
        newsGrid.parentNode.insertBefore(layout, newsGrid);
        mainContent.appendChild(newsGrid);
      }
      layout.appendChild(mainContent);
    }

    const sidebar = document.createElement('aside');
    sidebar.className = 'related-sidebar channels-sidebar';
    sidebar.setAttribute('role', 'complementary');
    sidebar.setAttribute('aria-label', 'Related News');

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3><i class="fas fa-layer-group"></i> Related News</h3>
        <span class="sidebar-badge" id="sidebar-cat-label">Loading…</span>
      </div>
      <div class="sidebar-scroll" id="related-scroll">
        <div class="channels-list" id="related-list">
          ${this._skeletons(5)}
        </div>
      </div>
      <div class="sidebar-footer">
        <span class="sidebar-update-time" id="sidebar-update-time">Fetching latest…</span>
      </div>`;

    layout.appendChild(sidebar);
    this.container = sidebar;
    return sidebar;
  }

  async render(category = 'general') {
    this.category = category;
    if (!this.container) return;

    // Cancel any in-flight request
    if (this._abortCtrl) this._abortCtrl.abort();
    this._abortCtrl = new AbortController();

    const list   = this.container.querySelector('#related-list');
    const label  = this.container.querySelector('#sidebar-cat-label');
    const footer = this.container.querySelector('#sidebar-update-time');

    if (!list) return;

    // Show skeleton while loading
    list.innerHTML = this._skeletons(5);
    if (label) label.textContent = this._capLabel(category);

    try {
      const res = await fetch(
        `${API_BASE}/news/related?category=${encodeURIComponent(category)}&limit=12`,
        { signal: this._abortCtrl.signal }
      );
      const data = await res.json();
      const articles = data.news || data.articles || [];

      console.log(`[Sidebar] Related news for "${category}":`, articles.length, 'articles');

      list.innerHTML = '';

      if (articles.length === 0) {
        list.innerHTML = `<div class="sidebar-empty">
          <i class="fas fa-newspaper"></i>
          <p>No related news found</p>
        </div>`;
      } else {
        articles.forEach(article => {
          const card = createCompactCard(article);
          card.addEventListener('click', () => {
            if (article.url) window.open(article.url, '_blank', 'noopener');
          });
          card.style.cursor = 'pointer';
          list.appendChild(card);
        });
      }

      if (footer) {
        const ts = data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'now';
        footer.textContent = `Updated ${ts}`;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[Sidebar] Failed to fetch related news:', err.message);
      list.innerHTML = `<div class="sidebar-empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>Could not load related news</p>
      </div>`;
    }
  }

  _skeletons(n) {
    return Array.from({ length: n }, () =>
      `<div class="sidebar-skeleton"></div>`
    ).join('');
  }

  _capLabel(cat) {
    return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'General';
  }

  destroy() {
    if (this._abortCtrl) this._abortCtrl.abort();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
