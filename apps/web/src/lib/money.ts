export function formatUsd(n: number) {
  return `$${n.toFixed(2).replace('.', ',')}`;
}

export function formatBs(n: number) {
  return `Bs ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function usdToBs(usd: number, rate: number) {
  return Math.round(usd * rate * 100) / 100;
}
