import { fetchNews, fetchTechSubCategory } from '../api.js';
import { createNewsCard } from '../components/NewsCard.js';
import { createSkeleton } from '../components/Skeleton.js';
import { CategoryPage } from './Category.js';

export class TechnologyPage extends CategoryPage {
    constructor() {
        super('technology');
        this.subCategories = [
            { label: 'All', key: '' },
            { label: 'AI Updates', key: 'Artificial Intelligence' },
            { label: 'Machine Learning', key: 'Machine Learning' },
            { label: 'Software', key: 'Software' },
            { label: 'Gadgets', key: 'Gadgets' },
            { label: 'Cybersecurity', key: 'Cybersecurity' },
            { label: 'Innovations', key: 'Innovations' },
            { label: 'Tech Startups', key: 'Startups' },
            { label: 'Tech Industry', key: 'Tech Industry' },
            { label: 'Cloud & DevOps', key: 'Cloud Computing' },
            { label: 'Blockchain', key: 'Blockchain' }
        ];
        this.activeSubCategory = '';
    }

    async render(params = {}) {
        const newsSection = document.querySelector('.news-section');
        if (!newsSection) return;

        // Render the sub-filter bar first
        this.renderSubFilterBar(newsSection);

        // Then call parent render for main content + sidebar
        await super.render({ id: 'technology' });
    }

    renderSubFilterBar(section) {
        // Remove existing
        const existing = section.querySelector('.sub-filter-bar');
        if (existing) existing.remove();

        const filterBar = document.createElement('div');
        filterBar.className = 'sub-filter-bar sticky-top';
        filterBar.setAttribute('role', 'tablist');
        filterBar.setAttribute('aria-label', 'Technology sub-categories');

        this.subCategories.forEach((sub, index) => {
            const btn = document.createElement('button');
            btn.className = `filter-btn${index === 0 ? ' active' : ''}`;
            btn.textContent = sub.label;
            btn.dataset.sub = sub.key;
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
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
        // Update active tab
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        this.activeSubCategory = subKey;

        const grid = document.getElementById('news-grid');
        if (!grid) return;

        grid.innerHTML = createSkeleton(6);

        if (!subKey) {
            // "All" — fetch general technology news
            const data = await fetchNews({ category: 'technology', page: 1, limit: 20 });
            this.updateGrid(data.news || [], false);
            this.page = 1;
            this.hasMore = data.currentPage < data.totalPages;
            this.setupInfiniteScroll('technology');
        } else {
            // Specific sub-category
            const data = await fetchTechSubCategory(subKey, 1, 20);
            this.updateGrid(data.news || [], false);
            this.page = 1;
            this.hasMore = (data.news || []).length >= 20;
        }

        // Reload sidebar for technology
        this.sidebar.load('technology');
    }
}
