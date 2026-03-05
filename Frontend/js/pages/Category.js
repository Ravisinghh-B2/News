import { fetchNews, fetchNewsStatus } from '../api.js';
import { createNewsCard } from '../components/NewsCard.js';
import { createSkeleton } from '../components/Skeleton.js';
import { RelatedSidebar } from '../components/RelatedSidebar.js';
import { lastUpdatedText } from '../utils.js';

export class CategoryPage {
    constructor(category, subCategories = []) {
        this.category = category;
        this.subCategories = subCategories.length > 0
            ? [{ label: 'All', key: '' }, ...subCategories.map(sub => ({ label: sub, key: sub }))]
            : [];
        this.activeSubCategory = '';
        this.page = 1;
        this.loading = false;
        this.hasMore = true;
        this.sidebar = new RelatedSidebar();
    }

    async render(params = {}) {
        const category = params.id || this.category;
        const subCategory = this.activeSubCategory || null;
        const newsSection = document.querySelector('.news-section');
        const grid = document.getElementById('news-grid');

        if (!newsSection || !grid) return;

        // Update section title
        const displayName = category.charAt(0).toUpperCase() + category.slice(1);
        this.updateSectionTitle(newsSection, subCategory ? `${displayName}: ${subCategory}` : `${displayName} News`);

        // Handle sub-filter bar
        if (this.subCategories.length > 0) {
            this.renderSubFilterBar(newsSection);
        }

        // Remove any existing layout wrapper and sidebar
        this.cleanupLayout(newsSection, grid);

        // Show skeletons
        grid.innerHTML = createSkeleton(6);

        // Create sidebar
        this.sidebar.create('.news-section');

        try {
            // Fetch structured news
            const data = await fetchNews({ category, subCategory });

            // Clear grid for sections
            grid.innerHTML = '';
            grid.className = 'structured-news-container';

            // 1. Indian Current News
            this.renderSection(grid, 'Indian Current News', data.indian || [], 'india-section');

            // 2. Worldwide News
            this.renderSection(grid, 'Worldwide News', data.worldwide || [], 'world-section');

            // 3. Related / Similar News (Grouped)
            this.renderGroupedSection(grid, 'Related / Similar News', data.relatedGroups || [], 'related-groups-section');

            // Show last updated
            this.showLastUpdated(newsSection, data.lastUpdated);

            // Load sidebar for general context
            this.sidebar.load(category);
        } catch (error) {
            console.error('Render error:', error);
            grid.innerHTML = '<p class="error-msg">Failed to load news. Please try again later.</p>';
        }
    }

    renderSubFilterBar(section) {
        // Remove existing
        const existing = section.querySelector('.sub-filter-bar');
        if (existing) existing.remove();

        const filterBar = document.createElement('div');
        filterBar.className = 'sub-filter-bar sticky-top';
        filterBar.setAttribute('role', 'tablist');

        this.subCategories.forEach(sub => {
            const btn = document.createElement('button');
            const isActive = this.activeSubCategory === sub.key;
            btn.className = `filter-btn${isActive ? ' active' : ''}`;
            btn.textContent = sub.label;
            btn.dataset.sub = sub.key;
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.addEventListener('click', () => this.handleSubFilter(btn, sub.key));
            filterBar.appendChild(btn);
        });

        // Insert after the h2 title
        const title = section.querySelector('h2');
        if (title) {
            title.after(filterBar);
        } else {
            section.prepend(filterBar);
        }
    }

    async handleSubFilter(btn, subKey) {
        if (this.activeSubCategory === subKey) return;

        // Update active state
        const section = document.querySelector('.news-section');
        section.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        this.activeSubCategory = subKey;

        // Re-render only content area
        const grid = document.getElementById('news-grid');
        grid.innerHTML = createSkeleton(6);

        await this.render();
    }

    renderSection(container, title, news, className) {
        if (!news || news.length === 0) return;

        const section = document.createElement('div');
        section.className = `news-section-block ${className}`;
        section.innerHTML = `
            <h3 class="section-subtitle">${title}</h3>
            <div class="news-grid-inner"></div>
        `;

        const innerGrid = section.querySelector('.news-grid-inner');
        news.forEach(article => {
            innerGrid.appendChild(createNewsCard(article));
        });

        container.appendChild(section);
    }

    renderGroupedSection(container, title, groups, className) {
        if (!groups || groups.length === 0) return;

        const section = document.createElement('div');
        section.className = `news-section-block ${className}`;
        section.innerHTML = `
            <h3 class="section-subtitle">${title}</h3>
            <div class="grouped-news-container"></div>
        `;

        const groupContainer = section.querySelector('.grouped-news-container');
        groups.forEach(group => {
            const card = createNewsCard(group.primary);
            if (group.related && group.related.length > 0) {
                const groupInfo = document.createElement('div');
                groupInfo.className = 'group-tag';
                groupInfo.innerHTML = `<i class="fas fa-layer-group"></i> Grouped from ${group.related.length + 1} sources`;
                card.querySelector('.news-content').prepend(groupInfo);
            }
            groupContainer.appendChild(card);
        });

        container.appendChild(section);
    }

    updateSectionTitle(section, title) {
        let titleEl = section.querySelector('h2');
        if (!titleEl) {
            titleEl = document.createElement('h2');
            section.prepend(titleEl);
        }
        titleEl.textContent = title;
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
        const existingLayout = section.querySelector('.category-layout');
        if (existingLayout) {
            const mainContent = existingLayout.querySelector('.main-content');
            if (mainContent && mainContent.contains(grid)) {
                existingLayout.before(grid);
            }
            existingLayout.remove();
        }
        this.sidebar.destroy();
        grid.className = 'news-grid'; // Reset to default
    }

    destroy() {
        this.sidebar.destroy();
    }
}
