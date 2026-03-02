import { fetchNews } from '../api.js';
import { createNewsCard } from '../components/NewsCard.js';
import { createSkeleton } from '../components/Skeleton.js';
import { RelatedSidebar } from '../components/RelatedSidebar.js';
import { lastUpdatedText } from '../utils.js';

export class TrendingPage {
    constructor() {
        this.categories = [
            { key: 'business', label: 'Business', icon: 'fa-chart-line' },
            { key: 'sports', label: 'Sports', icon: 'fa-football-ball' },
            { key: 'technology', label: 'Technology', icon: 'fa-microchip' },
            { key: 'entertainment', label: 'Entertainment', icon: 'fa-film' },
            { key: 'science', label: 'Science', icon: 'fa-flask' },
            { key: 'health', label: 'Health', icon: 'fa-heartbeat' }
        ];
        this.sidebar = new RelatedSidebar();
    }

    async render() {
        const newsSection = document.querySelector('.news-section');
        const grid = document.getElementById('news-grid');
        if (!newsSection || !grid) return;

        // Update title
        let titleEl = newsSection.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Trending News';

        // Remove previous sidebar/layout
        const existingLayout = newsSection.querySelector('.category-layout');
        if (existingLayout) {
            const mainContent = existingLayout.querySelector('.main-content');
            if (mainContent && mainContent.contains(grid)) {
                existingLayout.before(grid);
            }
            existingLayout.remove();
        }
        this.sidebar.destroy();

        // Show skeletons
        grid.innerHTML = createSkeleton(12);

        // Create sidebar
        this.sidebar.create('.news-section');

        // Fetch trending data per category
        const allTrending = [];

        const promises = this.categories.map(async (cat) => {
            try {
                const data = await fetchNews({ category: cat.key, page: 1, limit: 5 });
                if (data.news && data.news.length > 0) {
                    return { ...cat, news: data.news, lastUpdated: data.lastUpdated };
                }
            } catch (err) {
                console.warn(`[Trending] Failed to fetch ${cat.key}:`, err);
            }
            return null;
        });

        const results = await Promise.allSettled(promises);
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                allTrending.push(r.value);
            }
        });

        this.renderCategorizedTrending(grid, allTrending);

        // Show last updated
        const latestUpdate = allTrending.length > 0 ? allTrending[0].lastUpdated : null;
        let updateEl = newsSection.querySelector('.last-updated-bar');
        if (!updateEl) {
            updateEl = document.createElement('div');
            updateEl.className = 'last-updated-bar';
            const title = newsSection.querySelector('h2');
            if (title) title.after(updateEl);
        }
        updateEl.innerHTML = `<i class="fas fa-sync-alt"></i> ${lastUpdatedText(latestUpdate)}`;

        // Load sidebar
        this.sidebar.load('general');
    }

    renderCategorizedTrending(container, data) {
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-fire"></i>
          <h3>No trending news</h3>
          <p>Check back soon for trending headlines!</p>
        </div>
      `;
            return;
        }

        data.forEach(item => {
            const section = document.createElement('div');
            section.className = 'trending-section';

            section.innerHTML = `
        <div class="trending-header">
          <h2 class="category-heading">
            <i class="fas ${item.icon}"></i> ${item.label}
          </h2>
        </div>
        <div class="trending-cards"></div>
      `;

            const cardsContainer = section.querySelector('.trending-cards');
            item.news.forEach(article => {
                cardsContainer.appendChild(createNewsCard(article));
            });

            container.appendChild(section);
        });
    }

    destroy() {
        this.sidebar.destroy();
    }
}
