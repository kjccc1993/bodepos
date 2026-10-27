type NavIconProps = { size?: number; color?: string };

const stroke = (color: string) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function NavIconSell({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" {...s} />
      <path d="M3 6h18" {...s} />
      <path d="M16 10a4 4 0 0 1-8 0" {...s} />
    </svg>
  );
}

export function NavIconProducts({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" {...s} />
      <path d="m3.3 7 8.7 5 8.7-5" {...s} />
      <path d="M12 22V12" {...s} />
    </svg>
  );
}

export function NavIconCart({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="8" cy="21" r="1" {...s} />
      <circle cx="19" cy="21" r="1" {...s} />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" {...s} />
    </svg>
  );
}

export function NavIconAccounting({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2v20" {...s} />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...s} />
    </svg>
  );
}

export function NavIconInvoices({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" {...s} />
      <path d="M14 2v6h6" {...s} />
      <path d="M8 13h8" {...s} />
      <path d="M8 17h8" {...s} />
      <path d="M8 9h2" {...s} />
    </svg>
  );
}

export function NavIconDailyIncomes({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3v18h18" {...s} />
      <path d="M7 16v-4" {...s} />
      <path d="M11 16V8" {...s} />
      <path d="M15 16v-6" {...s} />
      <path d="M19 16V5" {...s} />
    </svg>
  );
}

export function NavIconCustomers({ size = 22, color = 'currentColor' }: NavIconProps) {
  const s = stroke(color);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...s} />
      <circle cx="9" cy="7" r="4" {...s} />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" {...s} />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" {...s} />
    </svg>
  );
}

export function NavIconMore({ size = 22, color = 'currentColor' }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="19" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="5" cy="12" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export type NavIconId =
  | 'sell'
  | 'products'
  | 'cart'
  | 'accounting'
  | 'invoices'
  | 'dailyIncomes'
  | 'customers'
  | 'more';

export function NavIcon({
  id,
  active,
  activeColor = '#111827',
}: {
  id: NavIconId;
  active: boolean;
  activeColor?: string;
}) {
  const color = active ? activeColor : '#6B7280';
  const props = { size: 22, color };
  switch (id) {
    case 'sell':
      return <NavIconSell {...props} />;
    case 'products':
      return <NavIconProducts {...props} />;
    case 'cart':
      return <NavIconCart {...props} />;
    case 'accounting':
      return <NavIconAccounting {...props} />;
    case 'invoices':
      return <NavIconInvoices {...props} />;
    case 'dailyIncomes':
      return <NavIconDailyIncomes {...props} />;
    case 'customers':
      return <NavIconCustomers {...props} />;
    default:
      return <NavIconMore {...props} />;
  }
}
