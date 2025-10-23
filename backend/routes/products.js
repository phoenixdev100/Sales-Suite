const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, productSchema, updateProductSchema } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with pagination, search, and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      sortBy = 'name',
      sortOrder = 'asc',
      lowStock = false
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        category ? { categoryId: category } : {},
        lowStock === 'true' ? {
          quantity: { lte: prisma.raw('min_stock') }
        } : {}
      ]
    };

    // Get products with category information
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take
    });

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Calculate low stock items
    const lowStockItems = products.filter(product => product.quantity <= product.minStock);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      lowStockCount: lowStockItems.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), validateRequest(productSchema), async (req, res) => {
  try {
    const productData = req.body;

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: productData.sku }
    });

    if (existingSku) {
      return res.status(400).json({ error: 'Product with this SKU already exists' });
    }

    // Check if barcode already exists (if provided)
    if (productData.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: productData.barcode }
      });

      if (existingBarcode) {
        return res.status(400).json({ error: 'Product with this barcode already exists' });
      }
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create stock movement record
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'IN',
        quantity: product.quantity,
        reason: 'Initial stock',
        reference: 'INITIAL'
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), validateRequest(updateProductSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check SKU uniqueness if being updated
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      });

      if (existingSku) {
        return res.status(400).json({ error: 'Product with this SKU already exists' });
      }
    }

    // Check barcode uniqueness if being updated
    if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: updateData.barcode }
      });

      if (existingBarcode) {
        return res.status(400).json({ error: 'Product with this barcode already exists' });
      }
    }

    // Verify category exists if being updated
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId }
      });

      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    // Track quantity changes for stock movement
    const quantityDiff = updateData.quantity !== undefined ? 
      updateData.quantity - existingProduct.quantity : 0;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create stock movement record if quantity changed
    if (quantityDiff !== 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: quantityDiff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDiff),
          reason: 'Manual adjustment',
          reference: 'ADJUSTMENT'
        }
      });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        saleItems: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has been sold
    if (product.saleItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product that has sales history. Consider deactivating instead.' 
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get low stock products
router.get('/alerts/low-stock', authenticateToken, async (req, res) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        quantity: {
          lte: prisma.raw('min_stock')
        },
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    });

    res.json({ products: lowStockProducts });
  } catch (error) {
    console.error('Low stock products error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

module.exports = router;
