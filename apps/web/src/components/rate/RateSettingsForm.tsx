import { Button, Stack } from '@chakra-ui/react';
import { useEffect, useId, useState } from 'react';
import { FormField, GenericInput, GenericText } from '@/components/ui';
import { useStoreSettings, useUpdateStoreSettings } from '@/lib/api/hooks';
import { isManualRateActiveToday } from '@/lib/rate-day';
import { formatRateInput, parseRateInput } from '@/lib/rate';

type Props = {
  open: boolean;
  onClose?: () => void;
};

export function RateSettingsForm({ open, onClose }: Props) {
  const { data: settings } = useStoreSettings();
  const update = useUpdateStoreSettings();
  const [rateValue, setRateValue] = useState('');
  const [error, setError] = useState('');
  const rateId = useId();

  useEffect(() => {
    if (!open || !settings) return;
    setRateValue(formatRateInput(settings.effectiveRate));
    setError('');
  }, [open, settings]);

  const bcvLabel = settings?.bcvRateFetchedAt
    ? new Date(settings.bcvRateFetchedAt).toLocaleString('es-VE')
    : 'Sin datos aún';

  const manualToday = isManualRateActiveToday(settings?.manualRateSetAt);

  const save = () => {
    setError('');
    const customRate = parseRateInput(rateValue);
    if (customRate == null) {
      setError('Ingresa una tasa válida mayor a cero.');
      return;
    }

    update.mutate(
      { customRate },
      {
        onSuccess: () => onClose?.(),
        onError: e => {
          const msg = e instanceof Error ? e.message : 'No se pudo guardar la tasa.';
          if (msg.toLowerCase().includes('token')) {
            setError('Sesión expirada. Te llevaremos al login…');
            return;
          }
          setError(msg);
        },
      },
    );
  };

  return (
    <Stack gap={4}>
      <GenericText variant="muted" fontSize="sm">
        Tasa BCV del día:{' '}
        {settings?.bcvRate != null
          ? `${settings.bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs/$`
          : '—'}
        {' · '}
        Actualizada: {bcvLabel}
      </GenericText>

      {manualToday && (
        <GenericText variant="caption">
          Hoy usas una tasa manual. Mañana se aplicará de nuevo la del BCV salvo que la cambies otra vez.
        </GenericText>
      )}

      <FormField label="Tasa para operar hoy (Bs por 1 USD)" htmlFor={rateId}>
        <GenericInput
          id={rateId}
          decimal
          value={rateValue}
          onChange={e => {
            setRateValue(e.target.value);
            if (error) setError('');
          }}
          inputMode="decimal"
        />
      </FormField>

      {error && <GenericText variant="error">{error}</GenericText>}

      <Button colorPalette="green" onClick={save} loading={update.isPending}>
        Guardar tasa de hoy
      </Button>
    </Stack>
  );
}
