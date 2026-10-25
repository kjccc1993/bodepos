-- Productos en kg pasan a gramos (precio sigue siendo por kg en catálogo).
UPDATE "bodepos"."products"
SET "unit" = 'GRAM', "stock" = "stock" * 1000
WHERE "unit" = 'KG';

UPDATE "bodepos"."invoice_lines"
SET "unit" = 'GRAM', "quantity" = "quantity" * 1000
WHERE "unit" = 'KG';

CREATE TYPE "bodepos"."ProductUnit_new" AS ENUM ('UNIT', 'GRAM');

ALTER TABLE "bodepos"."products"
  ALTER COLUMN "unit" DROP DEFAULT;

ALTER TABLE "bodepos"."products"
  ALTER COLUMN "unit" TYPE "bodepos"."ProductUnit_new"
  USING ("unit"::text::"bodepos"."ProductUnit_new");

ALTER TABLE "bodepos"."invoice_lines"
  ALTER COLUMN "unit" TYPE "bodepos"."ProductUnit_new"
  USING ("unit"::text::"bodepos"."ProductUnit_new");

DROP TYPE "bodepos"."ProductUnit";

ALTER TYPE "bodepos"."ProductUnit_new" RENAME TO "ProductUnit";

ALTER TABLE "bodepos"."products"
  ALTER COLUMN "unit" SET DEFAULT 'UNIT'::"bodepos"."ProductUnit";
