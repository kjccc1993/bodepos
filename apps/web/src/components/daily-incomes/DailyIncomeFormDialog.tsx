import { Box, Button, CloseButton, Dialog, Grid, Portal, Stack } from '@chakra-ui/react';
import { useMemo } from 'react';
import { PaymentAmountField } from '@/components/payments/PaymentAmountField';
import { FormField, GenericDatePicker, GenericText } from '@/components/ui';
import { formatInvoiceFilterDate } from '@/lib/invoices/format';
import { VENEZUELA_TIME_ZONE } from '@/lib/utils/calendar';
import { SummaryAmountHeader } from '@/components/ui/SummaryAmountCard';
import { primarySolidButtonProps } from '@/lib/design/surface-styles';

export type DailyIncomeForm = {
  usdCash: number;
  cashBs: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  biopagoBs: number;
  totalUsd: number;
  totalBs: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  onDateChange: (value: string) => void;
  form: DailyIncomeForm;
  setUsdField: (key: 'usdCash' | 'totalUsd', value: number) => void;
  setBsField: (
    key: 'cashBs' | 'posBs' | 'pos2Bs' | 'mobileBs' | 'biopagoBs' | 'totalBs',
    value: number,
  ) => void;
  busy: 'prefill' | 'save' | null;
  isEditing: boolean;
  saveError: string | null;
  onPrefill: () => void;
  onSave: () => void;
};

const fieldIds = {
  usdCash: 'daily-income-usd',
  cashBs: 'daily-income-cash-bs',
  posBs: 'daily-income-pos',
  pos2Bs: 'daily-income-pos2',
  mobileBs: 'daily-income-mobile',
  biopagoBs: 'daily-income-biopago',
} as const;

export function DailyIncomeFormDialog({
  open,
  onOpenChange,
  date,
  onDateChange,
  form,
  setUsdField,
  setBsField,
  busy,
  isEditing,
  saveError,
  onPrefill,
  onSave,
}: Props) {
  const close = () => onOpenChange(false);

  const paymentFields = useMemo(
    () =>
      [
        {
          key: 'usdCash' as const,
          paymentId: 'usd',
          label: 'Divisas (USD)',
          htmlFor: fieldIds.usdCash,
          setValue: (v: number) => setUsdField('usdCash', v),
        },
        {
          key: 'cashBs' as const,
          paymentId: 'cashBs',
          label: 'Efectivo Bs',
          htmlFor: fieldIds.cashBs,
          setValue: (v: number) => setBsField('cashBs', v),
        },
        {
          key: 'posBs' as const,
          paymentId: 'pos',
          label: 'Punto de venta',
          htmlFor: fieldIds.posBs,
          setValue: (v: number) => setBsField('posBs', v),
        },
        {
          key: 'pos2Bs' as const,
          paymentId: 'pos2',
          label: 'Punto de venta 2',
          htmlFor: fieldIds.pos2Bs,
          setValue: (v: number) => setBsField('pos2Bs', v),
        },
        {
          key: 'mobileBs' as const,
          paymentId: 'mobile',
          label: 'Pago móvil',
          htmlFor: fieldIds.mobileBs,
          setValue: (v: number) => setBsField('mobileBs', v),
        },
        {
          key: 'biopagoBs' as const,
          paymentId: 'biopago',
          label: 'Biopago',
          htmlFor: fieldIds.biopagoBs,
          setValue: (v: number) => setBsField('biopagoBs', v),
        },
      ] as const,
    [setUsdField, setBsField],
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={e => {
        if (!e.open) close();
      }}
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner p={4}>
          <Dialog.Content maxW="2xl" w="full" borderRadius="lg" boxShadow="lg">
            <Dialog.Header flexShrink={0} borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}>
              <Stack gap={0.5} pr={8}>
                <Dialog.Title fontSize="lg" fontWeight="semibold">
                  Montos del día
                </Dialog.Title>
              </Stack>
              <Dialog.CloseTrigger asChild position="absolute" top={2} right={2}>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body px={4} py={4}>
              <Stack gap={4}>
                <FormField label="Fecha del ingreso">
                  <GenericDatePicker
                    name="daily-income-date"
                    value={date}
                    onChange={v => {
                      if (v) onDateChange(v);
                    }}
                    timeZone={VENEZUELA_TIME_ZONE}
                    locale="es"
                    aria-label={`Fecha del ingreso (${formatInvoiceFilterDate(date)})`}
                  />
                </FormField>

                {isEditing && (
                  <GenericText variant="caption" color="gray.600">
                    Ya hay un registro para esta fecha; al guardar se actualizará.
                  </GenericText>
                )}
                {saveError && (
                  <GenericText variant="caption" color="red.600">
                    {saveError}
                  </GenericText>
                )}

                <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2}>
                  {paymentFields.map(field => (
                    <PaymentAmountField
                      key={field.key}
                      paymentId={field.paymentId}
                      label={field.label}
                      id={field.htmlFor}
                      value={form[field.key]}
                      onChange={field.setValue}
                    />
                  ))}
                </Grid>

                <Box
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  overflow="hidden"
                  bg="white"
                >
                  <SummaryAmountHeader
                    label="Totales del registro"
                    amountUsd={form.totalUsd}
                    amountBs={form.totalBs}
                  />
                </Box>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer gap={2} px={4} py={3} borderTopWidth="1px" borderColor="gray.200">
              <Button
                flex={1}
                variant="outline"
                borderColor="gray.200"
                color="gray.700"
                loading={busy === 'prefill'}
                onClick={onPrefill}
              >
                Montos facturados
              </Button>
              <Button flex={1} loading={busy === 'save'} onClick={onSave} {...primarySolidButtonProps}>
                {isEditing ? 'Guardar cambios' : 'Registrar ingresos'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
