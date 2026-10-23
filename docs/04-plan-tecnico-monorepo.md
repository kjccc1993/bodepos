# Plan técnico — Monorepo BodePOS

Referencia de implementación: [`aurigo-talleres`](file:///C:/Users/kjcam/Repositorios/Kesil%20Digital/Aurigo%20Talleres/aurigo-talleres) (misma forma de repo, no fork del dominio taller).

## Decisiones de producto (cerradas)

| Tema | Decisión |
|------|----------|
| Stock negativo | **Permitir** venta aunque quede stock &lt; 0, **sin confirmación** |
| Carritos simultáneos | **Hasta 3** (Cliente 1, 2, 3) |
| Crédito MVP | Solo **clientes / CxC** (fiado + abonos). **Sin** proveedores ni CxP |

## Forma del repositorio (igual que Aurigo)

```
bodepos/
├── apps/
│   ├── api/          # Express + Prisma + PostgreSQL
│   └── web/          # React 19 + Vite + PWA
├── packages/         # contracts, domain-types, test-kit (cuando haga falta)
├── docs/             # Funcional + arquitectura (este árbol)
├── docker/           # Compose monorepo (opcional)
├── scripts/          # free-port.mjs, etc.
├── tests/            # e2e monorepo (fase 2)
├── package.json      # yarn 4 + concurrently dev:api + dev:web
└── README.md
```

No hay `packages/` obligatorio al día 1: los contratos pueden vivir primero en `apps/api/src/modules/shared/contracts` y `apps/web/src/lib/contracts` como en Aurigo; extraer a `packages/contracts` cuando el FE y BE compartan muchos schemas.

## Stack (copiar de Aurigo)

| Capa | Tecnología |
|------|------------|
| API | Node ≥ 20, TypeScript, Express, Zod, Prisma 6, PostgreSQL, JWT + bcrypt, Yarn 4 |
| Web | React 19, Vite 8, Chakra UI 3, TanStack Query, React Router 7, react-hook-form, Zod, **vite-plugin-pwa** |
| Patrón API | `modules/<dominio>/{api,core,data}` + `shared/` transversal |

## Puertos locales propuestos (no chocar con Aurigo)

| Servicio | Aurigo | BodePOS |
|----------|--------|---------|
| API | 3605 | **3610** |
| Web | 5345 | **5350** |
| Postgres | 5436 | **5437** |

Schema PostgreSQL sugerido: `bodepos`.

## Qué clonar / adaptar desde Aurigo

### Raíz

- [`package.json`](file:///C:/Users/kjcam/Repositorios/Kesil%20Digital/Aurigo%20Talleres/aurigo-talleres/package.json): scripts `dev`, `dev:api`, `dev:web`, `install:all`, `db:up`, `prisma:*`, `free-port`.
- [`scripts/free-port.mjs`](file:///C:/Users/kjcam/Repositorios/Kesil%20Digital/Aurigo%20Talleres/aurigo-talleres/scripts) si existe.

### `apps/api`

| Origen Aurigo | Uso en BodePOS |
|---------------|----------------|
| `src/index.ts`, `shared/router.ts` | Montaje Express + CORS |
| `modules/shared/auth/**` | Login, JWT, validate-token, set-password (simplificado: sin multi-workshop al inicio) |
| `shared/middlewares/authorize.middleware.ts` | Roles (MVP: un rol) |
| `shared/http/async-handler.ts` | Handlers |
| `shared/errors/error-rules.ts` | `{ error: { code, message } }` |
| `prisma/schema.prisma` + seed idempotente | Modelo `User`, `Store` (tenant), migraciones |

**No clonar** módulos de dominio taller (work-orders, diagnosis, vision, voice, plans-billing, whatsapp, etc.).

### `apps/web`

| Origen Aurigo | Uso en BodePOS |
|---------------|----------------|
| `lib/auth/*` + `components/auth/*` | Sesión, RequireAuth, GuestRoute |
| `lib/http/client.ts` | `apiFetch`, Bearer, ApiError |
| `components/ui/provider`, `theme.ts` | Tema (rebrand verde bodega) |
| `vite.config.ts` | PWA manifest **BodePOS**, `workbox` |
| `router/index.tsx` | Patrón rutas protegidas |

**Componentes UI genéricos** (copiar casi tal cual):

- `GenericInput`, `GenericSelect`, `GenericDialog`
- `EmptyState`, `RecordCard`, `PageHeader`
- `GenericTabs` / `TabsListWithSlidingPill` → **3 carritos**
- `MoneyText` → precios USD/Bs
- `StatusBadge` → Pagada / Pendiente
- `FloatingActionButton` → “Nuevo producto” / “Nuevo cliente”
- `AppButton`, toaster

**Shell**: Aurigo usa sidenav lateral; BodePOS MVP usa **bottom nav** (Vender, Productos, Carrito, Contabilidad, Más) — nuevo layout `PosShell`, reutilizando header/toast/provider.

### PWA (Aurigo ya tiene base)

Archivo referencia: [`apps/web/vite.config.ts`](file:///C:/Users/kjcam/Repositorios/Kesil%20Digital/Aurigo%20Talleres/aurigo-talleres/apps/web/vite.config.ts).

Extensiones BodePOS:

- `display: standalone`, iconos propios.
- Workbox: cache estáticos (como Aurigo).
- **No** cachear respuestas mutables de API como fuente de verdad.
- Capa offline propia (abajo), no solo service worker.

## Capa offline (nuevo vs Aurigo)

Aurigo es online-first. BodePOS añade en `apps/web`:

```
src/lib/offline/
├── db.ts              # Dexie o idb: products, customers, carts, outbox, meta
├── outbox.ts          # cola de mutaciones
├── sync-engine.ts     # flush al reconectar + backoff
├── connectivity.ts    # navigator.onLine + ping /health
└── barcode-scanner.ts # buffer HID + Enter
```

API complementaria:

```
POST /sync/push     # lote outbox (idempotency-key por operación)
GET  /sync/pull     # delta desde cursor (products, customers, settings)
```

Reglas alineadas a funcional:

- Stock puede quedar negativo local y en servidor.
- 3 carritos en `localStorage` o IndexedDB (`cart_slot` 1..3).
- Factura offline: `client_number` temporal hasta ack del servidor.

## Módulos backend MVP

| Módulo | Rutas (prefijo) | Responsabilidad |
|--------|-----------------|-----------------|
| `shared/auth` | `/auth` | Login, token |
| `store-settings` | `/store-settings` | Tasa, use_fixed_rate |
| `products` | `/products` | CRUD, barcode lookup, stock adjust |
| `customers` | `/customers` | CRUD, deuda, abonos (**CxC**) |
| `sales` | `/sales` | Carritos no persistidos en server; checkout → invoice |
| `invoices` | `/invoices` | Listado por fecha, totales, anular (fase 2) |
| `daily-incomes` | `/daily-incomes` | Cierre diario + preload desde facturas |
| `sync` | `/sync` | Push/pull offline |

## Modelo de datos (Prisma — borrador)

```
Store          id, name, custom_rate, use_fixed_rate, invoice_seq
User           id, store_id, email, password_hash, role
Product        id, store_id, name, price_usd, unit, stock, barcode?, low_stock_threshold?
Customer       id, store_id, name, phone?, debt_usd, color_tag?
Invoice        id, store_id, number, status, customer_id?, rate_applied, totals..., payments..., created_at
InvoiceLine    invoice_id, product_id, qty, unit_price_usd, ...
CustomerPayment id, customer_id, amount_usd, method, note, created_at  // abono CxC
InventoryMove  product_id, type, qty_delta, note, created_at
DailyIncome    store_id, date, breakdown fields..., created_at
SyncCursor     store_id, device_id, last_pull_at
OutboxAck      client_op_id, server_entity_id   // idempotencia
```

Índices: `(store_id, barcode)` unique, `(store_id, invoice.number)` unique.

## Modelo frontend (rutas MVP)

| Ruta | Pantalla |
|------|----------|
| `/login` | Login |
| `/sell` | Vender (3 tabs carrito) |
| `/products` | Mis productos |
| `/cart` | Carrito (tab activa) |
| `/pay` | Pago |
| `/accounting` | Menú contabilidad |
| `/accounting/invoices` | Facturas |
| `/accounting/daily-incomes` | Ingresos diarios |
| `/accounting/customers` | Clientes CxC |
| `/settings` | Tasa, logout, versión |

## Contratos FE ↔ BE

Seguir convención Aurigo:

- Zod en API (`schemas/*.ts`).
- Tipos espejo en web (`lib/contracts/*.ts`) o `packages/contracts` exportado.
- Errores: códigos estables (`PRODUCT_NOT_FOUND`, `CUSTOMER_REQUIRED`, …).

## Orden de implementación (sprints)

1. **Scaffold monorepo** — copiar esqueleto Aurigo (auth, http, shell mínimo, prisma user+store).
2. **Productos + tasa** — API + pantalla + cache offline catálogo.
3. **Venta + 3 carritos + pistola** — local checkout, factura API.
4. **Clientes CxC + crédito** — deuda + abono.
5. **Facturas + ingresos diarios** — reportes del día.
6. **Sync outbox** — push/pull, números de factura definitivos.
7. **Pulido PWA** — instalación, badge offline, pending sync.

## Fuera de alcance técnico MVP

- Módulos Aurigo: `collections`, `inventory` taller, CRM Kesil, billing platform.
- CxP / proveedores (documentado en fase 2 funcional).
- Impresión fiscal SENIAT.

## Próximo paso inmediato

Ejecutar **scaffold** en `bodepos/`: copiar desde Aurigo solo archivos base listados arriba, renombrar paquetes, ajustar puertos y crear `docs/architecture/overview.md` espejo del de Aurigo con dominio bodega.
