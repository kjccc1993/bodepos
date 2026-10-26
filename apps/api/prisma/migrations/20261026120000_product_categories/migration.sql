CREATE TABLE IF NOT EXISTS "bodepos"."product_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_store_id_name_key"
ON "bodepos"."product_categories"("store_id", "name");

CREATE INDEX IF NOT EXISTS "product_categories_store_id_sort_order_idx"
ON "bodepos"."product_categories"("store_id", "sort_order");

ALTER TABLE "bodepos"."product_categories"
ADD CONSTRAINT "product_categories_store_id_fkey"
FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bodepos"."products"
ADD COLUMN IF NOT EXISTS "category_id" UUID;

CREATE INDEX IF NOT EXISTS "products_store_id_category_id_idx"
ON "bodepos"."products"("store_id", "category_id");

ALTER TABLE "bodepos"."products"
ADD CONSTRAINT "products_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "bodepos"."product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
