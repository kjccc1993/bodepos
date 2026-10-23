import { Button, Checkbox, Flex, Stack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { GenericHeading, GenericInput, GenericSelect, GenericText, type SelectOption } from '@/components/ui';
import { useCart } from '@/lib/cart/CartContext';
import { lineTotalUsd } from '@/lib/cart/quantity';
import { apiFetch } from '@/lib/http/client';
import { formatUsd, usdToBs } from '@/lib/money';
import { useCustomers, useStoreSettings } from '@/lib/api/hooks';
import { effectiveRate } from '@/lib/rate';
import { isOnline, queueOutbox } from '@/lib/offline/sync';

export function PayPage() {
  const nav = useNavigate();
  const { lines, clearCart } = useCart();
  const { data: settings } = useStoreSettings();
  const { data: customers = [] } = useCustomers();
  const rate = effectiveRate(settings);

  const customerOptions: SelectOption[] = useMemo(
    () => customers.map(c => ({ value: c.id, label: c.name })),
    [customers],
  );

  const totalUsd = useMemo(() => lines.reduce((a, l) => a + lineTotalUsd(l), 0), [lines]);
  const totalBs = usdToBs(totalUsd, rate);

  const [isCredit, setIsCredit] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [pay, setPay] = useState({ usdCash: 0, posBs: 0, pos2Bs: 0, mobileBs: 0, cashBs: 0, biopagoBs: 0 });
  const [change, setChange] = useState({ bs: 0, usd: 0, mobileBs: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (k: keyof typeof pay, v: number) => setPay(p => ({ ...p, [k]: v }));

  const paidUsdEq =
    pay.usdCash +
    (pay.posBs + pay.pos2Bs + pay.mobileBs + pay.cashBs + pay.biopagoBs) / rate;

  const submit = async () => {
    setError('');
    if (lines.length === 0) {
      setError('Carrito vacío');
      return;
    }
    if (isCredit && !customerId) {
      setError('Selecciona un cliente para fiado');
      return;
    }
    if (!isCredit && paidUsdEq + 0.01 < totalUsd) {
      setError('El monto pagado es menor al total');
      return;
    }

    const body = {
      clientOpId: uuid(),
      customerId: customerId || null,
      isCredit,
      rateApplied: rate,
      lines: lines.map(l => ({ productId: l.productId, quantity: l.quantity })),
      payments: pay,
      change,
    };

    setLoading(true);
    try {
      if (isOnline()) {
        await apiFetch('/sales/checkout', { method: 'POST', body: JSON.stringify(body) });
      } else {
        await queueOutbox('checkout', body);
      }
      clearCart();
      nav('/accounting/invoices');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al pagar');
    } finally {
      setLoading(false);
    }
  };

  if (lines.length === 0) {
    return (
      <Stack flex="1" minH={0} h={0} overflowY="auto">
        <GenericHeading>Pagar</GenericHeading>
        <GenericText variant="body">Carrito vacío</GenericText>
        <Button onClick={() => nav('/sell')}>Volver a vender</Button>
      </Stack>
    );
  }

  return (
    <Stack gap={3} pb={8} flex="1" minH={0} h={0} overflowY="auto">
      <GenericHeading>Pagar</GenericHeading>
      <GenericText variant="body">
        Total {formatUsd(totalUsd)} — Bs {totalBs.toLocaleString('es-VE')}
      </GenericText>
      <Checkbox.Root checked={isCredit} onCheckedChange={d => setIsCredit(!!d.checked)}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Venta a crédito</Checkbox.Label>
      </Checkbox.Root>
      {isCredit && (
        <GenericSelect
          options={customerOptions}
          value={customerId}
          onChange={setCustomerId}
          placeholder="Cliente…"
          aria-label="Cliente para crédito"
        />
      )}
      <PaymentRow label="Pagado en divisas" value={pay.usdCash} onChange={v => setField('usdCash', v)} onAll={() => setField('usdCash', totalUsd)} />
      <PaymentRow label="Punto de venta" value={pay.posBs} onChange={v => setField('posBs', v)} onAll={() => setField('posBs', totalBs)} />
      <PaymentRow label="Punto de venta 2" value={pay.pos2Bs} onChange={v => setField('pos2Bs', v)} />
      <PaymentRow label="Pago móvil" value={pay.mobileBs} onChange={v => setField('mobileBs', v)} />
      <PaymentRow label="Bs efectivo" value={pay.cashBs} onChange={v => setField('cashBs', v)} />
      <PaymentRow label="Biopago" value={pay.biopagoBs} onChange={v => setField('biopagoBs', v)} />
      <GenericHeading variant="section">Vuelto</GenericHeading>
      <PaymentRow label="Vuelto Bs" value={change.bs} onChange={v => setChange(c => ({ ...c, bs: v }))} />
      <PaymentRow label="Vuelto USD" value={change.usd} onChange={v => setChange(c => ({ ...c, usd: v }))} />
      {error && <GenericText variant="error">{error}</GenericText>}
      <Flex gap={2}>
        <Button flex={1} variant="outline" onClick={() => nav('/cart')}>
          Volver
        </Button>
        <Button flex={1} colorPalette="green" loading={loading} onClick={submit}>
          Pagar
        </Button>
      </Flex>
    </Stack>
  );
}

function PaymentRow({
  label,
  value,
  onChange,
  onAll,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  onAll?: () => void;
}) {
  return (
    <Flex gap={2} align="center">
      <GenericText variant="label" flex="1">
        {label}
      </GenericText>
      <GenericInput
        decimal
        size="sm"
        w="24"
        value={value || ''}
        onChange={e => onChange(Number(e.target.value.replace(',', '.')) || 0)}
      />
      {onAll && (
        <Button size="xs" variant="outline" onClick={onAll}>
          Todo
        </Button>
      )}
    </Flex>
  );
}
