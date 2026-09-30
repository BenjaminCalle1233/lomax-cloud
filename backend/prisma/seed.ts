import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Multiple backend pods can start together. Seed only an empty database, once.
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(741852)::text`;
    const [clientCount, productCount, orderCount] = await Promise.all([
      tx.client.count(),
      tx.product.count(),
      tx.order.count(),
    ]);
    if (clientCount || productCount || orderCount) {
      console.log('Seed skipped: existing data preserved');
      return;
    }

    // Create 10 clients
    const clients = await Promise.all([
      tx.client.create({ data: { name: 'Comercial La Paz', nit: '1001001', email: 'ventas@comerciallapaz.com', phone: '2-2200001' } }),
      tx.client.create({ data: { name: 'Distribuidora Oruro', nit: '1001002', email: 'info@distoruro.com', phone: '2-5200002' } }),
      tx.client.create({ data: { name: 'Importadora Cochabamba', nit: '1001003', email: 'contacto@impcbba.com', phone: '4-4200003' } }),
      tx.client.create({ data: { name: 'Tecnología Santa Cruz', nit: '1001004', email: 'ventas@tecscz.com', phone: '3-3200004' } }),
      tx.client.create({ data: { name: 'Suministros Sucre', nit: '1001005', email: 'admin@sumsucre.com', phone: '4-6200005' } }),
      tx.client.create({ data: { name: 'Electrónica Tarija', nit: '1001006', email: 'info@electarija.com', phone: '4-6600006' } }),
      tx.client.create({ data: { name: 'Mayorista Potosí', nit: '1001007', email: 'ventas@maypotosi.com', phone: '2-6200007' } }),
      tx.client.create({ data: { name: 'Corporación Beni', nit: '1001008', email: 'corp@corpbeni.com', phone: '3-4600008' } }),
      tx.client.create({ data: { name: 'Grupo Pando', nit: '1001009', email: 'admin@grupopando.com', phone: '3-8400009' } }),
      tx.client.create({ data: { name: 'Red Comercial Bolivia', nit: '1001010', email: 'info@redcombol.com', phone: '2-2100010' } }),
    ]);

    // Create 20 products
    const products = await Promise.all([
      tx.product.create({ data: { name: 'Monitor Samsung 24"', description: 'Monitor LED Full HD 24 pulgadas', price: 189.99, stock: 50 } }),
      tx.product.create({ data: { name: 'Teclado Logitech K380', description: 'Teclado inalámbrico Bluetooth', price: 39.99, stock: 100 } }),
      tx.product.create({ data: { name: 'Mouse Logitech MX Master', description: 'Mouse ergonómico inalámbrico', price: 79.99, stock: 75 } }),
      tx.product.create({ data: { name: 'Laptop HP ProBook 450', description: 'Laptop empresarial i5 16GB RAM', price: 899.99, stock: 20 } }),
      tx.product.create({ data: { name: 'Impresora Epson L3250', description: 'Impresora multifuncional EcoTank', price: 249.99, stock: 30 } }),
      tx.product.create({ data: { name: 'Disco SSD Kingston 480GB', description: 'Disco sólido SATA 2.5"', price: 45.99, stock: 120 } }),
      tx.product.create({ data: { name: 'Memoria RAM DDR4 8GB', description: 'Memoria Kingston 3200MHz', price: 29.99, stock: 200 } }),
      tx.product.create({ data: { name: 'Cable HDMI 2m', description: 'Cable HDMI 2.0 alta velocidad', price: 9.99, stock: 300 } }),
      tx.product.create({ data: { name: 'Webcam Logitech C920', description: 'Cámara web Full HD 1080p', price: 69.99, stock: 40 } }),
      tx.product.create({ data: { name: 'Auriculares Sony WH-1000XM4', description: 'Auriculares Bluetooth con ANC', price: 299.99, stock: 25 } }),
      tx.product.create({ data: { name: 'Hub USB-C 7 en 1', description: 'Adaptador multipuerto USB-C', price: 34.99, stock: 60 } }),
      tx.product.create({ data: { name: 'Router TP-Link Archer AX50', description: 'Router WiFi 6 doble banda', price: 119.99, stock: 35 } }),
      tx.product.create({ data: { name: 'UPS APC 600VA', description: 'Sistema UPS para protección eléctrica', price: 89.99, stock: 45 } }),
      tx.product.create({ data: { name: 'Silla Ergonómica Pro', description: 'Silla de oficina ergonómica ajustable', price: 349.99, stock: 15 } }),
      tx.product.create({ data: { name: 'Escritorio Standing Desk', description: 'Escritorio ajustable en altura', price: 499.99, stock: 10 } }),
      tx.product.create({ data: { name: 'Tablet Samsung Galaxy Tab A8', description: 'Tablet 10.5" 64GB WiFi', price: 229.99, stock: 20 } }),
      tx.product.create({ data: { name: 'Cargador USB-C 65W', description: 'Cargador rápido GaN USB-C', price: 24.99, stock: 150 } }),
      tx.product.create({ data: { name: 'Mousepad XL Gaming', description: 'Alfombrilla de escritorio 90x40cm', price: 19.99, stock: 80 } }),
      tx.product.create({ data: { name: 'Lámpara LED Escritorio', description: 'Lámpara LED ajustable con USB', price: 35.99, stock: 55 } }),
      tx.product.create({ data: { name: 'Parlante JBL Flip 6', description: 'Parlante Bluetooth portátil', price: 129.99, stock: 30 } }),
    ]);

    // Create 20 orders with details
    const orderData: { clientId: number; items: { productId: number; quantity: number }[] }[] = [
      { clientId: 1, items: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }] },
      { clientId: 2, items: [{ productId: 4, quantity: 1 }, { productId: 6, quantity: 3 }, { productId: 8, quantity: 5 }] },
      { clientId: 3, items: [{ productId: 2, quantity: 4 }, { productId: 7, quantity: 2 }] },
      { clientId: 4, items: [{ productId: 5, quantity: 1 }, { productId: 9, quantity: 2 }] },
      { clientId: 5, items: [{ productId: 10, quantity: 1 }, { productId: 11, quantity: 3 }] },
      { clientId: 6, items: [{ productId: 12, quantity: 1 }, { productId: 13, quantity: 2 }] },
      { clientId: 7, items: [{ productId: 14, quantity: 1 }, { productId: 15, quantity: 1 }] },
      { clientId: 8, items: [{ productId: 16, quantity: 2 }, { productId: 17, quantity: 3 }] },
      { clientId: 9, items: [{ productId: 18, quantity: 2 }, { productId: 19, quantity: 1 }] },
      { clientId: 10, items: [{ productId: 20, quantity: 2 }, { productId: 1, quantity: 1 }] },
      { clientId: 1, items: [{ productId: 4, quantity: 1 }, { productId: 7, quantity: 4 }, { productId: 11, quantity: 2 }] },
      { clientId: 2, items: [{ productId: 14, quantity: 1 }] },
      { clientId: 3, items: [{ productId: 16, quantity: 3 }, { productId: 20, quantity: 1 }] },
      { clientId: 4, items: [{ productId: 2, quantity: 5 }, { productId: 3, quantity: 2 }, { productId: 8, quantity: 10 }] },
      { clientId: 5, items: [{ productId: 6, quantity: 4 }, { productId: 9, quantity: 1 }] },
      { clientId: 6, items: [{ productId: 1, quantity: 3 }, { productId: 5, quantity: 1 }] },
      { clientId: 7, items: [{ productId: 10, quantity: 2 }, { productId: 13, quantity: 1 }] },
      { clientId: 8, items: [{ productId: 15, quantity: 1 }, { productId: 19, quantity: 2 }] },
      { clientId: 9, items: [{ productId: 12, quantity: 1 }, { productId: 17, quantity: 5 }] },
      { clientId: 10, items: [{ productId: 4, quantity: 1 }, { productId: 6, quantity: 2 }, { productId: 18, quantity: 3 }] },
    ];

    for (const order of orderData) {
      const productIds = order.items.map((i) => products[i.productId - 1].id);
      const foundProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      let total = new Prisma.Decimal(0);
      const detailsData: { productId: number; quantity: number; unitPrice: Prisma.Decimal; subtotal: Prisma.Decimal }[] = [];

      for (const item of order.items) {
        const product = foundProducts.find((p) => p.id === products[item.productId - 1].id)!;
        const unitPrice = product.price;
        const subtotal = unitPrice.mul(item.quantity);
        total = total.add(subtotal);
        detailsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      await tx.order.create({
        data: {
          clientId: clients[order.clientId - 1].id,
          status: 'COMPLETADO',
          total,
          details: {
            create: detailsData,
          },
        },
      });
    }

    console.log('Seed completed: 10 clients, 20 products, 20 orders');
  }, { timeout: 30000 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

