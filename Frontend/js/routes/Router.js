// Simple SPA Router
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.container = document.getElementById('news-grid'); // Main content area
        window.addEventListener('popstate', () => this.handleRoute());

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigateTo(link.getAttribute('href'));
            }
        });

        this.handleRoute();
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        const route = this.matchRoute(path);

        if (route) {
            if (route.page) {
                route.page.render(route.params);
            }
        } else {
            // 404 or home
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
