import { useEffect, useState } from 'react';
import { GenericInput, type GenericInputProps } from '@/components/ui/input/GenericInput';
import { formatMoneyDraft, formatMoneyInput, parseMoneyAmount } from '@/lib/money';
import { isIncompleteDecimalDraft, sanitizeDecimalInput } from '@/lib/utils/numeric-input';

type Props = Omit<GenericInputProps, 'value' | 'onChange' | 'decimal'> & {
  value: number;
  onChange: (n: number) => void;
};

/** Monto editable: escribe libre; al salir del campo redondea y muestra 2 decimales. */
export function MoneyAmountInput({ value, onChange, onBlur, onFocus, ...props }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [value]);

  const displayed = draft ?? (value ? formatMoneyInput(value) : '');

  return (
    <GenericInput
      decimal
      value={displayed}
      onFocus={e => {
        setDraft(value ? formatMoneyDraft(value) : '');
        onFocus?.(e);
      }}
      onChange={e => {
        const next = sanitizeDecimalInput(e.target.value);
        setDraft(next);
        if (!isIncompleteDecimalDraft(next)) onChange(parseMoneyAmount(next));
      }}
      onBlur={e => {
        onChange(parseMoneyAmount(draft ?? e.target.value));
        setDraft(null);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
