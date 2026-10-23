# Módulo: Contabilidad y cierre diario

## Objetivo

Saber **qué se vendió hoy**, conciliar caja y registrar el cierre por medios de pago.

## Pantallas

### Menú contabilidad (referencia: `/accountabilityPage`)

Hub hacia ingresos, facturas, gastos, CxP, transacciones, cuentas, catálogos auxiliares.

**MVP**: Ingresos diarios + Facturas de ventas + Clientes.  
**Fase 2**: resto del menú.

### Facturas de ventas (`/invoicesListPage`)

| Filtro | Función |
|--------|---------|
| Fecha | Default hoy |
| Producto | Filtra facturas que contienen SKU |

**Resumen del día** (referencia observada):

- USD, Bs efectivo, Biopago, POS, Pago móvil, Total Bs, **Total facturado** ($ + Bs).

**Lista**:

- Nro factura, estado **Pagada**, fecha/hora.
- Monto total USD, Monto total Bs, cantidad productos, cliente (N/A si no aplica).
- Eliminar factura (admin, confirmación).

### Ingresos diarios (`/dailyIncomesPage`)

Registro manual del **cierre de caja** (puede diferir de facturado por redondeos o ingresos no registrados en POS).

| Campo entrada | Descripción |
|---------------|-------------|
| Divisas | USD en caja |
| Efectivo Bs | |
| Punto de venta | Terminal 1 |
| Punto de venta 2 | Terminal 2 |
| Pago móvil | |
| Biopago | |
| Fecha | Default hoy |

| Acción | Comportamiento |
|--------|----------------|
| **Montos facturados** | Precarga campos desde sumatoria de facturas del día |
| **Registrar ingresos** | Guarda registro en histórico |

**Histórico “Últimos 30”**:

- Por día: total general USD, divisas, total Bs, desglose por medio.
- Eliminar registro (corrección).

### Gastos (fase 2 — referencia `/registerExpensesPage`)

- Tipo de gasto, fecha, monto (Bs/USD), nota.
- Checkbox **¿De lo facturado hoy?** → afecta utilidad del día.

## Conciliación funcional

| Concepto | Fuente |
|----------|--------|
| Total facturado | Suma invoices del día |
| Ingresos registrados | daily_income manual |
| Diferencia | Mostrar alerta si \|delta\| &gt; umbral (configurable) |

## Reglas

- Un registro de ingresos por fecha y bodega (editar vs duplicar — preferir editar).
- Facturas no editables post-cierre (solo anular con movimiento inverso fase 2).

## Offline

- Facturas generadas offline aparecen en listado del día local.
- Ingresos diarios: permitir registro offline; marcar “pendiente conciliación” hasta sync.
