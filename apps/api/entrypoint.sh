#!/bin/sh
set -e

echo "[entrypoint] Sincronizando schema Prisma (db push)..."
npx prisma db push

if [ "${RUN_SEED:-}" = "true" ]; then
  echo "[entrypoint] Ejecutando seed..."
  npx tsx prisma/seed.ts
fi

echo "[entrypoint] Iniciando BodePOS API..."
exec node dist/index.js
