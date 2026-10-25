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

  console.log('Seed OK — admin@bode.local / admin123');
  console.log('Catálogo: yarn prisma:import-catalog');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
