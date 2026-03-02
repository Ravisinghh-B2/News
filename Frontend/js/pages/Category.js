import { fetchNews, fetchNewsStatus } from '../api.js';
import { createNewsCard } from '../components/NewsCard.js';
import { createSkeleton } from '../components/Skeleton.js';
import { RelatedSidebar } from '../components/RelatedSidebar.js';
import { lastUpdatedText } from '../utils.js';

export class CategoryPage {
    constructor(category) {
        this.category = category;
        this.page = 1;
        this.loading = false;
        this.hasMore = true;
        this.sidebar = new RelatedSidebar();
    }

    async render(params = {}) {
        const category = params.id || this.category;
        const newsSection = document.querySelector('.news-section');
        const grid = document.getElementById('news-grid');

        if (!newsSection || !grid) return;

        // Update section title
        this.updateSectionTitle(newsSection, category);

        // Remove any existing layout wrapper and sidebar
        this.cleanupLayout(newsSection, grid);

        // Show skeletons
        grid.innerHTML = createSkeleton(6);
        this.page = 1;
        this.hasMore = true;

        // Create sidebar
        this.sidebar.create('.news-section');

        // Fetch main news
        const data = await fetchNews({ category, page: 1, limit: 20 });
        this.updateGrid(data.news || [], false);

        if (data.currentPage >= data.totalPages) {
            this.hasMore = false;
        }

        // Show last updated
        this.showLastUpdated(newsSection, data.lastUpdated);

        // Load sidebar
        this.sidebar.load(category);

        // Setup infinite scroll
        this.setupInfiniteScroll(category);
    }

    updateSectionTitle(section, category) {
        let titleEl = section.querySelector('h2');
        if (!titleEl) {
            titleEl = document.createElement('h2');
            section.prepend(titleEl);
        }
        const displayName = category.charAt(0).toUpperCase() + category.slice(1);
        titleEl.textContent = `${displayName} News`;
    }

    showLastUpdated(section, lastUpdated) {
        let updateEl = section.querySelector('.last-updated-bar');
        if (!updateEl) {
            updateEl = document.createElement('div');
            updateEl.className = 'last-updated-bar';
            const titleEl = section.querySelector('h2');
            if (titleEl) {
                titleEl.after(updateEl);
            } else {
                section.prepend(updateEl);
            }
        }
        updateEl.innerHTML = `<i class="fas fa-sync-alt"></i> ${lastUpdatedText(lastUpdated)}`;
    }

    cleanupLayout(section, grid) {
        // If there's already a category-layout, unwrap the grid
        const existingLayout = section.querySelector('.category-layout');
        if (existingLayout) {
            const mainContent = existingLayout.querySelector('.main-content');
            if (mainContent && mainContent.contains(grid)) {
                existingLayout.before(grid);
            }
            existingLayout.remove();
        }
        this.sidebar.destroy();
    }

    updateGrid(news, append = false) {
        const grid = document.getElementById('news-grid');
        if (!grid) return;

        if (!append) grid.innerHTML = '';

        if (news.length === 0 && !append) {
            grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>No news found</h3>
          <p>No articles available for this category right now. Check back later!</p>
        </div>
      `;
            return;
        }

        news.forEach(article => {
            grid.appendChild(createNewsCard(article));
        });
    }

    setupInfiniteScroll(category) {
        // Remove previous handler
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }

        this.scrollHandler = async () => {
            if (this.loading || !this.hasMore) return;

            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
                this.loading = true;
                this.page++;

                // Show a loading indicator
                const grid = document.getElementById('news-grid');
                const loader = document.createElement('div');
                loader.className = 'scroll-loader';
                loader.innerHTML = '<div class="spinner-small"></div>';
                grid?.appendChild(loader);

                const data = await fetchNews({ category, page: this.page, limit: 20 });
                loader.remove();

                this.updateGrid(data.news || [], true);

                if (data.currentPage >= data.totalPages || (data.news || []).length === 0) {
                    this.hasMore = false;
                }
                this.loading = false;
            }
        };

        window.addEventListener('scroll', this.scrollHandler);
    }

    destroy() {
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        this.sidebar.destroy();
    }
}
