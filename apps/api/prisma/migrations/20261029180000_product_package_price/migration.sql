-- Captura de precio por paquete para productos vendidos por unidad.
-- Los productos existentes quedan en modo UNIT, sin datos de paquete.

CREATE TYPE "bodepos"."PriceInputMode" AS ENUM ('UNIT', 'PACKAGE');

ALTER TABLE "bodepos"."products"
  ADD COLUMN "price_input_mode" "bodepos"."PriceInputMode" NOT NULL DEFAULT 'UNIT',
  ADD COLUMN "units_per_package" INTEGER,
  ADD COLUMN "package_price_usd" DECIMAL(18, 4),
  ADD COLUMN "package_cost_usd" DECIMAL(18, 4);

ALTER TABLE "bodepos"."products"
  ADD CONSTRAINT "products_price_input_mode_check" CHECK (
    (
      "price_input_mode" = 'UNIT'
      AND "units_per_package" IS NULL
      AND "package_price_usd" IS NULL
      AND "package_cost_usd" IS NULL
    )
    OR (
      "price_input_mode" = 'PACKAGE'
      AND "unit" = 'UNIT'
      AND "units_per_package" >= 1
      AND "package_price_usd" > 0
      AND "package_cost_usd" >= 0
    )
  );
