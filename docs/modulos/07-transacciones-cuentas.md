# Módulo: Transacciones y cuentas internas

> **Fase 2** — copiado de referencia para contabilidad avanzada.

## Objetivo

Ledger interno: cajas lógicas (Bs, USD, ahorro, deudas), movimientos categorizados, transferencias.

## Pantallas

### Mis cuentas (`/accountsPage`)

Cuentas observadas en referencia:

| Cuenta | Ejemplo balance |
|--------|-----------------|
| Ahorro Bs | Bs 0 |
| Ahorro USD | $ 150 |
| Bolívares | Bs grande |
| Deudas | $ 2.606 |
| Dólares | $ 15.947 |

- **Nueva cuenta** (custom).

Flags inferidos: `is_main_account_bs`, `is_main_account_usd`, `is_main_account_debt`.

### Transacciones (`/transactionsPage`)

- Registrar transacciones
- Historial de transacciones
- Transferir entre cuentas

### Registrar transacción (`/registerTransactionsPage`)

| Campo | Notas |
|-------|-------|
| Categoría | transaction_categories |
| Cuenta | accounts |
| Proveedor | opcional |
| Fecha | |
| Monto + moneda | USD / Bs |
| Nota | |

Lista **Últimos 30** con montos +/- en verde/rojo.

### Catálogos

- **Categorías de transacciones** (`/transactionCategoriesPage`)
- **Tipos de gasto** (`/expenseTypesPage`) — ligado a gastos diarios
- **Empleados** (`/employeesPage`) — asignación opcional en movimientos

## Reglas

- Todo movimiento afecta balance de cuenta asociada.
- Transferencia = -origen +destino mismo monto (convertido si cruce moneda con tasa explícita).

## Relación con cierre diario

- Ingresos diarios = vista simplificada para cajero.
- Transacciones = vista contable completa.
