const newsService = require('../services/newsService');
const newsScraperService = require('../services/newsScraperService');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Get structured news by category (Indian, World, Related)
// @route   GET /api/v1/news
exports.getNews = async (req, res, next) => {
  try {
    const { category = 'general', subCategory = null } = req.query;

    const data = await newsService.getStructuredCategoryNews(category, subCategory);

    res.json({
      success: true,
      category,
      subCategory,
      lastUpdated: data.lastUpdated,
      indian: data.indian,
      worldwide: data.worldwide,
      relatedGroups: data.relatedGroups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending news
// @route   GET /api/v1/news/trending
exports.getTrendingNews = async (req, res, next) => {
  try {
    let { page = 1, limit = 20 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 50);

    const data = await newsService.getTrendingNews(page, limit);

    res.json({
      success: true,
      totalResults: data.totalResults,
      currentPage: data.page,
      totalPages: Math.ceil(data.totalResults / limit),
      source: data.source,
      lastUpdated: newsService.getLastUpdated(),
      news: data.articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search news by keyword
// @route   GET /api/v1/news/search?q=keyword
exports.searchNews = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length === 0) {
      throw new AppError('Search query is required', 400);
    }

    const data = await newsService.searchNews(q.trim(), parseInt(page), parseInt(limit));

    res.json({
      success: true,
      query: q,
      totalResults: data.totalResults,
      source: data.source,
      news: data.articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related news for sidebar
// @route   GET /api/v1/news/related?category=technology
exports.getRelatedNews = async (req, res, next) => {
  try {
    const { category = 'general', limit = 15 } = req.query;
    const excludeUrls = req.query.exclude ? req.query.exclude.split(',') : [];

    const relatedNews = await newsService.getRelatedNews(category, excludeUrls, parseInt(limit));

    res.json({
      success: true,
      category,
      lastUpdated: newsService.getLastUpdated(),
      news: relatedNews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sub-category news
// @route   GET /api/v1/news/:category/:subCategory
exports.getSubCategory = async (req, res, next) => {
  try {
    const { category, subCategory } = req.params;
    let { page = 1, limit = 20 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 50);

    const data = await newsService.getSubCategoryNews(category, subCategory, page, limit);

    res.json({
      success: true,
      category,
      subCategory,
      totalResults: data.totalResults,
      source: data.source,
      lastUpdated: newsService.getLastUpdated(),
      news: data.articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized news (protected)
// @route   GET /api/v1/news/personalized
exports.getPersonalizedNews = async (req, res, next) => {
  try {
    const user = req.user;
    const interests = user.interests || [];
    if (!interests.length) {
      return res.json({ success: true, message: 'No interests set', news: [] });
    }
    const news = await newsService.getPersonalizedNews(interests);
    res.json({ success: true, news });
  } catch (error) {
    next(error);
  }
};

// @desc    Get last update timestamp
// @route   GET /api/v1/news/status
exports.getStatus = async (req, res) => {
  res.json({
    success: true,
    lastUpdated: newsService.getLastUpdated(),
    serverTime: new Date().toISOString()
  });
};

// ═════════════════════════════════════════════════════════════════════════════
// NEWS SCRAPER ENDPOINTS - Extract Open Graph & Meta Tags
// ═════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Scrape multiple news URLs and extract Open Graph metadata
 * @route   POST /api/v1/news/scrape
 * @access  Public
 * @body    { urls: ['https://...', 'https://...', ...] } - Array of up to 50 URLs
 * 
 * Response includes:
 * - title: Article title (from og:title or fallback)
 * - description: Article description
 * - image: Article image (converted to absolute URL)
 * - url: Original URL
 * - source: Domain name
 * - missingTags: Array of missing meta tags
 * - suggestedMetaTags: Suggested meta tags for better SEO
 * - metaTagsHtml: Ready-to-use HTML meta tag block
 */
exports.scrapeNewsUrls = async (req, res, next) => {
  try {
    const { urls } = req.body;

    // Validation
    if (!urls || !Array.isArray(urls)) {
      throw new AppError('URLs array is required in request body', 400);
    }

    if (urls.length === 0) {
      throw new AppError('At least one URL is required', 400);
    }

    if (urls.length > 50) {
      throw new AppError('Maximum 50 URLs allowed per request', 400);
    }

    // Scrape all URLs
    const result = await newsScraperService.scrapeMultipleUrls(urls);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Scrape a single news URL and extract Open Graph metadata
 * @route   POST /api/v1/news/scrape/single
 * @access  Public
 * @body    { url: 'https://...' } - Single URL to scrape
 * 
 * Response includes full metadata, missing tags, suggested tags, and HTML meta block
 */
exports.scrapeSingleUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    // Validation
    if (!url || typeof url !== 'string') {
      throw new AppError('URL is required and must be a string', 400);
    }

    // Scrape single URL
    const result = await newsScraperService.processUrl(url);

    res.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    next(error);
  }
};