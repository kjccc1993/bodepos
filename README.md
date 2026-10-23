# BodePOS

Punto de venta web (PWA) para bodegas en Venezuela: ventas multi-moneda, fiado (CxC), cierre diario, offline y pistola de códigos de barras.

## Documentación

- Índice funcional: [`docs/README.md`](./docs/README.md)
- Plan técnico (monorepo tipo Aurigo): [`docs/04-plan-tecnico-monorepo.md`](./docs/04-plan-tecnico-monorepo.md)

## Referencia UI/negocio

[Camargo's Market (FlutterFlow)](https://camargos-market-5wafkn.flutterflow.app/)

## Referencia técnica

Monorepo [`aurigo-talleres`](C:\Users\kjcam\Repositorios\Kesil Digital\Aurigo Talleres\aurigo-talleres): `apps/api` + `apps/web`, Yarn 4, Express/Prisma, React/Vite/PWA.

## Arranque local

```bash
# API (PostgreSQL con schema bodepos)
cd apps/api
cp .env.example .env   # o usar el .env ya configurado
yarn install
yarn db:push
yarn prisma:seed
yarn dev               # http://localhost:3610

# Web
cd apps/web
yarn install
yarn dev               # http://localhost:5350
```

Desde la raíz (primero `yarn install` aquí para `concurrently`):

```bash
yarn install
yarn install:all   # apps/api y apps/web
yarn dev
```

**Credenciales seed:** `admin@bode.local` / `admin123`

## Estado

MVP implementado: auth, productos, venta (3 carritos), pago, facturas, clientes CxC, ingresos diarios, PWA + cola offline básica.
