import { useState } from 'react';
import { GenericInput, type GenericInputProps } from '@/components/ui/input/GenericInput';
import { formatMoneyDraft, formatMoneyInput, parseMoneyAmount } from '@/lib/money';
import { sanitizeDecimalInput } from '@/lib/utils/numeric-input';

type Props = Omit<GenericInputProps, 'value' | 'onChange' | 'decimal'> & {
  value: number;
  onChange: (n: number) => void;
};

/** Monto editable: escribe libre mientras está enfocado; al salir redondea, formatea y confirma. */
export function MoneyAmountInput({ value, onChange, onBlur, onFocus, ...props }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;
  const displayed = editing ? draft : value ? formatMoneyInput(value) : '';

  return (
    <GenericInput
      decimal
      value={displayed}
      onFocus={e => {
        setDraft(value ? formatMoneyDraft(value) : '');
        onFocus?.(e);
      }}
      onChange={e => {
        setDraft(sanitizeDecimalInput(e.target.value));
      }}
      onBlur={e => {
        const parsed = parseMoneyAmount(draft ?? e.target.value);
        setDraft(null);
        onChange(parsed);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
