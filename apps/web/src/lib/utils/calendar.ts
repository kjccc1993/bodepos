/** Zona horaria de negocio (Venezuela). */
export const VENEZUELA_TIME_ZONE = 'America/Caracas';

/** Fecha calendario `YYYY-MM-DD` en la zona indicada. */
export function formatCalendarDateInTimeZone(date: Date, timeZone: string = VENEZUELA_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Hoy en calendario Venezuela (`YYYY-MM-DD`). */
export function todayInVenezuela(date: Date = new Date()): string {
  return formatCalendarDateInTimeZone(date, VENEZUELA_TIME_ZONE);
}
