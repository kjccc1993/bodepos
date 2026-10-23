import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const store =
    (await prisma.store.findFirst()) ??
    (await prisma.store.create({
      data: {
        name: 'Camargo Demo Bodega',
        customRate: 884.75,
        useFixedRate: false,
      },
    }));

  const email = 'admin@bode.local';
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { storeId_email: { storeId: store.id, email } },
    create: {
      storeId: store.id,
      email,
      passwordHash,
      role: 'admin',
    },
    update: { passwordHash, isActive: true },
  });

  const productCount = await prisma.product.count({ where: { storeId: store.id } });
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        { storeId: store.id, name: 'Harina pan 1kg', priceUsd: 1.4, stock: 21, unit: 'UNIT', barcode: '7591234567890' },
        { storeId: store.id, name: 'Aceite 900ml', priceUsd: 4.4, stock: 15, unit: 'UNIT', barcode: '7591234567891' },
        { storeId: store.id, name: 'Arroz 1kg', priceUsd: 1.9, stock: 8, unit: 'UNIT', barcode: '7591234567892' },
      ],
    });
  }

  console.log('Seed OK — admin@bode.local / admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
