import { PrismaClient } from '@prisma/client';
import { ensureStoreCategories } from './ensure-store-categories.js';

const sourceUrl = process.env.DATABASE_URL;
const targetUrl = process.env.SYNC_TARGET_DATABASE_URL?.trim();

if (!sourceUrl) throw new Error('DATABASE_URL (origen) requerida');
if (!targetUrl) {
  throw new Error('Define SYNC_TARGET_DATABASE_URL con la URL de la BD destino (prod)');
}

const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

async function main() {
  const srcStore = await source.store.findFirst({ orderBy: { createdAt: 'asc' } });
  const tgtStore = await target.store.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!srcStore) throw new Error('Sin tienda en origen');
  if (!tgtStore) throw new Error('Sin tienda en destino');

  const [products, srcCategories] = await Promise.all([
    source.product.findMany({
      where: { storeId: srcStore.id },
      orderBy: { name: 'asc' },
      include: { category: true },
    }),
    source.productCategory.findMany({ where: { storeId: srcStore.id } }),
  ]);

  if (products.length === 0) throw new Error('Origen sin productos');

  const tgtCategoryByName = await ensureStoreCategories(target, tgtStore.id);
  const srcCategoryNameById = new Map(srcCategories.map(c => [c.id, c.name]));

  await target.$transaction(async tx => {
    await tx.inventoryMovement.deleteMany({ where: { storeId: tgtStore.id } });
    await tx.product.deleteMany({ where: { storeId: tgtStore.id } });
    await tx.product.createMany({
      data: products.map(p => {
        const catName = p.categoryId ? srcCategoryNameById.get(p.categoryId) : p.category?.name;
        const categoryId = catName ? tgtCategoryByName.get(catName) ?? null : null;
        return {
          storeId: tgtStore.id,
          name: p.name,
          priceUsd: p.priceUsd,
          costUsd: p.costUsd,
          unit: p.unit,
          stock: p.stock,
          barcode: p.barcode,
          lowStockThreshold: p.lowStockThreshold,
          isActive: p.isActive,
          colorTag: p.colorTag,
          categoryId,
        };
      }),
    });
  });

  console.log(
    `Sincronizado: ${products.length} productos de "${srcStore.name}" → "${tgtStore.name}" (prod)`,
  );
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
