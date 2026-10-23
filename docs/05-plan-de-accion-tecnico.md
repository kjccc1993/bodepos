# Plan de acción técnico — BodePOS (ejecución)

## Fase 0 — Scaffold monorepo ✅

- Raíz Yarn 4 + `concurrently`, scripts `dev`, `dev:api`, `dev:web`
- `apps/api`: Express, Prisma, JWT auth, health
- `apps/web`: Vite 8, React 19, Chakra 3, PWA, React Query, Router
- `.env` con `DATABASE_URL` schema `bodepos`, puertos 3610 / 5350

## Fase 1 — Datos y auth ✅

- Prisma: `Store`, `User`, `Product`, `Customer`, `Invoice`, `InvoiceLine`, `CustomerPayment`, `DailyIncome`, `InventoryMovement`, `SyncOperation`
- Seed: tienda demo + `admin@bode.local` / `admin123`
- Login + validate-token + middleware Bearer

## Fase 2 — API dominio POS ✅

- `GET/PATCH /store-settings` — tasa
- CRUD `/products` + `GET /products/by-barcode/:code`
- CRUD `/customers` + `POST /customers/:id/payments` (abono CxC)
- `POST /sales/checkout` — factura, stock, deuda
- `GET /invoices`, `/invoices/summary`, `DELETE /invoices/:id`
- `GET/POST /daily-incomes`, `GET /daily-incomes/prefill`
- `POST /inventory/adjust` — entrada/salida
- `POST /sync/push`, `GET /sync/pull`

## Fase 3 — Frontend caja ✅

- Login, `PosShell` (bottom nav)
- Vender: 3 carritos, búsqueda, pistola HID
- Productos CRUD modal
- Carrito + Pago multi-método + crédito
- Contabilidad: facturas, ingresos diarios, clientes
- Configuración: tasa, logout

## Fase 4 — Offline ✅ (MVP)

- Dexie: catálogo, clientes, outbox
- Cola checkout/abonos; sync al reconectar
- Badge “Sin conexión” + pendientes

## Fase 5 — Pulido (iteración contigo)

- Tests API smoke + vitest login
- Iconos PWA dedicados
- Impresión ticket
- Roles cajero/admin
- BCV automático

## Decisiones creativas tomadas

- **Un store por seed**; multi-tenant listo vía `store_id` en JWT
- **Precio maestro USD**; Bs calculado con tasa de tienda
- **Carritos solo en cliente** (no persistidos en API)
- **Idempotencia** checkout vía header `X-Client-Op-Id`
- **Tema verde** POS (Camargo), tipografía DM Sans
- **Sin CxP** en código MVP
