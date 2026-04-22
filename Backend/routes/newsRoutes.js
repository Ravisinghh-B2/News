const express = require('express');
const {
    getNews,
    getTrendingNews,
    searchNews,
    getRelatedNews,
    getSubCategory,
    getPersonalizedNews,
    getStatus,
    scrapeNewsUrls,
    scrapeSingleUrl
} = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const { cacheResponse } = require('../middleware/cacheMiddleware');
const { newsApiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── News Scraper Routes (POST) ─ Must come FIRST ────────────────────
// POST routes before GET routes to avoid conflicts with :param routes
router.post('/scrape', newsApiLimiter, scrapeNewsUrls);
router.post('/scrape/single', newsApiLimiter, scrapeSingleUrl);

// ─── Public GET Routes (with caching and rate limiting) ─────────────
router.get('/status', getStatus);
router.get('/trending', newsApiLimiter, cacheResponse(60 * 1000), getTrendingNews);
router.get('/search', newsApiLimiter, cacheResponse(60 * 1000), searchNews);
router.get('/related', newsApiLimiter, cacheResponse(10 * 60 * 1000), getRelatedNews);
router.get('/:category/:subCategory', newsApiLimiter, cacheResponse(60 * 1000), getSubCategory);
router.get('/', newsApiLimiter, cacheResponse(60 * 1000), getNews);

// ─── Protected Routes ───────────────────────────────────────────────
router.get('/personalized', protect, getPersonalizedNews);

module.exports = router;