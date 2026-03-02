/**
 * In-Memory Cache Middleware
 * Caches API responses to reduce external API calls
 * TTL-based expiration with automatic cleanup
 */

const cache = new Map();

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Set a value in cache with TTL
 */
function setCache(key, value, ttl = DEFAULT_TTL) {
    cache.set(key, {
        data: value,
        expiry: Date.now() + ttl,
        cachedAt: new Date().toISOString()
    });
}

/**
 * Get a value from cache (returns null if expired or not found)
 */
function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry;
}

/**
 * Clear entire cache or specific key
 */
function clearCache(key) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

/**
 * Express middleware - cache GET requests
 * Usage: router.get('/endpoint', cacheResponse(5 * 60 * 1000), handler)
 */
function cacheResponse(ttl = DEFAULT_TTL) {
    return (req, res, next) => {
        if (req.method !== 'GET') return next();

        const key = `__cache__${req.originalUrl}`;
        const cached = getCache(key);

        if (cached) {
            return res.json({
                ...cached.data,
                _cached: true,
                _cachedAt: cached.cachedAt
            });
        }

        // Override res.json to intercept and cache the response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                setCache(key, body, ttl);
            }
            return originalJson(body);
        };

        next();
    };
}

/**
 * Periodic cleanup of expired entries (runs every 5 minutes)
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (now > entry.expiry) {
            cache.delete(key);
        }
    }
}, 5 * 60 * 1000);

module.exports = {
    setCache,
    getCache,
    clearCache,
    cacheResponse
};
