const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard overview data
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Parallel queries for better performance
    const [
      todaySales,
      monthSales,
      yearSales,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalUsers,
      recentSales,
      topProducts,
      salesTrend
    ] = await Promise.all([
      // Today's sales
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          status: 'COMPLETED'
        },
        _sum: { finalAmount: true },
        _count: { id: true }
      }),

      // This month's sales
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'COMPLETED'
        },
        _sum: { finalAmount: true },
        _count: { id: true }
      }),

      // This year's sales
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfYear },
          status: 'COMPLETED'
        },
        _sum: { finalAmount: true },
        _count: { id: true }
      }),

      // Total products
      prisma.product.count({
        where: { isActive: true }
      }),

      // Low stock products
      prisma.product.count({
        where: {
          isActive: true,
          quantity: { lte: prisma.raw('min_stock') }
        }
      }),

      // Out of stock products
      prisma.product.count({
        where: {
          isActive: true,
          quantity: 0
        }
      }),

      // Total users
      prisma.user.count({
        where: { isActive: true }
      }),

      // Recent sales (last 10)
      prisma.sale.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          soldBy: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),

      // Top selling products (last 30 days)
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            status: 'COMPLETED'
          }
        },
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),

      // Sales trend (last 7 days)
      getSalesTrend(7)
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true
          }
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
          salesCount: item._count.id
        };
      })
    );

    res.json({
      summary: {
        today: {
          sales: todaySales._count.id || 0,
          revenue: parseFloat(todaySales._sum.finalAmount || 0)
        },
        month: {
          sales: monthSales._count.id || 0,
          revenue: parseFloat(monthSales._sum.finalAmount || 0)
        },
        year: {
          sales: yearSales._count.id || 0,
          revenue: parseFloat(yearSales._sum.finalAmount || 0)
        }
      },
      inventory: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        stockHealth: totalProducts > 0 ? 
          ((totalProducts - lowStockProducts) / totalProducts * 100).toFixed(1) : 0
      },
      users: {
        total: totalUsers
      },
      recentSales: recentSales.map(sale => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        finalAmount: parseFloat(sale.finalAmount),
        customerName: sale.customerName,
        soldBy: `${sale.soldBy.firstName} ${sale.soldBy.lastName}`,
        createdAt: sale.createdAt,
        status: sale.status
      })),
      topProducts: topProductsWithDetails,
      salesTrend
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get sales analytics
router.get('/analytics/sales', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const salesTrend = await getSalesTrend(days);
    const categoryPerformance = await getCategoryPerformance(days);
    const salesByHour = await getSalesByHour(days);

    res.json({
      salesTrend,
      categoryPerformance,
      salesByHour,
      period: days
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get inventory analytics
router.get('/analytics/inventory', authenticateToken, async (req, res) => {
  try {
    const [
      categoryDistribution,
      stockLevels,
      inventoryValue
    ] = await Promise.all([
      // Products by category
      prisma.product.groupBy({
        by: ['categoryId'],
        where: { isActive: true },
        _count: { id: true },
        _sum: { quantity: true }
      }),

      // Stock level distribution
      getStockLevelDistribution(),

      // Inventory value by category
      getInventoryValueByCategory()
    ]);

    // Get category names
    const categoriesWithNames = await Promise.all(
      categoryDistribution.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true }
        });
        return {
          categoryName: category?.name || 'Unknown',
          productCount: item._count.id,
          totalQuantity: item._sum.quantity || 0
        };
      })
    );

    res.json({
      categoryDistribution: categoriesWithNames,
      stockLevels,
      inventoryValue
    });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory analytics' });
  }
});

// Helper functions
async function getSalesTrend(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'COMPLETED'
    },
    select: {
      createdAt: true,
      finalAmount: true
    }
  });

  // Group by date
  const trend = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    trend[dateStr] = { date: dateStr, sales: 0, revenue: 0 };
  }

  sales.forEach(sale => {
    const dateStr = sale.createdAt.toISOString().slice(0, 10);
    if (trend[dateStr]) {
      trend[dateStr].sales += 1;
      trend[dateStr].revenue += parseFloat(sale.finalAmount);
    }
  });

  return Object.values(trend).sort((a, b) => a.date.localeCompare(b.date));
}

async function getCategoryPerformance(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const categoryStats = await prisma.saleItem.groupBy({
    by: ['productId'],
    where: {
      sale: {
        createdAt: { gte: startDate },
        status: 'COMPLETED'
      }
    },
    _sum: {
      quantity: true,
      total: true
    }
  });

  // Group by category
  const categoryPerformance = {};
  
  for (const stat of categoryStats) {
    const product = await prisma.product.findUnique({
      where: { id: stat.productId },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    if (product) {
      const categoryName = product.category.name;
      if (!categoryPerformance[categoryName]) {
        categoryPerformance[categoryName] = {
          category: categoryName,
          totalSold: 0,
          totalRevenue: 0
        };
      }
      categoryPerformance[categoryName].totalSold += stat._sum.quantity || 0;
      categoryPerformance[categoryName].totalRevenue += parseFloat(stat._sum.total || 0);
    }
  }

  return Object.values(categoryPerformance);
}

async function getSalesByHour(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'COMPLETED'
    },
    select: {
      createdAt: true,
      finalAmount: true
    }
  });

  const hourlyStats = {};
  for (let i = 0; i < 24; i++) {
    hourlyStats[i] = { hour: i, sales: 0, revenue: 0 };
  }

  sales.forEach(sale => {
    const hour = sale.createdAt.getHours();
    hourlyStats[hour].sales += 1;
    hourlyStats[hour].revenue += parseFloat(sale.finalAmount);
  });

  return Object.values(hourlyStats);
}

async function getStockLevelDistribution() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      quantity: true,
      minStock: true
    }
  });

  const distribution = {
    outOfStock: 0,
    lowStock: 0,
    inStock: 0,
    overStock: 0
  };

  products.forEach(product => {
    if (product.quantity === 0) {
      distribution.outOfStock++;
    } else if (product.quantity <= product.minStock) {
      distribution.lowStock++;
    } else if (product.quantity > product.minStock * 2) {
      distribution.overStock++;
    } else {
      distribution.inStock++;
    }
  });

  return distribution;
}

async function getInventoryValueByCategory() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: { name: true }
      }
    }
  });

  const valueByCategory = {};
  
  products.forEach(product => {
    const categoryName = product.category.name;
    const value = parseFloat(product.cost) * product.quantity;
    
    if (!valueByCategory[categoryName]) {
      valueByCategory[categoryName] = {
        category: categoryName,
        value: 0,
        products: 0
      };
    }
    
    valueByCategory[categoryName].value += value;
    valueByCategory[categoryName].products += 1;
  });

  return Object.values(valueByCategory);
}

module.exports = router;
