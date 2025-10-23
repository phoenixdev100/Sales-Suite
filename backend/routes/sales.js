const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, saleSchema } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Generate unique sale number
const generateSaleNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastSale = await prisma.sale.findFirst({
    where: {
      saleNumber: {
        startsWith: `SALE-${dateStr}`
      }
    },
    orderBy: {
      saleNumber: 'desc'
    }
  });

  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `SALE-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

// Get all sales with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      soldBy = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      AND: [
        search ? {
          OR: [
            { saleNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        status ? { status } : {},
        dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
        dateTo ? { createdAt: { lte: new Date(dateTo) } } : {},
        soldBy ? { soldById: soldBy } : {}
      ]
    };

    const sales = await prisma.sale.findMany({
      where,
      include: {
        soldBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        saleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take
    });

    const total = await prisma.sale.count({ where });

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get single sale by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        soldBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        saleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ sale });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// Create new sale
router.post('/', authenticateToken, validateRequest(saleSchema), async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, paymentMethod, discount, tax, notes } = req.body;

    // Validate products and calculate totals
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      if (!product.isActive) {
        return res.status(400).json({ error: `Product is inactive: ${product.name}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = item.quantity * item.price;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal
      });
    }

    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const finalAmount = totalAmount - discountAmount + taxAmount;

    // Generate sale number
    const saleNumber = await generateSaleNumber();

    // Create sale with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          totalAmount,
          discount: discountAmount,
          tax: taxAmount,
          finalAmount,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          notes,
          soldById: req.user.id,
          status: 'COMPLETED'
        }
      });

      // Create sale items and update product quantities
      for (const item of validatedItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          }
        });

        // Update product quantity
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: 'Sale',
            reference: sale.saleNumber
          }
        });
      }

      return sale;
    });

    // Fetch complete sale data
    const completeSale = await prisma.sale.findUnique({
      where: { id: result.id },
      include: {
        soldBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        saleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Sale created successfully',
      sale: completeSale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Update sale status
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existingSale = await prisma.sale.findUnique({
      where: { id },
      include: {
        saleItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Handle refund logic
    if (status === 'REFUNDED' && existingSale.status === 'COMPLETED') {
      await prisma.$transaction(async (tx) => {
        // Update sale status
        await tx.sale.update({
          where: { id },
          data: { status }
        });

        // Restore product quantities
        for (const item of existingSale.saleItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              reason: 'Refund',
              reference: existingSale.saleNumber
            }
          });
        }
      });
    } else {
      await prisma.sale.update({
        where: { id },
        data: { status }
      });
    }

    res.json({ message: 'Sale status updated successfully' });
  } catch (error) {
    console.error('Update sale status error:', error);
    res.status(500).json({ error: 'Failed to update sale status' });
  }
});

// Get sales statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const stats = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: daysAgo
        },
        status: 'COMPLETED'
      },
      _sum: {
        finalAmount: true
      },
      _count: {
        id: true
      }
    });

    const totalRevenue = stats._sum.finalAmount || 0;
    const totalSales = stats._count.id || 0;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    res.json({
      totalRevenue,
      totalSales,
      averageOrderValue,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Sales stats error:', error);
    res.status(500).json({ error: 'Failed to fetch sales statistics' });
  }
});

module.exports = router;
