# F02 — Venta a crédito (fiado)

## Actores

Cajero, cliente fiado.

## Precondiciones

- Cliente registrado (o crear antes de cobrar).
- Productos en carrito.

## Flujo principal

```mermaid
flowchart LR
  A[Carrito listo] --> B[Pagar]
  B --> C[Activar Venta a crédito]
  C --> D[Seleccionar cliente]
  D --> E{¿Pago parcial?}
  E -->|Sí| F[Registrar medios por monto parcial]
  E -->|No| G[Total a deuda]
  F --> H[Confirmar Pagar]
  G --> H
  H --> I[Factura Pendiente + saldo cliente]
```

## Pasos

1. Completar carrito normalmente.
2. En **Pagar**, marcar **Venta a crédito**.
3. Elegir **Cliente** (obligatorio).
4. Opcional: registrar pago parcial en cualquier medio.
5. Confirmar **Pagar**.
6. Monto no cubierto se suma a deuda del cliente.
7. Factura queda **Pendiente** (o Pagada parcial si se implementa sub-estado).

## Postcondiciones

- Deuda cliente actualizada (USD maestro).
- Factura en listado del día con cliente visible.
- Stock descontado (fiado sigue siendo venta de mercancía).

## Reglas

- No permitir crédito sin cliente.
- Límite de crédito por cliente (fase 2): alerta si supera tope.

## Abono posterior

Ver [F05-abono-deuda.md](./F05-abono-deuda.md).
