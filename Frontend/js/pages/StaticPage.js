export class StaticPage {
    constructor(title, filePath, onRender = null) {
        this.title = title;
        this.filePath = filePath;
        this.onRender = onRender;
    }

    async render() {
        const newsSection = document.querySelector('.news-section');
        const grid = document.getElementById('news-grid');
        if (!newsSection || !grid) return;

        // Cleanup any category layout/sidebar as static pages use their own structure or simple grid
        const existingLayout = newsSection.querySelector('.category-layout');
        if (existingLayout) {
            const mainContent = existingLayout.querySelector('.main-content');
            if (mainContent && mainContent.contains(grid)) {
                existingLayout.before(grid);
            }
            existingLayout.remove();
        }

        // Show loading
        grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

        try {
            const response = await fetch(this.filePath);
            const html = await response.text();
            
            // Extract main content from the fetched HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main');
            
            if (mainContent) {
                grid.className = 'static-content-container';
                grid.innerHTML = mainContent.innerHTML;
                
                // Update title
                const titleEl = newsSection.querySelector('h2');
                if (titleEl) titleEl.textContent = this.title;

                // Handle scripts/logic
                if (this.onRender) {
                    this.onRender();
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                grid.innerHTML = `<p class="error-msg">Content not found for ${this.title}</p>`;
            }
        } catch (err) {
            console.error('Static page error:', err);
            grid.innerHTML = '<p class="error-msg">Failed to load content.</p>';
        }
    }
}
