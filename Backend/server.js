const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { refreshAllCategories } = require('./services/newsService');
const { setLastUpdated } = require('./services/newsService');

dotenv.config();

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "*"],
      connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "ws://localhost:5500", "ws://127.0.0.1:5500", "http://127.0.0.1:5500"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── Additional Security Headers ────────────────────────────────────────
app.use(require('helmet').referrerPolicy({ policy: 'no-referrer' }));
app.use(require('helmet').xssFilter());
app.use(require('helmet').noSniff());
app.use(require('helmet').frameguard({ action: 'deny' }));
app.use(require('helmet').hidePoweredBy());
app.use(require('helmet').permittedCrossDomainPolicies({ permittedPolicies: 'none' }));

// ─── Core Middleware ─────────────────────────────────────────────────
app.use(compression());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── Global Rate Limiter ─────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Request Logger ──────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} [${res.statusCode}] ${req.method} ${req.originalUrl} - ${duration}ms`);
  });
  next();
});

// ─── Health Check ────────────────────────────────────────────────────
app.get(['/', '/api/v1'], (req, res) => {
  res.json({
    message: 'NewsHub API is running 🚀',
    version: '2.0.0',
    endpoints: {
      news: '/api/v1/news',
      trending: '/api/v1/news/trending',
      search: '/api/v1/news/search?q=keyword',
      related: '/api/v1/news/related?category=technology',
      technologySubCategory: '/api/v1/news/technology/:subCategory',
      status: '/api/v1/news/status',
      auth: '/api/v1/auth'
    }
  });
});

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/users', userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// ─── Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 NewsHub API Server v2.0`);
  console.log(`📡 http://127.0.0.1:${PORT}`);
  console.log(`📡 API Base: http://127.0.0.1:${PORT}/api/v1`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// ─── Database Connection ─────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Server running without database. Using API + in-memory cache only.');
  });

// ─── CRON: Refresh News Every 10 Minutes ─────────────────────────────
cron.schedule('*/10 * * * *', async () => {
  try {
    await refreshAllCategories();
    setLastUpdated();
    console.log(`[CRON] ✅ News refreshed at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[CRON] ❌ Refresh failed:', err.message);
  }
});

console.log('⏰ CRON scheduled: News refresh every 10 minutes');
