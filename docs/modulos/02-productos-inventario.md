# Módulo: Productos e inventario

## Objetivo

Catálogo de la bodega, precios en USD, stock, unidades ponderadas, historial y entrada/salida (incl. pistola).

## Pantallas

### Mis productos (referencia: `/myProductsListPage`)

| Función | Detalle |
|---------|---------|
| Listado | Grid/lista: nombre, stock, $, Bs |
| Buscar por nombre | Filtro local |
| Nuevo | Formulario alta producto |
| Eliminar | Confirmación; no borrar si hay ventas históricas (baja lógica) |

### Formulario producto (Nuevo / Editar)

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| Nombre | Sí | |
| Precio USD | Sí | &gt; 0 |
| Unidad de venta | Sí | Unidad(es), Gramos, Kg |
| Stock inicial | No | Default 0 |
| Código de barras | Recomendado | Único por bodega |
| Umbral bajo stock | No | Hereda default tenant |
| Activo | Sí | Default true |

**Pistola**: escaneo rellena barcode; Enter guarda si formulario válido.

### Vender — selección (referencia: `/productsSelectionPage`)

Misma data que listado; acciones:

- Tap tarjeta → agregar al carrito (cantidad 1 o modal cantidad/peso).
- Icono papelera en listado productos → eliminar producto (admin).
- Muestra stock; **0 uds** en rojo.

### Gestionar inventario

Modal o pantalla dedicada:

| Tipo movimiento | Efecto |
|-----------------|--------|
| Entrada (Compra_Inventario) | +stock |
| Salida / merma | -stock |
| Ajuste conteo | set stock |

Campos: cantidad (Unidades/Kg a ingresar o retirar), nota opcional, referencia proveedor (fase 2).

Genera registro en **inventory_history**.

### Historial de producto (referencia: `/productHIstoryPage`)

Pestañas:

1. **Historial de precios**: fecha, precio anterior, precio nuevo.
2. **Historial de inventario**: fecha, tipo, delta, stock resultante.

### Reporte de inventario

Listado exportable: producto, stock, valor USD, valor Bs a tasa actual.

## Reglas

- Cambio de precio USD → append en `products_price_history`.
- Stock nunca NaN; peso con 2–3 decimales.
- Producto no encontrado (barcode) → ver flujo F06.

## Offline

- CRUD producto offline permitido (cola sync).
- Conflictos de precio: servidor gana con log en historial.

## Alertas

- **Alerta de bajo inventario** al abrir app o al vender última unidad.
