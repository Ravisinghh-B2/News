const API_BASE = 'http://127.0.0.1:5000/api/v1';

// ─── Generic Fetch Helper ────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[API] ${endpoint}:`, error.message);
    throw error;
  }
}

// ─── News Endpoints ──────────────────────────────────────────────────

export async function fetchNews({ category = 'general', page = 1, limit = 20 } = {}) {
  try {
    const params = new URLSearchParams({ category, page, limit });
    const data = await apiFetch(`/news?${params}`);
    return data;
  } catch (error) {
    return { success: false, news: [], totalResults: 0, currentPage: 1, totalPages: 1 };
  }
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
