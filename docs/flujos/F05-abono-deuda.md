# F05 — Abono de deuda (cliente o proveedor)

## Actores

Cajero / dueño.

## Alcance

- **Cliente**: reduce fiado (`Abono_Deuda`).
- **Proveedor / acreedor** (fase 2): reduce CxP.

## Flujo cliente

```mermaid
sequenceDiagram
  participant U as Usuario
  participant L as Listado clientes
  participant A as Abono
  participant D as Deuda

  U->>L: Selecciona cliente
  U->>A: Registrar abono
  A->>A: Monto + método + nota
  A->>D: Reduce saldo
  A-->>U: Confirmación
```

## Reglas

- Abono no puede exceder deuda (salvo “a favor” intencional).
- Generar comprobante interno opcional.
- Si hay módulo cuentas: abono suma a caja lógica correspondiente.

## Offline

- Abono en cola; deuda local actualizada de inmediato.

## Referencia tipos movimiento

- `Abono_Deuda`
- `Abono_Prestamo_Externo`
