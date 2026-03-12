import { fetchNews } from '../api.js';
import { createNewsCard } from '../components/NewsCard.js';
import { createSkeleton } from '../components/Skeleton.js';
import { SidebarChannels } from '../components/SidebarChannels.js';
import { lastUpdatedText } from '../utils.js';

import { debounce } from '../utils.js';

export class CategoryPage {
    constructor(category, subCategories = []) {
        this.category = category;
        this.subCategories = subCategories.length > 0
            ? [{ label: 'All', key: '' }, ...subCategories.map(sub => ({ label: sub, key: sub }))]
            : [];
        this.activeSubCategory = '';
        this.sidebar = new SidebarChannels();
        this.isFetching = false;
        this.currentAbortController = null;
        this.debouncedFilter = debounce((btn, subKey) => this.executeSubFilter(btn, subKey), 300);
    }

    async render(params = {}) {
        const category = params.id || this.category || 'general';
        this.category = category; 
        const isHome = category === 'general';
        
        const newsSection = document.querySelector('.news-section');
        let grid = document.getElementById('news-grid');
        const hero = document.querySelector('.hero');
        const categoriesSection = document.querySelector('.categories');

        if (!newsSection) return;

        // Toggle Home-only sections
        if (hero) hero.style.display = isHome ? 'grid' : 'none';
        if (categoriesSection) categoriesSection.style.display = isHome ? 'block' : 'none';

        // Set up grid and layout
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'news-grid';
            grid.className = 'news-grid';
            newsSection.appendChild(grid);
        } else {
            grid.className = 'news-grid';
        }

        this.renderCategoryHeader(newsSection, category, isHome);
        
        if (!isHome && this.subCategories.length > 0) {
            this.renderSubFilterBar(newsSection);
        } else if (isHome) {
            const fb = newsSection.querySelector('.sub-filter-bar');
            if (fb) fb.remove();
        }

        // Set up Sidebar
        this.sidebar.create('.news-section');
        this.sidebar.render(this.category === 'general' ? 'world' : this.category);

        // Scroll to top of news section on category change
        if (!isHome) {
            newsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Initial Data Load
        await this.loadNewsData(this.category, this.activeSubCategory, newsSection);
    }

    async loadNewsData(category, subCategory, newsSection, isFallback = false, fallbackCount = 0) {
        if (this.isFetching && !isFallback) return; // Prevent duplicate concurrent fetches
        
        const grid = document.getElementById('news-grid');
        if (!grid) return;
        
        this.isFetching = true;

        if (!isFallback) {
            grid.innerHTML = createSkeleton(6);
            // Remove old last updated bar
            const oldUpdateEl = newsSection.querySelector('.last-updated-bar');
            if (oldUpdateEl) oldUpdateEl.remove();
        }

        try {
            const data = await fetchNews({ category, subCategory });
            const hasIndian = data.indian && data.indian.length > 0;
            const hasWorld = data.worldwide && data.worldwide.length > 0;
            
            if (hasIndian || hasWorld) {
                grid.innerHTML = '';
                
                if (hasIndian) {
                    this.renderSection(grid, 'Indian Coverage', data.indian, 'india-section');
                }
                if (hasWorld) {
                    this.renderSection(grid, 'Global Coverage', data.worldwide, 'world-section');
                }
                if (data.relatedGroups && data.relatedGroups.length > 0) {
                    this.renderGroupedSection(grid, 'Context & Analysis', data.relatedGroups, 'related-groups-section');
                }

                if (data.lastUpdated) {
                    this.showLastUpdated(newsSection, data.lastUpdated);
                }
            } else {
                const FALLBACKS = ['top', 'breaking', 'technology', 'business', 'sports', 'entertainment'];
                let nextFallbackIdx = FALLBACKS.indexOf(category) + 1;
                if (FALLBACKS.indexOf(category) === -1) {
                    nextFallbackIdx = 0;
                }

                if (nextFallbackIdx < FALLBACKS.length && !subCategory && fallbackCount < 2) {
                    const nextCategory = FALLBACKS[nextFallbackIdx];
                    console.log(`No results for ${category}, falling back to ${nextCategory}... (Attempt ${fallbackCount + 1})`);
                    return await this.loadNewsData(nextCategory, null, newsSection, true, fallbackCount + 1);
                }

                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-newspaper"></i>
                        <h3>No news found</h3>
                        <p>We couldn't find any articles for "${subCategory || category}". Try another category.</p>
                        <button class="btn primary-btn" onclick="window.router.navigateTo('/')">Back to Home</button>
                    </div>`;
            }

        } catch (error) {
            console.error('Render error:', error);
            
            if (error.status === 429) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <h3>Service Busy</h3>
                        <p>News service is temporarily busy. Please try again later.</p>
                    </div>`;
            } else {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Failed to load news</h3>
                        <p>There was a problem communicating with our servers. (${error.message || 'Network error'})</p>
                        <button class="btn primary-btn" id="retry-btn">Try Again</button>
                    </div>`;
                
                const retryBtn = grid.querySelector('#retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        this.loadNewsData(category, subCategory, newsSection, isFallback, fallbackCount);
                    });
                }
            }
        } finally {
            this.isFetching = false;
        }
    }

    renderCategoryHeader(section, category, isHome) {
        const existingHeader = section.querySelector('.category-header');
        if (existingHeader) existingHeader.remove();
        
        const titleEl = section.querySelector('h2');
        if (titleEl) titleEl.remove();

        if (isHome) {
            const h2 = document.createElement('h2');
            h2.className = 'section-title';
            h2.textContent = 'Top Stories Today';
            section.prepend(h2);
            return;
        }

        const header = document.createElement('div');
        header.className = 'category-header';
        
        const displayName = category.charAt(0).toUpperCase() + category.slice(1);
        header.innerHTML = `
            <button class="back-btn-inline" data-link href="/">
                <i class="fas fa-arrow-left"></i> Home
            </button>
            <h1 class="category-title">${displayName} News</h1>
            <p class="category-subtitle">Deep dive into ${displayName} with coverage from 50+ trusted sources.</p>
        `;

        header.querySelector('.back-btn-inline').addEventListener('click', (e) => {
            e.preventDefault();
            window.router.navigateTo('/');
        });

        section.prepend(header);
    }

    renderSubFilterBar(section) {
        const header = section.querySelector('.category-header');
        let filterBar = section.querySelector('.sub-filter-bar');
        
        if (!filterBar) {
            filterBar = document.createElement('div');
            filterBar.className = 'sub-filter-bar sticky-top';
            filterBar.setAttribute('role', 'tablist');
            if (header) header.after(filterBar);
            else section.prepend(filterBar);
        } else {
            filterBar.innerHTML = '';
        }

        this.subCategories.forEach(sub => {
            const btn = document.createElement('button');
            const isActive = this.activeSubCategory === sub.key;
            btn.className = `filter-btn${isActive ? ' active' : ''}`;
            btn.textContent = sub.label;
            btn.dataset.sub = sub.key;
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            
            // UI updates immediately for snappiness, API call is debounced
            btn.addEventListener('click', () => {
                const filterBar = document.querySelector('.sub-filter-bar');
                if (filterBar) {
                    filterBar.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-selected', 'false');
                    });
                }
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                
                this.debouncedFilter(btn, sub.key);
            });
            filterBar.appendChild(btn);
        });
    }

    async executeSubFilter(btn, subKey) {
        if (this.activeSubCategory === subKey) return;
        this.activeSubCategory = subKey;
        const newsSection = document.querySelector('.news-section');
        
        await this.loadNewsData(this.category, this.activeSubCategory, newsSection);
    }

    renderSection(container, title, news, className) {
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
                const content = card.querySelector('.news-content');
                if (content) content.prepend(groupInfo);
            }
            groupContainer.appendChild(card);
        });

        container.appendChild(section);
    }

    showLastUpdated(section, lastUpdated) {
        let updateEl = section.querySelector('.last-updated-bar');
        if (!updateEl) {
            updateEl = document.createElement('div');
            updateEl.className = 'last-updated-bar';
            const filterBar = section.querySelector('.sub-filter-bar');
            if (filterBar) filterBar.after(updateEl);
            else section.prepend(updateEl);
        }
        updateEl.innerHTML = `<i class="fas fa-sync-alt"></i> ${lastUpdatedText(lastUpdated)}`;
    }

    destroy() {
        this.sidebar.destroy();
    }
}

