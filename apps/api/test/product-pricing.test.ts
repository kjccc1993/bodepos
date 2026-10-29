import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveProductPricing,
  unitAmountFromPackage,
} from '../src/modules/product-pricing.ts';
import {
  resolveProductPricing as resolveWeb,
  unitAmountFromPackage as unitAmountWeb,
} from '../../web/src/lib/product-pricing.ts';

describe('precio por paquete', () => {
  it('divide el paquete entre las unidades y redondea a 2 decimales', () => {
    assert.equal(unitAmountFromPackage(10, 24), 0.42);
    assert.equal(unitAmountFromPackage(8, 24), 0.33);
    assert.equal(unitAmountFromPackage(12, 24), 0.5);
    assert.equal(unitAmountWeb(10, 24), unitAmountFromPackage(10, 24));
  });

  it('calcula costo y precio unitarios y conserva el paquete', () => {
    const result = resolveProductPricing({
      unit: 'UNIT',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 24,
      packagePriceUsd: 10,
      packageCostUsd: 8,
      priceUsd: 99,
      costUsd: 99,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.value, {
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 24,
      packagePriceUsd: 10,
      packageCostUsd: 8,
      priceUsd: 0.42,
      costUsd: 0.33,
    });
    assert.deepEqual(resolveWeb({
      unit: 'UNIT',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 24,
      packagePriceUsd: 10,
      packageCostUsd: 8,
      priceUsd: 99,
      costUsd: 99,
    }), result);
  });

  it('en modo unidad no guarda datos de paquete', () => {
    const result = resolveProductPricing({
      unit: 'UNIT',
      priceInputMode: 'UNIT',
      priceUsd: 2.5,
      costUsd: 1,
      unitsPerPackage: 24,
      packagePriceUsd: 10,
      packageCostUsd: 8,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.priceUsd, 2.5);
    assert.equal(result.value.costUsd, 1);
    assert.equal(result.value.unitsPerPackage, null);
    assert.equal(result.value.packagePriceUsd, null);
    assert.equal(result.value.packageCostUsd, null);
  });

  it('rechaza paquete si el producto no se vende por unidad', () => {
    const result = resolveProductPricing({
      unit: 'KG',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 24,
      packagePriceUsd: 10,
      packageCostUsd: 8,
      priceUsd: 1,
    });
    assert.equal(result.ok, false);
  });

  it('exige unidades enteras mayores o iguales a 1', () => {
    for (const unitsPerPackage of [null, 0, -1, 1.5]) {
      const result = resolveProductPricing({
        unit: 'UNIT',
        priceInputMode: 'PACKAGE',
        unitsPerPackage,
        packagePriceUsd: 10,
        packageCostUsd: 1,
      });
      assert.equal(result.ok, false);
    }
  });

  it('exige precio de paquete mayor a 0 y costo no negativo', () => {
    const missingPrice = resolveProductPricing({
      unit: 'UNIT',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 24,
      packagePriceUsd: 0,
      packageCostUsd: 1,
    });
    assert.equal(missingPrice.ok, false);

    const negativeCost = resolveProductPricing({
      unit: 'UNIT',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 24,
      packagePriceUsd: 10,
      packageCostUsd: -1,
    });
    assert.equal(negativeCost.ok, false);
  });

  it('rechaza un precio unitario que redondea a 0', () => {
    const result = resolveProductPricing({
      unit: 'UNIT',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 3,
      packagePriceUsd: 0.01,
      packageCostUsd: 0,
    });
    assert.equal(result.ok, false);
    assert.equal(unitAmountFromPackage(0.01, 3), 0);
  });

  it('permite costo de paquete 0', () => {
    const result = resolveProductPricing({
      unit: 'UNIT',
      priceInputMode: 'PACKAGE',
      unitsPerPackage: 10,
      packagePriceUsd: 5,
      packageCostUsd: 0,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.costUsd, 0);
    assert.equal(result.value.priceUsd, 0.5);
  });
});
