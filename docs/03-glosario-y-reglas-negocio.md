# Glosario y reglas de negocio

## Glosario

| Término | Significado |
|---------|-------------|
| **Tasa** | Bolívares por 1 USD usados para mostrar/cobrar |
| **Divisas** | Efectivo en USD |
| **Punto de venta** | Cobro con datáfono (Bs) |
| **Pago móvil** | Transferencia instantánea Bs |
| **Biopago** | Medio biométrico Bs (según operación del negocio) |
| **Fiado / crédito** | Venta sin cobro completo; aumenta deuda del cliente |
| **Factura** | Comprobante interno de venta (no fiscal MVP) |
| **Cierre del día** | Registro de totales por medio vs lo facturado |
| **CxC** | Cuentas por cobrar — deuda de **clientes** (fiado) |
| **CxP** | Cuentas por pagar (proveedores). **Fuera del MVP** |

## Monedas

- **Precio de lista** del producto: USD (referencia).
- **Bs en pantalla**: `round(price_usd * rate, 2)` salvo regla de redondeo comercial (definir: 2 decimales Bs).
- **Factura** guarda: `rate_applied`, totales USD y Bs, desglose por método de pago.

## Métodos de pago (venta)

| Campo | Moneda típica |
|-------|----------------|
| Pagado en divisas | USD |
| Pagado en punto de venta | Bs |
| Pagado en pago móvil | Bs |
| Pagado en Bs efectivo | Bs |
| Pagado en biopago | Bs |

**Regla**: suma de pagos (convertidos a moneda de comparación) ≥ total, salvo venta 100% crédito.

## Vuelto

- Si pago en Bs efectivo &gt; portion due → calcular vuelto total USD/Bs.
- Usuario distribuye vuelto en: Bs, divisas, pago móvil.
- Validación: debe registrar vuelto entregado si vuelto &gt; 0.

## Venta a crédito

- Requiere **cliente** seleccionado.
- Monto no cubierto por pagos → incrementa **deuda del cliente** (USD y Bs según conversión acordada; por defecto USD maestro).
- Factura estado **Pendiente** o **Pagada parcial** (MVP: Pendiente si crédito &gt; 0).

## Stock

- Unidades: enteros; peso: decimal (kg).
- Venta decrementa stock al **confirmar pago**.
- **Bajo inventario**: alerta si `stock <= umbral` (producto o global).
- **Stock negativo**: **permitido sin confirmación** (la bodega puede vender aunque el conteo quede en negativo; mostrar en rojo en UI).

## Número de factura

- Formato referencia: `Nro: 000000036525` (12 dígitos, zero-padded).
- Generación: contador por bodega; offline usa rango reservado o UUID temporal hasta sync.

## Cliente “N/A”

- Ventas mostrador sin fiado: cliente opcional; en reportes aparece N/A.

## Deuda cliente (CxC)

- Mostrar siempre par **USD + Bs** al tipo de cambio **actual para visualización**; movimientos guardan montos reales del hecho.
- MVP: solo clientes; no deuda con proveedores.

## Permisos (futuro)

| Acción | Cajero | Admin |
|--------|--------|-------|
| Vender | Sí | Sí |
| Anular factura | No | Sí |
| Cambiar tasa | No | Sí |
| Editar precio | No | Sí |

MVP: un solo rol con todos los permisos.
