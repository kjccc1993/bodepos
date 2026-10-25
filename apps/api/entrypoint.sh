#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones Prisma..."
if ! npx prisma migrate deploy; then
  echo "[entrypoint] migrate deploy falló; baseline init si la BD ya existía (db push)..."
  npx prisma migrate resolve --applied 20261023050000_init
  npx prisma migrate deploy
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
