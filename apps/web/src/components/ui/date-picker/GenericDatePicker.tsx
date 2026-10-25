import { Button, DatePicker, mergeRefs, Portal } from '@chakra-ui/react';
import { getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date';
import type { ComponentProps, ReactNode, Ref } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DISABLED_FIELD,
  disabledFieldRootStyles,
  resolveDisabledFieldTriggerProps,
} from '@/components/ui/field-disabled-styles';
import { resolveFormControlHeight } from '@/components/ui/form-control-metrics';
import { todayInVenezuela, VENEZUELA_TIME_ZONE } from '@/lib/utils/calendar';

export type DateRangeFormValue = {
  start: string | null;
  end: string | null;
};

type SharedDatePickerProps = {
  minDate?: string | Date;
  maxDate?: string | Date;
  disabled?: boolean;
  showClearTrigger?: boolean;
  placeholder?: string;
  label?: ReactNode;
  name?: string;
  w?: ComponentProps<typeof Button>['w'];
  invalid?: boolean;
  locale?: string;
  timeZone?: string;
  inputRef?: Ref<HTMLButtonElement>;
  size?: ComponentProps<typeof DatePicker.Root>['size'];
  closeOnSelect?: boolean;
  defaultToday?: boolean;
  'aria-label'?: string;
};

export type GenericDatePickerProps =
  | (SharedDatePickerProps & {
      mode?: 'single';
      value?: string | null;
      onChange?: (value: string | null) => void;
      defaultValue?: string | null;
    })
  | (SharedDatePickerProps & {
      mode: 'range';
      value?: DateRangeFormValue;
      onChange?: (value: DateRangeFormValue) => void;
      rangeCommitWhenComplete?: boolean;
      defaultStartDate?: string | null;
      defaultEndDate?: string | null;
    });

function toIsoDateString(input: string | Date): string {
  if (typeof input === 'string') return input;
  return input.toISOString().slice(0, 10);
}

function toDateValueBoundary(input: string | Date | undefined): DateValue | undefined {
  if (input === undefined) return undefined;
  return parseDate(toIsoDateString(input));
}

function singleToPickerValue(value: string | null | undefined): DateValue[] | undefined {
  if (value === undefined) return undefined;
  if (!value) return [];
  return [parseDate(value)];
}

function rangeToPickerValue(value: DateRangeFormValue | undefined): DateValue[] | undefined {
  if (value === undefined) return undefined;
  const out: DateValue[] = [];
  if (value.start) out.push(parseDate(value.start));
  if (value.end) out.push(parseDate(value.end));
  return out;
}

function isCompleteRangeSelection(raw: DateValue[]): boolean {
  return raw.length >= 2 && raw[0] != null && raw[1] != null;
}

function isEmptySingleDateValue(value: string | null | undefined): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

export function GenericDatePicker(props: GenericDatePickerProps) {
  const mode = props.mode ?? 'single';
  const isRange = mode === 'range';

  const {
    minDate,
    maxDate,
    disabled,
    showClearTrigger = false,
    placeholder = isRange ? 'Seleccionar rango' : 'Seleccionar fecha',
    label,
    name,
    w,
    invalid,
    locale = 'es',
    timeZone: timeZoneProp,
    inputRef: inputRefProp,
    size = 'md',
    closeOnSelect,
    defaultToday = false,
    'aria-label': ariaLabel,
  } = props;

  const timeZone = timeZoneProp ?? (defaultToday ? VENEZUELA_TIME_ZONE : getLocalTimeZone());
  const startOfWeek = locale.startsWith('es') ? 1 : 0;
  const triggerHeight = resolveFormControlHeight(size);

  const min = toDateValueBoundary(minDate);
  const max = toDateValueBoundary(maxDate);

  const controlled = isRange
    ? (props as Extract<GenericDatePickerProps, { mode: 'range' }>).value !== undefined
    : 'value' in props && props.value !== undefined;

  const rangeProps = isRange ? (props as Extract<GenericDatePickerProps, { mode: 'range' }>) : null;
  const rangeValue = rangeProps?.value;
  const rangeCommitWhenComplete = Boolean(isRange && controlled && rangeProps?.rangeCommitWhenComplete);

  const [provisionalRange, setProvisionalRange] = useState<DateValue[] | null>(null);

  useEffect(() => {
    if (!rangeCommitWhenComplete) return;
    setProvisionalRange(null);
  }, [rangeValue?.start, rangeValue?.end, rangeCommitWhenComplete]);

  const closeOnSelectEffective = rangeCommitWhenComplete ? true : (closeOnSelect ?? (isRange ? false : undefined));

  const committedRangePicker = isRange
    ? rangeToPickerValue((props as Extract<GenericDatePickerProps, { mode: 'range' }>).value)
    : undefined;

  const pickerValue = isRange
    ? rangeCommitWhenComplete
      ? (provisionalRange ?? committedRangePicker)
      : committedRangePicker
    : singleToPickerValue((props as Extract<GenericDatePickerProps, { mode?: 'single' }>).value);

  const defaultPickerValue = useMemo(() => {
    if (isRange) {
      const p = props as Extract<GenericDatePickerProps, { mode: 'range' }>;
      const parts: DateValue[] = [];
      if (p.defaultStartDate) parts.push(parseDate(p.defaultStartDate));
      if (p.defaultEndDate) parts.push(parseDate(p.defaultEndDate));
      return parts.length > 0 ? parts : undefined;
    }

    const p = props as Extract<GenericDatePickerProps, { mode?: 'single' }>;
    const initial = p.defaultValue ?? (defaultToday ? todayInVenezuela() : null);
    if (!initial) return undefined;
    return [parseDate(initial)];
  }, [defaultToday, isRange, props]);

  const singleValue = !isRange ? (props as Extract<GenericDatePickerProps, { mode?: 'single' }>).value : undefined;
  const singleOnChange = !isRange
    ? (props as Extract<GenericDatePickerProps, { mode?: 'single' }>).onChange
    : undefined;

  useEffect(() => {
    if (!defaultToday || isRange || !singleOnChange) return;
    if (isEmptySingleDateValue(singleValue)) {
      singleOnChange(todayInVenezuela());
    }
  }, [defaultToday, isRange, singleOnChange, singleValue]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerRefMerged = mergeRefs(triggerRef, inputRefProp ?? null);

  const hasValue =
    (provisionalRange != null && provisionalRange.length > 0) ||
    (pickerValue != null && pickerValue.length > 0 && pickerValue.some(part => part != null));

  const rootProps = controlled ? { value: pickerValue ?? [] } : { defaultValue: defaultPickerValue };

  const handleOpenChange = (details: { open: boolean }) => {
    if (rangeCommitWhenComplete && !details.open) {
      setProvisionalRange(null);
    }
  };

  const onValueChange = (details: { value: DateValue[] }) => {
    const { value: raw } = details;

    if (isRange) {
      const rp = props as Extract<GenericDatePickerProps, { mode: 'range' }>;

      if (rangeCommitWhenComplete) {
        if (raw.length === 0) {
          setProvisionalRange(null);
          rp.onChange?.({ start: null, end: null });
          return;
        }

        if (isCompleteRangeSelection(raw)) {
          setProvisionalRange(null);
          rp.onChange?.({
            start: raw[0]!.toString(),
            end: raw[1]!.toString(),
          });
          return;
        }

        setProvisionalRange(raw);
        return;
      }

      rp.onChange?.({
        start: raw[0]?.toString() ?? null,
        end: raw[1]?.toString() ?? null,
      });
      return;
    }

    (props as Extract<GenericDatePickerProps, { mode?: 'single' }>).onChange?.(raw[0]?.toString() ?? null);
  };

  return (
    <DatePicker.Root
      size={size}
      selectionMode={isRange ? 'range' : 'single'}
      min={min}
      max={max}
      disabled={disabled}
      locale={locale}
      timeZone={timeZone}
      name={name}
      invalid={invalid}
      {...disabledFieldRootStyles}
      startOfWeek={startOfWeek}
      {...(closeOnSelectEffective !== undefined ? { closeOnSelect: closeOnSelectEffective } : {})}
      {...rootProps}
      onOpenChange={handleOpenChange}
      onValueChange={onValueChange}
      positioning={{ placement: 'bottom-start' }}
    >
      {label ? <DatePicker.Label>{label}</DatePicker.Label> : null}

      <DatePicker.Control w={w ?? 'full'} minW={0} display="flex" alignItems="stretch" overflow="hidden">
        <DatePicker.Trigger asChild flex="1" minW={0}>
          <Button
            ref={triggerRefMerged}
            variant="outline"
            size={size}
            w="full"
            flex="1"
            minW={0}
            overflow="hidden"
            position="relative"
            h={triggerHeight}
            minH={triggerHeight}
            maxH={triggerHeight}
            px={3.5}
            pr={showClearTrigger && hasValue && !disabled ? 9 : 3.5}
            justifyContent="flex-start"
            textAlign="start"
            fontWeight="normal"
            borderRadius="md"
            aria-label={ariaLabel}
            _focusVisible={{
              ring: 2,
              ringColor: 'green.200',
              borderColor: invalid ? 'red.500' : 'green.500',
            }}
            disabled={disabled}
            {...resolveDisabledFieldTriggerProps({ disabled, invalid })}
          >
            <DatePicker.ValueText
              placeholder={placeholder}
              flex="1"
              minW={0}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              color={disabled ? DISABLED_FIELD.placeholderColor : undefined}
            />
            {showClearTrigger && hasValue && !disabled ? (
              <DatePicker.ClearTrigger
                position="absolute"
                top="50%"
                right={2.5}
                zIndex={1}
                transform="translateY(-50%)"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                cursor="pointer"
                color="gray.500"
                _hover={{ color: 'gray.700' }}
                onPointerDown={event => event.stopPropagation()}
              />
            ) : null}
          </Button>
        </DatePicker.Trigger>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner zIndex={50}>
          <DatePicker.Content
            bg="white"
            color="gray.900"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            shadow="md"
          >
            <DatePicker.View view="day">
              <DatePicker.ViewControl display="flex" alignItems="center" gap={2} px={1}>
                <DatePicker.PrevTrigger />
                <DatePicker.MonthSelect flex={1} />
                <DatePicker.YearSelect flex={1} />
                <DatePicker.NextTrigger />
              </DatePicker.ViewControl>
              <DatePicker.DayTable />
            </DatePicker.View>

            <DatePicker.View view="month">
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>

            <DatePicker.View view="year">
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}
