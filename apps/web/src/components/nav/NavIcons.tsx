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

export function NavIconMore({ size = 22, color = 'currentColor' }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="19" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="5" cy="12" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export type NavIconId = 'sell' | 'products' | 'cart' | 'accounting' | 'more';

export function NavIcon({ id, active }: { id: NavIconId; active: boolean }) {
  const color = active ? '#15803d' : '#64748b';
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
    default:
      return <NavIconMore {...props} />;
  }
}
