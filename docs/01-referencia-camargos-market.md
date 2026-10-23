# Referencia: Camargo's Market (FlutterFlow)

URL: https://camargos-market-5wafkn.flutterflow.app/  
Versión observada en configuración: **1.0.12**

Este documento resume lo **mapeado en la app existente** para decidir qué reutilizar en BodePOS.

## Navegación principal (bottom bar)

| Tab | Ruta | Función |
|-----|------|---------|
| Vender | `/productsSelectionPage` | Selección de productos → carrito |
| Mis Productos | `/myProductsListPage` | CRUD/listado inventario |
| Carrito | `/cartPage` | Revisión antes de pagar |
| Contabilidad | `/accountabilityPage` | Menú contable |
| Más | `/settingsPage` | Tasa, reportes, cerrar sesión |

## Pantallas por módulo

### Ventas

- **Vender**: pestañas Cliente 1 / Cliente 2 (en código hay `ff_cart` … `ff_cart4` → hasta 4 carritos posibles).
- Badge **1$ = tasa** visible en venta y carrito.
- Búsqueda **“Buscar por nombre”** (falta pistola explícita; BodePOS la agrega).
- Tarjeta producto: nombre, `$` + `Bs`, stock (`uds` / `kg`), selector unidad, icono eliminar (en lista de productos).

### Carrito y pago

- **Completar compra** (`/cartPage`): vacío → “No hay nada en el carrito”.
- **Pagar** (`/paymentPage`):
  - Totales USD y Bs.
  - Checkbox **Venta a crédito** + selector **Cliente**.
  - Pagos: divisas, punto de venta, pago móvil, Bs efectivo, biopago.
  - Botones **Todo** / **Resto** por línea de pago.
  - **Vuelto** en Bs, divisas y pago móvil.
  - Validaciones (strings en app): método de pago requerido, vuelto requerido, monto menor al total, cliente requerido en crédito.

### Productos

- Listado con **Nuevo**, búsqueda, precio dual, stock, eliminar.
- **Gestionar inventario** (entrada/salida por unidades o kg).
- **Historial de producto** (`/productHIstoryPage`): pestañas precios e inventario.
- **Reporte de inventario** (`/inventoryReportPage`) desde configuración.
- Alerta **bajo inventario** (umbral configurable).

### Contabilidad (menú)

| Opción | Ruta |
|--------|------|
| Ingresos por ventas | `/dailyIncomesPage` |
| Facturas de ventas | `/invoicesListPage` |
| Registrar gastos | `/registerExpensesPage` |
| Tipos de gasto | `/expenseTypesPage` |
| Cuentas por pagar | `/creditorsListPage` |
| Transacciones | `/transactionsPage` |
| Mis cuentas | `/accountsPage` |
| Categorías de transacciones | `/transactionCategoriesPage` |
| Proveedores | `/suppliersPage` |
| Empleados | `/employeesPage` |
| Clientes | `/customersPage` |
| Ubicación de clientes | `/locationsAreasPage` |

### Transacciones (submenú)

- Registrar transacciones → `/registerTransactionsPage`
- Historial → `/transactionsHistoryPage`
- Transferir entre cuentas (pantalla dedicada en flujo)

### Configuración

- **Tasa personalizada** (`/customRatesPage`): valor numérico + “Usar siempre esta tasa”.
- Mensajes de error al consultar tasa oficial BCV (`bcv_rate` en backend).

## Entidades inferidas (Firestore en referencia)

Colecciones / campos visibles en cliente:

- `products`, `products_price_history`, `inventory_history`
- `invoices`, `invoice_number`
- `customers`, `customer_id`, `customer_name`
- `creditors`, `creditor_transactions`
- `suppliers`, `supplier_id`
- `accounts`, `daily_transactions`, `daily_expenses`
- `expense_types`, `transaction_categories`, `employees`
- `users`, `ff_cart` (estado carrito)

## Comportamientos a **mejorar** respecto a la referencia

| Tema | Referencia | BodePOS |
|------|------------|---------|
| Offline | Online-first (Firestore) | Local-first + sync |
| Código barras | No evidente en UI | Pistola HID + campo `barcode` |
| Carritos | 2 visibles, 4 en estado | Definir 2 o N configurable |
| Stock negativo | Se observa (-4 uds) | BodePOS: **permitir sin confirmación** |
| PWA | Manifest presente | Service worker + cola sync robusta |

## Herencia recomendada para MVP

Copiar flujos probados en operación real:

- Dual moneda con tasa en header.
- Pago split + vuelto multi-moneda.
- Facturas del día con desglose por medio.
- Clientes con deuda dual.
- Ingresos diarios con precarga “Montos facturados”.

Posponer: GOHANDY promo, escaneo OCR cámara, módulo empleados/ubicaciones.
