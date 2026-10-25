import { createSystem, defaultConfig } from '@chakra-ui/react';

const robotoStack = "'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: robotoStack },
        heading: { value: robotoStack },
      },
      colors: {
        brand: {
          50: { value: '#f0fdf4' },
          500: { value: '#22c55e' },
          600: { value: '#16a34a' },
          700: { value: '#15803d' },
        },
      },
      sizes: {
        touch: { value: '44px' },
      },
    },
  },
});
