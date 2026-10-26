import { useEffect, useRef } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { GenericInput, GenericText, MoneyAmountInput } from '@/components/ui';
import { formControlFieldHeight } from '@/components/ui/form-control-metrics';
import { formatMoneyInput, roundUsd } from '@/lib/money';
import { paymentHelperButtonProps } from '@/lib/design/surface-styles';

export const payFieldSize = 'sm' as const;
export const payFieldHeight = formControlFieldHeight(payFieldSize);

export type PayFields = {
  usdCash: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  cashBs: number;
  biopagoBs: number;
};

export function emptyPayFields(): PayFields {
  return {
    usdCash: 0,
    posBs: 0,
    pos2Bs: 0,
    mobileBs: 0,
    cashBs: 0,
    biopagoBs: 0,
  };
}

export function TotalField({
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
  const latestRef = useRef(typeof value === 'number' ? value : 0);
  useEffect(() => {
    if (typeof value === 'number') latestRef.current = value;
  }, [value]);

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
          onChange={n => {
            latestRef.current = n;
            onValueChange?.(n);
          }}
          onBlur={() => {
            const clamped = clampCharge(latestRef.current);
            if (clamped !== latestRef.current) onValueChange?.(clamped);
          }}
        />
      )}
    </Flex>
  );
}

export function PayRow({
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
          h={payFieldHeight}
          minH={payFieldHeight}
          maxH={payFieldHeight}
          onClick={onAll}
          {...paymentHelperButtonProps}
        >
          Todo
        </Button>
      )}
      {onRest && (
        <Button
          minW="14"
          px={3}
          h={payFieldHeight}
          minH={payFieldHeight}
          maxH={payFieldHeight}
          onClick={onRest}
          {...paymentHelperButtonProps}
        >
          Resto
        </Button>
      )}
    </Flex>
  );
}
