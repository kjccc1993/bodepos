-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "bodepos";

-- CreateEnum
CREATE TYPE "bodepos"."ProductUnit" AS ENUM ('UNIT', 'GRAM', 'KG');

-- CreateEnum
CREATE TYPE "bodepos"."InvoiceStatus" AS ENUM ('PAID', 'PENDING');

-- CreateEnum
CREATE TYPE "bodepos"."InventoryMoveType" AS ENUM ('PURCHASE', 'ADJUSTMENT', 'SALE');

-- CreateTable
CREATE TABLE "bodepos"."stores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "custom_rate" DECIMAL(18,6) NOT NULL DEFAULT 884.75,
    "use_fixed_rate" BOOLEAN NOT NULL DEFAULT false,
    "bcv_rate" DECIMAL(18,6),
    "bcv_rate_fetched_at" TIMESTAMPTZ(6),
    "manual_rate_set_at" TIMESTAMPTZ(6),
    "invoice_seq" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."bcv_rate_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bcv_rate_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price_usd" DECIMAL(18,4) NOT NULL,
    "unit" "bodepos"."ProductUnit" NOT NULL DEFAULT 'UNIT',
    "stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "low_stock_threshold" DECIMAL(18,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "color_tag" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "debt_usd" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "color_tag" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "number" BIGINT NOT NULL,
    "status" "bodepos"."InvoiceStatus" NOT NULL DEFAULT 'PAID',
    "customer_id" UUID,
    "rate_applied" DECIMAL(18,6) NOT NULL,
    "total_usd" DECIMAL(18,4) NOT NULL,
    "total_bs" DECIMAL(18,2) NOT NULL,
    "paid_usd_cash" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "paid_pos_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_pos2_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_mobile_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_cash_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_biopago_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "change_usd" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "change_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "change_mobile_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit_usd" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "client_op_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."invoice_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "product_id" UUID,
    "product_name" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit" "bodepos"."ProductUnit" NOT NULL,
    "unit_price_usd" DECIMAL(18,4) NOT NULL,
    "line_total_usd" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."customer_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "amount_usd" DECIMAL(18,4) NOT NULL,
    "method" TEXT NOT NULL,
    "note" TEXT,
    "client_op_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."daily_incomes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "usd_cash" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "cash_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "pos_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "pos2_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "mobile_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "biopago_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_usd" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_bs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."inventory_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "type" "bodepos"."InventoryMoveType" NOT NULL,
    "qty_delta" DECIMAL(18,4) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodepos"."sync_operations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "client_op_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bcv_rate_snapshots_store_id_fetched_at_idx" ON "bodepos"."bcv_rate_snapshots"("store_id", "fetched_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "users_store_id_email_key" ON "bodepos"."users"("store_id", "email");

-- CreateIndex
CREATE INDEX "products_store_id_name_idx" ON "bodepos"."products"("store_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_store_id_barcode_key" ON "bodepos"."products"("store_id", "barcode");

-- CreateIndex
CREATE INDEX "customers_store_id_name_idx" ON "bodepos"."customers"("store_id", "name");

-- CreateIndex
CREATE INDEX "invoices_store_id_created_at_idx" ON "bodepos"."invoices"("store_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_store_id_number_key" ON "bodepos"."invoices"("store_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_store_id_client_op_id_key" ON "bodepos"."invoices"("store_id", "client_op_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_payments_store_id_client_op_id_key" ON "bodepos"."customer_payments"("store_id", "client_op_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_incomes_store_id_date_key" ON "bodepos"."daily_incomes"("store_id", "date");

-- CreateIndex
CREATE INDEX "inventory_movements_store_id_created_at_idx" ON "bodepos"."inventory_movements"("store_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sync_operations_store_id_client_op_id_key" ON "bodepos"."sync_operations"("store_id", "client_op_id");

-- AddForeignKey
ALTER TABLE "bodepos"."bcv_rate_snapshots" ADD CONSTRAINT "bcv_rate_snapshots_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."users" ADD CONSTRAINT "users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."customers" ADD CONSTRAINT "customers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."invoices" ADD CONSTRAINT "invoices_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "bodepos"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "bodepos"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."invoice_lines" ADD CONSTRAINT "invoice_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "bodepos"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."customer_payments" ADD CONSTRAINT "customer_payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "bodepos"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."daily_incomes" ADD CONSTRAINT "daily_incomes_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."inventory_movements" ADD CONSTRAINT "inventory_movements_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "bodepos"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodepos"."sync_operations" ADD CONSTRAINT "sync_operations_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "bodepos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
