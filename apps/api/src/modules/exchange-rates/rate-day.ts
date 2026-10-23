const STORE_TZ = 'America/Caracas';

export function calendarDayKey(d: Date, timeZone = STORE_TZ): string {
  return d.toLocaleDateString('en-CA', { timeZone });
}

export function isManualRateActiveToday(manualRateSetAt: Date | null | undefined, now = new Date()): boolean {
  if (!manualRateSetAt) return false;
  return calendarDayKey(manualRateSetAt, STORE_TZ) === calendarDayKey(now, STORE_TZ);
}
