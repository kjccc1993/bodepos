import { createSystem, defaultConfig } from '@chakra-ui/react';
import { pageBg } from '@/lib/design/surface-styles';

const robotoStack = "'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Secundario — naranja RestroBit. Primario = paleta green de Chakra. */
const brand = {
  50: { value: '#FFF4ED' },
  100: { value: '#FFE4D4' },
  200: { value: '#FFD0B3' },
  300: { value: '#FFB380' },
  400: { value: '#FF944D' },
  500: { value: '#FF782D' },
  600: { value: '#E8681F' },
  700: { value: '#C45212' },
  800: { value: '#9A3F0E' },
  900: { value: '#7A320B' },
  950: { value: '#421806' },
};

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: robotoStack },
        heading: { value: robotoStack },
      },
      colors: {
        brand,
        surface: {
          page: { value: pageBg },
          muted: { value: '#F0F2F5' },
        },
      },
      shadows: {
        soft: { value: '0 2px 12px rgba(15, 23, 42, 0.06)' },
        card: { value: '0 1px 4px rgba(15, 23, 42, 0.07)' },
        lift: { value: '0 4px 16px rgba(15, 23, 42, 0.08)' },
      },
      radii: {
        control: { value: '10px' },
        card: { value: '12px' },
        pill: { value: '9999px' },
      },
      sizes: {
        touch: { value: '44px' },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'surface.page',
      color: 'gray.800',
    },
    '#root': {
      minHeight: '100%',
    },
  },
});
