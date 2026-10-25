-- Recuperación idempotente si 20261024130000_remove_kg_product_unit quedó a medias.
DROP TYPE IF EXISTS "bodepos"."ProductUnit_new";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'bodepos'
      AND t.typname = 'ProductUnit'
      AND e.enumlabel = 'KG'
  ) THEN
    UPDATE "bodepos"."products"
    SET "unit" = 'GRAM', "stock" = "stock" * 1000
    WHERE "unit"::text = 'KG';

    UPDATE "bodepos"."invoice_lines"
    SET "unit" = 'GRAM', "quantity" = "quantity" * 1000
    WHERE "unit"::text = 'KG';

    CREATE TYPE "bodepos"."ProductUnit_new" AS ENUM ('UNIT', 'GRAM');

    ALTER TABLE "bodepos"."products"
      ALTER COLUMN "unit" TYPE "bodepos"."ProductUnit_new"
      USING ("unit"::text::"bodepos"."ProductUnit_new");

    ALTER TABLE "bodepos"."invoice_lines"
      ALTER COLUMN "unit" TYPE "bodepos"."ProductUnit_new"
      USING ("unit"::text::"bodepos"."ProductUnit_new");

    DROP TYPE "bodepos"."ProductUnit";
    ALTER TYPE "bodepos"."ProductUnit_new" RENAME TO "ProductUnit";
  END IF;
END $$;

-- Desbloquear P3009: migración fallida registrada pero esquema ya corregido arriba.
UPDATE "bodepos"."_prisma_migrations"
SET
  "finished_at" = COALESCE("finished_at", NOW()),
  "logs" = COALESCE("logs", ''),
  "rolled_back_at" = NULL
WHERE "migration_name" = '20261024130000_remove_kg_product_unit'
  AND "finished_at" IS NULL;
