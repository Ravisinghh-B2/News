const express = require('express');
const {
    getNews,
    getTrendingNews,
    searchNews,
    getRelatedNews,
    getTechSubCategory,
    getPersonalizedNews,
    getStatus
} = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const { cacheResponse } = require('../middleware/cacheMiddleware');
const { newsApiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (with caching and rate limiting)
router.get('/', newsApiLimiter, getNews);
router.get('/trending', newsApiLimiter, getTrendingNews);
router.get('/search', newsApiLimiter, searchNews);
router.get('/related', newsApiLimiter, cacheResponse(10 * 60 * 1000), getRelatedNews);
router.get('/technology/:subCategory', newsApiLimiter, getTechSubCategory);
router.get('/status', getStatus);

// Protected routes
router.get('/personalized', protect, getPersonalizedNews);

module.exports = router;