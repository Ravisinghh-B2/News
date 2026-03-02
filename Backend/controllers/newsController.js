const newsService = require('../services/newsService');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Get news by category with pagination
// @route   GET /api/v1/news
exports.getNews = async (req, res, next) => {
  try {
    let { category = 'general', page = 1, limit = 20 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 50); // Cap at 50

    const data = await newsService.fetchTopHeadlines(category, page, limit);

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

// @desc    Get technology sub-category news
// @route   GET /api/v1/news/technology/:subCategory
exports.getTechSubCategory = async (req, res, next) => {
  try {
    const { subCategory } = req.params;
    let { page = 1, limit = 20 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 50);

    const data = await newsService.getTechSubCategoryNews(subCategory, page, limit);

    res.json({
      success: true,
      category: 'technology',
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