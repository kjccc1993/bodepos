import { useEffect, useState } from 'react';
import { GenericInput, type GenericInputProps } from '@/components/ui/input/GenericInput';
import { formatPercentInput, parseSignedDecimalAmount, roundUsd } from '@/lib/money';
import { isIncompleteDecimalDraft, sanitizeDecimalInput } from '@/lib/utils/numeric-input';

type Props = Omit<GenericInputProps, 'value' | 'onChange' | 'decimal'> & {
  value: number | null;
  onChange: (n: number) => void;
};

/** Porcentaje editable (p. ej. ganancia); admite signo negativo. */
export function ProfitPercentInput({ value, onChange, onBlur, onFocus, ...props }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [value]);

  const displayed =
    draft ??
    (value != null && Number.isFinite(value) ? formatPercentInput(value) : '');

  return (
    <GenericInput
      decimal
      inputMode="decimal"
      value={displayed}
      onFocus={e => {
        setDraft(value != null && Number.isFinite(value) ? formatPercentInput(value) : '');
        onFocus?.(e);
      }}
      onChange={e => {
        const raw = e.target.value;
        const sign = raw.trimStart().startsWith('-') ? '-' : '';
        const next = sign + sanitizeDecimalInput(raw.replace(/^-/, ''));
        setDraft(next);
        if (!isIncompleteDecimalDraft(next)) onChange(parseSignedDecimalAmount(next));
      }}
      onBlur={e => {
        const parsed = parseSignedDecimalAmount(draft ?? e.target.value);
        onChange(roundUsd(parsed));
        setDraft(null);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
