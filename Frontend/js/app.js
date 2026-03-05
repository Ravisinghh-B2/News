import { fetchNews, searchNews, getPersonalizedFeed } from './api.js';
import { renderNewsCards, clearNewsGrid } from './ui.js';
import { initDarkMode, getFrom, showToast, getSkeleton, debounce } from './utils.js';
import { initAuth } from './auth.js';
import { Router } from './routes/Router.js';
import { CategoryPage } from './pages/Category.js';
import { TrendingPage } from './pages/Trending.js';

let router;

// ─── Initialize ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initAuth();
  initApp();
  initNav();
  initSearch();
  initScroll();

  // Define sub-categories for each section
  const subCats = {
    technology: ['AI Updates', 'Machine Learning', 'Software', 'Gadgets', 'Cybersecurity', 'Tech Startups', 'Tech Industry', 'Cloud & DevOps', 'Blockchain'],
    business: ['Indian Economy', 'Indian Stock Market', 'RBI Updates', 'Startup Funding', 'Corporate News India', 'Global Markets', 'International Trade', 'Crypto Market', 'Global Corporate Mergers'],
    sports: ['Indian Cricket', 'IPL', 'Indian Domestic Sports', 'Olympic Updates India', 'FIFA', 'NBA', 'Formula 1', 'International Cricket', 'World Championships'],
    world: ['India International Relations', 'India–US/China/Pakistan Relations', 'Global Conflicts', 'Climate Change', 'UN Updates', 'Global Economy', 'International Summits', 'Natural Disasters'],
    politics: ['Indian Parliament Updates', 'State Elections', 'Supreme Court Decisions', 'Central Government Policies', 'US Politics', 'European Politics', 'Global Elections'],
    entertainment: ['Bollywood', 'Indian OTT', 'South Indian Cinema', 'Indian TV Industry', 'Hollywood', 'Global OTT Releases', 'International Award Shows', 'Music Industry']
  };

  // Initialize Router
  const routes = [
    { path: '/', page: new CategoryPage('general') },
    { path: '/trending', page: new TrendingPage() },
    { path: '/category/technology', page: new CategoryPage('technology', subCats.technology) },
    { path: '/category/business', page: new CategoryPage('business', subCats.business) },
    { path: '/category/sports', page: new CategoryPage('sports', subCats.sports) },
    { path: '/category/world', page: new CategoryPage('world', subCats.world) },
    { path: '/category/politics', page: new CategoryPage('politics', subCats.politics) },
    { path: '/category/entertainment', page: new CategoryPage('entertainment', subCats.entertainment) },
    { path: '/category/:id', page: new CategoryPage() }
  ];
  router = new Router(routes);
});

// ─── App Init ────────────────────────────────────────────────────────
function initApp() {
  // Personalized feed button
  const personalizedBtn = document.querySelector('.personalized-btn');
  if (personalizedBtn) {
    personalizedBtn.addEventListener('click', loadPersonalizedFeed);
  }

  // Explore news button
  const exploreBtn = document.querySelector('.explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      document.querySelector('.news-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Category card clicks on home page
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      if (cat && router) {
        router.navigateTo(`/category/${cat}`);
      }
    });
  });
}

// ─── Navigation ──────────────────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Dropdown Toggle on Mobile
  const dropdown = document.querySelector('.dropdown');
  if (dropdown) {
    dropdown.querySelector('a').addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      }
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-menu a[data-link]').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger?.classList.remove('active');
      }
    });
  });
}

// ─── Search ──────────────────────────────────────────────────────────
function initSearch() {
  const searchOverlay = document.getElementById('search-overlay');
  const searchIcon = document.querySelector('.search-icon');
  const closeSearch = document.getElementById('close-search');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  if (searchIcon) {
    searchIcon.addEventListener('click', () => {
      searchOverlay.style.display = 'flex';
      searchInput?.focus();
    });
  }

  if (closeSearch) {
    closeSearch.addEventListener('click', () => {
      searchOverlay.style.display = 'none';
    });
  }

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay?.style.display === 'flex') {
      searchOverlay.style.display = 'none';
    }
  });

  const handleSearch = () => {
    const query = searchInput?.value.trim();
    if (query) {
      searchOverlay.style.display = 'none';
      performSearch(query);
      document.querySelector('.news-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast('Please enter a search term', 'error');
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', handleSearch);
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

// ─── Scroll ──────────────────────────────────────────────────────────
function initScroll() {
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 500) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  }, 100));

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ─── Search Execution ────────────────────────────────────────────────
async function performSearch(query) {
  clearNewsGrid();
  document.getElementById('news-grid').innerHTML = getSkeleton(6);

  // Update section title
  const sectionTitle = document.querySelector('.news-section h2');
  if (sectionTitle) sectionTitle.textContent = `Results for "${query}"`;

  try {
    const data = await searchNews(query);
    clearNewsGrid();
    renderNewsCards(data.news || data.articles || []);
    showToast(`Found results for "${query}"`, 'success');
  } catch (error) {
    showToast('Search failed', 'error');
  }
}

// ─── Personalized Feed ──────────────────────────────────────────────
async function loadPersonalizedFeed() {
  const user = getFrom('user');
  if (!user) {
    showToast('Please login to get a personalized feed', 'error');
    return;
  }
  clearNewsGrid();
  document.getElementById('news-grid').innerHTML = getSkeleton(6);
  try {
    const data = await getPersonalizedFeed(user.token);
    clearNewsGrid();
    renderNewsCards(data.news || []);
    showToast('Personalized feed loaded', 'success');
  } catch (error) {
    showToast('Could not load personalized feed', 'error');
  }
}
