const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        description: 'Electronic devices and accessories'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: {
        name: 'Clothing',
        description: 'Apparel and fashion items'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: {
        name: 'Books',
        description: 'Books and educational materials'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Sports' },
      update: {},
      create: {
        name: 'Sports',
        description: 'Sports equipment and accessories'
      }
    })
  ]);

  console.log('✅ Categories created');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER'
    }
  });

  // Create salesperson user
  const salespersonPassword = await bcrypt.hash('sales123', 12);
  const salespersonUser = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      password: salespersonPassword,
      firstName: 'Sales',
      lastName: 'Person',
      role: 'SALESPERSON'
    }
  });

  console.log('✅ Users created');

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      description: 'Latest Apple iPhone with advanced features',
      sku: 'IPH15PRO001',
      barcode: '123456789012',
      price: 999.99,
      cost: 750.00,
      quantity: 25,
      minStock: 5,
      maxStock: 100,
      categoryId: categories[0].id // Electronics
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Premium Android smartphone',
      sku: 'SGS24001',
      barcode: '123456789013',
      price: 899.99,
      cost: 650.00,
      quantity: 30,
      minStock: 5,
      maxStock: 100,
      categoryId: categories[0].id // Electronics
    },
    {
      name: 'MacBook Air M3',
      description: 'Lightweight laptop with M3 chip',
      sku: 'MBA15M3001',
      barcode: '123456789014',
      price: 1299.99,
      cost: 950.00,
      quantity: 15,
      minStock: 3,
      maxStock: 50,
      categoryId: categories[0].id // Electronics
    },
    {
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes',
      sku: 'NAM270001',
      barcode: '123456789015',
      price: 149.99,
      cost: 75.00,
      quantity: 50,
      minStock: 10,
      maxStock: 200,
      categoryId: categories[1].id // Clothing
    },
    {
      name: 'Levi\'s 501 Jeans',
      description: 'Classic straight-leg jeans',
      sku: 'LEV501001',
      barcode: '123456789016',
      price: 89.99,
      cost: 45.00,
      quantity: 40,
      minStock: 8,
      maxStock: 150,
      categoryId: categories[1].id // Clothing
    },
    {
      name: 'The Great Gatsby',
      description: 'Classic American novel',
      sku: 'TGG001',
      barcode: '123456789017',
      price: 12.99,
      cost: 6.50,
      quantity: 100,
      minStock: 20,
      maxStock: 500,
      categoryId: categories[2].id // Books
    },
    {
      name: 'Coffee Maker Deluxe',
      description: 'Programmable coffee maker with timer',
      sku: 'CMD001',
      barcode: '123456789018',
      price: 79.99,
      cost: 40.00,
      quantity: 20,
      minStock: 5,
      maxStock: 80,
      categoryId: categories[3].id // Home & Garden
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Non-slip exercise mat',
      sku: 'YMP001',
      barcode: '123456789019',
      price: 39.99,
      cost: 20.00,
      quantity: 35,
      minStock: 10,
      maxStock: 150,
      categoryId: categories[4].id // Sports
    },
    {
      name: 'Wireless Headphones',
      description: 'Bluetooth noise-canceling headphones',
      sku: 'WH001',
      barcode: '123456789020',
      price: 199.99,
      cost: 120.00,
      quantity: 8, // Low stock for testing alerts
      minStock: 10,
      maxStock: 100,
      categoryId: categories[0].id // Electronics
    },
    {
      name: 'Gaming Mouse RGB',
      description: 'High-precision gaming mouse with RGB lighting',
      sku: 'GMR001',
      barcode: '123456789021',
      price: 59.99,
      cost: 30.00,
      quantity: 0, // Out of stock for testing
      minStock: 5,
      maxStock: 80,
      categoryId: categories[0].id // Electronics
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData
    });
  }

  console.log('✅ Products created');

  // Create some sample sales
  const sampleSales = [
    {
      saleNumber: 'SALE-20241021-0001',
      totalAmount: 1199.98,
      discount: 0,
      tax: 96.00,
      finalAmount: 1295.98,
      status: 'COMPLETED',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      paymentMethod: 'Credit Card',
      soldById: salespersonUser.id,
      items: [
        { productSku: 'IPH15PRO001', quantity: 1, price: 999.99 },
        { productSku: 'WH001', quantity: 1, price: 199.99 }
      ]
    },
    {
      saleNumber: 'SALE-20241021-0002',
      totalAmount: 239.98,
      discount: 10.00,
      tax: 18.40,
      finalAmount: 248.38,
      status: 'COMPLETED',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      paymentMethod: 'Cash',
      soldById: salespersonUser.id,
      items: [
        { productSku: 'NAM270001', quantity: 1, price: 149.99 },
        { productSku: 'LEV501001', quantity: 1, price: 89.99 }
      ]
    }
  ];

  for (const saleData of sampleSales) {
    const { items, ...saleInfo } = saleData;
    
    // Create sale
    const sale = await prisma.sale.create({
      data: saleInfo
    });

    // Create sale items
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { sku: item.productSku }
      });

      if (product) {
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: product.id,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          }
        });

        // Update product quantity
        await prisma.product.update({
          where: { id: product.id },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        // Create stock movement
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'OUT',
            quantity: item.quantity,
            reason: 'Sale',
            reference: sale.saleNumber
          }
        });
      }
    }
  }

  console.log('✅ Sample sales created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Default Users:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Manager: manager@example.com / manager123');
  console.log('Salesperson: sales@example.com / sales123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
