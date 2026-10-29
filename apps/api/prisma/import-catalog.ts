import { ProductUnit, PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();

type LegacyCatalogItem = {
  name: string;
  unit: string;
  inStock: number;
  priceToSellUsd: number;
};

function mapLegacyUnit(unit: string): ProductUnit {
  if (unit === 'Kg') return ProductUnit.KG;
  return ProductUnit.UNIT;
}

/** Stock interno: unidades o kilogramos. El precio USD de Kg es por kg. */
function mapLegacyStock(_unit: string, inStock: number): number {
  return inStock;
}

function loadCatalog(): LegacyCatalogItem[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, 'data', 'legacy-catalog.json'), 'utf8');
  const parsed = JSON.parse(raw) as LegacyCatalogItem[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Catálogo vacío o inválido');
  }
  return parsed;
}

async function replaceStoreCatalog(storeId: string, items: LegacyCatalogItem[]) {
  const rows = items.map(item => ({
    storeId,
    name: item.name.trim(),
    priceUsd: item.priceToSellUsd,
    costUsd: 0,
    unit: mapLegacyUnit(item.unit),
    stock: mapLegacyStock(item.unit, item.inStock ?? 0),
    barcode: null as string | null,
    isActive: true,
  }));

  await prisma.$transaction(async tx => {
    await tx.inventoryMovement.deleteMany({ where: { storeId } });
    await tx.product.deleteMany({ where: { storeId } });
    await tx.product.createMany({ data: rows });
  });
}

async function main() {
  const items = loadCatalog();
  const stores = await prisma.store.findMany({ select: { id: true, name: true } });

  if (stores.length === 0) {
    throw new Error('No hay tiendas en la base de datos. Ejecuta el seed primero.');
  }

  for (const store of stores) {
    await replaceStoreCatalog(store.id, items);
    console.log(`Catálogo (${items.length} productos) cargado en tienda: ${store.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
