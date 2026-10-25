#!/bin/sh
set -e

FAILED_KG_MIGRATION="20261024130000_remove_kg_product_unit"
MIGRATE_LOG="/tmp/prisma-migrate.log"

run_migrate_deploy() {
  npx prisma migrate deploy 2>"$MIGRATE_LOG"
}

recover_remove_kg() {
  echo "[entrypoint] Recuperando migración remove_kg..."
  npx prisma db execute --file prisma/migrations/recover-remove-kg.sql --schema prisma/schema.prisma || true
  npx prisma migrate resolve --applied "$FAILED_KG_MIGRATION" 2>/dev/null || true
}

echo "[entrypoint] Aplicando migraciones Prisma..."
if ! run_migrate_deploy; then
  cat "$MIGRATE_LOG"

  if grep -q 'P3009' "$MIGRATE_LOG" || grep -q "$FAILED_KG_MIGRATION" "$MIGRATE_LOG"; then
    recover_remove_kg
    if ! run_migrate_deploy; then
      cat "$MIGRATE_LOG"
      exit 1
    fi
  else
    echo "[entrypoint] migrate deploy falló (sin recuperación automática)."
    exit 1
  fi
fi

if [ "${RUN_SEED:-}" = "true" ]; then
  echo "[entrypoint] Ejecutando seed..."
  npx tsx prisma/seed.ts
fi

if [ "${RUN_IMPORT_CATALOG:-}" = "true" ]; then
  echo "[entrypoint] Importando catálogo de productos..."
  npx tsx prisma/import-catalog.ts
fi

echo "[entrypoint] Iniciando BodePOS API..."
exec node dist/index.js
