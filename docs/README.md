# BodePOS — Documentación funcional

Sistema de punto de venta para **bodegas / abastos** en Venezuela. Referencia analizada: [Camargo's Market (FlutterFlow)](https://camargos-market-5wafkn.flutterflow.app/).

## Objetivo del producto

Web **PWA** con operación **online/offline**, lectura por **pistola de códigos de barras** (venta e inventario) y contabilidad diaria al estilo bodega venezolana (USD + Bs, pago móvil, POS, biopago, fiado).

## Índice

| Documento | Contenido |
|-----------|-----------|
| [00-vision-y-alcance.md](./00-vision-y-alcance.md) | Visión, usuarios, MVP vs fases |
| [01-referencia-camargos-market.md](./01-referencia-camargos-market.md) | Mapa de pantallas y decisiones heredadas |
| [02-requisitos-no-funcionales.md](./02-requisitos-no-funcionales.md) | PWA, offline, pistola, multi-dispositivo |
| [03-glosario-y-reglas-negocio.md](./03-glosario-y-reglas-negocio.md) | Términos, monedas, validaciones globales |
| [04-plan-tecnico-monorepo.md](./04-plan-tecnico-monorepo.md) | Stack, scaffold Aurigo, offline, API, Prisma |
| [05-plan-de-accion-tecnico.md](./05-plan-de-accion-tecnico.md) | Fases de ejecución (implementado MVP) |

### Módulos

| Módulo | Archivo |
|--------|---------|
| Autenticación y configuración | [modulos/01-autenticacion-configuracion.md](./modulos/01-autenticacion-configuracion.md) |
| Productos e inventario | [modulos/02-productos-inventario.md](./modulos/02-productos-inventario.md) |
| Ventas (POS) | [modulos/03-ventas-pos.md](./modulos/03-ventas-pos.md) |
| Clientes y fiado | [modulos/04-clientes-fiado.md](./modulos/04-clientes-fiado.md) |
| Contabilidad y cierre diario | [modulos/05-contabilidad-cierre-diario.md](./modulos/05-contabilidad-cierre-diario.md) |
| Proveedores y cuentas por pagar | [modulos/06-proveedores-cxp.md](./modulos/06-proveedores-cxp.md) |
| Transacciones y cuentas internas | [modulos/07-transacciones-cuentas.md](./modulos/07-transacciones-cuentas.md) |

### Flujos end-to-end

| Flujo | Archivo |
|-------|---------|
| Venta contado (multi-método + vuelto) | [flujos/F01-venta-contado.md](./flujos/F01-venta-contado.md) |
| Venta a crédito (fiado) | [flujos/F02-venta-credito-fiado.md](./flujos/F02-venta-credito-fiado.md) |
| Compra / entrada de inventario | [flujos/F03-compra-inventario.md](./flujos/F03-compra-inventario.md) |
| Cierre del día (ingresos + facturas) | [flujos/F04-cierre-dia.md](./flujos/F04-cierre-dia.md) |
| Abono de deuda (cliente o proveedor) | [flujos/F05-abono-deuda.md](./flujos/F05-abono-deuda.md) |
| Inventario con pistola | [flujos/F06-inventario-pistola.md](./flujos/F06-inventario-pistola.md) |

## Orden sugerido para planificación técnica

1. MVP: autenticación, tasa, productos, venta, facturas del día, clientes/fiado básico.
2. Offline + cola de sincronización sobre el mismo modelo.
3. Pistola HID en venta e inventario.
4. Contabilidad extendida (gastos, CxP, transacciones entre cuentas).
