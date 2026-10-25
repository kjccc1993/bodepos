import type { NavIconId } from '@/components/nav/NavIcons';

export const accountingNavLinks: { to: string; label: string; icon: NavIconId }[] = [
  { to: '/accounting/invoices', label: 'Facturas de ventas', icon: 'invoices' },
  { to: '/accounting/daily-incomes', label: 'Ingresos diarios', icon: 'dailyIncomes' },
  { to: '/accounting/customers', label: 'Clientes', icon: 'customers' },
];

export function isAccountingPath(pathname: string) {
  return pathname === '/accounting' || pathname.startsWith('/accounting/');
}

export function isAccountingNavLinkActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}
