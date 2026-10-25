export const FORM_CONTROL_HEIGHT = {
  xs: '32px',
  sm: '36px',
  md: '40px',
  lg: '44px',
  xl: '48px',
} as const;

export const FORM_CONTROL_BORDER_RADIUS = 'md' as const;

export type FormControlSize = keyof typeof FORM_CONTROL_HEIGHT;

const FORM_CONTROL_SIZE_KEYS = new Set<string>(Object.keys(FORM_CONTROL_HEIGHT));

export function normalizeFormControlSize(size: unknown): FormControlSize {
  if (typeof size === 'string' && FORM_CONTROL_SIZE_KEYS.has(size)) {
    return size as FormControlSize;
  }
  return 'md';
}

export function resolveFormControlHeight(size: unknown): string {
  return FORM_CONTROL_HEIGHT[normalizeFormControlSize(size)];
}

/** Misma altura en todos los breakpoints (evita `touch` 44px en móvil salvo que lo pases explícito). */
export function formControlFieldHeight(size: unknown = 'md') {
  const h = resolveFormControlHeight(size);
  return { base: h, lg: h } as const;
}
