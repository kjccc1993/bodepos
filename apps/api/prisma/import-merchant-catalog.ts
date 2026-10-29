import { ProductUnit, PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();

type MerchantCatalogItem = {
  name: string;
  unit: string;
  inStock: number;
  costForUnit: number;
  priceToSellUsd: number;
};

function mapUnit(unit: string): ProductUnit {
  if (unit === 'Kg') return ProductUnit.KG;
  return ProductUnit.UNIT;
}

function mapStock(_unit: string, inStock: number): number {
  return inStock ?? 0;
}

function loadCatalog(): MerchantCatalogItem[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, 'data', 'merchant-catalog.json'), 'utf8');
  const parsed = JSON.parse(raw) as MerchantCatalogItem[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Catálogo vacío o inválido');
  }
  return parsed;
}

async function replaceStoreCatalog(storeId: string, items: MerchantCatalogItem[]) {
  const rows = items.map(item => ({
    storeId,
    name: item.name.trim(),
    priceUsd: item.priceToSellUsd,
    costUsd: item.costForUnit ?? 0,
    unit: mapUnit(item.unit),
    stock: mapStock(item.unit, item.inStock),
    barcode: null as string | null,
    isActive: true,
  }));

  await prisma.$transaction(async tx => {
    await tx.inventoryMovement.deleteMany({ where: { storeId } });
    await tx.product.deleteMany({ where: { storeId } });
    await tx.product.createMany({ data: rows });
  });
}

async function upsertStoreCatalog(storeId: string, items: MerchantCatalogItem[]) {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const name = item.name.trim();
    const data = {
      priceUsd: item.priceToSellUsd,
      costUsd: item.costForUnit ?? 0,
      unit: mapUnit(item.unit),
      stock: mapStock(item.unit, item.inStock),
      isActive: true,
    };

    const existing = await prisma.product.findFirst({
      where: { storeId, name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.product.create({
        data: { storeId, name, barcode: null, ...data },
      });
      created++;
    }
  }

  return { created, updated };
}

async function main() {
  const items = loadCatalog();
  const stores = await prisma.store.findMany({ select: { id: true, name: true } });

  if (stores.length === 0) {
    throw new Error('No hay tiendas en la base de datos.');
  }

  const replace = process.env.REPLACE_CATALOG === '1';

  for (const store of stores) {
    if (replace) {
      await replaceStoreCatalog(store.id, items);
      console.log(`Tienda "${store.name}": catálogo reemplazado (${items.length} productos)`);
    } else {
      const { created, updated } = await upsertStoreCatalog(store.id, items);
      console.log(
        `Tienda "${store.name}": ${items.length} ítems — ${created} creados, ${updated} actualizados`,
      );
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
