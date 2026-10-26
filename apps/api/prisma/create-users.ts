import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { normalizeUsername } from '../src/shared/username.js';

const prisma = new PrismaClient();

/** Formato: `usuario:contraseña,usuario2:contraseña2` en CREATE_USERS */
function parseUserSpecs(): { username: string; password: string; role?: string }[] {
  const raw = process.env.CREATE_USERS?.trim();
  if (!raw) {
    throw new Error('Define CREATE_USERS (ej. kevin.camargo:secret,edgar.camargo:secret)');
  }
  return raw.split(',').map(part => {
    const [username, password] = part.split(':');
    if (!username?.trim() || !password) {
      throw new Error(`Entrada inválida en CREATE_USERS: ${part}`);
    }
    return { username: username.trim(), password };
  });
}

async function main() {
  const specs = parseUserSpecs();

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
