const axios = require('axios');
const News = require('../models/News');
const { setCache, getCache, clearCache } = require('../middleware/cacheMiddleware');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = process.env.NEWS_API_URL || 'https://newsapi.org/v2';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_API_URL = 'https://gnews.io/api/v4';

// ─── Category Mapping ────────────────────────────────────────────────
const VALID_CATEGORIES = [
  'general', 'business', 'sports', 'technology',
  'entertainment', 'science', 'health'
];

// Map custom frontend categories → NewsAPI categories
const CATEGORY_MAP = {
  'world': 'general',
  'politics': 'general',
  'trending': 'general'
};

function resolveCategory(cat) {
  if (!cat) return 'general';
  const lower = cat.toLowerCase();
  return CATEGORY_MAP[lower] || (VALID_CATEGORIES.includes(lower) ? lower : 'general');
}

// ─── Technology Sub-Categories (search keywords) ─────────────────────
const TECH_SUB_CATEGORIES = {
  'Artificial Intelligence': 'artificial intelligence AI',
  'Machine Learning': 'machine learning deep learning',
  'Cybersecurity': 'cybersecurity hacking data breach',
  'Gadgets': 'gadgets smartphones devices',
  'Software Updates': 'software update release',
  'Startups': 'tech startup funding',
  'Blockchain': 'blockchain cryptocurrency web3',
  'Cloud Computing': 'cloud computing AWS Azure',
  'Tech Industry': 'Google Apple Microsoft Meta Amazon',
  'R&D': 'research innovation technology breakthrough',
  'Software': 'software development programming',
  'Innovations': 'innovation technology breakthrough',
};

// ─── Extract Keywords from Title ─────────────────────────────────────
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'shall',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'and', 'but', 'or', 'if', 'while', 'about', 'up', 'out',
  'this', 'that', 'these', 'those', 'it', 'its', 'he', 'she',
  'they', 'them', 'his', 'her', 'their', 'what', 'which',
  'who', 'whom', 'my', 'your', 'our', 'we', 'you', 'me',
  'him', 'us', 'i', 'said', 'says', 'new', 'also', 'get',
  'like', 'make', 'know', 'take', 'come', 'think', 'see',
  'want', 'look', 'use', 'find', 'give', 'tell', 'work',
  'call', 'try', 'need', 'become', 'leave', 'put', 'mean',
  'keep', 'let', 'begin', 'seem', 'help', 'show', 'hear',
  'play', 'run', 'move', 'live', 'believe', 'hold', 'bring',
  'happen', 'write', 'provide', 'sit', 'stand', 'lose',
  'pay', 'meet', 'include', 'continue', 'set', 'learn',
  'change', 'lead', 'understand', 'watch', 'follow', 'stop',
  'create', 'speak', 'read', 'allow', 'add', 'spend',
  'grow', 'open', 'walk', 'win', 'offer', 'remember',
  'love', 'consider', 'appear', 'buy', 'wait', 'serve',
  'die', 'send', 'expect', 'build', 'stay', 'fall',
  'cut', 'reach', 'kill', 'remain', 'suggest', 'raise',
  'pass', 'sell', 'require', 'report', 'decide', 'pull'
]);

function extractKeywords(title) {
  if (!title) return [];
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// ─── Similarity Score ────────────────────────────────────────────────
function similarityScore(keywords1, keywords2) {
  if (!keywords1.length || !keywords2.length) return 0;
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union; // Jaccard similarity
}

// ─── Group Similar Articles ──────────────────────────────────────────
function groupSimilarArticles(articles, threshold = 0.35) {
  const groups = [];
  const used = new Set();

  // Pre-extract keywords
  const articlesWithKw = articles.map(a => ({
    ...a,
    _keywords: extractKeywords(a.title)
  }));

  for (let i = 0; i < articlesWithKw.length; i++) {
    if (used.has(i)) continue;

    const group = {
      primary: articlesWithKw[i],
      related: [],
      alsoCoveredBy: []
    };
    used.add(i);

    for (let j = i + 1; j < articlesWithKw.length; j++) {
      if (used.has(j)) continue;
      const score = similarityScore(articlesWithKw[i]._keywords, articlesWithKw[j]._keywords);
      if (score >= threshold) {
        group.related.push(articlesWithKw[j]);
        group.alsoCoveredBy.push({
          source: articlesWithKw[j].source,
          url: articlesWithKw[j].url,
          title: articlesWithKw[j].title
        });
        used.add(j);
      }
    }

    groups.push(group);
  }

  return groups;
}

// ─── Deduplicate Articles ────────────────────────────────────────────
function deduplicateArticles(articles) {
  const seen = new Map();
  const result = [];

  for (const article of articles) {
    if (!article.title || article.title === '[Removed]') continue;
    if (!article.url) continue;

    const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
    if (!seen.has(titleKey)) {
      seen.set(titleKey, true);
      result.push(article);
    }
  }

  return result;
}

// ─── Normalize article from any API source ───────────────────────────
function normalizeArticle(article, category, source = 'newsapi') {
  if (source === 'gnews') {
    return {
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      imageUrl: article.image,
      source: article.source?.name || 'Unknown',
      category: category,
      publishedAt: article.publishedAt,
      keywords: extractKeywords(article.title)
    };
  }
  // Default: NewsAPI format
  return {
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    imageUrl: article.urlToImage,
    source: article.source?.name || article.source || 'Unknown',
    category: category,
    publishedAt: article.publishedAt,
    keywords: extractKeywords(article.title)
  };
}

// ─── Fetch from NewsAPI (Primary) ────────────────────────────────────
async function fetchFromNewsAPI(category, page = 1, pageSize = 20) {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key') return null;

  const apiCategory = resolveCategory(category);
  const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
    params: {
      country: 'in',
      category: apiCategory,
      page,
      pageSize,
      apiKey: NEWS_API_KEY
    },
    timeout: 10000
  });

  return {
    articles: (response.data.articles || []).map(a => normalizeArticle(a, category, 'newsapi')),
    totalResults: response.data.totalResults || 0
  };
}

// ─── Fetch from GNews (Fallback) ────────────────────────────────────
async function fetchFromGNews(category, page = 1, pageSize = 10) {
  if (!GNEWS_API_KEY) return null;

  const topicMap = {
    'general': 'nation', 'business': 'business', 'sports': 'sports',
    'technology': 'technology', 'entertainment': 'entertainment',
    'science': 'science', 'health': 'health', 'world': 'world'
  };

  const topic = topicMap[resolveCategory(category)] || 'nation';

  const response = await axios.get(`${GNEWS_API_URL}/top-headlines`, {
    params: {
      topic,
      lang: 'en',
      country: 'in',
      max: pageSize,
      apikey: GNEWS_API_KEY
    },
    timeout: 10000
  });

  return {
    articles: (response.data.articles || []).map(a => normalizeArticle(a, category, 'gnews')),
    totalResults: response.data.totalArticles || 0
  };
}

// ─── Search via NewsAPI Everything ───────────────────────────────────
async function fetchSearchResults(query, page = 1, pageSize = 20) {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key') return { articles: [], totalResults: 0 };

  const response = await axios.get(`${NEWS_API_URL}/everything`, {
    params: {
      q: query,
      page,
      pageSize,
      language: 'en',
      sortBy: 'publishedAt',
      apiKey: NEWS_API_KEY
    },
    timeout: 10000
  });

  return {
    articles: (response.data.articles || []).map(a => normalizeArticle(a, 'search', 'newsapi')),
    totalResults: response.data.totalResults || 0
  };
}

// ─── Main: Fetch Top Headlines with Caching & Fallback ───────────────
const fetchTopHeadlines = async (category = 'general', page = 1, pageSize = 20) => {
  const cacheKey = `news_${category}_p${page}_s${pageSize}`;

  // 1. Check in-memory cache
  const cached = getCache(cacheKey);
  if (cached) {
    return { ...cached.data, source: 'cache', cachedAt: cached.cachedAt };
  }

  let articles = [];
  let totalResults = 0;
  let dataSource = 'api';

  // 2. Try primary: NewsAPI
  try {
    const result = await fetchFromNewsAPI(category, page, pageSize);
    if (result && result.articles.length > 0) {
      articles = result.articles;
      totalResults = result.totalResults;
      dataSource = 'newsapi';
    }
  } catch (err) {
    console.warn(`[NewsAPI] Failed for ${category}:`, err.message);
  }

  // 3. Fallback: GNews
  if (articles.length === 0) {
    try {
      const result = await fetchFromGNews(category, page, pageSize);
      if (result && result.articles.length > 0) {
        articles = result.articles;
        totalResults = result.totalResults;
        dataSource = 'gnews';
      }
    } catch (err) {
      console.warn(`[GNews] Failed for ${category}:`, err.message);
    }
  }

  // 4. Final fallback: MongoDB cache
  if (articles.length === 0) {
    try {
      const dbArticles = await News.find({ category: resolveCategory(category) })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      const totalCount = await News.countDocuments({ category: resolveCategory(category) });

      if (dbArticles.length > 0) {
        return {
          articles: dbArticles,
          totalResults: totalCount,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          source: 'database'
        };
      }
    } catch (err) {
      console.warn('[DB Fallback] Failed:', err.message);
    }
  }

  // 5. Deduplicate
  articles = deduplicateArticles(articles);

  const responseData = {
    articles,
    totalResults,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    source: dataSource
  };

  // 6. Cache in memory (10 min TTL)
  if (articles.length > 0) {
    setCache(cacheKey, responseData, 10 * 60 * 1000);

    // Async persist to MongoDB (don't block response)
    const newsDocs = articles.map(a => ({
      ...a,
      fetchedAt: new Date()
    }));
    News.insertMany(newsDocs, { ordered: false }).catch(() => { });
  }

  return responseData;
};

// ─── Search News ─────────────────────────────────────────────────────
const searchNews = async (query, page = 1, pageSize = 20) => {
  const cacheKey = `search_${query}_p${page}`;
  const cached = getCache(cacheKey);
  if (cached) return { ...cached.data, source: 'cache' };

  try {
    const result = await fetchSearchResults(query, page, pageSize);
    const articles = deduplicateArticles(result.articles);
    const responseData = { articles, totalResults: result.totalResults };
    setCache(cacheKey, responseData, 5 * 60 * 1000);
    return responseData;
  } catch (error) {
    // Fallback: search in DB
    const dbResults = await News.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(pageSize)
      .lean();

    return { articles: dbResults, totalResults: dbResults.length, source: 'database' };
  }
};

// ─── Get Related News for Sidebar ────────────────────────────────────
const getRelatedNews = async (category, excludeUrls = [], limit = 15) => {
  const cacheKey = `related_${category}_${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached.data;

  // Fetch fresh articles for the category
  const data = await fetchTopHeadlines(category, 1, 40);
  let articles = data.articles.filter(a => !excludeUrls.includes(a.url));

  // Group similar articles
  const groups = groupSimilarArticles(articles);

  // Build related news with "Also Covered By" info
  const relatedNews = groups.slice(0, limit).map(group => ({
    ...group.primary,
    alsoCoveredBy: group.alsoCoveredBy,
    relatedCount: group.related.length
  }));

  setCache(cacheKey, relatedNews, 10 * 60 * 1000);
  return relatedNews;
};

// ─── Get Technology Sub-Category News ────────────────────────────────
const getTechSubCategoryNews = async (subCategory, page = 1, pageSize = 20) => {
  const searchQuery = TECH_SUB_CATEGORIES[subCategory] || subCategory;
  const cacheKey = `tech_${subCategory}_p${page}`;
  const cached = getCache(cacheKey);
  if (cached) return { ...cached.data, source: 'cache' };

  try {
    const result = await fetchSearchResults(searchQuery, page, pageSize);
    const articles = deduplicateArticles(result.articles).map(a => ({
      ...a,
      category: 'technology',
      subCategory
    }));
    const responseData = { articles, totalResults: result.totalResults };
    setCache(cacheKey, responseData, 10 * 60 * 1000);
    return responseData;
  } catch (error) {
    return { articles: [], totalResults: 0, source: 'error' };
  }
};

// ─── Personalized Feed ───────────────────────────────────────────────
const getPersonalizedNews = async (interests) => {
  const promises = interests.map(cat => fetchTopHeadlines(cat, 1, 10));
  const results = await Promise.allSettled(promises);
  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.articles);
  // Shuffle
  return articles.sort(() => 0.5 - Math.random());
};

// ─── Trending News (multi-category) ──────────────────────────────────
const getTrendingNews = async (page = 1, pageSize = 20) => {
  return await fetchTopHeadlines('general', page, pageSize);
};

// ─── Scheduled Refresh (called by cron) ──────────────────────────────
const refreshAllCategories = async () => {
  console.log('[CRON] Refreshing all news categories...');
  const categories = ['general', 'business', 'sports', 'technology', 'entertainment', 'science', 'health'];

  for (const cat of categories) {
    try {
      clearCache(`news_${cat}_p1_s20`);
      await fetchTopHeadlines(cat, 1, 20);
      console.log(`  ✅ Refreshed: ${cat}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${cat} - ${err.message}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  console.log('[CRON] Refresh complete.');
};

// ─── Last Updated Tracking ───────────────────────────────────────────
let lastUpdatedAt = new Date().toISOString();

function getLastUpdated() {
  return lastUpdatedAt;
}

function setLastUpdated() {
  lastUpdatedAt = new Date().toISOString();
}

module.exports = {
  fetchTopHeadlines,
  searchNews,
  getRelatedNews,
  getTechSubCategoryNews,
  getPersonalizedNews,
  getTrendingNews,
  refreshAllCategories,
  groupSimilarArticles,
  getLastUpdated,
  setLastUpdated
};