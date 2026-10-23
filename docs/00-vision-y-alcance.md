# Visión y alcance

## Problema

Las bodegas en Venezuela operan con **precios en dólares**, cobro en **varios medios en bolívares**, ventas **fiadas** a clientes del barrio (CxC), y necesitan saber **qué se facturó en el día** aunque falle el internet.

## Visión

**BodePOS**: caja rápida en navegador (PWA instalable), usable en celular o PC con teclado/pistola, que funcione **sin conexión** y sincronice cuando vuelva la red.

## Usuarios

| Rol | Necesidad principal |
|-----|---------------------|
| **Cajero / dueño** | Vender rápido, cobrar, fiar, ver total del día |
| **Administrador** | Productos, precios, tasa, reportes, usuarios |
| **Operador inventario** | Entradas/salidas, conteo, pistola |

> En la referencia FlutterFlow existe rol **Administrador**; el MVP puede empezar con un solo rol con permisos completos y separar después.

## Alcance MVP (lo más sencillo que pediste)

Incluye lo esencial para operar la bodega:

1. **Login** (sesión persistente en PWA).
2. **Tasa USD/Bs** (manual + opción “usar siempre esta tasa”; en fase 2 consulta BCV).
3. **Productos**: alta, edición, precio USD, stock, unidad (unidad/kg/gramos), **código de barras**.
4. **Venta**: grilla + búsqueda + **pistola**, **hasta 3 carritos**, pago multi-método, **venta a crédito**.
5. **Facturas del día**: listado, totales por medio, estado Pagada/Pendiente.
6. **Clientes (CxC / deudores)**: alta, saldo USD/Bs, abonos. Sin proveedores ni CxP en MVP.
7. **Ingresos diarios**: registro manual del cierre por medios + botón “Montos facturados” (precarga desde facturas).
8. **Offline**: ventas y cambios locales en cola; lectura de catálogo cacheado.

## Reglas MVP confirmadas

- **Stock negativo**: permitido **sin** diálogo de confirmación.
- **Carritos**: máximo **3** simultáneos.
- **Crédito**: solo **clientes (CxC)**.

## Fuera del MVP (fase 2+, ya existe en referencia)

- Gastos y tipos de gasto.
- Cuentas por pagar (acreedores) y proveedores con deuda (**explícitamente excluido del MVP**).
- Transacciones entre cuentas internas (“Mis cuentas”).
- Empleados, ubicaciones de clientes.
- Historial de precios/inventario (auditoría).
- Escaneo de texto por cámara (referencia); en BodePOS priorizar **pistola HID**.

## Métricas de éxito (funcionales)

- Registrar una venta en &lt; 30 s con pistola (3+ ítems).
- Emitir factura offline y sincronizar sin duplicar número.
- Cierre del día cuadra con sumatoria de facturas (± tolerancia de redondeo).
- Consultar deuda de cliente en &lt; 2 s offline.

## Supuestos

- Una **bodega = un tenant** (multi-sede en fase posterior).
- Precio maestro en **USD**; Bs = USD × tasa del momento de la venta (congelar tasa en factura).
- No emisión fiscal SENIAT en MVP (ticket interno); diseño de número de factura serial local + sync.
