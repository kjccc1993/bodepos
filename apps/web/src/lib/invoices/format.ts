export function formatInvoiceFilterDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const d = new Date(`${dateStr}T12:00:00`);
  const short = d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
  if (dateStr === today) return `hoy, ${short}`;
  return short;
}

export function formatInvoiceCreatedAt(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-VE', { weekday: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const rest = d.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${cap}, ${rest}`;
}

/** Fecha compacta para tarjetas en móvil. */
export function formatInvoiceCreatedAtShort(iso: string): string {
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function invoiceStatusLabel(status: 'PAID' | 'PENDING'): string {
  return status === 'PAID' ? 'Pagada' : 'Pendiente';
}
