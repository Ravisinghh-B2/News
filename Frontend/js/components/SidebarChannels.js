
/**
 * SidebarChannels — Sidebar component displaying trusted news channels
 */
export class SidebarChannels {
    constructor() {
        this.container = null;
        this.category = 'general';
        this.channels = [
            // Indian Sources
            { name: 'NDTV', logo: '/assets/channels/ndtv.png', url: 'https://www.ndtv.com', tags: ['politics', 'world', 'business'] },
            { name: 'Aaj Tak', logo: '/assets/channels/aajtak.png', url: 'https://www.aajtak.in', tags: ['politics', 'entertainment'] },
            { name: 'India Today', logo: '/assets/channels/indiatoday.png', url: 'https://www.indiatoday.in', tags: ['politics', 'world'] },
            { name: 'Times Now', logo: '/assets/channels/timesnow.png', url: 'https://www.timesnownews.com', tags: ['politics', 'world'] },
            { name: 'Republic TV', logo: '/assets/channels/republic.png', url: 'https://www.republicworld.com', tags: ['politics'] },
            { name: 'Zee News', logo: '/assets/channels/zeenews.png', url: 'https://zeenews.india.com', tags: ['politics', 'entertainment'] },
            { name: 'ABP News', logo: '/assets/channels/abpnews.png', url: 'https://www.abplive.com', tags: ['politics'] },
            { name: 'The Hindu', logo: '/assets/channels/thehindu.png', url: 'https://www.thehindu.com', tags: ['politics', 'world', 'business'] },
            { name: 'News18', logo: '/assets/channels/news18.png', url: 'https://www.news18.com', tags: ['politics', 'business'] },
            { name: 'The Indian Express', logo: '/assets/channels/indianexpress.png', url: 'https://indianexpress.com', tags: ['politics', 'world', 'sports'] },
            { name: 'Economic Times', logo: '/assets/channels/economictimes.png', url: 'https://economictimes.indiatimes.com', tags: ['business'] },
            { name: 'Business Standard', logo: '/assets/channels/businessstandard.png', url: 'https://www.business-standard.com', tags: ['business'] },
            { name: 'LiveMint', logo: '/assets/channels/livemint.png', url: 'https://www.livemint.com', tags: ['business'] },
            { name: 'The Print', logo: '/assets/channels/theprint.png', url: 'https://theprint.in', tags: ['politics'] },
            { name: 'The Quint', logo: '/assets/channels/thequint.png', url: 'https://www.thequint.com', tags: ['politics', 'entertainment'] },
            { name: 'Firstpost', logo: '/assets/channels/firstpost.png', url: 'https://www.firstpost.com', tags: ['world', 'politics'] },
            { name: 'Scroll.in', logo: '/assets/channels/scroll.png', url: 'https://scroll.in', tags: ['politics', 'world'] },
            { name: 'Wire India', logo: '/assets/channels/wire.png', url: 'https://thewire.in', tags: ['politics'] },
            { name: 'Cricbuzz', logo: '/assets/channels/cricbuzz.png', url: 'https://www.cricbuzz.com', tags: ['sports'] },
            { name: 'Bollywood Hungama', logo: '/assets/channels/bollywoodhungama.png', url: 'https://www.bollywoodhungama.com', tags: ['entertainment'] },
            { name: 'Pinkvilla', logo: '/assets/channels/pinkvilla.png', url: 'https://www.pinkvilla.com', tags: ['entertainment'] },
            { name: 'Financial Express', logo: '/assets/channels/financialexpress.png', url: 'https://www.financialexpress.com', tags: ['business'] },
            { name: 'Asianet News', logo: '/assets/channels/asianet.png', url: 'https://www.asianetnews.com', tags: ['politics', 'world'] },
            { name: 'Malayalam Manorama', logo: '/assets/channels/manorama.png', url: 'https://www.manoramaonline.com', tags: ['politics'] },
            { name: 'Deccan Herald', logo: '/assets/channels/deccanherald.png', url: 'https://www.deccanherald.com', tags: ['politics', 'world'] },

            // Global Sources
            { name: 'BBC News', logo: '/assets/channels/bbc.png', url: 'https://www.bbc.com/news', tags: ['world', 'politics', 'technology'] },
            { name: 'CNN', logo: '/assets/channels/cnn.png', url: 'https://edition.cnn.com', tags: ['world', 'politics'] },
            { name: 'Reuters', logo: '/assets/channels/reuters.png', url: 'https://www.reuters.com', tags: ['world', 'business'] },
            { name: 'Bloomberg', logo: '/assets/channels/bloomberg.png', url: 'https://www.bloomberg.com', tags: ['business'] },
            { name: 'Al Jazeera', logo: '/assets/channels/aljazeera.png', url: 'https://www.aljazeera.com', tags: ['world', 'politics'] },
            { name: 'The Guardian', logo: '/assets/channels/guardian.png', url: 'https://www.theguardian.com', tags: ['world', 'politics'] },
            { name: 'TechCrunch', logo: '/assets/channels/techcrunch.png', url: 'https://techcrunch.com', tags: ['technology'] },
            { name: 'The Verge', logo: '/assets/channels/theverge.png', url: 'https://www.theverge.com', tags: ['technology'] },
            { name: 'Wired', logo: '/assets/channels/wired.png', url: 'https://www.wired.com', tags: ['technology'] },
            { name: 'Wall Street Journal', logo: '/assets/channels/wsj.png', url: 'https://www.wsj.com', tags: ['business'] },
            { name: 'New York Times', logo: '/assets/channels/nytimes.png', url: 'https://www.nytimes.com', tags: ['world', 'politics'] },
            { name: 'Forbes', logo: '/assets/channels/forbes.png', url: 'https://www.forbes.com', tags: ['business'] },
            { name: 'CNBC', logo: '/assets/channels/cnbc.png', url: 'https://www.cnbc.com', tags: ['business'] },
            { name: 'ESPN', logo: '/assets/channels/espn.png', url: 'https://www.espn.com', tags: ['sports'] },
            { name: 'Variety', logo: '/assets/channels/variety.png', url: 'https://variety.com', tags: ['entertainment'] },
            { name: 'Hollywood Reporter', logo: '/assets/channels/hollywoodreporter.png', url: 'https://www.hollywoodreporter.com', tags: ['entertainment'] },
            { name: 'Associated Press', logo: '/assets/channels/ap.png', url: 'https://apnews.com', tags: ['world'] },
            { name: 'Sky News', logo: '/assets/channels/skynews.png', url: 'https://news.sky.com', tags: ['world', 'politics'] },
            { name: 'France 24', logo: '/assets/channels/france24.png', url: 'https://www.france24.com', tags: ['world'] },
            { name: 'Deutsche Welle', logo: '/assets/channels/dw.png', url: 'https://www.dw.com', tags: ['world'] },
            { name: 'Engadget', logo: '/assets/channels/engadget.png', url: 'https://www.engadget.com', tags: ['technology'] },
            { name: 'Mashable', logo: '/assets/channels/mashable.png', url: 'https://mashable.com', tags: ['technology', 'entertainment'] },
            { name: 'Gizmodo', logo: '/assets/channels/gizmodo.png', url: 'https://gizmodo.com', tags: ['technology'] },
            { name: 'CNET', logo: '/assets/channels/cnet.png', url: 'https://www.cnet.com', tags: ['technology'] },
            { name: 'Sky Sports', logo: '/assets/channels/skysports.png', url: 'https://www.skysports.com', tags: ['sports'] },
            { name: 'NBC Sports', logo: '/assets/channels/nbcsports.png', url: 'https://www.nbcsports.com', tags: ['sports'] }
        ];
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
                newsGrid.parentNode.insertBefore(layout, newsGrid);
                mainContent.appendChild(newsGrid);
            }

            layout.appendChild(mainContent);
        }

        // Create sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'related-sidebar channels-sidebar';
        sidebar.setAttribute('role', 'complementary');
        sidebar.setAttribute('aria-label', 'News Channels');

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h3><i class="fas fa-broadcast-tower"></i> Trusted Channels</h3>
                <span class="sidebar-badge">Verified</span>
            </div>
            <div class="sidebar-scroll" id="channels-scroll">
                <div class="channels-list"></div>
            </div>
            <div class="sidebar-footer">
                <span class="sidebar-update-time">Verified News Sources</span>
            </div>
        `;

        layout.appendChild(sidebar);
        this.container = sidebar;
        return sidebar;
    }

    /**
     * Render channels based on category
     */
    render(category = 'general') {
        this.category = category;
        if (!this.container) return;

        const scrollContainer = this.container.querySelector('.channels-list');
        if (!scrollContainer) return;

        scrollContainer.innerHTML = '';

        // Filter channels: show all for 'general', otherwise prioritize category matches
        let filteredChannels = this.channels;
        
        if (category !== 'general' && category !== 'all') {
            // Sort to put category-specific channels first
            filteredChannels = [...this.channels].sort((a, b) => {
                const aMatch = a.tags.includes(category) ? 1 : 0;
                const bMatch = b.tags.includes(category) ? 1 : 0;
                return bMatch - aMatch;
            });
        }

        filteredChannels.forEach(channel => {
            const card = document.createElement('div');
            const isMatch = category !== 'general' && channel.tags.includes(category);
            card.className = `channel-card ${isMatch ? 'priority' : ''}`;
            
            card.innerHTML = `
                <div class="channel-logo">
                    <img src="${channel.logo}" alt="${channel.name}" loading="lazy">
                </div>
                <div class="channel-info">
                    <div class="channel-name">${channel.name}</div>
                    <div class="channel-tags">
                        ${channel.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <a href="${channel.url}" target="_blank" class="channel-link" aria-label="Visit ${channel.name}">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            `;

            const channelImg = card.querySelector('.channel-logo img');
            if (channelImg) {
                channelImg.addEventListener('error', () => {
                    channelImg.src = '/assets/default-news.jpg';
                });
            }

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.channel-link')) {
                    window.open(channel.url, '_blank');
                }
            });

            scrollContainer.appendChild(card);
        });
    }

    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}
