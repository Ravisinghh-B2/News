const express = require('express');
const {
    getNews,
    getTrendingNews,
    searchNews,
    getRelatedNews,
    getSubCategory,
    getPersonalizedNews,
    getStatus
} = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const { cacheResponse } = require('../middleware/cacheMiddleware');
const { newsApiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (with caching and rate limiting)
router.get('/', newsApiLimiter, cacheResponse(60 * 1000), getNews);
router.get('/trending', newsApiLimiter, cacheResponse(60 * 1000), getTrendingNews);
router.get('/search', newsApiLimiter, cacheResponse(60 * 1000), searchNews);
router.get('/related', newsApiLimiter, cacheResponse(10 * 60 * 1000), getRelatedNews);
router.get('/:category/:subCategory', newsApiLimiter, cacheResponse(60 * 1000), getSubCategory);
router.get('/status', getStatus);

// Protected routes
router.get('/personalized', protect, getPersonalizedNews);

module.exports = router;