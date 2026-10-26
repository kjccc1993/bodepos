/** Fecha de alta del cliente (tabla escritorio/tablet). */
export function formatCustomerSince(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-VE', { weekday: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const date = d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
  return `${cap}, ${date}`;
}

/** Fecha compacta para tarjetas en móvil. */
export function formatCustomerSinceShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
