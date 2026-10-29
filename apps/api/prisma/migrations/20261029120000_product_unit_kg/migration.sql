-- Productos por peso: gramos → kilogramos.
-- El precio de catálogo ya era por kg; se convierten stock, umbral, movimientos y líneas de factura.

UPDATE "bodepos"."inventory_movements" AS m
SET "qty_delta" = m."qty_delta" / 1000
FROM "bodepos"."products" AS p
WHERE m."product_id" = p."id"
  AND p."unit" = 'GRAM';

UPDATE "bodepos"."products"
SET
  "stock" = "stock" / 1000,
  "low_stock_threshold" = CASE
    WHEN "low_stock_threshold" IS NULL THEN NULL
    ELSE "low_stock_threshold" / 1000
  END
WHERE "unit" = 'GRAM';

UPDATE "bodepos"."invoice_lines"
SET "quantity" = "quantity" / 1000
WHERE "unit" = 'GRAM';

CREATE TYPE "bodepos"."ProductUnit_new" AS ENUM ('UNIT', 'KG');

ALTER TABLE "bodepos"."products"
  ALTER COLUMN "unit" DROP DEFAULT;

ALTER TABLE "bodepos"."products"
  ALTER COLUMN "unit" TYPE "bodepos"."ProductUnit_new"
  USING (
    CASE "unit"::text
      WHEN 'GRAM' THEN 'KG'
      ELSE "unit"::text
    END::"bodepos"."ProductUnit_new"
  );

ALTER TABLE "bodepos"."invoice_lines"
  ALTER COLUMN "unit" TYPE "bodepos"."ProductUnit_new"
  USING (
    CASE "unit"::text
      WHEN 'GRAM' THEN 'KG'
      ELSE "unit"::text
    END::"bodepos"."ProductUnit_new"
  );

DROP TYPE "bodepos"."ProductUnit";

ALTER TYPE "bodepos"."ProductUnit_new" RENAME TO "ProductUnit";

ALTER TABLE "bodepos"."products"
  ALTER COLUMN "unit" SET DEFAULT 'UNIT'::"bodepos"."ProductUnit";
