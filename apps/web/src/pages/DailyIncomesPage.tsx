import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DailyIncomeFormDialog,
  type DailyIncomeForm,
} from '@/components/daily-incomes/DailyIncomeFormDialog';
import { VirtualizedDailyIncomeList } from '@/components/daily-incomes/VirtualizedDailyIncomeList';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import {
  FormField,
  GenericConfirmDialog,
  GenericDatePicker,
  GenericHeading,
  GenericText,
  type DateRangeFormValue,
} from '@/components/ui';
import { apiFetch, ApiError } from '@/lib/http/client';
import { useInfiniteDailyIncomeList } from '@/lib/hooks/useInfiniteDailyIncomeList';
import { headerCreateButtonProps } from '@/lib/design/surface-styles';
import { formatInvoiceFilterDate } from '@/lib/invoices/format';
import { roundBs, roundUsd } from '@/lib/money';
import type { DailyIncome } from '@/lib/types';
import { calendarMonthRangeInVenezuela, todayInVenezuela, VENEZUELA_TIME_ZONE } from '@/lib/utils/calendar';

function emptyForm(): DailyIncomeForm {
  return {
    usdCash: 0,
    cashBs: 0,
    posBs: 0,
    pos2Bs: 0,
    mobileBs: 0,
    biopagoBs: 0,
    totalUsd: 0,
    totalBs: 0,
  };
}

function rowToForm(row: DailyIncome): DailyIncomeForm {
  return {
    usdCash: row.usdCash,
    cashBs: row.cashBs,
    posBs: row.posBs,
    pos2Bs: row.pos2Bs,
    mobileBs: row.mobileBs,
    biopagoBs: row.biopagoBs,
    totalUsd: row.totalUsd,
    totalBs: row.totalBs,
  };
}

export function DailyIncomesPage() {
  const defaultMonth = useMemo(() => calendarMonthRangeInVenezuela(), []);
  const [listPeriod, setListPeriod] = useState<DateRangeFormValue>(() => ({
    start: defaultMonth.start,
    end: defaultMonth.end,
  }));
  const listRange = useMemo(
    () => ({
      from: listPeriod.start ?? defaultMonth.start,
      to: listPeriod.end ?? defaultMonth.end,
    }),
    [defaultMonth, listPeriod.end, listPeriod.start],
  );

  const [date, setDate] = useState(() => todayInVenezuela());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const { incomes, sentinelRef, isLoading, isFetchingNextPage } = useInfiniteDailyIncomeList(listRange);
  const qc = useQueryClient();
  const [form, setForm] = useState<DailyIncomeForm>(emptyForm);
  const [busy, setBusy] = useState<'prefill' | 'save' | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyIncome | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const existingForDate = useMemo(() => incomes.find(r => r.date === date), [date, incomes]);
  const isEditing = Boolean(existingForDate);

  useEffect(() => {
    const existing = incomes.find(r => r.date === date);
    setForm(existing ? rowToForm(existing) : emptyForm());
  }, [date, incomes]);

  useEffect(() => {
    if (!dialogOpen) setSaveError(null);
  }, [dialogOpen]);

  const setUsdField = useCallback((key: 'usdCash' | 'totalUsd', value: number) => {
    setForm(f => ({ ...f, [key]: roundUsd(value) }));
  }, []);

  const setBsField = useCallback(
    (
      key: 'cashBs' | 'posBs' | 'pos2Bs' | 'mobileBs' | 'biopagoBs' | 'totalBs',
      value: number,
    ) => {
      setForm(f => ({ ...f, [key]: roundBs(value) }));
    },
    [],
  );

  const openRegisterDialog = () => {
    setDate(todayInVenezuela());
    setSaveError(null);
    setDialogOpen(true);
  };

  const openEditDialog = useCallback((row: DailyIncome) => {
    setDate(row.date);
    setForm(rowToForm(row));
    setSaveError(null);
    setDialogOpen(true);
  }, []);

  const prefill = async () => {
    setBusy('prefill');
    try {
      const p = await apiFetch<DailyIncome>(`/daily-incomes/prefill?date=${date}`);
      setForm(rowToForm(p));
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setSaveError(null);
    setBusy('save');
    try {
      const payload = JSON.stringify({ date, ...form });
      if (isEditing) {
        await apiFetch(`/daily-incomes/${date}`, { method: 'PUT', body: payload });
      } else {
        await apiFetch('/daily-incomes', { method: 'POST', body: payload });
      }
      void qc.invalidateQueries({ queryKey: ['daily-incomes-infinite'] });
      setDialogOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setSaveError('Ya hay un ingreso registrado para esta fecha.');
        return;
      }
      throw e;
    } finally {
      setBusy(null);
    }
  };

  const requestDelete = useCallback((row: DailyIncome) => {
    setDeleteTarget(row);
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await apiFetch(`/daily-incomes/${deleteTarget.date}`, { method: 'DELETE' });
      void qc.invalidateQueries({ queryKey: ['daily-incomes-infinite'] });
      if (date === deleteTarget.date) {
        setForm(emptyForm());
      }
      setDeleteTarget(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <Flex direction="column" flex="1" minH={0} h={0} w="full">
      <Box flexShrink={0} px={0} pb={2}>
        <Flex align="center" gap={2}>
          <BackChevronLink to="/accounting" aria-label="Volver a contabilidad" />
          <GenericHeading flex="1" minW={0}>
            Ingresos diarios
          </GenericHeading>
          <Button flexShrink={0} onClick={openRegisterDialog} {...headerCreateButtonProps}>
            Registrar ingresos
          </Button>
        </Flex>
      </Box>

      <Box flexShrink={0} pb={2} w="full">
        <GenericHeading variant="section" pb={2}>
          Ingresos registrados
        </GenericHeading>
        <FormField label="Período">
          <GenericDatePicker
            mode="range"
            value={listPeriod}
            onChange={setListPeriod}
            rangeCommitWhenComplete
            timeZone={VENEZUELA_TIME_ZONE}
            locale="es"
            placeholder="Seleccionar período"
            aria-label={`Período (${formatInvoiceFilterDate(listRange.from)} – ${formatInvoiceFilterDate(listRange.to)})`}
          />
        </FormField>
      </Box>

      <Box
        ref={setScrollRoot}
        data-product-scroll-root
        flex="1"
        minH={0}
        h={0}
        overflowY="auto"
        overscrollBehavior="contain"
        pb={4}
      >
        <Stack gap={0} w="full">
          {isLoading && (
            <GenericText variant="muted" textAlign="center" py={6}>
              Cargando ingresos…
            </GenericText>
          )}
          {!isLoading && incomes.length === 0 && (
            <GenericText variant="muted" textAlign="center" py={6}>
              No hay ingresos en este rango de fechas.
            </GenericText>
          )}
          {!isLoading && incomes.length > 0 && (
            <VirtualizedDailyIncomeList
              rows={incomes}
              scrollRoot={scrollRoot}
              onEdit={openEditDialog}
              onDelete={requestDelete}
            />
          )}
          <Box ref={sentinelRef} h="1" w="full" aria-hidden />
          {isFetchingNextPage && (
            <GenericText variant="caption" textAlign="center" py={3}>
              Cargando más…
            </GenericText>
          )}
        </Stack>
      </Box>

      <DailyIncomeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={date}
        onDateChange={setDate}
        form={form}
        setUsdField={setUsdField}
        setBsField={setBsField}
        busy={busy}
        isEditing={isEditing}
        saveError={saveError}
        onPrefill={prefill}
        onSave={save}
      />

      <GenericConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null);
        }}
        title="Eliminar ingreso diario"
        message={
          deleteTarget
            ? `¿Eliminar el registro del ${formatInvoiceFilterDate(deleteTarget.date)}? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        loading={deleteBusy}
      />
    </Flex>
  );
}
