import { PrismaClient } from '@prisma/client';
import { ensureStoreCategories } from './ensure-store-categories.js';
import { categoryNameForProduct } from './product-category-rules.js';

const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany({ select: { id: true, name: true } });
  if (stores.length === 0) throw new Error('Sin tiendas');

  for (const store of stores) {
    const byName = await ensureStoreCategories(prisma, store.id);
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      select: { id: true, name: true },
    });

    let updated = 0;
    for (const p of products) {
      const catName = categoryNameForProduct(p.name);
      const categoryId = byName.get(catName);
      if (!categoryId) continue;
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId },
      });
      updated++;
    }

    console.log(`Tienda "${store.name}": ${byName.size} categorías, ${updated} productos asignados`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
