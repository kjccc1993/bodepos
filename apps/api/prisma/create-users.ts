import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { normalizeUsername } from '../src/shared/username.js';

const prisma = new PrismaClient();

type UserSpec = { username: string; password: string; role?: string };

async function main() {
  const specs: UserSpec[] = [
    { username: 'kevin.camargo', password: 'Zenaida.10' },
    { username: 'edgar.camargo', password: 'Zenaida.10' },
  ];

  const store = await prisma.store.findFirst();
  if (!store) {
    throw new Error('No hay tienda en la base de datos.');
  }

  for (const spec of specs) {
    const username = normalizeUsername(spec.username);
    const passwordHash = await bcrypt.hash(spec.password, 10);
    await prisma.user.upsert({
      where: { storeId_username: { storeId: store.id, username } },
      create: {
        storeId: store.id,
        username,
        passwordHash,
        role: spec.role ?? 'admin',
      },
      update: { passwordHash, isActive: true },
    });
    console.log(`Usuario listo: ${username}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
