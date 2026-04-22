// Simple hash-based SPA Router
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.container = document.getElementById('news-grid'); // Main content area
        window.addEventListener('hashchange', () => this.handleRoute());

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                const target = link.getAttribute('href') || '';
                this.navigateTo(target);
            }
        });

        if (!window.location.hash) {
            window.location.hash = '/';
        }

        this.handleRoute();
    }

    navigateTo(path) {
        if (!path || path === '/') {
            window.location.hash = '/';
            return;
        }

        if (path.startsWith('#')) {
            window.location.hash = path;
        } else if (path.startsWith('/')) {
            window.location.hash = `#${path}`;
        } else {
            window.location.hash = `#/${path}`;
        }
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        const path = hash.startsWith('#') ? hash.slice(1) : hash;
        const route = this.matchRoute(path);

        if (route) {
            if (route.page) {
                route.page.render(route.params);
            }
        } else {
            // Default fallback to home
            this.navigateTo('/');
        }
    }

    matchRoute(path) {
        for (const route of this.routes) {
            const regex = new RegExp(`^${route.path.replace(/:\w+/g, '([^/]+)')}$`);
            const match = path.match(regex);
            if (match) {
                const params = {};
                const keys = (route.path.match(/:\w+/g) || []).map(k => k.substring(1));
                keys.forEach((key, i) => params[key] = match[i + 1]);
                return { ...route, params };
            }
        }
        return null;
    }
}
