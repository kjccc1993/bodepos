import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { RateBadgeWithSettings } from '@/components/rate/RateBadgeWithSettings';
import {
  emptyPayFields,
  PayRow,
  TotalField,
  type PayFields,
} from '@/components/payments/payment-form';
import { GenericText } from '@/components/ui';
import { apiFetch } from '@/lib/http/client';
import { formatBs, formatUsd, roundBs, roundUsd, usdToBs } from '@/lib/money';
import { primarySolidButtonProps } from '@/lib/design/surface-styles';
import type { Invoice } from '@/lib/types';

type Props = {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
};

export function InvoicePaymentDialog({ invoice, open, onClose, onSaved }: Props) {
  const [pay, setPay] = useState<PayFields>(emptyPayFields());
  const [change, setChange] = useState({ bs: 0, usd: 0, mobileBs: 0 });
  const [chargeTotalUsd, setChargeTotalUsd] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPending = invoice?.status === 'PENDING';
  const rate = invoice?.rateApplied ?? 0;
  const linesSubtotalUsd = roundUsd(
    (invoice?.lines ?? []).reduce((acc, line) => roundUsd(acc + line.lineTotalUsd), 0),
  );
  const baseTotalUsd =
    linesSubtotalUsd > 0 ? linesSubtotalUsd : roundUsd(invoice?.totalUsd ?? 0);
  const totalBs = usdToBs(chargeTotalUsd, rate);

  useEffect(() => {
    if (!open || !invoice) return;
    const stored = roundUsd(invoice.totalUsd);
    const base =
      invoice.lines.length > 0
        ? roundUsd(invoice.lines.reduce((acc, line) => roundUsd(acc + line.lineTotalUsd), 0))
        : stored;
    const pendingCharge =
      stored > base + 0.001 ? stored : roundUsd(base * 1.05);
    setChargeTotalUsd(invoice.status === 'PENDING' ? pendingCharge : stored);
    setPay({
      usdCash: invoice.payments.usdCash,
      posBs: invoice.payments.posBs,
      pos2Bs: invoice.payments.pos2Bs,
      mobileBs: invoice.payments.mobileBs,
      cashBs: invoice.payments.cashBs,
      biopagoBs: invoice.payments.biopagoBs,
    });
    setChange({
      bs: invoice.change?.bs ?? 0,
      usd: invoice.change?.usd ?? 0,
      mobileBs: invoice.change?.mobileBs ?? 0,
    });
    setError('');
  }, [open, invoice]);

  if (!invoice) return null;

  const setPayField = (k: keyof PayFields, v: number) =>
    setPay(p => ({ ...p, [k]: k === 'usdCash' ? roundUsd(v) : roundBs(v) }));

  const setPayFieldExclusive = (k: keyof PayFields, v: number) => {
    const rounded = k === 'usdCash' ? roundUsd(v) : roundBs(v);
    setPay({ ...emptyPayFields(), [k]: rounded });
    setChange({ bs: 0, usd: 0, mobileBs: 0 });
  };

  const paidUsdEq = roundUsd(
    pay.usdCash + (pay.posBs + pay.pos2Bs + pay.mobileBs + pay.cashBs + pay.biopagoBs) / rate,
  );

  const paymentBalanceUsd = roundUsd(paidUsdEq - chargeTotalUsd);
  const paymentBalanceBs = usdToBs(paymentBalanceUsd, rate);
  const changeDueUsd = Math.max(0, paymentBalanceUsd);
  const changeDueBs = usdToBs(changeDueUsd, rate);

  const payUsdEquiv = (field: keyof PayFields) => {
    const v = pay[field];
    return field === 'usdCash' ? v : v / rate;
  };

  const remainingUsdExcluding = (field: keyof PayFields) => {
    let other = 0;
    for (const k of Object.keys(pay) as (keyof PayFields)[]) {
      if (k !== field) other += payUsdEquiv(k);
    }
    return roundUsd(Math.max(0, chargeTotalUsd - other));
  };

  const submit = async () => {
    setError('');
    if (!isPending && paidUsdEq + 0.01 < chargeTotalUsd) {
      setError('El monto pagado es menor al total');
      return;
    }

    setLoading(true);
    try {
      const body: { payments: PayFields; change: typeof change; totalUsd?: number } = {
        payments: pay,
        change,
      };
      const storedTotal = roundUsd(invoice.totalUsd);
      if (roundUsd(chargeTotalUsd) !== storedTotal) {
        body.totalUsd = chargeTotalUsd;
      }
      const updated = await apiFetch<Invoice>(`/invoices/${invoice.id}/payments`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el pago');
    } finally {
      setLoading(false);
    }
  };

  const title = isPending ? 'Pagar' : 'Editar pago';
  const confirmLabel = isPending ? 'Pagar' : 'Guardar';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={e => {
        if (!e.open) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner
          p={{ base: 0, md: 4 }}
          alignItems={{ base: 'stretch', md: 'center' }}
          justifyContent="center"
        >
          <Dialog.Content
            maxW={{ base: '100%', md: '28rem', lg: '32rem' }}
            w="full"
            h={{ base: '100dvh', md: 'auto' }}
            maxH={{ base: '100dvh', md: 'min(90dvh, 44rem)' }}
            m={{ base: 0, md: 'auto' }}
            borderRadius={{ base: 0, md: 'xl' }}
            boxShadow={{ base: 'none', md: 'xl' }}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            bg="white"
          >
            <Dialog.Header
              flexShrink={0}
              borderBottomWidth="1px"
              borderColor="gray.200"
              py={3}
              px={4}
              display="flex"
              flexDirection="column"
              alignItems="stretch"
            >
              <Stack gap={{ base: 1, md: 1.5 }} w="full" minW={0}>
                <Flex align="center" justify="space-between" gap={3} w="full" minW={0}>
                  <Dialog.Title
                    fontSize="lg"
                    fontWeight="semibold"
                    lineClamp={1}
                    minW={0}
                    flex="1"
                  >
                    {title}
                  </Dialog.Title>
                  <Box flexShrink={0}>
                    <RateBadgeWithSettings />
                  </Box>
                </Flex>
                <GenericText variant="caption" lineClamp={1} w="full" minW={0}>
                  Factura {invoice.number}
                  {invoice.customerName ? ` · ${invoice.customerName}` : ''}
                </GenericText>
              </Stack>
            </Dialog.Header>

            <Dialog.Body flex="1" minH={0} overflowY="auto" px={4} py={4}>
              <Stack gap={4} pb={2}>
                <Box p={3} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                  <Stack gap={3}>
                    {isPending ? (
                      <Stack gap={1} w="full">
                        <TotalField
                          label="Total USD"
                          value={chargeTotalUsd}
                          min={baseTotalUsd}
                          onValueChange={setChargeTotalUsd}
                        />
                        <Flex align="flex-start" gap={3} w="full">
                          <Box flexShrink={0} minW="20" aria-hidden />
                          <GenericText variant="caption" color="gray.600" flex="1" w="full">
                            Incluye 5% de recargo
                          </GenericText>
                        </Flex>
                      </Stack>
                    ) : (
                      <TotalField label="Total USD" value={chargeTotalUsd} readOnly />
                    )}
                    <TotalField
                      label="Total Bs"
                      value={totalBs.toLocaleString('es-VE', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      readOnly
                    />
                  </Stack>
                </Box>

                <Stack gap={3}>
                  <PayRow
                    label="Pagado en divisas"
                    value={pay.usdCash}
                    onChange={v => setPayField('usdCash', v)}
                    onAll={() => setPayFieldExclusive('usdCash', chargeTotalUsd)}
                    onRest={() => setPayFieldExclusive('usdCash', remainingUsdExcluding('usdCash'))}
                  />
                  <PayRow
                    label="Pagado en punto de venta"
                    value={pay.posBs}
                    onChange={v => setPayField('posBs', v)}
                    onAll={() => setPayFieldExclusive('posBs', totalBs)}
                    onRest={() => setPayFieldExclusive('posBs', usdToBs(remainingUsdExcluding('posBs'), rate))}
                  />
                  <PayRow
                    label="Pagado en pago móvil"
                    value={pay.mobileBs}
                    onChange={v => setPayField('mobileBs', v)}
                    onAll={() => setPayFieldExclusive('mobileBs', totalBs)}
                    onRest={() =>
                      setPayFieldExclusive('mobileBs', usdToBs(remainingUsdExcluding('mobileBs'), rate))
                    }
                  />
                  <PayRow
                    label="Pagado en Bs efectivo"
                    value={pay.cashBs}
                    onChange={v => setPayField('cashBs', v)}
                    onAll={() => setPayFieldExclusive('cashBs', totalBs)}
                    onRest={() => setPayFieldExclusive('cashBs', usdToBs(remainingUsdExcluding('cashBs'), rate))}
                  />
                  <PayRow
                    label="Pagado en Biopago"
                    value={pay.biopagoBs}
                    onChange={v => setPayField('biopagoBs', v)}
                    onAll={() => setPayFieldExclusive('biopagoBs', totalBs)}
                    onRest={() =>
                      setPayFieldExclusive('biopagoBs', usdToBs(remainingUsdExcluding('biopagoBs'), rate))
                    }
                  />
                </Stack>

                <Box p={3} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                  <Stack gap={2}>
                    <Flex justify="space-between" align="baseline" gap={2}>
                      <GenericText variant="label">Vuelto total en USD</GenericText>
                      <GenericText variant="strong" fontVariantNumeric="tabular-nums">
                        {formatUsd(paymentBalanceUsd)}
                      </GenericText>
                    </Flex>
                    <Flex justify="space-between" align="baseline" gap={2}>
                      <GenericText variant="label">Vuelto total en Bs</GenericText>
                      <GenericText variant="strong" fontVariantNumeric="tabular-nums">
                        {formatBs(paymentBalanceBs)}
                      </GenericText>
                    </Flex>
                  </Stack>
                </Box>

                <Stack gap={3}>
                  <PayRow
                    label="Vuelto en Bs"
                    value={change.bs}
                    onChange={v => setChange(c => ({ ...c, bs: v }))}
                    onAll={() => setChange(c => ({ ...c, bs: changeDueBs }))}
                  />
                  <PayRow
                    label="Vuelto en divisas"
                    value={change.usd}
                    onChange={v => setChange(c => ({ ...c, usd: v }))}
                    onAll={() => setChange(c => ({ ...c, usd: changeDueUsd }))}
                  />
                  <PayRow
                    label="Vuelto en pago móvil"
                    value={change.mobileBs}
                    onChange={v => setChange(c => ({ ...c, mobileBs: v }))}
                    onAll={() => setChange(c => ({ ...c, mobileBs: changeDueBs }))}
                  />
                </Stack>

                {error && <GenericText variant="error">{error}</GenericText>}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer
              flexShrink={0}
              borderTopWidth="1px"
              borderColor="gray.200"
              px={4}
              py={3}
              pb={{ base: 'max(0.75rem, env(safe-area-inset-bottom))', md: 3 }}
              gap={3}
            >
              <Button
                flex={1}
                size="lg"
                minH="12"
                borderRadius="lg"
                variant="outline"
                borderColor="gray.200"
                color="gray.700"
                onClick={onClose}
              >
                Cerrar
              </Button>
              <Button
                flex={1}
                size="lg"
                minH="12"
                loading={loading}
                onClick={() => void submit()}
                {...primarySolidButtonProps}
              >
                {confirmLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
