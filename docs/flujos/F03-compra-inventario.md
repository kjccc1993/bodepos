# F03 — Compra / entrada de inventario

## Actores

Dueño o encargado de compras.

## Objetivo

Incrementar stock por compra en mercado/distribuidor; opcionalmente registrar deuda con proveedor (fase 2).

## Flujo principal

```mermaid
flowchart TD
  A[Mis Productos] --> B[Gestionar inventario]
  B --> C{Tipo}
  C -->|Entrada| D[Ingresar cantidad]
  D --> E{Identificación}
  E -->|Pistola| F[Buscar por barcode]
  E -->|Manual| G[Seleccionar producto]
  F --> H[Confirmar]
  G --> H
  H --> I[Stock + historial]
  I --> J{¿Crédito proveedor?}
  J -->|Sí fase 2| K[+CxP proveedor]
  J -->|No| L[Fin]
  K --> L
```

## Pasos (MVP)

1. Abrir producto → **Gestionar inventario**.
2. Elegir **Entrada** / Compra inventario.
3. Indicar **Unidades/Kg a ingresar**.
4. Confirmar → mensaje “stock incrementado”.
5. Registro en historial de inventario.

## Pistola

Modo inventario: escaneo repetido suma +1 o abre cantidad editable.

## Postcondiciones

- `in_stock` actualizado.
- Movimiento `Compra_Inventario` en historial.

## Excepciones

- Producto inactivo → no permitir entrada sin reactivar.
- Offline → cola movimiento; stock local optimista.
