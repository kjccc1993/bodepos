#!/bin/sh
set -e

FAILED_KG_MIGRATION="20261024130000_remove_kg_product_unit"
MIGRATE_LOG="/tmp/prisma-migrate.log"

run_migrate_deploy() {
  npx prisma migrate deploy 2>"$MIGRATE_LOG"
}

echo "[entrypoint] Aplicando migraciones Prisma..."
if ! run_migrate_deploy; then
  cat "$MIGRATE_LOG"

  if grep -q "$FAILED_KG_MIGRATION" "$MIGRATE_LOG" || grep -q 'P3009' "$MIGRATE_LOG"; then
    echo "[entrypoint] Recuperando migración remove_kg en producción..."
    npx prisma db execute --file prisma/migrations/recover-remove-kg.sql --schema prisma/schema.prisma
    npx prisma migrate resolve --rolled-back "$FAILED_KG_MIGRATION" 2>/dev/null || true

    if ! run_migrate_deploy; then
      cat "$MIGRATE_LOG"
      echo "[entrypoint] Marcando migración remove_kg como aplicada (esquema ya alineado)..."
      npx prisma migrate resolve --applied "$FAILED_KG_MIGRATION"
      run_migrate_deploy
    fi
  else
    echo "[entrypoint] migrate deploy falló; intentando baseline init..."
    npx prisma migrate resolve --applied 20261023050000_init 2>/dev/null || true
    run_migrate_deploy
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
