import { fetchRelatedNews } from '../api.js';
import { createCompactCard } from './NewsCard.js';

/**
 * RelatedSidebar — Creates and manages a scrolling related-news sidebar
 * Auto-scrolling, auto-updating, responsive (moves below on mobile)
 */
export class RelatedSidebar {
    constructor() {
        this.container = null;
        this.scrollInterval = null;
        this.category = 'general';
        this.news = [];
        this.isPaused = false;
    }

    /**
     * Create the sidebar DOM structure
     */
    create(parentSelector = '.news-section') {
        const parent = document.querySelector(parentSelector);
        if (!parent) return;

        // Remove existing sidebar if any
        const existing = parent.querySelector('.related-sidebar');
        if (existing) existing.remove();

        // Create layout wrapper if not exists
        let layout = parent.querySelector('.category-layout');
        if (!layout) {
            layout = document.createElement('div');
            layout.className = 'category-layout';

            // Move existing news-grid into layout
            const newsGrid = parent.querySelector('#news-grid');
            const mainContent = document.createElement('div');
            mainContent.className = 'main-content';

            if (newsGrid) {
                // Move the grid into the main content wrapper
                newsGrid.parentNode.insertBefore(layout, newsGrid);
                mainContent.appendChild(newsGrid);
            }

            layout.appendChild(mainContent);
        }

        // Create sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'related-sidebar';
        sidebar.setAttribute('role', 'complementary');
        sidebar.setAttribute('aria-label', 'Related news');

        sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3><i class="fas fa-fire-alt"></i> Related News</h3>
        <span class="sidebar-badge">Live</span>
      </div>
      <div class="sidebar-scroll" id="sidebar-scroll">
        <div class="sidebar-loading">
          <div class="sidebar-skeleton"></div>
          <div class="sidebar-skeleton"></div>
          <div class="sidebar-skeleton"></div>
          <div class="sidebar-skeleton"></div>
          <div class="sidebar-skeleton"></div>
        </div>
      </div>
      <div class="sidebar-footer">
        <span class="sidebar-update-time" id="sidebar-update-time"></span>
      </div>
    `;

        layout.appendChild(sidebar);
        this.container = sidebar;

        // Pause auto-scroll on hover
        const scrollContainer = sidebar.querySelector('.sidebar-scroll');
        scrollContainer.addEventListener('mouseenter', () => { this.isPaused = true; });
        scrollContainer.addEventListener('mouseleave', () => { this.isPaused = false; });

        return sidebar;
    }

    /**
     * Load related news and populate sidebar
     */
    async load(category = 'general') {
        this.category = category;

        if (!this.container) return;

        const scrollContainer = this.container.querySelector('.sidebar-scroll');
        if (!scrollContainer) return;

        try {
            const data = await fetchRelatedNews(category, 15);
            this.news = data.news || [];

            scrollContainer.innerHTML = '';

            if (this.news.length === 0) {
                scrollContainer.innerHTML = `
          <div class="sidebar-empty">
            <i class="fas fa-inbox"></i>
            <p>No related news found</p>
          </div>
        `;
                return;
            }

            // Render compact cards
            this.news.forEach(article => {
                scrollContainer.appendChild(createCompactCard(article));
            });

            // Update timestamp
            const timeEl = this.container.querySelector('#sidebar-update-time');
            if (timeEl) {
                timeEl.textContent = `Updated just now`;
            }

            // Start auto-scroll
            this.startAutoScroll();

        } catch (error) {
            console.error('[Sidebar] Load error:', error);
            scrollContainer.innerHTML = `
        <div class="sidebar-empty">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load related news</p>
        </div>
      `;
        }
    }

    /**
     * Auto-scrolling animation
     */
    startAutoScroll() {
        this.stopAutoScroll();

        const scrollContainer = this.container?.querySelector('.sidebar-scroll');
        if (!scrollContainer) return;

        this.scrollInterval = setInterval(() => {
            if (this.isPaused) return;

            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

            if (scrollTop + clientHeight >= scrollHeight - 5) {
                // Reset to top with smooth transition
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                scrollContainer.scrollBy({ top: 1, behavior: 'auto' });
            }
        }, 50);
    }

    /**
     * Stop auto-scrolling
     */
    stopAutoScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    /**
     * Destroy the sidebar
     */
    destroy() {
        this.stopAutoScroll();
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}
