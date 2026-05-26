const NodeCache = require('node-cache');

// Create cache instances with different TTLs
const shortCache = new NodeCache({ stdTTL: 30 }); // 30 seconds for real-time data
const mediumCache = new NodeCache({ stdTTL: 300 }); // 5 minutes for semi-static data
const longCache = new NodeCache({ stdTTL: 3600 }); // 1 hour for static data

const cacheMiddleware = (cache, keyGenerator) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const cachedData = cache.get(key);

    if (cachedData) {
      console.log(`Cache hit for key: ${key}`);
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data) {
      cache.set(key, data);
      return originalJson.call(this, data);
    };

    next();
  };
};

// Key generators for different endpoints
const cacheKeys = {
  dashboardOverview: (req) => `dashboard:overview:${req.user?.id || 'anonymous'}`,
  dashboardAnalytics: (req) => `dashboard:analytics:${req.query.period || '30'}:${req.user?.id || 'anonymous'}`,
  inventoryAnalytics: (req) => `inventory:analytics:${req.user?.id || 'anonymous'}`,
  products: (req) => `products:list:${JSON.stringify(req.query)}`,
  categories: (req) => `categories:list`,
  users: (req) => `users:list:${req.user?.role || 'anonymous'}`,
  sales: (req) => `sales:list:${JSON.stringify(req.query)}`,
  salesReports: (req) => `reports:sales:${JSON.stringify(req.query)}`,
  inventoryReports: (req) => `reports:inventory:${JSON.stringify(req.query)}`,
  profitReports: (req) => `reports:profit:${JSON.stringify(req.query)}`,
};

// Cache middleware functions
const cacheDashboardOverview = cacheMiddleware(shortCache, cacheKeys.dashboardOverview);
const cacheDashboardAnalytics = cacheMiddleware(mediumCache, cacheKeys.dashboardAnalytics);
const cacheInventoryAnalytics = cacheMiddleware(mediumCache, cacheKeys.inventoryAnalytics);
const cacheProducts = cacheMiddleware(mediumCache, cacheKeys.products);
const cacheCategories = cacheMiddleware(longCache, cacheKeys.categories);
const cacheUsers = cacheMiddleware(shortCache, cacheKeys.users);
const cacheSales = cacheMiddleware(mediumCache, cacheKeys.sales);
const cacheSalesReports = cacheMiddleware(mediumCache, cacheKeys.salesReports);
const cacheInventoryReports = cacheMiddleware(mediumCache, cacheKeys.inventoryReports);
const cacheProfitReports = cacheMiddleware(mediumCache, cacheKeys.profitReports);

// Cache invalidation functions
const invalidateCache = (pattern) => {
  const keys = shortCache.keys().concat(mediumCache.keys()).concat(longCache.keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      shortCache.del(key);
      mediumCache.del(key);
      longCache.del(key);
    }
  });
};

const invalidateDashboardCache = () => invalidateCache('dashboard');
const invalidateInventoryCache = () => invalidateCache('inventory');
const invalidateProductsCache = () => invalidateCache('products');
const invalidateUsersCache = () => invalidateCache('users');
const invalidateSalesCache = () => invalidateCache('sales');
const invalidateReportsCache = () => invalidateCache('reports');

// Cache statistics
const getCacheStats = () => ({
  short: shortCache.getStats(),
  medium: mediumCache.getStats(),
  long: longCache.getStats(),
});

module.exports = {
  cacheDashboardOverview,
  cacheDashboardAnalytics,
  cacheInventoryAnalytics,
  cacheProducts,
  cacheCategories,
  cacheUsers,
  cacheSales,
  cacheSalesReports,
  cacheInventoryReports,
  cacheProfitReports,
  invalidateDashboardCache,
  invalidateInventoryCache,
  invalidateProductsCache,
  invalidateUsersCache,
  invalidateSalesCache,
  invalidateReportsCache,
  getCacheStats,
};
