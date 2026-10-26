import type { PrismaClient } from '@prisma/client';
import { STORE_CATEGORY_DEFS } from './product-category-rules.js';

/** Crea o actualiza las categorías estándar de una tienda. Devuelve mapa nombre → id. */
export async function ensureStoreCategories(
  prisma: PrismaClient,
  storeId: string,
): Promise<Map<string, string>> {
  const byName = new Map<string, string>();

  for (const def of STORE_CATEGORY_DEFS) {
    const row = await prisma.productCategory.upsert({
      where: { storeId_name: { storeId, name: def.name } },
      create: { storeId, name: def.name, sortOrder: def.sortOrder, isActive: true },
      update: { sortOrder: def.sortOrder, isActive: true },
    });
    byName.set(def.name, row.id);
  }

  return byName;
}
