import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Flex,
  IconButton,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { CustomerQuickCreateDialog } from '@/components/customers/CustomerQuickCreateDialog';
import { RateBadgeWithSettings } from '@/components/rate/RateBadgeWithSettings';
import { GenericInput, GenericSelect, GenericText, MoneyAmountInput, type SelectOption } from '@/components/ui';
import { formControlFieldHeight } from '@/components/ui/form-control-metrics';
import { useCart } from '@/lib/cart/CartContext';
import { lineTotalUsd } from '@/lib/cart/quantity';
import { apiFetch } from '@/lib/http/client';
import { formatBs, formatMoneyInput, formatUsd, roundBs, roundUsd, usdToBs } from '@/lib/money';
import { useCustomers, useStoreSettings } from '@/lib/api/hooks';
import { customerSelectLabel } from '@/lib/customers';
import { effectiveRate } from '@/lib/rate';
import { isOnline, queueOutbox } from '@/lib/offline/sync';
import {
  outlineIconButtonProps,
  primarySolidButtonProps,
  secondarySolidButtonProps,
} from '@/lib/design/surface-styles';

const payFieldSize = 'sm' as const;
const payFieldHeight = formControlFieldHeight(payFieldSize);

type PayFields = {
  usdCash: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  cashBs: number;
  biopagoBs: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PayCheckoutDialog({ open, onClose }: Props) {
  const nav = useNavigate();
  const { lines, clearCart } = useCart();
  const { data: settings } = useStoreSettings();
  const { data: customers = [] } = useCustomers();
  const rate = effectiveRate(settings);

  const customerOptions: SelectOption[] = useMemo(
    () => customers.map(c => ({ value: c.id, label: customerSelectLabel(c) })),
    [customers],
  );

  const cartTotalUsd = useMemo(
    () => roundUsd(lines.reduce((a, l) => a + lineTotalUsd(l), 0)),
    [lines],
  );
  const [chargeTotalUsd, setChargeTotalUsd] = useState(cartTotalUsd);
  const totalBs = usdToBs(chargeTotalUsd, rate);

  useEffect(() => {
    if (!open) return;
    setChargeTotalUsd(cartTotalUsd);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setChargeTotalUsd(prev => roundUsd(Math.max(cartTotalUsd, prev)));
  }, [cartTotalUsd, open]);

  const [isCredit, setIsCredit] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [pay, setPay] = useState<PayFields>({
    usdCash: 0,
    posBs: 0,
    pos2Bs: 0,
    mobileBs: 0,
    cashBs: 0,
    biopagoBs: 0,
  });
  const [change, setChange] = useState({ bs: 0, usd: 0, mobileBs: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);

  const emptyPay = (): PayFields => ({
    usdCash: 0,
    posBs: 0,
    pos2Bs: 0,
    mobileBs: 0,
    cashBs: 0,
    biopagoBs: 0,
  });

  const setPayField = (k: keyof PayFields, v: number) =>
    setPay(p => ({ ...p, [k]: k === 'usdCash' ? roundUsd(v) : roundBs(v) }));

  /** Un solo medio con monto; el resto en cero (Todo / Resto). */
  const setPayFieldExclusive = (k: keyof PayFields, v: number) => {
    const rounded = k === 'usdCash' ? roundUsd(v) : roundBs(v);
    setPay({ ...emptyPay(), [k]: rounded });
    setChange({ bs: 0, usd: 0, mobileBs: 0 });
  };

  const paidUsdEq = roundUsd(
    pay.usdCash + (pay.posBs + pay.pos2Bs + pay.mobileBs + pay.cashBs + pay.biopagoBs) / rate,
  );

  /** Positivo = vuelto a entregar; negativo = falta por cobrar. */
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
    if (lines.length === 0) {
      setError('Carrito vacío');
      return;
    }
    if (isCredit && !customerId) {
      setError('Selecciona un cliente para fiado');
      return;
    }
    if (!isCredit && paidUsdEq + 0.01 < chargeTotalUsd) {
      setError('El monto pagado es menor al total');
      return;
    }

    const body = {
      clientOpId: uuid(),
      customerId: customerId || null,
      isCredit,
      rateApplied: rate,
      totalUsd: chargeTotalUsd,
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
      onClose();
      nav('/accounting/invoices');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al pagar');
    } finally {
      setLoading(false);
    }
  };

  const emptyCart = lines.length === 0;

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
            >
              <Flex align="center" justify="space-between" gap={2} w="full" minH="8">
                <Dialog.Title fontSize="lg" fontWeight="semibold" lineClamp={1} flexShrink={0}>
                  Pagar
                </Dialog.Title>
                <RateBadgeWithSettings />
              </Flex>
            </Dialog.Header>

            <Dialog.Body flex="1" minH={0} overflowY="auto" px={4} py={4}>
              {emptyCart ? (
                <Stack gap={3}>
                  <GenericText variant="body">Carrito vacío</GenericText>
                  <Button variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                </Stack>
              ) : (
                <Stack gap={4} pb={2}>
                  <Box p={3} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                    <Stack gap={3}>
                      <TotalField
                        label="Total USD"
                        value={chargeTotalUsd}
                        min={cartTotalUsd}
                        onValueChange={setChargeTotalUsd}
                      />
                      <TotalField
                        label="Total Bs"
                        value={totalBs.toLocaleString('es-VE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        readOnly
                      />
                    </Stack>
                  </Box>

                  <Stack gap={2}>
                    <Checkbox.Root
                      checked={isCredit}
                      onCheckedChange={d => {
                        const checked = !!d.checked;
                        setIsCredit(checked);
                        if (!checked) setCustomerId('');
                      }}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label fontSize="sm">Venta a crédito</Checkbox.Label>
                    </Checkbox.Root>
                    {isCredit && (
                      <Flex gap={2} align="center">
                        <Box flex="1" minW={0}>
                          <GenericSelect
                            size={payFieldSize}
                            options={customerOptions}
                            value={customerId}
                            onChange={setCustomerId}
                            placeholder="Cliente"
                            aria-label="Cliente"
                          />
                        </Box>
                        <IconButton
                          aria-label="Nuevo cliente"
                          flexShrink={0}
                          h={payFieldHeight}
                          minH={payFieldHeight}
                          maxH={payFieldHeight}
                          w={payFieldHeight}
                          minW={payFieldHeight}
                          onClick={() => setCreateCustomerOpen(true)}
                          {...outlineIconButtonProps('secondary')}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                      </Flex>
                    )}
                  </Stack>

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
                      onRest={() => setPayFieldExclusive('mobileBs', usdToBs(remainingUsdExcluding('mobileBs'), rate))}
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
                      onRest={() => setPayFieldExclusive('biopagoBs', usdToBs(remainingUsdExcluding('biopagoBs'), rate))}
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
              )}
            </Dialog.Body>

            {!emptyCart && (
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
                  variant="solid"
                  loading={loading}
                  onClick={submit}
                  {...primarySolidButtonProps}
                >
                  Pagar
                </Button>
              </Dialog.Footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
      <CustomerQuickCreateDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        onCreated={c => setCustomerId(c.id)}
      />
    </Dialog.Root>
  );
}

function TotalField({
  label,
  value,
  readOnly = false,
  min,
  onValueChange,
}: {
  label: string;
  value: number | string;
  readOnly?: boolean;
  min?: number;
  onValueChange?: (n: number) => void;
}) {
  const clampCharge = (n: number) => roundUsd(Math.max(min ?? 0, n));
  const inputValue = typeof value === 'number' ? formatMoneyInput(value) : value;

  return (
    <Flex align="center" gap={3}>
      <GenericText variant="label" flexShrink={0} minW="20">
        {label}
      </GenericText>
      {readOnly || typeof value !== 'number' ? (
        <GenericInput size={payFieldSize} readOnly value={inputValue} bg="gray.50" flex="1" />
      ) : (
        <MoneyAmountInput
          size={payFieldSize}
          flex="1"
          value={value}
          onChange={n => onValueChange?.(clampCharge(n))}
        />
      )}
    </Flex>
  );
}

function PayRow({
  label,
  value,
  onChange,
  onAll,
  onRest,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  onAll?: () => void;
  onRest?: () => void;
}) {
  return (
    <Flex gap={2} align="center">
      <MoneyAmountInput
        size={payFieldSize}
        flex="1"
        minW={0}
        placeholder={label}
        aria-label={label}
        value={value}
        onChange={onChange}
      />
      {onAll && (
        <Button
          minW="14"
          px={3}
          variant="solid"
          h={payFieldHeight}
          minH={payFieldHeight}
          maxH={payFieldHeight}
          onClick={onAll}
          {...secondarySolidButtonProps}
        >
          Todo
        </Button>
      )}
      {onRest && (
        <Button
          minW="14"
          px={3}
          variant="solid"
          h={payFieldHeight}
          minH={payFieldHeight}
          maxH={payFieldHeight}
          onClick={onRest}
          {...secondarySolidButtonProps}
        >
          Resto
        </Button>
      )}
    </Flex>
  );
}
