# Módulo: Proveedores y cuentas por pagar

> **Excluido del MVP** (decisión producto: solo clientes/CxC). Ya operativo en [Camargo's Market](https://camargos-market-5wafkn.flutterflow.app/) — documentado para fase 2.

## Objetivo

Deudas con proveedores y acreedores (alquiler, distribuidores), compras a crédito y abonos.

## Pantallas

### Proveedores (`/suppliersPage`)

- Búsqueda, listado nombre + deuda USD/Bs.
- **Nuevo proveedor**.

### Cuentas por pagar (`/creditorsListPage`)

- Similar a proveedores; **Deuda total** en header.
- **Nueva cuenta por pagar** (acreedor genérico: alquiler, servicios).

### Detalle / transacciones (`/creditorTransactionPage`)

- Historial movimientos por acreedor.
- Tipos referencia: `Compra_Inventario`, `Abono_Deuda`, `Abono_Prestamo_Externo`.

## Flujos

| Evento | Efecto en deuda |
|--------|-----------------|
| Compra inventario a crédito | +deuda proveedor |
| Abono | -deuda |
| Compra contado vía transacción | no afecta CxP |

## Integración inventario

- Entrada de stock puede ligarse a proveedor y monto → incrementa CxP.

## Reglas

- Deuda maestro en USD; Bs display con tasa actual.
- Proveedor con deuda 0 puede archivarse.

## MVP alternativo

Si se pospone UI completa: registrar solo **Compra_Inventario** con nota y monto en transacciones simples.
