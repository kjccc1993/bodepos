# Módulo: Clientes, fiado y CxC

## Objetivo

Personas que compran a crédito en la bodega: saldo, historial, abonos.

## Pantallas

### Listado clientes (referencia: `/customersPage`)

| Elemento | Comportamiento |
|----------|----------------|
| Tarjetas | Nombre (badge color), Deuda USD, Deuda Bs |
| Deuda total | Suma en header (opcional) |
| Nuevo cliente | Formulario mínimo |

### Alta / edición cliente

| Campo | Obligatorio |
|-------|-------------|
| Nombre | Sí |
| Teléfono | No |
| Deuda inicial USD | No (solo alta migración) |
| Ubicación / zona | Fase 2 (`locationsAreasPage`) |
| Notas | No |

### Detalle cliente (MVP+)

- Lista facturas pendientes.
- Botón **Registrar abono**.

### Abono de deuda

| Campo | Reglas |
|-------|--------|
| Monto | USD o Bs |
| Método | Efectivo, pago móvil, etc. |
| Nota | Opcional |

Reduce saldo; puede ligarse a movimiento en cuenta interna (fase 2).

## Integración con ventas

- En **Pagar**, checkbox **Venta a crédito** habilita selector cliente.
- Saldo pendiente de factura → incrementa `customer.debt_usd` (y equivalente Bs display).

## Reglas

- Cliente requerido si `is_credit` y monto fiado &gt; 0.
- Saldo negativo en referencia (ej. crédito a favor) → permitir como “saldo a favor” con indicador visual.
- No eliminar cliente con deuda ≠ 0 (solo inactivar).

## Offline

- Alta cliente y abono en cola.
- Venta fiada offline incrementa deuda local; sync merge por cliente_id.

## Reportes

- Listado deudores ordenado por monto.
- Export CSV fase 2.
