const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const saleRoutes = require('./routes/sales');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (must be before helmet)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - optimized for scalability
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable legacy headers
  });
};

// Different limits for different endpoints
const strictLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  30, // 30 requests per 15 minutes for sensitive operations
  'Too many authentication attempts, please try again later.'
);

const moderateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // 200 requests per 15 minutes for general API
  'Too many requests, please try again later.'
);

const lenientLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  1000, // 1000 requests per minute for dashboard data
  'Too many dashboard requests, please try again later.'
);
// Apply rate limiting per route type
app.use('/api/auth', strictLimiter);
app.use('/api/users', moderateLimiter);
app.use('/api/products', moderateLimiter);
app.use('/api/categories', moderateLimiter);
app.use('/api/sales', moderateLimiter);
app.use('/api/reports', moderateLimiter);
app.use('/api/dashboard', lenientLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

app.listen(PORT, () => {
  logger.log(`🚀 Server running on port ${PORT}`);
  logger.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
  logger.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
