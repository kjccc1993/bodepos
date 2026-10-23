# Arquitectura BodePOS

## Repositorio

| Carpeta | Rol |
|---------|-----|
| `apps/api` | Express + Prisma + PostgreSQL (`schema=bodepos`) |
| `apps/web` | React 19 + Vite PWA + Dexie offline |
| `docs/` | Funcional y arquitectura |

## API

Monolito modular ligero: `auth`, `pos.routes` (productos, clientes, ventas, facturas, ingresos, sync).

Puerto dev: **3610**.

## Web

Puerto dev: **5350**. Token JWT en `localStorage`. Tres carritos en `localStorage`. Catálogo en Dexie.

## Base de datos

`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=bodepos"`

Seed: `admin@bode.local` / `admin123`.
