#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones Prisma..."
npx prisma migrate deploy

if [ "${RUN_SEED:-}" = "true" ]; then
  echo "[entrypoint] Ejecutando seed..."
  npx tsx prisma/seed.ts
fi

echo "[entrypoint] Iniciando BodePOS API..."
exec node dist/index.js
