/** Precios de catálogo: 2 decimales, igual que `roundUsd` del formulario.
 *  No usar el redondeo de 4 decimales de las facturas.
 *  Mantener este archivo igual que `apps/api/src/modules/product-pricing.ts`.
 */
export function roundProductMoney(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Unitario = paquete / unidades, redondeado a 2 decimales. */
export function unitAmountFromPackage(packageAmount: number, unitsPerPackage: number): number {
  return roundProductMoney(roundProductMoney(packageAmount) / unitsPerPackage);
}

export type PriceInputMode = 'UNIT' | 'PACKAGE';

export type ProductPricingInput = {
  unit: string;
  priceInputMode?: PriceInputMode | null;
  unitsPerPackage?: number | null;
  packagePriceUsd?: number | null;
  packageCostUsd?: number | null;
  priceUsd?: number | null;
  costUsd?: number | null;
};

export type ResolvedProductPricing = {
  priceInputMode: PriceInputMode;
  unitsPerPackage: number | null;
  packagePriceUsd: number | null;
  packageCostUsd: number | null;
  priceUsd: number;
  costUsd: number;
};

export type ProductPricingResult =
  | { ok: true; value: ResolvedProductPricing }
  | { ok: false; message: string };

export function resolveProductPricing(input: ProductPricingInput): ProductPricingResult {
  const mode: PriceInputMode = input.priceInputMode === 'PACKAGE' ? 'PACKAGE' : 'UNIT';
  const sellsByUnit = input.unit === 'UNIT';

  if (mode === 'PACKAGE' && !sellsByUnit) {
    return {
      ok: false,
      message: 'El precio por paquete solo aplica a productos que se venden por unidad.',
    };
  }

  if (mode !== 'PACKAGE') {
    const priceUsd = input.priceUsd;
    const costUsd = input.costUsd ?? 0;
    if (priceUsd == null || !Number.isFinite(priceUsd) || priceUsd <= 0) {
      return { ok: false, message: 'Indica un precio de venta mayor a 0.' };
    }
    if (!Number.isFinite(costUsd) || costUsd < 0) {
      return { ok: false, message: 'El costo no puede ser negativo.' };
    }
    return {
      ok: true,
      value: {
        priceInputMode: 'UNIT',
        unitsPerPackage: null,
        packagePriceUsd: null,
        packageCostUsd: null,
        priceUsd,
        costUsd,
      },
    };
  }

  const units = input.unitsPerPackage;
  if (units == null || !Number.isInteger(units) || units < 1) {
    return {
      ok: false,
      message: 'Indica cuántas unidades trae el paquete (entero mayor o igual a 1).',
    };
  }

  const packageCostUsd = roundProductMoney(input.packageCostUsd ?? 0);
  const packagePriceUsd = roundProductMoney(input.packagePriceUsd ?? 0);
  if (packageCostUsd < 0) {
    return { ok: false, message: 'El costo del paquete no puede ser negativo.' };
  }
  if (packagePriceUsd <= 0) {
    return { ok: false, message: 'Indica un precio del paquete mayor a 0.' };
  }

  const costUsd = unitAmountFromPackage(packageCostUsd, units);
  const priceUsd = unitAmountFromPackage(packagePriceUsd, units);
  if (priceUsd <= 0) {
    return {
      ok: false,
      message:
        'El precio unitario calculado debe ser mayor a 0. Sube el precio del paquete o reduce las unidades.',
    };
  }

  return {
    ok: true,
    value: {
      priceInputMode: 'PACKAGE',
      unitsPerPackage: units,
      packagePriceUsd,
      packageCostUsd,
      priceUsd,
      costUsd,
    },
  };
}

export function deriveUnitAmountsFromPackage(
  packageCostUsd: number,
  packagePriceUsd: number,
  unitsPerPackage: number | null,
): { costUsd: number; priceUsd: number } {
  if (unitsPerPackage == null || !Number.isInteger(unitsPerPackage) || unitsPerPackage < 1) {
    return { costUsd: 0, priceUsd: 0 };
  }
  return {
    costUsd: unitAmountFromPackage(packageCostUsd, unitsPerPackage),
    priceUsd: unitAmountFromPackage(packagePriceUsd, unitsPerPackage),
  };
}
