import { FORM_CONTROL_BORDER_RADIUS } from '@/components/ui/form-control-metrics';

/** RestroBit-style surfaces: soft borders, light shadows, rounded corners. */

export const pageBg = '#F7F8FA';

export const softCardProps = {
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'gray.200',
  borderRadius: 'xl',
  boxShadow: 'soft',
} as const;

export const softCardFlatProps = {
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'gray.200',
  borderRadius: 'xl',
  boxShadow: 'none',
} as const;

/** Panel principal en Vender (carrito / catálogo). En móvil: plano, sin esquinas redondeadas. */
export const sellWorkspacePanelProps = {
  display: 'flex',
  flexDirection: 'column',
  minH: 0,
  minW: 0,
  bg: 'white',
  borderWidth: { base: '0', md: '1px' },
  borderColor: 'gray.200',
  borderRadius: { base: '0', md: 'xl' },
  boxShadow: { base: 'none', md: 'soft' },
  overflow: 'hidden',
} as const;

/** Ítem activo: cápsula blanca con borde fino (RestroBit). */
export const navItemActiveProps = {
  bg: 'white',
  color: 'gray.900',
  fontWeight: 'bold',
  borderWidth: '1px',
  borderColor: 'gray.200',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
} as const;

export const navItemIdleProps = {
  bg: 'transparent',
  color: 'gray.500',
  fontWeight: 'normal',
  borderWidth: '1px',
  borderColor: 'transparent',
} as const;

export const sidebarChromeProps = {
  bg: 'surface.page',
  borderRightWidth: '1px',
  borderColor: 'gray.200',
} as const;

export const inputFocusProps = {
  borderColor: 'brand.500',
  outline: '2px solid',
  outlineColor: 'brand.100',
  outlineOffset: '0px',
} as const;

export const cartHighlightProps = {
  bg: 'green.50',
  borderColor: 'green.200',
} as const;

/** Botón sólido principal (verde). */
export const primarySolidButtonProps = {
  colorPalette: 'green',
  borderRadius: 'xl',
} as const;

/** Botón sólido secundario (naranja RestroBit). */
export const secondarySolidButtonProps = {
  colorPalette: 'brand',
  borderRadius: 'xl',
} as const;

/** Auxiliares de fila de pago (Todo / Resto): fondo claro, borde gris, texto gris. */
export const paymentHelperButtonProps = {
  variant: 'outline' as const,
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'gray.200',
  borderRadius: FORM_CONTROL_BORDER_RADIUS,
  boxShadow: 'none',
  color: 'gray.700',
  fontWeight: 'normal',
  _hover: {
    bg: 'gray.50',
    borderColor: 'gray.300',
  },
  _active: {
    bg: 'gray.100',
  },
} as const;

/** Icon-only outline (estilo “Draft List”, sin texto). */
export function outlineIconButtonProps(tone: 'primary' | 'secondary') {
  const isPrimary = tone === 'primary';
  return {
    variant: 'outline' as const,
    bg: 'white',
    borderWidth: '1px',
    borderColor: 'gray.200',
    borderRadius: 'md',
    boxShadow: 'none',
    color: isPrimary ? 'green.600' : 'brand.600',
    _hover: {
      bg: isPrimary ? 'green.50' : 'brand.50',
      borderColor: isPrimary ? 'green.300' : 'brand.300',
    },
    _active: {
      bg: isPrimary ? 'green.100' : 'brand.100',
    },
  };
}
