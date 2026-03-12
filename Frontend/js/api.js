const API_BASE = 'http://127.0.0.1:5000/api/v1';

// Request lock map to prevent duplicate simultaneous requests
const pendingRequests = new Map();

// ─── Generic Fetch Helper ────────────────────────────────────────────
async function apiFetch(endpoint, options = {}, retries = 1) {
  // Return the existing promise if a request for this endpoint is already in flight
  if (pendingRequests.has(endpoint)) {
    return pendingRequests.get(endpoint);
  }

  const fetchPromise = (async () => {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const error = new Error(errData.error || `HTTP ${response.status}`);
          error.status = response.status;
          throw error;
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        console.warn(`[API] ${endpoint} attempt ${i + 1} failed:`, error.message);
        
        // Immediately stop retrying if it's a 429 Too Many Requests
        if (error.status === 429) {
            throw error;
        }

        if (i < retries) {
          // 1s -> 2s exponential backoff for other errors like 5xx or network drops
          const delay = 1000 * Math.pow(2, i);
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }
    throw lastError;
  })();

  pendingRequests.set(endpoint, fetchPromise);
  
  try {
    return await fetchPromise;
  } finally {
    // Remove from lock map once request completes (success or fail)
    pendingRequests.delete(endpoint);
  }
}

// ─── News Endpoints ──────────────────────────────────────────────────

export async function fetchNews({ category = 'general', subCategory = null } = {}) {
  const params = new URLSearchParams({ category });
  if (subCategory) params.append('subCategory', subCategory);
  return await apiFetch(`/news?${params}`);
}

export async function fetchTrendingNews(page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({ page, limit });
    const data = await apiFetch(`/news/trending?${params}`);
    return data;
  } catch (error) {
    return { success: false, news: [], totalResults: 0 };
  }
}

export async function searchNews(query, page = 1) {
  try {
    const params = new URLSearchParams({ q: query, page });
    const data = await apiFetch(`/news/search?${params}`);
    return data;
  } catch (error) {
    return { success: false, news: [] };
  }
}

export async function fetchRelatedNews(category = 'general', limit = 15) {
  try {
    const params = new URLSearchParams({ category, limit });
    const data = await apiFetch(`/news/related?${params}`);
    return data;
  } catch (error) {
    return { success: false, news: [] };
  }
}

export async function fetchTechSubCategory(subCategory, page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({ page, limit });
    const data = await apiFetch(`/news/technology/${encodeURIComponent(subCategory)}?${params}`);
    return data;
  } catch (error) {
    return { success: false, news: [] };
  }
}

export async function fetchNewsStatus() {
  try {
    return await apiFetch('/news/status');
  } catch (error) {
    return { lastUpdated: null };
  }
}

// ─── Auth Endpoints ──────────────────────────────────────────────────

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

export async function signup(name, username, email, password, interests = []) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password, interests })
  });
  return response.json();
}

export async function getPersonalizedFeed(token) {
  const response = await fetch(`${API_BASE}/news/personalized`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// ─── User Actions ────────────────────────────────────────────────────

export async function saveArticle(articleData, token) {
  const response = await fetch(`${API_BASE}/users/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(articleData)
  });
  return response.json();
}

export async function getSavedArticles(token) {
  const response = await fetch(`${API_BASE}/users/saved`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function deleteSavedArticle(id, token) {
  const response = await fetch(`${API_BASE}/users/saved/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function updateInterests(interests, token) {
  const response = await fetch(`${API_BASE}/users/interests`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ interests })
  });
  return response.json();
}
