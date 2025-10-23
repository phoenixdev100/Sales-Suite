const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Get sales report data
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const {
      dateFrom = '',
      dateTo = '',
      format = 'json',
      groupBy = 'day'
    } = req.query;

    let startDate = dateFrom ? new Date(dateFrom) : new Date();
    let endDate = dateTo ? new Date(dateTo) : new Date();

    // Default to last 30 days if no dates provided
    if (!dateFrom && !dateTo) {
      startDate.setDate(startDate.getDate() - 30);
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        soldBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        saleItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      return generateSalesCSV(sales, res);
    }

    if (format === 'pdf') {
      return generateSalesPDF(sales, res);
    }

    // Group data by specified period
    const groupedData = groupSalesByPeriod(sales, groupBy);

    res.json({
      sales,
      summary: {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.finalAmount), 0),
        averageOrderValue: sales.length > 0 ? 
          sales.reduce((sum, sale) => sum + parseFloat(sale.finalAmount), 0) / sales.length : 0,
        dateRange: {
          from: startDate,
          to: endDate
        }
      },
      groupedData
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Get inventory report
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const { format = 'json', lowStock = false } = req.query;

    let whereClause = {};
    if (lowStock === 'true') {
      whereClause = {
        quantity: {
          lte: prisma.raw('min_stock')
        }
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (format === 'csv') {
      return generateInventoryCSV(products, res);
    }

    // Calculate inventory value
    const totalValue = products.reduce((sum, product) => {
      return sum + (parseFloat(product.cost) * product.quantity);
    }, 0);

    const lowStockItems = products.filter(product => product.quantity <= product.minStock);

    res.json({
      products,
      summary: {
        totalProducts: products.length,
        totalValue,
        lowStockItems: lowStockItems.length,
        outOfStockItems: products.filter(p => p.quantity === 0).length
      }
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

// Get profit report
router.get('/profit', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const {
      dateFrom = '',
      dateTo = '',
      format = 'json'
    } = req.query;

    let startDate = dateFrom ? new Date(dateFrom) : new Date();
    let endDate = dateTo ? new Date(dateTo) : new Date();

    if (!dateFrom && !dateTo) {
      startDate.setDate(startDate.getDate() - 30);
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        saleItems: {
          include: {
            product: {
              select: {
                name: true,
                cost: true
              }
            }
          }
        }
      }
    });

    const profitData = sales.map(sale => {
      const totalCost = sale.saleItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.cost) * item.quantity);
      }, 0);

      const profit = parseFloat(sale.finalAmount) - totalCost;
      const profitMargin = parseFloat(sale.finalAmount) > 0 ? 
        (profit / parseFloat(sale.finalAmount)) * 100 : 0;

      return {
        saleId: sale.id,
        saleNumber: sale.saleNumber,
        date: sale.createdAt,
        revenue: parseFloat(sale.finalAmount),
        cost: totalCost,
        profit,
        profitMargin
      };
    });

    if (format === 'csv') {
      return generateProfitCSV(profitData, res);
    }

    const totalRevenue = profitData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = profitData.reduce((sum, item) => sum + item.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    res.json({
      profitData,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        overallMargin,
        dateRange: {
          from: startDate,
          to: endDate
        }
      }
    });
  } catch (error) {
    console.error('Profit report error:', error);
    res.status(500).json({ error: 'Failed to generate profit report' });
  }
});

// Helper functions
function groupSalesByPeriod(sales, groupBy) {
  const grouped = {};

  sales.forEach(sale => {
    let key;
    const date = new Date(sale.createdAt);

    switch (groupBy) {
      case 'hour':
        key = date.toISOString().slice(0, 13);
        break;
      case 'day':
        key = date.toISOString().slice(0, 10);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      default:
        key = date.toISOString().slice(0, 10);
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        sales: 0,
        revenue: 0
      };
    }

    grouped[key].sales += 1;
    grouped[key].revenue += parseFloat(sale.finalAmount);
  });

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

function generateSalesCSV(sales, res) {
  const csvData = sales.flatMap(sale => 
    sale.saleItems.map(item => ({
      saleNumber: sale.saleNumber,
      date: sale.createdAt.toISOString().slice(0, 10),
      customerName: sale.customerName || '',
      productName: item.product.name,
      sku: item.product.sku,
      category: item.product.category.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      saleTotal: sale.finalAmount,
      soldBy: `${sale.soldBy.firstName} ${sale.soldBy.lastName}`
    }))
  );

  const csvWriter = createCsvWriter({
    path: 'temp_sales_report.csv',
    header: [
      { id: 'saleNumber', title: 'Sale Number' },
      { id: 'date', title: 'Date' },
      { id: 'customerName', title: 'Customer' },
      { id: 'productName', title: 'Product' },
      { id: 'sku', title: 'SKU' },
      { id: 'category', title: 'Category' },
      { id: 'quantity', title: 'Quantity' },
      { id: 'price', title: 'Price' },
      { id: 'total', title: 'Item Total' },
      { id: 'saleTotal', title: 'Sale Total' },
      { id: 'soldBy', title: 'Sold By' }
    ]
  });

  csvWriter.writeRecords(csvData)
    .then(() => {
      res.download('temp_sales_report.csv', 'sales_report.csv', (err) => {
        if (!err) {
          fs.unlinkSync('temp_sales_report.csv');
        }
      });
    })
    .catch(error => {
      console.error('CSV generation error:', error);
      res.status(500).json({ error: 'Failed to generate CSV' });
    });
}

function generateInventoryCSV(products, res) {
  const csvData = products.map(product => ({
    name: product.name,
    sku: product.sku,
    category: product.category.name,
    quantity: product.quantity,
    minStock: product.minStock,
    price: product.price,
    cost: product.cost,
    value: parseFloat(product.cost) * product.quantity,
    status: product.quantity <= product.minStock ? 'Low Stock' : 'In Stock'
  }));

  const csvWriter = createCsvWriter({
    path: 'temp_inventory_report.csv',
    header: [
      { id: 'name', title: 'Product Name' },
      { id: 'sku', title: 'SKU' },
      { id: 'category', title: 'Category' },
      { id: 'quantity', title: 'Quantity' },
      { id: 'minStock', title: 'Min Stock' },
      { id: 'price', title: 'Price' },
      { id: 'cost', title: 'Cost' },
      { id: 'value', title: 'Total Value' },
      { id: 'status', title: 'Status' }
    ]
  });

  csvWriter.writeRecords(csvData)
    .then(() => {
      res.download('temp_inventory_report.csv', 'inventory_report.csv', (err) => {
        if (!err) {
          fs.unlinkSync('temp_inventory_report.csv');
        }
      });
    })
    .catch(error => {
      console.error('CSV generation error:', error);
      res.status(500).json({ error: 'Failed to generate CSV' });
    });
}

function generateProfitCSV(profitData, res) {
  const csvWriter = createCsvWriter({
    path: 'temp_profit_report.csv',
    header: [
      { id: 'saleNumber', title: 'Sale Number' },
      { id: 'date', title: 'Date' },
      { id: 'revenue', title: 'Revenue' },
      { id: 'cost', title: 'Cost' },
      { id: 'profit', title: 'Profit' },
      { id: 'profitMargin', title: 'Profit Margin (%)' }
    ]
  });

  csvWriter.writeRecords(profitData)
    .then(() => {
      res.download('temp_profit_report.csv', 'profit_report.csv', (err) => {
        if (!err) {
          fs.unlinkSync('temp_profit_report.csv');
        }
      });
    })
    .catch(error => {
      console.error('CSV generation error:', error);
      res.status(500).json({ error: 'Failed to generate CSV' });
    });
}

module.exports = router;
