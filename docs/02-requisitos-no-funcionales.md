# Requisitos no funcionales

## Plataforma

- **Web responsive** (móvil primero; usable en PC de mostrador).
- **PWA instalable** (Android/desktop Chrome/Edge).
- **HTTPS** obligatorio en producción (service worker).

## Online / offline

### Modos

| Modo | Comportamiento |
|------|----------------|
| Online | Lectura/escritura servidor; cache caliente |
| Offline | Lectura desde IndexedDB; escritura en **outbox** |
| Reconexión | Sincronización incremental; resolución de conflictos |

### Datos mínimos en cache offline

- Catálogo de productos (incl. barcode, precio, stock).
- Clientes activos y saldos (snapshot + delta local).
- Tasa del día / tasa fija configurada.
- Secuencia local de números de factura (prefijo + contador por dispositivo/sucursal).
- Cola: ventas, abonos, movimientos inventario, altas/edición producto.

### Reglas de sync (funcionales)

1. Toda operación offline genera `id` UUID + `client_created_at` + `sync_status`.
2. Al subir factura: servidor asigna `invoice_number` definitivo si hay colisión.
3. Stock: **restar en venta local** de inmediato; reconciliar con servidor (última escritura gana o suma de movimientos — definir en implementación).
4. UI muestra badge **Sin conexión** y contador de pendientes de sync.

## Pistola de códigos de barras

### Hardware

- Escáner **HID** (emula teclado): plug & play en web.
- Soporta EAN-13, UPC, Code 128 (productos locales sin checksum).

### Comportamiento UX

| Contexto | Acción al escanear |
|----------|-------------------|
| Pantalla **Vender** | Buscar producto por barcode; si existe → agregar 1 u al carrito activo; foco permanece en campo escaneo |
| Campo búsqueda con texto | Reemplazar con código escaneado y ejecutar búsqueda |
| **Nuevo/editar producto** | Rellenar campo barcode |
| **Gestionar inventario** | Identificar producto + abrir modal cantidad (entrada/salida) |
| Código desconocido | Toast “Producto no encontrado” + acción rápida “Crear producto” (opcional MVP+) |

### Detalle técnico (input)

- Input oculto o visible “Escanear” siempre con foco en modos caja.
- Detectar **Enter** tras burst de caracteres (&lt; 50 ms entre teclas → escaneo).
- Ignorar escaneos mientras modal de pago bloquea (configurable).

## Rendimiento

- Catálogo 500–3000 SKU: búsqueda local &lt; 100 ms.
- Grid venta paginado o virtualizado.

## Seguridad (funcional)

- Sesión con expiración; logout en “Más”.
- Multi-tenant: usuario solo ve datos de su bodega.
- No almacenar PAN de tarjetas (solo monto POS agregado).

## Accesibilidad

- Contraste suficiente en montos y stock en rojo (0 uds).
- Targets táctiles ≥ 44 px en botones de caja.

## Compatibilidad

- Chrome/Edge últimas 2 versiones; Safari iOS (PWA limitaciones documentadas).
- Impresión ticket: fase 2 (window.print o ESC/POS vía bridge).
