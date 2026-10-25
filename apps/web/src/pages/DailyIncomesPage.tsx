import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import { GenericDatePicker, GenericHeading, GenericInput, GenericText } from '@/components/ui';
import { apiFetch } from '@/lib/http/client';
import { useDailyIncomes } from '@/lib/api/hooks';

export function DailyIncomesPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data: rows = [], refetch } = useDailyIncomes();
  const [form, setForm] = useState({
    usdCash: 0,
    cashBs: 0,
    posBs: 0,
    pos2Bs: 0,
    mobileBs: 0,
    biopagoBs: 0,
    totalUsd: 0,
    totalBs: 0,
  });

  const prefill = async () => {
    const p = await apiFetch<typeof form & { date: string }>(`/daily-incomes/prefill?date=${date}`);
    setForm({
      usdCash: p.usdCash,
      cashBs: p.cashBs,
      posBs: p.posBs,
      pos2Bs: p.pos2Bs,
      mobileBs: p.mobileBs,
      biopagoBs: p.biopagoBs,
      totalUsd: p.totalUsd,
      totalBs: p.totalBs,
    });
  };

  const save = async () => {
    await apiFetch('/daily-incomes', {
      method: 'POST',
      body: JSON.stringify({ date, ...form }),
    });
    void refetch();
  };

  return (
    <Stack gap={3} flex="1" minH={0} h={0} overflowY="auto">
      <Flex align="center" gap={2}>
        <BackChevronLink to="/accounting" aria-label="Volver a contabilidad" />
        <GenericHeading>Ingresos diarios</GenericHeading>
      </Flex>
      <GenericDatePicker
        value={date}
        onChange={v => {
          if (v) setDate(v);
        }}
        locale="es"
        aria-label="Fecha del ingreso"
      />
      <Field label="Divisas" value={form.usdCash} onChange={v => setForm(f => ({ ...f, usdCash: v }))} />
      <Field label="Efectivo Bs" value={form.cashBs} onChange={v => setForm(f => ({ ...f, cashBs: v }))} />
      <Field label="Punto de venta" value={form.posBs} onChange={v => setForm(f => ({ ...f, posBs: v }))} />
      <Field label="Punto de venta 2" value={form.pos2Bs} onChange={v => setForm(f => ({ ...f, pos2Bs: v }))} />
      <Field label="Pago móvil" value={form.mobileBs} onChange={v => setForm(f => ({ ...f, mobileBs: v }))} />
      <Field label="Biopago" value={form.biopagoBs} onChange={v => setForm(f => ({ ...f, biopagoBs: v }))} />
      <Flex gap={2}>
        <Button variant="outline" onClick={prefill}>
          Montos facturados
        </Button>
        <Button colorPalette="green" onClick={save}>
          Registrar ingresos
        </Button>
      </Flex>
      <GenericHeading variant="section">Últimos 30</GenericHeading>
      {(rows as { id: string; date: string; totalUsd: number; totalBs: number }[]).map(r => (
        <Box key={r.id} bg="white" p={2} borderRadius="md" borderWidth="1px">
          <GenericText variant="body">{r.date}</GenericText>
          <GenericText variant="body">
            USD {r.totalUsd} — Bs {r.totalBs.toLocaleString('es-VE')}
          </GenericText>
        </Box>
      ))}
    </Stack>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Flex align="center" gap={2}>
      <GenericText variant="label" w="32">
        {label}
      </GenericText>
      <GenericInput
        decimal
        flex="1"
        value={value || ''}
        onChange={e => onChange(Number(e.target.value.replace(',', '.')) || 0)}
      />
    </Flex>
  );
}
