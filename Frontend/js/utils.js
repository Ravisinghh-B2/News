// ─── Utility Functions ───────────────────────────────────────────────

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Returns a human-readable relative time string
 * e.g., "2 minutes ago", "3 hours ago", "1 day ago"
 */
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

/**
 * Returns "Last Updated X minutes ago" string
 */
export function lastUpdatedText(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const minutes = Math.floor((now - date) / 60000);

  if (minutes < 1) return 'Last updated: Just now';
  if (minutes < 60) return `Last updated: ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last updated: ${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `Last updated: ${formatDate(isoString)}`;
}

// ─── Toast Notifications ─────────────────────────────────────────────
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? 'fa-check-circle' :
    type === 'error' ? 'fa-exclamation-circle' :
      type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Local Storage Helpers ───────────────────────────────────────────
export function saveTo(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFrom(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

// ─── Skeleton Loader Generator (legacy compatibility) ────────────────
export function getSkeleton(count = 6) {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="news-card skeleton-card" aria-hidden="true">
        <div class="img-wrapper skeleton-shimmer"></div>
        <div class="news-content">
          <div class="skeleton-shimmer" style="height: 12px; width: 40%; margin-bottom: 1rem; border-radius: 4px;"></div>
          <div class="skeleton-shimmer" style="height: 24px; width: 90%; margin-bottom: 1rem; border-radius: 4px;"></div>
          <div class="skeleton-shimmer" style="height: 60px; width: 100%; margin-bottom: 2rem; border-radius: 4px;"></div>
          <div class="news-footer" style="border:none;">
            <div class="skeleton-shimmer" style="height: 12px; width: 30%; border-radius: 4px;"></div>
            <div class="skeleton-shimmer" style="height: 12px; width: 20%; border-radius: 4px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  return skeletons;
}

// ─── Dark Mode ───────────────────────────────────────────────────────
export function initDarkMode() {
  const toggles = document.querySelectorAll('.dark-mode-toggle');
  const body = document.body;

  // Set initial state from localStorage
  if (getFrom('darkMode') === true) {
    body.classList.add('dark');
    toggles.forEach(t => t.classList.replace('fa-moon', 'fa-sun'));
  }

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      body.classList.toggle('dark');
      const isDark = body.classList.contains('dark');
      saveTo('darkMode', isDark);

      // Update all toggle icons
      document.querySelectorAll('.dark-mode-toggle').forEach(t => {
        if (isDark) {
          t.classList.replace('fa-moon', 'fa-sun');
        } else {
          t.classList.replace('fa-sun', 'fa-moon');
        }
      });

      showToast(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
    });
  });
}

// ─── Debounce Helper ─────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
